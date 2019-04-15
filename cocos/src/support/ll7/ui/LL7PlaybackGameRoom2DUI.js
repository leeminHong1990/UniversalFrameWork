"use strict"
var LL7PlaybackGameRoom2DUI = LL7GameRoom2DUI.extend({
    ctor: function () {
        this._super();
        this.playbackGame = new LL7PlaybackGameRoom(this);
        this.addChild(this.playbackGame)
    },
    initUI: function () {
        this._super();
        this.playbackGame.init();
    },

    update_playback_operation_panel: function (serverSitNum, op_dict, doOP) {

    }

});
