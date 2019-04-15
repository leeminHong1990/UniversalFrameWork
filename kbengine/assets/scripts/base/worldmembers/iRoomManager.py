# -*- coding: utf-8 -*-
import KBEngine
import const
from KBEDebug import *
from executor import Executor
import utility


class iRoomManager(object):
	"""
	服务端游戏对象的基础接口类
	"""
	def __init__(self):
		self.rooms = {}
		self.destroyState = None
		self.destroy_ts = None
		self.executor = Executor()

	def createRoom(self, gameType, roomParams):
		"""
		这应该是创建房间操作的唯一接口
		将房间base实体创建在本地baseapp上
		此处的字典参数中可以对实体进行提前def属性赋值
		:param gameType:
		:param roomParams:
		:return:
		"""
		init_data = {
			'gameType': gameType,
			'roomParams': roomParams,
		}
		name = const.GameType2GameName[gameType]
		room = KBEngine.createEntityLocally("Room_{}".format(name), init_data)
		self.rooms[room.roomID] = room
		return room

	def deleteRoom(self, roomID):
		if roomID in self.rooms:
			del self.rooms[roomID]

	def enterRoom(self, roomID, entityCall):
		if roomID in self.rooms:
			room = self.rooms[roomID]
			room.enterRoom(entityCall)
		else:
			entityCall.enterRoomFailed(const.ENTER_FAILED_ROOM_NO_EXIST)

	def leaveRoom(self, roomID, entityCall):
		if roomID in self.rooms:
			room = self.rooms[roomID]
			room.leaveRoom(entityCall)
		else:
			entityCall.leaveRoomFailed(const.ENTER_FAILED_ROOM_NO_EXIST)

	def quitRoom(self, roomID, entityCall):
		if roomID in self.rooms:
			room = self.rooms[roomID]
			room.reqLeaveRoom(entityCall)

			if room.isEmpty:
				self.deleteRoom(roomID)
				room.destroySelf()

	def getRoom(self, roomID):
		return self.rooms.get(roomID)

	def readyForDestroy(self):
		# 以前是为了退还没开始游戏的代开房的卡, 现在不需要了
		INFO_MSG('iRoomManager readyForDestroy()')
		self.destroyState = const.DESTROY_PROCESS_BEGIN
		self.destroy_ts = utility.get_cur_timestamp()
		for k, v in self.rooms.items():
			v.destroyByServer('')

		self.rooms.clear()
		self.destroyProcessFinish()

	def destroyProcessFinish(self):
		self.destroyState = const.DESTROY_PROCESS_END

	def clubDismissed(self, club_id):
		for key in list(self.rooms.keys()):
			room = self.rooms[key]
			if room.room_type == const.CLUB_ROOM and room.club and room.club.clubId == club_id:
				if room.state != const.ROOM_PLAYING:
					try:
						room.destroyByServer("亲友圈已解散")
					except:
						pass
				else:
					room.club_table = None
