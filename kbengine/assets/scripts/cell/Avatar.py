# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import importlib
from interfaces.EntityCommon import EntityCommon
from avatarmembers.iRoomOperation import iRoomOperation
from avatarmembers.iRoomOperationDDZ import iRoomOperationDDZ
from avatarmembers.iRoomOperationTDHMJ import iRoomOperationTDHMJ
from avatarmembers.iRoomOperationTYKDDMJ import iRoomOperationTYKDDMJ
from avatarmembers.iRoomOperationTYLSMJ import iRoomOperationTYLSMJ
from avatarmembers.iRoomOperationJZMJ import iRoomOperationJZMJ
from avatarmembers.iRoomOperationDTLGFMJ import iRoomOperationDTLGFMJ
from avatarmembers.iRoomOperationLLKDDMJ import iRoomOperationLLKDDMJ
from avatarmembers.iRoomOperationLL7 import iRoomOperationLL7
from avatarmembers.iRoomOperationLSBMZMJ import iRoomOperationLSBMZMJ
from avatarmembers.iRoomOperationLSBLMJ import iRoomOperationLSBLMJ
from avatarmembers.iRoomOperationFYQYMMJ import iRoomOperationFYQYMMJ
from classutils import MergePropertiesAndMethod
import const

class Avatar(KBEngine.Entity,
			 EntityCommon,
			 iRoomOperation,
			 iRoomOperationDDZ,
			 iRoomOperationTDHMJ,
			 iRoomOperationTYKDDMJ,
			 iRoomOperationTYLSMJ,
			 iRoomOperationJZMJ,
			 iRoomOperationDTLGFMJ,
			 iRoomOperationLLKDDMJ,
			 iRoomOperationLL7,
			 iRoomOperationLSBMZMJ,
			 iRoomOperationLSBLMJ,
			 iRoomOperationFYQYMMJ):

	def __init__(self):
		KBEngine.Entity.__init__(self)
		EntityCommon.__init__(self)
		iRoomOperation.__init__(self)
		iRoomOperationDDZ.__init__(self)
		iRoomOperationTDHMJ.__init__(self)
		iRoomOperationTYKDDMJ.__init__(self)
		iRoomOperationTYLSMJ.__init__(self)
		iRoomOperationJZMJ.__init__(self)
		iRoomOperationDTLGFMJ.__init__(self)
		iRoomOperationLLKDDMJ.__init__(self)
		iRoomOperationLL7.__init__(self)
		iRoomOperationLSBMZMJ.__init__(self)
		iRoomOperationLSBLMJ.__init__(self)
		iRoomOperationFYQYMMJ.__init__(self)
		# 设置cell默认属性, 由base传递过来
		self.init_from_dict(self.userInfo)

		# witness callback
		self.witness_request = []

		# Attention: 这个需要放在最后, onEnter会初始化适配器
		self.room = self.getCurrRoom()
		self.room.onEnter(self)

	def init_from_dict(self, b_dict):
		for k, v in b_dict.items():
			setattr(self, k, v)

	def initRoomAdapter(self, game_type, sit_idx):
		name = const.GameType2GameName[game_type]
		mod_name = "interfaces.Adapter_{}".format(name)
		mod = importlib.import_module(mod_name)
		adapter = mod.Adapter(sit_idx)
		MergePropertiesAndMethod(self, adapter)

	def isAvatar(self):
		return True

	@staticmethod
	def logs(msg, level='DEBUG'):
		if level == 'DEBUG':
			DEBUG_MSG(msg)
		elif level == 'ERROR':
			ERROR_MSG(msg)
		else:
			INFO_MSG(msg)

	def onGetWitness(self):
		for cb in self.witness_request:
			cb()
		self.witness_request = []

	def registerWitnessCallback(self, callback):
		self.witness_request.append(callback)

	@property
	def is_creator(self):
		# 新增一个房主标记位 代开房 和 玩家座位号会发生改变
		if self.room.room_type == const.NORMAL_ROOM:
			return self.idx == 0
		return False

	def showTip(self, tip):
		DEBUG_MSG("cell call showTip: {}".format(tip))
		if self.client:
			self.client.showTip(tip)

	def addGameCount(self, value=1):
		self.base.addGameCount(value)

	def updateOnlineStatus(self, status):
		DEBUG_MSG("Avatar[%i] userId[%d] updateOnlineStatus:[%d]" % (self.id, self.userId, status))
		if self.room:
			self.room.notify_player_online_status(self.userId, status)

	def clientReconnected(self):
		DEBUG_MSG("Avatar[%d]: client reconnected!" % (self.userId))
		self.updateOnlineStatus(1)
		if self.room:
			self.room.reqReconnect(self)

	def get_basic_user_info(self):
		return {
			'userID': self.userId,
			'nickname': self.nickname
		}

	def save_game_result(self, json_result):
		self.base.saveGameResult(json_result)

	def onDestroy(self):
		DEBUG_MSG("Avatar[{}]: destroy cell".format(self.userId))
		self.clear_timers()
		self.__dict__.clear()
		self.userInfo = {}
