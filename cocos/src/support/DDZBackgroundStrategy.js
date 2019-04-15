var DDZBackgroundStrategy = cc.Class.extend({

	ctor: function (rootUINode, imgPath) {
		this.imgPath = imgPath;
		this.rootUINode = rootUINode;
	},
	updateBackground: function () {
		if (!this.loaded) {
			var self = this;
			cc.loader.load(this.imgPath, function () {
				self.loaded = true;
				self.updateBackground();
			});
		}
		if (!cc.sys.isObjectValid(this.rootUINode)) {
			return;
		}
		var bg_img = this.rootUINode.getChildByName("bg_img");
		if (!bg_img) {
			bg_img = ccui.ImageView.create();
			bg_img.setName("bg_img");
			bg_img.setAnchorPoint(0.5, 0.5);
			bg_img.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
			bg_img.setLocalZOrder(const_val.GameRoomBgZOrder);
			this.rootUINode.addChild(bg_img);
		}
		bg_img.loadTexture(this.imgPath);

		var bg_img_content_size = bg_img.getContentSize();
		var scale = cc.winSize.width / bg_img_content_size.width;
		if (cc.winSize.height / bg_img_content_size.height > scale) {
			scale = cc.winSize.height / bg_img_content_size.height;
		}
		bg_img.setScale(scale);
	}
});
