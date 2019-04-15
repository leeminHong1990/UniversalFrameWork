# -*- coding: utf-8 -*-
from KBEDebug import *
from classutils import checkEntityID

class iRoomOperationDTLGFMJ(object):
	""" 玩家游戏相关 """

	def __init__(self):
		pass

	@checkEntityID
	def hintDTLGFMJ(self, callerEntityID, hintKingNum):
		if self.room:
			self.room.hint(self, hintKingNum)

	def postHintOperationDTLGFMJ(self, idx, handTiles, hintTiles):
		if getattr(self, 'client', None):
			self.client.postHintOperationDTLGFMJ(idx, handTiles, hintTiles)

	def postAddHintDTLGFMJ(self, idx, tiles):
		if getattr(self, 'client', None):
			self.client.postAddHintDTLGFMJ(idx, tiles)
