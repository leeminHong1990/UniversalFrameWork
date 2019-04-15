"use strict";
var DDZPlayBackUI = MultipleLayoutUI.extend({
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/DDZPlayBackUI.json";
	},

	initUI: function () {
		this.onLayoutChanged(false);
	},

	onLayoutChanged: function (fromCache) {
		this.rootUINode.getChildByName("room_info_panel").setPositionY(cc.director.getWinSize().height * 0.635);
		this.finger_img = this.rootUINode.getChildByName("finger_img");
		this.rate_label = this.rootUINode.getChildByName("room_info_panel").getChildByName("rate_label");
		this.rate_label.ignoreContentAdaptWithSize(true);
		this.speed_label = this.rootUINode.getChildByName("room_info_panel").getChildByName("speed_label");
		this.speed_label.ignoreContentAdaptWithSize(true);
	},

	updateRoomInfo: function (rateTxt, speed) {
		this.rate_label.setString('进度：' + rateTxt);
		this.speed_label.setString(speed + '倍速');
	},
});