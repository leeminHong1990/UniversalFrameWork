"use strict"
var GameHallUI = UIBase.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/GameHallUI.json";
    },
    initUI:function(){
        var bg_img = ccui.helper.seekWidgetByName(this.rootUINode, "bg_img");
        var bg_img_content_size = bg_img.getContentSize();
        var scale = cc.winSize.width/bg_img_content_size.width;
        if (cc.winSize.height/bg_img_content_size.height > scale){
            scale = cc.winSize.height/bg_img_content_size.height;
        }
        bg_img.setScale(scale);
        // this.init_character_anim();
        this.init_card_panel();
        this.init_character_panel();
        this.init_left_bottom_panel();
        this.init_left_panel();
        this.init_right_panel();
        this.init_character_anim();
    },

    init_card_panel:function () {
        var character_panel = this.rootUINode.getChildByName("character_panel");
        var roomcard_label = character_panel.getChildByName("card_label");
        roomcard_label.setString("— —");
    },

    init_character_anim:function () {
        var character_panel = this.rootUINode.getChildByName("character_panel");
        var btn_panel = character_panel.getChildByName("btn_panel");
        // btn_panel.setVisible(false);

        var npc = ccs.load("res/ui/GameHallNPC.json");   //加载CocosStudio导出的Json文件
        var node = npc.node;
        var action = npc.action; // 动作
        action.gotoFrameAndPlay(0,action.getDuration(),0,true);
        node.runAction(action); // 播放动作
        this.rootUINode.addChild(node);  //将UI输出到画布
        //node.setOrderOfArrival(this.rootUINode.getChildByName("character_panel").getOrderOfArrival()+1);
        // node.arrivalOrder = this.rootUINode.getChildByName("character_panel").arrivalOrder+1;
        this.rootUINode.getChildByName("bottom_panel").setLocalZOrder(node.getLocalZOrder()+1);
        var load_action = ccs.load(this.resourceFilename).action


        var shop_btn = ccs.load("res/ui/GameHallShopBtn.json");   //加载CocosStudio导出的Json文件
        var shop_btn_node = shop_btn.node;
        var shop_btn_action = shop_btn.action; // 动作
        shop_btn_action.gotoFrameAndPlay(0,shop_btn_action.getDuration(),0,true);
        shop_btn_node.runAction(shop_btn_action); // 播放动作
        btn_panel.addChild(shop_btn_node);  //将UI输出到画布
        shop_btn_node.setPosition(btn_panel.getChildByName("shop_btn").getPosition());
        btn_panel.getChildByName("shop_btn").setVisible(false);
        shop_btn_node.getChildByName("shop_btn").addTouchEventListener(function(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
				cutil.lock_ui();
				cutil.get_shop_list();
            }
        });

        var activity_btn = ccs.load("res/ui/GameHallActivityBtn.json");   //加载CocosStudio导出的Json文件
        var activity_node = activity_btn.node;
        var activity_action = activity_btn.action; // 动作
        activity_action.gotoFrameAndPlay(0,activity_action.getDuration(),0,true);
        activity_node.runAction(activity_action); // 播放动作

        // this.rootUINode.addChild(activity_node);  //将UI输出到画布
        // activity_node.setPosition(node.getChildByName("renwu_1").getPositionX()+145.53,node.getChildByName("renwu_1").getPositionY()+56.28);

        btn_panel.addChild(activity_node);  //将UI输出到画布
        activity_node.setPosition(btn_panel.getChildByName("activity_btn").getPosition());
        btn_panel.getChildByName("activity_btn").setVisible(false);

        activity_node.getChildByName("activity_btn").addTouchEventListener(function(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                //var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                var bind_xhr = cc.loader.getXMLHttpRequest();
                cc.log(cutil.appendUrlParam(switches.PHP_SERVER_URL + "/activities", []));
                // bind_xhr.open("GET", cutil.appendUrlParam(switches.PHP_SERVER_URL + "/activities", ['phone', phone_num]), true);
                bind_xhr.open("GET", cutil.appendUrlParam(switches.PHP_SERVER_URL + "/activities", []), true);
                bind_xhr.onreadystatechange = function(){
                    cutil.unlock_ui();
                    if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
                        var result = JSON.parse(bind_xhr.responseText);
                        h1global.curUIMgr.activity_ui.show_by_info(result);
                    }else{
                        h1global.globalUIMgr.info_ui.show_by_info("获取活动信息失败，请重试");
                        return;
                    }
                };
                // bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
                bind_xhr.send();
                cutil.lock_ui();
            }
        });

        //顶部的抽奖和新手礼包的小动画

        var lottery_btn = ccs.load("res/ui/GameHallLotteryBtn.json");   //加载CocosStudio导出的Json文件
        var lottery_btn_node = lottery_btn.node;
        var lottery_btn_action = lottery_btn.action; // 动作
        lottery_btn_action.gotoFrameAndPlay(0,lottery_btn_action.getDuration(),0,true);
        lottery_btn_node.runAction(lottery_btn_action); // 播放动作
        btn_panel.addChild(lottery_btn_node);  //将UI输出到画布
        lottery_btn_node.setPosition(btn_panel.getChildByName("lottery_btn").getPosition());
        btn_panel.getChildByName("lottery_btn").setVisible(false);
        lottery_btn_node.getChildByName("lottery_btn").addTouchEventListener(function(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                h1global.globalUIMgr.info_ui.show_by_info("敬请期待！");                //弹窗
                return;
            }
        });
        //商城按钮动画
        var shop_btn = ccs.load("res/ui/GameHallShopBtn.json");   //加载CocosStudio导出的Json文件
        var shop_btn_node = shop_btn.node;
        var shop_btn_action = shop_btn.action; // 动作
        shop_btn_action.gotoFrameAndPlay(0,shop_btn_action.getDuration(),0,true);
        shop_btn_node.runAction(shop_btn_action); // 播放动作
        btn_panel.addChild(shop_btn_node);  //将UI输出到画布
        shop_btn_node.setPosition(btn_panel.getChildByName("shop_btn").getPosition());
        btn_panel.getChildByName("shop_btn").setVisible(false);
        shop_btn_node.getChildByName("shop_btn").addTouchEventListener(function(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
				cutil.lock_ui();
				cutil.get_shop_list();
            }
        });

        //兑换商城按钮
        btn_panel.getChildByName("convertShop_btn").addTouchEventListener(function(sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                h1global.globalUIMgr.info_ui.show_by_info("敬请期待！");                //弹窗
                return;
            }
        });

        btn_panel.getChildByName("gift_btn").setVisible(false);
        // // 如果 info_dict 里边 有标记 则登陆的时候不再加载 新手礼包这个动画效果
        // var mark_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        // btn_panel.getChildByName("gift_btn").setVisible(false);
        // var remark_dict = null;
        // if(mark_dict["remark"]){
        //     var str = Base64.decode(mark_dict["remark"]);
        //     remark_dict = JSON.parse(str);
        //     cc.log(str);
        //     cc.log(remark_dict);
        // }
		//
        // if(remark_dict && remark_dict["buy_gift"] && remark_dict["buy_gift"] == 1){
        //     cc.log("符合不出现首充礼包的条件");
        // }else{
        //     var novice_btn = ccs.load("res/ui/GameHallNoviceBtn.json");   //加载CocosStudio导出的Json文件
        //     var novice_node = novice_btn.node;
        //     var novice_action = novice_btn.action; // 动作
        //     novice_action.gotoFrameAndPlay(0,novice_action.getDuration(),0,true);
        //     novice_node.runAction(novice_action); // 播放动作
        //     novice_node.setName("novice_node");
        //     btn_panel.addChild(novice_node);  //将UI输出到画布
        //     novice_node.setPosition(btn_panel.getChildByName("gift_btn").getPosition());
        //     novice_node.getChildByName("gift_btn").addTouchEventListener(function(sender, eventType) {
        //         if (eventType == ccui.Widget.TOUCH_ENDED) {
        //             h1global.curUIMgr.novicegift_ui.show();
        //         }
        //     });
        //     novice_node.setPositionX(btn_panel.getChildByName("lottery_btn").getPositionX());
        // }
		//
        // load_action.gotoFrameAndPlay(0, load_action.getDuration() , 0, true);
        // this.rootUINode.runAction(load_action)

        // 任务按钮因为没有动画 所以直接加载
        btn_panel.getChildByName("share_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                // h1global.curUIMgr.task_ui.show();
				//发送给朋友圈
				if(eventType == ccui.Widget.TOUCH_ENDED) {
				    if (switchesnin1.flag !== undefined && switchesnin1.flag !== null && switchesnin1.flag >= 1) {
					    if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)){
						    jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "shareFreeCard", "()V");
					    } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
						    jsb.reflection.callStaticMethod("WechatOcBridge", "shareFreeCard");
					    } else {
						    cc.log("share not support web switchesnin1.flag");
					    }
                    } else {
					    var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
						var timestamp = Math.round(new Date() / 1000);
					    if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)){
						    jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "shareZQM", "(ZLjava/lang/String;)V", false, switches.PHP_SERVER_URL + "/invite/" + timestamp + "/" + info_dict["user_id"]);
					    } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
						    jsb.reflection.callStaticMethod("WechatOcBridge", "shareZQM:withURL:", false, switches.PHP_SERVER_URL + "/invite/" + timestamp + "/" + info_dict["user_id"]);
					    } else {
						    cc.log("share not support web");
					    }
                    }
				}
            }
        });

        btn_panel.getChildByName("lottery_btn").setVisible(false);
        // btn_panel.getChildByName("gift_btn").setVisible(false);
        // btn_panel.getChildByName("activity_btn").setVisible(false);
        // btn_panel.getChildByName("share_btn").setVisible(false);
        // lottery_btn_node.setPositionX(btn_panel.getChildByName("task_btn").getPositionX());
        // novice_node.setPositionX(btn_panel.getChildByName("lottery_btn").getPositionX());

    },

    init_character_panel:function(){
        var character_panel = ccui.helper.seekWidgetByName(this.rootUINode, "character_panel");
        var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        var name_label = character_panel.getChildByName("name_label");
        name_label.setString(info_dict["nickname"]);
        var id_label = character_panel.getChildByName("id_label");
        id_label.setString("ID:" + info_dict["user_id"]);
        var roomcard_label = character_panel.getChildByName("card_label");
        roomcard_label.setString("— —");
        var frame_img = ccui.helper.seekWidgetByName(character_panel, "frame_img");
        character_panel.reorderChild(frame_img, 1);
        frame_img.addTouchEventListener(function(sender, eventType){
            h1global.curUIMgr.playerinfo_ui.show();
        });
        frame_img.setTouchEnabled(true);
        cutil.loadPortraitTexture(info_dict["headimgurl"], info_dict["sex"], function(img){
            if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                if(h1global.curUIMgr.gamehall_ui.rootUINode.getChildByName("character_panel").getChildByName("portrait_sprite")){
                    h1global.curUIMgr.gamehall_ui.rootUINode.getChildByName("character_panel").getChildByName("portrait_sprite").removeFromParent();
                }
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
                h1global.curUIMgr.gamehall_ui.rootUINode.getChildByName("character_panel").addChild(clipnode);
            }
        });

        function update_card_diamond(){
            cutil.get_user_info("wx_" + info_dict["unionid"], function(content){
                if(content[0] != '{'){
                    return
                }
                if (cc.sys.isObjectValid(roomcard_label)) {
	                var info = eval('(' + content + ')');
	                roomcard_label.setString(info["card"].toString());
	                if(h1global.player()){
						h1global.player().card_num = info["card"];
                    }
                }
            });
        }

        update_card_diamond();

        //商城
        character_panel.getChildByName("buy_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                // if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
				cutil.lock_ui();
				cutil.get_shop_list();
                // } else {
                //     h1global.curUIMgr.publicnum_ui.show_by_info("请访问微信公众号搜索\r\n【" + switchesnin1.gzh_name + "】进行充值\r\n或扫以下二维码直接进入公众号进行充值");
                // }
            }
        });

        // var btn_panel = character_panel.getChildByName("btn_panel");
        //
        // // btn_panel.getChildByName("lottery_btn").setVisible(false);
        // // btn_panel.getChildByName("gift_btn").setVisible(false);
        //
        // btn_panel.getChildByName("lottery_btn").addTouchEventListener(function(sender, eventType) {
        //     if (eventType == ccui.Widget.TOUCH_ENDED) {
        //         h1global.curUIMgr.lottery_ui.show();
        //     }
        // });
        // btn_panel.getChildByName("gift_btn").addTouchEventListener(function(sender, eventType) {
        //     if (eventType == ccui.Widget.TOUCH_ENDED) {
        //         cc.log("新手礼包界面 is show")
        //         // h1global.curUIMgr.lottery_ui.show();
        //         h1global.curUIMgr.novicegift_ui.show();
        //     }
        // });
    },

    update_authenticate_btn:function(){
        var character_panel = this.rootUINode.getChildByName("left_panel");
        //认证
        if(!h1global.player()){
            cc.error("player is null");
            return;
        }
        character_panel.getChildByName("authenticate_btn").setVisible(true);
        var mark_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        if(mark_dict["remark"]){
            var str = Base64.decode(mark_dict["remark"]);
            var remark_dict = JSON.parse(str);
            if(remark_dict["identity"] && mark_dict["phone"] && mark_dict["phone"].toString().length==11){
                // if(h1global.curUIMgr.authentucate_ui && h1global.curUIMgr.authentucate_ui.is_show){
                //     h1global.curUIMgr.authentucate_ui.hide();
                // }
                // this.init_panel.getChildByName("identification_btn").getChildByName("get_check_img").setVisible(true);
                // this.init_panel.getChildByName("identification_btn").setTouchEnabled(false);
                character_panel.getChildByName("authenticate_btn").setVisible(false);
            }
        }
        // if(mark_dict["remark"]!==null && mark_dict["phone"] && mark_dict["phone"].toString().length==11){
        //     character_panel.getChildByName("authenticate_btn").setVisible(false);
        // }else{
        //     character_panel.getChildByName("authenticate_btn").setVisible(true);
        // }
    },



    remove_gift_btn:function(){
        //移除gift 按钮
        var character_panel = this.rootUINode.getChildByName("character_panel").getChildByName("btn_panel");
        if(character_panel.getChildByName("novice_node")){
            character_panel.getChildByName("novice_node").removeFromParent();
        }
    },

    updateCharacterCard: function () {
        if(!this.is_show){return;}
        var character_panel = ccui.helper.seekWidgetByName(this.rootUINode, "character_panel");
        var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        var name_label = character_panel.getChildByName("name_label");
        name_label.setString(info_dict["nickname"]);
        var id_label = character_panel.getChildByName("id_label");
        id_label.setString("ID:" + info_dict["user_id"]);
        var roomcard_label = character_panel.getChildByName("card_label");
        var frame_img = ccui.helper.seekWidgetByName(character_panel, "frame_img");
        character_panel.reorderChild(frame_img, 1);

        function update_card_diamond(){
            cutil.get_user_info("wx_" + info_dict["unionid"],

                function(content){
                    if(content[0] !== '{'){
                        return
                    }
                    var info = null;
	                if (cc.sys.isObjectValid(roomcard_label)) {
		                info = eval('(' + content + ')');
		                roomcard_label.setString(info["card"].toString());
	                }
					if(h1global.player() && info ){
						h1global.player().card_num = info["card"];
					}
                });
        }

        update_card_diamond();
    },

    update_roomcard:function(cards){
        var character_panel = ccui.helper.seekWidgetByName(this.rootUINode, "character_panel");
        var roomcard_label = character_panel.getChildByName("card_label");
        roomcard_label.setString(cards);
    },

    init_left_bottom_panel:function(){
        var left_bottom_panel = this.rootUINode.getChildByName("left_bottom_panel");
        //战绩
        left_bottom_panel.getChildByName("record_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                h1global.curUIMgr.record_ui.show();
            }
        });

    },

    init_left_panel:function () {
        var left_panel = this.rootUINode.getChildByName("left_panel");
        //邀请有礼
        left_panel.getChildByName("code_btn").addTouchEventListener(function(sender, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED){
                h1global.curUIMgr.gamehallshare_ui.show_by_info(1);
            }
        });
        //绑邀请码
        left_panel.getChildByName("bind_btn").addTouchEventListener(function(sender, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED){
                h1global.curUIMgr.gamehallshare_ui.show_by_info(2);
            }
        });

        if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
            left_panel.setVisible(false);
        }
        //认证
        this.update_authenticate_btn();

        left_panel.getChildByName("authenticate_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                h1global.curUIMgr.authentucate_ui.show();
            }
        });
    },

    init_right_panel:function(){
        var right_panel = this.rootUINode.getChildByName("right_panel");


        // var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');

        // 创建房间
        right_panel.getChildByName("create_btn").addTouchEventListener(function(sender, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED){
                h1global.curUIMgr.createroom_ui.show();
                let player = h1global.player();
                if (player) {
                    player.upLocationInfo();
                } else {
                    cc.log('player undefined');
                }
            }
        });

        // 加入房间
        right_panel.getChildByName("join_btn").addTouchEventListener(function(sender, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED){
                h1global.curUIMgr.joinroom_ui.show();
                let player = h1global.player();
                if (player) {
                    player.upLocationInfo();
                } else {
                    cc.log('player undefined');
                }
            }
        });

        // 亲友圈
        right_panel.getChildByName("group_btn").addTouchEventListener(function(sender, eventType){
            if(eventType === ccui.Widget.TOUCH_ENDED){
                cc.log('pls show group ui here.');
	            let player = h1global.player();
                if(player && cc.isFunction(player.getClubListInfo)){
                    player.getClubListInfo();
                } else {
	                h1global.globalUIMgr.info_ui.show_by_info("您已掉线！");
                }

	            if (player && cc.isFunction(player.upLocationInfo)) {
		            player.upLocationInfo();
	            } else {
		            h1global.globalUIMgr.info_ui.show_by_info("您已掉线！");
		            cc.log('player undefined');
	            }
	            cutil.lock_ui();
            }
        });

        /*******************************************分割线***************************************************/
        //公告
        right_panel.getChildByName("notice_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                // h1global.curUIMgr.activity_ui.show();
                // h1global.curUIMgr.task_ui.show();
                h1global.curUIMgr.notice_ui.show();
                cc.log("消息框 show");
                // h1global.globalUIMgr.info_ui.show_by_info("暂未开放！");
            }
        });


        //客服
        right_panel.getChildByName("service_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                // h1global.curUIMgr.customerservice_ui.show();
                h1global.curUIMgr.cs_ui.show();
            }
        });

        //玩法
        right_panel.getChildByName("play_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                h1global.curUIMgr.ruler_ui.show();
            }
        });

        //设置
        right_panel.getChildByName("setting_btn").addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                h1global.curUIMgr.config_ui.show();
            }
        });
    },
});