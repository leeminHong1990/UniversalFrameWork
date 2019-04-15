# -*- coding: utf-8 -*-

import json
import time
import const
import random
import switch
import utility
import const_ll7
import utility_ll7
import math

from Room import Room
from KBEDebug import *
from datetime import datetime

FIRST_DEAL_TIME 	= 4
SECOND_DEAL_TIME 	= 15
SURRENDER_TIME 		= 8
LORD_THIRD_TIME		= 7

class Room_LL7(Room):

	def __init__(self):
		Room.__init__(self)
		# 本局所有牌
		self.pokers = []
		# 当前局数
		self.current_round = 0
		# 一局 打牌记录
		self.op_record = []
		# 准备 idx
		self.confirm_next_idx = []
		# 房间开局操作的记录对应的记录id
		self.record_id = -1

		# 解散房间操作的发起者
		self.dismiss_room_from = -1
		# 解散房间操作开始的时间戳
		self.dismiss_room_ts = 0
		# 解散房间操作投票状态
		self.dismiss_room_state_list = [0] * self.player_num
		self.dismiss_timer = None
		# 玩家操作限时timer 启动时间
		self._op_timer_timestamp = 0
		# 房间创建时间
		self.roomOpenTime = time.time()

		# 玩家操作定时器
		self._op_timer = None
		# 定时器启动时间
		self._op_timer_ts = 0

		# 上轮出牌
		self.history_pokers = [[] for i in range(self.player_num)]
		# 叫主/反主 [当前回合, 下一回合, 主, 副主, 花色, 主牌, 放弃状态]

		self.wait_aid_list = []

		self.lord_idx = -1
		self.partner_idx = -1
		self.bonus_idx = -1
		self.lord_pokers = []
		self.lord_state = [0] * self.player_num

		# 回合 [next_idx, control_idx, begin_idx, current_idx, control_type, begin_type, poker_list]
		self.round_pokers = [None, None, None, None, None, None, [None] * self.player_num]

		self.quit_times = 0

	def _reset(self):
		self.clear_timers()
		self.timeout_timer = None
		self.dismiss_timer = None

		self._op_timer = None
		self._op_timer_ts = 0

		self.pokers = []

		self.wait_aid_list = []

		self.lord_idx = -1
		self.partner_idx = -1
		self.bonus_idx = -1
		self.lord_pokers = []
		self.lord_state = [0] * self.player_num

		self.op_record = []
		self.confirm_next_idx = []
		self.history_pokers = [[] for i in range(self.player_num)]
		self.round_pokers = [None, None, None, None, None, None, [None] * self.player_num]

		self.players_list = [None] * self.player_num
		self.quit_times = 0
		self.destroySelf()

	def _get_player_idx(self, avt_mb):
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				return i

	def init_pokers(self):
		self.pokers = const_ll7.HEI * 2 + const_ll7.HONG * 2 + const_ll7.MEI * 2 + const_ll7.FANG * 2 + const_ll7.JOKER * 2

	def shuffle_pokers(self):
		random.shuffle(self.pokers)
		# 保证最后8张不全是7, 这个概率 8!/108! 几乎可以忽略不计
		if sum([1 for _p in self.pokers[-8:] if _p>>2 == 7]) == 8:
			self.shuffle_pokers()

	# def deal(self, prefab_pokers, cover_pokers):
	# 	# 张数限定
	# 	prefab_pokers = [_pokers[:int(100/self.player_num)] for _pokers in prefab_pokers[:self.player_num]]
	# 	cover_pokers = cover_pokers[:8]
	# 	# 最多两张一样的牌
	# 	poker2NumDict = {}
	# 	for _pokers in prefab_pokers:
	# 		i = 0
	# 		while i < len(_pokers):
	# 			_c = _pokers[i]
	# 			p_num = poker2NumDict.get(_c, 0)
	# 			if p_num == 2:
	# 				_pokers.pop(i)
	# 			else:
	# 				poker2NumDict[_c] = p_num + 1
	# 				i += 1
	# 	j = 0
	# 	while j < len(cover_pokers):
	# 		_c = cover_pokers[j]
	# 		p_num = poker2NumDict.get(_c, 0)
	# 		if p_num == 2:
	# 			cover_pokers.pop(j)
	# 		else:
	# 			poker2NumDict[_c] = p_num + 1
	# 			j += 1
	#
	# 	# 移除这些牌
	# 	for _c in poker2NumDict:
	# 		for num in range(poker2NumDict[_c]):
	# 			self.pokers.remove(_c)
	#
	# 	# 预置 底牌
	# 	pokers = self.pokers[:-8+len(cover_pokers)]
	# 	self.pokers = self.pokers[-8+len(cover_pokers):]
	# 	self.pokers.extend(cover_pokers)
	#
	# 	for k, v in enumerate(self.players_list):
	# 		if len(prefab_pokers) > k and v is not None:
	# 			v.pokers.extend(list(prefab_pokers[k]))
	# 	# 预置 玩家手牌
	# 	num = int(100/self.player_num)
	# 	while len(pokers) > 0 and any(_p is not None and len(_p.pokers) < num for _p in self.players_list):
	# 		for k, v in enumerate(self.players_list):
	# 			if v is not None and len(v.pokers) < num:
	# 				v.pokers.append(pokers[0])
	# 				pokers = pokers[1:]

	# 用于测试的预置牌
	def prefabPokers(self, prefab_pokers, cover_pokers):
		if sum([len(_pokers) for _pokers in prefab_pokers]) + len(cover_pokers)<=0:
			return
		hand_poker_num = int(100/self.player_num)
		#张数限定
		prefab_pokers = [_pokers[:hand_poker_num] for _pokers in prefab_pokers[:self.player_num]]
		cover_pokers = cover_pokers[:8]
		# 最多两张一样的牌
		poker2NumDict = {}
		for _pokers in prefab_pokers:
			i = 0
			while i < len(_pokers):
				_c = _pokers[i]
				p_num = poker2NumDict.get(_c, 0)
				if p_num == 2:
					_pokers.pop(i)
				else:
					poker2NumDict[_c] = p_num + 1
					i += 1
		j = 0
		while j < len(cover_pokers):
			_c = cover_pokers[j]
			p_num = poker2NumDict.get(_c, 0)
			if p_num == 2:
				cover_pokers.pop(j)
			else:
				poker2NumDict[_c] = p_num + 1
				j += 1

		# 移除这些牌
		for _c in poker2NumDict:
			for num in range(poker2NumDict[_c]):
				self.pokers.remove(_c)

		# 填满
		for i in range(self.player_num):
			need = hand_poker_num - len(prefab_pokers[i])
			if len(prefab_pokers) > i and need > 0:
				prefab_pokers[i].extend(self.pokers[:need])
				self.pokers = self.pokers[need:]

		pokers = []
		for i in range(hand_poker_num):
			for j in range(self.player_num):
				pokers.append(prefab_pokers[j][i])
		pokers.extend(self.pokers)
		pokers.extend(cover_pokers)
		self.pokers = pokers
		DEBUG_MSG("prefabPokers=len:{},pokers:{}".format(len(self.pokers), self.pokers))

	# 第一次发牌 一张牌
	def firstDeal(self):
		for k, v in enumerate(self.players_list):
			if v is not None:
				v.pokers.append(self.pokers[0])
				self.pokers = self.pokers[1:]

	# 第二次发牌 剩余的牌
	def secondDeal(self):
		left_num = int((len(self.pokers)-8)/self.player_num)
		pokers = self.pokers[:-8]
		self.pokers = self.pokers[-8:]

		pokers_list = [[] for i in range(self.player_num)]

		for i in range(left_num):
			for k, v in enumerate(self.players_list):
				if v is not None:
					v.pokers.append(pokers[0])
					pokers_list[k].append(pokers[0])
					pokers = pokers[1:]
		# 重置状态
		self.lord_state = [0]*self.player_num
		# 下发
		for k, v in enumerate(self.players_list):
			if v is not None:
				v.secondDeal(pokers_list[k])
		if self.lord_idx >= 0:
			self.partner_idx = self.get_partner_idx(self.lord_idx, self.lord_pokers[0])
		self.wait_aid_list = [const_ll7.LORD_SECOND]
		self.add_op_timer(SECOND_DEAL_TIME, self.dealTimeEnd)
		KBEngine.globalData['GameWorld'].update_record_room(self, self.roomIDC, {
			'init_pokers': [list(p.pokers) for p in self.players_list],
		})

	def dealTimeEnd(self):
		self._op_timer = None
		if len(self.lord_pokers) == 1:
			if self.players_list[self.lord_idx].pokers.count(self.lord_pokers[0]) == 2:
				self.wait_aid_list = [const_ll7.SURRENDER_FIRST]
				self.waitForOperation(self.lord_idx, const_ll7.SURRENDER_FIRST)
				self.add_op_timer(SURRENDER_TIME, self.surrenderFirstTimeEnd)
			else:
				self.draw_cover(True)
		else:
			self.wait_aid_list = []
			self.start(True)

	def tidy(self):
		for k, v in enumerate(self.players_list):
			if v is not None:
				v.tidy()

	def doOperation(self, avt_mb, aid, pokers):
		if self.state != const.ROOM_PLAYING:
			return
		if len(pokers) == 0:
			return

		idx = self._get_player_idx(avt_mb)
		if aid == const_ll7.LORD_FIRST:
			if const_ll7.LORD_FIRST not in self.wait_aid_list or \
				self.lord_state[idx] == 1 or \
				not self.has_pokers(idx, pokers) or \
				len(pokers) != 1 or \
				pokers[0] not in const_ll7.SEVEN:
				return
			self.cancel_op_timer()
			self.lord_idx = idx
			self.partner_idx = self.get_partner_idx(idx, pokers[0])
			self.bonus_idx = idx
			self.lord_pokers = list(pokers)
			self.ll7BroadcastOperation(idx, const_ll7.LORD_FIRST, pokers, -1)
			self.quit_times = 0
			self.secondDeal()
		elif aid == const_ll7.LORD_SECOND:
			if const_ll7.LORD_SECOND not in self.wait_aid_list or \
				self.lord_state[idx] == 1 or \
				not self.has_pokers(idx, pokers) or \
				(len(pokers)==2 and pokers[0]!=pokers[1]) or \
				(len(pokers)==2 and self.lord_idx < 0) or \
				pokers[0] not in const_ll7.SEVEN:
				return
			self.lord_idx = idx
			self.lord_pokers = list(pokers)
			self.lord_state[idx] = 1
			if len(pokers) == 1:
				self.partner_idx = self.get_partner_idx(idx, pokers[0])
				self.lord_state = [0]*self.player_num
				self.quit_times = 0
				self.ll7BroadcastOperation(idx, const_ll7.LORD_SECOND, pokers, -1)
			else:
				self.cancel_op_timer()
				self.partner_idx = idx
				self.bonus_idx = self.bonus_idx if self.bonus_idx == idx else -1	# 除了自己反自己，不然不是首7
				self.lord_state = [1] * self.player_num
				self.ll7BroadcastOperation(idx, const_ll7.LORD_SECOND, pokers, idx)
				self.draw_cover(False)
		elif aid == const_ll7.SURRENDER_FIRST:
			# tips 此处 pokers 并不是真的pokers 而是一个[0]或者[1]的状态
			if const_ll7.SURRENDER_FIRST not in self.wait_aid_list or \
				len(pokers) != 1 or \
				idx != self.lord_idx:
				return
			self.cancel_op_timer()
			if pokers[0] == 0:	# 不认输
				self.draw_cover(True)
			else:				# 认输
				self.wait_aid_list = []
				self.surrender(const_ll7.SURRENDER_FIRST)
		elif aid == const_ll7.SURRENDER_SECOND:
			# tips 此处 pokers 并不是真的pokers 而是一个[0]或者[1]的状态
			if const_ll7.SURRENDER_SECOND not in self.wait_aid_list  or \
				len(pokers) != 1 or \
				idx != self.lord_idx:
				return
			self.cancel_op_timer()
			self.ll7BroadcastOperation(idx, const_ll7.SURRENDER_SECOND, pokers, idx)
			if pokers[0] == 0:	# 不认输
				self.wait_aid_list = [const_ll7.LORD_THIRD]
				self.add_op_timer(LORD_THIRD_TIME, self.lord_end)
			else:				# 认输
				self.wait_aid_list = []
				self.surrender(const_ll7.SURRENDER_SECOND)
		elif aid == const_ll7.LORD_THIRD:
			if const_ll7.LORD_THIRD not in self.wait_aid_list or \
				self.lord_state[idx] == 1 or \
				idx == self.lord_idx or \
				not self.has_pokers(idx, pokers) or \
				len(pokers) != 2 or \
				pokers[0] != pokers[1] or \
				pokers[0] not in const_ll7.SEVEN:
				return
			self.cancel_op_timer()
			self.lord_idx = idx
			self.partner_idx = idx
			self.lord_pokers = list(pokers)
			self.lord_state[idx] = [1] * self.player_num
			self.bonus_idx = -1	# 这个步骤反主必然不是首7
			self.ll7BroadcastOperation(idx, const_ll7.LORD_THIRD, pokers, idx)
			self.draw_cover(False)
		elif aid == const_ll7.COVER_POKER:
			if const_ll7.COVER_POKER not in self.wait_aid_list  or \
				not self.has_pokers(idx, pokers) or \
				len(pokers) != 8 or \
				idx != self.lord_idx:
				return
			self.cover_poker(idx, pokers)
		elif aid == const_ll7.DISCARD:
			if not self.canDiscard(idx, pokers) \
					or const_ll7.DISCARD not in self.wait_aid_list:
				ERROR_MSG("player:{} can't discard poker:{} round_pokers:{}".format(idx, pokers, self.round_pokers))
				return
			self.beginRound(idx, pokers)
			DEBUG_MSG("{} player:{} discard:{} round_pokers:{}".format(self.prefixLogStr, idx, pokers,
																			   self.round_pokers))

	# 抓底牌
	def draw_cover(self, can_surrender_second):
		pokers = list(self.pokers)
		self.players_list[self.lord_idx].pokers.extend(pokers)
		self.players_list[self.lord_idx].tidy()
		self.wait_aid_list = [const_ll7.COVER_POKER]
		if can_surrender_second and self.players_list[self.lord_idx].pokers.count(self.lord_pokers[0]) == 2:
			self.wait_aid_list.append(const_ll7.SURRENDER_SECOND)
			# self.add_op_timer(SURRENDER_TIME, self.surrenderSecondTimeEnd)

		self.ll7BroadcastOperation3(self.lord_idx, const_ll7.DRAW_COVER, pokers, self.lord_idx)

	# 押底牌
	def cover_poker(self, idx, pokers):
		p = self.players_list[idx]
		for _c in pokers:
			p.pokers.remove(_c)
		self.pokers = pokers

		if len(self.lord_pokers) == 1:		# 埋底结束 等待其他玩家反主
			self.ll7BroadcastOperation3(idx, const_ll7.COVER_POKER, pokers, -1)
			self.lord_state = [0] * self.player_num
			self.lord_state[idx] = 1
			self.wait_aid_list = [const_ll7.LORD_THIRD]
			self.add_op_timer(LORD_THIRD_TIME, self.lord_end)
		else:								# 埋底结束 开始打牌
			self.wait_aid_list = [const_ll7.DISCARD]
			self.round_pokers[0] = idx
			self.ll7BroadcastOperation3(idx, const_ll7.COVER_POKER, pokers, idx)
			self.waitForOperation(idx, const_ll7.DISCARD)

	def surrenderFirstTimeEnd(self):
		self._op_timer = None
		self.draw_cover(True)

	# def surrenderSecondTimeEnd(self):
	# 	# 第二次 认输结束 必须压完底 才能 等待玩家反主
	# 	self._op_timer = None
	# 	if const_ll7.SURRENDER_SECOND in self.wait_aid_list:
	# 		self.wait_aid_list.pop(self.wait_aid_list.index(const_ll7.SURRENDER_SECOND))

	def lord_end(self):
		self.wait_aid_list = [const_ll7.DISCARD]
		self.lord_state = [1] * self.player_num
		self.cancel_op_timer()
		self.round_pokers[0] = self.lord_idx
		self.waitForOperation(self.lord_idx, const_ll7.DISCARD)

	# 结束翻底牌
	def show_cover(self, idx, poker_type):
		cover_mul = 2**(poker_type&3) if self.play_mode else 1
		cover_score = self.players_list[idx].add_poker_score(self.pokers, cover_mul)
		# self.ll7BroadcastOperation(idx, const_ll7.SHOW_COVER, self.pokers, -1)
		self.winGame(idx,cover_score, cover_mul, poker_type)

	def surrender(self, aid):
		for k, v in enumerate(self.players_list):
			if v is not None:
				if aid == const_ll7.SURRENDER_FIRST:
					if k == self.lord_idx:
						v.add_score(-(self.player_num-1))
					else:
						v.add_score(1)
				else:
					if k == self.lord_idx:
						v.add_score(-(self.player_num-1)*2)
					else:
						v.add_score(2)

		for k, v in enumerate(self.players_list):
			if v is not None:
				v.settlement()

		info = dict()
		info['score_list'] = [p.score for p in self.players_list]
		info['poker_score_list'] = [p.poker_score for p in self.players_list]
		info['lord_idx'] = self.lord_idx
		info['partner_idx'] = self.partner_idx
		info['cover_pokers'] = list(self.pokers)
		info['cover_score'] = 0
		info['cover_mul'] = 0
		info['surrender'] = 1
		info['bonus_idx'] = self.bonus_idx
		info['final_idx'] = self.lord_idx
		info['final_control_type'] = const_ll7.TYPE_NONE

		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def winGame(self, idx, cover_score, cover_mul, poker_type):
		self.settlement(idx, poker_type)
		info = dict()
		info['score_list'] = [p.score for p in self.players_list]
		info['poker_score_list'] = [p.poker_score for p in self.players_list]
		info['lord_idx'] = self.lord_idx
		info['partner_idx'] = self.partner_idx
		info['cover_pokers'] = list(self.pokers)
		info['cover_score'] = cover_score
		info['cover_mul']	= cover_mul
		info['surrender'] = 0
		info['bonus_idx'] = self.bonus_idx
		info['final_idx']	= idx
		info['final_control_type'] = poker_type

		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def settlement(self, idx, poker_type):
		# 闲家得分
		collect_score = sum(v.poker_score for k,v in enumerate(self.players_list) if k != self.lord_idx and k != self.partner_idx)
		# 是否庄扣底
		is_lord_bottom = (idx == self.lord_idx or idx == self.partner_idx)
		# 是否庄家赢
		if self.bottom_level == 1:
			is_lord_win = 1 if is_lord_bottom and collect_score < 80 else 0
		else:
			is_lord_win = 1 if collect_score < 80 else 0

		if self.player_num == const_ll7.PLAYER_NUM[0]:
			if self.lord_idx == self.partner_idx:	# 4人单打
				if self.sig_double and is_lord_win: # 庄家赢 单打才翻倍
					cal_list = [-6, 0, 2]
				else:
					cal_list = [-3, 0, 1]
			else:						# 4人双打
				cal_list = [-1, -1, 1]
		else:
			if self.lord_idx == self.partner_idx:	# 5人主单打
				if self.sig_double and is_lord_win: # 庄家赢 单打才翻倍
					cal_list = [-8, 0, 2]
				else:
					cal_list = [-4, 0, 1]
			else:						# 5人双打
				cal_list = [-2, -1, 1]

		cal_list = [_score*self.mul_level for _score in cal_list]

		# 抓分倍数
		if self.bottom_level == 1 and not is_lord_bottom and collect_score < 80:	# 闲家扣底 并且 总得分小于 80分(小于80分并且赢的情况只和扣底加级有关)
			mul = 0
		else:										
			mul = int(collect_score/40) -2 if collect_score != 0 else -self.max_level
			mul = mul if mul < 0 else mul + 1
		# 扣底加级(闲家赢才扣底 mul 必然是正数)
		if self.bottom_level == 1 and not is_lord_win and not is_lord_bottom:
			if (poker_type & 3) == 1:
				mul += 1
			elif (poker_type & 3) == 2:
				mul += 2
			elif (poker_type & 3) == 3:
				mul += 4
		# 封顶倍数
		mul = mul if abs(mul) <= self.max_level else (1 if mul > 0 else -1) * self.max_level
		# 首7翻倍
		mul = mul*2 if self.bonus_idx == self.lord_idx and is_lord_win else mul

		for k, v in enumerate(self.players_list):
			if v is not None:
				if k == self.lord_idx:
					v.add_score(cal_list[0] * mul)
				elif k == self.partner_idx:
					v.add_score(cal_list[1] * mul)
				else:
					v.add_score(cal_list[2] * mul)

		for k, v in enumerate(self.players_list):
			if v is not None:
				v.settlement()

	# 比较大小
	def beginRound(self, current_idx, pokers):

		pokers_type = utility_ll7.getPokersType(pokers, utility_ll7.lord_color(self.lord_pokers))

		# 新回合开始
		def start():
			# 回合 [next_idx, control_idx, begin_idx, current_idx, control_type, begin_type, poker_list]
			self.round_pokers = [None, None, None, None, None, None, [None] * self.player_num]
			self.round_pokers[0] = (current_idx+1)%self.player_num						# 下个出牌的玩家
			self.players_list[current_idx].discard(pokers, self.round_pokers[0])		# 出牌
			self.round_pokers[1] = current_idx
			self.round_pokers[2] = current_idx
			self.round_pokers[3] = current_idx
			self.round_pokers[4] = pokers_type
			self.round_pokers[5] = pokers_type
			self.round_pokers[6][current_idx] = pokers

		# 回合结束
		def over():
			# 回合 [next_idx, control_idx, begin_idx, current_idx, control_type, begin_type, poker_list]
			self.history_pokers = [list(_c) if _c is not None else [] for _c in self.round_pokers[6]]
			# 回合结束 先算得分
			self.players_list[self.round_pokers[1]].add_poker_score([_c for _pokers in self.history_pokers for _c in _pokers], 1)
			# 下一回合 出牌玩家
			if sum([1 for p in self.players_list if len(p.pokers) == 0]) + 1 == self.player_num:	# 一局结束
				next_idx = -1
				self.players_list[current_idx].discard(pokers, next_idx)							# 出牌
				self.show_cover(self.round_pokers[1], self.round_pokers[4])							# 扣底
			else:
				next_idx = self.round_pokers[1]
				self.players_list[current_idx].discard(pokers, next_idx)							# 出牌
			self.round_pokers[0] = next_idx
			self.round_pokers[1] = None
			self.round_pokers[2] = None
			self.round_pokers[3] = None
			self.round_pokers[4] = None
			self.round_pokers[5] = None
			self.round_pokers[6] = [None] * self.player_num

		if self.round_pokers[1] is None: # 新回合
			start()
		else:
			self.round_pokers[3] = current_idx
			self.round_pokers[6][current_idx] = pokers
			if utility_ll7.compare(self.round_pokers, (pokers_type, pokers), utility_ll7.lord_color(self.lord_pokers)):
				self.round_pokers[1] = current_idx
				self.round_pokers[4] = pokers_type

			if self.round_pokers[2] == (current_idx + 1) % self.player_num: # 回合结束
				over()
			else: # 回合未结束继续下个玩家出牌
				self.round_pokers[0] = (current_idx + 1) % self.player_num
				self.players_list[current_idx].discard(pokers, self.round_pokers[0])


	def client_prepare(self, avt_mb):
		DEBUG_MSG("{0} client_prepare userId:{1}".format(self.prefixLogStr, avt_mb.userId))
		self.prepare(avt_mb)
		self.ready_after_prepare()

	def prepare(self, avt_mb):
		""" 第一局/一局结束后 玩家准备 """
		if self.state == const.ROOM_PLAYING or self.state == const.ROOM_TRANSITION:
			return

		idx = self._get_player_idx(avt_mb)
		if idx not in self.confirm_next_idx:
			self.confirm_next_idx.append(idx)
			for p in self.players_list:
				if p and p.idx != idx:
					p and p.readyForNextRound(idx)

	def ready_after_prepare(self):
		if self.state == const.ROOM_WAITING and len(self.confirm_next_idx) == self.player_num:
			self.pay2StartGame()

	def cancel_prepare(self, idx):
		if self.state != const.ROOM_WAITING:
			return
		idx in self.confirm_next_idx and self.confirm_next_idx.remove(idx)

	def pay2StartGame(self):
		if self.timeout_timer:
			self.cancel_timer(self.timeout_timer)
			self.timeout_timer = None

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
		self.start(False)

	# 扣房卡/钻石成功后开始游戏(不改动部分)
	def start(self, restart=False):
		DEBUG_MSG("{} start restart:{}".format(self.prefixLogStr, restart))
		if self.quit_times >= const_ll7.QUIT_TIMES:
			self.base.destroyByServer("无人叫主次数达到上限:{},解散房间.".format(self.quit_times))
			return
		self.quit_times += 1
		if not restart:
			self.current_round += 1
			self.base.onRoomRoundChange(self.current_round)
		# 重置数据
		self.op_record = []
		self.wait_aid_list = []
		self.lord_idx = -1
		self.partner_idx = -1
		self.bonus_idx = -1
		self.lord_pokers = []
		self.lord_state = [0] * self.player_num
		self.round_pokers = [None, None, None, None, None, None, [None] * self.player_num]

		for p in self.players_list:
			p.reset()

		def begin(prefab_pokers = [[] for i in range(self.player_num)], cover_pokers = []):
			self.state = const.ROOM_PLAYING
			self.init_pokers()  # 牌堆
			self.shuffle_pokers()  # 打乱
			self.prefabPokers(prefab_pokers, cover_pokers)
			# self.deal(prefab_pokers, cover_pokers)  # 发牌
			self.firstDeal()  # 发牌
			self.tidy()  # 整理
			self.beginGame(restart)

		if switch.DEBUG_BASE == 0:
			begin()
		elif switch.DEBUG_BASE == 1:  # 开发模式 除去不必要的通信时间 更接近 真实环境
			prefab_pokers = [[31],
							 [30,30],
							 [29,29],
							 [28],
							 [28]]
			cover_pokers = [31]
			begin(prefab_pokers, cover_pokers)
		else:
			def callback(data):
				DEBUG_MSG("{} data:{}".format(self.prefixLogStr, data))
				if data is None:
					begin()
					return
				prefab_pokers = [[] for i in range(self.player_num)]
				cover_pokers = []
				# 检查数据
				for k, v in enumerate(data["pokers"]):
					if k < self.player_num:
						for t in v:
							if utility_ll7.validPoker(t):
								prefab_pokers[k].append(t)

				for t in data["cover_poker"]:
					if utility_ll7.validPoker(t):
						cover_pokers.append(t)
				begin(prefab_pokers, cover_pokers)
			utility.getDebugPrefab(self.players_list[0].accountName, callback, const_ll7.DEBUG_JSON_NAME)

	# 玩家开始游戏
	def beginGame(self, restart):
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.startGame({
					'pokers'	: p.pokers,
					'curRound'	: self.current_round,
					'restart'	: 1 if restart else 0
				})
		DEBUG_MSG("{} start game:{}".format(self.prefixLogStr, [_p.pokers for _p in self.players_list]))
		self.wait_aid_list = [const_ll7.LORD_FIRST]
		self.add_op_timer(FIRST_DEAL_TIME, self.secondDeal)
		if restart:
			self.give_up_record_game()
		self.begin_record_game()

	def add_op_timer(self, delay, callback):
		self._op_timer = self.add_timer(delay, callback)
		self._op_timer_ts = time.time()

	def cancel_op_timer(self):
		if self._op_timer is not None:
			self.cancel_timer(self._op_timer)
			self._op_timer = None

	def begin_record_game(self):
		DEBUG_MSG("{} begin record game".format(self.prefixLogStr))
		self.begin_record_room()

		KBEngine.globalData['GameWorld'].begin_record_room(self, self.roomIDC, {
			'init_info': self.get_init_client_dict(),
			'player_id_list': [p.userId for p in self.players_list],
			'init_pokers': [list(p.pokers) for p in self.players_list],
			'begin_cover_pokers': list(self.pokers[-8:]),
			'start_time': time.time(),
			'roomId': self.roomIDC,
			'clubId': self.club_id,
		})

	def begin_record_room(self):
		# 在第一局的时候记录基本信息
		if self.current_round != 1:
			return
		self.game_result = {
			'game_round'	: self.game_round,
			'roomID'		: self.roomIDC,
			'game_type'		: self.gameTypeC,
			'user_info_list': [p.get_basic_user_info() for p in self.players_list if p],
			'round_result'	: []
		}

	def begin_record_callback(self, record_id):
		self.record_id = record_id

	def get_partner_idx(self, lord_idx, poker):
		for k, v in enumerate(self.players_list):
			if k != lord_idx and v is not None and any(_c == poker for _c in v.pokers):
				return k
		return lord_idx

	def has_pokers(self, idx, pokers):
		if self.players_list[idx] is None:
			return False
		p = self.players_list[idx]
		c_dict = utility_ll7.getPokers2NumDict(pokers)
		return len(pokers)>0 and all(p.pokers.count(_c)>=c_dict[_c] for _c in c_dict)

	def canDiscard(self, idx, pokers):
		if idx != self.round_pokers[0]:
			DEBUG_MSG("{} player:{} can't discard wait_idx:{}".format(self.prefixLogStr, idx, self.round_pokers[0]))
			return False
		if not self.has_pokers(idx, pokers):
			DEBUG_MSG("{} player:{} can't discard:{} has pokers:{}".format(self.prefixLogStr, idx, pokers, self.players_list[idx].pokers))
			return False
		h_pokers = self.players_list[idx].pokers
		d_type = utility_ll7.getPokersType(pokers, utility_ll7.lord_color(self.lord_pokers))
		DEBUG_MSG("{} player {} discard:{},own pokers:{},round_pokers:{}".format(self.prefixLogStr, idx, pokers, h_pokers, self.round_pokers))
		DEBUG_MSG("{} player {} discard:{}, d_type:{}".format(self.prefixLogStr, idx, pokers, d_type))
		# 第一手出牌
		if self.round_pokers[1] is None \
			or idx == self.round_pokers[1]:
			DEBUG_MSG("{} player {} d_type != const_ll7.CARDS_MESS {}".format(self.prefixLogStr, idx, d_type != const_ll7.CARDS_MESS))
			DEBUG_MSG("{} player {} (d_type & 3) > 0 {}".format(self.prefixLogStr, idx, (d_type & 3) > 0))
			return d_type != const_ll7.CARDS_MESS and (d_type & 3) > 0

		# 后手出牌
		# 类型 和 张数 都正确
		# 回合 [next_idx, control_idx, begin_idx, current_idx, control_type, begin_type, poker_list]
		s_type = self.round_pokers[5]
		s_pokers = self.round_pokers[6][self.round_pokers[2]]
		s_color = s_type >> const_ll7.TYPE_OFFSET
		DEBUG_MSG("{} player {} s_type:{} s_pokers:{} s_color:{}".format(self.prefixLogStr, idx, s_type, s_pokers, s_color))
		if len(pokers) == len(s_pokers):
			n_pokers = utility_ll7.getColorPokers(pokers, s_color, utility_ll7.lord_color(self.lord_pokers))	# 出牌符合类型的
			m_pokers = utility_ll7.getColorPokers(h_pokers, s_color, utility_ll7.lord_color(self.lord_pokers)) # 手牌符合类型的
			n_pokers = sorted(n_pokers)
			m_pokers = sorted(m_pokers)
			DEBUG_MSG("{} player {} n_pokers:{} m_pokers:{}".format(self.prefixLogStr, idx,n_pokers, m_pokers))
			if d_type == const_ll7.CARDS_MESS: 	# 混合牌
				DEBUG_MSG("{} n_pokers == m_pokers".format(self.prefixLogStr))
				return n_pokers == m_pokers
			elif d_type == s_type:				# 同类型
				DEBUG_MSG("{} d_type == s_type".format(self.prefixLogStr))
				return True
			elif s_type&3 == const_ll7.TYPE_ONE:				# 同类型
				isSub = utility_ll7.isSub(m_pokers, n_pokers)
				DEBUG_MSG("{} isSub:{} m_pokers:{} pokers:{}".format(self.prefixLogStr, isSub, m_pokers, pokers))
				return isSub and (pokers[0] in m_pokers or len(m_pokers)==0)
			elif s_type&3 == const_ll7.TYPE_PAIR: # 起手 对子
				isSub = utility_ll7.isSub(m_pokers, n_pokers)
				m_pairs = utility_ll7.getTypePokers(m_pokers, const_ll7.TYPE_PAIR)
				DEBUG_MSG("{} isSub:{} m_pairs:{}".format(self.prefixLogStr, isSub, m_pairs))
				return isSub and len(m_pairs) <= 0 and (len(pokers) == len(n_pokers) or len(m_pokers) == len(n_pokers))
			elif s_type&3 == const_ll7.TYPE_SEQ_PAIR: # 起手 拖拉机
				isSub = utility_ll7.isSub(m_pokers, n_pokers)
				m_pairs = utility_ll7.getTypePokers(m_pokers, const_ll7.TYPE_PAIR)
				d_pairs = utility_ll7.getTypePokers(pokers, const_ll7.TYPE_PAIR)
				# 主牌拖拉机特殊处理 必须是 黑红梅方 中的一种 加 大小王
				if s_color == const_ll7.POKER_LORD:
					c_pokers = utility_ll7.getColorPokers(h_pokers, s_color, utility_ll7.lord_color(self.lord_pokers))
					seq_pairs = utility_ll7.getTypePokers(c_pokers, const_ll7.TYPE_SEQ_PAIR)
					DEBUG_MSG("{} isSub:{} m_pairs:{} d_pairs:{} c_pokers:{} seq_pairs:{}".format(self.prefixLogStr, isSub,m_pairs, d_pairs, c_pokers, seq_pairs))
				else:
					seq_pairs = utility_ll7.getTypePokers(m_pokers, const_ll7.TYPE_SEQ_PAIR)
					DEBUG_MSG("{} isSub:{} m_pairs:{} d_pairs:{} seq_pairs:{}".format(self.prefixLogStr, isSub,m_pairs, d_pairs, seq_pairs))
				seq_pairs = [_pokers for _pokers in seq_pairs if len(_pokers) >= len(s_pokers)]
				# 有对必须出对子
				single = len(pokers) / 2 - len(d_pairs)
				leftPair = len(m_pairs) - len(d_pairs)
				DEBUG_MSG("{} single:{} leftPair:{} seq_pairs:{}".format(self.prefixLogStr, single, leftPair, seq_pairs))
				return isSub and len(seq_pairs) == 0 and ((single>0 and leftPair<=0) or single<=0) and (len(pokers) == len(n_pokers) or len(m_pokers) == len(n_pokers))
		return False

	def ll7BroadcastOperation(self, idx, aid, pokers, next_idx):
		"""
		将操作广播给所有人, 包括当前操作的玩家
		:param idx: 当前操作玩家的座位号
		:param aid: 操作id
		:param pokers: 出牌的list
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.ll7PostOperation(idx, aid, pokers, next_idx)

	def ll7BroadcastOperation2(self, idx, aid, pokers, next_idx):
		"""
		将操作广播给除当前玩家的其他人
		:param idx: 当前操作玩家的座位号
		:param aid: 操作id
		:param pokers: 出牌的list
		"""
		for i, p in enumerate(self.players_list):
			if p is not None and i != idx:
				p.ll7PostOperation(idx, aid, pokers, next_idx)

	def ll7BroadcastOperation3(self, idx, aid, pokers, next_idx):
		"""
		将操作广播给所有人, 包括当前操作的玩家, 但是对其他玩家不可见
		:param idx: 当前操作玩家的座位号
		:param aid: 操作id
		:param pokers: 出牌的list
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				if i == idx:
					p.ll7PostOperation(idx, aid, pokers, next_idx)
				else:
					p.ll7PostOperation(idx, aid, [0]*len(pokers), next_idx)


	def waitForOperation(self, idx, aid):
		"""
		将操作广播给所有人, 包括当前操作的玩家
		:param idx: 当前操作玩家的座位号
		:param aid: 玩家等待操作id
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.ll7WaitForOperation(idx, aid)

	def endAll(self, info):
		""" 游戏局数结束, 给所有玩家显示最终分数记录 """

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

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

	def broadcastRoundEnd(self, info):
		# 广播胡牌或者流局导致的每轮结束信息, 包括算的扎码和当前轮的统计数据

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		self.state = const.ROOM_WAITING
		DEBUG_MSG("{} broadcastRoundEnd state:{}".format(self.prefixLogStr, self.state))
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]

		DEBUG_MSG("{}=={}".format(self.prefixLogStr, "&" * 30))
		DEBUG_MSG("{} RoundEnd info:{}".format(self.prefixLogStr, info))

		self.confirm_next_idx = []
		for p in self.players_list:
			if p:
				p.roundResult(info)

		self.end_record_game(info)
		self.addAvatarGameRound()

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

	def end_record_game(self, result_info):
		DEBUG_MSG("{} end record game; {} == round_pokers {}".format(self.prefixLogStr, self.record_id, self.round_pokers))
		KBEngine.globalData['GameWorld'].end_record_room(self.roomIDC, self.club_id, self.gameTypeC, {
			'op_record_list': json.dumps(self.op_record),
			'round_result': result_info,
			'lord_idx': self.lord_idx,
			'lord_pokers': list(self.lord_pokers),
			'end_cover_pokers': list(self.pokers),
			'end_time': time.time()
		})
		self.record_id = -1

	def addAvatarGameRound(self):
		for p in self.players_list:
			if p is not None:
				p.base.addAvatarGameRound(self.gameTypeC, 1)

	def apply_dismiss_room(self, avt_mb, agree_num, seconds):
		""" 游戏开始后玩家申请解散房间 """
		if self.dismiss_timer is not None:
			self.vote_dismiss_room(avt_mb, 1)
			return
		self.dismiss_room_ts = time.time()
		src = None
		for i, p in enumerate(self.players_list):
			if p is not None and p.userId == avt_mb.userId:
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

			# 玩家牌局记录存盘
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
			self.dismiss_room_state_list = [0] * self.player_num


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

	def timeoutDestroy(self):
		INFO_MSG("{} timeout destroyed. room_type = {}, owner_uid = {}".format(self.prefixLogStr, self.room_type, self.owner_uid))
		if self.current_round < 1:
			self.dropRoom()

	def give_up_record_game(self):
		DEBUG_MSG("{} give up record game; {}".format(self.prefixLogStr, self.record_id))
		KBEngine.globalData['GameWorld'].give_up_record_room(self.roomIDC)

	def saveRoomResult(self):
		# 保存玩家的战绩记录
		self.save_game_result()
		# 保存茶楼的战绩
		if self.room_type == const.CLUB_ROOM:
			self.save_club_result()

	def save_game_result(self):
		DEBUG_MSG('{} ----- save_game_result ----- len:{}'.format(self.prefixLogStr, len(self.game_result.get('round_result', []))))
		if 'round_result' in self.game_result and len(self.game_result.get('round_result', [])) > 0:
			result_str = json.dumps(self.game_result)
			for p in self.players_list:
				p and p.save_game_result(result_str)

	def save_club_result(self):
		DEBUG_MSG('{} ------ save club result -----'.format(self.prefixLogStr))
		d = self.get_club_complete_dict()
		self.base.saveClubResult(d)
		if 'round_result' in self.game_result and len(self.game_result['round_result']) > 0:
			self.base.updateClubDAU([p.get_dau_client_dict() for p in self.players_list if p is not None])

	def get_club_complete_dict(self):
		return {
			'gameType'		: self.gameTypeC,
			'roomID'		: self.roomIDC,
			'time'			: utility.get_cur_timestamp(),
			'game_round'	: self.game_round,
			'pay_mode'		: self.pay_mode,
			'roundResult'	: json.dumps(self.game_result.get('round_result', [])),
			'player_info_list': [p.get_club_client_dict() for p in self.players_list if p is not None],
			'cost'			: utility.calc_cost(self.gameTypeC, self.roomParamsC)[0] if self.current_round >= 2 else 0 # 第二局开始扣房卡
		}

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

	def get_init_client_dict(self):
		return {
			'roomID': self.roomIDC,
			'ownerId': self.owner_uid,
			'roomType': self.room_type,
			'curRound': self.current_round,
			'game_round': self.game_round,
			'player_num': self.player_num,
			'pay_mode': self.pay_mode,
			'play_mode': self.play_mode,
			'max_level': self.max_level,
			'mul_level': self.mul_level,
			'bottom_level': self.bottom_level,
			'sig_double': self.sig_double,
			'is_emotion': self.is_emotion,
			'hand_prepare': self.hand_prepare,
			'op_seconds': self.op_seconds,
			'room_state': const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'club_id': self.club_id,
			'table_idx': getattr(self, 'table_idx', -1),
			'player_base_info_list': [p.get_init_client_dict() for p in self.players_list if p is not None],
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
		}

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


	def get_reconnect_room_dict(self, userId):
		dismiss_left_time = self.dismissRoomSecends - (int(time.time() - self.dismiss_room_ts))
		if self.dismiss_room_ts == 0 or dismiss_left_time >= self.dismissRoomSecends:
			dismiss_left_time = 0

		idx = 0
		for p in self.players_list:
			if p and p.userId == userId:
				idx = p.idx

		if const_ll7.LORD_FIRST in self.wait_aid_list:
			wait_time_left = FIRST_DEAL_TIME -(time.time()-self._op_timer_ts)
		elif const_ll7.LORD_SECOND in self.wait_aid_list:
			wait_time_left = SECOND_DEAL_TIME - (time.time() - self._op_timer_ts)
		elif const_ll7.SURRENDER_FIRST in self.wait_aid_list:
			wait_time_left = SURRENDER_TIME - (time.time() - self._op_timer_ts)
		elif const_ll7.LORD_THIRD in self.wait_aid_list:
			wait_time_left = LORD_THIRD_TIME - (time.time() - self._op_timer_ts)
		else:
			wait_time_left = 0


		# 庄家队友
		if self.partner_idx >= 0:
			if len(self.lord_pokers) == 2:
				partner_idx = self.partner_idx
			else:
				partner_idx = self.partner_idx if not self.has_pokers(self.partner_idx, self.lord_pokers) else -1
		else:
			partner_idx = self.partner_idx

		# 回合 [next_idx, control_idx, begin_idx, current_idx, control_type, begin_type, poker_list]
		# self.round_pokers = [None, None, None, None, None, None, [None] * self.player_num]
		DEBUG_MSG(self.round_pokers)
		DEBUG_MSG(self.history_pokers)

		return {
			'gameType': self.gameTypeC,
			'init_info': self.get_init_client_dict(),
			'room_state': const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
			'waitTimeLeft': int(wait_time_left),
			'applyCloseFrom': self.dismiss_room_from,
			'applyCloseLeftTime': dismiss_left_time,
			'applyCloseStateList': self.dismiss_room_state_list,
			'player_advance_info_list': [p.get_reconnect_client_dict(userId) for p in self.players_list if p is not None],

			'lord_aid': self.wait_aid_list,
			'lord_idx': self.lord_idx,
			'partner_idx': partner_idx,
			'bonus_idx': self.bonus_idx,
			'lord_state': self.lord_state,
			'lord_pokers': self.lord_pokers,

			'next_idx': self.round_pokers[0] if self.round_pokers[0] is not None else -1,
			'control_idx': self.round_pokers[1] if self.round_pokers[1] is not None else -1,
			'begin_idx': self.round_pokers[2] if self.round_pokers[2] is not None else -1,
			'current_idx': self.round_pokers[3] if self.round_pokers[3] is not None else -1,
			'desk_pokers': list(map(lambda x:list(x) if x is not None else [], self.round_pokers[6])), # 桌牌

			'cover_pokers': list(self.pokers) if self.lord_idx == idx else [0]*8,
			'history_pokers': list(self.history_pokers),
		}
