# -*- coding: utf-8 -*-
import json
import random
import time

import const
import switch
from KBEDebug import *
from interfaces.GameObject import GameObject


class Account(KBEngine.Proxy, GameObject):
	def __init__(self):
		KBEngine.Proxy.__init__(self)
		GameObject.__init__(self)
		self.activeCharacter = None
		self.need_delay = False
		DEBUG_MSG("Account[%s] create name[%s]" % (self.id, self.__ACCOUNT_NAME__))

	def logout(self):
		""" 注销 """
		DEBUG_MSG("logout")
		self.client and self.client.closeClient()
		self.destroySelf()
		INFO_MSG("Account[{}] logout, logout_type 注销".format(self.id))

	def onClientEnabled(self):
		"""
		KBEngine method.
		该entity被正式激活为可使用， 此时entity已经建立了client对应实体， 可以在此创建它的
		cell部分。
		"""
		INFO_MSG("account[%i] entities enable. entityCall:%s" % (self.id, self.client))
		KBEngine.globalData["GameWorld"].canLogin(self, self.__ACCOUNT_NAME__)

	def canLogin(self, isForbid, isDelay):
		if isForbid == 0:
			if self.need_delay:
				self.add_timer(isDelay, self._autoLogin)
			else:
				self._autoLogin()
		else:
			self.client and self.client.operationFail(const.LOGIN_OPERATION, isForbid)
			self.onClientDeath()

	def onLogOnAttempt(self, ip, port, password):
		"""
		KBEngine method.
		客户端登陆失败时会回调到这里
		"""
		INFO_MSG("Account[{}]::onLogOnAttempt: ip={}, port={}, password={}, client={}".format(self.id, ip, port, password, self.client))

		# 如果一个在线的账号被一个客户端登陆并且onLogOnAttempt返回允许
		# 那么会踢掉之前的客户端连接
		# 那么此时self.activeCharacter可能不为None
		# 常规的流程是销毁这个角色等新客户端上来重新选择角色进入 但是我们是直接登录，所以不删除，如果不为空，直接使用

		# 根据在线的Avatar是否有客户端连接来判断是断线重连还是顶号, 顶号的话需要踢掉之前的连接, Login需要延迟1s
		if self.activeCharacter:
			has_client = self.activeCharacter.hasClient
			self.need_delay = has_client
			if has_client:
				self.activeCharacter.giveClientTo(self)
			self.activeCharacter.destroySelfFromAccount()
			if has_client:
				self.activeCharacter = None

		return KBEngine.LOG_ON_ACCEPT

	def destroyCharacter(self):
		if self.activeCharacter:
			if self.client:
				self.giveClientTo(self.activeCharacter)
			if self.activeCharacter.destroySelf():
				self.activeCharacter = None

	def destroyByServer(self):
		pass
		# self.destroyCharacter()

	def destroySelf(self):
		self.destroyCharacter()
		KBEngine.globalData["GameWorld"].accountLogout(self.__ACCOUNT_NAME__)
		self.destroy()

	def onClientDeath(self):
		"""
		KBEngine method.
		客户端对应实体已经销毁
		"""
		DEBUG_MSG("Account[%i].onClientDeath:" % self.id)
		KBEngine.globalData["GameWorld"].accountLogout(self.__ACCOUNT_NAME__)
		self.destroySelf()

	def _autoLogin(self):
		for character in self.characters:
			if character["characterType"] == 0:
				self.selectAvatarGame(character['dbid'])
				return
		if switch.DEBUG_BASE > 0:
			KBEngine.globalData["GameWorld"].genGlobalBirthData(self)
		else:
			self.reqCreateAvatar(json.loads(self.getClientDatas()[1].decode('utf-8')))

	def reqCreateAvatar(self, globalBirthDict):
		""" 根据前端类别给出出生点
		UNKNOWN_CLIENT_COMPONENT_TYPE	= 0,
		CLIENT_TYPE_MOBILE				= 1,	// 手机类
		CLIENT_TYPE_PC					= 2,	// pc， 一般都是exe客户端
		CLIENT_TYPE_BROWSER				= 3,	// web应用， html5，flash
		CLIENT_TYPE_BOTS				= 4,	// bots
		CLIENT_TYPE_MINI				= 5,	// 微型客户端
		"""
		props = {
			"name"			: self.__ACCOUNT_NAME__,
			"uuid"				: KBEngine.genUUID64(),
			"gender"			: random.randint (0, 1),
			"login_time"		: int(time.time()),
			"logout_time"		: 0,
			"accountName" 		: self.__ACCOUNT_NAME__,
		}

		for key in globalBirthDict:
			if key not in props:
				props[key] = globalBirthDict[key]

		DEBUG_MSG \
			('Account(%i) name[%s]::reqCreateAvatar: %d' % (self.id, self.__ACCOUNT_NAME__, props.get("userId", 0)))
		avatar = KBEngine.createEntityLocally("Avatar", props)
		if avatar:
			avatar.writeToDB(self._onCharacterSaved)

	def _onCharacterSaved(self, success, avatar):
		"""
		新建角色写入数据库回调
		"""
		DEBUG_MSG('Account::_onCharacterSaved:(%i) create avatar state: %i, %i' % (self.id, success, avatar.databaseID))

		# 如果此时账号已经销毁， 角色已经无法被记录则我们清除这个角色
		if self.isDestroyed:
			if avatar:
				avatar.destroy(True)
			return

		if success:
			characterInfo = {"dbid" : avatar.databaseID, "uuid" : avatar.uuid, "name" : avatar.name, "characterType" : 0}
			self.characters.append(characterInfo)
			self.writeToDB()
			dbid = avatar.databaseID
			avatar.destroy()
			self.selectAvatarGame(dbid)

	def selectAvatarGame(self, dbid):
		DEBUG_MSG("Account[%i].selectAvatarGame:%i. self.activeCharacter=%s self.client=%s" % (self.id, dbid, self.activeCharacter, self.client))
		# 注意:使用giveClientTo的entity必须是当前baseapp上的entity
		if self.activeCharacter is None:
			KBEngine.createEntityFromDBID("Avatar", dbid, self.__onAvatarCreated)
		else:
			self.activeCharacter.accountEntity = self
			self.giveClientTo(self.activeCharacter)

	def onDestroy(self):
		"""
		KBEngine method.
		entity销毁
		"""
		DEBUG_MSG("Account::onDestroy: %i. name = %s" % (self.id, self.__ACCOUNT_NAME__))

	def __onAvatarCreated(self, baseRef, dbid, wasActive):
		"""
		选择角色进入游戏时被调用
		"""
		# DEBUG_MSG("######### __onAvatarCreated 1")
		if baseRef is None:
			ERROR_MSG("Account::__onAvatarCreated:(%i): the character you wanted to created is not exist!" % (self.id))
			return

		avatar = KBEngine.entities.get(baseRef.id)
		if avatar is None:
			ERROR_MSG("Account::__onAvatarCreated:(%i): when character was created, it died as well!" % (self.id))
			return

		if wasActive:
			WARNING_MSG("Account::__onAvatarCreated:(%i): this character is in world now!" % (self.id))
			if avatar.hasClient:
				return

		if self.isDestroyed:
			ERROR_MSG("Account::__onAvatarCreated:(%i): i dead, will the destroy of PlayerAvatar!" % (self.id))
			avatar.destroy()
			return

		# DEBUG_MSG("######### __onAvatarCreated 2")
		avatar.accountEntity = self
		self.activeCharacter = avatar
		self.giveClientTo(avatar)