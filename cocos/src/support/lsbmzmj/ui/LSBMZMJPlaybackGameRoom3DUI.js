"use strict"
var LSBMZMJPlaybackGameRoom3DUI = LSBMZMJGameRoom3DUI.extend({
    ctor: function () {
        this._super();
        this.playbackGame = new LSBMZMJPlaybackGameRoom(this);
        this.addChild(this.playbackGame)
    },

    initUI: function () {
        this._super();
        this.playbackGame.init()
    },

    update_player_hand_tiles: function (serverSitNum, tileList) {
        this.update_player_exposed_tiles(serverSitNum, tileList, true)
    },

    update_playback_operation_panel: function (serverSitNum, op_dict, doOP) {
    }
});