"use strict";
var DisclaimerUI = BasicDialogUI.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/DisclaimerUI.json";
        // this.setLocalZOrder(const_val.MAX_LAYER_NUM);
    },

    initUI: function () {

        this.update_out_btn();
        this.update_yes_btn();
    },

    update_out_btn: function () {
        this.rootUINode.getChildByName("disclaimer_panel").getChildByName("no_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                cutil.lock_ui();
                h1global.player().logout();
            }
        })
    },

    update_yes_btn: function () {
        var self = this;
        this.rootUINode.getChildByName("disclaimer_panel").getChildByName("yes_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.set_yes_msg();
                self.hide();
            }
        })
    },

    set_yes_msg: function () {
        var yes_btn_json = '{"receive":"1"}';
        cc.sys.localStorage.setItem(h1global.player().userId+"DISCLAIMER_JSON", yes_btn_json);
    },


});