"use strict";

var const_ddz = function () {
};

const_ddz.GAME_NAME = "DouDiZhu";

// 房间操作id
// @formatter:off
const_ddz.OP_NONE               = 0; // 不允许执行操作
const_ddz.OP_PASS               = 1 << 3; // 过
const_ddz.OP_FIGHT_DEALER       = 1 << 4; // 抢庄
const_ddz.OP_BET                = 1 << 5; // 叫分
const_ddz.OP_DISCARD            = 1 << 6; // 打牌
const_ddz.OP_SEEN 			    = 1 << 7; // 明牌
const_ddz.OP_REDEAL 			= 1 << 8; // 重新发牌
const_ddz.OP_EXCHANGE           = 1 << 9; // 交换手牌
const_ddz.OP_CONFIRM_DEALER     = 1 << 10; // 确认x抢到庄家
const_ddz.OP_MUL     			= 1 << 11; // 加倍
// @formatter:on

const_ddz.SHOW_DO_OP = 0; 	//	doOperation
const_ddz.SHOW_CONFIRM_OP = 1; 	// 	confirmOperation

const_ddz.BEGIN_ANIMATION_TIME = 5;

const_ddz.GAME_ROOM_BG_CLASSIC = 0;
const_ddz.GAME_ROOM_BG_BULE = 1;
const_ddz.GAME_ROOM_BG_GREEN = 2;

const_ddz.PLAYER_TOUCH_SELF_STATE = 0;
const_ddz.PLAYER_TOUCH_FORCE_STATE = 1;
const_ddz.PLAYER_TOUCH_OTHER_STATE = 2;

const_ddz.PUTONG = "PuTong";	//普通话
const_ddz.LOCAL = "Local";		//地方话
const_ddz.LANGUAGE = [const_ddz.LOCAL, const_ddz.PUTONG];

//####################################  房间开房的一些模式 ####################################

// 规则
const_ddz.GAME_MODE_SCORE = 0;  // 叫分
const_ddz.GAME_MODE_DEALER = 1;  //抢庄

const_ddz.GET_DEALER_MUL = 3;  // 叫地主倍数
const_ddz.FIGHT_DEALER_MUL = 2;  // 抢地主倍数

const_ddz.GAME_MODE = [const_ddz.GAME_MODE_SCORE, const_ddz.GAME_MODE_DEALER];
const_ddz.GAME_MODE_STRING = [
	"叫分",
	"抢地主",
];
//# 局数
const_ddz.GAME_ROUND = [10, 20];
//# 带入
const_ddz.GAME_MAX_LOSE = [40, 50, 60];

// 是否有花牌  0 没有 1 有
const_ddz.MODE_WITHOUT_FLOWER = 0;
const_ddz.MODE_HAS_FLOWER = 1;
const_ddz.FLOWER_MODE = [0, 1];
/****************************************************************************************************/

const_ddz.MAX_PLAYER_NUM = 3;
const_ddz.HAND_CARD_NUM = 17 + 4;
const_ddz.DESK_CARD_NUM = 17 + 4;

const_ddz.MODULE_SEEN = true; // 明牌

const_ddz.COLOR_WHITE = cc.color(255, 255, 255);
const_ddz.COLOR_GREY = cc.color(114, 114, 114);
const_ddz.SELECT_OFFSET = 20;

const_ddz.ACTION_NAME_LIST = ["DDZAirplaneAction","DDZBombAction","DDZRocketAction"];