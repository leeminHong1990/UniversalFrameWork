"use strict"
var TYLSMJSettlementUI = SettlementUI.extend({
	show_rules : function (curGameRoom) {
		var share_list = [];

		if (curGameRoom.same_suit_mode === 1) {
			share_list.push("清一色");
		}
		if (curGameRoom.same_suit_loong === 1) {
			share_list.push("清龙");
		}
		var shareStr = share_list.join(',');

		var rule_label =  this.rootUINode.getChildByName("settlement_panel").getChildByName("rule_label");
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
            cutil_tylsmj.tileSort(tileList, curGameRoom.kingTiles);
            tileList.push(finalTile);
        }else {
            cutil_tylsmj.tileSort(tileList, curGameRoom.kingTiles);
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
                    // var kingtilemark_img = ccui.ImageView.create("res/ui/GameRoomUI/kingtilemark.png");
                    // // this.handTileMarksList[serverSitNum].push(kingtilemark_img);
                    // kingtilemark_img.setAnchorPoint(0.0, 1.0);
                    // kingtilemark_img.setPosition(cc.p(0, 90));
                    // kingtilemark_img.setScale(0.7);
                    // tile_img.addChild(kingtilemark_img);
                    tile_img.color = const_tylsmj.mark_none_color;
                    tile_img.color =const_tylsmj.mark_king_color;
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
				} else {
					tile_img.loadTexture("Mahjong/" + mahjong_down_str, ccui.Widget.PLIST_TEXTURE);
					mahjong_img.setVisible(false);
				}
				tile_img.setVisible(true);
                if(curGameRoom.kingTiles.indexOf(upTilesList[i][j]) >= 0){
                    tile_img.color = const_tylsmj.mark_none_color;
                    tile_img.color =const_tylsmj.mark_king_color;
                }
                /*if(curGameRoom.kingTiles.indexOf(upTilesList[i][j]) >= 0){
                    var kingtilemark_img = ccui.ImageView.create("res/ui/GameRoomUI/kingtilemark.png");
                    // this.handTileMarksList[serverSitNum].push(kingtilemark_img);
                    kingtilemark_img.setAnchorPoint(0.0, 1.0);
                    kingtilemark_img.setPosition(cc.p(0, 59));
                    kingtilemark_img.setScale(0.40);
                    tile_img.addChild(kingtilemark_img);
                }*/
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
			if (!cc.sys.isObjectValid(cur_player_info_panel)) {
				return;
			}
			if (cur_player_info_panel.getChildByName("item_avatar_img")) {
				cur_player_info_panel.getChildByName("item_avatar_img").removeFromParent();
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

	update_player_win:function(panel_idx, serverSitNum, win_idx, from_idx, dealer_idx, result, job_relation){
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

        if(serverSitNum === win_idx) {
             //if (result[0]) {
	           // item_win_type_label.string += "\t\t\t平胡";
            // } else if (palyer.curGameRoom.game_mode === const_val.SPECIAL_GAME_MODE) {
            //     if (result[3]) {
	         //        item_win_type_label.string += "\t\t\t" + "豪华七小对";
            //     } else if (result[2]) {
	         //        item_win_type_label.string += "\t\t\t" + "七小对";
            //     } else if (result[1]) {
	         //        item_win_type_label.string += "\t\t\t" + "清一色";
            //     } else if (result[4]) {
	         //        item_win_type_label.string += "\t\t\t" + "一条龙";
            //     } else if (result[5]) {
	         //        item_win_type_label.string += "\t\t\t" + "十三幺";
            //     }
            // } else if (result[5]) {
	         //    item_win_type_label.string += "\t\t\t" + "十三幺";
            // } else if (result[2]) {
	         //    item_win_type_label.string += "\t\t\t" + "七小对";
            // }
			for(var i =0;i<result.length;i++){
				if ((i === 10 || i === 11) && result[12]) {
					continue;
				}
				if(result[i]){
					switch (i){
						case 0:
                            item_win_type_label.string += "\t\t\t自摸";
							break;
                        // case 1:
                        //     item_win_type_label.string += "\t\t\t点炮";
                        //     break;
                        case 2:
                            item_win_type_label.string += "\t\t\t抢杠";
                            break;
                        case 3:
                            item_win_type_label.string += "\t\t\t明杠";
                            break;
                        case 4:
                            item_win_type_label.string += "\t\t\t暗杠";
                            break;
                        case 5:
                            item_win_type_label.string += "\t\t\t庄家";
                            break;
                        case 6:
                            item_win_type_label.string += "\t\t\t边张";
                            break;
                        case 7:
                            item_win_type_label.string += "\t\t\t砍张";
                            break;
                        case 8:
                            item_win_type_label.string += "\t\t\t吊将";
                            break;
                        case 9:
                            item_win_type_label.string += "\t\t\t缺门";
                            break;
                        case 10:
                            item_win_type_label.string += "\t\t\t清一色";
                            break;
                        case 11:
                            item_win_type_label.string += "\t\t\t一条龙";
                            break;
                        case 12:
                            item_win_type_label.string += "\t\t\t清龙";
                            break;
						default:
							break;
					}
				}
			}
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