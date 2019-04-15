"use strict"
var DDZPlaybackGameRoom2DUI = DDZGameRoom2DUI.extend({
	ctor: function () {
		this._super();
		this.playbackGame = new DDZPlaybackGameRoom(this);
		this.addChild(this.playbackGame)
	},
	initUI: function () {
		this._super();
		this.playbackGame.init();
	},

	update_playback_operation_panel: function (serverSitNum, op_dict, doOP) {

	}

});