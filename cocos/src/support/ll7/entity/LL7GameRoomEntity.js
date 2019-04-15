"use strict";
var LL7GameRoomEntity = GameRoomEntity.extend({
	ctor: function (player_num, gameType) {
		this._super(player_num, gameType);

		this.player_num = player_num;
		this.op_seconds = 0;
		this.max_level = 3;
		this.play_mode = 1;
		this.sig_double = 1;
		this.mul_level = 1;
		this.is_emotion = 1;

		this.handTilesList = [];
		for (var i = 0; i < player_num; i++) {
			this.handTilesList.push(new Array(20).fill(0))
		}

		this.curPlayerSitNum = 0;
		this.last_discard_idx = -1;

		this.lordAid = const_ll7.LORD_FIRST;

		this.playerOperationList = new Array(player_num).fill(0);

		this.mainPokers = []; //  当前主牌
		this.mainServerSitNum = -1; // 当前的主
		this.friendServerSitNum = -1; //
		this.coverPokers = []; // 8张盖派
		this.discardHistory = [];// 当前一圈的历史记录
		this.lastLoopHistory = []; // 上一圈的历史记录
		this.firstDiscardPokers = null; // 打出的第一手牌
		this.startServerSitNum = -1; // 当前圈第一个打牌人
		this.lordIdx = -1; // 叫住过程中的当前操作人

		this.controlIdx = -1;

		this.sumPokerScore = 0;
		this.waitAid = -1;
		this.waitIdx = -1;
		this.bonusIdx = -1;

		KBEngine.DEBUG_MSG("Create GameRoomEntity")
	},

	reconnectRoomData: function (recRoomInfo) {
		this._super(recRoomInfo);
		this.discardHistory = recRoomInfo["desk_pokers"];
		this.mainPokers = recRoomInfo["lord_pokers"];
		this.mainServerSitNum = recRoomInfo["lord_idx"];
		this.playerOperationList = recRoomInfo["lord_state"];
		this.friendServerSitNum = recRoomInfo["partner_idx"];
		this.startServerSitNum = recRoomInfo["begin_idx"];
		this.coverPokers = recRoomInfo["cover_pokers"];
		this.max_level = recRoomInfo["max_level"];
		this.play_mode = recRoomInfo["play_mode"];
		this.mul_level = recRoomInfo["mul_level"];
		this.sig_double = recRoomInfo["sig_double"];

		this.firstDiscardPokers = recRoomInfo["desk_pokers"][this.startServerSitNum];
		this.lastLoopHistory = recRoomInfo["history_pokers"];

		this.bonusIdx = recRoomInfo["bonus_idx"];

		let lordAidList = recRoomInfo["lord_aid"];
		if (lordAidList.length === 1) {
			this.lordAid = lordAidList[0];
			if (this.lordAid === const_ll7.COVER_POKER) {
				this.lordAid = const_ll7.DRAW_COVER;
			}
		} else if (lordAidList.length === 0) {
			this.lordAid = const_ll7.AID_NONE;
		} else {
			this.lordAid = const_ll7.DRAW_COVER;
			this.giveupAid = lordAidList[1];
		}
		this.lordIdx = recRoomInfo["lord_idx"];

		if (this.lordAid === const_ll7.LORD_THIRD) {
			var index = this.lordIdx;
			var count = this.player_num || const_ll7.MAX_PLAYER_NUM;
			while (count-- > 0) {
				if (this.playerOperationList[index] === 0) {
					this.curPlayerSitNum = index;
					break;
				}
				index = (index + 1) % this.player_num;
			}
		} else {
			this.curPlayerSitNum = recRoomInfo["next_idx"];
		}
		this.controlIdx = recRoomInfo["control_idx"]; // 此次最大

		for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {
			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			let idx = curPlayerInfo['idx'];
			this.handTilesList[idx] = curPlayerInfo["pokers"];
			if (idx === this.lordIdx && this.lordAid === const_ll7.DRAW_COVER) {
				collections.removeArray(this.handTilesList[idx], this.coverPokers, true);
			}
			if (this.mainPokers.length > 0) {
				this.handTilesList[idx] = cutil_ll7.sort(this.handTilesList[idx], this.mainPokers[0]);
			} else {
				this.handTilesList[idx] = cutil_ll7.sort(this.handTilesList[idx])
			}
		}

		this.updateRoomData(recRoomInfo["init_info"]);
		for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {
			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			let idx = curPlayerInfo['idx'];
			this.playerInfoList[idx]["score"] = curPlayerInfo["score"];
			this.playerInfoList[idx]["total_score"] = curPlayerInfo["total_score"];
			this.playerInfoList[idx]["poker_score"] = curPlayerInfo["poker_score"];
			if (this.mainServerSitNum === idx || this.friendServerSitNum === idx) {
			} else {
				this.sumPokerScore += curPlayerInfo["poker_score"];
			}
		}

		let timeLeft = recRoomInfo["waitTimeLeft"];
		if (this.lordAid === const_ll7.DISCARD) {
			if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
				onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
			}
		}
		else {
			if (lordAidList.length === 2) {
				onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_MAIDI);
			} else if (this.lordAid === const_ll7.DRAW_COVER) {
				onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_MAIDI);
			}
			onhookMgr.setWaitLeftTime(timeLeft)
		}
	},

	updateRoomData: function (roomInfo) {
		this._super(roomInfo);
		this.lord_idx = roomInfo["lord_idx"];
		this.max_level = roomInfo["max_level"];
		this.mul_level = roomInfo["mul_level"];
		this.op_seconds = roomInfo["op_seconds"];
		this.sig_double = roomInfo["sig_double"];
		this.play_mode = roomInfo["play_mode"];
		this.bottom_level = roomInfo["bottom_level"];
		this.is_emotion = roomInfo["is_emotion"];
		this.updateDistanceList();
	},

	updateGrabScore: function (serverSitNum, score) {
		this.playerInfoList[serverSitNum]["poker_score"] += score;
		this.sumPokerScore += score;
	},

	cleanGrabScore: function (serverSitNum) {
		let pokerScore = this.playerInfoList[serverSitNum].poker_score;
		this.playerInfoList[serverSitNum].poker_score = 0;
		this.sumPokerScore -= pokerScore;
	},

	getRoomCreateDict: function () {
		return {
			"game_name": "ll7",
			'player_num': this.player_num,
			"op_seconds": this.op_seconds,
			"game_round": this.game_round,
			'max_level': this.max_level,
			'mul_level': this.mul_level,
			'play_mode': this.play_mode,
			'sig_double': this.sig_double,
			"pay_mode": this.pay_mode,
			'is_emotion': this.is_emotion,
			"room_type": this.roomType,
			"bottom_level": this.bottom_level,
		};
	},

	startGame: function () {
		this.room_state = const_val.ROOM_PLAYING;

		this.handTilesList = [];
		for (var i = 0; i < this.player_num; i++) {
			this.handTilesList.push(new Array(100 / this.player_num).fill(0));
		}

		this.op_seconds = 0;
		// this.max_level = 3;
		// this.play_mode = 1;

		this.curPlayerSitNum = 0;
		this.last_discard_idx = -1;

		this.lordAid = const_ll7.LORD_FIRST;

		this.playerOperationList = new Array(this.player_num).fill(0);

		this.mainPokers = []; //  当前主牌
		this.mainServerSitNum = -1; // 当前的主
		this.friendServerSitNum = -1; //
		this.coverPokers = []; // 8张盖派
		this.discardHistory = [];// 当前一圈的历史记录
		this.lastLoopHistory = []; // 上一圈的历史记录
		this.firstDiscardPokers = null; // 打出的第一手牌
		this.startServerSitNum = -1; // 当前圈第一个打牌人
		this.lordIdx = -1; // 叫住过程中的当前操作人
		this.bonusIdx = -1;

		this.controlIdx = -1;

		this.sumPokerScore = 0;

		this.waitAid = -1;
		this.waitIdx = -1;
		for (var i = 0; i < this.player_num; i++) {
			this.playerInfoList[i]["score"] = this.playerInfoList[i]["score"] == undefined ? 0 : this.playerInfoList[i]["score"];
			this.playerInfoList[i]["total_score"] = this.playerInfoList[i]["total_score"] == undefined ? 0 : this.playerInfoList[i]["total_score"];
			this.playerInfoList[i]["poker_score"] = 0;
		}
	},

	swap_seat: function (swap_list) {
	},

	endGame: function () {
		// 重新开始准备
		this.room_state = const_val.ROOM_WAITING;
		this.playerStateList = new Array(this.player_num).fill(0);

		this.curPlayerSitNum = 0;

		this.lordAid = const_ll7.LORD_FIRST;

		this.playerOperationList = new Array(this.player_num).fill(0);
		this.mainPokers = [];
		this.mainServerSitNum = -1;
		this.friendServerSitNum = -1;
		this.coverPokers = [];
		this.discardHistory = [];
		this.lastLoopHistory = [];
		this.firstDiscardPokers = null;
		this.startServerSitNum = -1;
		this.lordIdx = -1;
		this.controlIdx = -1;
		this.sumPokerScore = 0;
		this.waitAid = -1;
		this.waitIdx = -1;
	},

	hasPrevious: function () {
		if (!this.lastLoopHistory) {
			return false;
		}
		for (var i = 0; i < this.lastLoopHistory.length; i++) {
			if (this.lastLoopHistory[i]) {
				for (var j = 0; j < this.lastLoopHistory[i].length; j++) {
					if (this.lastLoopHistory[i][j] > 0) {
						return true;
					}
				}
			}
		}
		return false;
	},

	get7MaxCount: function (serverSitNum, tiles) {
		tiles = tiles || this.handTilesList[serverSitNum];
		var count7s = [0, 0, 0, 0];
		var types = [0, 1, 2, 3];
		for (var i = 0; i < tiles.length; i++) {
			let poker = tiles[i];
			if (const_ll7.JOKERS.indexOf(poker) !== -1) {
				continue;
			}
			let suit = cutil_ll7.get_suit(poker);
			let num = cutil_ll7.get_rank(poker);
			let index = types.indexOf(suit);
			if (num === 7) {
				count7s[index]++;
			}
		}
		return collections.max(count7s);
	},

	getMain7Count:function (serverSitNum, tiles) {
        tiles = tiles || this.handTilesList[serverSitNum];
        var count7s = [0, 0, 0, 0];
        var types = [0, 1, 2, 3];
        for (var i = 0; i < tiles.length; i++) {
            let poker = tiles[i];
            if (const_ll7.JOKERS.indexOf(poker) !== -1) {
                continue;
            }
            let suit = cutil_ll7.get_suit(poker);
            let num = cutil_ll7.get_rank(poker);
            let index = types.indexOf(suit);
            if (num === 7) {
                count7s[index]++;
            }
        }
        return count7s[cutil_ll7.get_suit(this.mainPokers[0])];
    }
});
