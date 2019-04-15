"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impPlaybackOperation = impGameOperation.extend({
	__init__: function () {
		this._super();
	},

	_findServerSitNum: function (id_list) {
		let uid = this.userId;
		for (var i = 0; i < id_list.length; i++) {
			if (id_list[i] == uid) {
				return i;
			}
		}
		return 0;
	},

	reqPlayback: function (recordId) {
		let data = cc.sys.localStorage.getItem('record_' + recordId);
		if (data && cc.isString(data) && data.length > 0 && false) {
			let info = JSON.parse(data);
			if (parseInt(info['recordId']) == recordId) {
				this.playbackGame(info, data['game_type']);
				return;
			}
		}
		this.baseCall('queryRecord', recordId);
		cutil.lock_ui();
	},

	queryRecordResult: function (json_str, game_type) {
		let scene = cc.director.getRunningScene();
		if (scene.className.endsWith('GameRoomScene')) {
			return;
		}
		let info = JSON.parse(json_str);
		cc.sys.localStorage.setItem('record_' + info['recordId'], json_str);
		cutil.unlock_ui();
		this.playbackGame(info, game_type);
	},

	queryRecordFailed: function (code, game_type) {
		cc.log('queryRecordFailed', code, game_type);
		let scene = cc.director.getRunningScene();
		if (scene.className.endsWith('GameRoomScene')) {
			return;
		}
		cutil.unlock_ui();
		h1global.globalUIMgr.info_ui.show_by_info("回放码错误！");
	},

	playbackGame: function (roomInfo, gameType) {
		cc.log("playbackGame", roomInfo);
		this.runMode = const_val.GAME_ROOM_PLAYBACK_MODE;
		this.originRoomInfo = roomInfo;

		this.serverSitNum = this._findServerSitNum(roomInfo['player_id_list']);
		var gameName = const_val.GameType2GameName[gameType];
		var flag = true;
		for (var k in table_create_params){
			if(table_create_params[k]["is_show"]){
				if (table_create_params[k]["name"] == gameName.toLowerCase()) {
					flag = false;
					break;
				}
			}
		}
		if (flag) {
			h1global.globalUIMgr.info_ui.show_by_info("回放码错误！");
			return;
		}

		var initRoomInfo = roomInfo['init_info']; // eval 里有用  不要删掉
		this.curGameRoom = eval('new ' + gameName + 'GameRoomEntity(initRoomInfo["player_num"],gameType)');
		this.gameOperationAdapter = eval('new ' + gameName + 'GameOperationAdapter(this, this.serverSitNum,this.curGameRoom)');
		this.gameOperationAdapter.setRunMode(this.runMode);
		this.gameOperationAdapter.preprocessGameRoom(roomInfo);
		h1global.runScene(eval("new " + gameName + "PlaybackGameRoomScene(gameType)"));
	},

	replayGame: function (callback) {
		if (!this.originRoomInfo) {
			cc.error("replay game: room info undefined");
			return;
		}
		cc.log("replay game");
		var initRoomInfo = this.originRoomInfo['init_info']; // eval 里有用  不要删掉
		var gameType = this.originRoomInfo['game_type'];
		var gameName = const_val.GameType2GameName[gameType];
		this.curGameRoom = eval('new ' + gameName + 'GameRoomEntity(initRoomInfo["player_num"],gameType)');
		this.gameOperationAdapter.setGameRoom(this.curGameRoom);
		this.gameOperationAdapter.preprocessGameRoom(this.originRoomInfo);
		this.gameOperationAdapter.onReplay(callback);
	},

});
