var LL7PreviousUI = UIBase.extend({

	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/LL7PreviousUI.json";
	},

	show_by_info: function (serverSitNum, historyList) {
		this.serverSitNum = serverSitNum;
		this.historyList = historyList;
		this.show()
	},

	initUI: function () {
		let panel = this.rootUINode.getChildByName("previous_panel");
		let player = h1global.player();
		if (!player || !player.curGameRoom) {
			panel.setVisible(false);
			return;
		}
		let controlIdx = -1;
		let lastIndexList = [0, 0, 0, 0, 0];
		for (var i = 0; i < player.curGameRoom.player_num; i++) {
			var history = this.historyList[i];
			let index = player.server2CurSitNum(i);
			let tiles_panel = panel.getChildByName("player_desk_panel" + index);
			tiles_panel.setVisible(history && history.length > 0);
			if (!history) {
				continue;
			}
			for (var j = 0; j < const_ll7.HAND_CARD_NUM; j++) {
				var cursorPos = 0;
				if (index === 1 || index === 2) {
					cursorPos = const_ll7.DESK_CARD_NUM - 1 - j;
				} else {
					cursorPos = j;
				}
				let tile = tiles_panel.getChildByName("tile_img_" + cursorPos);
				if (history[j] > 0) {
					lastIndexList[i] = j;
					tile.loadTexture(cutil_ll7.getCardImgPath(history[j]), ccui.Widget.PLIST_TEXTURE);
					tile.setVisible(true);
					tile.getChildByName("mark_star").setVisible(LL7GameRules.prototype.isMain.call(this, history[j], player.curGameRoom));
					tile.getChildByName("mark_big").setVisible(false)
				} else {
					tile.setVisible(false);
				}
			}

			if (controlIdx === -1) {
				controlIdx = i;
			} else {
				if (player.gameOperationAdapter.compare(this.historyList[controlIdx], history, cutil_ll7.get_suit(player.curGameRoom.mainPokers[0]))) {
					controlIdx = i;
				}
			}
			if (index === 1 || index === 2) {
				lastIndexList[i] = const_ll7.DESK_CARD_NUM - 1;
			}

			//自己的牌居中
			if (index == 0 && tiles_panel.isVisible()) {
				// tiles_panel.x = cc.director.getWinSize().width * 0.5 -20;
				var parent = tiles_panel.getParent();
				tiles_panel.x = parent.width * 0.5 - 20;
				tiles_panel.x -= parseFloat(history.length / 2) * 31.2; //31.2是牌的间距
			}
		}
		for (var i = 0; i < player.curGameRoom.player_num; i++) {
			let index = player.server2CurSitNum(i);

			let tiles_panel = panel.getChildByName("player_desk_panel" + index);
			if (controlIdx === i) {
				tiles_panel.getChildByName("tile_img_" + lastIndexList[controlIdx]).getChildByName("mark_big").setVisible(controlIdx === i)
			}
		}
	},
});
