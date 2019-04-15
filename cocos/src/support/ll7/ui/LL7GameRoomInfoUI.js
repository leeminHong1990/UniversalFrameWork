var LL7GameRoomInfoUI = GameRoomInfoUI.extend({

	ctor: function () {
		this._super();
		this.resourceFilename = GameRoomInfoUI.ResourceFile2D;
	},
	updateLayout: function () {
		this._super();
		var self = this;
		this.config_btn.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				if (sender === self.config_btn) {
					h1global.curUIMgr.config_ui.show(function () {
						h1global.curUIMgr.config_ui.update_state();
					});
				} else {
					cc.log("TOUCH_ENDED: layout change");
				}
			}
		});
	},

	setLayout: function () {
		cc.warn("setLayout::not support")
	},

    update_chat_panel:function(){
        if(!h1global.player()){
            return
        }
        if(h1global.player().curGameRoom.room_state || h1global.player().curGameRoom.curRound >0){
            this.clubinvite_btn.setVisible(false);
            this.record_btn.setVisible(false);
            this.communicate_btn.setVisible(false);
            this.roominfo_panel.setVisible(false);
            return
        }
        if(h1global.player().curGameRoom.roomType == const_val.CLUB_ROOM && h1global.curUIMgr.clubinvite_ui){
            this.check_guide();
            this.clubinvite_btn.setVisible(true);
        }else{
            this.clubinvite_btn.setVisible(false);
        }
    },

	init_battery_panel:function(){
		this.battery_panel.getChildByName("battery_frame_img").loadTexture("res/ui/GameRoomInfo2DUI/battery_frame2.png");
		this.battery_panel.getChildByName("battery_grid_img_0").loadTexture("res/ui/GameRoomInfo2DUI/battery_grid2.png");
		this.battery_panel.getChildByName("battery_grid_img_1").loadTexture("res/ui/GameRoomInfo2DUI/battery_grid2.png");
		this.battery_panel.getChildByName("battery_grid_img_2").loadTexture("res/ui/GameRoomInfo2DUI/battery_grid2.png");
		this.time_label.setTextColor(cc.color(255,255,255));
	},

});
