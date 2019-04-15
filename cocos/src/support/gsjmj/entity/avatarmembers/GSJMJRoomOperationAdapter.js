"use strict";
var GSJMJRoomOperationAdapter = GameOperationAdapter.extend({

	server2CurSitNum: function (serverSitNum) {
		if (this.curGameRoom) {
			if (this.curGameRoom.player_num === 3 && (serverSitNum + this.curGameRoom.player_num - this.serverSitNum) % this.curGameRoom.player_num === 2) {
				return 3
			}
			return (serverSitNum + this.curGameRoom.player_num - this.serverSitNum) % this.curGameRoom.player_num;
		} else {
			return -1;
		}
	},

	handleReconnect: function (recRoomInfo) {
		// 如果牌数是3x+2 且最后一张牌是摸得话 该牌不排序放最后
		var final_op = recRoomInfo["player_advance_info_list"][this.serverSitNum]["final_op"]
		if (this.curGameRoom.handTilesList[this.serverSitNum].length % 3 === 2 && final_op === const_val.OP_DRAW) {
			var finalDrawTile = this.curGameRoom.handTilesList[this.serverSitNum].pop();
			cutil_gsjmj.tileSort(this.curGameRoom.handTilesList[this.serverSitNum], this.curGameRoom.kingTiles);
			this.curGameRoom.handTilesList[this.serverSitNum].push(finalDrawTile)
		} else {
			cutil_gsjmj.tileSort(this.curGameRoom.handTilesList[this.serverSitNum], this.curGameRoom.kingTiles);
		}
		var gameName = const_val.GameType2GameName[this.gameType];
		h1global.runScene(eval("new " + gameName + "GameRoomScene(this.gameType)"));
	},
});