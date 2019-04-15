var TYKDDMJPlaybackGameRoomSceneUIManager = UIManagerBase.extend({

	ctor: function (gameType) {
		this.gameType = gameType;
		this._super();
	},

	onCreate: function () {
		var game_room_ui_type = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", this.gameType));
		var game_room_bg_type = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_BG", this.gameType));
		var initUIClassNameList = ["GameRoomInfoUI", "GamePlayerInfoUI", "HelpUI", "PlaybackControlUI", "PlayBackUI"];

		for (var uiClassName of initUIClassNameList) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], uiClassName);
		}

		var ui_dict = table_config[this.gameType];
		if (game_room_ui_type == const_val.GAME_ROOM_2D_UI) {
			this.add_ui("gameroom2d_ui", [], ui_dict["REPLAY_UI"]['PlaybackGameRoom2DUI']);
			this.roomLayoutMgr = new MultipleRoomLayout(this, [this.gameroom2d_ui], this.gameType);
		} else {
			this.add_ui("gameroom3d_ui", [], ui_dict["REPLAY_UI"]['PlaybackGameRoom3DUI']);
			this.roomLayoutMgr = new MultipleRoomLayout(this, [this.gameroom3d_ui], this.gameType);
		}

		for (var uiClassName in ui_dict["SETTLEMENT_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["SETTLEMENT_UI"][uiClassName]);
		}
		for (var uiClassName in ui_dict["RESULT_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["RESULT_UI"][uiClassName]);
		}
		var bgInfo = {};
		var descInfo = {};
		bgInfo[const_val.GAME_ROOM_2D_UI] = table_config[this.gameType]["BG_INFO_2D"];
		bgInfo[const_val.GAME_ROOM_3D_UI] = table_config[this.gameType]["BG_INFO_3D"];
		descInfo[const_val.GAME_ROOM_2D_UI] = table_config[this.gameType]["BG_DESC_INFO_2D"];
		descInfo[const_val.GAME_ROOM_3D_UI] = table_config[this.gameType]["BG_DESC_INFO_3D"];
		this.backgroundStrategy = new MJBackgroundStrategy(this, bgInfo, descInfo);
		this.backgroundStrategy.updateBackground(game_room_ui_type, game_room_bg_type);

		this.roomLayoutMgr.setBackgroundStrategy(this.backgroundStrategy)
	},

});