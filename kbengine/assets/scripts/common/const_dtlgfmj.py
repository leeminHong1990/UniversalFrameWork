# -*- coding: utf-8 -*-
import const

DEBUG_JSON_NAME = "0013dtlgfmj"

# 初始手牌数目
INIT_TILE_NUM = 13

LEFT_TILES = 16

# 麻将房间操作id #
OP_SHOW_HINT 	= 112 ##0b1110000 亮牌
OP_ADD_HINT 	= 120 ##0b1111000 增加hint

HINT_TILES = list(const.WINDS) + list(const.DRAGONS)

HINT_DELAY = 1.5 #亮牌延时

####################################  房间开房的一些模式 ####################################
# 玩法模式
DRAW_GIVE_MODE = 0
DRAW_MODE = 1
GAME_MODE = (DRAW_GIVE_MODE, DRAW_MODE)
# 局数
GAME_ROUND = (4, 8, 12, 16)
# 放炮算分模式
GIVE_AA_MODE 	= 0		# 三家出
GIVE_TREAT_MODE = 1		# 一家出
SCORE_MODE = (GIVE_AA_MODE, GIVE_TREAT_MODE)
# 7小对（豪华7对）
SEVEN_PAIR = (0, 1)
# 底分
BASE_SCORE = (1, 2, 5)
# 杠牌是否算分
KONG_MODE = (0, 1)