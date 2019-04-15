"use strict"
var AbstractPlaybackGameRoom = cc.Node.extend({
	ctor: function (roomUI) {
		this._super();
		this.setName("AbstractPlaybackGameRoom");
		this.commands = [];
		this.roomUI = roomUI;
		this.timeScale = 0;
		this.step_interval = 1;
		this.timeScaleList = [1, 1.2, 2]
	},

	init: function () {
		this.onInit();
		let self = this;
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
		return true;
	},

	onInit: function () {

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
	},

	doNext: function () {
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
