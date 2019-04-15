# -*- coding: utf-8 -*-

from functools import cmp_to_key

import deuces.card
from KBEDebug import *
from const_ddz import *


class Adapter(object):

	def __init__(self, idx):
		# 玩家的座位号
		self.idx = idx
		# 玩家在线状态
		self.online = 1
		# 玩家的手牌
		self.tiles = []
		# 玩家的所有操作记录 (cid, [tiles,])
		# 包括抢庄，下注，出牌
		self.op_r = []
		self.is_exchanged = False
		# 玩家当局的总得分
		self.score = 0
		# 玩家该房间总得分
		self.total_score = 0
		# 胡牌次数
		self.win_times = 0
		# 失败次数
		self.lose_times = 0

		# 明牌的倍数
		self.seen_mul = 0

		self.discard_times = 0

	def add_score(self, score):
		if self.room.game_max_lose > 0 and self.score + score < -self.room.game_max_lose:
			real_lose = -self.room.game_max_lose - self.score
			self.score = -self.room.game_max_lose
			return real_lose
		else:
			self.score += score
			return score

	def settlement(self):
		self.total_score += self.score

	def tidy(self):
		self.tiles = sorted(self.tiles, key=cmp_to_key(deuces.card.Card.card_compare))

	def reset(self):
		""" 每局开始前重置 """
		self.tiles = []
		self.op_r = []
		self.score = 0
		self.seen_mul = 0
		self.discard_times = 0

	def reset_all(self):
		self.reset()
		self.total_score = 0
		self.win_times = 0
		self.lose_times = 0

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
			'is_creator': self.is_creator
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
		DEBUG_MSG("{} get_round_client_dict,{},{},{},{}".format(self.room.prefixLogStr, self.idx, self.tiles, self.score, self.total_score))
		return {
			'idx': self.idx,
			'tiles': self.tiles,
			'score': self.score,
			'total_score': self.total_score,
		}

	def get_final_client_dict(self):
		return {
			'idx': self.idx,
			'win_times': self.win_times,
			'score': self.total_score,
			'lose_times': self.lose_times,
		}

	def get_reconnect_client_dict(self, userId):
		# 掉线重连时需要知道所有玩家打过的牌以及自己的手牌
		return {
			'idx': self.idx,
			'score': self.score,
			'total_score': self.total_score,
			'tiles': self.tiles if userId == self.userId else [0] * len(self.tiles),
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
		return {
			'userID': self.userId,
			'score': self.score,
		}

	def process_op_record(self):
		""" 处理断线重连时候的牌局记录 """
		ret = []
		# Note: 处理加注记录
		# for i, op in enumerate(self.op_r):
		# 	pass
		return ret

	def discardTile(self, data, from_client):
		[self.tiles.remove(i) for i in data]

		self.discard_times += 1
		# 即使是最后一手牌也传下一个玩家id
		next_idx = self.room.nextIdx

		self.op_r.append((OP_DISCARD, data))
		self.room.op_record.append((OP_DISCARD, self.idx, next_idx, data))
		if from_client:
			self.room.ddzBroadcastOperation2(self.idx, OP_DISCARD, data, next_idx)
		else:
			self.room.ddzBroadcastOperation(self.idx, OP_DISCARD, data, next_idx)
		return next_idx
