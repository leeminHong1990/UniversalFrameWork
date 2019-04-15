"use strict";

var ClubUI = UIBase.extend({
    ctor:function () {
       this._super();
       this.resourceFilename = "res/ui/ClubUI.json";
    },

    show_by_info:function (club_id) {
        this.club = h1global.player().club_entity_dict[club_id];
        if(!this.club){
            return
        }
        this.show();
    },

    initUI:function () {
	    // this.stool_img_list = [];
        this.club_btn_list = [];
        // h1global.player().clubOperation(const_val.CLUB_OP_GET_MEMBERS, this.club.club_id);
        this.init_top_panel();
        this.init_bottom_panel();
        // cutil.lock_ui();
        this.update_desk_panel(this.club.club_id, this.club.club_base_info.table_info_list);
        this.show_notice(this.club.club_id, this.club.club_notice);
        this.init_lock_panel();
    },

    init_top_panel:function () {
        var self = this;
        var top_panel = this.rootUINode.getChildByName("top_panel");

        var back_btn = top_panel.getChildByName("back_btn");
        back_btn.hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(-size.width, -size.height * 0.3, size.width * 2.3, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        function back_btn_event(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                    h1global.curUIMgr.gamehall_ui.updateCharacterCard();
                }
                self.hide();
            }
        }
        back_btn.addTouchEventListener(back_btn_event);

	    var club_entity_list = h1global.player().club_entity_list;
        for (var i = 0; i < const_val.FRIENDS_CIRCLE_NUM; i++) {
            this.club_btn_list.push(top_panel.getChildByName("club_name_panel").getChildByName("club_btn_" + i.toString()));
        }
        var is_guide = cc.sys.localStorage.getItem(h1global.player().userId+"IS_GUIDE_JSON");
	    for (var i = 0; i < const_val.FRIENDS_CIRCLE_NUM; i++) {
		    let club_btn = top_panel.getChildByName("club_name_panel").getChildByName("club_btn_" + i.toString());
	        if (i >= club_entity_list.length) {
		        club_btn.setVisible(false);
		        continue;
            } else {
		        club_btn.setVisible(true);
            }
		    let base_info = club_entity_list[i].get_base_info();
            if(h1global.player() && h1global.player().userId == base_info.owner.userId){
                var my_club_img = new cc.Sprite("res/ui/ClubUI/my_club_img.png");
                club_btn.addChild(my_club_img);
                my_club_img.setPosition(club_btn.width*0.5,6.5);
                club_btn.setTitleColor(cc.color(255,84,0));
            }

		    club_btn.setTitleText(base_info["club_name"]);
		    if(base_info["club_id"] == this.club.club_base_info["club_id"]){
                club_btn.setBright(false);
                club_btn.setTouchEnabled(false);
            }else{
		        if(!is_guide){
                    this.add_guide_msg(club_btn);
                    is_guide=1;
                }
                club_btn.setBright(true);
                club_btn.setTouchEnabled(true);
            }

            let now_index = i ;
		    club_btn.addTouchEventListener(function (sender, eventType) {
			    if(eventType === ccui.Widget.TOUCH_ENDED){
                    cutil.lock_ui();
                    club_btn.setBright(false);
			        club_btn.setTouchEnabled(false);
			        if(club_btn.getChildByName("guide_img")){
			            club_btn.getChildByName("guide_img").removeFromParent(true);
                        cc.sys.localStorage.setItem(h1global.player().userId+"IS_GUIDE_JSON", '{"guide":"1"}');
                    }
			        //切换亲友圈的时候 先移除当前亲友圈界面上的 所有头像
                    self.reset_desk_panel();
                    if(!h1global.player()){return;}
				    self.club = h1global.player().club_entity_dict[base_info["club_id"]];
                    for(var j = 0; j<self.club_btn_list.length;j++){
                        if(j!=now_index){
                            self.club_btn_list[j].setTouchEnabled(true);
                            self.club_btn_list[j].setBright(true);
                        }
                    }
                    // let player = h1global.player();
                    // if(player){
                    //     player.clubOperation(const_val.CLUB_OP_GET_MEMBERS, self.club.club_id);
                    // }
			        // self.show_by_info(base_info["club_id"]);
			        self.init_bottom_panel();
			        self.update_desk_panel(self.club.club_id, self.club.club_base_info.table_info_list);
                    self.show_notice(self.club.club_id, self.club.club_notice);
                    self.update_setting_btn();
                    //保存为当前按钮
			        var defaul_club_choose_json = '{"now_choose_club":'+ self.club.club_id +'}';
                    cc.sys.localStorage.setItem("CLUB_CHOOSE_JSON", defaul_club_choose_json);
			    }
		    });
	    }

		// var setting_btn = top_panel.getChildByName("setting_btn_0");


		this.update_setting_btn();
    },

	update_setting_btn:function(){

    	var self = this;
		function setting_btn_event(sender, eventType){
			if(eventType === ccui.Widget.TOUCH_ENDED){
				h1global.curUIMgr.clubstatistics_ui.show_by_info(self.club.club_id);
			}
		}

		function bind_btn_event(sender, eventType){
			if(eventType === ccui.Widget.TOUCH_ENDED){
				h1global.curUIMgr.clubbind_ui.show_by_info(self.club.club_id);
			}
		}

		var setting_btn_0 = this.rootUINode.getChildByName("top_panel").getChildByName("setting_btn_0");
		var setting_btn_1 = this.rootUINode.getChildByName("top_panel").getChildByName("setting_btn_1");
		var setting_btn_2 = this.rootUINode.getChildByName("top_panel").getChildByName("setting_btn_2");
		for(var i = 0 ; i < 3 ; i++) {
			let setting_btn = this.rootUINode.getChildByName("top_panel").getChildByName("setting_btn_" + i.toString());
			setting_btn.hitTest = function (pt) {
				var size = this.getContentSize();
				var bb = cc.rect(-size.width*0.5,20, size.width * 2, size.height);
				return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
			};
			setting_btn.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.rotateTo(2,2),
				cc.rotateTo(2,-2)
			)));
		}

		let player = h1global.player();
		var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
		if(player){
			if(this.club.is_owner(player.userId)){
				setting_btn_0.addTouchEventListener(setting_btn_event);
				setting_btn_0.setVisible(true);
				setting_btn_1.setVisible(false);
				setting_btn_2.setVisible(false);
			}else if (this.club.is_admin(player.userId)){
				if(info_dict["bind"]){
					setting_btn_0.addTouchEventListener(setting_btn_event);
					setting_btn_0.setVisible(true);
					setting_btn_1.setVisible(false);
					setting_btn_2.setVisible(false);
				} else {
					setting_btn_2.addTouchEventListener(function (sender, eventType) {
						if (eventType === ccui.Widget.TOUCH_ENDED) {
							var p = sender.getTouchBeganPosition();
							p = sender.convertToNodeSpace(p);
							var height = sender.getContentSize().height;
							if (p.y < height * 0.5) {
								bind_btn_event(sender, eventType);
							}else{
								setting_btn_event(sender, eventType);
							}
						}
					});
					setting_btn_2.setVisible(true);
					setting_btn_1.setVisible(false);
					setting_btn_0.setVisible(false);
				}
			} else if (!info_dict["bind"]) {
				setting_btn_1.addTouchEventListener(bind_btn_event);
				setting_btn_2.setVisible(false);
				setting_btn_1.setVisible(true);
				setting_btn_0.setVisible(false);
			} else {
				setting_btn_2.setVisible(false);
				setting_btn_1.setVisible(false);
				setting_btn_0.setVisible(false);
			}
		}
	},

    reset_desk_panel:function(){
        var self = this;
        var room_panel = this.rootUINode.getChildByName("room_panel");
        var desk_scroll = room_panel.getChildByName("desk_scroll");
        var item_list = desk_scroll.getChildren();
        var table_info_list = self.club.club_base_info.table_info_list;

        for (var i = 0; i < item_list.length; i++) {
            var player_num = const_val.GameType2CNum[table_info_list[i]['game_type']];
            for (var j = player_num - 1; j >= 0; j--) {
                var portrait_sprite = item_list[i].getChildByName("portrait_sprite_" +j.toString());
                if (portrait_sprite) {
                    portrait_sprite.removeFromParent(true);
                }
            }
        }
    },

    update_top_panel_name_btn:function(){
        var top_panel = this.rootUINode.getChildByName("top_panel");
        var club_entity_list = h1global.player().club_entity_list;
        for (var i = 0; i < const_val.FRIENDS_CIRCLE_NUM; i++) {
            let club_btn = top_panel.getChildByName("club_name_panel").getChildByName("club_btn_" + i.toString());
            if (i >= club_entity_list.length) {
                club_btn.setVisible(false);
                continue;
            } else {
                club_btn.setVisible(true);
            }
            let base_info = club_entity_list[i].get_base_info();
            club_btn.setTitleText(base_info["club_name"]);
        }
    },

    init_bottom_panel:function () {
        var self = this;
	    var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        var player = h1global.player();
        var bottom_panel = this.rootUINode.getChildByName("bottom_panel");


        var card_panel = bottom_panel.getChildByName("card_panel");
	    card_panel.getChildByName("card_label").setString("— —");
	    card_panel.getChildByName("club_card").addTouchEventListener(function (sender, eventType) {
		    if (eventType === ccui.Widget.TOUCH_BEGAN || eventType === ccui.Widget.TOUCH_MOVED) {
			    card_panel.getChildByName("club_card_explain_panel").setVisible(false);
		    } else if (eventType === ccui.Widget.TOUCH_ENDED || eventType === ccui.Widget.TOUCH_CANCELED) {
			    card_panel.getChildByName("club_card_explain_panel").setVisible(false);
		    }
	    });
	    // 房卡   //改成
        if(info_dict["unionid"]){
            cutil.get_user_info("wx_" + info_dict["unionid"], function(content){
                if (!cc.sys.isObjectValid(card_panel)){
                    return;
                }
                if(content[0] !== '{'){
                    return
                }
                if(player.userId !== self.club.owner.userId) {
                    cc.log("不是本人的茶楼,更新房卡数量失败");
                    return
                }
                var info = eval('(' + content + ')');
                card_panel.getChildByName("card_label").setString(info["card"].toString());
            });
        }else{
            cc.log("info_dict[\"unionid\"] is null");
        }
	    if(player.userId === this.club.owner.userId) {
		    card_panel.getChildByName("buy_btn").setVisible(true);
	    } else {
            card_panel.getChildByName("card_label").setString("*****");
		    card_panel.getChildByName("buy_btn").setVisible(false);
	    }

        if(this.club.club_base_info.online_num){
            bottom_panel.getChildByName("club_mem_num_label").setString("人数：" +this.club.club_base_info.online_num+'/'+this.club.club_base_info.member_num);
        }else{
            bottom_panel.getChildByName("club_mem_num_label").setString("人数：1/1");
        }

	    bottom_panel.getChildByName("club_id_label").setString("亲友圈ID：" + this.club.club_id);

        //更新茶楼成员按钮是否显示红点标记
        this.update_member_is_apply(this.club.club_id,this.club.club_base_info.apply_hint);

	    //商城
	    bottom_panel.getChildByName("card_panel").getChildByName("buy_btn").addTouchEventListener(function(sender, eventType){
		    if(eventType == ccui.Widget.TOUCH_ENDED){
				cutil.lock_ui();
				cutil.get_shop_list();
		    }
	    });

        var mgr_btn = bottom_panel.getChildByName("mgr_btn");
        mgr_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
				if(h1global.curUIMgr.clubmgr_ui && !h1global.curUIMgr.clubmgr_ui.is_show && self.club){
					h1global.curUIMgr.clubmgr_ui.show_by_info(self.club.club_id);
					//h1global.curUIMgr.clubmgr_ui.show();
				}
            }
        });
        var mem_btn = bottom_panel.getChildByName("mem_btn");
        mem_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(h1global.curUIMgr.clubmember_ui && !h1global.curUIMgr.clubmember_ui.is_show && self.club){
                    h1global.curUIMgr.clubmember_ui.show_by_info(self.club.club_id);
                }
            }
        });
        var record_btn = bottom_panel.getChildByName("record_btn");
        record_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(h1global.curUIMgr.clubrecord_ui && !h1global.curUIMgr.clubrecord_ui.is_show && self.club){
                    h1global.curUIMgr.clubrecord_ui.show_by_info(self.club.club_id);
                }
            }
        });
        var play_btn = bottom_panel.getChildByName("play_btn");
        play_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(h1global.curUIMgr.clubmode_ui && !h1global.curUIMgr.clubmode_ui.is_show){
                    h1global.curUIMgr.clubmode_ui.show_by_info(self.club.club_id,-1);
                }
                // if(h1global.globalUIMgr.info_ui){
                //     h1global.globalUIMgr.info_ui.show_by_info("施工中~~ >_< ");
                // }
            }
        });

	    var join_btn = bottom_panel.getChildByName("join_btn");
        join_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                cutil.lock_ui();
                var seat_info_list = self.club.club_base_info.table_info_list;
                for(var i=0;i<seat_info_list.length;i++){
                    //如果座位上有人 且人数没坐满
                    if(seat_info_list[i]["seat_info"]&&seat_info_list[i]["seat_info"].length < const_val.GameType2CNum[seat_info_list[i]["game_type"]]){
                        cc.log("自动找到了位置",i);
                        if(!h1global.player()){return;}
                        h1global.player().clubOperation(const_val.CLUB_OP_SIT_DOWN, self.club.club_id, [i]);
                        return;
                    }
                }
                if(h1global.globalUIMgr.info_ui){
                    h1global.globalUIMgr.info_ui.show_by_info("桌子都满人啦！~");
                }
            }
        });
	    var rank_btn = bottom_panel.getChildByName("rank_btn");
        rank_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(h1global.curUIMgr.clubrank_ui && !h1global.curUIMgr.clubrank_ui.is_show && self.club){
                    h1global.curUIMgr.clubrank_ui.show_by_info(self.club.club_id);
                }
            }
        });

        var setting_btn = bottom_panel.getChildByName("setting_btn");
        setting_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    if(h1global.curUIMgr.showclub_ui && !h1global.curUIMgr.showclub_ui.is_show){
                        h1global.curUIMgr.showclub_ui.show();
                    }
                }
            }
        });

        if (this.club.is_owner(player.userId) || this.club.is_admin()) {
	        record_btn.setVisible(true);
	        play_btn.setVisible(true);
	        join_btn.setVisible(false);            setting_btn.setPositionX(bottom_panel.getContentSize().width * 0.275);
	        mem_btn.setPositionX(bottom_panel.getContentSize().width * 0.4);
	        record_btn.setPositionX(bottom_panel.getContentSize().width * 0.525);
	        rank_btn.setPositionX(bottom_panel.getContentSize().width * 0.65);
	        play_btn.setPositionX(bottom_panel.getContentSize().width * 0.775);
	        mgr_btn.setPositionX(bottom_panel.getContentSize().width * 0.9);
	        mgr_btn.loadTextureNormal("ClubUI/club_bottom_mgr.png", ccui.Widget.PLIST_TEXTURE);
        } else {
	        record_btn.setVisible(false);
	        play_btn.setVisible(false);
	        join_btn.setVisible(true);
	        join_btn.setPositionX(bottom_panel.getContentSize().width * 0.9);
	        mgr_btn.setPositionX(bottom_panel.getContentSize().width * 0.775);
	        rank_btn.setPositionX(bottom_panel.getContentSize().width * 0.65);
	        mem_btn.setPositionX(bottom_panel.getContentSize().width * 0.525);
	        setting_btn.setPositionX(bottom_panel.getContentSize().width * 0.4);
	        mgr_btn.loadTextureNormal("ClubUI/club_bottom_mgr_common.png", ccui.Widget.PLIST_TEXTURE);
        }
    },

    update_club_member_num_label:function(){
        var bottom_panel = this.rootUINode.getChildByName("bottom_panel");
        bottom_panel.getChildByName("club_mem_num_label").setString("人数：" +this.club.club_base_info.online_num+'/'+this.club.club_base_info.member_num);
    },

    update_desk_panel:function (club_id, table_info_list) {
        if(!this.is_show){return;}
        if(this.club.club_id !== club_id){return;}
        this.check_lock_panel();
        var self = this;
        var room_panel = this.rootUINode.getChildByName("room_panel");
	    room_panel.setContentSize(cc.size(const_val.THREE_DESK_WIDTH, room_panel.getContentSize().height));
	    var desk_scroll = room_panel.getChildByName("desk_scroll");
	    var item_panel = room_panel.getChildByName("item_panel");
	    // for (var i = 0 ; i < this.stool_img_list.length; i++) {
		 //    this.stool_img_list[i].removeFromParent(true);
	    // }
		// for(var j =0;j<this.stool_img_list.length;j++){
         //    if(this.stool_img_list[j]){
         //        for (var i = 0 ; i < this.stool_img_list[j].length; i++) {
         //            if(this.stool_img_list[j][i]){
         //                this.stool_img_list[j][i].removeFromParent(true);
         //                this.stool_img_list[j][i] = null;
         //            }
         //        }
         //    }
		// }
		// desk_scroll.removeAllChildren();
        // desk_scroll.addChild(item_panel);
		// cc.error(desk_scroll.getChildren());

	    UICommonWidget.update_scroll_items(desk_scroll, table_info_list, function (curItem, curInfo, index) {
		    self.update_desk_details(curItem, curInfo, index);
	    });
        desk_scroll.jumpToTop();
        cutil.unlock_ui();
    },

    update_online_state:function(club_id,idx){
        if(!this.is_show){return;}
        if(this.club.club_id != club_id){return;}
        //更新这张桌子的头像状态
        var event_msg = [];
        event_msg["idx"] = idx;
        event_msg["seat_info"] = this.club.club_base_info.table_info_list[idx]["seat_info"];
        this.update_sic_info(club_id,event_msg);
    },

	update_sic_info:function (club_id, event_msg ){
        if(!this.is_show){return;}
        if(this.club.club_id != club_id){return;}
        var self = this;
        var idx = event_msg["idx"]

        var room_panel = this.rootUINode.getChildByName("room_panel");
        var desk_scroll = room_panel.getChildByName("desk_scroll");
        let curItem = desk_scroll.getChildByName("item_panel_" + idx.toString());
        if(!curItem){
        	return;
		}
        var seatInfo = event_msg["seat_info"];

        //修改 entity中的 具体值
        // var table_info_list = this.club.club_base_info.table_info_list;
        // table_info_list[idx]["seat_info"] = event_msg["seat_info"];

        //修改下标右边的值

        var title_panel = curItem.getChildByName("title_panel");
        //var title_right_label = title_panel.getChildByName("title_right_label");
        //title_left_label.setString(const_val.GameType2CName[event_msg["gameType"]]);
        this.set_title_right_label(title_panel,event_msg["seat_info"],this.club.is_owner(h1global.player().userId) || this.club.is_admin(),this.club.club_base_info.table_info_list[idx]["room_state"]);

        //设置头像的显示与消失
        //var stool_img = curItem.getChildByName("stool_img");// 服务端传下数据，检测这种游戏最多有多少玩家
        //stool_img.setVisible(false);
		var player_num = curItem.max_player_num;
        var w = curItem.getContentSize().width;
        var h = curItem.getContentSize().height;

        var desk_off_list = [];
        for (var i = 0 ; i < player_num; i++) {
            let info = seatInfo[i];
            // var portrait_sprite = curItem.getChildByName("portrait_sprite_" + i.toString());
            // if (portrait_sprite) {
            //     portrait_sprite.removeFromParent(true);
            // }
            if (info) {
                let dex = info["idx"];
                // this.stool_img_list[idx][dex].setVisible(false);
				this.add_head_frame(idx,dex,curItem,player_num,info,w,h);
                desk_off_list.push(dex);
                let clubId = this.club.club_id;
                let tabel_dex = idx;
                //cutil.lock_ui();
                cutil.loadPortraitTexture(info["head_icon"], info["sex"], function (img) {
                    if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
                        if(self.club.club_id != clubId || !cc.sys.isObjectValid(curItem) || !curItem.getChildByName("portrait_sprite_" + dex.toString())){
                            return;
                        }
                        var seatList = self.club.club_base_info.table_info_list[tabel_dex].seat_info;
                        for(var k in seatList){
                            if(info == seatList[k]){
								var clip_node = curItem.getChildByName("portrait_sprite_" + dex.toString()).getChildByName("clip_node");
								if(clip_node.getChildByName("head_img")){
									clip_node.getChildByName("head_img").removeFromParent(true);
								}
								var portrait_sprite = new cc.Sprite(img);
								portrait_sprite.setScale(85 / portrait_sprite.getContentSize().width);
								portrait_sprite.setName("head_img");
								clip_node.addChild(portrait_sprite);
                            }
                        }
                    }
                    //cutil.unlock_ui();
                });
            }
        }
        //如果这张桌子上没人了，就显示椅子
        if(desk_off_list){
            for (var i = 0 ; i < player_num; i++) {
                var check = true;
                for(var j = 0;j<desk_off_list.length;j++){
                    if(i==desk_off_list[j]){
                        check = false;
                    }
                }
                if(check){
                    // this.stool_img_list[idx][i].setVisible(true);
					curItem.getChildByName("stool_img_"+i).setVisible(true);
                    var portrait_sprite = curItem.getChildByName("portrait_sprite_" + i.toString());
                    if (portrait_sprite) {
                        portrait_sprite.removeFromParent(true);
                    }
                }
            }
        }
        //如果满人的话 桌子显示已满
        var desk_btn = curItem.getChildByName("desk_btn");// 进入房间事件
        if(seatInfo.length>0 && seatInfo.length == player_num){
            desk_btn.setBright(false);
            desk_btn.setTouchEnabled(false);
            curItem.getChildByName("join_img").setVisible(false);
            curItem.getChildByName("full_img").setVisible(true);
        }else{
            desk_btn.setBright(true);
            desk_btn.setTouchEnabled(true);
            curItem.getChildByName("join_img").setVisible(true);
            curItem.getChildByName("full_img").setVisible(false);
            curItem.getChildByName("cur_round_label").setVisible(false);
        }
	},

	update_default_room_params:function (club_id,event_msg){
        if(!this.is_show){return;}
        if(this.club.club_id != club_id){return;}
        this.club.club_base_info.game_type = event_msg["game_type"];
        this.club.club_base_info.room_params = event_msg["room_params"];
    },

    update_member_is_apply:function (club_id,event_msg){
        if(!this.is_show){return;}
        if(this.club.club_id != club_id){return;}
        if(!h1global.player()){return;}
        if(this.club.is_owner(h1global.player().userId)==false && !this.club.is_admin()){
            event_msg = 0;
        }
        var bottom_panel = this.rootUINode.getChildByName("bottom_panel");
        var mem_btn = bottom_panel.getChildByName("mem_btn");
        if(event_msg){
            cc.log("显示红点")
        }else{
            cc.log("不显示红点")
        }
        UICommonWidget.set_hint_red_dot(mem_btn,event_msg,0.95,0.95,1);

    },

    is_sic_off_line:function(info){
        cc.log(info)
        if(this.club.members.hasOwnProperty(info["userId"])){
			if(this.club.members[info["userId"]]["online"]){
				return false;
            }else{
				return true;
            }
        }else{
			if(info["online"]){
				return false;
			}else{
				return true;
			}
        }
    },

    update_table_cur_round:function(club_id,event_msg){
        if(!this.is_show){return;}
        if(this.club.club_id != club_id){return;}

        var idx = event_msg["idx"];
        var table_info_list = this.club.club_base_info.table_info_list;
        var desk_scroll = this.rootUINode.getChildByName("room_panel").getChildByName("desk_scroll");
        var curItem = desk_scroll.getChildByName("item_panel_" + idx);

        if(table_info_list[idx]["room_state"]){
            curItem.getChildByName("cur_round_label").setVisible(true);
            //curItem.getChildByName("desk_num_label").setVisible(false);
            curItem.getChildByName("cur_round_label").setString(event_msg["current_round"]+'/'+event_msg["game_round"]);
        }else{
            curItem.getChildByName("cur_round_label").setVisible(false);
            //curItem.getChildByName("desk_num_label").setVisible(true);
        }
    },

    update_room_params : function (club_id,event_msg){
        if(!this.is_show){return;}
        if(this.club.club_id != club_id){return;}

        var self = this;
        var idx = event_msg["idx"];
        //如果桌子上有人了 就暂时先不改
        var table_info_list = this.club.club_base_info.table_info_list;

        table_info_list[idx]["room_state"] = 0;
        cc.log("更新桌子默认玩法的时候 顺便把room_state变成0");
        this.update_table_cur_round(club_id,event_msg);//更新桌子当前局数
        // if(table_info_list[idx]["seat_info"].length>0){
        	// return;
		// }
        //改下标
        var desk_scroll = this.rootUINode.getChildByName("room_panel").getChildByName("desk_scroll");
        var curItem = desk_scroll.getChildByName("item_panel_" + idx);

        var title_panel = curItem.getChildByName("title_panel");
        var title_left_label = title_panel.getChildByName("title_label");
        title_left_label.setString(const_val.GameType2CName[event_msg["game_type"]]);
        //提示增加房间信息
        var room_params =eval("(" + event_msg["room_params"] + ")");
        var add_str = '';
        var now_room_params = table_room_params[event_msg["game_type"]];
        //扣点点的数据有点问题
        if(event_msg["game_type"] == const_val.TaiYuanKDDMJ || event_msg["game_type"] == const_val.LvLiangKDDMJ){
            if(room_params["game_mode"]!=2){
                room_params["king_mode"] = 99;
                room_params["reward"] = 99;
                room_params["seven_pair"] = 99;
                room_params["mouse_general"] = 99;
                room_params["mouse_general_onetwo"] = 99;
                room_params["ting_mouse"] = 99;
            }
            if (room_params["game_mode"]!=1){
	            room_params["special_mul"] = 99;
            }
        }
        if(now_room_params){
            for(var k in room_params){
                if(now_room_params[k]){
                    if(now_room_params[k][room_params[k]] !=''){
                        add_str += '\n';
                        add_str += now_room_params[k][room_params[k]];
                    }
                }
            }
        }
        curItem.getChildByName("help_panel").getChildByName("help_label").setString(const_val.GameType2CName[event_msg["game_type"]]+ add_str);

		//改椅子数量
		// if(!this.stool_img_list[idx]){
         //    this.stool_img_list[idx] = [];
		// }
		// for (var i = 0 ; i < this.stool_img_list[idx].length; i++) {
         //    if(this.stool_img_list[idx][i]){
         //        this.stool_img_list[idx][i].removeFromParent(true);
         //        this.stool_img_list[idx][i] = null;
         //    }
		// }
		// this.stool_img_list[idx] = [];
        var stool_img = curItem.getChildByName("stool_img");
        stool_img.setVisible(false);
		//移除多余的椅子
		for(var i =0;i<6;i++){
			if(curItem.getChildByName("stool_img_"+i)){
				curItem.getChildByName("stool_img_"+i).removeFromParent(true);
			}
		}
        // var player_num = const_val.GameType2CNum[event_msg["game_type"]];
		curItem.max_player_num = room_params.hasOwnProperty("player_num") ? room_params["player_num"] : const_val.GameType2CNum[event_msg["game_type"]];
        var player_num = curItem.max_player_num;
        var w = curItem.getContentSize().width;
        var h = curItem.getContentSize().height;
        for (var i = 0 ; i < player_num; i++) {
            var stool_img_clone = stool_img.clone();
            // this.stool_img_list[idx].push(stool_img_clone);
			stool_img_clone.setName("stool_img_"+i);
            stool_img_clone.setPosition(cc.p(w * const_val.STOOL_POS[player_num][i].x, h * const_val.STOOL_POS[player_num][i].y));
            stool_img_clone.setRotation(const_val.STOOL_ROTA[player_num][i]);//旋转角度
            stool_img_clone.setVisible(true);
            stool_img_clone.setTouchEnabled(true);
            stool_img_clone.addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    if(!h1global.player()){return;}
                    cutil.lock_ui();
                    h1global.player().clubOperation(const_val.CLUB_OP_SIT_DOWN, self.club.club_id, [idx]);
                }
            });
            curItem.addChild(stool_img_clone);
        }
    },

	update_table_details:function (t_idx, table_details ,club_id) {
		if(!this.is_show){return;}
		if(this.club_id != club_id){return;}
		var room_panel = this.rootUINode.getChildByName("room_panel");
		var desk_scroll = room_panel.getChildByName("desk_scroll");
		var curItem = desk_scroll.getChildByName("item_panel_" + t_idx.toString());

		cc.log (table_details);
		cc.log (table_details["game_type"]);
		cc.log (const_val.GameType2CNum[table_details["game_type"]])
		var seatInfo = table_details.seat_info;

		var stool_img = curItem.getChildByName("stool_img");// 服务端传下数据，检测这种游戏最多有多少玩家
		stool_img.setVisible(false);
		for (var i = 0 ; i < seatInfo.length; i++) {
			let info = seatInfo[i];
			let idx = i;
			cutil.loadPortraitTexture(info["head_icon"], info["sex"], function(img){
				if(h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
					// h1global.curUIMgr.club_ui.rootUINode.getChildByName("character_panel").getChildByName("portrait_sprite").removeFromParent();
					var portrait_sprite  = new cc.Sprite(img);
					portrait_sprite.setScale(102/portrait_sprite.getContentSize().width);
					var stencil = new cc.Sprite("res/ui/GameHallUI/mask.png"); // 遮罩模板 -- 就是你想把图片变成的形状
					var clipnode = new cc.ClippingNode();
					clipnode.x = 66;
					clipnode.y = 60;
					clipnode.setInverted(false);
					clipnode.setAlphaThreshold(0.5);
					clipnode.setStencil(stencil);
					clipnode.addChild(portrait_sprite);
					curItem.addChild(clipnode);
					if (idx === 0) {
						// clipnode.setPositionX(curItem.getContentSize().width * 0.78);
						clipnode.setPosition(cc.p(curItem.getContentSize().width * 0.78, curItem.getContentSize().height * 0.58));
					} else if (idx === 1) {
						// stool_img_clone.setPosition(cc.p(curItem.getContentSize().width * 0.5, curItem.getContentSize().height * 0.28));
					} else if (idx === 2) {
						// stool_img_clone.setPosition(cc.p(curItem.getContentSize().width * 0.5, curItem.getContentSize().height * 0.84));
					} else {
						// stool_img_clone.setPositionX(curItem.getContentSize().width * 0.22);
					}
				}
			});
		}
	},

	update_desk_details:function (view, info, index) {

    	var self = this;
    	var room_params = this.club.room_params;
		var bg_img = view.getChildByName("bg_img");// 服务端传下数据，检测是否在游戏中
		var desk_btn = view.getChildByName("desk_btn");// 进入房间事件
        //给桌子添加序号
        var desk_num = (index+1).toString();
		var ruler_dict = JSON.parse(info["room_params"]);
		view.max_player_num = ruler_dict.hasOwnProperty("player_num") ? ruler_dict["player_num"] : const_val.GameType2CNum[info["game_type"]];
        view.getChildByName("desk_num_label").setString('-'+desk_num+'-');
		let values = (info & 1) + ((info & 2) >> 1) + ((info & 4) >> 2) + ((info & 8) >> 3);
		let t_index = index;
		desk_btn.addTouchEventListener(function (sender, eventType) {
			if(eventType === ccui.Widget.TOUCH_ENDED){
				if(values>=4){return;}
                if(!h1global.player()){return;}
				cutil.lock_ui();
				h1global.player().clubOperation(const_val.CLUB_OP_SIT_DOWN, self.club.club_id, [t_index]);
			}
		});
        //改椅子数量
		var idx = index;
        // if(!this.stool_img_list[idx]){
        //     this.stool_img_list[idx] = [];
        // }
        // for (var i = 0 ; i < this.stool_img_list[idx].length; i++) {
        //     if(this.stool_img_list[idx][i]){
        //         this.stool_img_list[idx][i].removeFromParent(true);
        //         this.stool_img_list[idx][i] = null;
        //     }
        // }
        // this.stool_img_list[idx] = [];
        var stool_img = view.getChildByName("stool_img");
        stool_img.setVisible(false);
        var player_num = view.max_player_num;
        var w = view.getContentSize().width;
        var h = view.getContentSize().height;
        //移除多余的椅子
        for(var i =0;i<6;i++){
			if(view.getChildByName("stool_img_"+i)){
				view.getChildByName("stool_img_"+i).removeFromParent(true);
            }
        }

        for (var i = 0 ; i < player_num; i++) {
            var stool_img_clone = stool_img.clone();
            // this.stool_img_list[idx].push(stool_img_clone);
			stool_img_clone.setName("stool_img_"+i);
            stool_img_clone.setPosition(cc.p(w * const_val.STOOL_POS[player_num][i].x, h * const_val.STOOL_POS[player_num][i].y));
            stool_img_clone.setRotation(const_val.STOOL_ROTA[player_num][i]);//旋转角度
            stool_img_clone.setVisible(true);
            stool_img_clone.setTouchEnabled(true);
            stool_img_clone.addTouchEventListener(function (sender, eventType) {
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    if(!h1global.player()){return;}
                    cutil.lock_ui();
                    h1global.player().clubOperation(const_val.CLUB_OP_SIT_DOWN, self.club.club_id, [t_index]);
                }
            });
            view.addChild(stool_img_clone);
        }
        // cc.log("当前椅子数量",this.stool_img_list[idx].length);


        // //改变头像的数量
        // for (var i = 0;i<player_num;i++){
        //     var portrait_sprite = view.getChildByName("portrait_sprite_" +i.toString());
        //     if (portrait_sprite) {
        //         portrait_sprite.removeFromParent(true);
        //     }
        // }
		if(info["seat_info"].length>0){
            for (var i = 0 ; i < player_num; i++) {
                let head_info = info["seat_info"][i];
                if (head_info) {
                    let dex = info["seat_info"][i]["idx"];
                    // this.stool_img_list[idx][dex].setVisible(false);
                    let clubId = this.club.club_id;
                    let tabel_dex = index;
					this.add_head_frame(idx,dex,view,player_num,head_info,w,h);
                    cutil.loadPortraitTexture(head_info["head_icon"], head_info["sex"], function (img) {
                        cc.log("开始加载头像");
                        if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
                            if(self.club.club_id != clubId || !view){
                                return;
                            }
                            var seatList = self.club.club_base_info.table_info_list[tabel_dex].seat_info;
                            for(var k in seatList){
                                if(head_info == seatList[k]){
									var clip_node = view.getChildByName("portrait_sprite_" + dex.toString()).getChildByName("clip_node");
									if(clip_node.getChildByName("head_img")){
										clip_node.getChildByName("head_img").removeFromParent(true);
									}
									var portrait_sprite = new cc.Sprite(img);
									portrait_sprite.setScale(85 / portrait_sprite.getContentSize().width);
									portrait_sprite.setName("head_img");
									clip_node.addChild(portrait_sprite);

                                	//显示头像的同时 隐藏凳子
                                    // self.stool_img_list[tabel_dex][seatList[k].idx].setVisible(false);
                                    // if(view.getChildByName("stool_img_"+seatList[k].idx)){
										// view.getChildByName("stool_img_"+seatList[k].idx).setVisible(false);
                                    // }
                                    // var portrait_sprite = new cc.Sprite(img);
                                    // portrait_sprite.setScale(85 / portrait_sprite.getContentSize().width);
                                    // var stencil = new cc.Sprite("res/ui/GameHallUI/mask2.png"); // 遮罩模板 -- 就是你想把图片变成的形状
                                    // var printed = new cc.Sprite("res/ui/GameHallUI/fram_printed.png");
                                    // var frame = new cc.Sprite("res/ui/GameHallUI/frame.png");
                                    // var head_printed = new cc.Sprite("res/ui/GameHallUI/head_printed.png");
									//
                                    // var msg = cutil.info_sub_ver2(head_info["nickname"], 4)
                                    // var msg_label = new cc.LabelTTF(msg,"zhunyuan",20);
                                    // var head_layer = new cc.Layer();
                                    // var clipnode = new cc.ClippingNode();
                                    // clipnode.setInverted(false);
                                    // clipnode.setAlphaThreshold(1);
                                    // clipnode.setStencil(stencil);
                                    // clipnode.addChild(portrait_sprite);
                                    // var portrait_sprite = view.getChildByName("portrait_sprite_" +dex.toString());
                                    // if (portrait_sprite) {
                                    //     portrait_sprite.removeFromParent(true);
                                    // }
                                    // head_layer.setName("portrait_sprite_" + dex.toString());
                                    // head_layer.addChild(clipnode);
                                    // head_layer.addChild(printed);
                                    // head_layer.addChild(frame);
                                    // head_layer.addChild(head_printed);
                                    // head_layer.addChild(msg_label);
                                    // //判断是否玩家是否离线
                                    // if(self.is_sic_off_line(head_info)){
                                    //     var off_line = new cc.Sprite("res/ui/GameRoomUI/state_offline.png");
                                    //     head_layer.addChild(off_line);
                                    // }
                                    // head_printed.setPositionY(-30);
                                    // msg_label.setPositionY(-30);
                                    // view.addChild(head_layer);
                                    // head_layer.setPosition(cc.p(w * const_val.STOOL_POS[player_num][dex].x, h * const_val.STOOL_POS[player_num][dex].y+5));
                                }
                            }
                        }
                    });
                }
            }
		}
        //如果满人的话 桌子显示已满
        if(info["seat_info"].length>0 && info["seat_info"].length == player_num){
            desk_btn.setBright(false);
            desk_btn.setTouchEnabled(false);
            view.getChildByName("join_img").setVisible(false);
            view.getChildByName("full_img").setVisible(true);
        }else{
            desk_btn.setBright(true);
            desk_btn.setTouchEnabled(true);
            view.getChildByName("join_img").setVisible(true);
            view.getChildByName("full_img").setVisible(false);
			view.getChildByName("cur_round_label").setVisible(false);
        }

		var help_btn = view.getChildByName("help_btn");// 服务端传下数据，检测这种游戏的玩法
		// 服务端传下数据，检测这种游戏的玩法
		var help_panel = view.getChildByName("help_panel");
		help_panel.setLocalZOrder(999);
		var help_label = help_panel.getChildByName("help_label");

        //提示增加房间信息
        var room_params =eval("(" + info["room_params"] + ")");
        var add_str = '';
        var now_room_params = table_room_params[info["game_type"]];
        //扣点点的数据有点问题
        if(info["game_type"] == const_val.TaiYuanKDDMJ || info["game_type"] == const_val.LvLiangKDDMJ){
            if(room_params["game_mode"]!=2){
                room_params["king_mode"] = 99;
                room_params["reward"] = 99;
	            room_params["seven_pair"] = 99;
	            room_params["mouse_general"] = 99;
	            room_params["mouse_general_onetwo"] = 99;
	            room_params["ting_mouse"] = 99;
            }
            if (room_params["game_mode"]!=1){
	            room_params["special_mul"] = 99;
            }
        }
        if(now_room_params){
            for(var k in room_params){
                if(now_room_params[k]){
                    if(now_room_params[k][room_params[k]] !=''){
                        add_str += '\n';
                        add_str += now_room_params[k][room_params[k]];
                    }
                }
            }
        }


		help_label.setString(const_val.GameType2CName[info["game_type"]]+add_str);

		help_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                help_panel.setVisible(true);
                // if((index+1)%3 == 0){
                //     help_panel.setPositionX(-5);
                // }else{
                //     help_panel.setPositionX(240);
                // }
                help_panel.setPositionX(220);
                self.rootUINode.getChildByName("touch_panel").setVisible(true);
                self.rootUINode.getChildByName("touch_panel").addTouchEventListener(function (sender, eventType) {
                    if(eventType === ccui.Widget.TOUCH_ENDED){
                        help_panel.setVisible(false);
                        this.setVisible(false);
                    }
                });
            }
		});

		// 需要服务端检测房间是否有人，并传下游戏名称
		// 对于圈主，在房间没人的时候，是修改玩法事件；有人的时候，解散房间事件
		// 对于玩家，在房间没人的时候，是修改玩法事件；有人的时候，是游戏名称显示

		var title_panel = view.getChildByName("title_panel");
		var title_bg_btn = title_panel.getChildByName("title_bg_btn");
		var dismiss_bg_btn = title_panel.getChildByName("dismiss_bg_btn");

        title_bg_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                cc.log(self.club);
                cc.log(self.club.club_base_info["r_switch"]);
                var p = h1global.player();
                if (!p) {
                    return;
                }
                if(self.club.is_owner(p.userId) || self.club.club_base_info["r_switch"] || self.club.is_admin()){
                    if(h1global.curUIMgr.clubmode_ui && !h1global.curUIMgr.clubmode_ui.is_show){
                        h1global.curUIMgr.clubmode_ui.show_by_info(self.club.club_id,idx);
                    }
                }
            }
        });

        dismiss_bg_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
				h1global.curUIMgr.confirm_ui.show_by_info("是否确定强制解散该房间？", function () {
					cutil.lock_ui();
					h1global.player().clubOperation(const_val.CLUB_OP_DISMISS_ROOM, self.club.club_id, [index]);
				});
            }
        });

		var title_left_label = title_panel.getChildByName("title_label");
		//var title_right_label = title_panel.getChildByName("dismiss_label_img");

        title_left_label.setString(const_val.GameType2CName[info["game_type"]]);

        self.set_title_right_label(title_panel,info["seat_info"],self.club.is_owner(h1global.player().userId) || self.club.is_admin(),info["room_state"]);
        view.getChildByName("cur_round_label").setVisible(false);
        if(info["room_state"] && info["current_round"] && room_params["game_round"]){
            view.getChildByName("cur_round_label").setVisible(true);
            //view.getChildByName("desk_num_label").setVisible(false);
            view.getChildByName("cur_round_label").setString(info["current_round"]+'/'+room_params["game_round"]);
        }
	},

	set_title_right_label :function(title_panel,seat_info,is_owner,room_state){
        title_panel.getChildByName("dismiss_bg_btn").setVisible(false);
        // is_owner=false;
        if(seat_info.length>0){
        	cc.log("是不是房主",is_owner);
        	cc.log(room_state);
            // if(room_state==0 && is_owner){
            if(is_owner){
                title_panel.getChildByName("dismiss_bg_btn").setVisible(true);
                title_panel.getChildByName("dismiss_bg_btn").setBright(true);
                title_panel.getChildByName("dismiss_bg_btn").setTouchEnabled(true);

                title_panel.getChildByName("title_bg_btn").setBright(false);
                title_panel.getChildByName("title_bg_btn").setTouchEnabled(false);

                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.36);
                title_panel.getChildByName("dismiss_label_img").setVisible(true);
                title_panel.getChildByName("modify_label_img").setVisible(false);
            }else{
                // 加载 游戏中的图片
                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.5);
                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("modify_label_img").setVisible(false);
                title_panel.getChildByName("title_bg_btn").setBright(false);
                title_panel.getChildByName("title_bg_btn").setTouchEnabled(false);
                //title_panel.loadTextureNormal("res/ui/");
			}
        }else{ //桌上没人时
            if(!this.club.club_base_info["r_switch"]){ // 不是老板 也没开开关时
                title_panel.getChildByName("title_bg_btn").setBright(false);
                title_panel.getChildByName("title_bg_btn").setTouchEnabled(false);
                title_panel.getChildByName("modify_label_img").setVisible(false);
                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.5);
            }else{
                title_panel.getChildByName("title_bg_btn").setBright(true);
                title_panel.getChildByName("title_bg_btn").setTouchEnabled(true);
                title_panel.getChildByName("modify_label_img").setVisible(true);
                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.36);
            }
			if(is_owner){
				title_panel.getChildByName("title_bg_btn").setBright(true);
				title_panel.getChildByName("title_bg_btn").setTouchEnabled(true);
				title_panel.getChildByName("modify_label_img").setVisible(true);
				title_panel.getChildByName("dismiss_label_img").setVisible(false);
				title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.36);
			}
        }
	},

    update_desk_title_label:function(club_id,event_msg){
        if(!this.is_show){return;}
        if(this.club.club_id != club_id){return;}

        var desk_idx = event_msg["idx"];
        var room_state = event_msg["state"];

        var room_panel = this.rootUINode.getChildByName("room_panel");
        var desk_scroll = room_panel.getChildByName("desk_scroll");
        var curItem = desk_scroll.getChildByName("item_panel_" + desk_idx.toString());
        var title_panel = curItem.getChildByName("title_panel");

        var is_owner = this.club.is_owner(h1global.player().userId) || this.club.is_admin();
        var seat_info = this.club.club_base_info.table_info_list[desk_idx]["seat_info"];

        title_panel.getChildByName("dismiss_bg_btn").setVisible(false);
        if(seat_info.length>0){
            if(is_owner){
                title_panel.getChildByName("dismiss_bg_btn").setVisible(true);
                title_panel.getChildByName("dismiss_bg_btn").setBright(true);
                title_panel.getChildByName("dismiss_bg_btn").setTouchEnabled(true);

                title_panel.getChildByName("title_bg_btn").setBright(false);
                title_panel.getChildByName("title_bg_btn").setTouchEnabled(false);

                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.36);
                title_panel.getChildByName("dismiss_label_img").setVisible(true);
                title_panel.getChildByName("modify_label_img").setVisible(false);
            }else{
                // 加载 游戏中的图片
                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.5);
                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("modify_label_img").setVisible(false);
                title_panel.getChildByName("title_bg_btn").setBright(false);
                title_panel.getChildByName("title_bg_btn").setTouchEnabled(false);
                //title_panel.loadTextureNormal("res/ui/");
            }
        }else{ //桌上没人时
            if(!this.club.club_base_info["r_switch"]){ // 不是老板 也没开开关时
                title_panel.getChildByName("title_bg_btn").setBright(false);
                title_panel.getChildByName("title_bg_btn").setTouchEnabled(false);
                title_panel.getChildByName("modify_label_img").setVisible(false);
                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.5);
            }else{
                title_panel.getChildByName("title_bg_btn").setBright(true);
                title_panel.getChildByName("title_bg_btn").setTouchEnabled(true);
                title_panel.getChildByName("modify_label_img").setVisible(true);
                title_panel.getChildByName("dismiss_label_img").setVisible(false);
                title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.36);
            }
			if(is_owner){
				title_panel.getChildByName("title_bg_btn").setBright(true);
				title_panel.getChildByName("title_bg_btn").setTouchEnabled(true);
				title_panel.getChildByName("modify_label_img").setVisible(true);
				title_panel.getChildByName("dismiss_label_img").setVisible(false);
				title_panel.getChildByName("title_label").setPositionX(title_panel.width*0.36);
			}
        }
    },

    show_notice:function (club_id, content) {
        var broadcast_panel = this.rootUINode.getChildByName("broadcast_panel");
        if(!this.is_show || this.club.club_id != club_id){
            return;
        }
        if(content.length <= 0){
            broadcast_panel.setVisible(false);
            return;
        }
        broadcast_panel.setVisible(true);
        var label_panel = broadcast_panel.getChildByName("label_panel");
        var broadcast_label = label_panel.getChildByName("broadcast_label");

        broadcast_label.ignoreContentAdaptWithSize(true);
        broadcast_label.setString(content);

        broadcast_label.stopAllActions();
        var fly_time = Math.max(broadcast_label.getContentSize().width/50, 9);
        broadcast_label.runAction(cc.RepeatForever.create(cc.Sequence.create(
            cc.CallFunc.create(function () {
                broadcast_label.setPositionX(label_panel.getContentSize().width);
            }),
            cc.MoveTo.create(fly_time,cc.p(-broadcast_label.getContentSize().width, broadcast_label.getPositionY())),
            cc.DelayTime.create(2.0)
        )))
    },

    add_guide_msg:function(club_btn){
        var guide_img = new cc.Sprite("res/ui/ClubUI/guide_img.png");
        guide_img.setName("guide_img");
        club_btn.addChild(guide_img);
        guide_img.setAnchorPoint(0.5,1);
        guide_img.setPosition(club_btn.width*0.5,0);
        guide_img.runAction(cc.RepeatForever.create(cc.Sequence.create(
            cc.moveBy(1,0,-10),
            cc.moveBy(1,0,10)
        )))
    },

    init_lock_panel:function(){
        var self = this;
        function return_btn_event(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                h1global.player().clubOperation(const_val.CLUB_OP_SET_LOCK_SWITCH, self.club.club_id,[0]);
                cutil.lock_ui();
            }
        }
        this.rootUINode.getChildByName("lock_panel").getChildByName("info_panel").getChildByName("return_btn").addTouchEventListener(return_btn_event)
    },

    check_lock_panel:function(club_id){
        if(club_id && this.club.club_id !== club_id){
            return;
        }
        var is_lock = this.club.club_base_info["l_switch"];
        this.rootUINode.getChildByName("lock_panel").setVisible(is_lock);
        if((h1global.player() && this.club.is_owner(h1global.player().userId)) || this.club.is_admin()){
        	if(this.club.is_admin()){
				this.rootUINode.getChildByName("lock_panel").getChildByName("info_panel").getChildByName("return_btn").setVisible(false);
			}else{
				this.rootUINode.getChildByName("lock_panel").getChildByName("info_panel").getChildByName("return_btn").setVisible(true);
			}
        }else{
            this.rootUINode.getChildByName("bottom_panel").getChildByName("join_btn").setVisible(!is_lock);
            this.rootUINode.getChildByName("lock_panel").getChildByName("info_panel").getChildByName("return_btn").setVisible(false);
        }

    },

	add_head_frame:function(table_idx,dex,curItem,player_num,info,w,h){
        //移除掉该位置的椅子 并加上一个新头像框
		if(curItem.getChildByName("stool_img_"+dex)){
			curItem.getChildByName("stool_img_"+dex).setVisible(false);
		}
		//建立头像框
        var img = "";
		if(info["sex"] === 1){
			img = "res/ui/Default/male.png"
		}else{
			img = "res/ui/Default/famale.png"
		}
		var portrait_sprite = new cc.Sprite(img);
		portrait_sprite.setScale(85 / portrait_sprite.getContentSize().width);
		portrait_sprite.setName("head_img");
		var stencil = new cc.Sprite("res/ui/GameHallUI/mask2.png"); // 遮罩模板 -- 就是你想把图片变成的形状
		var printed = new cc.Sprite("res/ui/GameHallUI/fram_printed.png");
		var frame = new cc.Sprite("res/ui/GameHallUI/frame.png");
		var head_printed = new cc.Sprite("res/ui/GameHallUI/head_printed.png");
		var msg = cutil.info_sub_ver2(info["nickname"], 4);
		var msg_label = new cc.LabelTTF(msg,"zhunyuan",20);
		var head_layer = new cc.Layer();
		var clipnode = new cc.ClippingNode();
		clipnode.setInverted(false);
		clipnode.setAlphaThreshold(1);
		clipnode.setStencil(stencil);
		clipnode.addChild(portrait_sprite);
		clipnode.setName("clip_node");
		var portrait_sprite = curItem.getChildByName("portrait_sprite_" +dex.toString());
		if (portrait_sprite) {
			portrait_sprite.removeFromParent(true);
		}
		head_layer.setName("portrait_sprite_" + dex.toString());
		head_layer.addChild(clipnode);
		head_layer.addChild(printed);
		head_layer.addChild(frame);
		head_layer.addChild(head_printed);
		head_layer.addChild(msg_label);
		//判断是否玩家是否离线
		if(this.is_sic_off_line(info)){
			var off_line = new cc.Sprite("res/ui/GameRoomUI/state_offline.png");
			head_layer.addChild(off_line);
		}
		head_printed.setPositionY(-30);
		msg_label.setPositionY(-30);
		curItem.addChild(head_layer);
		head_layer.setPosition(cc.p(w * const_val.STOOL_POS[player_num][dex].x, h * const_val.STOOL_POS[player_num][dex].y+5));
    }
});