// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var LL7GameRoomUI = UIBase.extend({
	ctor: function () {
		this._super();
		this.talk_img_num = 0;

		this.containUISnippets = {};
		var self = this;
		// Note: PlayerInfoSnippet按照服务端座位号分布
		for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			let idx = i;
			this.containUISnippets["PlayerInfoSnippet" + i] = new LL7PlayerInfoSnippet(function () {
				let player = h1global.player();
				let index = idx;
				if (player) {
					index = player.server2CurSitNum(index);
				}

				return self.rootUINode.getChildByName("player_info_panel" + index);
			}, i);

		}
		let p = h1global.player();
		if (p) {
			this.containUISnippets["PlayerInfoSnippet" + p.serverSitNum].setCustomUiGetter(function (serverSitNum, name) {
				return self.playerInfoUiGetter(serverSitNum, name);
			});
		}
	},

	playerInfoUiGetter: function (serverSitNum, name) {
		if (name == "player_info_panel") {
			var cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel0").getChildByName("player_info_panel");
			return cur_player_info_panel;
		}
		if (name == "grab_panel") {
			return this.rootUINode.getChildByName("bottom_bar_panel").getChildByName("grab");
		}
		if (name == "grab_score_label") {
			return this.rootUINode.getChildByName("bottom_bar_panel").getChildByName("grab").getChildByName("score");
		}
		if (name == "ready_panel") {
			return this.rootUINode.getChildByName("player_info_panel0").getChildByName(name);
		}
		var cur_player_info_panel = this.rootUINode.getChildByName("player_info_panel0").getChildByName("player_info_panel");
		return cur_player_info_panel.getChildByName(name);
	},

	initUI: function () {
		this.beginAnimPlaying = false;
		this.init_game_panel();
		this.init_curplayer_panel();
		this.init_player_info_panel();
		this.init_player_tile_panel();
		this.init_player_hand_panel();
		this.init_operation_panel();
		this.init_discard_panel();
		this.init_base_card_panel();
		this.init_desk_tile_panel();
		this.init_bottom_panel();
		//闹钟位置
		this.init_game_info_panel();
		//初始化 他家手牌
		this.init_player_wait_panel();
		this.init_grab_panel();
		this.init_giveup_panel();
		this.update_dealer_idx(-1);
		this.update_friend_idx(-1);

		h1global.curUIMgr.gameroominfo_ui.show_by_info(GameRoomInfoUI.ResourceFile2D);

		this.update_roominfo_panel();


		if (!cc.audioEngine.isMusicPlaying()) {
			cc.audioEngine.resumeMusic();
		}

		if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
			h1global.curUIMgr.gameplayerinfo_ui.hide();
		}
		gameroomUIMgr.init_table_idx_panel(this.rootUINode);
	},

	init_game_panel: function () {
	},

	init_curplayer_panel: function () {

	},

	update_wait_time_left: function (leftTime) {
		if (!this.is_show) {
			return;
		}
		leftTime = Math.floor(leftTime);
		var lefttime_label = null;
		var player = h1global.player();
		if (player && player.curGameRoom) {
			// let lordAid = player.curGameRoom.lordAid;
			// if (lordAid === const_ll7.LORD_FIRST || lordAid === const_ll7.LORD_SECOND) {
			lefttime_label = this.rootUINode.getChildByName("operation_wait_panel").getChildByName("wait_img").getChildByName("left_time_label");
			lefttime_label.setString(leftTime);
			lefttime_label.ignoreContentAdaptWithSize(true);
			lefttime_label.setVisible(true);
			// }
		}
		lefttime_label = this.rootUINode.getChildByName("clock_panel").getChildByName("lefttime_label");
		lefttime_label.setString(leftTime);
		lefttime_label.ignoreContentAdaptWithSize(true);
		lefttime_label.setVisible(true);
	},

	init_player_info_panel: function () {
		var player = h1global.player();
		if (!player || !player.curGameRoom) {
			return;
		}
		let playerInfoList = player.curGameRoom.playerInfoList;
		for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			let snippet = this.containUISnippets["PlayerInfoSnippet" + i];
			if (playerInfoList[i]) {
				snippet.update_player_info_panel(playerInfoList[i]);
				snippet.update_player_online_state(playerInfoList[i]["online"]);
				if (player.curGameRoom.room_state === const_val.ROOM_WAITING) {
					snippet.update_ready_state(player.curGameRoom.playerStateList[i]);
				}
				snippet.setVisible(true);
			} else {
				snippet.setVisible(false);
			}
		}
	},


	update_player_info_panel: function (serverSitNum, playerInfo) {
		if (this.is_show) {
			this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_player_info_panel(playerInfo);
		}
	},

	update_all_player_score: function (playerInfoList) {
		if (this.is_show) {
			for (var i = 0; i < playerInfoList.length; i++) {
				if (playerInfoList[i]) {
					this.containUISnippets["PlayerInfoSnippet" + playerInfoList[i]['idx']].update_score(playerInfoList[i]['total_score']);
				}
			}
		}
	},

	/**
	 *
	 * @param state 1 = ready
	 */
	update_player_ready_state: function (serverSitNum, state) {
		if (this.is_show) {
			this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_ready_state(state);
		}
	},

	update_player_online_state: function (serverSitNum, state) {
		if (this.is_show) {
			this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_player_online_state(state);
		}
	},

	init_player_tile_panel: function () {
		this.rootUINode.getChildByName("player_hand_panel0").setVisible(false);
	},

	init_player_hand_panel: function () {
		var self = this;

		this.selectCardUIs = new Array(const_ll7.HAND_CARD_NUM);
		this.allHandCardUI = [];

		function tryCancelSelect(eventType) {
			if (eventType !== ccui.Widget.TOUCH_ENDED) {
				return;
			}
			if (h1global.curUIMgr.gameplayerinfo_ui && h1global.curUIMgr.gameplayerinfo_ui.is_show) {
				h1global.curUIMgr.gameplayerinfo_ui.hide();
			}
			else {
				for (var i = 0; i < self.allHandCardUI.length; i++) {
					self._toggleCard(self.allHandCardUI[i], false);
				}
			}
		}

		function cancelSelects() {
			for (var i = 0; i < self.selectCardUIs.length; i++) {
				let ui = self.selectCardUIs[i];
				if (!ui) {
					break;
				}
				self._toggleCard(ui, false);
			}
			self.selectCardUIs.fill(null);
		}

		let handPanel = this.rootUINode.getChildByName("player_hand_panel0");

		function selectCards(start, end, eventType) {
			start = Math.min(start, const_ll7.HAND_CARD_NUM - 1);
			end = Math.min(end, const_ll7.HAND_CARD_NUM - 1);
			let startUI = handPanel.getChildByName("tile_img_" + start);
			if (!startUI.isVisible()) {
				if (start === end) {
					tryCancelSelect(eventType);
				}
				return;
			}
			for (var i = 0; i < const_ll7.HAND_CARD_NUM; i++) {
				if (self.selectCardUIs[i]) {
					self._toggleCard(self.selectCardUIs[i]);
				} else {
					break;
				}
			}
			self.selectCardUIs.fill(null);
			self.selectCardUIs[0] = startUI;
			self._toggleCard(startUI);
			if (start === end) {
				return;
			}
			for (var i = start + 1; i <= end; i++) {
				let ui = handPanel.getChildByName("tile_img_" + i);
				if (ui.isVisible()) {
					self._toggleCard(ui);
					self.selectCardUIs[i - start] = ui;
				} else {
					return;
				}
			}
		}

		function convertLast(p, width) {
			for (var i = 0; i < const_ll7.HAND_CARD_NUM; i++) {
				let ui = self.allHandCardUI[i];
				if (!ui.isVisible()) {
					let m = Math.max(i - 1, 0) + 1;
					let b = m * (width / self.now_tile_num) + 86 > p.x && m * (width / self.now_tile_num) < p.x;
					return b ? m - 1 : -1;
				}
			}
			return -1;
		}

		function handleSelectEvent(source, eventType) {
			let w = source.width - 99;
			let begin = source.convertToNodeSpace(source.getTouchBeganPosition());
			let startIndex = parseInt(begin.x / w * self.now_tile_num);
			let endIndex = -1;
			let c = convertLast(begin, w);
			if (c !== -1) {
				startIndex = c;
			}
			if (eventType === ccui.Widget.TOUCH_BEGAN) {

				endIndex = startIndex;
			} else if (eventType === ccui.Widget.TOUCH_MOVED) {
				let move = source.convertToNodeSpace(source.getTouchMovePosition());
				let c = convertLast(move, w);
				if (c !== -1) {
					endIndex = c;
				} else {
					endIndex = parseInt(move.x / w * self.now_tile_num);
				}
				if (startIndex > endIndex) {
					startIndex ^= endIndex;
					endIndex ^= startIndex;
					startIndex ^= endIndex;
				}
			} else if (eventType === ccui.Widget.TOUCH_ENDED) {
				let end = source.convertToNodeSpace(source.getTouchEndPosition());
				let c = convertLast(end, w);
				if (c !== -1) {
					endIndex = c;
				} else {
					endIndex = parseInt(end.x / w * self.now_tile_num);
				}
				if (startIndex > endIndex) {
					startIndex ^= endIndex;
					endIndex ^= startIndex;
					startIndex ^= endIndex;
				}
			}

			if (startIndex < 0) {
				return;
			}
			selectCards(startIndex, endIndex, eventType);
		}

		this.rootUINode.getChildByName("player_hand_panel0").addTouchEventListener(/*UICommonWidget.touchEventVisibleCheckListener*/(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_BEGAN) {
				self.selectCardUIs.fill(null);
				handleSelectEvent(source, eventType);
			} else if (eventType === ccui.Widget.TOUCH_MOVED) {
				handleSelectEvent(source, eventType);
			} else if (eventType === ccui.Widget.TOUCH_ENDED) {
				handleSelectEvent(source, eventType);
				self.selectCardUIs.fill(null);
				self.clearTips();
				// self.selectBest(); // Note: has some bug
			} else if (eventType === ccui.Widget.TOUCH_CANCELED) {
				cancelSelects();
				self.clearTips();
			}
		}));
		for (var i = 0; i < const_ll7.HAND_CARD_NUM; i++) {
			let tileImg = handPanel.getChildByName("tile_img_" + i);
			this.allHandCardUI.push(tileImg);
		}
		this.rootUINode.getChildByName("bg_panel").addTouchEventListener(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				tryCancelSelect(eventType);
			}
		})
	},

	init_desk_tile_panel: function () {
		this.hide_player_desk_panel();
	},

	init_base_card_panel: function () {
		this.rootUINode.getChildByName("base_tiles_panel").setVisible(false);
	},

	init_grab_panel: function () {
		let player = h1global.player();
		for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			if (player && player.curGameRoom) {
				if (player.curGameRoom.lordAid !== const_ll7.DISCARD || player.curGameRoom.mainServerSitNum === i || player.curGameRoom.friendServerSitNum === i) {
					this.set_grab_visible(false, i);
				} else {
					this.set_grab_visible(true, i);
					this.containUISnippets["PlayerInfoSnippet" + i].update_grab_score(player.curGameRoom.playerInfoList[i].poker_score, true);
				}
			} else {
				this.set_grab_visible(false, i);
			}
		}
	},

	init_bottom_panel: function () {
		var self = this;
		let panel = this.rootUINode.getChildByName("bottom_bar_panel");
		panel.getChildByName("dipai_btn").addTouchEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_BEGAN) {
				let p = h1global.player();
				if (p && p.curGameRoom) {
					self.show_base_card_panel(true, p.curGameRoom.coverPokers, false);
				}
			} else if (eventType === ccui.Widget.TOUCH_ENDED || eventType === ccui.Widget.TOUCH_CANCELED) {
				self.show_base_card_panel(false);
			}
		}));

		panel.getChildByName("previous_btn").addTouchEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_BEGAN) {
				if (h1global.curUIMgr.ll7previous_ui && !h1global.curUIMgr.ll7previous_ui.is_show) {
					let p = h1global.player();
					if (p && p.curGameRoom) {
						h1global.curUIMgr.ll7previous_ui.show_by_info(p.serverSitNum, p.curGameRoom.lastLoopHistory);
					}
				}
			} else if (eventType === ccui.Widget.TOUCH_ENDED || eventType === ccui.Widget.TOUCH_CANCELED) {
				if (h1global.curUIMgr.ll7previous_ui && h1global.curUIMgr.ll7previous_ui.is_show) {
					h1global.curUIMgr.ll7previous_ui.hide();
				}
			}
		}));
		panel.getChildByName("communicate_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function () {
			let player = h1global.player();
			if(player && player.curGameRoom && player.curGameRoom.is_emotion){
				h1global.globalUIMgr.info_ui.show_by_info("该房间禁止发送表情！");
				return;
			}
			if (h1global.curUIMgr.communicate_ui && !h1global.curUIMgr.communicate_ui.is_show) {
				h1global.curUIMgr.communicate_ui.show();
			}
		}));

		var start_record_time = 0;
		var stop_record_time = 0;

		panel.getChildByName("voice_btn").addTouchEventListener(function (sender, eventType) {
			// return GameRoomInfoUI.prototype.doRecord.call(self, source, eventType);
			if (eventType === ccui.Widget.TOUCH_BEGAN) {
				var intervalTime = ((new Date().getTime()) - stop_record_time) / 1000;
				if (intervalTime < const_val.SEND_PUNISHMENT_TIME) {
					if (!h1global.curUIMgr.gameroominfo_ui) {
						return;
					}
					var tips_label = h1global.curUIMgr.gameroominfo_ui.rootUINode.getChildByName("tips_label");
					if (!tips_label) {
						tips_label = ccui.Text.create("再次录音需间隔" + Math.ceil(const_val.SEND_PUNISHMENT_TIME - intervalTime) + "秒！", "zhunyuan", 30);
						tips_label.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
						tips_label.setName("tips_label");
						self.rootUINode.addChild(tips_label);
					} else {
						tips_label.setString("再次录音需间隔" + Math.ceil(const_val.SEND_PUNISHMENT_TIME - intervalTime) + "秒！");
					}
					tips_label.setVisible(true);
					tips_label.stopAllActions();
					tips_label.runAction(cc.Sequence.create(
						cc.MoveTo.create(0.5, cc.p(tips_label.getPositionX(), tips_label.getPositionY() + 50)),
						cc.CallFunc.create(function () {
							tips_label.setVisible(false);
							tips_label.setPositionY(tips_label.getPositionY() - 50);
						})
					));
					return;
				}
				cc.audioEngine.setMusicVolume(0);
				cc.audioEngine.pauseAllEffects();
				cc.audioEngine.setEffectsVolume(0.001);
				h1global.curUIMgr.audiorecord_ui.show();
				start_record_time = new Date().getTime();
				var fileName = start_record_time.toString() + ".dat";
				var fid = cutil.addFunc(function (fileID) {
					cc.log("finish upload, fileID = " + fileID);
					let p = h1global.player();
					if (p) {
						p.sendAppVoice(fileID, (stop_record_time - start_record_time) > 0 ? (stop_record_time - start_record_time) : 0);
					}
				});
				cutil.start_record(fileName, fid);
			} else if (eventType === ccui.Widget.TOUCH_ENDED || eventType === ccui.Widget.TOUCH_CANCELED) {
				if (((new Date().getTime()) - stop_record_time) / 1000 < 5) {
					return;
				}
				cc.audioEngine.setMusicVolume(cc.sys.localStorage.getItem("MUSIC_VOLUME") * 0.01);
				// cc.audioEngine.resumeAllEffects();
				cc.audioEngine.setEffectsVolume(cc.sys.localStorage.getItem("EFFECT_VOLUME") * 0.01);
				stop_record_time = new Date().getTime();
				h1global.curUIMgr.audiorecord_ui.hide();
				cutil.stop_record();
			}
		});

	},

	lock_player_hand_tiles: function () {
		if (!this.is_show) {
			return;
		}
	},

	unlock_player_hand_tiles: function () {
		if (!this.is_show) {
			return;
		}
	},

	_toggleCard: function (ui, isSelect) {
		if (isSelect === undefined) {
			isSelect = !ui.selectedFlag;
		}
		ui.selectedFlag = isSelect;
		if (isSelect) {
			if (!ui.canSelect) {
				this._toggleCard(ui, false);
				return;
			}
			ui.setColor(const_ll7.COLOR_WHITE);
			if (ui.originY != undefined) {
				ui.y = ui.originY + const_ll7.SELECT_OFFSET;
			} else {
				ui.originY = ui.y;
				ui.y = const_ll7.SELECT_OFFSET;
			}
		} else {
			if (ui.canSelect) {
				ui.setColor(const_ll7.COLOR_WHITE);
			}
			if (ui.originY != undefined) {
				ui.y = ui.originY;
			}

		}
	},

	_setBeginGameShow: function (is_show, myServerSitNum) {
		let serverSitNum = myServerSitNum;
		if (!is_show) {
			// this.hide_operation_panel();
			this.hide_player_desk_panel();
			this.hide_player_hand_tiles(0)
		} else {
			let player = h1global.player();
			if (player && player.curGameRoom) {
				this.update_player_hand_tiles(serverSitNum, player.curGameRoom.handTilesList[serverSitNum]);
				this.update_all_player_desk_tiles();
			} else {
				this.hide_player_desk_panel();
			}
		}
	},

	_removeStartAnimExecutor: function (self) {
		if (self.startAnimExecutor) {
			self.startAnimExecutor.removeFromParent();
			self.startAnimExecutor = null;
		}
	},

	_removeAnimNode: function () {
		if (!this.is_show) {
			return;
		}
		var i = 100;
		while (i > 0) {
			let node = this.rootUINode.getChildByName("deal_anim_node");
			if (node == undefined || node == null) {
				return;
			}
			i--;
			if (cc.sys.isObjectValid(node)) {
				node.removeFromParent();
			}
		}
	},

	startBeginAnim: function (startTilesList, serverSitNum) {
		if (this.startAnimExecutor) {
			cc.error("already Playing start anim");
			return;
		}
		this.rootUINode.getChildByName("player_hand_panel0").setTouchEnabled(false);
		this.beginAnimPlaying = true;
		this.lock_player_hand_tiles();
		this.startAnimExecutor = cc.Node.create();
		this.rootUINode.addChild(this.startAnimExecutor);
		this._setBeginGameShow(false, serverSitNum);

		var self = this;
		var index = 1;

		function updateFunc() {
			let tiles = startTilesList.slice(0, ++index);
			tiles = cutil_ll7.sort(tiles);
			self.update_player_hand_tiles(serverSitNum, tiles);
			let player = h1global.player();
			if (player && player.curGameRoom) {
				self.update_operation_panel(tiles, player.curGameRoom.lordAid, player.curGameRoom.mainPokers);
				// self.update_operation_wait_panel(player.serverSitNum, player.curGameRoom.lordAid, player.curGameRoom.mainPokers, -1);
			}
		}

		updateFunc();

		let step1 = cc.sequence(
			cc.delayTime(0.4), cc.callFunc(updateFunc)
		).repeat(startTilesList.length - 1);
		let step2 = cc.callFunc(function () {
			self.stopBeginAnim();
		});
		this.startAnimExecutor.runAction(cc.sequence(step1, step2));
	},

	stopBeginAnim: function () {
		this._removeStartAnimExecutor(this);
		this._removeAnimNode();
		this.beginAnimPlaying = false;
		let player = h1global.player();
		if (!player || !player.curGameRoom) {
			this.hide_operation_panel();
			return;
		}

		this._setBeginGameShow(true, player.serverSitNum);
		this.unlock_player_hand_tiles();
		this.refreshOperationPanel();
		this.rootUINode.getChildByName("player_hand_panel0").setTouchEnabled(true);
	},

	update_dealer_idx: function (dealerIdx, runAction) {
		if (!this.is_show) {
			return;
		}
		runAction = runAction || false;
		cc.log("dealer: ", dealerIdx);
		for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			this.containUISnippets["PlayerInfoSnippet" + i].update_foreman_idx(i === dealerIdx, runAction);
		}
	},

	update_friend_idx: function (friendIdx, runAction) {
		if (!this.is_show) {
			return;
		}
		runAction = runAction || false;
		cc.log("dealer: ", friendIdx);
		for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			this.containUISnippets["PlayerInfoSnippet" + i].update_friend_idx(i === friendIdx, runAction);
		}
	},

	/**
	 *
	 * @param is_show 是否显示
	 * @param tileList
	 * @param backend true 显示背面   false 显示正面
	 */
	show_base_card_panel: function (is_show, tileList, backend) {
		if (!this.is_show) {
			return;
		}
		let panel = this.rootUINode.getChildByName("base_tiles_panel");
		panel.setVisible(is_show);
		if (!is_show) {
			return;
		}
		for (var i = 0; i < tileList.length; i++) {
			let tile = panel.getChildByName("tile_img_" + i);
			if (backend) {
				tile.loadTexture("Poker/pic_poker_backend.png", ccui.Widget.PLIST_TEXTURE);
			} else {
				tile.loadTexture(cutil_ll7.getCardImgPath(tileList[i]), ccui.Widget.PLIST_TEXTURE);
			}
		}
	},

	hide_player_desk_panel: function (index) {
		if (index >= 0) {
			this.rootUINode.getChildByName("player_desk_panel" + index).setVisible(false);
		} else {
			for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
				let rootPanel = this.rootUINode.getChildByName("player_desk_panel" + i);
				rootPanel.setVisible(false);
			}
		}
	},

	update_player_desk_tiles: function (serverSitNum, tileList, myServerSitNum, curGameRoom) {
		if (!this.is_show) {
			return;
		}
		if (!curGameRoom) {
			return;
		}
		let idx = this.server2CurSitNumOffline(serverSitNum, myServerSitNum);
		let rootPanel = this.rootUINode.getChildByName("player_desk_panel" + idx);
		if (tileList[0] > 0) {
			rootPanel.setVisible(true);
		} else {
			rootPanel.setVisible(false);
			return;
		}
		var mid_pos = parseFloat(const_ll7.HAND_CARD_NUM / 2) - parseFloat(tileList.length / 2);
		if (idx == 0) {
			if (mid_pos < 0) {
				mid_pos = 0;
			}
			//rootPanel.x = cc.director.getWinSize().width * 0.2135;
			rootPanel.x = cc.director.getWinSize().width * 0.5 - 20;
			rootPanel.x -= parseFloat(tileList.length / 2) * 31.2; //31.2是牌的间距

		}

		let maxInCurrent = curGameRoom.controlIdx === serverSitNum;
		var cursorPos = 0;
		var lastIndex = 0;
		for (var i = 0; i < const_ll7.DESK_CARD_NUM; i++) {
			if (idx === 1 || idx === 2) {
				cursorPos = const_ll7.DESK_CARD_NUM - 1 - i;
			} else {
				cursorPos = i;
			}
			var tile = rootPanel.getChildByName("tile_img_" + cursorPos);
			let num = tileList[i];
			if (num > 0) {
				lastIndex = i;
				tile.loadTexture(cutil_ll7.getCardImgPath(num), ccui.Widget.PLIST_TEXTURE);
				tile.setVisible(true);
				tile.getChildByName("mark_star").setVisible(LL7GameRules.prototype.isMain.call(this, num, curGameRoom));
				tile.getChildByName("mark_big").setVisible(false)
			} else {
				tile.setVisible(false);
			}
		}
		if (idx === 1 || idx === 2) {
			lastIndex = const_ll7.DESK_CARD_NUM - 1;
		}
		rootPanel.getChildByName("tile_img_" + lastIndex).getChildByName("mark_big").setVisible(maxInCurrent)
	},

	show_player_desk_tiles_anim: function (serverSitNum, tileList, opId, myServerSitNum, curGameRoom, playAnim) {
		let mainPoker = curGameRoom.mainPokers[0];
		let pattern = cutil_ll7.suit_pattern(tileList, cutil_ll7.get_suit(mainPoker));
		if (pattern === const_ll7.CARDS_SEQ_PAIR_FANG
			|| pattern === const_ll7.CARDS_SEQ_PAIR_MEI
			|| pattern === const_ll7.CARDS_SEQ_PAIR_HONG
			|| pattern === const_ll7.CARDS_SEQ_PAIR_HEI
			|| pattern === const_ll7.CARDS_SEQ_PAIR_LORD) {
			if (playAnim) {
				this.playDa7TeXiao(const_ll7.TLJ, this.rootUINode);
				cc.audioEngine.playEffect("res/sound/effect/tuolaji.mp3");
			}
		}
		let idx = this.server2CurSitNumOffline(serverSitNum, myServerSitNum);
		let panel = this.rootUINode.getChildByName("player_desk_panel" + idx);
		let node = panel.getChildByName("__anim_node__");
		if (node) {
			node.removeFromParent();
		}
		let imgName = null;
		if (opId === const_ll7.POKER_TYPE_SHA) {
			imgName = "shapai";
		} else if (opId === const_ll7.POKER_TYPE_DIANPAI) {
			imgName = "dianpai"
		} else if (opId === const_ll7.POKER_TYPE_DAZHU) {
			imgName = "dazhu"
		} else if (opId === const_ll7.POKER_TYPE_DIAOZHU) {
			imgName = "diaozhu"
		}
		if (imgName) {
			node = this.playDiaozhuAnim(panel, imgName, playAnim);
			node.setName("__anim_node__");
			// node.setPosition(panel.getPosition());
			node.setPositionY(30);
			if (idx == 1 || idx == 2) {
				node.setPositionX(850 - parseFloat(tileList.length / 2) * 40 - 25);
			} else {
				node.setPositionX(parseFloat(tileList.length / 2) * 40 + 25);
			}
			node.setScale(1 / node.getParent().getScale());
		}
	},

	update_all_player_desk_tiles: function () {
		this.hide_player_desk_panel();
		let player = h1global.player();
		if (!player || !player.curGameRoom) {
			this.hide_player_desk_panel();
			return;
		}
		let curGameRoom = player.curGameRoom;
		if (curGameRoom.discardHistory.length > 0) {
			var idx = curGameRoom.startServerSitNum;
			if (idx === -1) {
				this.hide_player_desk_panel();
			} else {
				var controlIdx = -1;
				var tmpHistory = [];
				for (var i = 0; i < curGameRoom.discardHistory.length; i++) {
					let pokers = curGameRoom.discardHistory[idx];
					if (!pokers || pokers.length === 0) {
						this.hide_player_desk_panel(player.server2CurSitNum(idx));
					} else {
						this.update_player_desk_tiles(idx, pokers, player.serverSitNum, curGameRoom);

						let originControl = controlIdx;
						if (controlIdx === -1) {
							controlIdx = idx;
						} else {
							let history = tmpHistory[controlIdx];
							if (player.gameOperationAdapter.compare(history, pokers, cutil_ll7.get_suit(curGameRoom.mainPokers[0]))) {
								controlIdx = idx;
							}
						}
						let discardPokerType = -1;
						if (player.gameOperationAdapter.isDiaozhu(idx, pokers, tmpHistory, originControl, curGameRoom)) {
							discardPokerType = const_ll7.POKER_TYPE_DIAOZHU;
						} else if (player.gameOperationAdapter.isSha(idx, pokers, tmpHistory, originControl, curGameRoom)) {
							discardPokerType = const_ll7.POKER_TYPE_SHA;
						} else if (player.gameOperationAdapter.isDazhu(idx, pokers, tmpHistory, originControl, curGameRoom)) {
							discardPokerType = const_ll7.POKER_TYPE_DAZHU;
						} else if (player.gameOperationAdapter.isDianpai(idx, pokers, tmpHistory, originControl, curGameRoom)) {
							discardPokerType = const_ll7.POKER_TYPE_DIANPAI;
						}
						this.show_player_desk_tiles_anim(idx, pokers, discardPokerType, player.serverSitNum, curGameRoom);
						tmpHistory[idx] = pokers;
					}
					idx = ++idx % curGameRoom.player_num;
				}
			}
		} else {
			this.hide_player_desk_panel();
		}
	},

	hide_player_hand_tiles: function (serverSitNum) {
		if (!this.is_show) {
			return;
		}
		// let player = h1global.player();
		// if (!player || !player.curGameRoom) {
		// 	return;
		// }
		// let idx = player.server2CurSitNum(serverSitNum);
		let rootPanel = this.rootUINode.getChildByName("player_hand_panel0");
		rootPanel.setVisible(false);
	},

	/**
	 *
	 * @param serverSitNum
	 * @param tileList
	 * @param limit 是否限制出牌
	 */
	update_player_hand_tiles: function (serverSitNum, tileList, limit) {
		if (!this.is_show) {
			return;
		}
		let player = h1global.player();
		if (!player) {
			return;
		}
		let index = player.server2CurSitNum(serverSitNum);
		if (index > 0) {
			if (player.curGameRoom.lordAid === const_ll7.DISCARD) {
				let panel = this.rootUINode.getChildByName("player_info_panel" + index).getChildByName("player_wait_panel");
				panel.setVisible(true);
				let label = panel.getChildByName("wait_time_label");
				label.setString(tileList.length);
			}
			return;
		}
		let cur_player_tile_panel = this.rootUINode.getChildByName("player_hand_panel" + index);
		if (!cur_player_tile_panel) {
			return;
		}

		cur_player_tile_panel.setVisible(true);
		let canDiscardPokers = null;
		if (limit) {
			canDiscardPokers = player.gameOperationAdapter.canDiscardPoker(tileList);
		}
		for (var i = 0; i < const_ll7.HAND_CARD_NUM; i++) {
			let tile = cur_player_tile_panel.getChildByName('tile_img_' + i);
			let num = tileList[i];
			this._toggleCard(tile, false);
			if (num > 0) {
				if (tile.card !== num) {
					tile.card = num;
					tile.loadTexture(cutil_ll7.getCardImgPath(num), ccui.Widget.PLIST_TEXTURE);
				}
				tile.setVisible(true);
				tile.getChildByName("star").setVisible(player.gameOperationAdapter.isMain(num));
				if (!limit || canDiscardPokers.indexOf(num) !== -1) {
					tile.setColor(const_ll7.COLOR_WHITE);
					tile.canSelect = true;
				} else {
					tile.canSelect = false;
					tile.setColor(const_ll7.COLOR_GREY);
				}
			} else {
				tile.card = null;
				tile.setVisible(false);
			}
		}
		//更新宽度
		this.now_tile_num = tileList.length;
		if (this.now_tile_num < 17) {
			this.now_tile_num = 17;
		}

		var tile_list = cur_player_tile_panel.getChildren();
		let pos = 0;
		var winSize = cc.director.getWinSize();
		cur_player_tile_panel.width = winSize.width - 10;
		let tileX = (winSize.width - 99) / this.now_tile_num;

		for (var i = 0; i < tile_list.length; i++) {
			tile_list[i].setPositionX(pos);
			pos += tileX;
		}
		//更新起始位置
		var mid_pos = parseFloat(this.now_tile_num / 2) - parseFloat(tileList.length / 2);
		cur_player_tile_panel.x = cc.winSize.width * 0.5 - cur_player_tile_panel.width * 0.5;
		cur_player_tile_panel.x += mid_pos * tileX;
	},

	init_player_wait_panel: function () {
		let player = h1global.player();
		for (var i = 1; i < 5; i++) {
			let panel = this.rootUINode.getChildByName("player_info_panel" + i).getChildByName("player_wait_panel");
			panel.setVisible(false);
			if (player && player.curGameRoom) {
				if (player.curGameRoom.lordAid === const_ll7.AID_NONE && player.curGameRoom.state === const_val.ROOM_PLAYING) {
					panel.setVisible(true);
				}
			}
		}
	},

	updateTip: function () {
		if (!this.tipIter) {
			let player = h1global.player();
			if (!player) {
				return;
			}
			this.tipIter = {};
			this.tipIter.index = 0;
			let tips = player.gameOperationAdapter.tips();
			this.tipIter.next = function () {
				let data = tips[this.index++];
				if (data) {
					return data;
				}
				this.index = 0;
				return tips[this.index++];
			}
		}
		let next = null;
		if ((next = this.tipIter.next())) {
			next = next.slice(0);
			let flag = false;
			let index = 0;
			for (var i = 0; i < this.allHandCardUI.length; i++) {
				flag = false;
				let ui = this.allHandCardUI[i];
				if (next.length > 0) {
					let card = ui.card;
					for (var j = 0; j < next.length; j++) {
						if (card === next[j]) {
							flag = true;
							next.splice(j, 1);
							break;
						}
					}
				}
				this._toggleCard(ui, flag);
			}
		} else {
			cc.log("no tip")
		}
	},

	clearTips: function () {
		this.tipIter = null;
	},

	init_operation_panel: function () {
		var self = this;

		function doPass() {

			let player = h1global.player();
			if (!(player && player.curGameRoom)) {
				return;
			}
			var curGameRoom = player.curGameRoom;
			var lordAid = curGameRoom.lordAid;
			player.doOperation(lordAid, []);
			if (!cc.sys.isObjectValid(self.rootUINode)) {
				return;
			}
			self.rootUINode.getChildByName("operation_panel").setVisible(false);
		}

		var operation_panel = this.rootUINode.getChildByName("operation_panel");

		// operation_panel.getChildByName("pass_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(doPass));
		operation_panel.getChildByName("hei_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(this._doConfirmOperation(const_ll7.HEI_SUIT)));
		operation_panel.getChildByName("hong_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(this._doConfirmOperation(const_ll7.HONG_SUIT)));
		operation_panel.getChildByName("fang_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(this._doConfirmOperation(const_ll7.FANG_SUIT)));
		operation_panel.getChildByName("mei_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(this._doConfirmOperation(const_ll7.MEI_SUIT)));
	},

	_doConfirmOperation: function (type) {
		var self = this;
		return function () {
			var player = h1global.player();
			if (!(player && player.curGameRoom)) {
				return;
			}
			var curGameRoom = player.curGameRoom;
			var state = curGameRoom.lordAid;
			if (state === const_ll7.LORD_FIRST) {
				player.doOperation(const_ll7.LORD_FIRST, [cutil_ll7.to_card(type, 7)]);
			} else if (state === const_ll7.LORD_SECOND) {
				if (curGameRoom.mainPokers.length === 0) {
					player.doOperation(const_ll7.LORD_SECOND, [cutil_ll7.to_card(type, 7)]);
				} else {
					player.doOperation(const_ll7.LORD_SECOND, [cutil_ll7.to_card(type, 7), cutil_ll7.to_card(type, 7)]);
				}
			} else if (state === const_ll7.LORD_THIRD) {
				player.doOperation(const_ll7.LORD_THIRD, [cutil_ll7.to_card(type, 7), cutil_ll7.to_card(type, 7)]);
			}
			if (!cc.sys.isObjectValid(self.rootUINode)) {
				return;
			}
			self.rootUINode.getChildByName("operation_panel").setVisible(false);
		}
	},

	init_discard_panel: function () {
		var self = this;
		let panel = this.rootUINode.getChildByName("discard_panel");
		panel.getChildByName("help_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function () {
			self.updateTip();
		}));
		panel.getChildByName("discard_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function () {
			let selectCards = [];
			for (var i = 0; i < self.allHandCardUI.length; i++) {
				let ui = self.allHandCardUI[i];
				if (ui.selectedFlag) {
					selectCards.push(ui.card)
				}
			}
			if (selectCards.length === 0) {
				UICommonWidget.playInfoMsg(self.rootUINode, "res/ui/GameRoom2DUI/show_information.png", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.58), 1);
				return;
			}
			let player = h1global.player();
			if (player) {
				if (player.gameOperationAdapter.canDiscard(selectCards)) {
					if (cc.sys.isObjectValid(panel)) {
						panel.setVisible(false);
					}
					player.doOperation(const_ll7.DISCARD, selectCards);
				} else {
					UICommonWidget.playInfoMsg(self.rootUINode, "res/ui/GameRoom2DUI/show_information.png", cc.p(cc.winSize.width / 2, cc.winSize.height * 0.58), 1);
				}
			}
		}));
	},

	show_discard_panel: function () {
		this.clearTips();
		if (!this.is_show) {
			return;
		}
		let panel = this.rootUINode.getChildByName("discard_panel");
		panel.setVisible(true);
	},

	playOperationFunc: function (curSitNum, opId) {

	},

	playOperationEffect: function (opId, serverSitNum, tiles) {
		if (opId === const_ll7.POPAI) {
			this.playDa7TeXiao(opId);
			cc.audioEngine.playEffect("res/sound/effect/popai.mp3");
		} else if (opId === const_ll7.JIAOZHU) {
			this.playDa7TeXiao(opId, undefined, {pos: cc.p(0, 0)});
		}
	},

	playEmotionAnim: function (serverSitNum, eid) {
		var showSitNum = h1global.player().server2CurSitNum(serverSitNum);
		if (showSitNum == 0) {
			emotion.playEmotion(this.rootUINode, eid, serverSitNum, cc.p(0.32, 0.6));
		} else {
			emotion.playEmotion(this.rootUINode, eid, serverSitNum);
		}
	},

	getMessagePos: function (playerInfoPanel, idx) {
		var pos = playerInfoPanel.getPosition();
		if (idx === 0) {
			pos = cc.p(pos.x + 100, pos.y + 100);
		} else if (idx === 1) {
			pos = cc.p(pos.x - playerInfoPanel.width * 0.4 - 50, pos.y);
		} else if (idx === 2) {
			pos = cc.p(pos.x - 50 - 50, pos.y);
		} else if (idx === 3) {
			pos = cc.p(pos.x + 50 + 50, pos.y - 5);
		} else if (idx === 4) {
			pos = cc.p(pos.x + 58 + 50, pos.y);
		} else if (idx === 5) {
			pos = cc.p(pos.x + playerInfoPanel.width * 0.4, pos.y + playerInfoPanel.height * 0.4);
		}
		return pos;
	},

	playMessageAnim: function (serverSitNum, msg) {
		if (!msg || msg == "") {
			return;
		}
		var idx = h1global.player().server2CurSitNum(serverSitNum);
		var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + idx);
		var talk_img = ccui.ImageView.create();
		var talk_angle_img = ccui.ImageView.create();
		talk_img.setAnchorPoint(0, 0.5);
		talk_img.setPosition(this.getMessagePos(player_info_panel, idx));
		talk_img.loadTexture("res/ui/Default/talk_frame.png");
		talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
		talk_img.addChild(talk_angle_img);
		this.rootUINode.addChild(talk_img);

		var msg_label = cc.LabelTTF.create("", "Arial", 22);
		msg_label.setString(msg);
		msg_label.setDimensions(msg_label.getString().length * 26, 0);
		msg_label.setColor(cc.color(20, 85, 80));
		msg_label.setAnchorPoint(cc.p(0.5, 0.5));
		talk_img.addChild(msg_label);
		talk_img.setScale9Enabled(true);
		talk_img.setContentSize(cc.size(msg_label.getString().length * 23 + 20, talk_img.getContentSize().height));
		talk_angle_img.setPosition(3, talk_img.getContentSize().height * 0.5);

		msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.50 + 13, 23));
		if (idx == 1 || idx == 2) {
			talk_img.setScaleX(-1);
			msg_label.setScaleX(-1);
			msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.37 + 10, 23));
		}
		msg_label.runAction(cc.Sequence.create(cc.DelayTime.create(2.0), cc.CallFunc.create(function () {
			talk_img.removeFromParent();
		})));
	},

	getExpressionPos: function (player_info_panel, idx) {
		// 魔法表情
		var pos = player_info_panel.getPosition();
		if (idx === 0) {
			pos = cc.p(pos.x + 50, pos.y + 100);
		} else if (idx === 1) {
			pos = cc.p(pos.x - player_info_panel.width * 0.4, pos.y);
		} else if (idx === 2) {
			pos = cc.p(pos.x - 50, pos.y);
		} else if (idx === 3) {
			pos = cc.p(pos.x + 50, pos.y - 5);
		} else if (idx === 4) {
			pos = cc.p(pos.x + 58, pos.y);
		} else if (idx === 5) {
			pos = cc.p(pos.x + player_info_panel.width * 0.4, pos.y + player_info_panel.height * 0.4);
		}
		return pos;
	},

	playExpressionAnim: function (fromIdx, toIdx, eid) {
		var self = this;
		if (eid === 3) {	//因为扔钱动画不是plist，所以单独处理
			self.playMoneyAnim(fromIdx, toIdx);
			return;
		}
		var rotate = 0;
		var moveTime = 0.7;
		var flag = (fromIdx % 3 == 0 && toIdx % 3 == 0) || (fromIdx % 3 != 0 && toIdx % 3 != 0);
		if (flag) {
			moveTime = 0.3;
		}
		var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + fromIdx.toString());
		var expression_img = ccui.ImageView.create();
		expression_img.setPosition(this.getExpressionPos(player_info_panel, fromIdx));
		expression_img.loadTexture("res/ui/PlayerInfoUI/expression_" + const_val.EXPRESSION_ANIM_LIST[eid] + ".png");
		this.rootUINode.addChild(expression_img);
		// if(eid > 1){
		//    rotate = 1440;
		//    rotate = rotate + (moveTime - 0.7) * 1800;
		// }
		expression_img.runAction(cc.Spawn.create(cc.RotateTo.create(0.2 + moveTime, rotate), cc.Sequence.create(
			cc.ScaleTo.create(0.1, 1.5),
			cc.ScaleTo.create(0.1, 1),
			cc.MoveTo.create(moveTime, self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx)),
			cc.CallFunc.create(function () {
				expression_img.removeFromParent();
				cc.audioEngine.playEffect("res/sound/effect/" + const_val.EXPRESSION_ANIM_LIST[eid] + ".mp3");
				self.playExpressionAction(toIdx, self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx), eid);
			})
		)));
	},

	playMoneyAnim: function (fromIdx, toIdx) {
		var self = this;
		var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + fromIdx.toString());

		var money_img_list = [];
		var baodian_img_list = [];
		for (var j = 0; j < 10; j++) {
			//var money_img  = new cc.Sprite("res/ui/PlayerInfoUI/dzpk_dj_icon_ani.png");
			var money_img = new cc.Sprite("res/ui/PlayerInfoUI/expression_money.png");
			var baodian_img = new cc.Sprite("res/ui/PlayerInfoUI/baodian.png");
			money_img.setPosition(this.getExpressionPos(player_info_panel, fromIdx));

			baodian_img.setVisible(false);
			//baodian_img.setLocalZOrder(-1);
			money_img.setLocalZOrder(1);

			this.rootUINode.addChild(money_img);
			this.rootUINode.addChild(baodian_img);
			money_img_list.push(money_img);
			baodian_img_list.push(baodian_img);
		}
		var pos = self.getExpressionPos(self.rootUINode.getChildByName("player_info_panel" + toIdx.toString()), toIdx);
		for (var i = 0; i < 10; i++) {
			var random_pos = cc.p(Math.random() * 60 - 30, Math.random() * 60 - 30);
			(function (i) {
				money_img_list[i].runAction(cc.sequence(
					cc.delayTime(i * 0.1),
					// cc.spawn(cc.rotateBy(0.2,360),cc.moveBy(0.2, pos.x + random_pos.x-70, pos.y + random_pos.y-200)),
					cc.spawn(cc.rotateBy(0.2, 360), cc.moveTo(0.2, pos.x, pos.y + random_pos.y)),
					cc.callFunc(function () {
						//cc.spawn(cc.rotateBy(0.2,360),cc.moveBy(0.2, pos.x + random_pos.x-70, pos.y + random_pos.y-200));
						cc.audioEngine.playEffect("res/sound/effect/com_facesound_3.mp3");
						money_img_list[i].setScale(1.2);
						baodian_img_list[i].setPosition(pos.x + i, pos.y + 30 + i);
						baodian_img_list[i].runAction(cc.rotateTo(0.1, 45));
						baodian_img_list[i].setVisible(true);
					}),
					//cc.moveTo(0.1,pos.x+i, pos.y+30+i),
					cc.moveBy(0.1, 5, 3),
					//cc.moveBy(0.1,-2,0),
					cc.callFunc(function () {
						money_img_list[i].setScale(1);
						baodian_img_list[i].setVisible(false);
					}),
					// cc.moveBy(0.2,(i%2>0 ? (9-i)*4 : -(9-i)*4)+Math.random()*5-10,		-26 + i*2	),
					// cc.rotateTo(0.2,40-Math.random()*40),
					cc.spawn(cc.rotateTo(0.2, Math.random() * 40 - Math.random() * 40), cc.moveBy(0.2, (i % 2 > 0 ? (9 - i) * 4 : -(9 - i) * 4) + Math.random() * 5 - 10, -26 + i * 2)),
					//cc.moveBy(0.1,0,-4),
					//cc.rotateTo(0.2,0),
					//cc.delayTime(2),
					cc.delayTime((9 - i) * 0.1),
					cc.callFunc(function () {
						money_img_list[i].removeFromParent(true);
						baodian_img_list[i].removeFromParent(true);
					})
				));
			})(i)
		}
	},

	playExpressionAction: function (idx, pos, eid) {
		if (idx < 0 || idx > 4) {
			return;
		}
		var self = this;
		UICommonWidget.load_effect_plist("expression");
		var expression_sprite = cc.Sprite.create();
		// var ptime = 2;
		// if(eid == 3){
		//    expression_sprite.setScale(2);
		// }
		expression_sprite.setPosition(pos);
		self.rootUINode.addChild(expression_sprite);
		expression_sprite.runAction(cc.Sequence.create(
			UICommonWidget.create_effect_action({
				"FRAMENUM": const_val.EXPRESSION_ANIMNUM_LIST[eid],
				"TIME": const_val.EXPRESSION_ANIMNUM_LIST[eid] / 16,
				"NAME": "Expression/" + const_val.EXPRESSION_ANIM_LIST[eid] + "_"
			}),
			cc.DelayTime.create(0.5),
			cc.CallFunc.create(function () {
				expression_sprite.removeFromParent();
			})
		));

	},

	playVoiceAnim: function (serverSitNum, record_time) {
		var self = this;
		if (cc.audioEngine.isMusicPlaying()) {
			cc.audioEngine.pauseMusic();
			cc.audioEngine.pauseAllEffects();
			cc.audioEngine.setEffectsVolume(0);
		}
		var idx = h1global.entityManager.player().server2CurSitNum(serverSitNum);
		var interval_time = 0.8;
		this.talk_img_num += 1;
		// var player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
		var player_info_panel = undefined;
		if (serverSitNum < 0) {
			player_info_panel = this.rootUINode.getChildByName("agent_info_panel");
		} else {
			player_info_panel = this.rootUINode.getChildByName("player_info_panel" + h1global.entityManager.player().server2CurSitNum(serverSitNum));
		}
		var talk_img = ccui.ImageView.create();
		talk_img.setPosition(this.getMessagePos(player_info_panel, idx));
		talk_img.loadTexture("res/ui/Default/talk_frame.png");
		talk_img.setScale9Enabled(true);
		talk_img.setContentSize(cc.size(100, talk_img.getContentSize().height));
		this.rootUINode.addChild(talk_img);
		var talk_angle_img = ccui.ImageView.create();
		talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
		talk_img.addChild(talk_angle_img);

		var voice_img1 = ccui.ImageView.create();
		voice_img1.loadTexture("res/ui/Default/voice_img1.png");
		voice_img1.setPosition(cc.p(50, 23));
		talk_img.addChild(voice_img1);
		var voice_img2 = ccui.ImageView.create();
		voice_img2.loadTexture("res/ui/Default/voice_img2.png");
		voice_img2.setPosition(cc.p(50, 23));
		voice_img2.setVisible(false);
		talk_img.addChild(voice_img2);
		voice_img2.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time), cc.CallFunc.create(function () {
			voice_img1.setVisible(false);
			voice_img2.setVisible(true);
			voice_img3.setVisible(false);
		}), cc.DelayTime.create(interval_time * 2), cc.CallFunc.create(function () {
			voice_img2.setVisible(false)
		}))));
		var voice_img3 = ccui.ImageView.create();
		voice_img3.loadTexture("res/ui/Default/voice_img3.png");
		voice_img3.setPosition(cc.p(50, 23));
		voice_img3.setVisible(false);
		talk_img.addChild(voice_img3);
		voice_img3.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time * 2), cc.CallFunc.create(function () {
			voice_img1.setVisible(false);
			voice_img2.setVisible(false);
			voice_img3.setVisible(true);
		}), cc.DelayTime.create(interval_time), cc.CallFunc.create(function () {
			voice_img3.setVisible(false);
			voice_img1.setVisible(true);
		}))));
		talk_angle_img.setPosition(3, talk_img.getContentSize().height * 0.5);
		// if (idx > 0 && idx < 2) {
		// 	talk_img.setScale(-1);
		// 	talk_img.setPositionX(talk_img.getPositionX() - 40);
		// } else {
		// 	talk_img.setPositionX(talk_img.getPositionX() + 40);
		// 	talk_angle_img.setLocalZOrder(3);
		// }
		if (idx == 1 || idx == 2) {
			talk_img.setScale(-1);
			talk_img.setPositionX(talk_img.getPositionX() - 40);
		} else {
			talk_img.setPositionX(talk_img.getPositionX() + 40);
			talk_angle_img.setLocalZOrder(3);
		}
		talk_img.runAction(cc.Sequence.create(cc.DelayTime.create(record_time), cc.CallFunc.create(function () {
			talk_img.removeFromParent();
			self.talk_img_num -= 1;
			if (self.talk_img_num === 0) {
				if (!cc.audioEngine.isMusicPlaying()) {
					cc.audioEngine.resumeMusic();
					cc.audioEngine.resumeAllEffects();
					cc.audioEngine.setEffectsVolume(cc.sys.localStorage.getItem("EFFECT_VOLUME") * 0.01);
				}
			}
		})));
		// return talk_img;
	},

	play_result_anim: function (callback, player_info_list, scoreList, curGameRoom, myServerSitNum) {
		this.rootUINode.runAction(cc.sequence(
			cc.delayTime(0.5),
			cc.callFunc(function () {
				callback();
			})))
	},

	update_roominfo_panel: function () {
		if (!this.is_show) {
			return;
		}
		let player = h1global.player();
		if (player && player.curGameRoom) {
			this.rootUINode.getChildByName("game_info_panel").getChildByName("room_id_label").setString("房号：" + player.curGameRoom.roomID);
			this.rootUINode.getChildByName("game_info_panel").getChildByName("round_label").setString("局数:   " + player.curGameRoom.curRound + "/" + player.curGameRoom.game_round);
		}
	},

	init_game_info_panel: function () {
		var player = h1global.player();
		if (!player || !player.curGameRoom) {
			return;
		}
		this.rootUINode.getChildByName("game_info_panel").getChildByName("bg_img").getChildByName("base_score_label").setString(player.curGameRoom.mul_level);
		this.set_clock_pos(player.curGameRoom.curPlayerSitNum);
		this.rootUINode.getChildByName("game_info_panel").setVisible(true);
		this.update_total_score_panel(player.curGameRoom.sumPokerScore);
	},

	set_clock_pos: function (serverSitNum) {
		// cc.error("set_clock_pos", serverSitNum);
		let panel = this.rootUINode.getChildByName("clock_panel");
		let player = h1global.player();
		if (!player || !player.curGameRoom) {
			panel.setVisible(false);
			return;
		}
		if (serverSitNum === -1) {
			panel.setVisible(false);
			return;
		}
		let index = player.server2CurSitNum(serverSitNum);
		if (player.curGameRoom.lordAid === const_ll7.LORD_FIRST) {
			panel.setVisible(false);
			return;
		}

		if (player.curGameRoom.waitAid === const_ll7.SURRENDER_FIRST && player.curGameRoom.waitIdx === player.serverSitNum) {
			panel.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
			panel.setVisible(true);
			return;
		}

		if (index === 0) {
			if (player.curGameRoom.lordAid !== const_ll7.DISCARD) {
				panel.setVisible(false);
				return;
			}
			panel.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
		} else if (index === 1) {
			panel.setPosition(cc.winSize.width * 0.83, cc.winSize.height * 0.56);
		} else if (index === 2) {
			panel.setPosition(cc.winSize.width * 0.83, cc.winSize.height * 0.756);
		} else if (index === 3) {
			panel.setPosition(cc.winSize.width * 0.179, cc.winSize.height * 0.756);
		} else if (index === 4) {
			panel.setPosition(cc.winSize.width * 0.179, cc.winSize.height * 0.56);
		}
		panel.setVisible(true);
	},

	update_main_panel: function (pokers) {
		if (!this.is_show) {
			return false;
		}

		var root = this.rootUINode.getChildByName("bottom_bar_panel").getChildByName("main").getChildByName("cards");
		var card0 = root.getChildByName("card0");
		var card1 = root.getChildByName("card1");
		root.setVisible(true);
		if (pokers.length === 0) {
			root.setVisible(false);
			return;
		}
		if (pokers.length < 2) {
			card0.loadTexture(cutil_ll7.getSmall7Path(pokers[0]), ccui.Widget.PLIST_TEXTURE);
			card0.setVisible(true);
			card1.setVisible(false);
		} else {
			card0.loadTexture(cutil_ll7.getSmall7Path(pokers[0]), ccui.Widget.PLIST_TEXTURE);
			card1.loadTexture(cutil_ll7.getSmall7Path(pokers[1]), ccui.Widget.PLIST_TEXTURE);
			card0.setVisible(true);
			card1.setVisible(true);
		}
	},

	update_operation_panel: function (tileList, state, mainPokers) {
		// cc.error("update_operation_panel", this.beginAnimPlaying, tileList, state);
		if (!this.is_show) {
			return;
		}
		var types = [0, 1, 2, 3];
		var counts = [0, 0, 0, 0];
		var count7s = [0, 0, 0, 0];
		for (var i = 0; i < tileList.length; i++) {
			let poker = tileList[i];
			if (const_ll7.JOKERS.indexOf(poker) !== -1) {
				continue;
			}
			let suit = cutil_ll7.get_suit(poker);
			let num = cutil_ll7.get_rank(poker);
			let index = types.indexOf(suit);
			counts[index]++;
			if (num === 7) {
				count7s[index]++;
			}
		}

		function updateBtn(btn, count, enable) {
			btn.setBright(enable);
			btn.setTouchEnabled(enable);
			btn.getChildByName("number").setString(count);
			if (!enable) {
				btn.getChildByName("number").color = cc.color(102, 102, 102);
			} else {
				btn.getChildByName("number").color = cc.color(255, 255, 255);
			}
		}

		var btns = ["fang", "mei", "hong", "hei"];
		var panel = this.rootUINode.getChildByName("operation_panel");

		if (state === const_ll7.LORD_FIRST || state === const_ll7.LORD_SECOND) {
			if (mainPokers.length === 0) {
				for (var i = 0; i < btns.length; i++) {
					var btn = panel.getChildByName(btns[i] + "_btn");
					updateBtn(btn, counts[i], count7s[i] > 0)
				}
			} else {
				for (var i = 0; i < btns.length; i++) {
					var btn = panel.getChildByName(btns[i] + "_btn");
					updateBtn(btn, counts[i], count7s[i] > 1)
				}
			}
			panel.getChildByName("bg").getChildByName("op_jiaozhu_img").setVisible(mainPokers.length === 0);
			panel.getChildByName("bg").getChildByName("op_fanzhu_img").setVisible(mainPokers.length !== 0);
			// if (mainPokers.length === 0) {
			// 	panel.getChildByName("pass_btn").loadTextureNormal("LL7GameRoomUI/pass_normal.png", ccui.Widget.PLIST_TEXTURE);
			// 	panel.getChildByName("pass_btn").loadTexturePressed("LL7GameRoomUI/pass_disabled.png", ccui.Widget.PLIST_TEXTURE);
			// 	panel.getChildByName("pass_btn").loadTextureDisabled("LL7GameRoomUI/pass_disabled.png", ccui.Widget.PLIST_TEXTURE);
			// } else {
			// 	panel.getChildByName("pass_btn").loadTextureNormal("LL7GameRoomUI/pass2_normal.png", ccui.Widget.PLIST_TEXTURE);
			// 	panel.getChildByName("pass_btn").loadTexturePressed("LL7GameRoomUI/pass2_disabled.png", ccui.Widget.PLIST_TEXTURE);
			// 	panel.getChildByName("pass_btn").loadTextureDisabled("LL7GameRoomUI/pass2_disabled.png", ccui.Widget.PLIST_TEXTURE);
			// }

		} else if (state === const_ll7.LORD_THIRD) {
			for (var i = 0; i < btns.length; i++) {
				var btn = panel.getChildByName(btns[i] + "_btn");
				updateBtn(btn, counts[i], count7s[i] > 1)
			}
			panel.getChildByName("bg").getChildByName("op_jiaozhu_img").setVisible(false);
			panel.getChildByName("bg").getChildByName("op_fanzhu_img").setVisible(true);
			// panel.getChildByName("pass_btn").loadTextureNormal("LL7GameRoomUI/pass2_normal.png", ccui.Widget.PLIST_TEXTURE);
			// panel.getChildByName("pass_btn").loadTexturePressed("LL7GameRoomUI/pass2_disabled.png", ccui.Widget.PLIST_TEXTURE);
			// panel.getChildByName("pass_btn").loadTextureDisabled("LL7GameRoomUI/pass2_disabled.png", ccui.Widget.PLIST_TEXTURE);
		}
		// this.play_jiaozhu_anime(state);
	},


	show_operation_panel: function () {
		if (!this.is_show) {
			return;
		}
		let operation_panel = this.rootUINode.getChildByName("operation_panel");
		operation_panel.setVisible(true);
	},

	hide_operation_panel: function () {
		if (!this.is_show) {
			return;
		}
		this.rootUINode.getChildByName("operation_panel").setVisible(false);
	},

	reset: function () {
		this.clearTips();
		if (!this.is_show) {
			return;
		}
		for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			this.rootUINode.getChildByName("player_desk_panel" + i).setVisible(false);

			let handPanel = this.rootUINode.getChildByName("player_hand_panel0");
			if (i === 0) {
				for (var j = 0; j < const_ll7.HAND_CARD_NUM; j++) {
					let tileImg = handPanel.getChildByName("tile_img_" + j);
					tileImg.selectedFlag = false;
					UICommonWidget.resetToOriginPosition(tileImg);
				}
			}
		}
		this.hide_player_hand_tiles();
		this.hide_operation_panel();
		this.hide_player_desk_panel();
		//闹钟位置
		this.init_game_info_panel();
		//初始化 他家手牌
		this.init_player_wait_panel();
		this.hide_operation_wait_panel();
		let player = h1global.player();
		if (player && player.curGameRoom) {
			this.update_all_player_score(player.curGameRoom.playerInfoList);
			this.update_bottom_panel();
		}
	},

	redeal: function (curGameRoom) {
		for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			let handTilesList = curGameRoom.handTilesList[i];
			this.update_player_hand_tiles(i, handTilesList);
		}
		this.init_operation_panel();
		if (curGameRoom.dealerIdx === -1) {
			this.update_dealer_operation_panel();
		}
	},

	refreshOperationPanel: function () {
		let player = h1global.player();
		if (!player || !player.curGameRoom) {
			return;
		}
		let curGameRoom = player.curGameRoom;
		let lordAid = curGameRoom.lordAid;
		let mainPokers = curGameRoom.mainPokers;
		let serverSitNum = player.serverSitNum;
		let playerOperationList = curGameRoom.playerOperationList;

		var self = this;

		function updateFunc(lordAid) {
			if (playerOperationList[serverSitNum] === 0) {
				if (lordAid === const_ll7.LORD_FIRST || (curGameRoom.mainPokers.length === 0 && curGameRoom.get7MaxCount(serverSitNum) > 0) || (curGameRoom.mainPokers.length > 0 && curGameRoom.get7MaxCount(serverSitNum) === 2)) {
					self.show_operation_panel();
					if (self.beginAnimPlaying) {
						self.update_operation_panel([], lordAid, mainPokers)
					} else {
						self.update_operation_panel(curGameRoom.handTilesList[serverSitNum], lordAid, mainPokers);
						self.update_operation_wait_panel(serverSitNum, lordAid, undefined, curGameRoom.curPlayerSitNum);
					}
				} else {
					self.hide_operation_panel();
					self.update_operation_wait_panel(serverSitNum, lordAid, [], curGameRoom.curPlayerSitNum);
				}
			} else {
				self.update_operation_wait_panel(serverSitNum, lordAid, [], curGameRoom.curPlayerSitNum);
				self.hide_operation_panel();
			}
			// for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			// 	if (playerOperationList[i] === 1) {
			// 		self.update_operation_wait_panel(i, lordAid, [], curGameRoom.curPlayerSitNum);
			// 	}
			// }
		}

		if (lordAid === const_ll7.LORD_THIRD) {
			cc.log("LORD_THIRD");
			updateFunc(lordAid);
		} else if (lordAid === const_ll7.LORD_SECOND) {
			cc.log("LORD_SECOND");
			updateFunc(lordAid);
		} else if (lordAid === const_ll7.LORD_FIRST) {
			cc.log("LORD_FIRST");
			updateFunc(lordAid);
		} else if (lordAid === const_ll7.DRAW_COVER) {
			cc.log("DRAW_COVER");
			if (curGameRoom.lordIdx === serverSitNum) {
			} else {
				this.update_operation_wait_panel(curGameRoom.lordIdx, const_ll7.DRAW_COVER, undefined, curGameRoom.curPlayerSitNum);
			}
		} else {
			// 出牌
			cc.log("discard");

			this.hide_operation_panel();
			this.hide_operation_wait_panel();
			// this.hide_player_info_op_panel();
		}
	},

	startGame: function () {
		this.clearTips();
		if (!this.is_show) {
			return;
		}
		this.playResultAnim = false;
		let player = h1global.player();

		for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
			this.update_player_ready_state(i, 0);
		}

		this.init_operation_panel();
		this.init_grab_panel();
		if (player && player.curGameRoom) {
			this.update_roominfo_panel();
			this.update_bottom_panel();
			var limit = false;
			let curGameRoom = player.curGameRoom;

			this.set_clock_pos(player.curGameRoom.curPlayerSitNum);
			this.update_main_panel(curGameRoom.mainPokers);
			this.update_dealer_idx(curGameRoom.mainServerSitNum);
			this.update_first7(curGameRoom.bonusIdx >= 0);
			if (curGameRoom.mainServerSitNum === curGameRoom.friendServerSitNum) {
				this.update_friend_idx(-1);
			} else {
				this.update_friend_idx(curGameRoom.friendServerSitNum);
			}
			if (curGameRoom.mainPokers.length > 0) {
				this.show_base_card_panel(false);
			} else {
				this.show_base_card_panel(true, curGameRoom.coverPokers, true);
			}
			if (curGameRoom.lordAid === const_ll7.LORD_THIRD) {
				this.hide_player_desk_panel();
			} else if (curGameRoom.lordAid === const_ll7.LORD_SECOND) {
				this.hide_player_desk_panel();
			} else if (curGameRoom.lordAid === const_ll7.LORD_FIRST) {
				this.hide_player_desk_panel();
			} else if (curGameRoom.lordAid === const_ll7.SURRENDER_FIRST) {
				this.update_giveup_panel(true);
				this.set_clock_pos(curGameRoom.lordIdx);
			} else if (curGameRoom.lordAid === const_ll7.DRAW_COVER) {
				if (curGameRoom.lordIdx === player.serverSitNum) {
					h1global.curUIMgr.ll7maidi_ui.show_by_info(curGameRoom.lordIdx, curGameRoom.handTilesList[curGameRoom.lordIdx], curGameRoom.coverPokers, curGameRoom.mainPokers[0]);
					this.hide_player_hand_tiles();
				}
			} else {
				this.hide_operation_panel();
				// 出牌
				if (curGameRoom.curPlayerSitNum === player.serverSitNum) {
					this.show_discard_panel();
					limit = true;
				}

				this.update_all_player_desk_tiles();
			}
			for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
				let handTilesList = curGameRoom.handTilesList[i];
				this.update_player_hand_tiles(i, handTilesList, limit);
			}
			this.refreshOperationPanel();
		} else {
			this.hide_operation_panel();
			this.show_base_card_panel(false);
			this.hide_player_hand_tiles();
			this.hide_player_desk_panel();
		}
	},

	server2CurSitNumOffline: function (serverSitNum, myServerSitNum) {
		return (serverSitNum - myServerSitNum + const_ll7.MAX_PLAYER_NUM) % const_ll7.MAX_PLAYER_NUM;
	},

	set_grab_visible: function (is_show, serverSitNum, score) {
		this.containUISnippets["PlayerInfoSnippet" + serverSitNum].set_grab_visible(is_show);
		if (score != undefined) {
			this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_grab_score(score, is_show);
		}
	},

	play_update_score_anim: function (serverSitNum, score) {
		var total = h1global.player().curGameRoom.sumPokerScore;
		var poker_score = h1global.player().curGameRoom.playerInfoList[serverSitNum].poker_score;
		this.containUISnippets["PlayerInfoSnippet" + serverSitNum].update_grab_score(poker_score, true);
		var self = this;
		this.playJiafenAnim(this.rootUINode, score, function () {
			self.update_total_score_panel(total);
		})
	},

	update_total_score_panel: function (score) {
		this.rootUINode.getChildByName("game_info_panel").getChildByName("bg_img").getChildByName("score_label").setString(score);
	},

	update_bottom_panel: function () {
		let player = h1global.player();
		if (player && player.curGameRoom) {
			let btn = this.rootUINode.getChildByName("bottom_bar_panel").getChildByName("previous_btn");
			btn.setBright(player.curGameRoom.hasPrevious());
			btn.setTouchEnabled(player.curGameRoom.hasPrevious());

			btn = this.rootUINode.getChildByName("bottom_bar_panel").getChildByName("dipai_btn");
			var hasCover = collections.sum(player.curGameRoom.coverPokers) > 0;
			btn.setBright(hasCover);
			btn.setTouchEnabled(hasCover);
		}
	},

	playDa7TeXiao: function (op, parent, options) {
		if (!op) {
			return;
		}
		var remove = true;
		parent = parent || this.rootUINode;
		var callback = null;
		var pos = null;
		var num = null;
		if (options) {
			remove = options.remove == undefined ? true : options.remove;
			pos = options.pos || cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
			callback = options.callback;
			num = options.num == undefined ? undefined : options.num;
		} else {
			pos = cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
		}


		var op_json = ccs.load("res/ui/da7TeXiao/da7" + op + ".json");   //加载CocosStudio导出的Json文件
		var op_node = op_json.node;
		var op_action = op_json.action; // 动作

		op_action.gotoFrameAndPlay(0, op_action.getDuration(), 0, false);
		op_node.setPosition(pos);
		op_node.runAction(op_action); // 播放动作
		if (remove) {
			op_node.runAction(cc.sequence(cc.delayTime(op_action.getDuration() / 60), cc.callFunc(function () {
				callback && callback();
			}), cc.removeSelf())); // 播放动作后移除
		} else {
			op_node.runAction(cc.sequence(cc.delayTime(op_action.getDuration() / 60), cc.callFunc(function () {
				callback && callback();
			})));
		}
		parent.addChild(op_node);  //将UI输出到画布
		if (num) {
			var fen_node = undefined;
			var str = undefined;
			if (op === "jiafen") {
				fen_node = op_node.getChildByName("fen_6");
				str = "+";
			} else if (op === "jianfen") {
				fen_node = op_node.getChildByName("fen_2");
				str = "";
			}
			if (fen_node) {
				var num_node = fen_node.getChildByName("BitmapFontLabel_1");
				num_node.setString(str + num.toString());
				num_node.setPositionX(-(num_node.getString().length * 16));
			} else {
				cc.log("no fen_node!");
			}
		}
		return op_node;
	},

	playDiaozhuAnim: function (parent, name, playAction, callback) {
		let node = cc.Node.create();
		var diaozhu_img_1 = ccui.ImageView.create("LL7GameRoomUI/" + name + "_normal.png", ccui.Widget.PLIST_TEXTURE);
		node.addChild(diaozhu_img_1);
		if (playAction) {
			var diaozhu_img_2 = ccui.ImageView.create("LL7GameRoomUI/" + name + "_disabled.png", ccui.Widget.PLIST_TEXTURE);
			diaozhu_img_1.setScale(3, 3);
			var diaozhu_action_1 = cc.sequence(
				cc.scaleTo(20 / 60, 1, 1),
				cc.scaleTo(6 / 60, 1.2, 1.2),
				cc.scaleTo(6 / 60, 1, 1),
				cc.delayTime(48 / 60)
			);
			diaozhu_img_2.setVisible(false);
			var diaozhu_action_2 = cc.sequence(
				cc.fadeOut(1 / 60),
				cc.callFunc(function () {
					diaozhu_img_2.setVisible(true);
				}),
				cc.delayTime(29 / 60),
				cc.fadeIn(1 / 60),
				cc.spawn(cc.scaleTo(5 / 60, 1.8, 1.8), cc.fadeOut(5 / 60)),
				cc.delayTime(35 / 60),
				cc.callFunc(function () {
					callback && callback();
				})
			);
			diaozhu_img_1.runAction(diaozhu_action_1);
			diaozhu_img_2.runAction(diaozhu_action_2);
			node.addChild(diaozhu_img_2);
		}
		parent.addChild(node);
		return node;
	},

	playJiafenAnim: function (parent, num, callback) {
		var jiafen_img_1 = ccui.ImageView.create("res/ui/LL7GameRoomUI/guang4.png");
		var jiafen_img_2 = ccui.ImageView.create("res/ui/LL7GameRoomUI/guang6.png");
		var jiafen_img_3 = ccui.ImageView.create("res/ui/LL7GameRoomUI/fen.png");
		var strNum = "+" + num.toString();
		var fen_fntlabel = ccui.TextBMFont.create(strNum, "res/ui/da7TeXiao/shuz3.fnt");
		// var last_pos = cc.p(cc.winSize.width * 0.5 + 60, cc.winSize.height - 20);
		var last_pos = this.rootUINode.getChildByName("game_info_panel").getPosition();
		last_pos.y -= 20;
		last_pos.x += 100;
		jiafen_img_1.setVisible(false);
		jiafen_img_2.setVisible(false);
		var jiafen_action_1 = cc.sequence(
			cc.fadeOut(1 / 60),
			cc.callFunc(function () {
				jiafen_img_1.setVisible(true);
			}),
			cc.delayTime(44 / 60),
			cc.fadeIn(1 / 60),
			cc.scaleTo(1 / 60, 0.1, 0.1),
			cc.spawn(cc.scaleTo(30 / 60, 3, 3), cc.fadeOut(30 / 60)),
			cc.callFunc(function () {
				jiafen_img_1.removeFromParent();
			})
		);
		jiafen_img_2.setScale(0.1, 0.1);
		var jiafen_action_2 = cc.sequence(
			cc.fadeOut(1 / 60),
			cc.callFunc(function () {
				jiafen_img_2.setVisible(true);
			}),
			cc.delayTime(44 / 60),
			cc.fadeIn(1 / 60),
			cc.scaleTo(15 / 60, 2.5, 2.5),
			cc.scaleTo(15 / 60, 0.1, 0.1),
			cc.callFunc(function () {
				jiafen_img_2.removeFromParent();
			})
		);
		jiafen_img_3.setScale(0.7, 0.7);
		var jiafen_action_3 = cc.sequence(
			cc.scaleTo(15 / 60, 1, 1),
			cc.spawn(cc.scaleTo(30 / 60, 0.05, 0.05), cc.moveTo(30 / 60, last_pos), cc.fadeTo(30 / 60, 0.02)),
			cc.fadeOut(1 / 60),
			cc.delayTime(29 / 60),
			cc.callFunc(function () {
				callback && callback();
				jiafen_img_3.removeFromParent();
			})
		);
		jiafen_img_1.runAction(jiafen_action_1);
		jiafen_img_2.runAction(jiafen_action_2);
		jiafen_img_3.runAction(jiafen_action_3);
		parent.addChild(jiafen_img_1);
		parent.addChild(jiafen_img_2);
		parent.addChild(jiafen_img_3);
		jiafen_img_3.addChild(fen_fntlabel);
		jiafen_img_1.setPosition(last_pos);
		jiafen_img_2.setPosition(last_pos);
		jiafen_img_3.setPosition(cc.winSize.width * 0.5, cc.winSize.height * 0.5);
		fen_fntlabel.setPosition(-(strNum.length * 16), 34);
	},

	play_jiaozhu_anime: function (state) {
		var self = this;
		let ponit_show_list = [false, false, false];
		let lord_panel = this.rootUINode.getChildByName("operation_panel").getChildByName("lord_panel")
		var action = cc.sequence(
			cc.delayTime(0.5),
			cc.callFunc(function () {
				for (var i = 0; i < 3; i++) {
					lord_panel.getChildByName("point_img_" + i).setVisible(ponit_show_list[i]);
				}
				if (ponit_show_list.indexOf(false) >= 0) {
					ponit_show_list[ponit_show_list.indexOf(false)] = true;
				} else {
					ponit_show_list = [false, false, false];
				}
			})
		);

		if (state === const_ll7.LORD_FIRST) {
			lord_panel.getChildByName("lord_img").loadTexture("LL7GameRoomUI/jiaozhu_img.png", ccui.Widget.PLIST_TEXTURE);
			lord_panel.setVisible(true);
			lord_panel.stopAllActions();
			lord_panel.runAction(cc.repeatForever(action));
		} else if (state === const_ll7.LORD_SECOND) {
			lord_panel.getChildByName("lord_img").loadTexture("LL7GameRoomUI/fanzhu_img.png", ccui.Widget.PLIST_TEXTURE);
			lord_panel.setVisible(true);
			lord_panel.stopAllActions();
			lord_panel.runAction(cc.repeatForever(action));
		} else if (state === const_ll7.LORD_THIRD) {
			lord_panel.getChildByName("lord_img").loadTexture("LL7GameRoomUI/fanzhu_img.png", ccui.Widget.PLIST_TEXTURE);
			lord_panel.setVisible(true);
			lord_panel.stopAllActions();
			lord_panel.runAction(cc.repeatForever(action));
		} else {
			lord_panel.setVisible(false);
		}
	},

	start_delay_remove_panel: function (nextServerSitNum) {
		let node = this.rootUINode.getChildByName("__delay_anim__");
		if (!node) {
			node = cc.Node.create();
			node.setName("__delay_anim__");
			this.rootUINode.addChild(node);
		}
		var self = this;
		this.set_clock_pos(-1);
		node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
			self.hide_player_desk_panel();
			self.set_clock_pos(nextServerSitNum);
		})))
	},

	stop_delay_remove_panel: function (serverSitNum, nextServerSitNum) {
		let node = this.rootUINode.getChildByName("__delay_anim__");
		if (node) {
			node.stopAllActions();
			this.set_clock_pos(nextServerSitNum);
		}
	},

	/**
	 *
	 * @param serverSitNum
	 * @param state
	 * @param pokers undefined: 既不是叫住也不是反主  []： 不反/不叫  [1]： 叫主  [1,2]： 反主
	 * @param nextServerSitNum
	 */
	update_operation_wait_panel: function (serverSitNum, state, pokers, nextServerSitNum) {
		// cc.error("update_operation_wait_panel", serverSitNum, state, pokers, nextServerSitNum);
		let wait_panel = this.rootUINode.getChildByName("operation_wait_panel");

		function createAnim() {
			var index = 0;
			return cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
				for (var i = 0; i < 3; i++) {
					wait_panel.getChildByName("point_img_" + i).setVisible(i <= index);
				}
				index = (++index) % 3;
			})).repeatForever();
		}

		function updateFunc(imgName) {
			wait_panel.getChildByName("wait_img").loadTexture("LL7GameRoomUI/" + imgName + ".png", ccui.Widget.PLIST_TEXTURE);
			wait_panel.stopAllActions();
			wait_panel.setVisible(true);
			wait_panel.runAction(createAnim());
		}

		let player = h1global.player();
		if (!player) {
			return;
		}

		if (pokers == undefined) {
			if (player.serverSitNum === serverSitNum) {
				let mainPokers = player.curGameRoom.mainPokers;
				if (state === const_ll7.LORD_FIRST || state === const_ll7.LORD_SECOND) {
					cc.log("LORD_FIRST LORD_SECOND 0");
					cc.log(mainPokers);
					if (mainPokers.length === 0) {
						updateFunc("jiaozhu_img");
					} else {
						updateFunc("fanzhu_img");
					}
				} else if (state === const_ll7.COVER_POKER) {
					cc.log("COVER_POKER 0");
					updateFunc("wait_fanzhu_img");
				} else {
					cc.log("other 0");
					wait_panel.setVisible(false);
				}
			} else {
				if (state === const_ll7.DRAW_COVER) {
					cc.log("DRAW_COVER 01");
					updateFunc("wait_maidi_img");
				} else if (state === const_ll7.COVER_POKER) {
					cc.log("COVER_POKER 01");
					if (player.curGameRoom.get7MaxCount(player.serverSitNum) === 2) {
						updateFunc("fanzhu_img");
					} else {
						updateFunc("wait_fanzhu_img");
					}
				} else {
					cc.log("other 02");
					wait_panel.setVisible(false);
				}
			}

		} else if (pokers.length === 0) {
			// 不叫/不反
			if (player.serverSitNum === serverSitNum) {
				if (state === const_ll7.LORD_FIRST) {
					cc.log("LORD_FIRST 1");
					updateFunc("wait_jiaozhu_img");
				} else if (state === const_ll7.LORD_SECOND || state === const_ll7.LORD_THIRD) {
					cc.log("LORD_SECOND LORD_THIRD 1");
					updateFunc("wait_fanzhu_img");
				} else {
					cc.log("otehr 1");
					wait_panel.setVisible(false);
				}
			} else {
				// if (nextServerSitNum === player.serverSitNum && state === const_ll7.LORD_THIRD) {
				// if (serverSitNum !== player.serverSitNum) {
				// 	this.update_player_info_op_panel(serverSitNum, state);
				// }
				// wait_panel.setVisible(false);
				// } else {
				// this.update_player_info_op_panel(serverSitNum, state);
				// }
			}
		} else if (pokers.length === 1) {
			// 叫主
			if (state === const_ll7.LORD_FIRST) {
				cc.log("LORD_FIRST 2");
			} else if (state === const_ll7.LORD_SECOND) {
				cc.log("LORD_SECOND 2");
				if (serverSitNum === player.serverSitNum) {
					updateFunc("wait_fanzhu_img");
				} else {
					updateFunc("fanzhu_img");
				}
			}
		} else {
			// 反主
			if (state === const_ll7.LORD_SECOND || state === const_ll7.LORD_THIRD) {
				cc.log("LORD_SECOND LORD_THIRD 3");
				if (serverSitNum === player.serverSitNum) {
					updateFunc("wait_fanzhu_img");
				} else {
					updateFunc("wait_maidi_img");
				}
			}
		}
	},

	hide_operation_wait_panel: function () {
		this.rootUINode.getChildByName("operation_wait_panel").setVisible(false);
	},

	update_player_info_op_panel: function (serverSitNum, aid) {
		// var player = h1global.player();
		// if (!player) {
		// 	return;
		// }
		// var curSitNum = player.server2CurSitNum(serverSitNum);
		// if (curSitNum == 0) {
		// 	return;
		// }
		// var panel = this.rootUINode.getChildByName("player_info_panel" + curSitNum).getChildByName("player_info_op_panel");
		// if (aid === const_ll7.LORD_FIRST) {
		// 	panel.getChildByName("op_img").loadTexture("LL7GameRoomUI/bujiao_img.png", ccui.Widget.PLIST_TEXTURE);
		// } else if (aid === const_ll7.LORD_SECOND || aid === const_ll7.LORD_THIRD) {
		// 	panel.getChildByName("op_img").loadTexture("LL7GameRoomUI/bufan_img.png", ccui.Widget.PLIST_TEXTURE);
		// }
		// panel.setVisible(true);
	},

	hide_player_info_op_panel: function (serverSitNum) {
		// if (serverSitNum == undefined) {
		// 	for (var i = 0; i < const_ll7.MAX_PLAYER_NUM; i++) {
		// 		var panel = this.rootUINode.getChildByName("player_info_panel" + i).getChildByName("player_info_op_panel");
		// 		if (panel) {
		// 			panel.setVisible(false);
		// 		}
		// 	}
		// } else {
		// 	let player = h1global.player();
		// 	if (!player) {
		// 		return;
		// 	}
		// 	let idx = player.server2CurSitNum(serverSitNum);
		// 	if (idx === 0) {
		// 		return;
		// 	}
		// 	this.rootUINode.getChildByName("player_info_panel" + idx).getChildByName("player_info_op_panel").setVisible(false);
		// }
	},

	init_giveup_panel: function () {
		let panel = this.rootUINode.getChildByName("giveup_panel");
		panel.getChildByName("giveup_btn").addTouchEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				let player = h1global.player();
				if (player) {
					player.doOperation(const_ll7.SURRENDER_FIRST, [1]);
					if (cc.sys.isObjectValid(panel)) {
						panel.setVisible(false);
					}
				}
			}
		}));
		panel.getChildByName("ungiveup_btn").addTouchEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				let player = h1global.player();
				if (player) {
					player.doOperation(const_ll7.SURRENDER_FIRST, [0]);
					if (cc.sys.isObjectValid(panel)) {
						panel.setVisible(false);
					}
				}
			}
		}));
	},

	update_giveup_panel: function (is_show) {
		if (!this.is_show) {
			return;
		}
		this.rootUINode.getChildByName("giveup_panel").setVisible(is_show);
	},

	update_first7: function (is_show) {
		if (!this.is_show) {
			return;
		}
		this.rootUINode.getChildByName("bottom_bar_panel").getChildByName("first7_img").setVisible(is_show);
	}

});
