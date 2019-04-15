# -*- coding: utf-8 -*-

import KBEngine
from KBEDebug import *
import weakref
import const
from const_tylsmj import *
import Functor

class Adapter(object):

	def __init__(self, idx):
		# 玩家的座位号
		self.idx = idx
		# 玩家在线状态
		self.online = 1
		# 玩家的手牌
		self.tiles = []
		# 玩家的桌牌
		self.upTiles = []
		# 玩家的花牌
		self.wreaths = []
		# 玩家打过的牌
		self.discard_tiles = []
		# 玩家的所有操作记录 (cid, [tiles,])
		# 包括摸牌, 打牌, 碰, 明杠, 暗杠, 接杠, 胡牌 ,吃..
		self.op_r = []

		self.last_draw = -1
		self.last_op = -1
		# 玩家当局的得分
		self.score = 0
		# 玩家该房间总得分
		self.total_score = 0
		# 胡牌次数
		self.win_times = 0
		# 暗杠次数
		self.concealed_kong = 0
		# 明杠次数
		self.exposed_kong = 0
		# 接杠次数
		self.continue_kong = 0
		# 碰牌次数
		self.pong_times = 0
		# 自摸次数
		self.draw_win_times = 0
		# 爆头次数
		self.bao_tou_win_times = 0
		# 财飘次数
		self.king_discard_win_times = 0
		# 财神次数
		self.draw_king_times = 0
		# 自风
		self.wind = const.WIND_EAST
		# 有效杠 记录(被抢杠不算)
		self.kong_record_list = []

		# 出牌状态
		self.discard_state = DISCARD_FREE
		# 出耗子的次数
		self.discard_king_times = 0
		# 听牌需扣牌
		self.buckle = 0

		# 立牌列表
		self.standTileList = []
		# 可胡牌列表,只记录能获胜的玩家的胡牌列表
		self.canWinTiles = []
		# 杠牌算分列表
		self.kong_score_list = [0] * ROOM_PLAYER_NUMBER
		# 玩家桌面上的牌
		self.discard_desk_tiles = []

	@property
	def state(self):
		return self.discard_state

	# 出牌状态
	def setDiscardStateTYLSMJ(self, state):
		DEBUG_MSG("setDiscardStateTYLSMJ idx:{0},state:{1}".format(self.idx, state))
		self.discard_state = state

	def add_score(self, score):
		# if self.room.round_max_lose > 0 and self.score + score < -self.room.round_max_lose:
		# 	real_lose = -self.room.round_max_lose - self.score
		# 	self.score = -self.room.round_max_lose
		# 	return real_lose
		# else:
		self.score += score
		return score

	def settlement(self):
		self.total_score += self.score

	# def tidy(self, kingTiles):
	# 	self.tiles = sorted(self.tiles)
	# 	#多个财神的情况
	# 	kingTileList = []
	# 	othersList = []
	# 	for t in self.tiles:
	# 		if t in kingTiles:
	# 			kingTileList.append(t)
	# 		else:
	# 			othersList.append(t)
	# 	kingTileList.extend(othersList)
	# 	self.tiles = kingTileList
	# 	DEBUG_MSG("Player{0} has tiles: {1}".format(self.idx, self.tiles))

	def tidy(self, kingTiles):
		self.tiles = sorted(self.tiles)
		# 杭州麻将特殊处理
		kingTilesList = []
		dragonWhiteList = []
		otherLeftList = []
		otherRightList = []
		mid = kingTiles[0] if len(kingTiles) > 0 else const.DRAGON_WHITE
		for t in self.tiles:
			if t in kingTiles:
				kingTilesList.append(t)
			elif t == const.DRAGON_WHITE:
				dragonWhiteList.append(t)
			else:
				if t <= mid:
					otherLeftList.append(t)
				else:
					otherRightList.append(t)
		t_list = []
		t_list.extend(kingTilesList)
		t_list.extend(otherLeftList)
		t_list.extend(dragonWhiteList)
		t_list.extend(otherRightList)
		self.tiles = t_list

	def reset(self):
		""" 每局开始前重置 """
		self.tiles = []
		self.upTiles = []
		self.wreaths = []
		self.discard_tiles = []
		self.discard_state = DISCARD_FREE
		self.op_r = []
		self.last_draw = -1
		self.score = 0
		self.kong_record_list = []
		self.wind = const.WIND_EAST
		self.buckle = 0
		self.discard_king_times = 0
		self.canWinTiles = []
		self.kong_score_list = [0] * self.room.player_num
		self.standTileList = []
		self.discard_desk_tiles = []
	#吃
	def chow(self, tile_list):
		""" 吃 """
		self.tiles.remove(tile_list[1])
		self.tiles.remove(tile_list[2])

		self.upTiles.append(tile_list)
		self.op_r.append((const.OP_CHOW, tile_list, self.room.last_player_idx))
		self.last_op = const.OP_CHOW
		# 操作记录
		self.room.op_record.append((const.OP_CHOW, self.idx, self.room.last_player_idx, list(tile_list)))
		self.room.tylsmjBroadcastOperation(self.idx, const.OP_CHOW, tile_list)
	#碰
	def pong(self, tile):
		""" 碰 """
		if self.tiles.count(tile) < 3:
			standNum = self.standTileList.count(tile)
			for i in range(standNum):
				self.standTileList.remove(tile)
		elif self.tiles.count(tile) >= 3:
			standNum = self.standTileList.count(tile)
			if standNum == 2:
				self.standTileList.remove(tile)
			if standNum == 3:
				self.standTileList.remove(tile)
				self.standTileList.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.upTiles.append([tile,tile,tile])
		self.op_r.append((const.OP_PONG, [tile,], self.room.last_player_idx))
		self.pong_times += 1
		self.last_op = const.OP_PONG
		# 操作记录
		self.room.op_record.append((const.OP_PONG, self.idx, self.room.last_player_idx, [tile,]))
		self.room.tylsmjBroadcastOperation(self.idx, const.OP_PONG, [tile, tile, tile])

	#暗杠	
	def concealedKong(self, tile):
		standNum = self.standTileList.count(tile)
		for i in range(standNum):
			self.standTileList.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.upTiles.append([tile, tile, tile, tile])
		self.op_r.append((const.OP_CONCEALED_KONG, [tile,], self.idx))
		self.last_op = const.OP_CONCEALED_KONG
		# 操作记录
		self.room.op_record.append((const.OP_CONCEALED_KONG, self.idx, self.idx, [tile,]))
		self.kong_record_list.append((const.OP_CONCEALED_KONG, self.idx, self.idx, [tile,]))
		# 算分
		self.room.cal_score(self.idx, self.idx, const.OP_CONCEALED_KONG, 1, tile)
		if self.discard_state == DISCARD_FORCE:
			self.room.tylsmjBroadcastOperation(self.idx, const.OP_CONCEALED_KONG, [0, 0, 0, tile])
		else:
			self.room.tylsmjBroadcastOperation2(self.idx, const.OP_CONCEALED_KONG, [0, 0, 0, tile])
		def delay_callback():
			self.room.waitForOperation(self.idx, const.OP_CONCEALED_KONG, tile, self.idx)
		self.room.add_timer(DELAY_OP_FORCE_KONG_DRAW, delay_callback)

	#明杠
	def exposedKong(self, tile):
		""" 公杠, 自己手里有三张, 杠别人打出的牌. 需要计算接杠和放杠得分 """
		standNum = self.standTileList.count(tile)
		for i in range(standNum):
			self.standTileList.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.upTiles.append([tile, tile, tile, tile])
		self.op_r.append((const.OP_EXPOSED_KONG, [tile,], self.room.last_player_idx))
		self.last_op = const.OP_EXPOSED_KONG
		# 操作记录
		self.room.op_record.append((const.OP_EXPOSED_KONG, self.idx, self.room.last_player_idx, [tile,]))
		self.kong_record_list.append((const.OP_EXPOSED_KONG, self.idx, self.room.last_player_idx, [tile,]))
		# 算分
		self.room.cal_score(self.idx, self.room.last_player_idx, const.OP_EXPOSED_KONG, 1, tile)
		self.room.tylsmjBroadcastOperation(self.idx, const.OP_EXPOSED_KONG, [tile] * 4)
		self.room.last_player_idx = self.idx
		def delay_callback():
			self.room.wait_force_delay_kong_draw = False
			self.room.waitForOperation(self.idx, const.OP_EXPOSED_KONG, tile, self.idx)
		self.room.wait_force_delay_kong_draw = True
		self.room.add_timer(DELAY_OP_FORCE_KONG_DRAW, delay_callback)

	#碰后接杠
	def continueKong(self, tile):
		""" 自摸的牌能够明杠 """
		standNum = self.standTileList.count(tile)
		for i in range(standNum):
			self.standTileList.remove(tile)
		self.tiles.remove(tile)
		for i in range(len(self.upTiles)):
			meld = self.upTiles[i]
			if meld[0] == meld[-1] and meld[0] == tile:
				self.upTiles[i].append(tile)
		fromIdx = 0
		for op in self.op_r:	#获得被碰的玩家
			if tile in op[1] and op[0] == const.OP_PONG:
				fromIdx = op[2]
				break
		self.op_r.append((const.OP_CONTINUE_KONG, [tile,], self.idx))
		self.last_op = const.OP_CONTINUE_KONG
		# 操作记录
		self.room.op_record.append((const.OP_CONTINUE_KONG, self.idx, self.idx, [tile,]))
		self.kong_record_list.append((const.OP_CONTINUE_KONG, self.idx, self.idx, [tile,]))
		# 算分
		self.room.cal_score(self.idx, fromIdx, const.OP_CONTINUE_KONG, 1, tile)
		self.room.last_player_idx = self.idx
		if self.discard_state == DISCARD_FORCE:
			self.room.tylsmjBroadcastOperation(self.idx, const.OP_CONTINUE_KONG, [tile] * 4)
		else:
			self.room.tylsmjBroadcastOperation2(self.idx, const.OP_CONTINUE_KONG, [tile] * 4)
		def delay_callback():
			self.room.waitForOperation(self.idx, const.OP_CONTINUE_KONG, tile, self.idx)
		self.room.add_timer(DELAY_OP_FORCE_KONG_DRAW, delay_callback)

	#杠花
	def kongWreath(self, tile):
		DEBUG_MSG("room:{},curround:{} Player:{} kongWreath:{}".format(self.room.roomIDC, self.room.current_round, self.idx, tile))
		self.tiles.remove(tile)
		self.wreaths.append(tile)
		self.op_r.append((const.OP_KONG_WREATH, [tile,], self.idx))
		self.last_op = const.OP_KONG_WREATH
		self.room.op_record.append((const.OP_KONG_WREATH, self.idx, self.idx, [tile,]))
		self.room.tylsmjBroadcastOperation2(self.idx, const.OP_KONG_WREATH, [tile, ])
		self.room.waitForOperation(self.idx, const.OP_KONG_WREATH, tile, self.idx)

	def draw_win(self, tile, score, result):
		""" 自摸胡 """
		self.win_times += 1
		self.draw_win_times += 1
		if result[1] > 0:
			self.bao_tou_win_times += 1
			if len(result) > 4 and result[-1] > 0:
				self.king_discard_win_times += 1

		self.op_r.append((const.OP_DRAW_WIN, [self.last_draw,], self.idx))
		self.last_op = const.OP_DRAW_WIN
		self.room.op_record.append((const.OP_DRAW_WIN, self.idx, self.idx, [self.last_draw,]))
		if self.discard_state == DISCARD_FORCE:
			self.room.tylsmjBroadcastOperation(self.idx, const.OP_DRAW_WIN, [self.last_draw,])
		else:
			self.room.tylsmjBroadcastOperation2(self.idx, const.OP_DRAW_WIN, [self.last_draw,])
		self.room.winGame(self.idx, const.OP_DRAW_WIN, self.last_draw, self.idx, score, result)

	def kong_win(self, tile, score, result):
		""" 抢杠胡 """
		self.tiles.append(tile)
		self.win_times += 1
		if result[1] > 0:
			self.bao_tou_win_times += 1
			if len(result) > 4 and result[-1] > 0:
				self.king_discard_win_times += 1

		self.op_r.append((const.OP_KONG_WIN, [tile,], self.room.last_player_idx))
		self.last_op = const.OP_KONG_WIN
		self.room.op_record.append((const.OP_KONG_WIN, self.idx, self.room.last_player_idx, [tile,]))
		last_player = self.room.players_list[self.room.last_player_idx]
		for upTile in last_player.upTiles:
			t = upTile[0]
			if t == tile and len(upTile) > 3:
				upTile.remove(tile)
		# last_player.upTiles[len(last_player.upTiles) - 1].remove(tile)
		# if self.discard_state == DISCARD_FORCE:
		self.room.tylsmjBroadcastOperation(self.idx, const.OP_KONG_WIN, [self.room.players_list[self.room.current_idx].last_draw,])
		# else:
		# 	self.room.tylsmjBroadcastOperation2(self.idx, const.OP_DRAW_WIN, [self.last_draw,])
		self.room.winGame(self.idx, const.OP_KONG_WIN, tile, self.room.last_player_idx, score, result)

	def give_win(self, tile, score, result):
		""" 放炮胡 """
		self.tiles.append(tile)
		self.win_times += 1
		if result[1] > 0:
			self.bao_tou_win_times += 1
			if len(result) > 4 and result[-1] > 0:
				self.king_discard_win_times += 1

		self.op_r.append((const.OP_GIVE_WIN, [tile,], self.room.last_player_idx))
		self.last_op = const.OP_GIVE_WIN
		self.room.op_record.append((const.OP_GIVE_WIN, self.idx, self.room.last_player_idx, [tile,]))
		# if self.discard_state == DISCARD_FORCE:
		# 	def delay_callback():
		# 		self.room.tylsmjBroadcastOperation(self.idx, const.OP_GIVE_WIN, [tile, ])
		# 		self.room.winGame(self.idx, const.OP_GIVE_WIN, tile, self.room.last_player_idx, score, result)
		# 	# Note: 此处做延时后会产生一个问题
		# 	# 没有延时的时候服务端在在这时已经会处于 ROOM_WAITING 状态
		# 	# 但是在延时后会出现一段时间的 ROOM_PLAYING 状态，此时客户端如果有doOperation消息发上来会出现问题
		# 	self.room.add_timer(DELAY_OP_FORCE, delay_callback)
		# else:
		self.room.tylsmjBroadcastOperation(self.idx, const.OP_GIVE_WIN, [tile, ])
		self.room.winGame(self.idx, const.OP_GIVE_WIN, tile, self.room.last_player_idx, score, result)
		# self.room.tylsmjBroadcastOperation(self.idx, const.OP_GIVE_WIN, [tile,])
		# self.room.winGame(self.idx, const.OP_GIVE_WIN, tile, self.room.last_player_idx, score, result)

	def drawTile(self, tile, is_first = False):
		""" 摸牌 """
		DEBUG_MSG("room:{0},curround:{1} Player{2} drawTile: {3}, left = {4}".format(self.room.roomIDC, self.room.current_round, self.idx, tile, len(self.room.tiles)))
		self.last_draw = tile
		# self.room.canWinTiles = self.room.getCanWinTiles(list(self.tiles), const.OP_DRAW_WIN, self.idx)
		self.tiles.append(tile)
		self.count_draw_king([tile])
		self.op_r.append((const.OP_DRAW, [tile,], self.idx))
		self.last_op = const.OP_DRAW
		self.room.op_record.append((const.OP_DRAW, self.idx, self.idx, [tile,]))
		if not is_first:
			self.room.tylsmjBroadcastOperation2(self.idx, const.OP_DRAW, [0,])
			standTileList = [player.standTileList if player is not None and idx == self.idx else [0] * len(player.standTileList) for idx,player in enumerate(self.room.players_list)]
			self.postOperationTYLSMJ(self.idx, const.OP_DRAW, [tile,], 0, standTileList)
		if self.discard_state == DISCARD_FORCE:
			is_win, score, result = self.room.can_win(list(self.tiles), tile, const.OP_DRAW_WIN, self.idx)
			if is_win:
				self.room.add_timer(1, Functor.Functor(self.draw_win, tile, score, result))
				# self.draw_win(tile, score, result)
			# elif is_win and self.room.game_mode == const.KING_GAME_MODE:
			# 	pass
			# elif self.room.can_continue_kong(self.idx, tile):
			# 	pass
				# self.room.add_timer(1, Functor.Functor(self.continueKong, tile))
			# elif self.room.can_concealed_kong(self.idx, tile):
			# 	pass
				# self.room.add_timer(1, Functor.Functor(self.concealedKong, tile))
			else:
				self.room.add_timer(1, self.forceDiscard)
		# elif self.discard_state == DISCARD_FREE:
		# 	self.room.addDiscardTimer()

	def forceDiscard(self):
		if self.room.can_discard(self.idx, self.last_draw):
			DEBUG_MSG("forceDiscard:{0},{1}".format(self.idx, self.discard_state))
			self.room.all_discard_tiles.append(self.last_draw)
			self.discardTile(self.last_draw)
		else:
			DEBUG_MSG("can't force discard this tile:{}".format(self.last_draw))

	# 统计摸到财神次数
	def count_draw_king(self, tile_list):
		for t in self.room.kingTiles:
			self.draw_king_times += tile_list.count(t)

	def cutTile(self, tile):
		"""切牌"""
		DEBUG_MSG("room:{},curround:{} Player:{} cutTile:{}".format(self.room.roomIDC, self.room.current_round, self.idx, tile))
		self.discard_tiles.append(tile)
		self.discard_desk_tiles.append(tile)
		self.op_r.append((const.OP_CUT, [tile,], self.idx))
		self.last_op = const.OP_CUT
		self.room.op_record.append((const.OP_CUT, self.idx, self.idx, [tile,]))
		self.room.tylsmjBroadcastOperation(self.idx, const.OP_CUT, [tile,])

	def discardTile(self, tile = None):
		""" 打牌 """
		if tile is None:
			tile = self.last_draw
		DEBUG_MSG("room:{},curround:{} Player:{} discardTile:{}".format(self.room.roomIDC, self.room.current_round, self.idx, tile))
		self.tiles.remove(tile)
		self.room.last_player_idx = self.idx
		# 出财神处理
		if tile in self.room.kingTiles:
			self.discard_king_times += 1
			self.room.discard_king_idx = self.idx
		elif self.room.discard_king_idx == self.idx:
			self.room.discard_king_idx = -1

		self.discard_tiles.append(tile)
		self.discard_desk_tiles.append(tile)
		self.op_r.append((const.OP_DISCARD, [tile,], self.idx))
		self.last_op = const.OP_DISCARD
		self.room.op_record.append((const.OP_DISCARD, self.idx, self.idx, [tile,]))
		if self.discard_state == DISCARD_FORCE:
			self.buckle += 1
			if self.buckle == 1:
				if tile not in self.standTileList:
					self.doOperationFailed(const.OP_ERROR_STATE)
					return
				self.standTileList.remove(tile)
				self.canWinTiles = self.room.getCanWinTiles(list(self.tiles), const.OP_DRAW_WIN, self.idx)
				self.room.op_record.append((DISCARD_FORCE, self.idx, self.idx, [tile,]))
				self.room.tingTileList[self.idx] = len(self.discard_desk_tiles) - 1
			self.room.tylsmjBroadcastOperation(self.idx, const.OP_DISCARD, [tile, ], self.buckle)
		else:
			self.room.tylsmjBroadcastOperation2(self.idx, const.OP_DISCARD, [tile, ]) #没倒计时模式广播给所有人
		self.room.wait_for_win_list = self.room.getGiveWinList(self.idx, tile)
		self.room.waitForOperation(self.idx, const.OP_DISCARD, tile)

	def get_init_client_dict(self):
		return {
			'nickname': self.nickname,
			'head_icon': self.head_icon,
			'sex': self.sex,
			'idx': self.idx,
			'userId': self.userId,
			'uuid': self.uuid,
			'online': self.online,
			'ip': self.ip,
			'location': self.location,
			'lat': self.lat,
			'lng': self.lng,
			'is_creator': self.is_creator,
		}

	def get_simple_client_dict(self):
		return {
			'nickname': self.nickname,
			'head_icon': self.head_icon,
			'sex': self.sex,
			'idx': self.idx,
			'userId': self.userId,
			'uuid': self.uuid,
			'score': self.total_score,
			'is_creator': self.is_creator,
		}

	def get_club_client_dict(self):
		return {
			'nickname': self.nickname,
			'idx': self.idx,
			'userId': self.userId,
			'score': self.total_score,
		}

	def get_round_client_dict(self):
		DEBUG_MSG("room:{0},curround:{1} get_round_client_dict,{2},{3},{4},{5}".format(self.room.roomIDC, self.room.current_round, self.idx, self.tiles, self.score, self.total_score))
		return {
			'idx': self.idx,
			'tiles': self.tiles,
			'wreaths': self.wreaths,
			'concealed_kong': [op[1][0] for op in self.op_r if op[0] == const.OP_CONCEALED_KONG],
			'score': self.score,
			'total_score': self.total_score,
		}

	def get_final_client_dict(self):
		return {
			'idx': self.idx,
			'win_times': self.win_times,
			'exposed_kong': self.exposed_kong,
			'concealed_kong': self.concealed_kong,
			'continue_kong' : self.continue_kong,
			'pong_times' : self.pong_times,
			'score': self.total_score,

			'draw_win_times' : self.draw_win_times,
			'bao_tou_win_times' : self.bao_tou_win_times,
			'king_discard_win_times' : self.king_discard_win_times,
			'draw_king_times' : self.draw_king_times
		}

	def get_reconnect_client_dict(self, userId):
		# 掉线重连时需要知道所有玩家打过的牌以及自己的手牌
		disCardTileList, cutTileIdxList = self.reconnect_discard()
		return {
			'score': self.score,
			'total_score': self.total_score,
			'tiles': self.tiles if userId == self.userId else [0]*len(self.tiles),
			'wreaths': self.wreaths,
			'wind': self.wind,
			'discard_tiles': disCardTileList,
			'cut_idxs': cutTileIdxList,
			'op_list': self.process_op_record(),
			'final_op' : self.op_r[-1][0] if len(self.op_r) > 0 else -1,
		}

	def get_round_result_info(self):
		# 记录信息后累计得分
		self.concealed_kong += sum([1 for op in self.op_r if op[0] == const.OP_CONCEALED_KONG])
		self.exposed_kong += sum([1 for op in self.op_r if op[0] == const.OP_EXPOSED_KONG])
		self.continue_kong += sum([1 for op in self.op_r if op[0] == const.OP_CONTINUE_KONG])
		return {
			'userID': self.userId,
			'score': self.score,
		}

	def get_dau_client_dict(self):
		return {
			'nickname': self.nickname,
			'head_icon': self.head_icon,
			'sex': self.sex,
			'userId': self.userId,
			'score': self.total_score,
		}

	def process_op_record(self):
		""" 处理断线重连时候的牌局记录 """
		ret = []
		length = len(self.op_r)
		for i, op in enumerate(self.op_r):
			if op[0] in [const.OP_CHOW, const.OP_PONG, const.OP_EXPOSED_KONG, const.OP_CONTINUE_KONG, const.OP_CONCEALED_KONG]:
				# if op[0] == const.OP_PONG:
				# 	# 碰了之后自己再摸牌杠的, 重连之后只保留杠的记录.
				# 	for j in range(i + 1, length):
				# 		op2 = self.op_r[j]
				# 		if op2[0] == const.OP_EXPOSED_KONG and op2[1][0] == op[1][0]:
				# 			break
				# 	else:
				# 		ret.append({'opId': op[0], 'tiles': op[1], 'fromIdx': op[2]})
				# else:
				# 	ret.append({'opId': op[0], 'tiles': op[1], 'fromIdx': op[2]})
				ret.append({'opId': op[0], 'tiles': op[1], 'fromIdx': op[2]})
		return ret

	def reconnect_discard(self):
		""" 处理断线重连回来丢弃的牌的记录 """
		ret = []
		cutTileIdxList = []
		length = len(self.room.op_record)
		for i, opr in enumerate(self.room.op_record):
			aid, src_idx, des_idx, tiles = opr
			if src_idx == self.idx:
				if aid == const.OP_DISCARD:
					j = i + 1
					if j < length:
						next = self.room.op_record[i+1]
						if next[0] in [const.OP_PONG, const.OP_EXPOSED_KONG, const.OP_CHOW] and next[2] == self.idx:
							# 如果自己丢弃的牌被碰了或者放杠了或者被吃了, 重连时处理, 不再显示在牌桌上
							continue
					ret.append(tiles[0])
				elif aid == const.OP_CUT:
					cutTileIdxList.append(len(ret))
					ret.append(tiles[0])
		return (ret, cutTileIdxList)