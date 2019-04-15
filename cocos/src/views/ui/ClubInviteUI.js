//var GPSceneUI = UIBase.extend({
var ClubInviteUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/ClubInviteUI.json";
        this.setLocalZOrder(const_val.GPSceneZOrder);
    },

    initUI:function(){
        this.members = [];
        if(!this.touch_time_list){
            this.touch_time_list = {};
        }
        this.wait_time = 60;

        var self = this;
        this.rootUINode.getChildByName("gps_panel").getChildByName("close_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        });
        if(h1global.player()){
			h1global.player().clubOperation(const_val.CLUB_OP_GET_MEMBERS2, h1global.player().curGameRoom.club_id,[0,20,"",["online","free"]]);
			cutil.lock_ui();
        }
    },

    update_club_member:function(club_id,member_list){
        if(!this.is_show){return;}
        if(h1global.player() && h1global.player().curGameRoom.club_id == club_id){
            this.members = member_list;
            this.update_member_panel();
        }else{
            this.hide()
        }
    },

    update_member_panel:function(){
        var self = this;
        var now_time = Math.round(new Date() / 1000);
        function update_item_func(itemPanel, itemData, index){
            var head_img_frame = itemPanel.getChildByName("head_img_frame");
            itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder()-10);
            cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function(img){
                if(self && self.is_show && cc.sys.isObjectValid(itemPanel)){
                    if(itemPanel.getChildByName("head_icon")){
                        itemPanel.removeChild(itemPanel.getChildByName("head_icon"))
                    }
                    var portrait_sprite  = new cc.Sprite(img);
                    portrait_sprite.setScale(66/portrait_sprite.getContentSize().width);
                    itemPanel.addChild(portrait_sprite);
                    portrait_sprite.setPosition(head_img_frame.getPosition());
                    portrait_sprite.setName("head_icon");
                    itemPanel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder())
                }
            });

            itemPanel.getChildByName("name_label").setString(cutil.info_sub_ver2(itemData["nickname"], 4));
            // itemPanel.getChildByName("id_label").setString(itemData["userId"]);
            cc.log(itemData);
            itemPanel.getChildByName("state_label").setString("空闲");
            itemPanel.getChildByName("invite_btn").addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    cc.log("邀请好友~~~！！！");
                    h1global.player().inviteClubMemberRoom([itemData["userId"]]);
                    self.show_wait_label(itemData["userId"],itemPanel);
                }
            });

            if(self.touch_time_list && self.touch_time_list[itemData["userId"]]){
                if(  now_time - self.touch_time_list[itemData["userId"]] < self.wait_time ){
                    self.show_wait_label(itemData["userId"],itemPanel,self.touch_time_list[itemData["userId"]]);
                }
            }
        }
        var info_panel = this.rootUINode.getChildByName("gps_panel").getChildByName("invite_scroll");
        var show_list = [];
        for(var k in this.members){
            if(!this.members[k].online || !this.members[k].free ||h1global.player().userId === this.members[k].userId){
                continue;
            }
            show_list.push(this.members[k]);
        }
        UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func)
		// this.scroll_state = 0;
		//
		// function update_bottom_scroll(){
		// 	if(this.scroll_list == 1){
		// 		return;
		// 	}
		// 	this.scroll_state = 1;
		//
		// }
		//
		// info_panel.addEventListener(function(sender,eventType){
		// 	// cc.error(eventType)
		// 	if(eventType === ccui.ScrollView.EVENT_SCROLL_TO_BOTTOM){
		// 		cc.log(11111)
		// 		//拉到最底部的时候
		// 		// cutil.lock_ui();
		// 		update_bottom_scroll();
		// 	}
		// })
    },

    show_wait_label:function(userId,itemPanel,touch_time){
        itemPanel.getChildByName("invite_btn").setVisible(false);
        itemPanel.getChildByName("wait_btn").setVisible(true);
        var label = itemPanel.getChildByName("wait_btn").getChildByName("time_label");
        var add_time = 0;
        if(touch_time){
            add_time = touch_time;
        }else{
            add_time = Math.round(new Date() / 1000);
            this.touch_time_list[userId] = add_time;
        }

        cutil.set_time_label(label,"00:","",this.wait_time,add_time,function(){
            itemPanel.getChildByName("invite_btn").setVisible(true);
            itemPanel.getChildByName("wait_btn").setVisible(false);
        });
    },

});