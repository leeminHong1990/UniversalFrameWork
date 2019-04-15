"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impLotteryOperation = impTaskOperation.extend({
	__init__: function () {
		this._super();
		KBEngine.DEBUG_MSG("Create impLotteryOperation");
	},

	lotteryDaily: function () {
		this.baseCall("lotteryDaily");
	},

	getLotteryDict:function(){
		this.baseCall("getLotteryDict");
	},

    getReward:function(op){
        this.baseCall("getReward",op);
    },

	gotLotteryDailyInfo: function (lottery_id,lottery_count) {
		cc.log("gotLotteryDailyInfo", lottery_id,lottery_count);
        if(h1global.curUIMgr.lottery_ui && h1global.curUIMgr.lottery_ui.is_show){
            h1global.curUIMgr.lottery_ui.update_lottery_id(lottery_id,lottery_count);
        }
	},

	lotteryDailyFailed: function (err, msg) {
		cc.log("lotteryDailyFailed", err, msg);
        if(h1global.curUIMgr.lottery_ui && h1global.curUIMgr.lottery_ui.is_show){
            h1global.curUIMgr.lottery_ui.update_lottery_id(-2);
        }
	},
	pushLotteryDailyCount: function (lotteryDailyCount) {
		cc.log("pushLotteryDailyCount", lotteryDailyCount);
		this.lotteryDailyCount = lotteryDailyCount;
	},

	gotLotteryDict:function(reward_dict,lottery_count,json_dict){
        cc.log("奖品列表：",reward_dict,lottery_count,json_dict);
        // var dict = JSON.parse(json_dict);
		// cc.log("奖品列表：",dict);
        if(h1global.curUIMgr.lottery_ui && h1global.curUIMgr.lottery_ui.is_show){
            h1global.curUIMgr.lottery_ui.updateLotteryDict(reward_dict,lottery_count,json_dict);
        }
	},

    gotReward:function(err_code,msg){
        cc.log("gotReward", err_code, msg);
        if(h1global.curUIMgr.lottery_ui && h1global.curUIMgr.lottery_ui.is_show){
            h1global.curUIMgr.lottery_ui.close_gift_panel(err_code,msg);
        }
    },

});
