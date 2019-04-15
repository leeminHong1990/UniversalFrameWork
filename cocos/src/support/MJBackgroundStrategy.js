var MJBackgroundStrategy = cc.Class.extend({

	ctor: function (rootUINode, bgInfo, descInfo) {
		this.bgInfo = bgInfo;
		this.descInfo = descInfo;
		this.rootUINode = rootUINode;
	},

	updateBackground: function (gameroom_type, gameroombg_type, loaded) {
		if (this.curGameRoomType == gameroom_type && this.curGameRoomBgType == gameroombg_type) {
			return;
		}
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		var bgImgPath = this.bgInfo[parseInt(gameroom_type)][gameroombg_type.toString()];
		var bgDescImgPath = this.descInfo[parseInt(gameroom_type)][gameroombg_type.toString()];
		if (!loaded) {
			var self = this;
			cc.loader.load([bgImgPath, bgDescImgPath], function () {
				self.updateBackground(gameroom_type, gameroombg_type, true);
			});
			return;
		}

		this.curGameRoomType = gameroom_type;
		this.curGameRoomBgType = gameroombg_type;

		var bg_img = this.rootUINode.getChildByName("bg_img");
		if (!bg_img) {
			bg_img = ccui.ImageView.create();
			bg_img.setName("bg_img");
			bg_img.setAnchorPoint(0.5, 0.5);
			bg_img.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
			bg_img.setLocalZOrder(const_val.GameRoomBgZOrder);
			this.rootUINode.addChild(bg_img);
		}
		if (gameroom_type == const_val.GAME_ROOM_2D_UI) {
			bg_img.setScale9Enabled(true);
			bg_img.setCapInsets(cc.rect(422, 320, 436, 246));
			bg_img.loadTexture(bgImgPath);

			bg_img.setSizeType(ccui.Widget.SIZE_PERCENT);
			bg_img.setSizePercent(cc.p(1, 1));
			bg_img.setScale(1);
		} else {
			bg_img.setScale9Enabled(false);
			bg_img.loadTexture(bgImgPath);
			var bg_img_content_size = bg_img.getContentSize();
			var scale = cc.winSize.width / bg_img_content_size.width;
			if (cc.winSize.height / bg_img_content_size.height > scale) {
				scale = cc.winSize.height / bg_img_content_size.height;
			}
			bg_img.setScale(scale);
		}

		var bg_desc_img = this.rootUINode.getChildByName("bg_desc");
		if (!bg_desc_img) {
			bg_desc_img = ccui.ImageView.create();
			bg_desc_img.setName("bg_desc");
			bg_desc_img.setAnchorPoint(0.5, 0.5);
			bg_desc_img.setLocalZOrder(const_val.GameRoomBgZOrder);
			this.rootUINode.addChild(bg_desc_img);
		}
		bg_desc_img.loadTexture(bgDescImgPath);

		if (gameroom_type === const_val.GAME_ROOM_2D_UI) {
			bg_desc_img.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5 - 100);
		} else {
			bg_desc_img.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5 - 88);
		}
	}
});
