"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impStatOperation = impLotteryOperation.extend({
	__init__: function () {
		this._super();
		KBEngine.DEBUG_MSG("Create impStatOperation");
		this.todayRound = 0;
	},

	queryGameRound: function (begin_timestamp, end_timestamp) {
		end_timestamp = end_timestamp || begin_timestamp;
		this.baseCall("queryGameRound", begin_timestamp, end_timestamp);
	},

	gotGameRound: function (data, begin_timestamp, end_timestamp) {
		cc.log("gotGameRound", data);
	},

	pushTodayGameRound: function (round) {
		this.todayRound = round;
		cc.log("pushTodayGameRound", round)
	}
});
