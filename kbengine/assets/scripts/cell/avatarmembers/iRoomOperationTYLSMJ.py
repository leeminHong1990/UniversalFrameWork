# -*- coding: utf-8 -*-


class iRoomOperationTYLSMJ(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def postOperationTYLSMJ(self, idx, aid, tile_list, buckle = 0, standTileList = [[],[],[],[]]):
		if getattr(self, 'client', None):
			self.client.postOperationTYLSMJ(idx, aid, tile_list, buckle, standTileList)
