DEBUG_JSON_NAME = "0001gxmj"

# 房间玩家数
ROOM_PLAYER_NUM = 4

# 初始手牌数目
INIT_TILE_NUM = 13


#玩家 出牌 状态机
DISCARD_FREE 		= 0 	# 玩家自由出牌
DISCARD_FORCE 		= 1 	# 强制玩家出牌 (摸什么打什么 不吃 不碰 直到胡为止)

# 玩家下乡后摸牌，胡等操作的默认延时下发时间（单位：秒）
DELAY_OP_FORCE = 1


BEGIN_ANIMATION_TIME = 5

####################################  房间开房的一些模式 ####################################

# 规则
NORMAL_GAME_MODE = 0	# 普通模式
DOUBLE_GAME_MODE = 1	# 东带庄(庄家翻倍)
GAME_MODE = (NORMAL_GAME_MODE, DOUBLE_GAME_MODE)
# 局数
ROUND = (8, 16, 24)
# 封顶
MAX_LOSE = (9999, 10, 20, 30)
# 摸宝数量
TREASURE_NUM = (0, 1, 2)
# 出牌时限
DISCARD_SECONDS = (0, 10, 15, 20)

###########################################################################################

