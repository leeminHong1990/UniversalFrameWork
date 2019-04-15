"use strict";
var const_ll7 = function () {
};

const_ll7.GAME_NAME = "LL7";
const_ll7.MAX_PLAYER_NUM = 5;
const_ll7.HAND_CARD_NUM = 20;
const_ll7.DESK_CARD_NUM = 20;

const_ll7.COLOR_WHITE = cc.color(255, 255, 255);
const_ll7.COLOR_GREY = cc.color(114, 114, 114);
const_ll7.SELECT_OFFSET = 40;

const_ll7.JOKERS = [75, 79];
const_ll7.JOKERS_IMAGE_INDEX = [21, 22];

const_ll7.HEI = [15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63];
const_ll7.HONG = [14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62];
const_ll7.MEI = [13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61];
const_ll7.FANG = [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60];

const_ll7.HEI_SUIT = 3;
const_ll7.HONG_SUIT = 2;
const_ll7.MEI_SUIT = 1;
const_ll7.FANG_SUIT = 0;

const_ll7.ALL_POKERS = [].concat(const_ll7.HEI, const_ll7.HONG, const_ll7.MEI, const_ll7.FANG);

const_ll7.POKER_COLOR_DICT = {
	3: "a",
	2: "c",
	1: "b",
	0: "d",
};


const_ll7.AID_NONE = 0;
const_ll7.LORD_FIRST = 1 << 3;
const_ll7.LORD_SECOND = 1 << 4;
const_ll7.LORD_THIRD = 1 << 5;
const_ll7.DRAW_COVER = 1 << 6;
const_ll7.COVER_POKER = 1 << 7;
const_ll7.DISCARD = 1 << 8;
const_ll7.SHOW_COVER = 1 << 9;
const_ll7.SURRENDER_FIRST = 1 << 10;
const_ll7.SURRENDER_SECOND = 1 << 11;

const_ll7.MAIDI_TIME = 20;

const_ll7.DIAOZHU = "diaozhu";
const_ll7.JIAFEN = "jiafen";
const_ll7.JIANFEN = "jianfen";
const_ll7.JIAOZHU = "jiaozhu";
const_ll7.POPAI = "popai";
const_ll7.TLJ = "tlj";

const_ll7.SMALL_7 = ["LL7GameRoomUI/small_poker_d7.png","LL7GameRoomUI/small_poker_b7.png","LL7GameRoomUI/small_poker_c7.png","LL7GameRoomUI/small_poker_a7.png"];

/*******************************************************计算相关******************************************************************/
// 黑红梅方
const_ll7.HHMF_VALUE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
// 有花色的牌
const_ll7.SUIT_POKERS = [const_ll7.FANG, const_ll7.MEI, const_ll7.HONG, const_ll7.HEI];
// 正主牌
const_ll7.LORD_POKERS = [const_ll7.JOKERS[1], const_ll7.JOKERS[0],
							const_ll7.HEI[4], const_ll7.HONG[4],
							const_ll7.MEI[4], const_ll7.FANG[4],
							const_ll7.HEI[12], const_ll7.HONG[12],
							const_ll7.MEI[12], const_ll7.FANG[12]];
const_ll7.SEVEN = [const_ll7.FANG[4], const_ll7.MEI[4], const_ll7.HONG[4], const_ll7.HEI[4]];
const_ll7.TWO   = [const_ll7.FANG[12], const_ll7.MEI[12], const_ll7.HONG[12], const_ll7.HEI[12]];

// 类型
const_ll7.POKER_MESS	= -1; // 杂
const_ll7.POKER_FANG	= 0;  // 方
const_ll7.POKER_MEI		= 1;  // 梅
const_ll7.POKER_HONG	= 2;  // 红
const_ll7.POKER_HEI		= 3;  // 黑
const_ll7.POKER_LORD	= 4;  // 主

const_ll7.COLOR_TYPE = [const_ll7.POKER_FANG, const_ll7.POKER_MEI, const_ll7.POKER_HONG, const_ll7.POKER_HEI, const_ll7.POKER_LORD];

const_ll7.TYPE_NONE		= 0; // 无牌型
const_ll7.TYPE_ONE 		= 1; // 单张
const_ll7.TYPE_PAIR 	= 2; // 对子
const_ll7.TYPE_SEQ_PAIR = 3; // 连对

const_ll7.POKER_TYPE = [const_ll7.TYPE_ONE, const_ll7.TYPE_PAIR, const_ll7.TYPE_SEQ_PAIR];

const_ll7.TYPE_OFFSET = 2;
const_ll7.POKER_OFFSET = 2;

// 牌类型
const_ll7.CARDS_MESS 			= -1;				// 杂牌/未知(不是同一花色/主)

const_ll7.CARDS_MESS_FANG 		= (const_ll7.POKER_FANG<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_NONE;			// 方_乱牌
const_ll7.CARDS_ONE_FANG 		= (const_ll7.POKER_FANG<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_ONE;				// 方_单张
const_ll7.CARDS_PAIR_FANG 		= (const_ll7.POKER_FANG<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_PAIR;			// 方_对子
const_ll7.CARDS_SEQ_PAIR_FANG 	= (const_ll7.POKER_FANG<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_SEQ_PAIR; 		// 方_连对

const_ll7.CARDS_MESS_MEI 		= (const_ll7.POKER_MEI<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_NONE;				// 梅_乱牌
const_ll7.CARDS_ONE_MEI 		= (const_ll7.POKER_MEI<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_ONE;				// 梅_单张
const_ll7.CARDS_PAIR_MEI 		= (const_ll7.POKER_MEI<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_PAIR;				// 梅_对子
const_ll7.CARDS_SEQ_PAIR_MEI	= (const_ll7.POKER_MEI<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_SEQ_PAIR; 		// 梅_连对

const_ll7.CARDS_MESS_HONG 		= (const_ll7.POKER_HONG<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_NONE;			// 红_乱牌
const_ll7.CARDS_ONE_HONG 		= (const_ll7.POKER_HONG<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_ONE;				// 红_单张
const_ll7.CARDS_PAIR_HONG 		= (const_ll7.POKER_HONG<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_PAIR;			// 红_对子
const_ll7.CARDS_SEQ_PAIR_HONG	= (const_ll7.POKER_HONG<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_SEQ_PAIR; 		// 红_连对

const_ll7.CARDS_MESS_HEI 		= (const_ll7.POKER_HEI<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_NONE;				// 黑_乱牌
const_ll7.CARDS_ONE_HEI 		= (const_ll7.POKER_HEI<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_ONE;				// 黑_单张
const_ll7.CARDS_PAIR_HEI 		= (const_ll7.POKER_HEI<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_PAIR;				// 黑_对子
const_ll7.CARDS_SEQ_PAIR_HEI 	= (const_ll7.POKER_HEI<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_SEQ_PAIR;  		// 黑_连对

const_ll7.CARDS_MESS_LORD 		= (const_ll7.POKER_LORD<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_NONE;			// 主_乱牌
const_ll7.CARDS_ONE_LORD 		= (const_ll7.POKER_LORD<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_ONE;				// 主_单张
const_ll7.CARDS_PAIR_LORD 		= (const_ll7.POKER_LORD<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_PAIR;			// 主_对子
const_ll7.CARDS_SEQ_PAIR_LORD 	= (const_ll7.POKER_LORD<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_SEQ_PAIR ;		// 主_连对


const_ll7.POKER_TYPE_NONE = -1;
const_ll7.POKER_TYPE_DIANPAI = 0;
const_ll7.POKER_TYPE_SHA = 1;
const_ll7.POKER_TYPE_DAZHU = 2;
const_ll7.POKER_TYPE_DIAOZHU = 3;


const_ll7.COUNTDOWN_JIAOZHU = 3;
const_ll7.COUNTDOWN_FANZHU = 7;
const_ll7.COUNTDOWN_FANZHU2 = 7;
const_ll7.COUNTDOWN_MAIDI = 30;
const_ll7.COUNTDOWN_GIVEUP = 8;
const_ll7.COUNTDOWN_DISCARD = 15;
const_ll7.COUNTDOWN_DEAL = 8;

