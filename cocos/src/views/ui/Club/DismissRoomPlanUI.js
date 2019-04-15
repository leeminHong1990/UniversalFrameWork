"use strict";

var DismissRoomPlanUI = BasicDialogUI.extend({
    ctor:function () {
        this._super();
        this.resourceFilename = "res/ui/DismissRoomPlanUI.json";
    },

    show_by_info:function (club_id) {
		if(!h1global.player()){return;}
        if(!h1global.player().club_entity_dict[club_id]){return}
        this.club = h1global.player().club_entity_dict[club_id];
        this.show();
    },

    initUI:function () {
        var self = this;
        var dismissroomplan_panel = this.rootUINode.getChildByName("dismissroomplan_panel");

        dismissroomplan_panel.getChildByName("return_btn").addTouchEventListener(function (sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        });

	    dismissroomplan_panel.getChildByName("confirm_btn").addTouchEventListener(function (sender, eventType) {
		    if (eventType === ccui.Widget.TOUCH_ENDED) {
			    self.hide();
			    h1global.player().clubOperation(const_val.CLUB_OP_SET_DISMISS_ROOM_PLAN, self.club.club_id, [[self.agreenum,self.seconds]])
		    }
	    });

	    if (self.club.club_base_info.dismissRoomList) {
		    this.agreenum = self.club.club_base_info.dismissRoomList[0];
		    this.seconds = self.club.club_base_info.dismissRoomList[1];
	    } else {
		    this.agreenum = 4;
		    this.seconds = 300;
	    }

	    var agreenum_panel = dismissroomplan_panel.getChildByName("agreenum_panel");
	    var agreenum_list = [3,4,5];
	    var select_idx_agreenum = agreenum_list.indexOf(self.club.club_base_info.dismissRoomList[0]);
	    UICommonWidget.create_check_box_group(agreenum_panel, "agreenum_chx_",3, function (i) {self.agreenum = agreenum_list[i];}, select_idx_agreenum, "agreenum_label_");

	    var second_panel = dismissroomplan_panel.getChildByName("second_panel");
	    var second_list = [60, 180, 300, 600];
	    var select_idx_second = second_list.indexOf(self.club.club_base_info.dismissRoomList[1]);
	    UICommonWidget.create_check_box_group(second_panel, "min_chx_",4, function (i) {self.seconds = second_list[i];}, select_idx_second, "min_label_");
    }
});