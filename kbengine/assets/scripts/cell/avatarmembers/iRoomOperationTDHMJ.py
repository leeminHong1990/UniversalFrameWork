# -*- coding: utf-8 -*-


class iRoomOperationTDHMJ(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def postOperationTDHMJ(self, idx, aid, tile_list, buckle = 0):
		if getattr(self, 'client', None):
			self.client.postOperationTDHMJ(idx, aid, tile_list, buckle)
