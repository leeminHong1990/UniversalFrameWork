"use strict";

var ClubMemberUI = UIBase.extend({
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/ClubMemberUI.json";
	},

	show_by_info: function (club_id) {
		if (!h1global.player() || !h1global.player().club_entity_dict) {
			return
		}
		if (!h1global.player().club_entity_dict[club_id]) {
			return
		}
		this.club = h1global.player().club_entity_dict[club_id];
		this.show();
	},

	initUI: function () {
		var self = this;
		var club_player_panel = this.rootUINode.getChildByName("club_player_panel");
		var player_panel = club_player_panel.getChildByName("player_panel");

		player_panel.getChildByName("back_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.hide();
			}
		});

		this.mem_page_index = 1;
		this.black_page_index = 1;
		this.apply_page_index = 1;
		this.page_show_num = 10;

		this.cur_page_num = 1;//当前页数
		this.max_page_num = 1;//最大页数
		this.mem_total = 0;//成员总人数

		this.balck_total = 0;//黑名单总人数
		this.black_cur_page_num = 1;//当前页数
		this.black_max_page_num = 1;//最大页数

		this.admin_list = [];
		this.black_list = [];

		var left_btn_panel = player_panel.getChildByName("left_btn_panel")

		var member_btn = left_btn_panel.getChildByName("member_btn");
		var apply_btn = left_btn_panel.getChildByName("apply_btn");
		var search_btn = left_btn_panel.getChildByName("search_btn");
		var admin_btn = left_btn_panel.getChildByName("admin_btn");
		var black_btn = left_btn_panel.getChildByName("black_btn");

		this.btn_list = [member_btn, apply_btn, search_btn, admin_btn, black_btn];

		var member_panel = player_panel.getChildByName("member_panel");
		var apply_panel = player_panel.getChildByName("apply_panel");
		var search_panel = player_panel.getChildByName("search_panel");
		var admin_panel = player_panel.getChildByName("admin_panel");
		var black_panel = player_panel.getChildByName("black_panel");
		var detail_panel = player_panel.getChildByName("detail_panel");

		var page_list = [member_panel, apply_panel, search_panel, admin_panel, black_panel];

		function update_now_tab(index) {
			self.now_options = index;
			self.update_page_panel(self);
			for (var i = 0; i < self.btn_list.length; i++) {
				if (i == index) {
					self.btn_list[i].getChildByName("label_select").setVisible(true);
					self.btn_list[i].getChildByName("label_normal").setVisible(false);
				} else {
					self.btn_list[i].getChildByName("label_select").setVisible(false);
					self.btn_list[i].getChildByName("label_normal").setVisible(true);
				}
			}
			if (index == 2 || index == 3) {
				player_panel.getChildByName("base_panel").getChildByName("page_panel").setVisible(false);
			} else {
				player_panel.getChildByName("base_panel").getChildByName("page_panel").setVisible(true);
			}
		}

		this.now_options = 0;
		this.is_owner = this.club.is_owner(h1global.player().userId);
		this.is_admin = this.club.is_admin();
		if (this.is_owner || this.is_admin) {
			this.now_options = 1;
			UICommonWidget.create_tab(this.btn_list, page_list, 1, undefined, update_now_tab);
		} else {
			this.btn_list = [member_btn];
			page_list = [detail_panel];
			UICommonWidget.create_tab(this.btn_list, page_list, 0, undefined, update_now_tab);
			detail_panel.setVisible(true);
			apply_btn.setVisible(false);
			search_btn.setVisible(false);
			member_btn.setVisible(false);
			member_panel.setVisible(false);
			player_panel.getChildByName("base_panel").getChildByName("page_panel").setPositionX(460);
		}

		this.init_invite_panel();
		//this.init_search_panel();
		this.init_page_btn_pt();

		// h1global.player().clubOperation(const_val.CLUB_OP_GET_MEMBERS, this.club.club_id);
		cutil.lock_ui();
		h1global.player().clubOperation(const_val.CLUB_OP_GET_MEMBERS2, self.club.club_id, [0, self.page_show_num, "", ["online", "free"]]);
		if (this.is_owner || this.is_admin) {
			h1global.player().clubOperation(const_val.CLUB_OP_GET_APPLICANTS, this.club.club_id);
			h1global.player().clubOperation(const_val.CLUB_OP_GET_ADMINS, this.club.club_id);
			h1global.player().clubOperation(const_val.CLUB_OP_GET_PAGE_BLACKS, this.club.club_id,[0, self.page_show_num, "", []]);
		}
	},

	init_page_btn_pt: function () {
		var page_panel = this.rootUINode.getChildByName("club_player_panel").getChildByName("player_panel").getChildByName("base_panel").getChildByName("page_panel");
		var left_page_btn = page_panel.getChildByName("left_page_btn");
		var right_page_btn = page_panel.getChildByName("right_page_btn");

		left_page_btn.hitTest = function (pt) {
			var size = this.getContentSize();
			var bb = cc.rect(-size.width * 0.1, -size.height * 0.3, size.width, size.height * 2);
			return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
		};
		right_page_btn.hitTest = function (pt) {
			var size = this.getContentSize();
			var bb = cc.rect(-size.width * 0.1, -size.height * 0.3, size.width, size.height * 2);
			return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
		};
	},

	reset_club_member: function (club_id) {
		//成员发生了变化
		if (this.club.club_id !== club_id) {
			return;
		}
		var self = this;
		cutil.lock_ui();
		h1global.player().clubOperation(const_val.CLUB_OP_GET_MEMBERS2, self.club.club_id, [self.mem_page_index - 1, self.page_show_num, "", ["online", "free"]]);
	},

	reset_admin_member: function (club_id) {
		//成员发生了变化
		if (this.club.club_id !== club_id) {
			return;
		}
		cutil.lock_ui();
		h1global.player().clubOperation(const_val.CLUB_OP_GET_ADMINS, this.club.club_id);
	},

	reset_black_member: function (club_id) {
		//成员发生了变化
		if (this.club.club_id !== club_id) {
			return;
		}
		var self = this;
		cutil.lock_ui();
		h1global.player().clubOperation(const_val.CLUB_OP_GET_PAGE_BLACKS, self.club.club_id, [self.black_page_index - 1, self.page_show_num, "", []]);
	},

	update_member_page: function (info_panel, show_list) {
		if (!this.is_show) {
			return;
		}
		var self = this;

		function update_item_func(itemPanel, itemData, index) {
			// if(index%2 === 1){
			//     itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/rank_scroll_bg2.png");
			// } else {
			//     itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/rank_scroll_bg1.png");
			// }
			// var head_img_frame = itemPanel.getChildByName("head_img_frame");
			// head_img_frame.setVisible(false);
			// itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder() - 10);
			itemPanel.__imgUrl = itemData["head_icon"];
			cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function (img) {
				if (self && self.is_show && cc.sys.isObjectValid(itemPanel)) {
					if (itemPanel.__imgUrl != itemData["head_icon"]) {
						return;
					}
					if (itemPanel.getChildByName("head_img_frame").getChildByName("head_icon")) {
						itemPanel.getChildByName("head_img_frame").removeChild(itemPanel.getChildByName("head_icon"))
					}
					var head_img_frame = itemPanel.getChildByName("head_img_frame");
					var portrait_sprite = new cc.Sprite(img);
					portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
					head_img_frame.addChild(portrait_sprite);
					portrait_sprite.setPosition(head_img_frame.width*0.5,head_img_frame.height*0.5);
					portrait_sprite.setName("head_icon");
					// itemPanel.reorderChild(portrait_sprite, itemPanel.getChildByName("admin_img").getLocalZOrder())
				}
			});

			itemPanel.getChildByName("name_label").setString(cutil.info_sub_ver2(itemData["nickname"], 4));
			itemPanel.getChildByName("id_label").setString(itemData["userId"]);
			// cc.log(itemData);

			if (itemData["online"]) {
				if (itemData["free"]) {
					itemPanel.getChildByName("state_label").setString("空闲");
					itemPanel.getChildByName("state_label").setTextColor(cc.color(65, 140, 35));
				} else {
					itemPanel.getChildByName("state_label").setString("游戏中");
					itemPanel.getChildByName("state_label").setTextColor(cc.color(255, 57, 65));
				}
			} else {
				//离线状态
				itemPanel.getChildByName("state_label").setString(cutil.get_off_online_time(itemData["logout_time"]));
				itemPanel.getChildByName("state_label").setTextColor(cc.color(194, 156, 110));
			}


			// itemPanel.getChildByName("mark_label").setString(itemData["notes"]);
			//
			// itemPanel.getChildByName("mark_btn").addTouchEventListener(function(sender, eventType){
			//     if(eventType === ccui.Widget.TOUCH_ENDED){
			//         if(h1global.curUIMgr.editor_ui && !h1global.curUIMgr.editor_ui.is_show){
			//             h1global.curUIMgr.editor_ui.show_by_info(function (editor_string) {
			//                 h1global.player().clubOperation(const_val.CLUB_OP_SET_MEMBER_NOTES, self.club.club_id, [itemData["userId"], editor_string]);
			//             }, "请输入玩家备注", const_val.CLUB_MAX_MARK_LEN)
			//         }
			//     }
			// });

			itemPanel.getChildByName("delete_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (h1global.curUIMgr.confirm_ui && !h1global.curUIMgr.confirm_ui.is_show && self.club.club_id) {
						h1global.curUIMgr.confirm_ui.show_by_info("确定将该成员踢出亲友圈?", function () {
							h1global.player().clubOperation(const_val.CLUB_OP_KICK_OUT, self.club.club_id, [itemData["userId"]]);
						});
					}
				}
			});

			if(self.is_owner || self.is_admin){
				if(self.is_owner){
					if(itemData.power === const_val.CLUB_POWER_OWNER){
						itemPanel.getChildByName("delete_btn").setVisible(false);
					}else{
						itemPanel.getChildByName("delete_btn").setVisible(true);
					}
				}
				if(self.is_admin){
					if(itemData.power >= const_val.CLUB_POWER_ADMIN){
						itemPanel.getChildByName("delete_btn").setVisible(false);
					}else{
						itemPanel.getChildByName("delete_btn").setVisible(true);
					}
				}
			}else{
				itemPanel.getChildByName("delete_btn").setVisible(false);
			}
			if(itemData.power === const_val.CLUB_POWER_OWNER){
				itemPanel.getChildByName("owner_img").setVisible(true);
			}else{
				itemPanel.getChildByName("owner_img").setVisible(false);
			}
			if(itemData.power === const_val.CLUB_POWER_ADMIN){
				itemPanel.getChildByName("admin_img").setVisible(true);
			}else{
				itemPanel.getChildByName("admin_img").setVisible(false);
			}

			if (h1global.player().userId === itemData.userId) {
				itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light2_img.png");
			} else {
				itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light_img.png");
			}
		}

		UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func)
	},

	update_club_apply: function (apply_list) {
		if (!this.is_show) {
			return;
		}
		this.club.apply_list = apply_list;
		var self = this;
		this.update_page_panel(self);
	},

	update_club_member: function (club_id, member_list, now_page, total) {
		if (!this.is_show) {
			return;
		}
		if (this.club.club_id !== club_id) {
			return;
		}
		var self = this;
		this.members = member_list;
		this.cur_page_num = now_page + 1;//当前页数
		this.mem_total = total;//成员总人数

		this.update_page_panel(self);
	},

	update_admin_list: function (admin_list) {
		if (!this.is_show) {
			return;
		}
		this.admin_list = admin_list;
		var self = this;
		this.update_page_panel(self);
	},

	update_club_black: function (club_id, member_list, now_page, total) {
		if (!this.is_show) {
			return;
		}
		if (this.club.club_id !== club_id) {
			return;
		}
		var self = this;
		this.black_list = member_list;
		this.black_cur_page_num = now_page + 1;//当前页数
		this.balck_total = total;//成员总人数

		this.update_page_panel(self);
	},

	update_apply_page: function (info_panel, show_list) {
		if (!this.is_show) {
			return;
		}
		var self = this;

		function update_item_func(itemPanel, itemData, index) {
			var head_img_frame = itemPanel.getChildByName("head_img_frame");
			itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder() - 10);
			cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function (img) {
				if (self && self.is_show && cc.sys.isObjectValid(itemPanel)) {
					if (itemPanel.getChildByName("head_icon")) {
						itemPanel.removeChild(itemPanel.getChildByName("head_icon"))
					}
					var portrait_sprite = new cc.Sprite(img);
					portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
					itemPanel.addChild(portrait_sprite);
					portrait_sprite.setPosition(head_img_frame.getPosition());
					portrait_sprite.setName("head_icon");
					itemPanel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder())
				}
			});
			itemPanel.getChildByName("name_label").setString(cutil.info_sub_ver2(itemData["nickname"], 4));
			itemPanel.getChildByName("id_label").setString("申请加入");
			itemPanel.getChildByName("time_label").setString(cutil.convert_timestamp_to_ymd(itemData["ts"]));

			itemPanel.getChildByName("agree_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (h1global.curUIMgr.editor_ui && !h1global.curUIMgr.editor_ui.is_show) {
						h1global.player().clubOperation(const_val.CLUB_OP_AGREE_IN, self.club.club_id, [itemData["userId"]]);
					}
				}
			});

			itemPanel.getChildByName("cancel_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					h1global.player().clubOperation(const_val.CLUB_OP_REFUSE_IN, self.club.club_id, [itemData["userId"]]);
				}
			});
		}

		UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func)
	},

	update_admin_page: function (info_panel, show_list) {
		if (!this.is_show) {
			return;
		}
		var self = this;

		function update_item_func(itemPanel, itemData, index) {
			var head_img_frame = itemPanel.getChildByName("head_img_frame");
			itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder() - 10);
			cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function (img) {
				if (self && self.is_show) {
					if (itemPanel.getChildByName("head_icon")) {
						itemPanel.removeChild(itemPanel.getChildByName("head_icon"))
					}
					var portrait_sprite = new cc.Sprite(img);
					portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
					itemPanel.addChild(portrait_sprite);
					portrait_sprite.setPosition(head_img_frame.getPosition());
					portrait_sprite.setName("head_icon");
					itemPanel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder())
				}
			});
			itemPanel.getChildByName("name_label").setString(cutil.info_sub_ver2(itemData["nickname"], 4));
			itemPanel.getChildByName("id_label").setString(itemData["userId"]);
			// itemPanel.getChildByName("time_label").setString(cutil.convert_timestamp_to_ymd(itemData["ts"]));
			if(self.is_admin){
				itemPanel.getChildByName("delete_btn").setVisible(false);
				itemPanel.getChildByName("admin_img").setVisible(true);
			}else{
				itemPanel.getChildByName("delete_btn").setVisible(true);
				itemPanel.getChildByName("admin_img").setVisible(false);
			}
			itemPanel.getChildByName("delete_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (h1global.curUIMgr.editor_ui && !h1global.curUIMgr.editor_ui.is_show) {
						h1global.player().clubOperation(const_val.CLUB_OP_FIRE_ADMIN, self.club.club_id, [itemData["userId"]]);
					}
				}
			});
		}
		UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func)
	},

	update_black_page: function (info_panel, show_list) {
		if (!this.is_show) {
			return;
		}
		var self = this;

		function update_item_func(itemPanel, itemData, index) {
			var head_img_frame = itemPanel.getChildByName("head_img_frame");
			itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder() - 10);
			itemPanel.__imgUrl = itemData["head_icon"];
			cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function (img) {
				if (self && self.is_show && cc.sys.isObjectValid(itemPanel)) {
					if (itemPanel.__imgUrl != itemData["head_icon"]) {
						return;
					}
					if (itemPanel.getChildByName("head_icon")) {
						itemPanel.removeChild(itemPanel.getChildByName("head_icon"))
					}
					var portrait_sprite = new cc.Sprite(img);
					portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
					itemPanel.addChild(portrait_sprite);
					portrait_sprite.setPosition(head_img_frame.getPosition());
					portrait_sprite.setName("head_icon");
					itemPanel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder())
				}
			});

			itemPanel.getChildByName("name_label").setString(cutil.info_sub_ver2(itemData["nickname"], 4));
			itemPanel.getChildByName("id_label").setString(itemData["userId"]);
			itemPanel.getChildByName("delete_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (h1global.curUIMgr.confirm_ui && !h1global.curUIMgr.confirm_ui.is_show && self.club.club_id) {
						h1global.curUIMgr.confirm_ui.show_by_info("确定取消该成员黑名单?", function () {
							h1global.player().clubOperation(const_val.CLUB_OP_KICK_BLACK, self.club.club_id, [itemData["userId"]]);
						});
					}
				}
			});

			if (h1global.player().userId === itemData.userId) {
				itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light2_img.png");
			} else {
				itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light_img.png");
			}
		}

		UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func)
	},

	init_invite_panel: function () {
		var club_player_panel = this.rootUINode.getChildByName("club_player_panel");
		var player_panel = club_player_panel.getChildByName("player_panel");
		var search_panel = player_panel.getChildByName("search_panel");

		var sub_panel = search_panel.getChildByName("sub_panel");
		var info_panel = sub_panel.getChildByName("info_panel");

		sub_panel.getChildByName("id_edit_box").setPlaceHolderColor(cc.color(255, 255, 255));

		// var warning_label = search_panel.getChildByName("warning_label");
		//
		// if(!this.club.is_owner(h1global.player().userId)){
		//     warning_label.setVisible(true);
		//     sub_panel.setVisible(false);
		//     return
		// }else {
		//     warning_label.setVisible(false);
		//     sub_panel.setVisible(true);
		// }
		var self = this;
		sub_panel.getChildByName("search_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				var id_str = sub_panel.getChildByName("id_edit_box").getString();
				if (isNaN(Number(id_str))) {
					if (h1global.globalUIMgr.info_ui) {
						h1global.globalUIMgr.info_ui.show_by_info("输入不合法");
					}
					return
				}
				var id = Number(id_str);
				if (id < 1000000 || id > 9999999) {
					if (h1global.globalUIMgr.info_ui) {
						h1global.globalUIMgr.info_ui.show_by_info("玩家ID不合法");
					}
					return
				}
				h1global.player().queryUserInfo(id,self.club.club_id);
				sub_panel.getChildByName("id_edit_box").setString("");
			}
		});

		info_panel.getChildByName("clear_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				info_panel.setVisible(false);
			}
		})
	},

	update_user_info: function (userInfo, user_competence) {
		if (!this.is_show || !this.club) {
			return;
		}
		// if (!this.is_owner || !this.is_admin) {
		// 	return;
		// }
		// cc.error(userInfo, user_club_list, this.club.club_id);
		// var is_member = false;
		// for (var k in user_club_list) {
		// 	if (user_club_list[k] == this.club.club_id) {
		// 		is_member = true;
		// 	}
		// }

		var self = this;
		var club_player_panel = this.rootUINode.getChildByName("club_player_panel");
		var player_panel = club_player_panel.getChildByName("player_panel");
		var search_panel = player_panel.getChildByName("search_panel");

		var sub_panel = search_panel.getChildByName("sub_panel");
		var info_panel = sub_panel.getChildByName("info_panel");

		var head_img_frame = info_panel.getChildByName("head_img_frame");
		cutil.loadPortraitTexture(userInfo["head_icon"], userInfo["sex"], function (img) {
			if (self && self.is_show) {
				if (info_panel.getChildByName("head_icon")) {
					info_panel.removeChild(info_panel.getChildByName("head_icon"))
				}
				var portrait_sprite = new cc.Sprite(img);
				portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
				info_panel.addChild(portrait_sprite);
				portrait_sprite.setPosition(head_img_frame.getPosition());
				portrait_sprite.setName("head_icon");
				// info_panel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder()-1)
			}
		});

		info_panel.getChildByName("name_label").setString(cutil.str_sub(userInfo["name"], 7));
		info_panel.getChildByName("id_label").setString("ID:" + userInfo["userId"]);
		info_panel.setVisible(true);
		var set_admin_btn = info_panel.getChildByName("set_admin_btn");
		var add_black_btn = info_panel.getChildByName("add_black_btn");
		var invite_btn = info_panel.getChildByName("invite_btn");
		var delete_btn = info_panel.getChildByName("delete_btn");
		invite_btn.setVisible(true);
		delete_btn.setVisible(true);
		set_admin_btn.setVisible(true);
		add_black_btn.setVisible(true);
		if(this.is_owner && user_competence === const_val.CLUB_POWER_OWNER){
			invite_btn.setVisible(false);

			set_admin_btn.setBright(false);
			set_admin_btn.setTouchEnabled(false);
			delete_btn.setBright(false);
			delete_btn.setTouchEnabled(false);
			// add_black_btn.setBright(true);
			// add_black_btn.setTouchEnabled(true);
		}else if(this.is_owner && user_competence === const_val.CLUB_POWER_ADMIN){
			invite_btn.setVisible(false);

			set_admin_btn.setBright(false);
			set_admin_btn.setTouchEnabled(false);
			delete_btn.setBright(true);
			delete_btn.setTouchEnabled(true);
		}else if(this.is_owner && user_competence === const_val.CLUB_POWER_CIVIL){
			invite_btn.setVisible(false);

			set_admin_btn.setBright(true);
			set_admin_btn.setTouchEnabled(true);
			delete_btn.setBright(true);
			delete_btn.setTouchEnabled(true);
		}else if(this.is_owner && user_competence === const_val.CLUB_POWER_OUT){
			delete_btn.setVisible(false);

			set_admin_btn.setBright(false);
			set_admin_btn.setTouchEnabled(false);
		}else if(this.is_admin && (user_competence === const_val.CLUB_POWER_OWNER || user_competence === const_val.CLUB_POWER_ADMIN)){
			invite_btn.setVisible(false);

			set_admin_btn.setBright(false);
			set_admin_btn.setTouchEnabled(false);
			delete_btn.setBright(false);
			delete_btn.setTouchEnabled(false);
		}else if(this.is_admin && user_competence === const_val.CLUB_POWER_CIVIL){
			invite_btn.setVisible(false);

			set_admin_btn.setBright(false);
			set_admin_btn.setTouchEnabled(false);
			delete_btn.setBright(true);
			delete_btn.setTouchEnabled(true);
		}else if(this.is_admin && user_competence === const_val.CLUB_POWER_OUT){
			delete_btn.setVisible(false);

			set_admin_btn.setBright(false);
			set_admin_btn.setTouchEnabled(false);
		}
		info_panel.getChildByName("delete_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				if (h1global.curUIMgr.confirm_ui && !h1global.curUIMgr.confirm_ui.is_show && self.club.club_id) {
					h1global.curUIMgr.confirm_ui.show_by_info("确定将该成员踢出亲友圈?", function () {
						h1global.player().clubOperation(const_val.CLUB_OP_KICK_OUT, self.club.club_id, [userInfo["userId"]]);
					});
					this.setVisible(false);
				}
			}
		});
		info_panel.getChildByName("invite_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				h1global.player().clubOperation(const_val.CLUB_OP_INVITE_IN, self.club.club_id, [userInfo["userId"]]);
				this.setVisible(false);
			}
		});
		info_panel.getChildByName("set_admin_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				h1global.player().clubOperation(const_val.CLUB_OP_SET_ADMIN, self.club.club_id, [userInfo["userId"]]);
				this.setVisible(false);
			}
		});
		info_panel.getChildByName("add_black_btn").addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				h1global.player().clubOperation(const_val.CLUB_OP_SET_BLACK, self.club.club_id, [userInfo["userId"]]);
				this.setVisible(false);
			}
		});
	},

	update_page: function (page_panel, index, total, id) {
		if (id || total == 0) {
			page_panel.getChildByName("page_label").setString("1/1")
		} else {
			page_panel.getChildByName("page_label").setString(index.toString() + "/" + Math.ceil(total / this.page_show_num).toString())
		}
		if (index == 1) {
			page_panel.getChildByName("left_page_btn").setEnabled(false);
		} else {
			page_panel.getChildByName("left_page_btn").setEnabled(true);
		}
		if (total == 0 || index == Math.ceil(total / this.page_show_num)) {
			page_panel.getChildByName("right_page_btn").setEnabled(false);
		} else {
			page_panel.getChildByName("right_page_btn").setEnabled(true);
		}
	},

	update_page_panel: function (self, id) {
		if (!this.is_show) {
			return;
		}
		//var self = this;

		var club_player_panel = this.rootUINode.getChildByName("club_player_panel");

		var player_panel = club_player_panel.getChildByName("player_panel");
		var member_panel = player_panel.getChildByName("member_panel");
		var base_panel = player_panel.getChildByName("base_panel");

		var page_panel = base_panel.getChildByName("page_panel");
		var info_panel = member_panel.getChildByName("info_panel");


		var now_list = null;

		switch (this.now_options) {
			case 0:
				if (this.is_owner || this.is_admin) {
					info_panel = player_panel.getChildByName("member_panel").getChildByName("info_panel");
				} else {
					info_panel = player_panel.getChildByName("detail_panel").getChildByName("record_all_scroll");
				}
				// now_list = this.club.members;
				now_list = this.members;
				break;
			case 1:
				info_panel = player_panel.getChildByName("apply_panel").getChildByName("info_panel");
				now_list = this.club.apply_list;
				break;
			case 3:
				info_panel = player_panel.getChildByName("admin_panel").getChildByName("info_panel");
				now_list = this.admin_list;
				break;
			case 4:
				info_panel = player_panel.getChildByName("black_panel").getChildByName("info_panel");
				now_list = this.black_list;
				break;
			default:
				break;
		}
		if (this.now_options == 2) {
			return;
		}
		;
		if (!now_list) {
			now_list = []
		}
		;
		if (this.now_options == 0) {
			this.mem_page_index = this.cur_page_num;
			var show_list = now_list;
			self.update_page(page_panel, this.cur_page_num, this.mem_total, id);
			page_panel.getChildByName("left_page_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (self.mem_page_index <= 0) {
						return
					}
					self.mem_page_index--;
					cutil.lock_ui();
					h1global.player().clubOperation(const_val.CLUB_OP_GET_MEMBERS2, self.club.club_id, [self.mem_page_index - 1, self.page_show_num, "", ["online", "free"]]);
				}
			});

			page_panel.getChildByName("right_page_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (self.mem_page_index >= Math.ceil(self.mem_total / self.page_show_num)) {
						return
					}
					self.mem_page_index++;
					cutil.lock_ui();
					h1global.player().clubOperation(const_val.CLUB_OP_GET_MEMBERS2, self.club.club_id, [self.mem_page_index - 1, self.page_show_num, "", ["online", "free"]]);
				}
			});
			this.update_member_page(info_panel, show_list);
		} else if (this.now_options == 1) {
			if (this.apply_page_index >= Math.ceil(now_list.length / this.page_show_num) && this.apply_page_index > 0) {
				this.apply_page_index -= 1;
			}

			var show_list = now_list.slice(this.apply_page_index * this.page_show_num, this.apply_page_index * this.page_show_num + this.page_show_num);

			if (id) {
				show_list = [];
				for (var i = 0; i < now_list.length; i++) {
					if (now_list[i]["userId"] == id) {
						show_list.push(now_list[i]);
					}
				}
				if (show_list.length < 1) {
					if (h1global.globalUIMgr.info_ui) {
						h1global.globalUIMgr.info_ui.show_by_info("找不到该成员");
					}
					return;
				}
			}

			page_panel.getChildByName("left_page_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (self.apply_page_index <= 0) {
						return
					}
					self.apply_page_index -= 1;
					self.update_page(page_panel, self.apply_page_index + 1, now_list.length, id);
					var show_list = now_list.slice(self.apply_page_index * self.page_show_num, self.apply_page_index * self.page_show_num + self.page_show_num);
					self.update_apply_page(info_panel, show_list);
					info_panel.jumpToTop();
				}
			});

			page_panel.getChildByName("right_page_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (self.apply_page_index + 1 >= Math.ceil(now_list.length / self.page_show_num)) {
						return
					}
					self.apply_page_index += 1;
					self.update_page(page_panel, self.apply_page_index + 1, now_list.length, id);
					var show_list = now_list.slice(self.apply_page_index * self.page_show_num, self.apply_page_index * self.page_show_num + self.page_show_num);
					self.update_apply_page(info_panel, show_list);
					info_panel.jumpToTop();
				}
			});
			self.update_page(page_panel, self.apply_page_index + 1, now_list.length, id);
			this.update_apply_page(info_panel, show_list)
		} else if (this.now_options == 3) {
			this.update_admin_page(info_panel, now_list)
		}else if (this.now_options == 4) {
			// this.balck_total = 0;//黑名单总人数
			// this.black_cur_page_num = 1;//当前页数
			// this.black_max_page_num = 1;//最大页数
			this.black_page_index = this.black_cur_page_num;
			var show_list = now_list;
			self.update_page(page_panel, this.black_cur_page_num, this.balck_total, id);
			page_panel.getChildByName("left_page_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (self.black_page_index <= 0) {
						return
					}
					self.black_page_index--;
					cutil.lock_ui();
					h1global.player().clubOperation(const_val.CLUB_OP_GET_PAGE_BLACKS, self.club.club_id, [self.black_page_index - 1, self.page_show_num, "", ["online", "free"]]);
				}
			});

			page_panel.getChildByName("right_page_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					if (self.black_page_index >= Math.ceil(self.balck_total / self.page_show_num)) {
						return
					}
					self.black_page_index++;
					cutil.lock_ui();
					h1global.player().clubOperation(const_val.CLUB_OP_GET_PAGE_BLACKS, self.club.club_id, [self.black_page_index - 1, self.page_show_num, "", ["online", "free"]]);
				}
			});
			this.update_black_page(info_panel, show_list);
		}
	},
});