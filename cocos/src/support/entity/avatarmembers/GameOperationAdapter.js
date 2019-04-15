"use strict";
var GameOperationAdapter = RoomOperationAdapter.extend({

	startGame: function (startInfo) {

	},

	readyForNextRound: function (serverSitNum) {
		this.curGameRoom.updatePlayerState(serverSitNum, 1);
		if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show) {
			h1global.curUIMgr.gameroomprepare_ui.update_player_state(serverSitNum, 1);
		}
	},

	roundResult: function (roundRoomInfo) {
		var playerInfoList = roundRoomInfo["player_info_list"];
		for (var i = 0; i < playerInfoList.length; i++) {
			this.curGameRoom.playerInfoList[i]["score"] = playerInfoList[i]["score"];
			this.curGameRoom.playerInfoList[i]["total_score"] = playerInfoList[i]["total_score"];
		}
		var self = this;

		// Note: 此处只在回放上
		var replay_func = undefined;
		if (self.runMode === const_val.GAME_ROOM_PLAYBACK_MODE) {
			replay_func = arguments[1];
		}

		var curGameRoom = this.curGameRoom;
		var serverSitNum = this.serverSitNum;

		function callbackfunc(complete) {
			if (complete && h1global.curUIMgr.settlement_ui) {
				h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom, undefined, replay_func);
			}
		}

		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			if (h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_result_anim", playerInfoList);
				h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_luckytiles_anim", callbackfunc, roundRoomInfo["lucky_tiles"]);
			} else {
				h1global.curUIMgr.roomLayoutMgr.registerShowObserver(function () {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_result_anim", playerInfoList);
					h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_luckytiles_anim", callbackfunc, roundRoomInfo["lucky_tiles"]);
				})
			}
		} else {
			callbackfunc(true);
		}
	},
	finalResult: function (finalPlayerInfoList, roundRoomInfo) {
		if (onhookMgr) {
			onhookMgr.setApplyCloseLeftTime(null);
		}
		// Note: 为了断线重连后继续停留在总结算上，此处设置一个标志位作为判断
		if (h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.finalResultFlag = true;
		}

		var curGameRoom = this.curGameRoom;
		var serverSitNum = this.serverSitNum;

		function callbackfunc(complete) {
			if (complete && h1global.curUIMgr.settlement_ui) {
				if (h1global.curUIMgr && h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
					h1global.curUIMgr.applyclose_ui.hide();
				}
				h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom, function () {
					if (h1global.curUIMgr.result_ui) {
						h1global.curUIMgr.result_ui.show_by_info(finalPlayerInfoList, curGameRoom);
					}
				});
			}
		}

		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			if (h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_result_anim", roundRoomInfo["player_info_list"]);
				h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_luckytiles_anim", callbackfunc, roundRoomInfo["lucky_tiles"]);
			} else {
				h1global.curUIMgr.roomLayoutMgr.registerShowObserver(function () {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_result_anim", roundRoomInfo["player_info_list"]);
					h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_luckytiles_anim", callbackfunc, roundRoomInfo["lucky_tiles"]);
				})
			}
		} else {
			callbackfunc(true);
		}
	},

	subtotalResult: function (finalPlayerInfoList) {
		if (onhookMgr) {
			onhookMgr.setApplyCloseLeftTime(null);
		}
		if (h1global.curUIMgr && h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
			h1global.curUIMgr.applyclose_ui.hide()
		}
		if (h1global.curUIMgr && h1global.curUIMgr.settlement_ui && h1global.curUIMgr.settlement_ui.is_show) {
			h1global.curUIMgr.settlement_ui.hide()
		}
		// Note: 为了断线重连后继续停留在总结算上，此处设置一个标志位作为判断
		if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.finalResultFlag = true;
		}
		if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.show_by_info(finalPlayerInfoList, this.curGameRoom);
		}
	},

	doOperation: function () {
		cc.warn("doOperation not imp")
	},

	confirmOperation: function (aid, tileList) {
		this.curGameRoom.waitAidList = [];
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
		}
		// 自己的操作直接本地执行，不需要广播给自己
		// this.selfPostOperation(aid, tileList);
		this.sourcePlayer.cellCall("confirmOperation", aid, tileList);
	}
});
