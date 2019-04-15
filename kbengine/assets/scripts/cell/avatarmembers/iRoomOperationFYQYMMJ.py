# -*- coding: utf-8 -*-


class iRoomOperationFYQYMMJ(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def postOperationFYQYMMJ(self, idx, aid, tile_list, buckle = 0):
		if getattr(self, 'client', None):
			self.client.postOperationFYQYMMJ(idx, aid, tile_list, buckle)
