"use strict";
var ConfigUI = BasicDialogUI.extend({
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/ConfigUI.json";
		// this.setLocalZOrder(const_val.MAX_LAYER_NUM);
	},

	initUI: function () {
		this.gameconfig_panel = this.rootUINode.getChildByName("gameconfig_panel");
		var self = this;
		if(h1global.player().curGameRoom) {
			if (h1global.player().curGameRoom.club_id && Object.keys(h1global.player().club_entity_dict).length <= 0) {
				h1global.player().getClubListInfo();
			}
		}
        this.gameconfig_panel.getChildByName("return_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.hide();
			}
		});

        var slider_panel = this.gameconfig_panel.getChildByName("slider_panel");
        slider_panel.getChildByName("music_slider").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				cc.audioEngine.setMusicVolume(sender.getPercent() * 0.01);
				cc.sys.localStorage.setItem("MUSIC_VOLUME", sender.getPercent());
			}
		});
        slider_panel.getChildByName("music_slider").setPercent(cc.sys.localStorage.getItem("MUSIC_VOLUME"));

        slider_panel.getChildByName("effect_slider").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
                if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
                    if(sender.getPercent() == 0){
                        cc.audioEngine.setEffectsVolume(0.001);
                        cc.sys.localStorage.setItem("EFFECT_VOLUME", 0.1);
                    }else{
                        cc.audioEngine.setEffectsVolume(sender.getPercent()*0.01);
                        cc.sys.localStorage.setItem("EFFECT_VOLUME", sender.getPercent());
					}
                }else{
                    cc.audioEngine.setEffectsVolume(sender.getPercent() * 0.01);
                    cc.sys.localStorage.setItem("EFFECT_VOLUME", sender.getPercent());
                }
			}
		});
        slider_panel.getChildByName("effect_slider").setPercent(cc.sys.localStorage.getItem("EFFECT_VOLUME"));

		this.out_btn = this.gameconfig_panel.getChildByName("out_btn");
		this.out_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				let player = h1global.player();
				if (player) {
					player.quitRoom();
					self.hide();
				}
			}
		});

		this.close_btn = this.gameconfig_panel.getChildByName("close_btn");
		this.close_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				let player = h1global.player();
				if (player) {
					player.quitRoom();
					self.hide();
				}
			}
		});

		this.applyclose_btn = this.gameconfig_panel.getChildByName("applyclose_btn");
		this.applyclose_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				let player = h1global.player();
				if (player) {
					if(player.curGameRoom) {
						var dismissRoomList = [player.curGameRoom.player_num, const_val.DISMISS_ROOM_WAIT_TIME];
						if (player.curGameRoom.club_id && Object.keys(player.club_entity_dict).length > 0) {
							dismissRoomList = player.club_entity_dict[player.curGameRoom.club_id].club_base_info.dismissRoomList;
						}
						if (dismissRoomList[0] > player.curGameRoom.player_num) {
							player.applyDismissRoom(player.curGameRoom.player_num, dismissRoomList[1]);
						} else {
							player.applyDismissRoom(dismissRoomList[0], dismissRoomList[1]);
						}
					}
					// player.applyDismissRoom();
					self.hide();
				}
			}
		});

		this.update_out_btn();
		this.update_state();
		this.set_plan_btn();
		this.init_music_panel();
	},

	update_out_btn: function () {
		this.gameconfig_panel.getChildByName("logout_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				cutil.lock_ui();
				h1global.player().logout();
			}
		})
	},

	update_state: function () {
		if (!this.is_show) {
			return;
		}
		var player = h1global.player();
		if (player && player.curGameRoom) {
			if (const_val.CLUB_ROOM === player.curGameRoom.room_type) {
				this.applyclose_btn.setVisible(player.curGameRoom.curRound > 0);
				this.out_btn.setVisible(player.curGameRoom.curRound <= 0);
			} else {
				this.applyclose_btn.setVisible(player.curGameRoom.curRound > 0);
				this.close_btn.setVisible(player.curGameRoom.curRound <= 0 && player.curGameRoom.playerInfoList[player.serverSitNum]["is_creator"] === true);
				this.out_btn.setVisible(player.curGameRoom.curRound <= 0 && player.curGameRoom.playerInfoList[player.serverSitNum]["is_creator"] === false);
			}
			this.gameconfig_panel.getChildByName("logout_btn").setVisible(false);
            this.gameconfig_panel.getChildByName("plan_panel").setVisible(false);
            this.gameconfig_panel.getChildByName("music_panel").setVisible(false);
            this.gameconfig_panel.getChildByName("slider_panel").setPositionY(this.gameconfig_panel.height*0.55);
		} else {
			this.gameconfig_panel.getChildByName("logout_btn").setVisible(true);
			this.out_btn.setVisible(false);
			this.close_btn.setVisible(false);
			this.applyclose_btn.setVisible(false);
			this.gameconfig_panel.getChildByName("plan_panel").setVisible(true);
            this.gameconfig_panel.getChildByName("music_panel").setVisible(true);
            this.gameconfig_panel.getChildByName("slider_panel").setPositionY(this.gameconfig_panel.height*0.5);

		}
	},

	set_plan_btn:function(){
		var plan_panel = this.gameconfig_panel.getChildByName("plan_panel");

        plan_panel.getChildByName("parent_btn").hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(0, -size.height * 0.3, size.width, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        plan_panel.getChildByName("privacy_btn").hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(0, -size.height * 0.3, size.width, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        plan_panel.getChildByName("user_btn").hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(0, -size.height * 0.3, size.width, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };

		plan_panel.getChildByName("parent_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                cc.log("家长协议");
                //h1global.curUIMgr.webview_ui.show_by_info("http://sxqpupdate.zjfeixia.com/protocols/parent_agreement.html");
                cutil.open_url("http://sxqpupdate.zjfeixia.com/protocols/parent_agreement.html");
            }
        });
        plan_panel.getChildByName("privacy_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                cc.log("隐私协议");
                //h1global.curUIMgr.webview_ui.show_by_info("http://sxqpupdate.zjfeixia.com/protocols/privacy_agreement.html");
                cutil.open_url("http://sxqpupdate.zjfeixia.com/protocols/privacy_agreement.html");
            }
        });
        plan_panel.getChildByName("user_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                cc.log("用户协议");
                //h1global.curUIMgr.webview_ui.show_by_info("http://sxqpupdate.zjfeixia.com/protocols/user_agreement.html");
                cutil.open_url("http://sxqpupdate.zjfeixia.com/protocols/user_agreement.html");
            }
        });
	},

	init_music_panel:function(){
		var music_panel = this.gameconfig_panel.getChildByName("music_panel");
        var add_func = function(i){
            cc.log("播放本地音乐",i);
            cc.sys.localStorage.setItem("NOW_PLAY_BGM_JSON", '{"now_bgm":'+ i +'}');
            if(i==0){
                if (cc.audioEngine.isMusicPlaying()) {
                    cc.audioEngine.stopMusic();
                }
                if (!cc.audioEngine.isMusicPlaying()) {
                    cc.audioEngine.playMusic("res/sound/music/sound_bgm.mp3", true);
                }
			}else{
                if (cc.audioEngine.isMusicPlaying()) {
                    cc.audioEngine.stopMusic();
                }
                if (!cc.audioEngine.isMusicPlaying()) {
                    cc.audioEngine.playMusic("res/sound/music/sound_bgm2.mp3", true);
                }
			}
        };
        var info_json = cc.sys.localStorage.getItem("NOW_PLAY_BGM_JSON");
        if (!info_json) {
            var default_info_json = '{"now_bgm":0}';
            cc.sys.localStorage.setItem("NOW_PLAY_BGM_JSON", default_info_json);
            info_json = cc.sys.localStorage.getItem("NOW_PLAY_BGM_JSON");
        }
        var info_dict = eval("(" + info_json + ")");
		cc.log(info_dict["now_bgm"]);
        var select_id = info_dict["now_bgm"];

        UICommonWidget.create_check_box_group(music_panel,"music_chx",2, add_func, select_id, "img");
	},

});