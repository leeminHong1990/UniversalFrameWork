"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var FYQYMMJRoomOperationAdapter = GameOperationAdapter.extend({

	server2CurSitNum : function(serverSitNum){
		if(this.curGameRoom){
			return (serverSitNum - this.serverSitNum + this.curGameRoom.player_num) % this.curGameRoom.player_num;
		} else {
			return -1;
		}
	},

	handleReconnect : function(recRoomInfo){
		var handTiles = this.curGameRoom.handTilesList[this.serverSitNum];
		var final_op = recRoomInfo["player_advance_info_list"][this.serverSitNum]["final_op"];
		if (handTiles.length % 3 === 2 && final_op === const_val.OP_DRAW) {
			var finalDrawTile = handTiles.pop();
			this.curGameRoom.handTilesList[this.serverSitNum] = handTiles.sort(cutil_fyqymmj.tileSortFunc);
			this.curGameRoom.handTilesList[this.serverSitNum].push(finalDrawTile);
		} else {
			this.curGameRoom.handTilesList[this.serverSitNum] = handTiles.sort(cutil_fyqymmj.tileSortFunc);
		}
		var gameName = const_val.GameType2GameName[this.gameType];
		h1global.runScene(eval("new " + gameName + "GameRoomScene(this.gameType)"));
	},
});
