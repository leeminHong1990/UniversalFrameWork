"use strict";

var const_lsbmzmj = function () {
};

const_lsbmzmj.GAME_NAME = "LSBMZMJ";

// 玩家 出牌 状态机
const_lsbmzmj.DISCARD_FREE = 0; 	//玩家自由出牌
const_lsbmzmj.DISCARD_FORCE = 1; 	//强制出牌（摸到什么出什么，不碰不吃，直到胡为止）

// 玩家是否过胡
const_lsbmzmj.NO_PASS_WIN = 0   //玩家未过胡
const_lsbmzmj.PASS_WIN = 1      //玩家已过胡

const_lsbmzmj.PLAYER_TOUCH_SELF_STATE = 0;
const_lsbmzmj.PLAYER_TOUCH_FORCE_STATE = 1;
const_lsbmzmj.PLAYER_TOUCH_OTHER_STATE = 2;

const_lsbmzmj.BEGIN_ANIMATION_TIME = 0;

const_lsbmzmj.NOT_DISPLAY_CANWIN_PANEL = 0; //传入0时不显示canwin_panel
const_lsbmzmj.WINTIPS_BTN_DISPLAY = 10; //传入10时代表此时wintips_btn显示

const_lsbmzmj.mark_same_color = cc.color(191, 191, 191);
const_lsbmzmj.mark_none_color = cc.color(255, 255, 255);
const_lsbmzmj.mark_king_color = cc.color(242, 224, 71);
// const_lsbmzmj.mark_king_color = const_lsbmzmj.mark_none_color;
const_lsbmzmj.mark_ting_color = cc.color(191, 191, 190);

const_lsbmzmj.MAX_DISCARD_TILES_SIZE = 19;
const_lsbmzmj.DISCARD_TILES_SIZE = 20;

// const_lsbmzmj.WIN_TYPE_LIST = [			//胡牌类型
//     "平胡",
//     "清一色",
//     "七小对",
//     "豪华七小对",
//     "一条龙",
//     "十三幺",
// ];

/* ####################################  房间开房的一些模式 ################################## */

//# 规则
const_lsbmzmj.COMMON_GAME_MODE = 0;     // 普通玩法
const_lsbmzmj.SPECIAL_GAME_MODE = 1;    // 特殊牌型玩法
const_lsbmzmj.KING_GAME_MODE = 2;       // 耗子玩法
const_lsbmzmj.GAME_MODE = (const_lsbmzmj.COMMON_GAME_MODE, const_lsbmzmj.SPECIAL_GAME_MODE, const_lsbmzmj.KING_GAME_MODE);
//# 局数
const_lsbmzmj.GAME_ROUND = [8, 16, 24];
//# 封顶
const_lsbmzmj.ROUND_MAX_LOSE = [0, 20, 40, 80];
//# 带入
const_lsbmzmj.GAME_MAX_LOSE = [40, 50, 60];
//# 底分
const_lsbmzmj.BASE_SCORE = [1, 2, 3];
//# 财神
const_lsbmzmj.KING_MODE = [0, 1];
//# 老庄
const_lsbmzmj.BEGIN_DEALER_MUL = [1, 2, 3];
//# 胡法
const_lsbmzmj.WIN_MODE = [0, 1];
//# 三摊承包
const_lsbmzmj.THREE_JOB = [0, 1];
//# 碰算摊
const_lsbmzmj.PONG_USEFUL = [0, 1];
//# 有财必拷响
const_lsbmzmj.BAO_TOU = [0, 1];