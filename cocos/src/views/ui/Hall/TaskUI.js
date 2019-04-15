"use strict";
var TaskUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/TaskUI.json";
    },

    initUI:function(){
        var self = this;
        this.task_panel = this.rootUINode.getChildByName("task_panel");
        this.task_panel .getChildByName("close_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        });
        if(!h1global.player()){return;}
        h1global.player().queryTasks();
        cutil.lock_ui();

    },

    update_task_data:function(){
        if(!this.is_show){return;}
        cutil.unlock_ui();
        if(!h1global.player()){return;}
        var tasks = h1global.player().tasks;
        //根据tasks的情况 考虑是否要处理它
        if(!tasks || tasks.length<1){
            this.hide();
            h1global.globalUIMgr.info_ui.show_by_info("当前没有发布每日任务，敬请期待！");
        }
        function group_tasks(tasks){
            //先给dauList 变成从大到小  //冒泡排序？
            for(var j = 0;j<tasks.length;j++){
                for ( var i = 0;i<tasks.length;i++){
                    if(tasks[i+1]&& tasks[i]["state"]!=3 &&tasks[i]["state"]<tasks[i+1]["state"]){
                        [tasks[i], tasks[i+1]] = [tasks[i+1], tasks[i]];
                    }
                    if(tasks[i+1]&& tasks[i]["state"]==3 ){
                        [tasks[i], tasks[i+1]] = [tasks[i+1], tasks[i]];
                    }
                }
            }
        }
        group_tasks(tasks);
        this.update_task_panel(this.task_panel.getChildByName("info_panel"),tasks);
    },

    update_task_panel:function(info_panel, show_list){
        if(!this.is_show){return;}
        var self = this;

        function update_item_func(itemPanel, itemData, index){
            if(index%2 === 1){
                itemPanel.getChildByName("light_img").setVisible(false);
            } else {
                itemPanel.getChildByName("light_img").setVisible(true);
            }

            //设置itemPanel的名称
            itemPanel.setName(itemData["id"].toString());

            //设置任务状态
            switch (itemData["state"]){
                case 1:
                    itemPanel.getChildByName("to_get_btn").setVisible(true);
                    itemPanel.getChildByName("get_btn").setVisible(false);
                    itemPanel.getChildByName("got_img").setVisible(false);
                    break;
                case 2:
                    itemPanel.getChildByName("to_get_btn").setVisible(false);
                    itemPanel.getChildByName("get_btn").setVisible(true);
                    itemPanel.getChildByName("got_img").setVisible(false);
                    break;
                case 3:
                    itemPanel.getChildByName("to_get_btn").setVisible(false);
                    itemPanel.getChildByName("get_btn").setVisible(false);
                    itemPanel.getChildByName("got_img").setVisible(true);
                    break;
                default:
                    break;
            }

            //注册领奖的函数
            itemPanel.getChildByName("get_btn").addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    if(!h1global.player()){return;}
                    h1global.player().taskOperation(3,itemData["id"],[]);
                    cutil.lock_ui();
                }
            });

            //设置进度




            cc.log(typeof itemData["completion"][0]);
            cc.log(typeof itemData["completion"][1]);
            cc.log(itemData["completion"][0]);
            cc.log(itemData["completion"][1]);

            if(!itemData["completion"][1] || itemData["completion"][1]==0){
                itemData["completion"][1] = 1;
            }

            if(itemData["completion"][0]/itemData["completion"][1] >1){
                itemData["completion"][0]=1;
                itemData["completion"][1]=1;
            }
            cc.log((itemData["completion"][0]/itemData["completion"][1])*100);
            itemPanel.getChildByName("num_label").setString(itemData["completion"][0]+"/"+itemData["completion"][1]);
            itemPanel.getChildByName("task_slider").setPercent((itemData["completion"][0]/itemData["completion"][1])*100);
            // itemPanel.getChildByName("loading_bar").setPercent((itemData["completion"][0]/itemData["completion"][1])*100);

            //设置标题
            itemPanel.getChildByName("name_label").setString(itemData["title"]);

            //根据 action 来注册按钮的事件 和 设置房卡的数量
            var data = JSON.parse(itemData["action"]);
            cc.log(data);
            // 完成游戏局数的任务
            if(data["type"]=="AwardCardAction"){
                //设置头像 与 奖励 的 图片
                itemPanel.getChildByName("head_img").loadTexture("res/ui/TaskUI/card_task_img.png");
                itemPanel.getChildByName("reward_img").loadTexture("res/ui/TaskUI/card_reward_img.png");
                itemPanel.getChildByName("head_img").ignoreContentAdaptWithSize(true);
                itemPanel.getChildByName("reward_img").ignoreContentAdaptWithSize(true);
                //设置奖励的数量
                itemPanel.getChildByName("reward_num").setString("X"+data["card"].toString());
                //注册按钮事件
                itemPanel.getChildByName("to_get_btn").addTouchEventListener(function (sender, eventType) {
                    if(eventType === ccui.Widget.TOUCH_ENDED){
                        self.hide();
                        h1global.globalUIMgr.info_ui.show_by_info("点击创建房间或者加入亲友圈，即可开始游戏完成任务啦！");
                    }
                });
            }else if(data["type"]=="LotteryDailyAction"){
                //设置头像 与 奖励 的 图片
                itemPanel.getChildByName("head_img").loadTexture("res/ui/TaskUI/share_task_img.png");
                itemPanel.getChildByName("reward_img").loadTexture("res/ui/TaskUI/share_reward_img.png");
                itemPanel.getChildByName("head_img").ignoreContentAdaptWithSize(true);
                itemPanel.getChildByName("reward_img").ignoreContentAdaptWithSize(true);
                //设置奖励的数量
                itemPanel.getChildByName("reward_num").setString("X"+data["count"].toString());
                //注册按钮事件
                itemPanel.getChildByName("to_get_btn").addTouchEventListener(function (sender, eventType) {
                    if(eventType === ccui.Widget.TOUCH_ENDED){
                        //发送给朋友圈
                        if(eventType == ccui.Widget.TOUCH_ENDED) {
                            cc.sys.localStorage.setItem("TASK_SHARE_JSON", JSON.stringify({'id':itemData["id"],'addtime':Math.round(new Date() / 1000)}));
                            var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                            if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)){
                                jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "shareZQM", "(ZLjava/lang/String;)V", false, switches.PHP_SERVER_URL + "/invite/" + info_dict["user_id"]);
                            } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
                                jsb.reflection.callStaticMethod("WechatOcBridge", "shareZQM:withURL:", false, switches.PHP_SERVER_URL + "/invite/" + info_dict["user_id"]);
                            } else {
                                cc.log("share not support web")
                            }
                        }
                    }
                });
            }





        }
        // UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func);
        UICommonWidget.update_scroll_items2(info_panel, show_list, function (itemData) {
            return "res/ui/TaskItemUI.json";
            cc.error("type not found support", type);
        },update_item_func);
    },

    taskOpSuccess:function(op,taskId,msg){
        var itemPanel = this.task_panel.getChildByName("info_panel").getChildByName(taskId.toString());
        if(!itemPanel){return;}
        if(op==3){
            itemPanel.getChildByName("to_get_btn").setVisible(false);
            itemPanel.getChildByName("get_btn").setVisible(false);
            itemPanel.getChildByName("got_img").setVisible(true);
            if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                h1global.curUIMgr.gamehall_ui.updateCharacterCard();
            }
            h1global.globalUIMgr.info_ui.show_by_info("领取成功！");
        }
        if(op==2){
            itemPanel.getChildByName("to_get_btn").setVisible(false);
            itemPanel.getChildByName("get_btn").setVisible(true);
            itemPanel.getChildByName("got_img").setVisible(false);
            itemPanel.getChildByName("task_slider").setPercent(100);
            itemPanel.getChildByName("num_label").setString("1/1");
        }
    },
});