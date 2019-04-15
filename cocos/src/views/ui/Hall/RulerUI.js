
"use strict";
var RulerUI = UIBase.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/RulerUI.json";
    },

    initUI:function() {
        this.main_panel = this.rootUINode.getChildByName("main_panel");
        cc.log(this.main_panel.getChildByName("top_bg").getPositionY());
        cc.log(this.main_panel.getChildByName("top_bg").height);
        this.main_panel.getChildByName("right_bg").setPositionY(this.main_panel.getChildByName("top_bg").getPositionY()-this.main_panel.getChildByName("top_bg").height + 10);
        this.main_panel.getChildByName("left_bg").setPositionY(this.main_panel.getChildByName("top_bg").getPositionY()-this.main_panel.getChildByName("top_bg").height + 10);


        this.ruler_panel = this.rootUINode.getChildByName("ruler_panel");
        this.initCreateInfo();
        //现在用表格中的东西
        this.name_list = [];
        var sort_list = []
        for (var k in table_create_params){
            if(table_create_params[k]["is_show"]){
                sort_list.push([table_create_params[k]["name"],table_create_params[k]["create_sort"]]);
                // this.name_list.push(table_create_params[k]["name"]);
            }
        }
        sort_list.sort(function(a,b){
            return a[1]-b[1]
        });
        for(var i =0;i<sort_list.length;i++){
            this.name_list.push(sort_list[i][0]);
        }
        cc.log(this.name_list);

        //给左边增加点击事件
        this.init_left_btn();
        if(!this.init_now_btn()){
            this.now_btn_name = this.name_list[0];
            if(!this.init_now_btn()){
                cc.log("如果再次调用还出错就完蛋辣！~");
                return;
            }
        }
        this.init_return_btn();
        //this.init_create_callback();
    },

    initCreateInfo: function () {
        //cc.sys.localStorage.clear();
        var default_info_json = '{"now_btn_name":"ddz"}';
        var info_json = cc.sys.localStorage.getItem("HLEP_BTN_JSON");
        if (!info_json) {
            cc.sys.localStorage.setItem("HLEP_BTN_JSON", default_info_json);
            info_json = cc.sys.localStorage.getItem("HLEP_BTN_JSON");
        }
        cc.warn(info_json);
        var info_dict = eval("(" + info_json + ")");
        //
        this.now_btn_name = info_dict["now_btn_name"];
    },

    setCreateInfo:function (now_btn) {
        cc.sys.localStorage.setItem("HLEP_BTN_JSON", '{"now_btn_name":"'+now_btn+'"}');
    },

    init_left_btn:function(){
        var self = this;

        this.intro_scroll = this.rootUINode.getChildByName("gamename_panel").getChildByName("intro_scroll");

        function update_item_func(itemPanel, itemData, index){
            // if(index%2 === 1){
            //     itemPanel.getChildByName("light_img").setVisible(false);
            // } else {
            //     itemPanel.getChildByName("light_img").setVisible(true);
            // }

            itemPanel.getChildByName("ruler_btn").loadTextureNormal("res/ui/Default/"+itemData+"_btn_normal.png");
            itemPanel.getChildByName("ruler_btn").loadTextureDisabled("res/ui/Default/"+itemData+"_btn_select.png");

        }

        //cc.error(switches.game_list);
        var info_panel = this.ruler_panel.getChildByName("info_panel");
        info_panel.setScrollBarEnabled(false);
        UICommonWidget.update_scroll_items(info_panel, this.name_list, update_item_func)


        var info_list = info_panel.getChildren();
        this.left_btn_list = [];
        for(var i =0 ; i<info_list.length;i++){
            this.left_btn_list.push(info_list[i].getChildren()[0]);
        }

        for(var i = 0;i<this.left_btn_list.length;i++){
            let choose_num = i;
            this.left_btn_list[choose_num].addTouchEventListener(function (sender, eventType) {
                if (eventType === ccui.Widget.TOUCH_ENDED) {
                    for(var j =0;j<self.left_btn_list.length;j++){
                        if(j==choose_num){
                            self.left_btn_list[choose_num].setTouchEnabled(false);
                            self.left_btn_list[choose_num].setBright(false);
                            var res = ["res/ui/HelpUI/"+self.name_list[choose_num]+"_intro_img.png"];
                            var testTarget = {
                                intro_scroll : self.intro_scroll,
                                game_name : self.name_list[choose_num],
                                trigger : function(){
                                    let intro_img =this.intro_scroll.getChildByName("intro_img");
                                    intro_img.loadTexture("res/ui/HelpUI/"+this.game_name+"_intro_img.png");
                                    intro_img.ignoreContentAdaptWithSize(true);
                                    this.intro_scroll.setInnerContainerSize(intro_img.getContentSize());
                                    this.intro_scroll.jumpToTop();
                                },
                                cb : function(err){cc.log("cb");}
                            };
                            var option = {
                                trigger : testTarget.trigger,
                                triggerTarget : testTarget,
                                cbTarget : testTarget
                            }
                            cc.loader.load(res, option, function(err){
                                if(err) return cc.log("load failed");
                            });
                            self.setCreateInfo(self.name_list[choose_num]);
                        }else{
                            self.left_btn_list[j].setTouchEnabled(true);
                            self.left_btn_list[j].setBright(true);
                        }
                    }
                }
            });
        }

    },

    init_now_btn:function(){

        var self = this;
        for(var i =0;i<this.name_list.length;i++){
            if(this.name_list[i]===this.now_btn_name){
                self.left_btn_list[i].setTouchEnabled(false);
                self.left_btn_list[i].setBright(false);
                //滚动到当前按钮的位置
                var info_panel = this.ruler_panel.getChildByName("info_panel");
                info_panel.jumpToPercentVertical((info_panel.height-self.left_btn_list[i].getParent().getPositionY())/info_panel.height * 100);

                var res = ["res/ui/HelpUI/"+this.name_list[i]+"_intro_img.png"];
                var testTarget = {
                    intro_scroll : self.intro_scroll,
                    game_name : this.name_list[i],
                    trigger : function(){
                        let intro_img =this.intro_scroll.getChildByName("intro_img");
                        intro_img.loadTexture("res/ui/HelpUI/"+this.game_name+"_intro_img.png");
                        intro_img.ignoreContentAdaptWithSize(true);
                        this.intro_scroll.setInnerContainerSize(intro_img.getContentSize());
                        this.intro_scroll.jumpToTop();
                    },
                    cb : function(err){cc.log("cb");}
                };
                var option = {
                    trigger : testTarget.trigger,
                    triggerTarget : testTarget,
                    cbTarget : testTarget
                };
                cc.loader.load(res, option, function(err){
                    if(err) return cc.log("load failed");
                });

                self.intro_scroll.jumpToTop();
                self.setCreateInfo(this.name_list[i]);
                return true;
            }
        }
        return false;

    },

    init_return_btn:function(){
        var self = this;
        var return_btn = this.ruler_panel.getChildByName("return_btn");
        return_btn.hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(-size.width, -size.height * 0.3, size.width * 3, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        function return_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        }
        return_btn.addTouchEventListener(return_btn_event);
    },


});