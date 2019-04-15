// 进入游戏前需要数据
//
//     用户数据
//
//     房间信息
//
//     出牌数据
//         手牌
//         每次出牌的操作
//
// 打明牌
//
// 回放进度
//
// 桌面牌更新
//
// impGameOperation.postOperation()
//
"use strict";
var DDZPlaybackGameRoom = cc.Node.extend({
	ctor: function (roomUI) {
		this._super();
		this.setName("PlaybackGameRoom");
		this.commands = [];
		this.roomUI = roomUI;
		this.timeScale = 0;
		this.step_interval = 1;
		this.timeScaleList = [1, 1.2, 2]
	},

	init: function () {
		let self = this;

		this.roomUI.show_extra_panel(false);
		this.roomUI.show_extra_panel = function (is_show) {
			self.roomUI.rootUINode.getChildByName("extra_operation_panel").setVisible(false)
		};
		this.roomUI.show_operation_panel = function () {
		};
		this.roomUI.update_operation_panel = function (op_dict, from_type) {
		};
		this.roomUI.hide_operation_panel();

		this.roomUI.rootUINode.getChildByName("game_info_panel").setVisible(false);
		this.roomUI.update_game_info_panel = function () {
		};
		this.roomUI.init_game_info_panel = function () {
		};
		this.roomUI.init_player_wait_panel = function () {
		};
		this.roomUI.rootUINode.getChildByName("player_wait_panel1").setVisible(false);
		this.roomUI.rootUINode.getChildByName("player_wait_panel2").setVisible(false);

		this.init_player_hand_tiles();

		let curGameRoom = h1global.player().curGameRoom;
		this.myServerSitNum = h1global.player().serverSitNum;
		let oldFunc = this.roomUI.update_player_hand_tiles;
		if (!this.roomUI.old_update_player_hand_tiles) {
			this.roomUI.update_player_hand_tiles = function (serverSitNum, tileList) {
				if (serverSitNum === self.myServerSitNum) {
					self.roomUI.old_update_player_hand_tiles(serverSitNum, tileList);
				} else {
					self.update_player_hand_tiles(serverSitNum, tileList);
				}
			};
			this.roomUI.old_update_player_hand_tiles = oldFunc;
		}

		this.parseCommands(curGameRoom.op_record_list);

		this.disableRoomTouch();
		if (h1global.curUIMgr.playbackcontrol_ui) {
			h1global.curUIMgr.playbackcontrol_ui.show(function () {
				h1global.curUIMgr.playbackcontrol_ui.setPlaybackGameRoom(self);
			})
		}

		if (h1global.curUIMgr.playback_ui) {
			h1global.curUIMgr.playback_ui.show(function () {
				self._updateRoomInfo();
			});
		}

		if (h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show) {
			h1global.curUIMgr.gameroominfo_ui.setPlaybackLayout();
		} else {
			let node = cc.Node.create();
			this.addChild(node);
			node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1 / 60.0), cc.callFunc(function () {
				if (h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show) {
					h1global.curUIMgr.gameroominfo_ui.setPlaybackLayout();
					node.removeFromParent();
				}
			}))))
		}
		// this.testNext()
	},

	_getPokerImgPath: function (card) {
		let rank = ddz_rules.get_rank(card);
		let suit = ddz_rules.get_suit(card);
		// 大小王
		if (rank > 20) {
			return "Poker/pic_poker_small_" + rank + '.png';
		} else {
			if (rank === ddz_rules.A) {
				rank = 1;
			}
			return "Poker/pic_poker_small_" + ddz_rules.POKER_COLOR_DICT[suit] + "" + rank + '.png';
		}
	},

	_createOtherHandPanel: function (index, tiles) {
		let rootPanel = ccui.ImageView.create("res/ui/GameRoomUI/poker_small_bg.png");
		rootPanel.setName("_playback_hand_" + index);
		this.roomUI.rootUINode.addChild(rootPanel);
		for (var i = 0; i < tiles.length; i++) {
			let card = tiles[i];

			//image size  23 * 48
			let ui = ccui.ImageView.create(this._getPokerImgPath(card), ccui.Widget.PLIST_TEXTURE);
			let line = parseInt(i / 11);
			ui.setPosition((i - line * 11) * 22 + 22 / 2.0 + 6, 80 - line * 48);
			ui.setName("tile_img_" + i);
			rootPanel.addChild(ui);
		}
		if (index === 1) {
			rootPanel.setAnchorPoint(1, 0);
			rootPanel.setPosition(cc.winSize.width - 3, cc.winSize.height * 0.38);
		} else {
			rootPanel.setAnchorPoint(0, 0);
			rootPanel.setPosition(3, cc.winSize.height * 0.38);
		}
	},

	init_player_hand_tiles: function () {
		let player = h1global.player();
		if (!player) {
			return;
		}
		let curGameRoom = player.curGameRoom;
		let serverSitNum = player.serverSitNum;
		for (var i = 0; i < 3; i++) {
			if (i !== serverSitNum) {
				this._createOtherHandPanel(player.server2CurSitNum(i), curGameRoom.handTilesList[i]);
			}
		}
	},

	update_player_hand_tiles: function (serverSitNum, tileList) {
		let idx = this.roomUI.server2CurSitNumOffline(serverSitNum, this.myServerSitNum);
		let rootPanel = this.roomUI.rootUINode.getChildByName("_playback_hand_" + idx);
		for (var i = 0; i < const_ddz.HAND_CARD_NUM; i++) {
			let ui = rootPanel.getChildByName("tile_img_" + i);
			let card = tileList[i];
			if (ui && card > 0) {
				ui.loadTexture(this._getPokerImgPath(card), ccui.Widget.PLIST_TEXTURE);
				ui.setVisible(true);
			} else {
				ui && ui.setVisible(false);
			}
		}
	},

	disableRoomTouch: function () {
		let mask = this.roomUI.getChildByName("touch_mask");
		if (mask) {
			mask.removeFromParent();
		}
		mask = new ccui.Layout();
		mask.setContentSize(cc.winSize.width, cc.winSize.height);
		mask.setTouchEnabled(true);
		mask.setName("touch_mask");
		mask.setAnchorPoint(0, 0);
		this.roomUI.addChild(mask);
	},

	startPlayback: function () {
		let self = this;
		this.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
			self.resumePlayback();
		})))
	},

	resumePlayback: function () {
		let self = this;
		self.runAction(cc.repeatForever(cc.sequence(cc.delayTime(this.step_interval), cc.callFunc(function () {
			self.doNext()
		}))))
	},

	pausePlayback: function () {
		this.stopPlayback()
	},

	stopPlayback: function () {
		this.stopAllActions();
	},

	replay: function () {
		this.resetTimeScale();
		this.stopPlayback();
		this.commands = [];
		let self = this;
		// this.commands = this.originCommands.slice(0);
		let player = h1global.player();
		if (player) {
			h1global.curUIMgr.playbackcontrol_ui.resetUI();
			player.replayGame(function () {
				self.startPlayback();
			});
		} else {
			cc.warn('player undefined')
		}
	},

	nextTimeScale: function () {
		this.timeScale = ++this.timeScale % this.timeScaleList.length;
		this.setActionTimeScale(this.timeScaleList[this.timeScale]);
	},

	resetTimeScale: function () {
		this.timeScale = 0;
		this.setActionTimeScale(1)
	},

	setActionTimeScale: function (rate) {
		this._updateRoomInfo();
		cc.director.getScheduler().setTimeScale(rate);
	},

	_updateRoomInfo: function () {
		if (h1global.curUIMgr.playback_ui && h1global.curUIMgr.playback_ui.is_show) {
			h1global.curUIMgr.playback_ui.updateRoomInfo(cc.formatStr('%d/%d', this.totalCommand - this.commands.length, this.totalCommand),
				Math.max(1, this.timeScale * 2));
		}
	},

	playbackComplete: function () {
		cc.log("playbackComplete");
		this.stopPlayback();
		this.resetTimeScale();
		let player = h1global.player();
		let self = this;
		player.roundResult(JSON.stringify(player.curGameRoom["round_result"]), function () {
			self.replay();
		});
	},

	quitRoom: function () {
		this.resetTimeScale();
		this.stopPlayback();
		let player = h1global.player();
		if (player) {
			player.curGameRoom = undefined;
			player.originRoomInfo = undefined;
		}
		h1global.runScene(new GameHallScene());
	},

	parseCommands: function (op_list) {
		for (var i = 0; i < op_list.length; i++) {
			let obj = op_list[i];
			let aid = obj[0];
			if (aid == const_ddz.OP_REDEAL) {
				this.commands = [];
			} else if (aid == const_ddz.OP_FIGHT_DEALER || aid == const_ddz.OP_BET || aid == const_ddz.OP_CONFIRM_DEALER || aid == const_ddz.OP_MUL) {
				continue;
			} else {
				let command = {};
				command.aid = aid;
				command.serverSitNum = obj[1];
				command.nextServerSitNum = obj[2];
				command.index = i;
				command.tileList = obj[3];
				this.commands.push(command);
			}
		}
		this.commands.reverse();
		this.totalCommand = this.commands.length;
	},

	doNext: function () {
		let commands = this.commands;
		if (commands.length > 0) {
			this._updateRoomInfo();
			let command = commands.pop();
			let player = h1global.player();
			player.ddzPostOperation(command.serverSitNum, command.aid, command.tileList, command.nextServerSitNum);
			// this.doSpecialCommand();
		} else {
			this._updateRoomInfo();
			this.playbackComplete();
		}
	},

	/**
	 * 处理下乡等特殊操作
	 */
	doSpecialCommand: function () {
		let player = h1global.player();
		let op_special_record = player.curGameRoom.op_special_record_list;
		if (op_special_record) {
			let flag = op_special_record.length > 0;
			while (flag) {
				let re = op_special_record[0];
				if (re[3] == this.totalCommand - this.commands.length) {
					op_special_record.shift();
					// player.postPlayerDiscardState(re[1], cutil_ddz.DISCARD_FORCE);
					flag = op_special_record.length > 0;
				} else {
					flag = false;
				}
			}
		}
	},

	testNext: function () {
		var self = this;
		let game_info_panel = this.roomUI.rootUINode.getChildByName("game_info_panel");
		game_info_panel.setTouchEnabled(true);
		game_info_panel.addTouchEventListener(function (sender, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				self.doNext()
			}
		})
	},

	onExit: function () {
		this._super();
		this.resetTimeScale();
	}
});
