"use strict";

var const_llkddmj = function () {
};

const_llkddmj.GAME_NAME = "KDDMJ";

// 玩家 出牌 状态机
const_llkddmj.DISCARD_FREE = 0; 	//玩家自由出牌
const_llkddmj.DISCARD_FORCE = 1; 	//强制出牌（摸到什么出什么，不碰不吃，直到胡为止）

// 玩家是否过胡
const_llkddmj.NO_PASS_WIN = 0   //玩家未过胡
const_llkddmj.PASS_WIN = 1      //玩家已过胡

const_llkddmj.PLAYER_TOUCH_SELF_STATE = 0;
const_llkddmj.PLAYER_TOUCH_FORCE_STATE = 1;
const_llkddmj.PLAYER_TOUCH_OTHER_STATE = 2;

const_llkddmj.BEGIN_ANIMATION_TIME = 0;

const_llkddmj.NOT_DISPLAY_CANWIN_PANEL = 0; //传入0时不显示canwin_panel
const_llkddmj.WINTIPS_BTN_DISPLAY = 10; //传入10时代表此时wintips_btn显示

const_llkddmj.mark_same_color = cc.color(191, 191, 191);
const_llkddmj.mark_none_color = cc.color(255, 255, 255);
const_llkddmj.mark_king_color = cc.color(242, 224, 71);
// const_llkddmj.mark_king_color = const_llkddmj.mark_none_color;
const_llkddmj.mark_ting_color = cc.color(191, 191, 190);

const_llkddmj.MAX_DISCARD_TILES_SIZE = 19;
const_llkddmj.DISCARD_TILES_SIZE = 20;

// const_llkddmj.WIN_TYPE_LIST = [			//胡牌类型
//     "平胡",
//     "清一色",
//     "七小对",
//     "豪华七小对",
//     "一条龙",
//     "十三幺",
// ];

/* ####################################  房间开房的一些模式 ################################## */

//# 规则
const_llkddmj.COMMON_GAME_MODE = 0;     // 普通玩法
const_llkddmj.SPECIAL_GAME_MODE = 1;    // 特殊牌型玩法
const_llkddmj.KING_GAME_MODE = 2;       // 耗子玩法
const_llkddmj.GAME_MODE = (const_llkddmj.COMMON_GAME_MODE, const_llkddmj.SPECIAL_GAME_MODE, const_llkddmj.KING_GAME_MODE);
//# 局数
const_llkddmj.GAME_ROUND = [8, 16, 24];
//# 财神
const_llkddmj.KING_MODE = [0, 1, 2];