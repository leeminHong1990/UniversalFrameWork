# -*- coding:utf-8 -*-


class iRoomOperationLSBMZMJ(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def postOperationLSBMZMJ(self, idx, aid, tile_list, buckle=0):
		if getattr(self, 'client', None):
			self.client.postOperationLSBMZMJ(idx, aid, tile_list, buckle)

	def setPassWinStateLSBMZMJ(self, callerEntityID, state):
		"""玩家出牌状态"""
		self.room and callable(self.room.setPassWinState) and self.room.setPassWinState(self, state)
