"use strict"
var LL7SettlementUI = UIBase.extend({
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/LL7SettlementUI.json";
		this.setLocalZOrder(const_val.SettlementZOrder)
	},
	initUI: function () {
		var self = this;
		var confirm_btn = this.rootUINode.getChildByName("settlement_panel").getChildByName("confirm_btn");

		function confirm_btn_event(sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				self.hide();
				//重新开局
				var player = h1global.player();
				if (player) {
					player.curGameRoom.updatePlayerState(player.serverSitNum, 1);
					h1global.curUIMgr.gameroomprepare_ui.show_prepare();
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("reset");
					player.prepare();
					if (h1global.curUIMgr && h1global.curUIMgr.ll7maidi_ui) {
						h1global.curUIMgr.ll7maidi_ui.hide();
					}
				} else {
					cc.warn('player undefined');
				}
			}
		}

		confirm_btn.addTouchEventListener(confirm_btn_event);
		//单局结算分享
		this.rootUINode.getChildByName("settlement_panel").getChildByName("share_btn").addTouchEventListener(function (sender, eventType) {
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
		});
		if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
			this.rootUINode.getChildByName("settlement_panel").getChildByName("share_btn").setVisible(false);
		}
	},

	setPlaybackLayout: function (replay_btn_func) {
		// let replay_btn = ccui.helper.seekWidgetByName(this.rootUINode, "replay_btn");
		let replay_btn = this.rootUINode.getChildByName("settlement_panel").getChildByName("replay_btn");
		let self = this;
		replay_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				if (replay_btn_func) replay_btn_func();
				if (self.is_show) {
					self.hide();
				}
			}
		});
		replay_btn.setVisible(true);
		// let back_hall_btn = ccui.helper.seekWidgetByName(this.rootUINode, "back_hall_btn");
		let back_hall_btn = this.rootUINode.getChildByName("settlement_panel").getChildByName("back_hall_btn");
		back_hall_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				h1global.runScene(new GameHallScene());
			}
		});
		back_hall_btn.setVisible(true);

		// ccui.helper.seekWidgetByName(this.rootUINode, "share_btn").setVisible(false);
		// ccui.helper.seekWidgetByName(this.rootUINode, "confirm_btn").setVisible(false);
		this.rootUINode.getChildByName("settlement_panel").getChildByName("share_btn").setVisible(false);
		this.rootUINode.getChildByName("settlement_panel").getChildByName("confirm_btn").setVisible(false);
	},

	show_by_info: function (roundRoomInfo, serverSitNum, curGameRoom, confirm_btn_func, replay_btn_func) {
		cc.log("结算==========>:");
		cc.log("roundRoomInfo :  ", roundRoomInfo);
		var self = this;
		this.show(function () {
			//如果是投降 直接显示结算界面
			if (roundRoomInfo.surrender && roundRoomInfo.surrender === 1) {
				self.update_settlement_panel(roundRoomInfo, serverSitNum, curGameRoom, confirm_btn_func, replay_btn_func);
				return;
			}
			self.rootUINode.getChildByName("settlement_panel").setVisible(false);
			self.rootUINode.getChildByName("koudi_panel").setVisible(true);
			var koudi_panel = self.rootUINode.getChildByName("koudi_panel");
			var rootPanel = koudi_panel.getChildByName("koudi_tiles_panel");
			var check_list = [23, 22, 21, 20, 43, 42, 41, 40, 55, 54, 53, 52];
			for (var i = 0; i < 8; i++) {
				var tile = rootPanel.getChildByName("tile_img_" + i);
				let num = roundRoomInfo["cover_pokers"][i];
				if (num > 0) {
					tile.loadTexture(cutil_ll7.getCardImgPath(num), ccui.Widget.PLIST_TEXTURE);
					tile.setVisible(true);
					if (check_list.indexOf(num) == -1) {
						tile.setColor(const_ll7.COLOR_GREY);
					}
				} else {
					tile.setVisible(false);
				}
			}
			var is_lord_koudi = roundRoomInfo.lord_idx == roundRoomInfo.final_idx || roundRoomInfo.partner_idx == roundRoomInfo.final_idx;
			if (is_lord_koudi) {
				koudi_panel.getChildByName("koudi_img").loadTexture("res/ui/LL7SettlementUI/dealer_img.png");
				koudi_panel.ignoreContentAdaptWithSize(true);
			}
			koudi_panel.getChildByName("koudi_img").setVisible(true);
			koudi_panel.getChildByName("koudi_label").setString(is_lord_koudi ? "0分" : roundRoomInfo["cover_score"] + "分");
			koudi_panel.getChildByName("score_label").setString(is_lord_koudi ? "庄家抠底" : roundRoomInfo["cover_mul"] + "倍抠底");

			self.rootUINode.runAction(cc.sequence(
				cc.delayTime(3),
				cc.callFunc(function () {
					cc.log("3秒后 显示结算界面。");
					self.update_settlement_panel(roundRoomInfo, serverSitNum, curGameRoom, confirm_btn_func, replay_btn_func);
				}))
			)
		});
	},

	update_settlement_panel: function (roundRoomInfo, serverSitNum, curGameRoom, confirm_btn_func, replay_btn_func) {
		var player = h1global.player();
		if (!player) {
			return;
		}
		var self = this;
		self.rootUINode.getChildByName("settlement_panel").setVisible(true);
		self.rootUINode.getChildByName("koudi_panel").setVisible(false);
		var sum_score = 0 // 闲家总得分
		//抓分阶段
		for (var k in roundRoomInfo["player_info_list"]) {
			if (k == roundRoomInfo.lord_idx || k == roundRoomInfo.partner_idx) {
				// sum_score -= roundRoomInfo["player_info_list"][k]["poker_score"]
			} else {
				sum_score += roundRoomInfo["player_info_list"][k]["poker_score"]
			}
		}
		//扣底阶段
		var is_lord_koudi = roundRoomInfo.lord_idx == roundRoomInfo.final_idx || roundRoomInfo.partner_idx == roundRoomInfo.final_idx;
		// if (!is_lord_koudi) {
		//     sum_score += roundRoomInfo["cover_score"]
		// }
		var is_lord = serverSitNum == roundRoomInfo.lord_idx;
		var is_partner = serverSitNum == roundRoomInfo.partner_idx;
		var is_surrender = roundRoomInfo.surrender && roundRoomInfo.surrender === 1;
		var is_lord_win = parseInt(roundRoomInfo["score_list"][roundRoomInfo.lord_idx]) >= 0 ? true : false;//更新赢家

		// self.update_score_label_0(roundRoomInfo["player_info_list"][serverSitNum]["poker_score"],is_lord_win);
		self.show_title(sum_score, is_lord, is_partner, is_surrender, is_lord_koudi , roundRoomInfo["score_list"][serverSitNum])
		self.update_score_label_0(sum_score, roundRoomInfo["cover_score"], is_lord_koudi, is_surrender, is_lord_win, roundRoomInfo["final_control_type"]);
		self.update_score_label_1(roundRoomInfo["cover_score"], is_lord_koudi);
		self.show_rules(curGameRoom);
		var confirm_btn = self.rootUINode.getChildByName("settlement_panel").getChildByName("confirm_btn");
		var result_btn = self.rootUINode.getChildByName("settlement_panel").getChildByName("result_btn");
		var share_btn = self.rootUINode.getChildByName("settlement_panel").getChildByName("share_btn");
		if (confirm_btn_func) {
			self.rootUINode.getChildByName("settlement_panel").getChildByName("result_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType == ccui.Widget.TOUCH_ENDED) {
					self.hide();
					confirm_btn_func();
				}
			});
			confirm_btn.setVisible(false);
			result_btn.setVisible(true);
			share_btn.setVisible(true);
		} else if (replay_btn_func) {
			self.setPlaybackLayout(replay_btn_func)
		} else {
			confirm_btn.setVisible(true);
			result_btn.setVisible(false);
		}
		//更新各个玩家的得分
		for (var k in roundRoomInfo["score_list"]) {
			cc.log(k);
			var curSitNum = player.server2CurSitNum(k);
			this.set_cut_score_action(this.rootUINode.getChildByName("cut_score_img_" + curSitNum), roundRoomInfo["score_list"][k] > 0 ? "+" + roundRoomInfo["score_list"][k].toString() : roundRoomInfo["score_list"][k].toString());
		}
		//添加首七动画,如果是首7就播放
		var is_lord_shou7 = roundRoomInfo.bonus_idx >= 0
		if (is_lord_shou7) {
			this.set_shou7_action(this.rootUINode.getChildByName("settlement_panel").getChildByName("shou7_img"));
		}

	},

	show_rules: function (curGameRoom) {
		var shareStr = cutil.get_share_desc(curGameRoom, const_val.LvLiang7);
		var rule_label = this.rootUINode.getChildByName("settlement_panel").getChildByName("rule_label");
		rule_label.setString(shareStr);
	},

	show_title: function (score, is_lord, is_partner, is_surrender, is_lord_koudi ,my_score) {
		var bg_img = this.rootUINode.getChildByName("settlement_panel").getChildByName("bg_img");
		var win_title = this.rootUINode.getChildByName("settlement_panel").getChildByName("win_title");
		this.rootUINode.getChildByName("settlement_panel").getChildByName("sum_label").setString("+" + score.toString());
		win_title.ignoreContentAdaptWithSize(true);
		cc.log(parseInt(score));
	    // var rule_label =  this.rootUINode.getChildByName("settlement_panel").getChildByName("rule_label");
		if (parseInt(my_score) >= 0) {
			//胜利
			win_title.loadTexture("res/ui/LL7SettlementUI/win_title.png");
		} else {
			//失败
			win_title.loadTexture("res/ui/LL7SettlementUI/fail_title.png");
		}
		
	},

	update_score_label_0: function (score, cover_score, is_lord_koudi, is_surrender, is_lord_win, final_control_type) {
		var zhuafen = parseInt(score) - ( is_lord_koudi ? 0 : parseInt(cover_score));
		this.rootUINode.getChildByName("settlement_panel").getChildByName("score_label_0").setString(zhuafen.toString());
		this.rootUINode.getChildByName("settlement_panel").getChildByName("mul_img").setVisible(true);
		this.rootUINode.getChildByName("settlement_panel").getChildByName("mul_label").setVisible(true);
		if (is_surrender) {
			this.rootUINode.getChildByName("settlement_panel").getChildByName("mul_img").setVisible(false);
			this.rootUINode.getChildByName("settlement_panel").getChildByName("mul_label").setVisible(false);
			this.rootUINode.getChildByName("settlement_panel").getChildByName("surrender_img").setVisible(true);
			return;
		}
		// 这里显示翻几倍
		var mul = 1;
		var max_level = h1global.player().curGameRoom.max_level;
		if (score == 0) {
			mul = max_level;
		} else if (score < 40) {
			mul = 2;
		} else if (score < 120) {
			mul = 1;
		} else {
			var mul_score = score - 120;
			var mul_level = (mul_score / 40 + 1 + mul);
			mul = mul_level > max_level ? max_level : mul_level;
		}
		// 情况2 ： 分数小于80分 且 闲家赢了
		if (h1global.player().curGameRoom.bottom_level && score < 80 && !is_lord_win) {
			mul = 0;
		}
		//抠底加级
		if (h1global.player().curGameRoom.bottom_level && !is_lord_koudi && !is_lord_win) {
			cc.log("抠底加级前:", mul)
			switch (final_control_type & 3) {
				case 1:
					mul += 1;
					break;
				case 2:
					mul += 2;
					break;
				case 3:
					mul += 4;
					break;
				default:
					break;
			}
		}
		cc.log("抠底加级后:", mul);
		mul = mul > max_level ? max_level : mul;
		cc.log("上限:", mul);
		this.rootUINode.getChildByName("settlement_panel").getChildByName("mul_label").setString("X" + parseInt(mul));
	},

	update_score_label_1: function (score, is_lord_koudi) {
		this.rootUINode.getChildByName("settlement_panel").getChildByName("score_label_1").setString(is_lord_koudi ? 0 : score.toString());
	},

	set_cut_score_action: function (img, str) {
		img.setVisible(true);
		img.setOpacity(0);
		if (str[0] == "-") {
			img.loadTexture("LL7GameRoomUI/blue_score_img.png", ccui.Widget.PLIST_TEXTURE);
			img.getChildByName("blue_score_label").setVisible(true);
			img.getChildByName("score_label").setVisible(false);
			img.getChildByName("blue_score_label").setString(str);
		} else {
			img.getChildByName("score_label").setString(str);
		}

		var action = cc.Spawn.create(
			cc.moveBy(0.42, 0, 52),
			cc.fadeIn(0.42)
		);
		img.runAction(action);
	},

	set_shou7_action: function (img) {
		img.setVisible(true);
		img.setOpacity(77);
		img.setScale(5);
		var action = cc.Spawn.create(
			// cc.moveBy(0.42, 0, 52),
			cc.scaleTo(0.4, 1),
			// cc.fadeIn(0.42)
			cc.fadeIn(0.4)
		);
		img.runAction(action);
	}

});
