"use strict";

var const_val = function(){}

const_val.GAME_NAME = "XHHY";
// 为了便于UI管理，globalUIMgr的ZOrder一定要大于curUIMgrZOrder
const_val.globalUIMgrZOrder = 90000;
const_val.curUIMgrZOrder = 10000;

const_val.GameRoomBgZOrder = -100;
const_val.GameRoomZOrder = -80;
const_val.GameConfigZOrder = 100;
const_val.SettlementZOrder = 120;
const_val.PlayerInfoZOrder = 100;
const_val.CommunicateZOrder = 100;
const_val.HelpUIZOrder = 150;
const_val.HelpUIChildZOrder = 160;
const_val.GPSceneZOrder = 170;
const_val.GPSUIZOrder = 170;

const_val.GameHallZOrder = -10;
const_val.GameHallBroadcastZOrder = -5;

const_val.MAX_LAYER_NUM = 99999999;

// const_val strings
const_val.sClientDatas = "kbengine_js_demo"

const_val.OP_PASS             = 8 		//0b0001000 过
const_val.OP_DRAW             = 16 		//0b0010000 摸
const_val.OP_DISCARD          = 24 		//0b0011000 打
const_val.OP_CHOW             = 32 		//0b0100000 吃
const_val.OP_PONG             = 40 		//0b0101000 碰
const_val.OP_KONG_WREATH      = 48 		//0b0110000 杠花
const_val.OP_EXPOSED_KONG     = 56 		//0b0111000 明杠
const_val.OP_CONTINUE_KONG    = 57 		//0b0111001 碰后接杠
const_val.OP_CONCEALED_KONG   = 58 		//0b0111010 暗杠
// const_val.OP_POST_KONG        = 64 		//0b1000000 放杠
// const_val.OP_GET_KONG         = 72		//0b1001000 接杠
const_val.OP_CUT              = 80		//0b1010000 杠后切牌
const_val.OP_READY            = 88 		//0b1011000 听牌
const_val.OP_DRAW_END         = 96		//0b1100000 流局
const_val.OP_DRAW_WIN         = 104		//0b1101000 自摸胡
const_val.OP_KONG_WIN         = 105		//0b1101001 抢杠胡
const_val.OP_WREATH_WIN       = 106		//0b1101010 杠花胡
const_val.OP_GIVE_WIN		  = 107		//0b1101011 放炮胡

const_val.SHOW_CHOW = 4;
const_val.SHOW_PONG = 5;
const_val.SHOW_KONG = 7;
const_val.SHOW_WIN 	= 13;
const_val.SHOW_PASS = 1;
const_val.SHOW_OP_LIST = [const_val.SHOW_CHOW, const_val.SHOW_PONG, const_val.SHOW_KONG, const_val.SHOW_WIN, const_val.SHOW_PASS] // 吃 碰 杠 胡 过

const_val.SHOW_DO_OP 			= 0; 	//	doOperation
const_val.SHOW_CONFIRM_OP 		= 1; 	// 	confirmOperation

const_val.OP_LIST = [
	const_val.OP_PASS,
	const_val.OP_DRAW,
	const_val.OP_DISCARD,
	const_val.OP_CHOW,
	const_val.OP_PONG,
	const_val.OP_KONG_WREATH,
	const_val.OP_EXPOSED_KONG,
	const_val.OP_CONTINUE_KONG,
	const_val.OP_CONCEALED_KONG,
	// const_val.OP_POST_KONG,
	// const_val.OP_GET_KONG,
	const_val.OP_CUT,
	const_val.OP_READY,
	const_val.OP_DRAW_END,
	const_val.OP_DRAW_WIN,
	const_val.OP_KONG_WIN,
	const_val.OP_WREATH_WIN,
	const_val.OP_GIVE_WIN,
];

// 服务端 投票状态机，客户端暂时用不到
const_val.OP_STATE_PASS 		= 0 	//放弃操作
const_val.OP_STATE_WAIT 		= 1 	//等待确认
const_val.OP_STATE_SURE 		= 2 	//确认操作

// 牌局状态
const_val.ROOM_WAITING 			= 0		// 牌局未开始
const_val.ROOM_PLAYING 			= 1		// 牌局已开始

const_val.MIX_X_SUIT 			= 0
const_val.SAME_SUIT 			= 1  	//清一色
const_val.SAME_HONOR 			= 2  	//字一色
const_val.MIXED_ONE_SUIT 		= 3  	//混一色
const_val.LACK_DOOR             = 4  	//缺一门

// 万, 条, 筒
const_val.CHARACTER	= [1, 2, 3, 4, 5, 6, 7, 8, 9]
const_val.BAMBOO	= [31, 32, 33, 34, 35, 36, 37, 38, 39]
const_val.DOT		= [51, 52, 53, 54, 55, 56, 57, 58, 59]

// 顺子分界(小于可以组成顺子)
const_val.BOUNDARY = 60

// 红中, 发财, 白板
const_val.DRAGON_RED		= 75
const_val.DRAGON_GREEN		= 76
const_val.DRAGON_WHITE		= 77
const_val.DRAGONS = [const_val.DRAGON_RED, const_val.DRAGON_GREEN, const_val.DRAGON_WHITE]

// 东风, 南风, 西风, 北风
const_val.WIND_EAST	= 71
const_val.WIND_SOUTH	= 72
const_val.WIND_WEST	= 73
const_val.WIND_NORTH	= 74
const_val.WINDS = [const_val.WIND_EAST, const_val.WIND_SOUTH, const_val.WIND_WEST, const_val.WIND_NORTH]

const_val.WIND_CIRCLE = ["东风圈", "南风圈", "西风圈", "北风圈"]
//春, 夏, 秋, 冬
const_val.SEASON_SPRING = 91
const_val.SEASON_SUMMER = 92
const_val.SEASON_AUTUMN = 93
const_val.SEASON_WINTER = 94
const_val.SEASON = [const_val.SEASON_SPRING, const_val.SEASON_SUMMER, const_val.SEASON_AUTUMN, const_val.SEASON_WINTER]

//梅, 兰, 竹, 菊
const_val.FLOWER_PLUM 			= 95
const_val.FLOWER_ORCHID 		= 96
const_val.FLOWER_BAMBOO 		= 97
const_val.FLOWER_CHRYSANTHEMUN 	= 98
const_val.FLOWER = [const_val.FLOWER_PLUM, const_val.FLOWER_ORCHID, const_val.FLOWER_BAMBOO, const_val.FLOWER_CHRYSANTHEMUN]

const_val.WREATH = [const_val.SEASON_SPRING, const_val.SEASON_SUMMER, const_val.SEASON_AUTUMN, const_val.SEASON_WINTER, const_val.FLOWER_PLUM, const_val.FLOWER_ORCHID, const_val.FLOWER_BAMBOO, const_val.FLOWER_CHRYSANTHEMUN]

const_val.LEFT_EDGE = [const_val.CHARACTER[2], const_val.BAMBOO[2], const_val.DOT[2]]
const_val.RIGHT_EDGE = [const_val.CHARACTER[6], const_val.BAMBOO[6], const_val.DOT[6]]

const_val.CHAR_MID = [const_val.CHARACTER[1], const_val.CHARACTER[2], const_val.CHARACTER[3], const_val.CHARACTER[4], const_val.CHARACTER[5], const_val.CHARACTER[6], const_val.CHARACTER[7]]
const_val.DOT_MID = [const_val.DOT[1], const_val.DOT[2], const_val.DOT[3], const_val.DOT[4], const_val.DOT[5], const_val.DOT[6], const_val.DOT[7]]
const_val.BAMB_MID = [const_val.BAMBOO[1], const_val.BAMBOO[2], const_val.BAMBOO[3], const_val.BAMBOO[4], const_val.BAMBOO[5], const_val.BAMBOO[6], const_val.BAMBOO[7]]
const_val.MID = [const_val.CHAR_MID, const_val.DOT_MID, const_val.BAMB_MID]

const_val.SIGNIN_MAX = 10

const_val.GAME_RECORD_MAX = 50
const_val.DISMISS_ROOM_WAIT_TIME = 300 // 申请解散房间后等待的时间, 单位为秒

const_val.GAME_ROOM_2D_UI = 0;
const_val.GAME_ROOM_3D_UI = 1;

const_val.GAME_ROOM_BG_CLASSIC = 0;
const_val.GAME_ROOM_BG_BULE = 1;
const_val.GAME_ROOM_BG_GREEN = 2;

const_val.GAME_ROOM_MAHJONG_BG_GREEN = 0;
const_val.GAME_ROOM_MAHJONG_BG_YELLOW = 1;
const_val.GAME_ROOM_MAHJONG_BG_BULE = 2;

const_val.STAR_LESS_7				= 0 // 十三不搭
const_val.STAR_LESS_7_MISS_SUIT 	= 1	// 十三不搭 缺色
const_val.STAR_7_SHADE 				= 2 // 暗7星 最后一张非 字牌
const_val.STAR_7_LIGHT 				= 3	// 明7星 最后一张   字牌
const_val.STAR_7_SHADE_MISS_SUIT 	= 4	// 暗7星 缺色
const_val.STAR_7_LIGHT_MISS_SUIT 	= 5	// 明7星 缺色

const_val.PLAYER_TOUCH_SELF_STATE = 0;
const_val.PLAYER_TOUCH_FORCE_STATE = 1;
const_val.PLAYER_TOUCH_OTHER_STATE = 2;

const_val.GAME_ROOM_GAME_MODE = 0
const_val.GAME_ROOM_PLAYBACK_MODE = 1

// const_val.ANIM_LIST = [3, 6, 4, 6, 5, 4, 4, 2, 2];	//表情的帧数
const_val.ANIM_LIST = [0, 2, 4, 7, 5, 2, 4, 2, 2, 7, 2, 6, 3];	//表情的帧数
const_val.ANIM_SPEED_LIST = [0.3, 0.7, 0.5, 1.2, 1.2, 0.6, 0.8, 0.3, 0.5, 1.2, 0.8, 1.2, 0.9];	//表情的速度
const_val.EXPRESSION_ANIM_LIST = ["flower", "kiss", "cheers", "money"];	//魔法表情(扔钱的动画是由一张图片做的，这里写出来是为了保证它的长度正确)
const_val.EXPRESSION_ANIMNUM_LIST = [32, 23, 15, 10];	//魔法表情的帧数


const_val.FAKE_COUNTDOWN = 12; //假的倒计时开关
const_val.FAKE_BEGIN_ANIMATION_TIME = 5;	//假的倒计时开局动画延迟


//####################################  房间的一些错误码  #####################################
// 进入房间失败错误码
const_val.ENTER_FAILED_ROOM_NO_EXIST				= -1; // 房间不存在
const_val.ENTER_FAILED_ROOM_FULL					= -2; // 房间已经满员
const_val.ENTER_FAILED_ROOM_DIAMOND_NOT_ENOUGH		= -3; // 进入AA制付费房间时，代币不足
const_val.ENTER_FAILED_NOT_CLUB_MEMBER				= -4; // 不是亲友圈成员
const_val.ENTER_FAILED_ALREADY_IN_ROOM 			    = -5;  // 已经在房间中
const_val.ENTER_FAILED_CLUB_LOCKED 				    = -6;  // 亲友圈已关闭
const_val.ENTER_FAILED_ROOM_DESTROYED				= -9; // 房间已经销毁
const_val.ENTER_FAILED_ROOM_BLACK             		= -10; // 在亲友圈房间黑名单中
/* ####################################  房间开房的一些模式 ################################## */

//# 是否手动准备开局
const_val.HAND_PREPARE = 0;	//# 手动准备
const_val.AUTO_PREPARE = 1;	//# 自动准备
const_val.PREPARE_MODE = [const_val.AUTO_PREPARE, const_val.HAND_PREPARE];
//# 谁开的房
const_val.NORMAL_ROOM = 1;	//# 普通开房
const_val.CLUB_ROOM = 2;    //# 亲友圈开房
const_val.OPEN_ROOM_MODE = [const_val.NORMAL_ROOM, const_val.CLUB_ROOM];
//# 支付模式
const_val.NORMAL_PAY_MODE = 1; //# 正常房间, 房主支付
const_val.AA_PAY_MODE = 2;		//# 开房, AA支付
const_val.CLUB_PAY_MODE = 3;	//# 亲友圈开房, 老板支付
const_val.PAY_MODE = [const_val.NORMAL_PAY_MODE, const_val.AA_PAY_MODE, const_val.CLUB_PAY_MODE];

// ################################### 亲友圈相关 ########################################
//亲友圈相关字符长度
const_val.CLUB_MAX_MEM_NUM 	= 500; 		// 亲友圈人数限制
const_val.CLUB_MAX_MARK_LEN = 11; 		// 玩家备注最大长度
const_val.CLUB_NAME_LEN 	= 5;		// 亲友圈名字最大长度
const_val.CLUB_NUM_LIMIT 	= 5;		// 加入亲友圈最大数量
const_val.CLUB_NOTICE_LEN 	= 50;		// 公告最大长度

// 亲友圈相关错误码
const_val.CLUB_OP_ERR_PERMISSION_DENY	= -1; // 权限不足
const_val.CLUB_OP_ERR_INVALID_OP		= -2; // 非法操作
const_val.CLUB_OP_ERR_NUM_LIMIT			= -3; // 亲友圈数量限制
const_val.CLUB_OP_ERR_WRONG_ARGS		= -4; // 参数错误
const_val.CLUB_OP_ERR_CLUB_NOT_EXIST	= -5; // 亲友圈不存在
const_val.CLUB_OP_ERR_CARD_NOT_ENOUGH	= -6; // 创建亲友圈卡数量不足


// 亲友圈相关操作码
const_val.CLUB_OP_AGREE_IN		= 1 //同意玩家加入亲友圈
const_val.CLUB_OP_REFUSE_IN		= 2 // 拒绝玩家加入亲友圈
const_val.CLUB_OP_INVITE_IN		= 3 // 邀请玩家亲友圈
const_val.CLUB_OP_KICK_OUT		= 4 // 将玩家踢出亲友圈
const_val.CLUB_OP_APPLY_IN		= 5 // 申请加入亲友圈
const_val.CLUB_OP_APPLY_OUT		= 6 // 离开亲友圈
const_val.CLUB_OP_SET_NAME		= 7 // 亲友圈改名
const_val.CLUB_OP_GET_MEMBERS		= 8 // 获取成员列表
const_val.CLUB_OP_GET_APPLICANTS	= 9 // 获取申请者列表
const_val.CLUB_OP_SET_NOTICE		= 10// 设置亲友圈公告
const_val.CLUB_OP_SET_MEMBER_NOTES= 11// 设置成员备注
const_val.CLUB_OP_SIT_DOWN		= 12// 选择一张桌子坐下
const_val.CLUB_OP_GET_TABLE_DETAIL= 13// 获取桌子详情
const_val.CLUB_OP_GET_RECORDS		= 14// 获取亲友圈战绩
const_val.CLUB_OP_SET_ROOM_SWITCH	= 15// 亲友圈桌子开房选项开关
const_val.CLUB_OP_SET_ROOM_PARAMS	= 16// 修改亲友圈桌子开房选项
const_val.CLUB_OP_SET_CARD_SWITCH	= 17// 亲友圈房卡可视选项开关
const_val.CLUB_OP_SET_DEFAULT_ROOM	= 18// 修改亲友圈默认玩法
const_val.CLUB_OP_SET_PAY_MODE_SWITCH= 19 // 亲友圈支付方式开关
const_val.CLUB_OP_DISMISS_ROOM		= 20 // 解散亲友圈房间
const_val.CLUB_OP_GET_FILTER_RECORDS	= 21 //分页获取亲友圈战绩
const_val.CLUB_OP_SET_LOCK_SWITCH	= 23  //亲友圈锁定
const_val.CLUB_OP_GET_MEMBERS2		= 24 //分页获取成员列表
const_val.CLUB_OP_SET_DISMISS_ROOM_PLAN		= 25 //设置房间申请解散方案
const_val.CLUB_OP_GET_STATISTICS     = 26//获取亲友圈统计
const_val.CLUB_OP_GET_ADMINS       = 27//获取亲友圈管理员列表
const_val.CLUB_OP_SET_ADMIN        = 28//设置亲友圈管理员
const_val.CLUB_OP_FIRE_ADMIN       = 29//解雇亲友圈管理员
const_val.CLUB_OP_GET_PAGE_BLACKS       = 30//获取亲友圈黑名单页
const_val.CLUB_OP_SET_BLACK        = 31//设置亲友圈黑名单
const_val.CLUB_OP_KICK_BLACK       = 32//将玩家踢出亲友圈黑名单

//亲友圈权限相关
const_val.CLUB_POWER_OWNER = 64; //圈主权限
const_val.CLUB_POWER_WHITE = 32; //白名单权限
const_val.CLUB_POWER_ADMIN = 16; //管理员权限
const_val.CLUB_POWER_CIVIL = 0;	//普通成员
const_val.CLUB_POWER_OUT = -1;	//非圈成员

// 亲友圈一排桌子个数
const_val.ONE_ROW_DESK_NUM = 3;
// 亲友圈可见桌子宽度
const_val.THREE_DESK_WIDTH = 1230;
// 亲友圈最多个数
const_val.FRIENDS_CIRCLE_NUM = 5;
// 亲友圈凳子位置
const_val.STOOL_POS = [[],[],[cc.p(0.21, 0.56),cc.p(0.79, 0.56)],[cc.p(0.50, 0.85), cc.p(0.22, 0.45), cc.p(0.78, 0.45)],
						[cc.p(0.50, 0.85),cc.p(0.21, 0.56), cc.p(0.50, 0.27), cc.p(0.79, 0.56)],
						[cc.p(0.50, 0.85),cc.p(0.21, 0.62), cc.p(0.33, 0.31), cc.p(0.67, 0.31), cc.p(0.79, 0.62)],
						[cc.p(0.50, 0.85),cc.p(0.24, 0.68), cc.p(0.24, 0.40), cc.p(0.50, 0.27), cc.p(0.76, 0.40), cc.p(0.76, 0.68)]];
//亲友圈凳子角度
const_val.STOOL_ROTA = [[],[],[270,90],[0, 240, 120],
    [0,270,180,90],
    [0,288,216,144,72],
    [0,300,240,180,120,60]];

// activity
const_val.SHOW_ACTIVITY_INTERVAL = 3 * 60 * 60 * 1000;

//@formatter:off
const_val.GuiXiMJ 		    = 1001;
const_val.HangZhouMJ 		= 1002;
const_val.YiWuMJ			= 1003;
const_val.TaiYuanKDDMJ	    = 1004;
const_val.TaiYuanLSMJ		= 1005;
const_val.DongYangMJ		= 1006;
const_val.GuaiSanJiaoMJ		= 1011;
const_val.TuiDaoHuMJ		= 1012;
const_val.JinZhongMJ		= 1013;
const_val.JinZhongGSJMJ		= 1014;
const_val.DaTongLGFMJ		= 1015;
const_val.LvLiangKDDMJ		= 1016;
const_val.LvLiang7			= 1017;
const_val.LingShiBMZMJ		= 1018;
const_val.LingShiBLMJ		= 1019;
const_val.FenYangQYMMJ		= 1023;

const_val.DouPai			= 1007;
const_val.FourDeckCard	    = 1008;
const_val.DouDiZhu		    = 1009;
const_val.ShiSanZhang		= 1010;

const_val.GameType2GameName = {};
const_val.GameType2GameName[const_val.GuiXiMJ]      = 'GXMJ';
const_val.GameType2GameName[const_val.HangZhouMJ]   = 'HZMJ';
const_val.GameType2GameName[const_val.YiWuMJ]       = 'YWMJ';
const_val.GameType2GameName[const_val.TaiYuanKDDMJ] = 'TYKDDMJ';
const_val.GameType2GameName[const_val.TaiYuanLSMJ]  = 'TYLSMJ';
const_val.GameType2GameName[const_val.DongYangMJ]   = 'DYMJ';
const_val.GameType2GameName[const_val.DouPai]       = 'DP';
const_val.GameType2GameName[const_val.FourDeckCard] = 'FDC';
const_val.GameType2GameName[const_val.DouDiZhu]     = 'DDZ';
const_val.GameType2GameName[const_val.ShiSanZhang]  = 'SSZ';
const_val.GameType2GameName[const_val.GuaiSanJiaoMJ]= 'GSJMJ';
const_val.GameType2GameName[const_val.TuiDaoHuMJ]   = 'TDHMJ';
const_val.GameType2GameName[const_val.JinZhongMJ]   = 'JZMJ';
const_val.GameType2GameName[const_val.JinZhongGSJMJ]= 'JZGSJMJ';
const_val.GameType2GameName[const_val.DaTongLGFMJ]	= 'DTLGFMJ';
const_val.GameType2GameName[const_val.LvLiangKDDMJ] = 'LLKDDMJ';
const_val.GameType2GameName[const_val.LvLiang7] 	= 'LL7';
const_val.GameType2GameName[const_val.LingShiBMZMJ] = 'LSBMZMJ';
const_val.GameType2GameName[const_val.LingShiBLMJ] = 'LSBLMJ';
const_val.GameType2GameName[const_val.FenYangQYMMJ] = 'FYQYMMJ';

const_val.GameType2CName = {};
const_val.GameType2CName[const_val.GuiXiMJ]      = '贵溪麻将';
const_val.GameType2CName[const_val.HangZhouMJ]   = '杭州麻将';
const_val.GameType2CName[const_val.YiWuMJ]       = '义乌麻将';
const_val.GameType2CName[const_val.TaiYuanKDDMJ] = '扣点点麻将';
const_val.GameType2CName[const_val.TaiYuanLSMJ]  = '太原立四';
const_val.GameType2CName[const_val.DongYangMJ]   = '东阳麻将';
const_val.GameType2CName[const_val.DouPai]       = '欢乐比牌';
const_val.GameType2CName[const_val.FourDeckCard] = '四副牌';
const_val.GameType2CName[const_val.DouDiZhu]     = '斗地主';
const_val.GameType2CName[const_val.ShiSanZhang]  = '十三张';
const_val.GameType2CName[const_val.GuaiSanJiaoMJ]= '大同拐三角';
const_val.GameType2CName[const_val.TuiDaoHuMJ]   = '推倒胡';
const_val.GameType2CName[const_val.JinZhongMJ]   = '晋中麻将';
const_val.GameType2CName[const_val.JinZhongGSJMJ]= '晋中拐三角';
const_val.GameType2CName[const_val.DaTongLGFMJ]	 = '大同乱刮风';
const_val.GameType2CName[const_val.LvLiangKDDMJ] = '吕梁扣点点';
const_val.GameType2CName[const_val.LvLiang7] 	 = '吕梁打七';
const_val.GameType2CName[const_val.LingShiBMZMJ] = '灵石半摸子';
const_val.GameType2CName[const_val.LingShiBLMJ] = '灵石编龙';
const_val.GameType2CName[const_val.FenYangQYMMJ] = '汾阳缺一门';

const_val.GameType2CNum = {};
const_val.GameType2CNum[const_val.GuiXiMJ]      = 4;
const_val.GameType2CNum[const_val.HangZhouMJ]   = 4;
const_val.GameType2CNum[const_val.YiWuMJ]       = 4;
const_val.GameType2CNum[const_val.TaiYuanKDDMJ] = 4;
const_val.GameType2CNum[const_val.TaiYuanLSMJ]  = 4;
const_val.GameType2CNum[const_val.DongYangMJ]   = 4;
const_val.GameType2CNum[const_val.DouPai]       = 6;
const_val.GameType2CNum[const_val.FourDeckCard] = 4;
const_val.GameType2CNum[const_val.DouDiZhu]     = 3;
const_val.GameType2CNum[const_val.ShiSanZhang]  = 4;
const_val.GameType2CNum[const_val.GuaiSanJiaoMJ]= 3;
const_val.GameType2CNum[const_val.TuiDaoHuMJ]   = 4;
const_val.GameType2CNum[const_val.JinZhongMJ]   = 4;
const_val.GameType2CNum[const_val.JinZhongGSJMJ]= 3;
const_val.GameType2CNum[const_val.DaTongLGFMJ]  = 4;
const_val.GameType2CNum[const_val.LvLiangKDDMJ] = 4;
const_val.GameType2CNum[const_val.LvLiang7] 	= 5;
const_val.GameType2CNum[const_val.LingShiBMZMJ] = 4;
const_val.GameType2CNum[const_val.LingShiBLMJ] = 4;
const_val.GameType2CNum[const_val.FenYangQYMMJ] = 4;
//@formatter:on

// 是否需要销毁房间状态
const_val.ROOM_END = 0;		// 房间不可以继续
const_val.ROOM_CONTINUE = 1;// 房间可以继续

const_val.CARD_PRICE_LIST = [6,18,30,68,128,328];     //购买房卡价格显示
const_val.CARD_NUM_LIST = [6,18,30,68,128,328];       //购买房卡个数显示

//打牌速度
const_val.DISCARD_SPEED = 0.0;

//发表情 发语音 发方言 的惩罚事件 punishment
const_val.SEND_PUNISHMENT_TIME = 5;
const_val.EFFECT_PUNISHMENT_TIME = 5;

//发房卡表情的名称
const_val.EFFECT_FISCAL_NUM = 0;
const_val.EFFECT_WASH_NUM = 1;
const_val.EFFECT_NUM_LIST = [const_val.EFFECT_FISCAL_NUM,const_val.EFFECT_WASH_NUM];
const_val.EFFECT_NAME_LIST = ["EffectFiscalAction","EffectWashAction"];
const_val.EFFECT_WORD_LIST = ["拜了一次财神，气运正隆！","洗了一次手，气运正隆！"];

//建房选项的字体颜色
const_val.ROOM_WORD_NORMAL = cc.color(131, 96, 77);
const_val.ROOM_WORD_SELECT = cc.color(10, 136, 0);