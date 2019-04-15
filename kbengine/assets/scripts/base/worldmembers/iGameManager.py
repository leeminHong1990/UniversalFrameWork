# -*- coding: utf-8 -*-
import KBEngine
import const
from KBEDebug import *

MAX_PLAYER_NUM = 30000

class iGameManager:
	"""
	服务端游戏对象的基础接口类
	"""
	def __init__(self):
		self.accounts = {}
		return

	def kickOffPlayer(self, avatarMailbox, uid):
		if uid not in self.avatars:
			avatarMailbox.client.operationFail(const.GM_OPERATION, 0)
			return
		self.avatars[uid].logout()
		avatarMailbox.client.operationSuccess(const.GM_OPERATION, 0)

	def accountLogout(self, accountname):
		if accountname in self.accounts:
			del self.accounts[accountname]

	def canLogin(self, accountMailbox, accountname):
		isDelay = 0
		if accountname in self.accounts:
			isDelay = 1
		self.accounts[accountname] = accountMailbox

		forbid = 0
		if len(self.avatars) >= MAX_PLAYER_NUM:
			forbid = 1

		accountMailbox.canLogin(forbid, isDelay)
