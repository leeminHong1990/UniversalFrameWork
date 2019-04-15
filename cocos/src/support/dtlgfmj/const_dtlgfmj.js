"use strict";

var const_dtlgfmj = function () {
};

const_dtlgfmj.GAME_NAME = "DTLGFMJ";

const_dtlgfmj.BEGIN_ANIMATION_TIME = 0;

const_dtlgfmj.NOT_DISPLAY_CANWIN_PANEL = 0; //传入0时不显示canwin_panel
const_dtlgfmj.WINTIPS_BTN_DISPLAY = 10; //传入10时代表此时wintips_btn显示

const_dtlgfmj.mark_same_color = cc.color(191, 191, 191);
const_dtlgfmj.mark_none_color = cc.color(255, 255, 255);
const_dtlgfmj.MAX_DISCARD_TILES_SIZE = 19;
const_dtlgfmj.DISCARD_TILES_SIZE = 20;

// 麻将房间操作id #
const_dtlgfmj.OP_SHOW_HINT 	= 112 //0b1110000 亮牌
const_dtlgfmj.OP_ADD_HINT 	= 120 //0b1111000 增加hint

const_dtlgfmj.WIN_TYPE_LIST = [			//胡牌类型
    '平胡',
    '一条龙',
    '清一色',
    '7对'
];

const_dtlgfmj.mark_same_color = cc.color(191,191,191);
const_dtlgfmj.mark_none_color = cc.color(255,255,255);
const_dtlgfmj.mark_king_color = cc.color(242, 224, 71);
// const_dtlgfmj.mark_king_color = const_dtlgfmj.mark_none_color;
const_dtlgfmj.mark_ting_color = cc.color(191,191,190);

const_dtlgfmj.WINDS_AND_DRAGONS = [const_val.WIND_EAST, const_val.WIND_SOUTH, const_val.WIND_WEST, const_val.WIND_NORTH, const_val.DRAGON_RED, const_val.DRAGON_GREEN, const_val.DRAGON_WHITE]

/* ####################################  房间开房的一些模式 ################################## */

// // 规则
// const_dtlgfmj.NORMAL_GAME_MODE = 0;	// 普通模式
// const_dtlgfmj.DOUBLE_GAME_MODE = 1;	// 东带庄(庄家翻倍)
// const_dtlgfmj.GAME_MODE = [const_dtlgfmj.NORMAL_GAME_MODE, const_dtlgfmj.DOUBLE_GAME_MODE];
// // 局数
// const_dtlgfmj.ROUND = [8, 16, 24];
// // 封顶
// const_dtlgfmj.MAX_LOSE = [9999, 10, 20, 30];
// // 摸宝数量
// const_dtlgfmj.TREASURE_NUM = [0, 1, 2];
// // 出牌时限
// const_dtlgfmj.DISCARD_SECONDS = [0, 10, 15, 20];


// 玩法模式
const_dtlgfmj.DRAW_GIVE_MODE = 0;
const_dtlgfmj.DRAW_MODE = 1;
const_dtlgfmj.GAME_MODE = [const_dtlgfmj.DRAW_GIVE_MODE, const_dtlgfmj.DRAW_MODE];
// 局数
const_dtlgfmj.GAME_ROUND = [4, 8, 12];
// 放炮算分模式
const_dtlgfmj.GIVE_AA_MODE 	= 0;	// 三家出
const_dtlgfmj.GIVE_TREAT_MODE = 1;		// 一家出
const_dtlgfmj.SCORE_MODE = [const_dtlgfmj.GIVE_AA_MODE, const_dtlgfmj.GIVE_TREAT_MODE];
// 7小对（豪华7对）
const_dtlgfmj.SEVEN_PAIR = [0, 1];
// 底分
const_dtlgfmj.BASE_SCORE = [1, 2, 5];
// 杠牌是否算分
const_dtlgfmj.KONG_MODE = [0, 1];

//亮牌操作
const_dtlgfmj.OP_LIANG = 200;