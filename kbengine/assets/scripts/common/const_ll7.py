DEBUG_JSON_NAME = "0001ll7"

# aid
AID_NONE	= 0
LORD_FIRST 	= 1<<3
LORD_SECOND = 1<<4
LORD_THIRD  = 1<<5
DRAW_COVER	= 1<<6
COVER_POKER	= 1<<7
DISCARD 	= 1<<8
SHOW_COVER	= 1<<9
SURRENDER_FIRST		= 1<<10
SURRENDER_SECOND	= 1<<11

QUIT_TIMES = 100

POKER_OFFSET = 2

#黑红梅方 3,  4,  5,  6,  7,  8,  9, 10,  J,  Q,  K,  A,  2
HEI  = [15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63]
HONG = [14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62]
MEI  = [13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61]
FANG = [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60]

JOKER = [75, 79]

HHMF_VALUE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

# 除 大小王之外的牌
POKER_HHMF = (HEI, HONG, MEI, FANG)

# 类型
POKER_MESS	= -1 # 杂
POKER_HEI	= 0  # 黑
POKER_HONG	= 1  # 红
POKER_MEI	= 2  # 梅
POKER_FANG	= 3  # 方
POKER_LORD	= 4  # 主

TYPE_NONE		= 0 # 无牌型
TYPE_ONE 		= 1 # 单张
TYPE_PAIR 		= 2 # 对子
TYPE_SEQ_PAIR 	= 3 # 连对

TYPE_OFFSET = 2

# 牌类型 (计算方法 和 utility.ll7 getPokersType 关联)
CARDS_MESS 			= -1				# 杂牌/未知(不是同一花色/主)

CARDS_MESS_HEI 		= (POKER_HEI<<TYPE_OFFSET)+TYPE_NONE			# 黑_乱牌
CARDS_ONE_HEI 		= (POKER_HEI<<TYPE_OFFSET)+TYPE_ONE				# 黑_单张
CARDS_PAIR_HEI 		= (POKER_HEI<<TYPE_OFFSET)+TYPE_PAIR			# 黑_对子
CARDS_SEQ_PAIR_HEI 	= (POKER_HEI<<TYPE_OFFSET)+TYPE_SEQ_PAIR  		# 黑_连对

CARDS_MESS_HONG 	= (POKER_HONG<<TYPE_OFFSET)+TYPE_NONE			# 红_乱牌
CARDS_ONE_HONG 		= (POKER_HONG<<TYPE_OFFSET)+TYPE_ONE			# 红_单张
CARDS_PAIR_HONG 	= (POKER_HONG<<TYPE_OFFSET)+TYPE_PAIR			# 红_对子
CARDS_SEQ_PAIR_HONG	= (POKER_HONG<<TYPE_OFFSET)+TYPE_SEQ_PAIR 		# 红_连对

CARDS_MESS_MEI 		= (POKER_MEI<<TYPE_OFFSET)+TYPE_NONE			# 梅_乱牌
CARDS_ONE_MEI 		= (POKER_MEI<<TYPE_OFFSET)+TYPE_ONE				# 梅_单张
CARDS_PAIR_MEI 		= (POKER_MEI<<TYPE_OFFSET)+TYPE_PAIR			# 梅_对子
CARDS_SEQ_PAIR_MEI	= (POKER_MEI<<TYPE_OFFSET)+TYPE_SEQ_PAIR 		# 梅_连对

CARDS_MESS_FANG 	= (POKER_FANG<<TYPE_OFFSET)+TYPE_NONE			# 方_乱牌
CARDS_ONE_FANG 		= (POKER_FANG<<TYPE_OFFSET)+TYPE_ONE			# 方_单张
CARDS_PAIR_FANG 	= (POKER_FANG<<TYPE_OFFSET)+TYPE_PAIR			# 方_对子
CARDS_SEQ_PAIR_FANG = (POKER_FANG<<TYPE_OFFSET)+TYPE_SEQ_PAIR 		# 方_连对

CARDS_MESS_LORD 	= (POKER_LORD<<TYPE_OFFSET)+TYPE_NONE			# 主_乱牌
CARDS_ONE_LORD 		= (POKER_LORD<<TYPE_OFFSET)+TYPE_ONE			# 主_单张
CARDS_PAIR_LORD 	= (POKER_LORD<<TYPE_OFFSET)+TYPE_PAIR			# 主_对子
CARDS_SEQ_PAIR_LORD = (POKER_LORD<<TYPE_OFFSET)+TYPE_SEQ_PAIR 		# 主_连对



# 7
SEVEN = (HEI[4], HONG[4], MEI[4], FANG[4])
TWO = (HEI[-1], HONG[-1], MEI[-1], FANG[-1])

# 正主
KEY_LORD = (JOKER[1], JOKER[0], HEI[4], HONG[4], MEI[4], FANG[4], HEI[-1], HONG[-1], MEI[-1], FANG[-1])

BEGIN_ANIMATION_TIME = 5

####################################  房间开房的一些模式 ####################################
# 局数
GAME_ROUND = (4, 6, 8)
# 人数
PLAYER_NUM = (4, 5)
# 封顶
MAX_LEVEL = (3, 5)
# 得分翻倍
MUL_LEVEL = (1, 2, 5)
# 单打翻倍
SIG_DOUBLE = (0, 1)
# 玩法 (扣底翻倍)
PLAY_MODE = (0, 1)
# 扣底加级
BOTTOM_LEVEL = (0, 1)
# 出牌时限
DISCARD_SECONDS = (0,)
# 是否可以发送表情
EMOTION_MODE = (0, 1)
###########################################################################################