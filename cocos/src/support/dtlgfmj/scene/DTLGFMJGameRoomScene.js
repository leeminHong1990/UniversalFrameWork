// cc.loader.loadJs("src/views/uimanager/LoginSceneUIManager.js")

var DTLGFMJGameRoomScene = cc.Scene.extend({
    className:"DTLGFMJGameRoomScene",

	ctor: function (gameType) {
		this._super();
        this.gameType = gameType;
	},

    onEnter:function () {
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

        if(cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.stopMusic();
        }
        if(!cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.playMusic("res/sound/music/game_bgm.mp3", true);
        }
        cc.audioEngine.setMusicVolume(cc.sys.localStorage.getItem("MUSIC_VOLUME") * 0.01);
        cc.audioEngine.setEffectsVolume(cc.sys.localStorage.getItem("EFFECT_VOLUME") * 0.01);
    },

    loadUIManager:function() {
	    var gameName = const_val.GameType2GameName[this.gameType];
	    var curUIManager = eval("new " + gameName + "GameRoomSceneUIManager(this.gameType);");
    	curUIManager.setAnchorPoint(0, 0);
    	curUIManager.setPosition(0, 0);
    	this.addChild(curUIManager, const_val.curUIMgrZOrder);
        h1global.curUIMgr = curUIManager;

        if(h1global.player().startActions["GameRoomScene"]){
            h1global.player().startActions["GameRoomScene"]();
            h1global.player().startActions["GameRoomScene"] = undefined;
        } else if(h1global.player().curGameRoom.room_state == const_val.ROOM_PLAYING){
            // curUIManager.gameroomprepare_ui.hide();
            if(h1global.curUIMgr.gameroom3d_ui && h1global.curUIMgr.gameroom2d_ui){
                h1global.curUIMgr.roomLayoutMgr.notifyObserver( "hide");
                h1global.curUIMgr.roomLayoutMgr.showGameRoomUI(function(complete){
                    if(complete){
                        let player = h1global.player();
                        if (player && player.startActions["GameRoomUI"]) {
                            player.startActions["GameRoomUI"]();
                            player.startActions["GameRoomUI"] = undefined;
                        }
                    }
                });
            }
        } else {
	        h1global.curUIMgr.roomLayoutMgr.notifyObserver( "hide");
            curUIManager.gameroomprepare_ui.show();
        }

        if (!onhookMgr) {
            onhookMgr = new OnHookManager();
        }

        onhookMgr.init(this);
        this.scheduleUpdateWithPriority(0);

        if(onhookMgr.applyCloseLeftTime > 0){
            curUIManager.applyclose_ui.show_by_sitnum(h1global.player().curGameRoom.applyCloseFrom);
        }
    },

    update:function( delta ){
        // if (physicsUpdate) {
        //     physicsUpdate();
        // }
        onhookMgr.update(delta);
    }
});