var ResultUI = UIBase.extend({
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/ResultUI.json";
		this.setLocalZOrder(const_val.MAX_LAYER_NUM);
	},
	initUI: function () {
		this.result_panel = this.rootUINode.getChildByName("result_panel");
		this.init_player_info_panel();
		this.player_panels = [];
		this.player_panels.push(this.rootUINode.getChildByName("result_panel").getChildByName("player_info_panel0"));
		this.player_panels.push(this.rootUINode.getChildByName("result_panel").getChildByName("player_info_panel0").clone());
		this.player_panels.push(this.rootUINode.getChildByName("result_panel").getChildByName("player_info_panel0").clone());
		this.player_panels.push(this.rootUINode.getChildByName("result_panel").getChildByName("player_info_panel0").clone());
        this.result_panel.addChild(this.player_panels[1]);
        this.result_panel.addChild(this.player_panels[2]);
        this.result_panel.addChild(this.player_panels[3]);
		var share_btn = this.rootUINode.getChildByName("result_panel").getChildByName("share_btn");
		if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
			share_btn.setVisible(false);
		}

		function share_btn_event(sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				if (switchesnin1.hasXianliao !== undefined && switchesnin1.hasXianliao !== null && switchesnin1.hasXianliao >= 1) {
					if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
						h1global.curUIMgr.shareselect_ui.show_by_info();
					} else {
						cc.log("share not support web");
					}
				} else {
					if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
						jsb.fileUtils.captureScreen("", "screenShot.png");
					} else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
						jsb.reflection.callStaticMethod("WechatOcBridge", "takeScreenShot");
					} else {
						cc.log("share not support web");
					}
				}
			}
		}

		share_btn.addTouchEventListener(share_btn_event);
		if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
			share_btn.setVisible(false);
		}
		// if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
		// 	share_btn.setVisible(true);
		// } else {
		// 	share_btn.setVisible(false);
		// }
		var self = this;
		var confirm_btn = this.rootUINode.getChildByName("result_panel").getChildByName("confirm_btn");

		function confirm_btn_event(sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				let player = h1global.player();
				self.finalResultFlag = false;
				if (player && player.curGameRoom) {
					var club_id = player.curGameRoom.club_id;
					player.curGameRoom = null;
					player.gameOperationAdapter = null;
					h1global.runScene(new GameHallScene({'from_scene': 'GameHallScene', 'club_id': club_id}));
				} else {
					h1global.runScene(new GameHallScene());
				}
			}
		}

		confirm_btn.addTouchEventListener(confirm_btn_event);

		//保存截屏
		var save_screen_btn = this.rootUINode.getChildByName("result_panel").getChildByName("save_screen_btn");

		function save_screen_btn_event(sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
					var currTimeStr = new Date().getTime().toString();
					jsb.fileUtils.captureScreen("", "MJ_" + currTimeStr + "_MJ.png");
				} else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
					jsb.reflection.callStaticMethod("WechatOcBridge", "saveScreenShot");
				} else {
					// share_btn.setVisible(false);
				}
			}
		}

		save_screen_btn.addTouchEventListener(save_screen_btn_event);
	},

    init_player_info_panel:function(){
	  cc.log("留给继承去更新UI");
    },

    show_by_info:function(finalPlayerInfoList, curGameRoom){
        cc.log("finalPlayerInfoList:",finalPlayerInfoList)
        //cc.log("curGameRoom:",curGameRoom)
        var self = this;
        this.show(function(){
            var maxScore = 0;
            // var maxIdxList = [];
            // 需求 将玩家自己放在第一位
            var left = [];
            var right = [];
            var serverSitNum = h1global.player().serverSitNum;
            for(let i=0; i<finalPlayerInfoList.length; i++){
                if (finalPlayerInfoList[i]["idx"] < serverSitNum){
                    left.push(finalPlayerInfoList[i])
                }else{
                    right.push(finalPlayerInfoList[i])
                }
            }
            finalPlayerInfoList = right.concat(left);

            for(var i = 0; i < finalPlayerInfoList.length; i++){
                var finalPlayerInfo = finalPlayerInfoList[i];
                if(finalPlayerInfo["score"] > maxScore){
                    maxScore = finalPlayerInfo["score"];
                }
            }
            for(var i = 0; i < finalPlayerInfoList.length; i++){
                var finalPlayerInfo = finalPlayerInfoList[i];
                if(finalPlayerInfo["score"] > maxScore){
                    maxScore = finalPlayerInfo["score"];
                }
                if(finalPlayerInfoList[i]["score"] == maxScore && maxScore != 0){
                    self.update_player_info(i, finalPlayerInfo["idx"], finalPlayerInfo, i, curGameRoom);
                }else {
                    self.update_player_info(i, finalPlayerInfo["idx"], finalPlayerInfo, -1, curGameRoom);
                }
                if (finalPlayerInfoList.length == 2) {
                    self.player_panels[0].setPositionX(self.result_panel.getContentSize().width * 0.33);
                    self.player_panels[1].setPositionX(self.result_panel.getContentSize().width * 0.66);
                    self.player_panels[2].setVisible(false);
                    self.player_panels[3].setVisible(false);
                }else if (finalPlayerInfoList.length == 3) {
					self.player_panels[0].setPositionX(self.result_panel.getContentSize().width * 0.25);
					self.player_panels[1].setPositionX(self.result_panel.getContentSize().width * 0.50);
					self.player_panels[2].setPositionX(self.result_panel.getContentSize().width * 0.75);
					self.player_panels[3].setVisible(false);
				}else {
                    self.player_panels[0].setPositionX(self.result_panel.getContentSize().width * 0.14);
                    self.player_panels[1].setPositionX(self.result_panel.getContentSize().width * 0.38);
                    self.player_panels[2].setPositionX(self.result_panel.getContentSize().width * 0.62);
                    self.player_panels[3].setPositionX(self.result_panel.getContentSize().width * 0.86);
                    self.player_panels[3].setVisible(true);
                }
            }
            // for(var i = 0; i < finalPlayerInfoList.length; i++){
            // 	if(finalPlayerInfoList[i]["score"] == maxScore){
            // 		maxIdxList.push(finalPlayerInfoList[i]["idx"]);
            // 	}
            // }
            let clubStr = "";
            if (curGameRoom.club_id > 0) {
                clubStr = "    亲友圈：" + curGameRoom.club_id;
            }
            let ruleStr = "   规则：" + cutil.get_share_desc(curGameRoom, curGameRoom.gameType);
            let roomInfoLabel = self.result_panel.getChildByName("roominfo_label");
            roomInfoLabel.setString(cutil.convert_timestamp_to_datetime_exsec(new Date() / 1000) + "   房间号：" + curGameRoom.roomID.toString() + clubStr + ruleStr);
            cutil.unlock_ui();

            if(!((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) || switches.TEST_OPTION)) {
                var result_list = {};
                var result_str = '';
                for (var i = 0; i < finalPlayerInfoList.length; i++) {
                    var finalPlayerInfo = finalPlayerInfoList[i];
                    result_list[finalPlayerInfo["idx"]] = finalPlayerInfo;
                }
                for (var i = 0; i < finalPlayerInfoList.length; i++) {
                    if (result_list[i]) {
                        result_str = result_str + '[' + curGameRoom.playerInfoList[i]["nickname"] + ']:' + result_list[i]["score"];
                        if (i != finalPlayerInfoList.length - 1) {
                            result_str = result_str + ','
                        }
                    }
                }
                var title = '房间号【' + curGameRoom.roomID.toString() + '】';
                var desc = result_str;
                cutil.share_func(title, desc);
            }
        });
    },

    update_player_info: function (panle_idx, serverSitNum, finalPlayerInfo, win_idx, curGameRoom) {
        win_idx = win_idx >= 0 ? win_idx : -1;
        cc.log("finalPlayerInfo:",finalPlayerInfo);
        var cur_player_info_panel = this.player_panels[panle_idx];
        var playerInfo = curGameRoom.playerInfoList[serverSitNum];
        cur_player_info_panel.getChildByName("name_label").setString(playerInfo["nickname"]);
        // cur_player_info_panel.getChildByName("userid_label").setString("ID:" + playerInfo["userId"].toDouble().toString());
        var frame_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "frame_img");
        cur_player_info_panel.reorderChild(frame_img, 1);
        var owner_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "owner_img");
        cur_player_info_panel.reorderChild(owner_img, 2);
        var id_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "id_label");
        id_label.setString("ID:" + playerInfo["userId"].toString());
        //扣点点麻将的结算界面部分 //没用了 可以注释掉
        var kong_num =finalPlayerInfo["continue_kong"] + finalPlayerInfo["exposed_kong"];
        cur_player_info_panel.getChildByName("num_label1").setString(kong_num);
        cur_player_info_panel.getChildByName("num_label2").setString(finalPlayerInfo["concealed_kong"]);
        cur_player_info_panel.getChildByName("num_label3").setString(finalPlayerInfo["win_times"]);

        owner_img.setVisible(playerInfo["is_creator"]);
        cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function(img){
            if (!cc.sys.isObjectValid(cur_player_info_panel)) {
                return;
            }
            if(cur_player_info_panel.getChildByName("portrait_sprite")){
                cur_player_info_panel.getChildByName("portrait_sprite").removeFromParent();
            }
            var portrait_sprite  = new cc.Sprite(img);
            portrait_sprite.setName("portrait_sprite");
            portrait_sprite.setScale(81/portrait_sprite.getContentSize().width);
            portrait_sprite.x = cur_player_info_panel.getContentSize().width * 0.29;
            portrait_sprite.y = cur_player_info_panel.getContentSize().height * 0.675;
            cur_player_info_panel.addChild(portrait_sprite);
        });
        var final_score = finalPlayerInfo["score"];
        cur_player_info_panel.getChildByName("score_label").setString(final_score.toString());
        cur_player_info_panel.getChildByName("score_label").color = (final_score >= 0 ? cc.color(19, 150, 99) : cc.color(236, 88, 60));
        var win_title_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "win_title_img");
        if(win_idx < 0){
            win_title_img.setVisible(false);
        }else {
            cur_player_info_panel.reorderChild(win_title_img, 3);
            win_title_img.setVisible(true);
        }
    },

	onHide: function () {
		this.finalResultFlag = false;
	}

});
