# -*- coding: utf-8 -*-

class iRoomOperationDDZ(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def ddzPostOperation(self, idx, aid, tile_list, next_idx):
		if getattr(self, 'client', None):
			self.client.ddzPostOperation(idx, aid, tile_list, next_idx)

	def redeal(self, current_idx, tiles, host_cards):
		if getattr(self, 'client', None):
			self.client.redeal(current_idx, tiles, host_cards)
