var DDZPlaybackGameRoomSceneUIManager = UIManagerBase.extend({

	ctor: function (gameType) {
		this.gameType = gameType;
		this._super();
	},

	onCreate: function () {
		var initUIClassNameList = ["GamePlayerInfoUI", "HelpUI", "PlaybackControlUI", "DDZPlayBackUI"];

		for (var uiClassName of initUIClassNameList) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], uiClassName);
		}

		var ui_dict = table_config[this.gameType];
		this.add_ui("gameroom2d_ui", [], ui_dict["REPLAY_UI"]['PlaybackGameRoom2DUI']);
		this.roomLayoutMgr = new MultipleRoomLayout(this, [this.gameroom2d_ui], this.gameType);

		for (var uiClassName in ui_dict["PREPARE_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["PREPARE_UI"][uiClassName]);
		}
		for (var uiClassName in ui_dict["SETTLEMENT_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["SETTLEMENT_UI"][uiClassName]);
		}
		for (var uiClassName in ui_dict["RESULT_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["RESULT_UI"][uiClassName]);
		}
		for (var uiClassName in ui_dict["ROOM_INFO_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["ROOM_INFO_UI"][uiClassName]);
		}
		this.playback_ui = this.ddzplayback_ui;
		this.ddzplayback_ui = null;
		this.backgroundStrategy = new DDZBackgroundStrategy(this, table_config[this.gameType]["BG_INFO"]);
		this.backgroundStrategy.updateBackground();

		this.roomLayoutMgr.setBackgroundStrategy(this.backgroundStrategy)
	},

});