# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import const
import utility
import json
import switch
import x42
import copy
from roomParamsHelper import roomParamsChecker, roomParamsGetter

class iRoomOperation(object):
	""" 玩家游戏相关 """

	def __init__(self):
		self.room = None
		# 当前正在创建房间时再次请求创建需要拒绝
		self.req_entering_room = False

	def createRoom(self, game_type, create_json):
		create_dict = None
		try:
			create_dict = json.loads(create_json)
		except:
			return
		DEBUG_MSG("create room args = {}".format(create_dict))
		create_dict['room_type'] = const.NORMAL_ROOM
		if not roomParamsChecker(game_type, create_dict):
			return
		if self.req_entering_room:
			return
		if self.cell is not None:
			self.createRoomFailed(const.CREATE_FAILED_ALREADY_IN_ROOM)
			return

		self.req_entering_room = True

		def callback(content):
			if self.isDestroyed:
				return
			if content is None:
				DEBUG_MSG("createRoom callback error: content is None, user id {}".format(self.userId))
				self.createRoomFailed(const.CREATE_FAILED_NET_SERVER_ERROR)
				return
			try:
				DEBUG_MSG("cards response: {}".format(content))
				if content[0] != '{':
					self.createRoomFailed(const.CREATE_FAILED_NET_SERVER_ERROR)
					return
				data = json.loads(content)
				card_cost, diamond_cost = utility.calc_cost(game_type, create_dict)
				if card_cost > data["card"] and diamond_cost > data["diamond"]:
					self.createRoomFailed(const.CREATE_FAILED_NO_ENOUGH_CARDS)
					return

				params = {
					'owner_uid'		: self.userId,
					'club_id'		: 0,
				}
				params.update(roomParamsGetter(game_type, create_dict))
				room = x42.GW.createRoom(game_type, params)
				if room:
					self.createRoomSucceed(room)
				else:
					self.createRoomFailed(const.CREATE_FAILED_OTHER)
			except:
				import traceback
				ERROR_MSG("createRoom callback content = {} error:{}".format(content, traceback.format_exc()))
				self.createRoomFailed(const.CREATE_FAILED_OTHER)

		if switch.DEBUG_BASE or x42.GW.isDailyActFree:
			callback('{"card":99, "diamond":9999}')
		else:
			utility.get_user_info(self.accountName, callback)

	def createRoomSucceed(self, room):
		self.room = room
		room.enterRoom(self, True)

	def createRoomFailed(self, err):
		self.req_entering_room = False
		if self.hasClient:
			self.client.createRoomFailed(err)

	# c2s
	def enterRoom(self, roomID):
		if self.req_entering_room:
			DEBUG_MSG("iRoomOperation: enterRoom failed; entering or creating room")
			return
		if self.cell is not None:
			self.enterRoomFailed(const.ENTER_FAILED_ALREADY_IN_ROOM)
			return
		self.req_entering_room = True
		x42.GW.enterRoom(roomID, self)

	def enterRoomSucceed(self, room):
		self.room = room

	def enterRoomFailed(self, err):
		self.req_entering_room = False
		if self.hasClient:
			self.client.enterRoomFailed(err)

	def leaveRoomSucceed(self):
		self.req_entering_room = False
		self.room = None

	def saveGameResult(self, json_r):
		# 保存玩家房间牌局战绩, 只保留最近n条记录
		DEBUG_MSG("saveGameResult: {}".format(len(self.game_history)))
		self.game_history.append(json_r)
		self.game_history = self.game_history[-const.MAX_HISTORY_RESULT:]

		self.writeToDB()

	def getPageGameHistory(self, page, size, filter=None, order=None):
		game_history = copy.deepcopy(self.game_history)
		game_history.reverse()
		if size is not None:
			game_history = game_history[page * size : min(page * size + size, len(game_history))]
		if self.hasClient:
			self.client.pushPageGameRecordList(game_history, page, size, len(self.game_history))

	def get_simple_client_dict(self):
		return {
			'head_icon': self.head_icon,
			'nickname': self.name,
			'sex': self.sex,
			'userId': self.userId,
			'online': 1 if self.hasClient else 0
		}

	def inviteClubMemberRoom(self, member_list):
		if self.room is None or len(member_list) <= 0:
			return
		userInfo = {
			'head_icon': self.head_icon,
			'name': self.name,
			'sex': self.sex,
			'userId': self.userId,
		}
		self.room.inviteClubMemberRoom(self, userInfo, member_list)

	def chargeEffect(self):
		card_cost	= 1
		diamond_cost = 9999
		def pay_callback(content):
			INFO_MSG("player charge effect userId:{} account:{} content:{}".format(self.userId, self.accountName, content))
			if content is not None and content[0] == '{':
				if self.client:
					self.client.client_update_card_diamond()
		utility.update_card_diamond(self.accountName, -card_cost, -diamond_cost, pay_callback, "player {} pay effect".format(self.userId))
