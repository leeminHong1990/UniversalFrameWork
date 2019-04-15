# -*- coding: utf-8 -*-


class iRoomOperationLSBLMJ(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def postOperationLSBLMJ(self, idx, aid, tile_list, buckle = 0, standTileList = [[],[],[],[]]):
		if getattr(self, 'client', None):
			self.client.postOperationLSBLMJ(idx, aid, tile_list, buckle, standTileList)
	def postWinCanSelectLSBLMJ(self, idx, canWinCanSelectList, canWinTilesList):
		if getattr(self, 'client', None):
			self.client.postWinCanSelectLSBLMJ(idx, canWinCanSelectList, canWinTilesList)
