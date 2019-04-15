"use strict";
var DDZPlayerInfoSnippet = UISnippet.extend({
	ctor: function (rootUINodeRet, serverSitNum) {
		this._super(rootUINodeRet);
		this.serverSitNum = serverSitNum;
		if (serverSitNum < 0 || serverSitNum > 2) {
			cc.error("PlayerInfoSnippet: serverSitNum out of range", serverSitNum);
		}
	},

	initUI: function () {
	},

	setVisible: function (is_show) {
		this.rootUINode.setVisible(is_show);
	},

	update_player_info_panel: function (playerInfo) {
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		var serverSitNum = this.serverSitNum;

		var cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel").getChildByName("player_info_panel");
		if (!playerInfo) {
			this.setVisible(false);
			return;
		}
		this.setVisible(true);

		var name_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "name_label");
		var nickname = playerInfo["nickname"];
		nickname = cutil.info_sub(nickname, 4);
		name_label.setString(nickname);
		var frame_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "frame_img");
		frame_img.setTouchEnabled(true);

		frame_img.addTouchEventListener(function (sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				var player = h1global.player();
				if (player) {
					var idx = player.server2CurSitNum(serverSitNum);
					if (idx === 2) {
						h1global.curUIMgr.gameplayerinfo_ui.show_by_info(playerInfo, serverSitNum, cc.p(0.3, 0.71));
					} else {
						h1global.curUIMgr.gameplayerinfo_ui.show_by_info(playerInfo, serverSitNum);
					}
				}
			}
		});
		cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function (img) {
			if (cc.sys.isObjectValid(cur_player_info_panel)) {
				let oldPortrait = cur_player_info_panel.getChildByName("portrait_sprite");
				let oldZOrder = oldPortrait.getLocalZOrder();
				oldPortrait.removeFromParent();
				let portrait_sprite = new cc.Sprite(img);
				portrait_sprite.setName("portrait_sprite");
				portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
				portrait_sprite.x = cur_player_info_panel.getContentSize().width * 0.5;
				portrait_sprite.y = cur_player_info_panel.getContentSize().height * 0.5;
				portrait_sprite.setLocalZOrder(oldZOrder - 1);
				cur_player_info_panel.addChild(portrait_sprite);
			}
		}, playerInfo["uuid"].toString() + ".png");

		this.update_score(playerInfo["total_score"]);
		var player = h1global.entityManager.player();
		if (!player || !player.curGameRoom) {
			return;
		}
		// 更新头像上倍数的代码
		// var multiple_list = cutil.change_fight_dealer_mul_list(player.curGameRoom.fight_dealer_mul_list);
		// this.update_multiple(multiple_list[serverSitNum]);
		// if(player.curGameRoom.dealerIdx === serverSitNum){
		//     this.update_multiple(multiple_list[serverSitNum]*2);
		// }

		var owner_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "owner_img");
		owner_img.setVisible(playerInfo['is_creator']);

		var dealer_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "dealer_img");
		dealer_img.setVisible(player.curGameRoom.dealerIdx === serverSitNum);
		cur_player_info_panel.getChildByName("head_img").setVisible(player.curGameRoom.dealerIdx === serverSitNum);
		cur_player_info_panel.getChildByName("mul_panel").setVisible(false);
		cur_player_info_panel.getChildByName("head_mul_img").setVisible(player.curGameRoom.mul_score_list[serverSitNum] == 2);

		// var light_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "light_img");
		// light_img.setVisible(player.curGameRoom.dealerIdx === serverSitNum);
		let index = player.server2CurSitNum(this.serverSitNum);
		if (index === 1) {
			dealer_img.setPositionX(10);
			cur_player_info_panel.getChildByName("head_mul_img").setPositionX(100);
		}
		if (player.startActions["GameRoomUI"]) {
			this.update_dealer_idx(true);
			// if (player.curGameRoom.dealerIdx === serverSitNum) {
			//     light_img.runAction(cc.sequence(cc.hide(), cc.delayTime(0.1), cc.show(), cc.delayTime(0.1)).repeat(5));
			// }
		}

	},

	update_score: function (score) {
		var cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel").getChildByName("player_info_panel");
		if (cc.sys.isObjectValid(cur_player_info_panel)) {
			var score_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "score_label");
			score_label.ignoreContentAdaptWithSize(true);
			score_label.setString(score == undefined ? "0" : "" + score);
		}
	},

	update_multiple: function (score) {
		var cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel").getChildByName("player_info_panel");
		if (cc.sys.isObjectValid(cur_player_info_panel)) {
			var multiple_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "multiple_label");
			multiple_label.ignoreContentAdaptWithSize(true);
			multiple_label.setString(score == undefined ? "0" : "" + score);
			if (score == -1) {
				multiple_label.setString("0");
			}
		}
	},

	update_player_online_state: function (state) {
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		var state_img = this.rootUINode.getChildByName("player_info_panel").getChildByName("player_info_panel").getChildByName("state_img");
		// if(state == 1){
		// 	// state_label.setString("在线");
		// 	// state_label.setColor(cc.color(215, 236, 218));
		// 	state_img.loadTexture("res/ui/GameRoomUI/state_online.png");
		// 	state_img.setVisible(true);
		// } else
		if (state === 0) {
			// state_label.setString("离线");
			// state_label.setColor(cc.color(255, 0, 0));
			state_img.loadTexture("res/ui/GameRoomUI/state_offline.png");
			state_img.setVisible(true);
		} else {
			state_img.setVisible(false);
		}
	},

	update_dealer_idx: function (isDealer, runAction) {
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		runAction = isDealer ? runAction : false;
		var cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel").getChildByName("player_info_panel");
		var dealer_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "dealer_img");
		cur_player_info_panel.getChildByName("head_img").setVisible(isDealer);
		dealer_img.setVisible(isDealer);
		// var player = h1global.player();
		// if(!player){return;}
		// let index = player.server2CurSitNum(this.serverSitNum);
		// let flip = index === 1;
		// this.rootUINode.getChildByName("player_info_panel").getChildByName("player_info_panel").getChildByName("dealer_img").setScale(-1);
		if (runAction) {
			dealer_img.stopAllActions();
			dealer_img.setScale(5);
			dealer_img.runAction(cc.sequence(cc.scaleTo(0.5, 1), cc.scaleTo(1, 1)));
		}
	},

	update_ready_state: function (state) {
		let ready_panel = this.rootUINode.getChildByName("player_info_panel").getChildByName("ready_panel");
		ready_panel.setVisible(state === 1);
		if (state === 1) {
			let player = h1global.player();
			if (player && player.curGameRoom) {
				let img = ready_panel.getChildByName("ready_img");
				let index = player.server2CurSitNum(this.serverSitNum);
				let flip = index === 1;
				ready_panel.setScaleX(flip ? -1 : 1);
				img.setScaleX(flip ? 1 : -1);
			}
		}
	},

	update_head_mul: function (score) {
		let cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel").getChildByName("player_info_panel");
		cur_player_info_panel.getChildByName("head_mul_img").setVisible(score == 2);
	},


});