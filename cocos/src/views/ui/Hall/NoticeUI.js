"use strict";
var NoticeUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/NoticeUI.json";
    },

    initUI:function(){
        var self = this;
        this.main_panel = this.rootUINode.getChildByName("bg_panel").getChildByName("main_panel");
        this.main_panel.getChildByName("close_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        });
        this.main_panel.getChildByName("back_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                self.main_panel.getChildByName("back_btn").setVisible(false);
                self.main_panel.getChildByName("close_btn").setVisible(true);
                self.rootUINode.getChildByName("bg_panel").getChildByName("detail_panel").setVisible(false);
                self.rootUINode.getChildByName("bg_panel").getChildByName("msg_panel").setVisible(true);
            }
        });
        this.notice_list = [
            {"title":"暂无新消息","content":""},
            // {"title":"sadhoaishd","content":"我感觉有萨多基拉圣诞节asdasdasdasdasdaasdasdasdas快乐按实际的啦拉萨大家拉丝机道啊实束打伞sjdasolda\nasdasjdasolda\nasdasjdasolda\nasdasjdasolda\nsdasd asds adas \n剧毒我啊撒旦啊是大啊是大\n啥啊隧道和啊ui说的话卡上的卡仕达看见哈萨克"}
        ];

        var notice_list = cc.sys.localStorage.getItem("NOTICES_JSON");
        if(notice_list){
            this.notice_list = JSON.parse(notice_list);
            cc.log(this.notice_list);
        }

        //这里要去获取数据
        this.update_msg_panel();
    },

    update_msg_panel:function(){
        var self = this;
        function update_item_func(itemPanel, itemData, index){
            cc.log(itemData);
            itemPanel.getChildByName("title_label").setString(cutil.info_sub_ver2(itemData["title"], 17));
            var detail_str = "";
            if(itemData["content"].indexOf('\n')>=0){
                detail_str = itemData["content"].substr(0,itemData["content"].indexOf('\n'));
            }else{
                detail_str = itemData["content"];
            }
            itemPanel.getChildByName("detail_label").setString(cutil.info_sub_ver2(detail_str,30));
            itemPanel.getChildByName("detail_btn").addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    cc.log("显示详情");
                    self.rootUINode.getChildByName("bg_panel").getChildByName("detail_panel").setVisible(true);
                    self.rootUINode.getChildByName("bg_panel").getChildByName("msg_panel").setVisible(false);
                    self.main_panel.getChildByName("back_btn").setVisible(true);
                    self.main_panel.getChildByName("close_btn").setVisible(false);
                    self.update_detail_panel(itemData);
                }
            });
        }
        var info_panel = this.rootUINode.getChildByName("bg_panel").getChildByName("msg_panel").getChildByName("detail_panel").getChildByName("record_all_scroll");
        var show_list = this.notice_list;
        UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func);
    },

    update_detail_panel:function(itemData){
        cc.log(typeof itemData["content"]);
        cc.log(itemData["content"]);

        var detail_panel = this.rootUINode.getChildByName("bg_panel").getChildByName("detail_panel");
        var intro_scroll = detail_panel.getChildByName("intro_scroll")
        if(intro_scroll.getChildByName("msg_label")){
            intro_scroll.getChildByName("msg_label").removeFromParent(true);
        }
        detail_panel.getChildByName("title_label").setString(itemData["title"]);
        var msg_label = new cc.LabelTTF(itemData["content"],"zhunyuan",24,undefined,cc.TEXT_ALIGNMENT_LEFT);
        cc.log(msg_label.getContentSize());

        intro_scroll.setInnerContainerSize(msg_label.getContentSize());
        msg_label.setColor(cc.color(140,76,47));
        // cc.log(msg_label.getLineHeight());
        // msg_label.setLineHeight(28+15);
        msg_label.setName("msg_label");
        intro_scroll.addChild(msg_label);
        msg_label.setAnchorPoint(0,1);
        msg_label.setPosition(intro_scroll.width*0.05,intro_scroll.height);
        // intro_scroll.jumpToTop();
        // intro_scroll.jumpToTop();
        intro_scroll.jumpToBottom();
    },



});