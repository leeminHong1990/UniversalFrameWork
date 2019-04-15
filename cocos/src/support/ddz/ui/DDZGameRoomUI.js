// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var DDZGameRoomUI = UIBase.extend({
    ctor: function () {
        this._super();
        this.talk_img_num = 0;

        this.containUISnippets = {};
        var self = this;
        // Note: PlayerInfoSnippet按照服务端座位号分布
        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            let idx = i;
            this.containUISnippets["PlayerInfoSnippet" + i] = new DDZPlayerInfoSnippet(function () {
                let player = h1global.entityManager.player();
                let index = idx;
                if (player) {
                    index = player.server2CurSitNum(index);
                }
                return self.rootUINode.getChildByName("player_info_panel" + index);
            }, i);
        }
    },
    initUI: function () {
        this.beginAnimPlaying = false;
        this.my_clock_pos = 0;
        this.init_game_panel();
        this.init_extra_panel();
        this.init_curplayer_panel();
        this.init_player_info_panel();
        this.init_player_tile_panel();
        this.init_player_hand_panel();
        this.init_operation_panel();
        this.init_desk_tile_panel();
        this.init_host_cards_panel();
        //闹钟位置
        this.init_game_info_panel();
        //初始化 盖牌场景
        this.init_cover_cards_panel();
        //初始化 他家手牌
        this.init_player_wait_panel();
        //初始化底分和倍数
        this.update_multiple_panel();

        h1global.curUIMgr.gameroominfo_ui.show_by_info(GameRoomInfoUI.ResourceFile3D);

        this.update_roominfo_panel();
		this.update_round_info_panel();

        if (!cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.resumeMusic();
        }

        if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
            h1global.curUIMgr.gameplayerinfo_ui.hide();
        }
		gameroomUIMgr.init_table_idx_panel(this.rootUINode);

		actionMgr.load_action_resource(this.rootUINode,const_ddz.ACTION_NAME_LIST[0]);
		actionMgr.load_action_resource(this.rootUINode,const_ddz.ACTION_NAME_LIST[1],cc.p(this.rootUINode.width*0.5 - 50,this.rootUINode.height*0.5));
		actionMgr.load_action_resource(this.rootUINode,const_ddz.ACTION_NAME_LIST[2],cc.p(100,0));
    },

    init_game_panel: function () {
        var operation_panel = this.rootUINode.getChildByName("operation_panel");
        operation_panel.setVisible(false);

        this.rootUINode.getChildByName("player_wait_panel1").setPositionY(this.rootUINode.getChildByName("player_info_panel1").getPositionY()-120);
        this.rootUINode.getChildByName("player_wait_panel2").setPositionY(this.rootUINode.getChildByName("player_info_panel2").getPositionY()-120);
        this.rootUINode.getChildByName("player_desk_tile_panel1").setPositionY(this.rootUINode.getChildByName("player_info_panel2").getPositionY()-150);
        this.rootUINode.getChildByName("player_desk_tile_panel2").setPositionY(this.rootUINode.getChildByName("player_info_panel2").getPositionY()-150);

        //X轴的调整
        this.rootUINode.getChildByName("player_wait_panel1").setPositionX(this.rootUINode.getChildByName("player_info_panel1").getPositionX()-63);
        this.rootUINode.getChildByName("player_wait_panel2").setPositionX(this.rootUINode.getChildByName("player_info_panel2").getPositionX()+80);
    },

    init_extra_panel: function () {
        this.show_extra_panel(false);
    },

    show_extra_panel: function (is_show) {
        this.rootUINode.getChildByName("extra_operation_panel").setVisible(is_show)
    },

    init_curplayer_panel: function () {
        this.game_info_panel = this.rootUINode.getChildByName("game_info_panel");
        this.cur_player_panel = ccui.helper.seekWidgetByName(this.game_info_panel, "cur_player_panel");
        var lefttime_label = ccui.helper.seekWidgetByName(this.cur_player_panel, "lefttime_label");
        lefttime_label.setVisible(false);
    },

    update_wait_time_left: function (leftTime) {
        if (!this.is_show) {
            return;
        }
        leftTime = Math.floor(leftTime);
        this.cur_player_panel = ccui.helper.seekWidgetByName(this.game_info_panel, "cur_player_panel");
        var lefttime_label = ccui.helper.seekWidgetByName(this.cur_player_panel, "lefttime_label");
        lefttime_label.setString(leftTime);
        lefttime_label.ignoreContentAdaptWithSize(true);
        lefttime_label.setVisible(true);
    },

    init_player_info_panel: function () {
        var player = h1global.player();
        if (!player || !player.curGameRoom) {
            return;
        }
        let playerInfoList = player.curGameRoom.playerInfoList;
        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            let snippet = this.containUISnippets["PlayerInfoSnippet" + i];
            if (playerInfoList[i]) {
                snippet.update_player_info_panel(playerInfoList[i]);
                snippet.update_player_online_state(playerInfoList[i]["online"]);
                if (player.curGameRoom.room_state === const_val.ROOM_WAITING) {
                    snippet.update_ready_state(player.curGameRoom.playerStateList[i]);
                }
                snippet.setVisible(true);
            } else {
                snippet.setVisible(false);
            }
        }
    },


    update_player_info_panel: function (serverSitNum, playerInfo) {
        if (this.is_show) {
            this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_player_info_panel(playerInfo);
        }
    },

    update_all_player_score: function (playerInfoList) {
        if (this.is_show) {
            for (var i = 0; i < playerInfoList.length; i++) {
                if (playerInfoList[i]) {
                    this.containUISnippets["PlayerInfoSnippet" + playerInfoList[i]['idx']].update_score(playerInfoList[i]['total_score']);
                }
            }
        }
    },

    update_boom_times: function (times) {
        if (!this.is_show) {
            return;
        }
        this.update_multiple_panel();
    },

    /**
     *
     * @param state 1 = ready
     */
    update_player_ready_state: function (serverSitNum, state) {
        if (this.is_show) {
            this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_ready_state(state);
        }
    },

	update_player_head_mul: function (serverSitNum, state) {
		if (this.is_show) {
			this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_head_mul(state);
		}
	},

	init_head_mul_panel:function(player){
		for(var k in player.curGameRoom.mul_score_list){
			this.update_player_head_mul(k,player.curGameRoom.mul_score_list[k]);
		}
    },

    update_player_online_state: function (serverSitNum, state) {
        if (this.is_show) {
            this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_player_online_state(state);
        }
    },

    init_player_tile_panel: function () {
        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            this.rootUINode.getChildByName("player_hand_panel" + i).setVisible(false);
        }
    },

    init_player_hand_panel: function () {
        var self = this;

        this.selectCardUIs = new Array(const_ddz.HAND_CARD_NUM);
        this.allHandCardUI = [];

        function tryCancelSelect(eventType) {
            if(eventType !== ccui.Widget.TOUCH_ENDED){
                return;
            }
            if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
                h1global.curUIMgr.gameplayerinfo_ui.hide();
            }
            else {
                for (var i = 0; i < self.allHandCardUI.length; i++) {
                    self._toggleCard(self.allHandCardUI[i], false);
                }
            }
        }

        function cancelSelects() {
            for (var i = 0; i < self.selectCardUIs.length; i++) {
                let ui = self.selectCardUIs[i];
                if (!ui) {
                    break;
                }
                self._toggleCard(ui, false);
            }
            self.selectCardUIs.fill(null);
        }

        let handPanel = this.rootUINode.getChildByName("player_hand_panel0").getChildByName("player_tile_panel");

        function selectCards(start, end, eventType) {
            start = Math.min(start, const_ddz.HAND_CARD_NUM - 1);
            end = Math.min(end, const_ddz.HAND_CARD_NUM - 1);
            let startUI = handPanel.getChildByName("tile_img_" + start);
            if (!startUI.isVisible()) {
                if (start === end){
                    tryCancelSelect(eventType);
                }
                return;
            }
            for (var i = 0; i < const_ddz.HAND_CARD_NUM; i++) {
                if (self.selectCardUIs[i]) {
                    self._toggleCard(self.selectCardUIs[i]);
                } else {
                    break;
                }
            }
            self.selectCardUIs.fill(null);
            self.selectCardUIs[0] = startUI;
            self._toggleCard(startUI);
            if (start === end) {
                return;
            }
            for (var i = start + 1; i <= end; i++) {
                let ui = handPanel.getChildByName("tile_img_" + i);
                if (ui.isVisible()) {
                    self._toggleCard(ui);
                    self.selectCardUIs[i - start] = ui;
                } else {
                    return;
                }
            }
        }

        function convertLast(p, width) {
            for (var i = 0; i < const_ddz.HAND_CARD_NUM; i++) {
                let ui = self.allHandCardUI[i];
                if (!ui.isVisible()) {
                    let m = Math.max(i - 1, 0) + 1;
                    let b = m * (width / self.now_tile_num) + 86 > p.x && m * (width / self.now_tile_num) < p.x;
                    return b ? m - 1 : -1;
                }
            }
            return -1;
        }

        function handleSelectEvent(source, eventType) {
            let w = source.width - 99;
            let begin = source.convertToNodeSpace(source.getTouchBeganPosition());
            let startIndex = parseInt(begin.x / w * self.now_tile_num);
            let endIndex = -1;
            let c = convertLast(begin, w);
            if (c !== -1) {
                startIndex = c;
            }
            if (eventType === ccui.Widget.TOUCH_BEGAN) {

                endIndex = startIndex;
            } else if (eventType === ccui.Widget.TOUCH_MOVED) {
                let move = source.convertToNodeSpace(source.getTouchMovePosition());
                let c = convertLast(move, w);
                if (c !== -1) {
                    endIndex = c;
                } else {
                    endIndex = parseInt(move.x / w * self.now_tile_num);
                }
                if (startIndex > endIndex) {
                    startIndex ^= endIndex;
                    endIndex ^= startIndex;
                    startIndex ^= endIndex;
                }
            } else if (eventType === ccui.Widget.TOUCH_ENDED) {
                let end = source.convertToNodeSpace(source.getTouchEndPosition());
                let c = convertLast(end, w);
                if (c !== -1) {
                    endIndex = c;
                } else {
                    endIndex = parseInt(end.x / w * self.now_tile_num);
                }
                if (startIndex > endIndex) {
                    startIndex ^= endIndex;
                    endIndex ^= startIndex;
                    startIndex ^= endIndex;
                }
            }

            if (startIndex < 0) {
                return;
            }
            selectCards(startIndex, endIndex, eventType);
        }

        this.rootUINode.getChildByName("player_hand_panel0").addTouchEventListener(/*UICommonWidget.touchEventVisibleCheckListener*/(function (source, eventType) {
            if (eventType === ccui.Widget.TOUCH_BEGAN) {
                self.selectCardUIs.fill(null);
                handleSelectEvent(source, eventType);
            } else if (eventType === ccui.Widget.TOUCH_MOVED) {
                handleSelectEvent(source, eventType);
            } else if (eventType === ccui.Widget.TOUCH_ENDED) {
                handleSelectEvent(source, eventType);
                self.selectCardUIs.fill(null);
                self.clearTips();
                // self.selectBest(); // Note: has some bug
            } else if (eventType === ccui.Widget.TOUCH_CANCELED) {
                cancelSelects();
                self.clearTips();
            }
        }));
        for (var i = 0; i < const_ddz.HAND_CARD_NUM; i++) {
            let tileImg = handPanel.getChildByName("tile_img_" + i);
            this.allHandCardUI.push(tileImg);
        }
        this.rootUINode.getChildByName("bg_panel").addTouchEventListener(function (source, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                tryCancelSelect(eventType);
            }
        })
    },

    selectBest: function () {
        if (!this.is_show) {
            return;
        }
        let player = h1global.player();
        if (!player || !player.curGameRoom) {
            return;
        }
        let tmp = [];
        for (var i = 0; i < this.allHandCardUI.length; i++) {
            let ui = this.allHandCardUI[i];
            if (ui.selectedFlag) {
                tmp.push(ui.card);
            }
        }
        let best = player.gameOperationAdapter.getBestTip(tmp);
        if (best) {
            let index = 0;
            for (var i = 0; i < this.allHandCardUI.length; i++) {
                let rank = ddz_rules.get_rank(this.allHandCardUI[i].card);
                if (rank !== best[index]) {
                    this._toggleCard(this.allHandCardUI[i], false);
                } else {
                    index++;
                }
            }
        }

    },

    init_desk_tile_panel: function () {
        let player = h1global.player();
        if (!player || !player.curGameRoom) {
            for (var i = 0; i < 3; i++) {
                this.rootUINode.getChildByName("player_desk_tile_panel" + i).setVisible(false);
            }
            return;
        }
        let curPlayerSitNum = player.curGameRoom.curPlayerSitNum;
        let record = player.curGameRoom.discard_record;
        if (record.length < 3) {
            // 位置转换过于复制 简便做法
            record = record.concat([]);
            while (record.length < 3) {
                record.splice(0, 0, null);
            }
        }
        let count = 3;
        let index = curPlayerSitNum;
        while (--count >= 0) {
            let serverSitNum = (index - 1 + player.curGameRoom.player_num) % player.curGameRoom.player_num;
            index--;
            if (serverSitNum === curPlayerSitNum) {
                this.rootUINode.getChildByName("player_desk_tile_panel" + player.server2CurSitNum(serverSitNum)).setVisible(false);
            } else {
                if (count >= 0 && record[count]) {
                    this.update_player_desk_tiles(serverSitNum, record[count], player.serverSitNum, player.curGameRoom);
                } else {
                    this.rootUINode.getChildByName("player_desk_tile_panel" + player.server2CurSitNum(serverSitNum)).setVisible(false);
                }
            }
        }
    },

    init_host_cards_panel: function () {
        this.hide_host_cards_panel();
    },

    init_dealer_mul_panel: function () {
        var player = h1global.player();
        if (player && player.curGameRoom.dealerIdx === -1) {
            for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
                this.update_dealer_mul_panel(i, player && player.curGameRoom ? player.curGameRoom.fight_dealer_mul_list[i] : null)
            }
        }
    },

    init_bet_score_panel: function () {
        var player = h1global.player();
        if (player && player.curGameRoom.dealerIdx === -1) {
            for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
                this.update_bet_score_panel(i, player && player.curGameRoom ? player.curGameRoom.bet_score_list[i] : null)
            }
        }
    },

    lock_player_hand_tiles: function () {
        if (!this.is_show) {
            return;
        }
        // this.rootUINode.getChildByName("player_hand_panel").setTouchEnabled(false);
        this.hide_operation_panel();
    },

    unlock_player_hand_tiles: function () {
        if (!this.is_show) {
            return;
        }
        // this.rootUINode.getChildByName("player_hand_panel").setTouchEnabled(true);
    },

    _toggleCard: function (ui, isSelect) {
        if (isSelect === undefined) {
            isSelect = !ui.selectedFlag;
        }
        ui.selectedFlag = isSelect;
        if (isSelect) {
            ui.setColor(const_ddz.COLOR_GREY);
            if (ui.originY != undefined) {
                ui.y = ui.originY + const_ddz.SELECT_OFFSET;
            } else {
                ui.originY = ui.y;
                ui.y = const_ddz.SELECT_OFFSET;
            }
        } else {
            ui.setColor(const_ddz.COLOR_WHITE);
            if (ui.originY != undefined) {
                ui.y = ui.originY;
            }

        }
    },

    _setBeginGameShow: function (is_show, myServerSitNum, curGameRoom) {
        let serverSitNum = myServerSitNum;
        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            let idx = this.server2CurSitNumOffline(i, myServerSitNum);
            // Note: 如果有明牌打牌 这里要改
            if (myServerSitNum === i) {
                this.rootUINode.getChildByName("player_hand_panel" + idx).setVisible(is_show);
            } else {
                this.rootUINode.getChildByName("player_hand_panel" + idx).setVisible(false);
            }
        }
        if (!is_show) {
            this.hide_operation_panel();
            this.hide_player_desk_panel();
            this.hide_player_hand_tiles(0)
        } else {

            this.update_player_hand_tiles(serverSitNum, curGameRoom.handTilesList[serverSitNum]);
            if (curGameRoom.dealerIdx === -1) {
                this.hide_host_cards_panel();
                this.update_dealer_operation_panel();
            } else {
                this.update_host_cards_panel(curGameRoom.hostCards);
                this.hide_dealer_operation_panel();
                if (curGameRoom.curPlayerSitNum === serverSitNum) {
                    this.update_operation_panel();
                } else {
                    this.hide_operation_panel();
                }
            }
            this.init_desk_tile_panel();
        }
    },

    _removeStartAnimExecutor: function (self) {
        if (self.startAnimExecutor) {
            self.startAnimExecutor.removeFromParent();
            self.startAnimExecutor = null;
        }
    },

    _removeAnimNode: function () {
        if (!this.is_show) {
            return;
        }
        var i = 100;
        while (i > 0) {
            let node = this.rootUINode.getChildByName("deal_anim_node");
            if (node == undefined || node == null) {
                return;
            }
            i--;
            if (cc.sys.isObjectValid(node)) {
                node.removeFromParent();
            }
        }
    },

    startBeginAnim: function (startTilesList, serverSitNum, curGameRoom) {
        if (this.startAnimExecutor) {
            cc.error("already Playing start anim");
            return;
        }
        this.beginAnimPlaying = true;
        this.lock_player_hand_tiles();
        this.startAnimExecutor = cc.Node.create();
        this.rootUINode.addChild(this.startAnimExecutor);
        this._setBeginGameShow(false, serverSitNum, curGameRoom);

        var self = this;
        var index = 0;
        let step1 = cc.sequence(
            cc.delayTime(0.1), cc.callFunc(function () {
                self.update_player_hand_tiles(serverSitNum, startTilesList.slice(0, ++index))
            })
        ).repeat(startTilesList.length);
        let step2 = cc.callFunc(function () {
            self.stopBeginAnim(serverSitNum, curGameRoom);
        });
        this.startAnimExecutor.runAction(cc.sequence(step1, step2));
    },

    stopBeginAnim: function (myServerSitNum, curGameRoom) {
        this._removeStartAnimExecutor(this);
        this._removeAnimNode();
        this.beginAnimPlaying = false;
        this._setBeginGameShow(true, myServerSitNum, curGameRoom);
        this.unlock_player_hand_tiles();
    },

    _createDealerTxtPanelIfNeed: function () {
        let panel = this.rootUINode.getChildByName("_dealer_txt_panel");
        if (!panel) {
            panel = cc.Node.create();
            panel.setName("_dealer_txt_panel");
            this.rootUINode.addChild(panel);
        }
        return panel;
    },

	_createMulTxtPanelIfNeed: function () {
		let panel = this.rootUINode.getChildByName("_mul_txt_panel");
		if (!panel) {
			panel = cc.Node.create();
			panel.setName("_mul_txt_panel");
			this.rootUINode.addChild(panel);
		}
		return panel;
	},

    update_dealer_mul_panel: function (serverSitNum, score) {
        if (!this.is_show || score === null || score === -1) {
            return;
        }
        let player = h1global.player();
        if (!player) {
            return;
        }
        let index = player.server2CurSitNum(serverSitNum);
        let panel = this._createDealerTxtPanelIfNeed();
        let node = panel.getChildByName("op_" + serverSitNum);
        if (node) {
            node.removeFromParent();
        }

        if (score === 0) {
            if (collections.max(player.curGameRoom.fight_dealer_mul_list) < const_ddz.GET_DEALER_MUL) {
                node = cc.Sprite.create("#DDZGameRoomUI/op_pass_jiao_img.png")
            } else {
                node = cc.Sprite.create("#DDZGameRoomUI/op_pass_qiang_img.png")
            }
        } else if (score === const_ddz.GET_DEALER_MUL) {
            node = cc.Sprite.create("#DDZGameRoomUI/dealer_img.png")
        } else if (score === const_ddz.FIGHT_DEALER_MUL) {
            node = cc.Sprite.create("#DDZGameRoomUI/qiang_dealer_img.png")
        }
        if (node) {
            node.setName("op_" + serverSitNum);
            node.setAnchorPoint(0.5, 0.5);
            var pos = cc.director.getWinSize();
            var curSitNum = player.server2CurSitNum(serverSitNum);
            var operation_panel_posY = this.rootUINode.getChildByName("operation_panel").getPositionY();
            switch (curSitNum) {
                case 0:
                    node.setPosition(pos.width * 0.5, operation_panel_posY+75);
                    break;
                case 2:
                    node.setPosition(pos.width * 0.2, this.rootUINode.getChildByName("player_info_panel2").getPositionY()-30);
                    break;
                case 1:
                    node.setPosition(pos.width * 0.8, this.rootUINode.getChildByName("player_info_panel1").getPositionY()-30);
                    break;
                default:
                    break;
            }
            panel.addChild(node);
            if (panel.getChildren()[2]) {
                panel.getChildren()[0].removeFromParent();
            }
            if(player.curGameRoom.fight_dealer_mul_list.indexOf(-1)<0){
                var dealer_index = player.curGameRoom.fight_dealer_mul_list.indexOf(3);
                if(panel.getChildByName("op_"+dealer_index)){
                    panel.getChildByName("op_"+dealer_index).removeFromParent();
                }
            }
        }
        // let rootUINode = this.containUISnippets["PlayerInfoSnippet" + serverSitNum].rootUINode;
        // let img = rootUINode.getChildByName("score_img");
        // if (score == null || score === -1) {
        // 	img.setVisible(false);
        // 	return;
        // }
        // rootUINode.getChildByName("score_num").setVisible(false);
        // img.loadTexture("GameRoomUI/score_mul_" + score + '.png', ccui.Widget.PLIST_TEXTURE);
        // img.ignoreContentAdaptWithSize(true);
        // img.setVisible(true);
    },

    update_dealer_idx: function (dealerIdx) {
        if (!this.is_show) {
            return;
        }
        cc.log("dealer: ", dealerIdx);
        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            this.containUISnippets["PlayerInfoSnippet" + i].update_dealer_idx(i === dealerIdx, true);
        }
    },

    update_bet_score_panel: function (serverSitNum, score, runAnim) {
        if (!this.is_show || score === null || score === -1) {
            return;
        }

        let player = h1global.player();
        if (!player) {
            return;
        }
        let index = player.server2CurSitNum(serverSitNum);
        let panel = this._createDealerTxtPanelIfNeed();
        let node = panel.getChildByName("op_" + serverSitNum);
        if (node) {
            node.removeFromParent();
        }

        if (score === 0) {
            node = cc.Sprite.create("#DDZGameRoomUI/op_pass_jiao_img.png")
        } else if (score > 0) {
            node = cc.Sprite.create("#DDZGameRoomUI/op_bet_" + score + "_img.png")
        }
        if (node) {
            // node.setName("op_" + serverSitNum);
            // node.setPosition(500, serverSitNum * 100 + 200);
            // panel.addChild(node);
            //
            node.setName("op_" + serverSitNum);
            node.setAnchorPoint(0.5, 0.5);
            var pos = cc.director.getWinSize();
            var curSitNum = player.server2CurSitNum(serverSitNum);
            var operation_panel_posY = this.rootUINode.getChildByName("operation_panel").getPositionY();
            switch (curSitNum) {
                case 0:
                    node.setPosition(pos.width * 0.5, operation_panel_posY+75);
                    break;
                case 2:
                    node.setPosition(pos.width * 0.2, pos.height * 0.67);
                    break;
                case 1:
                    node.setPosition(pos.width * 0.8, pos.height * 0.67);
                    break;
                default:
                    break;
            }
            panel.addChild(node);
            if (panel.getChildren()[2]) {
                panel.getChildren()[0].removeFromParent();
            }
        }
    },

	update_mul_panel: function (serverSitNum, score) {
		if (!this.is_show || score === null || score === 0) {
			return;
		}

		let player = h1global.player();
		if (!player) {
			return;
		}
		let index = player.server2CurSitNum(serverSitNum);
		let panel = this._createMulTxtPanelIfNeed();
		let node = panel.getChildByName("op_" + serverSitNum);
		if (node) {
			node.removeFromParent();
		}

		if (score === 1) {
			node = cc.Sprite.create("#DDZGameRoomUI/no_mul_img.png")
		} else if (score == 2) {
			node = cc.Sprite.create("#DDZGameRoomUI/mul_img.png")
		}
		if (node) {
			node.setName("op_" + serverSitNum);
			node.setAnchorPoint(0.5, 0.5);
			var pos = cc.director.getWinSize();
			var curSitNum = player.server2CurSitNum(serverSitNum);
			var operation_panel_posY = this.rootUINode.getChildByName("operation_panel").getPositionY();
			switch (curSitNum) {
				case 0:
					node.setPosition(pos.width * 0.5, operation_panel_posY+75);
					break;
				case 2:
					node.setPosition(pos.width * 0.2, pos.height * 0.67);
					break;
				case 1:
					node.setPosition(pos.width * 0.8, pos.height * 0.67);
					break;
				default:
					break;
			}
			panel.addChild(node);
			if (panel.getChildren()[2]) {
				panel.getChildren()[0].removeFromParent();
			}
		}
	},

    hide_dealer_txt_panel: function () {
        if (!this.is_show) {
            return;
        }
        // 这里是临时创建的，所以直接删除就可以
        let panel = this.rootUINode.getChildByName("_dealer_txt_panel");
        if (panel) {
            panel.runAction(cc.sequence(cc.delayTime(0.5), cc.removeSelf()));
            // panel.removeFromParent();
        }
    },

	hide_mul_txt_panel: function () {
		if (!this.is_show) {
			return;
		}
		let panel = this.rootUINode.getChildByName("_mul_txt_panel");
		if (panel) {
			panel.runAction(cc.sequence(cc.delayTime(0.5), cc.removeSelf()));
		}
	},

    hide_player_desk_panel: function (index) {
        if (index >= 0) {
            this.rootUINode.getChildByName("player_desk_tile_panel" + index).setVisible(false);
        } else {
            for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
                let rootPanel = this.rootUINode.getChildByName("player_desk_tile_panel" + i);
                rootPanel.setVisible(false);
            }
        }
    },

    _getCardImgPath: function (cardInt) {
        let rank = ddz_rules.get_rank(cardInt);
        let suit = ddz_rules.get_suit(cardInt);
        // 大小王
        if (rank > 20) {
            return "Poker/pic_poker_" + rank + '.png';
        } else {
            if (rank === ddz_rules.A) {
                rank = 1;
            }
            return "Poker/pic_poker_" + ddz_rules.POKER_COLOR_DICT[suit] + "" + rank + '.png';
        }
    },

    update_player_desk_tiles: function (serverSitNum, tileList, myServerSitNum, curGameRoom) {
        if (!this.is_show) {
            return;
        }
        if (!curGameRoom) {
            return;
        }
        let idx = this.server2CurSitNumOffline(serverSitNum, myServerSitNum);
        let rootPanel = this.rootUINode.getChildByName("player_desk_tile_panel" + idx);
        let cur_player_tile_panel = rootPanel.getChildByName("player_tile_panel");
        if (!cur_player_tile_panel) {
            return;
        }
        rootPanel.setVisible(true);
        var mid_pos = parseFloat(const_ddz.HAND_CARD_NUM / 2) - parseFloat(tileList.length / 2);
        if (idx == 0) {
            if (mid_pos < 0) {
                mid_pos = 0;
            }
            //rootPanel.x = cc.director.getWinSize().width * 0.2135;
            rootPanel.x = cc.director.getWinSize().width * 0.5 - 378;
            rootPanel.x += (mid_pos - 1) * 36;
        }
        if (idx == 1) {
            rootPanel.x = cc.director.getWinSize().width * 0.83;
            rootPanel.x -= (tileList.length) * 36;
            //rootPanel.x-= 50;
        }

        if (rootPanel.getChildByName("pass_sprite")) {
            rootPanel.getChildByName("pass_sprite").removeFromParent();
        }
        if (rootPanel.getChildByName("sprite31")) {
            rootPanel.getChildByName("sprite31").removeFromParent();
        }
        if (rootPanel.getChildByName("sprite32")) {
            rootPanel.getChildByName("sprite32").removeFromParent();
        }
        if (cur_player_tile_panel.getChildByName("sprite42")) {
            cur_player_tile_panel.getChildByName("sprite42").removeFromParent();
        }
        let srcInfo = ddz_rules.test_with_rule(tileList.concat([]), false, false, true, curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER, curGameRoom.only3_1);
        if (srcInfo[0] == false) {
            srcInfo[1] = 111;
        }
        switch (srcInfo[1]) {
            case 111:
                cc.log("不出牌！");
                let pass_sprite = new cc.Sprite("#DDZGameRoomUI/op_pass_discard_img.png");
                pass_sprite.setName("pass_sprite");
                rootPanel.addChild(pass_sprite);
                pass_sprite.setPositionY(rootPanel.height * 1);
                pass_sprite.setPositionX(idx == 1 ? 100:170);
                break;
            case ddz_rules.TYPE_PAIR3_1://三带一
                cc.log("三带一");
                let sprite31 = new cc.Sprite("#DDZGameRoomUI/3with1_img.png");
                sprite31.setName("sprite31");
                rootPanel.addChild(sprite31);
                sprite31.setPositionY(rootPanel.height * 0.75);
                sprite31.setPositionX(225);
                break;
            case ddz_rules.TYPE_PAIR3_2://三带二
                cc.log("三带二");
                let sprite32 = new cc.Sprite("#DDZGameRoomUI/3with2_img.png");
                sprite32.setName("sprite32");
                rootPanel.addChild(sprite32);
                sprite32.setPositionY(rootPanel.height * 0.75);
                sprite32.setPositionX(245);
                break;
            case ddz_rules.TYPE_PAIR4_2_1://四带二
            case ddz_rules.TYPE_PAIR4_2_2:
                cc.log("四带二");
                let sprite42 = new cc.Sprite("#DDZGameRoomUI/4with2_img.png");
                sprite42.setName("sprite42");
                sprite42.setAnchorPoint(0.5, 0);
                cur_player_tile_panel.addChild(sprite42);
                sprite42.setPositionX(parseFloat(tileList.length / 2) * 40 + 20);
                break;
            case ddz_rules.TYPE_FLOWER:
            case ddz_rules.TYPE_PAIR4:
                cc.log("丢炸弹");
				actionMgr.play_action_once(this.rootUINode,const_ddz.ACTION_NAME_LIST[1]);
                break;
            case ddz_rules.TYPE_SEQ:
                cc.log("顺子");
                var expression_sprite = cc.Sprite.create("res/ui/DDZGameRoomUI/shunzi_img.png");
                this.rootUINode.addChild(expression_sprite);
                expression_sprite.setPosition(cc.director.getWinSize().width*0.7,cc.director.getWinSize().height*0.7);
				expression_sprite.runAction(cc.Sequence.create(
					cc.moveBy(0.92,-288,-38),
					cc.Spawn.create(
						cc.moveBy(0.42, -130, -20),
						cc.fadeTo(0.42,102)
					),
					cc.CallFunc.create(function () {
						expression_sprite.removeFromParent();
					})
				));
                break;
            case ddz_rules.TYPE_SEQ_PAIR2:
                cc.log("连对");
                var expression_sprite = cc.Sprite.create("res/ui/DDZGameRoomUI/liandui_img.png");
				this.rootUINode.addChild(expression_sprite);
				expression_sprite.setPosition(cc.director.getWinSize().width*0.7,cc.director.getWinSize().height*0.7);
				expression_sprite.runAction(cc.Sequence.create(
					cc.moveBy(0.92,-288,-38),
					cc.Spawn.create(
						cc.moveBy(0.42, -130, -20),
						cc.fadeTo(0.42,102)
					),
					cc.CallFunc.create(function () {
						expression_sprite.removeFromParent();
					})
				));
                break;
            case ddz_rules.TYPE_SEQ_PAIR3:
            case ddz_rules.TYPE_SEQ_PAIR3_1:
            case ddz_rules.TYPE_SEQ_PAIR3_2:
                cc.log("飞机");
				actionMgr.play_action_once(this.rootUINode,const_ddz.ACTION_NAME_LIST[0]);
                break;
            case ddz_rules.TYPE_PAIR_JOKER:
                cc.log("火箭");
				actionMgr.play_action_once(this.rootUINode,const_ddz.ACTION_NAME_LIST[2]);
                break;
            default:
                break;
        }


        for (var i = 0; i < const_ddz.DESK_CARD_NUM; i++) {
            let tile = cur_player_tile_panel.getChildByName('tile_img_' + i);
            let num = tileList[i];
            if (num > 0) {
                tile.loadTexture(this._getCardImgPath(num), ccui.Widget.PLIST_TEXTURE);
                tile.setVisible(true);
            } else {
                tile.setVisible(false);
            }
        }
    },

    hide_player_hand_tiles: function (serverSitNum) {
        if (!this.is_show) {
            return;
        }
        let player = h1global.player();
        if (!player || !player.curGameRoom) {
            return;
        }
        let idx = player.server2CurSitNum(serverSitNum);
        let rootPanel = this.rootUINode.getChildByName("player_hand_panel" + idx);
        rootPanel.setVisible(false);
    },

    hide_all_player_hand_tiles: function () {
        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            let rootPanel = this.rootUINode.getChildByName("player_hand_panel" + i);
            rootPanel.setVisible(false);
        }
    },

    update_player_hand_tiles: function (serverSitNum, tileList) {
        if (!this.is_show) {
            return;
        }
        let player = h1global.player();
        if (!player) {
            return;
        }
        let index = player.server2CurSitNum(serverSitNum);
        let player_hand_panel_root = this.rootUINode.getChildByName("player_hand_panel" + index);
        let cur_player_tile_panel = player_hand_panel_root.getChildByName("player_tile_panel");
        if (!cur_player_tile_panel) {
            return;
        }

        let hasFlower = player.curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER;

        player_hand_panel_root.setVisible(true);
        //牌的位置从中间开始
        // var tileListcopy = tileList.concat([]);
        // var mid_pos = parseInt(const_ddz.HAND_CARD_NUM/2)-parseInt(tileListcopy.length/2);
        // for(var j=0;j<mid_pos;j++){
        //    tileListcopy.unshift(-1);
        // }
        // cc.log(mid_pos);
        // cc.log(tileListcopy.length);
        if (index === 0) {
            // if (hasFlower && tileList.length > 20) {
            // 	player_hand_panel_root.x += cc.winSize.width * 0.03;
            // }
            for (var i = 0; i < const_ddz.HAND_CARD_NUM; i++) {
                let tile = cur_player_tile_panel.getChildByName('tile_img_' + i);
                let num = tileList[i];
                this._toggleCard(tile, false);
                if (num > 0) {
                    tile.loadTexture(this._getCardImgPath(num), ccui.Widget.PLIST_TEXTURE);
                    tile.card = num;
                    tile.setVisible(true);
                } else {
                    tile.card = null;
                    tile.setVisible(false);
                    // Note: 手牌只有一家，不需要判断了
                    // if (num === 0) {
                    // 	tile.card = num;
                    // 	tile.loadTexture("Poker/pic_poker_backend.png", ccui.Widget.PLIST_TEXTURE);
                    // 	tile.setVisible(false);
                    // } else {
                    // 	tile.card = null;
                    // 	tile.setVisible(false);
                    // }
                }
            }
            //更新宽度
            this.now_tile_num = tileList.length;
            if (this.now_tile_num < 17) {
                this.now_tile_num = 17;
            }
            let handPanel = this.rootUINode.getChildByName("player_hand_panel0").getChildByName("player_tile_panel");

            var tile_list = handPanel.getChildren();
            let pos = 0;
            var winSize = cc.director.getWinSize();
            this.rootUINode.getChildByName("player_hand_panel0").width = winSize.width - 10;
            let tileX = (winSize.width - 99) / this.now_tile_num;

            for (var i = 0; i < tile_list.length; i++) {
                tile_list[i].setPositionX(pos);
                pos += tileX;
            }
            //更新起始位置
            var mid_pos = parseFloat(this.now_tile_num / 2) - parseFloat(tileList.length / 2);
            player_hand_panel_root.x = cc.winSize.width * 0.5 - player_hand_panel_root.width * 0.5;
            player_hand_panel_root.x += mid_pos * tileX;

        } else {
            player_hand_panel_root.setVisible(false);
            var player_wait_panel = this.rootUINode.getChildByName("player_wait_panel" + index.toString());
            player_wait_panel.getChildByName("wait_time_label").setString(tileList.length);
        }
    },

    update_host_cards_panel: function (card_list) {
        if (!this.is_show) {
            return;
        }
        var panel = this.rootUINode.getChildByName("host_cards_panel");
        // 区分花牌
        if (card_list.length === 3) {
            for (var i = 0; i < card_list.length; i++) {
                let node = panel.getChildByName("tile_img_" + i);
                UICommonWidget.addOriginPosition(node, 10 * i + 20, 0);
                node.loadTexture(this._getCardImgPath(card_list[i]), ccui.Widget.PLIST_TEXTURE);
            }
            panel.getChildByName("tile_img_3").setVisible(false);
        } else {
            for (var i = 0; i < card_list.length; i++) {
                let node = panel.getChildByName("tile_img_" + i);
                UICommonWidget.resetToOriginPosition(node);
                node.loadTexture(this._getCardImgPath(card_list[i]), ccui.Widget.PLIST_TEXTURE);
                node.setVisible(true);
            }
        }
        //隐藏一开始的三张盖牌
        // var cover_cards_panel = this.rootUINode.getChildByName("cover_cards_panel");
        // cover_cards_panel.setVisible(false);

    },

    play_flip_anime: function (card_list) {
        if (!this.is_show) {
            return;
        }
        var self = this;
        var panel = this.rootUINode.getChildByName("host_cards_panel");
        for (var i = 0; i < card_list.length; i++) {
            panel.getChildByName("tile_img_" + i).loadTexture(this._getCardImgPath(card_list[i]), ccui.Widget.PLIST_TEXTURE)
        }

        var cover_cards_panel = this.rootUINode.getChildByName("cover_cards_panel");
        let show_cards_panel = cover_cards_panel.clone();

        cover_cards_panel.setVisible(false);
        show_cards_panel.setVisible(true);
        this.rootUINode.addChild(show_cards_panel);
        var length = card_list.length;

        show_cards_panel.runAction(cc.sequence(cc.delayTime(1.2),
            cc.spawn(cc.moveTo(0.6, panel.x, panel.y),
                cc.scaleTo(0.6, 0.66, 0.66)
            ),
            cc.callFunc(function () {
                self.update_host_cards_panel(card_list);
                panel.setVisible(true);
            }),
            cc.removeSelf()
        ));

        for (var i = 0; i < length; i++) {
            let index = i;
            var tileImg = show_cards_panel.getChildByName("tile_img_" + index);
            tileImg.runAction(cc.sequence(
                cc.scaleTo(0.6, 0, 1),
                cc.callFunc(function (img) {
                    img.loadTexture(self._getCardImgPath(card_list[index]), ccui.Widget.PLIST_TEXTURE);
                }, tileImg),
                cc.scaleTo(0.6, 1, 1)
            ));
        }
        // 区分有没有花牌
        show_cards_panel.getChildByName("tile_img_3").setVisible(length === 4)
    },

    init_cover_cards_panel: function () {
        let player = h1global.player();
        // if(player.curGameRoom.dealerIdx==-1 && player.curGameRoom.room_state==const_val.ROOM_PLAYING){
        // this.show_cover_cards_panel();
        // }else{
        var cover_cards_panel = this.rootUINode.getChildByName("cover_cards_panel");
        cover_cards_panel.setVisible(false);
        //}
        if (player.curGameRoom.room_state == const_val.ROOM_PLAYING && player.curGameRoom.dealerIdx != -1) {
            var panel = this.rootUINode.getChildByName("host_cards_panel");
            panel.setVisible(true);
        } else {
            var panel = this.rootUINode.getChildByName("host_cards_panel");
            panel.setVisible(false);
        }
    },

    update_multiple_panel: function (spring, wait) {
        //cc.warn(spring);
        let player = h1global.player();
        var multiple_panel = this.rootUINode.getChildByName("multiple_panel");
        if (player.curGameRoom.room_state == const_val.ROOM_PLAYING || wait) {
            multiple_panel.getChildByName("mul_label").setString(cutil_ddz.change_fight_dealer_mul_list(player.curGameRoom.fight_dealer_mul_list, spring)[0]);
            var top_bot = 1;
            if (player.curGameRoom.game_mode == const_ddz.GAME_MODE_SCORE) {
                var bet_score_list = player.curGameRoom.bet_score_list;
                for (var i = 0; i < bet_score_list.length; i++) {
                    if (top_bot < bet_score_list[i]) {
                        top_bot = bet_score_list[i];
                    }
                }
            }
            multiple_panel.getChildByName("bot_label").setString((top_bot * player.curGameRoom.mul_score).toString());
        } else {
            multiple_panel.getChildByName("mul_label").setString("1");
            multiple_panel.getChildByName("bot_label").setString(player.curGameRoom.mul_score);
        }
    },

    init_player_wait_panel: function () {
        let player = h1global.player();
        var player_wait_panel1 = this.rootUINode.getChildByName("player_wait_panel1");
        var player_wait_panel2 = this.rootUINode.getChildByName("player_wait_panel2");
        if (player.curGameRoom.room_state == const_val.ROOM_PLAYING) {
            player_wait_panel1.setVisible(true);
            player_wait_panel2.setVisible(true);
        } else {
            player_wait_panel1.setVisible(false);
            player_wait_panel2.setVisible(false);
        }
    },

    show_cover_cards_panel: function () {
        var cover_cards_panel = this.rootUINode.getChildByName("cover_cards_panel");
        cover_cards_panel.setVisible(true);
        let player = h1global.player();
        // 区分花牌
        if (player && player.curGameRoom && player.curGameRoom.flower_mode === const_ddz.MODE_WITHOUT_FLOWER) {
            for (var i = 0; i < 3; i++) {
                let node = cover_cards_panel.getChildByName("tile_img_" + i);
                UICommonWidget.addOriginPosition(node, 12 * i + 35, 0);
            }
            cover_cards_panel.getChildByName("tile_img_3").setVisible(false);
        } else {
            for (var i = 0; i < 4; i++) {
                let node = cover_cards_panel.getChildByName("tile_img_" + i);
                UICommonWidget.resetToOriginPosition(node);
                node.setVisible(true);
            }
        }
    },

    hide_host_cards_panel: function () {
        if (!this.is_show) {
            return;
        }
        this.rootUINode.getChildByName("host_cards_panel").setVisible(false);
    },

    _nextTipType: function () {
        let types = ddz_rules.ALL_TYPES;
        let index = types.indexOf(this.tipType);
        return types[++index % types.length]
    },

    updateTip: function () {
        if (!this.tipIter) {
            let player = h1global.player();
            if (!player) {
                return;
            }
            // this.tipType = this._nextTipType();
            this.tipIter = player.gameOperationAdapter.getGreaterThanCards(this.tipType);
        }
        let next = null;
        if ((next = this.tipIter.next()) != null) {
            let flag = false;
            for (var i = 0; i < this.allHandCardUI.length; i++) {
                flag = false;
                let ui = this.allHandCardUI[i];
                if (next.length > 0) {
                    let rank = ddz_rules.get_rank(ui.card);
                    for (var j = 0; j < next.length; j++) {
                        if (rank === next[j]) {
                            flag = true;
                            next.splice(j, 1);
                            break;
                        }
                    }
                }
                this._toggleCard(ui, flag);
            }
        } else {
            let player = h1global.player();
            if (!player) {
                return;
            }
            let oldType = this.tipType;
            while ((this.tipType = this._nextTipType()) !== oldType) {
                this.tipIter = player.gameOperationAdapter.getGreaterThanCards(this.tipType);
                if (this.tipIter.hasNext()) {
                    this.updateTip();
                    return;
                }
            }
            this.tipIter = player.gameOperationAdapter.getGreaterThanCards(this.tipType);
            if (!this.tipIter.hasNext()) {
                cc.log("no tip");
            } else {
                this.updateTip();
            }
        }
    },

    clearTips: function () {
        this.tipType = ddz_rules.TYPE_SINGLE;
        this.tipIter = null;
    },

    init_operation_panel: function () {
        var self = this;
        let operation_panel = this.rootUINode.getChildByName("operation_panel");
        //let dealer_operation_panel = this.rootUINode.getChildByName("dealer_operation_panel");
        //dealer_operation_panel.setVisible(false);
        operation_panel.getChildByName("btn_op_0").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function () {
            let selectCards = [];
            for (var i = 0; i < self.allHandCardUI.length; i++) {
                let ui = self.allHandCardUI[i];
                if (ui.selectedFlag) {
                    selectCards.push(ui.card)
                }
            }
            if (selectCards.length === 0) {
                UICommonWidget.playInfoMsg(self.rootUINode, "res/ui/GameRoomUI/show_information.png", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.55), 1, "res/ui/GameRoomUI/need_discard_bg.png");
                return;
            }
            let player = h1global.player();
            if (player) {
                if (player.gameOperationAdapter.canDiscard(selectCards)) {
                    player.doOperation(const_ddz.OP_DISCARD, selectCards);
                    if (cc.sys.isObjectValid(operation_panel)) {
                        operation_panel.setVisible(false);
                    }
                } else {
                    UICommonWidget.playInfoMsg(self.rootUINode, "res/ui/GameRoomUI/show_information.png", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.55), 1, "res/ui/GameRoomUI/need_discard_bg.png");
                }
            }
        }));

        function doPass() {
            let player = h1global.player();
            if (player) {
                player.doOperation(const_ddz.OP_PASS, []);
                if (cc.sys.isObjectValid(operation_panel)) {
                    operation_panel.setVisible(false);
                    for (var i = 0; i < self.allHandCardUI.length; i++) {
                        self._toggleCard(self.allHandCardUI[i], false);
                    }
                }
            }
        }

        operation_panel.getChildByName("btn_op_1").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(doPass));
        operation_panel.getChildByName("btn_op_2").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source) {
            if (source.usePass) {
                doPass();
            } else {
                self.updateTip();
            }
        }));

        let player = h1global.player();
        if (!player) {
            this.hide_operation_panel();
            this.hide_dealer_operation_panel();
            return;
        }
        if (player.startActions["GameRoomUI"]) {
            return;
        }
        let curGameRoom = player.curGameRoom;
        if (curGameRoom.room_state === const_val.ROOM_WAITING) {
            this.hide_operation_panel();
            this.hide_dealer_operation_panel();
            return;
        }
        if (curGameRoom.dealerIdx === -1) {
            if (curGameRoom.curPlayerSitNum === player.serverSitNum) {
                this.update_dealer_operation_panel();
            } else {
                this.hide_dealer_operation_panel();
            }
        } else {
            this.hide_dealer_operation_panel();
            //这里加入加倍判断
			if(player.curGameRoom.mul_mode && player.curGameRoom.mul_score_list.indexOf(0)>=0 && collections.count(player.curGameRoom.mul_score_list,1) !== 2){
				this.update_operation_panel();
			}else{
				if (curGameRoom.curPlayerSitNum === player.serverSitNum) {
					this.update_operation_panel();
				} else {
					this.hide_operation_panel();
				}
            }
        }
    },

    playOperationFunc: function (curSitNum, opId) {
        var self = this;
        var cur_img = ccui.ImageView.create();
        var cur_img1 = ccui.ImageView.create();
        var cur_img2 = ccui.ImageView.create();
        if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
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
        } else {
            cur_img.loadTexture("res/ui/GameRoomUI/" + opId + "_2.png");
            cur_img.setScale(4.0);
            opPos(curSitNum, cur_img);
            this.rootUINode.addChild(cur_img);
            cur_img.runAction(cc.Sequence.create(cc.ScaleTo.create(0.2, 1.5), cc.DelayTime.create(0.5), cc.removeSelf()));
        }

        //动作的位置
        function opPos(curSitNum, cur_img) {
            if (curSitNum == 0) {
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, self.rootUINode.getChildByName("player_tile_panel0").getPositionY() + 160));
            } else if (curSitNum == 1) {
                cur_img.setPosition(cc.p(self.rootUINode.getChildByName("player_tile_panel1").getPositionX(), cc.winSize.height * 0.5));
            } else if (curSitNum == 2) {
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, self.rootUINode.getChildByName("player_tile_panel2").getPositionY() - 160));
            } else if (curSitNum == 3) {
                cur_img.setPosition(cc.p(self.rootUINode.getChildByName("player_tile_panel3").getPositionX(), cc.winSize.height * 0.5));
            } else {
                cur_img.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
            }
        }
    },

    playOperationEffect: function (opId, serverSitNum, tile) {
        var curSitNum = -1;
        if (serverSitNum === undefined) {
            curSitNum = -1;
        } else {
            curSitNum = h1global.entityManager.player().server2CurSitNum(serverSitNum);
        }
    },

    getEmotionPos: function (playerInfoPanel, idx) {
        var pos = playerInfoPanel.getPosition();
        if (idx === 0) {
            pos = cc.p(pos.x + playerInfoPanel.width, pos.y + playerInfoPanel.height * 0.5);
        } else if (idx === 1) {
            pos = cc.p(pos.x - playerInfoPanel.width * 0.9, pos.y + playerInfoPanel.height * 0.1);
        } else if (idx === 2) {
            //pos = cc.p(pos.x - playerInfoPanel.width * 1.55, pos.y);
            pos = cc.p(pos.x + playerInfoPanel.width, pos.y);
        } else if (idx === 3) {
            pos = cc.p(pos.x - playerInfoPanel.width * 0.5, pos.y - playerInfoPanel.height * 0.3);
        } else if (idx === 4) {
            pos = cc.p(pos.x + playerInfoPanel.width * 0.5, pos.y - playerInfoPanel.height * 0.9);
        } else if (idx === 5) {
            pos = cc.p(pos.x + playerInfoPanel.width * 0.9, pos.y + playerInfoPanel.height * 0.5);
        }
        return pos;
    },

    playEmotionAnim: function (serverSitNum, eid) {
        emotion.playEmotion(this.rootUINode,eid,serverSitNum);
        return;//下面的是以前的代码
        var curSitNum = h1global.entityManager.player().server2CurSitNum(serverSitNum);
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + curSitNum);
        var talk_img = ccui.ImageView.create();
        // talk_img.setPosition(this.getMessagePos(player_info_panel).x - 70, this.getMessagePos(player_info_panel).y + 10);
        talk_img.setPosition(this.getEmotionPos(player_info_panel, curSitNum));
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
        for (var i = 1; i <= const_val.ANIM_LIST[eid - 1]; i++) {
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
        if (curSitNum > 0 && curSitNum < 2) {
            talk_img.setScaleX(-1);
            talk_img.setPositionX(talk_img.getPositionX() - 40);
            talk_img.setPositionY(talk_img.getPositionY() - 10);
        } else {
            talk_img.setPositionX(talk_img.getPositionX() + 40);
            talk_angle_img.setLocalZOrder(3);
        }
        talk_angle_img.setPosition(3, talk_angle_img.getPositionY() + 50);
        emot_sprite.runAction(cc.Sequence.create(cc.Repeat.create(effect_action, 2), cc.CallFunc.create(function () {
            talk_img.removeFromParent();
        })));
    },

    getMessagePos: function (playerInfoPanel, idx) {
        var pos = playerInfoPanel.getPosition();
        if (idx === 0) {
            pos = cc.p(pos.x + playerInfoPanel.width, pos.y + playerInfoPanel.height * 0.5);
        } else if (idx === 1) {
            pos = cc.p(pos.x - playerInfoPanel.width * 0.9, pos.y + playerInfoPanel.height * 0);
        } else if (idx === 2) {
            pos = cc.p(pos.x + playerInfoPanel.width * 0.9, pos.y - playerInfoPanel.height * 0);
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
        talk_img.setAnchorPoint(0, 0.5);
        talk_img.setPosition(this.getMessagePos(player_info_panel, idx));
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
        talk_angle_img.setPosition(3, talk_img.getContentSize().height * 0.5);
        if (idx > 0 && idx < 2) {
            msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.37 + 10, 23));
            talk_img.setScaleX(-1);
            msg_label.setScaleX(-1);
        } else {
            msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.50 + 13, 23));
            talk_angle_img.setLocalZOrder(3);
        }
        msg_label.runAction(cc.Sequence.create(cc.DelayTime.create(2.0), cc.CallFunc.create(function () {
            talk_img.removeFromParent();
        })));
    },

    getExpressionPos: function (player_info_panel, idx) {
        // 魔法表情
        var pos = player_info_panel.getPosition();
        if (idx === 0) {
            pos = cc.p(pos.x + player_info_panel.width * 0.5, pos.y + player_info_panel.height * 0.5);
        } else if (idx === 1) {
            pos = cc.p(pos.x - player_info_panel.width * 0.4, pos.y);
        } else if (idx === 2) {

            pos = cc.p(pos.x + 50, pos.y);
        } else if (idx === 3) {
            pos = cc.p(pos.x, pos.y - player_info_panel.height * 0.3);
        } else if (idx === 4) {
            pos = cc.p(pos.x, pos.y - player_info_panel.height * 0.9);
        } else if (idx === 5) {
            pos = cc.p(pos.x + player_info_panel.width * 0.4, pos.y + player_info_panel.height * 0.4);
        }
        return pos;
    },

    playExpressionAnim: function (fromIdx, toIdx, eid) {
        var self = this;
        if (eid === 3) {	//因为扔钱动画不是plist，所以单独处理
            self.playMoneyAnim(fromIdx, toIdx);
            return;
        }
        var rotate = 0;
        var moveTime = 0.7;
        var flag = (fromIdx % 3 == 0 && toIdx % 3 == 0) || (fromIdx % 3 != 0 && toIdx % 3 != 0);
        if (flag) {
            moveTime = 0.3;
        }
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + fromIdx.toString());
        var expression_img = ccui.ImageView.create();
        expression_img.setPosition(this.getExpressionPos(player_info_panel, fromIdx));
        expression_img.loadTexture("res/ui/PlayerInfoUI/expression_" + const_val.EXPRESSION_ANIM_LIST[eid] + ".png");
        this.rootUINode.addChild(expression_img);
        // if(eid > 1){
        //    rotate = 1440;
        //    rotate = rotate + (moveTime - 0.7) * 1800;
        // }
        expression_img.runAction(cc.Spawn.create(cc.RotateTo.create(0.2 + moveTime, rotate), cc.Sequence.create(
            cc.ScaleTo.create(0.1, 1.5),
            cc.ScaleTo.create(0.1, 1),
            cc.MoveTo.create(moveTime, self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx)),
            cc.CallFunc.create(function () {
                expression_img.removeFromParent();
                cc.audioEngine.playEffect("res/sound/effect/" + const_val.EXPRESSION_ANIM_LIST[eid] + ".mp3");
                self.playExpressionAction(toIdx, self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx), eid);
            })
        )));
    },

    playMoneyAnim: function (fromIdx, toIdx) {
        var self = this;
        var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + fromIdx.toString());

        var money_img_list = [];
        var baodian_img_list = [];
        for (var j = 0; j < 10; j++) {
            //var money_img  = new cc.Sprite("res/ui/PlayerInfoUI/dzpk_dj_icon_ani.png");
            var money_img = new cc.Sprite("res/ui/PlayerInfoUI/expression_money.png");
            var baodian_img = new cc.Sprite("res/ui/PlayerInfoUI/baodian.png");
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
        for (var i = 0; i < 10; i++) {
            var random_pos = cc.p(Math.random() * 60 - 30, Math.random() * 60 - 30);
            (function (i) {
                money_img_list[i].runAction(cc.sequence(
                    cc.delayTime(i * 0.1),
                    // cc.spawn(cc.rotateBy(0.2,360),cc.moveBy(0.2, pos.x + random_pos.x-70, pos.y + random_pos.y-200)),
                    cc.spawn(cc.rotateBy(0.2, 360), cc.moveTo(0.2, pos.x, pos.y + random_pos.y)),
                    cc.callFunc(function () {
                        //cc.spawn(cc.rotateBy(0.2,360),cc.moveBy(0.2, pos.x + random_pos.x-70, pos.y + random_pos.y-200));
                        cc.audioEngine.playEffect("res/sound/effect/com_facesound_3.mp3");
                        money_img_list[i].setScale(1.2);
                        baodian_img_list[i].setPosition(pos.x + i, pos.y + 30 + i);
                        baodian_img_list[i].runAction(cc.rotateTo(0.1, 45));
                        baodian_img_list[i].setVisible(true);
                    }),
                    //cc.moveTo(0.1,pos.x+i, pos.y+30+i),
                    cc.moveBy(0.1, 5, 3),
                    //cc.moveBy(0.1,-2,0),
                    cc.callFunc(function () {
                        money_img_list[i].setScale(1);
                        baodian_img_list[i].setVisible(false);
                    }),
                    // cc.moveBy(0.2,(i%2>0 ? (9-i)*4 : -(9-i)*4)+Math.random()*5-10,		-26 + i*2	),
                    // cc.rotateTo(0.2,40-Math.random()*40),
                    cc.spawn(cc.rotateTo(0.2, Math.random() * 40 - Math.random() * 40), cc.moveBy(0.2, (i % 2 > 0 ? (9 - i) * 4 : -(9 - i) * 4) + Math.random() * 5 - 10, -26 + i * 2)),
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

    playExpressionAction: function (idx, pos, eid) {
        if (idx < 0 || idx > 3) {
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
            UICommonWidget.create_effect_action({
                "FRAMENUM": const_val.EXPRESSION_ANIMNUM_LIST[eid],
                "TIME": const_val.EXPRESSION_ANIMNUM_LIST[eid] / 16,
                "NAME": "Expression/" + const_val.EXPRESSION_ANIM_LIST[eid] + "_"
            }),
            cc.DelayTime.create(0.5),
            cc.CallFunc.create(function () {
                expression_sprite.removeFromParent();
            })
        ));
    },

    playVoiceAnim: function (serverSitNum, record_time) {
        var self = this;
        if (cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.pauseMusic();
            cc.audioEngine.pauseAllEffects();
            cc.audioEngine.setEffectsVolume(0);
        }
        var idx = h1global.entityManager.player().server2CurSitNum(serverSitNum);
        var interval_time = 0.8;
        this.talk_img_num += 1;
        // var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
        var player_info_panel = undefined;
        if (serverSitNum < 0) {
            player_info_panel = this.rootUINode.getChildByName("agent_info_panel");
        } else {
            player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
        }
        var talk_img = ccui.ImageView.create();
        talk_img.setPosition(this.getMessagePos(player_info_panel, idx));
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
        voice_img2.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time), cc.CallFunc.create(function () {
            voice_img1.setVisible(false);
            voice_img2.setVisible(true);
            voice_img3.setVisible(false);
        }), cc.DelayTime.create(interval_time * 2), cc.CallFunc.create(function () {
            voice_img2.setVisible(false)
        }))));
        var voice_img3 = ccui.ImageView.create();
        voice_img3.loadTexture("res/ui/Default/voice_img3.png");
        voice_img3.setPosition(cc.p(50, 23));
        voice_img3.setVisible(false);
        talk_img.addChild(voice_img3);
        voice_img3.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time * 2), cc.CallFunc.create(function () {
            voice_img1.setVisible(false);
            voice_img2.setVisible(false);
            voice_img3.setVisible(true);
        }), cc.DelayTime.create(interval_time), cc.CallFunc.create(function () {
            voice_img3.setVisible(false);
            voice_img1.setVisible(true);
        }))));
        talk_angle_img.setPosition(3, talk_img.getContentSize().height * 0.5);
        if (idx > 0 && idx < 2) {
            talk_img.setScale(-1);
            talk_img.setPositionX(talk_img.getPositionX() - 40);
        } else {
            talk_img.setPositionX(talk_img.getPositionX() + 40);
            talk_angle_img.setLocalZOrder(3);
        }
        talk_img.runAction(cc.Sequence.create(cc.DelayTime.create(record_time), cc.CallFunc.create(function () {
            talk_img.removeFromParent();
            self.talk_img_num -= 1;
            if (self.talk_img_num === 0) {
                if (!cc.audioEngine.isMusicPlaying()) {
                    cc.audioEngine.resumeMusic();
                    cc.audioEngine.resumeAllEffects();
                    cc.audioEngine.setEffectsVolume(cc.sys.localStorage.getItem("EFFECT_VOLUME") * 0.01);
                }
            }
        })));
        // return talk_img;
    },

    play_result_anim: function (callback, player_info_list, scoreList, curGameRoom, myServerSitNum, spring) {
        var self = this;
        if (true) {
            if (spring) {
                cc.log("春天");
                UICommonWidget.load_effect_plist("spr_action_spring");
                var expression_sprite = cc.Sprite.create();
                var pos = cc.director.getWinSize();
                expression_sprite.setPosition(pos.width * 0.5, pos.height * 0.7);
                self.rootUINode.addChild(expression_sprite);

                expression_sprite.runAction(cc.Sequence.create(
                    UICommonWidget.create_effect_action({
                        "FRAMENUM": 12,
                        "TIME": 1.5,
                        "NAME": "spr_action_spring_"
                    }),
                    cc.DelayTime.create(0.1),
                    cc.CallFunc.create(function () {
                        expression_sprite.removeFromParent();
                    })
                ));
            }
            this.rootUINode.runAction(cc.sequence(
                cc.delayTime(1),
                cc.callFunc(callback)));
            return;
        }
        this.playResultAnim = true;
        var self = this;

        function createLabel(parent, score) {
            if (score === 0) {
                return;
            }
            let signum = "";
            // 130, 54
            // let bg_path = "GameRoomUI/score_win_bg.png";
            // let font = "yingfenshuzi.fnt";
            let nodeSrc = null;
            if (score > 0) {
                signum = "+";
                nodeSrc = self.rootUINode.getChildByName("clone_nodes").getChildByName("win_anim_img");
            } else if (score < 0) {
                // signum = "-";
                // bg_path = "GameRoomUI/score_lose_bg.png";
                // font = "shufenshuzi.fnt";
                nodeSrc = self.rootUINode.getChildByName("clone_nodes").getChildByName("lose_anim_img");
            }

            // let bgImg = new ccui.ImageView(bg_path, ccui.Widget.PLIST_TEXTURE);
            let bgImg = nodeSrc.clone();
            let label = bgImg.getChildByName("score_label");
            label.setString(signum + score);
            // let label = ccui.TextBMFont.create(signum + score, "res/ui/GameRoomUI/' + font);
            // let label = UICommonWidget.createBMFont(signum + score, "res/ui/GameRoomUI/' + font);
            // label.setPosition(130 * 0.5, 54 * 0.5);
            // bgImg.addChild(label);
            bgImg.runAction(cc.spawn(
                cc.sequence(cc.moveBy(0.8, 0, 40), cc.delayTime(4), cc.removeSelf()),
                cc.sequence(cc.fadeIn(0.2), cc.delayTime(4.4), cc.fadeOut(0.2))
            ));
            label.runAction(cc.sequence(cc.fadeIn(0.2), cc.delayTime(4.4), cc.fadeOut(0.2)));

            let size = parent.getContentSize();
            bgImg.setPosition(size.width / 2, size.height / 2 + 40);
            parent.addChild(bgImg);
        }

        player_info_list = cutil.deepCopy(player_info_list).sort(function (a, b) {
            if (a['idx'] === curGameRoom.dealerIdx) {
                return 100;
            }
            if (b['idx'] === curGameRoom.dealerIdx) {
                return -100;
            }
        });
        var tmp_player_info_list = cutil.deepCopy(player_info_list);
        var dealerIdx = curGameRoom.dealerIdx;
        this.rootUINode.runAction(
            cc.sequence(
                cc.sequence(
                    cc.delayTime(0.5), cc.callFunc(function () {
                        let info = player_info_list.shift();
                        let idx = info['idx'];
                        let tiles = info['tiles'];
                        self.update_player_desk_tiles(idx, tiles, true, true, myServerSitNum, curGameRoom);
                        if (dealerIdx === idx) {
                            return;
                        }
                        if (scoreList[idx] < 0) {
                            self.playCoinAnim(idx, dealerIdx, 0.6, myServerSitNum);
                            cc.audioEngine.playEffect("res/sound/effect/coins_fly.mp3");
                        } else if (scoreList[idx] > 0) {
                            self.playCoinAnim(dealerIdx, idx, 0.6, myServerSitNum, 0.8);
                            cc.audioEngine.playEffect("res/sound/effect/coins_fly.mp3");
                        }
                    })
                ).repeat(player_info_list.length),
                cc.callFunc(function () {
                    for (var i = 0; i < tmp_player_info_list.length; i++) {
                        var info = tmp_player_info_list[i];
                        let idx = info['idx'];
                        self.rootUINode.runAction(cc.sequence(cc.delayTime(i * 0.5), cc.callFunc(function () {
                            createLabel(self.containUISnippets["PlayerInfoSnippet" + idx].rootUINode, scoreList[idx]);
                        })))
                    }
                }),
                cc.delayTime(2),
                cc.callFunc(function () {
                    self.playResultAnim = false;
                    if (callback) {
                        callback();
                    }
                }))
        );
    },

    update_roominfo_panel: function () {
        if (!this.is_show) {
            return;
        }
    },

    init_game_info_panel: function () {
        var player = h1global.player();
        let now_wait = player.server2CurSitNum(player.curGameRoom.curPlayerSitNum);
        this.set_clock_pos(now_wait);
        cc.log(player.curGameRoom.room_state);
        if (player.curGameRoom.room_state == const_val.ROOM_PLAYING) {
            this.rootUINode.getChildByName("game_info_panel").setVisible(true);
        } else {
            this.rootUINode.getChildByName("game_info_panel").setVisible(false);
        }
    },

    update_game_info_panel: function (nextServerSitNum) {
        var player = h1global.player();
        let now_wait = player.server2CurSitNum(nextServerSitNum);
        cc.log("下一家的座位号", nextServerSitNum);
        this.set_clock_pos(now_wait);
    },

    set_clock_pos: function (now_wait) {
        var game_info_panel = this.rootUINode.getChildByName("game_info_panel");
        var pos = cc.director.getWinSize();
        var operation_panel_posX = this.rootUINode.getChildByName("operation_panel").getPositionX();
        var operation_panel_posY = this.rootUINode.getChildByName("operation_panel").getPositionY();
        switch (now_wait) {
            case 0:
                if (this.my_clock_pos == 4) {
                    //game_info_panel.setPosition(pos.width * 0.3225, pos.height * 0.384);
                    game_info_panel.setPosition(operation_panel_posX - 230, operation_panel_posY);
                } else if (this.my_clock_pos == 3) {
                    game_info_panel.setPosition(operation_panel_posX - 105, operation_panel_posY);
                } else if(this.my_clock_pos == 1){
					game_info_panel.setPosition(operation_panel_posX - 150, operation_panel_posY);
                } else{
                    game_info_panel.setPosition(operation_panel_posX, operation_panel_posY);
                }
                break;
            case 2:
                game_info_panel.setPosition(this.rootUINode.getChildByName("player_info_panel2").getPositionX()+230,this.rootUINode.getChildByName("player_info_panel2").getPositionY()-15);
                break;
            case 1:
                game_info_panel.setPosition(this.rootUINode.getChildByName("player_info_panel1").getPositionX()-202,this.rootUINode.getChildByName("player_info_panel1").getPositionY()-15);
                break;
            default:
                break;
        }
        //如果处于加倍状态,就特别更新闹钟位置
		let player = h1global.player();
		if (!player) {
			return;
		}
		if(player.curGameRoom.mul_mode && player.curGameRoom.dealerIdx != -1 && player.curGameRoom.mul_score_list.indexOf(0)>=0 && collections.count(player.curGameRoom.mul_score_list,1) !== 2){
            for(var k in player.curGameRoom.mul_score_list){
                this.update_mul_panel(k,player.curGameRoom.mul_score_list[k])
            }
			game_info_panel.setPosition(operation_panel_posX, operation_panel_posY);
		}
    },

    update_operation_panel: function () {
        cc.log("update_operation_panel", this.beginAnimPlaying);
        if (!this.is_show) {
            return;
        }
        this.clearTips();
        let operation_panel = this.rootUINode.getChildByName("operation_panel");
        this.init_op_btn(3);
        if (this.beginAnimPlaying) {
            cc.log("update_operation_panel play anim");
            operation_panel.setVisible(false);
        } else {
            let player = h1global.player();
            if (!player) {
                return;
            }
			operation_panel.setVisible(true);
			if(player.curGameRoom.mul_mode && player.curGameRoom.mul_score_list.indexOf(0)>=0 && collections.count(player.curGameRoom.mul_score_list,1) !== 2){
                if(player.serverSitNum == player.curGameRoom.dealerIdx && !player.curGameRoom.dealer_can_mul()){
					this.init_game_info_panel();
					operation_panel.setVisible(false);
					return;
                }
                if(player.curGameRoom.mul_score_list[player.serverSitNum]>0){
					this.init_game_info_panel();
					operation_panel.setVisible(false);
					return;
                }
				this.init_op_btn(2);
				operation_panel.getChildByName("btn_op_0").loadTextureNormal("DDZGameRoomUI/no_mul_btn.png", ccui.Widget.PLIST_TEXTURE);
				operation_panel.getChildByName("btn_op_1").loadTextureNormal("DDZGameRoomUI/mul_btn.png", ccui.Widget.PLIST_TEXTURE);
				operation_panel.getChildByName("btn_op_0").data = 1;
				operation_panel.getChildByName("btn_op_1").data = 2;
				operation_panel.getChildByName("btn_op_0").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source) {
					let s = source.data;
					let p = h1global.player();
					if (p) {
						if (cc.sys.isObjectValid(operation_panel)) {
							operation_panel.setVisible(false);
						}
						p.doOperation(const_ddz.OP_MUL, [s]);
					}
				}));
				operation_panel.getChildByName("btn_op_1").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source) {
					let s = source.data;
					let p = h1global.player();
					if (p) {
						if (cc.sys.isObjectValid(operation_panel)) {
							operation_panel.setVisible(false);
						}
						p.doOperation(const_ddz.OP_MUL, [s]);
					}
				}));
				this.init_game_info_panel();
				return;
			}else{
			    // cc.error(player.curGameRoom.curPlayerSitNum,player.serverSitNum);
				if (player.curGameRoom.curPlayerSitNum !== player.serverSitNum) {
					operation_panel.setVisible(false);
				}
            }

            let btnDiscard = operation_panel.getChildByName("btn_op_0");
            let btnPass = operation_panel.getChildByName("btn_op_1");
            let btnHelp = operation_panel.getChildByName("btn_op_2");
            //判断是否可以出牌
            if (player.gameOperationAdapter.hasGreaterThan()) {
                btnDiscard.setColor(const_ddz.COLOR_WHITE);
                btnDiscard.setTouchEnabled(true);
                btnHelp.usePass = false;
            } else {
                btnHelp.usePass = true;
                //不能出牌按钮变成2个
                // btnDiscard.setVisible(false);
                // btnPass.setPositionX(operation_panel.width * 0.27);
                // btnHelp.setPositionX(operation_panel.width * 0.73);
                // this.my_clock_pos = 2;
                //不能出牌按钮变成1个
				btnDiscard.setVisible(false);
				btnHelp.setVisible(false);
				btnPass.setPositionX(operation_panel.width * 0.5);
				this.my_clock_pos = 1;
            }
            //在这里判断是否可以点要不起
            if (player.curGameRoom.last_discard_idx == player.serverSitNum || player.curGameRoom.last_discard_idx == -1) {
                // btnPass.setColor(const_ddz.COLOR_GREY);
                // btnPass.setTouchEnabled(false);
                //不能要不起
                this.my_clock_pos = 2;
                btnPass.setVisible(false);
                btnDiscard.setPositionX(operation_panel.width * 0.73);
                btnHelp.setPositionX(operation_panel.width * 0.27);
            }

            this.init_game_info_panel();

        }
    },

    /* 抢庄操作面板 */
    update_dealer_operation_panel: function () {
        cc.log("update_dealer_operation_panel");
        if (!this.is_show) {
            return;
        }
        let player = h1global.player();
        if (!player || !player.curGameRoom) {
            return;
        }

        let operationPanel = this.rootUINode.getChildByName("operation_panel");
        if (player.curGameRoom.curPlayerSitNum !== player.serverSitNum) {
            operationPanel.setVisible(false);
            return false;
        }
        operationPanel.setVisible(true);

        function _hide_btn() {
            for (var i = 0; i < 4; i++) {
                operationPanel.getChildByName("btn_op_" + i).setVisible(false);
            }
        }

        function _clickDealerEvent(source) {
            let d = source.data;
            let p = h1global.player();
            if (p) {
                p.doOperation(const_ddz.OP_FIGHT_DEALER, d);
                if (cc.sys.isObjectValid(operationPanel)) {
                    operationPanel.setVisible(false);
                }
            }
        }

        let gameMode = player.curGameRoom.game_mode;
        if (gameMode === const_ddz.GAME_MODE_SCORE) {
            //_hide_btn();
            this.init_op_btn(4);
            let max = collections.max(player.curGameRoom.bet_score_list);
            for (var i = 0; i < 4; i++) {
                let btn = operationPanel.getChildByName("btn_op_" + i);
                if (i == 0) {
                    btn.loadTextureNormal("DDZGameRoomUI/pass_jiao_btn.png", ccui.Widget.PLIST_TEXTURE);
                } else {
                    btn.loadTextureNormal("DDZGameRoomUI/op_mul_" + i + "_btn.png", ccui.Widget.PLIST_TEXTURE);
                }
                btn.ignoreContentAdaptWithSize(true);
                // Note: test code
                if (i !== 0 && i <= max) {
                    btn.setTouchEnabled(false);
                    btn.setBright(false);
                    // btn.scale = 0.5;
                    // btn.setColor(const_ddz.COLOR_GREY);
                } else {
                    btn.setTouchEnabled(true);
					btn.setBright(true);
					//btn.scale = 1;
                    // btn.setColor(const_ddz.COLOR_WHITE);
                }
                btn.setVisible(true);
                btn.data = i;
                btn.addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source) {
                    let s = source.data;
                    let p = h1global.player();
                    if (p) {
                        p.doOperation(const_ddz.OP_BET, [s]);
                        if (cc.sys.isObjectValid(operationPanel)) {
                            operationPanel.setVisible(false);
                        }
                    }
                }));
            }
            //不叫按钮是否变灰
            this.update_pass_btn_by_rule(operationPanel.getChildByName("btn_op_0"),true);
            this.update_pass_btn_by_rule(operationPanel.getChildByName("btn_op_1"),true);
            this.update_pass_btn_by_rule(operationPanel.getChildByName("btn_op_2"),true);
        } else if (gameMode === const_ddz.GAME_MODE_DEALER) {
            //_hide_btn();
            this.init_op_btn(2);
            let btn_pass = operationPanel.getChildByName("btn_op_0");
            btn_pass.data = [0];
            btn_pass.addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(_clickDealerEvent));
            btn_pass.setVisible(true);
            let btn_confirm = operationPanel.getChildByName("btn_op_1");
            btn_confirm.setVisible(true);
            if (collections.max(player.curGameRoom.fight_dealer_mul_list) > 0) {
                btn_confirm.data = [const_ddz.FIGHT_DEALER_MUL];
                btn_confirm.loadTextureNormal("DDZGameRoomUI/grab_dealer_btn.png", ccui.Widget.PLIST_TEXTURE);
                btn_pass.loadTextureNormal("DDZGameRoomUI/pass_dealer_btn.png", ccui.Widget.PLIST_TEXTURE);
            } else {
                btn_confirm.data = [const_ddz.GET_DEALER_MUL];
                btn_confirm.loadTextureNormal("DDZGameRoomUI/dealer_btn.png", ccui.Widget.PLIST_TEXTURE);
                btn_pass.loadTextureNormal("DDZGameRoomUI/pass_jiao_btn.png", ccui.Widget.PLIST_TEXTURE);
            }
			btn_pass.ignoreContentAdaptWithSize(true);
			btn_confirm.ignoreContentAdaptWithSize(true);
            btn_confirm.addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(_clickDealerEvent));
			//不叫按钮是否变灰
			this.update_pass_btn_by_rule(operationPanel.getChildByName("btn_op_0"),false);
        } else {
            cc.warn("unknown game mode", gameMode);
        }
    },

    reset_init_operation: function () {
        let operation_panel = this.rootUINode.getChildByName("operation_panel");

        var self = this;
        operation_panel.getChildByName("btn_op_0").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function () {
            let selectCards = [];
            for (var i = 0; i < self.allHandCardUI.length; i++) {
                let ui = self.allHandCardUI[i];
                if (ui.selectedFlag) {
                    selectCards.push(ui.card)
                }
            }
            if (selectCards.length === 0) {
                // UICommonWidget.playInfoMsg(self.rootUINode, "res/ui/GameRoomUI/show_information.png", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.55), 1, "res/ui/GameRoomUI/need_discard_bg.png");
				UICommonWidget.playInfoMsg(self.rootUINode, "res/ui/GameRoom2DUI/show_information.png", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.15), 1);
                return;
            }
            let player = h1global.player();
            if (player) {
                if (player.gameOperationAdapter.canDiscard(selectCards)) {
                    player.doOperation(const_ddz.OP_DISCARD, selectCards);
                    if (cc.sys.isObjectValid(operation_panel)) {
                        operation_panel.setVisible(false);
                    }
                } else {
                    // UICommonWidget.playInfoMsg(self.rootUINode, "res/ui/GameRoomUI/show_information.png", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.55), 1, "res/ui/GameRoomUI/need_discard_bg.png");
					UICommonWidget.playInfoMsg(self.rootUINode, "res/ui/GameRoom2DUI/show_information.png", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.15), 1);
                }
            }
        }));

        function doPass() {
            let player = h1global.player();
            if (player) {
                player.doOperation(const_ddz.OP_PASS, []);
                if (cc.sys.isObjectValid(operation_panel)) {
                    operation_panel.setVisible(false);
                    for (var i = 0; i < self.allHandCardUI.length; i++) {
                        self._toggleCard(self.allHandCardUI[i], false);
                    }
                }
            }
        }

        operation_panel.getChildByName("btn_op_1").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(doPass));
        operation_panel.getChildByName("btn_op_2").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source) {
            if (source.usePass) {
                doPass();
            } else {
                self.updateTip();
            }
        }));
    },

    init_op_btn: function (num) {
        let operationPanel = this.rootUINode.getChildByName("operation_panel");
        for (var i = 0; i < 4; i++) {
            operationPanel.getChildByName("btn_op_" + i).setVisible(false);
            //operationPanel.getChildByName("btn_op_" + i).scale = 1;
            operationPanel.getChildByName("btn_op_" + i).setTouchEnabled(true);
			operationPanel.getChildByName("btn_op_" + i).setBright(true);
			operationPanel.getChildByName("btn_op_" + i).setColor(const_ddz.COLOR_WHITE);
        }
        //设置图标的
        switch (num) {
            case 2:
				operationPanel.getChildByName("btn_op_0").setVisible(true);
				operationPanel.getChildByName("btn_op_1").setVisible(true);
                break;
            case 3:
                operationPanel.getChildByName("btn_op_0").setVisible(true);
                operationPanel.getChildByName("btn_op_1").setVisible(true);
                operationPanel.getChildByName("btn_op_2").setVisible(true);

                operationPanel.getChildByName("btn_op_0").loadTextureNormal("DDZGameRoomUI/discard_btn.png", ccui.Widget.PLIST_TEXTURE);
                operationPanel.getChildByName("btn_op_1").loadTextureNormal("DDZGameRoomUI/op_no_btn.png", ccui.Widget.PLIST_TEXTURE);
                operationPanel.getChildByName("btn_op_2").loadTextureNormal("DDZGameRoomUI/help_btn.png", ccui.Widget.PLIST_TEXTURE);

                operationPanel.getChildByName("btn_op_0").ignoreContentAdaptWithSize(true);
                operationPanel.getChildByName("btn_op_1").ignoreContentAdaptWithSize(true);
                operationPanel.getChildByName("btn_op_2").ignoreContentAdaptWithSize(true);
                this.reset_init_operation();
                break;
            case 4:
                break;
            default:
                break;
        }
        //这里是设置位置的
        switch (num) {
            case 2:
                operationPanel.getChildByName("btn_op_0").setPositionX(operationPanel.width * 0.27);
                operationPanel.getChildByName("btn_op_1").setPositionX(operationPanel.width * 0.73);
                this.my_clock_pos = 2;
                break;
            case 3:
                operationPanel.getChildByName("btn_op_1").setPositionX(operationPanel.width * 0.1);
                operationPanel.getChildByName("btn_op_2").setPositionX(operationPanel.width * 0.6);
                operationPanel.getChildByName("btn_op_0").setPositionX(operationPanel.width * 0.95);
                this.my_clock_pos = 3;
                break;
            case 4:
                operationPanel.getChildByName("btn_op_0").setPositionX(operationPanel.width * -0.05);
                operationPanel.getChildByName("btn_op_1").setPositionX(operationPanel.width * 0.4);
                operationPanel.getChildByName("btn_op_2").setPositionX(operationPanel.width * 0.7);
                operationPanel.getChildByName("btn_op_3").setPositionX(operationPanel.width * 1);
                this.my_clock_pos = 4;
                break;
            default:
                break;
        }
        this.init_game_info_panel();
    },

    hide_dealer_operation_panel: function () {
        if (!this.is_show) {
            return;
        }
        //this.rootUINode.getChildByName("dealer_operation_panel").setVisible(false);
    },

    show_operation_panel: function () {
        if (!this.is_show) {
            return;
        }
        let operation_panel = this.rootUINode.getChildByName("operation_panel");
        if (!operation_panel.editorOrigin) {
            operation_panel.editorOrigin = operation_panel.getPosition();
        }
        operation_panel.setVisible(true);
    },

    hide_operation_panel: function () {
        if (!this.is_show) {
            return;
        }
        this.rootUINode.getChildByName("operation_panel").setVisible(false);
    },

    reset: function () {
        this.clearTips();
        if (!this.is_show) {
            return;
        }
        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            this.rootUINode.getChildByName("player_desk_tile_panel" + i).setVisible(false);

            let handPanel = this.rootUINode.getChildByName("player_hand_panel" + i).getChildByName("player_tile_panel");
            if (i === 0) {
                for (var j = 0; j < const_ddz.HAND_CARD_NUM; j++) {
                    let tileImg = handPanel.getChildByName("tile_img_" + j);
                    tileImg.selectedFlag = false;
                    UICommonWidget.resetToOriginPosition(tileImg);
                }
            }

            this.update_bet_score_panel(i, null);
            this.update_dealer_mul_panel(i, null);
        }
        this.hide_all_player_hand_tiles();
        this.hide_operation_panel();
        this.hide_player_desk_panel();
        //闹钟位置
        this.init_game_info_panel();
        //初始化 盖牌场景
        this.init_cover_cards_panel();
        //初始化 他家手牌
        this.init_player_wait_panel();
        //初始化底分和倍数
        this.update_multiple_panel();

        let player = h1global.entityManager.player();
        if (player && player.curGameRoom) {
            this.update_all_player_score(player.curGameRoom.playerInfoList);
            if (h1global.curUIMgr && h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show) {
                h1global.curUIMgr.gameroominfo_ui.update_round();
            }
        }

    },

    redeal: function (curGameRoom) {
        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            let handTilesList = curGameRoom.handTilesList[i];
            this.update_player_hand_tiles(i, handTilesList);
        }
        this.init_operation_panel();
        this.init_dealer_mul_panel();
        this.init_bet_score_panel();
        if (curGameRoom.dealerIdx === -1) {
            this.hide_host_cards_panel();
            this.update_dealer_operation_panel();
        }
    },

	update_round_info_panel: function () {
		if (!this.is_show) {
			return;
		}
		let player = h1global.player();
		if (player && player.curGameRoom && player.curGameRoom.curRound >0) {
			this.rootUINode.getChildByName("round_info_panel").getChildByName("room_id_label").setVisible(true);
			this.rootUINode.getChildByName("round_info_panel").getChildByName("round_label").setVisible(true);
			this.rootUINode.getChildByName("round_info_panel").getChildByName("room_id_label").setString("房号：" + player.curGameRoom.roomID);
			this.rootUINode.getChildByName("round_info_panel").getChildByName("round_label").setString("局数:   " + player.curGameRoom.curRound + "/" + player.curGameRoom.game_round);
		} else{
			this.rootUINode.getChildByName("round_info_panel").getChildByName("room_id_label").setVisible(false);
			this.rootUINode.getChildByName("round_info_panel").getChildByName("round_label").setVisible(false);
        }
	},

    startGame: function () {
        this.clearTips();
        if (!this.is_show) {
            return;
        }
        this.playResultAnim = false;
        let player = h1global.player();

        for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
            if (!player || !player.curGameRoom) {
                // Note: 已经掉线
                this.hide_all_player_hand_tiles();
            } else {
                let curGameRoom = player.curGameRoom;
                let handTilesList = curGameRoom.handTilesList[i];
                this.update_player_hand_tiles(i, handTilesList);
            }

            this.update_player_ready_state(i, 0);
        }

        this.init_operation_panel();
        this.init_dealer_mul_panel();
        this.init_bet_score_panel();

        if (player && player.curGameRoom) {
            this.init_head_mul_panel(player);
			this.update_round_info_panel();
            if (player.curGameRoom.dealerIdx === -1) {
                this.hide_host_cards_panel();
                this.update_dealer_operation_panel();
            } else {
                this.update_host_cards_panel(player.curGameRoom.hostCards);
                this.hide_dealer_operation_panel();
            }
        } else {
            this.hide_dealer_operation_panel();
            this.hide_host_cards_panel();
        }
    },


    playCoinAnim: function (fromIdx, toIdx, duration, myServerSitNum, delayTime) {
        delayTime = delayTime === undefined ? 0 : delayTime;
        let parent = this.rootUINode;

        let startPos = this.containUISnippets["PlayerInfoSnippet" + fromIdx].rootUINode.getPosition();
        let endPos = this.containUISnippets["PlayerInfoSnippet" + toIdx].rootUINode.getPosition();

        // let duration = Math.sqrt((startPos.x - endPos.x) ** 2 + (startPos.y + endPos.y) ** 2) / 600.0;
        this.containUISnippets["PlayerInfoSnippet" + toIdx].setVisible(true);
        let fromIndex = this.server2CurSitNumOffline(fromIdx, myServerSitNum);
        let toIndex = this.server2CurSitNumOffline(toIdx, myServerSitNum);
        if (fromIndex === 0) {
            startPos.x += 60;
            startPos.y += 80;
        } else if (fromIndex === 1) {
            startPos.x -= 50;
        } else if (fromIndex === 2) {
            startPos.x -= 120;
        } else if (fromIndex === 3) {
            startPos.y -= 50;
        } else if (fromIndex === 4) {
            startPos.y -= 140;
        } else if (fromIndex === 5) {
            startPos.y += 70;
            startPos.x += 50;
        }

        if (toIndex === 0) {
            endPos.x += 60;
            endPos.y += 80;
        } else if (toIndex === 1) {
            endPos.x -= 50;
        } else if (toIndex === 2) {
            endPos.x -= 120;
        } else if (toIndex === 3) {
            endPos.y -= 50;
        } else if (toIndex === 4) {
            endPos.y -= 140;
        } else if (toIndex === 5) {
            endPos.y += 70;
            endPos.x += 50;
        }
        for (var i = 0; i < 12; i++) {
            for (var j = 0; j < 2; j++) {

                let sprite = new cc.Sprite("#DDZGameRoomUI/coin.png");
                parent.addChild(sprite);
                sprite.setPosition(startPos);
                sprite.setVisible(false);
                let rate = Math.random();
                let rate2 = Math.random();
                let x = rate * 30 * (rate > 0.5 ? 1 : -1) + endPos.x;
                let y = rate2 * 30 * (rate2 > 0.5 ? 1 : -1) + endPos.y;

                // sprite.runAction(cc.sequence(cc.delayTime(0.5 * Math.random()), cc.moveTo(duration, x, y), cc.removeSelf()))
                sprite.runAction(cc.sequence(cc.delayTime(delayTime + 0.05 * i), cc.show(), cc.sequence(
                    // cc.moveTo(duration - i * 0.02, x, y)
                    cc.bezierTo(duration, [startPos, cc.p((startPos.x + endPos.x) * 0.6, y), cc.p(x, y)])
                ).easing(
                    cc.easeIn(0.5)
                ), cc.removeSelf()));
            }
            // sprite.runAction(cc.bezierTo(1, [startPos, cc.p((startPos.x + endPos.x) * 0.7, (startPos.y + endPos.y) * 0.8), endPos]))
        }
    },

    _get_player_info_anim_position: function (serverSitNum) {
        let node = this.containUISnippets["PlayerInfoSnippet" + serverSitNum].rootUINode;
        let position = node.getPosition();
        let player = h1global.player();
        let idx = serverSitNum;
        if (player) {
            idx = player.server2CurSitNum(serverSitNum);
        }
        if (idx === 0) {
            position.x += 55;
            position.y += 60;
        } else if (idx === 1) {
            position.x -= 50;
            position.y += 10;
        } else if (idx === 2) {
            position.x -= 100;
            position.y += 10;
        } else if (idx === 3) {
            position.x -= 0;
            position.y -= 30;
        } else if (idx === 4) {
            position.x += 10;
            position.y -= 130;
        } else if (idx === 5) {
            position.x += 50;
            position.y += 60;
        }
        return position;
    },

    play_fight_dealer_anim: function (targetServerSitNum) {
        if (!this.is_show) {
            return;
        }
        let targetPosition = this._get_player_info_anim_position(targetServerSitNum);
        let sprite = new cc.Sprite("#DDZGameRoomUI/dealer_gold_crown.png");
        sprite.setPosition(cc.winSize.width * 0.52, cc.winSize.height * 0.615);
        let len = Math.sqrt((cc.winSize.width * 0.5 - targetPosition.x) * (cc.winSize.width * 0.5 - targetPosition.x) + (cc.winSize.height * 0.5 - targetPosition.y) * (cc.winSize.height * 0.5 - targetPosition.y));
        sprite.scale = 1.5;
        sprite.runAction(cc.spawn(
            cc.sequence(cc.delayTime(1), cc.moveTo(len / 600.0, targetPosition), cc.removeSelf()),
            cc.sequence(cc.delayTime(1), cc.scaleTo(len / 600.0, 1))
        ));
        this.rootUINode.addChild(sprite);

    },

    server2CurSitNumOffline: function (serverSitNum, myServerSitNum) {
        return (serverSitNum - myServerSitNum + const_ddz.MAX_PLAYER_NUM) % const_ddz.MAX_PLAYER_NUM;
    },

	update_pass_btn_by_rule:function(pass_btn,keep_old){
		let player = h1global.player();
        if(!player){return;}
		if((player.curGameRoom.dealer_42 && player.curGameRoom.has2pair4(player.serverSitNum)) ||(player.curGameRoom.dealer_joker && player.curGameRoom.hasJokerPair(player.serverSitNum)) ){
			pass_btn.setTouchEnabled(false);
			pass_btn.setBright(false);
		}else{
            if(!keep_old){
				pass_btn.setTouchEnabled(true);
				pass_btn.setBright(true);
            }
		}
    }

});
