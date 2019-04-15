"use strict";

var const_tykddmj = function () {
};

const_tykddmj.GAME_NAME = "KDDMJ";

// 玩家 出牌 状态机
const_tykddmj.DISCARD_FREE = 0; 	//玩家自由出牌
const_tykddmj.DISCARD_FORCE = 1; 	//强制出牌（摸到什么出什么，不碰不吃，直到胡为止）

// 玩家是否过胡
const_tykddmj.NO_PASS_WIN = 0   //玩家未过胡
const_tykddmj.PASS_WIN = 1      //玩家已过胡

const_tykddmj.PLAYER_TOUCH_SELF_STATE = 0;
const_tykddmj.PLAYER_TOUCH_FORCE_STATE = 1;
const_tykddmj.PLAYER_TOUCH_OTHER_STATE = 2;

const_tykddmj.BEGIN_ANIMATION_TIME = 0;

const_tykddmj.NOT_DISPLAY_CANWIN_PANEL = 0; //传入0时不显示canwin_panel
const_tykddmj.WINTIPS_BTN_DISPLAY = 10; //传入10时代表此时wintips_btn显示

const_tykddmj.mark_same_color = cc.color(191, 191, 191);
const_tykddmj.mark_none_color = cc.color(255, 255, 255);
const_tykddmj.mark_king_color = cc.color(242, 224, 71);
// const_tykddmj.mark_king_color = const_tykddmj.mark_none_color;
const_tykddmj.mark_ting_color = cc.color(191, 191, 190);

const_tykddmj.MAX_DISCARD_TILES_SIZE = 19;
const_tykddmj.DISCARD_TILES_SIZE = 20;

// const_tykddmj.WIN_TYPE_LIST = [			//胡牌类型
//     "平胡",
//     "清一色",
//     "七小对",
//     "豪华七小对",
//     "一条龙",
//     "十三幺",
// ];

/* ####################################  房间开房的一些模式 ################################## */

//# 规则
const_tykddmj.COMMON_GAME_MODE = 0;     // 普通玩法
const_tykddmj.SPECIAL_GAME_MODE = 1;    // 特殊牌型玩法
const_tykddmj.KING_GAME_MODE = 2;       // 耗子玩法
const_tykddmj.GAME_MODE = (const_tykddmj.COMMON_GAME_MODE, const_tykddmj.SPECIAL_GAME_MODE, const_tykddmj.KING_GAME_MODE);
//# 局数
const_tykddmj.GAME_ROUND = [8, 16, 24];
//# 封顶
const_tykddmj.ROUND_MAX_LOSE = [0, 20, 40, 80];
//# 带入
const_tykddmj.GAME_MAX_LOSE = [40, 50, 60];
//# 底分
const_tykddmj.BASE_SCORE = [1, 2, 3];
//# 财神
const_tykddmj.KING_MODE = [0, 1];
//# 老庄
const_tykddmj.BEGIN_DEALER_MUL = [1, 2, 3];
//# 胡法
const_tykddmj.WIN_MODE = [0, 1];
//# 三摊承包
const_tykddmj.THREE_JOB = [0, 1];
//# 碰算摊
const_tykddmj.PONG_USEFUL = [0, 1];
//# 有财必拷响
const_tykddmj.BAO_TOU = [0, 1];