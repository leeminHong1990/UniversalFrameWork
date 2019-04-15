"use strict";

var ClubMgrUI = UIBase.extend({
    ctor:function () {
        this._super();
        this.resourceFilename = "res/ui/ClubMgrUI.json";
    },

    show_by_info:function (club_id) {
		if(!h1global.player()){return;}
        if(!h1global.player().club_entity_dict[club_id]){return}
        this.club = h1global.player().club_entity_dict[club_id];
        this.show();
    },

    initUI:function () {
        var self = this;
        var club_list = h1global.player().club_entity_dict;
        var owner_id  = h1global.player().userId;

        //这里加一个判断 如果传进来的茶楼id 你不是圈主 就不显示管理界面
        var is_show_mgr_panel = false;
        if(this.club.is_owner(owner_id) || this.club.is_admin()){
            is_show_mgr_panel = true;
        }

        // for (var i in club_list) {
        //     if(club_list[i].is_owner(owner_id)){
        //         this.club = club_list[i];
        //     }
        // }
        var club_mgr_panel = this.rootUINode.getChildByName("club_mgr_panel");
        if(is_show_mgr_panel){ //原本是 this.club
            var mgr_panel = club_mgr_panel.getChildByName("mgr_panel");
            var name_label = mgr_panel.getChildByName("name_label");
            var onwer_label = mgr_panel.getChildByName("onwer_label");
            var mem_label = mgr_panel.getChildByName("mem_label");

            var billboard_label = mgr_panel.getChildByName("billboard_tf");
            var normal_panel =club_mgr_panel.getChildByName("normal_panel");

            name_label.setString(this.club.club_name);
            billboard_label.setString(this.club.club_notice);

            billboard_label.setPlaceHolderColor(cc.color(255,255,255,255));
            billboard_label.setTextColor(cc.color(128,59,31));


            var mode_change_panel = mgr_panel.getChildByName("mode_change_panel");
            var pay_change_panel = mgr_panel.getChildByName("pay_change_panel");
            var lock_change_panel = mgr_panel.getChildByName("lock_change_panel");
            //pay_change_panel.setVisible(false);

            mode_change_panel.getChildByName("mode_change_btn3").setTouchEnabled(false);
            pay_change_panel.getChildByName("pay_change_btn3").setTouchEnabled(false);
            lock_change_panel.getChildByName("lock_change_btn3").setTouchEnabled(false);
            // mgr_panel.getChildByName("mode_change_btn").hitTest = function (pt) {
            //     var size = this.getContentSize();
            //     var bb = cc.rect(-size.width, -size.height * 0.3, size.width * 3, size.height * 2);
            //     return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
            // };

            if(this.club.club_base_info["r_switch"]){
                mode_change_panel.getChildByName("mode_change_btn3").setBright(true);
            }else{
                mode_change_panel.getChildByName("mode_change_btn3").setBright(false);
            }

            if(this.club.club_base_info["p_switch"]){
                pay_change_panel.getChildByName("pay_change_btn3").setBright(true);
            }else{
                pay_change_panel.getChildByName("pay_change_btn3").setBright(false);
            }

            if(this.club.club_base_info["l_switch"]){
                lock_change_panel.getChildByName("lock_change_btn3").setBright(false);
            }else{
                lock_change_panel.getChildByName("lock_change_btn3").setBright(true);
            }

	        mgr_panel.getChildByName("dismiss_room_set_btn").addTouchEventListener(function (sender, eventType) {
		        if (eventType === ccui.Widget.TOUCH_ENDED) {
			        cc.log("dismiss_room_set_btn");
			        h1global.curUIMgr.dismissroomplan_ui.show_by_info(self.club.club_id);
		        }
	        });

            mode_change_panel.getChildByName("mode_change_btn").addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    cc.log(self.club.club_base_info["r_switch"]);
                    if(self.club.club_base_info["r_switch"]){
                        h1global.player().clubOperation(const_val.CLUB_OP_SET_ROOM_SWITCH, self.club.club_id,[0]);
                    }else{
                        h1global.player().clubOperation(const_val.CLUB_OP_SET_ROOM_SWITCH, self.club.club_id,[1]);
                    }
                }
            });

            pay_change_panel.getChildByName("pay_change_btn").addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    cc.log(self.club.club_base_info["p_switch"]);
                    if(self.club.club_base_info["p_switch"]){
                        h1global.player().clubOperation(const_val.CLUB_OP_SET_PAY_MODE_SWITCH, self.club.club_id,[0]);
                    }else{
                        h1global.player().clubOperation(const_val.CLUB_OP_SET_PAY_MODE_SWITCH, self.club.club_id,[1]);
                    }
                }
            });

            lock_change_panel.getChildByName("lock_change_btn").addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    cc.log(self.club.club_base_info["l_switch"]);
                    if(self.club.club_base_info["l_switch"]){
                        h1global.player().clubOperation(const_val.CLUB_OP_SET_LOCK_SWITCH, self.club.club_id,[0]);
                    }else{
                        h1global.player().clubOperation(const_val.CLUB_OP_SET_LOCK_SWITCH, self.club.club_id,[1]);
                    }
                }
            });

            var name_func = function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    if(h1global.curUIMgr.editor_ui && !h1global.curUIMgr.editor_ui.is_show){
                        h1global.curUIMgr.editor_ui.show_by_info(function (editor_string) {
                            h1global.player().clubOperation(const_val.CLUB_OP_SET_NAME, self.club.club_id, [editor_string]);
                        }, self.club.club_name, const_val.CLUB_NAME_LEN)
                    }
                }
            };
            mgr_panel.getChildByName("name_btn").addTouchEventListener(name_func);
            mgr_panel.getChildByName("name_air_btn").addTouchEventListener(name_func);

            var billboard_func = function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    if(h1global.curUIMgr.editor_ui && !h1global.curUIMgr.editor_ui.is_show){
                        h1global.curUIMgr.editor_ui.show_by_info(function (editor_string) {
                            h1global.player().clubOperation(const_val.CLUB_OP_SET_NOTICE, self.club.club_id, [editor_string]);
                        }, self.club.club_notice, const_val.CLUB_NOTICE_LEN)
                    }
                }
            };
            mgr_panel.getChildByName("billboard_btn").addTouchEventListener(billboard_func);
            mgr_panel.getChildByName("billboard_air_btn").addTouchEventListener(billboard_func);
            if(this.club.is_admin()){
				lock_change_panel.setVisible(false);
            }
        }else{
            this.rootUINode.getChildByName("club_mgr_panel").getChildByName("mgr_panel").setVisible(false);
            this.rootUINode.getChildByName("club_mgr_panel").getChildByName("normal_panel").setVisible(false);

            var normal_panel =club_mgr_panel.getChildByName("no_owner_panel");
            normal_panel.setVisible(true);
        }

        var club_entity_list = h1global.player().club_entity_list;
        var info_panel =normal_panel.getChildByName("club_scroll");

        this.update_club_scroll(info_panel, club_entity_list);

        // mgr_panel.getChildByName("dismiss_btn").addTouchEventListener(function (sender, eventType) {
        //     if(eventType === ccui.Widget.TOUCH_ENDED){
        //         // if(h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show){
        //         //     h1global.curUIMgr.club_ui.hide();
        //         // }
        //         if(h1global.curUIMgr.confirm_ui && !h1global.curUIMgr.confirm_ui.is_show && self.club){
        //             h1global.curUIMgr.confirm_ui.show_by_info("是否解散亲友圈", function () {
        //                 h1global.player().deleteClub(self.club.club_id);
        //                 self.hide();
        //             });
        //         }
        //     }
        // });

        club_mgr_panel.getChildByName("return_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        });
    },

    update_mode_change_btn:function (is_show){
        var mode_change_panel = this.rootUINode.getChildByName("club_mgr_panel").getChildByName("mgr_panel").getChildByName("mode_change_panel");
        if(is_show){
            mode_change_panel.getChildByName("mode_change_btn3").setBright(true);
        }else{
            mode_change_panel.getChildByName("mode_change_btn3").setBright(false);
        }
    },

    update_pay_change_btn:function (is_show){
        var pay_change_panel = this.rootUINode.getChildByName("club_mgr_panel").getChildByName("mgr_panel").getChildByName("pay_change_panel");
        if(is_show){
            pay_change_panel.getChildByName("pay_change_btn3").setBright(true);
        }else{
            pay_change_panel.getChildByName("pay_change_btn3").setBright(false);
        }
    },

    update_lock_change_btn:function (is_lock){
        var lock_change_panel = this.rootUINode.getChildByName("club_mgr_panel").getChildByName("mgr_panel").getChildByName("lock_change_panel");
        if(is_lock){
            lock_change_panel.getChildByName("lock_change_btn3").setBright(false);
        }else{
            lock_change_panel.getChildByName("lock_change_btn3").setBright(true);
        }
    },

    update_club_name:function (club_id) {
        if(!this.is_show || this.club.club_id !== club_id){
            return;
        }
        var mgr_panel = this.rootUINode.getChildByName("club_mgr_panel").getChildByName("mgr_panel");
        var name_label = mgr_panel.getChildByName("name_label");
        name_label.setString(this.club.club_name);
    },

    update_club_notice:function (club_id) {
        if(!this.is_show || this.club.club_id !== club_id){
            return;
        }
        var mgr_panel = this.rootUINode.getChildByName("club_mgr_panel").getChildByName("mgr_panel");
        var billboard_label = mgr_panel.getChildByName("billboard_tf");
        billboard_label.setString(this.club.club_notice)
    },

    update_club_scroll:function(info_panel, show_list){
        if(!this.is_show){return;}
        var self = this;

        function update_item_func(itemPanel, itemData, index){
            // if(index%2 === 1){
            //     itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/rank_scroll_bg2.png");
            // } else {
            //     itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/rank_scroll_bg1.png");
            // }
            var head_img_frame = itemPanel.getChildByName("head_img_frame");
            // head_img_frame.setVisible(false);
            itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder()-10);

            cutil.loadPortraitTexture(itemData["owner"]["head_icon"], itemData["owner"]["sex"], function(img){
                if(self && self.is_show){
                    if(itemPanel.getChildByName("head_icon")){
                        itemPanel.removeChild(itemPanel.getChildByName("head_icon"))
                    }
                    var portrait_sprite  = new cc.Sprite(img);
                    portrait_sprite.setScale(74/portrait_sprite.getContentSize().width);
                    itemPanel.addChild(portrait_sprite);
                    portrait_sprite.setPosition(head_img_frame.getPosition());
                    portrait_sprite.setName("head_icon");
                    itemPanel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder())
                    // var portrait_sprite = new cc.Sprite(img);
                    // portrait_sprite.setScale(85 / portrait_sprite.getContentSize().width);
                    // var stencil = new cc.Sprite("res/ui/GameHallUI/mask2.png"); // 遮罩模板 -- 就是你想把图片变成的形状
                    // var printed = new cc.Sprite("res/ui/GameHallUI/fram_printed.png");
                    // var frame = new cc.Sprite("res/ui/GameHallUI/frame.png");
                    // var head_layer = new cc.Layer();
                    // var clipnode = new cc.ClippingNode();
                    // clipnode.setInverted(false);
                    // clipnode.setAlphaThreshold(1);
                    // clipnode.setStencil(stencil);
                    // clipnode.addChild(portrait_sprite);
                    // head_layer.setName("head_icon");
                    // head_layer.addChild(clipnode);
                    // head_layer.addChild(printed);
                    // head_layer.addChild(frame);
                    // head_layer.setPosition(head_img_frame.getPosition());
                    // itemPanel.addChild(head_layer);
                }
            });

            itemPanel.getChildByName("club_name").setString(itemData["club_name"]);
            itemPanel.getChildByName("club_id").setString("亲友圈ID："+itemData["club_id"]);


            itemPanel.getChildByName("quit_btn").addTouchEventListener(function(sender, eventType){
                if(eventType === ccui.Widget.TOUCH_ENDED){
                   cc.log("退出亲友圈辣！");
                    if(h1global.curUIMgr.confirm_ui && !h1global.curUIMgr.confirm_ui.is_show && self.club){
                        h1global.curUIMgr.confirm_ui.show_by_info("退出亲友圈你将无法游戏,是否确定退出?", function () {
                            h1global.player().clubOperation(const_val.CLUB_OP_APPLY_OUT, itemData["club_id"]);
                            self.hide();
                        });
                    }
                   // h1global.player().clubOperation(const_val.CLUB_OP_APPLY_OUT, itemData["club_id"]);
                }
            });

            if(self.club){
                var share_title = "我的亲友圈ID:" + self.club.club_id.toString() + ",";
                var share_desc = "";

                itemPanel.getChildByName("apply_btn").addTouchEventListener(function (sender, eventType) {
                    if(eventType === ccui.Widget.TOUCH_ENDED){
                        cc.log("这里选择邀请好友");
                        if ((cc.sys.os === cc.sys.OS_ANDROID && cc.sys.isNative)) {
                            jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", true, switches.share_android_url, share_title, share_desc);
                        } else if ((cc.sys.os === cc.sys.OS_IOS && cc.sys.isNative)) {
                            jsb.reflection.callStaticMethod("WechatOcBridge", "callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", true, switches.share_ios_url, share_title, share_desc);
                        } else {
                            //cutil.share_func(share_title, share_desc);
                            //h1global.curUIMgr.share_ui.show();
                            cc.log("发条log就当分享成功了吧....");
                        }
                    }
                });
            }
            if(h1global.player().userId === itemData["owner"]["userId"]){
                itemPanel.getChildByName("quit_btn").setVisible(false);
                itemPanel.getChildByName("apply_btn").setVisible(true);
                itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light2_img.png");
            }else{
                itemPanel.getChildByName("quit_btn").setVisible(true);
                itemPanel.getChildByName("apply_btn").setVisible(false);
                itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light_img.png");
            }
        }
        UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func)
    },
});