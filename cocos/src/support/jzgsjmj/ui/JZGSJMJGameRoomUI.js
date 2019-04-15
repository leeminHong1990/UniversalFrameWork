// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var JZGSJMJGameRoomUI = JZMJGameRoomUI.extend({

	_setBeginGameShow: function (is_show) {
		var player = h1global.player();
		if (player.curGameRoom.kingTiles.length > 0) {
			this.rootUINode.getChildByName("kingtile_panel").setVisible(is_show)
		}
		for (var i = 0; i < 4; i++) {
			if (i === 2 && player.curGameRoom.player_num === 3) {
				this.rootUINode.getChildByName("player_tile_panel" + i.toString()).getChildByName("player_hand_panel").setVisible(false);
			} else {
				this.rootUINode.getChildByName("player_tile_panel" + i.toString()).getChildByName("player_hand_panel").setVisible(is_show);
			}
		}
	},

	startBeginAnim: function (startTilesList, diceList, dealerIdx) {
		this.beginAnimPlaying = true;
		this.lock_player_hand_tiles();
		var self = this;

		if (this.startAnimExecutor) {
			cc.error("already Playing start anim");
			return;
		}
		var player = h1global.player();
		if (!player) {
			return
		}
		this.startAnimExecutor = cc.Node.create();
		this.rootUINode.addChild(this.startAnimExecutor);
		var curGameRoom = player.curGameRoom;
		var myServerSitNum = player.serverSitNum;
		this.show_ting_panel(false);

		function playAnimation() {
			var cur_tile_num = 0;
			self._setBeginGameShow(true);

			var groupSize = 3;
			var repeatCount = curGameRoom.handTilesList[0].length / groupSize + (curGameRoom.handTilesList[0].length % groupSize > 0 ? 1 : 0);
			repeatCount = Math.ceil(repeatCount);
			// Note: 一开始会显示全部手牌，这里直接隐藏节点
			for (var i = 0; i < 4; i++) {
				var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i);
				cur_player_tile_panel.setVisible(false);
			}

			var step1 = cc.sequence(
				cc.sequence(cc.delayTime(0.2),
					cc.callFunc(function () {
						cur_tile_num += groupSize;
						for (var i = 0; i < curGameRoom.player_num; i++) {
							cur_tile_num = Math.min(cur_tile_num, startTilesList[i].length);
							self.update_player_hand_tiles(i, startTilesList[i].slice(0, cur_tile_num));
						}
						if (cur_tile_num === groupSize) {
							for (var i = 0; i < 4; i++) {
								if (i === 2 && curGameRoom.player_num === 3) {
									self.rootUINode.getChildByName("player_tile_panel" + i.toString()).setVisible(false);
								} else {
									self.rootUINode.getChildByName("player_tile_panel" + i.toString()).setVisible(true);
									self.rootUINode.getChildByName("player_tile_panel" + i.toString()).getChildByName("player_hand_panel").setVisible(true);
								}
							}
						}
						cc.audioEngine.playEffect("res/sound/effect/deal_tile.mp3");
					})
				)
			).repeat(repeatCount);

			var options = self.get_start_begin_anim_config();

			var step2 = cc.sequence(cc.delayTime(0.1), cc.callFunc(function () {
					cc.log("start anim step 2-1");
					// 隐藏手牌 显示盖牌
					var img = undefined;
					for (var i = 0; i < 4; i++) {
						if (i === 2 && curGameRoom.player_num === 3) {
							continue;
						}
						var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i);
						var cur_player_hand_panel = cur_player_tile_panel.getChildByName("player_hand_panel");
						cur_player_hand_panel.setVisible(false);

						var tile_down_anim_node = cc.Node.create();
						tile_down_anim_node.setName("tile_down_anim_node");
						tile_down_anim_node.setAnchorPoint(0, 0);
						cur_player_tile_panel.addChild(tile_down_anim_node);

						tile_down_anim_node.scale = options.downRootNodeScales[i];
						tile_down_anim_node.setPosition(options.downRootNodeOffsets[i]);
						for (var j = 0; j < 13; j++) {
							if (options.tileTopAndDownImgPaths) {
								img = ccui.ImageView.create(options.tileTopAndDownImgPaths[i].length == 0 ? options.tileDownImgPaths[i] : cc.formatStr(options.tileDownImgPaths[i], options.tileTopAndDownImgPaths[i][j]), ccui.Widget.PLIST_TEXTURE);
							} else {
								img = ccui.ImageView.create(options.tileDownImgPaths[i], ccui.Widget.PLIST_TEXTURE);
							}
							if ((i == 1 || i == 3) && options.tilescale) {
								img.setScale(1 / (options.tilescale[j] * 0.01));
							}
							img.setPosition(options.downTilePositionFuncs[i](j))
							img.setAnchorPoint(0, 0)
							if (options.downRootNodeAnchorPointX) {
								img.setAnchorPoint(options.downRootNodeAnchorPointX[i], 0);
							}
							if (options.downRootNodeFlippedX) {
								img.setFlippedX(options.downRootNodeFlippedX[i]);
							}
							if (options.downRootNodeRotations) {
								img.setRotation(options.downRootNodeRotations[i]);
							}
							tile_down_anim_node.addChild(img);
						}
					}

				}),
				cc.delayTime(0.5),
				cc.callFunc(function () {
					cc.log("start anim step 2-2");
					// 移除盖牌
					for (var i = 0; i < 4; i++) {
						var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i);
						var tile_down_anim_node = cur_player_tile_panel.getChildByName("tile_down_anim_node");
						if (tile_down_anim_node) {
							tile_down_anim_node.removeFromParent();
							tile_down_anim_node = undefined;
						}
					}
				}));

			var step3 = cc.callFunc(function () {
				cc.log("start anim step 3");
				self._removeStartAnimExecutor(self);
				self.beginAnimPlaying = false;
				//显示手牌
				for (var i = 0; i < 4; i++) {
					if (i < 3) {
						self.update_player_hand_tiles(i, curGameRoom.handTilesList[i]);
					}
					// Note: 由于数据不需要对应 所以直接可以跳过2号
					if (i === 2 && curGameRoom.player_num === 3) {
						continue
					}
					var cur_player_tile_panel = self.rootUINode.getChildByName("player_tile_panel" + i);
					var cur_player_hand_panel = cur_player_tile_panel.getChildByName("player_hand_panel");
					cur_player_hand_panel.setVisible(true);
				}

				var curPlayerSitNum = curGameRoom.curPlayerSitNum;
				if (myServerSitNum === curPlayerSitNum && (curGameRoom.handTilesList[player.serverSitNum].length) % 3 === 2) {
					self.unlock_player_hand_tiles();
					if (player) {
						var opDict = player.gameOperationAdapter.getDrawOpDict(player.curGameRoom.lastDrawTile);
						self.update_operation_panel(opDict, const_val.SHOW_DO_OP);
						//是否可以听牌
						if (player.gameOperationAdapter.checkCanTing(opDict)) {
							self.show_ting_panel(true);
						}
					}
				} else {
					self.lock_player_hand_tiles();
				}
				cc.audioEngine.playEffect("res/sound/effect/deal_tile.mp3");
			});

			self.startAnimExecutor.runAction(cc.sequence(step1, step2, step3));
		}

		this._setBeginGameShow(false)
		this.throwTheDice(diceList, dealerIdx, playAnimation);
	},

	stopBeginAnim: function () {
		this._removeStartAnimExecutor(this);
		this.beginAnimPlaying = false;
		this._setBeginGameShow(true);

		//移除骰子
		let dice_node = this.rootUINode.getChildByName("dice_anim_node");
		if (dice_node) dice_node.removeFromParent();

		var player = h1global.player();

		for (var i = 0; i < 4; i++) {
			var cur_player_tile_panel = this.rootUINode.getChildByName("player_tile_panel" + i);
			if (i === 2 && player.curGameRoom.player_num === 3) {
				cur_player_tile_panel.setVisible(false);
			} else {
				cur_player_tile_panel.setVisible(true);
				var cur_player_hand_panel = cur_player_tile_panel.getChildByName("player_hand_panel");
				cur_player_hand_panel.setVisible(true);
			}
			var tile_down_anim_node = cur_player_tile_panel.getChildByName("tile_down_anim_node");
			if (tile_down_anim_node) {
				tile_down_anim_node.removeFromParent();
				tile_down_anim_node = undefined;
			}
			if (i < 3) {
				this.update_player_hand_tiles(i);
			}
		}
		var curPlayerSitNum = player.curGameRoom.curPlayerSitNum;
		if (player.serverSitNum == curPlayerSitNum && (player.curGameRoom.handTilesList[player.serverSitNum].length) % 3 == 2) {
			this.unlock_player_hand_tiles();
			var opDict = player.gameOperationAdapter.getDrawOpDict(player.curGameRoom.lastDrawTile);
			this.update_operation_panel(opDict, const_val.SHOW_DO_OP);
			//是否可以听牌
			if (player.gameOperationAdapter.checkCanTing(opDict)) {
				this.show_ting_panel(true);
			}
		} else {
			this.lock_player_hand_tiles();
		}
		// let canWinTiles = player.gameOperationAdapter.getCanWinTiles();
		// this.show_extra_panel(canWinTiles.length > 0);
	},

});
