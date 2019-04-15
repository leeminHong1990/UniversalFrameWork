"use strict";
var GameHallShareUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/GameHallShareUI.json";
    },

    show_by_info:function(type){
        this.type = type;
        this.show();
    },

    initUI:function(){
        this.share_panel = this.rootUINode.getChildByName("share_panel");
        this.bind_panel = this.share_panel.getChildByName("bind_panel");
        this.to_share_panel = this.share_panel.getChildByName("to_share_panel");

        if(this.type && this.type == 1){
            this.bind_panel.setVisible(false);
            this.to_share_panel.setVisible(true);
        }else{
            this.bind_panel.setVisible(true);
            this.to_share_panel.setVisible(false);
        }

        var self = this;
        var return_btn = this.share_panel.getChildByName("return_btn");
        // return_btn.hitTest = function (pt) {
        //     var size = this.getContentSize();
        //     var bb = cc.rect(-size.width, -size.height * 0.3, size.width * 3, size.height * 2);
        //     return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        // };
        function return_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        }
        return_btn.addTouchEventListener(return_btn_event);

        //绑定按钮
        this.bind_panel.getChildByName("bind_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                //self.backnum_panel.setVisible(true);
                var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                if(info_dict["bind"]){
                    if(info_dict["bind_id"]&&info_dict["bind_name"]){
                        h1global.globalUIMgr.info_ui.show_by_info("您已成功绑定玩家"+info_dict["bind_name"]+"(id:"+info_dict["bind_id"]+")");
                    }else{
                        h1global.globalUIMgr.info_ui.show_by_info("您已经绑定过了！");
                    }
                }else{
                    h1global.curUIMgr.bindcode_ui.show();
                }
            }
        });
        //邀请好友按钮
        this.to_share_panel.getChildByName("share_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
				var timestamp = Math.round(new Date() / 1000);
                if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)){
                    jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "shareZQM", "(ZLjava/lang/String;)V", true, switches.PHP_SERVER_URL + "/invite/" + timestamp + "/" + info_dict["user_id"]);
                } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
                    jsb.reflection.callStaticMethod("WechatOcBridge", "shareZQM:withURL:", true, switches.PHP_SERVER_URL + "/invite/" + timestamp + "/" + info_dict["user_id"]);
                } else {
                    cc.log("share not support web")
                }
            }
        });

        this.init_copy_btn();


    },

    init_copy_btn:function(){
        var service_panel = this.to_share_panel.getChildByName("service_panel")
        var copy_btn2 = service_panel.getChildByName("copy_btn");
        function copy_btn_event2(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                cutil.copyToClipBoard("飞侠互娱");
            }
        }
        copy_btn2.addTouchEventListener(copy_btn_event2);
        service_panel.getChildByName("wx_label").setString("飞侠互娱");
    },
});