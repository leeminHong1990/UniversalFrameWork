# -*- coding: utf-8 -*-
import time

from Room_JZMJ import Room_JZMJ
from jzmj.utility_jzmj import *


class Room_JZGSJMJ(Room_JZMJ):
	""" 某种具体的游戏的房间 """

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

	# ----------------------------------------------------------------------------------------------------------------------
	#                                  Room Rules
	# ----------------------------------------------------------------------------------------------------------------------

	def cal_win_score(self, idx, fromIdx, score, tile, aid, result):
		# 胡牌算分
		from_player = self.players_list[fromIdx]
		win_player = self.players_list[idx]
		score = score * self.base_score
		if from_player.discard_state == DISCARD_FREE:
			from_player.add_score(-score * 2)
			win_player.add_score(score * 2)
			if aid == const.OP_GIVE_WIN or aid == const.OP_KONG_WIN:
				result[1] = 1
				from_player.add_score(-1 * self.base_score)
				win_player.add_score(1 * self.base_score)
			if idx != self.dealer_idx:
				if aid == const.OP_DRAW_WIN:
					from_player.add_score(-2 * self.base_score)
					win_player.add_score(2 * self.base_score)
				else:
					from_player.add_score(-1 * self.base_score)
					win_player.add_score(1 * self.base_score)
		elif from_player.discard_state == DISCARD_FORCE:
			for i, p in enumerate(self.players_list):
				if p and i != idx:
					p.add_score(-score)
				elif p and i == idx:
					p.add_score(score * 2)
			if idx != self.dealer_idx:
				if aid == const.OP_DRAW_WIN:
					self.players_list[self.dealer_idx].add_score(-2 * self.base_score)
					win_player.add_score(2 * self.base_score)
				else:
					self.players_list[self.dealer_idx].add_score(-1 * self.base_score)
					win_player.add_score(1 * self.base_score)
		for i, p in enumerate(self.players_list):
			if p and i != idx:
				if from_player.discard_state == DISCARD_FREE:
					from_player.add_score(win_player.kong_score_list[i])
				elif from_player.discard_state == DISCARD_FORCE:
					p.add_score(win_player.kong_score_list[i])
			elif p and i == idx:
				p.add_score(win_player.kong_score_list[i])

	def cal_score(self, idx, fromIdx, aid, score, tile=None, result=[]):
		# 算分
		player = self.players_list[idx]
		if (aid >> 3) == const.SHOW_KONG:
			for i, p in enumerate(self.players_list):
				if p and i != idx:
					player.kong_score_list[i] -= score
				elif p and i == idx:
					player.kong_score_list[i] += score * 2
		elif aid == const.OP_DRAW_WIN:  # 自摸胡
			DEBUG_MSG("room:{0},curround:{1} OP_DRAW_WIN==>idx:{2}".format(self.roomIDC, self.current_round, idx))
			self.cal_win_score(idx, fromIdx, score * 2, tile, aid, result)
		elif aid == const.OP_KONG_WIN:  # 抢杠胡跟放炮胡一样
			DEBUG_MSG("room:{0},curround:{1} OP_KONG_WIN==>idx:{2}]".format(self.roomIDC, self.current_round, idx))
			self.cal_win_score(idx, fromIdx, score, tile, aid, result)
		elif aid == const.OP_GIVE_WIN:  # 放炮胡
			DEBUG_MSG("room:{0},curround:{1} OP_GIVE_WIN==>idx:{2}]".format(self.roomIDC, self.current_round, idx))
			self.cal_win_score(idx, fromIdx, score, tile, aid, result)
		elif aid == const.OP_WREATH_WIN:
			pass
