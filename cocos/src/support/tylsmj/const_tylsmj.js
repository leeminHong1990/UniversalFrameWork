"use strict";

var const_tylsmj = function(){}

const_tylsmj.GAME_NAME = "TYLSMJ";


// 是否显示 交换位置
// const_tylsmj.SHOW_SWAP_SEAT = 1

// 玩家 出牌 状态机
const_tylsmj.DISCARD_FREE 			= 0 	//玩家自由出牌
const_tylsmj.DISCARD_FORCE 		= 1 	//强制出牌（摸到什么出什么，不碰不吃，直到胡为止）

// 玩家是否过胡
const_tylsmj.NO_PASS_WIN = 0   //玩家未过胡
const_tylsmj.PASS_WIN = 1      //玩家已过胡

//立四麻将手牌间隙
const_tylsmj.CLEARANCE = 10;

const_tylsmj.BEGIN_ANIMATION_TIME = 0

const_tylsmj.NOT_DISPLAY_CANWIN_PANEL = 0		//传入0时不显示canwin_panel
const_tylsmj.WINTIPS_BTN_DISPLAY = 10		//传入10时代表此时wintips_btn显示

const_tylsmj.mark_same_color = cc.color(191,191,191)
const_tylsmj.mark_none_color = cc.color(255,255,255)
const_tylsmj.mark_king_color = cc.color(242, 224, 71);
// const_tylsmj.mark_king_color = const_tylsmj.mark_none_color
const_tylsmj.mark_ting_color = cc.color(191,191,190)

const_tylsmj.MAX_DISCARD_TILES_SIZE = 19
const_tylsmj.DISCARD_TILES_SIZE = 20

const_tylsmj.WIN_TYPE_LIST = [			//胡牌类型
    "平胡",
    "清一色",
    "七小对",
    "豪华七小对",
    "一条龙",
    "十三幺",
]

//####################################  房间开房的一些模式 ####################################

//# 规则
const_tylsmj.COMMON_GAME_MODE = 0;     // 普通玩法
const_tylsmj.SPECIAL_GAME_MODE = 1;    // 特殊牌型玩法
const_tylsmj.KING_GAME_MODE = 2;       // 耗子玩法
const_tylsmj.GAME_MODE = (const_tylsmj.COMMON_GAME_MODE, const_tylsmj.SPECIAL_GAME_MODE, const_tylsmj.KING_GAME_MODE);
// const_tylsmj.GAME_MODE = [const_tylsmj.ROUND_GAME_MODE, const_tylsmj.SCORE_GAME_MODE];
//# 局数
const_tylsmj.GAME_ROUND = [8, 16, 24];
//# 清一色
const_tylsmj.SAME_SUIT_MODE = [0, 1];
//# 清龙
const_tylsmj.SAME_SUIT_LOONG = [0, 1];