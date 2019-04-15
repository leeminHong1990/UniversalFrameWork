"use strict"
var TYKDDMJSettlementUI = SettlementUI.extend({

    show_by_info: function (roundRoomInfo, serverSitNum, curGameRoom, confirm_btn_func, replay_btn_func) {
        cc.log("结算==========>:");
        cc.log("roundRoomInfo :  ",roundRoomInfo);
        var self = this;
        this.show(function(){
			var player_num = curGameRoom.player_num;
            self.player_tiles_panels = [];
            self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel1"));
            self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel2"));
            self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel3"));
            self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel4"));
            var playerInfoList = roundRoomInfo["player_info_list"];
            // 需求 将玩家自己放在第一位
            var left = [];
            var right = [];
            for(let i=0; i<playerInfoList.length; i++){
                if (playerInfoList[i]["idx"] < serverSitNum){
                    left.push(playerInfoList[i])
                }else{
                    right.push(playerInfoList[i])
                }
            }
            playerInfoList = right.concat(left);
            curGameRoom.upTilesList = roundRoomInfo["up_tiles_list"];
            for(var i = 0; i < 4; i++){
                var roundPlayerInfo = playerInfoList[i];
                if (!roundPlayerInfo) {
                    self.player_tiles_panels[i].setVisible(false);
                    continue
                }
				var server_seat_num = roundPlayerInfo["idx"];
                self.player_tiles_panels[i].setVisible(true)
                self.update_score(i, roundPlayerInfo["score"]);  //显示分数
                self.update_player_hand_tiles(i, server_seat_num, curGameRoom, roundPlayerInfo["tiles"], roundRoomInfo["win_idx"], roundRoomInfo["finalTile"], roundPlayerInfo["concealed_kong"]);   //显示麻将
                self.update_player_up_tiles(i, server_seat_num, curGameRoom, roundPlayerInfo["concealed_kong"]);
                self.update_player_info(i, server_seat_num, curGameRoom);  //idx 表示玩家的座位号
                self.update_player_win(i, server_seat_num, roundRoomInfo["win_idx"], roundRoomInfo["from_idx"], roundRoomInfo["dealer_idx"], roundRoomInfo["result_list"], curGameRoom.game_mode, roundPlayerInfo["concealed_kong"], curGameRoom, roundRoomInfo["lastWinScore"]);
            }

            // self.update_win_type(roundRoomInfo, roundRoomInfo["result_list"]);
            self.show_title(roundRoomInfo["win_idx"], serverSitNum);
	        self.show_rules(curGameRoom);
            var confirm_btn = self.rootUINode.getChildByName("confirm_btn");
            var result_btn = self.rootUINode.getChildByName("result_btn");
            if(confirm_btn_func){
                self.rootUINode.getChildByName("result_btn").addTouchEventListener(function(sender, eventType){
                    if(eventType ==ccui.Widget.TOUCH_ENDED){
                        self.hide();
                        confirm_btn_func();
                    }
                });
                confirm_btn.setVisible(false);
                result_btn.setVisible(true);
            } else if (replay_btn_func) {
                self.setPlaybackLayout(replay_btn_func)
            } else {
                confirm_btn.setVisible(true);
                result_btn.setVisible(false);
            }
        });
    },

	show_rules : function (curGameRoom) {
		var roominfo_list = [["普通玩法","特殊牌型玩法","耗子玩法"],["风耗子", "单耗子"],["非赏金","赏金"],["","七小对"],["","耗子吊将"],["","耗子吊将1、2能胡"],["","可以单听耗子"],["","特殊牌型翻倍"]];
		var share_list = [];
		share_list.push(roominfo_list[0][curGameRoom.game_mode]);
		share_list.push(curGameRoom.game_round + '局');
		if (curGameRoom.game_mode === 2) {
			share_list.push(roominfo_list[1][curGameRoom.king_mode]);
			share_list.push(roominfo_list[2][curGameRoom.reward]);
			share_list.push(roominfo_list[3][curGameRoom.seven_pair]);
			share_list.push(roominfo_list[4][curGameRoom.mouse_general]);
			share_list.push(roominfo_list[5][curGameRoom.mouse_general_onetwo]);
			share_list.push(roominfo_list[6][curGameRoom.ting_mouse]);
		} else if(curGameRoom.game_mode === 1) {
			share_list.push(roominfo_list[7][curGameRoom.special_mul]);
		}

		if (curGameRoom.ekong_is_dwin === 1) {
			share_list.push("明杠杠开算自摸");
		}
		if (curGameRoom.bao_kong === 1) {
			share_list.push("点杠不包杠");
		}
		if (curGameRoom.repeat_kong === 1) {
			share_list.push("回手杠");
		}

		if (curGameRoom.add_dealer === 1) {
			share_list.push("加庄");
		}
		var shareStr = share_list.join(',');

		var rule_label =  this.rootUINode.getChildByName("settlement_panel").getChildByName("rule_label");
		rule_label.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
		rule_label.setString(shareStr);
	},

    update_player_hand_tiles:function(panel_idx, serverSitNum, curGameRoom ,tileList, win_idx, finalTile, concealedKongList){
        if(!this.is_show) {return;}
        var cur_player_tile_panel = this.player_tiles_panels[panel_idx].getChildByName("item_hand_panel");
        if(!cur_player_tile_panel){
            return;
        }
        // tileList = tileList.concat([])
        if(win_idx == serverSitNum) {
            tileList.pop();
            cutil_tykddmj.tileSort(tileList, curGameRoom.kingTiles);
            tileList.push(finalTile);
        }else {
            cutil_tykddmj.tileSort(tileList, curGameRoom.kingTiles);
        }
        var concealedKongSum = 0;
        for(var i = 0 ; i < curGameRoom.upTilesList[serverSitNum].length ; i++){
            if(curGameRoom.upTilesList[serverSitNum][i].length > 3){
                concealedKongSum ++;
            }
        }
        var mahjong_hand_str = "mahjong_tile_player_hand.png";
        cur_player_tile_panel.setPositionX((curGameRoom.upTilesList[serverSitNum].length * 135) + concealedKongSum * 42 + 236);
        // mahjong_hand_str = "mahjong_tile_player_hand.png";
        for(var i = 0; i < 14; i++){
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + i.toString());
            tile_img.stopAllActions();
            if(tileList[i]){
                var mahjong_img = tile_img.getChildByName("mahjong_img");
                tile_img.loadTexture("Mahjong/" + mahjong_hand_str, ccui.Widget.PLIST_TEXTURE);
                tile_img.setVisible(true);
                mahjong_img.ignoreContentAdaptWithSize(true);
                mahjong_img.loadTexture("Mahjong/mahjong_big_" + tileList[i].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
                mahjong_img.setVisible(true);
                if(win_idx == serverSitNum && i == tileList.length - 1){
                    tile_img.setPositionX(tile_img.getPositionX() + 4);
                }
                if(curGameRoom.kingTiles.indexOf(tileList[i]) >= 0){
	                var kingtilemark_img = ccui.ImageView.create("res/ui/GameRoomUI/kingtilemark.png");
	                // this.handTileMarksList[serverSitNum].push(kingtilemark_img);
	                kingtilemark_img.setAnchorPoint(0.0, 1.0);
	                kingtilemark_img.setPosition(cc.p(19, 105));
	                kingtilemark_img.setScale(1);
	                tile_img.addChild(kingtilemark_img);
                    tile_img.color = const_tykddmj.mark_none_color;
                    tile_img.color =const_tykddmj.mark_king_color;
                }
            } else {
                tile_img.setVisible(false);
            }
        }
    },

    update_player_up_tiles: function (panel_idx, serverSitNum, curGameRoom, concealedKongList) {
        if(!this.is_show) {return;}
        var cur_player_tile_panel = this.player_tiles_panels[panel_idx].getChildByName("item_up_panel");
        if(!cur_player_tile_panel){
            return;
        }
        var mahjong_hand_str = "mahjong_tile_player_hand.png";
        var mahjong_down_str = "mahjong_tile_top_hand.png";
        var upTilesList = curGameRoom.upTilesList[serverSitNum];
        var idx = 0;
        // for(var i = player.curGameRoom.upTilesList[serverSitNum].length * 3; i < 12; i++){
        // 	var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + i.toString());
        // 	tile_img.setVisible(false);
        // }
        for(var i = 0; i < this.kongTilesList[serverSitNum].length; i++){
            this.kongTilesList[serverSitNum][i].removeFromParent();
        }
        this.kongTilesList[serverSitNum] = [];
        // mahjong_hand_str = "mahjong_tile_player_hand.png";
        // mahjong_down_str = "mahjong_tile_player_down.png";
        for(var i = 0; i < 16; i++){
            var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + i.toString());
            tile_img.setVisible(false);
        }
        for(var i = 0; i < upTilesList.length; i++){
            idx += i == 0 ? i : upTilesList[i - 1].length;
            for(var j = 0; j < upTilesList[i].length; j++){
                var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + (idx + j).toString());
                tile_img.setPositionX(tile_img.getPositionX() + i * 4);
                // tile_img.setPositionY(0);
                tile_img.setTouchEnabled(false);
                var mahjong_img = tile_img.getChildByName("mahjong_img");
                if(upTilesList[i][j] && (concealedKongList.indexOf(upTilesList[i][j]) < 0 || j === upTilesList[i].length - 1)){
                    tile_img.loadTexture("Mahjong/" + mahjong_hand_str, ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.ignoreContentAdaptWithSize(true);
                    mahjong_img.loadTexture("Mahjong/mahjong_big_" + upTilesList[i][j].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.setVisible(true);
	                if(curGameRoom.kingTiles.indexOf(upTilesList[i][j]) >= 0){
		                tile_img.color = const_tykddmj.mark_none_color;
		                tile_img.color =const_tykddmj.mark_king_color;
	                }
	                if(curGameRoom.kingTiles.indexOf(upTilesList[i][j]) >= 0){
		                var kingtilemark_img = ccui.ImageView.create("res/ui/GameRoomUI/kingtilemark.png");
		                // this.handTileMarksList[serverSitNum].push(kingtilemark_img);
		                kingtilemark_img.setAnchorPoint(0.0, 1.0);
		                kingtilemark_img.setPosition(cc.p(19, 105));
		                kingtilemark_img.setScale(1);
		                tile_img.addChild(kingtilemark_img);
	                }
                } else {
                    tile_img.loadTexture("Mahjong/" + mahjong_down_str, ccui.Widget.PLIST_TEXTURE);
                    mahjong_img.setVisible(false);
                }
                tile_img.setVisible(true);
            }
        }
    },

    update_player_info: function (panel_idx, serverSitNum, curGameRoom) {
        if(!this.is_show) {return;}
        var cur_player_info_panel = this.player_tiles_panels[panel_idx];
        if(!cur_player_info_panel){
            return;
        }
        var playerInfo = curGameRoom.playerInfoList[serverSitNum];
        cur_player_info_panel.getChildByName("owner_img").setVisible(playerInfo["is_creator"])
        cur_player_info_panel.getChildByName("item_name_label").setString(playerInfo["nickname"]);
        cur_player_info_panel.getChildByName("item_id_label").setString("ID:" + playerInfo["userId"].toString());
        cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function(img){
            if (cur_player_info_panel) {
	            if (cur_player_info_panel.getChildByName("item_avatar_img")) {
		            cur_player_info_panel.getChildByName("item_avatar_img").removeFromParent();
	            }
            }
            var portrait_sprite  = new cc.Sprite(img);
            portrait_sprite.setName("portrait_sprite");
            portrait_sprite.setScale(78 / portrait_sprite.getContentSize().width);
            portrait_sprite.x = 70;
            portrait_sprite.y = 45;
            cur_player_info_panel.addChild(portrait_sprite);
            portrait_sprite.setLocalZOrder(-1);
        });
    },

    update_player_win:function(panel_idx, serverSitNum, win_idx, from_idx, dealer_idx, result, game_mode, concealedKongList, curGameRoom, lastWinScore){
        var cur_player_info_panel = this.player_tiles_panels[panel_idx];
        var item_win_img = cur_player_info_panel.getChildByName("item_win_img");
        if(win_idx < 0 || win_idx > 3){
            item_win_img.setVisible(false);
            return;
        }

        var item_win_type_label = cur_player_info_panel.getChildByName("item_win_type_label");
        item_win_type_label.string = "";
        item_win_type_label.setVisible(true);

        var palyer = h1global.entityManager.player();

	    //胡牌类型分
        if(serverSitNum === win_idx) {
            if (game_mode === const_tykddmj.SPECIAL_GAME_MODE) {
            	if (curGameRoom.special_mul === 1) {
		            if (result[3]) {
			            item_win_type_label.string += "\t\t\t豪华七小对x4";
		            } else if (result[2]) {
			            item_win_type_label.string += "\t\t\t七小对x2";
		            } else if (result[1]) {
			            item_win_type_label.string += "\t\t\t清一色x2";
		            } else if (result[4]) {
			            item_win_type_label.string += "\t\t\t一条龙x2";
		            } else if (result[5]) {
			            item_win_type_label.string += "\t\t\t十三幺x2";
		            } else {
			            item_win_type_label.string += "\t\t\t平胡";
		            }
	            } else {
		            if (result[3]) {
			            item_win_type_label.string += "\t\t\t豪华七小对+20";
		            } else if (result[2]) {
			            item_win_type_label.string += "\t\t\t七小对+10";
		            } else if (result[1]) {
			            item_win_type_label.string += "\t\t\t清一色+10";
		            } else if (result[4]) {
			            item_win_type_label.string += "\t\t\t一条龙+10";
		            } else if (result[5]) {
			            item_win_type_label.string += "\t\t\t十三幺+10";
		            } else {
			            item_win_type_label.string += "\t\t\t平胡";
		            }
	            }
            } else {
	            if (result[2]) {
		            item_win_type_label.string += "\t\t\t七小对";
	            } else {
		            item_win_type_label.string += "\t\t\t平胡";
	            }
            }
        }

	    //点数分
	    if(serverSitNum === win_idx) {
		    if (lastWinScore === 20) {
			    item_win_type_label.string += "\t\t\t耗子吊将+" + lastWinScore.toString();
		    } else {
			    item_win_type_label.string += "\t\t\t点数+" + lastWinScore.toString();
		    }
	    }

	    //带庄
	    if (curGameRoom.add_dealer === 1) {
		    if (dealer_idx == serverSitNum && win_idx == serverSitNum) {
			    //庄家赢
			    item_win_type_label.string += "\t\t\t加庄+5";
		    } else if (win_idx == serverSitNum && dealer_idx != serverSitNum) {
			    //闲家赢
			    item_win_type_label.string += "\t\t\t加庄+5";
		    }
	    }

	    if (win_idx === from_idx && serverSitNum === win_idx) {
		    item_win_type_label.string += "\t\t\t自摸x2";
	    }

	    //杠分
	    var exposedKongList = [];
	    var upTilesList = curGameRoom.upTilesList[serverSitNum];
	    for (var i = 0; i < upTilesList.length; i++) {
		    if (upTilesList[i].length > 3 && concealedKongList.indexOf(upTilesList[i][0]) < 0) {
			    exposedKongList.push(upTilesList[i][0]);
		    }
	    }
	    var exposedKongScore = 0;
	    var concealedKongScore = 0;
	    for (var i = 0; i < exposedKongList.length; i++) {
		    //明杠
		    var kongScore = 0;
		    if (exposedKongList[i] > const_val.BOUNDARY) {
			    kongScore = 10;
		    } else {
			    kongScore = exposedKongList[i] % 10;
		    }
		    if (curGameRoom.kingTiles.indexOf(exposedKongList[i]) >= 0 && game_mode == const_tykddmj.KING_GAME_MODE) {
			    kongScore = 20;
		    }
		    exposedKongScore += kongScore;
	    }
	    for (var i = 0; i < concealedKongList.length; i++) {
		    //暗杠
		    var kongScore = 0;
		    if (concealedKongList[i] > const_val.BOUNDARY) {
			    kongScore = 10;
		    } else {
			    kongScore = concealedKongList[i] % 10;
		    }
		    if (curGameRoom.kingTiles.indexOf(concealedKongList[i]) >= 0 && game_mode == const_tykddmj.KING_GAME_MODE) {
			    kongScore = 20;
		    }
		    concealedKongScore += kongScore;
	    }
	    if (exposedKongScore > 0) {
		    item_win_type_label.string += "\t\t\t明杠+" + exposedKongScore.toString();
	    }
	    if (concealedKongScore > 0) {
		    item_win_type_label.string += "\t\t\t暗杠+" + (concealedKongScore * 2).toString();
	    }

        var item_dealer_img = cur_player_info_panel.getChildByName("item_dealer_img");
        item_dealer_img.setVisible(dealer_idx == serverSitNum);
        item_dealer_img.loadTexture("res/ui/Default/common_dealer_img.png");
        if (win_idx == from_idx && win_idx == serverSitNum) { // 自摸
            item_win_img.loadTexture("res/ui/SettlementUI/draw_win.png");
            item_win_img.runAction(cc.RepeatForever.create(cc.Sequence.create(
                cc.Repeat.create(cc.Sequence.create(cc.RotateTo.create(0.08,16,0),cc.RotateTo.create(0.08,0,0)), 4),
                cc.DelayTime.create(2)
            )));
            item_win_img.setVisible(true);
        }else if (win_idx == serverSitNum) { // 胡牌玩家
            item_win_img.loadTexture("res/ui/SettlementUI/give_win.png");
            item_win_img.runAction(cc.RepeatForever.create(cc.Sequence.create(
                cc.Repeat.create(cc.Sequence.create(cc.RotateTo.create(0.08,16,0),cc.RotateTo.create(0.08,0,0)), 4),
                cc.DelayTime.create(2)
            )));

            item_win_img.setVisible(true);
        }else if (from_idx == serverSitNum) { // 放炮玩家
            item_win_img.loadTexture("res/ui/SettlementUI/give_lose.png");
            item_win_img.setVisible(true);
        }else {
            item_win_img.setVisible(false);
        }
    },
});