"use strict";
var LSBMZMJRoomOperationAdapter = GameOperationAdapter.extend({

	server2CurSitNum: function (serverSitNum) {
		if (this.curGameRoom) {
			if (this.curGameRoom.player_num == 3 && (serverSitNum + this.curGameRoom.playerInfoList.length - this.serverSitNum) % this.curGameRoom.playerInfoList.length == 2) {
				return 3
			}
			return (serverSitNum + this.curGameRoom.playerInfoList.length - this.serverSitNum) % this.curGameRoom.playerInfoList.length;
		} else {
			return -1;
		}
	},

	handleReconnect: function (recRoomInfo) {
		// 如果牌数是3x+2 且最后一张牌是摸得话 该牌不排序放最后
		var handTiles = this.curGameRoom.handTilesList[this.serverSitNum];
		var final_op = recRoomInfo["player_advance_info_list"][this.serverSitNum]["final_op"];
		if (handTiles.length % 3 === 2 && final_op === const_val.OP_DRAW) {
			var finalDrawTile = handTiles.pop();
			this.curGameRoom.handTilesList[this.serverSitNum] = handTiles.sort(cutil_lsbmzmj.tileSortFunc);
			this.curGameRoom.handTilesList[this.serverSitNum].push(finalDrawTile);
		} else {
			this.curGameRoom.handTilesList[this.serverSitNum] = handTiles.sort(cutil_lsbmzmj.tileSortFunc);
		}
		var gameName = const_val.GameType2GameName[this.gameType];
		h1global.runScene(eval("new " + gameName + "GameRoomScene(this.gameType)"));
	},
});