var CreateClubUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/CreateClubUI.json";
    },

    initUI:function(){
        this.createclub_panel = this.rootUINode.getChildByName("createclub_panel");
        var self = this;
        var close_btn = this.createclub_panel.getChildByName("close_btn");
        close_btn.hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(-size.width, -size.height * 0.3, size.width * 3, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        function return_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        }
        close_btn.addTouchEventListener(return_btn_event);

        var create_btn = this.createclub_panel.getChildByName("check_panel").getChildByName("create_btn");

        function create_club_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                if(!1){
                    //如果房卡不足就显示这个界面
                    self.createclub_panel.getChildByName("check_panel").setVisible(false);
                    self.createclub_panel.getChildByName("prompt_panel").setVisible(true);
                }else if(h1global.curUIMgr.editor_ui && !h1global.curUIMgr.editor_ui.is_show){
                    // h1global.curUIMgr.editor_ui.show_by_info(function (editor_string) {
                    //     if(h1global.curUIMgr.createclub_ui && h1global.curUIMgr.createclub_ui.is_show){
                    //         h1global.curUIMgr.createclub_ui.hide()
                    //     }
                    //     //h1global.player().createClub(editor_string, parameters);
                    //     cc.log("此处创建亲友圈");
                    // }, "给您的亲友圈取个名", const_val.CLUB_NAME_LEN)

                    h1global.player().createClub();
                    self.hide();
                }
            }
        }
        create_btn.addTouchEventListener(create_club_btn_event);

        var cancel_btn = this.createclub_panel.getChildByName("check_panel").getChildByName("cancel_btn");
        function cancel_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        }
        cancel_btn.addTouchEventListener(cancel_btn_event);
    },
});