# -*- coding: utf-8 -*-
import json

from KBEDebug import *
from classutils import checkEntityID
import switch


class iRoomOperation(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def enterRoomSucceed(self, idx, info):
		if self.client:
			self.client.enterRoomSucceed(idx, json.dumps(info), self.room.gameTypeC)
		else:
			def callback():
				self.client.enterRoomSucceed(idx, json.dumps(info), self.room.gameTypeC)

			self.registerWitnessCallback(callback)

	def othersEnterRoom(self, player_info):
		if self.client:
			self.client.othersEnterRoom(player_info)

	def othersQuitRoom(self, idx):
		if self.client:
			self.client.othersQuitRoom(idx)

	# c2s
	@checkEntityID
	def quitRoom(self, callerEntityID):
		self.room and self.room.reqLeaveRoom(self)

	def quitRoomSucceed(self):
		DEBUG_MSG('avatar[%d] quit room succeed!' % self.userId)
		self.room = None
		if self.client:
			self.client.quitRoomSucceed()

		# 不在场景中了, 直接销毁
		self.destroy()

	def quitRoomFailed(self, err):
		if self.client:
			self.client.quitRoomFailed(err)

	def startGame(self, start_info):
		if self.client:
			self.client.startGame(json.dumps(start_info))

	def postOperation(self, idx, aid, tile_list):
		if self.client:
			self.client.postOperation(idx, aid, tile_list)

	def postWinOperation(self, idx, aid, result):
		if self.client:
			self.client.postWinOperation(idx, aid, result)

	def postMultiOperation(self, idx_list, aid_list, tile_list):
		if self.client:
			self.client.postMultiOperation(idx_list, aid_list, tile_list)

	# c2s
	@checkEntityID
	def doOperation(self, callerEntityID, aid, tile_list):
		if self.room:
			self.room.doOperation(self, aid, tile_list)

	def doOperationFailed(self, err):
		if self.client:
			self.client.doOperationFailed(err)

	def waitForOperation(self, aid_list, tile_list):
		if self.client:
			self.client.waitForOperation(aid_list, tile_list)

	# c2s
	@checkEntityID
	def confirmOperation(self, callerEntityID, aid, tile_list):
		if self.room:
			self.room.confirmOperation(self, aid, tile_list)

	def roundResult(self, round_info):
		if self.client:
			self.client.roundResult(json.dumps(round_info))

	def finalResult(self, player_info_list, round_info):
		self.room = None
		if self.client:
			self.client.finalResult(json.dumps(player_info_list), json.dumps(round_info))

		# 不在场景中了, 直接销毁
		self.destroy()

	def subtotalResult(self, player_info_list):
		self.room = None
		if self.client:
			self.client.subtotalResult(json.dumps(player_info_list))

		# 不在场景中了, 直接销毁
		self.destroy()

	# c2s
	@checkEntityID
	def prepare(self, callerEntityID):
		if self.room:
			self.room.client_prepare(self)


	def readyForNextRound(self, idx):
		if self.client:
			self.client.readyForNextRound(idx)

	# c2s
	@checkEntityID
	def sendEmotion(self, callerEntityID, eid):
		if self.room:
			self.room.sendEmotion(self, eid)

	# c2s
	@checkEntityID
	def sendMsg(self, callerEntityID, mid, msg):
		if self.room:
			self.room.sendMsg(self, mid, msg)

	# c2s
	@checkEntityID
	def sendExpression(self, callerEntityID, fromIdx, toIdx, eid):
		if self.room:
			self.room.sendExpression(self, fromIdx, toIdx, eid)

	# c2s
	@checkEntityID
	def sendVoice(self, callerEntityID, url):
		if self.room:
			self.room.sendVoice(self, url)

	# c2s
	@checkEntityID
	def sendAppVoice(self, callerEntityID, url, time):
		if self.room:
			self.room.sendAppVoice(self, url, time)

	# c2s
	@checkEntityID
	def sendEffect(self, callerEntityID, eid):
		if self.room:
			self.room.sendEffect(self, eid)
			if switch.DEBUG_BASE or not switch.EFFECT_SWITCH:
				return
			self.base.chargeEffect()

	def recvEmotion(self, idx, eid):
		if self.client:
			self.client.recvEmotion(idx, eid)

	def recvMsg(self, idx, mid, msg):
		if self.client:
			self.client.recvMsg(idx, mid, msg)

	def recvExpression(self, fromIdx, toIdx, eid):
		if self.client:
			self.client.recvExpression(fromIdx, toIdx, eid)

	def recvVoice(self, idx, url):
		if self.client:
			self.client.recvVoice(idx, url)

	def recvAppVoice(self, idx, url, time):
		if self.client:
			self.client.recvAppVoice(idx, url, time)

	def recvEffect(self, idx, eid):
		if self.client:
			self.client.recvEffect(idx, eid)

	def handleReconnect(self, rec_room_info):
		def callback():
			self.client.handleReconnect(json.dumps(rec_room_info))

		if self.client:
			callback()
		else:
			self.registerWitnessCallback(callback)

	# c2s
	@checkEntityID
	def applyDismissRoom(self, callerEntityID, agree_num, seconds):
		""" 申请解散房间 """
		if self.room:
			self.room.apply_dismiss_room(self, agree_num, seconds)

	def req_dismiss_room(self, idx, agree_num, seconds):
		""" 广播有人申请解散房间 """
		if self.client:
			# DEBUG_MSG("call client reqDismissRoom {0}".format(idx))
			self.client.reqDismissRoom(idx, agree_num, seconds)

	# c2s
	@checkEntityID
	def voteDismissRoom(self, callerEntityID, vote):
		""" 解散房间投票操作 """
		if self.room:
			self.room.vote_dismiss_room(self, vote)

	def vote_dismiss_result(self, idx, vote, agree_num):
		""" 广播投票结果 """
		if self.client:
			# DEBUG_MSG("call client voteDismissResult {0}->{1}".format(idx, vote))
			self.client.voteDismissResult(idx, vote, agree_num)

	# s2c
	def notifyPlayerOnlineStatus(self, idx, status):
		""" 玩家上线, 下线通知 """
		DEBUG_MSG("call client notifyPlayerOnlineStatus {0}->{1}".format(idx, status))
		if self.client:
			self.client.notifyPlayerOnlineStatus(idx, status)

	# c2s
	@checkEntityID
	def setDiscardState(self, callerEntityID, state, tile):
		"""玩家出牌状态"""
		self.room and callable(self.room.setDiscardState) and self.room.setDiscardState(self, state, tile)

	def setPassWinState(self, callerEntityID, state):
		"""玩家过胡状态"""
		self.room and callable(self.room.setPassWinState) and self.room.setPassWinState(self, state)

	def setPassWinStateJZMJ(self, callerEntityID, state, tile):
		"""玩家过胡状态"""
		self.room and callable(self.room.setPassWinStateJZMJ) and self.room.setPassWinStateJZMJ(self, state, tile)

	def setPassWinStateLSBLMJ(self, callerEntityID, state, tile):
		"""玩家过胡状态"""
		self.room and callable(self.room.setPassWinStateLSBLMJ) and self.room.setPassWinStateLSBLMJ(self, state, tile)

	def postPlayerDiscardState(self, idx, state):
		"""广播玩家出牌状态"""
		self.client and self.client.postPlayerDiscardState(idx, state)

	def showWaitOperationTime(self):
		self.client and self.client.showWaitOperationTime()