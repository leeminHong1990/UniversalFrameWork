# -*- coding: utf-8 -*-
import const
import roomParamsHelper
import utility
import x42
from Functor import Functor
from KBEDebug import *
from executor import Executor
from interfaces.GameObject import GameObject


class ClubStub(KBEngine.Entity, GameObject):

	def __init__(self):
		KBEngine.Entity.__init__(self)
		GameObject.__init__(self)
		self.isReady = False
		self.clubs = {}
		self.executor = Executor()
		self.loadClubs()
		x42.ClubStub = self

	def loadClubs(self):
		club_list = list(self.clubList)
		if len(club_list) == 0:
			self.initFinish()
			return

		self.executor.set('c', 0)
		self.executor.set('c_ok', 0)
		self.executor.add_condition(lambda: self.executor.get('c_ok') >= 1, [self.initFinish, []])
		self.executor.add_condition(lambda: self.executor.get('c') >= len(club_list), [self.executor.inc1, ['c_ok']])

		for id in club_list:
			def create_cb(baseRef, databaseID, wasActive):
				self.executor.inc1('c')
				if baseRef:
					self.clubs[baseRef.clubId] = baseRef
				else:
					if databaseID in self.clubList:
						self.clubList.remove(databaseID)
					INFO_MSG("ClubStub load club failed. Club_%d not exist!" % databaseID)

			KBEngine.createEntityFromDBID("Club", id, create_cb)

	def initFinish(self):
		self.isReady = True
		self.add_repeat_timer(1, 6 * 60 * 60, self.processClubTableResult)

	def clubOperation(self, avatar_mb, op, club_id, args):
		club = self.clubs.get(club_id)
		if club is None:
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_CLUB_NOT_EXIST)
			return

		club.doOperation(avatar_mb, op, args)

	def createClub(self, avatar_mb, club_game_type, club_name, club_params_dict):
		if not self.canCreateClub(avatar_mb.userId):
			avatar_mb.showTip("达到创建亲友圈数量上限, 无法创建更多亲友圈")
			return
		owner_info = {
			'userId': avatar_mb.userId,
			'uuid': avatar_mb.uuid,
			'sex': avatar_mb.sex,
			'name': avatar_mb.name,
			'head_icon': avatar_mb.head_icon,
			'accountName': avatar_mb.accountName,
			'isAgent': avatar_mb.isAgent,
			'login_time': avatar_mb.logout_time,
			'logout_time': avatar_mb.logout_time
		}
		self._doCreateClub(owner_info, club_game_type, club_name, club_params_dict, avatar_mb)

	def createClubFromServer(self, user_id, club_name):
		if not self.canCreateClub(user_id):
			DEBUG_MSG("ClubStub create from server, user {} can not create".format(user_id))
			return

		def find_cb(result):
			if not result:
				INFO_MSG("createClubFromServer:: user {} not found".format(user_id))
			else:
				INFO_MSG("ClubStub create from server,  uid: {}, club name: {}".format(user_id, club_name))
				club_game_type, params = roomParamsHelper.clubDefault_roomParams()
				self._doCreateClub(result, club_game_type, club_name, params)

		x42.GW.getUserInfoByUID(user_id, find_cb)

	def canCreateClub(self, user_id):
		for club in self.clubs.values():
			if club.isOwner(user_id):
				return False
		return True

	def _doCreateClub(self, user_info, club_game_type, club_name, club_params_dict, avatar_mb=None):
		club_name = utility.filter_emoji(club_name)
		club_name = club_name[:const.CLUB_NAME_LENGTH]
		self.clubCount += 1
		club_id = utility.gen_club_id(self.clubCount)
		user_id = user_info["userId"]
		owner_info = {
			'userId': user_info["userId"],
			'uuid': user_info["uuid"],
			'sex': user_info["sex"],
			'nickname': user_info["name"],
			'head_icon': user_info["head_icon"],
			'accountName': user_info["accountName"],
			'isAgent': user_info["isAgent"],
		}

		log_info = {
			'login_time': user_info['login_time'],
			'logout_time': user_info['logout_time']
		}

		# 开房时候需要, 这里就直接填上
		club_params_dict['club_id'] = club_id
		club_params_dict['owner_uid'] = user_id
		params = {
			'clubId': club_id,
			'name': club_name,
			'owner': owner_info,
			'gameType': club_game_type,
			'roomParams': club_params_dict,
		}
		INFO_MSG("ClubStub player{} createClub {}".format(user_id, params))
		club = KBEngine.createEntityLocally("Club", params)
		if club:
			club.writeToDB(Functor(self._onClubSaved, avatar_mb, owner_info, log_info))

	def _onClubSaved(self, avatar_mb, owner_info, log_info, success, club):
		uid = owner_info['userId']
		INFO_MSG("ClubStub player{} _onClubSaved state: {}, {}".format(uid, success, club.databaseID))

		if success:
			self.clubList.append(club.databaseID)
			self.clubs[club.clubId] = club
			mem_info = {
				'userId': uid,
				'uuid': owner_info['uuid'],
				'sex': owner_info['sex'],
				'nickname': owner_info['nickname'],
				'head_icon': owner_info['head_icon'],
				'login_time': log_info['login_time'],
				'logout_time': log_info['logout_time'],
				'notes': '',
				'ts': utility.get_cur_timestamp(),
				'power': const.CLUB_POWER_OWNER,
			}
			# 这么些是为了防止回调回来的时候avatar已经销毁
			if avatar_mb and not avatar_mb.isDestroyed:
				club.members[uid] = mem_info
				club.member_status[uid] = {'online': True, 'free': True, 'login_time': log_info['login_time'], 'logout_time': log_info['logout_time'],}
				avatar_mb.clubList.append(club.clubId)
				avatar_mb.createClubCallback(club.getDetailInfo(uid))
			else:
				club._addMemberIn(uid, mem_info)
			self.writeToDB()

	def deleteClub(self, avatar_mb, club_id):
		club = self.clubs.get(club_id)
		if club is None:
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_CLUB_NOT_EXIST)
			return

		if club.isOwner(avatar_mb.userId):
			self.clubs.pop(club_id)
			self.clubList.remove(club.databaseID)
			club.dismiss()
			avatar_mb.deleteClubSucceed(club_id)
		else:
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_PERMISSION_DENY)


	def deleteClubFromServer(self, club_id):
		club = self.clubs.get(club_id)
		if club is None:
			INFO_MSG("deleteClubFromServer:: club {} not found".format(club_id))
			return
		self.clubs.pop(club_id)
		self.clubList.remove(club.databaseID)
		club.dismiss()


	def lockClubFromServer(self, club_id, state):
		club = self.clubs.get(club_id)
		if club is None:
			INFO_MSG("lockClubFromServer:: club {} not found".format(club_id))
			return
		club.setClubLockSwitch(None, 1 if state else 0)

	def addTableForClub(self, club_id, num):
		club = self.clubs.get(club_id)
		if club:
			club.addClubTable(num)

	def getClub(self, club_id):
		return self.clubs.get(club_id)

	def getClubAbstract(self, club_id):
		club = self.clubs.get(club_id)
		if club is None:
			return None

		return club.getAbstract()

	def getClubDetailInfo(self, club_id, uid):
		club = self.clubs.get(club_id)
		if club is None:
			return None, const.CLUB_OP_ERR_CLUB_NOT_EXIST

		return club.getDetailInfo(uid), None

	def getClubTableInfoList(self, club_id):
		""" 为了分页下发数据 """
		club = self.clubs.get(club_id)
		if club is None:
			return None, const.CLUB_OP_ERR_CLUB_NOT_EXIST

		return club.table_mgr.getTableListInfo(True), None

	def isClubMember(self, club_id, user_id):
		""" 检查玩家是否是亲友圈的成员 """
		club = self.clubs.get(club_id)
		if club is None:
			return False
		return club.isMember(user_id)

	def processClubTableResult(self):
		for v in self.clubs.values():
			v.processTableResult()

	def getUserClubList(self, userId):
		clubs = []
		for club_id in self.clubs.keys():
			if self.isClubMember(club_id, userId):
				clubs.append(club_id)
		return clubs

	def getUserClubPower(self, user_id, club_id):
		club = self.clubs.get(club_id)
		if club is None or not self.isClubMember(club_id, user_id):
			return -1
		return club.members.get(user_id)['power']

	def onDestroy(self):
		self.clubs.clear()
		x42.ClubStub = None
		KBEngine.globalData['ClubStub'] = None
