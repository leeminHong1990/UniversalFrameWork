var gameroomUIMgr = function () {
}

/**
 * function init_mgrui_panel 管理界面, 负责统一给 gameroomprepare_ui 和 gameroom_ui 加东西
 * @param rootUINode 需要管理的UI界面的根节点
 * @return null;
 */
gameroomUIMgr.init_mgrui_panel = function (rootUINode) {
	//暂时没有什么好的想法 先放着
};

/**
 * function init_quite_panel
 * @param rootUINode 需要管理的UI界面的根节点
 * @return null;
 */
gameroomUIMgr.init_quite_panel = function (rootUINode) {
	var quite_panel = rootUINode.getChildByName("gameprepare_panel").getChildByName("quite_panel");
	if (!quite_panel) {
		return;
	}
	quite_panel.setVisible(true);

	function quite_btn_event(sender, eventType) {
		if (eventType === ccui.Widget.TOUCH_ENDED) {
			if (h1global.curUIMgr.confirm_ui) {
				h1global.curUIMgr.confirm_ui.show_by_info("是否确定离开房间?", function () {
					if (h1global.player()) {
						h1global.player().quitRoom();
					}
				});
			}
		}
	}

	function close_btn_event(sender, eventType) {
		if (eventType === ccui.Widget.TOUCH_ENDED) {
			if (h1global.curUIMgr.confirm_ui) {
				h1global.curUIMgr.confirm_ui.show_by_info("是否确定解散房间?", function () {
					if (h1global.player()) {
						h1global.player().quitRoom();
					}
				});
			}
		}
	}

	quite_panel.getChildByName("out_btn").addTouchEventListener(quite_btn_event);
	quite_panel.getChildByName("close_btn").addTouchEventListener(close_btn_event);

	var player = h1global.player();
	if (player.serverSitNum == 0 && player.curGameRoom.roomType !== const_val.CLUB_ROOM) {
		quite_panel.getChildByName("out_btn").setVisible(false);
		quite_panel.getChildByName("close_btn").setVisible(true);
	} else {
		quite_panel.getChildByName("out_btn").setVisible(true);
		quite_panel.getChildByName("close_btn").setVisible(false);
	}
};

/**
 * function game_start 游戏开始时的UI管理
 * @return null;
 */
gameroomUIMgr.game_start = function () {
	if (h1global.curUIMgr.confirm_ui && h1global.curUIMgr.confirm_ui.is_show) {
		h1global.curUIMgr.confirm_ui.hide();
	}
};

/**
 * function set_wintips_btn_anime 为听牌按钮添加动画
 * @param wintips_btn 按钮的引用
 * @return null;
 */
gameroomUIMgr.set_wintips_btn_anime = function (wintips_btn) {
	if (!wintips_btn || wintips_btn.getChildByName("circle_img")) {
		return;
	}
	var circle = new cc.Sprite("res/ui/GameRoomUI/wintips_circle_img.png");
	wintips_btn.addChild(circle);
	circle.setName("circle_img");
	circle.setPosition(33.19, 33.04);
	circle.setAnchorPoint(1, 1);
	circle.runAction(cc.RepeatForever.create(cc.Sequence.create(
		cc.rotateTo(0.833, 720)
	)))
};

/**
 * function init_table_idx_panel 给桌子加上桌号
 * @param rootUINode 需要管理的UI界面的根节点
 * @return null;
 */
gameroomUIMgr.init_table_idx_panel = function (rootUINode) {
	var player = h1global.player();
	if (!player) {
		return;
	}
	if (h1global.player().curGameRoom.roomType != const_val.CLUB_ROOM) {
		return;
	}
	var game_type = parseInt(player.curGameRoom.gameType);
	switch (game_type) {
		case const_val.LvLiang7:
			if (player.curGameRoom.curRound > 0) {
				var add_panel = rootUINode.getChildByName("game_info_panel");
				set_default(add_panel, cc.p(add_panel.width * 0.5, 50), 26, cc.color(70, 184, 171));
			} else {
				var add_panel = rootUINode.getChildByName("gameprepare_panel").getChildByName("bg_img");
				set_default(add_panel, cc.p(add_panel.width * 0.5, 15), 28, cc.color(83, 195, 165));
			}
			break;
		case const_val.DouDiZhu:
			var add_panel = rootUINode.getChildByName("bg_panel");
			set_default(add_panel, cc.p(add_panel.width * 0.5, add_panel.height * 0.63), 26, cc.color(70, 184, 171));
			break;
		default:
			if (player.curGameRoom.curRound > 0) {
				if (player.curGameRoom.room_state == 0) {
					if (cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", h1global.curUIMgr.gameType)) == 1) {
						var add_panel = rootUINode.getChildByName("gameprepare3d_panel").getChildByName("center_bg_img");
						set_default(add_panel, cc.p(add_panel.width + 50, 20), 26, cc.color(173, 216, 205));
					} else {
						var add_panel = rootUINode.getChildByName("gameprepare2d_panel");
						var center_bg_pos = rootUINode.getChildByName("gameprepare3d_panel").getChildByName("center_bg_img").getPosition();
						set_default(add_panel, cc.p(center_bg_pos.x + 120, center_bg_pos.y - 88), 26, cc.color(173, 216, 205));
					}

				} else {
					var add_panel = rootUINode.getChildByName("game_info_panel").getChildByName("cur_player_panel");
					set_default(add_panel, cc.p(add_panel.width + 80, 0), 26, cc.color(173, 216, 205));
				}
			} else {
				var add_panel = rootUINode.getChildByName("gameprepare_panel").getChildByName("bg_img");
				set_default(add_panel, cc.p(add_panel.width * 0.5, 15), 28, cc.color(83, 195, 165));
			}
			break;
	}

	// var is_3d_ui = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", game_type));
	function set_default(panel, pos, size, color) {
		if (!player.curGameRoom.table_idx || panel.getChildByName("table_idx_label")) {
			return;
		}
		var table_idx = player.curGameRoom.table_idx;
		if (player.curGameRoom.table_idx < 10) {
			table_idx = "0" + player.curGameRoom.table_idx;
		}
		var table_label = new cc.LabelTTF(table_idx + " 桌", "zhunyuan", size);
		table_label.setPosition(pos);
		table_label.setColor(color);
		table_label.setName("table_idx_label");
		panel.addChild(table_label);
	}
};

/**
 * function get_sum_tile_num 获取麻将总剩余牌数
 * @param player_num 游戏人数
 * @param king_mode 双耗子的话要多减一个
 * @return int;
 */
gameroomUIMgr.get_sum_tile_num = function (player_num, king_mode) {
	var del_tile = (king_mode && king_mode == 2) ? 2 : 1
	return 136 - player_num * 13 - del_tile;
};

/**
 * function adapt_gameprepare_panel 根据人数适配麻将准备界面的头像
 * @param gameprepare_panel 当前使用的panel
 * @param player_num 游戏人数
 * @param limit 最大人数
 * @return null;
 */
gameroomUIMgr.adapt_gameprepare_panel = function (gameprepare_panel,player_num,limit) {
	cc.error(gameprepare_panel);
	cc.error(player_num);
	for(var i = 0;i<limit;i++){
		if(i<player_num){
			// gameprepare_panel.getChildByName("frame_img_"+i).setVisible(true);
			// gameprepare_panel.getChildByName("player_info_panel"+i).setVisible(true);
		}else{
			gameprepare_panel.getChildByName("frame_img_"+i).setVisible(false);
			gameprepare_panel.getChildByName("player_info_panel"+i).setVisible(false);
		}
	}

};