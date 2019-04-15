var LLKDDMJPlaybackGameRoomScene = cc.Scene.extend({
    className: "LLKDDMJPlaybackGameRoomScene",
	ctor: function (gameType) {
		this._super();
		this.gameType = gameType;
	},

    onEnter: function () {
    	var self = this;
        this._super();
	    if (cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", this.gameType)) == null) {
		    cc.sys.localStorage.setItem(cutil.keyConvert("GAME_ROOM_UI", this.gameType), const_val.GAME_ROOM_2D_UI)
	    }
	    if (cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_BG", this.gameType)) == null) {
		    cc.sys.localStorage.setItem(cutil.keyConvert("GAME_ROOM_BG", this.gameType), const_val.GAME_ROOM_BG_CLASSIC);
	    }
	    if (cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", this.gameType)) == null) {
		    cc.sys.localStorage.setItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", this.gameType), const_val.GAME_ROOM_MAHJONG_BG_GREEN);
	    }
        if (cc.sys.localStorage.getItem(cutil.keyConvert("LANGUAGE", this.gameType)) == null) {
            cc.sys.localStorage.setItem(cutil.keyConvert("LANGUAGE", this.gameType), table_game2voice[this.gameType][0].toString());
        }
        this.loadUIManager();
        cutil.unlock_ui();

        if (cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.stopMusic();
        }

	    if (h1global.curUIMgr.roomLayoutMgr) {
		    h1global.curUIMgr.roomLayoutMgr.showGameRoomUI(function (complete) {
			    if (complete) {
				    var player = h1global.player();
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_kingtile_panel");
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver("throwTheDice", player.gameOperationAdapter.diceList, player.curGameRoom.dealerIdx);
                    h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
                        ui.playbackGame.startPlayback();
                    })
			    }
		    });
	    }
    },

    loadUIManager: function () {
	    var gameName = const_val.GameType2GameName[this.gameType];
	    var curUIManager = eval("new " + gameName + "PlaybackGameRoomSceneUIManager(this.gameType)");
        curUIManager.setAnchorPoint(0, 0);
        curUIManager.setPosition(0, 0);
        this.addChild(curUIManager, const_val.curUIMgrZOrder);
        h1global.curUIMgr = curUIManager;
    },

	onExit:function () {
		this._super();
		let player = h1global.player();
		if (player) {
			player.curGameRoom = undefined;
			player.originRoomInfo = undefined;
		}
	}
});