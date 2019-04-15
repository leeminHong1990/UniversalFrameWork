"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impRoomOperation = impStatOperation.extend({
	__init__: function () {
		this._super();
		this.curGameRoom = undefined;
		KBEngine.DEBUG_MSG("Create impRoomOperation");
	},

	createRoom: function (roomParams, gameType) {
		cc.log("createRoom:", roomParams, gameType);
		this.baseCall("createRoom", gameType, JSON.stringify(roomParams));
	},

	createRoomSucceed: function (roomInfo) {
		cc.log("createRoomSucceed!");
	},

	createRoomFailed: function (err) {
		cc.log("createRoomFailed!");
		switch (err) {
			case -1:
				h1global.globalUIMgr.info_ui.show_by_info("房卡不足!", cc.size(300, 200));
				break;
			case -2:
				h1global.globalUIMgr.info_ui.show_by_info("您已经在房间中！", cc.size(300, 200));
				break;
			case -3:
				h1global.globalUIMgr.info_ui.show_by_info("代开房间数量达到上限!", cc.size(300, 200));
				break;
			case -4:
				h1global.globalUIMgr.info_ui.show_by_info("访问外部网络结果失败!", cc.size(300, 200));
				break;
			case -5:
				h1global.globalUIMgr.info_ui.show_by_info("不是代理，无法代开房!", cc.size(300, 200));
				break;
			default:
				h1global.globalUIMgr.info_ui.show_by_info("创建房间失败!", cc.size(300, 200));
				break;
		}
	},

	getPlayingRoomInfo: function () {
		this.baseCall("getPlayingRoomInfo");
	},

	getCompleteRoomInfo: function () {
		this.baseCall("getCompleteRoomInfo");
	},

	// s2c
	createAgentRoomSucceed: function (playingRoomList) {
		cutil.unlock_ui();
		var agentRoomUI = h1global.curUIMgr.createagentroom_ui;
		if (agentRoomUI && agentRoomUI.is_show) {
			agentRoomUI.updatePlayingRoom(playingRoomList);
		}
	},

	// s2c
	gotPlayingRoomInfo: function (playingRoomList) {
		var agentRoomUI = h1global.curUIMgr.createagentroom_ui;
		if (agentRoomUI && agentRoomUI.is_show) {
			agentRoomUI.updatePlayingRoom(playingRoomList);
		}
	},

	// s2c
	gotCompleteRoomInfo: function (completeRoomList) {
		var agentRoomUI = h1global.curUIMgr.createagentroom_ui;
		if (agentRoomUI && agentRoomUI.is_show) {
			agentRoomUI.updateCompleteRoom(completeRoomList);
		}
	},

	agentDismissRoom: function (room_id) {
		this.baseCall("agentDismissRoom", room_id)
	},

	server2CurSitNum: function (serverSitNum) {
		return this.gameOperationAdapter.server2CurSitNum(serverSitNum);
	},

	enterRoom: function (roomId) {
		this.baseCall("enterRoom", roomId);
	},

	enterRoomSucceed: function (serverSitNum, roomInfo, gameType) {
		cc.log("enterRoomSucceed!", roomInfo, gameType);
		roomInfo = JSON.parse(roomInfo);
		this.serverSitNum = serverSitNum;
		this.runMode = const_val.GAME_ROOM_GAME_MODE;
		var gameName = const_val.GameType2GameName[gameType];
		this.curGameRoom = eval('new ' + gameName + 'GameRoomEntity(roomInfo["player_num"],gameType)');
		this.curGameRoom.updateRoomData(roomInfo);

		this.curGameRoom.playerStateList = roomInfo["player_state_list"];
		this.gameOperationAdapter = eval('new ' + gameName + 'GameOperationAdapter(this, serverSitNum,this.curGameRoom)');
		this.gameOperationAdapter.setRunMode(this.runMode);
		if (cc.director.getRunningScene().className.endsWith("GameRoomScene")) {
			h1global.runScene(eval("new " + gameName + "GameRoomScene(gameType)"));
			cutil.unlock_ui();
		} else {
			h1global.runScene(eval("new " + gameName + "GameRoomScene(gameType)"));
		}
		cutil.clearEnterRoom();
		actionMgr.reset();
		this.update_player_card();
	},

	enterRoomFailed: function (err) {
		cc.log("enterRoomFailed!");
		if (err === const_val.ENTER_FAILED_ROOM_NO_EXIST || err === const_val.ENTER_FAILED_ROOM_DESTROYED) {
			h1global.globalUIMgr.info_ui.show_by_info("房间不存在！", cc.size(300, 200));
		} else if (err === const_val.ENTER_FAILED_ROOM_FULL) {
			h1global.globalUIMgr.info_ui.show_by_info("房间人数已满！", cc.size(300, 200));
		} else if (err === const_val.ENTER_FAILED_ROOM_DIAMOND_NOT_ENOUGH) {
			h1global.globalUIMgr.info_ui.show_by_info("该房间为AA制付费房间，您的房卡不足！", cc.size(300, 200));
		} else if (err === const_val.ENTER_FAILED_NOT_CLUB_MEMBER) {
			h1global.globalUIMgr.info_ui.show_by_info("您不是该亲友圈成员！", cc.size(300, 200));
		} else if (err === const_val.ENTER_FAILED_ALREADY_IN_ROOM) {
			h1global.globalUIMgr.info_ui.show_by_info("您已经在房间中！", cc.size(300, 200));
		} else if (err === const_val.ENTER_FAILED_CLUB_LOCKED) {
            h1global.globalUIMgr.info_ui.show_by_info("该亲友圈已关闭！", cc.size(300, 200));
        } else if (err === const_val.ENTER_FAILED_ROOM_BLACK) {
			h1global.globalUIMgr.info_ui.show_by_info("您在亲友圈房间黑名单中", cc.size(300, 200));
		}
		if (h1global.curUIMgr && h1global.curUIMgr.joinroom_ui && h1global.curUIMgr.joinroom_ui.is_show) {
			h1global.curUIMgr.joinroom_ui.clear_click_num();
		}
		cutil.clearEnterRoom();
	},

	quitRoom: function () {
		if (!this.curGameRoom) {
			return;
		}
		this.cellCall("quitRoom");
	},

	quitRoomSucceed: function () {
		if (onhookMgr) {
			onhookMgr.setApplyCloseLeftTime(null);
			onhookMgr.setWaitLeftTime(null);
		}
		// 在不应该为空的情况下空了，这里判断下
		if (this.gameOperationAdapter && this.gameOperationAdapter.quitRoomSucceed) {
			this.gameOperationAdapter.quitRoomSucceed();
		}
		this.gameOperationAdapter = null;
		this.curGameRoom = null;
	},

	quitRoomFailed: function (err) {
		cc.log("quitRoomFailed!");
	},

	othersQuitRoom: function (serverSitNum) {
		if (this.gameOperationAdapter.othersQuitRoom) {
			this.gameOperationAdapter.othersQuitRoom(serverSitNum);
		}
	},

	othersEnterRoom: function (playerInfo) {
		cc.log("othersEnterRoom");
		cc.log(playerInfo);
		// Note: 由于服务端返回值为 0 和 1 ，客户端用到的值为布尔值 这里做一次转换
		playerInfo.is_creator = playerInfo.is_creator === 1;
		if (this.gameOperationAdapter.othersEnterRoom) {
			this.gameOperationAdapter.othersEnterRoom(playerInfo);
		}
	},

	upLocationInfo: function () {
		cc.log("upLocationInfo");
		var location = cutil.get_location_geo() || "";
		var lat = cutil.get_location_lat() || "";
		var lng = cutil.get_location_lng() || "";
		this.baseCall("upLocationInfo", location, lat, lng);
	},

	update_player_card: function(){
		cc.log("update_player_card");
		if(h1global.player()){
			h1global.player().client_update_card_diamond();
		}
	},

	handleReconnect: function (recRoomInfo) {
		cc.log("handleReconnect");
		recRoomInfo = JSON.parse(recRoomInfo);
		this.upLocationInfo();
		this.runMode = const_val.GAME_ROOM_GAME_MODE;
		var player_base_info_list = recRoomInfo["init_info"]["player_base_info_list"];
		for (var i = 0; i < player_base_info_list.length; i++) {
			if (player_base_info_list[i]["userId"] === this.userId) {
				this.serverSitNum = i;
				break;
			}
		}
		var gameType = recRoomInfo['gameType'];
		var gameName = const_val.GameType2GameName[gameType];
		this.curGameRoom = eval('new ' + gameName + 'GameRoomEntity(recRoomInfo["init_info"]["player_num"], gameType)');

		this.gameOperationAdapter = eval('new ' + gameName + 'GameOperationAdapter(this, this.serverSitNum,this.curGameRoom)');
		this.curGameRoom.reconnectRoomData(recRoomInfo);

		this.gameOperationAdapter.setRunMode(this.runMode);
		this.gameOperationAdapter.handleReconnect(recRoomInfo);
		this.update_player_card();
	},

	applyDismissRoom: function (agree_num, seconds) {
		if (this.curGameRoom) {
			this.cellCall("applyDismissRoom", agree_num, seconds);
			this.curGameRoom.applyCloseLeftTime = seconds + 1; // 本地操作先于服务端，所以增加1s防止网络延迟
			this.curGameRoom.applyCloseFrom = this.serverSitNum;
			this.curGameRoom.applyCloseStateList[this.serverSitNum] = 1;
			h1global.curUIMgr.applyclose_ui.show_by_sitnum(this.serverSitNum);
			onhookMgr.setApplyCloseLeftTime(seconds + 1); // 本地操作先于服务端，所以增加1s防止网络延迟
		}
	},

	reqDismissRoom: function (serverSitNum, agree_num, seconds) {
		if (this.curGameRoom) {
			this.curGameRoom.applyCloseLeftTime = seconds;
			this.curGameRoom.applyCloseFrom = serverSitNum;
			this.curGameRoom.applyCloseStateList = new Array(this.curGameRoom.player_num).fill(0);
			this.curGameRoom.applyCloseStateList[serverSitNum] = 1;
			if (h1global.curUIMgr && h1global.curUIMgr.applyclose_ui) {
				h1global.curUIMgr.applyclose_ui.show_by_sitnum(serverSitNum);
			}
			onhookMgr.setApplyCloseLeftTime(seconds);
		}
	},

	voteDismissRoom: function (vote) {
		// cc.log("voteDismissRoom")
		this.cellCall("voteDismissRoom", vote);
	},

	voteDismissResult: function (serverSitNum, vote, agree_num) {
		// cc.log("voteDismissResult")
		if (!this.curGameRoom) {
			return;
		}
		this.curGameRoom.applyCloseStateList[serverSitNum] = vote;
		this.gameOperationAdapter.voteDismissResult(serverSitNum, vote, agree_num);
	},

	inviteClubMemberRoom: function (userId_list){
		this.baseCall("inviteClubMemberRoom", userId_list);
	},

	invitedClubMemberRoom:function (invite_msg) {
		cc.log("invitedClubMemberRoom", invite_msg);
		if(!h1global.curUIMgr){return;} 
        if(h1global.curUIMgr.invite_ui){
            h1global.curUIMgr.invite_ui.show_by_info(invite_msg);
        }
    },

	getPageGameHistory:function (page, size, filter, order) {
		this.baseCall("getPageGameHistory", page, size, filter, order);
	},

	pushPageGameRecordList:function (game_history, page, size, game_history_length) {
		cc.log("pushPageGameRecordList", game_history, page, size, game_history_length);
		if(!h1global.curUIMgr){return;}
		cutil.unlock_ui();
		if (h1global.curUIMgr.record_ui && h1global.curUIMgr.record_ui.is_show) {
			h1global.curUIMgr.record_ui.update_game_history(game_history, page, size, game_history_length);
		}
	}
});
