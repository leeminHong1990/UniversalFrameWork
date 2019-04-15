# -*- coding: utf-8 -*-

DEBUG_JSON_NAME = "0011lsmj"

##########################################

# 房间玩家数
ROOM_PLAYER_NUMBER 	= 4

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
GAME_MODE = (COMMON_GAME_MODE, SPECIAL_GAME_MODE)
# 局数
GAME_ROUND = (4, 8, 12, 16)
# 清一色
SAME_SUIT_MODE = (0, 1)
# 清龙
SAME_SUIT_LOONG = (0, 1)
###########################################################################################

#清字混一色
MIX_X_SUIT 			= 0
SAME_SUIT 			= 1 		# 清一色
SAME_HONOR 			= 2 		# 字一色
MIXED_ONE_SUIT 		= 3 		# 混一色
LACK_DOOR			= 4			# 缺门

WIN_EDGE 	= 0		#边张
WIN_MID 	= 0		#砍张
WIN_SINGLE	= 0		#吊将