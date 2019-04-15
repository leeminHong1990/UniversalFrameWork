"use strict";
var BindCodeUI = BasicDialogUI.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/BindCodeUI.json";
	},

	initUI:function(){
		cc.log(this);
		this.curNum = 0;
		this.joinroom_panel = this.rootUINode.getChildByName("joinroom_panel");
		var self = this;
		var player = h1global.player();
		this.btn_list = [];
		function btn_event(sender, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED){
                for(var i = 0 ; i < self.btn_list.length ; i++) {
                	if(sender === self.btn_list[i]){
                        if (self.curNum > 9999999) {
                            return;
                        }
                        self.curNum = (self.curNum * 10 + i) % 10000000;
                        self.update_click_num();
					}
				}
            }
		}
        for(var i = 0 ; i < 10 ; i ++) {
            var btn = this.joinroom_panel.getChildByName("_" + i.toString() + "_btn");
            this.btn_list.push(btn);
            btn.addTouchEventListener(btn_event);
        }

		this.joinroom_panel.getChildByName("_clear_btn").addTouchEventListener(function(sender, eventType){
			if(eventType === ccui.Widget.TOUCH_ENDED){
				self.clear_click_num();
			}
		});
		this.joinroom_panel.getChildByName("_del_btn").addTouchEventListener(function(sender, eventType){
			if(eventType === ccui.Widget.TOUCH_ENDED){
				self.curNum = Math.floor(self.curNum / 10);
				self.update_click_num();
			}
		});
		this.joinroom_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType){
			if(eventType === ccui.Widget.TOUCH_ENDED){
				self.hide();
			}
		});

		this.update_click_num();
	},

	update_click_num:function(){
		var roomNum = this.curNum;
		for(var i = 0; i < 7; i++){
			var cur_num_img = this.joinroom_panel.getChildByName("num_img" + i.toString());
			cur_num_img.ignoreContentAdaptWithSize(true);
			if(roomNum <= 0){
				cur_num_img.setVisible(false);
			} else {
                cur_num_img.loadTexture("res/ui/JoinRoomUI/0" + (roomNum%10).toString() + ".png");
				cur_num_img.setVisible(true);
				roomNum = Math.floor(roomNum/10);
			}
		}
        this.try_join();
	},

	clear_click_num:function () {
		this.curNum = 0;
		for(var i = 0; i < 7; i++){
			var cur_num_img = this.joinroom_panel.getChildByName("num_img" + i.toString());
			cur_num_img.setVisible(false);
		}
    },

	try_join:function () {
		var self = this;
        if (this.curNum > 999999) {
            // h1global.player().enterRoom(this.curNum);

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
                        if(h1global.curUIMgr.gamehallshare_ui && h1global.curUIMgr.gamehallshare_ui.is_show){
                            h1global.curUIMgr.gamehallshare_ui.hide();
                        }
                        if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                            h1global.curUIMgr.gamehall_ui.updateCharacterCard();
                        }
                        self.hide();
                    }else{
                    	if(result){
                    		if(result["bind_id"]&&result["bind_name"]){
                                h1global.globalUIMgr.info_ui.show_by_info("您已成功绑定"+result["bind_name"]+"(id:"+result["bind_id"]+")");
							}else{
                                h1global.globalUIMgr.info_ui.show_by_info(result["errmsg"]);
							}
						}else{
                            h1global.globalUIMgr.info_ui.show_by_info("绑定失败！请重试");
						}
                        self.clear_click_num();
                        return;
                    }
                }else{
                    h1global.globalUIMgr.info_ui.show_by_info("绑定失败！请重试");
                    self.clear_click_num();
                    return;
                }
            };
            bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
            bind_xhr.send(cutil.postDataFormat({"inviter_id": this.curNum}));
            cutil.lock_ui();

        }
    },
});