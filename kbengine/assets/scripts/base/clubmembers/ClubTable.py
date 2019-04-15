# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import const
import utility
import weakref
import x42
import switch
import json
from roomParamsHelper import roomParamsChecker, roomParamsGetter
import Events


class Table(object):

	def __init__(self, idx, owner, club):
		self.idx = idx
		self.owner = weakref.proxy(owner)
		self.club = club
		# 玩法和开放选项与桌子绑定
		self.gameType = None
		self.roomParams = None
		self.room = None
		self.gameType, self.roomParams = club.findTableRoomParams(idx)
		if self.roomParams is None:
			# 每次重置为默认开房选项
			self.resetRoomParams(False)

	def getDetailInfo(self, seat=True):
		if self.roomAvailable():
			return {
				'game_type': self.gameType,
				'room_params': json.dumps(self.roomParams),
				'room_state': self.room.state,
				'seat_info': self.room.getSeatDetailInfo() if seat else [],
				'current_round': self.room.current_round
			}
		else:
			return {
				'game_type': self.gameType,
				'room_state': const.ROOM_WAITING,
				'room_params': json.dumps(self.roomParams),
				'seat_info': [],
				'current_round': 0
			}

	def setRoomParams(self, game_type, room_params):
		self.gameType = game_type
		self.roomParams = room_params

		event_args = {
			'idx': self.idx,
			'gameType': self.gameType,
			'roomParams': json.dumps(self.roomParams),
		}
		self.club.event_mgr.push_event(Events.EVENT_ROOM_PARAMS_CHANGE, event_args)

	def resetRoomParams(self, notify=True):
		self.gameType = self.club.gameType
		self.roomParams = dict(self.club.roomParams)

		if notify:
			event_args = {
				'idx': self.idx,
				'gameType': self.gameType,
				'roomParams': json.dumps(self.roomParams),
			}
			self.club.event_mgr.push_event(Events.EVENT_ROOM_PARAMS_CHANGE, event_args)

	def takeASeat(self, avatar):
		# 都调用avatar进入房间的接口, 统一入口
		req_entering_room = avatar.req_entering_room
		if req_entering_room or avatar.cell is not None:
			return
		if self.roomAvailable():
			avatar.enterRoom(self.room.roomID)
		else:
			def check_cb(result, msg=None):
				if avatar is None or avatar.isDestroyed:
					INFO_MSG("Table takeASeat cardCheck back avatar is destroyed")
					return
				if not result:
					msg and avatar.showTip(msg)
					return
				req_entering_room = avatar.req_entering_room
				if req_entering_room or avatar.cell is not None:
					return
				if self.roomAvailable():
					avatar.enterRoom(self.room.roomID)
					return
				params = dict(self.roomParams)
				params['isAgent'] = self.club.owner['isAgent']
				params['table_idx'] = self.idx
				self.room = x42.GW.createRoom(self.gameType, params)
				if self.room:
					self.room.club_table = weakref.proxy(self)
					avatar.enterRoom(self.room.roomID)
					msg and avatar.showTip(msg)
				else:
					ERROR_MSG("ClubTable takeASeat createRoom failed")

			self.cardCheck(avatar, check_cb)

	def dismissRoom(self):
		if self.roomAvailable():
			# if self.room.state == const.ROOM_WAITING:
			self.room.destroyByServer("房间已被亲友圈房主或管理员解散, 请重新加入游戏")

	def roomAvailable(self):
		if self.room is None:
			return False

		return self.room.isDestroyed is False

	def onRoomSeatInfoChange(self, seat_info):
		event_args = {
			'idx': self.idx,
			'seat': seat_info,
		}
		self.club.event_mgr.push_event(Events.EVENT_SEAT_INFO_CHANGE, event_args)

	def onRoomStateChange(self, state):
		event_args = {
			'idx': self.idx,
			'state': state,
		}
		self.club.event_mgr.push_event(Events.EVENT_ROOM_STATE_CHANGE, event_args)

	def onRoomRoundChange(self, current_round):
		event_args = {
			'idx': self.idx,
			'current_round': current_round,
			'game_round': self.roomParams['game_round'],
		}
		self.club.event_mgr.push_event(Events.EVENT_ROOM_ROUND_CHANGE, event_args)

	def roomDestroyed(self):
		self.room = None
		event_args = {
			'idx': self.idx,
			'seat': [],
		}
		self.club.event_mgr.push_event(Events.EVENT_SEAT_INFO_CHANGE, event_args)
		game_type, params = self.club.findTableRoomParams(self.idx)
		if params is None:
			self.resetRoomParams()
		else:
			self.gameType = game_type
			self.roomParams = dict(params)
			event_args = {
				'idx': self.idx,
				'gameType': self.gameType,
				'roomParams': json.dumps(self.roomParams),
			}
			self.club.event_mgr.push_event(Events.EVENT_ROOM_PARAMS_CHANGE, event_args)
		# self.resetRoomParams()

	def cardCheck(self, avatar, callback):
		# 调试环境直接返回成功
		if switch.DEBUG_BASE > 0:
			callable(callback) and callback(True)
			return
		game_type = self.gameType
		room_params = self.roomParams
		club_pay_mode = room_params['pay_mode']
		room_params['isAgent'] = self.club.owner['isAgent']

		if club_pay_mode == const.AA_PAY_MODE:
			account = avatar.accountName

			def user_cb(content):
				DEBUG_MSG("cardCheck user_cb content is {}".format(content))
				if avatar is None or avatar.isDestroyed:
					INFO_MSG("Table AA_PAY_MODE cardCheck back avatar is destroyed")
					return
				if content is None:
					DEBUG_MSG("cardCheck user_cb content is None")
					# 这里也让进
					callable(callback) and callback(True, None)
					return
				try:
					data = json.loads(content)
					# AA付费 自己房卡必须大于等于房间最低消耗数量, 否则不让玩家坐下游戏

					card_cost, diamond_cost = utility.calc_cost(game_type, room_params)
					if data["card"] >= card_cost:
						callable(callback) and callback(True, None)
					else:
						callable(callback) and callback(False, "您的房卡不足, 无法坐下游戏")
				except:
					import traceback
					ERROR_MSG(traceback.format_exc())
					callable(callback) and callback(False, "网络有点问题")

			utility.get_user_info(account, user_cb)
		elif club_pay_mode == const.CLUB_PAY_MODE:
			account = self.club.owner['accountName']

			def user_cb(content):
				DEBUG_MSG("cardCheck user_cb content is {}".format(content))
				if avatar is None or avatar.isDestroyed:
					INFO_MSG("Table CLUB_PAY_MODE cardCheck back avatar is destroyed")
					return
				if content is None:
					DEBUG_MSG("cardCheck user_cb content is None")
					# 这里也让进
					callable(callback) and callback(True, None)
					return
				try:
					data = json.loads(content)
					# 亲友圈老板的房卡必须大于最低房卡数量, 否则不让玩家坐下游戏
					if data["card"] >= switch.CLUB_CARD_MIN:
						msg = None
						if data['card'] < switch.CLUB_CARD_WARN:
							msg = "亲友圈房卡即将不足, 请及时提醒亲友圈老板"
						callable(callback) and callback(True, msg)
					else:
						callable(callback) and callback(False, "亲友圈老板房卡不足, 无法坐下游戏")
				except:
					import traceback
					ERROR_MSG(traceback.format_exc())
					callable(callback) and callback(False, "网络有点问题")

			utility.get_user_info(account, user_cb)
		else:
			callable(callback) and callback(False, "扣卡方式不正确")


class TableManager(object):

	def __init__(self, club):
		self.club = weakref.proxy(club)
		self.tables = {}
		self.initTable()

	def initTable(self):
		for i in range(self.club.tableNum):
			self.tables[i] = Table(i, self, self.club)

	def addNewTable(self):
		""" 动态加桌子的时候用到 """
		for i in range(self.club.tableNum):
			if i in self.tables:
				continue
			else:
				self.tables[i] = Table(i, self, self.club)

	def takeASeat(self, avatar_mb, t_idx):
		table = self.tables.get(t_idx)
		if table is None:
			avatar_mb.showTip("桌子编号错误")
			return
		table.takeASeat(avatar_mb)

	def dismissTableRoom(self, avatar_mb, t_idx):
		table = self.tables.get(t_idx)
		if table is None:
			avatar_mb.showTip("桌子编号错误")
			return
		table.dismissRoom()

	def changeTableRoomParams(self, avatar_mb, t_idx, game_type, create_dict):
		table = self.tables.get(t_idx)
		if table is None:
			avatar_mb.showTip("桌子编号错误")
			return

		if table.roomAvailable():
			avatar_mb.showTip("正在游戏中, 不能修改")
			return

		create_dict['room_type'] = const.CLUB_ROOM
		if not roomParamsChecker(game_type, create_dict):
			avatar_mb.showTip("房间参数错误")
			return

		room_params = roomParamsGetter(game_type, create_dict)
		room_params['owner_uid'] = self.club.owner['userId']
		room_params['club_id'] = self.club.clubId
		table.setRoomParams(game_type, room_params)
		# 改完直接进入房间
		# table.takeASeat(avatar_mb)
		if not self.club.isPower(avatar_mb.userId):
			table.takeASeat(avatar_mb)
		else:
			self.club.tableRoomParams[t_idx] = {
				'game_type': game_type,
				'params': dict(room_params)
			}



	def changeDefaultRoomParams(self, game_type, room_params):
		for t in self.tables.values():
			if not t.roomAvailable():
				t.setRoomParams(game_type, room_params)

	def getTableDetailInfo(self, t_idx):
		table = self.tables.get(t_idx)
		if table is None:
			return None
		return table.getDetailInfo()

	def getTable(self, t_idx):
		return self.tables.get(t_idx)

	def getTableListInfo(self, seat=True):
		d_list = []
		for i in range(self.club.tableNum):
			d_list.append(self.tables[i].getDetailInfo(seat))

		return d_list
