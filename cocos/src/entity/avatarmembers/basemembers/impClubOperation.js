"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impClubOperation = impBase.extend({
	__init__: function () {
		this._super();
		KBEngine.DEBUG_MSG("Create impClubOperation");
		this.club_entity_list = [];
		this.club_entity_dict = {};
	},

	createClub: function () {
		cc.log("createClub");
		this.baseCall("createClub");
	},

	createClubSucceed: function (club_detail) {
		cc.log("createClubSucceed: ", club_detail);

		var club = new ClubEntity({
			"club_id": club_detail["club_id"],
			"club_name": club_detail["club_name"],
			"owner": club_detail["owner"],
			"table_info_list": club_detail["table_info_list"],
			"r_switch": club_detail["r_switch"],
			"p_switch": club_detail["p_switch"],
			"l_switch": club_detail["l_switch"],
			"apply_hint": club_detail["apply_hint"],
			"dailyRound": club_detail["dailyRound"],
			"dismissRoomList": club_detail["dismissRoomList"],
		});
		club.update_club_info(club_detail);
		this.club_entity_list.push(club);
		this.club_entity_dict[club.club_id] = club;
		if (h1global.curUIMgr.clubview_ui && h1global.curUIMgr.clubview_ui.is_show) {
			var base_info_list = [];
			for (var i = 0; i < this.club_entity_list.length; i++) {
				base_info_list.push(this.club_entity_list[i].get_base_info());
			}
			h1global.curUIMgr.clubview_ui.update_club_scroll(base_info_list);
		}
		if (h1global.curUIMgr.club_ui) {
			h1global.curUIMgr.club_ui.hide();
			h1global.curUIMgr.club_ui.show_by_info(club.club_id);
		}
	},

	deleteClub: function (club_id) {
		this.baseCall("deleteClub", club_id);
	},

	deleteClubSucceed: function (club_id) {
		if (this.club_entity_dict[club_id]) {
			delete this.club_entity_dict[club_id];
			for (var i = 0; i < this.club_entity_list.length; i++) {
				if (this.club_entity_list[i].club_id === club_id) {
					this.club_entity_list.splice(i, 1);
				}
			}
		}

		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.hide();
		}
		if (h1global.curUIMgr.clubview_ui && h1global.curUIMgr.clubview_ui.is_show) {
			var club_base_list = [];
			for (var j = 0; j < this.club_entity_list.length; j++) {
				club_base_list.push(this.club_entity_list[j].get_base_info());
			}
			h1global.curUIMgr.clubview_ui.update_club_scroll(club_base_list);
		}
	},

	getClubListInfo: function () {
		this.baseCall("getClubListInfo");
	},

	getClubDetailInfo: function (club_id) {
		this.baseCall("getClubDetailInfo", club_id);
	},

	clubOperation: function (op, club_id, args) {
		args = args || [];
		cc.log("clubOperation", op, club_id, args);
		this.baseCall("clubOperation", op, club_id, JSON.stringify(args));
	},

	gotClubListInfo: function (club_base_list) {
		cc.log("gotClubListInfo: ", club_base_list);
		this.club_entity_list = [];
		this.club_entity_dict = {};
		for (var i = 0; i < club_base_list.length; i++) {
			this.club_entity_list.push(new ClubEntity(club_base_list[i]));
			this.club_entity_dict[club_base_list[i]["club_id"]] = this.club_entity_list[i]
		}
		if (h1global.curUIMgr) {
			if (h1global.curUIMgr.clubview_ui && h1global.curUIMgr.clubview_ui.is_show) {
				h1global.curUIMgr.clubview_ui.update_club_scroll(club_base_list);
			}
			if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
				h1global.curUIMgr.club_ui.hide();
			}
			if (h1global.curUIMgr.club_ui && !h1global.curUIMgr.club_ui.is_show) {
				let player = h1global.player();
				if (player.club_entity_list.length > 0) {
					if (player) {
						var info_json = cc.sys.localStorage.getItem("CLUB_CHOOSE_JSON");
						if (!info_json) {
							info_json = '{"now_choose_club":' + player.club_entity_list[0]["club_id"] + '}';
						}
						var info_dict = eval("(" + info_json + ")");
						var info_id = info_dict["now_choose_club"];
						var club_list = h1global.player().club_entity_dict;
						var club_id = player.club_entity_list[0]["club_id"];
						for (var i in club_list) {
							if (club_list[i]["club_id"] == info_id) {
								club_id = info_id
							}
						}
						h1global.curUIMgr.club_ui.show_by_info(club_id);
					}
				} else {
					cutil.unlock_ui();
					if (h1global.curUIMgr.showclub_ui && !h1global.curUIMgr.showclub_ui.is_show) {
						h1global.curUIMgr.showclub_ui.show();
					}
				}

			}

			// 退出/踢出 亲友圈
			if (h1global.curUIMgr.clubconfig_ui && h1global.curUIMgr.clubconfig_ui.is_show) {
				h1global.curUIMgr.clubconfig_ui.hide();
			}

			if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
				let show_club_id = h1global.curUIMgr.clubmember_ui.club.club_id;
				if (!this.club_entity_dict[show_club_id]) {
					h1global.curUIMgr.clubmember_ui.hide();
				}
			}

			if (h1global.curUIMgr.clubrecord_ui && h1global.curUIMgr.clubrecord_ui.is_show) {
				let show_club_id = h1global.curUIMgr.clubrecord_ui.club.club_id;
				if (!this.club_entity_dict[show_club_id]) {
					h1global.curUIMgr.clubrecord_ui.hide();
				}
			}

			if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
				let show_club_id = h1global.curUIMgr.clubmgr_ui.club.club_id;
				if (!this.club_entity_dict[show_club_id]) {
					h1global.curUIMgr.clubmgr_ui.hide();
				}
			}

			if (h1global.curUIMgr.clubrank_ui && h1global.curUIMgr.clubrank_ui.is_show) {
				h1global.curUIMgr.clubrank_ui.hide();
			}

			if (h1global.curUIMgr.clubmode_ui && h1global.curUIMgr.clubmode_ui.is_show) {
				h1global.curUIMgr.clubmode_ui.hide();
			}
		}
	},

	gotClubDetailInfo: function (club_detail) {
		cc.log("gotClubDetailInfo: ", club_detail);
		if (!this.club_entity_dict[club_detail["club_id"]]) {
			return;
		}
		this.club_entity_dict[club_detail["club_id"]].update_club_info(club_detail);
		this.club_entity_dict[club_detail["club_id"]].update_table_list(club_detail["table_info_list"]);
		if (h1global.curUIMgr.club_ui && !h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.show_by_info(club_detail["club_id"]);
		}
	},

	gotTableDetailInfo: function (t_idx, table_detail) {
		cc.log("gotTableDetailInfo: ", t_idx, table_detail);
		// if(h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show){
		// 	h1global.curUIMgr.club_ui.update_table_details(t_idx, table_detail);
		// }
		// if(h1global.curUIMgr.clubroomdetail_ui && !h1global.curUIMgr.clubroomdetail_ui.is_show){
		//    h1global.curUIMgr.clubroomdetail_ui.show_by_info(t_idx, table_detail)
		// }
	},

	gotClubTableList: function (club_id, seat_info_list) {
		cc.log("gotClubTableList: ", club_id, seat_info_list);
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		// h1global.player().clubOperation(const_val.CLUB_OP_GET_TABLE_DETAIL, club_id, [index]);
		this.club_entity_dict[club_id].update_table_list(seat_info_list);
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_desk_panel(club_id, seat_info_list);
		}
	},

	setClubNameSucceed: function (club_id, name) {
		cc.log("setClubNameSucceed: ", club_id, name);
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_name = name;

		if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
			h1global.curUIMgr.clubmgr_ui.update_club_name(club_id);
		}
		// if(h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show){
		//     h1global.curUIMgr.club_ui.update_club_name(club_id);
		// }
		if (h1global.curUIMgr.clubview_ui && h1global.curUIMgr.clubview_ui.is_show) {
			var base_info_list = [];
			for (var i = 0; i < this.club_entity_list.length; i++) {
				base_info_list.push(this.club_entity_list[i].get_base_info());
			}
			h1global.curUIMgr.clubview_ui.update_club_scroll(base_info_list);
		}
	},

	setClubNoticeSucceed: function (club_id, notice) {
		cc.log("setClubNoticeSucceed: ", club_id, notice);
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_notice = notice;
		if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
			h1global.curUIMgr.clubmgr_ui.update_club_notice(club_id);
		}
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.show_notice(club_id, notice);
		}
		// club_ui ?
	},

	setMemberNotesSucceed: function (club_id, mem_uid, notes) {
		cc.log("setMemberNotesSucceed", club_id, mem_uid, notes);
	},

	gotClubMembers: function (club_id, member_list) {
		cc.log("gotClubMembers: ", club_id, member_list);
		// if(h1global.curUIMgr.clubinvite_ui && h1global.curUIMgr.clubinvite_ui.is_show){
		//     h1global.curUIMgr.clubinvite_ui.update_club_member(club_id,member_list);
		//     cutil.unlock_ui();
		// }
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		// //根据 online 和 free 排个顺序
		// function check_online(a,b){
		//     if(b["online"] && !a["online"]){
		//         return true;
		//     }
		//     return false;
		// }
		// function check_free(a,b){
		//     if(b["free"] && !a["free"]){
		//         return true;
		//     }
		//     return false;
		// }
		// for(var j = 0;j<member_list.length;j++){
		//     for(var i = 0;i<member_list.length;i++){
		//         if(member_list[i+1]&&check_free(member_list[i],member_list[i+1])){
		//             [member_list[i], member_list[i+1]] = [member_list[i+1], member_list[i]];
		//         }
		//     }
		// }
		// for(var j = 0;j<member_list.length;j++){
		//     for(var i = 0;i<member_list.length;i++){
		//         if(member_list[i+1]&&check_online(member_list[i],member_list[i+1])){
		//             [member_list[i], member_list[i+1]] = [member_list[i+1], member_list[i]];
		//         }
		//     }
		// }
		// this.club_entity_dict[club_id].members = member_list;
		// if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
		// 	h1global.curUIMgr.clubmember_ui.update_club_member(club_id, member_list)
		// }
		// if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
		// 	h1global.curUIMgr.club_ui.update_desk_panel(club_id, this.club_entity_dict[club_id].club_base_info.table_info_list);
		// }
	},

	gotPageClubMembers: function (club_id, member_list, now_page, page_size, total) {
		cc.log("gotClubMembers: ", club_id, member_list, now_page, page_size, total);
		cutil.unlock_ui();
		if(h1global.curUIMgr.clubinvite_ui && h1global.curUIMgr.clubinvite_ui.is_show){
			h1global.curUIMgr.clubinvite_ui.update_club_member(club_id,member_list);
		}
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.update_club_member(club_id, member_list, now_page, total)
		}
	},

	gotClubApplicants: function (applicant_list) {
		cc.log("gotClubApplicants: ", applicant_list);
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.update_club_apply(applicant_list)
		}
	},

	gotClubAdmins:function (club_id, admins_list) {
		cc.log("gotClubAdmins", club_id, admins_list)
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.update_admin_list(admins_list)
		}
	},

	gotPageClubBlacks: function (club_id, member_list, now_page, page_size, total) {
		cc.error("gotPageClubBlacks: ", club_id, member_list, now_page, page_size, total);
		cutil.unlock_ui();
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.update_club_black(club_id, member_list, now_page, total)
		}
	},

	gotPageClubStatistics:function (club_id, statistics, now_page, page_size, total) {
		cc.log("gotPageClubStatistics", club_id, statistics, now_page, page_size, total)
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		cutil.unlock_ui();
		if (h1global.curUIMgr.clubstatistics_ui && h1global.curUIMgr.clubstatistics_ui.is_show) {
			h1global.curUIMgr.clubstatistics_ui.update_club_statistics(club_id, statistics, now_page, page_size, total);
		}
	},

	gotClubRecords: function (club_id, record_list) {
		cc.log("gotClubRecords", club_id, record_list);
		// if(h1global.curUIMgr.clubrecord_ui && h1global.curUIMgr.clubrecord_ui.is_show){
		//    h1global.curUIMgr.clubrecord_ui.update_recrod(club_id, record_list);
		// }
	},

	clubOperationFailed: function (err_code) {
		cc.log("clubOperationFailed err = ", err_code);
		if (err_code === const_val.CLUB_OP_ERR_PERMISSION_DENY) {
			h1global.globalUIMgr.info_ui.show_by_info("权限不足", cc.size(300, 200));
		} else if (err_code === const_val.CLUB_OP_ERR_INVALID_OP) {
			h1global.globalUIMgr.info_ui.show_by_info("非法操作", cc.size(300, 200));
		} else if (err_code === const_val.CLUB_OP_ERR_NUM_LIMIT) {
			h1global.globalUIMgr.info_ui.show_by_info("亲友圈数量限制", cc.size(300, 200));
		} else if (err_code === const_val.CLUB_OP_ERR_WRONG_ARGS) {
			h1global.globalUIMgr.info_ui.show_by_info("参数错误", cc.size(300, 200));
		} else if (err_code === const_val.CLUB_OP_ERR_CLUB_NOT_EXIST) {
			h1global.globalUIMgr.info_ui.show_by_info("亲友圈不存在", cc.size(300, 200));
		} else if (err_code === const_val.CLUB_OP_ERR_CARD_NOT_ENOUGH) {
			h1global.globalUIMgr.info_ui.show_by_info("房卡不足, 创建失败", cc.size(300, 200));
		}
	},

	clubEvent_POSC: function (club_id, event_msg) {
		cc.log(club_id, event_msg);//上下线
		if (!this.club_entity_dict[club_id]) {
			return;
		}

		this.club_entity_dict[club_id].club_base_info.online_num = event_msg["online_num"];
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_club_member_num_label();
		}
		//在members中加入该玩家的信息，方便更新。
		this.club_entity_dict[club_id].members[event_msg["userId"]] = event_msg
		//找到用户所在的桌子
		var idx = undefined;
		var table_info_list = this.club_entity_dict[club_id].club_base_info.table_info_list;
		for(var i in table_info_list){
			var seat_info = table_info_list[i]["seat_info"];
			for(j in seat_info){
				if(seat_info[j]["userId"] == event_msg["userId"]){
					cc.log("当前桌子",i);
					cc.log("当前位置",j);
					idx = i;
					seat_info[j]["online"] = event_msg["online"];
				}
			}
		}
		if(idx !== undefined){
			//如果成员在桌子上上下线，则更新状态
			if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
				h1global.curUIMgr.club_ui.update_online_state(club_id, idx);//更新茶楼的 title_panel
			}
		}
	},

	clubEvent_PGSC: function (club_id, event_msg) {
		cc.log(club_id, event_msg);//进入游戏
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		// var member_list = this.club_entity_dict[club_id].members;
		// if (!member_list) {
		// 	cc.log("当前成员列表为空，这不科学。请检查是否正常获取的成员列表");
		// 	return;
		// }
		// cc.error("member_list:",member_list)
		// for (var i in member_list) {
		// 	if (member_list[i]["userId"] == event_msg["userId"]) {
		// 		member_list[i]["free"] = event_msg["free"];
		// 	}
		// }
	},

	clubEvent_RPC: function (club_id, event_msg) {
		cc.log(club_id, event_msg);//改模式
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["game_type"] = event_msg["game_type"];
		this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["room_params"] = event_msg["room_params"];

		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_room_params(club_id, event_msg);
			cutil.unlock_ui();
		}
	},

	clubEvent_SIC: function (club_id, event_msg) {
		cc.log(club_id, event_msg);
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		if(this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["add_time"] && this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["add_time"] > event_msg["ts"]){
			cc.error("ts无效！");
			return;
		}
		this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["seat_info"] = event_msg["seat_info"];
		this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["add_time"] = event_msg["ts"];
		if(event_msg["seat_info"].length == 0){
			this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["room_state"] = 0;
		}

		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_sic_info(club_id, event_msg);
		}
	},

	clubEvent_MNC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); //成员数量发生变化
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info.online_num = event_msg["online_num"];
		this.club_entity_dict[club_id].club_base_info.member_num = event_msg["member_num"];
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_club_member_num_label();
		}
	},

	clubEvent_CNMC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 改名字
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info.club_name = event_msg;
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_top_panel_name_btn();
		}
	},

	clubEvent_CNTC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 改公告
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info.club_notice = event_msg;
		this.club_entity_dict[club_id].club_notice = event_msg;
	},

	clubEvent_DRPC: function (club_id, event_msg) {
		cc.log(club_id, event_msg);//改默认玩法
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		// this.club_entity_dict[club_id].club_base_info.game_type = event_msg["game_type"];
		// this.club_entity_dict[club_id].club_base_info.room_params = event_msg["room_params"];

		// if(h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show){
		//     h1global.curUIMgr.club_ui.update_default_room_params(club_id, event_msg);
		// }
	},

	clubEvent_CDPC: function (club_id, event_msg) {
		cc.log(club_id, event_msg);
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		// this.club_entity_dict[club_id].club_base_info.game_type = event_msg["game_type"];
		// this.club_entity_dict[club_id].club_base_info.room_params = event_msg["room_params"];

		// if(h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show){
		//     h1global.curUIMgr.club_ui.update_default_room_params(club_id, event_msg);
		// }
	},

	clubEvent_CRSC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 改变 单桌模式
		if (!this.club_entity_dict[club_id]) {
			return;
		}

		if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
			h1global.curUIMgr.clubmgr_ui.update_mode_change_btn(event_msg);
		}
		this.club_entity_dict[club_id].club_base_info["r_switch"] = event_msg;
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_desk_panel(club_id, this.club_entity_dict[club_id].club_base_info.table_info_list);//更新茶楼的 title_panel
		}
	},

	clubEvent_CMIU: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 用户信息更新, 目前只有房主isAgent信息发生变化才会推送
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].owner.isAgent = event_msg["isAgent"];
	},

	clubEvent_CPMSC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 支付方式开关更新
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		// this.club_entity_dict[club_id].owner.isAgent = event_msg["isAgent"];
		this.club_entity_dict[club_id].club_base_info["p_switch"] = event_msg;
		if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
			h1global.curUIMgr.clubmgr_ui.update_pay_change_btn(event_msg);
		}
	},

	clubEvent_RSC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 桌子的状态
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["room_state"] = event_msg["state"];
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_desk_title_label(club_id, event_msg);
		}
	},

	clubEvent_RRC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 桌子的局数
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info.table_info_list[event_msg["idx"]]["current_round"] = event_msg["current_round"];
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_table_cur_round(club_id, event_msg);
		}
	},

	clubEvent_CAH: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 是否有人申请
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info.apply_hint = event_msg;
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.update_member_is_apply(club_id, event_msg);
		}
	},

	joinClubSucceed: function (club_base_list) {
		cc.log("gotClubListInfo: ", club_base_list);
		this.club_entity_list = [];
		this.club_entity_dict = {};
		for (var i = 0; i < club_base_list.length; i++) {
			this.club_entity_list.push(new ClubEntity(club_base_list[i]));
			this.club_entity_dict[club_base_list[i]["club_id"]] = this.club_entity_list[i]
		}
		if (h1global.curUIMgr) {
			if (h1global.curUIMgr.clubview_ui && h1global.curUIMgr.clubview_ui.is_show) {
				h1global.curUIMgr.clubview_ui.update_club_scroll(club_base_list);
			}
			if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
				h1global.curUIMgr.club_ui.hide();
				if (h1global.curUIMgr.club_ui && !h1global.curUIMgr.club_ui.is_show) {
					let player = h1global.player();
					if (player.club_entity_list.length > 0) {
						if (player) {
							var info_json = cc.sys.localStorage.getItem("CLUB_CHOOSE_JSON");
							if (!info_json) {
								info_json = '{"now_choose_club":' + player.club_entity_list[0]["club_id"] + '}';
							}
							var info_dict = eval("(" + info_json + ")");
							var info_id = info_dict["now_choose_club"];
							var club_list = h1global.player().club_entity_dict;
							var club_id = player.club_entity_list[0]["club_id"];
							for (var i in club_list) {
								if (club_list[i]["club_id"] == info_id) {
									club_id = info_id
								}
							}
							h1global.curUIMgr.club_ui.show_by_info(club_id);
						}
					}
				}
			}

			if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
				h1global.curUIMgr.clubmember_ui.hide();
			}

			if (h1global.curUIMgr.clubrecord_ui && h1global.curUIMgr.clubrecord_ui.is_show) {
				h1global.curUIMgr.clubrecord_ui.hide();
			}

			if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
				h1global.curUIMgr.clubmgr_ui.hide();
			}

			if (h1global.curUIMgr.showclub_ui && h1global.curUIMgr.showclub_ui.is_show) {
				h1global.curUIMgr.showclub_ui.hide();
			}

			if (h1global.curUIMgr.clubrank_ui && h1global.curUIMgr.clubrank_ui.is_show) {
				h1global.curUIMgr.clubrank_ui.hide();
			}

			if (h1global.curUIMgr.clubmode_ui && h1global.curUIMgr.clubmode_ui.is_show) {
				h1global.curUIMgr.clubmode_ui.hide();
			}

			if (h1global.globalUIMgr.info_ui) {
				if (h1global.globalUIMgr.info_ui.is_show) {
					h1global.globalUIMgr.info_ui.hide();
				}
				h1global.globalUIMgr.info_ui.show_by_info("你成功地加入了一个亲友圈");
			}
		}
	},

	leaveClubSucceed: function (club_base_list) {
		cc.log("gotClubListInfo: ", club_base_list);
		this.club_entity_list = [];
		this.club_entity_dict = {};
		for (var i = 0; i < club_base_list.length; i++) {
			this.club_entity_list.push(new ClubEntity(club_base_list[i]));
			this.club_entity_dict[club_base_list[i]["club_id"]] = this.club_entity_list[i]
		}
		if (h1global.curUIMgr) {
			if (h1global.curUIMgr.clubview_ui && h1global.curUIMgr.clubview_ui.is_show) {
				h1global.curUIMgr.clubview_ui.update_club_scroll(club_base_list);
			}
			if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
				h1global.curUIMgr.club_ui.hide();
				if (h1global.curUIMgr.club_ui && !h1global.curUIMgr.club_ui.is_show) {
					let player = h1global.player();
					if (player.club_entity_list.length > 0) {
						if (player) {
							var info_json = cc.sys.localStorage.getItem("CLUB_CHOOSE_JSON");
							if (!info_json) {
								info_json = '{"now_choose_club":' + player.club_entity_list[0]["club_id"] + '}';
							}
							var info_dict = eval("(" + info_json + ")");
							var info_id = info_dict["now_choose_club"];
							var club_list = h1global.player().club_entity_dict;
							var club_id = player.club_entity_list[0]["club_id"];
							for (var i in club_list) {
								if (club_list[i]["club_id"] == info_id) {
									club_id = info_id
								}
							}
							h1global.curUIMgr.club_ui.show_by_info(club_id);
						}
					}
				}
			}

			// 退出/踢出 亲友圈
			// if(h1global.curUIMgr.clubconfig_ui && h1global.curUIMgr.clubconfig_ui.is_show){
			//     h1global.curUIMgr.clubconfig_ui.hide();
			// }

			if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
				h1global.curUIMgr.clubmember_ui.hide();
			}

			if (h1global.curUIMgr.clubrecord_ui && h1global.curUIMgr.clubrecord_ui.is_show) {
				h1global.curUIMgr.clubrecord_ui.hide();
			}

			if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
				h1global.curUIMgr.clubmgr_ui.hide();
			}

			if (h1global.curUIMgr.showclub_ui && h1global.curUIMgr.showclub_ui.is_show) {
				h1global.curUIMgr.showclub_ui.hide();
			}

			if (h1global.curUIMgr.clubrank_ui && h1global.curUIMgr.clubrank_ui.is_show) {
				h1global.curUIMgr.clubrank_ui.hide();
			}

			if (h1global.curUIMgr.clubmode_ui && h1global.curUIMgr.clubmode_ui.is_show) {
				h1global.curUIMgr.clubmode_ui.hide();
			}

			if (h1global.globalUIMgr.info_ui) {
				if (h1global.globalUIMgr.info_ui.is_show) {
					h1global.globalUIMgr.info_ui.hide()
				}
				h1global.globalUIMgr.info_ui.show_by_info("你离开了一个亲友圈");
			}
		}
	},

	gotPageClubRecords: function (club_id, records, current_page, page_size, total, filters) {
		cc.log("gotPageClubRecords: ", club_id, records, current_page, page_size, total, filters);

		cutil.unlock_ui();
		if (h1global.curUIMgr.clubrecord_ui && h1global.curUIMgr.clubrecord_ui.is_show) {
			h1global.curUIMgr.clubrecord_ui.update_page_panel2(club_id, records, current_page, page_size, total, filters);
		}
	},

	clubEvent_CLSC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 茶楼禁用开关
		cutil.unlock_ui();
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info["l_switch"] = event_msg;
		if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
			h1global.curUIMgr.clubmgr_ui.update_lock_change_btn(event_msg);
			h1global.curUIMgr.clubmgr_ui.hide();
		}
		if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
			h1global.curUIMgr.club_ui.check_lock_panel(club_id);
		}
	},

	clubEvent_CMC: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 成员改变
		if (h1global.curUIMgr) {
			if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
				h1global.curUIMgr.clubmember_ui.reset_club_member(club_id)
			}
		}
	},

	clubEvent_CMR: function (club_id, event_msg) {
		cc.log(club_id, event_msg); // 成员离开
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.reset_club_member(club_id)
		}
	},

	pushClubSeatInfo:function (club_id, event_msg, now_page,page_num,add_time){
		cc.log(club_id, event_msg, now_page,page_num); // 更新桌子玩法
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		var table_info_list = this.club_entity_dict[club_id].club_base_info.table_info_list;
		for(var i = 0;i<event_msg.length;i++){
			if(table_info_list[page_num*now_page + i]["add_time"] && table_info_list[page_num*now_page + i]["add_time"] >= add_time){
				cc.error("ts无效！");
				continue;
			}
			table_info_list[page_num*now_page + i] = event_msg[i];
			event_msg[i]["idx"] = page_num*now_page + i;
			if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
				h1global.curUIMgr.club_ui.update_sic_info(club_id, event_msg[i]);
			}
		}
	},

	clubEvent_CDRC:function (club_id, event_msg){
		cc.log(club_id, event_msg); // 亲友圈今日总局数
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info["dailyRound"] = event_msg;
	},

	clubEvent_CDRPC:function (club_id, event_msg){
		cc.log(club_id, event_msg); // 解散房间方案变化
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		this.club_entity_dict[club_id].club_base_info["dismissRoomList"] = event_msg;
	},

	clubEvent_CAC:function (club_id, event_msg) {
		cc.log(club_id, event_msg)
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		let player = h1global.player();
		if(!player){
			return;
		}
		//自己被设置
		var is_me = event_msg.userId ===player.userId;
		var is_ow = this.club_entity_dict[club_id].is_owner(player.userId);
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.reset_club_member(club_id);
			h1global.curUIMgr.clubmember_ui.reset_admin_member(club_id);
		}
		if(!is_ow && !is_me){
			return;
		}
		if (h1global.globalUIMgr.info_ui) {
			if (h1global.globalUIMgr.info_ui.is_show) {
				h1global.globalUIMgr.info_ui.hide()
			}
			h1global.globalUIMgr.info_ui.show_by_info(is_me ? "你被设为"+this.club_entity_dict[club_id].club_name+"的管理员":"成功设置"+event_msg.nickname+"玩家为管理员");
		}
		if(is_me){
			if(this.club_entity_dict[club_id].power < const_val.CLUB_POWER_WHITE){
				this.club_entity_dict[club_id].power = const_val.CLUB_POWER_ADMIN;
			}
			if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
				h1global.curUIMgr.clubmember_ui.hide();
			}
			if (h1global.curUIMgr.clubrecord_ui && h1global.curUIMgr.clubrecord_ui.is_show) {
				h1global.curUIMgr.clubrecord_ui.hide();
			}
			if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
				h1global.curUIMgr.clubmgr_ui.hide();
			}
			if (h1global.curUIMgr.showclub_ui && h1global.curUIMgr.showclub_ui.is_show) {
				h1global.curUIMgr.showclub_ui.hide();
			}
			if (h1global.curUIMgr.clubrank_ui && h1global.curUIMgr.clubrank_ui.is_show) {
				h1global.curUIMgr.clubrank_ui.hide();
			}
			if (h1global.curUIMgr.clubmode_ui && h1global.curUIMgr.clubmode_ui.is_show) {
				h1global.curUIMgr.clubmode_ui.hide();
			}
			if (h1global.curUIMgr.clubstatistics_ui && h1global.curUIMgr.clubstatistics_ui.is_show) {
				h1global.curUIMgr.clubstatistics_ui.hide();
			}
			if (h1global.curUIMgr.clubbind_ui && h1global.curUIMgr.clubbind_ui.is_show) {
				h1global.curUIMgr.clubbind_ui.hide();
			}
			if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
				h1global.curUIMgr.club_ui.hide();
			}
		}
	},

	clubEvent_CAR:function (club_id, event_msg) {
		cc.log(club_id, event_msg)
		if (!this.club_entity_dict[club_id]) {
			return;
		}
		let player = h1global.player();
		if(!player){
			return;
		}
		//自己被设置
		var is_me = event_msg.userId ===player.userId;
		var is_ow = this.club_entity_dict[club_id].is_owner(player.userId);
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.reset_club_member(club_id);
			h1global.curUIMgr.clubmember_ui.reset_admin_member(club_id);
		}
		if(!is_ow && !is_me){
			return;
		}
		if (h1global.globalUIMgr.info_ui) {
			if (h1global.globalUIMgr.info_ui.is_show) {
				h1global.globalUIMgr.info_ui.hide()
			}
			h1global.globalUIMgr.info_ui.show_by_info(is_me ? "你不再是"+this.club_entity_dict[club_id].club_name+"的管理员":"成功取消"+event_msg.nickname+"玩家的管理员身份");
		}
		if(is_me){
			if(this.club_entity_dict[club_id].power < const_val.CLUB_POWER_WHITE){
				this.club_entity_dict[club_id].power = const_val.CLUB_POWER_CIVIL;
			}
			if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
				h1global.curUIMgr.clubmember_ui.hide();
			}
			if (h1global.curUIMgr.clubrecord_ui && h1global.curUIMgr.clubrecord_ui.is_show) {
				h1global.curUIMgr.clubrecord_ui.hide();
			}
			if (h1global.curUIMgr.clubmgr_ui && h1global.curUIMgr.clubmgr_ui.is_show) {
				h1global.curUIMgr.clubmgr_ui.hide();
			}
			if (h1global.curUIMgr.showclub_ui && h1global.curUIMgr.showclub_ui.is_show) {
				h1global.curUIMgr.showclub_ui.hide();
			}
			if (h1global.curUIMgr.clubrank_ui && h1global.curUIMgr.clubrank_ui.is_show) {
				h1global.curUIMgr.clubrank_ui.hide();
			}
			if (h1global.curUIMgr.clubmode_ui && h1global.curUIMgr.clubmode_ui.is_show) {
				h1global.curUIMgr.clubmode_ui.hide();
			}
			if (h1global.curUIMgr.clubstatistics_ui && h1global.curUIMgr.clubstatistics_ui.is_show) {
				h1global.curUIMgr.clubstatistics_ui.hide();
			}
			if (h1global.curUIMgr.clubbind_ui && h1global.curUIMgr.clubbind_ui.is_show) {
				h1global.curUIMgr.clubbind_ui.hide();
			}
			if (h1global.curUIMgr.club_ui && h1global.curUIMgr.club_ui.is_show) {
				h1global.curUIMgr.club_ui.hide();
			}
		}
	},

	clubEvent_CBC:function (club_id, event_msg) {
		cc.log(club_id, event_msg)
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.reset_black_member(club_id)
		}
	},

	clubEvent_CBK:function (club_id, event_msg) {
		cc.log(club_id, event_msg)
		if (h1global.curUIMgr.clubmember_ui && h1global.curUIMgr.clubmember_ui.is_show) {
			h1global.curUIMgr.clubmember_ui.reset_black_member(club_id)
		}
	},

});