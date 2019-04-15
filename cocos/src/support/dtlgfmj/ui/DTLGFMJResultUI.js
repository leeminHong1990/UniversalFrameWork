var DTLGFMJResultUI = ResultUI.extend({
	ctor:function() {
		this._super();
	},
    //
    // update_player_info: function (serverSitNum, finalPlayerInfo, win_idx, curGameRoom) {
     //    win_idx = win_idx >= 0 ? win_idx : -1;
	//     cc.log("finalPlayerInfo:",finalPlayerInfo);
	// 	var cur_player_info_panel = this.player_panels[serverSitNum];
	// 	var playerInfo = curGameRoom.playerInfoList[serverSitNum];
	// 	cur_player_info_panel.getChildByName("name_label").setString(playerInfo["nickname"]);
	// 	// cur_player_info_panel.getChildByName("userid_label").setString("ID:" + playerInfo["userId"].toString());
	// 	var frame_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "frame_img");
	// 	cur_player_info_panel.reorderChild(frame_img, 1);
	// 	var owner_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "owner_img");
	// 	cur_player_info_panel.reorderChild(owner_img, 2);
     //    var id_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "id_label");
     //    id_label.setString("ID:" + playerInfo["userId"].toString());
     //    var kong_num = finalPlayerInfo["concealed_kong"] + finalPlayerInfo["continue_kong"] + finalPlayerInfo["exposed_kong"];
     //    var win_num = finalPlayerInfo["win_times"];
     //    var pong_num = finalPlayerInfo["pong_times"];
     //    var kong_num_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "num_label1");
     //    kong_num_label.setString(kong_num.toString());
     //    var win_num_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "num_label3");
     //    win_num_label.setString(win_num.toString());
     //    var pong_num_label = ccui.helper.seekWidgetByName(cur_player_info_panel, "num_label2");
     //    pong_num_label.setString(pong_num.toString());
	// 	if(serverSitNum == 0){
	// 		owner_img.setVisible(true);
	// 	} else {
	// 		owner_img.setVisible(false);
	// 	}
	// 	cutil.loadPortraitTexture(playerInfo["head_icon"], playerInfo["sex"], function(img){
     //        if(cur_player_info_panel.getChildByName("portrait_sprite")){
     //            cur_player_info_panel.getChildByName("portrait_sprite").removeFromParent();
     //        }
	// 		var portrait_sprite  = new cc.Sprite(img);
	// 		portrait_sprite.setName("portrait_sprite");
	// 		portrait_sprite.setScale(81/portrait_sprite.getContentSize().width);
	// 		portrait_sprite.x = cur_player_info_panel.getContentSize().width * 0.29;
	// 		portrait_sprite.y = cur_player_info_panel.getContentSize().height * 0.675;
	// 		cur_player_info_panel.addChild(portrait_sprite);
	// 	});
	// 	var final_score = finalPlayerInfo["score"];
	// 	this.player_panels[serverSitNum].getChildByName("score_label").setString(final_score.toString());
     //    this.player_panels[serverSitNum].getChildByName("score_label").color = (final_score >= 0 ? cc.color(62, 165, 2) : cc.color(236, 88, 60));
     //    var win_title_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "win_title_img");
	// 	if(win_idx < 0){
     //        win_title_img.setVisible(false);
	// 	}else {
     //        cur_player_info_panel.reorderChild(win_title_img, 3);
     //        win_title_img.setVisible(true);
	// 	}
	// }
	
});
