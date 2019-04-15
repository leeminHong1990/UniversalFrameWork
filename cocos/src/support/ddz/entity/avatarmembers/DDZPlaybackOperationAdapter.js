"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var DDZPlaybackOperationAdapter = DDZGameRules.extend({

	_preprocessPlaybackData: function (data) {
		let init_info = data['init_info'];
		for (var i = 0; i < init_info["player_base_info_list"].length; i++) {
			// Note: 回放时认为玩家全都是在线的
			init_info["player_base_info_list"][i].online = 1
		}
		return data;
	},

	preprocessGameRoom: function (roomInfo) {
		if (this.runMode !== const_val.GAME_ROOM_PLAYBACK_MODE) {
			cc.warn("不是回放模式不允许调用", this.runMode);
			return;
		}
		this._preprocessPlaybackData(roomInfo);
		let initRoomInfo = roomInfo['init_info'];
		this.curGameRoom.updateRoomData(initRoomInfo);
		this.curGameRoom.playerStateList = roomInfo["player_state_list"];
		this.curGameRoom.startGame();
		let dealerIdx = initRoomInfo['dealerIdx'];
		this.curGameRoom.curPlayerSitNum = dealerIdx;
		this.curGameRoom.dealerIdx = dealerIdx;
		this.curGameRoom.hostCards = roomInfo["host_cards"];
		this.curGameRoom.mul_score_list = roomInfo["mul_score_list"];
		this.curGameRoom.op_record_list = JSON.parse(roomInfo['op_record_list']);
		var init_tiles = roomInfo['init_tiles'] ? cutil.deepCopy(roomInfo['init_tiles']) : undefined;
		this.curGameRoom.handTilesList = [];
		this.curGameRoom.fight_dealer_mul_list = roomInfo["fight_dealer_mul_list"].slice(0);
		this.curGameRoom.bet_score_list = roomInfo["bet_score_list"].slice(0);
		for (var i = 0; i < init_tiles.length; i++) {
			this.curGameRoom.handTilesList[i] = init_tiles[i].sort(ddz_rules.poker_compare2);
		}
		this.curGameRoom['round_result'] = roomInfo['round_result'];
	},


	setGameRoom: function (gameRoom) {
		if (this.runMode !== const_val.GAME_ROOM_PLAYBACK_MODE) {
			cc.warn("不是回放模式不允许调用", this.runMode);
			return;
		}
		this.curGameRoom = gameRoom;
	},

	onReplay: function (callback) {
		if (h1global.curUIMgr.roomLayoutMgr) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide");
			h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
				if (complete && callback) {
					callback();
				}
			});
		}
	}

});
