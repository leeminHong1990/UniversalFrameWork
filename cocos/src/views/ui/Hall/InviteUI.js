"use strict";
var InviteUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/InviteUI.json";
	},

	initUI:function(){
		this.invite_panel = this.rootUINode.getChildByName("invite_panel");
		this.update_invite_panel();
	},

    show_by_info:function(invite_msg){
		if(!this.invite_list){
			this.invite_list = [];
		}
		if(!this.check_yes){
            this.check_yes = 0;
        }
		//如果接受过邀请则清空数组
        if(this.check_yes){
            this.invite_list.splice(0,this.invite_list.length);
            this.check_yes = 0;
        }
		// this.invite_list.push(invite_msg);
		this.invite_list.unshift(invite_msg);
        if(this.is_show){
            this.update_invite_panel();
        }else{
            this.show();
        }
    },

	update_invite_panel:function(){
    	if(!this.invite_list || this.invite_list.length == 0 ){
    		this.hide();
    		return;
		}
		var self = this;
		var data = this.invite_list[0];
    	this.invite_panel.getChildByName("yes_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
            	if(h1global.player()){
            	    self.check_yes = 1;
                    h1global.player().enterRoom(data["room_id"]);
                    self.invite_list.shift();
                    self.update_invite_panel();
				}
            }
        });
        this.invite_panel.getChildByName("refuse_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                if(h1global.player()){
                    self.invite_list.shift();
                    self.update_invite_panel();
                }
            }
        });
        var itemData = data["inviter_info"]
        cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function(img){
            if(self && self.is_show && cc.sys.isObjectValid(self.invite_panel)){
                if(self.invite_panel.getChildByName("head_icon")){
                    self.invite_panel.removeChild(self.invite_panel.getChildByName("head_icon"))
                }
                var portrait_sprite  = new cc.Sprite(img);
                portrait_sprite.setScale(155/portrait_sprite.getContentSize().width);
                self.invite_panel.addChild(portrait_sprite);
                portrait_sprite.setPosition(self.invite_panel.getChildByName("frame_img").getPosition());
                portrait_sprite.setName("head_icon");
                self.invite_panel.reorderChild(portrait_sprite, self.invite_panel.getChildByName("frame_img").getLocalZOrder())
            }
        });

        var msg_panel = this.invite_panel.getChildByName("msg_panel");
        msg_panel.getChildByName("name_label").setString(itemData["name"]);
        msg_panel.getChildByName("circle_name_label").setString(data["club_name"]);
        msg_panel.getChildByName("mode_label").setString(const_val.GameType2CName[data["gameType"]]);
	},
});