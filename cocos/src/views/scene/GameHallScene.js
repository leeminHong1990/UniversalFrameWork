// cc.loader.loadJs("src/views/uimanager/LoginSceneUIManager.js")

var GameHallScene = cc.Scene.extend({
    className: "GameHallScene",

    ctor:function (params_dict) {
        this.params_dict = params_dict;
        this._super()
    },

    onEnter: function () {
        this._super();
        this.loadUIManager();
        cutil.unlock_ui();

        if (cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.stopMusic();
        }
        var info_json = cc.sys.localStorage.getItem("NOW_PLAY_BGM_JSON");
        if(info_json){
            var info_dict = eval("(" + info_json + ")");
            var select_id = info_dict["now_bgm"];
            if(select_id==1){
                cc.audioEngine.playMusic("res/sound/music/sound_bgm2.mp3", true);
            }else{
                cc.audioEngine.playMusic("res/sound/music/sound_bgm.mp3", true);
            }
        }else{
            cc.audioEngine.playMusic("res/sound/music/sound_bgm.mp3", true);
        }

        cc.audioEngine.setMusicVolume(cc.sys.localStorage.getItem("MUSIC_VOLUME") * 0.01);
        cc.audioEngine.setEffectsVolume(cc.sys.localStorage.getItem("EFFECT_VOLUME") * 0.01);

        if(!((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) || switches.TEST_OPTION)) {
            var title = switches.gameName;
            var desc = '访问公众号【' + switches.gzh_name + '】更多好玩的游戏等着你~';
            cutil.share_func(title, desc);
        }
    },

    loadUIManager: function () {
        var curUIManager = new GameHallSceneUIManager();
        curUIManager.setAnchorPoint(0, 0);
        curUIManager.setPosition(0, 0);
        this.addChild(curUIManager, const_val.curUIMgrZOrder);
        h1global.curUIMgr = curUIManager;

        // curUIManager.gamehall_ui.show(function(){
        //     if(h1global.reconnect){
        //         h1global.reconnect = false;
        //         h1global.runScene(new GameRoomScene());
        //     }
        // });
        curUIManager.gamehall_ui.setLocalZOrder(const_val.GameHallZOrder);
        curUIManager.gamehall_ui.show(function(){
            // Note: 主界面显示广播在重新show时ui层级会改变 在这里直接设置GameHall 和 broadcast的ui层级
            h1global.curUIMgr.broadcast_ui.setLocalZOrder(const_val.GameHallBroadcastZOrder);
            h1global.curUIMgr.broadcast_ui.show_default([
            "本游戏仅供娱乐，禁止赌博！",
            "发现抽水等赌博行为，请联系客服举报。",
            "诚招合作伙伴，福利多多！详情请咨询客服微信号FXQP01A、FXQP02A。"
        ])});

        if(this.params_dict && this.params_dict['from_scene'] === "LoginScene"){
            var t = cc.sys.localStorage.getItem(const_val.GAME_NAME + "_last_activity_time");
			var do_show = true;
			var now = new Date().getTime();
			if (cutil.isPositiveNumber(t)) {
				do_show = now - Number(t) > const_val.SHOW_ACTIVITY_INTERVAL;
			}
            var info_json = cc.sys.localStorage.getItem(h1global.player().userId+"DISCLAIMER_JSON");
            if (!info_json){
                h1global.curUIMgr.disclaimer_ui.show();
            }
			if (do_show) {
				// h1global.curUIMgr.sharecircle_ui.show(function () {
				// 	h1global.curUIMgr.activity_ui.show();
				// });
				cc.sys.localStorage.setItem(const_val.GAME_NAME + "_last_activity_time", now);
			}

			//在这里写读取公告的数据
            var notice_data = cc.sys.localStorage.getItem("NOTICES_DATA");
            if(notice_data){
                notice_data = parseInt(notice_data);
                var now_time = Math.round(new Date() / 1000);
                var start=new Date(notice_data*1000);
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0);
                start.setMilliseconds(0);
                var beginTime=Date.parse(start)/1000;
                beginTime+= 24*60*60;
                cc.log("now_time",now_time);
                cc.log("beginTime",beginTime);
                //说明已经过了一天了
                if(now_time>beginTime){
                    cc.log("已经过了一天了,显示新公告");
                    cutil.get_notices();
                }else{
                    var notice_id = cc.sys.localStorage.getItem("NOTICES_ID");
                    if(notice_id){
                        cutil.get_notices(notice_id);
                    }
                }
            }else{
                cutil.get_notices();
            }


        } else if(this.params_dict && this.params_dict['from_scene'] === "GameHallScene"){
            if(this.params_dict['club_id'] > 0 && h1global.player()){
                h1global.player().getClubDetailInfo(this.params_dict['club_id']);
            }
        }

        if (!onhookMgr) {
            onhookMgr = new OnHookManager();
        }

        onhookMgr.init(this);
        this.scheduleUpdateWithPriority(0);
    },

    update: function (delta) {
        onhookMgr.update(delta);
    }
});
