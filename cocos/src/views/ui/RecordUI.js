"use strict";
var RecordUI = UIBase.extend({
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/RecordUI.json";
	},

	initUI: function () {
		let info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
		this.nickname = info_dict["nickname"];

		this.record_panel = this.rootUINode.getChildByName("record_panel");
		this.title_img = this.record_panel.getChildByName("title_img");
		this.recorddetails_panel = this.record_panel.getChildByName("recorddetails_panel");
		let player = h1global.player();
		// cc.log("player.gameRecordList:", player.gameRecordList);
		let self = this;
		this.return_btn = this.record_panel.getChildByName("return_btn");
		this.return_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.hide();
			}
		});

		this.backnum_panel = this.record_panel.getChildByName("backnum_panel");
		this.backnum_panel_return_btn = this.backnum_panel.getChildByName("return_btn");
		this.backnum_panel_return_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.backnum_panel.setVisible(false);
			}
		});

		this.backnum_panel_ok_btn = this.backnum_panel.getChildByName("ok_btn");
		this.backnum_panel_backnum_tf = this.backnum_panel.getChildByName("backnum_tf");
        this.backnum_panel_backnum_tf .setPlaceHolderColor(cc.color(255,255,255,255));
        this.backnum_panel_backnum_tf .setTextColor(cc.color(128,59,31));
		//观看他人回放
		this.backnum_panel_ok_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				var text = self.backnum_panel_backnum_tf.getString();
				if (self.reqPlayback(text)) {
					self.backnum_panel.setVisible(false);
				}
			}
		});

		this.playback_btn = this.record_panel.getChildByName("playback_btn");
		this.playback_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.backnum_panel.setVisible(true);
				BasicDialogUI.addColorMask(self.backnum_panel, undefined, function () {
					self.backnum_panel.setVisible(false);
				});
				BasicDialogUI.applyShowEffect(self.backnum_panel)
			}
		});
		this.back_btn = this.record_panel.getChildByName("back_btn");

		function back_btn_event(sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.title_img.loadTexture("res/ui/RecordUI/title.png");
				self.recorddetails_panel.setVisible(false);
				self.back_btn.setVisible(false);
				self.return_btn.setVisible(true);
				self.record_scroll.setVisible(true);
				self.playback_btn.setVisible(true);
				self.curState = 0;
			}
		}

		this.back_btn.addTouchEventListener(back_btn_event);

        this.record_scroll = this.record_panel.getChildByName("record_scroll");
		this.recorddetails_scroll = this.recorddetails_panel.getChildByName("recorddetails_scroll");
		// this.updateRecordScroll(0, this.game_history);
		// if(this.game_history_length>0){
		// 	this.rootUINode.getChildByName("main_panel").getChildByName("printed").setVisible(false);
		// }

		this.mem_page_index = 1;
		this.page_show_num = 10;

		this.cur_page_num = 1;//当前页数
		this.max_page_num = 1;//最大页数
		this.mem_total = 0;//战绩总数
		this.init_page_btn_pt();

		cutil.lock_ui();
		if (h1global.player()) {
			h1global.player().getPageGameHistory(0, 10, "",[""]);
		}
	},

	init_page_btn_pt:function () {
		var page_panel = this.rootUINode.getChildByName("record_panel").getChildByName("page_panel");
		var left_page_btn = page_panel.getChildByName("left_page_btn");
		var right_page_btn = page_panel.getChildByName("right_page_btn");

		left_page_btn.hitTest = function (pt) {
			var size = this.getContentSize();
			var bb = cc.rect(-size.width*0.1, -size.height * 0.3, size.width, size.height * 2);
			return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
		};
		right_page_btn.hitTest = function (pt) {
			var size = this.getContentSize();
			var bb = cc.rect(-size.width*0.1, -size.height * 0.3, size.width, size.height * 2);
			return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
		};
	},

	update_game_history:function (game_history, page, size, game_history_length) {
		if(!this.is_show){return;}
		var self = this;
		this.game_history = game_history;
		this.cur_page_num = page+1;//当前页数
		this.mem_total = game_history_length;//成员总人数
		if (game_history_length>0) {
			this.rootUINode.getChildByName("main_panel").getChildByName("printed").setVisible(false);
		}

		this.update_page_panel(self);
	},

	update_page: function (page_panel, index ,total) {
		if (total==0) {
			page_panel.getChildByName("page_label").setString("1/1")
		} else {
			page_panel.getChildByName("page_label").setString(index.toString() + "/" + Math.ceil(total / this.page_show_num).toString())
		}
		if(index == 1){
			page_panel.getChildByName("left_page_btn").setEnabled(false);
		}else{
			page_panel.getChildByName("left_page_btn").setEnabled(true);
		}
		if(total==0 || index == Math.ceil(total / this.page_show_num)){
			page_panel.getChildByName("right_page_btn").setEnabled(false);
		}else{
			page_panel.getChildByName("right_page_btn").setEnabled(true);
		}
	},

	update_page_panel:function(self){
		if(!this.is_show){return;}

		var record_panel = this.rootUINode.getChildByName("record_panel");
		var page_panel = record_panel.getChildByName("page_panel");
		// var info_panel = record_panel.getChildByName("record_scroll");


		var game_history = this.game_history;

		this.mem_page_index = this.cur_page_num;

		self.update_page(page_panel, this.cur_page_num, this.mem_total);

		page_panel.getChildByName("left_page_btn").addTouchEventListener(function (sender, eventType) {
			if(eventType === ccui.Widget.TOUCH_ENDED){
				if(self.mem_page_index <= 0){
					return;
				}
				self.mem_page_index--;
				cutil.lock_ui();
				h1global.player().getPageGameHistory(self.mem_page_index-1, self.page_show_num, "",[""]);
			}
		});

		page_panel.getChildByName("right_page_btn").addTouchEventListener(function (sender, eventType) {
			if(eventType === ccui.Widget.TOUCH_ENDED){
				if(self.mem_page_index >= Math.ceil(self.mem_total/self.page_show_num)){
					return;
				}
				self.mem_page_index++;
				cutil.lock_ui();
				h1global.player().getPageGameHistory(self.mem_page_index-1, self.page_show_num, "",[""]);
			}
		});
		this.updateRecordScroll(0, game_history);
	},

	reqPlayback: function (text) {
		if (cutil.isPositiveNumber(text)) {
			let player = h1global.player();
			if (!player) {
				cc.log('player undefined');
				return false;
			}
			player.reqPlayback(cc.isNumber(text) ? text : parseInt(text));
			return true;
		} else {
			h1global.globalUIMgr.info_ui.show_by_info("回放码错误！")
		}
		return false;
	},

	update_record_title: function (recordList) {
		let round_result = recordList['round_result'];
		this.title_img.loadTexture("res/ui/RecordUI/recorddetails_title.png");
		var roomid_label = this.recorddetails_panel.getChildByName("name_panel").getChildByName("roomid_label");
		roomid_label.setString("No." + recordList["roomID"].toString() + " (" + const_val.GameType2CName[recordList["game_type"]] + ")");
		let user_info_list = recordList["user_info_list"];
		this.update_base_info(this.recorddetails_panel, round_result, user_info_list);
	},

	update_base_info: function (parent, round_result, user_info_list, doSubStr) {
		var date_label = parent.getChildByName("name_panel").getChildByName("date_label");
		var time_label = parent.getChildByName("name_panel").getChildByName("time_label");
		date_label.setString(round_result[0]["date"]);
		let time_text = round_result[0]["time"].split(":", 2);
		for (var i = 0; i < time_text.length; i++) {
			if (time_text[i] < 10) {
				time_text[i] = "0" + time_text[i];
			}
		}
		time_label.setString(time_text[0] + ":" + time_text[1]);

		let dataIter = cutil.simpleIterWithoutNull(user_info_list);
		for (var i = 0; i < user_info_list.length; i++) {
			let player_label = parent.getChildByName("player_label" + i.toString());
			let item = dataIter.next();
			if (item) {
				if (doSubStr) {
					player_label.setString(cutil.info_sub(item["nickname"], 4));
				} else {
                    player_label.setString(cutil.info_sub_ver2(item["nickname"], 4));
				}
				player_label.setVisible(true);
			} else {
				player_label.setVisible(false);
			}
		}
	},

	updateRecordScroll: function (curState, recordList) {
		// recordList反向
		// recordList = recordList.concat([]).reverse();
		recordList = recordList.concat([]);
		let self = this;

		function shareFunc(itemData) {
			let share_title = switches.gameName + ' 回放码【' + itemData['recordId'] + '】';
			let share_desc = '玩家[' + self.nickname + ']分享了游戏录像,点击战绩-观看他人回放,输入回放码即可查看。';
			if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
				jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", true, switches.share_android_url, share_title, share_desc);
			} else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
				jsb.reflection.callStaticMethod("WechatOcBridge", "callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", true, switches.share_ios_url, share_title, share_desc);
			} else {
				cc.log("share not support web", share_title, share_desc);
			}
		}

		function replayFunc(itemData) {
			self.reqPlayback(itemData['recordId']);
		}

		let smallItemDict = {};
		let bigItemDict = {};

		for (var gameType in table_config) {
			let configData = table_config[gameType]["RECORD_UI"];
			if (configData) {
				let uiClass = configData["SMALL_CLASS"];
				let uiJson = configData["SMALL_JSON"];
				let itemUI = eval("new " + uiClass + "('" + uiJson + "')");
				itemUI.setShareBtnClickListener(shareFunc);
				itemUI.setReplayBtnClickListener(replayFunc);
				smallItemDict[gameType] = itemUI;

				uiClass = configData["BIG_CLASS"];
				uiJson = configData["BIG_JSON"];
				itemUI = eval("new " + uiClass + "('" + uiJson + "')");
				itemUI.setDetailsBtnClickListener(function (data) {
					self.clickDetailListener(data, smallItemDict);
				});
				bigItemDict[gameType] = itemUI;
			}
		}
		UICommonWidget.update_scroll_items2(this.record_scroll, recordList, function (itemData) {
			itemData = JSON.parse(itemData);
			let type = itemData['game_type'];
			if (bigItemDict[type]) {
				return bigItemDict[type].resourceFileName;
			}
			cc.error("type not found support", type);
		}, function (curItem, curInfo, index) {
			curInfo = JSON.parse(curInfo);
			let type = curInfo['game_type'];
			if (bigItemDict[type]) {
				bigItemDict[type].update(curItem, curInfo);
			} else {
				cc.error("type not found support", type);
			}
		});
	},

	clickDetailListener: function (data, smallItemDict) {
		this.back_btn.setVisible(true);
		this.return_btn.setVisible(false);
		this.recorddetails_panel.setVisible(true);
		this.record_scroll.setVisible(false);
        this.playback_btn.setVisible(false);
		this.update_record_title(data);
		var gameType = data['game_type'];
		var num = table_config[gameType]["RECORD_UI"]["TITLE_ADAPTER_NUM"];
		var palyer_num = data["user_info_list"].length;
		// 标题ui位置修改
		eval("this.adapterTitle" + num + "(" + palyer_num +")");
		UICommonWidget.update_scroll_items2(this.recorddetails_scroll, data['round_result'],
			function (itemData) {
				if (smallItemDict[gameType]) {
					return smallItemDict[gameType].resourceFileName;
				}
				cc.error("type not found support", gameType);
			}, function (view, itemData, index) {
				if (smallItemDict[gameType]) {
					smallItemDict[gameType].update(view, itemData, index);
				} else {
					cc.error("type not found support", gameType);
				}
			});
	},

	// 适配3人的ui
    adapterTitle3: function (palyer_num) {
        this.recorddetails_panel.getChildByName("num_label");
        let width = this.recorddetails_panel.width;
        this.recorddetails_panel.getChildByName("num_label")
            .setPositionX(width * 0.05);
        this.recorddetails_panel.getChildByName("round_time_label")
            .setPositionX(width * 0.16);
        for (var i = 0; i < 5; i++) {
            let label = this.recorddetails_panel.getChildByName("player_label" + i);
            if (i > 2 && label) {
                label.setVisible(false);
            } else {
                label.setPositionX(width * (0.32 + i * 0.18));
            }
        }
    },
    // 适配4人的ui
    adapterTitle4: function (palyer_num) {
        let width = this.recorddetails_panel.width;
        this.recorddetails_panel.getChildByName("num_label")
            .setPositionX(width * 0.05);
        this.recorddetails_panel.getChildByName("round_time_label")
            .setPositionX(width * 0.13);
        for (var i = 0; i < 5; i++) {
            let label = this.recorddetails_panel.getChildByName("player_label" + i);

            if ((i > 3 && label) || (palyer_num && i>palyer_num-1)) {
                label.setVisible(false);
            } else {
                label.setPositionX(width * (0.24 + i * 0.14));
            }
        }
    },
    // 适配4人的ui
    adapterTitle5: function (palyer_num) {
        let width = this.recorddetails_panel.width;
        this.recorddetails_panel.getChildByName("num_label")
            .setPositionX(width * 0.05);
        this.recorddetails_panel.getChildByName("round_time_label")
            .setPositionX(width * 0.13);
        for (var i = 0; i < 5; i++) {
            this.recorddetails_panel.getChildByName("player_label" + i)
                .setPositionX(width * (0.24 + i * 0.105));
        }
    },

});