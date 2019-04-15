# -*- coding: utf-8 -*-

import copy
import json
import random
import time
from datetime import datetime

import switch
import utility
from KBEDebug import *
from Room import Room
from gsjmj.utility_gsjmj import *


class Room_GSJMJ(Room):
	"""
	这是一个游戏房间/桌子类
	该类处理维护一个房间中的实际游戏， 例如：斗地主、麻将等
	该房间中记录了房间里所有玩家的mailbox，通过mailbox我们可以将信息推送到他们的客户端。
	"""

	def __init__(self):
		Room.__init__(self)
		self.tiles = []

		# 做庄记录 0 闲  1 庄 2 流局庄
		self.dealer_record = [[] for i in range(self.player_num)]
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

		# 不能弃先胡后
		# idx = {op:[tile,]}
		self.op_limit = {}

	def _reset(self):
		self.state = const.ROOM_WAITING
		self.players_list = [None] * self.player_num
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
			if p and p.userId != avt_mb.userId:
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
		DEBUG_MSG("{} broadcastRoundEnd state:{}".format(self.prefixLogStr, self.state))
		info['left_tiles'] = self.tiles
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]

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

	# 扣房卡/钻石成功后开始游戏(不改动部分)
	def paySuccessCbk(self):
		DEBUG_MSG("{} paySuccessCbk state:{}".format(self.prefixLogStr, self.state))
		try:
			# 第一局时房间默认房主庄家, 之后谁上盘赢了谁是, 如果臭庄, 上一把玩家继续坐庄
			swap_list = [p.idx for p in self.players_list]
			if self.current_round == 0:
				self.origin_players_list = self.players_list[:]
				self.dealer_idx = 0
			# self.swapSeat(swap_list)

			self.op_record = []
			# self.op_special_record = []
			self.state = const.ROOM_PLAYING
			self.current_round += 1
			self.all_discard_tiles = []
			self.op_limit = {}
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
				self.startGame(beginTilesList, swap_list)

			if switch.DEBUG_BASE == 0:
				begin([], [[] for i in range(self.player_num)], [])
			elif switch.DEBUG_BASE == 1:  # 开发模式 除去不必要的通信时间 更接近 真实环境
				prefabKingTiles = []
				prefabHandTiles = [[1, 1, 1, 2, 2, 2, 3, 3, 3, 77, 77, 77, 3], [], [], []]
				prefabTopList = []
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

				utility.getDebugPrefab(self.origin_players_list[0].accountName, callback, DEBUG_JSON_NAME)
		except:
			err, msg, stack = sys.exc_info()
			DEBUG_MSG("{} paySuccessCbk error; exc_info: {} ,{}".format(self.prefixLogStr, err, msg))
			DEBUG_MSG("{} consume failed! users: {}".format(self.prefixLogStr, [p.userId for p in self.origin_players_list if p]))

	# 玩家开始游戏
	def startGame(self, beginTilesList, swap_list):
		self.wait_force_delay_kong_draw = False
		DEBUG_MSG("{} start game swap_list:{}".format(self.prefixLogStr, swap_list))
		diceList = self.throwDice([self.dealer_idx])
		idx, num = self.getMaxDiceIdx(diceList)
		if self.current_round == 0:
			self.dealer_idx = idx
			self.current_idx = idx
		self.update_dealer_record()
		DEBUG_MSG("{} start game info:{},{},{},{},{},{}".format(self.prefixLogStr, self.dealer_idx, self.wreathsList, self.kingTiles, self.prevailing_wind, self.windsList, diceList))
		for i, p in enumerate(self.players_list):
			if p and p:
				DEBUG_MSG("{} start tiles:{}".format(self.prefixLogStr, p.tiles))
		for i, p in enumerate(self.players_list):
			if p and p:
				DEBUG_MSG("{} start begin tiles:{}".format(self.prefixLogStr, beginTilesList[i]))
				p.startGame({
					'dealer_idx': self.dealer_idx,
					'beginTilesList': beginTilesList[i],
					'wreathsList': self.wreathsList,
					'kingTiles': self.kingTiles,
					'prevailing_wind': self.prevailing_wind,
					'windsList': self.windsList,
					'diceList': diceList,
					'swapList': swap_list,
					'curRound': self.current_round
				})
		self.begin_record_game(diceList)

	def cutAfterKong(self):
		if len(self.tiles) <= self.lucky_num + END_TILE_NUMBER:
			self.drawEnd()
		elif len(self.tiles) > self.lucky_num + END_TILE_NUMBER + 1:
			player = self.players_list[self.current_idx]
			ti = self.tiles[0]
			self.tiles = self.tiles[1:]
			player.cutTile(ti)

	def beginRound(self, is_first=False):
		if len(self.tiles) <= self.lucky_num + END_TILE_NUMBER:
			self.drawEnd()
			return
		ti = self.tiles[0]
		self.tiles = self.tiles[1:]
		DEBUG_MSG("{} idx:{} beginRound tile:{} leftNum:{}".format(self.prefixLogStr, self.current_idx, ti, len(self.tiles)))
		p = self.players_list[self.current_idx]
		p.drawTile(ti, is_first)

	def drawEnd(self):
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
		self.dealer_record[self.dealer_idx][-1] = ROUND_RESULT_END

		change_dealer = False
		for p in self.players_list:
			concealed_kong = sum([1 for op in p.op_r if op[0] == const.OP_CONCEALED_KONG])
			exposed_kong = sum([1 for op in p.op_r if op[0] == const.OP_EXPOSED_KONG])
			continue_kong = sum([1 for op in p.op_r if op[0] == const.OP_CONTINUE_KONG])
			if concealed_kong + exposed_kong + continue_kong > 0:
				change_dealer = True
				break
		if change_dealer:
			self.dealer_idx = (self.dealer_idx + 1) % self.player_num

		DEBUG_MSG("{} drawEnd INFO:{}".format(self.prefixLogStr, info))
		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def winGame(self, idx, op, finalTile, from_idx, score, result):
		self.broadcastWinOperation(idx, op, result)
		""" 座位号为idx的玩家胡牌 """
		self.cal_score(idx, from_idx, op, score)

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
		info['continuous_dealer'] = min(self.max_add_dealer, max(get_continuous_dealer(self.dealer_record[self.dealer_idx]) - 1, 0))
		if self.add_dealer == 1:
			if get_continuous_dealer(self.dealer_record[self.dealer_idx]) >= 5:
				self.dealer_idx = (self.dealer_idx + 1) % self.player_num
			else:
				if idx != self.dealer_idx:
					self.dealer_idx = (self.dealer_idx + 1) % self.player_num
		else:
			if idx != self.dealer_idx:
				self.dealer_idx = (self.dealer_idx + 1) % self.player_num

		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

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
		DEBUG_MSG("{} endAll player_info_list = {}  info = {}".format(self.prefixLogStr, player_info_list, info))

		self.end_record_game(info)
		self.saveRoomResult()

		for p in self.players_list:
			if p:
				p.finalResult(player_info_list, info)
				# 有效圈数加一
				if self.room_type == const.CLUB_ROOM:
					p.addGameCount()

		self.addAvatarGameRound()

		self._reset()

	def subtotal_result(self):
		self.dismiss_timer = None
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None]
		DEBUG_MSG("{} subtotal_result,player_info_list:{}".format(self.prefixLogStr, player_info_list))

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

		DEBUG_MSG("{} idx:{} doOperation current_idx:{} aid:{} tile_list:{}".format(self.prefixLogStr, idx, self.current_idx, aid, tile_list))
		"""
		当前控牌玩家摸牌后向服务端确认的操作
		"""
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < self.dismissRoomSecends:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("{} idx:{} doOperationFailed dismiss_room_ts:{}".format(self.prefixLogStr, idx, self.dismiss_room_ts))
			avt_mb.doOperationFailed(const.OP_ERROR_VOTE)
			# return
		if self.state != const.ROOM_PLAYING:
			DEBUG_MSG("{} idx:{} doOperationFailed state:{}".format(self.prefixLogStr, idx, self.state))
			avt_mb.doOperationFailed(const.OP_ERROR_STATE)
			return

		# DEBUG_MSG("doOperation idx:{0},self.current_idx:{1},self.wait_op_info_list:{2}".format(idx, self.current_idx, self.wait_op_info_list))
		if idx != self.current_idx:
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return
		p = self.players_list[idx]
		if aid == const.OP_DISCARD and self.can_discard(idx, tile):
			self.all_discard_tiles.append(tile)
			self.clear_op_limit(idx)
			p.discardTile(tile)
		elif aid == const.OP_CONCEALED_KONG and self.can_concealed_kong(idx, tile):
			p.concealedKong(tile)
		elif aid == const.OP_KONG_WREATH and self.can_kong_wreath(p.tiles, tile):
			p.kongWreath(tile)
		elif aid == const.OP_CONTINUE_KONG and self.can_continue_kong(idx, tile):
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
			temp_wait_op_info_list = copy.deepcopy(self.wait_op_info_list)
			self.wait_op_info_list = []
			self.record_pass_op(temp_wait_op_info_list)
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
					if lastAid == const.OP_WREATH_WIN:
						self.current_idx = self.last_player_idx
					elif lastAid == const.OP_KONG_WIN:
						# *********没人抢杠胡 杠要算分？***********
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
		else:
			DEBUG_MSG("{} nobody waitForOperation from:{},aid:{},tile:{},nextIdx:{}".format(self.prefixLogStr, idx, aid, tile, nextIdx))
			if self.can_cut_after_kong() and (aid >> 3) == const.SHOW_KONG:
				self.cutAfterKong()
			self.current_idx = self.nextIdx if nextIdx < 0 else nextIdx
			self.beginRound()

	def get_init_client_dict(self):
		return {
			'roomID': self.roomIDC,
			'ownerId': self.owner_uid,
			'roomType': self.room_type,
			'dealerIdx': self.dealer_idx,
			'curRound': self.current_round,
			'game_round': self.game_round,
			'player_num': self.player_num,
			'king_num': self.king_num,
			'pay_mode': self.pay_mode,
			'game_mode': self.game_mode,
			'game_max_lose': self.game_max_lose,
			'lucky_num': self.lucky_num,
			'hand_prepare': self.hand_prepare,
			'base_score': self.base_score,
			'win_mode': self.win_mode,
			'suit_mode': self.suit_mode,
			'job_mode': self.job_mode,
			'add_dealer': self.add_dealer,
			'club_id': self.club_id,
			'table_idx': getattr(self, 'table_idx', -1),
			'player_base_info_list': [p.get_init_client_dict() for p in self.players_list if p is not None],
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(ROOM_PLAYER_NUMBER)],
		}

	def get_club_complete_dict(self):
		d = {
			'gameType': self.gameTypeC,
			'roomID': self.roomIDC,
			'time': utility.get_cur_timestamp(),
			'game_round': self.game_round,
			'pay_mode': self.pay_mode,
			'roundResult': json.dumps(self.game_result.get('round_result', [])),
			'player_info_list': [p.get_club_client_dict() for p in self.origin_players_list if p is not None],
		}
		# 第二局开始扣房卡的
		if self.current_round >= 2:
			d['cost'] = utility.calc_cost(self.gameTypeC, self.roomParamsC)[0]
		else:
			d['cost'] = 0
		return d

	def get_reconnect_room_dict(self, userId):
		dismiss_left_time = self.dismissRoomSecends - (int(time.time() - self.dismiss_room_ts))
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
		DEBUG_MSG('{} reconnect_room waitAidList:{}'.format(self.prefixLogStr, waitAidList))
		return {
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
			'job_mode': self.job_mode,
			'gameType': self.gameTypeC,
		}

	def record_round_result(self):
		# 玩家记录当局战绩
		d = datetime.fromtimestamp(time.time())
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
			'gameMaxLose': self.game_max_lose,
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
				p and p.save_game_result(result_str)

	def save_club_result(self):
		DEBUG_MSG('{} ------ save club result -----'.format(self.prefixLogStr))
		d = self.get_club_complete_dict()
		self.base.saveClubResult(d)
		if 'round_result' in self.game_result and len(self.game_result['round_result']) > 0:
			self.base.updateClubDAU([p.get_dau_client_dict() for p in self.players_list if p is not None])

	def saveRoomResult(self):
		# 保存玩家的战绩记录
		self.save_game_result()
		# 保存茶楼的战绩
		if self.room_type == const.CLUB_ROOM:
			self.save_club_result()

	def addAvatarGameRound(self):
		for p in self.players_list:
			if p is not None:
				p.base.addAvatarGameRound(self.gameTypeC, 1)

	def update_dealer_record(self):
		idx = self.dealer_idx
		for i in range(self.player_num):
			self.dealer_record[i].append(ROUND_RESULT_DEALER if idx == i else ROUND_RESULT_PLAYER)

	def timeoutDestroy(self):
		INFO_MSG("{} timeout destroyed. room_type = {}, owner_uid = {}".format(self.prefixLogStr, self.room_type, self.owner_uid))
		if self.current_round < 1:
			self.dropRoom()

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
		self.prevailing_wind = const.WINDS[(self.prevailing_wind + 1 - const.WIND_EAST) % len(const.WINDS)] if minDearerNum >= 1 else self.prevailing_wind
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
		if self.game_mode == WIND_GAME_MODE:
			# 东 西 南 北
			self.tiles += [const.WIND_EAST, const.WIND_SOUTH, const.WIND_WEST, const.WIND_NORTH] * 4
			# 中 发 白
			self.tiles += [const.DRAGON_RED, const.DRAGON_GREEN, const.DRAGON_WHITE] * 4
		# # 春 夏 秋 冬
		# self.tiles += [const.SEASON_SPRING, const.SEASON_SUMMER, const.SEASON_AUTUMN, const.SEASON_WINTER]
		# # 梅 兰 竹 菊
		# self.tiles += [const.FLOWER_PLUM, const.FLOWER_ORCHID, const.FLOWER_BAMBOO, const.FLOWER_CHRYSANTHEMUM]
		DEBUG_MSG("{} init tiles:{}".format(self.prefixLogStr, self.tiles))
		self.shuffle_tiles()

	def shuffle_tiles(self):
		random.shuffle(self.tiles)
		DEBUG_MSG("{} shuffle tiles:{}".format(self.prefixLogStr, self.tiles))

	def deal(self, prefabHandTiles, prefabTopList):
		""" 发牌 """
		if prefabHandTiles is not None:
			for i, p in enumerate(self.players_list):
				if p is not None and len(prefabHandTiles) >= 0:
					p.tiles = prefabHandTiles[i] if len(prefabHandTiles[i]) <= INIT_TILE_NUMBER else prefabHandTiles[i][0:INIT_TILE_NUMBER]
			topList = prefabTopList if prefabTopList is not None else []
			allTiles = []
			for i, p in enumerate(self.players_list):
				if p is not None:
					allTiles.extend(p.tiles)
			allTiles.extend(topList)

			tile2NumDict = utility.getTile2NumDict(allTiles)
			warning_tiles = [t for t, num in tile2NumDict.items() if num > 4]
			if len(warning_tiles) > 0:
				WARNING_MSG("{} prefab {} is larger than 4.".format(self.prefixLogStr, warning_tiles))
			for t in allTiles:
				if t in self.tiles:
					self.tiles.remove(t)
			for i in range(INIT_TILE_NUMBER):
				num = 0
				for j in range(self.player_num):
					if len(self.players_list[j].tiles) >= INIT_TILE_NUMBER:
						continue
					self.players_list[j].tiles.append(self.tiles[num])
					num += 1
				self.tiles = self.tiles[num:]

			newTiles = topList
			newTiles.extend(self.tiles)
			self.tiles = newTiles
		else:
			for i in range(INIT_TILE_NUMBER):
				for j in range(self.player_num):
					self.players_list[j].tiles.append(self.tiles[j])
				self.tiles = self.tiles[self.player_num:]

		for i, p in enumerate(self.players_list):
			DEBUG_MSG("{} idx:{} deal tiles:{}".format(self.prefixLogStr, i, p.tiles))

	def kongWreath(self):
		""" 杠花 """
		for i in range(self.player_num):
			for j in range(len(self.players_list[i].tiles) - 1, -1, -1):
				tile = self.players_list[i].tiles[j]
				if tile in const.SEASON or tile in const.FLOWER:
					del self.players_list[i].tiles[j]
					self.players_list[i].wreaths.append(tile)
					DEBUG_MSG("{} kong wreath, idx:{},tile:{}".format(self.prefixLogStr, i, tile))

	def addWreath(self):
		""" 补花 """
		for i in range(self.player_num):
			while len(self.players_list[i].tiles) < INIT_TILE_NUMBER:
				if len(self.tiles) <= 0:
					break
				tile = self.tiles[0]
				self.tiles = self.tiles[1:]
				if tile in const.SEASON or tile in const.FLOWER:
					self.players_list[i].wreaths.append(tile)
					DEBUG_MSG("{} add wreath, tile is wreath,idx:{},tile:{}".format(self.prefixLogStr, i, tile))
				else:
					self.players_list[i].tiles.append(tile)
					DEBUG_MSG("{} add wreath, tile is not wreath, idx:{},tile:{}".format(self.prefixLogStr, i, tile))

	def rollKingTile(self, prefabKingTiles):
		""" 财神 """
		self.kingTiles = []
		if prefabKingTiles is not None and len(prefabKingTiles) > 0:
			if self.king_num > 0:
				self.kingTiles.extend(prefabKingTiles)
				for t in prefabKingTiles:
					t in self.tiles and self.tiles.remove(t)
		else:
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

	def circleSameTileNum(self, idx, t):
		"""获取一圈内打出同一张牌的张数"""
		discard_num = 0
		for record in reversed(self.op_record):
			if record[1] == idx:
				break
			if record[0] == const.OP_DISCARD and record[3][0] == t:
				discard_num += 1
		return discard_num

	def is_op_limit(self, idx, op, t):
		if idx in self.op_limit:
			limit = self.op_limit[idx]
			if op in limit:
				return t in limit[op]
		return False

	def add_limit_tiles(self, idx, aid, tiles):
		_ops = self.op_limit.get(idx, {})
		ts = _ops.get(aid, [])
		ts.extend(tiles)
		_ops[aid] = ts
		self.op_limit[idx] = _ops

	def clear_op_limit(self, idx):
		# 清除出牌限制
		if idx in self.op_limit:
			del self.op_limit[idx]

	def can_cut_after_kong(self):
		return False

	def can_discard(self, idx, t):
		return t in self.players_list[idx].tiles

	def can_chow(self, idx, t):
		return False

	def can_chow_list(self, idx, tile_list):
		return False

	def can_pong(self, idx, t):
		""" 能碰 """
		if self.circleSameTileNum(idx, t) >= 2:
			return False
		tiles = self.players_list[idx].tiles
		if t in self.kingTiles:
			return False
		return tiles.count(t) >= 2

	def can_exposed_kong(self, idx, t):
		""" 能明杠 """
		if t in self.kingTiles:
			return False
		tiles = self.players_list[idx].tiles
		return tiles.count(t) == 3

	def can_continue_kong(self, idx, t):
		""" 能够补杠 """
		if t in self.kingTiles:
			return False
		player = self.players_list[idx]
		for op in player.op_r:
			if op[0] == const.OP_PONG and op[1][0] == t:
				return True
		return False

	def can_concealed_kong(self, idx, t):
		""" 能暗杠 """
		tiles = self.players_list[idx].tiles
		return tiles.count(t) == 4

	def can_kong_wreath(self, tiles, t):
		if t in tiles and (t in const.SEASON or t in const.FLOWER):
			return True
		return False

	def can_wreath_win(self, wreaths):
		if len(wreaths) == len(const.SEASON) + len(const.FLOWER):
			return True
		return False

	def getNotifyOpList(self, idx, aid, tile):
		# notifyOpList 和 self.wait_op_info_list 必须同时操作
		# 数据结构：问询玩家，操作玩家，牌，操作类型，得分，结果，状态
		notifyOpList = [[] for i in range(self.player_num)]
		self.wait_op_info_list = []
		# 胡
		if aid == const.OP_KONG_WREATH and self.can_wreath_win(self.players_list[idx].wreaths):  # 8花胡
			opDict = {"idx": idx, "from": idx, "tileList": [tile, ], "aid": const.OP_WREATH_WIN, "score": 0, "result": [], "state": const.OP_STATE_WAIT}
			notifyOpList[idx].append(opDict)
			self.wait_op_info_list.append(opDict)
		elif aid == const.OP_EXPOSED_KONG:  # 直杠 抢杠胡
			wait_for_win_list = self.getKongWinList(idx, tile)
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
						opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_EXPOSED_KONG, "score": 0, "result": [], "state": const.OP_STATE_WAIT}
						self.wait_op_info_list.append(opDict)
						notifyOpList[i].append(opDict)
					if self.can_concealed_kong(i, tile):
						opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_CONCEALED_KONG, "score": 0, "result": [], "state": const.OP_STATE_WAIT}
						self.wait_op_info_list.append(opDict)
						notifyOpList[i].append(opDict)
					if self.can_pong(i, tile):
						opDict = {"idx": i, "from": idx, "tileList": [tile, ], "aid": const.OP_PONG, "score": 0, "result": [], "state": const.OP_STATE_WAIT}
						self.wait_op_info_list.append(opDict)
						notifyOpList[i].append(opDict)
			# 吃
			nextIdx = self.nextIdx
			if self.can_chow(nextIdx, tile):
				opDict = {"idx": nextIdx, "from": idx, "tileList": [tile, ], "aid": const.OP_CHOW, "score": 0, "result": [], "state": const.OP_STATE_WAIT}
				self.wait_op_info_list.append(opDict)
				notifyOpList[nextIdx].append(opDict)
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
			# DEBUG_MSG("{} getKongWinList {}".format(self.prefixLogStr, ask_idx))
			is_win, score, result = self.can_win(tryTiles, tile, const.OP_KONG_WIN, ask_idx)
			if is_win:
				wait_for_win_list.append({"idx": ask_idx, "from": idx, "tileList": [tile, ], "aid": const.OP_KONG_WIN, "score": score, "result": result, "state": const.OP_STATE_WAIT})
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
			# DEBUG_MSG("{} getGiveWinList {} tile {}".format(self.prefixLogStr, ask_idx, tile))
			is_win, score, result = self.can_win(tryTiles, tile, const.OP_GIVE_WIN, ask_idx)
			if is_win:
				wait_for_win_list.append({"idx": ask_idx, "from": idx, "tileList": [tile, ], "aid": const.OP_GIVE_WIN, "score": score, "result": result, "state": const.OP_STATE_WAIT})
		return wait_for_win_list

	def can_win(self, handTiles, finalTile, win_op, idx):
		""" 平胡 坎胡 吊胡 堆胡 坎堆胡 七对 清七对 清一色 一条龙 清一色套龙 十三幺 十三不靠"""
		result_list = [0] * 12
		score = 0

		if len(handTiles) % 3 != 2:
			# DEBUG_MSG("{} handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.prefixLogStr, handTiles, finalTile, win_op, idx))
			return False, 0, result_list
		if win_op == const.OP_WREATH_WIN:
			# DEBUG_MSG("{} handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.prefixLogStr, handTiles, finalTile, win_op, idx))
			return False, 0, result_list
		if win_op == const.OP_GIVE_WIN and finalTile in self.kingTiles:
			# DEBUG_MSG("{} handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.prefixLogStr, handTiles, finalTile, win_op, idx))
			return False, 0, result_list
		if win_op == const.OP_KONG_WIN and finalTile in self.kingTiles:
			# DEBUG_MSG("{} handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.prefixLogStr, handTiles, finalTile, win_op, idx))
			return False, 0, result_list
		if self.is_op_limit(idx, win_op, finalTile):
			# DEBUG_MSG("{} op_limit finalTile:{} win_op:{} idx:{}".format(self.prefixLogStr, handTiles, finalTile, win_op, idx))
			return False, 0, result_list

		p = self.players_list[idx]
		handCopyTiles = sorted(list(handTiles))
		kings, handTilesButKing = utility.classifyKingTiles(handCopyTiles, self.kingTiles)
		kingTilesNum = len(kings)

		def cal_edge(edge, mid, single, heap):
			has_heap = self.win_mode == 0
			has_king = self.king_num > 0
			cut = edge | mid  # 是不是砍
			data = [0] * 12
			score = 0
			if not has_king:
				if has_heap:
					if cut & heap:  # 坎堆胡
						data[4] = 1
						score += 2
					elif cut:  # 坎胡
						data[1] = 1
						score += 1
					elif single:  # 吊胡
						data[2] = 1
						score += 1
					if heap and not cut:  # 堆胡
						data[3] = 1
						score += 1
				else:
					if cut:  # 坎胡
						data[1] = 1
						score += 1
					elif single:  # 吊胡
						data[2] = 1
						score += 1
			return score, data

		def cal_type(score, data, uniform, dragon):
			if uniform & dragon:  # 清一色套龙
				data[9] = 1
				score += 10
			elif uniform:
				data[7] = 1
				score += 5
			elif dragon:
				data[8] = 1
				score += 5
			if sum(data) == 0:
				data[0] = 1  # 平胡
			return score, data

		is_heap = is_heap_color(handTilesButKing, p.upTiles, kingTilesNum)
		# 有财神的时候不用考虑堆胡
		if self.win_mode == 1 and not is_heap and self.king_num == 0:
			return False, 0, result_list

		if (self.suit_mode & SUIT_7PAI) == SUIT_7PAI:
			is7Pair, uniform, kongNum = checkIs7Pair(handTilesButKing, kingTilesNum)
			if is7Pair:
				# DEBUG_MSG("{} is7Pair".format(self.prefixLogStr))
				is_edge, is_mid, is_single = checkIsEdgeMidSingle(handCopyTiles, finalTile, kings)
				is_heap = is_heap_color(handTilesButKing, p.upTiles, kingTilesNum)
				score, result_list = cal_edge(is_edge == 1, is_mid == 1, is_single == 1, is_heap)
				score += 1
				if uniform:
					result_list[6] = 1
					score += 10
				else:
					result_list[5] = 1
					score += 5
				return True, score, result_list

		if (self.suit_mode & SUIT_13MISMATCH) == SUIT_13MISMATCH:
			if get13Mismatch(handCopyTiles, kings):
				# DEBUG_MSG("{} 13Mismatch".format(self.prefixLogStr))
				score = 1
				result_list[11] = 1
				return True, score, result_list

		if (self.suit_mode & SUIT_13ORPHAN) == SUIT_13ORPHAN:
			if getThirteenOrphans(handTilesButKing, kingTilesNum):
				# DEBUG_MSG("{} ThirteenOrphans".format(self.prefixLogStr))
				score = 1
				result_list[10] = 1
				return True, score, result_list

		# 3N2
		if kingTilesNum <= 0:  # 无财神(只要满足能胡就可以胡)
			# DEBUG_MSG("{} kingTilesNum <= 0".format(self.prefixLogStr))
			if utility.meld_with_pair_need_num(handTilesButKing) <= kingTilesNum:
				result_list[0] = 1
				# DEBUG_MSG("{} 3N2 kingNum:0".format(self.prefixLogStr))
				is_edge, is_mid, is_single = checkIsEdgeMidSingle(handCopyTiles, finalTile, kings)
				is_dragon = checkIsOneDragon(handCopyTiles, kingTilesNum, kings)
				is_uniform = is_uniform_color(handTilesButKing, p.upTiles)
				score, result_list = cal_edge(is_edge == 1, is_mid == 1, is_single == 1, is_heap)
				score, result_list = cal_type(score, result_list, is_uniform, is_dragon)
				score += 1
				return True, score, result_list
			# DEBUG_MSG("{} handTiles:{} finalTile:{} win_op:{} idx:{}".format(self.prefixLogStr, handTiles, finalTile, win_op, idx))
			return False, score, result_list
		else:
			if canWinWithKing3N2(handCopyTiles, kings):
				is_edge, is_mid, is_single = checkIsEdgeMidSingle(handCopyTiles, finalTile, kings)
				is_dragon = checkIsOneDragon(handCopyTiles, kingTilesNum, kings)
				is_uniform = is_uniform_color(handTilesButKing, p.upTiles)
				score, result_list = cal_edge(is_edge == 1, is_mid == 1, is_single == 1, is_heap)
				score, result_list = cal_type(score, result_list, is_uniform, is_dragon)
				score += 1
				return True, score, result_list
			return False, score, result_list

	def cal_score(self, idx, fromIdx, aid, score):
		target = self.players_list[idx]  # 获得分数的人或者赢家
		if aid == const.OP_EXPOSED_KONG:
			real = self.players_list[fromIdx].add_score(-score)
			target.add_score(-real)
		elif aid == const.OP_CONTINUE_KONG:
			# 如果是同一回合的碰后接杠
			pong_info = None
			for info in reversed(self.op_record[:-1]):
				if info[1] == idx and (info[0] == const.OP_PONG or info[0] == const.OP_CONCEALED_KONG):
					if info[0] == const.OP_PONG:
						pong_info = info
				else:
					break
			if pong_info is None:
				self.cal_score(idx, fromIdx, const.OP_CONCEALED_KONG, score)
			else:
				DEBUG_MSG("{} cal score same round OP_CONTINUE_KONG: idx {}; {} ===> {}".format(self.prefixLogStr, idx, pong_info, self.op_record))
				pong_idx = pong_info[1]
				pong_from_idx = pong_info[2]
				self.cal_score(pong_idx, pong_from_idx, const.OP_EXPOSED_KONG, score)
		elif aid == const.OP_CONCEALED_KONG:
			for i, p in enumerate(self.players_list):
				if i != idx:
					real = p.add_score(-score)
					target.add_score(-real)
		elif aid == const.OP_DRAW_WIN:
			if self.add_dealer == 1:
				ext_score = get_continuous_dealer(self.dealer_record[self.dealer_idx])
				ext_score = min(max(ext_score - 1, 0), self.max_add_dealer)
				if idx == self.dealer_idx:
					for i, p in enumerate(self.players_list):
						if i == idx: continue
						real = p.add_score(-score - ext_score)
						target.add_score(-real)
				else:
					for i, p in enumerate(self.players_list):
						if i == idx: continue
						real = p.add_score(-score)
						target.add_score(-real)
			else:
				ext_score = self.base_score
				if idx == self.dealer_idx:
					for i, p in enumerate(self.players_list):
						if i == idx: continue
						real = p.add_score(-score - ext_score)
						target.add_score(-real)
				else:
					for i, p in enumerate(self.players_list):
						if i == idx: continue
						if i == self.dealer_idx:
							real = p.add_score(-score - ext_score)
							target.add_score(-real)
						else:
							real = p.add_score(-score)
							target.add_score(-real)
		elif aid == const.OP_KONG_WIN:
			# 返还杠分
			kong_info = self.players_list[fromIdx].kong_record_list[-1]
			if kong_info[0] == const.OP_EXPOSED_KONG:
				del self.players_list[fromIdx].kong_record_list[-1]
				dest = self.players_list[kong_info[1]]
				src = self.players_list[kong_info[2]]
				real = dest.add_score(-1)
				src.add_score(-real)
			elif kong_info[0] == const.OP_CONTINUE_KONG:
				del self.players_list[fromIdx].kong_record_list[-1]
				# 如果是同一回合的碰后接杠
				pong_info = None
				last_kong_idx = kong_info[1]
				for info in reversed(self.op_record[:-2]):
					if info[1] == last_kong_idx and (info[0] == const.OP_PONG or info[0] == const.OP_CONCEALED_KONG):
						if info[0] == const.OP_PONG:
							pong_info = info
					else:
						break
				dest = self.players_list[kong_info[1]]
				if pong_info is None:
					dest = self.players_list[kong_info[1]]
					for i, p in enumerate(self.players_list):
						if i != kong_info[1]:
							real = dest.add_score(-1)
							p.add_score(-real)
				else:
					DEBUG_MSG("{} cal score same round OP_KONG_WIN: idx {}; {} ===> {}".format(self.prefixLogStr, idx, pong_info, self.op_record))
					pong_idx = pong_info[1]
					pong_from_idx = pong_info[2]
					self.players_list[pong_idx].add_score(-1)
					self.players_list[pong_from_idx].add_score(1)
			else:
				del self.players_list[fromIdx].kong_record_list[-1]
				dest = self.players_list[kong_info[1]]
				for i, p in enumerate(self.players_list):
					if i != kong_info[1]:
						real = dest.add_score(-1)
						p.add_score(-real)
			self.cal_score(idx, fromIdx, const.OP_GIVE_WIN, score)
		elif aid == const.OP_GIVE_WIN:
			if self.add_dealer == 1:
				ext_score = get_continuous_dealer(self.dealer_record[self.dealer_idx])
				ext_score = min(max(ext_score - 1, 0), self.max_add_dealer)
				total = 0
				if self.job_mode == 1:
					if idx == self.dealer_idx:
						for i, p in enumerate(self.players_list):
							if i == idx: continue
							total += score + ext_score
					else:
						for i, p in enumerate(self.players_list):
							if i == idx: continue
							total += score
					real = self.players_list[fromIdx].add_score(-total)
					target.add_score(-real)
				else:
					if idx == self.dealer_idx:
						real = self.players_list[fromIdx].add_score(-score - ext_score)
						target.add_score(-real)
					else:
						real = self.players_list[fromIdx].add_score(-score)
						target.add_score(-real)
			else:
				ext_score = self.base_score
				if self.job_mode == 1:
					total = 0
					if idx == self.dealer_idx:
						for i, p in enumerate(self.players_list):
							if i == idx: continue
							total += score + ext_score
					else:
						for i, p in enumerate(self.players_list):
							if i == idx: continue
							if i == self.dealer_idx:
								total += score + ext_score
							else:
								total += score
					real = self.players_list[fromIdx].add_score(-total)
					target.add_score(-real)
				else:
					if idx == self.dealer_idx:
						real = self.players_list[fromIdx].add_score(-score - ext_score)
						target.add_score(-real)
					else:
						if fromIdx == self.dealer_idx:
							real = self.players_list[fromIdx].add_score(-score - ext_score)
						else:
							real = self.players_list[fromIdx].add_score(-score)
						target.add_score(-real)
		elif aid == const.OP_WREATH_WIN:
			pass

	def record_pass_op(self, wait_op_info_list):
		# 记录出牌限制
		if len(wait_op_info_list) == 0:
			return
		# idx (aid - data)
		wait_op_info_dict = {}
		for op_dict in wait_op_info_list:
			aid = op_dict['aid']
			tiles = op_dict['tileList']
			state = op_dict['state']
			idx = op_dict['idx']
			wait_op_info_dict[(idx, aid)] = (tiles, state)

		idx_aids = wait_op_info_dict.keys()

		for idx_aid in idx_aids:
			idx = idx_aid[0]
			aid = idx_aid[1]
			op_info = wait_op_info_dict[idx_aid]
			tile_list = op_info[0]
			if op_info[1] == const.OP_STATE_PASS:
				if aid == const.OP_DRAW_WIN or aid == const.OP_KONG_WIN or aid == const.OP_WREATH_WIN or aid == const.OP_GIVE_WIN:
					self.add_limit_tiles(idx, aid, tile_list)
			if op_info[1] == const.OP_STATE_SURE:
				break
