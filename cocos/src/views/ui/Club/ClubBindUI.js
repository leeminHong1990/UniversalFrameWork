"use strict";
var ClubBindUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/ClubBindUI.json";
	},

	show_by_info:function (club_id) {
		if(!h1global.player() || !h1global.player().club_entity_dict){return}
		if(!h1global.player().club_entity_dict[club_id]){return}
		this.club = h1global.player().club_entity_dict[club_id];
		this.show();
	},

	initUI:function(){
		this.club_bind_panel = this.rootUINode.getChildByName("club_bind_panel");
		var self = this;
		var itemData = this.club.owner;
		this.club_bind_panel.getChildByName("yes_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				if(h1global.player()){
					self.club_bind_code(itemData["userId"]);
				}
			}
		});
		this.club_bind_panel.getChildByName("refuse_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				self.hide();
			}
		});
		this.club_bind_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				self.hide();
			}
		});
		cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function(img){
			if(self && self.is_show && cc.sys.isObjectValid(self.club_bind_panel)){
				if(self.club_bind_panel.getChildByName("head_icon")){
					self.club_bind_panel.removeChild(self.club_bind_panel.getChildByName("head_icon"))
				}
				var portrait_sprite  = new cc.Sprite(img);
				portrait_sprite.setScale(155/portrait_sprite.getContentSize().width);
				self.club_bind_panel.addChild(portrait_sprite);
				portrait_sprite.setPosition(self.club_bind_panel.getChildByName("frame_img").getPosition());
				portrait_sprite.setName("head_icon");
				self.club_bind_panel.reorderChild(portrait_sprite, self.club_bind_panel.getChildByName("frame_img").getLocalZOrder())
			}
		});

		var owner_info_panel = this.club_bind_panel.getChildByName("owner_info_panel");
		owner_info_panel.getChildByName("name_label").setString(itemData["nickname"]);
		owner_info_panel.getChildByName("id_label").setString(itemData["userId"]);
		owner_info_panel.getChildByName("code_label").setString(itemData["userId"]);
	},

	club_bind_code:function (bind_code) {
		var self = this;
		if (bind_code > 999999) {
			var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
			var bind_xhr = cc.loader.getXMLHttpRequest();
			bind_xhr.open("POST", switchesnin1.PHP_SERVER_URL + "/api/bind_invite", true);
			bind_xhr.onreadystatechange = function(){
				cutil.unlock_ui();
				if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
					var result = JSON.parse(bind_xhr.responseText);
					cc.log(result);
					if(result && result["errcode"]==0){
						info_dict["bind"] = true;
						if(result["bind_id"]&&result["bind_name"]){
							info_dict["bind_id"] = result["bind_id"];
							info_dict["bind_name"] = result["bind_name"];
							h1global.globalUIMgr.info_ui.show_by_info(result["errmsg"]+result["bind_name"]+"."+result["bind_id"]);
						}else{
							h1global.globalUIMgr.info_ui.show_by_info(result["errmsg"]);
						}
						cc.sys.localStorage.setItem("INFO_JSON",JSON.stringify(info_dict));
						if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
							h1global.curUIMgr.gamehall_ui.updateCharacterCard();
						}
						if(h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show){
							h1global.curUIMgr.club_ui.update_setting_btn();
						}
						self.hide();
					}else{
						if(result){
							if(result["bind_id"]&&result["bind_name"]){
								info_dict["bind"] = true;
								info_dict["bind_id"] = result["bind_id"];
								info_dict["bind_name"] = result["bind_name"];
								cc.sys.localStorage.setItem("INFO_JSON",JSON.stringify(info_dict));
								h1global.globalUIMgr.info_ui.show_by_info("您已成功绑定玩家"+result["bind_name"]+"(id:"+result["bind_id"]+")");
								if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
									h1global.curUIMgr.gamehall_ui.updateCharacterCard();
								}
								if(h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show){
									h1global.curUIMgr.club_ui.update_setting_btn();
								}
								self.hide();
							}else{
								h1global.globalUIMgr.info_ui.show_by_info(result["errmsg"]);
							}
						}else{
							h1global.globalUIMgr.info_ui.show_by_info("绑定失败！请重试");
						}
						return;
					}
				}else{
					h1global.globalUIMgr.info_ui.show_by_info("绑定失败！请重试");
					return;
				}
			};
			bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
			bind_xhr.send(cutil.postDataFormat({"inviter_id": bind_code}));
			cutil.lock_ui();
		}
	},
});