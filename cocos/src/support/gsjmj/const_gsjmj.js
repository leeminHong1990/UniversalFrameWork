"use strict";

var const_gsjmj = function () {
};

const_gsjmj.GAME_NAME = "GSJMJ";

const_gsjmj.BEGIN_ANIMATION_TIME = 0;

const_gsjmj.GAME_ROOM_BG_CLASSIC = 0;
const_gsjmj.GAME_ROOM_BG_BULE = 1;
const_gsjmj.GAME_ROOM_BG_GREEN = 2;


const_gsjmj.NOT_DISPLAY_CANWIN_PANEL = 0;		//传入0时不显示canwin_panel
const_gsjmj.WINTIPS_BTN_DISPLAY = 10;		//传入10时代表此时wintips_btn显示

const_gsjmj.mark_same_color = cc.color(191, 191, 191);
const_gsjmj.mark_none_color = cc.color(255, 255, 255);
const_gsjmj.mark_king_color = cc.color(242, 224, 71);
// const_gsjmj.mark_king_color = const_gsjmj.mark_none_color;

const_gsjmj.MAX_DISCARD_TILES_SIZE = 19;
const_gsjmj.DISCARD_TILES_SIZE = 20;

const_gsjmj.WIN_TYPE_LIST = [			//胡牌类型
	"平胡",
	"坎胡",
	"吊胡",
	"堆胡",
	"坎堆胡",
	"七对",
	"清七对",
	"清一色",
	"一条龙",
	"清一色套龙",
	"十三幺",
	"十三不靠"
];

const_gsjmj.PLAYER_TOUCH_SELF_STATE = 0;
const_gsjmj.PLAYER_TOUCH_FORCE_STATE = 1;
const_gsjmj.PLAYER_TOUCH_OTHER_STATE = 2;

const_gsjmj.FAKE_COUNTDOWN = 15; //假的倒计时开关
const_gsjmj.FAKE_BEGIN_ANIMATION_TIME = 5;	//假的倒计时开局动画延迟

//####################################  房间开房的一些模式 ####################################

//# 规则
const_gsjmj.NOWIND_GAME_MODE = 0;	// 不带风 108
const_gsjmj.WIND_GAME_MODE	= 1; // 带风 136
const_gsjmj.GAME_MODE = [const_gsjmj.NOWIND_GAME_MODE, const_gsjmj.WIND_GAME_MODE];
//# 局数
const_gsjmj.GAME_ROUND = [8, 16, 24];
//# 封顶
const_gsjmj.GAME_MAX_LOSE = [9999];
//# 底分
const_gsjmj.BASE_SCORE = [1, 2, 3];
//# 胡法 0 随便胡 1 必须堆胡
const_gsjmj.WIN_MODE = [0, 1];
//# 可选的胡牌牌型
const_gsjmj.SUIT_7PAI = 1 << 1; // 7对
const_gsjmj.SUIT_13MISMATCH = 1 << 2;  // 13幺
const_gsjmj.SUIT_13ORPHAN = 1 << 3;  // 13幺
const_gsjmj.SUIT_MODE = 0;


const_gsjmj.MAX_PLAYER_NUM = 3 ;

// 是否显示 每张财神的 左上角 标签
const_gsjmj.SHOW_KING_TILE_TITLE = 0; // 0 不显示 1 显示
