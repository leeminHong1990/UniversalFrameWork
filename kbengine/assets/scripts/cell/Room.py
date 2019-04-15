# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
from interfaces.EntityCommon import EntityCommon
import const

class Room(KBEngine.Entity, EntityCommon):
	"""
	这是一个游戏场景
	该类处理维护一个房间中的实际游戏, 例如: 斗地主、麻将等
	该房间中记录了房间里所有玩家的mailbox, 通过mailbox我们可以将信息推送到他们的客户端
	"""

	def __init__(self):
		KBEngine.Entity.__init__(self)
		EntityCommon.__init__(self)
		# 让baseapp和cellapp都能够方便的访问到这个房间的entityCall
		KBEngine.globalData["Room_%i" % self.spaceID] = self.base
		DEBUG_MSG("cell Room init roomIDC = {}".format(self.roomIDC))
		DEBUG_MSG("cell Room init gameTypeC = {}".format(self.gameTypeC))
		DEBUG_MSG("cell Room init roomParamsC = {}".format(self.roomParamsC))
		# 设置cell默认属性, 由base传递过来
		self.init_from_dict(self.roomParamsC)

		# 房间的一些通用属性
		# 状态0: 未开始游戏, 1: 某一局游戏中
		self.state = const.ROOM_WAITING
		# 存放该房间内的玩家mailbox
		self.avatars = {}
		self.players_list = [None] * self.player_num
		self.origin_players_list = [None] * self.player_num

		# 牌局记录
		self.game_result = {}
		# 增加房间销毁定时器
		self.timeout_timer = self.add_timer(const.ROOM_TTL, self.timeoutDestroy)
		# 解散房间秒数
		self.dismissRoomSecends = const.DISMISS_ROOM_WAIT_TIME
		# 解散房间同意人数
		self.dismissRoomAgreeNum = 4

	def init_from_dict(self, b_dict):
		for k, v in b_dict.items():
			setattr(self, k, v)


	@property
	def isFull(self):
		return len(self.avatars) >= self.player_num

	@property
	def isEmpty(self):
		return len(self.avatars) == 0

	@property
	def prefixLogStr(self):
		""" only on Log """
		return 'type:{},room:{},curround:{} '.format(self.gameTypeC, self.roomIDC, self.current_round)

	def getSit(self):
		for i, j in enumerate(self.players_list):
			if j is None:
				return i
		return None

	def sendEmotion(self, avt_mb, eid):
		""" 发表情 """
		# DEBUG_MSG("Room.Player[%s] sendEmotion: %s" % (self.roomIDC, eid))
		idx = None
		for i, p in enumerate(self.players_list):
			if avt_mb == p:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.recvEmotion(idx, eid)

	def sendMsg(self, avt_mb, mid, msg):
		""" 发消息 """
		# DEBUG_MSG("Room.Player[%s] sendMsg: %s" % (self.roomIDC, mid))
		idx = None
		for i, p in enumerate(self.players_list):
			if avt_mb == p:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.recvMsg(idx, mid, msg)

	def sendExpression(self, avt_mb, fromIdx, toIdx, eid):
		""" 发魔法表情 """
		# DEBUG_MSG("Room.Player[%s] sendEmotion: %s" % (self.roomIDC, eid))
		idx = None
		for i, p in enumerate(self.players_list):
			if avt_mb == p:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.recvExpression(fromIdx, toIdx, eid)

	def sendVoice(self, avt_mb, url):
		# DEBUG_MSG("Room.Player[%s] sendVoice" % (self.roomIDC))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			p and p.recvVoice(idx, url)

	def sendAppVoice(self, avt_mb, url, time):
		# DEBUG_MSG("Room.Player[%s] sendVoice" % (self.roomIDC))
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.recvAppVoice(idx, url, time)

	def sendEffect(self, avt_mb, eid):
		idx = None
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				idx = i
				break
		if idx is None:
			return

		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.recvEffect(idx, eid)

	def notify_player_online_status(self, userId, status):
		src = -1
		for idx, p in enumerate(self.players_list):
			if p and p.userId == userId:
				p.online = status
				src = idx
				break

		if src == -1:
			return

		for idx, p in enumerate(self.players_list):
			if p and p.userId != userId:
				p.notifyPlayerOnlineStatus(src, status)

	def broadcastOperation2(self, idx, aid, tile_list=None):
		""" 将操作广播除了自己之外的其他人 """
		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.postOperation(idx, aid, tile_list)

	def broadcastMultiOperation(self, idx_list, aid_list, tile_list=None):
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.postMultiOperation(idx_list, aid_list, tile_list)

	def broadcastOperation(self, idx, aid, tile_list=None):
		"""
		将操作广播给所有人, 包括当前操作的玩家
		:param idx: 当前操作玩家的座位号
		:param aid: 操作id
		:param tile_list: 出牌的list
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.postOperation(idx, aid, tile_list)

	def broadcastWinOperation(self, idx, aid, result):
		"""
		将操作广播给所有人, 包括当前操作的玩家
		:param idx: 胡牌玩家座位号
		:param aid: 操作id
		:param result: 胡牌结果
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.postWinOperation(idx, aid, result)


	def broadcastEnterRoom(self, idx):
		new_p = self.players_list[idx]
		for i, p in enumerate(self.players_list):
			if p is None:
				continue
			if i == idx:
				p.enterRoomSucceed(idx, self.get_init_client_dict())
			else:
				p.othersEnterRoom(new_p.get_init_client_dict())

	def destroySelf(self):
		not self.isDestroyed and self.destroy()

	def destroyByServer(self, reason=None):
		# 此接口由GameWorld关服时调用
		if self.current_round > 0:
			self.saveRoomResult()
			self.give_up_record_game()

		self.dismiss_timer = None
		if self.current_round > 0 and 'round_result' in self.game_result and len(self.game_result['round_result']) > 0:
			if reason:
				for p in self.players_list:
					if p:
						p.showTip(reason)
			self.subtotal_result()
		else:
			for p in self.players_list:
				if p:
					try:
						p.quitRoomSucceed()
						if reason:
							p.showTip(reason)
					except:
						pass

		self.destroySelf()

	def onSeatInfoChange(self):
		# 亲友圈座位信息变更
		if self.room_type == const.CLUB_ROOM:
			d = self.getSeatAbstractInfo()
			self.base.onSeatInfoChange(d)

	def getSeatAbstractInfo(self):
		seat = []
		for i in range(self.player_num):
			p = self.players_list[i]
			if p is None:
				seat.append(0)
			else:
				seat.append(p.id)
		return seat

	def onEnter(self, entityCall):
		DEBUG_MSG('Room::onEnter space[%d] room[%d] entityID = %i.' % (self.spaceID, self.roomIDC, entityCall.id))
		if self.isFull:
			entityCall.base.enterRoomFailed(const.ENTER_FAILED_ROOM_FULL)
			return

		self.avatars[entityCall.id] = entityCall
		idx = self.getSit()
		self.players_list[idx] = entityCall
		entityCall.initRoomAdapter(self.gameTypeC, idx)
		# 座位信息变化通知
		self.onSeatInfoChange()

		# 确认准备,不需要手动准备
		if self.hand_prepare == const.AUTO_PREPARE:
			self.prepare(entityCall)

		self.broadcastEnterRoom(idx)

		self.ready_after_prepare()

	def onLeave(self, entityCall):
		id = entityCall.id
		if id not in self.avatars:
			return
		DEBUG_MSG('Room::onLeave space[%d] room[%d] entityID = %i, userId = %d.' % (self.spaceID, self.roomIDC, id, entityCall.userId))
		idx = entityCall.idx
		if idx == 0 and self.room_type == const.NORMAL_ROOM:
			# 房主离开房间, 则解散房间
			self.give_up_record_game()
			self.dropRoom()
		else:
			# 从Room中删掉改entity
			self.players_list[idx] = None
			del self.avatars[id]
			# entity退出房间成功
			entityCall.quitRoomSucceed()
			if idx in self.confirm_next_idx:
				self.confirm_next_idx.remove(idx)
			# 通知其它玩家该玩家退出房间
			for i, p in enumerate(self.players_list):
				if i != idx and p:
					p.othersQuitRoom(idx)
			# 座位信息变化通知
			self.onSeatInfoChange()

			if self.isEmpty:
				self.give_up_record_game()
				self.dropRoom()

	def onDestroy(self):
		self.clear_timers()
		self.avatars.clear()
		self.players_list = []
		self.origin_players_list = []
		del KBEngine.globalData["Room_%i" % self.spaceID]
		self.destroySpace()
