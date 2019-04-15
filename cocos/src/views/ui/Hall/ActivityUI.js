"use strict";
var ActivityUI = UIBase.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/ActivityUI.json";
    },

    show_by_info:function (result) {
        this.result = result;
        var self = this;
        this.show(function () {
            self.runAction(cc.sequence(cc.delayTime(0.0016),cc.callFunc(function () {
                self.init_now_btn();
                // cutil.lock_ui()
                // //出bug了 先这样
                // self.now_btn_name = self.result[0]['name'];
                // if(!self.init_now_btn()){
                //     self.now_btn_name = self.result[0]['name'];
                //     if(!self.init_now_btn()){
                //         cc.log("如果再次调用还出错就完蛋辣！~");
                //         return;
                //     }
                // }
            })))

        });
    },

    initUI:function(){
        var self = this;
        var activity_panel = this.rootUINode.getChildByName("activity_panel");
        activity_panel.getChildByName("close_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        });
        this.init_panel();
        // this.get_activity_data();
    },

    init_panel:function(){
        if(!this.result){
            this.result = [{
                "id": 1,
                "name": "大奖转不停",
                "url": "http:\/\/www.baidu.com",
                "img": "http:\/\/sxqp2.zjfeixia.com\/images\/activities\/notice_img4.png"
            }, {
                "id": 2,
                "name": "sjhd_btn",
                "url": "https:\/\/www.sina.com.cn",
                "img": "http:\/\/sxqp2.zjfeixia.com\/images\/activities\/notice_img4.png"
            }, {
                "id": 3,
                "name": "按钮3",
                "url": "",
                "img": "http:\/\/sxqp2.zjfeixia.com\/images\/activities\/notice_img4.png"
            }]
        }
        var result = this.result;

        cc.log(result);
        cc.log(result.length);

        this.activity_panel = this.rootUINode.getChildByName("activity_panel");
        this.initCreateInfo();
        this.name_list = [];
        this.url_list = [];
        this.img_list = [];

        for (var k in result){
            // if(result[k]["is_show"]){
            if(1){
                this.name_list.push(result[k]["name"]);
                this.img_list.push(result[k]["img"]);
                this.url_list.push(result[k]["url"]);
            }
        }

        this.result = result;
        this.init_left_btn();
        this.now_btn_name = this.result[0]['name'];
        //this.init_now_btn();

    },

    init_left_btn:function(){
        var self = this;

        this.intro_scroll = this.rootUINode.getChildByName("activity_panel").getChildByName("notice_panel");

        function update_item_func(itemPanel, itemData, index){
            // if (!((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative))) {
            //     itemPanel.getChildByName("btn").loadTextureNormal("res/ui/ActivityUI/activity_btn_normal.png");
            //     itemPanel.getChildByName("btn").loadTexturePressed("res/ui/ActivityUI/activity_btn_normal.png");
            //     itemPanel.getChildByName("btn").loadTextureDisabled("res/ui/ActivityUI/activity_btn_select.png");
            // }else{
            //     if(jsb.fileUtils.isFileExist ("res/ui/Default/"+itemData["name"]+"_btn_normal.png")){
            //         itemPanel.getChildByName("btn").loadTextureNormal("res/ui/Default/"+itemData["name"]+"_normal.png");
            //         itemPanel.getChildByName("btn").loadTexturePressed("res/ui/Default/"+itemData["name"]+"_normal.png");
            //         itemPanel.getChildByName("btn").loadTextureDisabled("res/ui/Default/"+itemData["name"]+"_select.png");
            //     }else{
            //         cc.warn("没有找到该活动图片的按钮,使用了默认图片")
            //         itemPanel.getChildByName("btn").loadTextureNormal("res/ui/ActivityUI/activity_btn_normal.png");
            //         itemPanel.getChildByName("btn").loadTexturePressed("res/ui/ActivityUI/activity_btn_normal.png");
            //         itemPanel.getChildByName("btn").loadTextureDisabled("res/ui/ActivityUI/activity_btn_select.png");
            //     }
            // }
            itemPanel.getChildByName("btn").getChildByName("label").setString(itemData["name"]);
            itemPanel.getChildByName("btn").getChildByName("label").updateDisplayedColor(cc.color(157,75,38));
        }

        var info_panel = this.activity_panel.getChildByName("info_panel");
        info_panel.setScrollBarEnabled(false);
        UICommonWidget.update_scroll_items(info_panel, this.result, update_item_func)


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
                            self.left_btn_list[choose_num].getChildByName("label").updateDisplayedColor(cc.color(255,255,255))

                            cc.log(self.left_btn_list[choose_num]);
                            // var res = ["res/ui/HelpUI/"+self.name_list[choose_num]+"_intro_img.png"];
                            cc.log(typeof self.result[choose_num]["url"])
                            if(self.result[choose_num]["url"].length>0 && (self.result[choose_num]["url"].substr(0,7)=="http://"||self.result[choose_num]["url"].substr(0,8)=="https://")){
                                self.intro_scroll.getChildByName("notice_img").addTouchEventListener(function (sender, eventType) {
                                    if(eventType === ccui.Widget.TOUCH_ENDED){
                                        cutil.open_url(self.result[choose_num]["url"]);
                                    }
                                });
                            }
                            cutil.lock_ui();
                            cutil.loadURLTexture(self.result[choose_num]["img"], function(img){
                                if(self && self.is_show && cc.sys.isObjectValid(self.intro_scroll)){
                                    if(self.intro_scroll.getChildByName("head_icon")){
                                        self.intro_scroll.removeChild(self.intro_scroll.getChildByName("head_icon"))
                                    }
                                    var portrait_sprite = new cc.Sprite(img);
                                    portrait_sprite.setName("head_icon");
                                    self.intro_scroll.addChild(portrait_sprite)
                                    var img = self.intro_scroll.getChildByName("notice_img");
                                    portrait_sprite.setPosition(img.getPosition());
                                    cutil.unlock_ui();
                                }
                            });

                            // var res = [self.result[choose_num]["img"]];
                            // var testTarget = {
                            //     intro_scroll : self.intro_scroll,
                            //     game_name : self.result[choose_num]["name"],
                            //     trigger : function(){
                            //         let intro_img =this.intro_scroll.getChildByName("notice_img");
                            //         //cutil.unlock_ui();
                            //         // cutil.loadURLTexture(self.result[choose_num]["img"], function(img){
                            //         //     if(self && self.is_show && cc.sys.isObjectValid(self.intro_scroll)){
                            //         //         if(self.intro_scroll.getChildByName("head_icon")){
                            //         //             self.intro_scroll.removeChild(self.intro_scroll.getChildByName("head_icon"))
                            //         //         }
                            //         //         var portrait_sprite = new cc.Sprite(img);
                            //         //         portrait_sprite.setName("head_icon");
                            //         //         self.intro_scroll.addChild(portrait_sprite)
                            //         //         var img = self.intro_scroll.getChildByName("notice_img");
                            //         //         portrait_sprite.setPosition(img.getPosition());
                            //         //         cutil.unlock_ui();
                            //         //     }
                            //         // });
                            //     },
                            //     cb : function(err){cc.log("cb");}
                            // };
                            // var option = {
                            //     trigger : testTarget.trigger,
                            //     triggerTarget : testTarget,
                            //     cbTarget : testTarget
                            // }
                            // cc.loader.load(res, option, function(err){
                            //     if(err) return cc.log("load failed");
                            // });
                            // cutil.lock_ui();
                            self.setCreateInfo(self.result[choose_num]["name"]);
                        }else{
                            self.left_btn_list[j].setTouchEnabled(true);
                            self.left_btn_list[j].setBright(true);
                            self.left_btn_list[j].getChildByName("label").updateDisplayedColor(cc.color(157,75,38));

                        }
                    }
                }
            });
        }

    },

    initCreateInfo: function () {
        var default_info_json = '{"now_btn_name":"ddz"}';
        var info_json = cc.sys.localStorage.getItem("ACTIVIY_BTN_JSON");
        if (!info_json) {
            cc.sys.localStorage.setItem("ACTIVIY_BTN_JSON", default_info_json);
            info_json = cc.sys.localStorage.getItem("ACTIVIY_BTN_JSON");
        }
        cc.warn(info_json);
        var info_dict = eval("(" + info_json + ")");
        this.now_btn_name = info_dict["now_btn_name"];
    },

    setCreateInfo:function (now_btn) {
        cc.sys.localStorage.setItem("ACTIVIY_BTN_JSON", '{"now_btn_name":"'+now_btn+'"}');
    },

    init_now_btn:function(){
        var self = this;
        cc.log(this.now_btn_name);
        for(var i =0;i<this.left_btn_list.length;i++){
            let choose_num = i;
            if(this.result[i]["name"]===this.now_btn_name){
                self.left_btn_list[i].setTouchEnabled(false);
                self.left_btn_list[i].setBright(false);
                self.left_btn_list[i].getChildByName("label").updateDisplayedColor(cc.color(255,255,255));
                //滚动到当前按钮的位置
                var info_panel = this.activity_panel.getChildByName("info_panel");
                info_panel.jumpToPercentVertical((info_panel.height-self.left_btn_list[i].getParent().getPositionY())/info_panel.height * 100);
                cc.log(typeof self.result[choose_num]["url"])
                if(self.result[choose_num]["url"].length>0){
                    self.intro_scroll.getChildByName("notice_img").addTouchEventListener(function (sender, eventType) {
                        if(eventType === ccui.Widget.TOUCH_ENDED){
                            cutil.open_url(self.result[choose_num]["url"]);
                        }
                    });
                }
                cutil.lock_ui();
                cutil.loadURLTexture(self.result[choose_num]["img"], function(img){
                    if(self && self.is_show && cc.sys.isObjectValid(self.intro_scroll)){
                        if(self.intro_scroll.getChildByName("head_icon")){
                            self.intro_scroll.removeChild(self.intro_scroll.getChildByName("head_icon"))
                        }
                        var portrait_sprite = new cc.Sprite(img);
                        portrait_sprite.setName("head_icon");
                        self.intro_scroll.addChild(portrait_sprite)
                        var img = self.intro_scroll.getChildByName("notice_img");
                        portrait_sprite.setPosition(img.getPosition());
                        cutil.unlock_ui();
                    }
                });

                // var res = [self.result[choose_num]["img"]];
                // var testTarget = {
                //     intro_scroll : self.intro_scroll,
                //     game_name : self.result[choose_num]["name"],
                //     trigger : function(){
                //         let intro_img =this.intro_scroll.getChildByName("notice_img");
                //         cutil.unlock_ui();
                //         // cutil.loadURLTexture(self.result[choose_num]["img"], function(img){
                //         //     if(self && self.is_show && cc.sys.isObjectValid(self.intro_scroll)){
                //         //         if(self.intro_scroll.getChildByName("head_icon")){
                //         //             self.intro_scroll.removeChild(self.intro_scroll.getChildByName("head_icon"))
                //         //         }
                //         //         var portrait_sprite = new cc.Sprite(img);
                //         //         portrait_sprite.setName("head_icon");
                //         //         self.intro_scroll.addChild(portrait_sprite)
                //         //         var img = self.intro_scroll.getChildByName("notice_img");
                //         //         portrait_sprite.setPosition(img.getPosition());
                //         //         cutil.unlock_ui();
                //         //     }
                //         // });
                //     },
                //     cb : function(err){cc.log("cb");}
                // };
                // var option = {
                //     trigger : testTarget.trigger,
                //     triggerTarget : testTarget,
                //     cbTarget : testTarget
                // }
                // cc.loader.load(res, option, function(err){
                //     if(err) return cc.log("load failed");
                // });

                self.setCreateInfo(this.result[choose_num]["name"]);
                return true;
            }
        }
        return false;

    },


});