# -*- coding: utf-8 -*-
# import KBEngine
from KBEDebug import *
from Functor import Functor
import const, const_gxmj


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
		# 出牌状态
		self.discard_state = const_gxmj.DISCARD_FREE

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
		# 自风
		self.wind = const.WIND_EAST
		# 杠分
		self.kong_score = 0
		# 摸宝分数
		self.treasure_score = 0
		self.treasure_kong_score = 0
		# 有效杠 记录(被抢杠不算)
		self.kong_record_list = []

	@property
	def state(self):
		return self.discard_state

	# 出牌状态
	def set_discard_state(self, state):
		DEBUG_MSG("set_discard_state idx:{0},state:{1}".format(self.idx, state))
		self.discard_state = state

	def add_score(self, score):
		DEBUG_MSG("=====add_score===={0},{1},{2}".format(self.score, score, self.room.max_lose))
		if self.score + score < -self.room.max_lose:
			real_lose = -self.room.max_lose - self.score
			self.score = -self.room.max_lose
			DEBUG_MSG("add_score 1={0}={1}".format(self.idx, -self.room.max_lose - self.score))
			return real_lose
		else:
			self.score += score
			DEBUG_MSG("add_score 2={0}={1}".format(self.idx, score))
			return score

	def add_kong_score(self, score):
		DEBUG_MSG("add_kong_score={0}={1}".format(self.idx, score))
		self.kong_score += score

	def add_treasure_score(self, score):
		DEBUG_MSG("add_treasure_score={0}={1}".format(self.idx, score))
		self.treasure_score += score

	def add_treasure_kong_score(self, score):
		DEBUG_MSG("add_treasure_kong_score={0}={1}".format(self.idx, score))
		self.treasure_kong_score += score

	def settlement(self):
		self.score += self.kong_score + self.treasure_score + self.treasure_kong_score
		self.total_score += self.score

	def tidy(self, kingTiles):
		self.tiles = sorted(self.tiles)
		# 多个财神的情况
		kingTileList = []
		othersList = []
		for t in self.tiles:
			if t in kingTiles:
				kingTileList.append(t)
			else:
				othersList.append(t)
		kingTileList.extend(othersList)
		self.tiles = kingTileList
		DEBUG_MSG("Player{0} has tiles: {1}".format(self.idx, self.tiles))

	def reset(self):
		""" 每局开始前重置 """
		self.tiles = []
		self.upTiles = []
		self.wreaths = []
		self.discard_tiles = []
		self.op_r = []
		self.discard_state = const_gxmj.DISCARD_FREE
		self.last_draw = -1
		self.last_op = -1
		self.score = 0
		self.kong_score = 0
		self.treasure_score = 0
		self.treasure_kong_score = 0
		self.kong_record_list = []
		self.wind = const.WIND_EAST

	# 吃
	def chow(self, tile_list):
		""" 吃 """
		self.tiles.remove(tile_list[1])
		self.tiles.remove(tile_list[2])

		self.upTiles.append(tile_list)
		self.op_r.append((const.OP_CHOW, tile_list, self.room.last_player_idx))
		self.last_op = const.OP_CHOW
		# 操作记录
		self.room.op_record.append((const.OP_CHOW, self.idx, self.room.last_player_idx, list(tile_list)))
		self.room.broadcastOperation(self.idx, const.OP_CHOW, tile_list)

	# 碰
	def pong(self, tile):
		""" 碰 """
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.upTiles.append([tile, tile, tile])
		self.op_r.append((const.OP_PONG, [tile, ], self.room.last_player_idx))
		self.pong_times += 1
		self.last_op = const.OP_PONG
		# 操作记录
		self.room.op_record.append((const.OP_PONG, self.idx, self.room.last_player_idx, [tile, ]))
		self.room.broadcastOperation(self.idx, const.OP_PONG, [tile, tile, tile])
		self.room.addDiscardTimer()

	# 暗杠
	def concealedKong(self, tile):
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.upTiles.append([tile, tile, tile, tile])
		self.op_r.append((const.OP_CONCEALED_KONG, [tile, ], self.idx))
		self.last_op = const.OP_CONCEALED_KONG
		# 操作记录
		self.room.op_record.append((const.OP_CONCEALED_KONG, self.idx, self.idx, [tile, ]))
		self.kong_record_list.append((const.OP_CONCEALED_KONG, self.idx, self.idx, [tile, ]))
		# 算分
		self.room.cal_score(self.idx, self.idx, const.OP_CONCEALED_KONG, 1)
		if self.room.roomParamsC['discard_seconds'] > 0:
			self.room.broadcastOperation(self.idx, const.OP_CONCEALED_KONG, [0, 0, 0, tile])
		else:
			self.room.broadcastOperation2(self.idx, const.OP_CONCEALED_KONG, [0, 0, 0, tile])
		self.room.current_idx = self.idx
		self.room.beginRound()

	# 明杠
	def exposedKong(self, tile):
		""" 公杠, 自己手里有三张, 杠别人打出的牌. 需要计算接杠和放杠得分 """
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.tiles.remove(tile)
		self.upTiles.append([tile, tile, tile, tile])
		self.op_r.append((const.OP_EXPOSED_KONG, [tile, ], self.room.last_player_idx))
		self.last_op = const.OP_EXPOSED_KONG
		# 操作记录
		self.room.op_record.append((const.OP_EXPOSED_KONG, self.idx, self.room.last_player_idx, [tile, ]))
		self.kong_record_list.append((const.OP_EXPOSED_KONG, self.idx, self.room.last_player_idx, [tile, ]))
		# 算分
		self.room.cal_score(self.idx, self.room.last_player_idx, const.OP_EXPOSED_KONG, 1)
		self.room.broadcastOperation(self.idx, const.OP_EXPOSED_KONG, [tile] * 4)
		self.room.last_player_idx = self.idx
		self.room.waitForOperation(self.idx, const.OP_EXPOSED_KONG, tile, self.idx)


	# 碰后接杠
	def continueKong(self, tile):
		""" 自摸的牌能够明杠 """
		self.tiles.remove(tile)
		for i in range(len(self.upTiles)):
			meld = self.upTiles[i]
			if meld[0] == meld[-1] and meld[0] == tile:
				self.upTiles[i].append(tile)
		self.op_r.append((const.OP_CONTINUE_KONG, [tile, ], self.idx))
		self.last_op = const.OP_CONTINUE_KONG
		# 操作记录
		self.room.op_record.append((const.OP_CONTINUE_KONG, self.idx, self.idx, [tile, ]))
		self.kong_record_list.append((const.OP_CONTINUE_KONG, self.idx, self.idx, [tile, ]))
		# 算分
		fromIdx = self.room.getContinueKongFrom(self.op_r, tile)
		self.room.cal_score(self.idx, fromIdx if fromIdx >= 0 else self.idx, const.OP_CONTINUE_KONG, 1)
		self.room.last_player_idx = self.idx
		if self.room.roomParamsC['discard_seconds'] > 0 or self.discard_state == const_gxmj.DISCARD_FORCE:
			self.room.broadcastOperation(self.idx, const.OP_CONTINUE_KONG, [tile] * 4)
		else:
			self.room.broadcastOperation2(self.idx, const.OP_CONTINUE_KONG, [tile] * 4)
		self.room.waitForOperation(self.idx, const.OP_CONTINUE_KONG, tile, self.idx)

	# 杠花
	def kongWreath(self, tile):
		DEBUG_MSG("Player[%s] kongWreath: %s" % (self.idx, tile))
		self.tiles.remove(tile)
		self.wreaths.append(tile)
		self.op_r.append((const.OP_KONG_WREATH, [tile, ], self.idx))
		self.room.op_record.append((const.OP_KONG_WREATH, self.idx, self.idx, [tile, ]))
		self.last_op = const.OP_KONG_WREATH
		if self.room.roomParamsC['discard_seconds'] > 0:
			self.room.broadcastOperation(self.idx, const.OP_KONG_WREATH, [tile, ])
		else:
			self.room.broadcastOperation2(self.idx, const.OP_KONG_WREATH, [tile, ])
		self.room.waitForOperation(self.idx, const.OP_KONG_WREATH, tile, self.idx)

	def draw_win(self, tile, score, result):
		""" 普通自摸胡 + 自摸8张花胡 """
		# self.tiles.append(self.last_draw)
		self.win_times += 1
		self.op_r.append((const.OP_DRAW_WIN, [self.last_draw, ], self.idx))
		self.room.op_record.append((const.OP_DRAW_WIN, self.idx, self.idx, [self.last_draw, ]))
		if self.discard_state == const_gxmj.DISCARD_FORCE:
			self.room.broadcastOperation(self.idx, const.OP_DRAW_WIN, [self.last_draw, ])
		else:
			self.room.broadcastOperation2(self.idx, const.OP_DRAW_WIN, [self.last_draw, ])
		self.room.winGame(self.idx, const.OP_DRAW_WIN, self.last_draw, self.idx, score, result)

	def kong_win(self, tile, score, result):
		""" 抢杠胡 """
		self.tiles.append(tile)
		self.win_times += 1
		self.op_r.append((const.OP_KONG_WIN, [tile, ], self.room.last_player_idx))
		self.room.op_record.append((const.OP_KONG_WIN, self.idx, self.room.last_player_idx, [tile, ]))
		self.room.winGame(self.idx, const.OP_KONG_WIN, tile, self.room.last_player_idx, score, result)

	def give_win(self, tile, score, result):
		""" 放炮胡 """
		self.tiles.append(tile)
		self.win_times += 1
		self.op_r.append((const.OP_GIVE_WIN, [tile, ], self.room.last_player_idx))
		self.room.op_record.append((const.OP_GIVE_WIN, self.idx, self.room.last_player_idx, [tile, ]))
		if self.discard_state == const_gxmj.DISCARD_FORCE:
			def delay_callback():
				self.room.wait_force_delay_win = False
				self.room.broadcastOperation(self.idx, const.OP_GIVE_WIN, [tile, ])
				self.room.winGame(self.idx, const.OP_GIVE_WIN, tile, self.room.last_player_idx, score, result)

			# Note: 此处做延时后会产生一个问题
			# 没有延时的时候服务端在在这时已经会处于 ROOM_WAITING 状态
			# 但是在延时后会出现一段时间的 ROOM_PLAYING 状态，此时客户端如果有doOperation消息发上来会出现问题
			self.room.state = const.ROOM_WAITING
			self.room.wait_force_delay_win = True
			self.room.add_timer(const_gxmj.DELAY_OP_FORCE, delay_callback)
		else:
			self.room.broadcastOperation(self.idx, const.OP_GIVE_WIN, [tile, ])
			self.room.winGame(self.idx, const.OP_GIVE_WIN, tile, self.room.last_player_idx, score, result)

	def drawTile(self, tile, is_first=False):
		""" 摸牌 """
		DEBUG_MSG("Player{0} drawTile: {1}, left = {2}, state = {3}".format(self.idx, tile, len(self.room.tiles),
																			self.discard_state))
		self.last_draw = tile
		self.tiles.append(tile)
		self.op_r.append((const.OP_DRAW, [tile, ], self.idx))
		self.room.op_record.append((const.OP_DRAW, self.idx, self.idx, [tile, ]))
		self.last_op = const.OP_DRAW
		if not is_first:
			self.room.broadcastOperation2(self.idx, const.OP_DRAW, [0, ])
			self.postOperation(self.idx, const.OP_DRAW, [tile, ])
		if self.discard_state == const_gxmj.DISCARD_FORCE:
			is_win, score, result = self.room.can_win(list(self.tiles), tile, const.OP_DRAW_WIN, self.idx)
			if is_win:
				self.room.add_timer(1, Functor(self.draw_win, tile, score, result))
			elif self.room.can_continue_kong(self, tile):
				self.room.add_timer(1, Functor(self.continueKong, tile))
			else:
				self.room.add_timer(1, self.forceDiscard)
		elif self.discard_state == const_gxmj.DISCARD_FREE:
			self.room.addDiscardTimer()

	def cutTile(self, tile):
		"""切牌"""
		DEBUG_MSG("Player[%s] cutTile: %s" % (self.idx, tile))
		self.discard_tiles.append(tile)
		self.op_r.append((const.OP_CUT, [tile, ], self.idx))
		self.last_op = const.OP_CUT
		self.room.op_record.append((const.OP_CUT, self.idx, self.idx, [tile, ]))
		self.room.broadcastOperation2(self.idx, const.OP_CUT, [tile, ])
		self.postOperation(self.idx, const.OP_CUT, [tile, ])

	def forceDiscard(self):
		if self.room.can_discard(self.tiles, self.last_draw):
			DEBUG_MSG("forceDiscard:{0},{1}".format(self.idx, self.discard_state))
			self.room.all_discard_tiles.append(self.last_draw)
			self.discardTile(self.last_draw)
		else:
			DEBUG_MSG("can't force discard this tile:{}".format(self.last_draw))

	def autoDiscard(self):
		if self.room.state == const.ROOM_WAITING:
			return
		DEBUG_MSG("player {0} autoDiscard".format(self.idx))
		tile = self.tiles[-1]
		self.room.all_discard_tiles.append(tile)
		# self.postOperation(self.idx, const.OP_DISCARD, [tile, ])
		self.discardTile(tile)

	def discardTile(self, tile=None):
		""" 打牌 """
		if tile is None:
			tile = self.last_draw
		DEBUG_MSG("Player[%s] discardTile: %s" % (self.idx, tile))
		self.tiles.remove(tile)
		self.room.last_player_idx = self.idx
		self.discard_tiles.append(tile)
		self.op_r.append((const.OP_DISCARD, [tile, ], self.idx))
		self.last_op = const.OP_DISCARD
		self.room.op_record.append((const.OP_DISCARD, self.idx, self.idx, [tile, ]))
		if self.room.roomParamsC['discard_seconds'] > 0:
			DEBUG_MSG('del wait discard timer == >:discardTile')
			if self.room._op_timer:
				self.room.cancel_timer(self.room._op_timer)
				self.room._op_timer = None
			self.room.broadcastOperation(self.idx, const.OP_DISCARD, [tile, ])
		else:
			if self.discard_state == const_gxmj.DISCARD_FORCE:
				self.room.broadcastOperation(self.idx, const.OP_DISCARD, [tile, ])
			else:
				self.room.broadcastOperation2(self.idx, const.OP_DISCARD, [tile, ])  # 没倒计时模式广播给所有人
		self.room.wait_for_win_list = self.room.getGiveWinList(self.idx, tile)
		self.room.waitForOperation(self.idx, const.OP_DISCARD, tile)

	def process_op_record(self):
		""" 处理断线重连时候的牌局记录 """
		ret = []
		length = len(self.op_r)
		for i, op in enumerate(self.op_r):
			if op[0] in [const.OP_CHOW, const.OP_PONG, const.OP_EXPOSED_KONG, const.OP_CONTINUE_KONG,
						 const.OP_CONCEALED_KONG]:
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
						next = self.room.op_record[i + 1]
						if next[0] in [const.OP_PONG, const.OP_EXPOSED_KONG, const.OP_CHOW] and next[2] == self.idx:
							# 如果自己丢弃的牌被碰了或者放杠了或者被吃了, 重连时处理, 不再显示在牌桌上
							continue
					ret.append(tiles[0])
				elif aid == const.OP_CUT:
					cutTileIdxList.append(len(ret))
					ret.append(tiles[0])
		return (ret, cutTileIdxList)


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

	def get_club_client_dict(self):
		return {
			'nickname': self.nickname,
			'idx': self.idx,
			'userId': self.userId,
			'score': self.total_score,
		}

	def get_round_client_dict(self):
		DEBUG_MSG("{} get_round_client_dict,{},{},{},{}".format(self.room.prefixLogStr,
																self.idx, self.tiles,
																self.score,
																self.total_score))
		return {
			'idx': self.idx,
			'tiles': self.tiles,
			'wreaths': self.wreaths,
			'concealed_kong': [op[1][0] for op in self.op_r if
							   op[0] == const.OP_CONCEALED_KONG or op[0] == const.OP_CONTINUE_KONG],
			'score': self.score,
			'total_score': self.total_score,
		}

	def get_final_client_dict(self):
		return {
			'idx': self.idx,
			'win_times': self.win_times,
			'exposed_kong': self.exposed_kong,
			'concealed_kong': self.concealed_kong,
			'continue_kong': self.continue_kong,
			'pong_times': self.pong_times,
			'score': self.total_score,
		}

	def get_reconnect_client_dict(self, userId):
		# 掉线重连时需要知道所有玩家打过的牌以及自己的手牌
		disCardTileList, cutTileIdxList = self.reconnect_discard()
		return {
			'score': self.score,
			'total_score': self.total_score,
			'tiles': self.tiles if userId == self.userId else [0] * len(self.tiles),
			'wreaths': self.wreaths,
			'wind': self.wind,
			'discard_tiles': disCardTileList,
			'cut_idxs': cutTileIdxList,
			'op_list': self.process_op_record(),
			'final_op': self.op_r[-1][0] if len(self.op_r) > 0 else -1,
		}

	def get_dau_client_dict(self):
		return {
			'nickname': self.nickname,
			'head_icon': self.head_icon,
			'sex': self.sex,
			'userId': self.userId,
			'score': self.total_score,
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
