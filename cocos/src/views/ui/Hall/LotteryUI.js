"use strict";
var LotteryUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/LotteryUI.json";
    },

    initUI:function() {
        var self = this;
        this.lottery_panel = this.rootUINode.getChildByName("lottery_panel");
        this.gift_panel = this.rootUINode.getChildByName("gift_panel");
        this.ruler_panel = this.rootUINode.getChildByName("ruler_panel");
        this.gift_panel.setVisible(false);
        this.lottery_panel.getChildByName("left_bg").setRotation(0);

        this.lottery_id = -1;
        this.reward_is_call = false;

        this.lottery_panel.getChildByName("lottery_btn").addTouchEventListener(function(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                if(h1global.player()){
                    h1global.player().lotteryDaily();
                    self.playLottery();
                }
            }
        });
        this.lottery_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        });

        this.lottery_panel.getChildByName("ruler_btn").addTouchEventListener(function(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                self.ruler_panel.setVisible(true);
            }
        });

        this.gift_panel.getChildByName("gift_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                if(self.reward_is_call){
                    var mark_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                    if(mark_dict["phone"] && mark_dict["phone"].toString().length==11){

                    }else{
                        self.hide();
                        h1global.globalUIMgr.info_ui.show_by_info("话费奖励需要先手机认证");
                        if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                            h1global.curUIMgr.authentucate_ui.show();
                        }
                        return;
                    }
                }
                cutil.lock_ui();
                if(h1global.player()){
                    h1global.player().getReward(0);
                }
            }
        });

        this.gift_panel.getChildByName("change_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                cutil.lock_ui();
                if(h1global.player()){
                    h1global.player().getReward(1);
                }
            }
        });

        //初始化动画特效
        this.init_anime_effect();
        //初始化规则界面
        this.init_ruler_panel();
        //播终止动画
        this.init_stop_anime();

        if(!h1global.player()){return;}
        h1global.player().getLotteryDict();
        cutil.lock_ui();
    },

    playLottery:function(){
        this.update_lottery_id(-1);
        this.lottery_panel.getChildByName("return_btn").setTouchEnabled(false);
        this.lottery_panel.getChildByName("lottery_btn").setTouchEnabled(false);
        var self = this;
        this.easeIn = 0.3;
        this.easeOut = 0.75;
        var action = cc.sequence(
            // cc.rotateBy(1.5,1080),
            cc.rotateTo(2,1440),
            cc.callFunc(function () {
                if(self.lottery_id!=-1){
                    if(self.lottery_id==-2){
                        self.lottery_panel.getChildByName("return_btn").setTouchEnabled(true);
                        self.lottery_panel.getChildByName("lottery_btn").setTouchEnabled(true);
                        h1global.globalUIMgr.info_ui.show_by_info("你没有抽奖机会了哦");
                        return;
                    }
                    self.lottery_panel.getChildByName("left_bg").stopAllActions();
                    self.lottery_panel.getChildByName("left_bg").runAction(cc.sequence(
                        // cc.rotateBy(1,405),
                        // cc.rotateBy((8-self.lottery_id)*0.3,45*(8-self.lottery_id))
                        cc.rotateBy(0.8+(8-self.lottery_id)*0.3,405+45*(8-self.lottery_id)),
                        cc.callFunc(function(){
                            self.run_stop_anime();
                        }),
                        cc.delayTime(0.5),
                        cc.callFunc(function () {
                            self.lottery_panel.getChildByName("return_btn").setTouchEnabled(true);
                            self.lottery_panel.getChildByName("lottery_btn").setTouchEnabled(true);
                            cc.log("显示奖品界面",self.lottery_id);
                            for(var k in self.dict){
                                if(self.dict[k]["id"]==self.lottery_id){
                                    self.show_gift_panel(self.dict[k]);
                                    break;
                                }
                            }

                        })
                    ).easing(cc.easeIn(self.easeIn)));
                }else{
                    cc.log("你就继续转吧");
                    self.lottery_panel.getChildByName("left_bg").stopAllActions();
                    self.lottery_panel.getChildByName("left_bg").runAction(action);
                }
            })
        ).easing(cc.easeOut(self.easeOut));
        // this.lottery_panel.getChildByName("lottery_btn").runAction(action);
        this.lottery_panel.getChildByName("left_bg").runAction(action);
    },

    updateLotteryDict:function(reward_dict,lottery_count,dict){
        this.dict = dict;
        if(JSON.stringify(reward_dict).length>2){
            var reward_item = reward_dict[0]
            var now_time = Math.round(new Date() / 1000);
            if(now_time>reward_item["add_time"]+reward_item["effect_time"]*24*60*60 || (reward_item["over_time"] && now_time > reward_item["over_time"])){
                cc.log("上次的奖励已经过期，提示服务端清空奖励列表");
                if(h1global.player()){
                    h1global.player().getReward(0);
                }
            }else{
                cc.log("上次的奖励还没领,显示领奖界面");
                this.show_gift_panel(reward_item);
            }
        }
        this.update_lottery_id(-1,lottery_count);
        //更新转盘的清单
        var left_bg = this.lottery_panel.getChildByName("left_bg");
        var x_Pos = left_bg.width*0.5;
        var y_Pos = left_bg.height*0.5;
        var data = dict;
        // 偏移量
        var lenth = 180;//距离圆点的距离
        var word_lenth = 124;
        var offset = 0.71;
        var rota_list = [[0,1],[1*offset,1*offset],[1,0],[1*offset,-1*offset],[0,-1],[-1*offset,-1*offset],[-1,0],[-1*offset,1*offset]];

        for(var k in data){
            //奖池图片 img1
            var list_img = new cc.Sprite("res/ui/LotteryUI/small_"+data[k]["type"]+data[k]["img1"]+".png");
            left_bg.addChild(list_img);
            list_img.setRotation((data[k]["id"]-1)*45);
            list_img.setPosition(x_Pos+rota_list[data[k]["id"]-1][0]*lenth,y_Pos+rota_list[data[k]["id"]-1][1]*lenth);

            //奖池文字 desc
            var word_desc = new cc.LabelTTF(data[k]["desc"],"zhunyuan",24);
            left_bg.addChild(word_desc);
            word_desc.setRotation((data[k]["id"]-1)*45);
            word_desc.setPosition(x_Pos+rota_list[data[k]["id"]-1][0]*word_lenth,y_Pos+rota_list[data[k]["id"]-1][1]*word_lenth);

        }
        this.init_info_panel();
        cutil.unlock_ui();

    },
    
    update_lottery_id:function(lottery_id,lottery_count){
        this.lottery_id = lottery_id;
        if(lottery_count == undefined){return;}
        this.lottery_panel.getChildByName("lottery_btn").getChildByName("count_label").setString('剩余'+lottery_count+'次');
        if(lottery_count == 0){
            var self = this;
            this.lottery_panel.getChildByName("lottery_btn").addTouchEventListener(function(sender, eventType) {
                if (eventType == ccui.Widget.TOUCH_ENDED) {
                    // h1global.globalUIMgr.superinfo_ui.show_by_fade("今日抽奖次数已用完");
                    cc.log(h1global.player().tasks);
                    if(h1global.player().tasks && h1global.player().tasks.length>0){
                        if(self.is_want_to_task(h1global.player().tasks)){
                            cc.log("检测到每日分享没做，跳转到任务界面");
                            self.hide();
                            if(h1global.curUIMgr.task_ui && !h1global.curUIMgr.task_ui.is_show){
                                h1global.curUIMgr.task_ui.show();
                            }
                            h1global.globalUIMgr.superinfo_ui.show_by_fade("完成每日分享还能再抽奖哦！",{"img_pos":cc.p(cc.winSize.width *0.5 , cc.winSize.height * 0.2)});
                        }else{
                            h1global.globalUIMgr.superinfo_ui.show_by_info("今日抽奖次数已用完");
                        }
                    }else{
                        h1global.player().queryTasks();
                    }


                }
            });
        }
    },

    init_anime_effect:function(){
        var circle = this.lottery_panel.getChildByName("printed2");
        circle.setScale(0.5);
        var light_img2 = this.lottery_panel.getChildByName("left_light2");
        var printed_1 = this.lottery_panel.getChildByName("left_bg").getChildByName("printed_1");
        var printed_2 = this.lottery_panel.getChildByName("left_bg").getChildByName("printed_2");
        this.rootUINode.runAction(cc.RepeatForever.create(cc.Sequence.create(
            // cc.FadeIn.create(0.58),
            cc.delayTime(0.66666),
            cc.callFunc(function () {
                light_img2.setVisible(true);
                printed_1.setVisible(true);
                printed_2.setVisible(false);
                circle.setVisible(true);
                circle.runAction(cc.Spawn.create(
                    cc.scaleTo(0.66666, 2.4, 2.4).easing(cc.easeIn(0.5)),
                    cc.fadeOut(0.66666)
                ))

            }),
            cc.delayTime(0.66666),
            cc.callFunc(function () {
                light_img2.setVisible(false);
                printed_1.setVisible(false);
                printed_2.setVisible(true);
                circle.setVisible(false);
                circle.stopAllActions();
                circle.setOpacity(255);
                circle.setScale(0.5);

            })
        )));

    },

    show_gift_panel:function (item_data) {
        cc.log(item_data);
        if(item_data["type"]=="thanks"){
            h1global.globalUIMgr.superinfo_ui.show_by_info("真遗憾！您什么也没有抽中，下次继续努力吧！");
            return;
        }
        this.gift_panel.setVisible(true);

        //如果不是话费类型 则隐藏转化为房卡 按钮
        if(item_data["type"]!="call"){
            this.reward_is_call = false;
            this.gift_panel.getChildByName("change_btn").setVisible(false);
            this.gift_panel.getChildByName("gift_btn").setPositionX(cc.director.getWinSize().width*0.5);
        }else{
            this.reward_is_call = true;
            this.gift_panel.getChildByName("change_btn").setVisible(true);
            this.gift_panel.getChildByName("gift_btn").setPositionX(cc.director.getWinSize().width*0.352);
        }
        //加载图片
        this.gift_panel.getChildByName("gift_img").loadTexture("res/ui/LotteryUI/big_"+item_data["type"]+item_data["img2"]+".png");
        this.gift_panel.getChildByName("gift_img").ignoreContentAdaptWithSize(true);
        //设置数量
        this.gift_panel.getChildByName("num_img").getChildByName("label").setString("X"+item_data["num"]);

        //背景动画
        this.gift_panel.getChildByName("effect").runAction(cc.RepeatForever.create(cc.Sequence.create(
            cc.rotateBy(1,180)
        )));
    },

    close_gift_panel:function(err_code,msg){
        //领取成功
        if(err_code == 1){
            // this.lottery_panel.getChildByName("left_bg").setRotation(0);
            this.gift_panel.setVisible(false);
            h1global.globalUIMgr.info_ui.show_by_info(msg);
            if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                h1global.curUIMgr.gamehall_ui.updateCharacterCard();
            }
        }
        //领取失败，建议绑定手机
        if(err_code == 2){
            this.hide();
            h1global.globalUIMgr.info_ui.show_by_info(msg);
        }
        //过期奖励提示信息
        if(err_code == 3){
            h1global.globalUIMgr.info_ui.show_by_info(msg);
            // this.lottery_panel.getChildByName("left_bg").setRotation(0);
            this.gift_panel.setVisible(false);
        }

    },

    init_ruler_panel:function(){
        var self = this;
        this.ruler_panel.getChildByName("touch_panel").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.ruler_panel.setVisible(false);
            }
        });
    },

    init_info_panel:function(){
        // var lottery_list = JSON.parse(cc.sys.localStorage.getItem("LOTTERY_LIST_JSON"));
        // if(lottery_list){
        //     cc.log(lottery_list);
        // }

        var lan = 0;
        for(var k in this.dict){
            this.dict[k]['min']= lan;
            lan += this.dict[k]['rate'];
            this.dict[k]['max']= lan;
        }

        var info_panel = this.lottery_panel.getChildByName("info_panel");

        var info_list = [];

        var list_num = 30
        for( i =0 ;i<list_num;i++){
            var itemData = [];
            itemData["left_label"] = "ID为****"+(Math.floor(Math.random () * 900)+100)+"的玩家";
            itemData["mid_label"] = "抽中了";
            var num = Math.random ();
            var desc = "1张房卡";
            var is_free = 0;
            for(var j in this.dict){
                if(this.dict[j]['min'] <= num && num< this.dict[j]['max']){
                    desc = this.dict[j]['desc'];
                    if(this.dict[j]['type'] == 'call'){
                        desc +='话费';
                    }else if(this.dict[j]['type'] == 'card'){
                        desc +='房卡';
                    }else if(this.dict[j]['type'] == 'thanks'){
                        is_free = 1
                    }
                }
            }
            if(is_free){
             list_num++;
             continue;
            }
            itemData["right_label"] = desc;
            info_list.push(itemData);
        }
        cc.log(list_num);

        function update_item_func(itemPanel, itemData, index){
            itemPanel.getChildByName("left_label").setString(itemData["left_label"]);
            itemPanel.getChildByName("mid_label").setString(itemData["mid_label"]);
            itemPanel.getChildByName("right_label").setString(itemData["right_label"]);
        }

        info_panel.setScrollBarEnabled(false);
        UICommonWidget.update_scroll_items(info_panel, info_list, update_item_func);


        var self = this;
        this.right_info_panel = info_panel;
        this.action_num = 0;

        info_panel.runAction(cc.RepeatForever.create(cc.Sequence.create(
            cc.delayTime(0.01666666),
            cc.callFunc(function () {
                self.right_info_panel.jumpToPercentVertical(self.action_num);
                self.action_num += 0.1;
                if(self.action_num>=100){
                    self.action_num=0;
                }
            })
        )));
    },

    is_want_to_task:function(tasks){
        var state = 0;
        for(var k in tasks){
            var condition = JSON.parse(tasks[k]["condition"]);
            if(condition["type"]=="ShareTaskCondition"){
                state = tasks[k]["state"];
                break;
            }
        }
        if(state && state === 1){
            return true;
        }

        return false;
    },

    init_stop_anime:function(){
        var novice_btn = ccs.load("res/ui/LotteryAction.json");   //加载CocosStudio导出的Json文件
        var novice_node = novice_btn.node;
        var novice_action = novice_btn.action; // 动作
        // novice_action.gotoFrameAndPlay(0,novice_action.getDuration(),0,false);
        novice_node.runAction(novice_action); // 播放动作
        novice_node.setName("novice_node");
        var circle = this.lottery_panel.getChildByName("left_bg").getChildByName("circle_img");
        // var circle = this.lottery_panel.getChildByName("circle_img");
        circle.addChild(novice_node);  //将UI输出到画布
        novice_node.setPosition(circle.width*0.5,circle.height*0.5);
        novice_node.setVisible(false);
        this.novice_node = novice_node;
        this.novice_action = novice_action;
        cc.log(this);
    },

    run_stop_anime:function(){
        var self = this;
        this.novice_node.setVisible(true);
        this.novice_node.setRotation(-(45+45*(8-self.lottery_id)));
        // cc.error(45+45*(8-self.lottery_id));
        this.novice_action.gotoFrameAndPlay(0,this.novice_action.getDuration(),0,false);
        this.rootUINode.runAction(cc.sequence(cc.delayTime(this.novice_action.getDuration()/60),cc.callFunc(function(){
            self.novice_node.setVisible(false);
        })))
    }
});