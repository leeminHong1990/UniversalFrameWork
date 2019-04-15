"use strict";
var LL7PlayerInfoSnippet = UISnippet.extend({
	ctor: function (rootUINodeRet, serverSitNum) {
		this._super(rootUINodeRet);
		this.serverSitNum = serverSitNum;
		if (serverSitNum < 0 || serverSitNum > 4) {
			cc.error("PlayerInfoSnippet: serverSitNum out of range", serverSitNum);
		}
		this.uiGetter = this.defaultUiGetter;
	},

	initUI: function () {
		this.idx_p_list = [cc.p(0.25, 0.25), cc.p(0.71, 0.55), cc.p(0.71, 0.77), cc.p(0.3, 0.77), cc.p(0.3, 0.55)]
	},

	defaultUiGetter: function (serverSitNum, name) {
		if (name == "ready_panel") {
			return this.rootUINode.getChildByName("player_info_panel").getChildByName(name);
		}
		var cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel").getChildByName("player_info_panel");
		if (name == "player_info_panel") {
			return cur_player_info_panel;
		}
		if (name == "grab_score_label") {
			return cur_player_info_panel.getChildByName("grab_panel").getChildByName(name);
		}
		return cur_player_info_panel.getChildByName(name);
	},

	setCustomUiGetter: function (func) {
		this.uiGetter = func;
	},

	setVisible: function (is_show) {
		this.rootUINode.setVisible(is_show);
	},

	update_player_info_panel: function (playerInfo) {
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		var serverSitNum = this.serverSitNum;

		if (!playerInfo) {
			this.setVisible(false);
			return;
		}
		this.setVisible(true);
		var name_label = this.uiGetter(serverSitNum, "name_label");
		var nickname = playerInfo["nickname"];
		nickname = cutil.info_sub(nickname, 4);
		name_label.setString(nickname);
		var frame_img = this.uiGetter(serverSitNum, "frame_img");
		frame_img.setTouchEnabled(true);
		var self = this;
		frame_img.addTouchEventListener(function (sender, eventType) {
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				var player = h1global.player();
				if (player) {
					var idx = player.server2CurSitNum(serverSitNum);
					h1global.curUIMgr.gameplayerinfo_ui.show_by_info(playerInfo, serverSitNum, self.idx_p_list[idx]);
				}
			}
		});

		cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function (img) {
			var player_info_panel = self.uiGetter(serverSitNum, "player_info_panel");
			if (cc.sys.isObjectValid(player_info_panel)) {
				let oldPortrait = self.uiGetter(serverSitNum, "portrait_sprite");
				let oldZOrder = oldPortrait.getLocalZOrder();
				oldPortrait.removeFromParent();
				let portrait_sprite = new cc.Sprite(img);
				portrait_sprite.setName("portrait_sprite");
				portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
				portrait_sprite.x = player_info_panel.getContentSize().width * 0.5;
				portrait_sprite.y = player_info_panel.getContentSize().height * 0.5;
				portrait_sprite.setLocalZOrder(oldZOrder - 1);
				player_info_panel.addChild(portrait_sprite);
			}
		}, playerInfo["uuid"].toString() + ".png");

		this.update_score(playerInfo["total_score"]);
		var player = h1global.player();
		if (!player || !player.curGameRoom) {
			return;
		}
		var owner_img = this.uiGetter(serverSitNum, "owner_img");
		owner_img.setVisible(playerInfo['is_creator']);

		var dealer_img = this.uiGetter(serverSitNum, "foreman_img");
		dealer_img.setVisible(player.curGameRoom.dealerIdx === serverSitNum);
		if (player.startActions["GameRoomUI"]) {
			this.update_foreman_idx(true);
		}
	},

	update_score: function (score) {
		if (cc.sys.isObjectValid(this.rootUINode)) {
			var score_label = this.uiGetter(this.serverSitNum, "score_label");
			score_label.ignoreContentAdaptWithSize(true);
			score_label.setString(score == undefined ? "0" : "" + score);
		}
	},

	update_grab_score: function (score, is_show) {
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		this.uiGetter(this.serverSitNum, "grab_panel").setVisible(is_show);
		let label = this.uiGetter(this.serverSitNum, "grab_score_label");
		label.setVisible(is_show);
		let player = h1global.player();
		if (player) {
			var index = player.server2CurSitNum(this.serverSitNum);
			if (index === 0) {
				label.setString(score);
			} else {
				label.setString(score);
			}
		} else {
			label.setString(score);
		}
	},

	update_player_online_state: function (state) {
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		var state_img = this.uiGetter(this.serverSitNum, "state_img");
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

	update_foreman_idx: function (isDealer, runAction) {
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		runAction = isDealer ? runAction : false;
		var dealer_img = this.uiGetter(this.serverSitNum, "foreman_img");
		if (isDealer) {
			this.uiGetter(this.serverSitNum, "friend_img").setVisible(false);
		}
		dealer_img.setVisible(isDealer);
		if (runAction) {
			dealer_img.stopAllActions();
			dealer_img.setScale(5);
			dealer_img.runAction(cc.sequence(cc.scaleTo(0.5, 1), cc.scaleTo(1, 1)));
		}
	},

	update_friend_idx: function (isFriend, runAction) {
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		runAction = isFriend ? runAction : false;
		var dealer_img = this.uiGetter(this.serverSitNum, "friend_img");
		if (isFriend) {
			this.uiGetter(this.serverSitNum, "foreman_img").setVisible(false);
		}

		dealer_img.setVisible(isFriend);
		if (runAction) {
			dealer_img.stopAllActions();
			dealer_img.setScale(5);
			dealer_img.runAction(cc.sequence(cc.scaleTo(0.5, 1), cc.scaleTo(1, 1)));
		}
	},

	update_ready_state: function (state) {
		let ready_panel = this.uiGetter(this.serverSitNum, "ready_panel");
		ready_panel.setVisible(state === 1);
		if (state === 1) {
			let player = h1global.player();
			if (player && player.curGameRoom) {
				let index = player.server2CurSitNum(this.serverSitNum);
				let flip = index === 3 || index === 4 || index === 0;
				ready_panel.setScaleX(flip ? -1 : 1);
				let img = ready_panel.getChildByName("ready_img");
				img.setScaleX(flip ? -1 : 1);
			}
		}
	},

	set_grab_visible: function (is_show) {
		this.uiGetter(this.serverSitNum, "grab_panel").setVisible(is_show)
	}
});
