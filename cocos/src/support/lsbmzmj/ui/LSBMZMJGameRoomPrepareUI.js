"use strict";
var LSBMZMJGameRoomPrepareUI = UIBase.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/LSBMZMJGameRoomPrepareUI.json";
        this.talk_img_num = 0;
    },

    initUI:function(){
        var player = h1global.player();
        this.gameprepare_panel = this.rootUINode.getChildByName("gameprepare_panel");
        if(this.curRound > 0){
            //因为2D的GAME_ROOM_UI值为0,3D的值为1,所以这里加1
            this.gameprepare_panel.setVisible(false);
            this.gameprepare_panel = this.rootUINode.getChildByName("gameprepare" + (parseInt(cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType))) + 2).toString() + "d_panel");
        }
        this.gameprepare_panel.setVisible(true);
        this.gameprepare_panel.getChildByName("bg_panel").addTouchEventListener(function (sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED){
                if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
                    h1global.curUIMgr.gameplayerinfo_ui.hide();
                }
            }
        });
        if(player.curGameRoom.playerInfoList.length == 3) {
            for (var i = 0; i < 3; i++) {
                this.update_player_info_panel(i, player.curGameRoom.playerInfoList[i]);
                if (player.curGameRoom.playerInfoList[i]) {
                    this.update_player_state(i, player.curGameRoom.playerStateList[i]);
                }
            }
        }else {
            for (var i = 0; i < 4; i++) {
                this.update_player_info_panel(i, player.curGameRoom.playerInfoList[i]);
                if (player.curGameRoom.playerInfoList[i]) {
                    this.update_player_state(i, player.curGameRoom.playerStateList[i]);
                }
            }
        }
        this.update_location();
        var roomid_label = this.gameprepare_panel.getChildByName("roomid_label");
        roomid_label.setString(player.curGameRoom.roomID.toString());

        // var share_title = cutil.get_share_title(player.curGameRoom,const_val.TaiYuanKDDMJ);
        var share_title = '';
        // var share_desc = this.get_share_desc();
        if(player.curGameRoom["game_mode"]!=2){
            player.curGameRoom["king_mode"] = 99;
            player.curGameRoom["reward"] = 99;
        }

        var share_desc = cutil.get_share_desc(player.curGameRoom,const_val.TaiYuanKDDMJ);
        var wxinvite_btn = this.gameprepare_panel.getChildByName("wxinvite_btn");
        if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true){
            wxinvite_btn.setVisible(false);
        }
        var self = this;
        wxinvite_btn.addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                //获取需要三缺一信息
                var need_num = self.get_add_share_title();
                player.curGameRoom.need_player_num = need_num;
                share_title = cutil.get_share_title(player.curGameRoom,const_val.LingShiBMZMJ);
                var share_url = switches.PHP_SERVER_URL + '/' + switches.gameEngName + '_home?action=joinroom&roomId=' + player.curGameRoom.roomID.toString();
	            if (switchesnin1.hasXianliao !== undefined && switchesnin1.hasXianliao !== null && switchesnin1.hasXianliao >= 1) {
		            if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
			            h1global.curUIMgr.shareselect_ui.show_by_info(share_url, share_title, share_desc);
		            } else {
			            cc.log(share_title);
			            cc.log(share_desc);
		            }
	            } else {
		            if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
			            jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", true, share_url, share_title, share_desc);
		            } else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
			            jsb.reflection.callStaticMethod("WechatOcBridge", "callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", true, share_url, share_title, share_desc);
		            } else {
			            cc.log(share_title);
			            cc.log(share_desc);
		            }
	            }
            }
        })

        var prepare_btn = this.gameprepare_panel.getChildByName("prepare_btn");
        if(player.curGameRoom.hand_prepare == 1){
            prepare_btn.setVisible(false);
            wxinvite_btn.setPositionX(this.gameprepare_panel.getContentSize().width * 0.5);
        }
        prepare_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED){
                player.curGameRoom.updatePlayerState(player.serverSitNum, 1);
                h1global.curUIMgr.gameroomprepare_ui.update_player_state(player.serverSitNum, 1);
                player.prepare();
                prepare_btn.setVisible(false);
            }
        });

        if(this.curRound !== 0){
            wxinvite_btn.setVisible(false);
        }

        h1global.curUIMgr.gameroominfo_ui.show_by_info();

        if(!cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.resumeMusic();
        }

        if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
            h1global.curUIMgr.gameplayerinfo_ui.hide();
        }

        var center_bg_img = this.gameprepare_panel.getChildByName("center_bg_img");
        if(this.curRound > 0) {
            if (cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType)) == 0) {
                var curServerSitNum = (player.serverSitNum - player.curGameRoom.dealerIdx + 4) % 4;
                center_bg_img.setRotation((90 * curServerSitNum) % 360);
            } else {
                var bgList = ["east", "south", "west", "north"];
                var curServerSitNum = (player.serverSitNum - player.curGameRoom.dealerIdx + 4) % 4;
                center_bg_img.loadTexture("res/ui/GameRoomUI/curplayer_" + bgList[curServerSitNum] + "_bg.png");
            }
        }
        gameroomUIMgr.init_quite_panel(this.rootUINode);
		gameroomUIMgr.init_table_idx_panel(this.rootUINode);
    },

    get_add_share_title : function(){
        var player = h1global.player();
        var count=0;
        for(var i =0;i<player.curGameRoom.playerInfoList.length;i++){
            if(player.curGameRoom.playerInfoList[i]){
                count++;
            }
        }
        var str = '';
        switch (count){
            case 1:
                str='一缺三';
                break;
            case 2:
                str='二缺二';
                break;
            case 3:
                str='三缺一';
                break;
            default:
                break;
        }
        return str;
    },

    get_share_desc : function () {
        var player = h1global.player();

        var roominfo_list = [["普通玩法","特殊牌型玩法","耗子玩法"],["风耗子", "单耗子"],["非赏金","赏金"]];
        var share_list = [];
        share_list.push(roominfo_list[0][player.curGameRoom.game_mode]);
        share_list.push(player.curGameRoom.game_round + '局');
        if (player.curGameRoom.game_mode === 2) {
            share_list.push(roominfo_list[1][player.curGameRoom.king_mode]);
            share_list.push(roominfo_list[2][player.curGameRoom.reward]);
        }

        if (player.curGameRoom.add_dealer === 1) {
            share_list.push("加庄");
        }

        if (player.curGameRoom.hand_prepare === 0) {
            share_list.push("手动准备");
        } else {
            share_list.push("自动准备");
        }

        if (player.curGameRoom.pay_mode === const_val.AA_PAY_MODE) {
            share_list.push("AA支付");
        } else if(player.curGameRoom.pay_mode === const_val.AGENT_PAY_MODE) {
            share_list.push("代理支付");
        } else if (player.curGameRoom.pay_mode === const_val.CLUB_PAY_MODE) {
            share_list.push("老板支付");
        } else {
            share_list.push("房主支付");
        }

        return share_list.join(',')
    },

    show_prepare:function (curRound, playerInfoList, cbk_fuction) {
        var player = h1global.player();
        this.curRound = curRound !== undefined ? curRound : player.curGameRoom.curRound;
        this.playerInfoList = playerInfoList || player.curGameRoom.playerInfoList;
        this.is_swaping = false;
        this.show(cbk_fuction);
    },

    swap_seat:function (swap_list) {
        this.is_swaping = true;
        var player = h1global.player();
        var self = this;
        var repeat_time = 0;
        // 位置交换
        var swap = [];
        var list_count = [[2,3,1,0], [1,2,3,0], [0,1,2,3], [3,0,1,2]];
        for(var i=0; i<repeat_time-1; i++){
            var list = cutil.deepCopy(swap_list);
            // list.sort(function(){return 0.5 - Math.random()});
            list = list_count[i % 4];
            swap.push(list);
        }
        swap.push(cutil.deepCopy(swap_list));
        function fly() {
            self.gameprepare_panel.setVisible(false);
            var clone_list = [];
            for(var i=0; i<swap_list.length; i++){
                var player_info_panel = self.gameprepare_panel.getChildByName("player_info_panel" + i);
                player_info_panel.getChildByName("ready_img").setVisible(false);
                var clone_panel = player_info_panel.clone();
                var playerInfo = self.playerInfoList[swap_list[i]];
                cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function(img){
                    if(h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && clone_panel){

                        if(clone_panel.getChildByName("portrait_sprite")){
                            clone_panel.getChildByName("portrait_sprite").removeFromParent();
                        }

                        var portrait_sprite  = new cc.Sprite(img);
                        portrait_sprite.setName("portrait_sprite");
                        if(self.curRound > 0) {
                            portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
                        }else {
                            portrait_sprite.setScale(100 / portrait_sprite.getContentSize().width);
                        }
                        portrait_sprite.x = clone_panel.getContentSize().width * 0.5;
                        portrait_sprite.y = clone_panel.getContentSize().height * 0.5;
                        clone_panel.addChild(portrait_sprite);
                        clone_panel.reorderChild(portrait_sprite, -1);
                    }
                });

                clone_panel.setPosition(self.rootUINode.convertToNodeSpace(player_info_panel.getPosition()));
                self.rootUINode.addChild(clone_panel);
                clone_list.push(clone_panel);
            }
            var sum  = 0;
            var game_next_panel = self.rootUINode.getChildByName("gameprepare" + (parseInt(cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType))) + 2).toString() + "d_panel");
            for(let i=0; i<clone_list.length; i++){
                var aim_panel = game_next_panel.getChildByName("player_info_panel" +  player.server2CurSitNum(i));
                // var aim_pos = cc.p(aim_panel.getPositionX()+(0.5 - aim_panel.getAnchorPoint().x) *aim_panel.getContentSize().width , aim_panel.getPositionY() +(0.5 - aim_panel.getAnchorPoint().y) *aim_panel.getContentSize().height);
                // var space_pos = self.rootUINode.convertToNodeSpace(aim_pos)

                var space_pos = cc.p(aim_panel.getPositionPercent().x*cc.winSize.width, aim_panel.getPositionPercent().y*cc.winSize.height);
                clone_list[i].setScale(0.7);
                clone_list[i].setAnchorPoint(aim_panel.getAnchorPoint())
                clone_list[i].runAction(cc.Sequence.create(
                    cc.MoveTo.create(0.4, cc.p(space_pos)),
                    cc.CallFunc.create(function () {
                        sum += 1;
                        if(sum === clone_list.length){
                            self.hide();
                            if(h1global.curUIMgr.gameroom3d_ui && h1global.curUIMgr.gameroom2d_ui){
                                // h1global.curUIMgr.roomLayoutMgr.notifyObserver(const_val.GAME_ROOM_UI_NAME, "hide");
                                h1global.curUIMgr.roomLayoutMgr.showGameRoomUI(function(complete){
                                    if(complete){
                                        let player2 = h1global.player();
                                        if (player2 && player2.startActions["GameRoomUI"]) {
                                            player2.startActions["GameRoomUI"]();
                                            player2.startActions["GameRoomUI"] = undefined;
                                        }
                                        h1global.curUIMgr.roomLayoutMgr.setGameRoomUI2Top(cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType)))
                                    }
                                });
                            }
                        }
                    })
                ))
            }

        }
        let index = 0;
        function func() {
            if(repeat_time <= 0){return;}
            self.gameprepare_panel.runAction(cc.sequence(cc.DelayTime.create(0.08),
                cc.CallFunc.create(function(){
                    var cur_swap = swap[index];
                    for(let j=0; j<cur_swap.length; j++){
                        self.update_player_info_panel(j, self.playerInfoList[cur_swap[j]])
                        var player_info_panel = self.gameprepare_panel.getChildByName("player_info_panel" + j);
                        player_info_panel.getChildByName("red_mark_img").setVisible(false)
                    }
                    if (index < repeat_time - 1){
                        func()
                    } else if(index === repeat_time-1){
                        fly()
                    }
                    index++;
                })
            ))
        }
        // func();
        fly();
    },

    change_prepare_mode:function (gameType) {
        if(this.is_swaping){return;}
        this.gameprepare_panel.setVisible(false);
        this.gameprepare_panel = this.rootUINode.getChildByName("gameprepare" + (parseInt(gameType) + 2).toString() + "d_panel");
        this.initUI();
        this.gameprepare_panel.setVisible(true);
    },

    check_invition:function(){
        var player = h1global.player();
        var playerNum = 0;
        for(var i = 0; i < 4; i++){
            if(player.curGameRoom.playerInfoList[i]){
                playerNum = playerNum + 1;
            }
        }
        var wxinvite_btn = this.gameprepare_panel.getChildByName("wxinvite_btn");
        if(playerNum < player.curGameRoom.player_num){
            wxinvite_btn.setVisible(true);
        } else {
            wxinvite_btn.setVisible(false);
        }
        if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true){
            wxinvite_btn.setVisible(false);
        }
    },

    check_prepare: function () {
        var player = h1global.player();
        var prepare_btn = this.gameprepare_panel.getChildByName("prepare_btn");
        if (player.curGameRoom.playerStateList[player.serverSitNum]){
            prepare_btn.setVisible(false);
        } else {
            prepare_btn.setVisible(true);
        }
    },



    update_location:function () {
        var self = this;
        if(self.curRound > 0) {
            return;
        }
        var player = h1global.player();
        var ip_panel = this.gameprepare_panel.getChildByName("ip_panel");
        var distance_panel = this.gameprepare_panel.getChildByName("distance_panel");

        //获得ip相同和距离相近玩家的list  ——start
        var playerInfoList = player.curGameRoom.playerInfoList;
        cc.log("playerInfoList:",playerInfoList)
        var ip_list = [];
        var idx_ip_list = [];
        var distance_list = player.curGameRoom.playerDistanceList;
        var idx_distance_list = [];
        for(var i = 0 ; i < player.curGameRoom.playerInfoList.length && playerInfoList[i]; i++) {
            if(i == player.serverSitNum){
                ip_list.push("0");
            }else{
                ip_list.push(playerInfoList[i]["ip"]);
            }
        }
        for(var i = 0 ; i < ip_list.length ; i++){
            for(var j = 0 ; j < ip_list.length ; j++){
                if(i == j){continue;}
                if(ip_list[i] == ip_list[j]){
                    if(idx_ip_list.indexOf(i) < 0){idx_ip_list.push(i);}
                    if(idx_ip_list.indexOf(j) < 0){idx_ip_list.push(j);}
                }
            }
        }
        for(var i = 0 ; i < distance_list.length ; i++){
            for(var j = 0 ; j < distance_list.length ; j++){
                if(i == j || i == player.serverSitNum || j == player.serverSitNum) {continue;}
                if(distance_list[i][j] < 100 && distance_list[i][j] >= 0){
                    if(idx_distance_list.indexOf(i) < 0){idx_distance_list.push(i);}
                    if(idx_distance_list.indexOf(j) < 0){idx_distance_list.push(j);}
                }
            }
        }
        cc.log("ip_list:",ip_list);
        cc.log("idx_ip_list:",idx_ip_list);
        cc.log("distance_list:",distance_list);
        cc.log("idx_distance_list:",idx_distance_list);
        //获得ip相同和距离相近玩家的list  ——end

        var pos_list = [0.53, 0.36, 0.19];
        for(var i = 0 ; i < idx_ip_list.length ; i++) {
            let idx = i;
            if (playerInfoList[idx_ip_list[i]]) {
                cutil.loadPortraitTexture(playerInfoList[idx_ip_list[i]]["head_icon"], playerInfoList[idx_ip_list[i]]["sex"], function (img) {
                    if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && ip_panel) {
                        // location_panel.getChildByName("portrait_sprite" + curSitNum).removeFromParent();
                        var portrait_sprite = new cc.Sprite(img);
                        portrait_sprite.setName("portrait_sprite");
                        portrait_sprite.setScale(60 / portrait_sprite.getContentSize().width);
                        portrait_sprite.x = ip_panel.getContentSize().width * pos_list[idx];
                        portrait_sprite.y = ip_panel.getContentSize().height * 0.5;
                        ip_panel.addChild(portrait_sprite);
                        ip_panel.reorderChild(portrait_sprite, -1);
                    }
                });
            }
        }

        for(var i = 0 ; i < idx_distance_list.length ; i++) {
            let idx = i;
            cc.log("idx_distance_list:",idx_distance_list);
            if (playerInfoList[idx_distance_list[i]]) {
                cutil.loadPortraitTexture(playerInfoList[idx_distance_list[i]]["head_icon"], playerInfoList[idx_distance_list[i]]["sex"], function(img){
                    if(h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && distance_panel){
                        // location_panel.getChildByName("portrait_sprite" + curSitNum).removeFromParent();
                        var portrait_sprite  = new cc.Sprite(img);
                        portrait_sprite.setName("portrait_sprite");
                        portrait_sprite.setScale(60 / portrait_sprite.getContentSize().width);
                        portrait_sprite.x = distance_panel.getContentSize().width * pos_list[idx];
                        portrait_sprite.y = distance_panel.getContentSize().height * 0.5;
                        distance_panel.addChild(portrait_sprite);
                        distance_panel.reorderChild(portrait_sprite, -1);
                    }
                });
            }
        }

        if(idx_ip_list.length > 1){
            ip_panel.setVisible(true);
            distance_panel.setVisible(false);
        } else if (idx_distance_list.length > 1 && idx_ip_list.length <= 1) {
            ip_panel.setVisible(false);
            distance_panel.setVisible(true);
        }
        this.gameprepare_panel.runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(3.0),
            cc.callFunc(function () {
                if(idx_distance_list.length > 1 && idx_ip_list.length > 1) {
                    if (ip_panel.isVisible()) {
                        ip_panel.setVisible(false);
                        distance_panel.setVisible(true);
                    } else {
                        ip_panel.setVisible(true);
                        distance_panel.setVisible(false);
                    }
                }
            })
        )));
    },

    update_player_info_panel:function(serverSitNum, playerInfo){
        if(serverSitNum < 0 || serverSitNum > 3){
            return;
        }
        var self = this;
        var player = h1global.player();
        var player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + serverSitNum.toString());
        var frame_bg_img = this.gameprepare_panel.getChildByName("frame_img_" + serverSitNum.toString());
        if(this.curRound > 0){
            player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + player.server2CurSitNum(serverSitNum).toString());
        }
        if(playerInfo){
            frame_bg_img.setVisible(false);
            var name_label = ccui.helper.seekWidgetByName(player_info_panel, "name_label");
            name_label.setString(playerInfo["nickname"]);
            var frame_img = ccui.helper.seekWidgetByName(player_info_panel, "frame_img");
            player_info_panel.reorderChild(frame_img, -2);
            frame_img.setTouchEnabled(true);
            frame_img.addTouchEventListener(function(sender, eventType){
                if(eventType === ccui.Widget.TOUCH_ENDED){
                    h1global.curUIMgr.gameplayerinfo_ui.show_by_info(playerInfo, serverSitNum + 10);
                }
            });
            cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function(img){
                if(h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && cc.sys.isObjectValid(player_info_panel)){
                    if(player_info_panel.getChildByName("portrait_sprite")){
                        player_info_panel.getChildByName("portrait_sprite").removeFromParent();
                    }
                    var portrait_sprite  = new cc.Sprite(img);
                    portrait_sprite.setName("portrait_sprite");
                    if(self.curRound > 0) {
                        portrait_sprite.setScale(74 / portrait_sprite.getContentSize().width);
                    }else {
                        portrait_sprite.setScale(100 / portrait_sprite.getContentSize().width);
                    }
                    portrait_sprite.x = player_info_panel.getContentSize().width * 0.5;
                    portrait_sprite.y = player_info_panel.getContentSize().height * 0.5;
                    player_info_panel.addChild(portrait_sprite);
                    player_info_panel.reorderChild(portrait_sprite, -1);
                }
            });
            if(this.curRound > 0){
                var score_label = ccui.helper.seekWidgetByName(player_info_panel, "score_label");
                score_label.ignoreContentAdaptWithSize(true);
                score_label.setString((playerInfo["total_score"] == undefined ? 0 : playerInfo["total_score"]).toString());
            }
            var dealer_img = ccui.helper.seekWidgetByName(player_info_panel, "dealer_img");

            var owner_img = ccui.helper.seekWidgetByName(player_info_panel, "owner_img");
            player_info_panel.reorderChild(owner_img, 3);
            owner_img.setVisible(playerInfo["is_creator"]);

            var red_mark_img = player_info_panel.getChildByName("red_mark_img");
            player_info_panel.reorderChild(red_mark_img, 5);
            red_mark_img.setVisible(!playerInfo["location"] && this.curRound < 1);
            player_info_panel.setVisible(true);
        } else {
            frame_bg_img.setVisible(true);
            player_info_panel.setVisible(false);
        }
        if(player && player.curGameRoom.playerInfoList.length == 3) {
            this.gameprepare_panel.getChildByName("player_info_panel2").setVisible(false);
        }
        this.check_invition();
        this.check_prepare();
    },

    update_player_state:function(serverSitNum, state){
        if(serverSitNum < 0 || serverSitNum > 3){
            return;
        }
        var player = h1global.player();
        var player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + serverSitNum.toString());
        if(this.curRound > 0){
            var player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + player.server2CurSitNum(serverSitNum).toString());
        }
        var ready_img = ccui.helper.seekWidgetByName(player_info_panel, "ready_img");
        player_info_panel.reorderChild(ready_img, 4);
        if(state == 1){
            // name_label.setString(playerInfo["name"]);
            ready_img.setVisible(true);
        } else {
            ready_img.setVisible(false);
        }
    },

    getMessagePos:function(playerInfoPanel){
        var anchor_point = playerInfoPanel.getAnchorPoint();
        var content_size = playerInfoPanel.getContentSize();
        var cur_pos = playerInfoPanel.getPosition();
        return cc.p(cur_pos.x - content_size.width * anchor_point.x + 130,
            cur_pos.y - content_size.height * anchor_point.y + 180);
    },

    playEmotionAnim:function(serverSitNum, eid){
        var player_info_panel = undefined;
        if (!this.is_show) {
            return false;
        }
        var player = h1global.player();
        if (!player || !player.curGameRoom) {
            return
        }
        emotion.playEmotion(this.gameprepare_panel,eid,serverSitNum);
        return;//下面的是以前的代码
        var curSitNum = serverSitNum;
        if (player.curGameRoom.curRound > 0) {
            curSitNum = player.server2CurSitNum(serverSitNum);
        }
        if(curSitNum < 0){
            player_info_panel = this.gameprepare_panel.getChildByName("agent_info_panel");
        } else {
            player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + curSitNum.toString());
            // player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + h1global.player().server2CurSitNum(serverSitNum));
        }
        var talk_img = ccui.ImageView.create();
        if(this.curRound > 0) {
            talk_img.setPosition(this.getMsgPos(player_info_panel, curSitNum));
        }else {
            talk_img.setPosition(this.getMessagePos(player_info_panel).x - 70, this.getMessagePos(player_info_panel).y + 25);
        }
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(100, 120));
        this.gameprepare_panel.addChild(talk_img);
        var talk_angle_img = ccui.ImageView.create();
        talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
        talk_img.addChild(talk_angle_img);
        // 加载表情图片
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        var cache = cc.spriteFrameCache;
        var plist_path = "res/effect/biaoqing.plist";
        var png_path = "res/effect/biaoqing.png";
        cache.addSpriteFrames(plist_path, png_path);
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

        var anim_frames = [];
        for (var i = 1; i <= const_val.ANIM_LIST[eid - 1] ; i++) {
            var frame = cache.getSpriteFrame("Emot/biaoqing_" + eid.toString() + "_" + i.toString() + ".png");
            if (frame) {
                anim_frames.push(frame);
            }
        }
        var effect_animation = new cc.Animation(anim_frames, 1.5 / const_val.ANIM_LIST[eid - 1]);
        var effect_action = new cc.Animate(effect_animation);

        var emot_sprite = cc.Sprite.create();
        // emot_sprite.setScale(1.0);
        emot_sprite.setScale(0.4);
        emot_sprite.setPosition(cc.p(50, 60));
        // emot_sprite.setPosition(this.getMessagePos(player_info_panel));
        talk_img.addChild(emot_sprite);
        // this.gameprepare_panel.addChild(emot_sprite);
        if(this.curRound > 0){
            if(curSitNum > 0 && curSitNum < 3){
                talk_img.setScaleX(-1);
                talk_img.setPositionX(talk_img.getPositionX() - 40);
                talk_img.setPositionY(talk_img.getPositionY() - 10);
            }else {
                talk_img.setPositionX(talk_img.getPositionX() + 40);
                talk_angle_img.setLocalZOrder(3);
            }
            talk_angle_img.setPosition(3, talk_angle_img.getPositionY() + 50);
        }else {
            talk_angle_img.setRotation(-90);
            talk_angle_img.setLocalZOrder(3);
            talk_angle_img.setPosition(talk_img.getContentSize().width*0.5, 2);
        }
        emot_sprite.runAction(cc.Sequence.create(cc.Repeat.create(effect_action, 2), cc.CallFunc.create(function(){
            talk_img.removeFromParent();
        })));
    },

	playMessageAnim: function (serverSitNum, msg) {
		if (!msg || msg == "") {
			return;
		}
        // var player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + h1global.player().server2CurSitNum(serverSitNum));
        if (!this.is_show) {
            return false;
        }
        var player = h1global.player();
        if (!player || !player.curGameRoom) {
            return
        }
        var idx = serverSitNum;
        if (player.curGameRoom.curRound > 0) {
            idx = player.server2CurSitNum(serverSitNum);
        }
        var player_info_panel = undefined;
        if(serverSitNum < 0){
            player_info_panel = this.gameprepare_panel.getChildByName("agent_info_panel");
        } else {
            player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + idx.toString());
            // player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + h1global.player().server2CurSitNum(serverSitNum));
        }
        var talk_img = ccui.ImageView.create();
        var talk_angle_img = ccui.ImageView.create();
        if(this.curRound > 0){
            talk_img.setAnchorPoint(0,0.5);
        }else {
            talk_img.setAnchorPoint(0.5,0.5);
        }
        talk_img.setScale(1.0);
        // talk_img.setPosition(this.getMessagePos(player_info_panel));
        // talk_img.setPosition(talk_img.getPositionX() - 70,talk_img.getPositionY() - 15);
        if(this.curRound > 0) {
            talk_img.setPosition(this.getMsgPos(player_info_panel, idx));
        }else {
            talk_img.setPosition(this.getMessagePos(player_info_panel));
            talk_img.setPosition(talk_img.getPositionX() - 70,talk_img.getPositionY() - 15);
        }
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
        talk_img.addChild(talk_angle_img);
        this.gameprepare_panel.addChild(talk_img);

        var msg_label = cc.LabelTTF.create("", "Arial", 22);
	    msg_label.setString(msg);
        msg_label.setDimensions(msg_label.getString().length * 26, 0);
        msg_label.setColor(cc.color(0, 0, 0));
        msg_label.setAnchorPoint(cc.p(0.5, 0.5));
        talk_img.addChild(msg_label);
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(msg_label.getString().length * 23 + 20, talk_img.getContentSize().height));
        if(this.curRound > 0){
            talk_angle_img.setPosition(3,talk_img.getContentSize().height*0.5);
            if(idx > 0 && idx < 3){
                msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.37 + 10, 23));
                talk_img.setScaleX(-1);
                msg_label.setScaleX(-1);
            }else {
                msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.50 + 13, 23));
                talk_angle_img.setLocalZOrder(3);
            }
        }else {
            msg_label.setPosition(cc.p(talk_img.getContentSize().width*0.58, 23));
            talk_angle_img.setPosition(talk_img.getContentSize().width*0.5, 2);
            talk_angle_img.setRotation(-90);
            talk_angle_img.setLocalZOrder(3);
        }
        cc.log("talk_angle_img",talk_angle_img.getWorldPosition());
        msg_label.runAction(cc.Sequence.create(cc.DelayTime.create(2.0), cc.CallFunc.create(function(){
            talk_img.removeFromParent();
        })));
    },

    playVoiceAnim:function(serverSitNum, record_time){
        var self = this;
        if (!this.is_show) {
            return false;
        }
        var player = h1global.entityManager.player();
        if (!player || !player.curGameRoom) {
            return
        }
        var idx = serverSitNum;
        if (player.curGameRoom.curRound > 0) {
            idx = player.server2CurSitNum(serverSitNum);
        }
        if(cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.pauseMusic();
            cc.audioEngine.pauseAllEffects();
            cc.audioEngine.setEffectsVolume(0);
        }
        var interval_time = 0.8;
        this.talk_img_num += 1;
        // var player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + h1global.player().server2CurSitNum(serverSitNum));
        var player_info_panel = undefined;
        if(serverSitNum < 0){
            player_info_panel = this.gameprepare_panel.getChildByName("agent_info_panel");
        } else {
            player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + idx);
            // player_info_panel = this.gameprepare_panel.getChildByName("player_info_panel" + h1global.player().server2CurSitNum(serverSitNum));
        }
        var talk_img = ccui.ImageView.create();
        if(this.curRound> 0) {
            talk_img.setPosition(this.getMsgPos(player_info_panel, idx));
        }else {
            talk_img.setPosition(this.getMessagePos(player_info_panel).x - 70, this.getMessagePos(player_info_panel).y - 15);
        }
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(100, talk_img.getContentSize().height));
        this.gameprepare_panel.addChild(talk_img);
        var talk_angle_img = ccui.ImageView.create();
        talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
        talk_img.addChild(talk_angle_img);
        // 加载表情图片
        var voice_img1 = ccui.ImageView.create();
        voice_img1.loadTexture("res/ui/Default/voice_img1.png");
        voice_img1.setPosition(cc.p(50, 23));
        talk_img.addChild(voice_img1);
        var voice_img2 = ccui.ImageView.create();
        voice_img2.loadTexture("res/ui/Default/voice_img2.png");
        voice_img2.setPosition(cc.p(50, 23));
        voice_img2.setVisible(false);
        talk_img.addChild(voice_img2);
        voice_img2.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time), cc.CallFunc.create(function(){voice_img1.setVisible(false);voice_img2.setVisible(true);voice_img3.setVisible(false);}), cc.DelayTime.create(interval_time*2), cc.CallFunc.create(function(){voice_img2.setVisible(false)}))));
        var voice_img3 = ccui.ImageView.create();
        voice_img3.loadTexture("res/ui/Default/voice_img3.png");
        voice_img3.setPosition(cc.p(50, 23));
        voice_img3.setVisible(false);
        talk_img.addChild(voice_img3);
        voice_img3.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time*2), cc.CallFunc.create(function(){voice_img1.setVisible(false);voice_img2.setVisible(false);voice_img3.setVisible(true);}), cc.DelayTime.create(interval_time), cc.CallFunc.create(function(){voice_img3.setVisible(false);voice_img1.setVisible(true);}))));
        talk_angle_img.setRotation(-90);
        talk_angle_img.setLocalZOrder(3);
        talk_angle_img.setPosition(talk_img.getContentSize().width*0.5, 2);
        talk_img.runAction(cc.Sequence.create(cc.DelayTime.create(record_time), cc.CallFunc.create(function(){
            talk_img.removeFromParent();
            self.talk_img_num -= 1;
            if(self.talk_img_num == 0){
                if(!cc.audioEngine.isMusicPlaying()){
                    cc.audioEngine.resumeMusic();
                    cc.audioEngine.resumeAllEffects();
                    cc.audioEngine.setEffectsVolume(cc.sys.localStorage.getItem("EFFECT_VOLUME") * 0.01);
                }
            }
        })));
        // return talk_img;
    },

    getMsgPos:function(playerInfoPanel, idx){
        var pos = playerInfoPanel.getPosition();
        if(idx == 1){
            pos = cc.p(pos.x - playerInfoPanel.width, pos.y + playerInfoPanel.height * 0.5);
        } else if(idx == 2){
            pos = cc.p(pos.x, pos.y - playerInfoPanel.height * 0.5);
        } else if(idx == 3){
            pos = cc.p(pos.x + playerInfoPanel.width, pos.y + playerInfoPanel.height * 0.5);
        } else {
            pos = cc.p(pos.x + playerInfoPanel.width, pos.y + playerInfoPanel.height * 0.5);
        }
        return pos;
    },
});