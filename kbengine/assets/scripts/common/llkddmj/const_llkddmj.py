# -*- coding: utf-8 -*-

DEBUG_JSON_NAME = "0016llkddmj"

# 初始手牌数目
INIT_TILE_NUMBER 	= 13

# 剩余手牌数目
END_TILE_NUMBER 	= 0

#玩家 出牌 状态机
DISCARD_FREE 		= 0 	# 玩家自由出牌
DISCARD_FORCE 		= 1 	# 强制玩家出牌 (摸什么打什么 不吃 不碰 直到胡为止)

# 玩家听牌后摸牌，胡等操作的默认延时下发时间（单位：秒）
DELAY_OP_FORCE = 1

# 玩家杠后摸牌操作的默认延时下发时间（单位：秒）
DELAY_OP_FORCE_KONG_DRAW = 1

####################################  房间开房的一些模式 ####################################

# 规则
COMMON_GAME_MODE = 0	# 普通玩法
SPECIAL_GAME_MODE = 1	# 特殊牌型玩法
KING_GAME_MODE = 2		# 耗子玩法
GAME_MODE = (COMMON_GAME_MODE, SPECIAL_GAME_MODE, KING_GAME_MODE)
# 耗子
# NO_KING_MODE		= 0 # 普通玩法或者特殊牌型玩法，没有耗子
WIND_KING_MODE 		= 0 # 风耗子
RAND_KING_MODE 		= 1 # 随机耗子
DOUBLE_KING_MODE 	= 2 # 双耗子
KING_MODE = (WIND_KING_MODE, RAND_KING_MODE, DOUBLE_KING_MODE)
# 赏金
REWARD_MODE = (0, 1)
# 加庄
ADD_DEALER = (0, 1)
# 局数
GAME_ROUND = (4, 8, 12, 16)
# 底分倍数
BASE_SCORE_MODE = (1, 2, 5)
# 特殊牌型翻倍
SPECIAL_MUL_MODE = (0, 1)
# 通用判定
CURRENCY_MODE = (0, 1)