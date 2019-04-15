# -*- coding: utf-8 -*-
DEBUG_JSON_NAME = "0014gsjmj"

# 房间玩家数
ROOM_PLAYER_NUMBER 	= 3

# 初始手牌数目
INIT_TILE_NUMBER 	= 13

# 剩余手牌数目
END_TILE_NUMBER 	= 8 * 2

# 玩家杠后摸牌操作的默认延时下发时间（单位：秒）
DELAY_OP_FORCE_KONG_DRAW = 1

ROUND_RESULT_PLAYER = 0  # 闲赢
ROUND_RESULT_DEALER = 1  # 庄赢
ROUND_RESULT_END = 2  # 流局

####################################  房间开房的一些模式 ####################################

# 规则
NOWIND_GAME_MODE = 0  # 不带风 108
WIND_GAME_MODE = 1  # 带风 136
GAME_MODE = (NOWIND_GAME_MODE, WIND_GAME_MODE)
# 局数
GAME_ROUND = (4, 8, 12, 16)
# 封顶
GAME_MAX_LOSE = (9999, 9999)
# 底分
BASE_SCORE = (0, 1)
KING_NUMS = (0, 1)  # 财神数量
# 胡法
WIN_MODE = (0, 1)  # 0 随便胡 1 必须堆胡
# 可选的牌型
SUIT_7PAI = 1 << 1  # 7对
SUIT_13MISMATCH = 1 << 2  # 13不靠
SUIT_13ORPHAN = 1 << 3  # 13幺
SUIT_MODE = 0
# 点炮防作弊
JOB_MODE = (0, 1)  # 0 普通算分 1 点炮人承包其他家分数

ADD_DEALER = (0, 1)  # 连庄选项 0 不算连庄的分数 1 算连庄的分数

#  最大连庄分数
MAX_ADD_DEALER = 4
