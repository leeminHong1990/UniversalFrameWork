"use strict";

var DDZGameRoom2DUI = DDZGameRoomUI.extend({
	className: "DDZGameRoom2DUI",
	uiType: const_val.GAME_ROOM_2D_UI,
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/DDZGameRoom2DUI.json";
	},

});