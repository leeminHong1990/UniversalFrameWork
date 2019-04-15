"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impTaskOperation = impDAUOperation.extend({
	__init__: function () {
		this._super();
		KBEngine.DEBUG_MSG("Create impTaskOperation");
		this.availableTasks = [];
		this.tasks = [];
	},

    taskOperation: function (op, taskId, args) {
		args = args || {};
		this.baseCall("taskOperation", op, taskId, JSON.stringify(args))
	},
	taskOperationSuccess: function (op, taskId, msg) {
		cc.log(op, taskId, msg)
        cutil.unlock_ui();
		if(op==2){
            h1global.globalUIMgr.info_ui.show_by_info("分享成功，可以领奖了。");
            var str = cc.sys.localStorage.getItem("TASK_CHECK_JSON");
            if(str){
                var dict = JSON.parse(str);
                cc.log("dict is ",dict);
                if(dict && dict['check']==1){
                    cc.sys.localStorage.setItem("TASK_CHECK_JSON", JSON.stringify({'check':0}));
                }
            }
		}
        if(h1global.curUIMgr.task_ui && h1global.curUIMgr.task_ui.is_show){
            h1global.curUIMgr.task_ui.taskOpSuccess(op,taskId,msg);
        }
	},

	taskOperationFailed: function (op, taskId, msg) {
		cc.log(op, taskId, msg)
	},

	queryTasks: function () {
		this.baseCall("queryTasks");
	},

	queryAvailableTasks: function () {
		this.baseCall("queryAvailableTasks");
	},

	gotTasks: function (tasks) {
		cc.log(tasks);
		this.tasks = tasks;
        if(h1global.curUIMgr.task_ui && h1global.curUIMgr.task_ui.is_show){
            h1global.curUIMgr.task_ui.update_task_data();
        }
        if(h1global.curUIMgr.lottery_ui && h1global.curUIMgr.lottery_ui.is_show){
            if(h1global.curUIMgr.lottery_ui.is_want_to_task(h1global.player().tasks)){
                cc.log("检测到每日分享没做，跳转到任务界面");
                h1global.curUIMgr.lottery_ui.hide();
                if(h1global.curUIMgr.task_ui && !h1global.curUIMgr.task_ui.is_show){
                    h1global.curUIMgr.task_ui.show();
                }
                h1global.globalUIMgr.superinfo_ui.show_by_fade("完成每日分享还能再抽奖哦！",{"img_pos":cc.p(cc.winSize.width *0.5 , cc.winSize.height * 0.2)});
            }else{
                h1global.globalUIMgr.superinfo_ui.show_by_info("今日抽奖次数已用完");
            }
        }
	},

	gotAvailableTasks: function (tasks) {
		cc.log(tasks);
		this.availableTasks = tasks;
	},

});
