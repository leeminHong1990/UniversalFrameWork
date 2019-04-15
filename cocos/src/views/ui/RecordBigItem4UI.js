// 4人战绩一条item
var RecordBigItem4UI = cc.Class.extend({

	ctor: function (resourceFileName) {
		this.resourceFileName = resourceFileName;
	},

	setDetailsBtnClickListener: function (listener) {
		this.listener = listener;
	},

	update_score_color: function (score_label, score) {
		if (score >= 0) {
			score_label.setColor(cc.color(210, 41, 8));
			// score_label.setOpacity(255);
		} else {
			// score_label.setOpacity(150);
			score_label.setColor(cc.color(65, 140, 35));
		}
	},
	update_base_info: function (parent, round_result, user_info_list, doSubStr) {
		var date_label = parent.getChildByName("date_label");
		var time_label = parent.getChildByName("time_label");
		date_label.setString(round_result[round_result.length - 1]["date"]);
		let time_text = round_result[round_result.length - 1]["time"].split(":", 2);
		for (var i = 0; i < time_text.length; i++) {
			if (time_text[i] < 10) {
				time_text[i] = "0" + time_text[i];
			}
		}
		time_label.setString(time_text[0] + ":" + time_text[1]);

		let dataIter = cutil.simpleIterWithoutNull(user_info_list);
		for (var i = 0; i < user_info_list.length; i++) {
			let player_label = parent.getChildByName("player_label" + i.toString());
			let item = dataIter.next();
			if (item) {
				if (doSubStr) {
					player_label.setString(cutil.info_sub(item["nickname"], 4));
				} else {
                    player_label.setString(cutil.info_sub_ver2(item["nickname"], 4));
				}
				player_label.setVisible(true);
			} else {
				player_label.setVisible(false);
			}
		}
	},

	update: function (rootUINode, data) {
		// 游戏总体信息，时间取第1局开始的时间
		let round_result = data['round_result'];
		let user_info_list = data['user_info_list'];
		let roomid_label = rootUINode.getChildByName("roomid_label");
		roomid_label.setString("No." + data["roomID"].toString());
		let lackrecord_label = rootUINode.getChildByName("lackrecord_label");
		lackrecord_label.setVisible(round_result.length < data["game_round"]);

		var gameType = data['game_type'];
		rootUINode.getChildByName("title_img").loadTexture("res/ui/RecordUI/" + const_val.GameType2GameName[gameType].toLowerCase() + ".png");
        rootUINode.getChildByName("title_img").ignoreContentAdaptWithSize(true);
		this.update_base_info(rootUINode, round_result, user_info_list);

		for (var i = 0; i < user_info_list.length; i++) {
			let score_label = rootUINode.getChildByName("score_label" + i.toString());
			let player_label = rootUINode.getChildByName("player_label" + i.toString());
			if (!round_result[0]["round_record"][i]) {
				player_label.setVisible(false);
				score_label.setVisible(false);
				return;
			}
			player_label.setVisible(true);
			score_label.setVisible(true);
			player_label.setString(user_info_list[i]["nickname"]);
			let total_score = 0;
			for (var j = 0; j < round_result.length; j++) {
				total_score += round_result[j]["round_record"][i]["score"];
			}
			score_label.setString(total_score > 0 ? "+" + total_score : total_score.toString());
			this.update_score_color(score_label, total_score)
		}
		if (this.listener) {
			var self = this;
			rootUINode.getChildByName("checkdetails_btn").addTouchEventListener(function (source, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					self.listener(data);
				}
			});
		}
	}

});
