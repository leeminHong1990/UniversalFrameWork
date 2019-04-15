var HelpUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/HelpUI.json";
        this.setLocalZOrder(const_val.HelpUIZOrder);
    },

    show_by_info:function (info_dict) {
        this.info_dict = info_dict;
        cc.log(info_dict)
        this.show();
    },

    initUI: function () {
        var self = this;
        this.main_panel = this.rootUINode.getChildByName("main_panel");
        this.main_panel.getChildByName("right_bg").setPositionY(this.main_panel.getChildByName("top_bg").getPositionY()-this.main_panel.getChildByName("top_bg").height + 10);
        this.main_panel.getChildByName("left_panel").setPositionY(this.main_panel.getChildByName("top_bg").getPositionY()-this.main_panel.getChildByName("top_bg").height + 10);

        var help_panel = this.rootUINode.getChildByName("help_panel");

        var close_btn = help_panel.getChildByName("close_btn");

        var room_mode_btn = this.main_panel.getChildByName("left_panel").getChildByName("info_panel").getChildByName("game_mode_btn");
        var gxmj_btn = this.main_panel.getChildByName("left_panel").getChildByName("info_panel").getChildByName("ruler_btn");
        room_mode_btn.setTouchEnabled(false);
        room_mode_btn.setBright(false);
        gxmj_btn.setTouchEnabled(true);
        gxmj_btn.setBright(true);

        var room_mode_panel = help_panel.getChildByName("room_mode_panel");
        var gamename_panel = help_panel.getChildByName("gamename_panel");
        room_mode_panel.setVisible(true);
        cc.log(room_mode_panel.getPosition());

        gamename_panel.setVisible(false);


        if(this.info_dict) {
            // this.now_panel = eval("h1global.curUIMgr." + this.info_dict["game_name"]+"help_ui");
            // this.now_panel.show_by_info(this.info_dict);
            // room_mode_panel = this.now_panel;

            this.init_mode_panel(room_mode_panel);

            //加载当前的玩法
            this.intro_scroll=gamename_panel.getChildByName("intro_scroll");

            var res = ["res/ui/HelpUI/"+this.info_dict["game_name"]+"_intro_img.png"];
            var testTarget = {
                intro_scroll : this.intro_scroll,
                game_name : this.info_dict["game_name"],
                trigger : function(){
	                if (!cc.sys.isObjectValid(this.intro_scroll)) {
		                return;
	                }
                    let intro_img =this.intro_scroll.getChildByName("intro_img");
                    intro_img.loadTexture("res/ui/HelpUI/"+this.game_name+"_intro_img.png");
                    intro_img.ignoreContentAdaptWithSize(true);
                    this.intro_scroll.setInnerContainerSize(intro_img.getContentSize());
                    this.intro_scroll.jumpToTop();
                },
                cb : function(err){cc.log("cb");}
            };
            var option = {
                trigger : testTarget.trigger,
                triggerTarget : testTarget,
                cbTarget : testTarget
            }

            cc.loader.load(res, option, function(err){
                if(err) return cc.log("load failed");
            });

        }else {
            this.gamehall_show();
        }

        close_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide();
                if(self.now_panel && self.now_panel.is_show){
                    self.now_panel.hide();
                }
            }
        });

        room_mode_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                room_mode_btn.setTouchEnabled(false);
                room_mode_btn.setBright(false);
                gxmj_btn.setTouchEnabled(true);
                gxmj_btn.setBright(true);
                gamename_panel.setVisible(false);
                room_mode_panel.setVisible(true);
            }
        });

        gxmj_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                gxmj_btn.setTouchEnabled(false);
                gxmj_btn.setBright(false);
                room_mode_btn.setTouchEnabled(true);
                room_mode_btn.setBright(true);
                room_mode_panel.setVisible(false);
                gamename_panel.setVisible(true);
            }
        });
    },


    gamehall_show:function () {
        var help_panel = this.rootUINode.getChildByName("help_panel");
        var room_mode_btn = help_panel.getChildByName("room_mode_btn");
        var gxmj_btn = help_panel.getChildByName("gxmj_btn");
        var line_img = help_panel.getChildByName("line_img");
        room_mode_btn.setVisible(false);
        line_img.setVisible(false);
        gxmj_btn.setTouchEnabled(false);
        gxmj_btn.setBright(false);
        gxmj_btn.setPositionY(gxmj_btn.getPositionY() + 100);

        var room_mode_panel = help_panel.getChildByName("room_mode_panel");
        var gamename_panel = help_panel.getChildByName("gamename_panel");
        room_mode_panel.setVisible(false);
        gamename_panel.setVisible(true);
    },

    init_mode_panel:function(right_panel){
        if(!this.info_dict["game_name"] || !this.info_dict["room_type"]){
            h1global.globalUIMgr.info_ui.show_by_info("帮助信息请传入 游戏名称 和 房间类型");
            return;
        }

        this.chx = ccui.CheckBox.create();
        this.chx.loadTextures(
            "res/ui/Default/chx_bg.png",
            "res/ui/Default/chx_bg.png",
            "res/ui/Default/chx_select.png",
            "res/ui/Default/chx_bg.png",
            "res/ui/Default/chx_unselect.png"
        );
        //初始化按钮的状态
        this.chx.setSelected(true);
        this.chx.setBright(false);
        this.chx.setTouchEnabled(false);

        this.rootUINode.addChild(this.chx);
        this.chx.setVisible(false);
        //this.chx.setBright(true);

        //room_mode_panel.addChild(this.chx);

        var use_list = [];
        for(var k in table_create_params){
            if(table_create_params[k]["name"]==this.info_dict["game_name"]){
                use_list = table_create_params[k];
            }
        }
        if(!use_list){
            cc.log("出错拉，找不到该房间的配置");
            return;
        }
        var create_list = use_list["create"];
        //获得当前需要绘制的场景
        var need_break =0;
        while(1){
            for(var k in this.info_dict){
                if(k == Object.keys(create_list)[0]){
                    create_list = create_list[k][this.info_dict[k]];
                }
            }

            need_break++;
            if(typeof create_list[0] == 'number' || need_break>20){ //可以在这里加一个防错限制 以防无限loop
                break;
            }
            // if(Object.keys(create_list)[0] == '0' || Object.keys(create_list)[0] == 0 || need_break>20){ //可以在这里加一个防错限制 以防无限loop
            //     if(need_break>20){
            //         cc.log("清缓存再试试");
            //     }
            //     break;
            // }
        }
        cc.log(create_list);
        var self = this;
        var h_size =0;
        for(var i =0; i<create_list.length;i++) {
            if (table_params[create_list[i]]) {          // 用for挨个 绘制每一条的按钮和文字
                var now_params = table_params[create_list[i]];
                if (now_params["key"]&&now_params["key"]== "prepare") {
                    continue;
                }
                if (now_params["key"]&&now_params["key"]== "cost") {
                    continue;
                }
                // 创建panel
                var panel = new cc.Layer();
                panel.setName(now_params["key"] + "_panel");
                panel.setContentSize(cc.size(1280, 50));
                panel.setPositionY(right_panel.height * 0.95 - h_size * 60)
                right_panel.addChild(panel);

                //添加标题
                var title = new cc.LabelTTF(now_params["title"], "zhunyuan", 30);
                //ccui.LabelBMFont
                title.setPositionX(panel.width * 0.1);
                title.setColor(const_val.ROOM_WORD_NORMAL);
                panel.addChild(title);
                //如果该层是两行的 h_size多+1
                now_params["h_size"] && now_params["h_size"] == 2 && h_size++;
                now_params["h_size"] && now_params["h_size"] == 3 && h_size++ && h_size++;
                //添加按钮和标题
                switch (+now_params["type"]) {
                    case 0://创建按钮
                        break;
                    case 1://多选
                        if (this.chx) {
                            var chx_dex = 1;
                            var select_idx = 1;
                            for (var k in now_params["values"]) {
                                //加按钮
                                var chx = this.chx.clone();
                                chx.setVisible(true);
                                if (chx_dex < 4) {
                                    chx.setPositionX(panel.width * (0.20 +(chx_dex - 1) * 0.18));
                                } else {
                                    chx.setPositionX(panel.width * (0.20 +(chx_dex - 4) * 0.18));
                                    chx.setPositionY(-60);// 总高度的 0.1
                                }
                                chx.setName(now_params["key"] + "_chx" + chx_dex.toString());
                                panel.addChild(chx);
                                //加文字
                                var label = ccui.Text.create(now_params["values"][k], "zhunyuan", 30);
                                label.setAnchorPoint(0, 0.5);
                                if (chx_dex < 4) {
                                    label.setPositionX(panel.width * (0.22 + (chx_dex - 1) * 0.18));
                                } else {
                                    label.setPositionX(panel.width * (0.22 + (chx_dex - 4) * 0.18));
                                    label.setPositionY(-60);
                                }
                                label.setName(now_params["key"] + "_label" + chx_dex.toString());
                                panel.addChild(label);

                                //改变记忆的选择点
                                if (k == this.info_dict[now_params["key"]]) {
                                    select_idx = chx_dex - 1;
                                    chx.setSelected(true);
                                    chx.setBright(true);
                                    chx.setTouchEnabled(false);
									label.setTextColor(const_val.ROOM_WORD_SELECT);
                                }else{
                                    chx.setSelected(true);
                                    chx.setBright(false);
                                    chx.setTouchEnabled(false);
									label.setTextColor(const_val.ROOM_WORD_NORMAL);
                                }
                                //计数
                                chx_dex++;
                            }
                        }
                        break;
                    case 2://单选
                        if (this.chx) {
                            var chx_dex = 1;
                            var select_idx = 1;
                            for (var k in now_params["values"]) {
                                //加按钮
                                var chx = this.chx.clone();
                                chx.setVisible(true);
                                if (chx_dex < 4) {
                                    chx.setPositionX(panel.width * (0.20 +(chx_dex - 1) * 0.18));
                                } else if (chx_dex < 7) {
                                    chx.setPositionX(panel.width * (0.20 +(chx_dex - 4) * 0.18));
                                    chx.setPositionY(-60);// 总高度的 0.1
                                } else {
                                    chx.setPositionX(panel.width * (0.20 +(chx_dex - 7) * 0.18));
                                    chx.setPositionY(-120);// 总高度的 0.1
                                }
                                chx.setName(now_params["values"][k]["key"] + "_chx");
                                panel.addChild(chx);
                                //加文字
                                var label = ccui.Text.create(now_params["values"][k]["txt"], "zhunyuan", 30);
                                label.setAnchorPoint(0, 0.5);
                                if (chx_dex < 4) {
                                    label.setPositionX(panel.width * (0.22 + (chx_dex - 1) * 0.18));
                                } else if (chx_dex < 7) {
                                    label.setPositionX(panel.width * (0.22 + (chx_dex - 4) * 0.18));
                                    label.setPositionY(-60);
                                } else {
                                    label.setPositionX(panel.width * (0.22 + (chx_dex - 7) * 0.18));
                                    label.setPositionY(-120);
                                }
                                label.setName(now_params["values"][k]["key"] + "_label");
                                panel.addChild(label);
                                chx_dex++;
                                //判断按钮是否变灰
                                // if (now_params["values"][k]["state"] == 1) {
                                //     chx.setSelected(false);
                                //     chx.setTouchEnabled(false);
                                //     label.setTouchEnabled(false);
                                //     label.setBright(false);
                                //     chx.setOpacity(125);
                                //     label.setOpacity(125);
                                //     this.info_dict[now_params["values"][k]["key"]] = 0;
                                // }
                                //改变记忆的选择点
                                select_idx = this.info_dict[now_params["values"][k]["key"]];
                                if(select_idx == 0){
                                    chx.setSelected(true);
                                    chx.setBright(false);
                                    chx.setTouchEnabled(false);
									label.setTextColor(const_val.ROOM_WORD_NORMAL);
								}else{
                                    chx.setSelected(true);
                                    chx.setBright(true);
                                    chx.setTouchEnabled(false);
									label.setTextColor(const_val.ROOM_WORD_SELECT);
								}
                            }
                        }
                        break;
	                case 5://单选
		                if (this.chx) {
			                var chx_dex = 1;
                            //加按钮
                            var chx = this.chx.clone();
                            chx.setVisible(true);
                            chx.setPositionX(panel.width * (0.20 +(chx_dex - 1) * 0.18));
                            panel.addChild(chx);
                            //加文字
                            var base_score = this.info_dict[now_params["key"]] ? this.info_dict[now_params["key"]] : 1
                            var label = ccui.Text.create(base_score + "倍", "zhunyuan", 30);
                            label.setAnchorPoint(0, 0.5);
                            label.setTextColor(const_val.ROOM_WORD_SELECT);
                            label.setPositionX(panel.width * (0.22 + (chx_dex - 1) * 0.18));
                            panel.addChild(label);
			                chx.setSelected(true);
			                chx.setBright(true);
			                chx.setTouchEnabled(false);
						}
                        break;
                    default:
                        break;
                }
                h_size++; //成功渲染一次 高度就+1
            }
        }
    },
});