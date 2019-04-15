"use strict"
var GSJMJSettlementUI = SettlementUI.extend({

	show_by_info: function (roundRoomInfo, serverSitNum, curGameRoom, confirm_btn_func, replay_btn_func) {
		cc.log("结算==========>:");
		cc.log("roundRoomInfo :  ", roundRoomInfo);
		var self = this;
		this.show(function () {
			self.player_tiles_panels = [];
			self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel1"));
			self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel2"));
			self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel3"));
			self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel4"));
			var playerInfoList = roundRoomInfo["player_info_list"];
			for (var i = 0; i < 4; i++) {
				var roundPlayerInfo = playerInfoList[i];
				if (!roundPlayerInfo) {
					self.player_tiles_panels[i].setVisible(false)
					continue
				}
				self.player_tiles_panels[i].setVisible(true)
				self.update_score(roundPlayerInfo["idx"], roundPlayerInfo["score"]);  //显示分数
				self.update_player_hand_tiles(i, curGameRoom, roundRoomInfo["player_info_list"][i]["tiles"], roundRoomInfo["win_idx"], roundRoomInfo["finalTile"], roundRoomInfo["player_info_list"][i]["concealed_kong"]);   //显示麻将
				self.update_player_up_tiles(i, curGameRoom);
				self.update_player_info(roundPlayerInfo["idx"], curGameRoom);  //idx 表示玩家的座位号
				self.update_player_win(i, roundRoomInfo["win_idx"], roundRoomInfo["from_idx"], roundRoomInfo["dealer_idx"], roundRoomInfo["result_list"]);
				self.update_lucky_tiles(i, roundRoomInfo["lucky_tiles"]);
			}

			// self.update_win_type(roundRoomInfo, roundRoomInfo["result_list"]);
			self.show_title(roundRoomInfo["win_idx"], serverSitNum);
			self.show_rules(curGameRoom);

			if (confirm_btn_func) {
				self.rootUINode.getChildByName("result_btn").addTouchEventListener(function (sender, eventType) {
					if (eventType == ccui.Widget.TOUCH_ENDED) {
						self.hide();
						confirm_btn_func();
					}
				});
			}

			if (replay_btn_func) self.setPlaybackLayout(replay_btn_func)
		});
	},

	show_rules : function (curGameRoom) {
		var share_list = [];
		if(curGameRoom.king_num === 1){
			share_list.push("带混");
		}
		if(curGameRoom.win_mode === 1){
			share_list.push("硬八张");
		}
		if((curGameRoom.suit_mode & const_gsjmj.SUIT_7PAI) === const_gsjmj.SUIT_7PAI){
			share_list.push("七对");
		}
		if(curGameRoom.job_mode === 1){
			share_list.push("包胡");
		}
		if (curGameRoom.add_dealer === 1){
			share_list.push("连庄");
		}
		if (curGameRoom.base_score === 1) {
			share_list.push("带庄");
		}

		var shareStr = share_list.join(',');

		var rule_label =  this.rootUINode.getChildByName("settlement_panel").getChildByName("rule_label");
		rule_label.setString(shareStr);
	},

	update_player_hand_tiles: function (serverSitNum, curGameRoom, tileList, win_idx, finalTile, concealedKongList) {
		if (!this.is_show) {
			return;
		}
		var cur_player_tile_panel = this.player_tiles_panels[serverSitNum].getChildByName("item_hand_panel");
		if (!cur_player_tile_panel) {
			return;
		}
		// tileList = tileList.concat([])
		if (win_idx == serverSitNum) {
			tileList.pop();
			tileList = tileList.sort(cutil_gsjmj.tileSortFunc);
			tileList.push(finalTile);
		} else {
			tileList = tileList.sort(cutil_gsjmj.tileSortFunc);
		}
		var concealedKongSum = 0;
		for (var i = 0; i < curGameRoom.upTilesList[serverSitNum].length; i++) {
			if (curGameRoom.upTilesList[serverSitNum][i].length > 3) {
				concealedKongSum++;
			}
		}
		var mahjong_hand_str = "mahjong_tile_player_hand.png";
		cur_player_tile_panel.setPositionX((curGameRoom.upTilesList[serverSitNum].length * 135) + concealedKongSum * 42 + 236);
		// mahjong_hand_str = "mahjong_tile_player_hand.png";
		for (var i = 0; i < 14; i++) {
			var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + i.toString());
			tile_img.stopAllActions();
			if (tileList[i]) {
				var mahjong_img = tile_img.getChildByName("mahjong_img");
				tile_img.loadTexture("Mahjong/" + mahjong_hand_str, ccui.Widget.PLIST_TEXTURE);
				tile_img.setVisible(true);
				mahjong_img.ignoreContentAdaptWithSize(true);
				mahjong_img.loadTexture("Mahjong/mahjong_big_" + tileList[i].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
				mahjong_img.setVisible(true);
				if (win_idx == serverSitNum && i == tileList.length - 1) {
					tile_img.setPositionX(tile_img.getPositionX() + 4);
				}
				if (curGameRoom.kingTiles.indexOf(tileList[i]) >= 0) {
					var kingtilemark_img = ccui.ImageView.create("res/ui/GameRoomUI/kingtilemark.png");
					// this.handTileMarksList[serverSitNum].push(kingtilemark_img);
					kingtilemark_img.setAnchorPoint(0.0, 1.0);
					kingtilemark_img.setPosition(cc.p(19, 105));
					kingtilemark_img.setScale(1);
					tile_img.addChild(kingtilemark_img);
					tile_img.color = const_gsjmj.mark_none_color;
					tile_img.color = const_gsjmj.mark_king_color;
				}
			} else {
				tile_img.setVisible(false);
			}
		}
	},

	update_player_up_tiles: function (serverSitNum, curGameRoom) {
		if (!this.is_show) {
			return;
		}
		var cur_player_tile_panel = this.player_tiles_panels[serverSitNum].getChildByName("item_up_panel");
		if (!cur_player_tile_panel) {
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
		for (var i = 0; i < this.kongTilesList[serverSitNum].length; i++) {
			this.kongTilesList[serverSitNum][i].removeFromParent();
		}
		this.kongTilesList[serverSitNum] = [];
		// mahjong_hand_str = "mahjong_tile_player_hand.png";
		// mahjong_down_str = "mahjong_tile_player_down.png";
		for (var i = 0; i < 16; i++) {
			var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + i.toString());
			tile_img.setVisible(false);
		}
		for (var i = 0; i < upTilesList.length; i++) {
			idx += i == 0 ? i : upTilesList[i - 1].length;
			for (var j = 0; j < upTilesList[i].length; j++) {
				var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + (idx + j).toString());
				tile_img.setPositionX(tile_img.getPositionX() + i * 4);
				// tile_img.setPositionY(0);
				tile_img.setTouchEnabled(false);
				var mahjong_img = tile_img.getChildByName("mahjong_img");
				if (upTilesList[i][j]) {
					tile_img.loadTexture("Mahjong/" + mahjong_hand_str, ccui.Widget.PLIST_TEXTURE);
					mahjong_img.ignoreContentAdaptWithSize(true);
					mahjong_img.loadTexture("Mahjong/mahjong_big_" + upTilesList[i][j].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
					mahjong_img.setVisible(true);
					if (curGameRoom.kingTiles.indexOf(upTilesList[i][j]) >= 0) {
						tile_img.color = const_gsjmj.mark_none_color;
						tile_img.color = const_gsjmj.mark_king_color;
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

	update_player_info: function (serverSitNum, curGameRoom) {
		if (!this.is_show) {
			return;
		}
		cc.log("update_player_info", serverSitNum);
		var cur_player_info_panel = this.player_tiles_panels[serverSitNum];
		if (!cur_player_info_panel) {
			return;
		}
		var playerInfo = curGameRoom.playerInfoList[serverSitNum];
		cc.log("update_player_info", playerInfo);
		cur_player_info_panel.getChildByName("item_name_label").setString(playerInfo["nickname"]);
		cur_player_info_panel.getChildByName("item_id_label").setString("ID:" + playerInfo["userId"].toString());
		cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function (img) {
			if (cur_player_info_panel.getChildByName("item_avatar_img")) {
				cur_player_info_panel.getChildByName("item_avatar_img").removeFromParent();
			}
			var portrait_sprite = new cc.Sprite(img);
			portrait_sprite.setName("portrait_sprite");
			portrait_sprite.setScale(78 / portrait_sprite.getContentSize().width);
			portrait_sprite.x = 70;
			portrait_sprite.y = 45;
			cur_player_info_panel.addChild(portrait_sprite);
			portrait_sprite.setLocalZOrder(-1);
		});
	},

	update_player_win: function (serverSitNum, win_idx, from_idx, dealer_idx, result) {
		var cur_player_info_panel = this.player_tiles_panels[serverSitNum];
		var item_win_img = cur_player_info_panel.getChildByName("item_win_img");
		if (win_idx < 0 || win_idx > 3) {
			item_win_img.setVisible(false);
			return;
		}
		var item_win_type_label = cur_player_info_panel.getChildByName("item_win_type_label");
		item_win_type_label.string = "";
		item_win_type_label.setVisible(true);
		var upTilesList = h1global.player().curGameRoom.upTilesList[serverSitNum];
		for (var i = 0; i < upTilesList.length; i++) {
			if (upTilesList[i].length > 3) {
				item_win_type_label.string += "杠   ";
				break;
			}
		}
		if (serverSitNum == win_idx) {
			for (var i = 0; i < result.length; i++) {
				if (result[i]) {
					item_win_type_label.string += const_gsjmj.WIN_TYPE_LIST[i] + "   ";
				}
			}
		}

		var item_dealer_img = cur_player_info_panel.getChildByName("item_dealer_img");
		item_dealer_img.setVisible(dealer_idx == serverSitNum);
		if (win_idx == from_idx && win_idx == serverSitNum) { // 自摸
			item_win_img.loadTexture("res/ui/SettlementUI/draw_win.png");
			item_win_img.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.Repeat.create(cc.Sequence.create(cc.RotateTo.create(0.08, 16, 0), cc.RotateTo.create(0.08, 0, 0)), 4),
				cc.DelayTime.create(2)
			)));
			item_win_img.setVisible(true);
		} else if (win_idx == serverSitNum) { // 胡牌玩家
			item_win_img.loadTexture("res/ui/SettlementUI/give_win.png");
			item_win_img.runAction(cc.RepeatForever.create(cc.Sequence.create(
				cc.Repeat.create(cc.Sequence.create(cc.RotateTo.create(0.08, 16, 0), cc.RotateTo.create(0.08, 0, 0)), 4),
				cc.DelayTime.create(2)
			)));

			item_win_img.setVisible(true);
		} else if (from_idx == serverSitNum) { // 放炮玩家
			item_win_img.loadTexture("res/ui/SettlementUI/give_lose.png");
			item_win_img.setVisible(true);
		} else {
			item_win_img.setVisible(false);
		}
	},

	update_score: function (serverSitNum, score) {
		var score_label = this.player_tiles_panels[serverSitNum].getChildByName("item_score_label");
		if (score >= 0) {
			score_label.setTextColor(cc.color(235, 235, 13));
			score_label.setString("+" + score.toString());
		} else {
			score_label.setTextColor(cc.color(225, 225, 214));
			score_label.setString(score.toString());
		}
	},

	update_lucky_tiles: function (serverSitNum, lucky_tiles) {
		var item_mobao_panel = this.player_tiles_panels[serverSitNum].getChildByName("item_mobao_panel");
		if (lucky_tiles <= 0) {
			item_mobao_panel.setVisible(false);
			return;
		}
		for (var i = 0; i < 2; i++) {
			var mahjong_bg_img = item_mobao_panel.getChildByName("mahjong_bg_img" + i.toString());
			var mahjong_img = mahjong_bg_img.getChildByName("mahjong_img");
			if (lucky_tiles[i]) {
                mahjong_bg_img.setVisible(true);
				mahjong_img.ignoreContentAdaptWithSize(true);
				mahjong_img.loadTexture("Mahjong/mahjong_big_" + lucky_tiles[i].toString() + ".png", ccui.Widget.PLIST_TEXTURE)
			} else {
				mahjong_bg_img.setVisible(false);
			}
		}
	},
});