DEBUG_JSON_NAME = "0010ddz"

# 房间玩家数
ROOM_PLAYER_NUM = 3

# 初始手牌数目
INIT_TILE_NUMBER = 17
BEGIN_ANIMATION_TIME = 5

# 房间操作id
# @formatter:off
OP_NONE 			= 0  # 不允许执行操作
OP_PASS 			= 1 << 3  # 过
OP_FIGHT_DEALER 	= 1 << 4  # 抢庄
OP_BET 				= 1 << 5  # 叫分
OP_DISCARD 			= 1 << 6  # 打牌
OP_SEEN 			= 1 << 7  # 明牌
OP_REDEAL 			= 1 << 8  # 重新发牌
OP_EXCHANGE 		= 1 << 9  # 交换手牌
OP_CONFIRM_DEALER 	= 1 << 10  # 确认x抢到庄家
OP_MUL			 	= 1 << 11 # 加倍
# @formatter:on

#################################### 房间开房的一些模式 ####################################

# 规则
GAME_MODE_SCORE = 0  # 叫分
GAME_MODE_DEALER = 1  # 抢庄

GAME_MODE = (GAME_MODE_SCORE, GAME_MODE_DEALER)
# 局数
GAME_ROUND = (4, 8, 12, 16)
# 带入
GAME_MAX_LOSE = 99999

# 是否有花牌  0 没有 1 有
FLOWER_MODE = (0, 1)
# 是否开启加倍
MUL_MODE = (0, 1)
MUL_MODE_ENABLE = 1
MUL_MODE_DISABLE = 0

DEALER_MODE_DISABLE = 0
DEALER_MODE_ENABLE = 1
DEALER_MODE = (0, 1)
# 有大小王必须叫地主
DEALER_MODE_JOKER = DEALER_MODE_ENABLE
# 有4个2必须叫地主
DEALER_MODE_42 = DEALER_MODE_ENABLE
# 叫分
BET_SCORE = (0, 1, 2, 3)
# 底分
MUL_SCORE = (1, 2, 3, 4, 5)
# 三张只能带一
ONLY3_1 = (0, 1)
# 是否可以发送表情
EMOTION_MODE = (0, 1)
# 每个操作限时（开局准备， 抢庄， 叫分）
OP_SECONDS = (15, 0)
OP_MUL_SECONDS = 0  # 加倍

# 炸弹倍数上限
MAX_BOOM_TIMES = (3, 4, 5, 9999)

###########################################################################################

GET_DEALER_MUL = 3  # 叫地主倍数
FIGHT_DEALER_MUL = 2  # 抢地主倍数
CONFIRM_DEALER_SCORE = 3  # 叫分模式下有人达到这个分数即为庄家
# 不叫/不抢 叫地主 抢地主
FIGHT_DEALER_SCORE = (0, FIGHT_DEALER_MUL, GET_DEALER_MUL)

BASE_SCORE_DEALER = 2
BASE_SCORE_FARMER = 1

# 一些功能的打开状态
MODULE_EXCHANGE = False  # 换三张
MODULE_SEEN = True  # 明牌
MODULE_ROOM_CONTINUE = True  # 续房
