"use strict";

var JZGSJMJGameRoomEntity = JZMJGameRoomEntity.extend({

	ctor: function (player_num, gameType) {
		this._super(player_num, gameType);
		this.leftTileNum = 136 - 40 - 1;
	},

	startGame: function (kingTiles, wreathsList) {
		this._super(kingTiles, wreathsList);
		var wreathsNum = 0;
		for (var i = 0; i < wreathsList.length; i++) {
			wreathsNum += wreathsList[i].length
		}
		this.leftTileNum = 136 - 40 - wreathsNum;
	},

	getRoomCreateDict:function () {
		var dict = this._super();
		dict["game_name"] = 'jzgsjmj';
		return dict;
	},
});
