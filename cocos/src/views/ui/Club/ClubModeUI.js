"use strict";

var ClubModeUI = CreateRoomUI.extend({
	initUI: function () {
		this._super();
		this.createroom_panel.getChildByName("title_img").loadTexture("res/ui/CirclePopUI/club_mode_title.png");
		this.createroom_panel.getChildByName("title_img").ignoreContentAdaptWithSize(true);
	},


	show_by_info: function (club_id, desk_idx) {
		if (!h1global.player().club_entity_dict[club_id]) {
			return
		}
		this.club = h1global.player().club_entity_dict[club_id];
		if (desk_idx != -1) {
			this.desk_idx = desk_idx;
		} else {
			this.desk_idx = undefined;
		}
		this.show();
	},

	set_create_room_func: function () {
		cc.log("这里 改变亲友圈的模式");
		if (this.desk_idx === undefined) {
			h1global.player().clubOperation(const_val.CLUB_OP_SET_DEFAULT_ROOM, this.club.club_id, [this.use_list["game_type"], this.init_list]);
			this.club.club_base_info.room_params = JSON.stringify(this.init_list);
			this.club.club_base_info.game_type = this.use_list["game_type"];
		} else {
			h1global.player().clubOperation(const_val.CLUB_OP_SET_ROOM_PARAMS, this.club.club_id, [this.desk_idx, this.use_list["game_type"], this.init_list]);
		}

	},

	initCreateInfo: function () {
		// 这里重写当前选项为 当前茶楼的 默认玩法
		if (this.club.club_base_info.game_type) {
			if (this.desk_idx !== undefined) {
				this.now_btn_name = const_val.GameType2GameName[this.club.club_base_info.table_info_list[this.desk_idx].game_type].toLowerCase();
			} else {
				this.now_btn_name = const_val.GameType2GameName[this.club.club_base_info.game_type].toLowerCase();
			}
		} else {
			this.now_btn_name = this.name_list[0];
		}
	},

	is_club: function () {
		if (this.club.club_base_info.room_params) {
			if (this.desk_idx !== undefined) {
				this.init_list = eval("(" + this.club.club_base_info.table_info_list[this.desk_idx].room_params + ")");
			} else {
				this.init_list = eval("(" + this.club.club_base_info.room_params + ")");
			}
			this.default_pay_mode = this.init_list["pay_mode"];
			return true;
		} else {
			return false;
		}

	},

	init_now_btn: function (again) {
		// 这里要获得当前茶楼的默认玩法 并传入 show_by_info

		var self = this;
		for (var i = 0; i < this.name_list.length; i++) {
			if (this.name_list[i] === this.now_btn_name) {
				self.left_btn_list[i].setTouchEnabled(false);
				self.left_btn_list[i].setBright(false);

				if (self.now_panel && self.now_panel.is_show) {
					self.now_panel.hide();
				}
				self.now_panel = eval("h1global.curUIMgr." + switches.game_list[i] + "createroom_ui");
				if (self.now_panel && !self.now_panel.is_show) {
					if (again) {
						self.now_panel.show_by_info(undefined, const_val.CLUB_ROOM, this.club.owner.isAgent);
					} else {
						//self.now_panel.show_by_info({"game_round": 8, "play_list": [0,0], "hand_prepare": 0, "pay_mode": 0, "room_type": 0});
						cc.log(this.club.club_base_info.room_params);
						if (this.club.club_base_info.room_params) {
							self.now_panel.show_by_info(eval("(" + this.club.club_base_info.room_params + ")"), const_val.CLUB_ROOM, this.club.owner.isAgent);
						} else {
							self.now_panel.show_by_info(undefined, const_val.CLUB_ROOM, this.club.owner.isAgent);
						}
					}
				}

				return true;
			}
		}
		return false;

	},

	update_init_list: function () {
		var owner_id = h1global.player().userId;

		this.init_list["is_agent"] = this.club.owner.isAgent;
		this.init_list["p_switch"] = this.club.club_base_info["p_switch"];
		if (this.club.is_owner(owner_id) && this.desk_idx == undefined) {
			this.init_list["p_switch"] = 1;//如果是房主 却 不是改单张桌子的玩法
		}
		if (this.default_pay_mode) {
			this.init_list["pay_mode"] = this.default_pay_mode;
		}
		this.init_list["room_type"] = const_val.CLUB_ROOM;
		if (this.init_list["pay_mode"] == const_val.NORMAL_PAY_MODE) {
			this.init_list["pay_mode"] = const_val.CLUB_PAY_MODE;
		}
		//将茶楼的局数初始化为8
		// this.init_list["game_round"] = 8;
		// if(this.use_list["game_type"] == const_val.LvLiang7){
		// this.init_list["game_round"] = 6;
		// }
		this.check_init_list();
	},

	init_left_btn: function () {
		var self = this;

		//this.intro_scroll = this.rootUINode.getChildByName("gamename_panel").getChildByName("intro_scroll");

		function update_item_func(itemPanel, itemData, index) {
			itemPanel.getChildByName("ruler_btn").loadTextureNormal("res/ui/Default/" + itemData + "_btn_normal.png");
			itemPanel.getChildByName("ruler_btn").loadTextureDisabled("res/ui/Default/" + itemData + "_btn_select.png");
		}

		var info_panel = this.createroom_panel.getChildByName("info_panel");
		UICommonWidget.update_scroll_items(info_panel, switches.game_list, update_item_func)

		var info_list = info_panel.getChildren();
		this.left_btn_list = [];
		for (var i = 0; i < info_list.length; i++) {
			this.left_btn_list.push(info_list[i].getChildren()[0]);
		}

		for (var i = 0; i < this.left_btn_list.length; i++) {
			let choose_num = i;
			this.left_btn_list[choose_num].addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					for (var j = 0; j < self.left_btn_list.length; j++) {
						if (j == choose_num) {
							self.left_btn_list[choose_num].setTouchEnabled(false);
							self.left_btn_list[choose_num].setBright(false);
							if (self.now_panel && self.now_panel.is_show) {
								self.now_panel.hide();
							}
							self.now_panel = eval("h1global.curUIMgr." + switches.game_list[choose_num] + "createroom_ui");
							if (self.now_panel && !self.now_panel.is_show) {
								self.now_panel.show_by_info(undefined, const_val.CLUB_ROOM, self.club.owner.isAgent);
							}
						} else {
							self.left_btn_list[j].setTouchEnabled(true);
							self.left_btn_list[j].setBright(true);
						}
					}
				}
			});
		}

	},


});
