"use strict";

var DDZGameRoomEntity = GameRoomEntity.extend({
	ctor: function (player_num, gameType) {
		this._super(player_num, gameType);
		this.dealerIdx = -1;
		this.game_mode = 0;
		this.game_max_lose = 999999;
		this.max_boom_times = 9999;

		this.handTilesList = [new Array(17).fill(0), new Array(17).fill(0), new Array(17).fill(0)];
		this.bet_score_list = [-1, -1, -1];
		this.hostCards = [];
		this.curPlayerSitNum = 0;
		this.last_discard_idx = -1;
		this.discard_record = [];
		this.fight_dealer_mul_list = [-1, -1, -1];
		this.mul_score_list = [0, 0, 0];
		this.boom_times = 0;
		this.flower_mode = const_ddz.MODE_HAS_FLOWER;
		this.mul_mode = 0;
		this.dealer_joker = 0;
		this.dealer_42 = 0;
		this.mul_score = 1;
		this.only3_1 = 0;
		this.is_emotion = 0;

		this.waitAidList = []; // 玩家操作列表，[]表示没有玩家操作
		this.waitDataList = [];// 表示等待操作的需要数据
		KBEngine.DEBUG_MSG("Create GameRoomEntity")
	},

	reconnectRoomData: function (recRoomInfo) {
		this._super(recRoomInfo);
		this.curPlayerSitNum = recRoomInfo["curPlayerSitNum"];
		this.bet_score_list = recRoomInfo["bet_score_list"];
		this.boom_times = recRoomInfo["boom_times"];
		this.mul_score_list = recRoomInfo["mul_score_list"];

		for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {
			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			let idx = curPlayerInfo['idx'];
			this.handTilesList[idx] = curPlayerInfo["tiles"];
		}
		this.fight_dealer_mul_list = recRoomInfo["fight_dealer_mul_list"];

		this.hostCards = recRoomInfo["host_cards"];
		this.last_discard_idx = recRoomInfo["last_discard_idx"];
		this.discard_record = recRoomInfo["discard_record"];

		this.waitAidList = recRoomInfo["waitAidList"];
		this.waitDataList = recRoomInfo["waitDataList"];
		this.updateRoomData(recRoomInfo["init_info"]);
		for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {
			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			let idx = curPlayerInfo['idx'];
			this.playerInfoList[idx]["score"] = curPlayerInfo["score"];
			this.playerInfoList[idx]["total_score"] = curPlayerInfo["total_score"];
		}
		if (this.mul_score_list.indexOf(0) >= 0 && this.dealerIdx != -1 && onhookMgr) {
			onhookMgr.setWaitLeftTime(recRoomInfo["waitTimeLeft"])
		} else if (onhookMgr && this.op_seconds > 0) {
			onhookMgr.setWaitLeftTime(recRoomInfo["waitTimeLeft"])
		} else if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
			onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
		}
	},

	updateRoomData: function (roomInfo) {
		this._super(roomInfo);
		this.dealerIdx = roomInfo["dealerIdx"];
		this.game_round = roomInfo["game_round"];
		this.game_mode = roomInfo["game_mode"];
		this.max_boom_times = roomInfo["max_boom_times"];
		this.game_max_lose = roomInfo["game_max_lose"];
		this.flower_mode = roomInfo["flower_mode"];
		this.op_seconds = roomInfo["op_seconds"];
		this.mul_mode = roomInfo["mul_mode"];
		this.dealer_joker = roomInfo["dealer_joker"];
		this.dealer_42 = roomInfo["dealer_42"];
		this.mul_score = roomInfo["mul_score"];
		this.only3_1 = roomInfo["only3_1"];
		this.is_emotion = roomInfo["is_emotion"];
		for (var i = 0; i < roomInfo["player_base_info_list"].length; i++) {
			this.updatePlayerInfo(roomInfo["player_base_info_list"][i]["idx"], roomInfo["player_base_info_list"][i]);
		}
		this.updateDistanceList();
	},

	getLastDiscard: function (serverSitNum) {
		if (!(this.last_discard_idx === serverSitNum || this.last_discard_idx === -1)) {
			for (var i = this.discard_record.length - 1; i >= 0; i--) {
				let cards = this.discard_record[i];
				if (cards && cards.length > 0) {
					return cards;
				}
			}
		}
		return null;
	},

	getRoomCreateDict: function () {
		return {
			"game_name": "ddz",
			"flower_mode": this.flower_mode,
			"mul_mode": this.mul_mode,
			"dealer_joker": this.dealer_joker,
			"dealer_42": this.dealer_42,
			"room_type": this.roomType,
			"game_mode": this.game_mode,
			"game_round": this.game_round,
			"op_seconds": this.op_seconds,
			"is_emotion": this.is_emotion,
			"pay_mode": this.pay_mode,
			'max_boom_times': this.max_boom_times,
			"mul_score": this.mul_score,
			"only3_1": this.only3_1
		};
	},

	startGame: function () {
		this.room_state = const_val.ROOM_PLAYING;
		this.handTilesList = [new Array(17).fill(0), new Array(17).fill(0), new Array(17).fill(0)];
		this.waitAidList = [];
		this.waitDataList = [];
		this.bet_score_list = [-1, -1, -1];
		this.fight_dealer_mul_list = [-1, -1, -1];
		this.mul_score_list = [0, 0, 0];
		this.boom_times = 0;
		this.last_discard_idx = -1;
	},

	swap_seat: function (swap_list) {
		if (true) {
			return;
		}
		if (!swap_list) {
			return;
		}
		var tempPlayerInfoList = [];
		var tempPlayerDistanceList = [];
		for (var i = 0; i < swap_list.length; i++) {
			tempPlayerInfoList[i] = this.playerInfoList[swap_list[i]];
			tempPlayerInfoList[i].idx = i;
			tempPlayerDistanceList[i] = this.playerDistanceList[swap_list[i]];
		}
		cc.log(tempPlayerInfoList);
		this.playerInfoList = tempPlayerInfoList;
		this.playerDistanceList = tempPlayerDistanceList;
	},

	endGame: function () {
		// 重新开始准备
		this.room_state = const_val.ROOM_WAITING;
		this.playerStateList = [0, 0, 0];
		this.waitAidList = [];
		this.waitDataList = [];
		this.last_discard_idx = -1;
		this.discard_record = [];
	},

	hasJokerPair: function (serverSitNum) {
		var tiles = this.handTilesList[serverSitNum];
		return tiles.indexOf(ddz_rules.LITTLE_JOKER) >= 0 && tiles.indexOf(ddz_rules.BIG_JOKER) >= 0;
	},

	has2pair4: function (serverSitNum) {
		var tiles = this.handTilesList[serverSitNum];
		tiles = collections.map(tiles, ddz_rules.get_rank)
		return collections.count(tiles, 2) === 4;

	},

	dealer_can_mul: function () {
		return this.mul_score_list.indexOf(2) >= 0;
	},

});
