"use strict";

var ClubEntity = KBEngine.Entity.extend({
    ctor : function(club_base_info)
    {
        this._super();
        this.club_base_info = club_base_info;

        this.club_id = club_base_info["club_id"];
        this.club_name = club_base_info["club_name"];
        this.club_notice = club_base_info["club_notice"];
        this.owner = club_base_info["owner"];
        this.power = club_base_info["power"];

        this.room_params = {};
        this.members = [];
        KBEngine.DEBUG_MSG("Create ClubEntity")
    },

    update_club_info:function (club_detail_info) {
        this.member_num = club_detail_info["member_num"];
        this.room_params = JSON.parse(club_detail_info["room_params"]);
        this.club_notice = club_detail_info["club_notice"];
		this.power = club_detail_info["power"];
        this.table_info_list = club_detail_info["table_info_list"];
		//第一次进亲友圈初始化的数据不对的问题
		this.club_base_info.room_params =club_detail_info["room_params"];
		this.club_base_info.table_info_list = club_detail_info["table_info_list"];
		this.club_base_info.game_type = club_detail_info["table_info_list"][0].game_type;
    },

    update_table_list:function (table_info_list) {
	    this.club_base_info.table_info_list = table_info_list;
    },

    get_base_info:function () {
        return {
            "club_id" : this.club_base_info.club_id,
            "club_name" : this.club_base_info.club_name,
            "owner" : this.club_base_info.owner
        }
    },

	is_true_owner:function(){
		return this.power === const_val.CLUB_POWER_OWNER;
    },

    is_owner:function (user_id) {
        return user_id === this.owner.userId || this.power === const_val.CLUB_POWER_WHITE;
    },

	is_admin:function () {
		return this.power === const_val.CLUB_POWER_ADMIN;
	},

    is_member:function (user_id) {
        for (var idx in this.members) {
            var data = this.members[idx];
            if (data['userId'] === user_id) {
                return true;
            }
        }
        return false;
	},

    getRoomCreateDict:function () {
        return this.room_params;
    }
});