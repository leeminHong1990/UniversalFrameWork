# -*- coding: utf-8 -*-


class iRoomOperationJZMJ(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def postOperationJZMJ(self, idx, aid, tile_list, buckle = 0, standTileList = [[],[],[],[]]):
		if getattr(self, 'client', None):
			self.client.postOperationJZMJ(idx, aid, tile_list, buckle, standTileList)
	def postWinCanSelectJZMJ(self, idx, canWinCanSelectList, canWinTilesList):
		if getattr(self, 'client', None):
			self.client.postWinCanSelectJZMJ(idx, canWinCanSelectList, canWinTilesList)
