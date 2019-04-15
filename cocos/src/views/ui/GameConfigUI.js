// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var GameConfigUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/GameConfigUI.json";
		this.setLocalZOrder(const_val.GameConfigZOrder);
	},

	initUI:function(){
		this.gameconfig_panel = this.rootUINode.getChildByName("gameconfig_panel");
		this.func_panel = this.gameconfig_panel.getChildByName("func_panel");
		this.frame_panel = this.gameconfig_panel.getChildByName("frame_panel");
		this.frame_config_btn = this.gameconfig_panel.getChildByName("frame_config_btn");
		this.func_config_btn = this.gameconfig_panel.getChildByName("func_config_btn");
		var player = h1global.player();
		if(player.curGameRoom) {
			if (player.curGameRoom.club_id && Object.keys(player.club_entity_dict).length <= 0) {
				player.getClubListInfo();
			}
		}
		var self = this;
        this.bg_panel = this.rootUINode.getChildByName("bg_panel");
        this.bg_panel.setLocalZOrder(this.gameconfig_panel.getLocalZOrder() + 1);
        this.bg_panel.addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){

				if(h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show){
					h1global.curUIMgr.gameroominfo_ui.applyNewLayout();
				}
	            if(h1global.curUIMgr.tylsmjgameroominfo_ui && h1global.curUIMgr.tylsmjgameroominfo_ui.is_show){
		            h1global.curUIMgr.tylsmjgameroominfo_ui.applyNewLayout();
	            }

                self.gameconfig_panel.runAction(cc.Sequence.create(
                    cc.MoveTo.create(0.1,cc.winSize.width *1.5, cc.winSize.height * 0.5),
                    cc.CallFunc.create(function () {
                        self.hide();
                    })
                ));
            }
        });

		function func_btn_event(sender, eventType){
			if(eventType === ccui.Widget.TOUCH_ENDED){
				self.func_config_btn.setVisible(true);
				self.func_panel.setVisible(true);
				self.frame_config_btn.setVisible(false);
				self.frame_panel.setVisible(false);
			}
		}

		function frame_btn_event(sender, eventType){
			if(eventType === ccui.Widget.TOUCH_ENDED){
				self.func_config_btn.setVisible(false);
				self.func_panel.setVisible(false);
				self.frame_config_btn.setVisible(true);
				self.frame_panel.setVisible(true);
			}
		}

		this.func_config_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				var p = sender.getTouchBeganPosition();
				p = sender.convertToNodeSpace(p);
				var width = sender.getContentSize().width;
				if (p.x > width * 0.5) {
					frame_btn_event(sender, eventType);
				}
			}
		});

		this.frame_config_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				var p = sender.getTouchBeganPosition();
				p = sender.convertToNodeSpace(p);
				var width = sender.getContentSize().width;
				if (p.x < width * 0.5) {
					func_btn_event(sender, eventType);
				}
			}
		});

		this.gameconfig_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){

				if(h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show){
					h1global.curUIMgr.gameroominfo_ui.applyNewLayout();
				}
				if(h1global.curUIMgr.tylsmjgameroominfo_ui && h1global.curUIMgr.tylsmjgameroominfo_ui.is_show){
					h1global.curUIMgr.tylsmjgameroominfo_ui.applyNewLayout();
				}

                self.gameconfig_panel.runAction(cc.Sequence.create(
                    cc.MoveTo.create(0.1,cc.winSize.width *1.5 ,cc.winSize.height * 0.5),
					cc.CallFunc.create(function () {
                        self.hide();
                    })
                ));
			}
		});

		var mode_3d_btn = this.frame_panel.getChildByName("mode_btn_0");
		var mode_2d_btn = this.frame_panel.getChildByName("mode_btn_1");
		this.mode_btn_list = [mode_2d_btn,mode_3d_btn];

		var color_btn_0 = this.frame_panel.getChildByName("color_btn_0");
		var color_btn_1 = this.frame_panel.getChildByName("color_btn_1");
		var color_btn_2 = this.frame_panel.getChildByName("color_btn_2");
		this.color_btn_list = [color_btn_0,color_btn_1,color_btn_2];

		var majong_color_btn_0 = this.frame_panel.getChildByName("majong_color_btn_0");
		var majong_color_btn_1 = this.frame_panel.getChildByName("majong_color_btn_1");
		var majong_color_btn_2 = this.frame_panel.getChildByName("majong_color_btn_2");
		this.mahjong_color_btn_list = [majong_color_btn_0,majong_color_btn_1,majong_color_btn_2];

		this.out_btn = this.gameconfig_panel.getChildByName("out_btn");
		this.out_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				player.quitRoom();
				self.hide();
			}
		});

		this.close_btn = this.gameconfig_panel.getChildByName("close_btn");
		this.close_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				player.quitRoom();
				self.hide();
			}
		});

		this.applyclose_btn = this.gameconfig_panel.getChildByName("applyclose_btn");
		this.applyclose_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				if(player.curGameRoom){
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
				self.hide();
			}
		});

		this.func_panel.getChildByName("music_slider").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				cc.audioEngine.setMusicVolume(sender.getPercent()*0.01);
				cc.sys.localStorage.setItem("MUSIC_VOLUME", sender.getPercent());
			}
		});
		this.func_panel.getChildByName("music_slider").setPercent(cc.sys.localStorage.getItem("MUSIC_VOLUME"));

		this.func_panel.getChildByName("effect_slider").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
                if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
                	if(sender.getPercent() == 0){
                        cc.audioEngine.setEffectsVolume(0.001);
                        cc.sys.localStorage.setItem("EFFECT_VOLUME", 0.1);
					}else{
                        cc.audioEngine.setEffectsVolume(sender.getPercent()*0.01);
                        cc.sys.localStorage.setItem("EFFECT_VOLUME", sender.getPercent());
					}
                }else{
                    cc.audioEngine.setEffectsVolume(sender.getPercent()*0.01);
                    cc.sys.localStorage.setItem("EFFECT_VOLUME", sender.getPercent());
				}
			}
		});
		this.func_panel.getChildByName("effect_slider").setPercent(cc.sys.localStorage.getItem("EFFECT_VOLUME"));

		this.update_state();
		this.update_mode_color();
		this.change_language();

        this.gameconfig_panel.setPositionX(cc.winSize.width * 1.5);
		this.gameconfig_panel.runAction(cc.moveBy(0.3, cc.winSize.width * -0.5, 0));

		this.adapterLanguage();
    },

	change_color:function () {
		if (h1global.curUIMgr.backgroundStrategy) {
			var gameBgType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_BG", h1global.curUIMgr.gameType));
			var gameUIType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType));
			h1global.curUIMgr.backgroundStrategy.updateBackground(gameUIType, gameBgType);
		}
    },

	change_language:function () {
		var sel_func = function (i) {
			cc.sys.localStorage.setItem(cutil.keyConvert("LANGUAGE", h1global.curUIMgr.gameType), table_game2voice[h1global.curUIMgr.gameType][i].toString());
		};

		if (cc.sys.localStorage.getItem(cutil.keyConvert("LANGUAGE", h1global.curUIMgr.gameType)) == null) {
			cc.sys.localStorage.setItem(cutil.keyConvert("LANGUAGE", h1global.curUIMgr.gameType), table_game2voice[h1global.curUIMgr.gameType][0].toString());
		}
		var table_voice_index = cc.sys.localStorage.getItem(cutil.keyConvert("LANGUAGE", h1global.curUIMgr.gameType));
		var sel_index = table_voice_index ==  2 ? 1 : 0;
		UICommonWidget.create_check_box_group(this.gameconfig_panel, "language_chx", 2, sel_func, sel_index, "language_img");
	},

    change_mode:function () {
		var gameType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType));
		if(h1global.curUIMgr.roomLayoutMgr){
			h1global.curUIMgr.roomLayoutMgr.setGameRoomUI2Top(gameType);
		}
		if(h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show){
			h1global.curUIMgr.gameroominfo_ui.setLayout(h1global.curUIMgr.gameroominfo_ui.getResourceFile(gameType));
		}
	    if(h1global.curUIMgr.tylsmjgameroominfo_ui && h1global.curUIMgr.tylsmjgameroominfo_ui.is_show){
		    h1global.curUIMgr.tylsmjgameroominfo_ui.setLayout(TYLSMJGameRoomInfoUI.getResourceFile(gameType));
	    }
        if(h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show){
            h1global.curUIMgr.gameroomprepare_ui.change_prepare_mode(gameType);
        }
    },


	change_mahjong_color:function () {
		var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			var player = h1global.player();
			for (var i = 0 ; i < player.curGameRoom.player_num ; i++) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", i);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_up_tiles", i);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_discard_tiles", i);
			}
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_roominfo_panel_mahjong_img");
		}
    },

	update_mode_color:function () {
        if(!this.is_show){
            return;
        }
        var self = this;
        function mode_btn_event(sender, eventType) {
			if(eventType == ccui.Widget.TOUCH_ENDED){
				for(var i = 0 ; i < self.mode_btn_list.length ; i++){
					if(sender != self.mode_btn_list[i]){
						self.mode_btn_list[i].setTouchEnabled(true);
						self.mode_btn_list[i].getChildByName("mode_frame_img").setVisible(false);
					}else{
						sender.setTouchEnabled(false);
						sender.getChildByName("mode_frame_img").setVisible(true);
						cc.sys.localStorage.setItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType), i);
						self.change_mode();
					}
				}
			}
        }
        for(var i = 0 ; i < self.mode_btn_list.length ; i++){
        	var mode_btn = self.mode_btn_list[i];
        	mode_btn.addTouchEventListener(mode_btn_event);
		}
        let btn_mode = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType));
        self.mode_btn_list[btn_mode].setTouchEnabled(false);
        self.mode_btn_list[btn_mode].getChildByName("mode_frame_img").setVisible(true);

        function color_btn_event(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED){
                for(var i = 0 ; i < self.color_btn_list.length ; i++){
                    if(sender != self.color_btn_list[i]){
                        self.color_btn_list[i].setTouchEnabled(true);
                        self.color_btn_list[i].getChildByName("color_frame_img").setVisible(false);
                    }else{
                        sender.setTouchEnabled(false);
                        sender.getChildByName("color_frame_img").setVisible(true);
	                    cc.sys.localStorage.setItem(cutil.keyConvert("GAME_ROOM_BG", h1global.curUIMgr.gameType), i);
                        self.change_color();
                    }
                }
            }
        }

        for(var i = 0 ; i < self.color_btn_list.length ; i++){
            self.color_btn_list[i].addTouchEventListener(color_btn_event);
        }
        let bg_mode = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_BG", h1global.curUIMgr.gameType));
        self.color_btn_list[bg_mode].setTouchEnabled(false);
        self.color_btn_list[bg_mode].getChildByName("color_frame_img").setVisible(true);


		function mahjong_color_btn_event(sender, eventType) {
			if(eventType == ccui.Widget.TOUCH_ENDED){
				for(var i = 0 ; i < self.mahjong_color_btn_list.length ; i++){
					self.mahjong_color_btn_list[i].getChildByName("mahjong_label").setTextColor(cc.color(255,255,255));
					if(sender != self.mahjong_color_btn_list[i]){
						self.mahjong_color_btn_list[i].setTouchEnabled(true);
						self.mahjong_color_btn_list[i].getChildByName("color_frame_img").setVisible(false);
						self.mahjong_color_btn_list[i].getChildByName("mahjong_label").updateDisplayedColor(cc.color(62,162,186));
					}else{
						sender.setTouchEnabled(false);
						sender.getChildByName("color_frame_img").setVisible(true);
						sender.getChildByName("mahjong_label").updateDisplayedColor(cc.color(255,218,137));
						cc.sys.localStorage.setItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType), i);
						self.change_mahjong_color();
					}
				}
			}
		}

		for(var i = 0 ; i < self.mahjong_color_btn_list.length ; i++){
			self.mahjong_color_btn_list[i].addTouchEventListener(mahjong_color_btn_event);
			self.mahjong_color_btn_list[i].getChildByName("mahjong_label").setTextColor(cc.color(62,162,186));
		}
		let mahjong_bg_mode = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
		self.mahjong_color_btn_list[mahjong_bg_mode].setTouchEnabled(false);
		self.mahjong_color_btn_list[mahjong_bg_mode].getChildByName("color_frame_img").setVisible(true);
		self.mahjong_color_btn_list[mahjong_bg_mode].getChildByName("mahjong_label").setTextColor(cc.color(255,218,137));
	},

	update_state:function(){
		if(!this.is_show){
			return;
		}
		var player = h1global.player();
		if(player.curGameRoom){
			if(player.curGameRoom.curRound > 0){
				this.applyclose_btn.setVisible(true);
				this.close_btn.setVisible(false);
				this.out_btn.setVisible(false);
			} else if(player.serverSitNum == 0 && player.curGameRoom.roomType !== const_val.CLUB_ROOM){
				this.applyclose_btn.setVisible(false);
				this.close_btn.setVisible(true);
				this.out_btn.setVisible(false);
			} else {
				this.applyclose_btn.setVisible(false);
				this.close_btn.setVisible(false);
				this.out_btn.setVisible(true);
			}
		}
	},
	adapterLanguage:function(){
		if (cutil.keyConvertLanguaeFilters.indexOf(h1global.curUIMgr.gameType) !== -1) {
			this.func_panel.getChildByName("language_chx1").setVisible(false);
			this.func_panel.getChildByName("language_img1").setVisible(false);
			this.func_panel.getChildByName("language_chx2").setVisible(false);
			this.func_panel.getChildByName("language_img2").setVisible(false);
			this.func_panel.getChildByName("title_language_img").setVisible(false);


			// this.func_panel.getChildByName("effect_slider").y += cc.winSize.height * 0.05;
			// this.func_panel.getChildByName("effect_img").y += cc.winSize.height * 0.05;
			// this.func_panel.getChildByName("music_slider").y += cc.winSize.height * 0.05;
			// this.func_panel.getChildByName("music_img").y += cc.winSize.height * 0.05;
		}
	}
});
