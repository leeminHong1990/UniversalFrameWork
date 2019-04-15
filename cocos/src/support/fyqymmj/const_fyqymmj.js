"use strict";

var const_fyqymmj = function(){}

const_fyqymmj.GAME_NAME = "TDHMJ";
const_fyqymmj.GAME_NAME = "FYQYMMJ";


// 是否显示 交换位置
// const_fyqymmj.SHOW_SWAP_SEAT = 1

// 玩家 出牌 状态机
const_fyqymmj.DISCARD_FREE 			= 0 	//玩家自由出牌
const_fyqymmj.DISCARD_FORCE 		= 1 	//强制出牌（摸到什么出什么，不碰不吃，直到胡为止）

// 玩家是否过胡
const_fyqymmj.NO_PASS_WIN = 0   //玩家未过胡
const_fyqymmj.PASS_WIN = 1      //玩家已过胡

//立四麻将手牌间隙
const_fyqymmj.CLEARANCE = 10;

const_fyqymmj.BEGIN_ANIMATION_TIME = 0

const_fyqymmj.NOT_DISPLAY_CANWIN_PANEL = 0		//传入0时不显示canwin_panel
const_fyqymmj.WINTIPS_BTN_DISPLAY = 10		//传入10时代表此时wintips_btn显示

const_fyqymmj.mark_same_color = cc.color(191,191,191)
const_fyqymmj.mark_none_color = cc.color(255,255,255)
const_fyqymmj.mark_king_color = cc.color(242, 224, 71);
// const_fyqymmj.mark_king_color = const_fyqymmj.mark_none_color
const_fyqymmj.mark_ting_color = cc.color(191,191,190)

const_fyqymmj.MAX_DISCARD_TILES_SIZE = 19
const_fyqymmj.DISCARD_TILES_SIZE = 20

const_fyqymmj.WIN_TYPE_LIST = [			//胡牌类型
    "平胡",
    "清一色",
    "七小对",
    "豪华七小对",
    "一条龙",
    "十三幺",
]

//####################################  房间开房的一些模式 ####################################

//# 规则
const_fyqymmj.COMMON_GAME_MODE = 0;     // 普通玩法
const_fyqymmj.SPECIAL_GAME_MODE = 1;    // 特殊牌型玩法
const_fyqymmj.GAME_MODE = [const_fyqymmj.COMMON_GAME_MODE, const_fyqymmj.SPECIAL_GAME_MODE];
//# 局数
const_fyqymmj.GAME_ROUND = [8, 16, 24];
// # 带风
const_fyqymmj.ADD_WINDS = [0, 1];
// # 带庄
const_fyqymmj.ADD_DEALER = [0, 1];
// # 杠随胡
const_fyqymmj.KONG_FOLLOW_WIN = [0, 1];
// # 报听
const_fyqymmj.NEED_TING = [0, 1];
// # 包胡
const_fyqymmj.BAO_HU = [0, 1];
// # 一炮多响
const_fyqymmj.MULTIPLAYER_WIN = [0, 1];
// # 耗子
const_fyqymmj.KING_MODE = [0, 1];