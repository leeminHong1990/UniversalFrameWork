var ShowClubUI = UIBase.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/ShowClubUI.json";
    },

    initUI:function(){
        this.show_club_panel = this.rootUINode.getChildByName("show_club_panel");
        var self = this;
        var close_btn = this.show_club_panel.getChildByName("close_btn");
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

        var create_btn = this.show_club_panel.getChildByName("create_btn");

        // 如果创建过亲友圈 就无法再建
        var club_list = h1global.player().club_entity_dict;
        // var owner_id  = h1global.player().userId;
        var created = false;

        for (var i in club_list) {
            if(club_list[i].is_true_owner()){
                create_btn.setTouchEnabled(false);
                create_btn.setBright(false);
                created = true;
            }
        }

        function create_club_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                // if (h1global.player().isAgent !== 1) {
                //     h1global.globalUIMgr.info_ui.show_by_info("您不是代理，不能创建亲友圈");
                //     return;
                // }
                if(h1global.player().club_entity_list.length >= const_val.CLUB_NUM_LIMIT){
                    if(h1global.globalUIMgr.info_ui && !h1global.globalUIMgr.info_ui.is_show){
                        h1global.globalUIMgr.info_ui.show_by_info("加入亲友圈数量已达到上限");
                    }
                } else {
                    if(h1global.curUIMgr.createclub_ui && !h1global.curUIMgr.createclub_ui.is_show){
	                    h1global.curUIMgr.createclub_ui.show();
	                    self.hide();
	                    let player = h1global.entityManager.player();
                        if (player) {
                            player.upLocationInfo();
                        } else {
                            cc.log('player undefined');
                        }
                    }
                }
            }
        }
        create_btn.addTouchEventListener(create_club_btn_event);

        var join_btn = this.show_club_panel.getChildByName("join_btn");
        function join_club_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                if(h1global.curUIMgr.joinclub_ui && !h1global.curUIMgr.joinclub_ui.is_show){
	                h1global.curUIMgr.joinclub_ui.show();
	                self.hide();
	                let player = h1global.entityManager.player();
                    if (player) {
                        player.upLocationInfo();
                    } else {
                        cc.log('player undefined');
                    }
                }
            }
        }
        join_btn.addTouchEventListener(join_club_btn_event);

        if(created && h1global.player().club_entity_list.length >= const_val.CLUB_NUM_LIMIT){
            join_btn.setTouchEnabled(false);
            join_btn.setBright(false);
        }
        
        if(!created && h1global.player().club_entity_list.length >= const_val.CLUB_NUM_LIMIT-1){
            join_btn.setTouchEnabled(false);
            join_btn.setBright(false);
        }

    },
});