// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var CommunicateUI = UIBase.extend({
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/CommunicateUI.json";
		this.needReload = false;
		this.setLocalZOrder(const_val.CommunicateZOrder)
	},

	initUI: function () {
		this.communicate_panel = this.rootUINode.getChildByName("communicate_panel");
		this.adapterIME();
		var player = h1global.player();
		var self = this;
		this.rootUINode.getChildByName("bg_panel").addTouchEventListener(function (sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				self.hide();
			}
		});

		var btn_list = [this.communicate_panel.getChildByName("emot_btn"), this.communicate_panel.getChildByName("voice_btn"), this.communicate_panel.getChildByName("fiscal_btn")];
		var panel_list = [this.communicate_panel.getChildByName("emot_scroll"), this.communicate_panel.getChildByName("voice_scroll"), this.communicate_panel.getChildByName("fiscal_scroll")];

		this.cur_tab = UICommonWidget.create_tab(btn_list, panel_list);
		this.communicate_panel.getChildByName("send_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				self.update_send_msg();
				self.hide();
			}
		});
		// 表情
		cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
		var cache = cc.spriteFrameCache;
		var plist_path = "res/effect/biaoqing.plist";
		var png_path = "res/effect/biaoqing.png";
		cache.addSpriteFrames(plist_path, png_path);
		cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

		UICommonWidget.update_scroll_items(panel_list[0],
			[
				// [ 1,  2,  3, 4],
				// [ 5,  6,  7, 8],
				// [ 9,  10, 11,12],
				// [13,14,15,16],
				[12, 1, 7],
				[8, 2, 9],
				[3, 4, 10],
				[5, 6, 11],
			],
			function (curItem, itemInfo) {
				for (var i = 0; i < 3; i++) {
					var emot_img = curItem.getChildByName("emot_img" + i.toString());
					if (itemInfo[i]) {
						emot_img.setVisible(true);
						emot_img.addTouchEventListener(function (sender, eventType) {
							if (eventType == ccui.Widget.TOUCH_ENDED) {
								// 发送表情
								if (self.canTouch("emotion_time",const_val.SEND_PUNISHMENT_TIME)) {
									player.sendEmotion(sender.num);
								}
								self.hide();
							}
						});
						emot_img.num = itemInfo[i];
						// emot_img.loadTexture("Emot/biaoqing_" + itemInfo[i].toString() + "_1.png", ccui.Widget.PLIST_TEXTURE);
						emot_img.loadTexture("biaoqing/emotion_" + itemInfo[i].toString() + "_0.png", ccui.Widget.PLIST_TEXTURE);
						emot_img.ignoreContentAdaptWithSize(true);
						if (itemInfo[i] == 7) {
							emot_img.setPositionX(emot_img.getPositionX() - 10)
						}
						if (itemInfo[i] == 9) {
							emot_img.setPositionX(emot_img.getPositionX() + 15)
						}
					} else {
						emot_img.setVisible(false);
					}
				}
			}
		);
		this.update_msg_scroll();
		this.update_fiscal_scroll();
	},

	update_msg_scroll: function () {
		var player = h1global.player();
		var self = this;
		var table_voice_index = cc.sys.localStorage.getItem(cutil.keyConvert("LANGUAGE", h1global.curUIMgr.gameType));
		let midList = table_game_msg[h1global.curUIMgr.gameType][table_voice_index];
		var msgList = [];
		for (var i = 0; i < midList.length; i++) {
			if (table_msg[midList[i]]) {
				msgList.push(table_msg[midList[i]]);
			} else {
				cc.warn("msg not found", midList[i]);
			}
		}
		// 语音文字
		UICommonWidget.update_scroll_items(this.communicate_panel.getChildByName("voice_scroll"),
			msgList,
			function (curItem, itemInfo, idx) {
				var bg_img = curItem.getChildByName("bg_img");
				var content_label = curItem.getChildByName("content_label");
				if (idx + 1 < 10) {
					content_label.setString(" " + (idx + 1).toString() + "." + cutil.info_sub_ver2(itemInfo['name'], 17));
				} else {
					content_label.setString((idx + 1).toString() + "." + cutil.info_sub_ver2(itemInfo['name'], 17));
				}
				bg_img.num = itemInfo['id'];
				bg_img.addTouchEventListener(function (sender, eventType) {
					if (eventType == ccui.Widget.TOUCH_ENDED) {
						// 发送语音文字
						if (self.canTouch("msg_time",const_val.SEND_PUNISHMENT_TIME)) {
							player.sendMsg(sender.num);
						}
						self.hide();
					}
				});
			}
		);
	},

	update_send_msg: function () {
		var player = h1global.player();
		var msg_tf = this.communicate_panel.getChildByName("msg_tf");
		// player.sendMsg(-1, msg_tf.getString());
		player.sendMsg(-1, filterWord.RunFilterWord(msg_tf.getString(), "*", 1));
		msg_tf.setString("");
	},

	adapterIME: function () {
		if (!(cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
			return;
		}
		if (!cc.sys.isObjectValid(this.communicate_panel)) {
			return;
		}
		this.communicate_panel.getChildByName("msg_tf").addEventListener(function (target, event) {
			if (ccui.TextField.EVENT_DETACH_WITH_IME === event) {
				if (h1global.curUIMgr.communicate_ui && h1global.curUIMgr.communicate_ui.is_show) {
					UICommonWidget.resetToOriginPosition(h1global.curUIMgr.communicate_ui.rootUINode)
				}
			} else if (ccui.TextField.EVENT_ATTACH_WITH_IME === event) {
				if (h1global.curUIMgr.communicate_ui && h1global.curUIMgr.communicate_ui.is_show) {
					UICommonWidget.addOriginPosition(h1global.curUIMgr.communicate_ui.rootUINode, 0, cc.winSize.height * 0.5)
				}
			}
		});
	},

	onShow: function () {
		var language = cc.sys.localStorage.getItem(cutil.keyConvert("LANGUAGE", h1global.curUIMgr.gameType));
		if (this.language != language) {
			this.language = language;
			this.update_msg_scroll();
		}
		UICommonWidget.resetToOriginPosition(h1global.curUIMgr.communicate_ui.rootUINode);
	},

	canTouch: function (key,wait_time) {
		if (!h1global.player()) {
			return false
		}
		let player = h1global.player();
		if (!player[key]) {
			return true
		}
		var intervalTime = Math.round(new Date() / 1000) - player[key];
		if (intervalTime < wait_time) {
			// var tips_label = this.rootUINode.getChildByName("tips_label");
			if (!h1global.curUIMgr.gameroominfo_ui || !h1global.curUIMgr.gameroominfo_ui.rootUINode) {
				if (h1global.curUIMgr.tylsmjgameroominfo_ui && h1global.curUIMgr.tylsmjgameroominfo_ui.rootUINode) {
					var tips_label = h1global.curUIMgr.tylsmjgameroominfo_ui.rootUINode.getChildByName("tips_label");
				} else {
					return;
				}
			} else {
				var tips_label = h1global.curUIMgr.gameroominfo_ui.rootUINode.getChildByName("tips_label");
			}
			if (!tips_label) {
				tips_label = ccui.Text.create("再次发送需间隔" + Math.ceil(wait_time - intervalTime) + "秒！", "zhunyuan", 30);
				tips_label.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
				tips_label.setColor("#FFFF00");
				h1global.curUIMgr.gameroominfo_ui.rootUINode.addChild(tips_label);
			} else {
				tips_label.setString("再次发送需间隔" + Math.ceil(wait_time - intervalTime) + "秒！");
			}
			tips_label.setVisible(true);
			tips_label.stopAllActions();
			tips_label.runAction(cc.Sequence.create(
				cc.MoveTo.create(0.5, cc.p(tips_label.getPositionX(), tips_label.getPositionY() + 50)),
				cc.CallFunc.create(function () {
					tips_label.setVisible(false);
					tips_label.setPositionY(tips_label.getPositionY() - 50);
				})
			));
			return false;
		} else {
			return true
		}
	},

	update_fiscal_scroll: function () {
		var self = this;
		var fiscal_panel = this.communicate_panel.getChildByName("fiscal_scroll").getChildByName("item_panel");
		var fiscal_btn = fiscal_panel.getChildByName("fiscal_btn");
		var head_btn = fiscal_panel.getChildByName("head_btn");
		fiscal_btn.num = const_val.EFFECT_FISCAL_NUM;
		head_btn.num = const_val.EFFECT_WASH_NUM;

		function _click_func(sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				// 发送语音文字
				if (self.canTouch("effect_time",const_val.EFFECT_PUNISHMENT_TIME)) {
					let player = h1global.player();
					if (player && player.card_num > 5) {
						player.sendEffect(sender.num);
					} else {
						h1global.globalUIMgr.info_ui.show_by_info("您的房卡数量即将不足，无法发放！");
					}
				}
				self.hide();
			}
		}

		fiscal_btn.addTouchEventListener(_click_func);
		head_btn.addTouchEventListener(_click_func);
	}
});