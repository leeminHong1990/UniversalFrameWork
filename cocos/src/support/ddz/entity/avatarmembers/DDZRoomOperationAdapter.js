"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var DDZRoomOperationAdapter = GameOperationAdapter.extend({

	server2CurSitNum: function (serverSitNum) {
		if (this.curGameRoom) {
			return (serverSitNum - this.serverSitNum + this.curGameRoom.player_num) % this.curGameRoom.player_num;
		} else {
			return -1;
		}
	},


	quitRoomSucceed: function () {
		let canContinue = false;
		let isRoomController = false;
		if (this.curGameRoom && this.curGameRoom.curRound === 0) {
			isRoomController = this.curGameRoom.playerInfoList[this.serverSitNum]['is_creator'];
			canContinue = this.curGameRoom.canContinue === true;
		}
		let fromData = null;
		if (this.club_id) {
			fromData = {'from_scene': 'GameHallScene', 'club_id': this.club_id};
			this.club_id = null;
		} else if (this.curGameRoom) {
			fromData = {'from_scene': 'GameHallScene', 'club_id': this.curGameRoom.club_id};
		}
		this.curGameRoom = null;
		if (canContinue) {
			if (h1global.curUIMgr && h1global.curUIMgr.result_ui && h1global.curUIMgr.result_ui.is_show) {
				if (isRoomController !== true) {
					h1global.curUIMgr.result_ui.update_when_creator_quit();
				}
			} else {
				h1global.runScene(new GameHallScene(fromData));
			}
		} else {
			h1global.runScene(new GameHallScene(fromData));
		}
	},


	othersQuitRoom: function (serverSitNum) {
		if (this.curGameRoom) {
			this.curGameRoom.playerInfoList[serverSitNum] = null;
			if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
				h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(serverSitNum, this.curGameRoom.playerInfoList[serverSitNum]);
				h1global.curUIMgr.gameroomprepare_ui.update_location();
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", serverSitNum, null);
			}
		}
	},

	othersEnterRoom: function (playerInfo) {
		this.curGameRoom.updatePlayerInfo(playerInfo["idx"], playerInfo);
		this.curGameRoom.updatePlayerState(playerInfo["idx"], this.curGameRoom.hand_prepare);
		if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
			h1global.curUIMgr.gameroomprepare_ui.update_player_info_panel(playerInfo["idx"], playerInfo);
			h1global.curUIMgr.gameroomprepare_ui.update_location();
			h1global.curUIMgr.gameroomprepare_ui.update_player_state(playerInfo["idx"], this.curGameRoom.hand_prepare);
		}

		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", playerInfo['idx'], playerInfo);
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_ready_state", playerInfo['idx'], this.curGameRoom.hand_prepare);
		}

		this.curGameRoom.updateDistanceList();
	},

	handleReconnect: function (recRoomInfo) {
		this.curGameRoom.handTilesList[this.serverSitNum].sort(ddz_rules.poker_compare2);
		var gameName = const_val.GameType2GameName[this.gameType];
		h1global.runScene(eval("new " + gameName + "GameRoomScene(this.gameType)"));
	},

});
