# -*- coding: utf-8 -*-
import copy
import json
import random
import time
from datetime import datetime

import const
import const_gxmj
import switch
import utility
from KBEDebug import *
from Room import Room


class Room_GXMJ(Room):
	""" 某种具体的游戏的房间 """

	def __init__(self):
		Room.__init__(self)

		self.tiles = []

		# 打出财神的index
		self.discard_king_idx = -1
		# 庄家index
		self.dealer_idx = 0
		# 当前控牌的玩家index
		self.current_idx = 0
		# 对当前打出的牌可以进行操作的玩家的index, 服务端会限时等待他的操作
		# 房间基础轮询timer
		self._poll_timer = None
		# 玩家操作限时timer
		self._op_timer = None
		# 玩家操作限时timer 启动时间
		self._op_timer_timestamp = 0
		# 一局游戏结束后, 玩家准备界面等待玩家确认timer
		self._next_game_timer = None

		# 财神(多个)
		self.kingTiles = []
		# 圈风
		self.prevailing_wind = const.WIND_EAST
		# 一圈中玩家坐庄次数
		self.dealerNumList = [0] * self.player_num

		self.current_round = 0
		self.all_discard_tiles = []
		# 最后一位出牌的玩家
		self.last_player_idx = -1
		# 房间开局所有操作的记录(aid, src, des, tile)
		self.op_record = []
		# 房间开局操作的记录对应的记录id
		self.record_id = 0
		# 确认继续的玩家
		self.confirm_next_idx = []
		# 解散房间操作的发起者
		self.dismiss_room_from = -1
		# 解散房间操作开始的时间戳
		self.dismiss_room_ts = 0
		# 解散房间操作投票状态
		self.dismiss_room_state_list = [0] * self.player_num
		self.dismiss_timer = None
		# 房间创建时间
		self.roomOpenTime = utility.get_cur_timestamp()

		self.wait_op_info_list = []

		# 放炮胡等延时操作时的标志位，例如主要在延时中出现解散房间操作时需要拒绝操作
		self.wait_force_delay_win = False

	def _reset(self):
		self.state = const.ROOM_WAITING
		DEBUG_MSG("reset state:{}".format(self.state))
		self.players_list = [None] * self.player_num
		self.dealer_idx = 0
		self.current_idx = 0
		self._poll_timer = None
		self._op_timer = None
		self._op_timer_timestamp = 0
		self._next_game_timer = None
		self.all_discard_tiles = []
		self.kingTiles = []
		self.current_round = 0
		self.confirm_next_idx = []
		self.prevailing_wind = const.WIND_EAST
		self.dismiss_timer = None
		self.dismiss_room_ts = 0
		self.dismiss_room_state_list = [0, 0, 0, 0]
		self.wait_op_info_list = []
		self.destroySelf()

	@property
	def nextIdx(self):
		return (self.current_idx + 1) % self.player_num

	@property
	def wreathsList(self):
		return [p.wreaths for i, p in enumerate(self.players_list)]

	@property
	def windsList(self):
		return [p.wind for i, p in enumerate(self.players_list)]


	def client_prepare(self, avt_mb):
		DEBUG_MSG("{} client_prepare userId:{}".format(self.prefixLogStr, avt_mb.userId))
		self.prepare(avt_mb)
		self.ready_after_prepare()

	def prepare(self, avt_mb):
		""" 第一局/一局结束后 玩家准备 """
		if self.state == const.ROOM_PLAYING or self.state == const.ROOM_TRANSITION:
			return

		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p.userId == avt_mb.userId:
				idx = i
				break

		if idx not in self.confirm_next_idx:
			self.confirm_next_idx.append(idx)
			for p in self.players_list:
				if p and p.idx != idx:
					p.readyForNextRound(idx)

	def ready_after_prepare(self):
		if len(self.confirm_next_idx) == self.player_num and self.isFull and self.state == const.ROOM_WAITING:
			self.origin_players_list = self.players_list[:]
			self.pay2StartGame()

	def reqReconnect(self, entityCall):
		DEBUG_MSG("{} entityCall reqReconnect userId:{}".format(self.prefixLogStr, entityCall.userId))
		if entityCall.id not in self.avatars.keys():
			return

		DEBUG_MSG("{} entityCall reqReconnect player:{} is in room".format(self.prefixLogStr, entityCall.userId))
		# 如果进来房间后牌局已经开始, 就要传所有信息
		# 如果还没开始, 跟加入房间没有区别
		if self.state == const.ROOM_PLAYING or 0 < self.current_round <= self.game_round:
			if self.state == const.ROOM_WAITING:
				# 重连回来直接准备
				self.client_prepare(entityCall)
			rec_room_info = self.get_reconnect_room_dict(entityCall.userId)
			entityCall.handleReconnect(rec_room_info)
		else:
			sit = 0
			for idx, p in enumerate(self.players_list):
				if p and p.userId == entityCall.userId:
					sit = idx
					break
			entityCall.enterRoomSucceed(sit, self.get_init_client_dict())

	def reqLeaveRoom(self, entityCall):
		"""
		defined.
		客户端调用该接口请求离开房间/桌子
		"""
		DEBUG_MSG("{} reqLeaveRoom userId:{}, room_type:{}, state:{}".format(self.prefixLogStr, entityCall.userId, self.room_type, self.state))
		if 0 < self.current_round <= self.game_round:
			entityCall.quitRoomFailed(const.QUIT_FAILED_ROOM_STARTED)
			return

		if self.state != const.ROOM_WAITING:
			DEBUG_MSG("{} reqLeaveRoom: not allow ".format(self.prefixLogStr))
			return

		self.onLeave(entityCall)


	def dropRoom(self):
		self.dismiss_timer = None
		if 'round_result' in self.game_result and len(self.game_result['round_result']) > 0:
			self.subtotal_result()
		else:
			for p in self.players_list:
				if p:
					try:
						p.quitRoomSucceed()
					except:
						pass

			self._reset()


	def doOperation(self, avt_mb, aid, tile_list):
		idx = -1
		for i, p in enumerate(self.players_list):
			if p == avt_mb:
				idx = i
		tile = tile_list[0]
		DEBUG_MSG("{} idx:{} doOperation current_idx:{} aid:{} tile_list:{}".format(self.prefixLogStr, idx, self.current_idx, aid, tile_list))
		"""
		当前控牌玩家摸牌后向服务端确认的操作
		"""
		if self.dismiss_room_ts != 0 and int(utility.get_cur_timestamp() - self.dismiss_room_ts) < self.dismissRoomSecends:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("{} idx:{} doOperationFailed dismiss_room_ts:{}".format(self.prefixLogStr, idx, self.dismiss_room_ts))
			# avt_mb.doOperationFailed(const.OP_ERROR_VOTE)
			# return
		if self.state != const.ROOM_PLAYING:
			DEBUG_MSG("{} idx:{} doOperationFailed state:{}".format(self.prefixLogStr, idx, self.state))
			avt_mb.doOperationFailed(const.OP_ERROR_STATE)
			return

		# DEBUG_MSG("doOperation idx:{0},self.current_idx:{1},self.wait_op_info_list:{2}".format(idx, self.current_idx, self.wait_op_info_list))
		if idx != self.current_idx:
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return
		if self.discard_seconds > 0:
			DEBUG_MSG("del wait discard timer == >: doOperation")
			if self._op_timer:
				self.cancel_timer(self._op_timer)
				self._op_timer = None
		p = self.players_list[idx]
		if aid == const.OP_DISCARD and self.can_discard(p.tiles, tile):
			self.all_discard_tiles.append(tile)
			p.discardTile(tile)
		elif aid == const.OP_CONCEALED_KONG and self.can_concealed_kong(p.tiles, tile):
			p.concealedKong(tile)
		elif aid == const.OP_KONG_WREATH and self.can_kong_wreath(p.tiles, tile):
			p.kongWreath(tile)
		elif aid == const.OP_CONTINUE_KONG and self.can_continue_kong(p, tile):
			p.continueKong(tile)
		elif aid == const.OP_PASS:
			# 自己摸牌的时候可以杠或者胡时选择过, 则什么都不做. 继续轮到该玩家打牌.
			pass
		elif aid == const.OP_DRAW_WIN:  # 普通自摸胡
			is_win, score, result = self.can_win(list(p.tiles), p.last_draw, const.OP_DRAW_WIN, idx)
			DEBUG_MSG("{} idx:{} do OP_DRAW_WIN==>{}, {}, {}".format(self.prefixLogStr, idx, is_win, score, result))
			if is_win:
				p.draw_win(tile, score, result)
			else:
				avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
				self.current_idx = self.nextIdx
				self.beginRound()
		elif aid == const.OP_WREATH_WIN:  # 自摸8张花胡
			is_win, score, result = self.can_win(list(p.tiles), p.last_draw, const.OP_WREATH_WIN, idx)
			DEBUG_MSG("{} idx:{} do OP_WREATH_WIN==>{}, {}, {}".format(self.prefixLogStr, idx, is_win, score, result))
			if is_win:
				p.draw_win(tile, score, result)
			else:
				avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
				self.current_idx = self.nextIdx
				self.beginRound()
		else:
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			self.current_idx = self.nextIdx
			self.beginRound()


	def apply_dismiss_room(self, avt_mb, agree_num, seconds):
		""" 游戏开始后玩家申请解散房间 """
		if self.dismiss_timer is not None:
			self.vote_dismiss_room(avt_mb, 1)
			return
		self.dismiss_room_ts = utility.get_cur_timestamp()
		src = None
		for i, p in enumerate(self.players_list):
			if p and p.userId == avt_mb.userId:
				src = p
				break

		# 申请解散房间的人默认同意
		self.dismiss_room_from = src.idx
		self.dismiss_room_state_list[src.idx] = 1

		def dismiss_callback():
			self.saveRoomResult()
			self.give_up_record_game()
			self.dropRoom()

		self.dismissRoomSecends = seconds
		self.dismissRoomAgreeNum = agree_num
		self.dismiss_timer = self.add_timer(self.dismissRoomSecends, dismiss_callback)

		for p in self.players_list:
			if p.userId != avt_mb.userId:
				p.req_dismiss_room(src.idx, agree_num, seconds)

	def vote_dismiss_room(self, avt_mb, vote):
		""" 某位玩家对申请解散房间的投票 """
		if self.wait_force_delay_win:
			return
		src = None
		for p in self.players_list:
			if p.userId == avt_mb.userId:
				src = p
				break

		self.dismiss_room_state_list[src.idx] = vote
		for p in self.players_list:
			if p:
				p.vote_dismiss_result(src.idx, vote, self.dismissRoomAgreeNum)

		yes = self.dismiss_room_state_list.count(1)
		no = self.dismiss_room_state_list.count(2)
		if yes >= self.dismissRoomAgreeNum:
			if self.dismiss_timer:
				self.cancel_timer(self.dismiss_timer)
				self.dismiss_timer = None
			self.dismiss_timer = None

			self.saveRoomResult()
			self.give_up_record_game()
			self.dropRoom()

		if no >= self.player_num - self.dismissRoomAgreeNum + 1:
			if self.dismiss_timer:
				self.cancel_timer(self.dismiss_timer)
				self.dismiss_timer = None
			self.dismiss_timer = None
			self.dismiss_room_from = -1
			self.dismiss_room_ts = 0
			self.dismiss_room_state_list = [0, 0, 0, 0]

	# 扣房卡/钻石成功后开始游戏(不改动部分)
	def paySuccessCbk(self):
		DEBUG_MSG("{} paySuccessCbk state:{}".format(self.prefixLogStr, self.state))
		try:
			# 第一局时房间默认房主庄家, 之后谁上盘赢了谁是, 如果臭庄, 上一把玩家继续坐庄
			if self.current_round == 0:
				self.origin_players_list = self.players_list[:]
				self.dealer_idx = 0

			self.op_record = []
			self.state = const.ROOM_PLAYING
			self.current_round += 1
			self.all_discard_tiles = []
			for p in self.players_list:
				p.reset()

			self.current_idx = self.dealer_idx

			self.base.onRoomRoundChange(self.current_round)

			def begin(prefabKingTiles=None, prefabHandTiles=None, prefabTopList=None):
				self.setPrevailingWind()  # 圈风
				self.setPlayerWind()  # 位风
				self.initTiles()  # 牌堆
				self.deal(prefabHandTiles, prefabTopList)  # 发牌
				self.kongWreath()  # 杠花
				self.addWreath()  # 补花
				self.rollKingTile()  # 财神
				beginTilesList = [copy.deepcopy(p.tiles) for i, p in enumerate(self.players_list)]
				self.tidy()  # 整理
				self.beginRound(True)  # 第一张牌优先抓，后开始游戏
				beginTilesList[self.current_idx].append(self.players_list[self.current_idx].last_draw)
				self.startGame(beginTilesList)

			if switch.DEBUG_BASE == 0:
				begin([], [[] for i in range(self.player_num)], [])
			elif switch.DEBUG_BASE == 1:  # 开发模式 除去不必要的通信时间 更接近 真实环境
				prefabKingTiles = []
				prefabHandTiles = [[1,1,1,2,2,2,3,3,3,4,4,4,5], [], [], []]
				prefabTopList = [5]
				begin(prefabKingTiles, prefabHandTiles, prefabTopList)
			else:
				def callback(data):
					DEBUG_MSG("{} data:{}".format(self.prefixLogStr, data))
					if data is None:
						begin()
						return
					kingTiles = []
					handTiles = [[] for i in range(self.player_num)]
					topList = []
					# 检查数据
					for t in data["kingTiles"]:
						if t not in kingTiles and utility.validTile(t):
							kingTiles.append(t)

					for k, v in enumerate(data["handTiles"]):
						if k < self.player_num:
							for t in v:
								if utility.validTile(t):
									handTiles[k].append(t)

					for t in data["topList"]:
						if utility.validTile(t):
							topList.append(t)
					begin(kingTiles, handTiles, topList)

				utility.getDebugPrefab(self.origin_players_list[0].accountName, callback, const_gxmj.DEBUG_JSON_NAME)
		except:
			err, msg, stack = sys.exc_info()
			DEBUG_MSG("{} paySuccessCbk error; exc_info: {} ,{}".format(self.prefixLogStr, err, msg))
			DEBUG_MSG("{} consume failed! users: {}".format(self.prefixLogStr,
															[p.userId for p in self.origin_players_list if p]))

	# 玩家开始游戏
	def startGame(self, beginTilesList):
		self.wait_force_delay_win = False
		DEBUG_MSG("start game,roomID:{0},{1}/{2}".format(self.roomIDC, self.current_round, self.game_round))
		diceList = self.throwTheDice([self.dealer_idx])
		idx, num = self.getMaxDiceIdx(diceList)
		DEBUG_MSG(
			"{} start game info:{},{},{},{},{},{}".format(self.prefixLogStr, self.dealer_idx, self.wreathsList,
														  self.kingTiles, self.prevailing_wind, self.windsList,
														  diceList))
		for i, p in enumerate(self.players_list):
			if p:
				DEBUG_MSG("{} start tiles:{}".format(self.prefixLogStr, p.tiles))
		for i, p in enumerate(self.players_list):
			if p:
				DEBUG_MSG("{} start begin tiles:{}".format(self.prefixLogStr, beginTilesList[i]))
				p.startGame({
					'dealer_idx': self.dealer_idx,
					'beginTilesList': beginTilesList[i],
					'wreathsList': self.wreathsList,
					'kingTiles': self.kingTiles,
					'prevailing_wind': self.prevailing_wind,
					'windsList': self.windsList,
					'diceList': diceList,
					'curRound': self.current_round
				})
		self.begin_record_game(diceList)

	def cutAfterKong(self):
		if not self.can_cut_after_kong():
			return
		if len(self.tiles) <= self.lucky_num:
			self.drawEnd()
		elif len(self.tiles) > self.lucky_num + 1:
			player = self.players_list[self.current_idx]
			ti = self.tiles[0]
			self.tiles = self.tiles[1:]
			player.cutTile(ti)

	def beginRound(self, is_first=False):
		if len(self.tiles) <= self.lucky_num:
			self.drawEnd()
			return
		ti = self.tiles[0]
		self.tiles = self.tiles[1:]
		DEBUG_MSG("beginRound tile:{0} leftNum:{1}".format(ti, len(self.tiles)))
		p = self.players_list[self.current_idx]
		p.drawTile(ti, is_first)

	def autoDiscardTile(self):
		self._op_timer = None
		if len(self.wait_op_info_list) > 0:
			DEBUG_MSG("del wait discard timer == >:auto pass")
			idx_list = []
			wait_tile_list = [0]
			for op_dict in self.wait_op_info_list:
				if op_dict["idx"] not in idx_list and op_dict["state"] == const.OP_STATE_WAIT:
					idx_list.append(op_dict["idx"])
					wait_tile_list = op_dict["tileList"]
			for i in range(len(idx_list)):
				p = self.players_list[idx_list[i]]
				self.selfConfirmOperation(p, const.OP_PASS, wait_tile_list, False)
		else:
			self.players_list[self.current_idx].autoDiscard()

	def addDiscardTimer(self):
		if self.discard_seconds > 0:
			self._op_timer_timestamp = utility.get_cur_timestamp()
			seconds = self.discard_seconds
			if len(self.all_discard_tiles) <= 0:
				seconds += const_gxmj.BEGIN_ANIMATION_TIME
			DEBUG_MSG("addDiscardTimer=====>{}".format(seconds))
			self._op_timer = self.add_timer(seconds, self.autoDiscardTile)

	def setDiscardState(self, avt_mb, state):
		idx = -1
		for i, p in enumerate(self.players_list):
			if p is not None and p == avt_mb:
				idx = i
				break
		p = self.players_list[idx]
		if not self.can_change_discard_state(p.tiles, idx, state):
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return
		p.set_discard_state(state)
		# self.op_special_record.append((const.OP_SPECIAL_DISCARD_FORCE, idx, idx, len(self.op_record)))
		for i in range(len(self.wait_op_info_list)):
			wait_op_dict = self.wait_op_info_list[i]
			if wait_op_dict["idx"] == idx and wait_op_dict["state"] == const.OP_STATE_WAIT:
				if (wait_op_dict["aid"] >> 3) == const.SHOW_WIN:
					self.selfConfirmOperation(avt_mb, wait_op_dict["aid"], wait_op_dict["tileList"], False)
				else:
					self.selfConfirmOperation(avt_mb, const.OP_PASS, wait_op_dict["tileList"], False)
				break

		for i, p in enumerate(self.players_list):
			if p is not None:
				p.postPlayerDiscardState(idx, state)

	def drawEnd(self):
		DEBUG_MSG("{} drawEnd.".format(self.prefixLogStr))
		""" 臭庄 """
		lucky_tiles = self.drawLuckyTile()
		self.cal_lucky_tile_score(lucky_tiles, -1)
		self.settlement()
		info = dict()
		info['win_op'] = -1
		info['win_idx'] = -1
		info['lucky_tiles'] = lucky_tiles
		info['result_list'] = []
		info['finalTile'] = 0
		info['from_idx'] = -1
		info['dealer_idx'] = self.dealer_idx
		DEBUG_MSG("{} drawEnd INFO:{}".format(self.prefixLogStr, info))
		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def winGame(self, idx, op, finalTile, from_idx, quantity, result):
		""" 座位号为idx的玩家胡牌 """
		self.cal_score(idx, from_idx, op, quantity)
		lucky_tiles = self.drawLuckyTile()
		self.cal_lucky_tile_score(lucky_tiles, idx)
		self.settlement()
		info = dict()
		info['win_op'] = op
		info['win_idx'] = idx
		info['lucky_tiles'] = lucky_tiles
		info['result_list'] = result
		info['finalTile'] = finalTile
		info['from_idx'] = from_idx
		info['dealer_idx'] = self.dealer_idx
		self.dealer_idx = idx
		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def confirmOperation(self, avt_mb, aid, tile_list):
		idx = -1
		for i, p in enumerate(self.players_list):
			if p == avt_mb:
				idx = i
		DEBUG_MSG("{} idx:{} confirmOperation aid:{} tile_list:{}".format(self.prefixLogStr, idx, aid, tile_list))
		wait_idx_list = []
		for op_dict in self.wait_op_info_list:
			if op_dict["idx"] not in wait_idx_list and op_dict["state"] == const.OP_STATE_WAIT:
				wait_idx_list.append(op_dict["idx"])
		if self.discard_seconds > 0 and len(wait_idx_list) == 1 and wait_idx_list[0] == idx:
			DEBUG_MSG("del wait discard timer == >:confirmOperation")
			if self._op_timer:
				self.cancel_timer(self._op_timer)
				self._op_timer = None
		self.selfConfirmOperation(avt_mb, aid, tile_list, True)

	def selfConfirmOperation(self, avt_mb, aid, tile_list, isFromClient):
		""" 被轮询的玩家确认了某个操作 """
		if self.dismiss_room_ts != 0 and int(utility.get_cur_timestamp() - self.dismiss_room_ts) < self.dismissRoomSecends:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("{} confirmOperation aid:{} dismiss_room_ts:{}".format(self.prefixLogStr, aid, self.dismiss_room_ts))
			# return

		tile = tile_list[0]
		idx = -1
		for i, p in enumerate(self.players_list):
			if p == avt_mb:
				idx = i
		# 玩家是否可以操作
		DEBUG_MSG("{} idx:{} wait_op_info_list:{}".format(self.prefixLogStr, idx, self.wait_op_info_list))
		if len(self.wait_op_info_list) <= 0 or sum([1 for waitOpDict in self.wait_op_info_list if (waitOpDict["idx"] == idx and waitOpDict["state"] == const.OP_STATE_WAIT)]) <= 0:
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return
		if self.players_list[idx].state == const_gxmj.DISCARD_FORCE and isFromClient:
			DEBUG_MSG("player {} is in state DISCARD_FORCE".format(idx))
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return
		# 提交 玩家结果
		for waitOpDict in self.wait_op_info_list:
			if waitOpDict["idx"] == idx:
				if waitOpDict["aid"] == const.OP_CHOW and aid == const.OP_CHOW and waitOpDict["tileList"][0] == tile_list[0] and self.can_chow_list(self.players_list[waitOpDict["idx"]].tiles, tile_list):
					waitOpDict["state"] = const.OP_STATE_SURE
					waitOpDict["tileList"] = tile_list
				elif waitOpDict["aid"] == aid and aid != const.OP_CHOW:
					waitOpDict["state"] = const.OP_STATE_SURE
				else:
					waitOpDict["state"] = const.OP_STATE_PASS
		# 有玩家可以操作
		isOver, confirmOpDict = self.getConfirmOverInfo()
		if isOver:
			DEBUG_MSG("{} commit over {}.".format(self.prefixLogStr, confirmOpDict))
			temp_wait_op_info_list = copy.deepcopy(self.wait_op_info_list)
			self.wait_op_info_list = []
			if len(confirmOpDict) > 0:
				sureIdx = confirmOpDict["idx"]
				p = self.players_list[sureIdx]
				if confirmOpDict["aid"] == const.OP_CHOW:
					self.current_idx = sureIdx
					p.chow(confirmOpDict["tileList"])
				elif confirmOpDict["aid"] == const.OP_PONG:
					self.current_idx = sureIdx
					p.pong(confirmOpDict["tileList"][0])
				elif confirmOpDict["aid"] == const.OP_EXPOSED_KONG:
					self.current_idx = sureIdx
					p.exposedKong(confirmOpDict["tileList"][0])
				elif confirmOpDict["aid"] == const.OP_KONG_WIN:
					p.kong_win(confirmOpDict["tileList"][0], confirmOpDict["score"], confirmOpDict["result"])
				elif confirmOpDict["aid"] == const.OP_GIVE_WIN:
					p.give_win(confirmOpDict["tileList"][0], confirmOpDict["score"], confirmOpDict["result"])
				else:
					DEBUG_MSG("len(confirmOpDict) > 0 temp_wait_op_info_list: {}.".format(temp_wait_op_info_list))
					lastAid = temp_wait_op_info_list[0]["aid"]
					if lastAid == const.OP_WREATH_WIN:
						self.current_idx = self.last_player_idx
					elif lastAid == const.OP_KONG_WIN:
						# *********没人抢杠胡 杠要算分？***********
						self.current_idx = self.last_player_idx
					else:
						self.current_idx = self.nextIdx
					self.beginRound()
			else:
				DEBUG_MSG("len(confirmOpDict) <= 0 temp_wait_op_info_list: {}.".format(temp_wait_op_info_list))
				lastAid = temp_wait_op_info_list[0]["aid"]
				if lastAid == const.OP_WREATH_WIN:
					self.current_idx = self.last_player_idx
				elif lastAid == const.OP_KONG_WIN:
					# *********没人抢杠胡 杠要算分？***********
					self.current_idx = self.last_player_idx
				else:
					self.current_idx = self.nextIdx
				self.beginRound()

	def getConfirmOverInfo(self):
		for i in range(len(self.wait_op_info_list)):
			waitState = self.wait_op_info_list[i]["state"]
			if waitState == const.OP_STATE_PASS:
				continue
			elif waitState == const.OP_STATE_WAIT:  # 需等待其他玩家操作
				return False, {}
			elif waitState == const.OP_STATE_SURE:  # 有玩家可以操作
				return True, self.wait_op_info_list[i]
		return True, {}  # 所有玩家选择放弃

	def waitForOperation(self, idx, aid, tile, nextIdx=-1):  # aid抢杠 杠花没人可胡 nextIdx还是自己
		notifyOpList = self.getNotifyOpList(idx, aid, tile)
		if sum([len(x) for x in notifyOpList]) > 0:
			DEBUG_MSG("{} waitForOperation from:{},aid:{},tile:{}==>notifyOpList:{}".format(self.prefixLogStr, idx, aid, tile, notifyOpList))
			for i, p in enumerate(self.players_list):
				if p is not None and len(notifyOpList[i]) > 0:
					waitAidList = [notifyOp["aid"] for notifyOp in notifyOpList[i]]
					p.waitForOperation(waitAidList, [tile, ])
			# 摸打模式
			for i, p in enumerate(self.players_list):
				if p is not None and len(notifyOpList[i]) > 0 and p.discard_state == const_gxmj.DISCARD_FORCE:
					wait_op_dict = None
					for notifyOp in notifyOpList[i]:
						if notifyOp["aid"] == const.OP_KONG_WIN or notifyOp["aid"] == const.OP_GIVE_WIN:
							wait_op_dict = notifyOp
							break
					if wait_op_dict is not None:
						self.selfConfirmOperation(p, wait_op_dict["aid"], wait_op_dict["tileList"], False)
					else:
						self.selfConfirmOperation(p, const.OP_PASS, notifyOpList[i][0]["tileList"], False)

			if len(self.wait_op_info_list) > 0:
				self.addDiscardTimer()
				for i, p in enumerate(self.players_list):
					if p is not None and self.discard_seconds > 0:
						p.showWaitOperationTime()
		else:
			DEBUG_MSG("nobody waitForOperation.idx:{},aid:{},tile:{}".format(idx, aid, tile))
			self.current_idx = self.nextIdx if nextIdx < 0 else nextIdx
			self.beginRound()


	def broadcastRoundEnd(self, info):
		# 广播胡牌或者流局导致的每轮结束信息, 包括算的扎码和当前轮的统计数据

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		self.state = const.ROOM_WAITING
		DEBUG_MSG("{} broadcastRoundEnd state:{}".format(self.prefixLogStr, self.state))
		info['left_tiles'] = self.tiles
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]

		DEBUG_MSG("{}=={}".format(self.prefixLogStr, "&" * 30))
		DEBUG_MSG("{} RoundEnd info:{}".format(self.prefixLogStr, info))

		self.confirm_next_idx = []
		for p in self.players_list:
			if p:
				p.roundResult(info)

		self.addAvatarGameRound()

		self.end_record_game(info)

	def pay2StartGame(self):
		""" 开始游戏 """
		if self.timeout_timer:
			self.cancel_timer(self.timeout_timer)
			self.timeout_timer = None

		self.state = const.ROOM_TRANSITION

		# 通知base
		self.base.startGame()
		# 在第2局开始扣房卡
		if self.current_round == 1:
			accounts = [p.accountName for p in self.players_list]
			self.base.charge(accounts)
		else:
			self.paySuccessCbk()

	def begin_record_game(self, dice_list):
		DEBUG_MSG("{} begin record game".format(self.prefixLogStr))
		self.begin_record_room()
		init_tiles = [None] * len(self.origin_players_list)
		player_id_list = []
		for p in self.origin_players_list:
			init_tiles[p.idx] = p.tiles[:]
			player_id_list.append(p.userId)

		KBEngine.globalData['GameWorld'].begin_record_room(self, self.roomIDC, {
			'init_info': self.get_init_client_dict(),
			'dice_list': copy.deepcopy(dice_list),
			'player_id_list': player_id_list,
			'init_tiles': init_tiles,
			'prevailing_wind': self.prevailing_wind,
			'kingTiles': self.kingTiles[:],
			'wreathsList': self.wreathsList[:],
			'start_time': time.time(),
			'roomId': self.roomIDC,
			'clubId': self.club_id,
		})

	def begin_record_callback(self, record_id):
		self.record_id = record_id

	def end_record_game(self, result_info):
		DEBUG_MSG("{} end record game; {}".format(self.prefixLogStr, self.record_id))
		KBEngine.globalData['GameWorld'].end_record_room(self.roomIDC, self.club_id, self.gameTypeC, {
			'op_record_list': json.dumps(self.op_record),
			'round_result': result_info,
			'end_time': time.time()
		})
		self.record_id = -1

	def give_up_record_game(self):
		DEBUG_MSG("{} give up record game; {}".format(self.prefixLogStr, self.record_id))
		KBEngine.globalData['GameWorld'].give_up_record_room(self.roomIDC)

	def settlement(self):
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.settlement()

	def endAll(self, info):
		""" 游戏局数结束, 给所有玩家显示最终分数记录 """

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		info['left_tiles'] = self.tiles
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None]
		DEBUG_MSG("{} endAll player_info_list = {} info = {}".format(self.prefixLogStr, player_info_list, info))

		self.end_record_game(info)
		self.saveRoomResult()

		for p in self.players_list:
			if p:
				p.finalResult(player_info_list, info)
				# 有效圈数加一
				p.addGameCount()

		self.addAvatarGameRound()

		self._reset()

	def subtotal_result(self):
		self.dismiss_timer = None
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None]
		DEBUG_MSG("{} subtotal_result,player_info_list:{}".format(self.prefixLogStr, player_info_list))

		for p in self.players_list:
			if p:
				try:
					p.subtotalResult(player_info_list)
				except:
					pass
		self._reset()

	def record_round_result(self):
		# 玩家记录当局战绩
		d = datetime.fromtimestamp(utility.get_cur_timestamp())
		round_result_d = {
			'date': '-'.join([str(d.year), str(d.month), str(d.day)]),
			'time': ':'.join([str(d.hour), str(d.minute)]),
			'round_record': [p.get_round_result_info() for p in self.players_list if p],
			'recordId': self.record_id
		}
		self.game_result['round_result'].append(round_result_d)

	def begin_record_room(self):
		# 在第一局的时候记录基本信息
		if self.current_round != 1:
			return

		self.game_result = {
			'game_round': self.game_round,
			'roomID': self.roomIDC,
			'game_type': self.gameTypeC,
			'user_info_list': [p.get_basic_user_info() for p in self.players_list if p]
		}
		self.game_result['round_result'] = []

	def save_game_result(self):
		DEBUG_MSG('{} save_game_result len:{}'.format(self.prefixLogStr, len(self.game_result.get('round_result', []))))
		if 'round_result' in self.game_result and len(self.game_result['round_result']) > 0:
			result_str = json.dumps(self.game_result)
			for p in self.players_list:
				p.save_game_result(result_str)

	def save_club_result(self):
		DEBUG_MSG('{} ------ save club result -----'.format(self.prefixLogStr))
		d = self.get_club_complete_dict()
		self.base.saveClubResult(d)
		if 'round_result' in self.game_result and len(self.game_result['round_result']) > 0:
			self.base.updateClubDAU([p.get_dau_client_dict() for p in self.players_list if p is not None])

	def saveRoomResult(self):
		# 保存玩家的战绩记录
		self.save_game_result()
		# 保存亲友圈的战绩
		if self.room_type == const.CLUB_ROOM:
			self.save_club_result()

	def addAvatarGameRound(self):
		for p in self.players_list:
			if p is not None:
				p.base.addAvatarGameRound(self.gameTypeC, 1)

	def timeoutDestroy(self):
		INFO_MSG("{} timeout destroyed. room_type = {}, owner_uid = {}".format(self.prefixLogStr, self.room_type, self.owner_uid))
		if self.current_round < 1:
			self.dropRoom()


	def get_init_client_dict(self):
		return {
			'roomID'			: self.roomIDC,
			'ownerId'			: self.owner_uid,
			'roomType'			: self.room_type,
			'dealerIdx'			: self.dealer_idx,
			'curRound'			: self.current_round,
			'game_round'		: self.game_round,
			'player_num'		: self.player_num,
			'king_num'			: self.king_num,
			'pay_mode'			: self.pay_mode,
			'game_mode'			: self.game_mode,
			'max_lose'			: self.max_lose,
			'lucky_num'			: self.lucky_num,
			'discard_seconds'	: self.discard_seconds,
			'hand_prepare'		: self.hand_prepare,
			'club_id'			: self.club_id,
			'table_idx'			: getattr(self, 'table_idx', -1),
			'player_base_info_list': [p.get_init_client_dict() for p in self.players_list if p is not None],
			'player_state_list'	: [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
		}

	def get_club_complete_dict(self):
		d = {
			'gameType'		: self.gameTypeC,
			'roomID'		: self.roomIDC,
			'time'			: utility.get_cur_timestamp(),
			'game_round'	: self.game_round,
			'pay_mode'		: self.pay_mode,
			'roundResult'	: json.dumps(self.game_result.get('round_result', [])),
			'player_info_list': [p.get_club_client_dict() for p in self.origin_players_list if p is not None],
		}
		# 第二局开始扣房卡的
		if self.current_round >= 2:
			d['cost'] = utility.calc_cost(self.gameTypeC, self.roomParamsC)[0]
		else:
			d['cost'] = 0
		return d

	def get_reconnect_room_dict(self, userId):
		dismiss_left_time = self.dismissRoomSecends - (utility.get_cur_timestamp() - self.dismiss_room_ts)
		if self.dismiss_room_ts == 0 or dismiss_left_time >= self.dismissRoomSecends:
			dismiss_left_time = 0

		idx = 0
		for p in self.players_list:
			if p.userId == userId:
				idx = p.idx

		waitAidList = []
		for i in range(len(self.wait_op_info_list)):
			if self.wait_op_info_list[i]["idx"] == idx and self.wait_op_info_list[i]["state"] == const.OP_STATE_WAIT:
				waitAidList.append(self.wait_op_info_list[i]["aid"])
		DEBUG_MSG('{} reconnect_room waitAidList:{}'.format(self.prefixLogStr, waitAidList))
		waitTimeLeft = 0
		if self.discard_seconds > 0:
			if len(self.all_discard_tiles) <= 0:
				waitTimeLeft = int(self.discard_seconds + const_gxmj.BEGIN_ANIMATION_TIME - (utility.get_cur_timestamp() - self._op_timer_timestamp))
			else:
				waitTimeLeft = int(self.discard_seconds - (utility.get_cur_timestamp() - self._op_timer_timestamp))
		return {
			'gameType': self.gameTypeC,
			'init_info': self.get_init_client_dict(),
			'curPlayerSitNum': self.current_idx,
			'room_state': const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
			'lastDiscardTile': -1 if not self.all_discard_tiles else self.all_discard_tiles[-1],
			'lastDrawTile': self.players_list[idx].last_draw,
			'last_op': self.players_list[idx].last_op,
			'lastDiscardTileFrom': self.last_player_idx,
			'kingTiles': self.kingTiles,
			'waitAidList': waitAidList,
			'leftTileNum': len(self.tiles),
			'applyCloseFrom': self.dismiss_room_from,
			'applyCloseLeftTime': dismiss_left_time,
			'applyCloseStateList': self.dismiss_room_state_list,
			'player_advance_info_list': [p.get_reconnect_client_dict(userId) for p in self.players_list if p is not None],
			'prevailing_wind': self.prevailing_wind,
			'discardStateList': [p.discard_state for i, p in enumerate(self.players_list) if p is not None],
			'waitTimeLeft': waitTimeLeft,
		}

# ----------------------------------------------------------------------------------------------------------------------
#                                  Room Rules
# ----------------------------------------------------------------------------------------------------------------------

	def swapSeat(self, swap_list):
		random.shuffle(swap_list)
		for i in range(len(swap_list)):
			self.players_list[i] = self.origin_players_list[swap_list[i]]

		for i, p in enumerate(self.players_list):
			if p is not None:
				p.idx = i

	def setPrevailingWind(self):
		# 圈风
		if self.player_num != 4:
			return
		minDearerNum = min(self.dealerNumList)
		self.prevailing_wind = const.WINDS[(self.prevailing_wind + 1 - const.WIND_EAST) % len(
			const.WINDS)] if minDearerNum >= 1 else self.prevailing_wind
		self.dealerNumList = [0] * self.player_num if minDearerNum >= 1 else self.dealerNumList
		self.dealerNumList[self.dealer_idx] += 1

	def setPlayerWind(self):
		if self.player_num != 4:
			return
		# 位风
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.wind = (self.player_num + i - self.dealer_idx) % self.player_num + const.WIND_EAST

	def initTiles(self):
		# 万 条 筒
		self.tiles = list(const.CHARACTER) * 4 + list(const.BAMBOO) * 4 + list(const.DOT) * 4
		# 东 西 南 北
		self.tiles += [const.WIND_EAST, const.WIND_SOUTH, const.WIND_WEST, const.WIND_NORTH] * 4
		# 中 发 白
		self.tiles += [const.DRAGON_RED, const.DRAGON_GREEN, const.DRAGON_WHITE] * 4
		# # 春 夏 秋 冬
		# self.tiles += [const.SEASON_SPRING, const.SEASON_SUMMER, const.SEASON_AUTUMN, const.SEASON_WINTER]
		# # 梅 兰 竹 菊
		# self.tiles += [const.FLOWER_PLUM, const.FLOWER_ORCHID, const.FLOWER_BAMBOO, const.FLOWER_CHRYSANTHEMUM]
		DEBUG_MSG("room:{},curround:{} init tiles:{}".format(self.roomIDC, self.current_round, self.tiles))
		self.shuffle_tiles()

	def shuffle_tiles(self):
		random.shuffle(self.tiles)
		DEBUG_MSG("room:{},curround:{} shuffle tiles:{}".format(self.roomIDC, self.current_round, self.tiles))

	def deal(self, prefabHandTiles, prefabTopList):
		""" 发牌 """
		if prefabHandTiles is not None:
			for i, p in enumerate(self.players_list):
				if p is not None and len(prefabHandTiles) >= 0:
					p.tiles = prefabHandTiles[i] if len(prefabHandTiles[i]) <= const_gxmj.INIT_TILE_NUM else \
					prefabHandTiles[i][0:const_gxmj.INIT_TILE_NUM]
			topList = prefabTopList if prefabTopList is not None else []
			allTiles = []
			for i, p in enumerate(self.players_list):
				if p is not None:
					allTiles.extend(p.tiles)
			allTiles.extend(topList)

			tile2NumDict = utility.getTile2NumDict(allTiles)
			warning_tiles = [t for t, num in tile2NumDict.items() if num > 4]
			if len(warning_tiles) > 0:
				WARNING_MSG("room:{},curround:{} prefab {} is larger than 4.".format(self.roomIDC, self.current_round, warning_tiles))
			for t in allTiles:
				if t in self.tiles:
					self.tiles.remove(t)
			for i in range(const_gxmj.INIT_TILE_NUM):
				num = 0
				for j in range(self.player_num):
					if len(self.players_list[j].tiles) >= const_gxmj.INIT_TILE_NUM:
						continue
					self.players_list[j].tiles.append(self.tiles[num])
					num += 1
				self.tiles = self.tiles[num:]

			newTiles = topList
			newTiles.extend(self.tiles)
			self.tiles = newTiles
		else:
			for i in range(const_gxmj.INIT_TILE_NUM):
				for j in range(self.player_num):
					self.players_list[j].tiles.append(self.tiles[j])
				self.tiles = self.tiles[self.player_num:]

		for i, p in enumerate(self.players_list):
			DEBUG_MSG("room:{},curround:{} idx:{} deal tiles:{}".format(self.roomIDC, self.current_round, i, p.tiles))

	def kongWreath(self):
		""" 杠花 """
		for i in range(self.player_num):
			for j in range(len(self.players_list[i].tiles) - 1, -1, -1):
				tile = self.players_list[i].tiles[j]
				if tile in const.SEASON or tile in const.FLOWER:
					del self.players_list[i].tiles[j]
					self.players_list[i].wreaths.append(tile)
					DEBUG_MSG("room:{},curround:{} kong wreath, idx:{},tile:{}".format(self.roomIDC, self.current_round, i, tile))

	def addWreath(self):
		""" 补花 """
		for i in range(self.player_num):
			while len(self.players_list[i].tiles) < const_gxmj.INIT_TILE_NUM:
				if len(self.tiles) <= 0:
					break
				tile = self.tiles[0]
				self.tiles = self.tiles[1:]
				if tile in const.SEASON or tile in const.FLOWER:
					self.players_list[i].wreaths.append(tile)
					DEBUG_MSG("room:{},curround:{} add wreath, tile is wreath,idx:{},tile:{}".format(self.roomIDC,
																									 self.current_round,
																									 i, tile))
				else:
					self.players_list[i].tiles.append(tile)
					DEBUG_MSG("room:{},curround:{} add wreath, tile is not wreath, idx:{},tile:{}".format(self.roomIDC,
																										  self.current_round,
																										  i, tile))

	def rollKingTile(self):
		""" 财神 """
		self.kingTiles = []
		if self.king_num > 0:
			for i in range(len(self.tiles)):
				t = self.tiles[i]
				if t not in const.SEASON and t not in const.FLOWER:  # 第一张非花牌
					# 1-9为一圈 东南西北为一圈 中发白为一圈
					self.kingTiles.append(t)
					if self.king_num > 1:
						for tup in (const.CHARACTER, const.BAMBOO, const.DOT, const.WINDS, const.DRAGONS):
							if t in tup:
								index = tup.index(t)
								self.kingTiles.append(tup[(index + 1) % len(tup)])
								break
					del self.tiles[i]
					break

	def tidy(self):
		""" 整理 """
		for i in range(self.player_num):
			self.players_list[i].tidy(self.kingTiles)

	def throwTheDice(self, idxList):
		if self.player_num == 3:
			diceList = [[0, 0], [0, 0], [0, 0]]
		else:
			diceList = [[0, 0], [0, 0], [0, 0], [0, 0]]
		for idx in idxList:
			for i in range(0, 2):
				diceNum = random.randint(1, 6)
				diceList[idx][i] = diceNum
		return diceList

	def getMaxDiceIdx(self, diceList):
		numList = []
		for i in range(len(diceList)):
			numList.append(diceList[i][0] + diceList[i][1])

		idx = 0
		num = 0
		for i in range(len(numList)):
			if numList[i] > num:
				idx = i
				num = numList[i]
		return idx, num

	def drawLuckyTile(self):
		luckyTileList = []
		for i in range(self.lucky_num):
			if len(self.tiles) > 0:
				luckyTileList.append(self.tiles[0])
				self.tiles = self.tiles[1:]
		return luckyTileList

	# def getKongRecord(self):
	# 	kong_record_list = []
	# 	for i in range(len(self.op_record)):
	# 		if self.op_record[i][0] == const.OP_CONCEALED_KONG or self.op_record[i][0] == const.OP_EXPOSED_KONG or self.op_record[i][0] == const.OP_CONTINUE_KONG:
	# 			kong_record_list.append(self.op_record[i])
	# 	return kong_record_list

	def getContinueKongFrom(self, op_r, tile):
		for record in reversed(op_r):
			if record[0] == const.OP_PONG and tile in record[1]:
				return record[2]
		return -1

	def getKongRecord(self):
		kong_record_list = []
		for i, p in enumerate(self.players_list):
			if p is not None:
				kong_record_list.extend(p.kong_record_list)
		return kong_record_list

	def cal_lucky_tile_score(self, lucky_tiles, winIdx):
		kong_record_list = self.getKongRecord()  # (const.OP_EXPOSED_KONG, self.idx, self.owner.last_player_idx, [tile,])
		for t in lucky_tiles:
			# 摸到第几个人
			idx = -99
			for i in range(len(const.LUCKY_TUPLE)):
				if t in const.LUCKY_TUPLE[i]:
					idx = i
					break
			sel_idx = (self.dealer_idx + idx) % self.player_num

			DEBUG_MSG("cal_lucky_tile_score sel_idx:{0}, luckyTile:{1}".format(sel_idx, t))
			if sel_idx < 0:
				continue
			# 杠分
			kong_base_score = 1
			mul = 2 if self.game_mode == 1 else 1
			for record in kong_record_list:
				if record[0] == const.OP_CONCEALED_KONG:  # 暗杠
					if sel_idx == self.dealer_idx:  # 摸到自己
						if record[1] == sel_idx:  # 是自己杠 6 -2 -2 -2
							# 相当于自己再杠一遍
							for i, p in enumerate(self.players_list):
								if p is not None and i != sel_idx:
									p.add_treasure_kong_score(-mul * kong_base_score)
							self.players_list[self.dealer_idx].add_treasure_kong_score(
								mul * kong_base_score * (self.player_num - 1))
						else:  # 不是自己杠 -2 4 -1 -1
							# 自己扣2分 杠的人再得2分
							self.players_list[self.dealer_idx].add_treasure_kong_score(-mul * kong_base_score)
							self.players_list[record[1]].add_treasure_kong_score(mul * kong_base_score)
					else:  # 摸到别人
						# 是自己杠 不加不减
						# 是别人杠
						if record[1] != self.dealer_idx:
							# 摸到得分的人 除得分的人外全部扣一遍 自己加得分 -2 4 -1 -1
							if record[1] == sel_idx:
								for i, p in enumerate(self.players_list):
									if p is not None and i != sel_idx:
										if i == self.dealer_idx:
											p.add_treasure_kong_score(-mul * kong_base_score)
										else:
											p.add_treasure_kong_score(-kong_base_score)
								self.players_list[self.dealer_idx].add_treasure_kong_score(
									kong_base_score * (self.player_num - 2 + mul))
							else:
								# 摸到 扣分的人，自己扣分，杠的人得分 -2 -1 -1 4
								self.players_list[record[1]].add_treasure_kong_score(kong_base_score)
								self.players_list[self.dealer_idx].add_treasure_kong_score(-kong_base_score)
				elif record[0] == const.OP_CONTINUE_KONG:
					fromIdx = self.getContinueKongFrom(self.players_list[record[1]].op_r, record[3][0])
					if sel_idx == record[1]:  # 接杠
						score = mul * kong_base_score if (
						record[1] == self.dealer_idx or fromIdx == self.dealer_idx) else kong_base_score
						self.players_list[fromIdx].add_treasure_kong_score(-score)
						self.players_list[self.dealer_idx].add_treasure_kong_score(score)
					elif sel_idx == fromIdx:  # 被接杠
						score = mul * kong_base_score if (
						record[1] == self.dealer_idx or fromIdx == self.dealer_idx) else kong_base_score
						self.players_list[record[1]].add_treasure_kong_score(score)
						self.players_list[self.dealer_idx].add_treasure_kong_score(-score)
				elif record[1] == sel_idx:  # 明杠
					score = mul * kong_base_score if (
					record[1] == self.dealer_idx or record[2] == self.dealer_idx) else kong_base_score
					DEBUG_MSG("lucky exposed kong,idx:{0}, fromIdx:{1} score:{2}".format(record[1], record[2], score))
					self.players_list[record[2]].add_treasure_kong_score(-score)
					self.players_list[self.dealer_idx].add_treasure_kong_score(score)
				elif record[2] == sel_idx:  # 被明杠
					score = mul * kong_base_score if (
					record[1] == self.dealer_idx or record[2] == self.dealer_idx) else kong_base_score
					DEBUG_MSG(
						"kucky be exposed kong,idx:{0}, fromIdx:{1} score:{2}".format(record[1], record[2], score))
					self.players_list[record[1]].add_treasure_kong_score(score)
					self.players_list[self.dealer_idx].add_treasure_kong_score(-score)
			if winIdx >= 0:  # 非流局
				sel_score = self.players_list[sel_idx].score
				if sel_idx == winIdx:  # 摸胡牌的人
					for i, p in enumerate(self.players_list):
						if i != sel_idx and p is not None:
							p.add_treasure_score(p.score)
					self.players_list[self.dealer_idx].add_treasure_score(sel_score)
				else:
					self.players_list[self.dealer_idx].add_treasure_score(sel_score)
					self.players_list[winIdx].add_treasure_score(-sel_score)

	def swapTileToTop(self, tile):
		if tile in self.tiles:
			tileIdx = self.tiles.index(tile)
			self.tiles[0], self.tiles[tileIdx] = self.tiles[tileIdx], self.tiles[0]

	def winCount(self):
		pass

	def canTenPai(self, handTiles):
		length = len(handTiles)
		if length % 3 != 1:
			return False

		result = []
		tryTuple = (const.CHARACTER, const.BAMBOO, const.DOT, const.WINDS, const.DRAGONS)
		for tup in tryTuple:
			for t in tup:
				tmp = list(handTiles)
				tmp.append(t)
				sorted(tmp)
				if utility.isWinTile(tmp, self.kingTiles):
					result.append(t)
		return result != []

	def can_cut_after_kong(self):
		return True

	def can_discard(self, tiles, t):
		if t in tiles:
			return True
		return False

	def can_chow(self, tiles, t):
		return False

	# if t >= 30:
	# 	return False
	# neighborTileNumList = [0, 0, 1, 0, 0]
	# for i in range(len(tiles)):
	# 	if (tiles[i] - t >= -2 and tiles[i] - t <= 2):
	# 		neighborTileNumList[tiles[i] - t + 2] += 1
	# for i in range(0,3):
	# 	tileNum = 0
	# 	for j in range(i,i+3):
	# 		if neighborTileNumList[j] > 0:
	# 			tileNum += 1
	# 		else:
	# 			break
	# 	if tileNum >= 3:
	# 		return True
	# return False

	def can_chow_list(self, tiles, tile_list):
		return False

	# """ 能吃 """
	# if tile_list[0] >= 30:
	# 	return False
	# if sum([1 for i in tiles if i == tile_list[1]]) >= 1 and sum([1 for i in tiles if i == tile_list[2]]) >= 1:
	# 	sortLis = sorted(tile_list)
	# 	if (sortLis[2] + sortLis[0])/2 == sortLis[1] and sortLis[2] - sortLis[0] == 2:
	# 		return True
	# return False

	def can_pong(self, tiles, t):
		""" 能碰 """
		if t in self.kingTiles:
			return False
		return sum([1 for i in tiles if i == t]) >= 2

	def can_exposed_kong(self, tiles, t):
		""" 能明杠 """
		if t in self.kingTiles:
			return False
		return tiles.count(t) == 3

	def can_continue_kong(self, player, t):
		""" 能够风险杠 """
		if t in self.kingTiles:
			return False
		for op in player.op_r:
			if op[0] == const.OP_PONG and op[1][0] == t:
				return True
		return False

	def can_concealed_kong(self, tiles, t):
		""" 能暗杠 """
		if t in self.kingTiles:
			return False
		return tiles.count(t) == 4

	def can_kong_wreath(self, tiles, t):
		if t in tiles and (t in const.SEASON or t in const.FLOWER):
			return True
		return False

	def can_wreath_win(self, wreaths):
		if len(wreaths) == len(const.SEASON) + len(const.FLOWER):
			return True
		return False

	def can_change_discard_state(self, tiles, i, state):
		if state == const_gxmj.DISCARD_FREE:
			return False
		elif state == const_gxmj.DISCARD_FORCE:
			return self.canTenPai(tiles)

	def getNotifyOpList(self, idx, aid, tile):
		# notifyOpList 和 self.wait_op_info_list 必须同时操作
		# 数据结构：问询玩家，操作玩家，牌，操作类型，得分，结果，状态
		notifyOpList = [[] for i in range(self.player_num)]
		self.wait_op_info_list = []
		# 胡
		if aid == const.OP_KONG_WREATH and self.can_wreath_win(self.players_list[idx].wreaths):  # 8花胡
			opDict = {"idx": idx, "from": idx, "tileList": [tile, ], "aid": const.OP_WREATH_WIN, "score": 0,
					  "result": [], "state": const.OP_STATE_WAIT}
			notifyOpList[idx].append(opDict)
			self.wait_op_info_list.append(opDict)
		elif aid == const.OP_EXPOSED_KONG:  # 直杠 抢杠胡
			wait_for_win_list = self.getExposedKongWinList(idx, tile)
			self.wait_op_info_list.extend(wait_for_win_list)
			for i in range(len(wait_for_win_list)):
				dic = wait_for_win_list[i]
				notifyOpList[dic["idx"]].append(dic)
		elif aid == const.OP_CONTINUE_KONG:  # 碰后接杠 抢杠胡
			wait_for_win_list = self.getKongWinList(idx, tile)
			self.wait_op_info_list.extend(wait_for_win_list)
			for i in range(len(wait_for_win_list)):
				dic = wait_for_win_list[i]
				notifyOpList[dic["idx"]].append(dic)
		elif aid == const.OP_DISCARD:
			# 胡(放炮胡)
			wait_for_win_list = self.getGiveWinList(idx, tile)
			self.wait_op_info_list.extend(wait_for_win_list)
			for i in range(len(wait_for_win_list)):
				dic = wait_for_win_list[i]
				notifyOpList[dic["idx"]].append(dic)
			# 杠 碰
			for i, p in enumerate(self.players_list):
				if p and i != idx:
					if self.can_exposed_kong(p.tiles, tile):
						opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_EXPOSED_KONG, "score": 0,
								  "result": [], "state": const.OP_STATE_WAIT}
						self.wait_op_info_list.append(opDict)
						notifyOpList[i].append(opDict)
					if self.can_pong(p.tiles, tile):
						opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_PONG, "score": 0,
								  "result": [], "state": const.OP_STATE_WAIT}
						self.wait_op_info_list.append(opDict)
						notifyOpList[i].append(opDict)
			# 吃
			nextIdx = self.nextIdx
			if self.can_chow(self.players_list[nextIdx].tiles, tile):
				opDict = {"idx": nextIdx, "from": idx, "tileList": [tile, ], "aid": const.OP_CHOW, "score": 0,
						  "result": [], "state": const.OP_STATE_WAIT}
				self.wait_op_info_list.append(opDict)
				notifyOpList[nextIdx].append(opDict)
		return notifyOpList

	def getExposedKongWinList(self, idx, tile):
		wait_for_win_list = []
		for i, p in enumerate(self.players_list):
			if p is not None and i != idx:
				# 抢直杠 卡张 必须卖宝
				if p.discard_tiles and tile == p.discard_tiles[-1] and utility.getCanWinTiles(p.tiles) == [tile]:
					DEBUG_MSG("getExposedKongWinList {}".format(i))
					tryTiles = list(p.tiles)
					tryTiles.append(tile)
					tryTiles = sorted(tryTiles)
					_, score, result = self.can_win(tryTiles, tile, const.OP_KONG_WIN, i)
					wait_for_win_list.append(
						{"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_KONG_WIN, "score": score,
						 "result": result, "state": const.OP_STATE_WAIT})
				else:  # 平胡 可以 抢直杠
					tryTiles = list(p.tiles)
					tryTiles.append(tile)
					tryTiles = sorted(tryTiles)
					isWin, score, result = self.can_win(tryTiles, tile, const.OP_KONG_WIN, i)
					if isWin and score == 1:
						wait_for_win_list.append(
							{"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_KONG_WIN, "score": score,
							 "result": result, "state": const.OP_STATE_WAIT})
		return wait_for_win_list

	# 抢杠胡 玩家列表
	def getKongWinList(self, idx, tile):
		wait_for_win_list = []
		for i in range(self.player_num - 1):
			ask_idx = (idx + i + 1) % self.player_num
			p = self.players_list[ask_idx]
			tryTiles = list(p.tiles)
			tryTiles.append(tile)
			tryTiles = sorted(tryTiles)
			# DEBUG_MSG("room:{},curround:{} getKongWinList {}".format(self.roomIDC, self.current_round, ask_idx))
			is_win, score, result = self.can_win(tryTiles, tile, const.OP_KONG_WIN, ask_idx)
			if is_win:
				wait_for_win_list.append(
					{"idx": ask_idx, "from": idx, "tileList": [tile, ], "aid": const.OP_KONG_WIN, "score": score,
					 "result": result, "state": const.OP_STATE_WAIT})
		return wait_for_win_list

	# 放炮胡 玩家列表
	def getGiveWinList(self, idx, tile):
		wait_for_win_list = []
		for i in range(self.player_num - 1):
			ask_idx = (idx + i + 1) % self.player_num
			p = self.players_list[ask_idx]
			tryTiles = list(p.tiles)
			tryTiles.append(tile)
			tryTiles = sorted(tryTiles)
			# DEBUG_MSG("getGiveWinList {0}".format(ask_idx))
			is_win, score, result = self.can_win(tryTiles, tile, const.OP_GIVE_WIN, ask_idx)
			if is_win:
				wait_for_win_list.append(
					{"idx": ask_idx, "from": idx, "tileList": [tile, ], "aid": const.OP_GIVE_WIN, "score": score,
					 "result": result, "state": const.OP_STATE_WAIT})
		return wait_for_win_list

	def classify_tiles(self, tiles):
		chars = []
		bambs = []
		dots = []
		dragon_red = 0
		for t in tiles:
			if t in const.CHARACTER:
				chars.append(t)
			elif t in const.BAMBOO:
				bambs.append(t)
			elif t in const.DOT:
				dots.append(t)
			elif t == const.DRAGON_RED:
				dragon_red += 1
			else:
				DEBUG_MSG("iRoomRules classify tiles failed, no this tile %s" % t)
		return chars, bambs, dots, dragon_red

	def can_win(self, handTiles, finalTile, win_op, idx):
		# 平胡 卡张 碰碰胡 全求人 7对 豪7 双豪7 三豪7 清一色 字一色 乱风 杠开
		result = [0] * 12  # 胡牌类型
		quantity = 0
		if len(handTiles) % 3 != 2:
			return False, quantity, result

		p = self.players_list[idx]
		handCopyTiles = list(handTiles)
		handCopyTiles = sorted(handCopyTiles)
		classifyList = utility.classifyTiles(handCopyTiles, self.kingTiles)
		kingTilesNum = len(classifyList[0])  # 百搭的数量
		handTilesButKing = []  # 除百搭外的手牌
		for i in range(1, len(classifyList)):
			handTilesButKing.extend(classifyList[i])
		upTiles = p.upTiles
		# 清一色 字一色
		colorType = utility.getTileColorType(handTilesButKing, upTiles)
		# 7对
		is7Double, isBrightTiles, isDarkTiles = utility.get7DoubleWin(handCopyTiles, handTilesButKing, kingTilesNum,
																	  finalTile)

		# 获得所有能胡的牌的列表
		tmpTiles = list(handTiles)
		tmpTiles.remove(finalTile)
		canWinList = utility.getCanWinTiles(tmpTiles)

		isCanWin = False
		if is7Double:
			quantity += 4
			tile2NumDict = utility.getTile2NumDict(handTilesButKing)
			if colorType == const.SAME_SUIT:
				quantity += 4
				result[8] = 1
			elif colorType == const.SAME_HONOR:
				quantity += 4
				result[9] = 1
			mul = 0
			for t in tile2NumDict:
				if tile2NumDict[t] == 4:
					mul += 1
			quantity *= 2 ** mul
			result[4 + mul] = 1
			return True, quantity, result
		elif finalTile in canWinList:
			isPongPongWin = utility.checkIsPongPongWin(handTilesButKing, upTiles, kingTilesNum)
			isKongWin, kongWinType = utility.checkIsKongDrawWin(p.op_r)

			if isPongPongWin:
				# 碰碰胡
				quantity += 3
				result[2] = 1
				# 全求人
				if len(handCopyTiles) == 2:
					quantity += 2
					result[3] = 1
				# 清一色/字一色
				if colorType == const.SAME_SUIT:
					quantity += 4
					result[8] = 1
				elif colorType == const.SAME_HONOR:
					quantity += 4
					result[9] = 1
				# 杠开
				if win_op == const.OP_DRAW_WIN and isKongWin:
					quantity *= 2
					result[11] = 1
				isCanWin = True
			elif len(canWinList) == 1:
				# 卡张
				quantity += 2
				result[1] = 1
				# 清一色 --不可能是字一色，字一色必须是碰碰胡
				if colorType == const.SAME_SUIT:
					quantity += 4
					result[8] = 1
				# 杠开
				if win_op == const.OP_DRAW_WIN and isKongWin:
					quantity *= 2
					result[11] = 1
				isCanWin = True
			else:
				# 平胡 --不可能是字一色，字一色必须是碰碰胡
				quantity += 1
				result[0] = 1
				# 清一色/字一色
				if colorType == const.SAME_SUIT:
					# 清一色
					quantity += 4
					result[8] = 1
					# 杠开
					if win_op == const.OP_DRAW_WIN and isKongWin:
						quantity *= 2
						result[11] = 1
					isCanWin = True
				elif win_op == const.OP_DRAW_WIN:  # 平胡 非 清一色/字一色只能自摸
					# 杠开
					if win_op == const.OP_DRAW_WIN and isKongWin:
						quantity *= 2
						result[11] = 1
					isCanWin = True
				elif win_op == const.OP_KONG_WIN:
					isCanWin = True
		elif colorType == const.SAME_HONOR:
			quantity += 5
			result[10] = 1
			isCanWin = True
		return isCanWin, quantity, result

	def cal_score(self, idx, fromIdx, aid, score):
		if aid == const.OP_EXPOSED_KONG:
			if self.game_mode == 1 and (self.dealer_idx == idx or self.dealer_idx == fromIdx):  # 庄家翻倍模式
				self.players_list[fromIdx].add_kong_score(-2 * score)
				self.players_list[idx].add_kong_score(2 * score)
			else:
				self.players_list[fromIdx].add_kong_score(-score)
				self.players_list[idx].add_kong_score(score)
		elif aid == const.OP_CONTINUE_KONG:
			if self.game_mode == 1 and (self.dealer_idx == idx or self.dealer_idx == fromIdx):  # 庄家翻倍模式
				self.players_list[fromIdx].add_kong_score(-2 * score)
				self.players_list[idx].add_kong_score(2 * score)
			else:
				self.players_list[fromIdx].add_kong_score(-score)
				self.players_list[idx].add_kong_score(score)
		elif aid == const.OP_CONCEALED_KONG:
			if self.game_mode == 1:
				if self.dealer_idx == idx:
					for i, p in enumerate(self.players_list):
						if p is not None:
							if i == idx:
								p.add_kong_score(score * 2 * (self.player_num - 1))
							else:
								p.add_kong_score(-score * 2)
				else:
					for i, p in enumerate(self.players_list):
						if p is not None:
							if i == idx:
								p.add_kong_score(score * self.player_num)
							elif i == self.dealer_idx:
								p.add_kong_score(-score * 2)
							else:
								p.add_kong_score(-score)
			else:
				for i, p in enumerate(self.players_list):
					if p is not None:
						if i == idx:
							p.add_kong_score(score * (self.player_num - 1))
						else:
							p.add_kong_score(-score)
		elif aid == const.OP_DRAW_WIN:
			if self.game_mode == 1:
				if self.dealer_idx == idx:
					realLose = 0
					for i, p in enumerate(self.players_list):
						if p is not None and i != idx:
							realLose += p.add_score(-score * 2)
					self.players_list[idx].add_score(-realLose)
				else:
					realLose = 0
					for i, p in enumerate(self.players_list):
						if p is not None and i != idx:
							if i == self.dealer_idx:
								realLose += p.add_score(-score * 2)
							else:
								realLose += p.add_score(-score)
					self.players_list[idx].add_score(-realLose)
			else:
				realLose = 0
				for i, p in enumerate(self.players_list):
					if p is not None and i != idx:
						realLose += p.add_score(-score)
				self.players_list[idx].add_score(-realLose)
		elif aid == const.OP_KONG_WIN:
			realLose = 0
			if self.game_mode == 1 and (idx == self.dealer_idx or fromIdx == self.dealer_idx):
				realLose += self.players_list[fromIdx].add_score(-score * (self.player_num - 1) * 2)
				self.players_list[idx].add_score(-realLose)
			else:
				realLose += self.players_list[fromIdx].add_score(-score * (self.player_num - 1))
				self.players_list[idx].add_score(-realLose)
			# 返还杠分
			kong_info = self.players_list[fromIdx].kong_record_list[-1]
			if kong_info[0] == const.OP_CONTINUE_KONG:
				continue_kong_from = self.getContinueKongFrom(self.players_list[fromIdx].op_r, kong_info[3][0])
				del self.players_list[fromIdx].kong_record_list[-1]
				self.cal_score(continue_kong_from, kong_info[1], kong_info[0], 1)
			else:
				del self.players_list[fromIdx].kong_record_list[-1]
				self.cal_score(kong_info[2], kong_info[1], kong_info[0], 1)
		elif aid == const.OP_GIVE_WIN:
			realLose = 0
			if self.game_mode == 1 and (idx == self.dealer_idx or fromIdx == self.dealer_idx):
				realLose += self.players_list[fromIdx].add_score(-score * 2)
				self.players_list[idx].add_score(-realLose)
			else:
				realLose += self.players_list[fromIdx].add_score(-score)
				self.players_list[idx].add_score(-realLose)
		elif aid == const.OP_WREATH_WIN:
			pass
