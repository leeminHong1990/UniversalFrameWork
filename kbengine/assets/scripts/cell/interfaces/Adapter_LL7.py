# -*- coding: utf-8 -*-

from functools import cmp_to_key

import deuces.card
from KBEDebug import *
import const_ll7


class Adapter(object):

	def __init__(self, idx):
		# 玩家的座位号
		self.idx = idx
		# 玩家在线状态
		self.online = 1
		# 玩家的手牌
		self.pokers = []
		# 玩家的所有操作记录 (cid, [pokers,])
		self.op_r = []
		# 玩家当局的总得分
		self.score = 0
		# 玩家该房间总得分
		self.total_score = 0
		# 玩家当局扑克得分
		self.poker_score = 0
		# 胜利次数
		self.win_times = 0
		# 失败次数
		self.lose_times = 0

	def add_score(self, score):
		self.score += score

	def settlement(self):
		self.total_score += self.score

	def add_poker_score(self, pokers, multiple=1):
		values = [_c>>const_ll7.POKER_OFFSET for _c in pokers if _c>>const_ll7.POKER_OFFSET in  \
				  [const_ll7.HHMF_VALUE[2], const_ll7.HHMF_VALUE[7], const_ll7.HHMF_VALUE[10]]]
		score = sum([5*multiple if _c == const_ll7.HHMF_VALUE[2] else 10*multiple for _c in values])
		self.poker_score += score
		return score

	def tidy(self, color=None):
		self.pokers = sorted(self.pokers, reverse=True)

	def reset(self):
		""" 每局开始前重置 """
		self.pokers = []
		self.op_r = []
		self.score = 0
		self.poker_score = 0

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
		DEBUG_MSG("{} get_round_client_dict,{},{},{},{}".format(self.room.prefixLogStr, self.idx, self.pokers, self.score, self.total_score))
		return {
			'idx': self.idx,
			'pokers': self.pokers,
			'score': self.score,
			'total_score': self.total_score,
			'poker_score': self.poker_score,
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
			'poker_score': self.poker_score,
			'pokers': self.pokers if userId == self.userId else [0] * len(self.pokers),
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

	def discard(self, pokers, next_idx):
		DEBUG_MSG("{} player {} discard {}".format(self.room.prefixLogStr, self.idx, pokers))
		[self.pokers.remove(_c) for _c in pokers]
		self.room.op_record.append((self.idx, list(pokers), next_idx))
		self.room.ll7BroadcastOperation2(self.idx, const_ll7.DISCARD, pokers, next_idx)