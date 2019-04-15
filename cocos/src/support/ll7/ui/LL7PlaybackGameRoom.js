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
// 吃刚碰胡操作修改
//
// 回放进度
//
// 桌面牌更新
//
// impGameOperation.postOperation()
//
"use strict"
var LL7PlaybackGameRoom = AbstractPlaybackGameRoom.extend({

	onInit: function () {
		let self = this;
		this.roomUI.hide_player_desk_panel();
		this.roomUI.hide_operation_panel();
		this.roomUI.show_base_card_panel(false);
		// this.roomUI.show_base_card_panel = function () {
		// };
		this.roomUI.show_operation_panel = function () {
		};
		this.roomUI.update_operation_panel = function () {
		};
		this.roomUI.show_discard_panel = function () {
		};
		this.roomUI.update_operation_wait_panel = function () {
		};
		this.roomUI.update_playback_operation_panel = function (serverSitNum, op_dict, doOP) {
			if (h1global.curUIMgr.playback_ui) {
				h1global.curUIMgr.playback_ui.showOperationPanel(serverSitNum, op_dict, doOP);
			}
		};

		this.init_player_hand_tiles();
		this.roomUI.rootUINode.getChildByName("player_hand_panel0").setScale(0.75);
		this.myServerSitNum = h1global.player().serverSitNum;
		let oldFunc = this.roomUI.update_player_hand_tiles;
		if (!this.roomUI.old_update_player_hand_tiles) {
			this.roomUI.update_player_hand_tiles = function (serverSitNum, tileList) {
				if (serverSitNum === self.myServerSitNum) {
					self.roomUI.old_update_player_hand_tiles(serverSitNum, tileList);
					var rootPanel = self.roomUI.rootUINode.getChildByName("player_hand_panel0")
					var hand = tileList.length / const_ll7.HAND_CARD_NUM;
					rootPanel.setPositionX((cc.director.getWinSize().width - rootPanel.width * 0.75 * hand) / 2);
					// rootPanel.x += parseFloat(tileList.length / 2) * 40 * 0.75;
				} else {
					self.update_player_hand_tiles(serverSitNum, tileList);
				}
			};
			this.roomUI.old_update_player_hand_tiles = oldFunc;
		}


		let oldDeskFunc = this.roomUI.update_player_desk_tiles;
		if (!this.roomUI.old_update_player_desk_tiles) {
			this.roomUI.update_player_desk_tiles = function (serverSitNum, tileList, myServerSitNum, curGameRoom) {
				self.roomUI.old_update_player_desk_tiles(serverSitNum, tileList, myServerSitNum, curGameRoom);
				var index = self.roomUI.server2CurSitNumOffline(serverSitNum, myServerSitNum);
				var panel = self.roomUI.rootUINode.getChildByName("player_desk_panel" + index);
				panel.setScale(0.6);
				if (index === 0) {
					panel.x = cc.director.getWinSize().width * 0.5 - 20;
					panel.x -= parseFloat(tileList.length / 2) * 23; //31.2是牌的间距
					panel.setPositionY(cc.winSize.height * 0.297);
				} else if (index === 1) {
					panel.setPosition(cc.winSize.width * 0.288, cc.winSize.height * 0.433);
				} else if (index === 2) {
					panel.setPosition(cc.winSize.width * 0.288, cc.winSize.height * 0.7);
				} else if (index === 3) {
					panel.setPosition(cc.winSize.width * 0.31, cc.winSize.height * 0.7);
				} else if (index === 4) {
					panel.setPosition(cc.winSize.width * 0.31, cc.winSize.height * 0.433);
				}
			};
			this.roomUI.old_update_player_desk_tiles = oldDeskFunc;
		}
		let curGameRoom = h1global.player().curGameRoom;
		this.parseCommands(curGameRoom.op_record_list);
	},

	init: function () {
		this._super();
		var self = this;
		let node = this.roomUI.rootUINode.getChildByName("bottom_bar_panel").getChildByName("dipai_btn");

		let p = node.convertToWorldSpaceAR();
		p = this.convertToNodeSpaceAR(p);
		node = node.clone();
		node.setPosition(p);
		this.roomUI.addChild(node);
		node.addTouchEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_BEGAN) {
				let p = h1global.player();
				if (p && p.curGameRoom) {
					self.roomUI.show_base_card_panel(true, p.curGameRoom.coverPokers, false);
				}
			} else if (eventType === ccui.Widget.TOUCH_ENDED || eventType === ccui.Widget.TOUCH_CANCELED) {
				self.roomUI.show_base_card_panel(false);
			}
		}));
	},

	_createOtherHandPanel: function (index, tiles) {
		let rootPanel = cc.Node.create();
		rootPanel.setName("_playback_hand_" + index);
		rootPanel.setScale(0.4);
		this.roomUI.rootUINode.addChild(rootPanel);
		for (var i = 0; i < tiles.length; i++) {
			let card = tiles[i];
			let ui = ccui.ImageView.create(cutil_ll7.getCardImgPath(card), ccui.Widget.PLIST_TEXTURE);
			let line = parseInt(i / 10);
			ui.setPosition((i - line * 10) * 60, 120 - line * 100);
			let id = i;
			if (index === 3 || index === 4) {
				if (line === 0) {
					id = i + 10;
				} else {
					id = i - 10;
				}
			} else {
				id = 19 - i;
			}
			ui.setName("tile_img_" + id);
			rootPanel.addChild(ui);

			var star = ccui.ImageView.create("LL7GameRoomUI/star.png", ccui.Widget.PLIST_TEXTURE);
			star.setName("star");
			ui.addChild(star);
			star.setPosition(29.75, 30.93);
			star.setVisible(false);
		}
		if (index === 1) {
			rootPanel.setAnchorPoint(1, 0);
			rootPanel.setPosition(cc.winSize.width * 0.72, cc.winSize.height * 0.48);
		} else if (index === 2) {
			rootPanel.setAnchorPoint(1, 0);
			rootPanel.setPosition(cc.winSize.width * 0.72, cc.winSize.height * 0.72);
		} else if (index === 3) {
			rootPanel.setPosition(cc.winSize.width * 0.11, cc.winSize.height * 0.72);
		} else if (index === 4) {
			rootPanel.setPosition(cc.winSize.width * 0.11, cc.winSize.height * 0.48);
		}
		rootPanel.setLocalZOrder(-1);
	},

	init_player_hand_tiles: function () {
		let player = h1global.player();
		if (!player) {
			return;
		}
		let curGameRoom = player.curGameRoom;
		let serverSitNum = player.serverSitNum;
		for (var i = 0; i < player.curGameRoom.player_num; i++) {
			if (i !== serverSitNum) {
				this._createOtherHandPanel(player.server2CurSitNum(i), curGameRoom.handTilesList[i]);
			}
		}
	},

	update_player_hand_tiles: function (serverSitNum, tileList) {
		let p = h1global.player();
		let idx = this.roomUI.server2CurSitNumOffline(serverSitNum, this.myServerSitNum);
		let rootPanel = this.roomUI.rootUINode.getChildByName("_playback_hand_" + idx);
		for (var i = 0; i < const_ll7.HAND_CARD_NUM; i++) {
			let ui = rootPanel.getChildByName("tile_img_" + i);
			let card = tileList[i];
			if (ui && card > 0) {
				ui.loadTexture(cutil_ll7.getCardImgPath(card), ccui.Widget.PLIST_TEXTURE);
				ui.setVisible(true);
				if (p) {
					ui.getChildByName("star").setVisible(p.gameOperationAdapter.isMain(card));
				}
			} else {
				ui && ui.setVisible(false);
			}
		}
	},

	parseCommands: function (op_list) {
		for (var i = 0; i < op_list.length; i++) {
			let command = {};
			let obj = op_list[i];
			command.idx = obj[0];
			command.pokers = obj[1];
			command.nextIdx = obj[2];
			command.index = i;

			this.commands.push(command);
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
			player.ll7PostOperation(command.idx, const_ll7.DISCARD, command.pokers, command.nextIdx);
		} else {
			this._updateRoomInfo();
			this.playbackComplete();
		}
	},
});
