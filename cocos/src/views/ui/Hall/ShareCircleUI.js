"use strict";

var ShareCircleUI = BasicDialogUI.extend({
    ctor:function () {
        this._super();
        this.resourceFilename = "res/ui/ShareCircleUI.json";
    },

    initUI:function () {
        var self = this;
        var share_panel = this.rootUINode.getChildByName("share_panel");

        var close_btn = share_panel.getChildByName("close_btn");
        function close_btn_event(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        }
        close_btn.addTouchEventListener(close_btn_event);


        var share_btn_left = share_panel.getChildByName("share_btn_left");
        function share_btn_left_event(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.share();
            }
        }
        share_btn_left.addTouchEventListener(share_btn_left_event);

        var share_btn_right = share_panel.getChildByName("share_btn_right");
        function share_btn_right_event(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.share();
            }
        }
        share_btn_right.addTouchEventListener(share_btn_right_event);
    },

    share:function () {
        if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)){
            jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "shareFreeCard", "()V");
        } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
            jsb.reflection.callStaticMethod("WechatOcBridge", "shareFreeCard");
        } else {
	        cc.log("share not support web");
        }
    }
});