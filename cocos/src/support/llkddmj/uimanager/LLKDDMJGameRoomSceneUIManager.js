var LLKDDMJGameRoomSceneUIManager = UIManagerBase.extend({

	ctor: function (gameType) {
		this.gameType = gameType;
		this._super();
	},

	onCreate: function () {

		var initUIClassNameList = ["GameRoomInfoUI", "AudioRecordUI", "HelpUI", "GameConfigUI", "GamePlayerInfoUI", "CommunicateUI", "ApplyCloseUI", "GPSUI","GPSceneUI","ClubInviteUI", "ConfirmUI", "ShareSelectUI"];

		for (var uiClassName of initUIClassNameList) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], uiClassName);
		}

		var room_ui = [];
		var ui_dict = table_config[this.gameType];
		for (var uiClassName in ui_dict["PLAY_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["PLAY_UI"][uiClassName]);
			room_ui.push(eval("this." + uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui"))
		}
		for (var uiClassName in ui_dict["PREPARE_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["PREPARE_UI"][uiClassName]);
		}
		for (var uiClassName in ui_dict["SETTLEMENT_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["SETTLEMENT_UI"][uiClassName]);
		}
		for (var uiClassName in ui_dict["RESULT_UI"]) {
			this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], ui_dict["RESULT_UI"][uiClassName]);
		}

		this.roomLayoutMgr = new MultipleRoomLayout(this, room_ui, this.gameType);

		var game_room_ui_type = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", this.gameType));
		var game_room_bg_type = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_BG", this.gameType));

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