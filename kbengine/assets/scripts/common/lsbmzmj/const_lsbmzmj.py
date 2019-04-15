# -*- coding: utf-8 -*-

DEBUG_JSON_NAME = "0018lsbmzmj"

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

# 局数
GAME_ROUND = (4, 8, 12, 16)

# 局数
BASE_SCORE = (1, 2, 5)
