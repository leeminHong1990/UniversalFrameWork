"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impDAUOperation = impClubOperation.extend({
	__init__: function () {
		this._super();
		KBEngine.DEBUG_MSG("Create impDAUOperation");
	},

	queryTodayDAU: function (clubId,index,page_show_num,sort_str) {
	    cc.log("去拿今天的数据");
	    cc.log(clubId,index,page_show_num,sort_str);
		this.baseCall("queryTodayDAU", clubId,index,page_show_num,sort_str);
	},

	queryYesterdayDAU: function (clubId,index,page_show_num,sort_str) {
		cc.log(clubId,index,page_show_num,sort_str);
		this.baseCall("queryYesterdayDAU", clubId,index,page_show_num,sort_str);
	},

	queryDAUResult: function (club_id, dauList, queryType,now_page,page_show_num,total,sort_str) {
		cc.log("queryDAUResult");
		cc.log(club_id, dauList, queryType,now_page,page_show_num,total,sort_str);
		cutil.unlock_ui();
		if (h1global.curUIMgr.clubrank_ui && h1global.curUIMgr.clubrank_ui.is_show) {
			h1global.curUIMgr.clubrank_ui.update_dau(club_id, dauList, queryType,now_page,page_show_num,total,sort_str);
		}
	},
	queryDAUFailed: function (code) {
		cc.log("queryDAUFailed", code)
	},

	queryMyDAU:function(club_id,query_type,order){
		cc.log(club_id,query_type,order);
		this.baseCall("queryMyDAU", club_id,query_type,order);
	},
	queryMyDAUResult:function(club_id,data,query_type,index){
		cc.log("queryMyDAUResult",club_id,data,query_type,index);
		if (h1global.curUIMgr.clubrank_ui && h1global.curUIMgr.clubrank_ui.is_show) {
			h1global.curUIMgr.clubrank_ui.update_my_dau(club_id,data,query_type,index);
		}
	},
});