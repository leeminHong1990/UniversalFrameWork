// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var LSBMZMJGameRoomUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.talk_img_num = 0;
	},
    initUI:function(){
        var self = this;
        var player = h1global.player();

        this.rootUINode.getChildByName("bg_panel").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
                    h1global.curUIMgr.gameplayerinfo_ui.hide();
                }
                self._resetSelectTile();
            }
        });

        this.init_discard_tile_anim_img();

        this.beginAnimPlaying = false;
        this.touch_state = const_lsbmzmj.PLAYER_TOUCH_SELF_STATE
        this.isNeedDiscard = true;
        this.curSelectTile = undefined;
        this.choose_tile_list = [];
        // this.checkTing = false;
	    h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
		    ui.checkTing = false;
	    });

        this.init_game_panel();
        this.init_extra_panel();
        this.init_ting_panel();
        if (player) {
            this.init_curplayer_panel();
            this.init_player_info_panel();
            this.init_player_tile_panel();
            this.init_player_discard_panel();
            this.init_operation_panel();
        }

        var show_lucky_tiles_panel = this.rootUINode.getChildByName("show_lucky_tiles_panel");
        this.rootUINode.reorderChild(show_lucky_tiles_panel, 1);

        h1global.curUIMgr.gameroominfo_ui.show_by_info();
        gameroomUIMgr.set_wintips_btn_anime(this.rootUINode.getChildByName("wintips_btn"));
        if (player) {
            this.update_roominfo_panel();
	        this.update_roominfo_panel_mahjong_img();

            this.update_wintips_btn();

            this.update_kingtile_panel();
            for (var i = 0; i < player.curGameRoom.player_num; i++) {
                this.update_wreath_panel(i)
            }
        }

        // TEST
        // this.play_luckytiles_anim([11, 12, 13]);
        // this.playOperationEffect(const_val.OP_PONG);
        // this.startBeginAnim();
        if(!cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.resumeMusic();
        }

        if (player && player.curGameRoom.player_num == 3) {
            this.rootUINode.getChildByName("player_info_panel2").setVisible(false);
            this.rootUINode.getChildByName("player_tile_panel2").setVisible(false);
            this.rootUINode.getChildByName("wreath_panel2").setVisible(false);

            this.rootUINode.getChildByName("game_info_panel").getChildByName("player_discard_panel2").setVisible(false);
        }

        if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
            h1global.curUIMgr.gameplayerinfo_ui.hide();
        }
		gameroomUIMgr.init_table_idx_panel(this.rootUINode);
    },

    init_discard_tile_anim_img:function(){
        // 打牌动画所需资源
        var tile_img = ccui.ImageView.create();
        // tile_img.setScale(1.5);
        this.load_discard_tile_anim_img(tile_img);
        this.rootUINode.addChild(tile_img);
        var mahjong_img = ccui.ImageView.create();
        mahjong_img.setPosition(cc.p(48, 55));
        mahjong_img.setName("mahjong_img");
        tile_img.addChild(mahjong_img);
        tile_img.setVisible(false);
        this.discard_tile_anim_img = tile_img;
    },

    load_discard_tile_anim_img:function(tile_img){
    },

    init_game_panel:function(){
        var operation_panel = this.rootUINode.getChildByName("operation_panel");
        operation_panel.setVisible(false);
    },

    init_ting_panel:function(){
        var self = this;
        var ting_operation_panel = ccui.ImageView.create();
	    var operation_bg = ccui.ImageView.create();
        // ting_operation_panel.setVisible(true);
        ting_operation_panel.setName("ting_operation_panel");
        ting_operation_panel.setAnchorPoint(cc.p(0,0));
        ting_operation_panel.setScale9Enabled(true);
        ting_operation_panel.setContentSize(cc.size(300, 100));
        var operation_panel = this.rootUINode.getChildByName("operation_panel")

        ting_operation_panel.setPosition(operation_panel.getPosition());
        this.rootUINode.addChild(ting_operation_panel);
        var ting_btn = ccui.Button.create();
        ting_btn.setName("ting_btn");
        ting_btn.setAnchorPoint(cc.p(0.5,0.5));
	    ting_btn.setScale(1.2);
        ting_btn.loadTextureNormal("res/ui/GameRoomUI/gameroom_op_ting.png");
        var guo_btn = ccui.Button.create();
        guo_btn.setName("guo_btn");
        guo_btn.setAnchorPoint(cc.p(0.5,0.5));
        guo_btn.loadTextureNormal("res/ui/GameRoomUI/gameroom_op_guo.png");
        ting_operation_panel.addChild(ting_btn);
        ting_operation_panel.addChild(guo_btn);
	    guo_btn.setPosition(cc.p(operation_panel.getContentSize().width - 40, operation_panel.getContentSize().height/2))
	    guo_btn.setLocalZOrder(999);
	    ting_btn.setPosition(cc.p(operation_panel.getContentSize().width - 40 -170, operation_panel.getContentSize().height/2))
        ting_btn.setVisible(true);
        guo_btn.setVisible(true);
        function ting_btn_event(sender, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                // var player = h1global.entityManager.player();
                // player.setDiscardState(const_lsbmzmj.DISCARD_FORCE);
                // self.checkTing = true;
	            h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
		            ui.checkTing = true;
	            });
                ting_btn.setVisible(false);
	            operation_bg.setVisible(true);
                // self._resetSelectTile();
                // self._setTileMask();
	            h1global.curUIMgr.roomLayoutMgr.notifyObserver("_resetSelectTile");
	            h1global.curUIMgr.roomLayoutMgr.notifyObserver("_setTileMask");
	            h1global.curUIMgr.roomLayoutMgr.notifyObserver("show_ting_btn", false);
	            h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel");
                cc.log("出一张牌才能听牌！");
            }
        }
        function guo_btn_event(sender, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                var player = h1global.entityManager.player();
                player.setDiscardState(const_lsbmzmj.DISCARD_FREE);
	            h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
		            ui.checkTing = false;
	            });
                ting_operation_panel.setVisible(false);
                h1global.curUIMgr.roomLayoutMgr.notifyObserver("show_ting_panel", false);
                h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel");
                ting_btn.setVisible(true);
                // self._setTileNoMask();
	            h1global.curUIMgr.roomLayoutMgr.notifyObserver("_resetSelectTile");
	            h1global.curUIMgr.roomLayoutMgr.notifyObserver("_setTileNoMask");
                cc.log("听牌选择过！");
            }
        }
        ting_btn.addTouchEventListener(ting_btn_event);
        guo_btn.addTouchEventListener(guo_btn_event);



        operation_bg.loadTexture("res/ui/GameRoomUI/operation_bg.png");
        operation_bg.setAnchorPoint(cc.p(1, 0.5));
        operation_bg.setScale9Enabled(true);
        operation_bg.setContentSize(cc.size( 390, operation_panel.getContentSize().height * 1.2));
        ting_operation_panel.addChild(operation_bg);
        operation_bg.setLocalZOrder(-1);
	    ting_operation_panel.setLocalZOrder(999);
	    operation_bg.setName("operation_bg");
        operation_bg.setPosition(cc.p(operation_panel.getContentSize().width * 1.2, operation_panel.getContentSize().height * 0.5));

        ting_operation_panel.setVisible(false);
    },

	show_ting_btn:function(is_show) {
		this.rootUINode.getChildByName("ting_operation_panel").getChildByName("ting_btn").setVisible(is_show);
	},

    show_ting_panel:function(is_show) {
	    // if(h1global.curUIMgr.gps_ui && h1global.curUIMgr.gps_ui.is_show) {return;}
        this.rootUINode.getChildByName("ting_operation_panel").setVisible(is_show);
	    var operation_panel = this.rootUINode.getChildByName("operation_panel");
	    var ting_btn = this.rootUINode.getChildByName("ting_operation_panel").getChildByName("ting_btn");
	    var operation_bg = this.rootUINode.getChildByName("ting_operation_panel").getChildByName("operation_bg");
	    if (operation_panel.isVisible()) {
		    operation_bg.setVisible(false);
		    ting_btn.setPosition(cc.p(operation_panel.getContentSize().width - 40 -170 * 2, operation_panel.getContentSize().height/2));
	    } else {
		    operation_bg.setVisible(true);
		    ting_btn.setPosition(cc.p(operation_panel.getContentSize().width - 40 -170, operation_panel.getContentSize().height/2));
        }
    },

    _setTileMask:function () {
        //听牌加遮罩
        var player = h1global.entityManager.player();
        var handTiles = player.curGameRoom.handTilesList[player.serverSitNum];
        var cur_player_hand_panel = this.rootUINode.getChildByName("player_tile_panel0").getChildByName("player_hand_panel");
        for( var i = 0 ; i < handTiles.length ; i++) {
            var tile_img = cur_player_hand_panel.getChildByName("tile_img_" + i.toString());
            if (player.gameOperationAdapter.canTingTiles.indexOf(handTiles[i]) < 0) {
                tile_img.color = const_lsbmzmj.mark_same_color;
            }
        }
    },

    _setTileNoMask:function () {
        //去除遮罩
        var player = h1global.entityManager.player();
        var handTiles = player.curGameRoom.handTilesList[player.serverSitNum];
        var cur_player_hand_panel = this.rootUINode.getChildByName("player_tile_panel0").getChildByName("player_hand_panel");
        for( var i = 0 ; i < handTiles.length ; i++) {
            var tile_img = cur_player_hand_panel.getChildByName("tile_img_" + i.toString());
            tile_img.color = const_lsbmzmj.mark_none_color;
        }
    },

    init_extra_panel:function(){
        var self = this;
        var extra_operation_panel = this.rootUINode.getChildByName("extra_operation_panel");
        var extra_btn_1 = ccui.helper.seekWidgetByName(extra_operation_panel, "extra_btn_1")
        function extra_btn_1_event(sender, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                return
            }
        }
        extra_btn_1.addTouchEventListener(extra_btn_1_event)
    },

    force_discard:function () {
        this.update_player_hand_tiles(h1global.player().serverSitNum);
        // return;
        // var player = h1global.player();
        // this.touch_state = const_lsbmzmj.PLAYER_TOUCH_FORCE_STATE;
        // if (h1global.curUIMgr.roomLayoutMgr) {
        //     h1global.curUIMgr.roomLayoutMgr.notifyObserver('hide_operation_panel', false);
        //     h1global.curUIMgr.roomLayoutMgr.notifyObserver('show_extra_panel', false);
        //     h1global.curUIMgr.roomLayoutMgr.notifyObserver(const_val.GAME_ROOM_UI_NAME,
        //         'update_player_hand_tiles',player.serverSitNum,player.curGameRoom.handTilesList[player.serverSitNum]);
        // }
    },

    show_extra_panel:function(is_show){
        this.rootUINode.getChildByName("extra_operation_panel").setVisible(is_show)
    },

    init_curplayer_panel:function(){
        var player = h1global.player();
        this.game_info_panel = this.rootUINode.getChildByName("game_info_panel");
        this.cur_player_panel = ccui.helper.seekWidgetByName(this.game_info_panel, "cur_player_panel");

        this.init_curplayer_panel_direction();

        var curPlayerSitNum = player.curGameRoom.curPlayerSitNum;
        this.update_curplayer_panel(curPlayerSitNum);
        if(player.serverSitNum == curPlayerSitNum && (player.curGameRoom.handTilesList[player.serverSitNum].length)%3==2){
            this.unlock_player_hand_tiles();
        } else {
            this.lock_player_hand_tiles();
        }
    },

    init_curplayer_panel_direction:function(){
    },

    update_wait_time_left:function(leftTime){
        var player = h1global.player();
        if (!player || !player.curGameRoom) {
            return
        }
        leftTime = Math.floor(leftTime)
        this.cur_player_panel = ccui.helper.seekWidgetByName(this.game_info_panel, "cur_player_panel");
        var lefttime_label = ccui.helper.seekWidgetByName(this.cur_player_panel, "lefttime_label");
        lefttime_label.setString(leftTime)
        lefttime_label.ignoreContentAdaptWithSize(true);
        lefttime_label.setVisible(true);
        if(leftTime < 5){
            this.show_discard_tips()
        }
    },

    hide_discard_tips:function(){
        this.rootUINode.getChildByName("need_discard_panel").setVisible(false)
    },

    show_discard_tips:function(){
        var player = h1global.player();
        var self = this;
	    this.rootUINode.getChildByName("operation_panel").setLocalZOrder(999);
        if(this.isNeedDiscard &&  const_val.FAKE_COUNTDOWN > 0 && player.curGameRoom.handTilesList[player.serverSitNum].length%3===2){
            if(!this.rootUINode.getChildByName("need_discard_panel").isVisible()){
                this.rootUINode.getChildByName("need_discard_panel").setVisible(true);
	            this.rootUINode.getChildByName("need_discard_panel").setLocalZOrder(1);
                this.rootUINode.runAction(cc.repeat(cc.sequence(cc.callFunc(function () {
	                var p = h1global.player();
                    if (p && p.curGameRoom.curPlayerSitNum === p.serverSitNum && self.rootUINode.getChildByName("need_discard_panel").isVisible()) {
                        cc.audioEngine.playEffect("res/sound/effect/time_out.mp3");
                    }
                }), cc.delayTime(1.0)), 5));
            }
        }
    },

    update_curplayer_panel:function(serverSitNum){
        if(!this.is_show) {return;}
        roulette.update_roulette_3d(this.cur_player_panel,serverSitNum);
    },

    init_player_info_panel:function(){
        var player = h1global.player();
        var curGameRoom = h1global.player().curGameRoom;
        for(var i = 0; i < player.curGameRoom.player_num; i++){
            this.update_player_info_panel(i, curGameRoom.playerInfoList[i]);
            this.update_player_online_state(i, curGameRoom.playerInfoList[i]["online"]);
        }
    },

    update_player_info_panel:function(serverSitNum, playerInfo){
        if(serverSitNum < 0 || serverSitNum > 3){
            return;
        }
        var player = h1global.player();
        var idx = player.server2CurSitNum(serverSitNum);
        if(!this.is_show || !cc.sys.isObjectValid(this.rootUINode)) {return;}
        var cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel" + idx.toString());
        if(!playerInfo){
            cur_player_info_panel.setVisible(false);
            return;
        }
        var name_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "name_label");
        var nickname = playerInfo["nickname"];
        nickname =  cutil.info_sub(nickname , 4);
        name_label.setString(nickname);
        var frame_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "frame_img");
        cur_player_info_panel.reorderChild(frame_img, 1);
        frame_img.setTouchEnabled(true);

        frame_img.addTouchEventListener(function(sender, eventType){
            if(eventType == ccui.Widget.TOUCH_ENDED){
                h1global.curUIMgr.gameplayerinfo_ui.show_by_info(playerInfo,serverSitNum);
            }
        });
        var dealer_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "dealer_img");
        cur_player_info_panel.reorderChild(dealer_img, 2);
        var self = this;
        cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function(img){
            if(self.is_show && cur_player_info_panel){
                cur_player_info_panel.getChildByName("portrait_sprite").removeFromParent();
                var portrait_sprite  = new cc.Sprite(img);
                portrait_sprite.setName("portrait_sprite");
                portrait_sprite.setScale(74/portrait_sprite.getContentSize().width);
                portrait_sprite.x = cur_player_info_panel.getContentSize().width * 0.5;
                portrait_sprite.y = cur_player_info_panel.getContentSize().height * 0.5;
                portrait_sprite.setLocalZOrder(-1);
                cur_player_info_panel.addChild(portrait_sprite);
            }
        });

        var score_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "score_label");
        score_label.ignoreContentAdaptWithSize(true);
        score_label.setString((playerInfo["total_score"] == undefined ? 0 : playerInfo["total_score"]).toString());
        var dealer_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "dealer_img");
        dealer_img.setVisible(player.curGameRoom.dealerIdx == serverSitNum);
        if(player.curGameRoom.dealerIdx === serverSitNum){
            dealer_img.loadTexture("res/ui/Default/common_dealer_img.png");
        }
        if(player.startActions["GameRoomUI"]){
            dealer_img.setScale(5);
            dealer_img.runAction(cc.Sequence.create(
                cc.ScaleTo.create(0.5,1),
                cc.CallFunc.create(function () {
                    dealer_img.setScale(1);
                })
            ));
        }

        var owner_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "owner_img");
        cur_player_info_panel.reorderChild(owner_img, 3);
        owner_img.setVisible(player.curGameRoom.playerInfoList[serverSitNum].is_creator);
        cur_player_info_panel.setVisible(true);
    },

    update_player_online_state:function(serverSitNum, state){
        if(serverSitNum < 0 || serverSitNum > 3){
            return;
        }
        var player = h1global.player();
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + player.server2CurSitNum(serverSitNum).toString());
        var state_img = ccui.helper.seekWidgetByName(player_info_panel, "state_img");
        // if(state == 1){
        // 	// state_label.setString("在线");
        // 	// state_label.setColor(cc.color(215, 236, 218));
        // 	state_img.loadTexture("res/ui/GameRoomUI/state_online.png");
        // 	state_img.setVisible(true);
        // } else
        if (state == 0) {
            // state_label.setString("离线");
            // state_label.setColor(cc.color(255, 0, 0));
            state_img.loadTexture("res/ui/GameRoomUI/state_offline.png");
            state_img.setVisible(true);
        } else {
            state_img.setVisible(false);
        }
    },

    _resetSelectTile: function () {
        this.choose_tile_list = [];
        if (this.curSelectTile) {
            this.curSelectTile.setPositionY(0);
            this.curSelectTile = undefined;
            this.cancel_mark_same_tiles();
            this.update_canwin_tile_panel(const_lsbmzmj.NOT_DISPLAY_CANWIN_PANEL);
        }
    },

    init_player_tile_panel:function(){
        var self = this;
        this.kongTilesList = [[], [], [], []];
        this.upTileMarksList = [[], [], [], []];
	    this.handTileMarksList = [[], [], [], []];
        this.discardTileMarksList = [[], [], [], []];
	    this.playDiscardTileMarksList = [];

        this.moving_tile = undefined;
        var player = h1global.player();
        var player_hand_panel = this.rootUINode.getChildByName("player_tile_panel0").getChildByName("player_hand_panel")
        // 14张手牌
        var hand_list = []
        for (var i = 0; i < 14; i++) {
            var tile_img = ccui.helper.seekWidgetByName(player_hand_panel, "tile_img_" + String(i));
            tile_img.index = i;
            hand_list.push(tile_img)
        }
        // 真实手牌
        let handTiles = player.curGameRoom.handTilesList[player.serverSitNum];

        var hand_panel_height = player_hand_panel.getContentSize().height;
        var config = this.getHandTileConfig();

        var idx = player.server2CurSitNum(player.serverSitNum);
        var options = this.get_update_player_hand_tiles_config(idx);
        var offset_x = options.draw.offset.x;

        function choose_tile(tile) {
            if (self.curSelectTile === tile) {
                return;
            }
            var isCanMark = (self.curSelectTile && self.curSelectTile.tileNum !== tile.tileNum) || !self.curSelectTile ? true : false
            if(self.curSelectTile){
                unchoose_tile()
            }
            self.curSelectTile = tile
            self.curSelectTile.setPositionY(config.sel_posy)
            self.update_canwin_tile_panel(self.curSelectTile.tileNum);
            cc.audioEngine.playEffect("res/sound/effect/select_tile.mp3");
            // 游戏场中牌变灰
            if (isCanMark){
                self.mark_same_tiles(tile.tileNum)
            }
        }

        function unchoose_tile() {
            self.curSelectTile.setPositionY(0);
            self.curSelectTile.setVisible(true);
            self.curSelectTile = undefined;
            self.cancel_mark_same_tiles();
            self.update_canwin_tile_panel(const_lsbmzmj.NOT_DISPLAY_CANWIN_PANEL);
        }

        this.moving_tile = undefined;
        function addMoving_tile(tile){
            self.moving_tile = tile.clone();
            self.moving_tile.tileNum = tile.tileNum;
            self.moving_tile.setTouchEnabled(false);
            self.moving_tile.setAnchorPoint(cc.p(0.5, 0.5));
            self.rootUINode.addChild(self.moving_tile);
            if(player.curGameRoom && player.curGameRoom.kingTiles.indexOf(tile.tileNum) >= 0){
                self.mark_king_tile(self.moving_tile);
            }
        }

        function discard_tile(tile, discard_pos) {
            let player = h1global.player();
            if (player){
                self.lastDiscardPosition = discard_pos !== undefined ? discard_pos : player_hand_panel.convertToWorldSpace(tile.getPosition());
                if (self.checkTing && player.gameOperationAdapter.canTingTiles.indexOf(tile.tileNum) >= 0) {
                    player.setDiscardState(const_lsbmzmj.DISCARD_FORCE, tile.tileNum);
                    // player.curGameRoom.tingTileList[player.serverSitNum] = player.curGameRoom.discardTilesList[player.serverSitNum].length;
	                h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
		                ui.checkTing = false;
	                });
	                if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
		                h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
		                h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_discard_tips");
	                }
                } else {
	                h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
		                ui.checkTing = false;
	                });
	                player.doOperation(const_val.OP_DISCARD, [tile.tileNum]);
                }
                h1global.curUIMgr.roomLayoutMgr.notifyObserver("show_ting_panel", false);
                self.rootUINode.getChildByName("ting_operation_panel").getChildByName("ting_btn").setVisible(true);
                // self._setTileNoMask();
                // self.lastDiscardPosition = undefined
                reset_tile()
            } else { //断线
                reset_tile()
            }
        }

        function add_choose_list(tile) {
            if (self.choose_tile_list.length >= 2){
                self.choose_tile_list.splice(0, 1)
            }
            self.choose_tile_list.push(tile)
        }

        function reset_tile() { // 出牌之后 等还原 操作
            if (self.curSelectTile){
                unchoose_tile()
            }
            if (self.moving_tile) {
                self.moving_tile.removeFromParent()
                self.moving_tile = undefined
            }
            self.choose_tile_list = []
        }

        // 面板上的牌event
        function hand_tile_event(tile, touch_mode, sender){
            if (self.moving_tile) {return}
            if (self.touch_state === const_lsbmzmj.PLAYER_TOUCH_SELF_STATE && !player.gameOperationAdapter.canDiscardIdx(tile.index)){ //别人打财神后 限制出牌
                return
            }
	        if (self.checkTing && player.gameOperationAdapter.canTingTiles.indexOf(tile.tileNum) < 0) {
		        return;
	        }
            if(touch_mode == ccui.Widget.TOUCH_BEGAN){ // 只选中
                // 特殊设计 加一个记录touch_began len==2的数组
                add_choose_list(tile)
                choose_tile(tile)
                // 第一次 touch_began 基本上会触发 touch_end 操作 此时不能打出
                if(self.choose_tile_list.length == 2 && self.choose_tile_list[0].index == self.choose_tile_list[1].index && self.curSelectTile.index == self.choose_tile_list[0].index){
                    if (self.choose_tile_list.length >= 1 && self.choose_tile_list[self.choose_tile_list.length-1].index != tile.index){
                        add_choose_list(tile)
                    }
                    if(self.touch_state !== const_lsbmzmj.PLAYER_TOUCH_SELF_STATE){ // 非出牌状态不能出牌
                        return
                    }
                    discard_tile(tile)
                    sender.breakFlag = true;
                }
            } else if (touch_mode == ccui.Widget.TOUCH_MOVED){

                // 打出一张牌后 没放开，移动会触发 touch_moved 立牌
                // 左右 move 是建立在touch_began的基础上的 必须有
                choose_tile(tile)
            } else if (touch_mode == ccui.Widget.TOUCH_ENDED) { // 双击打出
                //touch_end的牌和began的不一样 说明是移动后选中的
                if (self.choose_tile_list.length >= 1 && self.choose_tile_list[self.choose_tile_list.length-1].index != tile.index){
                    add_choose_list(tile)
                }
                // cc.log("choose_tile_list", choose_tile_list)
                if(self.touch_state !== const_lsbmzmj.PLAYER_TOUCH_SELF_STATE){ // 非出牌状态不能出牌
                    return
                }

                // 第一次 touch_began 基本上会触发 touch_end 操作 此时不能打出
                // if(self.choose_tile_list.length == 2 && self.choose_tile_list[0].index == self.choose_tile_list[1].index && self.curSelectTile.index == self.choose_tile_list[0].index){
                //    discard_tile(tile)
                // }
            }
        }

        function touch_func(touch_pos, eventType, sender){
            // cc.log(handTiles)
            let effective_width = self.touch_state === const_lsbmzmj.PLAYER_TOUCH_SELF_STATE ? config.real_width * handTiles.length + offset_x : config.real_width * handTiles.length
            if (touch_pos.x >= 0 && touch_pos.x < effective_width && touch_pos.y >= 0 && touch_pos.y <= hand_panel_height) {
                var touch_idx = Math.floor(touch_pos.x / config.real_width)
                if (self.touch_state === const_lsbmzmj.PLAYER_TOUCH_SELF_STATE && touch_idx + 1 >= handTiles.length) { //3x+2 最后一张特殊处理
                    touch_idx = handTiles.length - 1
                    // cc.log("======>", touch_idx, config.real_width, offset_x, touch_pos, effective_width)
                    if (touch_idx * config.real_width + offset_x <= touch_pos.x && touch_pos.x < effective_width) {
                        // cc.log("3x+2 最后一张特殊处理", touch_idx, touch_pos)
                        hand_tile_event(hand_list[touch_idx], eventType, sender)
                    }
                } else {
                    // cc.log("select_tile2", touch_idx, eventType)
                    // hand_tile_event(hand_list[touch_idx], eventType)
                    // 用户体验调优 向右上方滑动 经过其他牌不选中其他牌
                    if (eventType == ccui.Widget.TOUCH_MOVED){
                        //角度为标准
                        // let began_p = player_hand_panel.convertToNodeSpace(player_hand_panel.getTouchBeganPosition())
                        // let began_idx = Math.floor(began_p.x / config.real_width)
                        // let began_mid_p = cc.p(began_idx * config.real_width + config.real_width/2, config.tile_height/2)
                        //
                        // cc.log(began_mid_p.x , touch_pos.x, config.real_width)
                        // cc.log(touch_pos, began_mid_p, cutil.angle(began_mid_p, touch_pos))
                        // if (Math.abs(began_mid_p.x - touch_pos.x) <= config.real_width * 0.7){ //从began开始 移动距离 小于某个值的时候 触发这一机制
                        // 	if(cutil.angle(began_mid_p, touch_pos) <= 25 || cutil.angle(began_mid_p, touch_pos) >= 155){
                        //        cc.log("1111111111111111111111")
                        //        hand_tile_event(hand_list[touch_idx], eventType)
                        //    } else {
                        // 		cc.log("222222222222222222222222")
                        //        var touch_idx = Math.floor(began_mid_p.x / config.real_width)
                        //        hand_tile_event(hand_list[touch_idx], eventType)
                        // 	}
                        // } else {
                        //    hand_tile_event(hand_list[touch_idx], eventType)
                        // }
                        // 圆心距离为标准
                        // let moved_mid_p = cc.p(touch_idx * config.real_width + config.real_width/2, config.tile_height/2)
                        // if (cutil.distance(moved_mid_p, touch_pos) <= config.real_width/2){
                        //     hand_tile_event(hand_list[touch_idx], eventType)
                        // }
                        // 矩形为标准
                        if (touch_pos.y <= config.bottom_height + config.real_height * 60/100){
                            hand_tile_event(hand_list[touch_idx], eventType, sender)
                        }
                    } else {
                        hand_tile_event(hand_list[touch_idx], eventType, sender)
                    }
                }
            }else{
                if (self.touch_state !== const_lsbmzmj.PLAYER_TOUCH_SELF_STATE && self.curSelectTile) {
                    reset_tile()
                }
            }
        }

        function player_hand_panel_event(sender, eventType){
            // NOTE:下乡禁止触摸和滑动
            if(self.touch_state === const_lsbmzmj.PLAYER_TOUCH_FORCE_STATE || player.curGameRoom.discardStateList[player.serverSitNum] === const_lsbmzmj.DISCARD_FORCE){
                if(self.curSelectTile){
                    reset_tile()
                }
                return;
            }
            if (eventType == ccui.Widget.TOUCH_BEGAN) {
	            if (player.gameOperationAdapter.canTingTiles) {
		            if (player.gameOperationAdapter.canTingTiles.length > 0) {
			            if (self.curSelectTile && player.gameOperationAdapter.canTingTiles.indexOf(self.curSelectTile.tileNum) < 0 && player.curGameRoom.discardStateList[player.serverSitNum] === const_lsbmzmj.DISCARD_FORCE) {
				            reset_tile()
				            return;
			            }
		            }
	            }
                let p = player_hand_panel.convertToNodeSpace(sender.getTouchBeganPosition())
                touch_func(p, eventType, sender)
            } else if (eventType == ccui.Widget.TOUCH_MOVED) {
                if (sender.breakFlag) {
                    return;
                }
	            if (player.gameOperationAdapter.canTingTiles) {
		            if (player.gameOperationAdapter.canTingTiles.length > 0) {
			            if (self.curSelectTile && player.gameOperationAdapter.canTingTiles.indexOf(self.curSelectTile.tileNum) < 0 && player.curGameRoom.discardStateList[player.serverSitNum] === const_lsbmzmj.DISCARD_FORCE) {
				            reset_tile()
				            return;
			            }
		            }
	            }
                let p = player_hand_panel.convertToNodeSpace(sender.getTouchMovePosition())
                touch_func(p, eventType, sender)
                if (self.curSelectTile && !self.moving_tile && self.touch_state === const_lsbmzmj.PLAYER_TOUCH_SELF_STATE && p.y - self.curSelectTile.getPositionY() > 76) { // 向上拖 生成一个 麻将子
                    if (player.gameOperationAdapter.canDiscardIdx(self.curSelectTile.index)){ // 其他玩家打财神后限制出牌
                        addMoving_tile(self.curSelectTile)
                        self.curSelectTile.setVisible(false)
                    }
                }
                if (self.moving_tile) {
                    self.moving_tile.setPosition(self.rootUINode.convertToNodeSpace(player_hand_panel.convertToWorldSpace(p)));
                }
            } else if (eventType == ccui.Widget.TOUCH_CANCELED) {
                if (sender.breakFlag) {
                    sender.breakFlag = false;
                    return;
                }
                if (self.moving_tile) {
                    // 出牌 或者 放弃出牌
                    let py = self.moving_tile.getPositionY()
                    // 出牌
                    if (py > hand_panel_height + config.sel_posy && self.touch_state === const_lsbmzmj.PLAYER_TOUCH_SELF_STATE) {
                        var moving_p = self.moving_tile.getPosition();
                        moving_p = self.rootUINode.convertToWorldSpace(cc.p(moving_p.x-config.tile_width * self.moving_tile.getAnchorPoint().x, moving_p.y-config.tile_height* self.moving_tile.getAnchorPoint().y));
                        discard_tile(self.moving_tile, moving_p)
                    } else { // 放弃出牌
                        reset_tile()
                    }
                }
            } else if (eventType === ccui.Widget.TOUCH_ENDED) {
                if (sender.breakFlag) {
                    sender.breakFlag = false;
                    return;
                }
                let p = player_hand_panel.convertToNodeSpace(sender.getTouchEndPosition())
                touch_func(p, eventType, sender)
                if (self.moving_tile) {
                    reset_tile()
                }
            }
        }
        player_hand_panel.addTouchEventListener(player_hand_panel_event)

        for(var i = 0; i < player.curGameRoom.player_num; i++){
            this.update_player_hand_tiles(i);
            var player_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + i.toString());
            var player_up_panel = player_tile_panel.getChildByName("player_up_panel");
            for(var j = 0; j < 4; j++){
                var from_img = player_up_panel.getChildByName("from_img_" + j.toString());
                player_up_panel.reorderChild(from_img, 3);
            }
            this.update_player_up_tiles(i);
        }
    },

    mark_king_tile:function (tile_img) {
        tile_img.color = const_lsbmzmj.mark_king_color;
    },

	cancel_same_tile:function(tile_img){
		tile_img.color = const_lsbmzmj.mark_none_color;
	},

    mark_prompt_tile:function (tile) {
        var pengTile = tile;
        if(!pengTile){return;}
        var player = h1global.entityManager.player();
        var handTiles = player.curGameRoom.handTilesList[player.serverSitNum];
        var cur_player_hand_panel = this.rootUINode.getChildByName("player_tile_panel0").getChildByName("player_hand_panel");
        for(var j=0;j<handTiles.length;j++){
            if(handTiles[j]==pengTile && player.curGameRoom.kingTiles.indexOf(handTiles[j]) < 0){
                var tile_img = cur_player_hand_panel.getChildByName("tile_img_" + j.toString());
                this.cancel_tile_color(tile_img);
            }else if(player.curGameRoom.kingTiles.indexOf(handTiles[j]) < 0){
                var tile_img = cur_player_hand_panel.getChildByName("tile_img_" + j.toString());
                this.cancel_tile_color(tile_img);
                this.mark_same_tile(tile_img);
            }
        }
    },

    mark_hand_king_tiles:function (hand_tiles) {
        var player = h1global.player();
        if (!player.curGameRoom || player.curGameRoom.kingTiles.length <= 0) {
            return;
        }
        var player_tile_panel = this.rootUINode.getChildByName("player_tile_panel0").getChildByName("player_hand_panel");
        for(var i = 0; i < hand_tiles.length; i++){
            var tile_img = player_tile_panel.getChildByName("tile_img_" + String(i));
            if (player.curGameRoom.kingTiles.indexOf(hand_tiles[i]) >= 0) {
                this.cancel_tile_color(tile_img); //不能有其他颜色 否则会混合 先取消
                this.mark_king_tile(tile_img);
            } else{
                this.cancel_tile_color(tile_img);
            }
        }
    },

    mark_hand_enable_tiles:function () {
        let player = h1global.player();
        let handTiles = player.curGameRoom.handTilesList[player.serverSitNum];
        let player_tile_panel = this.rootUINode.getChildByName("player_tile_panel0").getChildByName("player_hand_panel");
        if(handTiles.length % 3 === 2){
            for(let i=0;i<handTiles.length-1; i++){
                let tile_img = player_tile_panel.getChildByName("tile_img_" + i);
                this.cancel_tile_color(tile_img); //不能有其他颜色 否则会混合 先取消
                this.mark_same_tile(tile_img);
            }
            if(player.curGameRoom.kingTiles.indexOf(handTiles[handTiles.length -1]) >= 0){
                let tile_img = player_tile_panel.getChildByName("tile_img_" + (handTiles.length -1));
                this.mark_king_tile(tile_img)
            }
        }
    },

    mark_discard_king_tiles:function () {
        var player = h1global.player();
        if (!player.curGameRoom || player.curGameRoom.kingTiles.length <= 0) {
            return;
        }
        var list = player.curGameRoom.discardTilesList;
        for(var i = 0; i < list.length; i++){
            var cur_player_discard_panel = this.game_info_panel.getChildByName("player_discard_panel" + player.server2CurSitNum(i));
            var tiles = list[i];

            var tileSum = tiles.length;

            let start = 0 ;
            if(tileSum > const_lsbmzmj.MAX_DISCARD_TILES_SIZE){
                start = tileSum - const_lsbmzmj.MAX_DISCARD_TILES_SIZE;
            }
            for(var j = start; j< tileSum; j++){
                var tile_img = cur_player_discard_panel.getChildByName("tile_img_" + (j- start));
                if(player.curGameRoom.kingTiles.indexOf(tiles[j]) >= 0)	{
                    this.cancel_tile_color(tile_img); //不能有其他颜色 否则会混合 先取消
                    this.mark_king_tile(tile_img);
                }else{
                    this.cancel_tile_color(tile_img);
                }
            }
        }
    },

    mark_same_tile:function(tile_img){
        tile_img.color = const_lsbmzmj.mark_same_color;
    },

    mark_same_tiles:function(tileNum){
        if(tileNum == undefined){
            cc.log("mark tile undefined");
            return;
        }
        var player = h1global.player();
        if (player.curGameRoom && player.curGameRoom.kingTiles.indexOf(tileNum) >= 0) {
            cc.log("mark tile is king");
            return;
        }
        var list = player.curGameRoom.discardTilesList;
        for(var i = 0; i < list.length; i++){
            var cur_player_discard_panel = this.game_info_panel.getChildByName("player_discard_panel" + player.server2CurSitNum(i));
            var tiles = list[i];

            var tingTilePos = undefined;
            var maxDeskSize = const_lsbmzmj.MAX_DISCARD_TILES_SIZE;
            if (player.curGameRoom.discardStateList[i] === const_lsbmzmj.DISCARD_FORCE) {
                tingTilePos = player.curGameRoom.tingTileList[i];
                if (tiles.length > maxDeskSize) {
                    tingTilePos = tingTilePos + maxDeskSize - tiles.length;
                }
            }

            var tileSum = tiles.length;

            let start = 0 ;
            if(tileSum > const_lsbmzmj.MAX_DISCARD_TILES_SIZE){
                start = tileSum - const_lsbmzmj.MAX_DISCARD_TILES_SIZE;
            }
            for(var j = start; j< tileSum; j++){
                if(tiles[j] == tileNum)	{
                    if (tingTilePos >= 0 && tingTilePos === j) {continue;}
                    var tile_img = cur_player_discard_panel.getChildByName("tile_img_" + (j- start));
                    this.mark_same_tile(tile_img);
                }
            }
        }

        var upList = player.curGameRoom.upTilesList;
        if(upList){
            for (var i = 0; i < upList.length; i++) {
                var tiles = upList[i];
                var cur_player_up_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + player.server2CurSitNum(i)).getChildByName("player_up_panel");
                for (var j = 0; j < tiles.length; j++) {
                    let opTile = tiles[j];
                    if(opTile.length > 3){
                        cc.log("杠不需要提示");
                    }else{
                        for (var k = 0; k < 3; k++) {
                            if(opTile[k] === tileNum){
                                var tile_img = cur_player_up_tile_panel.getChildByName("tile_img_" +  (j * 3 + k));
                                this.mark_same_tile(tile_img);
                            }
                        }
                    }
                }
            }
        }
    },

    // 手牌 碰牌 桌面
    find_all_same_tiles:function (tileNum) {
        if(tileNum == undefined || tileNum === 0){
            cc.log("mark tile undefined " , tileNum);
            return;
        }
        var player = h1global.player();
        function findWith2Array(arr ,num) {
            let count =0;
            for (var i = 0; i < arr.length; i++) {
                let tiles = arr[i];
                var tingTilePos = undefined;
                if (tiles == player.curGameRoom.discardTilesList[i]) {
                    if (player.curGameRoom.discardStateList[i] === const_lsbmzmj.DISCARD_FORCE) {
                        tingTilePos = player.curGameRoom.tingTileList[i];
                    }
                }
                for (var j = 0; j < tiles.length; j++) {
                    if (tiles[j] == num && (tingTilePos != j || player.serverSitNum == i)) {
                        count++;
                    }
                }
            }
            return count;
        }

        var tileCount = 0;//计算相同牌的个数
        tileCount += findWith2Array(player.curGameRoom.discardTilesList , tileNum);
        tileCount += findWith2Array(player.curGameRoom.handTilesList , tileNum);

        var upList = player.curGameRoom.upTilesList;
        if(upList){
            for (var i = 0; i < upList.length; i++) {
                let tiles = upList[i];
                for (var j = 0; j < tiles.length; j++) {
                    let opTile = tiles[j];
                    if(opTile.length > 3){
                        if(opTile[3] === tileNum) {
                            tileCount += 4;
                        }
                    }else{
                        for(var k=0; k<opTile.length; k++){
                            if(opTile[k] === tileNum){
                                tileCount += 1;
                            }
                        }
                    }
                }
            }
        }
        return tileCount;
    },

    cancel_tile_color:function(tile_img){
        tile_img.color = const_lsbmzmj.mark_none_color;
    },

    cancel_mark_same_tiles:function(){
        var player = h1global.player();
        var list = player.curGameRoom.discardTilesList;
        for(var i = 0; i < list.length; i++){
            var cur_player_discard_panel = this.game_info_panel.getChildByName("player_discard_panel" + player.server2CurSitNum(i));

            var tiles = list[i];
            var tileSum = tiles.length;
            let start = 0 ;
            if(tileSum > const_lsbmzmj.MAX_DISCARD_TILES_SIZE){
                start = tileSum - const_lsbmzmj.MAX_DISCARD_TILES_SIZE;
            }
            for(var j = start; j< tileSum; j++){
                if(player.curGameRoom.kingTiles.indexOf(tiles[j]) < 0)	{
                    var tile_img = cur_player_discard_panel.getChildByName("tile_img_" + (j  - start));
                    if (tile_img.color.b === const_lsbmzmj.mark_ting_color.b) {
                        continue;
                    }
                    this.cancel_tile_color(tile_img);
                }
            }
        }
        for (var i = 0; i < 4; i++) {
            var cur_player_up_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + i).getChildByName("player_up_panel");
            for(var j = 0; j < 12; j++){
                let tile_img = cur_player_up_tile_panel.getChildByName("tile_img_" + j)
	            if (tile_img.color.b === const_llkddmj.mark_king_color.b) {
		            continue;
	            }
                this.cancel_tile_color(tile_img);
            }
        }
    },

    lock_player_hand_tiles:function(){
        if(!this.is_show) {return;}
        var player = h1global.player();
        this.touch_state = const_lsbmzmj.PLAYER_TOUCH_OTHER_STATE;

        this._resetSelectTile();

        if(this.moving_tile){
            this.moving_tile.removeFromParent();
            this.moving_tile = undefined;
        }
        this.isNeedDiscard = false;
    },

    unlock_player_hand_tiles:function(){
        if(!this.is_show) {return;}
        var player = h1global.player();
        if ((player.curGameRoom.handTilesList[player.serverSitNum].length) % 3 !== 2) {
            return;
        }

        this._resetSelectTile();
        this.touch_state = const_lsbmzmj.PLAYER_TOUCH_SELF_STATE;
        this.isNeedDiscard = true;
        this.update_wintips_btn();
    },

    get_start_begin_anim_config:function(){
        return undefined;
    },

    _setBeginGameShow:function(is_show){
        var player = h1global.player();
        if (player.curGameRoom.kingTiles.length > 0) {
            this.rootUINode.getChildByName("kingtile_panel").setVisible(is_show)
        }
        for (var i = 0; i < player.curGameRoom.player_num; i++) {
            var idx = i === 2 && player.curGameRoom.player_num === 3 ? 3 : i;
            var cur_player_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + idx.toString()).getChildByName("player_hand_panel");
            cur_player_tile_panel.setVisible(is_show);
        }
    },

    _removeStartAnimExecutor:function (self) {
        if(self.startAnimExecutor){
            self.startAnimExecutor.removeFromParent();
            self.startAnimExecutor = undefined;
        }
    },

    startBeginAnim:function(startTilesList, diceList, dealerIdx){
        this.beginAnimPlaying = true;
        this.lock_player_hand_tiles();
        var self = this;

        if(this.startAnimExecutor){
            cc.error("already Playing start anim");
            return;
        }
        var player = h1global.player();
        if (!player){
            return
        }
        this.startAnimExecutor = cc.Node.create();
        this.rootUINode.addChild(this.startAnimExecutor);
	    var curGameRoom = player.curGameRoom;
	    var myServerSitNum = player.serverSitNum;

        function playAnimation(){
            var cur_tile_num = 0;
            self._setBeginGameShow(true)

            var groupSize = 3;
            var repeatCount = curGameRoom.handTilesList[0].length / groupSize + (curGameRoom.handTilesList[0].length % groupSize > 0 ? 1:0);

            // Note: 一开始会显示全部手牌，这里直接隐藏节点
            for(var i = 0; i < curGameRoom.player_num; i++){
                var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i )
                cur_player_tile_panel.setVisible(false);
            }

            var step1 = cc.Repeat.create(
                cc.Sequence.create(cc.DelayTime.create(0.2),
                    cc.CallFunc.create(function(){
                        cur_tile_num += groupSize;
                        for(var i = 0; i < curGameRoom.player_num; i++){
                            cur_tile_num = Math.min(cur_tile_num , startTilesList[i].length);
                            self.update_player_hand_tiles(i, startTilesList[i].slice(0, cur_tile_num));
                        }
                        if(cur_tile_num == groupSize){
                            for(var i = 0; i < curGameRoom.player_num; i++){
                                var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i )
                                cur_player_tile_panel.setVisible(true);
                            }
                        }
                        cc.audioEngine.playEffect("res/sound/effect/deal_tile.mp3");
                    })
                ),
                repeatCount)

            var options = self.get_start_begin_anim_config();

            var step2 = cc.Sequence.create(cc.DelayTime.create(0.1),cc.CallFunc.create(function(){
                    cc.log("start anim step 2-1")
                    // 隐藏手牌 显示盖牌
                    var img = undefined;
                    for (var i = 0; i < 4; i++) {
                        var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i )
                        var cur_player_hand_panel = cur_player_tile_panel.getChildByName("player_hand_panel");
                        cur_player_hand_panel.setVisible(false);

                        var tile_down_anim_node = cc.Node.create();
                        tile_down_anim_node.setName("tile_down_anim_node");
                        tile_down_anim_node.setAnchorPoint(0,0)
                        cur_player_tile_panel.addChild(tile_down_anim_node);

                        tile_down_anim_node.scale = options.downRootNodeScales[i];
                        tile_down_anim_node.setPosition(options.downRootNodeOffsets[i])
                        for(var j = 0; j < 13; j++){
                            if(options.tileTopAndDownImgPaths){
                                img = ccui.ImageView.create(options.tileTopAndDownImgPaths[i].length == 0 ? options.tileDownImgPaths[i] : cc.formatStr(options.tileDownImgPaths[i], options.tileTopAndDownImgPaths[i][j]) ,ccui.Widget.PLIST_TEXTURE);
                            }else{
                                img = ccui.ImageView.create(options.tileDownImgPaths[i] ,ccui.Widget.PLIST_TEXTURE);
                            }
                            if((i == 1 || i == 3) && options.tilescale){
                                img.setScale(1 / (options.tilescale[j] * 0.01));
                            }
                            img.setPosition(options.downTilePositionFuncs[i](j))
                            img.setAnchorPoint(0,0)
                            if(options.downRootNodeAnchorPointX){
                                img.setAnchorPoint(options.downRootNodeAnchorPointX[i],0);
                            }
                            if(options.downRootNodeFlippedX){
                                img.setFlippedX(options.downRootNodeFlippedX[i]);
                            }
                            if(options.downRootNodeRotations){
                                img.setRotation(options.downRootNodeRotations[i]);
                            }
                            tile_down_anim_node.addChild(img);
                        }
                    }

                }),
                cc.DelayTime.create(0.5),
                cc.CallFunc.create(function(){
                    cc.log("start anim step 2-2")
                    // 移除盖牌
                    for(var i = 0; i < curGameRoom.player_num; i++){
                        var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i )
                        var tile_down_anim_node = cur_player_tile_panel.getChildByName("tile_down_anim_node");
                        if(tile_down_anim_node){
                            tile_down_anim_node.removeFromParent();
                            tile_down_anim_node = undefined;
                        }
                    }
                }))

            var step3 = cc.CallFunc.create(function(){
                cc.log("start anim step 3")
                self._removeStartAnimExecutor(self);
                self.beginAnimPlaying = false;
                //显示手牌
                for(var i = 0; i < curGameRoom.player_num; i++){
                    self.update_player_hand_tiles(i, curGameRoom.handTilesList[i]);
                    var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i )
                    var cur_player_hand_panel = cur_player_tile_panel.getChildByName("player_hand_panel");
                    cur_player_hand_panel.setVisible(true);
                }

                var curPlayerSitNum = curGameRoom.curPlayerSitNum;
                if(myServerSitNum == curPlayerSitNum && (curGameRoom.handTilesList[myServerSitNum].length)%3==2){
                    self.unlock_player_hand_tiles();
                    // self.update_operation_panel(player.gameOperationAdapter.getDrawOpDict(curGameRoom.lastDrawTile), const_val.SHOW_DO_OP)
                    var opDict = player.gameOperationAdapter.getDrawOpDict(curGameRoom.lastDrawTile);
                    self.update_operation_panel(opDict, const_val.SHOW_DO_OP);
                    //是否可以听牌
                    if (player.gameOperationAdapter.checkCanTing(opDict)) {
                        self.show_ting_panel(true);
                    }
                } else {
                    self.lock_player_hand_tiles();
                }
                let canWinTiles = player.gameOperationAdapter.getCanWinTiles();
                // self.show_extra_panel(canWinTiles.length > 0);
                cc.audioEngine.playEffect("res/sound/effect/deal_tile.mp3");
            });

            self.startAnimExecutor.runAction(cc.Sequence.create(step1 ,step2 ,step3));
        }

        this._setBeginGameShow(false)
        this.throwTheDice(diceList, dealerIdx, playAnimation);
    },

    stopBeginAnim:function(){
        this._removeStartAnimExecutor(this);
        this.beginAnimPlaying = false;
        this._setBeginGameShow(true);

        //移除骰子
        let dice_node = this.rootUINode.getChildByName("dice_anim_node");
        if(dice_node) dice_node.removeFromParent();

        var player = h1global.player();

        for(var j = 0; j < player.curGameRoom.player_num; j++){
            this.update_player_hand_tiles(j);
            var cur_player_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + j)
            cur_player_tile_panel.setVisible(true);
            var tile_down_anim_node = cur_player_tile_panel.getChildByName("tile_down_anim_node");
            if(tile_down_anim_node){
                tile_down_anim_node.removeFromParent();
                tile_down_anim_node = undefined;
            }
            var cur_player_hand_panel = cur_player_tile_panel.getChildByName("player_hand_panel");
            cur_player_hand_panel.setVisible(true);
        }
        var curPlayerSitNum = player.curGameRoom.curPlayerSitNum;
        if(player.serverSitNum == curPlayerSitNum && (player.curGameRoom.handTilesList[player.serverSitNum].length)%3==2){
            this.unlock_player_hand_tiles();
            var opDict = player.gameOperationAdapter.getDrawOpDict(player.curGameRoom.lastDrawTile);
            this.update_operation_panel(opDict, const_val.SHOW_DO_OP);
            //是否可以听牌
            if (player.gameOperationAdapter.checkCanTing(opDict)) {
                this.show_ting_panel(true);
            }
        } else {
            this.lock_player_hand_tiles();
        }
        let canWinTiles = player.gameOperationAdapter.getCanWinTiles();
        // this.show_extra_panel(canWinTiles.length > 0);
    },

    throwTheDice:function (diceList, dealerIdx, cbkFunc) {
        // is_left = 1 or -1
        function showDice(num1, num2, is_left) {
            let dice1 = ccui.ImageView.create("sezi_Right_0" + num1 + ".png", ccui.Widget.PLIST_TEXTURE);
            dice1.setPosition(cc.winSize.width / 2 + 40, cc.winSize.height / 2 + 20 * is_left);
            dice_anim_node.addChild(dice1);
            let dice2 = ccui.ImageView.create("sezi_Right_0" + num2 + ".png", ccui.Widget.PLIST_TEXTURE);
            dice2.setPosition(cc.winSize.width / 2 - 40, cc.winSize.height / 2 - 20 * is_left);
            dice_anim_node.addChild(dice2);
        }

        var dice_anim_node = cc.Node.create();
        dice_anim_node.setName("dice_anim_node");
        this.rootUINode.addChild(dice_anim_node);

        var diceDouble = undefined;
        for (var i = 0; i < diceList.length; i++) {
            if (diceList[i][0] > 0 && diceList[i][1] > 0) {
                diceDouble = diceList[i];
                break;
            }
        }

        if(diceDouble === undefined){
            cc.error("ThrowTheDice dice undefined");
        }

        function playCbk() {
            dice_anim_node.runAction(cc.sequence(
                cc.callFunc(function () {
                    showDice(diceDouble[0], diceDouble[1], index === 3 ? -1 : 1)
                }),
                cc.delayTime(0.5),
                cc.callFunc(function () {
                    dice_anim_node.removeFromParent();
                    if (cbkFunc) cbkFunc();
                })))
        }
        var effect_info = undefined;
        var player = h1global.player();
        var index = player.server2CurSitNum(dealerIdx);

        var effect_sprite = cc.Sprite.create();
        dice_anim_node.addChild(effect_sprite);

        UICommonWidget.load_effect_plist("sezi");

        if (index === 0) {
            effect_info =  {"TIME" : 0.8, "NAME" : "sezi_C_", "FRAMENUM" : 21};
            effect_sprite.runAction(cc.RepeatForever.create(UICommonWidget.create_effect_action(effect_info)));

            // B 0
            effect_sprite.setPosition(cc.winSize.width /2, 0);
            effect_sprite.runAction(cc.sequence(
                cc.moveTo(0.3, cc.winSize.width / 2, cc.winSize.height * 0.35),
                cc.delayTime(0.15),
                cc.moveTo(0.2, cc.winSize.width / 2, cc.winSize.height * 0.5),
                cc.jumpTo(0.1, cc.p(cc.winSize.width / 2, cc.winSize.height / 2), 20, 1),
                cc.callFunc(function () {
                    effect_sprite.removeFromParent();
                    playCbk();
                })
            ));
        } else if (index === 1) {
            effect_info =  {"TIME" : 0.8, "NAME" : "sezi_B_", "FRAMENUM" : 21};
            effect_sprite.runAction(cc.RepeatForever.create(UICommonWidget.create_effect_action(effect_info)));
            // R 1
            effect_sprite.setPosition(cc.winSize.width, cc.winSize.height * 0.8);
            effect_sprite.runAction(cc.sequence(
                cc.jumpTo(0.5, cc.p(cc.winSize.width / 2 + 100, cc.winSize.height / 2), 50, 1),
                cc.jumpTo(0.3, cc.p(cc.winSize.width / 2, cc.winSize.height / 2), 50, 1),
                cc.callFunc(function () {
                    effect_sprite.removeFromParent();
                    playCbk();
                })
            ))
        } else if (index === 2) {
            effect_info =  {"TIME" : 0.8, "NAME" : "sezi_A_", "FRAMENUM" : 14};
            effect_sprite.runAction(cc.RepeatForever.create(UICommonWidget.create_effect_action(effect_info)));

            // T 2
            effect_sprite.setPosition(cc.winSize.width /2 , cc.winSize.height);
            effect_sprite.runAction(cc.sequence(
                cc.EaseOut.create(cc.moveTo(0.5, cc.winSize.width /2, cc.winSize.height /2), 0.3),
                cc.jumpTo(0.5, cc.p(cc.winSize.width /2, cc.winSize.height /2) ,80,1),
                cc.callFunc(function () {
                    effect_sprite.removeFromParent();
                    playCbk();
                })
            ))

        } else if (index === 3) {
            effect_info =  {"TIME" : 0.8, "NAME" : "sezi_B_", "FRAMENUM" : 21};
            effect_sprite.runAction(cc.RepeatForever.create(UICommonWidget.create_effect_action(effect_info)));
            // L 3
            effect_sprite.setPosition(0 , cc.winSize.height * 0.8);
            effect_sprite.setFlippedX(true);
            effect_sprite.runAction(cc.sequence(
                cc.jumpTo(0.5 , cc.p(cc.winSize.width /2 -100 , cc.winSize.height /2), 50,1),
                cc.jumpTo(0.3, cc.p(cc.winSize.width /2 , cc.winSize.height /2) , 50 ,1),
                cc.callFunc(function () {
                    effect_sprite.removeFromParent();
                    playCbk();
                })
            ))
        }else{
            cc.error("ThrowTheDice not support index" , dealerIdx);
        }
    },

	_createKingTileMark: function (kingtilemarkOptions, idx) {
		var textureFile = kingtilemarkOptions.textureFile || "res/ui/GameRoomUI/kingtilemark.png";
		if (kingtilemarkOptions.textureFile_list !== undefined) {
			textureFile = kingtilemarkOptions.textureFile_list[idx];
		}
		idx = idx || 0;
		var kingtilemark_img = ccui.ImageView.create(textureFile);
		if(kingtilemarkOptions.anchorPoint){
			kingtilemark_img.setAnchorPoint(kingtilemarkOptions.anchorPoint);
		}
		if(kingtilemarkOptions.position){
			kingtilemark_img.setPosition(kingtilemarkOptions.position);
		}
		if(kingtilemarkOptions.scale){
			if(cc.isNumber(kingtilemarkOptions.scale)){
				kingtilemark_img.setScale(kingtilemarkOptions.scale);
			}else{
				kingtilemark_img.setScaleX(kingtilemarkOptions.scale.x);
				kingtilemark_img.setScaleY(kingtilemarkOptions.scale.y);
			}
		}
		if(kingtilemarkOptions.rotate){
			kingtilemark_img.setRotation(kingtilemarkOptions.rotate);
		}
		if(kingtilemarkOptions.flippedY !== undefined){
			kingtilemark_img.setFlippedY(kingtilemarkOptions.flippedY);
		}
		if(kingtilemarkOptions.flippedX !== undefined){
			kingtilemark_img.setFlippedX(kingtilemarkOptions.flippedX);
		}
		if(kingtilemarkOptions.flippedX_list !== undefined){
			kingtilemark_img.setFlippedX(kingtilemarkOptions.flippedX_list[idx]);
		}
		if(kingtilemarkOptions.flippedX_liang_list !== undefined){
			kingtilemark_img.setFlippedX(kingtilemarkOptions.flippedX_liang_list[idx]);
		}
		if(kingtilemarkOptions.positionX_list !== undefined){
			kingtilemark_img.setPositionX(kingtilemarkOptions.positionX_list[idx]);
		}
		if(kingtilemarkOptions.positionX_liang_list !== undefined){
			kingtilemark_img.setPositionX(kingtilemarkOptions.positionX_liang_list[idx]);
		}
		return kingtilemark_img;
	},

    play_hand_draw_anim: function (tile_img,drawOptions) {
        tile_img.setPosition(tile_img.getPositionX() + drawOptions.offset.x, tile_img.getPositionY() + drawOptions.offset.y)

        // var from = drawOptions.animFrom;
        // var to = drawOptions.animTo;
        // tile_img.runAction(cc.Sequence.create(cc.MoveBy.create(0.2, from), cc.MoveBy.create(0.2, to)));
    },

    update_player_hand_tiles: function (serverSitNum, tileList) {
        if (!this.is_show) { return; }
        var player = h1global.player();
        var idx = player.server2CurSitNum(serverSitNum);
        var cur_player_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + idx.toString()).getChildByName("player_hand_panel");
        if (!cur_player_tile_panel) {
            return;
        }

        var discardState = player.curGameRoom.discardStateList[serverSitNum];

        var upTilesList = player.curGameRoom.upTilesList[serverSitNum];

        var handTilesList = tileList ? tileList : player.curGameRoom.handTilesList[serverSitNum];

        for (var i = 0; i < this.handTileMarksList[idx].length; i++) {
            this.handTileMarksList[idx][i].removeFromParent();
        }
        this.handTileMarksList[idx] = [];

        var options = this.get_update_player_hand_tiles_config(idx);

        if (!cur_player_tile_panel.editorOrigin) cur_player_tile_panel.editorOrigin = cur_player_tile_panel.getPosition();

        options.tilePanelOffsetFunc(upTilesList.length , cur_player_tile_panel);

        var mahjong_hand_str = options.mahjongHandImgPath;
        var mahjong_up_str = options.mahjongUpImgPath;
        var mahjong_down_str = options.mahjongDownImgPath;
        var mahjong_txt = options.mahjongTxtImgPath;
        var kingtilemarkOptions = options.kingtilemark;

        var drawOptions = options.draw;
        var tilePositionFunc = options.tilePositionFunc;
        var tileDownPositionFunc = options.tileDownPositionFunc;
        var isPlayer = idx === 0;

        for (var i = 0; i < 14; i++) {
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + i.toString());
            tile_img.stopAllActions();
            tilePositionFunc(tile_img, i);

            if(handTilesList[i] !== undefined){
                if(handTilesList[i] > 0){
                    //玩家自己 给自己看手牌
                    tile_img.tileNum = handTilesList[i];
                    tile_img.loadTexture(mahjong_hand_str, ccui.Widget.PLIST_TEXTURE);
                    if(isPlayer){
                        if(discardState === const_lsbmzmj.DISCARD_FORCE){
                            this.mark_same_tile(tile_img);
                            this.lock_player_hand_tiles();
                        }else{
                            this.cancel_tile_color(tile_img);
                        }
                        // this.cancel_tile_color(tile_img);
                    }
                    tile_img.setVisible(true);
                    var mahjong_img = tile_img.getChildByName("mahjong_img");
                    mahjong_img.ignoreContentAdaptWithSize(true);

                    mahjong_img.loadTexture(cc.formatStr(mahjong_txt, handTilesList[i]), ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.setVisible(true);
                    if (player.curGameRoom.kingTiles.indexOf(handTilesList[i]) >= 0) {
                        var kingtilemark_img = this._createKingTileMark(kingtilemarkOptions);
                        this.handTileMarksList[idx].push(kingtilemark_img);
                        tile_img.addChild(kingtilemark_img);
                    }
                }else{
                    //不是玩家自己，不明牌显示
                    if(isPlayer){
                        tile_img.setVisible(false)
                    }else{
                        var mahjong_img = tile_img.getChildByName("mahjong_img");
                        mahjong_img.setVisible(false);
                        tile_img.ignoreContentAdaptWithSize(true);
                        tile_img.loadTexture(mahjong_hand_str, ccui.Widget.PLIST_TEXTURE);
                        if(options.tilescale){
                            tile_img.setScale(options.tilescale[i] * 0.01);
                        }
                        tile_img.setVisible(true);
                    }
                }
            }else{
                tile_img.setVisible(false);
            }
        }
        // if (this.autoDiscardHint && isPlayer) {
        //     this.autoDiscardHint.removeFromParent();
        //     this.autoDiscardHint = undefined;
        // }

        if (handTilesList.length % 3 == 2 && !this.beginAnimPlaying) {
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + (handTilesList.length - 1).toString());
            this.play_hand_draw_anim(tile_img , drawOptions);

            // if(isPlayer){
            //     this.autoDiscardHint = ccui.ImageView.create();
            //     this.autoDiscardHint.loadTexture("res/ui/GameRoomUI/gameroom_autodiscard_light.png");
            //     this.autoDiscardHint.setPosition(cc.p(tile_img.getContentSize().width * 0.5, tile_img.getContentSize().height * 0.5));
            //     tile_img.addChild(this.autoDiscardHint);
            // }
        }

        if(serverSitNum == player.serverSitNum && player.curGameRoom.discardStateList[serverSitNum] === const_lsbmzmj.DISCARD_FREE){
            // if(player.curGameRoom && player.curGameRoom.discard_king_idx >= 0 && player.curGameRoom.discard_king_idx !== player.serverSitNum && handTilesList.length % 3 === 2){
            //    this.mark_hand_enable_tiles()
            // }else{
            this.mark_hand_king_tiles(handTilesList)
            // }
        }
        // if (player.curGameRoom && player.curGameRoom.discard_king_idx >= 0 && player.curGameRoom.discard_king_idx !== player.serverSitNum){
        // 	this.mark_hand_enable_tiles()
        // } else if(serverSitNum === player.serverSitNum){
        //    this.mark_hand_king_tiles(handTilesList)
        // }
    },

    get_update_player_hand_tiles_config:function (index) {
        cc.log("not impl get_update_player_hand_tiles_config");
    },

    update_player_exposed_tiles: function (serverSitNum, tileList, playDrawAnim) {
        if (!this.is_show) return;
        var player = h1global.player();
        var idx = player.server2CurSitNum(serverSitNum);
        var cur_player_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + idx.toString()).getChildByName("player_exposed_panel");
        if (!cur_player_tile_panel) return;
        cur_player_tile_panel.setVisible(true);

        var discardState = player.curGameRoom.discardStateList[serverSitNum];

        var upTilesList = player.curGameRoom.upTilesList[serverSitNum];

        var handTilesList = tileList ? tileList : player.curGameRoom.handTilesList[serverSitNum];

	    for (var i = 0; i < this.handTileMarksList[idx].length; i++) {
		    this.handTileMarksList[idx][i].removeFromParent();
	    }
	    this.handTileMarksList[idx] = [];

        var options = this.get_update_player_exposed_tiles_config(idx);

        if (options.tilePanelOffsetFunc) {
            if(!cur_player_tile_panel.editorOrigin){
                cur_player_tile_panel.editorOrigin = cur_player_tile_panel.getPosition();
            }
            options.tilePanelOffsetFunc(upTilesList.length, cur_player_tile_panel);
        }

        var mahjong_up_str = options.mahjongUpImgPath;
        var mahjong_txt = options.mahjongTxtImgPath;
	    var kingtilemarkOptions = options.kingtilemark;

        var drawOptions = options.draw;
        var tilePositionFunc = options.tilePositionFunc;

        for (var i = 0; i < 14; i++) {
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + i.toString());
            tile_img.stopAllActions();
            tilePositionFunc(tile_img, i);

            if (handTilesList[i] !== undefined) {
                if (handTilesList[i] > 0) {
                    tile_img.tileNum = handTilesList[i];
                    if(options.mahjongUpImgList){
                        tile_img.loadTexture(cc.formatStr(mahjong_up_str, options.mahjongUpImgList[(i + upTilesList.length * 3) > 13 ? 13 : (i + upTilesList.length * 3) % 14]), ccui.Widget.PLIST_TEXTURE);
                    }else{
                        tile_img.loadTexture(mahjong_up_str, ccui.Widget.PLIST_TEXTURE);
                    }
                    tile_img.setVisible(true);
                    var mahjong_img = tile_img.getChildByName("mahjong_img");
                    mahjong_img.ignoreContentAdaptWithSize(true);

                    mahjong_img.loadTexture(cc.formatStr(mahjong_txt, handTilesList[i]), ccui.Widget.PLIST_TEXTURE);
                    if(options.mahjongRotationXList){
                        mahjong_img.setRotationX(options.mahjongRotationXList[(i + upTilesList.length * 3) > 13 ? 13 : (i + upTilesList.length * 3) % 14]);
                    }else if(options.mahjongSkewY){
                        mahjong_img.setSkewY(options.mahjongSkewY);
                    }
                    if(options.mahjongTxtScale){
                        mahjong_img.setScaleX(options.mahjongTxtScale.x);
                        mahjong_img.setScaleY(options.mahjongTxtScale.y);
                    }
                    if(options.mahjongTxtFlippedY !== undefined){
                        mahjong_img.setFlippedY(options.mahjongTxtFlippedY);
                    }
	                if(options.mahjongTxtFlippedX !== undefined){
		                mahjong_img.setFlippedX(options.mahjongTxtFlippedX);
	                }
                    if(options.mahjongOrderList){
                        tile_img.setLocalZOrder(options.mahjongOrderList[(i + upTilesList.length * 3) > 13 ? 0 : (i + upTilesList.length * 3) % 14]);
                    }
	                if (player.curGameRoom.kingTiles.indexOf(handTilesList[i]) >= 0) {
		                var kingtilemark_img = this._createKingTileMark(kingtilemarkOptions, parseInt((i / 3) > 3 ? 3 : (i / 3)));
		                this.handTileMarksList[idx].push(kingtilemark_img);
		                tile_img.addChild(kingtilemark_img);
	                }
                    mahjong_img.setVisible(true);
                    if (discardState === const_lsbmzmj.DISCARD_FORCE) {
                        this.mark_same_tile(tile_img);
                    } else {
                        this.cancel_tile_color(tile_img);
                    }
                } else {
                    tile_img.setVisible(false)
                }
            } else {
                tile_img.setVisible(false);
            }
        }

        if (playDrawAnim && handTilesList.length % 3 === 2 && !this.beginAnimPlaying) {
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + (handTilesList.length - 1).toString());
            this.play_hand_draw_anim(tile_img , drawOptions);
        }
    },

    get_update_player_exposed_tiles_config:function (index) {
        cc.log("not impl get_update_player_exposed_tiles_config");
    },

    get_update_player_up_tiles_config:function(index){
        cc.log("not impl get_update_player_up_tiles_config");
    },

    update_player_up_tiles: function (serverSitNum) {
        if (!this.is_show) { return; }
        var player = h1global.player();
        var idx = player.server2CurSitNum(serverSitNum);
        var cur_player_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + idx.toString()).getChildByName("player_up_panel");
        if (!cur_player_tile_panel) {
            return;
        }

        var cur_upTilesList = player.curGameRoom.upTilesList[serverSitNum];
        var curUpNum = cur_upTilesList.length;

        for (var i = curUpNum * 3; i < 12; i++) {
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + i.toString());
            tile_img.setVisible(false);
        }
        for (var i = 0; i < this.kongTilesList[idx].length; i++) {
	        this.kongTilesList[idx][i].retain();
            this.kongTilesList[idx][i].removeFromParent();
        }
        this.kongTilesList[idx] = [];
        for (var i = 0; i < this.upTileMarksList[idx].length; i++) {
            this.upTileMarksList[idx][i].retain();
            this.upTileMarksList[idx][i].removeFromParent();
        }
        this.upTileMarksList[idx] = [];

        var options = this.get_update_player_up_tiles_config(idx);

        var mahjong_up_str = options.mahjongUpImgPath;
        var mahjong_down_str = options.mahjongDownImgPath;
        var mahjong_up_kong_str = options.mahjongUpKongImgPath;
        var mahjong_down_kong_str = options.mahjongDownKongImgPath;
        var mahjong_small_txt = options.mahjongTxtPath;

        var kingtilemarkOptions = options.kingtilemark;

        for (var i = 0; i < curUpNum; i++) {
            for (var j = 0; j < 3; j++) {
                var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + (3 * i + j).toString());
                var mahjong_img = tile_img.getChildByName("mahjong_img");
                if (cur_upTilesList[i][j]) {
                    if (cc.isFunction(mahjong_up_str)) {
                        tile_img.loadTexture(mahjong_up_str(i, j), ccui.Widget.PLIST_TEXTURE);
                    } else{
                        tile_img.loadTexture(mahjong_up_str, ccui.Widget.PLIST_TEXTURE);
                    }
                    mahjong_img.ignoreContentAdaptWithSize(true);
                    mahjong_img.loadTexture(cc.formatStr(mahjong_small_txt, cur_upTilesList[i][j]), ccui.Widget.PLIST_TEXTURE);
                    if(options.mahjongTxtSkew && cc.isFunction(options.mahjongTxtSkew)){
                        let p =options.mahjongTxtSkew(i,j);
                        mahjong_img.setRotationX(p.x);
                        mahjong_img.setSkewY(p.y);
                    }else if(options.mahjongTxtSkew && !cc.isFunction(options.mahjongTxtSkew)){
                        mahjong_img.setSkewY(options.mahjongTxtSkew.y);
                    }
                    if(options.mahjongTxtScale){
                        if(cc.isNumber(options.mahjongTxtScale)){
                            mahjong_img.setScale(options.mahjongTxtScale);
                        }else {
                            mahjong_img.setScaleX(options.mahjongTxtScale.x);
                            mahjong_img.setScaleY(options.mahjongTxtScale.y);
                        }
                    }
                    if(options.mahjongTxtFlippedX !== undefined){
                        mahjong_img.setFlippedX(options.mahjongTxtFlippedX);
                    }
                    if(options.mahjongTxtFlippedY !== undefined){
                        mahjong_img.setFlippedY(options.mahjongTxtFlippedY);
                    }
                    mahjong_img.setVisible(true);
                    if (player.curGameRoom.kingTiles == cur_upTilesList[i][j] && kingtilemarkOptions) {
                        var kingtilemark_img = this._createKingTileMark(kingtilemarkOptions, i);
                        tile_img.addChild(kingtilemark_img);
                        this.upTileMarksList[idx].push(kingtilemark_img);
	                    this.cancel_same_tile(tile_img);
                        this.mark_king_tile(tile_img);
                    }
                } else {
                    if (cc.isFunction(mahjong_down_str)) {
                        tile_img.loadTexture(mahjong_down_str(i, j), ccui.Widget.PLIST_TEXTURE);
                    } else{
                        tile_img.loadTexture(mahjong_down_str, ccui.Widget.PLIST_TEXTURE);
                    }
                    mahjong_img.setVisible(false);
                }
                tile_img.setVisible(true);
            }

            if (cur_upTilesList[i].length > 3) {
                var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "tile_img_" + (3 * i + 1).toString());
                var kong_tile_img = tile_img.clone();
                this.kongTilesList[idx].push(kong_tile_img);
                var mahjong_img = kong_tile_img.getChildByName("mahjong_img");
                if (cur_upTilesList[i][3]) {
                    if(cc.isFunction(mahjong_up_kong_str)){
                        kong_tile_img.loadTexture(mahjong_up_kong_str(i), ccui.Widget.PLIST_TEXTURE);
                    }else{
                        kong_tile_img.loadTexture(mahjong_up_kong_str, ccui.Widget.PLIST_TEXTURE);
                    }

                    if(options.mahjongKongTxtSkew && cc.isFunction(options.mahjongKongTxtSkew)){
                        let p =options.mahjongKongTxtSkew(i);
                        mahjong_img.setRotationX(p.x);
                        mahjong_img.setSkewY(p.y);
                    }else if(options.mahjongTxtSkew && !cc.isFunction(options.mahjongTxtSkew)){
                        mahjong_img.setSkewY(options.mahjongTxtSkew.y);
                    }
                    if(options.mahjongTxtScale){
                        if(cc.isNumber(options.mahjongTxtScale)){
                            mahjong_img.setScale(options.mahjongTxtScale);
                        }else {
                            mahjong_img.setScaleX(options.mahjongTxtScale.x);
                            mahjong_img.setScaleY(options.mahjongTxtScale.y);
                        }
                    }
                    if(options.mahjongTxtFlippedX !== undefined){
                        mahjong_img.setFlippedX(options.mahjongTxtFlippedX);
                    }
                    if(options.mahjongTxtFlippedY !== undefined){
                        mahjong_img.setFlippedY(options.mahjongTxtFlippedY);
                    }
                    mahjong_img.ignoreContentAdaptWithSize(true);
                    mahjong_img.loadTexture(cc.formatStr(mahjong_small_txt, cur_upTilesList[i][3]), ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.setVisible(true);
                    if (player.curGameRoom.kingTiles == cur_upTilesList[i][3] && kingtilemarkOptions) {
	                    var kingtilemark_img = this._createKingTileMark(kingtilemarkOptions, i);
	                    this.upTileMarksList[idx].push(kingtilemark_img);
	                    kong_tile_img.addChild(kingtilemark_img);
	                    this.cancel_same_tile(kong_tile_img);
	                    this.mark_king_tile(kong_tile_img);
                    }
                    if(cc.isArray(options.kongTileUpOffset.x) && cc.isArray(options.kongTileUpOffset.y)) {
                        kong_tile_img.setPosition(kong_tile_img.getPositionX() + options.kongTileUpOffset.x[i], kong_tile_img.getPositionY() + options.kongTileUpOffset.y[i]);
                    }else if(cc.isArray(options.kongTileUpOffset.x)) {
                        kong_tile_img.setPosition(kong_tile_img.getPositionX() + options.kongTileUpOffset.x[i], kong_tile_img.getPositionY() + options.kongTileUpOffset.y);
                    }else if(cc.isArray(options.kongTileUpOffset.y)){
                        kong_tile_img.setPosition(kong_tile_img.getPositionX() + options.kongTileUpOffset.x, kong_tile_img.getPositionY() + options.kongTileUpOffset.y[i]);
                    }else{
                        kong_tile_img.setPosition(kong_tile_img.getPositionX() + options.kongTileUpOffset.x, kong_tile_img.getPositionY() + options.kongTileUpOffset.y);
                    }
                } else {
                    if(cc.isFunction(mahjong_down_kong_str)){
                        kong_tile_img.loadTexture(mahjong_down_kong_str(i), ccui.Widget.PLIST_TEXTURE);
                    }else{
                        kong_tile_img.loadTexture(mahjong_down_kong_str, ccui.Widget.PLIST_TEXTURE);
                    }
                    mahjong_img.setVisible(false);
                    kong_tile_img.setPosition(kong_tile_img.getPositionX() + options.kongTileDownOffset.x , kong_tile_img.getPositionY() + options.kongTileDownOffset.y);
                }
                kong_tile_img.setVisible(true);
                cur_player_tile_panel.addChild(kong_tile_img);
            }
            var ops = player.curGameRoom.upTilesOpsList[serverSitNum][i];
            var from_img = cur_player_tile_panel.getChildByName("from_img_" + i.toString());
            if (ops) {
                if(from_img.editorOrigin === undefined){
                    from_img.editorOrigin = from_img.getPosition();
                }
                var from_idx = player.server2CurSitNum(ops[ops.length - 1]["fromIdx"]);
                if(ops[ops.length - 1].opId == const_val.OP_CONTINUE_KONG) {
                    //from_idx = player.server2CurSitNum(ops[0]["fromIdx"]);
                }
                if(options.fromImgRotate) {
                    from_img.setRotation(- from_idx * 90 + options.fromImgRotate);
                } else {
                    from_img.setRotation(- from_idx * 90);
                }
                if (ops[ops.length - 1].opId == const_val.OP_CHOW) {
                    from_img.setPosition(from_img.editorOrigin)
                } else if (ops[ops.length - 1].opId == const_val.OP_PONG) {
                    from_img.setPosition(from_img.editorOrigin)
                } else {
                    if(options.kongArrowOffset){
                        from_img.setPosition(from_img.editorOrigin.x + options.kongArrowOffset.x,from_img.editorOrigin.y + options.kongArrowOffset.y)
                    }else{
                        from_img.setPosition(from_img.editorOrigin)
                    }
                    if(options.fromImgPos) {
                        if (cc.isArray(options.fromImgPos)) {
                            from_img.setPosition(cc.p(from_img.getPosition().x + options.fromImgPos[i][0], from_img.getPosition().y + options.fromImgPos[i][1]));
                        } else {
                            from_img.setPosition(cc.p(from_img.getPosition().x + options.fromImgPos.x, from_img.getPosition().y + options.fromImgPos.y));
                        }
                    }
                }
                from_img.setVisible(true);
            } else {
                from_img.setVisible(false);
            }
            if(options.upPanelOffsetFunc){
                if(!cur_player_tile_panel.editorOrigin){
                    cur_player_tile_panel.editorOrigin = cur_player_tile_panel.getPosition();
                }
                cur_player_tile_panel.setPosition(options.upPanelOffsetFunc(curUpNum , cur_player_tile_panel.editorOrigin))
            }
        }
    },

    init_player_discard_panel:function(){
        var player = h1global.player();
        for(var i = 0; i < player.curGameRoom.player_num; i++){
            this.update_player_discard_tiles(i);
        }
        this.lastDiscardTilePointer = undefined;
    },

    remove_last_discard_tile:function(serverSitNum){
        if(this.lastDiscardTilePointer){
            this.lastDiscardTilePointer.removeFromParent();
            this.lastDiscardTilePointer = undefined;
        }
        this.update_player_discard_tiles(serverSitNum);
    },

    get_play_discard_anim_config:function(serverSitNum,index, onlyTilePointer){
        return undefined;
    },

    play_discard_anim:function(serverSitNum, onlyTilePointer, buckle){
        if(!this.is_show) {return;}
        //Note:只播放一个界面的出牌动画
        // 因为现在2个界面直接通过 Visible 控制是否渲染，此处直接判断isVisible即可
        if(!this.isVisible())return;

        buckle = buckle || 0;
        onlyTilePointer = onlyTilePointer || false;
        var player = h1global.player();
        var idx = player.server2CurSitNum(serverSitNum);
        var isPlayer = idx === 0;
        var discardTilesList = player.curGameRoom.discardTilesList[serverSitNum];
        var discardTilesSum = discardTilesList.length;

        var options = this.get_play_discard_anim_config(serverSitNum , idx , onlyTilePointer);

	    for (var i = 0; i < this.playDiscardTileMarksList.length; i++) {
		    this.playDiscardTileMarksList[i].removeFromParent();
	    }
	    this.playDiscardTileMarksList = [];

        var tilePointer = this.lastDiscardTilePointer;
        if(tilePointer === undefined){
            tilePointer = ccui.ImageView.create();
            tilePointer.loadTexture("res/ui/GameRoomUI/gameroom_tile_pointer.png");
            this.lastDiscardTilePointer = tilePointer;
        }
        if(options.pointerScale) tilePointer.scale = options.pointerScale;

        var discardIndex = 0;
        if (discardTilesSum > 0) discardIndex = discardTilesSum - 1;
        if(discardTilesSum > const_lsbmzmj.MAX_DISCARD_TILES_SIZE) discardIndex = const_lsbmzmj.MAX_DISCARD_TILES_SIZE - 1;

        var cur_player_discard_panel = this.game_info_panel.getChildByName("player_discard_panel" + idx.toString());
        var cur_discard_tile_img = cur_player_discard_panel.getChildByName("tile_img_" + discardIndex);
        tilePointer.retain();
        tilePointer.removeFromParent();
        cur_discard_tile_img.addChild(tilePointer);
        tilePointer.release();

        this.play_discard_pointer_anim(tilePointer , options.pointerPosition);

        if(!onlyTilePointer){
            var tile_img = this.discard_tile_anim_img;
            var tileNum = player.curGameRoom.discardTilesList[serverSitNum][discardTilesSum -1];
            var mahjong_img = tile_img.getChildByName("mahjong_img");
            mahjong_img.loadTexture(cc.formatStr(options.mahjongTxtPath , tileNum), ccui.Widget.PLIST_TEXTURE);
            tile_img.stopAllActions();
            tile_img.setVisible(true);
	        if (player.curGameRoom.kingTiles.indexOf(tileNum) >= 0) {
		        var kingtilemark_img = ccui.ImageView.create("res/ui/GameRoomUI/kingtilemark.png");
		        kingtilemark_img.setAnchorPoint(0.0, 1.0);
		        kingtilemark_img.setPosition(cc.p(19, 105));
		        kingtilemark_img.setScale(1);
		        this.playDiscardTileMarksList.push(kingtilemark_img);
		        tile_img.addChild(kingtilemark_img);
	        }
            if (buckle === 1) {
                tile_img.loadTexture("Mahjong/mahjong_tile_top_hand.png", ccui.Widget.PLIST_TEXTURE);
                mahjong_img.setVisible(false);
            } else {
                tile_img.loadTexture("Mahjong/mahjong_tile_player_hand.png", ccui.Widget.PLIST_TEXTURE);
                mahjong_img.setVisible(true);
            }

            cur_discard_tile_img.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(function () {
                if (cur_discard_tile_img.tile_num && cur_discard_tile_img.tile_num > 0) {
	                cc.audioEngine.playEffect("res/sound/effect/sound_tileout.mp3");
                    cur_discard_tile_img.setVisible(true);
                }
            })));
            if(player.curGameRoom && player.curGameRoom.kingTiles.indexOf(tileNum) >= 0 && isPlayer){
                this.mark_king_tile(tile_img);
            }else{
                this.cancel_tile_color(tile_img);
            }
            tile_img.setVisible(false);
            // this.play_discard_fly_anim(tile_img, cur_discard_tile_img, options.tileStartPosition, options.tileEndPosition, options.tileMidPosition, idx);
            this.lastDiscardPosition = undefined
        }
    },

    get_play_fly_anim_end_time:function () {
        return 0.2;
    },

    play_discard_pointer_anim:function(tilePointer , position){
        tilePointer.setPosition(position);
        tilePointer.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.MoveBy.create(0.3, cc.p(0, 10)), cc.MoveBy.create(0.3, cc.p(0, -10)))));
    },

    play_discard_fly_anim:function(tile_img,discard_tile,start_position, end_position, mid_position, idx){
        cc.log("not imp play_discard_fly_anim")
    },

    get_player_discard_tiles_config:function(index){
        return undefined;
    },

    update_player_discard_tiles:function(serverSitNum){
        if(!this.is_show) {return;}
        var player = h1global.player();
        var idx = player.server2CurSitNum(serverSitNum);
        var cur_player_discard_panel = this.game_info_panel.getChildByName("player_discard_panel" + idx.toString());
        if(!cur_player_discard_panel){
            cc.warn("cur_player_discard_panel not found" , idx);
            return;
        }

        for(var i = 0; i < this.discardTileMarksList[idx].length; i++){
            this.discardTileMarksList[idx][i].removeFromParent();
        }
        this.discardTileMarksList[idx] = [];

        var  options = this.get_player_discard_tiles_config(idx);

        var deskSize = const_lsbmzmj.DISCARD_TILES_SIZE;
        var maxDeskSize = const_lsbmzmj.MAX_DISCARD_TILES_SIZE;
        var mahjong_desk_str = options.mahjongDeskImgPath;
        var mahjong_down_str = options.mahjongDownImgPath;
        var mahjong_txt_str = options.mahjongTxtPath;

        var discardTilesList = player.curGameRoom.discardTilesList[serverSitNum];
        var tingTilePos = undefined;
        if (player.curGameRoom.discardStateList[serverSitNum] === const_lsbmzmj.DISCARD_FORCE) {
            tingTilePos = player.curGameRoom.tingTileList[serverSitNum];
            if (discardTilesList.length > maxDeskSize) {
                tingTilePos = tingTilePos + maxDeskSize - discardTilesList.length;
            }
        }
        // 移除超过最大数量的前面的牌
        if(discardTilesList.length > maxDeskSize){
            discardTilesList = discardTilesList.slice(discardTilesList.length - maxDeskSize)
        }

        var isPlayer = idx === 0;
        for(var i = 0; i < deskSize; i++){
            var tile_img = ccui.helper.seekWidgetByName(cur_player_discard_panel, "tile_img_" + i.toString());
            if(i < maxDeskSize && discardTilesList[i] > 0){
                tile_img.tile_num = discardTilesList[i];
                var mahjong_img = tile_img.getChildByName("mahjong_img");
                if(options.mahjongdesk){
                    tile_img.loadTexture(cc.formatStr(mahjong_desk_str , options.mahjongdesk[(i + 10) % 10]), ccui.Widget.PLIST_TEXTURE);
                }else {
                    tile_img.loadTexture(mahjong_desk_str, ccui.Widget.PLIST_TEXTURE);
                }
                mahjong_img.ignoreContentAdaptWithSize(true);
                if (options.mahjong) {
                    if (options.mahjong.positionX) {mahjong_img.setPositionX(options.mahjong.positionX[(i + 10) % 10]);}
                    if (options.mahjong.flippedX !== undefined) {mahjong_img.setFlippedX(options.mahjong.flippedX);}
                    if (options.mahjong.flippedY !== undefined) {mahjong_img.setFlippedY(options.mahjong.flippedY);}
                    if (options.mahjong.flippedX_list) {mahjong_img.setFlippedX(options.mahjong.flippedX_list[(i + 10) % 10]);}
                    if (options.mahjong.scale) {mahjong_img.setScale(options.mahjong.scale[0], options.mahjong.scale[1]);}
                    if (options.mahjong.rotationX) {mahjong_img.setRotationX(options.mahjong.rotationX[(i + 10) % 10]);}
                    if (options.mahjong.skewY) {mahjong_img.setSkewY(options.mahjong.skewY);}
                } else {
                    cc.log("not mahjong params", this.uiType);
                }
                mahjong_img.loadTexture(cc.formatStr(mahjong_txt_str , discardTilesList[i]), ccui.Widget.PLIST_TEXTURE);
                tile_img.setVisible(true);
                this.cancel_tile_color(tile_img);
                if(player.curGameRoom.kingTiles.indexOf(discardTilesList[i]) >= 0 && !(tingTilePos >= 0 && tingTilePos === i && !isPlayer)){
                    this.mark_king_tile(tile_img);
                    if(options.kingtilemark){
                        var kingtilemark_img = this._createKingTileMark(options.kingtilemark, (i + 10) % 10)
                        this.discardTileMarksList[idx].push(kingtilemark_img);
                        tile_img.addChild(kingtilemark_img);
                    }else{
                        cc.error("not kingtilemark params" , options)
                    }
                }
                //this.cancel_tile_color(tile_img);
                if (tingTilePos >= 0 && tingTilePos === i) {
                    if (isPlayer) {
                        // this.mark_same_tile(tile_img);
                        tile_img.color = const_lsbmzmj.mark_ting_color;
                    } else {
                        if (options.mahjongdesk) {
                            tile_img.loadTexture(cc.formatStr(mahjong_down_str , options.mahjongdesk[(i + 10) % 10]), ccui.Widget.PLIST_TEXTURE);
                        }else {
                            tile_img.loadTexture(mahjong_down_str, ccui.Widget.PLIST_TEXTURE);
                        }
                        mahjong_img.setVisible(false);
                    }
                } else {
                    mahjong_img.setVisible(true);
                }
            } else {
                tile_img.tile_num = null;
                tile_img.setVisible(false);
            }
        }
        //this.mark_discard_king_tiles()
    },

    init_operation_panel:function(){
        var player = h1global.player();
	    player.gameOperationAdapter.canTingTiles = [];
        if(player.curGameRoom.waitAidList.length > 0){
            // 重连等待玩家判断，此时需要告诉玩家上一张打出的牌是哪一张
            this.play_discard_anim(player.curGameRoom.lastDiscardTileFrom, true);
            player.waitForOperation(player.curGameRoom.waitAidList, [player.curGameRoom.lastDiscardTile]);
        } else if(player.curGameRoom.curPlayerSitNum == player.serverSitNum && (player.curGameRoom.handTilesList[player.serverSitNum].length)%3==2){
            if (player.startActions["GameRoomUI"]) {return;}
            var opDict = {};
            if (player.curGameRoom.last_op == const_val.OP_DRAW){
                opDict = player.gameOperationAdapter.getDrawOpDict(player.curGameRoom.lastDrawTile);
                this.update_operation_panel(opDict, const_val.SHOW_DO_OP);
            }else {
                opDict = player.gameOperationAdapter.getPongKongOpDict();
                this.update_operation_panel(opDict, const_val.SHOW_DO_OP);
            }

            //轮到自己，是否可以听牌
            if (player.gameOperationAdapter.checkCanTing(opDict)) {
                this.show_ting_panel(true);
            }

            // 轮到自己摸牌, 不一定可以进行打牌操作
            if (const_val.SEASON.indexOf(player.curGameRoom.lastDrawTile) < 0 && const_val.FLOWER.indexOf(player.curGameRoom.lastDrawTile) < 0) {
                this.unlock_player_hand_tiles();
            }
        }
    },

    init_canwin_tile_panel:function () {
        var self = this;
        var canwin_tile_panel = self.rootUINode.getChildByName("canwin_tile_panel");
        canwin_tile_panel.removeAllChildren(true);
        // canwin_tile_panel.width = 150;
        canwin_tile_panel.setVisible(false);
        var canwin_title_img = ccui.ImageView.create();
        canwin_title_img.setAnchorPoint(0.5,0.5);
        canwin_title_img.setName("canwin_title_img");
        canwin_title_img.loadTexture("res/ui/GameRoomUI/canwin_tile.png");
        canwin_tile_panel.addChild(canwin_title_img);
        canwin_title_img.setPosition(cc.p(canwin_tile_panel.width * 0.5, canwin_tile_panel.height * 0.83));

        var tile_img = ccui.ImageView.create();
        tile_img.setAnchorPoint(0.5,0.5);
        tile_img.setName("tile_img");
        tile_img.loadTexture("Mahjong/mahjong_tile_player_hand.png", ccui.Widget.PLIST_TEXTURE);
        tile_img.setPosition(cc.p(75, 80));

        var mahjong_img = ccui.ImageView.create();
        mahjong_img.setAnchorPoint(0.5,0.5);
        mahjong_img.setName("mahjong_img");
        mahjong_img.loadTexture("Mahjong/mahjong_big_9.png",ccui.Widget.PLIST_TEXTURE);
        mahjong_img.setPosition(cc.p(tile_img.width * 0.5, tile_img.height * 0.43));
        tile_img.addChild(mahjong_img);

        var red_point_img = ccui.ImageView.create();
        red_point_img.setAnchorPoint(0.5,0.5);
        red_point_img.setName("red_point_img");
        red_point_img.loadTexture("res/ui/GameRoomUI/red_point.png");
        red_point_img.setPosition(cc.p(tile_img.width * 0.8, tile_img.height * 0.86));
        tile_img.addChild(red_point_img);

        var lefttile_label = ccui.Text.create();
        lefttile_label.setAnchorPoint(0.5,0.5);
        lefttile_label.setName("lefttile_label");
        lefttile_label.setFontSize(25);
        lefttile_label.setString("4");
        lefttile_label.setPosition(cc.p(red_point_img.width * 0.5, red_point_img.height * 0.56));
        red_point_img.addChild(lefttile_label);

        canwin_tile_panel.addChild(tile_img);
    },

    update_wintips_btn:function () {
        cc.log("update_wintips_btn is run!");
        if(!this.is_show){return;}
        var self = this;
        if(!self.rootUINode || !self.rootUINode.getChildByName("wintips_btn")){
            return;
        }
        var wintips_btn = this.rootUINode.getChildByName("wintips_btn");
        var player = h1global.player();
        var canWinTiles = player.gameOperationAdapter.getCanWinTiles();
        // cc.log("canWinTiles:",canWinTiles);
        if(canWinTiles.length <= 0 || player.curGameRoom.curPlayerSitNum == player.serverSitNum){
            wintips_btn.setVisible(false);
        }else{
            wintips_btn.setVisible(true);
	        wintips_btn.setPosition(cc.p(cc.winSize.width - 160.77, 219.96));
            wintips_btn.addTouchEventListener(function (sender, eventType) {
                if (eventType === ccui.Widget.TOUCH_BEGAN) {
                    self.update_canwin_tile_panel(const_lsbmzmj.WINTIPS_BTN_DISPLAY);
                } else if (eventType === ccui.Widget.TOUCH_CANCELED || eventType=== ccui.Widget.TOUCH_ENDED) {
                    self.update_canwin_tile_panel(const_lsbmzmj.NOT_DISPLAY_CANWIN_PANEL);
                }
            });
        }
    },

    update_canwin_tile_panel:function(select_tile){
        cc.log("update_canwin_tile_panel is run!");
        var self = this;
        var canwin_tile_panel = self.rootUINode.getChildByName("canwin_tile_panel");
        if(select_tile == const_lsbmzmj.NOT_DISPLAY_CANWIN_PANEL){
            canwin_tile_panel.setVisible(false);
            return;
        }
        var player = h1global.player();
        var canWinTiles = player.gameOperationAdapter.getCanWinTiles(select_tile);
        if(canWinTiles.length <=0){
            canwin_tile_panel.setVisible(false);
            return;
        }
        cc.log("canWinTiles:",canWinTiles);
        self.init_canwin_tile_panel();
        canwin_tile_panel.setVisible(true);
        var tile_img = canwin_tile_panel.getChildByName("tile_img");
        tile_img.setVisible(false);
        canwin_tile_panel.setAnchorPoint(0.5,0);
        if(canWinTiles.length >= 34) {
            canwin_tile_panel.setContentSize(cc.size(200, 150));
            canwin_tile_panel.getChildByName("canwin_title_img").setPosition(canwin_tile_panel.width * 0.50, canwin_tile_panel.height * 0.80);
            var canwin_anytile_img = ccui.ImageView.create();
            canwin_anytile_img.setAnchorPoint(0.5,0.5);
            canwin_anytile_img.setName("canwin_anytile_img");
            canwin_anytile_img.loadTexture("res/ui/GameRoomUI/canwin_anytile.png");
            canwin_tile_panel.addChild(canwin_anytile_img);
            canwin_anytile_img.setPosition(cc.p(canwin_tile_panel.width * 0.5, canwin_tile_panel.height * 0.4));
            return;
        }else if(canWinTiles.length > 11) {
            canwin_tile_panel.setContentSize(cc.size((150 + 10 * 100), (200 + 140 * Math.ceil(canWinTiles.length / 11 - 1))));
            canwin_tile_panel.getChildByName("canwin_title_img").setPosition(cc.p(canwin_tile_panel.width * 0.5,canwin_tile_panel.height * (0.91 + Math.ceil(canWinTiles.length / 11 - 2) * 0.02)));
        }else {
            canwin_tile_panel.setContentSize(cc.size((150 + (canWinTiles.length - 1) * 100), 200));
            canwin_tile_panel.getChildByName("canwin_title_img").setPosition(cc.p(canwin_tile_panel.width * 0.5,canwin_tile_panel.height * 0.83));
        }
        for(var i = 0 ; i < canWinTiles.length ; i++){
            var temp_tile_img = tile_img.clone();
            if(i > 10){
                if(canWinTiles.length > 22 && i < 22){
                    temp_tile_img.setPositionX(75 + (i % 11) * 100);
                }else {
                    temp_tile_img.setPositionX(575 + (i % 11) * 100 - ((canWinTiles.length - 1) % 11) * 50);
                }
                temp_tile_img.setPositionY(80 + 140 * Math.ceil((i + 1) / 11 - 1));
            }else {
                temp_tile_img.setPositionX(75 + i * 100);//如果有财神的话，X位置加100
            }
            temp_tile_img.setVisible(true);
            var mahjong_img = temp_tile_img.getChildByName("mahjong_img");
            mahjong_img.loadTexture("Mahjong/mahjong_big_" + canWinTiles[i].toString() + ".png",ccui.Widget.PLIST_TEXTURE);
            canwin_tile_panel.addChild(temp_tile_img);
            var tileSum = self.find_all_same_tiles(canWinTiles[i]);
            temp_tile_img.getChildByName("red_point_img").getChildByName("lefttile_label").setString(4 - tileSum >= 0 ? 4 - tileSum : 0);
        }
        if(player.curGameRoom.kingTiles.length > 0) {
            tile_img.getChildByName("mahjong_img").loadTexture("Mahjong/mahjong_big_" + player.curGameRoom.kingTiles[0].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
            tile_img.color = const_lsbmzmj.mark_same_color;
            var tileSum = self.find_all_same_tiles(player.curGameRoom.kingTiles[0]);
            tile_img.getChildByName("red_point_img").getChildByName("lefttile_label").setString(4 - tileSum >= 0 ? 4 - tileSum : 0);
        }else {
            tile_img.removeFromParent(true);
        }
    },

    playOperationFunc:function (curSitNum, opId) {
        var self = this;
        var cur_img = ccui.ImageView.create();
        var cur_img1 = ccui.ImageView.create();
        var cur_img2 = ccui.ImageView.create();
        if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
            cur_img1.loadTexture("res/ui/GameRoomUI/" + opId + "_1.png");
            cur_img2.loadTexture("res/ui/GameRoomUI/" + opId + "_2.png");
            opPos(curSitNum, cur_img);
            this.rootUINode.addChild(cur_img);
            cur_img.addChild(cur_img1);
            cur_img.addChild(cur_img2);
            cur_img1.setLocalZOrder(2);
            cur_img2.setLocalZOrder(1);
            cur_img1.runAction(cc.Sequence.create(cc.ScaleTo.create(0.1, 2), cc.DelayTime.create(0.1), cc.ScaleTo.create(0.05, 1),
                cc.Spawn.create(cc.FadeTo.create(0.2, 125), cc.ScaleTo.create(0.2, 1.3)),
                cc.FadeOut.create(0.3),
                cc.removeSelf()));
            cur_img2.runAction(cc.Sequence.create(
                cc.Spawn.create(cc.ScaleTo.create(0.1, 2), cc.MoveBy.create(0.1, cc.p(-2, -9))),
                cc.ScaleTo.create(0.1, 1),
                cc.DelayTime.create(1.2),
                cc.removeSelf()));
        }else {
            cur_img.loadTexture("res/ui/GameRoomUI/" + opId + "_2.png");
            cur_img.setScale(4.0);
            opPos(curSitNum, cur_img);
            this.rootUINode.addChild(cur_img);
            cur_img.runAction(cc.Sequence.create(cc.ScaleTo.create(0.2, 1.5), cc.DelayTime.create(0.5), cc.removeSelf()));
        }

        //动作的位置
        function opPos(curSitNum, cur_img){
            if(curSitNum == 0){
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, self.rootUINode.getChildByName("player_tile_panel0").getPositionY()+160));
            } else if(curSitNum == 1){
                cur_img.setPosition(cc.p(self.rootUINode.getChildByName("player_tile_panel1").getPositionX(), cc.winSize.height * 0.5));
            } else if(curSitNum == 2){
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, self.rootUINode.getChildByName("player_tile_panel2").getPositionY()-160));
            } else if(curSitNum == 3){
                cur_img.setPosition(cc.p(self.rootUINode.getChildByName("player_tile_panel3").getPositionX(), cc.winSize.height * 0.5));
            } else {
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
            }
        }
    },

    playOperationEffect:function(opId, serverSitNum, tile){
	    if(h1global.curUIMgr.gps_ui && h1global.curUIMgr.gps_ui.is_show) {return;}
        var curSitNum = -1;
        if(serverSitNum === undefined){
            curSitNum = -1;
        } else {
            curSitNum = h1global.player().server2CurSitNum(serverSitNum);
        }
        var cur_img = ccui.ImageView.create();
        if(opId == const_val.OP_CHOW){
            this.playOperationFunc(curSitNum, "chow");
        } else if(opId == const_val.OP_READY){
            this.playOperationFunc(curSitNum, "ting");
        } else if(opId == const_val.OP_PONG){
            this.playOperationFunc(curSitNum, "pong");
        } else if(opId == const_val.OP_EXPOSED_KONG){
            this.playOperationFunc(curSitNum, "kong");
        } else if(opId == const_val.OP_CONCEALED_KONG){
            this.playOperationFunc(curSitNum, "kong");
        } else if(opId == const_val.OP_CONTINUE_KONG){
            this.playOperationFunc(curSitNum, "kong");
        } else if(opId == const_val.OP_DRAW_WIN){
            this.playOperationFunc(curSitNum, "draw_win")
        } else if(opId == const_val.OP_KONG_WIN || opId == const_val.OP_GIVE_WIN){
            this.playOperationFunc(curSitNum, "win");
        } else if(opId == const_val.OP_KONG_WREATH){
            cur_img.loadTexture("Mahjong/mahjong_tile_player_hand.png", ccui.Widget.PLIST_TEXTURE);
            var tile_img = ccui.ImageView.create();
            tile_img.loadTexture("Mahjong/mahjong_big_" + tile + ".png", ccui.Widget.PLIST_TEXTURE);
            cur_img.addChild(tile_img);
            tile_img.setPosition(cc.p(37, 45));
            cur_img.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
            this.rootUINode.addChild(cur_img);
            var aim_pos = this.rootUINode.getChildByName('wreath_panel' + curSitNum).getPosition();
            cur_img.runAction(cc.Sequence.create(
                cc.DelayTime.create(1.5),
                cc.MoveTo.create(0.4, aim_pos),
                cc.CallFunc.create(
                    function(){
                        cur_img.removeFromParent()
                    }
                )
            ))
        }
    },

    getMessagePos:function(playerInfoPanel){
        var anchor_point = playerInfoPanel.getAnchorPoint();
        var content_size = playerInfoPanel.getContentSize();
        var cur_pos = playerInfoPanel.getPosition();
        var x = cur_pos.x - content_size.width * anchor_point.x + 130;
        var y = cur_pos.y - content_size.height * anchor_point.y + 180;
        if(x + 134 > cc.winSize.width){
            x = cc.winSize.width - 134;
        }
        if(y + 99 > cc.winSize.height){
            y = cc.winSize.height - 99;
        }
        return cc.p(x, y);
    },

    playEmotionAnim:function(serverSitNum, eid){
        emotion.playEmotion(this.rootUINode,eid,serverSitNum);
        return;//下面的是以前的代码
        var curSitNum = h1global.player().server2CurSitNum(serverSitNum);
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + curSitNum);
        var talk_img = ccui.ImageView.create();
        // talk_img.setPosition(this.getMessagePos(player_info_panel).x - 70, this.getMessagePos(player_info_panel).y + 10);
        talk_img.setPosition(this.getMsgPos(player_info_panel, curSitNum));
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(100, 120));
        this.rootUINode.addChild(talk_img);
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
        var effect_animation = new cc.Animation(anim_frames, 1.2 / const_val.ANIM_LIST[eid - 1]);
        var effect_action = new cc.Animate(effect_animation);

        var emot_sprite = cc.Sprite.create();
        // emot_sprite.setScale(1.0);
        emot_sprite.setScale(0.4);
        emot_sprite.setPosition(cc.p(50, 60));
        // emot_sprite.setPosition(this.getMessagePos(player_info_panel));
        talk_img.addChild(emot_sprite);
        if(curSitNum > 0 && curSitNum < 3){
            talk_img.setScaleX(-1);
            talk_img.setPositionX(talk_img.getPositionX() - 40);
            talk_img.setPositionY(talk_img.getPositionY() - 10);
        }else {
            talk_img.setPositionX(talk_img.getPositionX() + 40);
            talk_angle_img.setLocalZOrder(3);
        }
        talk_angle_img.setPosition(3, talk_angle_img.getPositionY() + 50);
        emot_sprite.runAction(cc.Sequence.create(cc.Repeat.create(effect_action, 2), cc.CallFunc.create(function(){
            talk_img.removeFromParent();
        })));
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

	playMessageAnim: function (serverSitNum, msg) {
		if (!msg || msg == "") {
			return;
		}
        var idx = h1global.player().server2CurSitNum(serverSitNum);
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + idx);
        var talk_img = ccui.ImageView.create();
        var talk_angle_img = ccui.ImageView.create();
        talk_img.setAnchorPoint(0,0.5);
        talk_img.setPosition(this.getMsgPos(player_info_panel, idx));
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
        talk_img.addChild(talk_angle_img);
        this.rootUINode.addChild(talk_img);

        var msg_label = cc.LabelTTF.create("", "Arial", 22);
	    msg_label.setString(msg);
        msg_label.setDimensions(msg_label.getString().length * 26, 0);
        msg_label.setColor(cc.color(20, 85, 80));
        msg_label.setAnchorPoint(cc.p(0.5, 0.5));
        talk_img.addChild(msg_label);
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(msg_label.getString().length * 23 + 20, talk_img.getContentSize().height));
        talk_angle_img.setPosition(3,talk_img.getContentSize().height*0.5);
        if(idx > 0 && idx < 3){
            msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.37 + 10, 23));
            talk_img.setScaleX(-1);
            msg_label.setScaleX(-1);
        }else {
            msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.50 + 13, 23));
            talk_angle_img.setLocalZOrder(3);
        }
        msg_label.runAction(cc.Sequence.create(cc.DelayTime.create(2.0), cc.CallFunc.create(function(){
            talk_img.removeFromParent();
        })));
    },

    getExpressionPos:function (player_info_panel, idx) {
        var pos = player_info_panel.getPosition();
        if(idx == 1){
            pos = cc.p(pos.x - player_info_panel.width * 0.5, pos.y + player_info_panel.height * 0.5);
        } else if(idx == 2){
            pos = cc.p(pos.x + player_info_panel.width * 0.5, pos.y - player_info_panel.height * 0.5);
        } else if(idx == 3){
            pos = cc.p(pos.x + player_info_panel.width * 0.5, pos.y + player_info_panel.height * 0.5);
        } else {
            pos = cc.p(pos.x + player_info_panel.width * 0.5, pos.y + player_info_panel.height * 0.5);
        }
        return pos;
    },

    playExpressionAnim:function (fromIdx, toIdx, eid) {
        var self = this;
        if (eid === 3) {	//因为扔钱动画不是plist，所以单独处理
            self.playMoneyAnim(fromIdx, toIdx);
            return;
        }
        var rotate = 0;
        var moveTime = 0.7;
        var flag = (fromIdx % 3 == 0 && toIdx % 3 == 0) || (fromIdx % 3 != 0 && toIdx % 3 != 0);
        if(flag){
            moveTime = 0.3;
        }
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + fromIdx.toString());
        var expression_img = ccui.ImageView.create();
        expression_img.setPosition(this.getExpressionPos(player_info_panel, fromIdx));
        expression_img.loadTexture("res/ui/PlayerInfoUI/expression_"+ const_val.EXPRESSION_ANIM_LIST[eid] +".png");
        this.rootUINode.addChild(expression_img);
        // if(eid > 1){
        //    rotate = 1440;
        //    rotate = rotate + (moveTime - 0.7) * 1800;
        // }
        expression_img.runAction(cc.Spawn.create(cc.RotateTo.create(0.2 + moveTime, rotate), cc.Sequence.create(
            cc.ScaleTo.create(0.1, 1.5),
            cc.ScaleTo.create(0.1, 1),
            cc.MoveTo.create(moveTime, self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx)),
            cc.CallFunc.create(function(){
                expression_img.removeFromParent();
                self.playExpressionAction(toIdx, self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx), eid);
            })
        )));
    },

    playMoneyAnim:function (fromIdx, toIdx) {
        var self = this;
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + fromIdx.toString());

        var money_img_list = [];
        var baodian_img_list = [];
        for (var j = 0 ; j < 10 ; j++) {
            //var money_img  = new cc.Sprite("res/ui/PlayerInfoUI/dzpk_dj_icon_ani.png");
            var money_img  = new cc.Sprite("res/ui/PlayerInfoUI/expression_money.png");
            var baodian_img  = new cc.Sprite("res/ui/PlayerInfoUI/baodian.png");
            money_img.setPosition(this.getExpressionPos(player_info_panel, fromIdx));

            baodian_img.setVisible(false);
            //baodian_img.setLocalZOrder(-1);
            money_img.setLocalZOrder(1);

            this.rootUINode.addChild(money_img);
            this.rootUINode.addChild(baodian_img);
            money_img_list.push(money_img);
            baodian_img_list.push(baodian_img);
        }
        var pos = self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx);
        for (var i = 0 ; i < 10 ; i++) {
            var random_pos = cc.p(Math.random() * 60 - 30, Math.random() * 60 - 30);
            (function (i) {
                money_img_list[i].runAction(cc.sequence(
                    cc.delayTime(i * 0.1),
                    // cc.spawn(cc.rotateBy(0.2,360),cc.moveBy(0.2, pos.x + random_pos.x-70, pos.y + random_pos.y-200)),
                    cc.spawn(cc.rotateBy(0.2,360),cc.moveTo(0.2, pos.x, pos.y + random_pos.y)),
                    cc.callFunc(function () {
                        //cc.spawn(cc.rotateBy(0.2,360),cc.moveBy(0.2, pos.x + random_pos.x-70, pos.y + random_pos.y-200));
                        cc.audioEngine.playEffect("res/sound/effect/com_facesound_3.mp3");
                        money_img_list[i].setScale(1.2);
                        baodian_img_list[i].setPosition(pos.x+i, pos.y+30+i);
                        baodian_img_list[i].runAction(cc.rotateTo(0.1,45));
                        baodian_img_list[i].setVisible(true);
                    }),
                    //cc.moveTo(0.1,pos.x+i, pos.y+30+i),
                    cc.moveBy(0.1,5,3),
                    //cc.moveBy(0.1,-2,0),
                    cc.callFunc(function () {
                        money_img_list[i].setScale(1);
                        baodian_img_list[i].setVisible(false);
                    }),
                    // cc.moveBy(0.2,(i%2>0 ? (9-i)*4 : -(9-i)*4)+Math.random()*5-10,		-26 + i*2	),
                    // cc.rotateTo(0.2,40-Math.random()*40),
                    cc.spawn(cc.rotateTo(0.2,Math.random()*40-Math.random()*40),cc.moveBy(0.2,(i%2>0 ? (9-i)*4 : -(9-i)*4)+Math.random()*5-10,		-26 + i*2	)),
                    //cc.moveBy(0.1,0,-4),
                    //cc.rotateTo(0.2,0),
                    //cc.delayTime(2),
                    cc.delayTime((9 - i) * 0.1),
                    cc.callFunc(function () {
                        money_img_list[i].removeFromParent(true);
                        baodian_img_list[i].removeFromParent(true);
                    })
                ));
            })(i)
        }
    },

    playExpressionAction : function(idx, pos, eid){
        if(idx < 0 || idx > 3){
            return;
        }
        var self = this;
        UICommonWidget.load_effect_plist("expression");
        var expression_sprite = cc.Sprite.create();
        // var ptime = 2;
        // if(eid == 3){
        //    expression_sprite.setScale(2);
        // }
        expression_sprite.setPosition(pos);
        self.rootUINode.addChild(expression_sprite);
        expression_sprite.runAction(cc.Sequence.create(
            UICommonWidget.create_effect_action({"FRAMENUM": const_val.EXPRESSION_ANIMNUM_LIST[eid], "TIME": const_val.EXPRESSION_ANIMNUM_LIST[eid] / 16, "NAME": "Expression/"+ const_val.EXPRESSION_ANIM_LIST[eid] +"_"}),
            cc.DelayTime.create(0.5),
            cc.CallFunc.create(function(){
                expression_sprite.removeFromParent();
            })
        ));
    },

    playVoiceAnim:function(serverSitNum, record_time){
        var self = this;
        if(cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.pauseMusic();
            cc.audioEngine.pauseAllEffects();
            cc.audioEngine.setEffectsVolume(0);
        }
        var idx = h1global.player().server2CurSitNum(serverSitNum);
        var interval_time = 0.8;
        this.talk_img_num += 1;
        // var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.player().server2CurSitNum(serverSitNum));
        var player_info_panel = undefined;
        if(serverSitNum < 0){
            player_info_panel = this.rootUINode.getChildByName("agent_info_panel");
        } else {
            player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.player().server2CurSitNum(serverSitNum));
        }
        var talk_img = ccui.ImageView.create();
        talk_img.setPosition(this.getMsgPos(player_info_panel, idx));
        talk_img.loadTexture("res/ui/Default/talk_frame.png");
        talk_img.setScale9Enabled(true);
        talk_img.setContentSize(cc.size(100, talk_img.getContentSize().height));
        this.rootUINode.addChild(talk_img);
        var talk_angle_img = ccui.ImageView.create();
        talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
        talk_img.addChild(talk_angle_img);

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
        talk_angle_img.setPosition(3,talk_img.getContentSize().height*0.5);
        if(idx > 0 && idx < 3){
            talk_img.setScale(-1);
            talk_img.setPositionX(talk_img.getPositionX() - 40);
        }else {
            talk_img.setPositionX(talk_img.getPositionX() + 40);
            talk_angle_img.setLocalZOrder(3);
        }
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

    play_luckytiles_anim:function(luckyTileList, callback){
        var player = h1global.player();
        var show_lucky_tiles_panel = this.rootUINode.getChildByName("show_lucky_tiles_panel");
        var panel_width = 100 * (luckyTileList.length - 1) + (player.curGameRoom.luckyTileNum > 0 ? 120 : 100);
        show_lucky_tiles_panel.setContentSize(cc.size(panel_width, show_lucky_tiles_panel.getContentSize().height));
        show_lucky_tiles_panel.setVisible(true);
        for(var i = 0; i < 2; i++){
            var tile_img = show_lucky_tiles_panel.getChildByName("tile_img" + i.toString());
            var mahjong_img = tile_img.getChildByName("mahjong_img");
            var luckyTileNum = luckyTileList[i];
            if(luckyTileNum){
                tile_img.setPositionX(60 + 100 * i);
                tile_img.setVisible(true);
                tile_img.loadTexture("Mahjong/mahjong_tile_player_down8.png", ccui.Widget.PLIST_TEXTURE);
                mahjong_img.setVisible(false);
                tile_img.runAction(cc.Sequence.create(cc.DelayTime.create(0.4 * (i + 1)), cc.CallFunc.create((function(luckyTileNum, tile_img, mahjong_img){return function(){
                    tile_img.loadTexture("Mahjong/mahjong_tile_player_hand.png", ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.ignoreContentAdaptWithSize(true);
                    mahjong_img.loadTexture("Mahjong/mahjong_big_" + luckyTileNum.toString() + ".png", ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.setVisible(true);
                };})(luckyTileNum, tile_img, mahjong_img))));
            } else {
                tile_img.setVisible(false);
            }
        }
        // 由于同时会播放胡牌特效，所以总时间至少2s
        show_lucky_tiles_panel.runAction(cc.Sequence.create(cc.DelayTime.create(luckyTileList.length * 0.4 + 0.8), cc.CallFunc.create(function(){
            if(callback){callback();}
        })));
    },

    play_result_anim: function (player_info_list) {
        var player = h1global.player();
        var curGameRoom = player.curGameRoom;
        for (var i = 0; i < curGameRoom.player_num; i++) {
            var player_info = player_info_list[i];
            var idx = player_info['idx'];
            var handTiles = cutil.deepCopy(player_info.tiles);
            cutil_lsbmzmj.tileSort(handTiles, player.curGameRoom.kingTiles);
            var player_hand_panel = this.rootUINode.getChildByName("player_tile_panel" + player.server2CurSitNum(idx)).getChildByName("player_hand_panel");
            player_hand_panel.setVisible(false);
            this.update_player_exposed_tiles(idx, handTiles, false);
        }
    },

    update_roominfo_panel:function(){
        if(!this.is_show){
            return;
        }
        var player = h1global.player();
        var room_info_panel = this.rootUINode.getChildByName("room_info_panel");
        var lefttile_label = room_info_panel.getChildByName("lefttile_label");
        lefttile_label.setString(Math.max(0, player.curGameRoom.leftTileNum).toString());
    },

	update_roominfo_panel_mahjong_img:function(){
		if(!this.is_show){
			return;
		}
		var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
		var mahjongStr = "";
		if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
			mahjongStr = "MahjongYellow/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue/blue_";
		} else {
			mahjongStr = "Mahjong/";
		}
		var room_info_panel = this.rootUINode.getChildByName("room_info_panel");
		var mahjong_img = room_info_panel.getChildByName("mahjong_img");
		mahjong_img.loadTexture(mahjongStr + "mahjong_tile_top_hand.png", ccui.Widget.PLIST_TEXTURE);
	},

    update_kingtile_panel:function(){
        if(!this.is_show || h1global.player().curGameRoom.kingTiles.length <= 0){
            return;
        }
        var player = h1global.player();
        var kingtile_panel = this.rootUINode.getChildByName("kingtile_panel");
        var tile_img = kingtile_panel.getChildByName("tile_img");
	    var kingtilemark_img = ccui.ImageView.create("res/ui/GameRoomUI/kingtilemark.png");
	    kingtilemark_img.setAnchorPoint(0.0, 1.0);
	    kingtilemark_img.setPosition(cc.p(4, 70));
	    kingtilemark_img.setScale(0.7);
	    tile_img.addChild(kingtilemark_img);
	    this.mark_king_tile(tile_img);
        var mahjong_img = tile_img.getChildByName("mahjong_img");
        mahjong_img.ignoreContentAdaptWithSize(true);
        mahjong_img.loadTexture("Mahjong/mahjong_big_" + player.curGameRoom.kingTiles[0].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
        mahjong_img.setVisible(true);
        this.mark_king_tile(tile_img)
        kingtile_panel.setVisible(true);
    },

    set_kingtile_panel_visible :function(is_show){
        this.rootUINode.getChildByName("kingtile_panel").setVisible(is_show);
    },

    update_wreath_panel:function(serverSitNum){
        var player = h1global.player();
        var idx = player.server2CurSitNum(serverSitNum);
        var wreaths = player.curGameRoom.wreathsList[serverSitNum]
        var wreath_panel = this.rootUINode.getChildByName("wreath_panel" + String(idx));
        for (var i = 0; i < wreaths.length; i++) {
            var wreath = ccui.helper.seekWidgetByName(wreath_panel, "wreath_" + String(wreaths[i]))
            wreath.loadTexture("res/ui/GameRoomUI/light_" + wreaths[i] +".png")
        }
    },

    /* op_dict = {8:[[0]], 32:[[4,5,6], [5,6,7]], 40:[[7], [11], [21]], 56:[[75],[77]], 107:[[0]]} value数组不能为空list */
    /* from_type = 0 自摸 from_type = 1 提交确认*/
    update_operation_panel:function(op_dict, from_type){
        if(!this.is_show) {return;}
		cc.log("update_operation_panel, op_dict:", op_dict)
        //不显示胡牌按钮
        if(op_dict[const_val.OP_DRAW_WIN] || op_dict[const_val.OP_KONG_WIN] || op_dict[const_val.OP_GIVE_WIN] || op_dict[const_val.OP_WREATH_WIN]){
            // delete op_dict[const_val.OP_DRAW_WIN]
            // op_dict[8] && delete op_dict[8]
            op_dict = [];
        }
        if (Object.keys(op_dict).length <= 0) {return;}
        from_type = from_type || const_val.SHOW_DO_OP
        var self = this;
        var player = h1global.player();
        // if (player.curGameRoom.discardStateList[player.serverSitNum] === const_lsbmzmj.DISCARD_FORCE && player.curGameRoom.game_mode !== const_lsbmzmj.KING_GAME_MODE) {
        //     for (var op in op_dict) {
        //         if ((op >> 3) === const_val.SHOW_WIN) {
        //             return;
        //         }
        //     }
        // }
        var operation_panel = this.rootUINode.getChildByName("operation_panel")
        // 搜集显示信息
        //show_op_dict = {1:{8:[[0]]}, 4：{32:[[4,5,6], [5,6,7]]}, 5：{40:[[7], [11], [21]]}, 7：{56:[[75],[77]], 57:[[78]]}, 13：{107:[[0]]}}
        var show_op_dict = {}
        for (var i = 0; i < const_val.SHOW_OP_LIST.length; i++) {
            var show_op = const_val.SHOW_OP_LIST[i];
            for (var op in op_dict) {
                var op = eval(op);
                if ((op >> 3) == show_op) {
                    if (!show_op_dict[show_op]) {
                        show_op_dict[show_op] = {}
                    }
                    show_op_dict[show_op][op] = op_dict[op];
                    if(show_op==const_val.SHOW_PONG){
                        this.mark_prompt_tile(op_dict[op][0]);
                    }
                    // if(show_op==const_val.SHOW_KONG){
                    //    this.mark_prompt_tile(op_dict[op][0]);
                    // }
                }
            }
        }
        cc.log("show_op_dict",show_op_dict)
        // 创建btn, 信息挂在新创建的bth上，由btn自行决定是否 显示 二级面板
        // btn:op_dict, from_type
        operation_panel.removeAllChildren()
        function op_btn_touch_event(sender, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                // sender.op_dict 2维数组 {56:[[75],[77]], 57:[[78]]}
                cc.log("btn_touch_event", sender.op_dict, sender.op_val, sender.from_type)
                var keys = Object.keys(sender.op_dict)
	            if(h1global.curUIMgr.roomLayoutMgr){
		            h1global.curUIMgr.roomLayoutMgr.notifyObserver('show_ting_panel', false);
	            }
                if (keys.length > 1 || (keys.length == 1 && sender.op_dict[keys[0]].length > 1)) {
                    if(h1global.curUIMgr.roomLayoutMgr){
                        h1global.curUIMgr.roomLayoutMgr.notifyObserver('show_operation_select_panel', sender)
                    }
                } else if (keys.length == 1) {
                    //sender.op_dict {57:[[78]]}
                    if (sender.from_type == const_val.SHOW_CONFIRM_OP) {
                        player.gameOperationAdapter.confirmOperation(eval(keys[0]), sender.op_dict[keys[0]][0])
                    } else {
                        player.doOperation(eval(keys[0]), sender.op_dict[keys[0]][0])
                    }
                    if(h1global.curUIMgr.roomLayoutMgr){
                        h1global.curUIMgr.roomLayoutMgr.notifyObserver('hide_operation_panel')
                    }
                } else {
                    cc.error("error op_btn_touch_event")
                }
            }
        }
        var operation_btn_list = []
        for (var i = const_val.SHOW_OP_LIST.length - 1; i >= 0; i--) {
            if (show_op_dict[const_val.SHOW_OP_LIST[i]]) {

                var op_val = const_val.SHOW_OP_LIST[i]
                cc.log(op_val)
                var res_path = "res/ui/GameRoomUI/op_" + String(op_val) + ".png";
                if(op_val === const_val.SHOW_PASS && show_op_dict[const_val.SHOW_WIN]){
                    res_path = "res/ui/GameRoomUI/op_give_up.png";
                }
                var op_btn = ccui.Button.create(res_path);
                //btn数据
                op_btn.from_type = from_type
                op_btn.op_val = const_val.SHOW_OP_LIST[i]
                op_btn.op_dict = show_op_dict[const_val.SHOW_OP_LIST[i]] // 2维数组
                op_btn.addTouchEventListener(op_btn_touch_event)
	            if (op_val === const_val.SHOW_PASS) {
		            op_btn.setScale(1);
	            } else {
		            op_btn.setScale(1.2);
	            }
                operation_panel.addChild(op_btn)
                operation_btn_list.push(op_btn)
                // cc.log(operation_panel.getContentSize().width - 50 * i, operation_panel.getContentSize().height/2)
                // cc.log("===========================")
                // cc.log(Object.keys(show_op_dict).length, operation_btn_list.length)
                op_btn.setPosition(cc.p(operation_panel.getContentSize().width - 40 -170 * (operation_btn_list.length-1), operation_panel.getContentSize().height/2))
            }
        }
        var operation_bg = ccui.ImageView.create();
        operation_bg.loadTexture("res/ui/GameRoomUI/operation_bg.png");
        operation_bg.setAnchorPoint(cc.p(1, 0.5));
        operation_bg.setScale9Enabled(true);
        operation_bg.setContentSize(cc.size((operation_btn_list.length - 2) * 65 + 390, operation_panel.getContentSize().height * 1.2));
        operation_panel.addChild(operation_bg);
        operation_bg.setLocalZOrder(-1);
        operation_bg.setPosition(cc.p(operation_panel.getContentSize().width * (operation_btn_list.length > 2 ? 1 : 1.2), operation_panel.getContentSize().height * 0.5));
        this.show_operation_panel()
    },

    show_operation_panel:function(){
        if (!this.is_show) {return;}
        let operation_panel = this.rootUINode.getChildByName("operation_panel");
        if(!operation_panel.editorOrigin){
            operation_panel.editorOrigin = operation_panel.getPosition();
        }
        this.adapter_operation_panel(operation_panel, operation_panel.editorOrigin, h1global.player().gameOperationAdapter.getCanWinTiles().length > 0);
        operation_panel.setVisible(true);
    },

    adapter_operation_panel:function (panel, editorOrigin, can_win) {
        cc.error('not impl')
    },

    hide_operation_panel:function(){
        if (!this.is_show) {return;}
        this.rootUINode.getChildByName("operation_panel").setVisible(false);
        this.rootUINode.getChildByName("operation_select_panel").setVisible(false);
    },

    hide_operation_select_panel:function () {
        var operation_select_panel = this.rootUINode.getChildByName("operation_select_panel")
        operation_select_panel.setVisible(false);
    },

    show_operation_select_panel:function(op_btn){ // 操作二级面板 {49:[[75],[77]], 50:[[78]]}  {49:[[75],[77]]}
        var from_type = op_btn.from_type
        var op_val = op_btn.op_val
        var op_dict = op_btn.op_dict

        if (!this.is_show || Object.keys(op_dict).length <= 0) {
            return
        }
        this.hide_operation_panel()

        var op_list = [] // 数组 [[49,[75]],[49,[77]], [50,[78]]]
        for (var op in op_dict){
            op = eval(op)
            for (var i = 0; i < op_dict[op].length; i++) {
                op_list.push([op, op_dict[op][i]])
            }
        }
        cc.log(op_dict, op_list)

        var operation_select_panel = this.rootUINode.getChildByName("operation_select_panel")

        function meld_panel_touch_event(sender, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                var player = h1global.player();
                cc.log("meld_panel_touch_event", sender.op_info_list)
                if (from_type == const_val.SHOW_CONFIRM_OP) {
                    player.gameOperationAdapter.confirmOperation(sender.op_info_list[0], sender.op_info_list[1])
                } else {
                    player.doOperation(sender.op_info_list[0], sender.op_info_list[1])
                }
                if(h1global.curUIMgr.roomLayoutMgr){
                    h1global.curUIMgr.roomLayoutMgr.notifyObserver('hide_operation_select_panel')
                }
            }
        }
        var meld_panel_list = []
        for (var i = 0; i < 3; i++) { // 最多3组
            var meld_panel = ccui.helper.seekWidgetByName(operation_select_panel, "meld_panel_" + String(i))
            if (op_list[i]) {
                meld_panel.op_info_list = op_list[i]
                //显示张数
                var show_list = [];
                if ((op_list[i][0] >> 3) == const_val.SHOW_PONG) { // 碰显示3张
                    show_list = [op_list[i][1][0], op_list[i][1][0], op_list[i][1][0]]
                } else if ((op_list[i][0] >> 3) == const_val.SHOW_KONG) { // 杠显示4张 有显示1张的需求？
                    show_list = [op_list[i][1][0], op_list[i][1][0], op_list[i][1][0], op_list[i][1][0]]
                } else {
                    show_list = cutil.deepCopy(op_list[i][1]);
                    if(op_list[i][0] == const_val.OP_CHOW){
                        var player = h1global.player();
                        if(player){
                            cutil.batch_replace(show_list, const_val.DRAGON_WHITE, player.curGameRoom.kingTiles[0]);
                            show_list.sort();
                            cutil.batch_replace(show_list, player.curGameRoom.kingTiles[0], const_val.DRAGON_WHITE);
                        }
                    }
                    // show_list.sort(function(a,b){return a-b;})
                }

                meld_panel.show_list = show_list;
                meld_panel_list.push(meld_panel);
                for (var j = 0; j < 4; j++) { // 4张牌
                    var tile_img = ccui.helper.seekWidgetByName(meld_panel, "tile_img_" + String(j));
                    if (meld_panel.show_list[j]) {
                        var mahjong_img = ccui.helper.seekWidgetByName(tile_img, "mahjong_img");
                        mahjong_img.loadTexture("Mahjong/mahjong_big_" + meld_panel.show_list[j].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
                        mahjong_img.ignoreContentAdaptWithSize(true);
                        tile_img.setVisible(true)
                    } else {
                        tile_img.setVisible(false)
                    }
                }

                meld_panel.addTouchEventListener(meld_panel_touch_event)
                meld_panel.setVisible(true)
            } else {
                meld_panel.setVisible(false)
            }
        }

        meld_panel_list.sort(function (a_panel, b_panel) {
            return b_panel.show_list[0] - a_panel.show_list[0];
        });

        // 设置显示位置 大小等信息
        var cur_width = 0
        for (var i = 0; i < meld_panel_list.length; i++) {
            var meld_panel = meld_panel_list[i];
            var show_tile_num = meld_panel.show_list.length;
            var tile_width = meld_panel.getChildByName("tile_img_0").getContentSize().width;
            var panel_width = tile_width * show_tile_num - 35*(show_tile_num-1);
            meld_panel.setContentSize(cc.size(panel_width, meld_panel.getContentSize().height));
            cur_width += panel_width;
            if (i != 0) {
                cur_width += 80
            }
            cc.log(cur_width, panel_width, tile_width, show_tile_num, operation_select_panel.getContentSize().width);
            meld_panel.setAnchorPoint(cc.p(0,0))
            meld_panel.setPositionX(operation_select_panel.getContentSize().width - cur_width)
        }
        //关闭按钮
        var close_btn = ccui.helper.seekWidgetByName(operation_select_panel, "close_btn");
        function close_btn_event(sender, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                var player = h1global.player();
                if (player) {

                    if (from_type == const_val.SHOW_CONFIRM_OP) {
                        player.gameOperationAdapter.confirmOperation(const_val.OP_PASS, [0])
                    } else {
                        player.doOperation(const_val.OP_PASS, [0])
                    }
                    if (h1global.curUIMgr.roomLayoutMgr) {
                        h1global.curUIMgr.roomLayoutMgr.notifyObserver('hide_operation_select_panel')
                    }
                }
            }
        }
        close_btn.addTouchEventListener(close_btn_event)
        operation_select_panel.setVisible(true)
    },

});
