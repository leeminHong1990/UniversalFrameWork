"use strict"

var JZGSJMJGameRoom3DUI = JZGSJMJGameRoomUI.extend({
	className: "JZGSJMJGameRoom3DUI",
	uiType: const_val.GAME_ROOM_3D_UI,
	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/JZMJGameRoom3DUI.json";
		this.initDelayTime = const_val.DISCARD_SPEED;
	},

	init_curplayer_panel_direction: function () {
		JZMJGameRoom3DUI.prototype.init_curplayer_panel_direction.call(this);
	},

	init_discard_tile_anim_img: function () {
		JZMJGameRoom3DUI.prototype.init_discard_tile_anim_img.call(this);
	},

	getHandTileConfig: function () {
		return JZMJGameRoom3DUI.prototype.getHandTileConfig.call(this);
	},

	load_discard_tile_anim_img: function (tile_img) {
		JZMJGameRoom3DUI.prototype.load_discard_tile_anim_img.call(this, tile_img);
	},

	get_update_player_hand_tiles_config: function (index) {
		return JZMJGameRoom3DUI.prototype.get_update_player_hand_tiles_config.call(this, index);
	},

	get_update_player_up_tiles_config: function (index) {
		return JZMJGameRoom3DUI.prototype.get_update_player_up_tiles_config.call(this, index);
	},

	get_update_player_exposed_tiles_config: function (index) {
		return JZMJGameRoom3DUI.prototype.get_update_player_exposed_tiles_config.call(this, index);
	},

	get_start_begin_anim_config: function () {
		return JZMJGameRoom3DUI.prototype.get_start_begin_anim_config.call(this);
	},

	play_discard_fly_anim: function (tile_img, discard_tile, start_position, end_position, mid_position, index) {
		JZMJGameRoom3DUI.prototype.play_discard_fly_anim.call(this, tile_img, discard_tile, start_position, end_position, mid_position, index);
	},

	get_play_fly_anim_end_time: function () {
		return JZMJGameRoom3DUI.prototype.get_play_fly_anim_end_time.call(this);
	},

	get_play_discard_anim_config: function (serverSitNum, index, onlyTilePointer) {
		return JZMJGameRoom3DUI.prototype.get_play_discard_anim_config.call(this, serverSitNum, index, onlyTilePointer);
	},

	get_player_discard_tiles_config: function (index) {
		return JZMJGameRoom3DUI.prototype.get_player_discard_tiles_config.call(this, index);
	},

	adapter_operation_panel: function (panel, editorOrigin, can_win) {
		JZMJGameRoom3DUI.prototype.adapter_operation_panel.call(this, panel, editorOrigin, can_win);
	},

});
