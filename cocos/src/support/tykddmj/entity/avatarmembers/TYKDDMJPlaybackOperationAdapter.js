"use strict";
var TYKDDMJPlaybackOperationAdapter = TYKDDMJGameRules.extend({

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
		this.diceList = roomInfo['dice_list'] ? cutil.deepCopy(roomInfo['dice_list']) : undefined;
		this.curGameRoom.startGame(roomInfo['kingTiles'] ? cutil.deepCopy(roomInfo['kingTiles']) : undefined, roomInfo['wreathsList'] ? cutil.deepCopy(roomInfo['wreathsList']) : undefined);
		let dealerIdx = initRoomInfo['dealerIdx'];
		this.curGameRoom.curPlayerSitNum = dealerIdx;
		this.curGameRoom.dealerIdx = dealerIdx;
		this.curGameRoom.prevailing_wind = roomInfo['prevailing_wind'];
		this.curGameRoom.playerWindList = roomInfo['playerWindList'] ? cutil.deepCopy(roomInfo['playerWindList']) : undefined;
		this.curGameRoom.op_record_list = JSON.parse(roomInfo['op_record_list']);

		var init_tiles = roomInfo['init_tiles'] ? cutil.deepCopy(roomInfo['init_tiles']) : undefined;
		this.curGameRoom.handTilesList = [];
		for (var i = 0; i < init_tiles.length; i++) {
			this.curGameRoom.handTilesList[i] = init_tiles[i];
			if (i == dealerIdx) {
				this.curGameRoom.handTilesList[i].pop();
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
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide");
			h1global.curUIMgr.roomLayoutMgr.showGameRoomUI(function (complete) {
				if (complete) {
					// h1global.curUIMgr.roomLayoutMgr.notifyObserver( "startBeginAnim",self.startTilesList, diceList, dealerIdx);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_kingtile_panel");
					callback && callback();
				}
			});
		}
	},

	selfWaitForOperation: function (serverSitNum, op_dict, doAid) {
		cc.log("selfWaitForOperation", op_dict, doAid);
		if (!this.curGameRoom) return;
		if (h1global.curUIMgr.roomLayoutMgr) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_playback_operation_panel",
				serverSitNum, op_dict, doAid, const_val.SHOW_CONFIRM_OP);
		}
	},

	waitForOperationFromNext: function (serverSitNum, aid, tileList) {
		if (!this.curGameRoom) return;
		this.curGameRoom.waitAidList = [aid];
		if (h1global.curUIMgr.roomLayoutMgr) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_playback_operation_panel",
				serverSitNum, this.getWaitOpDict([aid], tileList, serverSitNum), aid, const_val.SHOW_CONFIRM_OP);
		}
	},

	//由于服务端不能判断摸到牌时的操作，所以摸牌时显示操作面板使用本地判断
	nextOp: function () {
		let command = this.curGameRoom.lastCommand;
		if (command) return command.aid;
		return undefined;
	}


});