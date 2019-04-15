# -*- coding: utf-8 -*-
import datetime

import KBEngine
from KBEDebug import *
from Functor import Functor
from avatarmembers.iBase import iBase
from avatarmembers.iRoomOperation import iRoomOperation
from avatarmembers.iRecordOperation import iRecordOperation
from avatarmembers.iClubOperation import iClubOperation
from avatarmembers.iDAUOperation import iDAUOperation
from avatarmembers.iStatOperation import iStatOperation
from avatarmembers.iTaskOperation import iTaskOperation
from avatarmembers.iLotteryOperation import iLotteryOperation
import time
import utility
import switch
import x42
import const
import json
import Events
import dbi

class Avatar(KBEngine.Proxy,
			 iBase,
			 iRoomOperation,
			 iRecordOperation,
			 iClubOperation,
			 iStatOperation,
			 iTaskOperation,
			 iLotteryOperation,
			 iDAUOperation):
	"""
	角色实体
	"""
	def __init__(self):
		KBEngine.Proxy.__init__(self)
		iBase.__init__(self)
		iRoomOperation.__init__(self)
		iRecordOperation.__init__(self)
		iClubOperation.__init__(self)
		iDAUOperation.__init__(self)
		iStatOperation.__init__(self)
		iTaskOperation.__init__(self)
		iLotteryOperation.__init__(self)

		self.accountEntity = None
		self.ip = '0.0.0.0'
		self.location = ""
		self.lat = ""
		self.lng = ""

	def createCell(self, cell):
		# cell need
		userInfo = {
			"dbid":	self.databaseID,
			"uuid": self.uuid,
			"userId": self.userId,
			"accountName": self.accountName,
			"nickname": self.name,
			"head_icon": self.head_icon,
			"sex": self.sex,
			"ip": self.ip,
			"location": self.location,
			"lat": self.lat,
			"lng": self.lng,
		}
		self.cellData["userInfo"] = userInfo
		self.createCellEntity(cell)

	def getAvatarInfo(self):
		# timestamp = datetime.datetime.today().timestamp()
		info = {
			"uuid" : self.uuid,
			"uid": self.userId,
			"ip": self.ip,
			"lotteryDaily": self.lotteryDailyCount,
			# "todayRound": self.get_game_round(timestamp, timestamp)
		}
		return info

	def initAvatar(self):
		"""  初始化Avatar """
		self.extract_ip()
		iBase.initBase(self)
		iRecordOperation.initRecord(self)
		self.initFinish()

	def extract_ip(self):
		""" 抽取ip """
		import socket
		import struct
		self.ip = socket.inet_ntoa(struct.pack('@I', self.clientAddr[0]))

	def refreshOnResetDay(self, ttime, tlocaltime):
		""" 刷新每日任务 """
		self.lastResetDayTime = ttime
		self.reset_tasks()
		self.lotteryDailyCount = 1

	def logout(self):
		""" 注销 """
		self.client and self.client.closeClient()
		self.offlineProcedure()
		self.destroySelf()
		INFO_MSG("LogOutInfo, logout_type: 注销")

	def initFinish(self):


		if self.cell is not None:
			# 如果需要断线重连, 则进行处理
			self.client and self.client.beginGame(1)
			self.cell.clientReconnected()
		else:
			self.room = None
			self.client and self.client.beginGame(0)

		# self.client and self.client.pushGameRecordList(self.game_history)

		self.onlineProcedure()
		# 更新亲友圈列表
		self.updateClubList()
		INFO_MSG("Avatar[%i] userId[%d] initFinish, %f" % (self.id, self.userId, self.login_time))

	def updateUserInfo(self, info):
		if switch.DEBUG_BASE:
			self.isAgent = 1
			if self.userId != 0:
				return
			name = info['nickname']
			self.name = utility.filter_emoji(name) or str(self.userId)
			self.head_icon = info['head_icon']
			self.sex = info['sex']
		else:
			name = info['nickname']
			self.name = utility.filter_emoji(name) or str(self.userId)
			self.head_icon = info['head_icon']
			self.sex = info['sex']
			self.isAgent = info['isAgent']

		event_args = {
			'userId': self.userId,
			'isAgent': self.isAgent,
			'sex': self.sex,
			'nickname': self.name,
			'head_icon': self.head_icon,
		}
		self.pushEventToClub(Events.EVENT_CLUB_MEMBER_INFO_UPDATE, event_args)
		DEBUG_MSG("Avatar client call updateUserInfo:{}".format(info))

	# c2s
	def upLocationInfo(self, location, lat, lng):
		DEBUG_MSG("upLocationInfo, {0}, {1}, {2}".format(location, lat, lng))
		self.location = location
		self.lat = lat
		self.lng = lng

	def onEnterWorld(self):
		"""
		KBEngine method.
		这个entity已经进入世界了
		"""
		DEBUG_MSG("Avatar[%i] onEnterWorld. mailbox:%s" % (self.id, self.client))
		return

	def onLeaveWorld(self):
		"""
		KBEngine method.
		这个entity将要离开世界了
		"""
		DEBUG_MSG("Avatar[%i] onLeaveWorld. mailbox:%s" % (self.id, self.client))
		return

	def onClientEnabled(self):
		"""
		KBEngine method.
		该entity被正式激活为可使用， 此时entity已经建立了client对应实体， 可以在此创建它的
		cell部分。
		"""
		DEBUG_MSG("Avatar[%i] userId[%d] entities enable. mailbox:%s" % (self.id, self.userId, self.client))
		KBEngine.globalData["GameWorld"].loginToSpace(self)

		self.initAvatar()

	def onGetCell(self):
		"""
		KBEngine method.
		entity的cell部分实体被创建成功
		"""
		DEBUG_MSG('Avatar::onGetCell: %s' % self.cell)
		self.req_entering_room = False
		self.pushEventToClub(Events.EVENT_PLAYER_G_STATUS_CHANGE, {'uid': self.userId, 'free': False, 'login_time': self.login_time, 'logout_time': self.logout_time})

	def onLoseCell(self):
		"""
		KBEngine method.
		entity的cell部分实体丢失
		"""
		DEBUG_MSG("{}[{}]::onLoseCell. userId = {} room = {}".format(self.className, self.id, self.userId, self.room))

		# 由cell发起销毁, 那么说明游戏结束了
		if self.room:
			self.room.leaveRoom(self.id)
		self.room = None
		self.pushEventToClub(Events.EVENT_PLAYER_G_STATUS_CHANGE, {'uid': self.userId, 'free': True, 'login_time': self.login_time, 'logout_time': self.logout_time})

	def onRestore(self):
		"""
		KBEngine method.
		entity的cell部分实体被恢复成功
		"""
		DEBUG_MSG("%s::onRestore: %s" % (self.getScriptName(), self.cell))


	def destroySelf(self):
		""" 准备销毁自身, 但需要根据是否在房间来做断线重连 """
		DEBUG_MSG("Avatar[%i] userId[%i] destroySelf" % (self.id, self.userId))

		if self.cell is not None:
			# 如果已经在房间中并且房间游戏已经开始(或者代理开房还有在进行的), 则不销毁avatar, 等待其断线重连
			return False

		# 如果帐号ENTITY存在 则也通知销毁它
		if self.accountEntity is not None:
			self.accountEntity.activeCharacter = None
			self.accountEntity.onClientDeath()
			self.accountEntity = None

		DEBUG_MSG("Not in room and cell is None, We will destroy")
		# 销毁world中的avatar
		KBEngine.globalData["GameWorld"].logoutSpace(self.userId)

		DEBUG_MSG("Avatar[%i] userId[%d] destroyBase" % (self.id, self.userId))
		self.clear_timers()
		# 销毁base
		if not self.isDestroyed:
			self.destroy()
		return True

	def destroySelfFromAccount(self):
		""" 由Account实体调用过来, 与destroySelf有细微区别, 即不能再去销毁accountEntity """
		DEBUG_MSG("Avatar[%i] userId[%d] destroySelfFromAccount, %f" % (self.id, self.userId, self.login_time))

		if self.cell is not None:
			# 如果已经在房间中并且房间游戏已经开始, 则不销毁avatar, 等待其断线重连
			return False

		if self.accountEntity is not None:
			self.accountEntity.activeCharacter = None
			self.accountEntity = None

		DEBUG_MSG("Not in room and cell is None, We will destroy")
		# 销毁world中的avatar
		KBEngine.globalData["GameWorld"].logoutSpace(self.userId)

		DEBUG_MSG("Avatar[%i].destroyBase")
		self.clear_timers()
		# 销毁base
		self.destroy()
		return True

	def onClientDeath(self):
		"""
		KBEngine method.
		entity丢失了客户端实体
		"""
		DEBUG_MSG("Avatar[%i] userId[%d] onClientDeath:" % (self.id, self.userId))
		# 防止正在请求创建cell的同时客户端断开了， 我们延时一段时间来执行销毁cell直到销毁base
		# 这段时间内客户端短连接登录则会激活entity
		# 没有进入房间不会有cell, 所以直接销毁就好
		self.offlineProcedure()
		self.destroySelf()

	def onClientGetCell(self):
		"""
		KBEngine method.
		客户端已经获得了cell部分实体的相关数据
		"""
		DEBUG_MSG("Avatar[%i].onClientGetCell:%s" % (self.id, self.client))

	def onDestroy(self):
		"""
		KBEngine method
		entity销毁
		"""
		DEBUG_MSG("Avatar::onDestroy: {}, userId = {}.".format(self.id, self.userId))

	def showTip(self, tip):
		DEBUG_MSG("call showTip: {}".format(tip))
		if self.hasClient:
			self.client.showTip(tip)

	def recvWorldNotice(self, notice_text, num):
		""" 全服公告 """
		if notice_text and self.hasClient:
			self.client.recvWorldNotice(notice_text, int(num))
		else:
			DEBUG_MSG("recvWorldNotice: {}".format(notice_text))

	def addGameCount(self, value=1):
		self.gameCount += value
		# 成为有效玩家, 达成红包条件
		# if self.gameCount >= const.RED_ENVELOP_THRESHOLD and self.countFlag == 0:
		#
		# 	def callback(uid, content):
		# 		res = True
		# 		if content is None:
		# 			res = False
		# 		try:
		# 			ret = json.loads(content)
		# 			if ret['errcode'] != 0:
		# 				res = False
		# 				DEBUG_MSG('update_valid {} error code={}, msg={}'.format(uid, ret['errcode'], ret['errmsg']))
		# 		except:
		# 			res = False
		# 			import traceback
		# 			ERROR_MSG(traceback.format_exc())
		#
		# 		if res:
		# 			p = x42.GW.avatars.get(uid)
		# 			if p and not p.isDestroyed:
		# 				p.countFlag = 1
		#
		# 	utility.update_valid_account(self.accountName, Functor(callback, self.userId))

	def queryUserInfo(self, uid, club_id):
		if not utility.isValidUid(uid):
			self.showTip("非法的玩家id")
			return
		def query_cb(result):
			if result:
				uinfo = {
					'userId': result['userId'],
					'sex': result['sex'],
					'head_icon': result['head_icon'],
					'name': result['name'],
				}
				self.client.gotUserInfo(uinfo, x42.ClubStub.getUserClubPower(uid, club_id))
			else:
				self.showTip("查无此人")

		x42.GW.getUserInfoByUID(uid, query_cb)

	def onlineProcedure(self):
		""" 玩家上线来这里打个卡, 处理上线的一些流程:) """
		self.login_time = int(time.time())
		# 通知亲友圈
		self.pushEventToClub(Events.EVENT_PLAYER_O_STATUS_CHANGE, {'uid': self.userId, 'online': True, 'login_time': self.login_time, 'logout_time': self.logout_time})

	def offlineProcedure(self):
		""" 玩家下线来这里打个卡, 处理下线的一些流程:) """
		self.logout_time = int(time.time())
		# 通知房间
		if self.cell:
			self.cell.updateOnlineStatus(0)

		# 通知亲友圈
		self.pushEventToClub(Events.EVENT_PLAYER_O_STATUS_CHANGE, {'uid': self.userId, 'online': False, 'login_time': self.login_time, 'logout_time': self.logout_time})
