# -*- coding: utf-8 -*-

class iRoomOperationLL7(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	def secondDeal(self, poker_list):
		if getattr(self, 'client', None):
			self.client.secondDeal(poker_list)

	def ll7PostOperation(self, idx, aid, pokers, next_idx):
		if getattr(self, 'client', None):
			self.client.ll7PostOperation(idx, aid, pokers, next_idx)

	def ll7WaitForOperation(self, idx, aid):
		if getattr(self, 'client', None):
			self.client.ll7WaitForOperation(idx, aid)