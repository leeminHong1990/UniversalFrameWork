"use strict";
var CreateRoomUI = UIBase.extend({
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/CreateRoomUI.json";
		this.is_normal_show = true;
	},

	initUI: function () {
		if(this.is_normal_show){
			this.main_panel = this.rootUINode.getChildByName("main_panel");
			this.main_panel.getChildByName("right_bg").setPositionY(this.main_panel.getChildByName("top_bg").getPositionY() - this.main_panel.getChildByName("top_bg").height + 10);
			this.main_panel.getChildByName("left_bg").setPositionY(this.main_panel.getChildByName("top_bg").getPositionY() - this.main_panel.getChildByName("top_bg").height + 10);
		}
		this.createroom_panel = this.rootUINode.getChildByName("createroom_panel");
		this.right_scroll = this.createroom_panel.getChildByName("brown_bg").getChildByName("right_scroll");
		this.right_panel = null;
		var self = this;
		var return_btn = this.createroom_panel.getChildByName("return_btn");
		return_btn.hitTest = function (pt) {
			var size = this.getContentSize();
			var bb = cc.rect(-size.width, -size.height * 0.3, size.width * 3, size.height * 2);
			return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
		};

		function return_btn_event(sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.hide();
				if (self.now_panel && self.now_panel.is_show) {
					self.now_panel.hide();
				}
			}
		}
		return_btn.addTouchEventListener(return_btn_event);

		this.init_now_panel();
		this.init_left_btn2();
		this.initCreateInfo();

		if (!this.init_now_btn2()) {
			this.now_btn_name = this.name_list[0];
			if (!this.init_now_btn2(1)) {
				cc.log("如果再次调用还出错就完蛋辣！~");
				return;
			}
		}
		this.init_ui();
	},

	init_ui: function () {
		this.set_btn_ui();
		this.set_tip_label();
		this.set_hand_prepare_chx();
	},

	init_now_panel: function () {
		// var right_panel = new cc.Layer();
		// right_panel.setContentSize(cc.size(1280, 720));
		// right_panel.setName("right_panel");
		// this.createroom_panel.addChild(right_panel);
		// right_panel.setPosition(this.rootUINode.width - right_panel.width > 100 ? 100 : 0, this.rootUINode.height - right_panel.height);
		this.chx = ccui.CheckBox.create();
		this.chx.loadTextures(
			"res/ui/Default/chx_bg.png",
			"res/ui/Default/chx_bg.png",
			"res/ui/Default/chx_select.png",
			"res/ui/Default/chx_bg.png",
			"res/ui/Default/chx_unselect.png"
		);
		this.round_chx = ccui.CheckBox.create();
		this.round_chx.loadTextures(
			"res/ui/Default/round_chx.png",
			"res/ui/Default/round_chx.png",
			"res/ui/Default/round_chx_select.png",
			"res/ui/Default/round_chx_unselect.png",
			"res/ui/Default/round_chx_select.png"
		);
		this.rootUINode.addChild(this.round_chx);
		this.rootUINode.addChild(this.chx);
		this.round_chx.setVisible(false);
		this.chx.setVisible(false);

		this.now_params_list = [];//存放每一条选择的值的地方 回调函数中用到
		this.is_reset_list = [];
		this.is_parallel_list = [];
		this.is_premise_list = [];
		this.chx_panel_name = [];
		this.height_len = 53; //行间距
		// this.use_list = table_create_params[1];
		// this.init_list = this.use_list["init"];
	},

	update_now_panel: function () {
		var self = this;
		var use_list = this.use_list;
		var create_list = use_list["create"];

		//获得当前需要绘制的场景
		var need_break = 0;
		while (1) {
			for (var k in this.init_list) {
				if (k == Object.keys(create_list)[0]) {
					create_list = create_list[k][this.init_list[k]];
				}
			}
			need_break++;

			if (typeof create_list[0] == 'number' || need_break > 20) { //可以在这里加一个防错限制 以防无限loop
				cc.log(need_break);
				break;
			}
		}
		var right_panel = this.right_panel;
		var h_size = 0;
		//根据create_list.length的长度来定制scroll的高度
		var limit_height = 6;
		// var scoll_height = create_list.length > limit_height ? right_panel.height + (50 * (create_list.length - limit_height)) : right_panel.height;
		var scoll_height = right_panel.height;
		this.right_scroll.setInnerContainerSize(cc.size(right_panel.width, scoll_height));
		for (var i = 0; i < create_list.length; i++) {
			if (table_params[create_list[i]]) {          // 用for挨个 绘制每一条的按钮和文字
				var now_params = table_params[create_list[i]];
				// 创建panel
				var panel = new cc.Layer();
				panel.setName(now_params["key"] + "_panel");
				panel.setContentSize(cc.size(this.right_scroll.width, 50));
				panel.setPositionY(scoll_height * (1) - h_size * this.height_len - 33);
				right_panel.addChild(panel);
				// var line = new cc.Sprite("res/ui/CreateRoomUI/line_img.png");
				// panel.addChild(line);
				// line.setScaleX(3);
				// line.setPosition(450,-20)
				// cc.error(line);

				//添加标题
				var title = new cc.LabelTTF(now_params["title"], "zhunyuan", 30);
				//ccui.LabelBMFont
				title.setPositionX(70);
				title.setColor(const_val.ROOM_WORD_NORMAL);
				panel.addChild(title);
				//如果该层是两行的 h_size多+1
				now_params["h_size"] && now_params["h_size"] == 2 && h_size++;
				now_params["h_size"] && now_params["h_size"] == 3 && h_size++ && h_size++;
				//添加按钮和标题
				switch (parseInt(now_params["type"])) {
					case 0://创建按钮
						break;
					case 1://多选
						this.set_round_chx(panel, now_params);
						break;
					case 2://单选
						this.set_chx(panel, now_params);
						break;
					case 3:
						var card_img = ccui.ImageView.create();
						card_img.loadTexture(now_params["values"]);
						card_img.setPositionX(panel.width * 0.39);
						panel.setPositionY(right_panel.height * 0.225); //固定房卡位置
						panel.addChild(card_img);

						var val = undefined;
						var normal_func = function (game_round) {
							return parseInt(game_round / 4 + 1);
						};
						var AA_func = function (game_round) {
							return parseInt(game_round / 8);
						};
						if (use_list["game_type"] == const_val.DouDiZhu) {//斗地主
							normal_func = function (game_round) {
								return parseInt(game_round / 4);
							};
						}
						if (use_list["game_type"] == const_val.LvLiang7) {//吕梁打七
							normal_func = function (game_round) {
								return parseInt(game_round / 2);
							};
							AA_func = function (game_round) {
								return 1;
							};
						}
						if (this.init_list["room_type"] === const_val.CLUB_ROOM) { //茶楼开房
							// var is_agent = this.init_list["is_agent"];
							var is_agent = 1;
							if (this.init_list["pay_mode"] === const_val.AA_PAY_MODE) {
								val = "每人消耗 x " + (is_agent ? AA_func(this.init_list["game_round"]) : AA_func(this.init_list["game_round"]) * 3);
							} else {
								val = "房主消耗 x " + (is_agent ? normal_func(this.init_list["game_round"]) : normal_func(this.init_list["game_round"]) * 3);
							}
						} else if (this.init_list["room_type"] === const_val.NORMAL_ROOM) { //普通开房
							if (this.init_list["pay_mode"] === const_val.AA_PAY_MODE) {
								val = "每人消耗 x " + AA_func(this.init_list["game_round"]);
							} else {
								val = "房主消耗 x " + normal_func(this.init_list["game_round"]);
							}
						}
						var label = ccui.Text.create(val, "zhunyuan", 30);
						label.setAnchorPoint(0, 0.5);
						label.setTextColor(const_val.ROOM_WORD_NORMAL);
						label.setPositionX(panel.width * (0.42));
						label.setName("cost_label");
						panel.addChild(label);
						break;
					case 4:
						break;
					case 5:
						var x = 170;
						// 底分加减
						var printed = ccui.ImageView.create();
						printed.loadTexture(now_params["src"]["base_printed"]);
						cc.log(printed);
						printed.setPositionX(x + 85);
						panel.addChild(printed);

						var left_btn = ccui.Button.create();
						left_btn.loadTextureNormal(now_params["src"]["left_btn_normal"]);
						// left_btn.loadTexturePressed(now_params["src"]["left_btn_select"]);
						left_btn.setPositionX(x);
						panel.addChild(left_btn);

						var right_btn = ccui.Button.create();
						right_btn.loadTextureNormal(now_params["src"]["right_btn_normal"]);
						// right_btn.loadTexturePressed(now_params["src"]["right_btn_select"]);
						right_btn.setPositionX(x + 150);
						panel.addChild(right_btn);

						this.now_params_list[now_params["key"]] = now_params["values"];
						let key_name = now_params["key"];

						left_btn.addTouchEventListener(function (sender, eventType) {
							if (eventType === ccui.Widget.TOUCH_ENDED) {
								cc.log("-");
								var values_list = self.now_params_list[key_name];
								for (var k in values_list) {
									if (self.init_list[key_name] == values_list[k]) {
										if (k == 0) {
											break;
										}
										self.init_list[key_name] = values_list[k - 1];
										//self.reset_right_panel();
										var panel = self.right_panel.getChildByName(key_name + "_panel");
										if (panel) {
											panel.getChildByName(key_name).setString(self.init_list[key_name]);
										} else {
											cc.error("panel is null");
										}
										break;
									}
								}
							}
						});

						right_btn.addTouchEventListener(function (sender, eventType) {
							if (eventType === ccui.Widget.TOUCH_ENDED) {
								cc.log("+");
								var values_list = self.now_params_list[key_name];
								var add = 0;
								for (var k in values_list) {
									if (add) {
										self.init_list[key_name] = values_list[k];
										cc.log(self.init_list[key_name]);
										//self.reset_right_panel();
										var panel = self.right_panel.getChildByName(key_name + "_panel");
										if (panel) {
											panel.getChildByName(key_name).setString(self.init_list[key_name]);
										} else {
											cc.error("panel is null");
										}
										break;
									}
									if (self.init_list[key_name] == values_list[k]) {
										add = 1;
									}
								}
							}
						});
						if (this.init_list[now_params["key"]] == undefined) {
							this.init_list[now_params["key"]] = 1;
						}
						var label = ccui.Text.create(this.init_list[now_params["key"]], "zhunyuan", 30);
						// label.setAnchorPoint(0,0.5);
						// label.setTextColor(cc.color(255, 255, 255));
						label.setPositionX(x + 77);
						label.setPositionY(-3);
						label.setName(now_params["key"]);
						panel.addChild(label);
						break;
					default:
						break;
				}
				this.set_touch_enable(panel);
				h_size++; //成功渲染一次 高度就+1
			}
		}

	},

	set_round_chx: function (panel, now_params) {
		var self = this;
		var x = 150;
		if (this.round_chx) {
			var chx_dex = 1;
			var select_idx = 1;
			var need_reset_init_list_value = true;
			var now_keys = Object.keys(now_params["values"]);
			for (var i in now_keys) {
				if (now_keys[i] == this.init_list[now_params["key"]]) {
					need_reset_init_list_value = false;
				}
			}
			for (var k in now_params["values"]) {
				//判断是否不显示支付选项
				if (now_params["key"] == "pay_mode") {
					if (k != this.init_list[now_params["key"]]) {
						if (this.init_list["p_switch"] == 0) {
							continue;
						}
					}
				}
				//刷新之后的选项可能会导致值不对,所以重置初始值
				if (need_reset_init_list_value) {
					this.init_list[now_params["key"]] = parseInt(k);
					need_reset_init_list_value = false;
				}
				//加按钮
				var chx = this.round_chx.clone();
				chx.setVisible(true);
				chx.hitTest = function (pt) {
					var size = this.getContentSize();
					var bb = cc.rect(-size.width * 0.3, -size.height * 0.3, size.width * 1.7, size.height * 1.5);
					return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
				};
				if (chx_dex < 4) {
					chx.setPositionX(x + (chx_dex - 1) * 250);
				} else {
					chx.setPositionX(x + (chx_dex - 4) * 250);
					chx.setPositionY(-this.height_len);// 总高度的 0.1
				}
				chx.setName(now_params["key"] + "_chx" + chx_dex.toString());
				panel.addChild(chx);
				//加文字
				var label = ccui.Text.create(now_params["values"][k], "zhunyuan", 30);
				label.setAnchorPoint(0, 0.5);
				label.setTextColor(cc.color(255, 255, 255));
				if (chx_dex < 4) {
					label.setPositionX(x + 20 + (chx_dex - 1) * 250);
					label.setPositionY(-3);
				} else {
					label.setPositionX(x + 20 + (chx_dex - 4) * 250);
					label.setPositionY(-this.height_len - 3);
				}
				label.setName(now_params["key"] + "_label" + chx_dex.toString());
				label.setTextAreaSize(cc.size(220, 34))
				panel.addChild(label);
				//改变记忆的选择点
				if (k == this.init_list[now_params["key"]]) {
					select_idx = chx_dex - 1;
				}
				//计数
				chx_dex++;
			}
			//加事件
			this.now_params_list[now_params["key"]] = now_params["values"];
			if (now_params["reset"]) {
				this.is_reset_list[now_params["key"]] = now_params["reset"];
				var add_func = function (i, key) {
					//cc.error(parseInt(Object.keys(self.now_params_list[key])[i]));
					self.init_list[key] = parseInt(Object.keys(self.now_params_list[key])[i]);
					//改模式
					// if(self.now_btn_name == "ps" && key == "pay_mode"){
					// 	if(self.init_list[key]==2){
					// 		cc.log("把动态加入的值设为0");
					// 		self.init_list["halfway_join"]=0;
					// 	}
					// }
					if (self.is_reset_list[key]) {
						self.reset_right_panel();
					}
				};
				UICommonWidget.create_check_box_group_by_reset(panel, now_params["key"] + "_chx", chx_dex - 1, add_func, select_idx, now_params["key"] + "_label", now_params["key"]);
			} else {
				var add_func = function (i, key) {
					self.init_list[key] = parseInt(Object.keys(self.now_params_list[key])[i]);
				};
				UICommonWidget.create_check_box_group_by_nomal(panel, now_params["key"] + "_chx", chx_dex - 1, add_func, select_idx, now_params["key"] + "_label", now_params["key"]);
			}
		}
	},

	set_chx: function (panel, now_params) {
		var self = this;
		var x = 150;
		if (this.chx) {
			var chx_dex = 1;
			var select_idx = 1;
			var select_premise_idx = -1;
			var select_premise_name = "";
			for (var k in now_params["values"]) {
				//加按钮
				var chx = this.chx.clone();
				chx.setVisible(true);
				if (chx_dex < 4) {
					chx.setPositionX(x + (chx_dex - 1) * 250);
				} else if (chx_dex < 7) {
					chx.setPositionX(x + (chx_dex - 4) * 250);
					chx.setPositionY(-this.height_len);// 总高度的 0.1
				} else {
					chx.setPositionX(x + (chx_dex - 7) * 250);
					chx.setPositionY(-this.height_len * 2);// 总高度的 0.1
				}
				chx.setName(now_params["values"][k]["key"] + "_chx");
				panel.addChild(chx);
				//加文字
				var label = ccui.Text.create(now_params["values"][k]["txt"], "zhunyuan", 30);
				label.setAnchorPoint(0, 0.5);
				label.setTextColor(cc.color(255, 255, 255));
				if (chx_dex < 4) {
					label.setPositionX(x + 20 + (chx_dex - 1) * 250);
					label.setPositionY(-3);
				} else if (chx_dex < 7) {
					label.setPositionX(x + 20 + (chx_dex - 4) * 250);
					label.setPositionY(-this.height_len - 3);
				} else {
					label.setPositionX(x + 20 + (chx_dex - 7) * 250);
					label.setPositionY(-this.height_len * 2 - 3);
				}
				label.setTextAreaSize(cc.size(220, 34));
				label.setName(now_params["values"][k]["key"] + "_label");
				panel.addChild(label);
				chx_dex++;
				//改变记忆的选择点
				select_idx = this.init_list[now_params["values"][k]["key"]];
				//是否自动准备
				if (now_params["values"][k]["key"] == "hand_prepare") {
					var right_panel = this.right_panel;
					label.setTextAreaSize(cc.size(200, 34));
					panel.setPositionX(-120);
					panel.setPositionY(right_panel.height * 0.15);
					select_idx = select_idx ? 0 : 1;
				}
				//判断按钮是否为平行线
				//如果是，则该组按钮只能有一个被选中
				if (now_params["parallel"]) {
					this.is_parallel_list[now_params["values"][k]["key"]] = [];
					this.chx_panel_name[now_params["values"][k]["key"]] = now_params["key"] + '_panel';
					for (var j in now_params["values"]) {
						if (now_params["values"][j]["key"] != now_params["values"][k]["key"]) {
							this.is_parallel_list[now_params["values"][k]["key"]].push(now_params["values"][j]["key"]);
						}
					}
				}
				//判断按钮是否为前提关系
				if (now_params["premise"] && now_params["values"][k]["premise"] && now_params["values"][k]["premise"] === 1) {
					select_premise_idx = select_idx;
					select_premise_name = now_params["values"][k]["key"];
					this.is_premise_list[now_params["values"][k]["key"]] = [];
					this.chx_panel_name[now_params["values"][k]["key"]] = now_params["key"] + '_panel';
					for (var j in now_params["values"]) {
						if (now_params["values"][j]["premise"] && now_params["values"][j]["premise"] === 2) {
							this.is_premise_list[now_params["values"][k]["key"]].push(now_params["values"][j]["key"]);
						}
					}
				}
				//加事件
				this.now_params_list[now_params["values"][k]["key"]] = now_params["values"][k]["val"];
				var sel_func = function (i, key) {
					if (i) {
						self.init_list[key] = parseInt(self.now_params_list[key][1]);
						//如果存在平行线关系
						if (self.is_parallel_list[key]) {
							if (self.chx_panel_name[key]) {
								var parallel_list = self.is_parallel_list[key];
								var panel = self.right_panel.getChildByName(self.chx_panel_name[key]);
								if (panel) {
									for (var i = 0; i < parallel_list.length; i++) {
										panel.getChildByName(parallel_list[i] + "_chx").setSelected(false);
										panel.getChildByName(parallel_list[i] + "_label").updateDisplayedColor(const_val.ROOM_WORD_NORMAL);
										panel.getChildByName(parallel_list[i] + "_label").is_change_select = true;
										self.init_list[parallel_list[i]] = parseInt(self.now_params_list[parallel_list[i]][0]);
									}
								}
							} else {
								cc.error("找不到该panel");
							}
						}
					} else {
						self.init_list[key] = parseInt(self.now_params_list[key][0]);
					}
					//如果存在前提关系
					if (self.is_premise_list[key] && self.chx_panel_name[key]) {
						var premise_list = self.is_premise_list[key];
						var panel = self.right_panel.getChildByName(self.chx_panel_name[key]);
						if (panel && premise_list) {
							if (i) {
								panel.getChildByName(premise_list[0] + "_chx").setVisible(true);
								panel.getChildByName(premise_list[0] + "_label").setVisible(true);
							} else {
								panel.getChildByName(premise_list[0] + "_chx").setVisible(false);
								panel.getChildByName(premise_list[0] + "_label").setVisible(false);
								panel.getChildByName(premise_list[0] + "_chx").setSelected(false);
								self.init_list[premise_list[0]] = parseInt(self.now_params_list[premise_list[0]][0]);
							}
						}
					}

					if (key == "need_ting") {
						if (i) {
							self.init_list["bao_hu"] = 1;
						} else {
							self.init_list["bao_hu"] = 0;
						}
					}

					//self.reset_right_panel();
				}
				UICommonWidget.create_check_box_single_by_room(panel, now_params["values"][k]["key"] + "_chx", sel_func, select_idx, now_params["values"][k]["key"] + "_label", now_params["values"][k]["key"]);
			}
			if (select_premise_idx != -1) {
				//如果存在前提关系
				if (self.is_premise_list[select_premise_name] && self.chx_panel_name[select_premise_name]) {
					var premise_list = self.is_premise_list[select_premise_name];
					var panel = self.right_panel.getChildByName(self.chx_panel_name[select_premise_name]);
					if (panel && premise_list) {
						if (select_premise_idx) {
							panel.getChildByName(premise_list[0] + "_chx").setVisible(true);
							panel.getChildByName(premise_list[0] + "_label").setVisible(true);
						} else {
							panel.getChildByName(premise_list[0] + "_chx").setVisible(false);
							panel.getChildByName(premise_list[0] + "_label").setVisible(false);
							panel.getChildByName(premise_list[0] + "_chx").setSelected(false);
							self.init_list[premise_list[0]] = parseInt(self.now_params_list[premise_list[0]][0]);
						}
					}
				}
			}
		}
	},

	set_btn_ui: function () {
		var self = this;
		var create_btn = ccui.Button.create();
		create_btn.loadTextureNormal("res/ui/Default/ok_btn.png");
		this.createroom_panel.getChildByName("white_bg").addChild(create_btn);
		create_btn.setPosition(700, 95);
		create_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.set_create_room_func();
				self.hide();
				cutil.lock_ui();
			}
		});
	},

	set_tip_label: function () {
		//最底部的提示信息
		var label = ccui.Text.create("注：房卡在开始游戏后扣除，提前解散房间不扣房卡", "zhunyuan", 25);
		label.setAnchorPoint(0, 0.5);
		label.setTextColor(const_val.ROOM_WORD_NORMAL);
		label.setPosition(50, 30);
		label.setName("tip_label");
		this.createroom_panel.getChildByName("white_bg").addChild(label);
	},

	set_hand_prepare_chx: function () {
		var self = this;
		var x = 150;
		var key_name = "hand_prepare";
		//加了这个后就有颜色了
		var panel = new cc.Layer();
		panel.setName(key_name + "_panel");
		panel.setContentSize(cc.size(500, 50));
		this.createroom_panel.getChildByName("white_bg").addChild(panel);
		panel.setPosition(-50, 80)
		if (this.chx) {
			var chx_dex = 1;
			var select_idx = this.init_list[key_name];
			select_idx = select_idx ? 0 : 1;
			//加按钮
			var chx = this.chx.clone();
			chx.setVisible(true);
			chx.setPositionX(x + (chx_dex - 1) * 250);
			chx.setName(key_name + "_chx");
			panel.addChild(chx);
			//加文字
			var label = ccui.Text.create("手动准备开局", "zhunyuan", 30);
			label.setAnchorPoint(0, 0.5);
			label.setTextColor(cc.color(255, 255, 255));
			label.setPositionX(x + 20 + (chx_dex - 1) * 250);
			label.setPositionY(-3);
			label.setTextAreaSize(cc.size(220, 34));
			label.setName(key_name + "_label");
			panel.addChild(label);
			//加事件
			this.now_params_list[key_name] = [1, 0];
			var sel_func = function (i, key) {
				if (i) {
					self.init_list[key] = parseInt(self.now_params_list[key][1]);
				} else {
					self.init_list[key] = parseInt(self.now_params_list[key][0]);
				}
			}
			UICommonWidget.create_check_box_single_by_room(panel, key_name + "_chx", sel_func, select_idx, key_name + "_label", key_name);
		}
	},

	set_touch_enable: function (panel) {
		return;
	},

	reset_right_panel: function () {
		if (this.right_panel) {
			this.right_panel.removeFromParent();
		}
		var right_panel = new cc.Layer();
		right_panel.setContentSize(cc.size(this.right_scroll.width, this.right_scroll.height));
		right_panel.setName("right_panel");
		this.right_scroll.addChild(right_panel);
		// right_panel.setPosition(self.rootUINode.width - right_panel.width > 100 ? 100 : 0, self.rootUINode.height - right_panel.height);
		this.right_panel = right_panel;

		this.is_reset_list = [];
		this.is_parallel_list = [];
		this.is_premise_list = [];
		this.chx_panel_name = [];
		this.update_now_panel();
	},

	set_create_room_func: function () {
		//要记录当前选择的按钮
		var default_btn_json = '{"now_create_game_name":"' + this.use_list["name"] + '"}';
		cc.sys.localStorage.setItem("CREATE_BTN_JSON", default_btn_json);
		//记录数据
		var default_info_json = JSON.stringify(this.init_list);
		cc.sys.localStorage.setItem(this.use_list["game_type"] + "_CREATE_INFO_JSON", default_info_json);
		//创建房间
		h1global.player().createRoom(this.init_list, this.use_list["game_type"]);
	},

	initCreateInfo: function () {
		//cc.sys.localStorage.clear();
		var default_info_json = '{"now_create_game_name":"ddz"}';
		var info_json = cc.sys.localStorage.getItem("CREATE_BTN_JSON");
		if (!info_json) {
			cc.sys.localStorage.setItem("CREATE_BTN_JSON", default_info_json);
			info_json = cc.sys.localStorage.getItem("CREATE_BTN_JSON");
		}
		var info_dict = eval("(" + info_json + ")");
		cc.log(info_dict);
		this.now_btn_name = info_dict["now_create_game_name"];

		cc.log(this.now_btn_name);
	},

	init_left_btn2: function () {
		var self = this;

		function update_item_func(itemPanel, itemData, index) {
			if(self.is_normal_show){
				itemPanel.getChildByName("ruler_btn").loadTextureNormal("res/ui/Default/" + itemData + "_btn_normal.png");
				itemPanel.getChildByName("ruler_btn").loadTextureDisabled("res/ui/Default/" + itemData + "_btn_select.png");
			}else{
				itemPanel.getChildByName("ruler_btn").getChildByName("label0").setString(const_val.GameType2CName[itemData]);
				itemPanel.getChildByName("ruler_btn").getChildByName("label1").setString(const_val.GameType2CName[itemData]);
			}
		}

		var info_panel = this.createroom_panel.getChildByName("info_panel");
		info_panel.setScrollBarEnabled(false);
		this.name_list = [];
		var sort_list = []
		for (var k in table_create_params) {
			if (table_create_params[k]["is_show"]) {
				sort_list.push([table_create_params[k]["name"], table_create_params[k]["create_sort"]]);
			}
		}
		sort_list.sort(function (a, b) {
			return a[1] - b[1]
		});
		this.get_name_list(sort_list);
		cc.log(this.name_list);

		UICommonWidget.update_scroll_items(info_panel, this.name_list, update_item_func)

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
							if(!self.is_normal_show){
								self.left_btn_list[choose_num].getChildByName("label0").setVisible(false);
								self.left_btn_list[choose_num].getChildByName("label1").setVisible(true);
							}
							cc.log(self.name_list[choose_num]);
							for (var k in table_create_params) {
								if (table_create_params[k]["name"] == self.name_list[choose_num]) {
									//得到当前选择的场景
									self.use_list = table_create_params[k];
									//得到当前选择场景的数据
									var info_json = cc.sys.localStorage.getItem(self.use_list["game_type"] + "_CREATE_INFO_JSON");
									if (!info_json) {
										var default_info_json = JSON.stringify(self.use_list["init"]);
										cc.sys.localStorage.setItem(self.use_list["game_type"] + "_CREATE_INFO_JSON", default_info_json);
										info_json = cc.sys.localStorage.getItem(self.use_list["game_type"] + "_CREATE_INFO_JSON");
									}
									self.init_list = eval("(" + info_json + ")");
									self.update_init_list();
									cc.log(self.init_list);
									self.reset_right_panel();
								}
							}
						} else {
							self.left_btn_list[j].setTouchEnabled(true);
							self.left_btn_list[j].setBright(true);
							if(!self.is_normal_show){
								self.left_btn_list[j].getChildByName("label0").setVisible(true);
								self.left_btn_list[j].getChildByName("label1").setVisible(false);
							}
						}
					}
				}
			});
		}

	},

	update_init_list: function () {
		this.init_list["room_type"] = const_val.NORMAL_ROOM;
		this.check_init_list();
	},

	init_now_btn2: function (again) {
		var self = this;
		cc.log(this.now_btn_name);
		var is_true = false
		for (var i = 0; i < this.name_list.length; i++) {
			if (this.name_list[i] === this.now_btn_name) {
				self.left_btn_list[i].setTouchEnabled(false);
				self.left_btn_list[i].setBright(false);
				if(!self.is_normal_show){
					self.left_btn_list[i].getChildByName("label0").setVisible(false);
					self.left_btn_list[i].getChildByName("label1").setVisible(true);
				}
				//滚动到当前按钮的位置
				var info_panel = this.createroom_panel.getChildByName("info_panel");
				info_panel.jumpToPercentVertical((info_panel.height - self.left_btn_list[i].getParent().getPositionY()) / info_panel.height * 100);

				for (var k in table_create_params) {
					if (table_create_params[k]["name"] == self.name_list[i]) {
						//得到当前选择的场景
						self.use_list = table_create_params[k];
						if (!self.is_club()) {
							//得到当前选择场景的数据
							var info_json = cc.sys.localStorage.getItem(self.use_list["game_type"] + "_CREATE_INFO_JSON");
							if (!info_json) {
								var default_info_json = JSON.stringify(self.use_list["init"]);
								cc.sys.localStorage.setItem(self.use_list["game_type"] + "_CREATE_INFO_JSON", default_info_json);
								info_json = cc.sys.localStorage.getItem(self.use_list["game_type"] + "_CREATE_INFO_JSON");
							}
							self.init_list = eval("(" + info_json + ")");
						}
						self.update_init_list();
						cc.log(self.init_list);
						self.reset_right_panel();
					}
				}
				is_true = true;
			} else {
				if(!self.is_normal_show){
					self.left_btn_list[i].getChildByName("label0").setVisible(true);
					self.left_btn_list[i].getChildByName("label1").setVisible(false);
				}
			}
		}
		return is_true;
	},

	is_club: function () {
		return false;
	},

	check_init_list: function () {
		//在这里核对初始数据是否异常
		for (var k in this.use_list.init) {
			if (!this.init_list.hasOwnProperty(k)) {
				this.init_list[k] = this.use_list.init[k];
			}
		}
	},

	get_name_list: function (sort_list) {
		for (var i = 0; i < sort_list.length; i++) {
			this.name_list.push(sort_list[i][0]);
		}
	},
});