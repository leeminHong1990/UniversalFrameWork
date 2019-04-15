# -*- coding: utf-8 -*-

GAME_NAME = "SXQP"

TABLE_GAME_RECORD_NAME = "cus_record"

SERVER_REFRESH_TIME = [5, 0, 0]


# -------------------------------- 游戏类型 --------------------------------
GuiXiMJ 		= 1001
HangZhouMJ 		= 1002
YiWuMJ			= 1003
TaiYuanKDDMJ	= 1004
TaiYuanLSMJ		= 1005
DongYangMJ		= 1006
GuaiSanJiaoMJ	= 1011
TuiDaoHuMJ		= 1012
JinZhongMJ		= 1013
JinZhongGSJMJ	= 1014
DaTongLGFMJ		= 1015
LvLiangKDDMJ	= 1016
LvLiang7		= 1017
LingShiBMZMJ	= 1018
LingShiBLMJ		= 1019
FenYangQYMMJ	= 1023

DouPai			= 1007
FourDeckCard	= 1008
DouDiZhu		= 1009
ShiSanZhang		= 1010

GameType2GameName = {
	GuiXiMJ 	: 'GXMJ',
	HangZhouMJ	: 'HZMJ',
	YiWuMJ		: 'YWMJ',
	TaiYuanKDDMJ: 'TYKDDMJ',
	TaiYuanLSMJ : 'TYLSMJ',
	DongYangMJ	: 'DYMJ',
	GuaiSanJiaoMJ: 'GSJMJ',
	TuiDaoHuMJ	: 'TDHMJ',
	JinZhongMJ	: 'JZMJ',
	JinZhongGSJMJ: 'JZGSJMJ',
	DaTongLGFMJ	: 'DTLGFMJ',
	LvLiangKDDMJ: 'LLKDDMJ',
	LvLiang7	: 'LL7',
	LingShiBMZMJ: 'LSBMZMJ',
	LingShiBLMJ	: 'LSBLMJ',
	FenYangQYMMJ: 'FYQYMMJ',

	DouPai		: 'DP',
	FourDeckCard: 'FDC',
	DouDiZhu	: 'DDZ',
	ShiSanZhang	: 'SSZ',
}

GameTypeTotal = [TaiYuanKDDMJ, TaiYuanLSMJ, GuaiSanJiaoMJ, TuiDaoHuMJ, DouDiZhu, JinZhongMJ, JinZhongGSJMJ, DaTongLGFMJ, LvLiangKDDMJ, LingShiBMZMJ, LvLiang7, LingShiBLMJ, FenYangQYMMJ]
# -------------------------------- 游戏类型 --------------------------------



PLAYER_DISCARD_WAIT_TIME 	= 12 	# 玩家摸一张牌后, 打牌的等待时间45
ROOM_EXIST_TIME 			= 3600  # 每一局房间的时间，时间结束房间不销毁
DISMISS_ROOM_WAIT_TIME 		= 300	# 申请解散房间后等待的时间, 单位为秒


LOGIN_OPERATION = 3
GM_OPERATION = 4
CLIENT_OPERATION = 19

ONE_DAY_TIME = 24 * 60 * 60

# 关服时GameWorld的状态
DESTROY_PROCESS_BEGIN = 1	# 开始关服处理
DESTROY_PROCESS_END = 2		# 关服处理完成
DESTROY_PROCESS_TIME = 30	# GameWorld关服处理超时时间, 超过此时间, 强制关服

##########################################

# 麻将房间操作id #
OP_PASS             = 8 		#0b0001000 过
OP_DRAW             = 16 		#0b0010000 摸
OP_DISCARD          = 24 		#0b0011000 打
OP_CHOW             = 32 		#0b0100000 吃
OP_PONG             = 40 		#0b0101000 碰
OP_KONG_WREATH      = 48 		#0b0110000 杠花
OP_EXPOSED_KONG     = 56 		#0b0111000 明杠
OP_CONTINUE_KONG    = 57 		#0b0111001 碰后接杠
OP_CONCEALED_KONG   = 58 		#0b0111010 暗杠
# OP_POST_KONG        = 64 		#0b1000000 放杠
# OP_GET_KONG         = 72		#0b1001000 接杠
OP_CUT              = 80		#0b1010000 杠后切牌
OP_READY            = 88 		#0b1011000 听牌
OP_DRAW_END         = 96		#0b1100000 流局
OP_DRAW_WIN         = 104		#0b1101000 自摸胡
OP_KONG_WIN         = 105		#0b1101001 抢杠胡
OP_WREATH_WIN       = 106		#0b1101010 杠花胡
OP_GIVE_WIN		  	= 107		#0b1101011 放炮胡

# OP_SPECIAL_DISCARD_FORCE = 1 << 0

SHOW_CHOW 	= 4
SHOW_PONG 	= 5
SHOW_KONG 	= 7
SHOW_WIN 	= 13
SHOW_PASS 	= 1
SHOW_OP_LIST = [SHOW_CHOW, SHOW_PONG, SHOW_KONG, SHOW_WIN, SHOW_PASS] # 吃 碰 杠 胡 过

OP2STR = {
	OP_PASS             : 'pass', 				# 过
	OP_DRAW             : 'draw', 				# 摸
	OP_DISCARD          : 'discard', 			# 打
	OP_CHOW             : 'chow', 				# 吃
	OP_PONG             : 'pong', 				# 碰
	OP_KONG_WREATH     	: 'kong_wreath', 		# 杠花
	OP_EXPOSED_KONG     : 'exposed_kong', 		# 明杠(直杠)
	OP_CONTINUE_KONG    : 'continue_kong',		# 碰后接杠
	OP_CONCEALED_KONG   : 'concealed_kong', 	# 暗杠
	# OP_POST_KONG        : 'post_kong', 		# 放杠
	# OP_GET_KONG         : 'get_kong',			# 接杠
	OP_CUT  	        : 'cut',				# 杠后切牌
	OP_READY            : 'ready', 				# 听牌
	OP_DRAW_END         : 'draw_end',			# 流局
	OP_DRAW_WIN         : 'draw_win',			# 自摸胡
	OP_KONG_WIN         : 'kong_win',			# 抢杠胡
	OP_WREATH_WIN  		: 'wreath_win',			# 杠花胡
	OP_GIVE_WIN  		: 'give_win',			# 放炮胡
}

#服务端 投票 状态机
OP_STATE_PASS 		= 0		#放弃操作
OP_STATE_WAIT 		= 1		#等待确认
OP_STATE_SURE 		= 2		#确认操作


#牌局状态
ROOM_WAITING 		= 0 	# 游戏未开始
ROOM_PLAYING 		= 1		# 游戏中
ROOM_TRANSITION 	= 2  	# 游戏过渡状态 从等待切换到开始的中间值

#清字混一色
MIX_X_SUIT 			= 0
SAME_SUIT 			= 1 		# 清一色
SAME_HONOR 			= 2 		# 字一色
MIXED_ONE_SUIT 		= 3 		# 混一色
LACK_DOOR			= 4			# 缺一门

NOT_GIVE_UP = 0
GIVE_UP = 1
WAIT_GIVE_UP = 2

CHARACTER	= (1, 2, 3, 4, 5, 6, 7, 8, 9)				# 万
BAMBOO		= (31, 32, 33, 34, 35, 36, 37, 38, 39)		# 条
DOT			= (51, 52, 53, 54, 55, 56, 57, 58, 59)		# 筒
WINDS 		= (71, 72, 73, 74)							# 东, 南, 西, 北
DRAGONS 	= (75, 76, 77)								# 中, 发, 白
SEASON 		= (91, 92, 93, 94)							# 春, 夏, 秋, 冬
FLOWER 		= (95, 96, 97, 98)							# 梅, 兰, 竹, 菊

# 顺子分界(小于可以组成顺子)
BOUNDARY = 60

VALID_TILES = (CHARACTER, BAMBOO, DOT, WINDS, DRAGONS)

CHAR1, CHAR2, CHAR3, CHAR4, CHAR5, CHAR6, CHAR7, CHAR8, CHAR9 	= CHARACTER # 万
BAMB1, BAMB2, BAMB3, BAMB4, BAMB5, BAMB6, BAMB7, BAMB8, BAMB9 	= BAMBOO    # 条
DOT1,  DOT2,  DOT3,  DOT4,  DOT5,  DOT6,  DOT7,  DOT8,  DOT9  	= DOT 		# 筒
WIND_EAST, WIND_SOUTH, WIND_WEST, WIND_NORTH					= WINDS 	# 东, 南, 西, 北
DRAGON_RED, DRAGON_GREEN, DRAGON_WHITE 							= DRAGONS 	# 中, 发, 白
SEASON_SPRING, SEASON_SUMMER, SEASON_AUTUMN, SEASON_WINTER 		= SEASON 	# 春, 夏, 秋, 冬
FLOWER_PLUM, FLOWER_ORCHID, FLOWER_BAMBOO, FLOWER_CHRYSANTHEMUM	= FLOWER 	# 梅, 兰, 竹, 菊

#字牌
WINDS_DRAGONS = (WIND_EAST, WIND_SOUTH, WIND_WEST, WIND_NORTH, DRAGON_RED, DRAGON_GREEN, DRAGON_WHITE)
#花牌
WREATH = (SEASON_SPRING, SEASON_SUMMER, SEASON_AUTUMN, SEASON_WINTER, FLOWER_PLUM, FLOWER_ORCHID, FLOWER_BAMBOO, FLOWER_CHRYSANTHEMUM)

LUCKY_TUPLE = ([CHAR1, BAMB1, DOT1, CHAR5, BAMB5, DOT5, CHAR9, BAMB9, DOT9, WIND_EAST, DRAGON_RED],
	[CHAR2, BAMB2, DOT2, CHAR6, BAMB6, DOT6, WIND_SOUTH, DRAGON_GREEN],
	[CHAR3, BAMB3, DOT3, CHAR7, BAMB7, DOT7, WIND_WEST, DRAGON_WHITE],
	[CHAR4, BAMB4, DOT4, CHAR8, BAMB8, DOT8, WIND_NORTH], )

TRY_READY = (CHARACTER, BAMBOO, DOT, WINDS, DRAGONS)

#边
LEFT_EDGE = (CHAR3, DOT3, BAMB3)
RIGHT_EDGE = (CHAR7, DOT7, BAMB7)
#夹
CHAR_MID = (CHAR2, CHAR3, CHAR4, CHAR5, CHAR6, CHAR7, CHAR8)
DOT_MID = (DOT2,  DOT3,  DOT4,  DOT5,  DOT6,  DOT7,  DOT8)
BAMB_MID = (BAMB2, BAMB3, BAMB4, BAMB5, BAMB6, BAMB7, BAMB8)
MID = (CHAR_MID, DOT_MID, BAMB_MID)

# 定义一些错误码
OP_ERROR_NOT_CURRENT    = 1 # 非当前控牌玩家
OP_ERROR_ILLEGAL        = 2 # 操作非法
OP_ERROR_TIMEOUT        = 3 # 操作超时
OP_ERROR_STATE			= 4 # 房间状态不正确
OP_ERROR_VOTE			= 5 # 房间正在投票中
##########################################

# 牌局战绩保存上限
MAX_HISTORY_RESULT = 10
# 代理开房上限
AGENT_ROOM_LIMIT = 10
# 代理开房完成记录保存上限
COMPLETE_ROOM_LIMIT = 10

# @formatter:off
# 创建房间失败错误码
CREATE_FAILED_NO_ENOUGH_CARDS 			= -1 # 房卡不足
CREATE_FAILED_ALREADY_IN_ROOM 			= -2 # 已经在房间中
CREATE_FAILED_AGENT_ROOM_LIMIT 			= -3 # 代开房达到上限
CREATE_FAILED_NET_SERVER_ERROR 			= -4  # 访问外部网络结果失败
CREATE_FAILED_PERMISSION_DENIED			= -5 # 不是代理, 不能代开房

CREATE_FAILED_OTHER = -9

# 进入房间失败错误码
ENTER_FAILED_ROOM_NO_EXIST				= -1 # 房间不存在
ENTER_FAILED_ROOM_FULL					= -2 # 房间已经满员
ENTER_FAILED_ROOM_DIAMOND_NOT_ENOUGH	= -3 # 进入AA制付费房间时，钻石不足
ENTER_FAILED_NOT_CLUB_MEMBER			= -4 # 不是亲友圈成员
ENTER_FAILED_ALREADY_IN_ROOM 			= -5 # 已经在房间中
ENTER_FAILED_CLUB_LOCKED 				= -6 # 亲友圈被锁住
ENTER_FAILED_ROOM_DESTROYED 			= -9 # 房间已经销毁
ENTER_FAILED_ROOM_BLACK 				= -10 # 在亲友圈房间黑名单中


# 进入房间失败错误码
QUIT_FAILED_ROOM_STARTED				= -1 # 房间已经开始游戏
# @formatter:on

###########################################
# 签到相关 #
SIGN_IN_ACHIEVEMENT_DAY = 10 # 签到几天得奖励
SIGN_IN_ACHIEVEMENT_NUM = 1  # 奖励几张房卡
###########################################

STAR_LESS_7				= 0 # 十三不搭
STAR_LESS_7_MISS_SUIT 	= 1	# 十三不搭 缺色

STAR_7_SHADE 			= 2 # 暗7星 最后一张非 字牌
STAR_7_LIGHT 			= 3	# 明7星 最后一张   字牌
STAR_7_SHADE_MISS_SUIT 	= 4	# 暗7星 缺色
STAR_7_LIGHT_MISS_SUIT 	= 5	# 明7星 缺色

#################################### 回放配置 ####################################
# @formatter:off
MAX_RECORD_CACHE 					= 5000  # 最大缓存记录条数
MAX_RECORD_NONE_CACHE 				= 10000  # 最大缓存空记录条数
CLEAN_RECORD_CACHE_INTERVAL 		= 60 * 60 * 3  # 定时清理回放缓存时间间隔 单位秒
CLEAN_RECORD_CACHE_IDLE_INTERVAL 	= 60 * 60 * 3  # 清理回放超过一定时间间隔的数据 单位秒
QUERY_RECORD_NO_EXIST 				= 1100  # 回放记录不存在错误码
# @formatter:on
###################################################################################

ROOM_TTL = 60 * 60 * 3  # 房间的生存时间, 如果超过时间还没有人在打牌, 则销毁房间

###################################################################################
# 是否手动准备开局
HAND_PREPARE = 0  # 手动准备
AUTO_PREPARE = 1  # 自动准备
PREPARE_MODE = (AUTO_PREPARE, HAND_PREPARE)
# 谁开的房
NORMAL_ROOM = 1  # 普通开房
CLUB_ROOM 	= 2  # 亲友圈开房
OPEN_ROOM_MODE = (NORMAL_ROOM, CLUB_ROOM)
# 支付模式
NORMAL_PAY_MODE 	= 1  # 房主支付
AA_PAY_MODE 		= 2  # AA支付
CLUB_PAY_MODE 		= 3  # 亲友圈开房, 亲友圈老板支付
PAY_MODE = (NORMAL_PAY_MODE, AA_PAY_MODE, CLUB_PAY_MODE)
###################################################################################

# @formatter:off
##################################### 亲友圈 ##############################################
# 创建亲友圈消耗房卡
CREATE_CLUB_CARD_COST = 188
# 创建亲友圈的数量限制
CLUB_CREATE_LIMIT = 1
# 加入亲友圈的数量限制
CLUB_JOIN_LIMIT = 4

# 亲友圈中的最大桌子数
CLUB_TABLE_LIMIT = 20
# 亲友圈名字长度限制
CLUB_NAME_LENGTH = 8
# 成员备注长度限制
MEMBER_NOTES_LENGTH = 11
# 亲友圈公告长度限制
CLUB_NOTICE_LENGTH = 50
# 亲友圈战绩保存期限
CLUB_TABLE_RESULT_TTL = 2 * 24 * 3600
# 亲友圈成员上限
CLUB_MEMBER_LIMIT = 1000
# 亲友圈 管理员数量
CLUB_ADMIN_LIMIT = 3
# 亲友圈 统计数据 最大数量
CLUB_STATISTICS_LIMIT = 40
# 亲友圈 黑名单 最大数量
CLUB_BLACKS_LIMIT = 100

# 亲友圈权限
CLUB_POWER_OWNER = 64
CLUB_POWER_WHITE = 32
CLUB_POWER_ADMIN = 16
CLUB_POWER_CIVIL = 0

# 亲友圈相关错误码
CLUB_OP_ERR_PERMISSION_DENY = -1 # 权限不足
CLUB_OP_ERR_INVALID_OP		= -2 # 非法操作
CLUB_OP_ERR_NUM_LIMIT		= -3 # 亲友圈数量限制
CLUB_OP_ERR_WRONG_ARGS		= -4 # 参数错误
CLUB_OP_ERR_CLUB_NOT_EXIST	= -5 # 亲友圈不存在
CLUB_OP_ERR_CARD_NOT_ENOUGH	= -6 # 创建亲友圈卡数量不足

# 亲友圈相关操作码
CLUB_OP_AGREE_IN			= 1 # 同意玩家加入亲友圈
CLUB_OP_REFUSE_IN			= 2 # 拒绝玩家加入亲友圈
CLUB_OP_INVITE_IN			= 3 # 邀请玩家亲友圈
CLUB_OP_KICK_OUT			= 4 # 将玩家踢出亲友圈
CLUB_OP_APPLY_IN			= 5 # 申请加入亲友圈
CLUB_OP_APPLY_OUT			= 6 # 离开亲友圈
CLUB_OP_SET_NAME			= 7 # 亲友圈改名
CLUB_OP_GET_MEMBERS			= 8 # 获取成员列表
CLUB_OP_GET_APPLICANTS		= 9 # 获取申请者列表
CLUB_OP_SET_NOTICE			= 10# 设置亲友圈公告
CLUB_OP_SET_MEMBER_NOTES	= 11# 设置成员备注
CLUB_OP_SIT_DOWN			= 12# 选择一张桌子坐下
CLUB_OP_GET_TABLE_DETAIL	= 13# 获取桌子详情
CLUB_OP_GET_RECORDS			= 14# 获取亲友圈战绩
CLUB_OP_SET_ROOM_SWITCH		= 15# 亲友圈桌子开房选项开关
CLUB_OP_SET_ROOM_PARAMS		= 16# 修改亲友圈桌子开房选项
CLUB_OP_SET_CARD_SWITCH		= 17# 亲友圈房卡可视选项开关
CLUB_OP_SET_DEFAULT_ROOM	= 18# 修改亲友圈默认玩法
CLUB_OP_SET_PAY_MODE_SWITCH	= 19# 亲友圈支付方式开关
CLUB_OP_DISMISS_ROOM		= 20# 解散亲友圈房间
CLUB_OP_GET_FILTER_RECORDS	= 21# 分页获取亲友圈战绩，带过滤条件
CLUB_OP_INVITE_MEMBER_ROOM	= 22# 邀请玩家加入亲友圈房间
CLUB_OP_SET_LOCK_SWITCH		= 23# 亲友圈锁定开关
CLUB_OP_GET_MEMBERS2		= 24# 分页获取成员列表
CLUB_OP_SET_DISMISS_ROOM_PLAN		= 25 # 设置房间申请解散方案
CLUB_OP_GET_STATISTICS		= 26# 获取亲友圈统计
CLUB_OP_GET_ADMINS			= 27# 获取亲友圈管理员列表
CLUB_OP_SET_ADMIN			= 28# 设置亲友圈管理员
CLUB_OP_FIRE_ADMIN			= 29# 解雇亲友圈管理员
CLUB_OP_GET_PAGE_BLACKS		= 30# 获取亲友圈黑名单页
CLUB_OP_SET_BLACK			= 31# 设置亲友圈黑名单
CLUB_OP_KICK_BLACK			= 32# 将玩家踢出亲友圈黑名单

# 亲友圈成员的增删改查操作
CLUB_MEMBER_OP_ADD 		= 1
CLUB_MEMBER_OP_DELETE 	= 1 << 1
CLUB_MEMBER_OP_UPDATE 	= 1 << 2
CLUB_MEMBER_OP_QUERY 	= 1 << 3

CLUB_SEAT_INFO_LIMIT = 10

# @formatter:off
###########################################################################################
RED_ENVELOP_THRESHOLD = 6  # 符合生成红包, 成为有效玩家需要完成的整圈数

LINK_THRESHOLD = 10 # 符合奖励房卡的局数

# 用户信息最大缓存条目数量
USER_INFO_CACHE_SIZE = 1024

# 续房
ROOM_END = 0  # 房间不可以继续
ROOM_CONTINUE = 1  # 房间可以继续

# 日活存储最大天数
MAX_DAU_SIZE = 7
# 今日日活
DAU_TODAY = 1
# 昨日日活
DAU_YESTERDAY = 2
# 个人局数统计存储最大天数
MAX_AVATAR_ROUND_SIZE = 7

# --------------------------------------------- Poller ---------------------------------------------

# interface 操作码
INTERFACE_OP_ADD_TABLE = 1	# 茶楼加桌子 args = [clubId, value]
INTERFACE_OP_CREATE_CLUB = 2  # 创建茶楼 args = [userId, club_name]

# --------------------------------------------------------------------------------------------------

# --------------------------------------------- Task ---------------------------------------------

# 任务状态
TASK_STATE_NONE = 0  #
TASK_STATE_CLAIM = 1  # 已领取进行中
TASK_STATE_SETTLE = 2  # 待结算
TASK_STATE_COMPLETE = 3  # 已完成

# 任务操作
TASK_OPERATION_CLAIM = 1  # 领取任务
TASK_OPERATION_SUBMIT = 2  # 提交任务
TASK_OPERATION_SETTLE = 3  # 领取任务奖励
# --------------------------------------------------------------------------------------------------

# --------------------------------------------- Lottery ---------------------------------------------
#抽奖操作
LOTTERY_OPERATION_0 = 0  #领取按钮
LOTTERY_OPERATION_1 = 1  #转为房卡按钮

# 抽奖返回值
LOTTERY_SUCCESS = 1  #领取成功
LOTTERY_FAILD = 2    #领取失败
LOTTERY_OVER_TIME = 3#奖品超时

# 奖池的抽奖情况
LOTTERY_POOLS_FULL = 0 		#奖品都被抽完了
LOTTERY_POOLS_WELL_FULL = 1 #奖品快被抽完辣
LOTTERY_POOLS_GREEN = 2		#奖品还有呢

LOTTERY_POOLS_WARN_NUM = 100 #剩余奖品小于这个会发出警告
