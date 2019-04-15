// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var CreateRoomSnippet = UISnippet.extend({
	initUI:function(){
		this.game_mode = 0; //游戏模式，0代表普通模式，1代表庄家翻倍
		this.pay_mode = 0; //付费方式，0代表房主支付，1代表AA支付
		this.round_num = 8; //局数 4局、8局
		this.max_lose = 9999 // 用9999 表示无上限
		this.treasure_num = 0 //摸宝数量
		this.discard_seconds = 0
		this.hand_prepare = 1 // 0代表需要手动准备，1代表不需要手动准备，因为在玩家的state中0代表没有准备,1代表已经准备
		this.createroom_panel = this.rootUINode.getChildByName("createroom_panel");
		this.gamename_panel = this.createroom_panel.getChildByName("gamename_panel");
        
		var self = this;
        
		//是否需要手动准备
		var prepare_chx = this.gamename_panel.getChildByName("prepare_chx");
		var prepare_label = this.gamename_panel.getChildByName("prepare_label");
        UICommonWidget.create_touch_region(
        	prepare_chx,
			cc.p(0, 0.5),
			cc.p(0, prepare_chx.getContentSize().height * 0.5),
			cc.size(prepare_chx.getContentSize().width + prepare_label.getString().length * prepare_label.getFontSize(), prepare_chx.getContentSize().height),
			prepare_chx_touchregion_event
		);
        function prepare_chx_touchregion_event(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                if(self.hand_prepare == 0) {
                    prepare_chx.setSelected(false);
                    self.hand_prepare = 1;
                }else {
                    prepare_chx.setSelected(true);
                    self.hand_prepare = 0;
                }
            }
        }

		this.updateCardDiamond(this.round_num);

		var chx_list = ["game_mode_chx","round_chx","max_lose_chx","treasure_chx","discard_seconds_chx", "pay_mode_chx"];
		var chx_label_list = ["game_mode_label_", "round_num_label_", "max_lose_num_label_", "treasure_num_label_", "discard_seconds_num_label_", "pay_mode_label_"];
		var chx_num_list = [2,3,4,3,3,2];
		var chx_func_list = [
		    function (i) {self.game_mode = i;},
            function (i) {self.round_num = 8*(i+1);self.updateCardDiamond(self.round_num);},
            function (i) {self.max_lose = i == 0 ? 9999 : i*10;},
            function (i) {self.treasure_num = i;},
            function (i) {self.discard_seconds = i == 0 ? 0 : (i+1)*5;},
            function (i) {
				if (self.room_type === const_val.CLUB_ROOM) {
					self.pay_mode = i === 0 ? const_val.CLUB_PAY_MODE : const_val.AA_PAY_MODE;
				} else {
					self.pay_mode = i === 0 ? const_val.NORMAL_PAY_MODE : const_val.AA_PAY_MODE;
				}
                self.updateCardDiamond(self.round_num);}
        ];
		this.update_game_panel(this.createroom_panel, chx_list, chx_num_list, chx_label_list, chx_func_list);
	},

    //参数分别是一种游戏的面板、复选框名字的列表、对应复选框的个数列表、对应复选框的标签列表、对应要执行的函数的列表
	update_game_panel:function (game_panel, chx_list, chx_num_list, chx_label_list, chx_func_list) {
		var self = this;
		for(var i = 0 ; i < chx_list.length ; i++) {
            UICommonWidget.create_check_box_group(game_panel, chx_list[i], chx_num_list[i], chx_label_list[i], chx_func_list[i]);
        }
    },

	updateCardDiamond:function(round_num){

        var val = undefined;

        if (this.pay_mode === const_val.AA_PAY_MODE) {
            val = "每人消耗 x " + (round_num/8).toString();
        } else {
            if (this.room_type === const_val.CLUB_ROOM) {
                val = "老板消耗 x " + (round_num/8*4).toString();
            } else {
                val = "房主消耗 x " + (round_num/8*4).toString();
            }
        }

		var cost_num_label = this.gamename_panel.getChildByName("cost_num_label");
        cost_num_label.setString(val);
	},

	getParameters: function () {
		return {
			"pay_mode": this.pay_mode,
			"game_mode": this.game_mode,
			"game_round": this.round_num,
			"max_lose": this.max_lose,
			"lucky_num": this.treasure_num,
			"discard_seconds": this.discard_seconds,
			"hand_prepare": this.hand_prepare,
		};
	},

    updateRoomType: function (r_type) {
        this.room_type = r_type;
		var label_1 = this.gamename_panel.getChildByName("pay_mode_label_1");
		if (r_type === const_val.CLUB_ROOM) {
			label_1.setString("老板支付");
		} else {
			label_1.setString("房主支付");
		}
		this.update_default_pay_mode();
		// this.update_mode_option();
		this.updateCardDiamond(this.round_num);
	},

    update_default_pay_mode: function () {
        switch (this.room_type) {
            case const_val.CLUB_ROOM:
                if (this.pay_mode !== const_val.AA_PAY_MODE) {
                    this.pay_mode = const_val.CLUB_PAY_MODE;
                }
                break;
            default:
                if (this.pay_mode !== const_val.AA_PAY_MODE) {
                    this.pay_mode = const_val.NORMAL_PAY_MODE;
                }
        }
    },
});