# -*- coding: utf-8 -*-
import const
import const_ddz
import const_gxmj
import const_tykddmj
import const_tylsmj
import const_tdhmj
from gsjmj import const_gsjmj
from jzmj import const_jzmj
from llkddmj import const_llkddmj
from lsbmzmj import const_lsbmzmj
from lsblmj import const_lsblmj
import const_dtlgfmj
import const_ll7
import const_fyqymmj
from KBEDebug import *

# ---------------------------- 开房参数检查 ----------------------------
"""
def XXX_CreateChecker(create_dict):
	return True of False
"""

def DummyChecker(*args):
	print("You need to implement a checker !!!")
	return False


def GXMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_mode = create_dict.get('game_mode', None)
	game_round = create_dict.get('game_round', None)
	max_lose = create_dict.get('max_lose', None)
	lucky_num = create_dict.get('lucky_num', None)
	discard_seconds = create_dict.get('discard_seconds', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	# Attention: 客户端传过来的数据都不可信, 必须检查一下
	if game_mode not in const_gxmj.GAME_MODE \
			or game_round not in const_gxmj.ROUND \
			or max_lose not in const_gxmj.MAX_LOSE \
			or lucky_num not in const_gxmj.TREASURE_NUM \
			or discard_seconds not in const_gxmj.DISCARD_SECONDS \
			or pay_mode not in const.PAY_MODE \
			or hand_prepare not in const.PREPARE_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True


def GSJMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_mode = create_dict.get('game_mode', None)
	base_score = create_dict.get('base_score', None)
	game_max_lose = create_dict.get('game_max_lose', None)
	game_round = create_dict.get('game_round', None)
	win_mode = create_dict.get('win_mode', None)
	suit_mode = create_dict.get('suit_mode', None)
	king_num = create_dict.get('king_num', None)
	job_mode = create_dict.get('job_mode', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	add_dealer = create_dict.get('add_dealer', None)
	if game_mode not in const_gsjmj.GAME_MODE \
			or base_score not in const_gsjmj.BASE_SCORE \
			or add_dealer not in const_gsjmj.ADD_DEALER \
			or game_max_lose not in const_gsjmj.GAME_MAX_LOSE \
			or game_round not in const_gsjmj.GAME_ROUND \
			or king_num not in const_gsjmj.KING_NUMS \
			or win_mode not in const_gsjmj.WIN_MODE \
			or job_mode not in const_gsjmj.JOB_MODE \
			or not (suit_mode & (const_gsjmj.SUIT_7PAI | const_gsjmj.SUIT_13ORPHAN | const_gsjmj.SUIT_13MISMATCH)) == suit_mode \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE:
		return

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True


def DDZ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_round = create_dict.get('game_round', None)
	game_mode = create_dict.get('game_mode', None)
	player_num = create_dict.get('player_num', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	op_seconds = create_dict.get('op_seconds', None)
	pay_mode = create_dict.get('pay_mode', None)
	max_boom_times = create_dict.get('max_boom_times', None)
	flower_mode = create_dict.get('flower_mode', None)
	mul_mode = create_dict.get('mul_mode', None)
	dealer_joker = create_dict.get('dealer_joker', None)
	dealer_42 = create_dict.get('dealer_42', None)
	mul_score = create_dict.get('mul_score', None)
	only3_1 = create_dict.get('only3_1', None)
	is_emotion = create_dict['is_emotion']
	if game_round not in const_ddz.GAME_ROUND \
			or game_mode not in const_ddz.GAME_MODE \
			or max_boom_times not in const_ddz.MAX_BOOM_TIMES \
			or op_seconds not in const_ddz.OP_SECONDS \
			or player_num != 3 \
			or flower_mode not in const_ddz.FLOWER_MODE \
			or mul_mode not in const_ddz.MUL_MODE \
			or dealer_joker not in const_ddz.DEALER_MODE \
			or dealer_42 not in const_ddz.DEALER_MODE \
			or mul_score not in const_ddz.MUL_SCORE \
			or only3_1 not in const_ddz.ONLY3_1 \
			or is_emotion not in const_ddz.EMOTION_MODE \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def TYKDDMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	add_dealer = create_dict.get('add_dealer', None)
	game_mode = create_dict.get('game_mode', None)
	game_round = create_dict.get('game_round', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	king_mode = create_dict.get('king_mode', None)
	pay_mode = create_dict.get('pay_mode', None)
	reward = create_dict.get('reward', None)
	ekong_is_dwin = create_dict.get('ekong_is_dwin', None)
	special_mul = create_dict.get('special_mul', None)
	seven_pair = create_dict.get('seven_pair', None)
	mouse_general = create_dict.get('mouse_general', None)
	mouse_general_onetwo = create_dict.get('mouse_general_onetwo', None)
	ting_mouse = create_dict.get('ting_mouse', None)
	bao_kong = create_dict.get('bao_kong', None)
	repeat_kong	= create_dict.get('repeat_kong', None)
	player_num	= create_dict.get('player_num', None)

	if add_dealer not in const_tykddmj.ADD_DEALER \
			or game_mode not in const_tykddmj.GAME_MODE \
			or game_round not in const_tykddmj.GAME_ROUND \
			or hand_prepare not in const.PREPARE_MODE \
			or king_mode not in const_tykddmj.KING_MODE \
			or pay_mode not in const.PAY_MODE \
			or special_mul not in const_tykddmj.SPECIAL_MUL_MODE \
			or ekong_is_dwin not in const_tykddmj.CURRENCY_MODE \
			or seven_pair not in const_tykddmj.CURRENCY_MODE \
			or mouse_general not in const_tykddmj.CURRENCY_MODE \
			or mouse_general_onetwo not in const_tykddmj.CURRENCY_MODE \
			or ting_mouse not in const_tykddmj.CURRENCY_MODE \
			or bao_kong not in const_tykddmj.CURRENCY_MODE \
			or repeat_kong not in const_tykddmj.CURRENCY_MODE \
			or reward not in const_tykddmj.REWARD_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True


def TYLSMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_round = create_dict.get('game_round', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	same_suit_mode = create_dict.get('same_suit_mode', None)
	same_suit_loong = create_dict.get('same_suit_loong', None)
	if game_round not in const_tylsmj.GAME_ROUND \
			or same_suit_mode not in const_tylsmj.SAME_SUIT_MODE \
			or same_suit_loong not in const_tylsmj.SAME_SUIT_LOONG \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def TDHMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_round = create_dict.get('game_round', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	game_mode = create_dict.get('game_mode', None)
	add_winds 		= create_dict.get('add_winds', None)		# 带风
	add_dealer 		= create_dict.get('add_dealer', None)		# 带庄
	kong_follow_win = create_dict.get('kong_follow_win', None)	# 杠随胡
	need_ting 		= create_dict.get('need_ting', None)		# 报听
	bao_hu 			= create_dict.get('bao_hu', None)			# 包胡
	multiplayer_win = create_dict.get('multiplayer_win', None)	# 一炮多响
	king_mode 		= create_dict.get('king_mode', None)		# 耗子
	lack_door 		= create_dict.get('lack_door', None)		# 缺一门
	if game_round not in const_tdhmj.GAME_ROUND \
			or add_winds not in const_tdhmj.ADD_WINDS \
			or add_dealer not in const_tdhmj.ADD_DEALER \
			or kong_follow_win not in const_tdhmj.KONG_FOLLOW_WIN \
			or need_ting not in const_tdhmj.NEED_TING \
			or bao_hu not in const_tdhmj.BAO_HU \
			or multiplayer_win not in const_tdhmj.MULTIPLAYER_WIN \
			or king_mode not in const_tdhmj.KING_MODE \
			or lack_door not in const_tdhmj.LACK_DOOR_MODE \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def JZMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_round = create_dict.get('game_round', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	base_score 		= create_dict.get('base_score', None)			# 底分
	stand_four 		= create_dict.get('stand_four', None)			# 立四玩法
	if game_round not in const_jzmj.GAME_ROUND \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE \
			or base_score not in const_jzmj.BASE_SCORE \
			or stand_four not in const_jzmj.STAND_FOUR:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def JZGSJMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_round = create_dict.get('game_round', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	base_score 		= create_dict.get('base_score', None)			# 底分
	if game_round not in const_jzmj.GAME_ROUND \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE \
			or base_score not in const_jzmj.BASE_SCORE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def DTLGFMJ_CreateChecker(create_dict):
	room_type 		= create_dict.get('room_type', None)
	pay_mode 		= create_dict.get('pay_mode', None)
	hand_prepare 	= create_dict.get('hand_prepare', None)

	game_mode 		= create_dict.get('game_mode', None)
	game_round 		= create_dict.get('game_round', None)
	score_mode 		= create_dict.get('score_mode', None)
	seven_pair 		= create_dict.get('seven_pair', None)
	base_score 		= create_dict.get('base_score', None)
	kong_mode 		= create_dict.get('kong_mode', None)

	if room_type not in const.OPEN_ROOM_MODE \
			or pay_mode not in const.PAY_MODE \
			or hand_prepare not in const.PREPARE_MODE \
			or game_mode not in const_dtlgfmj.GAME_MODE \
			or game_round not in const_dtlgfmj.GAME_ROUND \
			or score_mode not in const_dtlgfmj.SCORE_MODE \
			or seven_pair not in const_dtlgfmj.SEVEN_PAIR \
			or base_score not in const_dtlgfmj.BASE_SCORE \
			or kong_mode not in const_dtlgfmj.KONG_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def LLKDDMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	add_dealer = create_dict.get('add_dealer', None)
	game_mode = create_dict.get('game_mode', None)
	game_round = create_dict.get('game_round', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	king_mode = create_dict.get('king_mode', None)
	pay_mode = create_dict.get('pay_mode', None)
	reward = create_dict.get('reward', None)
	base_score = create_dict.get('base_score', None)
	ekong_is_dwin = create_dict.get('ekong_is_dwin', None)
	special_mul = create_dict.get('special_mul', None)
	seven_pair = create_dict.get('seven_pair', None)
	mouse_general = create_dict.get('mouse_general', None)
	mouse_general_onetwo = create_dict.get('mouse_general_onetwo', None)
	ting_mouse = create_dict.get('ting_mouse', None)
	bao_kong = create_dict.get('bao_kong', None)
	repeat_kong	= create_dict.get('repeat_kong', None)
	player_num	= create_dict.get('player_num', None)

	if add_dealer not in const_llkddmj.ADD_DEALER \
			or game_mode not in const_llkddmj.GAME_MODE \
			or game_round not in const_llkddmj.GAME_ROUND \
			or hand_prepare not in const.PREPARE_MODE \
			or king_mode not in const_llkddmj.KING_MODE \
			or pay_mode not in const.PAY_MODE \
			or base_score not in const_llkddmj.BASE_SCORE_MODE \
			or special_mul not in const_llkddmj.SPECIAL_MUL_MODE \
			or ekong_is_dwin not in const_llkddmj.CURRENCY_MODE \
			or seven_pair not in const_llkddmj.CURRENCY_MODE \
			or mouse_general not in const_llkddmj.CURRENCY_MODE \
			or mouse_general_onetwo not in const_llkddmj.CURRENCY_MODE \
			or ting_mouse not in const_llkddmj.CURRENCY_MODE \
			or bao_kong not in const_llkddmj.CURRENCY_MODE \
			or repeat_kong not in const_llkddmj.CURRENCY_MODE \
			or reward not in const_llkddmj.REWARD_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def LL7_CreateChecker(create_dict):

	room_type = create_dict.get('room_type', None)
	player_num = create_dict.get('player_num', None)
	op_seconds = create_dict.get('op_seconds', None)
	game_round = create_dict.get('game_round', None)
	max_level = create_dict.get('max_level', None)
	mul_level =  create_dict.get('mul_level', None)
	bottom_level = create_dict.get('bottom_level', None)
	sig_double =  create_dict.get('sig_double', None)
	play_mode = create_dict.get('play_mode', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	is_emotion = create_dict['is_emotion']
	if game_round not in const_ll7.GAME_ROUND \
			or player_num not in const_ll7.PLAYER_NUM \
			or op_seconds not in const_ll7.DISCARD_SECONDS \
			or max_level not in const_ll7.MAX_LEVEL \
			or mul_level not in const_ll7.MUL_LEVEL \
			or bottom_level not in const_ll7.BOTTOM_LEVEL \
			or sig_double not in const_ll7.SIG_DOUBLE \
			or play_mode not in const_ll7.PLAY_MODE \
			or is_emotion not in const_ll7.EMOTION_MODE \
			or hand_prepare not in const.PREPARE_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def LSBMZMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_round = create_dict.get('game_round', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	base_score = create_dict.get('base_score', None)

	if base_score not in const_lsbmzmj.BASE_SCORE \
			or game_round not in const_lsbmzmj.GAME_ROUND \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def LSBLMJ_CreateChecker(create_dict):
	room_type = create_dict.get('room_type', None)
	game_round = create_dict.get('game_round', None)
	hand_prepare = create_dict.get('hand_prepare', None)
	pay_mode = create_dict.get('pay_mode', None)
	base_score = create_dict.get('base_score', None)
	stand_four = 0

	if base_score not in const_lsblmj.BASE_SCORE \
			or game_round not in const_lsblmj.GAME_ROUND \
			or stand_four not in const_lsblmj.STAND_FOUR \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def FYQYMMJ_CreateChecker(create_dict):
	room_type 		= create_dict.get('room_type', None)
	player_num 		= create_dict.get('player_num', None)		# 人数
	game_round 		= create_dict.get('game_round', None)
	hand_prepare 	= create_dict.get('hand_prepare', None)
	pay_mode 		= create_dict.get('pay_mode', None)
	game_mode 		= create_dict.get('game_mode', None)
	add_dealer 		= create_dict.get('add_dealer', None)		# 加庄
	need_ting 		= create_dict.get('need_ting', None)		# 报听
	guo_hu 			= create_dict.get('guo_hu', None)			# 过胡
	san_hua			= create_dict.get('san_hua', None)			# 三花
	shisan_yao 		= create_dict.get('shisan_yao', None)		# 十三幺
	base_score 		= create_dict.get('base_score', None)
	if game_round not in const_fyqymmj.GAME_ROUND \
			or player_num not in const_fyqymmj.PLAYER_NUM \
			or add_dealer not in const_fyqymmj.ADD_DEALER \
			or need_ting not in const_fyqymmj.NEED_TING \
			or guo_hu not in const_fyqymmj.GUO_HU \
			or san_hua not in const_fyqymmj.SAN_HUA \
			or shisan_yao not in const_fyqymmj.SHISAN_YAO \
			or base_score not in const_fyqymmj.BASE_SCORE \
			or hand_prepare not in const.PREPARE_MODE \
			or pay_mode not in const.PAY_MODE:
		return False

	if room_type == const.NORMAL_ROOM and pay_mode not in (const.NORMAL_PAY_MODE, const.AA_PAY_MODE):
		return False
	elif room_type == const.CLUB_ROOM and pay_mode not in (const.CLUB_PAY_MODE, const.AA_PAY_MODE):
		return False
	return True

def roomParamsChecker(game_type, create_dict):
	name = const.GameType2GameName.get(game_type, None)
	if name is None:
		return False
	else:
		return globals().get("{}_CreateChecker".format(name), DummyChecker)(create_dict)

# ------------------------------------------------------------------------


# ----------------------------- 开房参数获取 ------------------------------
"""
def XXX_roomParams(create_dict):
	return a dict
"""


def GXMJ_roomParams(create_dict):
	return {
		'king_num' 			: 0,
		'player_num'		: 4,
		'game_round'		: create_dict['game_round'],
		'pay_mode' 			: create_dict['pay_mode'],
		'game_mode' 		: create_dict['game_mode'],
		'max_lose' 			: create_dict['max_lose'],
		'lucky_num' 		: create_dict['lucky_num'],
		'discard_seconds'	: create_dict['discard_seconds'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'room_type'		: create_dict['room_type'],
	}


def DDZ_roomParams(create_dict):
	return {
		'game_round'	: create_dict['game_round'],
		'game_mode'		: create_dict['game_mode'],
		'player_num'	: 3,
		'hand_prepare'	: create_dict['hand_prepare'],
		'pay_mode'		: create_dict['pay_mode'],
		'max_boom_times': create_dict['max_boom_times'],
		'op_seconds'	: create_dict['op_seconds'],
		'game_max_lose' : 999999,
		'room_type'		: create_dict['room_type'],
		'flower_mode'	: 0,
		'mul_mode'		: create_dict['mul_mode'],
		'dealer_joker'	: create_dict['dealer_joker'],
		'dealer_42'		: create_dict['dealer_42'],
		'mul_score'		: create_dict['mul_score'],
		'only3_1'		: create_dict['only3_1'],
		'is_emotion'	: create_dict['is_emotion'],
	}

def TYKDDMJ_roomParams(create_dict):
	return {
		'king_num' 			: 0 if create_dict['game_mode'] <= 1 else 1,
		'player_num'		: create_dict['player_num'],
		'lucky_num'			: 0,
		'game_mode'			: create_dict['game_mode'],
		'king_mode'			: create_dict['king_mode'],
		'reward'			: create_dict['reward'],
		'add_dealer'		: create_dict['add_dealer'],
		'ekong_is_dwin'		: create_dict['ekong_is_dwin'],
		'special_mul'		: create_dict['special_mul'],
		'seven_pair'		: create_dict['seven_pair'],
		'mouse_general'		: create_dict['mouse_general'],
		'mouse_general_onetwo'		: create_dict['mouse_general_onetwo'],
		'ting_mouse'		: create_dict['ting_mouse'],
		'bao_kong'			: create_dict['bao_kong'],
		'repeat_kong'		: create_dict['repeat_kong'],
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
	}

def TYLSMJ_roomParams(create_dict):
	return {
		'king_num' 			: 0,
		'player_num'		: 4,
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'same_suit_mode'	: create_dict['same_suit_mode'],
		'same_suit_loong'	: create_dict['same_suit_loong'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
	}

def TDHMJ_roomParams(create_dict):
	return {
		'king_num'			: create_dict['king_mode'],
		'player_num'		: 4,
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
		'game_mode'			: create_dict['game_mode'],
		'add_winds' 		: create_dict['add_winds'],			# 带风
		'add_dealer' 		: create_dict['add_dealer'],		# 带庄
		'kong_follow_win'	: create_dict['kong_follow_win'],	# 杠随胡
		'need_ting' 		: create_dict['need_ting'],			# 报听
		'bao_hu' 			: create_dict['bao_hu'],			# 包胡
		'multiplayer_win'	: create_dict['multiplayer_win'],	# 一炮多响
		'king_mode' 		: create_dict['king_mode'],			# 耗子
		'lack_door' 		: create_dict['lack_door']			# 缺一门
	}

def JZMJ_roomParams(create_dict):
	return {
		'king_num'			: 0,
		'player_num'		: 4,
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
		'base_score' 		: create_dict['base_score'],		# 底分
		'stand_four' 		: create_dict['stand_four'],		# 立四玩法
	}

def JZGSJMJ_roomParams(create_dict):
	return {
		'king_num'			: 0,
		'player_num'		: 3,
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
		'base_score' 		: create_dict['base_score'],		# 底分
		'stand_four' 		: 1,								# 立四玩法
	}


def GSJMJ_roomParams(create_dict):
	return {
		'king_num'		: create_dict['king_num'],
		'lucky_num'		: 0,
		'player_num'	: 3,
		'game_mode'		: create_dict['game_mode'],
		'base_score'	: create_dict['base_score'],
		'win_mode'		: create_dict['win_mode'],
		'suit_mode'		: create_dict['suit_mode'],
		'job_mode'		: create_dict['job_mode'],
		'game_max_lose'	: create_dict['game_max_lose'],
		'game_round'	: create_dict['game_round'],
		'hand_prepare'	: create_dict['hand_prepare'],
		'pay_mode'		: create_dict['pay_mode'],
		'room_type'		: create_dict['room_type'],
		'add_dealer'	: create_dict['add_dealer'],
		'max_add_dealer': const_gsjmj.MAX_ADD_DEALER,
	}

def DTLGFMJ_roomParams(create_dict):
	return {
		'king_num'			: 1,
		'lucky_num'			: 0,
		'player_num'		: 4,
		'max_serial_dealer'	: 4,							# 5连庄自动下庄
		'game_mode'			: create_dict['game_mode'],		# 自摸/自摸+点炮
		'game_round'		: create_dict['game_round'],	# 局数
		'score_mode'		: create_dict['score_mode'],	# 点炮三人出/点炮一家出
		'seven_pair'		: create_dict['seven_pair'],	# 7小对(豪华7对)
		'base_score'		: create_dict['base_score'],	# 底分
		'kong_mode'			: create_dict['kong_mode'],		# 杠牌是否算分
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
	}

def LLKDDMJ_roomParams(create_dict):
	return {
		'king_num' 			: 0 if create_dict['game_mode'] <= 1 else (1 if create_dict['king_mode'] <= 2 else 2),
		'player_num'		: create_dict['player_num'],
		'lucky_num'			: 0,
		'game_mode'			: create_dict['game_mode'],
		'king_mode'			: create_dict['king_mode'],
		'reward'			: create_dict['reward'],
		'base_score'		: create_dict['base_score'],
		'add_dealer'		: create_dict['add_dealer'],
		'ekong_is_dwin'		: create_dict['ekong_is_dwin'],
		'special_mul'		: create_dict['special_mul'],
		'seven_pair'		: create_dict['seven_pair'],
		'mouse_general'		: create_dict['mouse_general'],
		'mouse_general_onetwo'		: create_dict['mouse_general_onetwo'],
		'ting_mouse'		: create_dict['ting_mouse'],
		'bao_kong'			: create_dict['bao_kong'],
		'repeat_kong'		: create_dict['repeat_kong'],
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
	}

def LL7_roomParams(create_dict):
	return {
		'player_num'		: create_dict['player_num'],
		'op_seconds'		: 0,
		'game_round'		: create_dict['game_round'],
		'max_level'			: create_dict['max_level'],
		'mul_level'			: create_dict['mul_level'],
		'bottom_level'		: create_dict['bottom_level'],
		'sig_double'		: create_dict['sig_double'],
		'play_mode'			: create_dict['play_mode'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
		'is_emotion'		: create_dict['is_emotion'],
	}
def LSBMZMJ_roomParams(create_dict):
	return {
		'king_num'			: 0,
		'player_num'		: 4,
		'lucky_num'			: 0,
		'base_score'		: create_dict['base_score'],
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
	}

def LSBLMJ_roomParams(create_dict):
	return {
		'king_num'			: 0,
		'player_num'		: 4,
		'lucky_num'			: 0,
		'base_score'		: create_dict['base_score'],
		'stand_four'		: 0,
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
	}

def FYQYMMJ_roomParams(create_dict):
	return {
		'king_num' 			: 0 if create_dict['game_mode'] <= 1 else 1,
		'player_num'		: create_dict['player_num'],
		'game_round'		: create_dict['game_round'],
		'hand_prepare'		: create_dict['hand_prepare'],
		'pay_mode'			: create_dict['pay_mode'],
		'room_type'			: create_dict['room_type'],
		'game_mode'			: create_dict['game_mode'],
		'add_dealer' 		: create_dict['add_dealer'],		# 带庄
		'need_ting' 		: create_dict['need_ting'],			# 报听
		'bao_hu' 			: 0 if create_dict['need_ting'] == 0 else 1,			# 包胡
		'guo_hu' 			: create_dict['guo_hu'],
		'san_hua'			: create_dict['san_hua'],			# 一炮多响
		'shisan_yao' 		: create_dict['shisan_yao'] if create_dict['game_mode'] == 1 else 0,		# 耗子
		'king_mode' 		: 1 ,								# 为了以后做准备#现在限定发财为财神。
		'base_score' 		: create_dict['base_score']			# 缺一门
	}


def roomParamsGetter(game_type, create_dict):
	name = const.GameType2GameName.get(game_type, None)
	if name is None:
		return None
	else:
		return globals()["{}_roomParams".format(name)](create_dict)

# ------------------------------------------------------------------------


def clubDefault_roomParams():
	llkdd_dict = {
		'king_num' 			: 0,
		'player_num'		: 4,
		'lucky_num'			: 0,
		'game_mode'			: 1,
		'king_mode'			: 0,
		'reward'			: 0,
		'add_dealer'		: 0,
		'ekong_is_dwin'		: 1,
		'special_mul'		: 0,
		'seven_pair'		: 1,
		'mouse_general'		: 1,
		'mouse_general_onetwo'	: 0,
		'ting_mouse'		: 0,
		"bao_kong"			: 0,
		"repeat_kong"		: 0,
		'game_round'		: 8,
		'base_score'		: 1,
		'hand_prepare'		: 1,
		'room_type'		: const.CLUB_ROOM,
		'pay_mode'		: const.CLUB_PAY_MODE,
	}
	return const.LvLiangKDDMJ, llkdd_dict


def updateRoomParamsGetter(game_type, roomParams):
	name = const.GameType2GameName.get(game_type, None)
	if name is None:
		return game_type , roomParams
	else:
		funcName = "{}_updateRoomParams".format(name)
		if  funcName in globals():
			func = globals()[funcName]
			if callable(func):
				return func(game_type , roomParams)

	return game_type , roomParams


def LLKDDMJ_updateRoomParams(game_type, params):
	if "repeat_kong" in params and "bao_kong" in params:
		return game_type, params
	else:
		params.update({
			"repeat_kong"	: 0,
			"bao_kong"		: 0,
		})
		return game_type, params

def TYKDDMJ_updateRoomParams(game_type, params):
	if "repeat_kong" in params and "bao_kong" in params:
		return game_type, params
	else:
		params.update({
			"repeat_kong"	: 0,
			"bao_kong"		: 0,
		})
		return game_type, params

def LL7_updateRoomParams(game_type, params):
	if "is_emotion" not in params:
		params.update({
			"is_emotion": 0,
		})
	if "bottom_level" in params:
		return game_type, params
	else:
		params.update({
			"bottom_level"	: 0,
		})
		return game_type, params

def DDZ_updateRoomParams(game_type, params):
	if "flower_mode" in params and params['flower_mode'] == 1:
		params.update({
			"flower_mode": 0,
		})
	if "mul_score" not in params:
		params.update({
			"mul_score": 1,
		})
	if "only3_1" not in params:
		params.update({
			"only3_1": 0,
		})
	if "is_emotion" not in params:
		params.update({
			"is_emotion": 0,
		})
	if "mul_mode" in params and "dealer_joker" in params and "dealer_42" in params:
		return game_type, params
	else:
		params.update({
			"mul_mode"	: const_ddz.MUL_MODE_DISABLE,
			"dealer_joker"	: const_ddz.DEALER_MODE_DISABLE,
			"dealer_42"	: const_ddz.DEALER_MODE_DISABLE,
		})
		return game_type, params
