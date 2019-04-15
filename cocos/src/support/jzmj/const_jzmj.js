"use strict";

var const_jzmj = function(){}

const_jzmj.GAME_NAME = "JZMJ";


// 是否显示 交换位置
// const_jzmj.SHOW_SWAP_SEAT = 1

// 玩家 出牌 状态机
const_jzmj.DISCARD_FREE 			= 0 	//玩家自由出牌
const_jzmj.DISCARD_FORCE 		= 1 	//强制出牌（摸到什么出什么，不碰不吃，直到胡为止）

// 玩家是否过胡
const_jzmj.NO_PASS_WIN = 0   //玩家未过胡
const_jzmj.PASS_WIN = 1      //玩家已过胡

//立四麻将手牌间隙
const_jzmj.CLEARANCE = 10;

const_jzmj.BEGIN_ANIMATION_TIME = 0

const_jzmj.NOT_DISPLAY_CANWIN_PANEL = 0		//传入0时不显示canwin_panel
const_jzmj.WINTIPS_BTN_DISPLAY = 10		//传入10时代表此时wintips_btn显示

const_jzmj.mark_same_color = cc.color(191,191,191)
const_jzmj.mark_none_color = cc.color(255,255,255)
const_jzmj.mark_king_color = cc.color(242, 224, 71);
// const_jzmj.mark_king_color = const_jzmj.mark_none_color
const_jzmj.mark_ting_color = cc.color(191,191,190)

const_jzmj.MAX_DISCARD_TILES_SIZE = 19
const_jzmj.DISCARD_TILES_SIZE = 20

const_jzmj.WIN_TYPE_LIST = [			//胡牌类型
    "平胡",
    "清一色",
    "七小对",
    "豪华七小对",
    "一条龙",
    "十三幺",
]

//####################################  房间开房的一些模式 ####################################

//# 规则
const_jzmj.COMMON_GAME_MODE = 0;     // 普通玩法
const_jzmj.SPECIAL_GAME_MODE = 1;    // 特殊牌型玩法
const_jzmj.KING_GAME_MODE = 2;       // 耗子玩法
const_jzmj.GAME_MODE = (const_jzmj.COMMON_GAME_MODE, const_jzmj.SPECIAL_GAME_MODE, const_jzmj.KING_GAME_MODE);
// const_jzmj.GAME_MODE = [const_jzmj.ROUND_GAME_MODE, const_jzmj.SCORE_GAME_MODE];
//# 局数
const_jzmj.GAME_ROUND = [8, 16, 24];
//# 清一色
const_jzmj.SAME_SUIT_MODE = [0, 1];
//# 清龙
const_jzmj.SAME_SUIT_LOONG = [0, 1];