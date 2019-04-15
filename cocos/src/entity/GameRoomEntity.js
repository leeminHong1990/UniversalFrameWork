"use strict";

var GameRoomEntity = KBEngine.Entity.extend({
	ctor: function (player_num, gameType) {
		this._super();
		this.roomID = undefined;
		this.curRound = 0;
		this.game_round = 8;
		this.ownerId = undefined;
		this.isAgent = false;
		this.player_num = player_num;
		this.pay_mode = 0;
		this.hand_prepare = 1;
		this.roomType = undefined;
		this.club_id = 0;
		this.gameType = gameType;
		this.playerInfoList = new Array(this.player_num).fill(null);
		this.playerDistanceList = [];
		for (var i = 0; i < player_num; i++) {
			this.playerDistanceList.push(new Array(player_num).fill(-1));
		}

		this.room_state = const_val.ROOM_WAITING;
		this.applyCloseLeftTime = 0;
		this.applyCloseFrom = 0;
		this.applyCloseStateList = new Array(this.player_num).fill(0);

		this.msgList = [];		//所有的聊天记录
		KBEngine.DEBUG_MSG("Create GameRoomEntity")
	},

	reconnectRoomData: function (recRoomInfo) {
		cc.log("reconnectRoomData", recRoomInfo);
		this.room_state = recRoomInfo["room_state"];
		this.playerStateList = recRoomInfo["player_state_list"];
		this.applyCloseLeftTime = recRoomInfo["applyCloseLeftTime"];
		this.applyCloseFrom = recRoomInfo["applyCloseFrom"];
		this.applyCloseStateList = recRoomInfo["applyCloseStateList"];
		if (this.applyCloseLeftTime > 0) {
			onhookMgr.setApplyCloseLeftTime(this.applyCloseLeftTime);
		}
	},

	updateRoomData: function (roomInfo) {
		cc.log('updateRoomData:', roomInfo);
		this.roomID = roomInfo["roomID"];
		this.ownerId = roomInfo["ownerId"];
		this.curRound = roomInfo["curRound"];
		this.game_round = roomInfo["game_round"];
		this.player_num = roomInfo["player_num"];
		this.pay_mode = roomInfo["pay_mode"];
		this.isAgent = roomInfo["isAgent"];
		this.hand_prepare = roomInfo["hand_prepare"];
		this.club_id = roomInfo["club_id"];
		this.roomType = roomInfo["roomType"];
		this.table_idx = roomInfo["table_idx"] + 1;
		for (var i = 0; i < roomInfo["player_base_info_list"].length; i++) {
			this.updatePlayerInfo(roomInfo["player_base_info_list"][i]["idx"], roomInfo["player_base_info_list"][i]);
		}
	},

	updatePlayerInfo: function (serverSitNum, playerInfo) {
		this.playerInfoList[serverSitNum] = playerInfo;
	},

	updatePlayerState: function (serverSitNum, state) {
		this.playerStateList[serverSitNum] = state;
	},

	updatePlayerOnlineState: function (serverSitNum, state) {
		this.playerInfoList[serverSitNum]["online"] = state;
	},

	updateDistanceList: function () {
		for (var i = 0; i < this.player_num; i++) {
			for (var j = 0; j < this.player_num; j++) {
				if (i === j) {
					this.playerDistanceList[i][j] = -1;
					continue;
				}
				if (this.playerInfoList[i] && this.playerInfoList[j]) {
					var distance = cutil.calc_distance(parseFloat(this.playerInfoList[i]["lat"]), parseFloat(this.playerInfoList[i]["lng"]), parseFloat(this.playerInfoList[j]["lat"]), parseFloat(this.playerInfoList[j]["lng"]));
					this.playerDistanceList[i][j] = (distance || distance == 0 ? distance : -1);
				} else {
					this.playerDistanceList[i][j] = -1;
				}
			}
		}
	},

	startGame: function () {
		this.room_state = const_val.ROOM_PLAYING;
	},

	endGame: function () {
		// 重新开始准备
		this.room_state = const_val.ROOM_WAITING;
		this.playerStateList = new Array(this.player_num).fill(0);
	},
});