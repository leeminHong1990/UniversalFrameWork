"use strict"

var JZGSJMJGameRoom2DUI = JZGSJMJGameRoomUI.extend({
	className: "JZGSJMJGameRoom2DUI",
	uiType: const_val.GAME_ROOM_2D_UI,
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/JZMJGameRoom2DUI.json";
		this.initDelayTime = const_val.DISCARD_SPEED;
	},
	init_discard_tile_anim_img: function () {
		this._super();
		this.discard_tile_anim_img.setAnchorPoint(0, 0);
		// this.discard_tile_anim_img.scale = 0.8;
		var mahjong_img = this.discard_tile_anim_img.getChildByName("mahjong_img");
		mahjong_img.setPosition(45, 48);
		// var cur_player_tile_panel = this.rootUINode.getChildByName("player_tile_panel0");
		// this.discard_tile_anim_img.setOrderOfArrival(cur_player_tile_panel.getOrderOfArrival() - 1);

	},
	load_discard_tile_anim_img: function (tile_img) {
		JZMJGameRoom2DUI.prototype.load_discard_tile_anim_img.call(this, tile_img);
	},

	init_curplayer_panel_direction: function () {
		JZMJGameRoom2DUI.prototype.init_curplayer_panel_direction.call(this);
	},

	update_curplayer_panel: function (serverSitNum) {
		JZMJGameRoom2DUI.prototype.update_curplayer_panel.call(this, serverSitNum);
	},

	getHandTileConfig: function () {
		return JZMJGameRoom2DUI.prototype.getHandTileConfig.call(this);
	},

	get_update_player_hand_tiles_config: function (index) {
		return JZMJGameRoom2DUI.prototype.get_update_player_hand_tiles_config.call(this, index);
	},

	get_update_player_exposed_tiles_config: function (index) {
		return JZMJGameRoom2DUI.prototype.get_update_player_exposed_tiles_config.call(this, index);
	},

	get_update_player_up_tiles_config: function (index) {
		return JZMJGameRoom2DUI.prototype.get_update_player_up_tiles_config.call(this, index);
	},

	get_play_discard_anim_config: function (serverSitNum, index, onlyTilePointer) {
		return JZMJGameRoom2DUI.prototype.get_play_discard_anim_config.call(this, serverSitNum, index, onlyTilePointer);
	},

	get_play_fly_anim_end_time: function () {
		return JZMJGameRoom2DUI.prototype.get_play_fly_anim_end_time.call(this);
	},

	play_discard_fly_anim: function (tile_img, discard_tile, start_position, end_position, mid_position, index) {
		return JZMJGameRoom2DUI.prototype.play_discard_fly_anim.call(this, tile_img, discard_tile, start_position, end_position, mid_position, index);
	},

	get_player_discard_tiles_config: function (index) {
		return JZMJGameRoom2DUI.prototype.get_player_discard_tiles_config.call(this, index);
	},

	get_start_begin_anim_config: function () {
		return JZMJGameRoom2DUI.prototype.get_start_begin_anim_config.call(this);
	},

	adapter_operation_panel: function (panel, editorOrigin, can_win) {
		return JZMJGameRoom2DUI.prototype.adapter_operation_panel.call(this, panel, editorOrigin, can_win);
	},
});
