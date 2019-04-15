"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var LL7PlaybackOperationAdapter = LL7GameRules.extend({

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
		this.curGameRoom.curPlayerSitNum = roomInfo["lord_idx"];
		this.curGameRoom.mainServerSitNum = roomInfo["lord_idx"];
		this.curGameRoom.coverPokers = roomInfo["end_cover_pokers"];
		this.curGameRoom.mainPokers = roomInfo["lord_pokers"];

		this.curGameRoom.op_record_list = JSON.parse(roomInfo['op_record_list']);
		var init_tiles = roomInfo['init_pokers'] ? cutil.deepCopy(roomInfo['init_pokers']) : undefined;
		this.curGameRoom.handTilesList = [];
		for (var i = 0; i < init_tiles.length; i++) {
			if (i === this.curGameRoom.mainServerSitNum) {
				var tiles = init_tiles[i].concat(roomInfo["begin_cover_pokers"]);
				collections.removeArray(tiles, this.curGameRoom.coverPokers, true);
				this.curGameRoom.handTilesList[i] = cutil_ll7.sort(tiles, this.curGameRoom.mainPokers[0]);
			} else {
				this.curGameRoom.handTilesList[i] = cutil_ll7.sort(init_tiles[i], this.curGameRoom.mainPokers[0]);
			}
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
			h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide");
			h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
				if (complete && callback) {
					callback();
				}
			});
		}
	}

});
