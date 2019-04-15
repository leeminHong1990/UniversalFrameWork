# -*- coding: utf-8 -*-
import copy
import json
import random
import time
from datetime import datetime

import const
import const_dtlgfmj
import switch
import utility
import utility_dtlgfmj
from KBEDebug import *
from Room import Room


class Room_DTLGFMJ(Room):
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
		# 上把庄家
		self.last_dealer_idx = -1
		# 连庄次数
		self.current_serial_dealer = 0

	def _reset(self):
		self.state = const.ROOM_WAITING
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
		self.last_dealer_idx = -1
		self.current_serial_dealer = 0
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
		p = self.players_list[idx]
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

		if self.can_passive_hint(p):
			DEBUG_MSG("{} idx {} can_passive_hint ERROR".format(self.prefixLogStr, idx))
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return


		if aid == const.OP_DISCARD and self.can_discard(p, tile):
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

			# 中途退出结算 杠算分
			if self.state != const.ROOM_WAITING:
				self.settlement()

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
		# try:
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
			self.rollKingTile(prefabKingTiles)  # 财神
			beginTilesList = [copy.deepcopy(p.tiles) for i, p in enumerate(self.players_list)]
			self.tidy()  # 整理
			self.beginRound(True)  # 第一张牌优先抓，后开始游戏
			beginTilesList[self.current_idx].append(self.players_list[self.current_idx].last_draw)
			# 庄家亮风
			if self.can_passive_hint(self.players_list[self.current_idx]):
				self.players_list[self.current_idx].passiveHint(True)
			self.startGame(beginTilesList)

		if switch.DEBUG_BASE == 0:
			begin([], [[] for i in range(self.player_num)], [])
		elif switch.DEBUG_BASE == 1:  # 开发模式 除去不必要的通信时间 更接近 真实环境
			# prefabKingTiles = [71]
			# prefabHandTiles = [[1,2,3,4,5,6,7,9,9,9,77,76,77], [73,5,5,5,6,6,6,74,74,74,72,72,73],[35,35,35,36,36,36,37,37,37,38,38,38,71],[55,55,55,56,56,56,57,57,57,58,58,58,77]]
			# prefabTopList = [7,73,32,33,72,72]
			prefabKingTiles = []
			prefabHandTiles = [[], [],[],[]]
			prefabTopList = []
			begin(prefabKingTiles, prefabHandTiles, prefabTopList)
		else:
			def callback(data):
				DEBUG_MSG("{} data:{}".format(self.prefixLogStr, data))
				if data is None:
					begin([], [[] for i in range(self.player_num)], [])
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
			utility.getDebugPrefab(self.origin_players_list[0].accountName, callback, const_dtlgfmj.DEBUG_JSON_NAME)
		# except:
		# 	err, msg, stack = sys.exc_info()
		# 	DEBUG_MSG("{} paySuccessCbk error; exc_info: {} ,{}".format(self.prefixLogStr, err, msg))
		# 	DEBUG_MSG("{} consume failed! users: {}".format(self.prefixLogStr,[p.userId for p in self.origin_players_list if p]))


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
				DEBUG_MSG("{} start begin tiles:{} tiles:{}, hint_list:{}".format(self.prefixLogStr, beginTilesList[i], p.tiles, p.hint_list))
				p.startGame({
					'dealer_idx': self.dealer_idx,
					'beginTilesList': beginTilesList[i],
					'tiles':p.tiles,
					'hint_list': [p.hint_list for p in self.players_list],
					'wreathsList': self.wreathsList,
					'kingTiles': self.kingTiles,
					'prevailing_wind': self.prevailing_wind,
					'windsList': self.windsList,
					'diceList': diceList,
					'dealer_tiles_num': len(self.players_list[self.dealer_idx].tiles),
					'curRound': self.current_round,
				})
		self.begin_record_game(beginTilesList, diceList)

	@property
	def leftTiles(self):
		return self.lucky_num + const_dtlgfmj.LEFT_TILES

	def cutAfterKong(self):
		if not self.can_cut_after_kong():
			return
		if len(self.tiles) <= self.leftTiles:
			self.drawEnd()
		elif len(self.tiles) > self.leftTiles + 1:
			player = self.players_list[self.current_idx]
			ti = self.tiles[0]
			self.tiles = self.tiles[1:]
			player.cutTile(ti)

	def beginRound(self, is_first=False):
		if len(self.tiles) <= self.leftTiles:
			self.drawEnd()
			return
		ti = self.tiles[0]
		self.tiles = self.tiles[1:]
		DEBUG_MSG("beginRound tile:{0} leftNum:{1}".format(ti, len(self.tiles)))

		p = self.players_list[self.current_idx]
		if len(p.op_r) > 1 and len(p.hint_list)>0 and ti in const_dtlgfmj.HINT_TILES and ti not in self.kingTiles:
			p.hintTile(ti)
		else:
			p.drawTile(ti, is_first)

	def drawEnd(self):
		DEBUG_MSG("{} drawEnd.".format(self.prefixLogStr))
		""" 臭庄 """
		lucky_tiles = self.drawLuckyTile()
		self.cal_lucky_tile_score(lucky_tiles, -1)
		# 流局本局不算分
		for i,p in enumerate(self.players_list):
			if p is not None:
				p.draw_end()
		self.settlement()
		info = dict()
		info['win_op'] = -1
		info['win_idx'] = -1
		info['lucky_tiles'] = lucky_tiles
		info['result_list'] = []
		info['finalTile'] = 0
		info['from_idx'] = -1
		info['up_tiles_list'] = [p.upTiles for i, p in enumerate(self.players_list) if p is not None]
		info['dealer_idx'] = self.dealer_idx
		info['serial_dealer'] = self.current_serial_dealer
		info['hint_tiles'] = []
		DEBUG_MSG("{} drawEnd INFO:{}".format(self.prefixLogStr, info))
		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def winGame(self, idx, op, finalTile, from_idx, quantity, result):
		""" 座位号为idx的玩家胡牌 """
		temp_dealer_idx = self.dealer_idx

		if idx == self.dealer_idx: # 庄家胡
			self.dealer_idx = idx
			if self.last_dealer_idx == self.dealer_idx: # 上把也是庄家胡
				self.current_serial_dealer += 1
			if self.current_serial_dealer >= self.max_serial_dealer:
				self.dealer_idx = (self.dealer_idx + 1) % self.player_num
		else:
			self.dealer_idx = (self.dealer_idx + 1) % self.player_num
			self.current_serial_dealer = 0

		# 上把庄家
		self.last_dealer_idx = temp_dealer_idx

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
		info['up_tiles_list'] = [p.upTiles for i, p in enumerate(self.players_list) if p is not None]
		info['from_idx'] = from_idx
		info['dealer_idx'] = temp_dealer_idx
		info['serial_dealer'] = self.current_serial_dealer
		info['hint_tiles'] = self.players_list[idx].hint_list
		# 连庄已满
		if self.current_serial_dealer >= self.max_serial_dealer:
			self.current_serial_dealer = 0
		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def confirmOperation(self, avt_mb, aid, tile_list):
		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p == avt_mb:
				idx = i
		DEBUG_MSG("{} idx:{} confirmOperation aid:{} tile_list:{}".format(self.prefixLogStr, idx, aid, tile_list))
		""" 被轮询的玩家确认了某个操作 """
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < self.dismissRoomSecends:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("{} idx:{} confirmOperation aid:{} dismiss_room_ts:{}".format(self.prefixLogStr, idx, aid, self.dismiss_room_ts))
			# return

		# 玩家是否可以操作
		DEBUG_MSG("{} idx:{} wait_op_info_list:{}".format(self.prefixLogStr, idx, self.wait_op_info_list))
		if len(self.wait_op_info_list) <= 0 or sum([1 for waitOpDict in self.wait_op_info_list if (waitOpDict["idx"] == idx and waitOpDict["state"] == const.OP_STATE_WAIT)]) <= 0:
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return
		# 提交 玩家结果
		for waitOpDict in self.wait_op_info_list:
			if waitOpDict["idx"] == idx:
				if waitOpDict["aid"] == const.OP_CHOW and aid == const.OP_CHOW and waitOpDict["tileList"][0] == tile_list[0] and self.can_chow_list(waitOpDict["idx"], tile_list):
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
			self.forbidTiles()
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
					lastAid = temp_wait_op_info_list[0]["aid"]
					formAid = temp_wait_op_info_list[0]["from_aid"]
					if formAid == const_dtlgfmj.OP_SHOW_HINT:
						self.players_list[self.last_player_idx].addHintTiles(temp_wait_op_info_list[0]["tileList"])

					if lastAid == const.OP_WREATH_WIN:
						self.current_idx = self.last_player_idx
					elif lastAid == const.OP_KONG_WIN:
						# *********没人抢杠胡 杠要算分？***********
						self.current_idx = self.last_player_idx
						if self.can_cut_after_kong():
							self.cutAfterKong()
					elif formAid == const_dtlgfmj.OP_SHOW_HINT:
						# 玩家放弃 亮风操作
						self.current_idx = self.last_player_idx
					else:
						DEBUG_MSG("{} confirmOpDict=={}".format(self.prefixLogStr, confirmOpDict))
						self.current_idx = self.nextIdx
					self.beginRound()
			else:
				lastAid = temp_wait_op_info_list[0]["aid"]
				formAid = temp_wait_op_info_list[0]["from_aid"]
				if formAid == const_dtlgfmj.OP_SHOW_HINT:
					self.players_list[self.last_player_idx].addHintTiles(temp_wait_op_info_list[0]["tileList"])

				if lastAid == const.OP_WREATH_WIN:
					self.current_idx = self.last_player_idx
				elif lastAid == const.OP_KONG_WIN:
					# *********没人抢杠胡 杠要算分？***********
					self.current_idx = self.last_player_idx
				elif formAid == const_dtlgfmj.OP_SHOW_HINT:
					# 玩家放弃 亮风操作
					self.current_idx = self.last_player_idx
				else:
					self.current_idx = self.nextIdx
				self.beginRound()

	def getConfirmOverInfo(self):
		for wait_op in self.wait_op_info_list:
			waitState = wait_op["state"]
			if waitState == const.OP_STATE_PASS:
				continue
			elif waitState == const.OP_STATE_WAIT:  # 需等待其他玩家操作
				return False, {}
			elif waitState == const.OP_STATE_SURE:  # 有玩家可以操作
				return True, wait_op
		return True, {}  # 所有玩家选择放弃

	def forbidTiles(self):
		DEBUG_MSG("forbidTiles wait_op_info_list:{}".format(self.wait_op_info_list))
		for wait_op in self.wait_op_info_list:
			waitState = wait_op["state"]
			if waitState == const.OP_STATE_PASS:
				if wait_op["aid"] == const.OP_GIVE_WIN or wait_op["aid"] == const.OP_KONG_WIN:
					DEBUG_MSG("forbidTiles idx:{} forbid:{}".format(wait_op["idx"], wait_op["tileList"]))
					self.players_list[wait_op["idx"]].forbid_history.extend(wait_op["tileList"])
			else:
				break


	def waitForOperation(self, idx, aid, tile, nextIdx=-1):  # aid抢杠 杠花没人可胡 nextIdx还是自己
		notifyOpList = self.getNotifyOpList(idx, aid, tile)
		for n in notifyOpList:
			DEBUG_MSG("{} waitForOperation==>{}".format(self.prefixLogStr, n))
		if sum([len(x) for x in notifyOpList]) > 0:
			for i, p in enumerate(self.players_list):
				if p is not None and len(notifyOpList[i]) > 0:
					waitAidList = [notifyOp["aid"] for notifyOp in notifyOpList[i]]
					p.waitForOperation(waitAidList, [tile, ])
		else:
			DEBUG_MSG("nobody waitForOperation.idx:{},aid:{},tile:{}".format(idx, aid, tile))
			if aid == const_dtlgfmj.OP_SHOW_HINT:
				self.players_list[idx].addHintTiles([tile])
				# 继续摸牌
				def delay_callback():
					self.beginRound()
				self.add_timer(const_dtlgfmj.HINT_DELAY, delay_callback)
			else:
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

		self.end_record_game(info)
		self.addAvatarGameRound()

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

	def begin_record_game(self, beginTilesList, dice_list):
		DEBUG_MSG("{} begin record game".format(self.prefixLogStr))
		self.begin_record_room()
		init_tiles = [None] * len(self.origin_players_list)
		hint_tiles = [None] * len(self.origin_players_list)
		player_id_list = []
		for p in self.origin_players_list:
			init_tiles[p.idx] = p.tiles[:]
			hint_tiles[p.idx] = p.hint_list[:]
			player_id_list.append(p.userId)

		KBEngine.globalData['GameWorld'].begin_record_room(self, self.roomIDC, {
			'init_info': self.get_init_client_dict(),
			'dice_list': copy.deepcopy(dice_list),
			'player_id_list': player_id_list,
			'beginTilesList': beginTilesList,
			'init_tiles': init_tiles,
			'hint_tiles': hint_tiles,
			'prevailing_wind': self.prevailing_wind,
			'kingTiles': self.kingTiles[:],
			'wreathsList': self.wreathsList[:],
			'start_time': time.time(),
			'roomId': self.roomIDC,
			'clubId': self.club_id,
			'dealer_tiles_num': len(self.players_list[self.dealer_idx].tiles)
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
			'lucky_num'			: self.lucky_num,
			'hand_prepare'		: self.hand_prepare,
			'current_serial_dealer': self.current_serial_dealer,
			'max_serial_dealer'	: self.max_serial_dealer,
			'score_mode'		: self.score_mode,
			'seven_pair'		: self.seven_pair,
			'base_score'		: self.base_score,
			'kong_mode'			: self.kong_mode,
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
			'current_round'	: self.current_round,
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

		player = self.players_list[idx]
		return {
			'gameType': self.gameTypeC,
			'init_info': self.get_init_client_dict(),
			'curPlayerSitNum': self.current_idx,
			'room_state': const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
			'lastDiscardTile': -1 if not self.all_discard_tiles else self.all_discard_tiles[-1],
			'lastDrawTile': player.last_draw,
			'last_op': player.last_op,
			'lastDiscardTileFrom': self.last_player_idx,
			'kingTiles': self.kingTiles,
			'waitAidList': waitAidList,
			'leftTileNum': len(self.tiles),
			'applyCloseFrom': self.dismiss_room_from,
			'applyCloseLeftTime': dismiss_left_time,
			'applyCloseStateList': self.dismiss_room_state_list,
			'player_advance_info_list': [p.get_reconnect_client_dict(userId) for p in self.players_list if p is not None],
			'prevailing_wind': self.prevailing_wind,
			'hint_state': 1 if len(player.op_r) <= 0 or (len(player.op_r) == 1 and player.op_r[0][0] == const.OP_DRAW) and player.active_hint_state == 1 else 0,
			'hint_list': [p.hint_list for p in self.players_list],
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
					p.tiles = prefabHandTiles[i] if len(prefabHandTiles[i]) <= const_dtlgfmj.INIT_TILE_NUM else \
					prefabHandTiles[i][0:const_dtlgfmj.INIT_TILE_NUM]
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
			for i in range(const_dtlgfmj.INIT_TILE_NUM):
				num = 0
				for j in range(self.player_num):
					if len(self.players_list[j].tiles) >= const_dtlgfmj.INIT_TILE_NUM:
						continue
					self.players_list[j].tiles.append(self.tiles[num])
					num += 1
				self.tiles = self.tiles[num:]

			newTiles = topList
			newTiles.extend(self.tiles)
			self.tiles = newTiles
		else:
			for i in range(const_dtlgfmj.INIT_TILE_NUM):
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
			while len(self.players_list[i].tiles) < const_dtlgfmj.INIT_TILE_NUM:
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

	def rollKingTile(self, prefabKingTiles = []):
		""" 财神 """
		self.kingTiles = []
		if prefabKingTiles is not None and len(prefabKingTiles) > 0:
			self.kingTiles = prefabKingTiles[0:self.king_num]

			roll_list = list(const.CHARACTER) + list(const.BAMBOO) + list(const.DOT)
			roll_list += list(const.WINDS) + list(const.DRAGONS)

			for i in range(self.king_num - len(prefabKingTiles)):
				if len(roll_list) <= 0:
					return
				rand_idx = random.randint(0, len(roll_list)-1)
				val = roll_list[rand_idx]
				self.kingTiles.append(val)
				roll_list.pop(rand_idx)
		else:
			roll_list = list(const.CHARACTER) + list(const.BAMBOO) + list(const.DOT)
			roll_list += list(const.WINDS) + list(const.DRAGONS)

			for i in range(self.king_num):
				if len(roll_list) <= 0:
					return
				rand_idx = random.randint(0, len(roll_list)-1)
				val = roll_list[rand_idx]
				self.kingTiles.append(val)
				roll_list.pop(rand_idx)


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
		return []
		# luckyTileList = []
		# for i in range(self.lucky_num):
		# 	if len(self.tiles) > 0:
		# 		luckyTileList.append(self.tiles[0])
		# 		self.tiles = self.tiles[1:]
		# return luckyTileList

	def hint(self, avt_mb, hintKingNum):
		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p.userId == avt_mb.userId:
				idx = i
				break
		if idx < 0:
			return

		p = self.players_list[idx]
		if hintKingNum < 0:
			p.active_hint_state = 0
		else:
			if self.can_active_hint(idx, hintKingNum):
				p.activeHint(hintKingNum)

	def broadcastHint(self, idx, handTiles, hintTiles):
		"""
		将亮牌后的牌广播给所有人, 包括当前操作的玩家
		:param idx: 玩家座位号
		:param handTiles: 亮牌后手牌
		:param hintTiles: 亮牌
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				if i == idx:
					p.postHintOperationDTLGFMJ(idx, handTiles, hintTiles)
				else:
					p.postHintOperationDTLGFMJ(idx, [0]*len(handTiles), hintTiles)


	def broadcastAddHint(self, idx, tiles):
		"""
		将亮牌后的牌广播给所有人, 包括当前操作的玩家
		:param idx: 玩家座位号
		:param tiles: 亮牌
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.postAddHintDTLGFMJ(idx, tiles)

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
		return

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
		return False

	def can_discard(self, p, t):
		if t not in p.tiles:
			return False
		# 单张 非财神风字牌，必须先出
		wd_list = list(filter(lambda x:True if x in const_dtlgfmj.HINT_TILES and x not in self.kingTiles else False, p.tiles))
		wd_dict = utility.getTile2NumDict(wd_list)

		d_list = [k for k in wd_dict if wd_dict[k] == 1]
		if 0 < len(d_list):
			return t in wd_dict
		return len(d_list) <= 0 or t in d_list

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
		# if t in self.kingTiles:
		# 	return False
		return sum([1 for i in tiles if i == t]) >= 2

	def can_exposed_kong(self, tiles, t):
		""" 能明杠 """
		# if t in self.kingTiles:
		# 	return False
		return tiles.count(t) == 3

	def can_continue_kong(self, player, t):
		""" 能够风险杠 """
		# if t in self.kingTiles:
		# 	return False
		for op in player.op_r:
			if op[0] == const.OP_PONG and op[1][0] == t:
				return True
		return False

	def can_concealed_kong(self, tiles, t):
		""" 能暗杠 """
		# if t in self.kingTiles:
		# 	return False
		return tiles.count(t) == 4

	def can_kong_wreath(self, tiles, t):
		if t in tiles and (t in const.SEASON or t in const.FLOWER):
			return True
		return False

	def can_wreath_win(self, wreaths):
		if len(wreaths) == len(const.SEASON) + len(const.FLOWER):
			return True
		return False

	# 玩家是否可以主动亮牌
	def can_active_hint(self, idx, kingNum):
		p = self.players_list[idx]
		if p.active_hint_state == 0:
			return False
		# if len(p.op_r) == 1 and p.op_r[0][0] == const.OP_DRAW and self.current_idx == idx:
		if sum([1 for op in p.op_r if op[0] == const.OP_DISCARD or op[0] == const_dtlgfmj.OP_ADD_HINT or op[0] == const_dtlgfmj.OP_SHOW_HINT]) <= 0 \
				and self.current_idx == idx:
			n_hintNum = sum([1 for t in p.tiles if t in const_dtlgfmj.HINT_TILES and t not in self.kingTiles])
			k_hintNum = sum([1 for t in p.tiles if t in const_dtlgfmj.HINT_TILES and t in self.kingTiles])
			return  (0 < kingNum <= k_hintNum and 0 < n_hintNum < 3 and n_hintNum + kingNum >= 3) or \
					(kingNum == 0 and n_hintNum >= 3)
		return False

	# 是否可以被动亮牌
	def can_passive_hint(self, p):
		# if len(p.op_r) == 1 and p.op_r[0][0] == const.OP_DRAW:
		if sum([1 for op in p.op_r if op[0] == const.OP_DISCARD or op[0] == const_dtlgfmj.OP_ADD_HINT or op[0] == const_dtlgfmj.OP_SHOW_HINT]) <= 0:
			if p.op_r[-1][0] == const.OP_DRAW:
				can_win, _, _ = self.can_win(p.tiles, p.last_draw, const.OP_DRAW_WIN, self.players_list.index(p))
				return sum([1 for t in p.tiles if t in const_dtlgfmj.HINT_TILES and t not in self.kingTiles]) >= 3 \
					   and not can_win
			else:
				return sum([1 for t in p.tiles if t in const_dtlgfmj.HINT_TILES and t not in self.kingTiles]) >= 3
		return False


	def getNotifyOpList(self, idx, aid, tile):
		# notifyOpList 和 self.wait_op_info_list 必须同时操作
		# 数据结构：问询玩家，操作玩家，牌，操作类型，得分，结果，状态
		notifyOpList = [[] for i in range(self.player_num)]
		self.wait_op_info_list = []
		# 胡
		if aid == const.OP_KONG_WREATH and self.can_wreath_win(self.players_list[idx].wreaths):  # 8花胡
			opDict = {"idx": idx, "from": idx, "tileList": [tile, ], "aid": const.OP_WREATH_WIN, "score": 0,
					  "result": [], "state": const.OP_STATE_WAIT, "from_aid":aid}
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
		elif aid == const.OP_DISCARD or aid == const_dtlgfmj.OP_SHOW_HINT:
			# 胡(放炮胡)
			wait_for_win_list = self.getGiveWinList(idx, aid, tile)
			self.wait_op_info_list.extend(wait_for_win_list)
			for i in range(len(wait_for_win_list)):
				dic = wait_for_win_list[i]
				notifyOpList[dic["idx"]].append(dic)
			# 杠 碰
			for i, p in enumerate(self.players_list):
				if p and i != idx:
					if self.can_exposed_kong(p.tiles, tile):
						opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_EXPOSED_KONG, "score": 0,
								  "result": [], "state": const.OP_STATE_WAIT, "from_aid":aid}
						self.wait_op_info_list.append(opDict)
						notifyOpList[i].append(opDict)
					if self.can_pong(p.tiles, tile):
						opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_PONG, "score": 0,
								  "result": [], "state": const.OP_STATE_WAIT, "from_aid":aid}
						self.wait_op_info_list.append(opDict)
						notifyOpList[i].append(opDict)
			# 吃
			nextIdx = self.nextIdx
			if self.can_chow(self.players_list[nextIdx].tiles, tile):
				opDict = {"idx": nextIdx, "from": idx, "tileList": [tile, ], "aid": const.OP_CHOW, "score": 0,
						  "result": [], "state": const.OP_STATE_WAIT, "from_aid":aid}
				self.wait_op_info_list.append(opDict)
				notifyOpList[nextIdx].append(opDict)
		return notifyOpList

	def getExposedKongWinList(self, idx, tile):
		wait_for_win_list = []
		for i, p in enumerate(self.players_list):
			if p is not None and i != idx:
				# 抢直杠
				tryTiles = list(p.tiles)
				tryTiles.append(tile)
				tryTiles = sorted(tryTiles)
				isWin, score, result = self.can_win(tryTiles, tile, const.OP_KONG_WIN, i)
				if isWin:
					wait_for_win_list.append(
						{"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_KONG_WIN, "score": score,
						 "result": result, "state": const.OP_STATE_WAIT, "from_aid":const.OP_EXPOSED_KONG})
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
				wait_for_win_list.append({"idx": ask_idx, "from": idx, "tileList": [tile, ], "aid": const.OP_KONG_WIN, "score": score,"result": result, "state": const.OP_STATE_WAIT, "from_aid":const.OP_CONTINUE_KONG})
		return wait_for_win_list

	# 放炮胡 玩家列表
	def getGiveWinList(self, idx, aid, tile):
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
				wait_for_win_list.append({"idx": ask_idx, "from": idx, "tileList": [tile, ], "aid": const.OP_GIVE_WIN, "score": score,"result": result, "state": const.OP_STATE_WAIT, "from_aid":aid})
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
		# 平胡 一条龙 清一色 7对
		result = [0] * 4  # 胡牌类型

		if win_op == const.OP_GIVE_WIN and self.game_mode == const_dtlgfmj.DRAW_MODE:
			return False, 0, result

		if (win_op == const.OP_GIVE_WIN or win_op == const.OP_KONG_WIN) and finalTile in self.players_list[idx].forbid_history:
			return False, 0, result

		if len(handTiles) % 3 != 2:
			return False, 0, result

		score = 1
		p = self.players_list[idx]

		handTilesButKing, kings = utility_dtlgfmj.classifyKings(handTiles, self.kingTiles)
		kingNum = len(kings)
		if win_op != const.OP_DRAW_WIN and finalTile in self.kingTiles:
			handTilesButKing.append(finalTile)
			kingNum -= 1

		if self.seven_pair and utility_dtlgfmj.check_7Pair(handTilesButKing, kingNum):
			result[3] = 1
			score += 5
			# 清一色
			if utility_dtlgfmj.check_uniform(handTilesButKing, p.upTiles):
				result[2] = 1
				score += 5
			return True, score, result
		elif utility.winWith3N2NeedKing(handTilesButKing) <= kingNum:
			if utility_dtlgfmj.check_uniform(handTilesButKing, p.upTiles):
				result[2] = 1
				score += 5
			if utility_dtlgfmj.checkIsOneDragon(handTilesButKing, kingNum, self.kingTiles):
				result[1] = 1
				score += 5
			return True, score, result
		return False, 0, []

	def cal_score(self, idx, fromIdx, aid, score):
		if aid == const.OP_EXPOSED_KONG:
			if self.kong_mode == 1:
				self.players_list[idx].add_score(score)
				DEBUG_MSG("{} OP_EXPOSED_KONG idx {} score {}".format(self.prefixLogStr, idx, score * 3))
				self.players_list[fromIdx].add_score(-score)
				DEBUG_MSG("{} OP_EXPOSED_KONG idx {} score {}".format(self.prefixLogStr, fromIdx, -score * 3))
		elif aid == const.OP_CONTINUE_KONG:
			if self.kong_mode == 1:
				self.players_list[idx].add_score(score)
				DEBUG_MSG("{} OP_CONTINUE_KONG idx {} score {}".format(self.prefixLogStr, idx, score * 3))
				self.players_list[fromIdx].add_score(-score)
				DEBUG_MSG("{} OP_CONTINUE_KONG idx {} score {}".format(self.prefixLogStr, fromIdx, -score * 3))
		elif aid == const.OP_CONCEALED_KONG:
			if self.kong_mode == 1:
				for i, p in enumerate(self.players_list):
					if i == idx:
						p.add_score(score * 3)
						DEBUG_MSG("{} OP_CONCEALED_KONG idx {} score {}".format(self.prefixLogStr, i, score * 3))
					else:
						p.add_score(-score)
						DEBUG_MSG("{} OP_CONCEALED_KONG idx {} score {}".format(self.prefixLogStr, i, -score))
		elif aid == const.OP_DRAW_WIN:
			sum_score = (score +  len(self.players_list[idx].hint_list)) * 2 * self.base_score
			for i, p in enumerate(self.players_list):
				if i == idx:
					p.add_score(sum_score * 3)
					DEBUG_MSG("{} OP_DRAW_WIN idx {} score {}".format(self.prefixLogStr, i, sum_score * 3))
				else:
					p.add_score(-sum_score)
					DEBUG_MSG("{} OP_DRAW_WIN idx {} score {}".format(self.prefixLogStr, i, -sum_score))
			# 连庄分数
			for i, p in enumerate(self.players_list):
				if i == idx:
					p.add_score(self.current_serial_dealer * 3)
					DEBUG_MSG("{} SERIAL_DEALER idx {} score {}".format(self.prefixLogStr, i, self.current_serial_dealer * 3))
				else:
					p.add_score(-self.current_serial_dealer)
					DEBUG_MSG("{} SERIAL_DEALER idx {} score {}".format(self.prefixLogStr, i, -self.current_serial_dealer))
		elif aid == const.OP_KONG_WIN:
			sum_score = (score + len(self.players_list[idx].hint_list)) * self.base_score
			if self.score_mode == const_dtlgfmj.GIVE_AA_MODE:
				for i, p in enumerate(self.players_list):
					if i == idx:
						p.add_score(sum_score * 3)
						DEBUG_MSG("{} OP_KONG_WIN idx {} score {}".format(self.prefixLogStr, i, sum_score * 3))
					else:
						p.add_score(-sum_score)
						DEBUG_MSG("{} OP_KONG_WIN idx {} score {}".format(self.prefixLogStr, i, -sum_score))
			else:
				self.players_list[idx].add_score(sum_score)
				self.players_list[fromIdx].add_score(-sum_score)
				DEBUG_MSG("{} OP_KONG_WIN idx {} score {}".format(self.prefixLogStr, idx, sum_score))
				DEBUG_MSG("{} OP_KONG_WIN idx {} score {}".format(self.prefixLogStr, fromIdx, -sum_score))
			# 抢杠胡的杠 不算分， 这里返还杠 分
			DEBUG_MSG("return back kong score.")
			if len(self.players_list[fromIdx].op_r) > 0:
				from_op = self.players_list[fromIdx].op_r[-1]
				if from_op[0] == const.OP_EXPOSED_KONG:
					self.cal_score(from_op[2], fromIdx, const.OP_EXPOSED_KONG, 1)
				elif from_op[0] == const.OP_CONTINUE_KONG:
					kong_form_dix = self.getContinueKongFrom(self.players_list[fromIdx].op_r, from_op[1][0])
					kong_form_dix = kong_form_dix if kong_form_dix >= 0 else fromIdx
					self.cal_score(kong_form_dix, fromIdx, const.OP_CONTINUE_KONG, 1)

			# 连庄分数
			self.players_list[idx].add_score(self.current_serial_dealer)
			DEBUG_MSG("{} SERIAL_DEALER idx {} score {}".format(self.prefixLogStr, idx, self.current_serial_dealer))
			self.players_list[fromIdx].add_score(-self.current_serial_dealer)
			DEBUG_MSG("{} SERIAL_DEALER idx {} score {}".format(self.prefixLogStr, fromIdx, -self.current_serial_dealer))
		elif aid == const.OP_GIVE_WIN:
			sum_score = (score + len(self.players_list[idx].hint_list)) * self.base_score
			if self.score_mode == const_dtlgfmj.GIVE_AA_MODE:
				for i, p in enumerate(self.players_list):
					if i == idx:
						p.add_score(sum_score * 3)
						DEBUG_MSG("{} OP_GIVE_WIN idx {} score {}".format(self.prefixLogStr, i, sum_score * 3))
					else:
						p.add_score(-sum_score)
						DEBUG_MSG("{} OP_GIVE_WIN idx {} score {}".format(self.prefixLogStr, i, -sum_score))
			else:
				self.players_list[idx].add_score(sum_score)
				self.players_list[fromIdx].add_score(-sum_score)
				DEBUG_MSG("{} OP_GIVE_WIN idx {} score {}".format(self.prefixLogStr, idx, sum_score))
				DEBUG_MSG("{} OP_GIVE_WIN idx {} score {}".format(self.prefixLogStr, fromIdx, -sum_score))

			# 连庄分数
			self.players_list[idx].add_score(self.current_serial_dealer)
			DEBUG_MSG("{} SERIAL_DEALER idx {} score {}".format(self.prefixLogStr, idx, self.current_serial_dealer ))
			self.players_list[fromIdx].add_score(-self.current_serial_dealer)
			DEBUG_MSG("{} SERIAL_DEALER idx {} score {}".format(self.prefixLogStr, fromIdx, -self.current_serial_dealer))
		elif aid == const.OP_WREATH_WIN:
			pass
