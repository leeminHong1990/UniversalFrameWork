# -*- coding: utf-8 -*-
# import KBEngine
from KBEDebug import *
from Functor import Functor
import const, const_dtlgfmj


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
		# 自风
		self.wind = const.WIND_EAST
		# 有效杠 记录(被抢杠不算)
		self.kong_record_list = []
		# 是否有主动亮牌机会
		self.active_hint_state = 1
		# 本局亮风
		self.hint_list = []
		# 本圈 禁止胡的牌
		self.forbid_history = []


	def add_score(self, score):
		self.score += score

	def draw_end(self):
		self.score = 0

	def settlement(self):
		self.total_score += self.score

	def tidy(self, kingTiles):
		def sort_king():
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

		if len(self.tiles)%3==2:
			t = self.tiles.pop(-1)
			self.tiles = sorted(self.tiles)
			sort_king()
			self.tiles.append(t)
		else:
			sort_king()
			self.tiles = sorted(self.tiles)


	def reset(self):
		""" 每局开始前重置 """
		self.tiles = []
		self.upTiles = []
		self.wreaths = []
		self.discard_tiles = []
		self.op_r = []
		self.last_draw = -1
		self.last_op = -1
		self.score = 0
		self.kong_record_list = []
		self.wind = const.WIND_EAST
		self.active_hint_state = 1
		self.hint_list = []
		self.forbid_history = []

	# 被动亮牌
	def passiveHint(self, isFirst):
		# 所有 非财神 风牌全部亮出
		hint_list = [t for t in self.tiles if t in const_dtlgfmj.HINT_TILES and t not in self.room.kingTiles]
		self.tiles = [t for t in self.tiles if t not in const_dtlgfmj.HINT_TILES or t in self.room.kingTiles]
		self.last_draw = self.tiles[-1] if len(self.tiles) > 0 else -1
		DEBUG_MSG(hint_list, self.tiles)
		self.supplementHintTiles(hint_list)
		self.tidy(self.room.kingTiles)
		DEBUG_MSG("adapter passiveHint Player{} tiles {} hint_list {}".format(self.idx, self.tiles, hint_list))

		self.room.op_record.append((const_dtlgfmj.OP_SHOW_HINT, self.idx, self.idx, [list(hint_list), list(self.tiles)]))
		if not isFirst: # 不是第一手亮牌 通知所有人
			# 广播 亮牌操作
			self.room.broadcastHint(self.idx, self.tiles, hint_list)
			self.addHintTiles(hint_list)
		else:
			self.addHintTiles(hint_list, False)

	# 主动亮牌
	def activeHint(self, hintKingNum):
		# 所有 非财神 风牌 和 hintKingNum 张风牌 全部亮出
		tiles = []
		hint_list = []
		for t in self.tiles:
			if t in const_dtlgfmj.HINT_TILES:
				if t in self.room.kingTiles:
					if hintKingNum > 0:
						hint_list.append(t)
						hintKingNum -= 1
					else:
						tiles.append(t)
				else:
					hint_list.append(t)
			else:
				tiles.append(t)
		self.tiles = tiles
		self.supplementHintTiles(hint_list)
		self.tidy(self.room.kingTiles)
		DEBUG_MSG("adapter activeHint Player{} tiles {} hint_tiles {}".format(self.idx, self.tiles, hint_list))

		self.op_r.append((const_dtlgfmj.OP_SHOW_HINT, list(hint_list), self.idx))
		self.room.op_record.append((const_dtlgfmj.OP_SHOW_HINT, self.idx, self.idx, [list(hint_list), list(self.tiles)]))
		# 广播 亮牌操作
		self.room.broadcastHint(self.idx, self.tiles, hint_list)
		self.addHintTiles(list(hint_list))


	def supplementHintTiles(self, hint_list):
		""" 补亮牌 """
		addNum = len(hint_list) - 3
		while addNum > 0:
			tiles = self.room.tiles[0:addNum]
			self.last_draw = tiles[-1]
			self.room.tiles = self.room.tiles[addNum:]
			addNum = 0
			for t in tiles:
				if t in const_dtlgfmj.HINT_TILES and t not in self.room.kingTiles:
					hint_list.append(t)
					addNum += 1
				else:
					self.tiles.append(t)

	# 摸到非财神风字牌 svr直接亮牌
	def hintTile(self, tile):
		DEBUG_MSG("player {} hintTile {}".format(self.idx, tile))
		self.last_draw = tile
		self.op_r.append((const_dtlgfmj.OP_SHOW_HINT, [tile], self.idx))
		self.room.op_record.append((const_dtlgfmj.OP_SHOW_HINT, self.idx, self.idx, [[tile], list(self.tiles)]))
		DEBUG_MSG("adapter hintTile Player{} tiles {} hint_tile {}".format(self.idx, self.tiles, tile))
		# 广播 亮牌操作
		self.room.broadcastHint(self.idx, self.tiles, [tile])
		self.room.last_player_idx = self.idx
		# 判断其他玩家是否可以 碰杠胡
		self.room.waitForOperation(self.idx, const_dtlgfmj.OP_SHOW_HINT, tile, self.idx)


	def addHintTiles(self, tile_list, is_notify = True):
		self.hint_list.extend(tile_list)
		DEBUG_MSG("adapter addHintTiles Player{} tiles {} hint_tiles {}".format(self.idx, self.tiles, tile_list))
		if is_notify:
			self.room.op_record.append((const_dtlgfmj.OP_ADD_HINT, self.idx, self.idx, tile_list))
			# 此处应该通知客户端 玩家 增加了 hint
			self.room.broadcastAddHint(self.idx, tile_list)

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
		if self.room.can_passive_hint(self):
			# 能亮牌 必定不是庄家
			def callback():
				self.passiveHint(False)
			self.room.add_timer(const_dtlgfmj.HINT_DELAY, callback)

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
		self.room.cal_score(self.idx, self.idx, const.OP_CONCEALED_KONG, 2)
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
		fromIdx = fromIdx if fromIdx >= 0 else self.idx
		self.room.cal_score(self.idx, fromIdx, const.OP_CONTINUE_KONG, 1)
		self.room.last_player_idx = self.idx
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
		self.room.broadcastOperation2(self.idx, const.OP_KONG_WREATH, [tile, ])
		self.room.waitForOperation(self.idx, const.OP_KONG_WREATH, tile, self.idx)

	def draw_win(self, tile, score, result):
		""" 普通自摸胡 + 自摸8张花胡 """
		# self.tiles.append(self.last_draw)
		self.win_times += 1
		self.op_r.append((const.OP_DRAW_WIN, [self.last_draw, ], self.idx))
		self.room.op_record.append((const.OP_DRAW_WIN, self.idx, self.idx, [self.last_draw, ]))
		self.room.broadcastOperation2(self.idx, const.OP_DRAW_WIN, [self.last_draw, ])
		self.room.winGame(self.idx, const.OP_DRAW_WIN, self.last_draw, self.idx, score, result)

	def kong_win(self, tile, score, result):
		""" 抢杠胡 """
		last_player = self.room.players_list[self.room.last_player_idx]
		for upTile in last_player.upTiles:
			t = upTile[0]
			if t == tile and len(upTile) > 3:
				upTile.remove(tile)
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

		self.room.broadcastOperation(self.idx, const.OP_GIVE_WIN, [tile, ])
		self.room.winGame(self.idx, const.OP_GIVE_WIN, tile, self.room.last_player_idx, score, result)

	def drawTile(self, tile, is_first=False):
		""" 摸牌 """
		DEBUG_MSG("Player{0} drawTile: {1}, left = {2}".format(self.idx, tile, len(self.room.tiles)))
		self.last_draw = tile
		self.tiles.append(tile)
		self.op_r.append((const.OP_DRAW, [tile, ], self.idx))
		self.room.op_record.append((const.OP_DRAW, self.idx, self.idx, [tile, ]))
		self.last_op = const.OP_DRAW
		if not is_first:
			self.room.broadcastOperation2(self.idx, const.OP_DRAW, [0, ])
			self.postOperation(self.idx, const.OP_DRAW, [tile, ])
			if self.room.can_passive_hint(self): # 非第一张摸牌 是摸牌 在这检查 是否可以 被动亮牌
				# 能亮牌 必定不是庄家
				def callback():
					self.passiveHint(is_first)
				self.room.add_timer(const_dtlgfmj.HINT_DELAY, callback)
				return

	def cutTile(self, tile):
		"""切牌"""
		DEBUG_MSG("Player[%s] cutTile: %s" % (self.idx, tile))
		self.discard_tiles.append(tile)
		self.op_r.append((const.OP_CUT, [tile, ], self.idx))
		self.last_op = const.OP_CUT
		self.room.op_record.append((const.OP_CUT, self.idx, self.idx, [tile, ]))
		self.room.broadcastOperation2(self.idx, const.OP_CUT, [tile, ])
		self.postOperation(self.idx, const.OP_CUT, [tile, ])

	def discardTile(self, tile=None):
		""" 打牌 """
		if tile is None:
			tile = self.last_draw
		DEBUG_MSG("Player[%s] discardTile: %s" % (self.idx, tile))
		self.tiles.remove(tile)
		self.forbid_history = [tile]
		self.room.last_player_idx = self.idx
		self.discard_tiles.append(tile)
		self.op_r.append((const.OP_DISCARD, [tile, ], self.idx))
		self.last_op = const.OP_DISCARD
		self.room.op_record.append((const.OP_DISCARD, self.idx, self.idx, [tile, ]))
		self.room.broadcastOperation2(self.idx, const.OP_DISCARD, [tile, ])
		self.room.wait_for_win_list = self.room.getGiveWinList(self.idx, const.OP_DISCARD, tile)
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
