# -*- coding: utf-8 -*-
import json

import const
import switch
import utility
import x42
from KBEDebug import *
from interfaces.GameObject import GameObject


class Room(KBEngine.Entity, GameObject):
	"""
	一个可操控cellapp上真正space的实体
	注意：它是一个实体，并不是真正的space，真正的space存在于cellapp的内存中，通过这个实体与之关联并操控space
	"""

	def __init__(self):
		KBEngine.Entity.__init__(self)
		GameObject.__init__(self)

		self.roomID = utility.gen_room_id()
		self.cellData["roomIDC"] = self.roomID
		self.cellData["gameTypeC"] = self.gameType
		self.cellData["roomParamsC"] = self.roomParams
		self.init_from_dict(self.roomParams)
		# 请求在cellapp上创建cell空间
		self.createCellEntityInNewSpace(None)
		self.request = []
		self.avatars = {}
		# 房间状态, 是否已经扣卡开始游戏
		self.state = const.ROOM_WAITING
		# 座位信息
		self.seatInfo = []
		# 亲友圈所属房间, 记录自己是哪一桌的
		self.club_table = None
		# 进行到的当前局数
		self.current_round = 0
		# 被解散原因
		self.destroyReason = None

	def init_from_dict(self, b_dict):
		for k, v in b_dict.items():
			setattr(self, k, v)

	@property
	def club(self):
		try:
			if self.club_table:
				return self.club_table.club
		except:
			# 引用代理的对象可能已经被destroy, 比如解散亲友圈时
			pass
		return None

	@property
	def isFull(self):
		return len(self.avatars) + len(self.request) >= self.player_num

	def enterRoom(self, entityCall, first=False):
		"""
		defined method.
		请求进入某个space中
		"""
		# 检查玩家数量
		if self.isFull:
			entityCall.enterRoomFailed(const.ENTER_FAILED_ROOM_FULL)
			return

		# 如果是亲友圈房间检查是否是亲友圈成员
		if self.room_type == const.CLUB_ROOM:
			if self.club and not self.club.isMember(entityCall.userId):
				# entityCall.enterRoomFailed(const.ENTER_FAILED_NOT_CLUB_MEMBER)
				entityCall.showTip("不是该亲友圈成员name:{},cid:{},uid:{},rid:{}".format(entityCall.name, self.club.clubId, entityCall.userId, self.roomID))
				return

			if self.club and self.club.isLocked():
				entityCall.enterRoomFailed(const.ENTER_FAILED_CLUB_LOCKED)
				return

			if self.club and self.club.isBlack(entityCall.userId):
				entityCall.enterRoomFailed(const.ENTER_FAILED_ROOM_BLACK)
				return

		def enter_callback():
			if self.isDestroyed:
				entityCall.enterRoomFailed(const.ENTER_FAILED_ROOM_DESTROYED)
				return
			# AA支付的情况下, 可能多个玩家同时走到这里
			if self.isFull:
				entityCall.enterRoomFailed(const.ENTER_FAILED_ROOM_FULL)
				return
			if self.cell:
				self.onEnter(entityCall)
			else:
				self.request.append(entityCall)

		# 如果是AA支付类型, 检查房卡余量是否足够
		if switch.DEBUG_BASE:
			enter_callback()
		else:
			if first or self.pay_mode != const.AA_PAY_MODE:
				enter_callback()
			else:
				def user_info_callback(content):
					if entityCall is None or entityCall.isDestroyed:
						INFO_MSG("Room AA_PAY_MODE cardCheck back avatar is destroyed")
						return
					if content is None:
						entityCall.enterRoomFailed(const.CREATE_FAILED_NET_SERVER_ERROR)
						return
					try:
						data = json.loads(content)
						card_cost, diamond_cost = utility.calc_cost(self.gameType, self.roomParams)
						if card_cost > data["card"]:
							entityCall.enterRoomFailed(const.ENTER_FAILED_ROOM_DIAMOND_NOT_ENOUGH)
							return
					except:
						import traceback
						ERROR_MSG(traceback.format_exc())
						entityCall.enterRoomFailed(const.CREATE_FAILED_OTHER)
						return
					enter_callback()

				utility.get_user_info(entityCall.accountName, user_info_callback)


	def leaveRoom(self, entityID):
		"""
		defined method.
		某个玩家请求退出这个space
		"""
		self.onLeave(entityID)

	def onEnter(self, entityCall):
		"""
		defined method.
		进入场景
		"""
		if self.destroyReason is not None:
			entityCall.enterRoomFailed(const.ENTER_FAILED_ROOM_DESTROYED)
			return

		self.avatars[entityCall.id] = entityCall
		entityCall.enterRoomSucceed(self)
		entityCall.createCell(self.cell)

	def onLeave(self, entityID):
		"""
		defined method.
		离开场景
		"""
		if entityID in self.avatars:
			self.avatars[entityID].leaveRoomSucceed()
			del self.avatars[entityID]

	def onLoseCell(self):
		"""
		KBEngine method.
		entity的cell部分实体丢失
		"""
		DEBUG_MSG("Room::onLoseCell: %i" % self.id)
		# 通知RoomManager删除房间
		KBEngine.globalData["GameWorld"].deleteRoom(self.roomID)
		# 所有avatar的room引用置为None
		for entityCall in self.avatars.values():
			entityCall.leaveRoomSucceed()

		# 如果是亲友圈房间, 通知桌子
		if self.club_table:
			self.club_table.roomDestroyed()

		# 清理工作
		self.avatars = {}
		self.clear_timers()
		self.destroy()

	def onGetCell(self):
		"""
		KBEngine method.
		entity的cell部分实体被创建成功
		"""
		DEBUG_MSG("Room::onGetCell: %i" % self.id)
		if self.request:
			for entityCall in self.request:
				self.onEnter(entityCall)
		self.request = []

	def charge(self, accountList):
		accountList = list(accountList)
		self.state = const.ROOM_TRANSITION
		if switch.DEBUG_BASE:
			self.chargeCallback(True)
			return
		card_cost, diamond_cost = utility.calc_cost(self.gameType, self.roomParams)
		if self.pay_mode == const.NORMAL_PAY_MODE:
			pay_account = accountList[0]
			reason = "{} RoomID:{} type:{}".format(const.GAME_NAME, self.roomID, self.className)
			def pay_callback(content):
				# ret = self._check_pay_callback(content)
				# self.chargeCallback(ret)
				INFO_MSG("player {} charge NORMAL_PAY_MODE pay_callback content:{}".format(pay_account, content))
				# 不论是否扣卡成功, 都让玩家继续游戏
				self.chargeCallback(True)

			utility.update_card_diamond(pay_account, -card_cost, -diamond_cost, pay_callback, reason)
		elif self.pay_mode == const.CLUB_PAY_MODE:
			pay_account = self.club.owner['accountName']
			reason = "{} Club:{} RoomID:{} type:{}".format(const.GAME_NAME, self.club.clubId, self.roomID, self.className)
			def pay_callback(content):
				# ret = self._check_pay_callback(content)
				# self.chargeCallback(ret)
				INFO_MSG("player {} charge CLUB_PAY_MODE pay_callback content:{}".format(pay_account, content))
				# 不论是否扣卡成功, 都让玩家继续游戏
				self.chargeCallback(True)

			utility.update_card_diamond(pay_account, -card_cost, -diamond_cost, pay_callback, reason)
		elif self.pay_mode == const.AA_PAY_MODE:
			if self.club:
				reason = "{} Club:{} AA RoomID:{} type:{}".format(const.GAME_NAME, self.club.clubId, self.roomID, self.className)
			else:
				reason = "{} AA RoomID:{} type:{}".format(const.GAME_NAME, self.roomID, self.className)

			def pay_callback(content):
				# ret = self._check_aa_pay_callback(content)
				# self.chargeCallback(ret)
				INFO_MSG("player {} charge AA_PAY_MODE pay_callback content:{}".format(str(accountList), content))
				# 不论是否扣卡成功, 都让玩家继续游戏
				self.chargeCallback(True)

			utility.update_card_diamond_aa(accountList, -card_cost, -diamond_cost, pay_callback, reason)
		else:
			ERROR_MSG("pay2StartGame Error: No this PayMode:{}".format(self.pay_mode))
			self.chargeCallback(False)

	def chargeCallback(self, result):
		if result:
			self.state = const.ROOM_PLAYING
			self.cell.paySuccessCbk()
		else:
			self.cell.dropRoom()

	def _check_pay_callback(self, content):
		if content is None or content[0] != '{':
			DEBUG_MSG('room:{} pay callback {}'.format(self.roomID, content))
			self.cell.give_up_record_game()
			self.cell.dropRoom()
			return False
		return True

	def _check_aa_pay_callback(self, content):
		res = True
		try:
			ret = json.loads(content)
			if ret['errcode'] != 0:
				res = False
				DEBUG_MSG('room:{} aa pay callback error code={}, msg={}'.format(self.roomID, ret['errcode'], ret['errmsg']))
		except:
			res = False
			import traceback
			ERROR_MSG(traceback.format_exc())

		if not res:
			self.cell.give_up_record_game()
			self.cell.dropRoom()
			return False
		return True

	def getSeatDetailInfo(self):
		for seat in self.seatInfo:
			for p in self.avatars.values():
				if p and p.userId == seat['userId']:
					seat['online'] = 1 if p.hasClient else 0
		return self.seatInfo

	def onSeatInfoChange(self, seat):
		seat_info = []
		for idx, uid in enumerate(seat):
			avt = self.avatars.get(uid)
			if avt:
				d = avt.get_simple_client_dict()
				d['idx'] = idx
				seat_info.append(d)
		self.seatInfo = seat_info
		if self.club_table:
			self.club_table.onRoomSeatInfoChange(seat_info)

	def onRoomRoundChange(self, current_round):
		self.current_round = current_round
		if self.club_table:
			self.club_table.onRoomRoundChange(current_round)

	def saveClubResult(self, result_d):
		if self.club:
			self.club.saveTableResult(result_d)
			cost = result_d.get('cost', 0)
			if cost > 0:
				cost = cost if self.pay_mode != const.AA_PAY_MODE else cost * len(self.avatars)
				self.club.updateClubStatistics(cost, [p.userId for p in self.avatars.values() if p is not None])

	def updateClubDAU(self, data):
		if self.club:
			self.club.update_dau(data)

	def startGame(self):
		if self.state == const.ROOM_WAITING:
			if self.club_table:
				self.club_table.onRoomStateChange(const.ROOM_PLAYING)
		self.state = const.ROOM_PLAYING

	def inviteClubMemberRoom(self, entityCall, inviterInfo, member_list):
		if self.club:
			x42.ClubStub.clubOperation(entityCall, const.CLUB_OP_INVITE_MEMBER_ROOM, self.club_id, [self.roomID, inviterInfo, self.gameType, json.dumps(self.roomParams), member_list])

	def destroyByServer(self, reason=''):
		self.destroyReason = reason
		self.cell.destroyByServer(reason)

	def onDestroy(self):
		self.avatars.clear()
