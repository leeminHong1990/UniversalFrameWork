# -*- coding: utf-8 -*-
import copy
import json
import random
import time
from datetime import datetime

import const
import const_tykddmj
import switch
import utility
import utility_tykddmj
from Functor import Functor
from KBEDebug import *
from Room import Room

class Room_TYKDDMJ(Room):

	def __init__(self):
		Room.__init__(self)

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
		# 一局游戏结束后, 玩家准备界面等待玩家确认timer
		self._next_game_timer = None

		#财神(多个)
		self.kingTiles = []
		#圈风
		self.prevailing_wind = const.WIND_EAST
		#一圈中玩家坐庄次数
		self.dealerNumList = [0] * self.player_num

		self.current_round = 0
		self.all_discard_tiles = []
		# 最后一位出牌的玩家
		self.last_player_idx = -1
		# 房间开局所有操作的记录(aid, src, des, tile)
		self.op_record = []
		# 房间开局操作的记录对应的记录id
		self.record_id = -1
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
		self.roomOpenTime = time.time()
		# 玩家操作列表
		self.wait_op_info_list = []
		# 杠后摸牌延时操作时的标志位，例如主要在延时中出现解散房间操作时需要拒绝操作，同上
		self.wait_force_delay_kong_draw = False

		# 过胡状态
		self.pass_win_list = [0] * self.player_num
		# 听牌所在位置
		self.tingTileList = [0] * self.player_num
		# 可胡牌列表,只记录能获胜的玩家的胡牌列表
		self.canWinTiles = []
		# 最终胡的点数分
		self.lastWinScore = 0
		# 是否是耗子吊将
		self.isMouseWin = False

	def _reset(self):
		self.state = const.ROOM_WAITING
		self.players_list = [None] * self.player_num
		self.discard_king_idx = -1
		self.dealer_idx = 0
		self.current_idx = 0
		self._poll_timer = None
		self._op_timer = None
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
		self.pass_win_list = [0] * self.player_num
		self.tingTileList = [0] * self.player_num
		self.canWinTiles = []
		self.lastWinScore = 0
		self.isMouseWin = False
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

	def apply_dismiss_room(self, avt_mb, agree_num, seconds):
		""" 游戏开始后玩家申请解散房间 """
		if self.dismiss_timer is not None:
			self.vote_dismiss_room(avt_mb, 1)
			return
		self.dismiss_room_ts = time.time()
		src = None
		for i, p in enumerate(self.players_list):
			if p.userId == avt_mb.userId:
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
			if p and p and p.userId != avt_mb.userId:
				p.req_dismiss_room(src.idx, agree_num, seconds)

	def vote_dismiss_room(self, avt_mb, vote):
		""" 某位玩家对申请解散房间的投票 """
		if self.wait_force_delay_kong_draw:
			return
		src = None
		for p in self.players_list:
			if p and p.userId == avt_mb.userId:
				src = p
				break

		self.dismiss_room_state_list[src.idx] = vote
		for p in self.players_list:
			if p and p:
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
			self.dismiss_room_state_list = [0,0,0,0]

	def client_prepare(self, avt_mb):
		DEBUG_MSG("{0} client_prepare userId:{1}".format(self.prefixLogStr, avt_mb.userId))
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

	def broadcastRoundEnd(self, info):
		# 广播胡牌或者流局导致的每轮结束信息, 包括算的扎码和当前轮的统计数据

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		self.state = const.ROOM_WAITING
		DEBUG_MSG(
			"room:{0},curround:{1} broadcastRoundEnd state:{2}".format(self.roomIDC, self.current_round, self.state))
		info['left_tiles'] = self.tiles
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]

		DEBUG_MSG("room:{0},curround:{1}=={2}".format(self.roomIDC, self.current_round, "&" * 30))
		DEBUG_MSG("room:{0},curround:{1} RoundEnd info:{2}".format(self.roomIDC, self.current_round, info))

		self.confirm_next_idx = []
		for p in self.players_list:
			if p:
				p.roundResult(info)

		self.addAvatarGameRound()

		self.end_record_game(info)


	def broadcastOperationTYKDDMJ(self, idx, aid, tile_list = None, buckle = 0):
		"""
		将操作广播给所有人, 包括当前操作的玩家
		:param idx: 当前操作玩家的座位号
		:param aid: 操作id
		:param tile_list: 出牌的list
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.postOperationTYKDDMJ(idx, aid, tile_list, buckle)

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


	# 扣房卡/钻石成功后开始游戏(不改动部分)
	def paySuccessCbk(self):
		DEBUG_MSG("room:{},curround:{} paySuccessCbk state:{}".format(self.roomIDC, self.current_round, self.state))
		# try:
		# 第一局时房间默认房主庄家, 之后谁上盘赢了谁是, 如果臭庄, 上一把玩家继续坐庄
		swap_list = [p.idx for p in self.players_list]
		if self.current_round == 0:
			self.origin_players_list = self.players_list[:]
			self.dealer_idx = self.confirm_next_idx[0]
			# self.swapSeat(swap_list)

		self.op_record = []
		# self.op_special_record = []
		self.state = const.ROOM_PLAYING
		self.current_round += 1
		self.all_discard_tiles = []

		for p in self.players_list:
			p.reset()

		self.current_idx = self.dealer_idx
		self.discard_king_idx = -1

		self.base.onRoomRoundChange(self.current_round)

		def begin(prefabKingTiles=None, prefabHandTiles=None, prefabTopList=None):
			self.setPrevailingWind()  					# 圈风
			self.setPlayerWind()  						# 位风
			self.initTiles()  							# 牌堆
			self.deal(prefabHandTiles, prefabTopList)  	# 发牌
			self.kongWreath()  							# 杠花
			self.addWreath()  							# 补花
			self.rollKingTile(prefabKingTiles)  		# 财神
			beginTilesList = [copy.deepcopy(p.tiles) for i, p in enumerate(self.players_list)]
			self.tidy()  								# 整理
			self.count_king_tile()						# 统计初始牌财神数量
			self.beginRound(True)  						# 第一张牌优先抓，后开始游戏
			beginTilesList[self.current_idx].append(self.players_list[self.current_idx].last_draw)
			self.startGame(beginTilesList, swap_list)

		if switch.DEBUG_BASE == 0:
			begin([], [[] for i in range(self.player_num)], [])
		elif switch.DEBUG_BASE == 1: # 开发模式 除去不必要的通信时间 更接近 真实环境
			prefabKingTiles = []
			prefabHandTiles = [
				[],
				[],
				[],
				[]
			]
			prefabTopList	= []
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

			utility.getDebugPrefab(self.origin_players_list[0].accountName, callback, const_tykddmj.DEBUG_JSON_NAME)
		# except:
		# 	err, msg, stack = sys.exc_info()
		# 	DEBUG_MSG("room:{},curround:{} paySuccessCbk error; exc_info: {} ,{}".format(self.roomIDC, self.current_round, err, msg))
		# 	DEBUG_MSG("room:{},curround:{} consume failed! users: {}".format(self.roomIDC, self.current_round, [p.userId for p in self.origin_players_list if p]))

	# 玩家开始游戏
	def startGame(self, beginTilesList, swap_list):
		self.wait_force_delay_kong_draw = False
		DEBUG_MSG("room:{},curround:{} start game swap_list:{}".format(self.roomIDC, self.current_round, swap_list))
		diceList = self.throwDice([self.dealer_idx])
		idx, num = self.getMaxDiceIdx(diceList)
		DEBUG_MSG("room:{},curround:{} start game info:{},{},{},{},{},{}".format(self.roomIDC, self.current_round, self.dealer_idx, self.wreathsList, self.kingTiles, self.prevailing_wind, self.windsList, diceList))
		for i,p in enumerate(self.players_list):
			if p and p:
				DEBUG_MSG("room:{},curround:{} start tiles:{}".format(self.roomIDC, self.current_round, p.tiles))
		for i,p in enumerate(self.players_list):
			if p and p:
				DEBUG_MSG("room:{},curround:{} start begin tiles:{}".format(self.roomIDC, self.current_round, beginTilesList[i]))
				#self.dealer_idx, beginTilesList[i], self.wreathsList, self.kingTiles, self.prevailing_wind, self.windsList, diceList, swap_list
				p.startGame({
					'dealer_idx' 		: self.dealer_idx,
					'beginTilesList' 	: beginTilesList[i],
					'wreathsList'		: self.wreathsList,
					'kingTiles'			: self.kingTiles,
					'prevailing_wind'	: self.prevailing_wind,
					'windsList'			: self.windsList,
					'diceList'			: diceList,
					'swap_list'			: swap_list,
					'curRound'			: self.current_round
				})
		self.begin_record_game(diceList)

	def cutAfterKong(self):
		if len(self.tiles) <= self.lucky_num + const_tykddmj.END_TILE_NUMBER:
			self.drawEnd()
		elif len(self.tiles) > self.lucky_num + const_tykddmj.END_TILE_NUMBER + 1:
			player = self.players_list[self.current_idx]
			ti = self.tiles[0]
			self.tiles = self.tiles[1:]
			player.cutTile(ti)

	def beginRound(self, is_first = False):
		if len(self.tiles) <= self.lucky_num + const_tykddmj.END_TILE_NUMBER:
			self.drawEnd()
			return
		self.checkKong()
		ti = self.tiles[0]
		self.tiles = self.tiles[1:]
		DEBUG_MSG("room:{0},curround:{1} idx:{2} beginRound tile:{3} leftNum:{4}".format(self.roomIDC, self.current_round, self.current_idx, ti, len(self.tiles)))
		p = self.players_list[self.current_idx]
		p.drawTile(ti, is_first)

	def checkKong(self):
		p = self.players_list[self.current_idx]
		handTiles = p.tiles
		upTiles = p.upTiles
		tile = self.tiles[0]

		tileNum = handTiles.count(tile)
		upTile = [tile for upmeld in upTiles if tile in upmeld]
		randomNum = random.randint(0,99)
		if tileNum >= 3 or len(upTile) > 0:
			if tile in self.kingTiles and randomNum != 1:
				self.tiles = self.tiles[1:]
				self.tiles.append(tile)
			elif randomNum > 49:
				self.tiles = self.tiles[1:]
				self.tiles.append(tile)
			DEBUG_MSG("room:{0},curround:{1} idx:{2} checkKong randomNum:{3} left_tiles:{4}".format(self.roomIDC, self.current_round, self.current_idx, randomNum, self.tiles))


	def setPassWinState(self, avt_mb, state):
		idx = -1
		DEBUG_MSG("room:{0},curround:{1} idx:{2} setPassWinState state:{3}".format(self.roomIDC, self.current_round, self.current_idx, state))
		for i,p in enumerate(self.players_list):
			if p is not None and p == avt_mb:
				idx = i
				break
		self.pass_win_list[idx] = state

	def setDiscardState(self, avt_mb, state, tile):
		idx = -1
		DEBUG_MSG("room:{0},curround:{1} idx:{2} setDiscardState state:{3}".format(self.roomIDC, self.current_round,
																				   self.current_idx, state))
		for i,p in enumerate(self.players_list):
			if p is not None and p == avt_mb:
				idx = i
				break
		p = self.players_list[idx]
		if not self.can_change_discard_state(p.tiles, idx, state):
			p.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return
		p.setDiscardStateTYKDDMJ(state)
		# self.op_special_record.append((const.OP_SPECIAL_DISCARD_FORCE, idx, idx, len(self.op_record)))
		for i in range(len(self.wait_op_info_list)):
			wait_op_dict = self.wait_op_info_list[i]
			if wait_op_dict["idx"] == idx and wait_op_dict["state"] == const.OP_STATE_WAIT:
				if (wait_op_dict["aid"] >> 3) == const.SHOW_KONG:
					break
				elif (wait_op_dict["aid"] >> 3) == const.SHOW_WIN:
					self.confirmOperation(p, wait_op_dict["aid"], wait_op_dict["tileList"])
				else:
					self.confirmOperation(p, const.OP_PASS, wait_op_dict["tileList"])
				break

		for i, p in enumerate(self.players_list):
			if p is not None:
				p.postPlayerDiscardState(idx, state)

		self.doOperation(avt_mb, const.OP_DISCARD, [tile])


	def drawEnd(self):
		DEBUG_MSG("room:{0},curround:{1} drawEnd.".format(self.roomIDC, self.current_round))
		""" 臭庄 """
		lucky_tiles = self.drawLuckyTile()
		self.cal_lucky_tile_score(lucky_tiles, -1)
		self.flowRound()
		self.settlement()
		info = dict()
		info['win_op'] = -1
		info['win_idx'] = -1
		info['lucky_tiles'] = lucky_tiles
		info['result_list'] = []
		info['finalTile'] = 0
		info['from_idx'] = -1
		info['up_tiles_list'] = [p.upTiles for i,p in enumerate(self.players_list) if p is not None]
		# info['multiply'] = 0
		info['dealer_idx'] = self.dealer_idx
		info['lastWinScore'] = 0
		# info['cur_dealer_mul'] = self.cur_dealer_mul
		# info['job_relation'] = []
		self.pass_win_list = [0] * self.player_num
		self.tingTileList = [0] * self.player_num
		self.canWinTiles = []
		self.lastWinScore = 0
		self.isMouseWin = False
		for i,p in enumerate(self.players_list):
			if p is not None:
				p.score = 0
		DEBUG_MSG("room:{0},curround:{1} drawEnd INFO:{2}".format(self.roomIDC, self.current_round, info))
		if self.current_round < self.game_round: # 在打片模式下 流局必然 继续
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def winGame(self, idx, op, finalTile, from_idx, score, result):
		self.broadcastWinOperation(idx, op, result)
		""" 座位号为idx的玩家胡牌 """
		self.cal_score(idx, from_idx, op, score, finalTile)

		lucky_tiles = self.drawLuckyTile()
		self.cal_lucky_tile_score(lucky_tiles, idx)
		self.settlement()
		info = dict()
		info['win_op'] = op
		info['win_idx'] = idx
		info['lucky_tiles'] = lucky_tiles
		info['result_list'] = result
		info['finalTile'] = finalTile
		info['lastWinScore'] = self.lastWinScore
		info['from_idx'] = from_idx
		info['up_tiles_list'] = [p.upTiles for i,p in enumerate(self.players_list) if p is not None]
		info['dealer_idx'] = last_dealer_idx = self.dealer_idx
		# if op == const.OP_KONG_WIN:
		# 	from_player = self.players_list[from_idx]
		# 	if from_player.kong_record_list[-1][0] == const.OP_CONTINUE_KONG:
		# 		from_player.continue_kong -= 1
		# 	elif from_player.kong_record_list[-1][0] == const.OP_EXPOSED_KONG:
		# 		from_player.exposed_kong -= 1
		# if self.players_list[from_idx].discard_state == const_tykddmj.DISCARD_FREE:
		# 	self.dealer_idx = from_idx
		# else:
		# 	self.dealer_idx = idx
		if self.dealer_idx != idx:
			self.dealer_idx = (self.dealer_idx + 1) % self.player_num
		self.pass_win_list = [0] * self.player_num
		self.tingTileList = [0] * self.player_num
		self.canWinTiles = []
		self.lastWinScore = 0
		self.isMouseWin = False
		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def begin_record_game(self, diceList):
		DEBUG_MSG("{} begin record game".format(self.prefixLogStr))
		self.begin_record_room()
		init_tiles = [None] * len(self.origin_players_list)
		player_id_list = []
		for p in self.origin_players_list:
			init_tiles[p.idx] = p.tiles[:]
			player_id_list.append(p.userId)

		KBEngine.globalData['GameWorld'].begin_record_room(self, self.roomIDC, {
			'init_info': self.get_init_client_dict(),
			'dice_list': copy.deepcopy(diceList),
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

	def flowRound(self):
		for i,p in enumerate(self.players_list):
			if p is not None:
				p.flowRound()

	def settlement(self):
		for i,p in enumerate(self.players_list):
			if p is not None:
				p.settlement()

	def endAll(self, info):
		""" 游戏局数结束, 给所有玩家显示最终分数记录 """

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		info['left_tiles'] = self.tiles
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None]
		DEBUG_MSG("room:{0},curround:{1} endAll player_info_list = {2}  info = {3}".format(self.roomIDC, self.current_round, player_info_list, info))

		self.end_record_game(info)
		self.saveRoomResult()

		for p in self.players_list:
			if p and p:
				p.finalResult(player_info_list, info)
				# 有效圈数加一
				if self.room_type == const.CLUB_ROOM:
					p.addGameCount()

		self.addAvatarGameRound()

		self._reset()

	def subtotal_result(self):
		self.dismiss_timer = None
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None]
		DEBUG_MSG("room:{0},curround:{1} subtotal_result,player_info_list:{2}".format(self.roomIDC, self.current_round, player_info_list))

		for p in self.players_list:
			if p and p:
				try:
					p.subtotalResult(player_info_list)
				except:
					pass
		self._reset()

	def doOperation(self, avt_mb, aid, tile_list):
		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p == avt_mb:
				idx = i
		tile = tile_list[0]

		DEBUG_MSG("room:{0},curround:{1} idx:{2} doOperation current_idx:{3} aid:{4} tile_list:{5}".format(self.roomIDC, self.current_round, idx, self.current_idx, aid, tile_list))
		"""
		当前控牌玩家摸牌后向服务端确认的操作
		"""
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < self.dismissRoomSecends:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("room:{0},curround:{1} idx:{2} doOperationFailed dismiss_room_ts:{3}".format(self.roomIDC, self.current_round, idx, self.dismiss_room_ts))
			# avt_mb.doOperationFailed(const.OP_ERROR_VOTE)
			# return
		if self.state != const.ROOM_PLAYING:
			DEBUG_MSG("room:{0},curround:{1} idx:{2} doOperationFailed state:{3}".format(self.roomIDC, self.current_round, idx, self.state))
			avt_mb.doOperationFailed(const.OP_ERROR_STATE)
			return

		# DEBUG_MSG("doOperation idx:{0},self.current_idx:{1},self.wait_op_info_list:{2}".format(idx, self.current_idx, self.wait_op_info_list))
		if idx != self.current_idx:
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return
		p = self.players_list[idx]
		# if aid == const.OP_DISCARD and self.can_discard(idx, tile):
		if aid == const.OP_DISCARD:
			self.all_discard_tiles.append(tile)
			p.discardTile(tile)
		elif aid == const.OP_CONCEALED_KONG and self.can_concealed_kong(idx, tile):
			p.concealedKong(tile)
		elif aid == const.OP_KONG_WREATH and self.can_kong_wreath(p.tiles, tile):
			p.kongWreath(tile)
		elif aid == const.OP_CONTINUE_KONG and self.can_continue_kong(idx, tile):
			p.continueKong(tile)
		elif aid == const.OP_PASS:
			# 自己摸牌的时候可以杠或者胡时选择过, 则什么都不做. 继续轮到该玩家打牌.
			if p.discard_state == const_tykddmj.DISCARD_FORCE:
				p.forceDiscard()
			# pass
		elif aid == const.OP_DRAW_WIN: #普通自摸胡
			is_win, score, result = self.can_win(list(p.tiles), p.last_draw, const.OP_DRAW_WIN, idx)
			DEBUG_MSG("room:{0},curround:{1} idx:{2} do OP_DRAW_WIN==>{3}, {4}, {5}".format(self.roomIDC, self.current_round, idx, is_win, score, result))
			if is_win:
				is_ekongwin, from_idx = self.is_kongkai_win()
				if is_ekongwin and not self.isMouseWin:
					DEBUG_MSG("room:{0},curround:{1} idx:{2} do OP_EKONGGIVE_WIN==>{3}, {4}, {5}".format(self.roomIDC, self.current_round, idx, is_ekongwin, score, result))
					p.give_win(tile, score, result, from_idx)
				else:
					p.draw_win(tile, score, result)
			else:
				avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
				self.current_idx = self.nextIdx
				self.beginRound()
		elif aid == const.OP_WREATH_WIN: #自摸8张花胡
			is_win, score, result = self.can_win(list(p.tiles), p.last_draw, const.OP_WREATH_WIN, idx)
			DEBUG_MSG("room:{0},curround:{1} idx:{2} do OP_WREATH_WIN==>{3}, {4}, {5}".format(self.roomIDC, self.current_round, idx, is_win, score, result))
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


	def confirmOperation(self, avt_mb, aid, tile_list):
		tile = tile_list[0]
		idx = -1
		for i, p in enumerate(self.players_list):
			if p and p == avt_mb:
				idx = i
		DEBUG_MSG("room:{0},curround:{1} idx:{2} confirmOperation aid:{3} tile_list:{4}".format(self.roomIDC, self.current_round, idx, aid, tile_list))
		""" 被轮询的玩家确认了某个操作 """
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < self.dismissRoomSecends:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("room:{0},curround:{1} idx:{2} confirmOperation dismiss_room_ts:{3}".format(self.roomIDC, self.current_round, idx, self.dismiss_room_ts))
			# return

		#玩家是否可以操作
		DEBUG_MSG("room:{0},curround:{1} idx:{2} wait_op_info_list:{3}".format(self.roomIDC, self.current_round, idx, self.wait_op_info_list))
		if len(self.wait_op_info_list) <= 0 or sum([1 for waitOpDict in self.wait_op_info_list if (waitOpDict["idx"] == idx and waitOpDict["state"] == const.OP_STATE_WAIT)]) <= 0:
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return
		#提交 玩家结果
		for waitOpDict in self.wait_op_info_list:
			if waitOpDict["idx"] == idx:
				if waitOpDict["aid"] == const.OP_CHOW and aid == const.OP_CHOW and waitOpDict["tileList"][0] == tile_list[0] and self.can_chow_list(waitOpDict["idx"], tile_list):
					waitOpDict["state"] = const.OP_STATE_SURE
					waitOpDict["tileList"] = tile_list
				elif waitOpDict["aid"] == aid and aid != const.OP_CHOW:
					waitOpDict["state"] = const.OP_STATE_SURE
				else:
					waitOpDict["state"] = const.OP_STATE_PASS
		#有玩家可以操作
		isOver,confirmOpDict = self.getConfirmOverInfo()
		if isOver:
			DEBUG_MSG("room:{0},curround:{1} commit over {2}.".format(self.roomIDC, self.current_round, confirmOpDict))
			temp_wait_op_info_list = copy.deepcopy(self.wait_op_info_list)
			self.wait_op_info_list = []
			if len(confirmOpDict) > 0:
				sureIdx = confirmOpDict["idx"]
				p = self.players_list[sureIdx]
				fromIdx = confirmOpDict["from"]
				fromP = self.players_list[fromIdx]
				if len(fromP.discard_desk_tiles) > 0:
					fromP.discard_desk_tiles.pop()
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
					if lastAid == const.OP_WREATH_WIN:
						self.current_idx = self.last_player_idx
					elif lastAid == const.OP_KONG_WIN:
						#*********没人抢杠胡 杠要算分？***********
						self.current_idx = self.last_player_idx
						if self.can_cut_after_kong():
							self.cutAfterKong()
					else:
						self.current_idx = self.nextIdx
					self.beginRound()
			else:
				lastAid = temp_wait_op_info_list[0]["aid"]
				if lastAid == const.OP_WREATH_WIN:
					self.current_idx = self.last_player_idx
				elif lastAid == const.OP_KONG_WIN:
					#*********没人抢杠胡 杠要算分？***********
					self.current_idx = self.last_player_idx
				else:
					self.current_idx = self.nextIdx
				self.beginRound()

	def getConfirmOverInfo(self):
		for i in range(len(self.wait_op_info_list)):
			waitState = self.wait_op_info_list[i]["state"]
			if waitState == const.OP_STATE_PASS:
				continue
			elif waitState == const.OP_STATE_WAIT: #需等待其他玩家操作
				return False, {}
			elif waitState == const.OP_STATE_SURE:	#有玩家可以操作
				return True, self.wait_op_info_list[i]
		return True, {}	#所有玩家选择放弃

	def waitForOperation(self, idx, aid, tile, nextIdx = -1): #  aid抢杠 杠花没人可胡 nextIdx还是自己
		notifyOpList = self.getNotifyOpList(idx, aid, tile)
		if sum([len(x) for x in notifyOpList]) > 0:
			DEBUG_MSG("room:{0},curround:{1} waitForOperation from:{2},aid:{3},tile:{4}==>notifyOpList:{5}".format(self.roomIDC, self.current_round, idx, aid, tile, notifyOpList))
			for i,p in enumerate(self.players_list):
				if p is not None and len(notifyOpList[i]) > 0:
					waitAidList = [notifyOp["aid"] for notifyOp in notifyOpList[i]]
					p.waitForOperation(waitAidList, [tile,])

			# 摸打模式
			# for i,p in enumerate(self.players_list):
			# 	if p is not None and len(notifyOpList[i]) > 0 and p.discard_state == const_tykddmj.DISCARD_FORCE:
			# 		wait_op_dict = None
			# 		for notifyOp in notifyOpList[i]:
			# 			if notifyOp["aid"] == const.OP_KONG_WIN or notifyOp["aid"] == const.OP_GIVE_WIN or (notifyOp["aid"] >> 3) == const.SHOW_KONG:
			# 				wait_op_dict = notifyOp
			# 				break
			# 		if wait_op_dict is not None:
			# 			if self.game_mode != const_tykddmj.KING_GAME_MODE and (wait_op_dict["aid"] >> 3) != const.SHOW_KONG:
			# 				# self.add_timer(1, Functor(self.confirmOperation, p, wait_op_dict["aid"], wait_op_dict["tileList"]))
			# 				self.confirmOperation(p, wait_op_dict["aid"], wait_op_dict["tileList"])
			# 			# self.confirmOperation(p, wait_op_dict["aid"], wait_op_dict["tileList"])
			# 		else:
			# 			self.confirmOperation(p, const.OP_PASS, notifyOpList[i][0]["tileList"])
		else:
			DEBUG_MSG("room:{0},curround:{1} nobody waitForOperation from:{2},aid:{3},tile:{4},nextIdx:{5}".format(self.roomIDC, self.current_round, idx, aid, tile, nextIdx))
			if self.can_cut_after_kong() and (aid >> 3) == const.SHOW_KONG:
				self.cutAfterKong()
			self.current_idx = self.nextIdx if nextIdx < 0 else nextIdx
			self.beginRound()

	def get_init_client_dict(self):
		return {
			'roomID'			: self.roomIDC,
			'ownerId'			: self.owner_uid,
			'roomType'			: self.room_type,
			'dealerIdx'			: self.dealer_idx,
			'curRound'			: self.current_round,
			'game_round'			: self.game_round,
			'player_num'		: self.player_num,
			'king_num'			: self.king_num,
			'pay_mode'			: self.pay_mode,
			'game_mode'			: self.game_mode,
			'lucky_num'			: self.lucky_num,
			'hand_prepare'		: self.hand_prepare,
			'king_mode'			: self.king_mode,
			'reward'			: self.reward,
			'add_dealer'		: self.add_dealer,
			'ekong_is_dwin'		: self.ekong_is_dwin,
			'special_mul'		: self.special_mul,
			'seven_pair'		: self.seven_pair,
			'mouse_general'		: self.mouse_general,
			'mouse_general_onetwo'		: self.mouse_general_onetwo,
			'ting_mouse'		: self.ting_mouse,
			'bao_kong'			: self.bao_kong,
			'repeat_kong'		: self.repeat_kong,
			'club_id'			: self.club_id,
			'table_idx'			: getattr(self, 'table_idx', -1),
			'player_base_info_list': [p.get_init_client_dict() for p in self.players_list if p is not None],
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
		}

	def get_club_complete_dict(self):
		d = {
			'gameType'	: self.gameTypeC,
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
		dismiss_left_time =self.dismissRoomSecends - (int(time.time() - self.dismiss_room_ts))
		if self.dismiss_room_ts == 0 or dismiss_left_time >= self.dismissRoomSecends:
			dismiss_left_time = 0

		idx = 0
		for p in self.players_list:
			if p and p.userId == userId:
				idx = p.idx

		waitAidList = []
		for i in range(len(self.wait_op_info_list)):
			if self.wait_op_info_list[i]["idx"] == idx and self.wait_op_info_list[i]["state"] == const.OP_STATE_WAIT:
				waitAidList.append(self.wait_op_info_list[i]["aid"])
		DEBUG_MSG('room:{},curround:{} reconnect_room waitAidList:{}'.format(self.roomIDC, self.current_round, waitAidList))
		return {
			'gameType'				: self.gameTypeC,
			'init_info' 			: self.get_init_client_dict(),
			'curPlayerSitNum'		: self.current_idx,
			'room_state'			: const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'player_state_list'		: [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
			'lastDiscardTile'		: -1 if not self.all_discard_tiles else self.all_discard_tiles[-1],
			'lastDrawTile' 			: self.players_list[idx].last_draw,
			'last_op'				: self.players_list[idx].last_op,
			'lastDiscardTileFrom'	: self.last_player_idx,
			'kingTiles' 			: self.kingTiles,
			'waitAidList'			: waitAidList,
			'leftTileNum'			: len(self.tiles),
			'applyCloseFrom'		: self.dismiss_room_from,
			'applyCloseLeftTime'	: dismiss_left_time,
			'applyCloseStateList'	: self.dismiss_room_state_list,
			'player_advance_info_list': [p.get_reconnect_client_dict(userId) for p in self.players_list if p is not None],
			'discardStateList'		: [p.discard_state for i,p in enumerate(self.players_list) if p is not None],
			'prevailing_wind'		: self.prevailing_wind,
			'discard_king_idx'		: self.discard_king_idx,
			'pass_win_list'			: self.pass_win_list,
			'tingTileList'			: self.tingTileList,
		}

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
					p.tiles = prefabHandTiles[i] if len(prefabHandTiles[i]) <= const_tykddmj.INIT_TILE_NUMBER else \
					prefabHandTiles[i][0:const_tykddmj.INIT_TILE_NUMBER]
			topList = prefabTopList if prefabTopList is not None else []
			allTiles = []
			for i, p in enumerate(self.players_list):
				if p is not None:
					allTiles.extend(p.tiles)
			allTiles.extend(topList)

			tile2NumDict = utility.getTile2NumDict(allTiles)
			warning_tiles = [t for t, num in tile2NumDict.items() if num > 4]
			if len(warning_tiles) > 0:
				WARNING_MSG("room:{},curround:{} prefab {} is larger than 4.".format(self.roomIDC, self.current_round,
																					 warning_tiles))
			for t in allTiles:
				if t in self.tiles:
					self.tiles.remove(t)
			for i in range(const_tykddmj.INIT_TILE_NUMBER):
				num = 0
				for j in range(self.player_num):
					if len(self.players_list[j].tiles) >= const_tykddmj.INIT_TILE_NUMBER:
						continue
					self.players_list[j].tiles.append(self.tiles[num])
					num += 1
				self.tiles = self.tiles[num:]

			newTiles = topList
			newTiles.extend(self.tiles)
			self.tiles = newTiles
		else:
			for i in range(const_tykddmj.INIT_TILE_NUMBER):
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
					DEBUG_MSG(
						"room:{},curround:{} kong wreath, idx:{},tile:{}".format(self.roomIDC, self.current_round, i,
																				 tile))

	def addWreath(self):
		""" 补花 """
		for i in range(self.player_num):
			while len(self.players_list[i].tiles) < const_tykddmj.INIT_TILE_NUMBER:
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

	# def rollKingTile(self):
	# 	""" 财神 """
	# 	self.kingTiles = []
	# 	if self.king_num > 0:
	# 		for i in range(len(self.tiles)):
	# 			t = self.tiles[i]
	# 			if t not in const.SEASON and t not in const.FLOWER: #第一张非花牌
	# 				# 1-9为一圈 东南西北为一圈 中发白为一圈
	# 				self.kingTiles.append(t)
	# 				if self.king_num > 1:
	# 					for tup in (const.CHARACTER, const.BAMBOO, const.DOT, const.WINDS, const.DRAGONS):
	# 						if t in tup:
	# 							index = tup.index(t)
	# 							self.kingTiles.append(tup[(index + 1)%len(tup)])
	# 							break
	# 				del self.tiles[i]
	# 				break

	# 杭州麻将特殊处理
	def rollKingTile(self, prefabKingTiles):
		""" 财神 """
		self.kingTiles = []
		if prefabKingTiles is not None and len(prefabKingTiles) > 0:
			if self.king_num > 0:
				if self.king_mode == 0:  # 财神模式 固定白板
					if prefabKingTiles[0] in const.WINDS or prefabKingTiles[0] in const.DRAGONS:
						self.kingTiles.append(prefabKingTiles[0])
					else:
						self.kingTiles.append(const.DRAGON_WHITE)
				else:
					self.kingTiles.append(prefabKingTiles[0])
		else:
			if self.king_num > 0:
				roll_list = list(const.WINDS) + list(const.DRAGONS)
				if self.king_mode == 0:  # 风耗子
					roll_list = list(const.WINDS) + list(const.DRAGONS)
				else:  # 随机耗子
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

	def count_king_tile(self):
		for i in range(self.player_num):
			p = self.players_list[i]
			p.count_draw_king(p.tiles)

	def throwDice(self, idxList):
		diceList = [[0, 0] for i in range(self.player_num)]
		for i in range(len(diceList)):
			if i in idxList:
				diceList[i][0] = random.randint(1, 6)
				diceList[i][1] = random.randint(1, 6)
		return diceList

	def getMaxDiceIdx(self, diceList):
		numList = [v[0] + v[1] for v in diceList]
		maxVal, maxIdx = max(numList), self.dealer_idx
		for i in range(self.dealer_idx, self.dealer_idx + self.player_num):
			idx = i % self.player_num
			if numList[idx] == maxVal:
				maxIdx = idx
				break
		return maxIdx, maxVal

	def drawLuckyTile(self):
		return []

	# luckyTileList = []
	# for i in range(self.lucky_num):
	# 	if len(self.tiles) > 0:
	# 		luckyTileList.append(self.tiles[0])
	# 		self.tiles = self.tiles[1:]
	# return luckyTileList

	def cal_lucky_tile_score(self, lucky_tiles, winIdx):
		pass

	def swapTileToTop(self, tile):
		if tile in self.tiles:
			tileIdx = self.tiles.index(tile)
			self.tiles[0], self.tiles[tileIdx] = self.tiles[tileIdx], self.tiles[0]

	def winCount(self):
		pass

	def canTenPai(self, handTiles):
		length = len(handTiles)
		if length % 3 != 2:
			return False

		result = []
		tryTuple = (const.CHARACTER, const.BAMBOO, const.DOT, const.WINDS, const.DRAGONS)
		tryList = []
		for tup in tryTuple:
			tryList += tup
		for tile in handTiles:
			handCopyTiles = list(handTiles)
			sorted(handCopyTiles)
			handCopyTiles.remove(tile)
			for t in tryList:
				tmp = list(handCopyTiles)
				tmp.append(t)
				sorted(tmp)
				if utility_tykddmj.isWinTile(tmp, self.kingTiles):
					result.append(t)
					return True
		return False

	# return result != []

	def is_op_times_limit(self, idx):
		"""吃碰杠次数限制"""
		# if self.three_job and (idx == self.dealer_idx or self.last_player_idx == self.dealer_idx): # 三摊 承包的模式 庄闲之间 无限制
		# 	return False
		# op_r = self.players_list[idx].op_r
		# include_op_list = [const.OP_CHOW, const.OP_PONG, const.OP_EXPOSED_KONG] if self.pong_useful else [const.OP_CHOW]
		# times = sum([1 for record in op_r if record[2] == self.last_player_idx and record[0] in include_op_list])
		# return times >= 2
		return False

	def is_op_kingTile_limit(self, idx):
		"""打财神后操作限制"""
		if self.discard_king_idx >= 0 and self.discard_king_idx != idx and self.reward == 1:
			return True
		return False

	def is_op_limit(self, idx):
		"""操作限制"""
		if self.is_op_times_limit(idx) or self.is_op_kingTile_limit(idx):
			return True
		return False

	def circleSameTileNum(self, idx, t):
		"""获取一圈内打出同一张牌的张数"""
		discard_num = 0
		for record in reversed(self.op_record):
			if record[1] == idx:
				break
			if record[0] == const_tykddmj.DISCARD_FORCE and record[3][0] == t:
				discard_num -= 1
			if record[0] == const.OP_DISCARD and record[3][0] == t:
				discard_num += 1
		return discard_num

	def can_cut_after_kong(self):
		return False

	def can_discard(self, idx, t):
		if self.is_op_kingTile_limit(idx):
			if t == self.players_list[idx].last_draw:
				return True
			return False
		return True

	def can_chow(self, idx, t):
		return False
		# if self.is_op_limit(idx):
		# 	return False
		# if t in self.kingTiles:
		# 	return False
		# # 白板代替财神
		# virtual_tile = self.kingTiles[0] if t == const.DRAGON_WHITE and len(self.kingTiles) > 0 else t
		# if virtual_tile >= const.BOUNDARY:
		# 	return False
		# tiles = list(filter(lambda x: x not in self.kingTiles, self.players_list[idx].tiles))
		# tiles = list(map(lambda x: self.kingTiles[0] if x == const.DRAGON_WHITE else x, tiles))
		# MATCH = ((-2, -1), (-1, 1), (1, 2))
		# for tup in MATCH:
		# 	if all(val + virtual_tile in tiles for val in tup):
		# 		return True
		# return False

	def can_chow_list(self, idx, tile_list):
		chow_list = list(tile_list)
		# """ 能吃 """
		if self.is_op_limit(idx):
			return False
		if len(chow_list) != 3:
			return False
		if any(t in self.kingTiles for t in tile_list):
			return False
		virtual_chow_list = list(tile_list)
		virtual_chow_list = list(map(lambda x: self.kingTiles[0] if x == const.DRAGON_WHITE else x, virtual_chow_list))
		if any(t >= const.BOUNDARY for t in virtual_chow_list):
			return False
		tiles = list(filter(lambda x: x not in self.kingTiles, self.players_list[idx].tiles))
		tiles = list(map(lambda x: self.kingTiles[0] if x == const.DRAGON_WHITE else x, tiles))
		if virtual_chow_list[1] in tiles and virtual_chow_list[2] in tiles:
			sortLis = sorted(virtual_chow_list)
			if (sortLis[2] + sortLis[0]) / 2 == sortLis[1] and sortLis[2] - sortLis[0] == 2:
				return True
		return False

	def can_pong(self, idx, t):
		""" 能碰 """
		# if self.is_op_kingTile_limit(idx):
		# 	return False
		# if self.pong_useful and self.is_op_times_limit(idx):
		# 	return False

		if self.circleSameTileNum(idx, t) >= 2:
			return False
		tiles = self.players_list[idx].tiles
		# if t in self.kingTiles:
		# 	return False
		return sum([1 for i in tiles if i == t]) >= 2

	def can_exposed_kong(self, idx, t):
		""" 能明杠 """
		# if self.is_op_kingTile_limit(idx):
		# 	return False
		# if self.pong_useful and self.is_op_times_limit(idx):
		# 	return False

		# if t in self.kingTiles:
		# 	return False
		tiles = self.players_list[idx].tiles
		return tiles.count(t) == 3

	def can_continue_kong(self, idx, t):
		""" 能够补杠 """
		# if t in self.kingTiles:
		# 	return False
		# 判断补杠后是否会影响所胡的牌,如果有影响,就无法补杠
		# 补杠必定不会影响所胡的牌
		player = self.players_list[idx]
		for op in player.op_r:
			if op[0] == const.OP_PONG and op[1][0] == t:
					return True
		for op in player.op_r:
			if self.repeat_kong == 1:
				for tile in player.tiles:
					if op[0] == const.OP_PONG and op[1][0] == tile:
						if player.discard_state == const_tykddmj.DISCARD_FORCE:
							p_tiles = list(player.tiles)
							p_tiles.remove(t)
							canWinTilesPre = self.getCanWinTiles(p_tiles, const.OP_DRAW_WIN, idx)
							a_tiles = list(player.tiles)
							a_tiles.remove(tile)
							canWinTilesAft = self.getCanWinTiles(a_tiles, const.OP_DRAW_WIN, idx)
							isSmall = True
							isChange = False
							for winTile in canWinTilesAft:
								if winTile in self.kingTiles:
									# if self.game_mode == const_tykddmj.KING_GAME_MODE and self.ting_mouse == 1:
									# 	p_tiles_copy = list(p_tiles)
									# 	p_tiles_copy.append(winTile)
									# 	kings, handTilesButKing = utility.classifyKingTiles(p_tiles_copy, self.kingTiles)
									# 	kingTilesNum = len(kings)
									# 	handTilesButKing.append(winTile)
									# 	if utility.meld_with_pair_need_num(handTilesButKing) <= kingTilesNum - 1 or utility.meld_with_pair_need_num(handTilesButKing) <= 0:
									# 		pass
									# 	else:
									# 		continue
									# else:
									continue
								if winTile not in canWinTilesPre:
									isChange = True
									break
								if winTile > const.BOUNDARY or winTile % 10 >= 6:
									isSmall = False
							DEBUG_MSG("room:{},curround:{} can_continue_kong canWinTilesPre:{} canWinTilesAft:{}".format(self.roomIDC,self.current_round,canWinTilesPre,canWinTilesAft))
							if len(canWinTilesAft) == 0 or isSmall or isChange:
								continue
						return True
		return False

	def can_concealed_kong(self, idx, t):
		""" 能暗杠 """
		# if t in self.kingTiles:
		# 	return False
		# 判断暗杠后是否会影响所胡的牌,如果有影响,就无法暗杠
		p = self.players_list[idx]
		pT = t
		if p.discard_state == const_tykddmj.DISCARD_FORCE:
			canConcealedKong = False
			for pTile in p.tiles:
				if p.tiles.count(pTile) == 4:
					canConcealedKong = True
					pT = pTile
					break
			if t not in p.tiles or canConcealedKong == False:
				return False
			# if t not in p.tiles or p.tiles.count(t) != 4:
			# 	return False
			p_tiles = list(p.tiles)
			p_tiles.remove(t)
			canWinTilesPre = self.getCanWinTiles(p_tiles, const.OP_DRAW_WIN, idx)
			a_tiles = list(p.tiles)
			a_tiles.remove(pT)
			a_tiles.remove(pT)
			a_tiles.remove(pT)
			a_tiles.remove(pT)
			canWinTilesAft = self.getCanWinTiles(a_tiles, const.OP_DRAW_WIN, idx)
			isSmall = True
			isChange = False
			for tile in canWinTilesAft:
				if tile in self.kingTiles:
					# if self.game_mode == const_tykddmj.KING_GAME_MODE and self.ting_mouse == 1:
					# 	pass
					# else:
					continue
				if tile not in canWinTilesPre:
					isChange = True
					break
				if tile > const.BOUNDARY or tile % 10 >= 6:
					isSmall = False
			DEBUG_MSG("room:{},curround:{} can_concealed_kong canWinTilesPre:{} canWinTilesAft:{}".format(self.roomIDC,
																										  self.current_round,
																										  canWinTilesPre,
																										  canWinTilesAft))
			if len(canWinTilesAft) == 0 or isSmall or isChange:
				return False
		tiles = self.players_list[idx].tiles
		return tiles.count(pT) == 4

	def can_kong_wreath(self, tiles, t):
		if t in tiles and (t in const.SEASON or t in const.FLOWER):
			return True
		return False

	def can_wreath_win(self, wreaths):
		if len(wreaths) == len(const.SEASON) + len(const.FLOWER):
			return True
		return False

	def can_change_discard_state(self, tiles, i, state):
		if state == const_tykddmj.DISCARD_FREE:
			return True
		elif state == const_tykddmj.DISCARD_FORCE:
			return self.canTenPai(tiles)

	def getNotifyOpList(self, idx, aid, tile):
		# notifyOpList 和 self.wait_op_info_list 必须同时操作
		# 数据结构：问询玩家，操作玩家，牌，操作类型，得分，结果，状态
		notifyOpList = [[] for i in range(self.player_num)]
		self.wait_op_info_list = []
		if self.players_list[idx].buckle == 1 and aid != const.OP_CONTINUE_KONG and aid != const.OP_EXPOSED_KONG:
			return notifyOpList
		# 胡
		if aid == const.OP_KONG_WREATH and self.can_wreath_win(self.players_list[idx].wreaths):  # 8花胡
			opDict = {"idx": idx, "from": idx, "tileList": [tile, ], "aid": const.OP_WREATH_WIN, "score": 0,
					  "result": [], "state": const.OP_STATE_WAIT}
			notifyOpList[idx].append(opDict)
			self.wait_op_info_list.append(opDict)
		elif aid == const.OP_EXPOSED_KONG:  # 直杠 抢杠胡
			wait_for_win_list = self.getKongWinList(idx, tile)
			self.wait_op_info_list.extend(wait_for_win_list)
			for i in range(len(wait_for_win_list)):
				dic = wait_for_win_list[i]
				notifyOpList[dic["idx"]].append(dic)
			# pass
		elif aid == const.OP_CONTINUE_KONG:  # 碰后接杠 抢杠胡
			wait_for_win_list = self.getKongWinList(idx, tile)
			self.wait_op_info_list.extend(wait_for_win_list)
			for i in range(len(wait_for_win_list)):
				dic = wait_for_win_list[i]
				notifyOpList[dic["idx"]].append(dic)
			# pass
		elif aid == const.OP_CONCEALED_KONG:
			pass
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
					if self.can_exposed_kong(i, tile):
						# 判断明杠后是否会影响所胡的牌,如果有影响,就无法明杠
						if p.discard_state == const_tykddmj.DISCARD_FORCE:
							canWinTilesPre = self.getCanWinTiles(p.tiles, const.OP_DRAW_WIN, i, True)
							p_tiles = list(p.tiles)
							p_tiles.remove(tile)
							p_tiles.remove(tile)
							p_tiles.remove(tile)
							canWinTilesAft = self.getCanWinTiles(p_tiles, const.OP_DRAW_WIN, i, True)
							isSmall = True
							isChange = False
							for t in canWinTilesAft:
								if t in self.kingTiles:
									if self.game_mode == const_tykddmj.KING_GAME_MODE and self.ting_mouse == 1:
										p_tiles_copy = list(p_tiles)
										p_tiles_copy.append(t)
										kings, handTilesButKing = utility.classifyKingTiles(p_tiles_copy, self.kingTiles)
										kingTilesNum = len(kings)
										if utility.meld_with_pair_need_num(p_tiles_copy) <= kingTilesNum - 1:
											pass
										else:
											continue
									else:
										continue
								if t not in canWinTilesPre:
									isChange = True
									break
								if t > const.BOUNDARY or t % 10 >= 6:
									isSmall = False
							if len(canWinTilesAft) > 0 and isSmall == False and isChange == False:
								opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_EXPOSED_KONG,
										  "score": 0, "result": [], "state": const.OP_STATE_WAIT}
								self.wait_op_info_list.append(opDict)
								notifyOpList[i].append(opDict)
						else:
							opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_EXPOSED_KONG,
									  "score": 0, "result": [], "state": const.OP_STATE_WAIT}
							self.wait_op_info_list.append(opDict)
							notifyOpList[i].append(opDict)
					if self.can_pong(i, tile) and p.discard_state != const_tykddmj.DISCARD_FORCE:
						opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_PONG, "score": 0,
								  "result": [], "state": const.OP_STATE_WAIT}
						self.wait_op_info_list.append(opDict)
						notifyOpList[i].append(opDict)
			# 吃
			nextIdx = self.nextIdx
		# if self.can_chow(nextIdx, tile):
		# 	opDict = {"idx":nextIdx, "from":idx, "tileList":[tile,], "aid":const.OP_CHOW, "score":0, "result":[], "state":const.OP_STATE_WAIT}
		# 	self.wait_op_info_list.append(opDict)
		# 	notifyOpList[nextIdx].append(opDict)
		return notifyOpList

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
		# if self.win_mode == 0 or self.cur_dealer_mul < 3: # 放铳模式 庄三有效
		# 	return  wait_for_win_list
		for i in range(self.player_num - 1):
			ask_idx = (idx + i + 1) % self.player_num
			# if ask_idx != self.dealer_idx and idx != self.dealer_idx: # 庄闲放铳
			# 	continue
			p = self.players_list[ask_idx]
			tryTiles = list(p.tiles)
			tryTiles.append(tile)
			tryTiles = sorted(tryTiles)
			# DEBUG_MSG(
			# 	"room:{},curround:{} getGiveWinList {} tile {}".format(self.roomIDC, self.current_round, ask_idx, tile))
			is_win, score, result = self.can_win(tryTiles, tile, const.OP_GIVE_WIN, ask_idx)
			if is_win:
				wait_for_win_list.append(
					{"idx": ask_idx, "from": idx, "tileList": [tile, ], "aid": const.OP_GIVE_WIN, "score": score,
					 "result": result, "state": const.OP_STATE_WAIT})
		return wait_for_win_list

	def getCanWinTiles(self, handTiles, win_op, idx, isCheckEKong = False):
		handCopyTiles = list(handTiles)
		handCopyTiles = sorted(handCopyTiles)
		kings, handTilesButKing = utility.classifyKingTiles(handCopyTiles, self.kingTiles)
		kingTilesNum = len(kings)
		allTiles = const.CHARACTER + const.BAMBOO + const.DOT + const.WINDS + const.DRAGONS
		canWinTiles = []
		for tile in allTiles:
			handCopyTiles.append(tile)
			is_win, _, _ = self.can_win(handCopyTiles, tile, win_op, idx, isCheckEKong)
			if is_win:
				canWinTiles.append(tile)
			handCopyTiles.pop()
		# DEBUG_MSG(
		# 	"room:{},curround:{} getCanWinTiles idx:{} canWinTiles:{}".format(self.roomIDC, self.current_round, idx,
		# 																	  canWinTiles))
		return canWinTiles

	def is_kongkai_win(self):
		if self.ekong_is_dwin == 1:
			return False, 0
		last_op = self.op_record[-1]
		pre_op = self.op_record[-2]
		if last_op[0] == const.OP_DRAW:
			if pre_op[0] == const.OP_EXPOSED_KONG:
				if last_op[1] == pre_op[1] and last_op[2] != pre_op[2]:
					return True, pre_op[2]
			elif pre_op[0] == const.OP_CONTINUE_KONG:
				for op in self.op_record:
					if op[3][0] == pre_op[3][0]:
						if last_op[1] == pre_op[1] and op[1] == pre_op[1] and op[2] != last_op[2]:
							return True, op[2]
		return False, 0

	def is_win_limit(self, finalTile, win_op):
		# DEBUG_MSG(
		# 	"room:{},curround:{} is_win_limit finalTile:{} win_op:{}".format(self.roomIDC, self.current_round, finalTile,
		# 																	 win_op))
		if finalTile in self.kingTiles:
			# if self.reward == 1:
			# 	return False
			if win_op != const.OP_DRAW_WIN:
				return False
			return True
		# 风字牌能胡
		if finalTile > const.BOUNDARY:
			return True
		# 12不能胡
		if finalTile % 10 <= 2:
			return False
		# 345只能自摸
		if finalTile % 10 >= 3 and finalTile % 10 <= 5 and win_op != const.OP_DRAW_WIN:
			return False
		return True

	def can_win(self, handTiles, finalTile, win_op, idx, isCheckEKong = False):
		# """平胡 清一色 七小对 豪华七小对 一条龙 十三幺"""
		result_list = [0] * 6
		base_score = 0
		# return False, multiply, result_list
		p = self.players_list[idx]
		if p.discard_state == const_tykddmj.DISCARD_FREE:
			# DEBUG_MSG("room:{},curround:{} 0 handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.roomIDC, self.current_round, handTiles, finalTile, win_op, idx))
			return False, base_score, result_list
		# DEBUG_MSG("room:{},curround:{} discard_state:{} idx:{}".format(self.roomIDC, self.current_round, p.discard_state, idx))
		if self.pass_win_list[idx] == 1 and win_op != const.OP_DRAW_WIN:
			# DEBUG_MSG("room:{},curround:{} 00 handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.roomIDC,
			# 																					 self.current_round,
			# 																					 handTiles, finalTile,
			# 																					 win_op, idx))
			return False, base_score, result_list
		if len(handTiles) % 3 != 2:
			# DEBUG_MSG("room:{},curround:{} 1 handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.roomIDC,
			# 																					self.current_round,
			# 																					handTiles, finalTile,
			# 																					win_op, idx))
			return False, base_score, result_list
		if win_op == const.OP_WREATH_WIN:
			# DEBUG_MSG("room:{},curround:{} 2 handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.roomIDC,
			# 																					self.current_round,
			# 																					handTiles, finalTile,
			# 																					win_op, idx))
			return False, base_score, result_list
		# if win_op == const.OP_GIVE_WIN and finalTile in self.kingTiles:
		# 	DEBUG_MSG("room:{},curround:{} handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.roomIDC, self.current_round, handTiles, finalTile, win_op, idx))
		# 	return False, base_score, result_list
		# if self.is_win_limit(finalTile, win_op) == False:
		# 	return False, base_score, result_list

		handCopyTiles = list(handTiles)
		handCopyTiles = sorted(handCopyTiles)
		kings, handTilesButKing = utility.classifyKingTiles(handCopyTiles, self.kingTiles)
		kingTilesNum = len(kings)
		uptiles = p.upTiles

		if not isCheckEKong:
			self.lastWinScore = 0
		self.isMouseWin = False
		if finalTile in self.kingTiles:
			for winTile in self.canWinTiles:
				if winTile in self.kingTiles:
					if self.game_mode == const_tykddmj.KING_GAME_MODE and self.ting_mouse == 1:
						canWinCopyTiles = list(self.canWinTiles)
						for t in self.canWinTiles:
							if t % 10 < 6 and t < const.BOUNDARY:
								canWinCopyTiles.remove(t)
						if sorted(canWinCopyTiles) != sorted(self.kingTiles):
							handTilesButKingcopyc = list(handTilesButKing)
							handTilesButKingcopyc.append(winTile)
							if self.kingTiles[0] % 10 == 9 and kingTilesNum == 1 and finalTile in self.kingTiles and len(handTilesButKingcopyc) % 3 == 2 and utility.meld_with_pair_need_num(handTilesButKingcopyc) <= 0:
								pass
							else:
								continue
						if kingTilesNum <= 1:
							if utility.meld_with_pair_need_num(handCopyTiles) <= 0:
								base_score = winTile % 10
								break
							else:
								kingCopyTiles = list(self.kingTiles)
								kingCopyTiles.remove(finalTile)
								if len(kingCopyTiles) > 0:
									handTilesButKingcopy = list(handTilesButKing)
									handTilesButKingcopy.append(kingCopyTiles[0])
									if utility.meld_with_pair_need_num(handTilesButKingcopy) <= 0:
										if kingCopyTiles[0] > const.BOUNDARY:
											base_score = 10
										elif base_score < kingCopyTiles[0] % 10:
											base_score = kingCopyTiles[0] % 10
										break
								elif winTile > const.BOUNDARY:
									base_score = 10
									break
								elif base_score < winTile % 10:
									base_score = winTile % 10
						elif kingTilesNum > 1:
							handTilesButKingCopy = list(handTilesButKing)
							handTilesButKingCopy.append(winTile)
							if utility.meld_with_pair_need_num(handTilesButKingCopy) <= kingTilesNum - 1:
								base_score = winTile % 10
								break
							else:
								kingCopyTiles = list(self.kingTiles)
								kingCopyTiles.remove(finalTile)
								if len(kingCopyTiles) > 0:
									base_score = kingCopyTiles[0] % 10
									break
								elif winTile > const.BOUNDARY:
									base_score = 10
									break
								elif base_score < winTile % 10:
									base_score = winTile % 10
					else:
						continue
				elif winTile > const.BOUNDARY:
					base_score = 10
					break
				elif base_score < winTile % 10:
					base_score = winTile % 10
		elif finalTile > const.BOUNDARY:
			base_score = 10
		else:
			base_score = finalTile % 10
		if not isCheckEKong:
			self.lastWinScore = base_score

		is_ekongwin, _ = self.is_kongkai_win()

		# 十三幺
		if self.game_mode == const_tykddmj.SPECIAL_GAME_MODE:
			if self.is_win_limit(finalTile, win_op) == False:
				return False, base_score, result_list
			if utility_tykddmj.getThirteenOrphans(handTilesButKing, kingTilesNum):
				result_list[5] = 1
				# DEBUG_MSG("room:{},curround:{} isThirteenOrphans".format(self.roomIDC, self.current_round))
				return True, utility_tykddmj.multiplyCalc(self.game_mode, win_op, result_list, base_score, is_ekongwin, self.special_mul), result_list

		# 先判断3N2牌型是否有耗子吊将,如果不是,就什么都不做
		firstIsMouseGeneral = False
		if kingTilesNum > 0 and self.mouse_general == 1:
			if utility.winWith3N2NeedKing(handTilesButKing) <= kingTilesNum:
				result_list[0] = 1
				isMouseGeneral = utility_tykddmj.isMouseGeneral(handTiles, handTilesButKing, kingTilesNum, self.kingTiles, finalTile)
				if isMouseGeneral:
					firstIsMouseGeneral = True

		# 2N
		result_list = [0] * 6
		is7Pair, isBaoTou, kongNum = utility_tykddmj.checkIs7Pair(handCopyTiles, handTilesButKing, kingTilesNum, self.kingTiles,
														  finalTile)
		if is7Pair and not firstIsMouseGeneral and ((self.game_mode == const_tykddmj.KING_GAME_MODE and self.seven_pair == 1) or self.game_mode != const_tykddmj.KING_GAME_MODE):
			# DEBUG_MSG(
			# 	"room:{},curround:{} is7Pair isBaoTou:{} kongNum:{}".format(self.roomIDC, self.current_round, isBaoTou,
			# 																kongNum))
			# if not isBaoTou:
			result_list[2] = 1
			if kongNum > 0:
				result_list[3] = 1
			if isBaoTou and self.king_num >= 1:
				if self.mouse_general == 1:
					if self.is_win_limit(finalTile, win_op) == False and self.mouse_general_onetwo == 0:
						return False, base_score, result_list
					if win_op != const.OP_DRAW_WIN:
						return False, base_score, result_list
					# kingKongList = [1 if op == const.OP_DISCARD else -1 for op in utility.serialKingKong(p.op_r, self.kingTiles)]
					# result_list.extend(kingKongList)
					# DEBUG_MSG("room:{},curround:{} is7Pair diaojiang".format(self.roomIDC, self.current_round))
					if self.game_mode != const_tykddmj.SPECIAL_GAME_MODE:
						if not isCheckEKong:
							self.lastWinScore = 20
						self.isMouseWin = True
						return True, 20, result_list
				if self.is_win_limit(finalTile, win_op) == False:
					return False, base_score, result_list
				return True, utility_tykddmj.multiplyCalc(self.game_mode, win_op, result_list, base_score, is_ekongwin, self.special_mul), result_list
			elif kingTilesNum <= 0:
				if self.is_win_limit(finalTile, win_op) == False:
					return False, base_score, result_list
				# DEBUG_MSG("room:{},curround:{} is7Pair not diaojiang kingNum:0".format(self.roomIDC, self.current_round))
				return True, utility_tykddmj.multiplyCalc(self.game_mode, win_op, result_list, base_score, is_ekongwin, self.special_mul), result_list
			# DEBUG_MSG("room:{},curround:{} is7Pair not diaojiang kingNum>0".format(self.roomIDC, self.current_round))
			if self.is_win_limit(finalTile, win_op) == False:
				return False, base_score, result_list
			return True, utility_tykddmj.multiplyCalc(self.game_mode, win_op, result_list, base_score, is_ekongwin, self.special_mul), result_list

		# 3N2
		result_list = [0] * 6
		if kingTilesNum <= 0:  # 无财神(只要满足能胡就可以胡)
			if self.is_win_limit(finalTile, win_op) == False:
					return False, base_score, result_list
			# DEBUG_MSG("room:{},curround:{} kingTilesNum <= 0".format(self.roomIDC, self.current_round))
			if utility.meld_with_pair_need_num(handTilesButKing) <= kingTilesNum:
				if self.game_mode == const_tykddmj.SPECIAL_GAME_MODE:
					if utility.getTileColorType(handTilesButKing, uptiles) == const.SAME_SUIT:
						result_list[1] = 1
					elif utility_tykddmj.checkIsOneDragon(handTilesButKing):
						result_list[4] = 1
				else:
					result_list[0] = 1
				# DEBUG_MSG("room:{},curround:{} 3N2 kingNum:0".format(self.roomIDC, self.current_round))
				return True, utility_tykddmj.multiplyCalc(self.game_mode, win_op, result_list, base_score, is_ekongwin, self.special_mul), result_list
			# DEBUG_MSG("room:{},curround:{} 3 handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.roomIDC,
			# 																					self.current_round,
			# 																					handTiles, finalTile,
			# 																					win_op, idx))
			return False, base_score, result_list
		else:  # 有财神
			if utility.winWith3N2NeedKing(handTilesButKing) <= kingTilesNum:
				result_list[0] = 1
				# DEBUG_MSG(
				# 	"room:{},curround:{} 3N win_op:{} finalTile:{}".format(self.roomIDC, self.current_round, win_op,
				# 														   finalTile))
				if self.mouse_general == 1:
					if self.is_win_limit(finalTile, win_op) == False and self.mouse_general_onetwo == 0:
						return False, base_score, result_list
					isMouseGeneral = utility_tykddmj.isMouseGeneral(handTiles, handTilesButKing, kingTilesNum, self.kingTiles,
															finalTile)
					if isMouseGeneral and win_op != const.OP_DRAW_WIN:
						# DEBUG_MSG(
						# 	"room:{},curround:{} 3N win_op:{} isMouseGeneral:{}".format(self.roomIDC, self.current_round,
						# 																win_op, isMouseGeneral))
						return False, base_score, result_list
					elif isMouseGeneral and win_op == const.OP_DRAW_WIN:
						if not isCheckEKong:
							self.lastWinScore = 20
						self.isMouseWin = True
						return True, 20, result_list
				if self.is_win_limit(finalTile, win_op) == False:
					return False, base_score, result_list
				return True, utility_tykddmj.multiplyCalc(self.game_mode, win_op, result_list, base_score, is_ekongwin, self.special_mul), result_list
			# DEBUG_MSG("room:{},curround:{} 4 handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.roomIDC,
			# 																					self.current_round,
			# 																					handTiles, finalTile,
			# 																					win_op, idx))
			return False, base_score, result_list

	def cal_win_score(self, idx, fromIdx, score, tile, aid):
		# 胡牌算分
		reward_list = [0, 10, 30, 50, 100]
		score_mul = self.player_num - 1
		if self.players_list[fromIdx].discard_state == const_tykddmj.DISCARD_FREE:
			self.players_list[fromIdx].add_score(-score * score_mul)
			self.players_list[idx].add_score(score * score_mul)
			if self.reward == 1:
				self.players_list[fromIdx].add_score(-reward_list[self.players_list[idx].discard_king_times] * score_mul)
				self.players_list[idx].add_score(reward_list[self.players_list[idx].discard_king_times] * score_mul)
		else:
			for i, p in enumerate(self.players_list):
				if p and i != idx:
					p.add_score(-score)
				elif p and i == idx:
					p.add_score(score * score_mul)
			if self.reward == 1:
				for i, p in enumerate(self.players_list):
					if p and i != idx:
						p.add_score(-reward_list[self.players_list[idx].discard_king_times])
					elif p and i == idx:
						p.add_score(reward_list[self.players_list[idx].discard_king_times] * score_mul)
		if self.add_dealer == 1:
			if aid == const.OP_DRAW_WIN:
				if idx == self.dealer_idx:
					for i, p in enumerate(self.players_list):
						if p and i != idx:
							p.add_score(-10)
						elif p and i == idx:
							p.add_score(10 * score_mul)
				elif idx != self.dealer_idx:
					self.players_list[self.dealer_idx].add_score(-10)
					self.players_list[idx].add_score(10)
			elif aid != const.OP_DRAW_WIN:
				if idx == self.dealer_idx:
					if self.players_list[fromIdx].discard_state == const_tykddmj.DISCARD_FREE:
						self.players_list[fromIdx].add_score(-5 * score_mul)
						self.players_list[idx].add_score(5 * score_mul)
					if self.players_list[fromIdx].discard_state == const_tykddmj.DISCARD_FORCE:
						for i, p in enumerate(self.players_list):
							if p and i != idx:
								p.add_score(-5)
							elif p and i == idx:
								p.add_score(5 * score_mul)
				elif idx != self.dealer_idx:
					if self.players_list[fromIdx].discard_state == const_tykddmj.DISCARD_FREE:
						self.players_list[fromIdx].add_score(-5)
						self.players_list[idx].add_score(5)
					if self.players_list[fromIdx].discard_state == const_tykddmj.DISCARD_FORCE:
						self.players_list[self.dealer_idx].add_score(-5)
						self.players_list[idx].add_score(5)

	def red_score(self, idx, fromIdx, aid, tile):
		# 被抢杠，之前的杠分扣除
		base_score = 0
		score_mul = self.player_num - 1
		if tile > const.BOUNDARY:
			base_score = 10
		else:
			base_score = tile % 10
		if tile in self.kingTiles and self.game_mode == const_tykddmj.KING_GAME_MODE:
			base_score = 20
		if aid == const.OP_EXPOSED_KONG:  # 明杠
			if self.players_list[fromIdx].discard_state == const_tykddmj.DISCARD_FREE and self.bao_kong != 1:
				self.players_list[fromIdx].add_score(base_score * score_mul)
				self.players_list[idx].add_score(-base_score * score_mul)
			else:
				for i, p in enumerate(self.players_list):
					if p and i != idx:
						p.add_score(base_score)
					elif p and i == idx:
						p.add_score(-base_score * score_mul)
		elif aid == const.OP_CONTINUE_KONG:  # 碰后接杠
			for i, p in enumerate(self.players_list):
				if p and i != idx:
					p.add_score(base_score)
				elif p and i == idx:
					p.add_score(-base_score * score_mul)
		elif aid == const.OP_CONCEALED_KONG:
			pass

	def cal_score(self, idx, fromIdx, aid, score, tile=None):
		# 算分
		score_mul = self.player_num - 1
		if aid == const.OP_EXPOSED_KONG:
			base_score = 0
			if tile > const.BOUNDARY:
				base_score = 10
			else:
				base_score = tile % 10
			if tile in self.kingTiles and self.game_mode == const_tykddmj.KING_GAME_MODE:
				base_score = 20
			if self.players_list[fromIdx].discard_state == const_tykddmj.DISCARD_FREE and self.bao_kong != 1:
				self.players_list[fromIdx].add_score(-base_score * score_mul)
				self.players_list[idx].add_score(base_score * score_mul)
			else:
				for i, p in enumerate(self.players_list):
					if p and i != idx:
						p.add_score(-base_score)
					elif p and i == idx:
						p.add_score(base_score * score_mul)
		elif aid == const.OP_CONTINUE_KONG:
			base_score = 0
			if tile > const.BOUNDARY:
				base_score = 10
			else:
				base_score = tile % 10
			if tile in self.kingTiles and self.game_mode == const_tykddmj.KING_GAME_MODE:
				base_score = 20
			for i, p in enumerate(self.players_list):
				if p and i != idx:
					p.add_score(-base_score)
				elif p and i == idx:
					p.add_score(base_score * score_mul)
		elif aid == const.OP_CONCEALED_KONG:
			base_score = 0
			if tile > const.BOUNDARY:
				base_score = 10
			else:
				base_score = tile % 10
			if tile in self.kingTiles and self.game_mode == const_tykddmj.KING_GAME_MODE:
				base_score = 20
			for i, p in enumerate(self.players_list):
				if p and i != idx:
					p.add_score(-base_score * 2)
				elif p and i == idx:
					p.add_score(base_score * score_mul * 2)
		elif aid == const.OP_DRAW_WIN:  # 自摸胡
			DEBUG_MSG("room:{0},curround:{1} OP_DRAW_WIN==>idx:{2}".format(self.roomIDC, self.current_round, idx))
			self.cal_win_score(idx, fromIdx, score, tile, aid)
		elif aid == const.OP_KONG_WIN:  # 抢杠胡跟放炮胡一样
			DEBUG_MSG("room:{0},curround:{1} OP_KONG_WIN==>idx:{2}]".format(self.roomIDC, self.current_round, idx))
			self.cal_win_score(idx, fromIdx, score, tile, aid)
		elif aid == const.OP_GIVE_WIN:  # 放炮胡
			DEBUG_MSG("room:{0},curround:{1} OP_GIVE_WIN==>idx:{2}]".format(self.roomIDC, self.current_round, idx))
			self.cal_win_score(idx, fromIdx, score, tile, aid)
		elif aid == const.OP_WREATH_WIN:
			pass
