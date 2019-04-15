"use strict";
var RoomOperationAdapter = cc.Class.extend({

	ctor: function (player, serverSitNum, gameRoom) {
		this.curGameRoom = gameRoom;
		this.serverSitNum = serverSitNum;
		this.runMode = const_val.GAME_ROOM_GAME_MODE;
		this.sourcePlayer = player;
		this.gameType = gameRoom.gameType;
	},

	setRunMode: function (mode) {
		this.runMode = mode;
	},

	handleReconnect: function (recRoomInfo) {
	},

	quitRoomSucceed: function () {
		var club_id = this.curGameRoom.club_id;
		this.curGameRoom = null;
		h1global.runScene(new GameHallScene({'from_scene': 'GameHallScene', 'club_id': club_id}));
	},

	othersEnterRoom: function (playerInfo) {
		cc.log("othersEnterRoom");
		cc.log(playerInfo);
		this.curGameRoom.updatePlayerInfo(playerInfo["idx"], playerInfo);
		this.curGameRoom.updatePlayerState(playerInfo["idx"], this.curGameRoom.hand_prepare);
		this.curGameRoom.updateDistanceList();
		if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
			h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(playerInfo["idx"], playerInfo);
			h1global.curUIMgr.gameroomprepare_ui.update_location();
			h1global.curUIMgr.gameroomprepare_ui.update_player_state(playerInfo["idx"], this.curGameRoom.hand_prepare);
		}
	},

	othersQuitRoom: function (serverSitNum) {
		if (this.curGameRoom) {
			this.curGameRoom.playerInfoList[serverSitNum] = null;
			if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
				h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(serverSitNum, this.curGameRoom.playerInfoList[serverSitNum]);
				h1global.curUIMgr.gameroomprepare_ui.update_location();
			}
		}
	},
	voteDismissResult: function (serverSitNum, vote, agree_num) {
		var vote_agree_num = 0;
		var vote_disagree_num = 0;
		for (var i = 0; i < this.curGameRoom.playerInfoList.length; i++) {
			if (this.curGameRoom.applyCloseStateList[i] == 1) {
				vote_agree_num = vote_agree_num + 1;
			} else if (this.curGameRoom.applyCloseStateList[i] == 2) {
				vote_disagree_num = vote_disagree_num + 1;
			}
		}

		if (vote_disagree_num > this.curGameRoom.player_num - agree_num) {
			if (h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
				h1global.curUIMgr.applyclose_ui.hide();
				onhookMgr.applyCloseLeftTime = 0;
				for (var i = 0; i < this.curGameRoom.playerInfoList.length; i++) {
					this.curGameRoom.applyCloseStateList[i] = 0;
				}
			}
		} else {
			if (h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
				h1global.curUIMgr.applyclose_ui.update_vote_state();
			}
		}
	}
});
