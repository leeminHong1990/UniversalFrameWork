var RecordSlenderItemUI = cc.Class.extend({

	ctor: function (resourceFileName) {
		this.resourceFileName = resourceFileName;
	},

	setShareBtnClickListener: function (listener) {
		this.shareListener = listener;
	},
	setReplayBtnClickListener: function (listener) {
		this.replayListener = listener;
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

	update: function (rootUINode, itemData, index) {
		// 每次游戏的子局内容
		let long_bg_img = rootUINode.getChildByName("long_bg_img");
		long_bg_img.setVisible((index + 1) % 2 !== 0);

        rootUINode.width = rootUINode.getParent().width;
		ccui.helper.doLayout(rootUINode);

		let num_label = rootUINode.getChildByName("num_label");
		let round_time_label = rootUINode.getChildByName("round_time_label");
		num_label.setString((index + 1).toString());

		let time_text = itemData["time"].split(":", 2);
		for (var i = 0; i < time_text.length; i++) {
			if (time_text[i] < 10) {
				time_text[i] = "0" + time_text[i];
			}
		}
		round_time_label.setString(time_text[0] + ":" + time_text[1]);

		var self = this;
		//回看
		if (self.replayListener) {
			rootUINode.getChildByName("playback_btn").addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					self.replayListener(itemData);
				}
			});
		}

		//分享
		let share_inside_btn = rootUINode.getChildByName("share_btn");
		if (this.shareListener) {
			share_inside_btn.addTouchEventListener(function (sender, eventType) {
				if (eventType === ccui.Widget.TOUCH_ENDED) {
					self.shareListener(itemData);
				}
			});
		}
		if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) && switches.appstore_check == true) {
			share_inside_btn.setVisible(false);
		}

		var dataIter = cutil.simpleIterWithoutNull(itemData['round_record']);
		for (var i = 0; i < itemData['round_record'].length; i++) {
			let score_label = rootUINode.getChildByName("score_label" + i.toString());
			let data = dataIter.next();
			if (!data) {
				score_label.setVisible(false);
				return;
			}
			score_label.setVisible(true);
			let score = data["score"];
			score_label.setString(score > 0 ? "+" + score : score.toString());
			this.update_score_color(score_label, score)
		}
	}

});
