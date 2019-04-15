# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import const
import x42
import json
from roomParamsHelper import clubDefault_roomParams
import Events
import utility
import switch
import math
import time

class iClubOperation(object):
	""" 亲友圈相关 """

	def __init__(self):
		self.club_creating = False

	def createClub(self):
		# 检查代理创建亲友圈的权限
		if not self.canCreateClub():
			self.clubOperationFailed(const.CLUB_OP_ERR_PERMISSION_DENY)
			return
		if self.club_creating:
			return

		self.club_creating = True
		def callback(content):
			if self.isDestroyed:
				return
			if self.check_info_cb(content):
				self.createPayCallback()
			else:
				self.club_creating = False
				self.clubOperationFailed(const.CLUB_OP_ERR_CARD_NOT_ENOUGH)

		if switch.DEBUG_BASE > 0:
			self.createPayCallback()
		else:
			utility.get_user_info(self.accountName, callback)

	def check_info_cb(self, content):
		DEBUG_MSG('create club response {}'.format(content))
		res = False
		try:
			data = json.loads(content)
			if data['card'] >= const.CREATE_CLUB_CARD_COST:
				res = True
		except:
			import traceback
			ERROR_MSG(traceback.format_exc())
		return res

	def createPayCallback(self):
		game_type, room_params = clubDefault_roomParams()
		club_name = str(self.userId)
		DEBUG_MSG("create {} club name = {} args = {}".format(game_type, club_name, room_params))
		room_params['owner_uid'] = self.userId
		x42.ClubStub.createClub(self, game_type, club_name, room_params)

	def canCreateClub(self):
		owner = 0
		for club_id in self.clubList:
			club = x42.ClubStub.getClub(club_id)
			if club.isOwner(self.userId):
				owner += 1
		return owner < const.CLUB_CREATE_LIMIT

	def canJoinClub(self):
		member = 0
		for club_id in self.clubList:
			club = x42.ClubStub.getClub(club_id)
			if not club.isOwner(self.userId):
				member += 1
		return member < const.CLUB_JOIN_LIMIT

	def createClubCallback(self, club_detail):
		self.createClubSucceed(club_detail)
		self.club_creating = False

	def updateClubList(self):
		""" 可能在玩家离线的时候被亲友圈踢出或者所在的亲友圈已解散 """
		real = []
		for club_id in self.clubList:
			if x42.ClubStub.isClubMember(club_id, self.userId):
				real.append(club_id)

		self.clubList = real

	def deleteClub(self, club_id):
		if club_id not in self.clubList:
			return
		x42.ClubStub.deleteClub(self, club_id)

	def clubOperation(self, op, club_id, args):
		args = json.loads(args)
		if not isinstance(args, list):
			self.clubOperationFailed(const.CLUB_OP_ERR_WRONG_ARGS)
			return

		DEBUG_MSG("iClubOperation clubOperation {}".format((op, club_id, args)))
		x42.ClubStub.clubOperation(self, op, club_id, args)

	def getClubListInfo(self):
		club_info_list = []
		for club_id in self.clubList:
			d, err = x42.ClubStub.getClubDetailInfo(club_id, self.userId)
			d and club_info_list.append(d)

		# INFO_MSG("### getClubListInfo {}".format(club_info_list))
		if self.hasClient:
			self.client.gotClubListInfo(club_info_list)
			for club_id in self.clubList:
				self.pushClubSeatInfo(club_id)

	def getClubDetailInfo(self, club_id):
		if club_id not in self.clubList:
			return
		if not self.hasClient:
			return

		d, err_code = x42.ClubStub.getClubDetailInfo(club_id, self.userId)
		if d is not None:
			self.client.gotClubDetailInfo(d)
			self.pushClubSeatInfo(club_id)
		else:
			err_code and self.clubOperationFailed(err_code)

	def pushClubSeatInfo(self, club_id):
		if club_id not in self.clubList:
			return
		if not self.hasClient:
			return
		d, err_code = x42.ClubStub.getClubTableInfoList(club_id)
		if d is not None:
			limit = const.CLUB_SEAT_INFO_LIMIT
			if len(d) <= limit:
				self.client.pushClubSeatInfo(club_id, d, 0, limit, int(time.time()))
			else:
				for i in range(math.ceil(len(d) / limit)):
					self.client.pushClubSeatInfo(club_id, d[i * limit: (i + 1) * limit], i, limit, int(time.time()))
		else:
			err_code and self.clubOperationFailed(err_code)

	def gotTableDetailInfo(self, t_idx, detail):
		if self.hasClient:
			self.client.gotTableDetailInfo(t_idx, detail)

	def gotClubTableList(self, club_id, club_seat_list):
		if self.hasClient:
			self.client.gotClubTableList(club_id, club_seat_list)

	def createClubSucceed(self, club_detail):
		if self.hasClient:
			self.client.createClubSucceed(club_detail)

	def deleteClubSucceed(self, club_id):
		if self.hasClient:
			self.client.deleteClubSucceed(club_id)

	def joinOneClub(self, club_id, msg=None):
		if not self.canJoinClub():
			return
		if club_id not in self.clubList:
			self.clubList.append(club_id)
			self.joinClubSucceed()
			if msg:
				self.client.showTip(msg)

	def leaveOneClub(self, club_id, msg=None):
		if club_id in self.clubList:
			self.clubList.remove(club_id)
			self.leaveClubSucceed()
			if msg:
				self.client.showTip(msg)

	def joinClubSucceed(self):
		club_info_list = []
		for club_id in self.clubList:
			d, err = x42.ClubStub.getClubDetailInfo(club_id, self.userId)
			d and club_info_list.append(d)

		if self.hasClient:
			self.client.joinClubSucceed(club_info_list)
			for club_id in self.clubList:
				self.pushClubSeatInfo(club_id)

	def leaveClubSucceed(self):
		club_info_list = []
		for club_id in self.clubList:
			d, err = x42.ClubStub.getClubDetailInfo(club_id, self.userId)
			d and club_info_list.append(d)

		if self.hasClient:
			self.client.leaveClubSucceed(club_info_list)
			for club_id in self.clubList:
				self.pushClubSeatInfo(club_id)

	def setClubNameSucceed(self, club_id, name):
		if self.hasClient:
			self.client.setClubNameSucceed(club_id, name)

	def setClubNoticeSucceed(self, club_id, name):
		if self.hasClient:
			self.client.setClubNoticeSucceed(club_id, name)

	def setMemberNotesSucceed(self, club_id, target_uid, name):
		if self.hasClient:
			self.client.setMemberNotesSucceed(club_id, target_uid, name)

	def gotClubApplicants(self, applicants):
		if self.hasClient:
			self.client.gotClubApplicants(applicants)

	def gotClubMembers(self, club_id, members):
		if self.hasClient:
			self.client.gotClubMembers(club_id, members)

	def gotPageClubMembers(self, club_id, members, current_page, page_size, total):
		if self.hasClient:
			self.client.gotPageClubMembers(club_id, members, current_page, page_size, total)

	def gotPageClubBlacks(self, club_id, blacks, current_page, page_size, total):
		if self.hasClient:
			self.client.gotPageClubBlacks(club_id, blacks, current_page, page_size, total)

	def gotClubAdmins(self, club_id, admins):
		if self.hasClient:
			self.client.gotClubAdmins(club_id, admins)

	def gotPageClubStatistics(self, club_id, statistics, current_page, page_size, total):
		if self.hasClient:
			self.client.gotPageClubStatistics(club_id, statistics, current_page, page_size, total)

	def gotClubRecords(self, club_id, records):
		if self.hasClient:
			self.client.gotClubRecords(club_id, records)

	def gotPageClubRecords(self, club_id, records, current_page, page_size, total, filters):
		if self.hasClient:
			self.client.gotPageClubRecords(club_id, records, current_page, page_size, total, json.dumps(filters))

	def clubOperationFailed(self, err_code):
		if self.hasClient:
			self.client.clubOperationFailed(err_code)

	def pushEventToClub(self, event_id, event_args):
		for club_id in self.clubList:
			club = x42.ClubStub.getClub(club_id)
			if club:
				club.event_mgr.push_event(event_id, event_args)

	def pushClubEventToClient(self, club_id, event_id, data):
		if not self.hasClient:
			return

		ID2FUNC = {
			Events.EVENT_PLAYER_O_STATUS_CHANGE			: 'clubEvent_POSC',	# 1
			Events.EVENT_PLAYER_G_STATUS_CHANGE			: 'clubEvent_PGSC',	# 2
			Events.EVENT_ROOM_PARAMS_CHANGE				: 'clubEvent_RPC',	# 3
			Events.EVENT_SEAT_INFO_CHANGE				: 'clubEvent_SIC',	# 4
			Events.EVENT_MEMBER_NUM_CHANGE				: 'clubEvent_MNC',	# 5
			Events.EVENT_CLUB_NAME_CHANGE				: 'clubEvent_CNMC',	# 6
			Events.EVENT_CLUB_NOTICE_CHANGE				: 'clubEvent_CNTC',	# 7
			Events.EVENT_DEFAULT_ROOM_PARAMS_CHANGE		: 'clubEvent_DRPC',	# 8
			Events.EVENT_CLUB_ROOM_SWITCH_CHANGE		: 'clubEvent_CRSC',	# 9
			# Events.EVENT_CLUB_CARD_SWITCH_CHANGE		: 'clubEvent_CCSC',	# 10
			Events.EVENT_CLUB_MEMBER_INFO_UPDATE		: 'clubEvent_CMIU',	# 11
			Events.EVENT_CLUB_PAY_MODE_SWITCH_CHANGE	: 'clubEvent_CPMSC',# 12
			Events.EVENT_ROOM_STATE_CHANGE				: 'clubEvent_RSC',	# 13
			Events.EVENT_ROOM_ROUND_CHANGE				: 'clubEvent_RRC',	# 14
			Events.EVENT_CLUB_APPLY_HINT				: 'clubEvent_CAH',	# 15
			Events.EVENT_CLUB_LOCK_SWITCH_CHANGE		: 'clubEvent_CLSC',	# 16
			Events.EVENT_CLUB_MEMBER_CHANGE				: 'clubEvent_CMC',	# 17
			Events.EVENT_CLUB_MEMBER_REMOVE				: 'clubEvent_CMR',	# 18
			Events.EVENT_CLUB_DISMISS_ROOM_PLAN_CHANGE	: 'clubEvent_CDRPC',# 19
			Events.EVENT_CLUB_ADMIN_CHANGE				: 'clubEvent_CAC',	# 20
			Events.EVENT_CLUB_ADMIN_FIRE				: 'clubEvent_CAR',# 21
			Events.EVENT_CLUB_BLACK_CHANGE				: 'clubEvent_CBC',# 22
			Events.EVENT_CLUB_BLACK_KICK				: 'clubEvent_CBK',# 23
		}
		if event_id in ID2FUNC:
			getattr(self.client, ID2FUNC[event_id])(club_id, data)
		else:
			ERROR_MSG("No corresponding Client function for event[{}]".format(event_id))
