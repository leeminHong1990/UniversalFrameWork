"use strict";

var const_lsblmj = function(){}

const_lsblmj.GAME_NAME = "LSBLMJ";


// 是否显示 交换位置
// const_lsblmj.SHOW_SWAP_SEAT = 1

// 玩家 出牌 状态机
const_lsblmj.DISCARD_FREE 			= 0 	//玩家自由出牌
const_lsblmj.DISCARD_FORCE 		= 1 	//强制出牌（摸到什么出什么，不碰不吃，直到胡为止）

// 玩家是否过胡
const_lsblmj.NO_PASS_WIN = 0   //玩家未过胡
const_lsblmj.PASS_WIN = 1      //玩家已过胡

//立四麻将手牌间隙
const_lsblmj.CLEARANCE = 10;

const_lsblmj.BEGIN_ANIMATION_TIME = 0

const_lsblmj.NOT_DISPLAY_CANWIN_PANEL = 0		//传入0时不显示canwin_panel
const_lsblmj.WINTIPS_BTN_DISPLAY = 10		//传入10时代表此时wintips_btn显示

const_lsblmj.mark_same_color = cc.color(191,191,191)
const_lsblmj.mark_none_color = cc.color(255,255,255)
const_lsblmj.mark_king_color = cc.color(242, 224, 71);
// const_lsblmj.mark_king_color = const_lsblmj.mark_none_color
const_lsblmj.mark_ting_color = cc.color(191,191,190)

const_lsblmj.MAX_DISCARD_TILES_SIZE = 19
const_lsblmj.DISCARD_TILES_SIZE = 20

const_lsblmj.WIN_TYPE_LIST = [			//胡牌类型
    "平胡",
    "清一色",
    "七小对",
    "豪华七小对",
    "一条龙",
    "十三幺",
]

//####################################  房间开房的一些模式 ####################################

//# 规则
const_lsblmj.COMMON_GAME_MODE = 0;     // 普通玩法
const_lsblmj.SPECIAL_GAME_MODE = 1;    // 特殊牌型玩法
const_lsblmj.KING_GAME_MODE = 2;       // 耗子玩法
const_lsblmj.GAME_MODE = (const_lsblmj.COMMON_GAME_MODE, const_lsblmj.SPECIAL_GAME_MODE, const_lsblmj.KING_GAME_MODE);
// const_lsblmj.GAME_MODE = [const_lsblmj.ROUND_GAME_MODE, const_lsblmj.SCORE_GAME_MODE];
//# 局数
const_lsblmj.GAME_ROUND = [8, 16, 24];
//# 清一色
const_lsblmj.SAME_SUIT_MODE = [0, 1];
//# 清龙
const_lsblmj.SAME_SUIT_LOONG = [0, 1];