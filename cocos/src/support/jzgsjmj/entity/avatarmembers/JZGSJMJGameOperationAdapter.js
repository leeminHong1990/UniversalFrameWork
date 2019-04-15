"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var JZGSJMJGameOperationAdapter = JZMJGameOperationAdapter.extend({
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

});
