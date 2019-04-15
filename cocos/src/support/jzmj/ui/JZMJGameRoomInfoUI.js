var JZMJGameRoomInfoUI = GameRoomInfoUI.extend({

	setArrange:function(value) {
		this.hasArrange = value;
		if (this.is_show) {
			this.update_chat_panel();
		}
	},

	update_arrange_btn: function () {
		this.arrange_btn.setVisible(this.hasArrange);
		if(this.hasArrange){
            this.record_btn.setPositionY(this.arrange_btn.getPositionY()-86);
            this.communicate_btn.setPositionY(this.arrange_btn.getPositionY()+86);
		}
	},

    update_chat_panel:function(){
        if(!h1global.player()){
            return
        }
        if(h1global.player().curGameRoom.room_state  || h1global.player().curGameRoom.curRound >0 ){
            this.clubinvite_btn.setVisible(false);
            this.update_arrange_btn();
            return
        }
        if(h1global.player().curGameRoom.roomType == const_val.CLUB_ROOM && h1global.curUIMgr.clubinvite_ui){
            this.check_guide();
            this.clubinvite_btn.setVisible(true);
        }else{
            this.clubinvite_btn.setVisible(false);
        }
    },
});
