# -*- coding: utf-8 -*-

import json
import random
import time
from datetime import datetime

import const
import switch
import utility
from Functor import Functor
from KBEDebug import *
from LimitQueue import LimitQueue
from Room import Room
from const_ddz import *
from deuces.lookup import *

Rules = [
	is_single, is_flower, is_pair_joker, is_pair2, is_pair3, is_pair4,
	is_pair3_1, is_pair3_2,
	is_pair4_2_1, is_pair4_2_2,
	is_seq, is_seq_pair2, is_seq_pair3, is_seq_pair3_1, is_seq_pair3_2,
]

FORCE_OP_SECONDS = 0

def get_greater_than_rules(target):
	result = None
	for arr in CARDS_PRIORITY:
		if result is not None:
			result += arr
		if result is None and target in arr:
			result = []

	return result


class Room_DDZ(Room):

	def __init__(self):
		Room.__init__(self)
		self.tiles = []

		# 庄家index
		self.dealer_idx = -1
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

		self.current_round = 0
		self.last_player_idx = -1
		# 房间开局所有操作的记录(aid, src, des, [data])
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
		# 抢庄倍数(0不抢， 1：一倍....)
		self.fight_dealer_mul_list = [-1] * self.player_num
		# 叫地主分数
		self.bet_score_list = [-1] * self.player_num
		# 分数倍数
		self.mul_score_list = [0] * self.player_num
		self.cur_allow_op = OP_NONE
		# 续房的标记
		self._continue_room_flag = False
		# 地主的三张牌
		self.host_cards = []
		self.last_discard_idx = -1
		self.discard_record = LimitQueue(3)
		# 上一个win的玩家
		self.last_win_idx = 0
		self.boom_times = 0
		self.op_seconds = FORCE_OP_SECONDS

	def _reset(self):
		self.cur_allow_op = OP_NONE
		self.state = const.ROOM_WAITING
		self.agent = None
		self.players_list = [None] * self.player_num
		self.origin_players_list = [None] * self.player_num
		self.dealer_idx = -1
		self.current_idx = 0
		self._poll_timer = None
		self._op_timer = None
		self._next_game_timer = None
		self.current_round = 0
		self.confirm_next_idx = []
		self.dismiss_timer = None
		self.dismiss_room_ts = 0
		self.dismiss_room_state_list = [0] * self.player_num
		self.wait_op_info_list = []
		self.last_discard_idx = -1
		self.discard_record.clear()
		self.boom_times = 0
		self.fight_dealer_mul_list = [-1] * self.player_num
		self.bet_score_list = [-1] * self.player_num
		self.mul_score_list = [0] * self.player_num
		self.destroySelf()

	def _reset2init(self):
		# Note: 续房的时候代开房的怎么办？
		if self.dismiss_timer:
			self.cancel_timer(self.dismiss_timer)
			self.dismiss_timer = None
		if self._op_timer:
			DEBUG_MSG("{} _reset_not_destroy cancel op timer".format(self.prefixLogStr))
			self.cancel_timer(self._op_timer)
			self._op_timer = None

		self.timeout_timer = self.add_timer(const.ROOM_TTL, self.timeoutDestroy)

		self.fight_dealer_mul_list = [-1] * self.player_num
		self.bet_score_list = [-1] * self.player_num
		self.mul_score_list = [0] * self.player_num
		self.last_discard_idx = -1
		self.discard_record.clear()
		self.boom_times = 0
		self.cur_allow_op = OP_NONE
		self.state = const.ROOM_WAITING
		# self.agent = None
		self.dealer_idx = -1
		self.current_idx = 0
		self._poll_timer = None
		self._next_game_timer = None
		self.current_round = 0
		self.confirm_next_idx = []
		self.dismiss_timer = None
		self.dismiss_room_ts = 0
		self.dismiss_room_state_list = [0] * self.player_num
		self.wait_op_info_list = []
		self.game_result = {}
		for p in self.players_list:
			p is not None and p.reset_all()

	@property
	def nextIdx(self):
		# tryNext = (self.current_idx + 1) % self.player_num
		# for j in range(2):
		# 	for i in range(self.player_num):
		# 		if self.player_num > tryNext:
		# 			return tryNext
		# 		tryNext = (tryNext + 1) % self.player_num
		return (self.current_idx + 1) % self.player_num

	@property
	def room_players(self):
		""" 所有在房间里的玩家 """
		return [p for p in self.players_list if p is not None]

	def _get_player_idx(self, avt_mb):
		for i, p in enumerate(self.players_list):
			if p and avt_mb.userId == p.userId:
				return i

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
		confirm_count = len(self.confirm_next_idx)
		if self.state == const.ROOM_WAITING and confirm_count == self.player_num:
			self.origin_players_list = self.players_list[:]
			self.pay2StartGame()

	def cancel_prepare(self, idx):
		if self.state != const.ROOM_WAITING:
			return
		idx in self.confirm_next_idx and self.confirm_next_idx.remove(idx)

	def reqReconnect(self, entityCall):
		DEBUG_MSG("{} entityCall reqReconnect userId:{}".format(self.prefixLogStr, entityCall.userId))
		if entityCall.id not in self.avatars.keys():
			return
		DEBUG_MSG("{0} avt_mb reqReconnect player:{1} is in room".format(self.prefixLogStr, entityCall.userId))
		# 如果进来房间后牌局已经开始, 就要传所有信息
		# 如果还没开始, 跟加入房间没有区别
		if self.state == const.ROOM_PLAYING or 0 < self.current_round <= self.game_round:
			if self.state == const.ROOM_WAITING:
				# 重连回来直接准备
				self.prepare(entityCall)
			rec_room_info = self.get_reconnect_room_dict(entityCall.userId)
			entityCall.handleReconnect(rec_room_info)
			if self.state == const.ROOM_WAITING:
				self.ready_after_prepare()
		else:
			sit = 0
			for idx, p in enumerate(self.players_list):
				if p and p and p.userId == entityCall.userId:
					sit = idx
					break
			entityCall.enterRoomSucceed(sit, self.get_init_client_dict())
			# 如果是续房后的第一局自动准备，执行准备
			if self._continue_room_flag and self.current_round == 0 and self.hand_prepare == const.AUTO_PREPARE:
				self.prepare(entityCall)

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

	def ddzBroadcastOperation2(self, idx, aid, tile_list, next_idx):
		""" 将操作广播除了自己之外的其他人 """
		for i, p in enumerate(self.players_list):
			if p and i != idx:
				p.ddzPostOperation(idx, aid, tile_list, next_idx)

	def broadcastRoundEnd(self, info):
		# 广播胡牌或者流局导致的每轮结束信息, 包括算的扎码和当前轮的统计数据

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		DEBUG_MSG("{0} broadcastRoundEnd state:{1}".format(self.prefixLogStr, self.state))
		self.state = const.ROOM_WAITING
		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]

		DEBUG_MSG("{0} RoundEnd info:{1}".format(self.prefixLogStr, info))

		self.confirm_next_idx = []
		for p in self.players_list:
			if p is not None:
				p.roundResult(info)

		self.end_record_game(info)
		self.addAvatarGameRound()

	def pay2StartGame(self):
		""" 开始游戏 """
		DEBUG_MSG("{} game_mode:{},game_max_lose:{},game_round:{},hand_prepare:{} pay2StartGame state:{}"
				  .format(self.prefixLogStr, self.game_mode, self.game_max_lose, self.game_round, self.hand_prepare, self.state))

		if self.timeout_timer:
			self.cancel_timer(self.timeout_timer)
			self.timeout_timer = None

		self.state = const.ROOM_TRANSITION

		# 通知base
		self.base.startGame()
		# 仅仅在第1局扣房卡, 不然每局都会扣房卡
		# 在第2局开始扣房卡
		if self.current_round == 1:
			accounts = [p.accountName for p in self.players_list]
			self.base.charge(accounts)
		else:
			self.paySuccessCbk()

	# 扣房卡/钻石成功后开始游戏(不改动部分)
	def paySuccessCbk(self):
		DEBUG_MSG("{} paySuccessCbk state:{}".format(self.prefixLogStr, self.state))
		# 第一局时房间默认房主庄家, 之后谁上盘赢了谁是, 如果臭庄, 上一把玩家继续坐庄
		swap_list = [-1 if p is None else p.idx for p in self.players_list]
		# if self.current_round == 0:
		# 	self.dealer_idx = 0
		# 	self.swapSeat(swap_list)
		# 	pass
		self.on_before_begin_round()

		def begin(prefab_hand_tiles=None):
			self.state = const.ROOM_PLAYING
			self.initTiles()  # 牌堆
			self.deal(prefab_hand_tiles)  # 发牌
			self.host_cards = self.tiles[:]
			self.tidy()  # 整理
			self.startGame(swap_list)

		if switch.DEBUG_BASE == 0:
			begin()
		elif switch.DEBUG_BASE == 1:  # 开发模式 除去不必要的通信时间 更接近 真实环境
			begin()
		else:
			self._get_debug_prefab(begin)

	def _get_debug_prefab(self, callback):
		def _callback(data):
			DEBUG_MSG("{} data:{}".format(self.prefixLogStr, data))
			if data is None:
				callable(callback) and callback(None)
			else:
				hand_tiles = [[] for i in range(self.player_num)]
				for k, v in enumerate(data["handTiles"]):
					k < self.player_num and hand_tiles[k].extend(v)
				callable(callback) and callback(hand_tiles)

		utility.getDebugPrefab(self.origin_players_list[0].accountName, _callback, DEBUG_JSON_NAME)

	# 玩家开始游戏
	def startGame(self, swap_list):
		DEBUG_MSG("{} start game swap_list:{}".format(self.prefixLogStr, swap_list))
		DEBUG_MSG("{} start game info:{} {} {}".format(self.prefixLogStr, self.dealer_idx, self.bet_score_list, self.max_boom_times))

		self.current_idx = self.last_win_idx
		for i, p in enumerate(self.players_list):
			if p and p:
				DEBUG_MSG("{} start begin tiles:{}".format(self.prefixLogStr, p.tiles))
				p.startGame({
					'current_idx': self.current_idx,
					'tiles': p.tiles,
					'host_cards': self.host_cards,
					'swap_list': swap_list,
					'curRound': self.current_round
				})

		self.add_operation_timer()
		if self.game_mode == GAME_MODE_SCORE:
			self.cur_allow_op = OP_BET
		elif self.game_mode == GAME_MODE_DEALER:
			self.cur_allow_op = OP_FIGHT_DEALER
		else:
			DEBUG_MSG("{} not support game mode {}".format(self.prefixLogStr, self.game_mode))

	def on_before_begin_round(self):
		self.op_record = []
		self.dealer_idx = -1
		self.cur_allow_op = OP_NONE
		self.current_round += 1
		self.mul_score_list = [0] * self.player_num

		self.bet_score_list = [-1] * self.player_num
		self.fight_dealer_mul_list = [-1] * self.player_num
		self.boom_times = 0
		self.last_discard_idx = -1
		self.discard_record.clear()
		self.host_cards.clear()
		[p is not None and p.reset() for p in self.players_list]
		self.base.onRoomRoundChange(self.current_round)

	def redeal(self, debug=False, prefab=None):
		if switch.DEBUG_BASE > 1 and not debug:
			self._get_debug_prefab(Functor(self.redeal, True))
			return

		self.bet_score_list = [-1] * self.player_num
		self.fight_dealer_mul_list = [-1] * self.player_num
		[p is not None and p.reset() for p in self.players_list]
		self.initTiles()  # 牌堆
		self.deal(prefab)  # 发牌
		self.host_cards = self.tiles[:]
		self.tidy()  # 整理

		self.op_record.append((OP_REDEAL, self.current_idx, self.last_win_idx, []))
		self.current_idx = self.last_win_idx
		for p in self.players_list:
			if p is not None:
				DEBUG_MSG("{} redeal tiles: {} host: {}".format(self.prefixLogStr, p.tiles, self.host_cards))
				p.redeal(self.current_idx, p.tiles, self.host_cards)
		self.add_operation_timer()

	def winGame(self, win_idx):
		spring = self.is_spring(win_idx)
		DEBUG_MSG("{} winGame: win idx {} mul {} bet {} spring {}".format(self.prefixLogStr, win_idx, self.fight_dealer_mul_list, self.bet_score_list, spring))
		self.cal_score(win_idx)
		self.settlement()
		self.last_win_idx = win_idx
		info = dict()
		info['result_list'] = [p.score for p in self.players_list]
		info['win_idx'] = win_idx
		info['dealer_idx'] = self.dealer_idx
		info['spring'] = 1 if spring else 0
		info['mul_score_list'] = self.mul_score_list[:]
		self.discard_record.clear()

		if self.current_round < self.game_round:
			self.broadcastRoundEnd(info)
		else:
			self.endAll(info)

	def begin_record_game(self):
		DEBUG_MSG("{} begin record game".format(self.prefixLogStr))
		self.begin_record_room()
		init_tiles = [None] * len(self.origin_players_list)
		player_id_list = []
		for p in self.origin_players_list:
			init_tiles[p.idx] = p.tiles[:]
			player_id_list.append(p.userId)

		KBEngine.globalData['GameWorld'].begin_record_room(self, self.roomIDC, {
			'init_info': self.get_init_client_dict(),
			'player_id_list': player_id_list,
			'init_tiles': init_tiles,
			'start_time': time.time(),
			"host_cards": self.host_cards,
			'roomId': self.roomIDC,
			'clubId': self.club_id,
			'mul_mode': self.mul_mode,
			'dealer_joker': self.dealer_joker,
			'dealer_42': self.dealer_42,
			'is_emotion': self.is_emotion,
		})

	def begin_record_callback(self, record_id):
		self.record_id = record_id

	def end_record_game(self, result_info):
		DEBUG_MSG("{} end record game; {}".format(self.prefixLogStr, self.record_id))
		KBEngine.globalData['GameWorld'].end_record_room(self.roomIDC, self.club_id, self.gameTypeC, {
			'op_record_list': json.dumps(self.op_record),
			'round_result': result_info,
			'mul_score_list': self.mul_score_list,
			'bet_score_list': self.bet_score_list,
			'fight_dealer_mul_list': self.fight_dealer_mul_list,
			'boom_times': self.boom_times,
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

	def get_continue_list(self, callback, playing_players):
		# 如果时代开房需要检查代理的房卡
		# 如果时房主 需要检查房主放房卡
		# 如果时AA 需要检查所有人的房卡
		card_cost, diamond_cost = utility.calc_cost(self.gameTypeC, self.roomParamsC)

		# Fixme: self.club is none 需要使用base上的club

		def _check_user_info(user_id, content):
			if self.club and not self.club.isMember(user_id):
				DEBUG_MSG("{0} userId:{1} get_continue_list callback error: not in club {2}".format(self.prefixLogStr, user_id, self.club.clubId))
				return False
			if content is None:
				DEBUG_MSG("{0} userId:{1} get_continue_list callback error: content is None".format(self.prefixLogStr, user_id))
				return False
			try:
				data = json.loads(content)
				if diamond_cost > data["diamond"] and card_cost > data["card"]:
					return False
			except:
				err, msg, stack = sys.exc_info()
				DEBUG_MSG("{0} _check_user_info callback error:{1} {4}, exc_info: {2} ,{3}".format(self.prefixLogStr, content, err, msg, user_id))
				return False
			return True

		def _user_info_callback(user_id, content):
			if _check_user_info(user_id, content):
				callback and callback([const.ROOM_CONTINUE] * self.player_num)
			else:
				callback and callback([const.ROOM_END] * self.player_num)

		if switch.DEBUG_BASE > 0:
			if self.pay_mode == const.CLUB_PAY_MODE:
				if self.club is None:
					callback and callback([const.ROOM_END] * self.player_num)
					return
			callback and callback([random.randint(0, 1) if i % 2 == 0 and i > 0 else 1 for i in range(self.player_num)])
		elif self.pay_mode == const.NORMAL_PAY_MODE:
			utility.get_user_info(self.players_list[0].accountName, Functor(_user_info_callback, self.players_list[0].userId))
		elif self.pay_mode == const.AA_PAY_MODE:
			count = len(playing_players)
			stats = 0
			result = [const.ROOM_END] * self.player_num
			for p in playing_players:
				result[p.idx] = const.ROOM_CONTINUE

			def _find_idx(user_id):
				for p in playing_players:
					if p.userId == user_id:
						return p.idx
				return -1

			def _check_callback_aa(roomId, user_id, content):
				nonlocal stats
				nonlocal result
				stats += 1
				if not _check_user_info(user_id, content):
					idx = _find_idx(user_id)
					if idx != -1:
						result[idx] = const.ROOM_END
				if count == stats:
					callback and callback(result)

			for p in playing_players:
				utility.get_user_info(p.accountName, Functor(_check_callback_aa, self.roomIDC, p.userId))
		elif self.pay_mode == const.CLUB_PAY_MODE:
			if self.club is None:
				callback and callback([const.ROOM_END] * self.player_num)
			else:
				pay_account = self.club.owner['accountName']
				utility.get_user_info(pay_account, Functor(_user_info_callback, self.club.owner['userId']))
		else:
			ERROR_MSG("{} get_continue_list: not support {} {}".format(self.prefixLogStr, self.room_type, self.pay_mode))
			callback and callback([0] * self.player_num)

	def endAll(self, info):
		""" 游戏局数结束, 给所有玩家显示最终分数记录 """

		# 先记录玩家当局战绩, 会累计总得分
		self.record_round_result()

		info['player_info_list'] = [p.get_round_client_dict() for p in self.players_list if p is not None]
		player_info_list = [p.get_final_client_dict() for p in self.players_list if p is not None]
		DEBUG_MSG("{} endAll player_info_list = {}  info = {}".format(self.prefixLogStr, player_info_list, info))

		# players = self.players_list

		self.end_record_game(info)
		# 玩家牌局记录存盘
		self.saveRoomResult()
		# 有效圈数加一
		for p in self.players_list:
			if p and self.room_type == const.CLUB_ROOM:
				p.addGameCount()

		self.addAvatarGameRound()

		self._reset2init()
		self.state = const.ROOM_TRANSITION

		def callback(continue_list):
			self.state = const.ROOM_WAITING
			copy_list = self.players_list[:]
			for i, state in enumerate(continue_list):
				if state == const.ROOM_END and self.players_list[i]:
					id = self.players_list[i].id
					self.players_list[i] = None
					del self.avatars[id]

			continue_info = {}
			info['init_info'] = self.get_init_client_dict()
			continue_info['continue_list'] = continue_list
			DEBUG_MSG("{} continue info {}".format(self.prefixLogStr, continue_info))
			info.update(continue_info)
			for i, p in enumerate(copy_list):
				if p and p:
					if continue_info['continue_list'][i] == const.ROOM_END:
						p.room = None
					p.finalResult(player_info_list, info)

			# 必须执行完finalResult 再执行prepare 不然剩下的玩家收到的prepare消息再finalResult之前
			# for i, p in enumerate(copy_list):
			# 	if p and p:
			# 		if self.hand_prepare == const.AUTO_PREPARE and continue_list[i] == const.ROOM_CONTINUE and i != 0:
			# 			self.prepare(p)

			# 如果所有玩家都不能继续，则解散房间
			if max(continue_list) == const.ROOM_END:
				self._reset()
			else:
				self._continue_room_flag = True

		# if const.MODULE_ROOM_CONTINUE:
		# 	self.get_continue_list(callback, players)
		# else:
		# 	callback([const.ROOM_CONTINUE] * self.player_num)

		callback([const.ROOM_END] * self.player_num)

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

	def auto_operation(self):
		self._op_timer = None
		DEBUG_MSG("{} auto_operation: idx:{} op:{}".format(self.prefixLogStr, self.current_idx, self.cur_allow_op))
		if self.can_bet(self.current_idx, 0):
			self.doOperation(self.players_list[self.current_idx], OP_BET, [0], False)
		elif self.can_fight_dealer(self.current_idx):
			self.doOperation(self.players_list[self.current_idx], OP_FIGHT_DEALER, [0], False)
		elif self.can_pass(self.current_idx):
			self.doOperation(self.players_list[self.current_idx], OP_PASS, [0], False)
		elif self.cur_allow_op == OP_MUL:
			# fixme 此处逻辑没有做这段时错误的 ，因为现在没有倒计时
			# giveup = True
			# for i, s in enumerate(self.mul_score_list):
			# 	if i != self.dealer_idx and s > 1:
			# 		giveup = False
			#
			# if giveup:
			# 	self.mul_score_list = [1] * self.player_num
			#
			# for i, s in enumerate(self.mul_score_list):
			# 	s == 0 and self.doOperation(self.players_list[i], OP_MUL, [1], False)
			pass
		else:
			if self.last_discard_idx == self.current_idx or self.last_discard_idx == -1:
				tiles = self.get_min_tiles(self.current_idx)
				self.doOperation(self.players_list[self.current_idx], OP_DISCARD, tiles, False)
			else:
				self.doOperation(self.players_list[self.current_idx], OP_PASS, [0], False)

	def add_operation_timer(self):
		self.cancel_operation_timer()
		if self.op_seconds > 0:
			self._op_timer_timestamp = time.time()
			seconds = self.op_seconds
			# 如果操作数为0 表示时第一个操作，需要加上客户端动画时间
			if len(self.op_record) == 0:
				seconds += BEGIN_ANIMATION_TIME
			# if self.current_round == 1:
			# 	seconds += const.BEGIN_ANIMATION_TIME

			DEBUG_MSG("{} add_operation_timer: {}".format(self.prefixLogStr, seconds))
			self._op_timer = self.add_timer(seconds, self.auto_operation)

	def add_mul_operation_timer(self):
		self.cancel_mul_operation_timer()
		if OP_MUL_SECONDS > 0:
			self._op_timer_timestamp = time.time()
			DEBUG_MSG("{} add mul timer".format(self.prefixLogStr))
			self._op_timer = self.add_timer(OP_MUL_SECONDS, self.auto_operation)

	def cancel_mul_operation_timer(self):
		DEBUG_MSG("{} cancel_mul_operation_timer: {}".format(self.prefixLogStr, self._op_timer))
		if self._op_timer is not None:
			self.cancel_timer(self._op_timer)
			self._op_timer = None

	def cancel_operation_timer(self):
		if self.op_seconds <= 0:
			return
		DEBUG_MSG("{} cancel_operation_timer: {}".format(self.prefixLogStr, self._op_timer))
		if self._op_timer is not None:
			self.cancel_timer(self._op_timer)
			self._op_timer = None

	def confirm_dealer(self, idx, dealer_idx, data, aid):
		DEBUG_MSG("{} confirm_dealer: {} ===> {}".format(self.prefixLogStr, dealer_idx, data))
		self.op_record.append((aid, self.current_idx, dealer_idx, data))
		self.players_list[self.current_idx].op_r.append((aid, data))
		self.current_idx = dealer_idx
		self.dealer_idx = dealer_idx
		self.players_list[dealer_idx].tiles += self.host_cards
		self.ddzBroadcastOperation(idx, OP_CONFIRM_DEALER, data, dealer_idx)
		self.begin_record_game()
		# self.add_operation_timer()
		if self.mul_mode == MUL_MODE_ENABLE:
			self.cur_allow_op = OP_MUL
			self.add_mul_operation_timer()
		else:
			self.cur_allow_op = OP_DISCARD | OP_PASS
			self.mul_score_list = [1] * self.player_num
			self.add_operation_timer()

	def _farmer_giveup_mul(self):
		for i, s in enumerate(self.mul_score_list):
			if i != self.dealer_idx and (s > 1 or s == 0):
				return False
		return True


	def doOperation(self, avt_mb, aid, data, from_client=True):
		"""
		当前可以操作的玩家向服务端确认的操作
		:param data 不同的操作会上传不同的数据，但都是int数组格式
		"""
		idx = self._get_player_idx(avt_mb)
		DEBUG_MSG("{} idx:{} doOperation aid:{} data:{} allow:{} client:{}".format(self.prefixLogStr, idx, aid, data, self.cur_allow_op, from_client))
		if not self.can_operation(idx, aid):
			DEBUG_MSG("{} idx:{} doOperation can not operation aid:{}".format(self.prefixLogStr, idx, aid))
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < self.dismissRoomSecends:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("{} idx:{} doOperationFailed dismiss_room_ts:{}".format(self.prefixLogStr, idx, self.dismiss_room_ts))
			# avt_mb.doOperationFailed(const.OP_ERROR_VOTE)
			# return
		if self.state == const.ROOM_WAITING or self.state == const.ROOM_TRANSITION:
			DEBUG_MSG("{} idx:{} doOperationFailed state:{}".format(self.prefixLogStr, idx, self.state))
			avt_mb.doOperationFailed(const.OP_ERROR_STATE)
			return
		if self.current_idx != idx and self.cur_allow_op != OP_MUL:
			DEBUG_MSG("{} idx:{} doOperationFailed not current".format(self.prefixLogStr, idx))
			avt_mb.doOperationFailed(const.OP_ERROR_NOT_CURRENT)
			return

		broadcastOperation = self.ddzBroadcastOperation2 if from_client else self.ddzBroadcastOperation

		p = self.players_list[idx]
		data = list(data)
		if aid == OP_PASS and self.can_pass(idx):
			self.current_idx = self.nextIdx
			# self.discard_record.pop(0)
			self.discard_record.append([])
			broadcastOperation(idx, OP_PASS, data, self.current_idx)
			self.op_record.append((OP_PASS, idx, self.current_idx, data))
			p.op_r.append((OP_PASS, data))
			self.add_operation_timer()
		elif aid == OP_FIGHT_DEALER and self.can_fight_dealer(idx, data[0]):  # 抢庄
			score = data[0]
			old = self.fight_dealer_mul_list[idx]
			DEBUG_MSG("{} doOperation: fight list {} --- {}".format(self.prefixLogStr, self.fight_dealer_mul_list, score))
			if old == -1:
				self.fight_dealer_mul_list[idx] = score

				# 全都 pass
				if all(map(lambda x: x == 0, self.fight_dealer_mul_list)):
					DEBUG_MSG("{} doOperation redeal".format(self.prefixLogStr))
					self.op_record.append((OP_FIGHT_DEALER, idx, self.last_win_idx, data))
					p.op_r.append((OP_FIGHT_DEALER, data))
					self.redeal()
					return

				# 只有一人叫地主其他都pass
				if sum(self.fight_dealer_mul_list) == GET_DEALER_MUL:
					self.confirm_dealer(idx, self.fight_dealer_mul_list.index(GET_DEALER_MUL), data, aid)
					return
				# 执行抢地主
				current_idx = idx
				while True:
					current_idx = (current_idx + 1) % self.player_num
					if current_idx == self.current_idx:
						DEBUG_MSG("{} doOperation unbelievable: idx: {} ==>{}".format(self.prefixLogStr, idx, self.fight_dealer_mul_list))
						self.confirm_dealer(idx, idx, data, aid)
						return
					if self.fight_dealer_mul_list[current_idx] == -1 or self.fight_dealer_mul_list[current_idx] == GET_DEALER_MUL:
						self.current_idx = current_idx
						break
				self.op_record.append((OP_FIGHT_DEALER, idx, self.current_idx, data))
				p.op_r.append((OP_FIGHT_DEALER, data))
				broadcastOperation(idx, aid, data, self.current_idx)
				self.add_operation_timer()
			elif old == 0:
				DEBUG_MSG("{} doOperation unbelievable: idx: {} ==> OP_FIGHT_DEALER == 0", self.prefixLogStr, idx)
				avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
				return
			else:
				self.op_record.append((OP_FIGHT_DEALER, idx, data))
				p.op_r.append((OP_FIGHT_DEALER, data))
				if score == 0:
					dealer_idx = self.fight_dealer_mul_list.index(FIGHT_DEALER_MUL)
				else:
					self.fight_dealer_mul_list[idx] *= score
					dealer_idx = idx
				self.confirm_dealer(idx, dealer_idx, data, aid)
		elif aid == OP_BET and self.can_bet(idx, data[0]):  # 下注
			bet_score = data[0]
			self.bet_score_list[idx] = bet_score
			min_score = min(self.bet_score_list)
			if bet_score == CONFIRM_DEALER_SCORE:
				self.confirm_dealer(idx, idx, data, aid)
			elif all(map(lambda x: x == 0, self.bet_score_list)):
				self.redeal()
			elif min_score != -1:
				self.confirm_dealer(idx, self.bet_score_list.index(max(self.bet_score_list)), data, aid)
			else:
				self.current_idx = self.nextIdx
				broadcastOperation(idx, aid, data, self.current_idx)
				p.op_r.append((OP_BET, data))
				self.op_record.append((OP_BET, idx, self.current_idx, data))
				self.add_operation_timer()
		elif aid == OP_EXCHANGE and self.can_exchange(idx, data):  # 换牌
			pass
		elif aid == OP_MUL and self.can_mul(idx, data[0]):  # 加倍
			self.mul_score_list[idx] = data[0]
			broadcastOperation(idx, aid, data, self.dealer_idx)
			p.op_r.append((OP_MUL, data))
			if all(map(lambda x: x > 0, self.mul_score_list)) or self._farmer_giveup_mul():
				self.mul_score_list = list(map(lambda x: 1 if x == 0 else x, self.mul_score_list))
				self.cancel_mul_operation_timer()
				self.cur_allow_op = OP_DISCARD | OP_PASS
		elif aid == OP_DISCARD and self.can_discard(idx, data):
			p = self.players_list[idx]
			self.discard_record.append(data)
			self.last_discard_idx = idx
			self.current_idx = p.discardTile(data, from_client)
			if self.boom_times < self.max_boom_times and (is_pair_joker(data)[0] or is_pair4(data, converted=False)[0] or is_flower(data)[0]):
				self.boom_times += 1
			if len(p.tiles) == 0:
				self.cancel_operation_timer()
				self.winGame(idx)
			else:
				self.add_operation_timer()
		elif aid == OP_SEEN:
			pass
		else:
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)

	def ddzBroadcastOperation(self, idx, aid, tile_list, next_idx):
		"""
		将操作广播给所有人, 包括当前操作的玩家
		:param idx: 当前操作玩家的座位号
		:param aid: 操作id
		:param tile_list: 出牌的list
		"""
		for i, p in enumerate(self.players_list):
			if p is not None:
				p.ddzPostOperation(idx, aid, tile_list, next_idx)

	def confirmOperation(self, avt_mb, aid, data):
		self.selfConfirmOperation(avt_mb, aid, data, True)

	def selfConfirmOperation(self, avt_mb, aid, data, from_client):
		idx = self._get_player_idx(avt_mb)
		DEBUG_MSG("{} idx:{} confirmOperation aid:{} data:{} allow:{}".format(self.prefixLogStr, idx, aid, data, self.cur_allow_op))
		if not self.can_operation(idx, aid):
			DEBUG_MSG("{} idx:{} confirmOperation can not operation aid:{}".format(self.prefixLogStr, idx, aid))
			avt_mb.doOperationFailed(const.OP_ERROR_ILLEGAL)
			return
		""" 被轮询的玩家确认了某个操作 """
		if self.dismiss_room_ts != 0 and int(time.time() - self.dismiss_room_ts) < self.dismissRoomSecends:
			# 说明在准备解散投票中,不能进行其他操作
			DEBUG_MSG("{} idx:{} confirmOperation dismiss_room_ts:{}".format(self.prefixLogStr, idx, self.dismiss_room_ts))
			avt_mb.doOperationFailed(const.OP_ERROR_VOTE)
			return

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

	def waitForOperation(self, aid):
		notify_op_list = self.getNotifyOpList(aid)
		if sum([len(x) for x in notify_op_list]) > 0:
			DEBUG_MSG("{} waitForOperation aid:{} ==>notifyOpList:{}".format(self.prefixLogStr, aid, notify_op_list))
			for i, p in enumerate(self.players_list):
				if p is not None and len(notify_op_list[i]) > 0:
					wait_aid_list = [notifyOp["aid"] for notifyOp in notify_op_list[i]]
					data_list = [notifyOp["data"] for notifyOp in notify_op_list[i]]
					p.waitForOperation(wait_aid_list, data_list)
				if p is not None and self.op_seconds > 0 and len(notify_op_list[i]) == 0:
					# 倒计时阶段即使自己没有操作也通知自己
					p.waitForOperation([], [])

		else:
			DEBUG_MSG("{} nobody waitForOperation aid:{}".format(self.prefixLogStr, aid))

	def get_init_client_dict(self):
		return {
			'roomID': self.roomIDC,
			'ownerId': self.owner_uid,
			'roomType': self.room_type,
			'dealerIdx': self.dealer_idx,
			'curRound': self.current_round,
			'game_round': self.game_round,
			'player_num': self.player_num,
			'pay_mode': self.pay_mode,
			'game_mode': self.game_mode,
			'max_boom_times': self.max_boom_times,
			'game_max_lose': self.game_max_lose,
			'hand_prepare': self.hand_prepare,
			'op_seconds': self.op_seconds,
			'flower_mode': self.flower_mode,
			'mul_mode': self.mul_mode,
			'dealer_42': self.dealer_42,
			'is_emotion': self.is_emotion,
			'dealer_joker': self.dealer_joker,
			'mul_score': self.mul_score,
			'only3_1': self.only3_1,
			'room_state': const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'club_id': self.club_id,
			'table_idx': getattr(self, 'table_idx', -1),
			'player_base_info_list': [p.get_init_client_dict() for p in self.players_list if p is not None],
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
		}

	def get_club_complete_dict(self):
		d = {
			'gameType'		: self.gameTypeC,
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
		dismiss_left_time = self.dismissRoomSecends - (int(time.time() - self.dismiss_room_ts))
		if self.dismiss_room_ts == 0 or dismiss_left_time >= self.dismissRoomSecends:
			dismiss_left_time = 0

		idx = 0
		for p in self.players_list:
			if p and p.userId == userId:
				idx = p.idx

		wait_aid_list = []
		wait_data_list = []
		for i in range(len(self.wait_op_info_list)):
			if self.wait_op_info_list[i]["idx"] == idx and self.wait_op_info_list[i]["state"] == const.OP_STATE_WAIT:
				wait_aid_list.append(self.wait_op_info_list[i]["aid"])
				wait_data_list.append(self.wait_op_info_list[i]['data'])
		DEBUG_MSG('{} reconnect_room waitAidList:{}'.format(self.prefixLogStr, wait_aid_list))

		wait_time_left = 0
		if self.op_seconds > 0:
			if len(self.op_record) == 0:
				wait_time_left = int(self.op_seconds + BEGIN_ANIMATION_TIME - (time.time() - self._op_timer_timestamp))
			# if self.current_round == 1:
			# 	wait_time_left += const.BEGIN_ANIMATION_TIME
			else:
				wait_time_left = int(self.op_seconds - (time.time() - self._op_timer_timestamp))

		if OP_MUL_SECONDS > 0:
			wait_time_left = int(OP_MUL_SECONDS - (time.time() - self._op_timer_timestamp))

		return {
			'gameType': self.gameTypeC,
			'init_info': self.get_init_client_dict(),
			'curPlayerSitNum': self.current_idx,
			'room_state': const.ROOM_PLAYING if self.state == const.ROOM_PLAYING else const.ROOM_WAITING,
			'player_state_list': [1 if i in self.confirm_next_idx else 0 for i in range(self.player_num)],
			'waitAidList': wait_aid_list,
			'waitDataList': wait_data_list,
			'bet_score_list': self.bet_score_list,
			'mul_score_list': self.mul_score_list,
			'fight_dealer_mul_list': self.fight_dealer_mul_list,
			'waitTimeLeft': wait_time_left,
			'applyCloseFrom': self.dismiss_room_from,
			'applyCloseLeftTime': dismiss_left_time,
			'applyCloseStateList': self.dismiss_room_state_list,
			'player_advance_info_list': [p.get_reconnect_client_dict(userId) for p in self.players_list if p is not None],
			'host_cards': self.host_cards,
			'last_discard_idx': self.last_discard_idx,
			'discard_record': list(self.discard_record),
			'boom_times': self.boom_times,
			'flower_mode': self.flower_mode,
			'mul_mode': self.mul_mode,
			'delaer_joker': self.dealer_joker,
			'dealer_42': self.dealer_42,
			'is_emotion': self.is_emotion,
		}

	def record_round_result(self):
		# 玩家记录当局战绩
		d = datetime.fromtimestamp(time.time())
		round_result_d = {
			'date': '-'.join([str(d.year), str(d.month), str(d.day)]),
			'time': ':'.join([str(d.hour), str(d.minute)]),
			'round_record': [p.get_round_result_info() for p in self.origin_players_list if p],
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
			'user_info_list': [p.get_basic_user_info() for p in self.origin_players_list if p]
		}
		self.game_result['round_result'] = []

	def save_game_result(self):
		DEBUG_MSG('{} ----- save_game_result ----- len:{}'.format(self.prefixLogStr, len(self.game_result.get('round_result', []))))
		if 'round_result' in self.game_result and len(self.game_result.get('round_result', [])) > 0:
			result_str = json.dumps(self.game_result)
			for p in self.players_list:
				p and p.save_game_result(result_str)

	def save_agent_complete_result(self):
		DEBUG_MSG('{} ------ save agent complete result -----'.format(self.prefixLogStr))
		d = self.get_agent_complete_dict()
		result_str = json.dumps(d)
		if self.agent:
			if self.agent.isDestroyed:
				import x42
				for k, v in x42.GW.avatars.items():
					if v.userId == self.agent.userId:
						v.saveAgentRoomResult(result_str)
						break
				else:
					ERROR_MSG("{} Save AgentRoom result failed!!! agent.userId = {}".format(self.prefixLogStr, self.agent.userId))
			else:
				self.agent.saveAgentRoomResult(result_str)

	def save_club_result(self):
		DEBUG_MSG('{} ------ save club result -----'.format(self.prefixLogStr))
		d = self.get_club_complete_dict()
		self.base.saveClubResult(d)
		if 'round_result' in self.game_result and len(self.game_result['round_result']) > 0:
			self.base.updateClubDAU([p.get_dau_client_dict() for p in self.players_list if p is not None])

	def addAvatarGameRound(self):
		for p in self.players_list:
			if p is not None:
				p.base.addAvatarGameRound(self.gameTypeC, 1)

	def saveRoomResult(self):
		# 保存玩家的战绩记录
		self.save_game_result()
		# 保存茶楼的战绩
		if self.room_type == const.CLUB_ROOM:
			self.save_club_result()

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

	def initTiles(self):
		self.tiles = list(Card.ALL_CARD_INT)
		if self.flower_mode == 0:
			self.tiles.remove(Card.FLOWER)

		self.shuffle_tiles()

	def shuffle_tiles(self):
		random.shuffle(self.tiles)
		DEBUG_MSG("{} shuffle tiles:{}".format(self.prefixLogStr, self.tiles))

	def deal(self, prefabHandTiles):
		""" 发牌 """
		if prefabHandTiles is not None:
			for i, p in enumerate(self.players_list):
				if p is not None and len(prefabHandTiles) >= 0:
					p.tiles = prefabHandTiles[i] if len(prefabHandTiles[i]) <= INIT_TILE_NUMBER else prefabHandTiles[i][0:INIT_TILE_NUMBER]
			all_tiles = []
			for i, p in enumerate(self.players_list):
				p is not None and all_tiles.extend(p.tiles)
			for t in all_tiles:
				t in self.tiles and self.tiles.remove(t)
			for i in range(INIT_TILE_NUMBER):
				for j, p in enumerate(self.players_list):
					if len(p.tiles) >= INIT_TILE_NUMBER:
						continue
					p.tiles.append(self.tiles.pop(0))
		else:
			for i, p in enumerate(self.players_list):
				if INIT_TILE_NUMBER > 0:
					for j in range(INIT_TILE_NUMBER):
						p.tiles.append(self.tiles.pop(0))

		for i, p in enumerate(self.players_list):
			p is not None and DEBUG_MSG("{} idx:{} deal tiles:{}".format(self.prefixLogStr, i, p.tiles))

	def tidy(self):
		""" 整理 """
		for i in range(self.player_num):
			self.players_list[i] and self.players_list[i].tidy()

	def throwDice(self, idxList):
		pass

	def exchange_cards(self, cards, target):
		DEBUG_MSG("{} exchange_cards {} - {}".format(self.prefixLogStr, cards, target))
		count = len(target)
		self.tiles.extend(target)
		self.shuffle_tiles()
		for i in range(0, count):
			cards.remove(target[i])
			cards.append(self.tiles.pop(0))

	def can_operation(self, idx, aid):
		return (self.cur_allow_op & aid) == aid

	def can_exchange(self, idx, data):
		return (self.cur_allow_op & OP_EXCHANGE) == OP_EXCHANGE and all(c in self.players_list[idx].tiles for c in data)

	def can_bet(self, idx, score):
		if score not in BET_SCORE:
			return False
		if (self.cur_allow_op & OP_BET) == OP_BET and self.bet_score_list[idx] == -1:
			if score == 0 or max(self.bet_score_list) < score:
				tiles = self.players_list[idx].tiles
				if (self.dealer_joker == DEALER_MODE_JOKER and Card.BIG_JOKER in tiles and Card.LITTLE_JOKER in tiles) or \
					(self.dealer_42 == DEALER_MODE_42 and list(map(Card.get_rank_int, tiles)).count(2) == 4):
					return score == BET_SCORE[-1]
				return True
		return False

	def can_fight_dealer(self, idx, score):
		if score not in FIGHT_DEALER_SCORE:
			return False
		if (self.cur_allow_op & OP_FIGHT_DEALER) == OP_FIGHT_DEALER and (self.fight_dealer_mul_list[idx] == -1 or self.fight_dealer_mul_list[idx] / GET_DEALER_MUL == 1):
			if all(_x <= 0 for _x in self.fight_dealer_mul_list):
				if not (score == FIGHT_DEALER_SCORE[0] or score == FIGHT_DEALER_SCORE[-1]):
					return False
			else:
				if not (score == FIGHT_DEALER_SCORE[0] or score == FIGHT_DEALER_SCORE[1]):
					return False
			tiles = self.players_list[idx].tiles
			if (self.dealer_joker == DEALER_MODE_JOKER and Card.BIG_JOKER in tiles and Card.LITTLE_JOKER in tiles) or \
				(self.dealer_42 == DEALER_MODE_42 and list(map(Card.get_rank_int, tiles)).count(2) == 4):
				return score != FIGHT_DEALER_SCORE[0]
			return True
		return False

	def can_mul(self, idx, score):
		return (self.cur_allow_op & OP_MUL) == OP_MUL and (self.mul_score_list[idx] == 0)

	def can_discard(self, idx, data):
		if (self.cur_allow_op & OP_DISCARD) == OP_DISCARD and utility.issubset(self.players_list[idx].tiles, data):
			cards_int = sorted(list(map(Card.get_rank_int, data)))
			if self.last_discard_idx == idx or self.last_discard_idx == -1:
				if self.only3_1 and (is_pair3_2(cards_int)[0] or is_seq_pair3_2(cards_int)[0]):
					return False
				return any(map(lambda x: x(cards_int)[0], Rules))

			def compare(info_a, info_b):
				if info_a[1] in SEQS:
					if info_b[2] > info_a[2] and info_b[3] - info_b[2] == info_a[3] - info_a[2]:
						return info_b[2] - info_a[2]
				else:
					return Card.card_compare(info_b[2], info_a[2])

				return -1

			last_cards = None
			for cards in reversed(self.discard_record):
				if cards and len(cards) > 0:
					last_cards = cards
					break

			last_cards = sorted(list(map(Card.get_rank_int, last_cards)))

			last_info = None
			for rule in Rules:
				info = rule(last_cards)
				if info[0]:
					last_info = info
					break
			if last_info is None:
				return False
			dest_info = COMPARE_TYPE_FUNC_MAP[last_info[1]](cards_int)
			if dest_info[0]:
				return compare(last_info, dest_info) > 0

			types = get_greater_than_rules(last_info[1])
			if types is not None:
				for t in types:
					dest_info = COMPARE_TYPE_FUNC_MAP[t](cards_int)
					if dest_info[0]:
						return True

		return False

	def can_pass(self, idx):
		return (self.cur_allow_op & OP_PASS) == OP_PASS and not (self.last_discard_idx == idx or self.last_discard_idx == -1)

	def getNotifyOpList(self, aid):
		# notifyOpList 和 self.wait_op_info_list 必须同时操作
		# 数据结构：问询玩家，操作类型，状态，数据
		notify_op_list = [[] for i in range(self.player_num)]
		self.wait_op_info_list = []
		return notify_op_list

	def cal_score(self, win_idx):
		# base_score = const.BASE_SCORE_DEALER if win_idx == self.dealer_idx else const.BASE_SCORE_FARMER
		base_score = 1
		score = 0
		spring_mul = 2 if self.is_spring(win_idx) else 1
		if self.game_mode == GAME_MODE_SCORE:
			bet_score = self.bet_score_list[self.dealer_idx]
			score = base_score * bet_score * (2 ** self.boom_times) * spring_mul
		elif self.game_mode == GAME_MODE_DEALER:
			mul = 1
			for i in filter(lambda x: x > 0, self.fight_dealer_mul_list):
				mul *= i
			score = base_score * (2 ** self.boom_times) * mul * spring_mul
		else:
			DEBUG_MSG("{} cal score: unknown".format(self.prefixLogStr))

		for i, p in enumerate(self.players_list):
			dealer_mul = self.mul_score_list[self.dealer_idx]
			mul = self.mul_score_list[i]
			dealer_p = self.players_list[self.dealer_idx]
			if win_idx == self.dealer_idx:
				if i != win_idx:
					p.add_score(-score * self.mul_score * mul * dealer_mul)
					dealer_p.add_score(score * self.mul_score * mul * dealer_mul)
			else:
				if i != self.dealer_idx:
					p.add_score(score * self.mul_score * mul * dealer_mul)
					dealer_p.add_score(-score * self.mul_score * mul * dealer_mul)

		DEBUG_MSG("{} scores : win:{} ==> {}".format(self.prefixLogStr, win_idx, [p.score for p in self.players_list]))

	def get_min_tiles(self, idx):
		tiles = self.players_list[idx].tiles
		min = 0
		tmp = tuple(map(Card.get_rank_int, tiles))
		for i, t in enumerate(tmp):
			if t == 2:
				t = t + 13
			if i == 0:
				min = t
			else:
				if min > t:
					min = t
		if min - 13 == 2:
			min = 2
		return list(filter(lambda x: Card.get_rank_int(x) == min, tiles))

	def is_spring(self, win_idx):
		if win_idx == self.dealer_idx:
			for i, p in enumerate(self.players_list):
				if p.discard_times != 0 and i != win_idx:
					return False
			return True
		else:
			return self.players_list[self.dealer_idx].discard_times == 1
