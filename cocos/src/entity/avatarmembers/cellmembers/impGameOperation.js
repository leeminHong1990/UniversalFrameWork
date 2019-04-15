"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impGameOperation = impCommunicate.extend({
	__init__: function () {
		this._super();
		this.runMode = const_val.GAME_ROOM_GAME_MODE;
		this.startActions = {};
		this.gameOperationAdapter = null;
		KBEngine.DEBUG_MSG("Create impRoomOperation");
	},

	startGame: function (startInfo) {
		if (!this.curGameRoom) {
			return;
		}
		startInfo = JSON.parse(startInfo);
		this.curGameRoom.curRound = startInfo['curRound'];
		this.runMode = const_val.GAME_ROOM_GAME_MODE;
		this.gameOperationAdapter.setRunMode(this.runMode);
		this.gameOperationAdapter.startGame(startInfo);
	},

	readyForNextRound: function (serverSitNum) {
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.readyForNextRound(serverSitNum);
	},

	postMultiOperation: function (idx_list, aid_list, tile_list) {
		// 用于特殊处理多个人同时胡牌的情况
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			for (var i = 0; i < idx_list.length; i++) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", const_val.OP_KONG_WIN, idx_list[i]);
			}
		}
		// if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
		// 	cutil.playEffect(this.gameOperationAdapter.gameType, "male/sound_man_win.mp3");
		// } else {
		// 	cutil.playEffect(this.gameOperationAdapter.gameType, "female/sound_woman_win.mp3");
		// }
	},

	postOperation: function (serverSitNum, aid, tileList) {
		cc.log("postOperation: ", serverSitNum, aid, tileList);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList);
	},

	selfPostOperation: function (aid, tiles) {
		// 由于自己打的牌自己不需要经服务器广播给自己，因而只要在doOperation时，自己postOperation给自己
		// 而doOperation和postOperation的参数不同，这里讲doOperation的参数改为postOperation的参数
		this.gameOperationAdapter.selfPostOperation(aid, tiles);
	},

	doOperation: function () {
		cc.log("doOperation: ", arguments);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.doOperation.apply(this.gameOperationAdapter, arguments);
	},

	doOperationFailed: function (err) {
		cc.log("doOperationFailed: " + err.toString());
		if (this.gameOperationAdapter.doOperationFailed) {
			this.gameOperationAdapter.doOperationFailed(err);
		}
	},

	confirmOperation: function (aid, tileList) {
		cc.log("confirmOperation: ", aid, tileList);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.confirmOperation(aid, tileList);
	},

	showWaitOperationTime: function () {
		if (onhookMgr && this.curGameRoom.discard_seconds > 0) {
			cc.log('showWaitOperationTime setWaitLeftTime=== > ', this.curGameRoom.discard_seconds);
			onhookMgr.setWaitLeftTime(this.curGameRoom.discard_seconds)
		} else if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
			onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
		}
	},

	waitForOperation: function (aid_list, tileList) {
		cc.log("waitForOperation", aid_list, tileList);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.waitForOperation(aid_list, tileList);
	},


	roundResult: function () {
		cc.log("roundResult", arguments);
		if (!this.curGameRoom) {
			return;
		}
		this.curGameRoom.endGame();
		if (onhookMgr) {
			onhookMgr.setWaitLeftTime(null);
		}
		if (arguments.length > 0) {
			let roundRoomInfo = JSON.parse(arguments[0]);
			var args = arguments;
			Array.prototype.splice.call(args, 0, 1, roundRoomInfo);
			this.gameOperationAdapter.roundResult.apply(this.gameOperationAdapter, args);
		} else {
			this.gameOperationAdapter.roundResult();
		}
	},

	finalResult: function (finalPlayerInfoList, roundRoomInfo) {
		if (h1global.curUIMgr && h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
			h1global.curUIMgr.applyclose_ui.hide();
		}
		if (!this.curGameRoom) {
			return;
		}
		cc.log("finalResult", finalPlayerInfoList, roundRoomInfo);
		finalPlayerInfoList = JSON.parse(finalPlayerInfoList);
		roundRoomInfo = JSON.parse(roundRoomInfo);
		this.gameOperationAdapter.finalResult(finalPlayerInfoList, roundRoomInfo);
	},

	subtotalResult: function (finalPlayerInfoList) {
		if (!this.curGameRoom) {
			return;
		}
		finalPlayerInfoList = JSON.parse(finalPlayerInfoList);
		this.gameOperationAdapter.subtotalResult(finalPlayerInfoList);
	},

	prepare: function () {
		if (!this.curGameRoom) {
			return;
		}
		this.readyForNextRound(this.serverSitNum);
		this.cellCall("prepare");
	},

	notifyPlayerOnlineStatus: function (serverSitNum, status) {
		if (!this.curGameRoom) {
			return;
		}
		this.curGameRoom.updatePlayerOnlineState(serverSitNum, status);
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_online_state", serverSitNum, status);
		}
	},

	postWinOperation: function (serverSitNum, op, result) {
		cc.log("postWinOperation===>", serverSitNum, op, result);
		if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
			cc.Device.vibrate(0.5);
		}
		if (this.gameOperationAdapter.postWinOperation) {
			this.gameOperationAdapter.postWinOperation(serverSitNum, op, result);
		} else {
			cc.warn("postWinOperation undefine");
		}
	},


	/********************************************gxmj*********************************************************/
	setDiscardState: function (state, tile) {
		this.curGameRoom.discardStateList[this.serverSitNum] = state
		this.cellCall("setDiscardState", state, tile)
	},

	postPlayerDiscardState: function (idx, state) {
		cc.log("postPlayerDiscardState", idx, state);
		if (this.gameOperationAdapter.postPlayerDiscardState) {
			this.gameOperationAdapter.postPlayerDiscardState(idx, state);
		} else {
			cc.warn("postPlayerDiscardState undefine");
		}
	},
	/*****************************************************************************************************/

	/********************************************ddz*********************************************************/

	ddzPostOperation: function (serverSitNum, aid, data, nextServerSitNum) {
		cc.log("ddz postOperation: ", serverSitNum, aid, data, nextServerSitNum);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, data, nextServerSitNum);
	},

	redeal: function (currentIdx, tileList, hostCards) {
		cc.log("redeal", currentIdx, tileList, hostCards);
		if (!this.curGameRoom) {
			return;
		}
		if (this.gameOperationAdapter.redeal) {
			this.gameOperationAdapter.redeal(currentIdx, tileList, hostCards)
		} else {
			cc.warn("redeal undefine");
		}
	},

	/********************************************************************************************************/


	/********************************************tylsmj*********************************************************/
	postOperationTYLSMJ: function(serverSitNum, aid, tileList, buckle, standTileList){
		cc.log("tylsmj postOperation: ", serverSitNum, aid, tileList, buckle, standTileList);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList, buckle, standTileList);
	},
	/********************************************************************************************************/

	/**************************************************tykddmj******************************************************/
    postOperationTYKDDMJ: function(serverSitNum, aid, tileList, buckle){

        cc.log("tykddmj postOperation: ", serverSitNum, aid, tileList, buckle);
        if (!this.curGameRoom) {
            return;
        }
        this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList, buckle);
    },
	/********************************************************************************************************/

	/**************************************************tdhmj******************************************************/
	postOperationTDHMJ: function(serverSitNum, aid, tileList, buckle){

		cc.log("tykddmj postOperation: ", serverSitNum, aid, tileList, buckle);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList, buckle);
	},
	/********************************************************************************************************/

	/********************************************jzmj*********************************************************/
	postOperationJZMJ: function(serverSitNum, aid, tileList, buckle, standTileList){
		cc.log("jzmj postOperation: ", serverSitNum, aid, tileList, buckle, standTileList);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList, buckle, standTileList);
	},
	postWinCanSelectJZMJ: function(serverSitNum, canWinCanSelect, canWinTileList){
		cc.log("jzmj postWinCanSelect: ", serverSitNum, canWinCanSelect, canWinTileList);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postWinCanSelect(serverSitNum, canWinCanSelect, canWinTileList);
	},
	setPassWinStateJZMJ: function (state, tile) {
		cc.log("jzmj setPassWinState: ", state, tile);
		if (!this.curGameRoom) {
			return;
		}
		this.cellCall("setPassWinStateJZMJ", state, tile)
	},
	/********************************************************************************************************/

    /**********************************************dtlgfmj**********************************************************/

    hintDTLGFMJ:function (hintKingNum){
        if (!this.curGameRoom) {
            return;
        }
        this.cellCall("hintDTLGFMJ", hintKingNum)
    },

    postHintOperationDTLGFMJ:function (idx, handTiles, hintTiles) {
        if (!this.curGameRoom) {
            return;
        }
        this.gameOperationAdapter.postHintOperation(idx, handTiles, hintTiles);
    },

    postAddHintDTLGFMJ:function (idx, tiles) {
        if (!this.curGameRoom) {
            return;
        }
        this.gameOperationAdapter.postAddHint(idx, tiles);
    },
	/********************************************************************************************************/

	/**************************************************llkddmj******************************************************/
	postOperationLLKDDMJ: function(serverSitNum, aid, tileList, buckle){

		cc.log("tykddmj postOperation: ", serverSitNum, aid, tileList, buckle);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList, buckle);
	},
	/********************************************************************************************************/

	/**************************************************ll7******************************************************/

	ll7PostOperation:function (serverSitNum, aid, pokers, next_idx) {
		cc.log("ll7 postOperation: ", serverSitNum, aid, pokers, next_idx);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, pokers, next_idx);
	},

	ll7WaitForOperation: function (serverSitNum, aid) {
		cc.log("ll7 waitForOperation: ", serverSitNum, aid);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.waitForOperation(serverSitNum, aid);
	},

	secondDeal: function (pokers) {
		cc.log("ll7 secondDeal: ", pokers);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.secondDeal(pokers);
	},

	/********************************************************************************************************/

	/**************************************************lsbmzmj******************************************************/
	postOperationLSBMZMJ: function(serverSitNum, aid, tileList, buckle){

		cc.log("lsbmzmj postOperation: ", serverSitNum, aid, tileList, buckle);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList, buckle);
	},
	/********************************************************************************************************/

	/********************************************lsblmj*********************************************************/
	postOperationLSBLMJ: function(serverSitNum, aid, tileList, buckle, standTileList){
		cc.log("lsblmj postOperation: ", serverSitNum, aid, tileList, buckle, standTileList);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList, buckle, standTileList);
	},
	postWinCanSelectLSBLMJ: function(serverSitNum, canWinCanSelect, canWinTileList){
		cc.log("lsblmj postWinCanSelect: ", serverSitNum, canWinCanSelect, canWinTileList);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postWinCanSelect(serverSitNum, canWinCanSelect, canWinTileList);
	},
	setPassWinStateLSBLMJ: function (state, tile) {
		cc.log("lsblmj setPassWinState: ", state, tile);
		if (!this.curGameRoom) {
			return;
		}
		this.cellCall("setPassWinStateLSBLMJ", state, tile)
	},
	/********************************************************************************************************/

	/**************************************************fyqymmj******************************************************/
	postOperationFYQYMMJ: function(serverSitNum, aid, tileList, buckle){

		cc.log("fyqymmj postOperation: ", serverSitNum, aid, tileList, buckle);
		if (!this.curGameRoom) {
			return;
		}
		this.gameOperationAdapter.postOperation(serverSitNum, aid, tileList, buckle);
	},
	// setPassWinStateFYQYMMJ: function (state, tile) {
	// 	cc.log("fyqymmj setPassWinState: ", state, tile);
	// 	if (!this.curGameRoom) {
	// 		return;
	// 	}
	// 	this.cellCall("setPassWinState", state, tile)
	// },
	/********************************************************************************************************/


});
