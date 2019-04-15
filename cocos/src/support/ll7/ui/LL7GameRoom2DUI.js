"use strict";

var LL7GameRoom2DUI = LL7GameRoomUI.extend({
	className: "LL7GameRoom2DUI",
	uiType: const_val.GAME_ROOM_2D_UI,
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/LL7GameRoom2DUI.json";
	},

});
