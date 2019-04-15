"use strict";
var GSJMJGameOperationAdapter = GSJMJPlaybackOperationAdapter.extend({

	startGame: function (startInfo) {
		var dealerIdx = startInfo['dealer_idx'];
		var tileList = startInfo['beginTilesList'];
		var wreathsList = startInfo['wreathsList'];
		var kingTiles = startInfo['kingTiles'];
		var prevailing_wind = startInfo['prevailing_wind'];
		var playerWindList = startInfo['windsList'];
		var diceList = startInfo['diceList'];
		var self = this;

		this.runMode = const_val.GAME_ROOM_GAME_MODE;
		this.curGameRoom.startGame(kingTiles, wreathsList);
		this.curGameRoom.curPlayerSitNum = dealerIdx;
		this.diceList = diceList;
		this.curGameRoom.dealerIdx = dealerIdx;
		this.curGameRoom.prevailing_wind = prevailing_wind;
		this.curGameRoom.playerWindList = playerWindList;

		var startTilesList = cutil.deepCopy(this.curGameRoom.handTilesList);
		startTilesList[this.serverSitNum] = tileList.concat([]);
		cc.log("startGame", startTilesList[this.serverSitNum]);

		if (this.serverSitNum == dealerIdx) {
			var drawTile = tileList.pop(); // 庄家最后一张牌是牌局开始后摸上来的不参与排序
			this.curGameRoom.handTilesList[this.serverSitNum] = tileList;
			cutil_gsjmj.tileSort(this.curGameRoom.handTilesList[this.serverSitNum], kingTiles);
			this.curGameRoom.lastDrawTile = drawTile;
			//庄家最后一张牌放最后
			this.curGameRoom.handTilesList[this.serverSitNum].push(drawTile);
			this.curGameRoom.last_op = const_val.OP_DRAW;
		} else {
			this.curGameRoom.handTilesList[this.serverSitNum] = tileList;
			cutil_gsjmj.tileSort(this.curGameRoom.handTilesList[this.serverSitNum], kingTiles);
			this.curGameRoom.handTilesList[dealerIdx].push(0) //庄家开局多一张牌的
		}

		if (h1global.curUIMgr.gameroomprepare_ui) {
			h1global.curUIMgr.gameroomprepare_ui.hide();
		}

		this.sourcePlayer.startActions["GameRoomUI"] = function () {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("startBeginAnim", startTilesList, diceList, dealerIdx);
			if (onhookMgr && const_gsjmj.FAKE_COUNTDOWN > 0) {
				onhookMgr.setWaitLeftTime(const_gsjmj.FAKE_COUNTDOWN + const_gsjmj.FAKE_BEGIN_ANIMATION_TIME);
			}
			cc.audioEngine.playEffect("res/sound/effect/saizi_music.mp3");
		};

		if (this.curGameRoom.curRound <= 1) {
			this.sourcePlayer.startActions["GameRoomScene"] = function () {
				if (h1global.curUIMgr.gameroominfo_ui) {
					if (h1global.curUIMgr.gameroominfo_ui.is_show) {
						h1global.curUIMgr.gameroominfo_ui.hide();
					}
					h1global.curUIMgr.gameroominfo_ui.show_by_info();
				}
				if (h1global.curUIMgr.gps_ui) {
					h1global.curUIMgr.gps_ui.show();
				}
			}
            gameroomUIMgr.game_start();
		}
		if (h1global.curUIMgr.roomLayoutMgr) {
			// 如果GameRoomScene已经加载完成
			if (this.sourcePlayer.startActions["GameRoomScene"]) {
				this.sourcePlayer.startActions["GameRoomScene"]();
				this.sourcePlayer.startActions["GameRoomScene"] = undefined;
			} else {
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide");
					h1global.curUIMgr.roomLayoutMgr.showGameRoomUI(function (complete) {
						if (complete) {
							if (self.sourcePlayer.startActions["GameRoomUI"]) {
								self.sourcePlayer.startActions["GameRoomUI"]();
								self.sourcePlayer.startActions["GameRoomUI"] = undefined;
							}
						}
					});
				}
			}
		}

		if (h1global.curUIMgr && h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show) {
			h1global.curUIMgr.gameroominfo_ui.update_round();
			h1global.curUIMgr.gameroominfo_ui.update_round_wind(prevailing_wind);
		}
		if (h1global.curUIMgr && h1global.curUIMgr.gameconfig_ui && h1global.curUIMgr.gameconfig_ui.is_show) {
			h1global.curUIMgr.gameconfig_ui.update_state();
		}
		// 关闭结算界面
		if (h1global.curUIMgr && h1global.curUIMgr.settlement_ui) {
			h1global.curUIMgr.settlement_ui.hide();
		}
		if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.hide();
		}
	},

	removeHandTile: function (serverSitNum, tileNum, count, sort) {
		sort = sort || this.runMode === const_val.GAME_ROOM_PLAYBACK_MODE;
		if (this.runMode === const_val.GAME_ROOM_PLAYBACK_MODE || serverSitNum == this.serverSitNum) {
			var index = -1;
			for (var i = 0; i < count; i++) {
				index = this.curGameRoom.handTilesList[serverSitNum].indexOf(tileNum);
				if (index >= 0) {
					this.curGameRoom.handTilesList[serverSitNum].splice(index, 1)
				}
			}
			index = undefined;
		} else {
			this.curGameRoom.handTilesList[serverSitNum].splice(0, count);
		}
		if (sort) {
			this.curGameRoom.handTilesList[serverSitNum].sort(cutil_gsjmj.tileSortFunc);
		}
	},

	postOperation: function (serverSitNum, aid, tileList) {
		cc.log("postOperation: ", serverSitNum, aid, tileList);
		var self = this;
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
				if (ui.beginAnimPlaying) {
					ui.stopBeginAnim();
					self.sourcePlayer.startActions["GameRoomUI"] = undefined;
				}
			});
		}
		if (aid == const_val.OP_PASS) {
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles",this.serverSitNum);
            cc.warn("更新手牌");
		} else if (aid == const_val.OP_DRAW) {
			if (onhookMgr && const_gsjmj.FAKE_COUNTDOWN > 0) {
				onhookMgr.setWaitLeftTime(const_gsjmj.FAKE_COUNTDOWN);
			}
            h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles",this.serverSitNum);
			// 设置当前玩家
			this.curGameRoom.curPlayerSitNum = serverSitNum;
			this.curGameRoom.lastDrawTile = tileList[0];
			this.curGameRoom.leftTileNum--;

			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_roominfo_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel"); //如果自己碰，自动过了，然后轮到自己摸会出现问题 这里先hide，后自摸show
			}

			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.handTilesList[this.serverSitNum].push(tileList[0]);
				cc.log("this.curGameRoom.handTilesList");
				cc.log(this.curGameRoom.handTilesList);
				this.curGameRoom.last_op = const_val.OP_DRAW;
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_curplayer_panel", this.serverSitNum);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("show_extra_panel", false);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				}
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
					cc.log("post operation draw===>");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getDrawOpDict(tileList[0]), const_val.SHOW_DO_OP);
					if (this.runMode === const_val.GAME_ROOM_PLAYBACK_MODE) {
						this.selfWaitForOperation(serverSitNum, this.getDrawOpDict(tileList[0], serverSitNum), this.nextOp());
					}
				}

				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
						if (ui.is_show) {
							if (ui.beginAnimPlaying) {
								ui.lock_player_hand_tiles();
							} else {
								ui.unlock_player_hand_tiles();
							}
						}
					});
				}
			} else {
				this.curGameRoom.handTilesList[serverSitNum].push(tileList[0]);
				if (this.runMode === const_val.GAME_ROOM_PLAYBACK_MODE) {
					this.selfWaitForOperation(serverSitNum, this.getDrawOpDict(tileList[0], serverSitNum), this.nextOp());
				}
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_curplayer_panel", serverSitNum);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				}
			}
		} else if (aid == const_val.OP_DISCARD) {
			this.curGameRoom.lastDiscardTile = tileList[0];
			this.curGameRoom.lastDiscardTileFrom = serverSitNum;
			this.curGameRoom.op_limit[serverSitNum] = {};
			if (this.serverSitNum == serverSitNum) {
				cc.log("DEBUG###DISCARD:", this.curGameRoom.handTilesList[this.serverSitNum]);
				this.curGameRoom.last_op = const_val.OP_DISCARD;
				this.removeHandTile(this.serverSitNum, tileList[0], 1, true);
				// var canWinTiles = this.getCanWinTiles()
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", this.serverSitNum);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
				}
			} else {
				this.removeHandTile(serverSitNum, tileList[0], 1);
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				}
			}
			this.curGameRoom.discardTilesList[serverSitNum].push(tileList[0]);
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_discard_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_discard_anim", serverSitNum);
				if (this.serverSitNum == serverSitNum) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_canwin_tile_panel", const_gsjmj.NOT_DISPLAY_CANWIN_PANEL);
				}
			}
			if (this.curGameRoom.kingTiles.indexOf(tileList[0]) >= 0) {
				if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
					cutil.playEffect(this.gameType, "male/sound_man_piao.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/sound_woman_piao.mp3");
				}
			} else {
				if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
					cutil.playEffect(this.gameType, 'male/sound_man_' + tileList[0].toString() + '.mp3');
				} else {
					cutil.playEffect(this.gameType, 'female/sound_woman_' + tileList[0].toString() + '.mp3');
				}
			}
			// cc.audioEngine.playEffect("res/sound/effect/sound_tileout.mp3");
		} else if (aid == const_val.OP_CHOW) {
			this.curGameRoom.curPlayerSitNum = serverSitNum;
			if (onhookMgr && const_gsjmj.FAKE_COUNTDOWN > 0) {
				onhookMgr.setWaitLeftTime(const_gsjmj.FAKE_COUNTDOWN);
			}
			if (this.serverSitNum == serverSitNum) {
				for (var i = 1; i < 3; i++) {
					this.removeHandTile(this.serverSitNum, tileList[i], 1, i === 2);
				}
				this.curGameRoom.last_op = const_val.OP_CHOW;

				cutil_gsjmj.tileSort(this.curGameRoom.handTilesList[this.serverSitNum], this.curGameRoom.kingTiles);
				var sortChowTiles = cutil_gsjmj.sortChowTileList(tileList[0], tileList.concat());
				// cutil.tileSort(sortChowTiles, this.curGameRoom.kingTiles);
				this.curGameRoom.upTilesList[this.serverSitNum].push(sortChowTiles);

				this.curGameRoom.upTilesOpsList[this.serverSitNum].push([{
					"opId": aid,
					"tiles": tileList.concat(),
					"fromIdx": this.curGameRoom.lastDiscardTileFrom
				}]);
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("unlock_player_hand_tiles");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getPongKongOpDict(), const_val.SHOW_DO_OP);
				}
			} else {
				// 手牌全是0，任意删除2张即可
				for (var i = 1; i < 3; i++) {
					this.removeHandTile(serverSitNum, tileList[i], 1, i === 2)
				}
				var sortChowTiles = cutil_gsjmj.sortChowTileList(tileList[0], tileList.concat());
				// cutil.tileSort(sortChowTiles, this.curGameRoom.kingTiles)
				this.curGameRoom.upTilesList[serverSitNum].push(sortChowTiles);
				this.curGameRoom.upTilesOpsList[serverSitNum].push([{
					"opId": aid,
					"tiles": tileList.concat(),
					"fromIdx": this.curGameRoom.lastDiscardTileFrom
				}]);
			}
			var lastDiscardTileFrom = this.curGameRoom.lastDiscardTileFrom;
			if (lastDiscardTileFrom >= 0) {
				this.curGameRoom.lastDiscardTile = 0;
				this.curGameRoom.lastDiscardTileFrom = -1;
				this.curGameRoom.discardTilesList[lastDiscardTileFrom].pop();
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				if (lastDiscardTileFrom >= 0) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("remove_last_discard_tile", lastDiscardTileFrom);
				}
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_curplayer_panel", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_up_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", aid, serverSitNum);

			}
			if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
				cutil.playEffect(this.gameType, "male/sound_man_chow.mp3");
			} else {
				cutil.playEffect(this.gameType, "female/sound_woman_chow.mp3");
			}
		} else if (aid == const_val.OP_PONG) {
			this.curGameRoom.curPlayerSitNum = serverSitNum;
			if (onhookMgr && const_gsjmj.FAKE_COUNTDOWN > 0) {
				onhookMgr.setWaitLeftTime(const_gsjmj.FAKE_COUNTDOWN);
			}
			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.last_op = const_val.OP_PONG;
				this.removeHandTile(this.serverSitNum, tileList[0], 2, true)

				this.curGameRoom.upTilesList[this.serverSitNum].push(tileList.concat());
				this.curGameRoom.upTilesOpsList[this.serverSitNum].push([{
					"opId": aid,
					"tiles": [tileList[0]],
					"fromIdx": this.curGameRoom.lastDiscardTileFrom
				}]);
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("show_extra_panel", false);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("unlock_player_hand_tiles");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getPongKongOpDict(), const_val.SHOW_DO_OP);
				}
			} else {
				// 手牌全是0，任意删除2张即可
				this.removeHandTile(serverSitNum, tileList[0], 2);

				this.curGameRoom.upTilesList[serverSitNum].push(tileList.concat());
				this.curGameRoom.upTilesOpsList[serverSitNum].push([{
					"opId": aid,
					"tiles": [tileList[0]],
					"fromIdx": this.curGameRoom.lastDiscardTileFrom
				}]);
			}
			var lastDiscardTileFrom = this.curGameRoom.lastDiscardTileFrom;
			if (lastDiscardTileFrom >= 0) {
				this.curGameRoom.lastDiscardTile = 0;
				this.curGameRoom.lastDiscardTileFrom = -1;
				this.curGameRoom.discardTilesList[lastDiscardTileFrom].pop();
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				if (lastDiscardTileFrom >= 0) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("remove_last_discard_tile", lastDiscardTileFrom);
				}
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_curplayer_panel", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_up_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", aid, serverSitNum);

			}
			if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
				cutil.playEffect(this.gameType, "male/sound_man_pong.mp3");
			} else {
				cutil.playEffect(this.gameType, "female/sound_woman_pong.mp3");
			}
		} else if (aid == const_val.OP_EXPOSED_KONG) {
			cc.log("明杠 OP_EXPOSED_KONG");
			var kongIdx = this.getContinueKongUpIdx(this.curGameRoom.upTilesList[serverSitNum], tileList[0]);
			// if(kongIdx < 0){
			// 直接明杠
			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.last_op = const_val.OP_EXPOSED_KONG;
				this.removeHandTile(this.serverSitNum, tileList[0], 3, true)
				this.curGameRoom.upTilesList[this.serverSitNum].push(tileList.concat());
				this.curGameRoom.upTilesOpsList[this.serverSitNum].push([{
					"opId": aid,
					"tiles": [tileList[0]],
					"fromIdx": this.curGameRoom.lastDiscardTileFrom
				}]);
			} else {
				// 手牌全是0，任意删除3张即可
				// this.curGameRoom.handTilesList[serverSitNum].splice(0, 3);
				this.removeHandTile(serverSitNum, tileList[0], 3)

				this.curGameRoom.upTilesList[serverSitNum].push(tileList);
				this.curGameRoom.upTilesOpsList[serverSitNum].push([{
					"opId": aid,
					"tiles": [tileList[0]],
					"fromIdx": this.curGameRoom.lastDiscardTileFrom
				}]);
			}
			var lastDiscardTileFrom = this.curGameRoom.lastDiscardTileFrom;
			var lastDiscardTile = this.curGameRoom.lastDiscardTile;
			// if(lastDiscardTileFrom >= 0 && this.serverSitNum != serverSitNum){
			if (lastDiscardTileFrom >= 0 && tileList[0] == lastDiscardTile) {
				this.curGameRoom.lastDiscardTile = 0;
				this.curGameRoom.lastDiscardTileFrom = -1;
				this.curGameRoom.discardTilesList[lastDiscardTileFrom].pop();
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				if (lastDiscardTileFrom >= 0 && tileList[0] == lastDiscardTile) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("remove_last_discard_tile", lastDiscardTileFrom);
				}
				// if (this.serverSitNum == serverSitNum){
				// h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getPongKongOpDict(), const_val.SHOW_DO_OP);
				// }
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_up_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", aid, serverSitNum);
			}
			if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
				cutil.playEffect(this.gameType, "male/sound_man_kong.mp3");
			} else {
				cutil.playEffect(this.gameType, "female/sound_woman_kong.mp3");
			}
		} else if (aid == const_val.OP_CONTINUE_KONG) {
			cc.log("风险杠 OP_CONTINUE_KONG");
			var kongIdx = this.getContinueKongUpIdx(this.curGameRoom.upTilesList[serverSitNum], tileList[0]);
			// 已有对应的碰的情况下加杠
			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.last_op = const_val.OP_CONTINUE_KONG;
				this.removeHandTile(this.serverSitNum, tileList[0], 1, true);

				this.curGameRoom.upTilesList[this.serverSitNum][kongIdx].push(tileList[0]);
				this.curGameRoom.upTilesOpsList[this.serverSitNum][kongIdx].push({
					"opId": aid,
					"tiles": [tileList[0]],
					"fromIdx": this.serverSitNum
				});
			} else {
				// 手牌全是0，任意删除1张即可
				this.removeHandTile(serverSitNum, tileList[0], 1);
				this.curGameRoom.upTilesList[serverSitNum][kongIdx].push(tileList[0]);
				this.curGameRoom.upTilesOpsList[serverSitNum][kongIdx].push({
					"opId": aid,
					"tiles": [tileList[0]],
					"fromIdx": serverSitNum
				});
			}
			var lastDiscardTileFrom = this.curGameRoom.lastDiscardTileFrom;
			var lastDiscardTile = this.curGameRoom.lastDiscardTile;
			// if(lastDiscardTileFrom >= 0 && this.serverSitNum != serverSitNum){
			if (lastDiscardTileFrom >= 0 && tileList[0] == lastDiscardTile) {
				this.curGameRoom.lastDiscardTile = 0;
				this.curGameRoom.lastDiscardTileFrom = -1;
				this.curGameRoom.discardTilesList[lastDiscardTileFrom].pop();
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				if (lastDiscardTileFrom >= 0 && tileList[0] == lastDiscardTile) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("remove_last_discard_tile", lastDiscardTileFrom);
				}
				// if (this.serverSitNum == serverSitNum){
				// h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getPongKongOpDict(), const_val.SHOW_DO_OP);
				// }
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_up_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", aid, serverSitNum);
			}
			if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
				cutil.playEffect(this.gameType, "male/sound_man_kong.mp3");
			} else {
				cutil.playEffect(this.gameType, "female/sound_woman_kong.mp3");
			}
		} else if (aid == const_val.OP_CONCEALED_KONG) {
			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.last_op = const_val.OP_CONCEALED_KONG;
				this.removeHandTile(this.serverSitNum, tileList[3], 4, true);
				this.curGameRoom.upTilesList[this.serverSitNum].push(tileList);
				this.curGameRoom.upTilesOpsList[this.serverSitNum].push([{
					"opId": aid,
					"tiles": [tileList[3]],
					"fromIdx": this.serverSitNum
				}]);
			} else {
				// 手牌全是0，任意删除4张即可
				this.removeHandTile(serverSitNum, tileList[3], 4);
				this.curGameRoom.upTilesList[serverSitNum].push(tileList);
				this.curGameRoom.upTilesOpsList[serverSitNum].push([{
					"opId": aid,
					"tiles": [tileList[3]],
					"fromIdx": serverSitNum
				}]);
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				// if (this.serverSitNum == serverSitNum){
				//     h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getPongKongOpDict(), const_val.SHOW_DO_OP);
				// }
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_up_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", aid, serverSitNum);
			}
			if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
				cutil.playEffect(this.gameType, "male/sound_man_kong.mp3");
			} else {
				cutil.playEffect(this.gameType, "female/sound_woman_kong.mp3");
			}
		} else if (aid == const_val.OP_DRAW_WIN) {
			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.last_op = const_val.aid;
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", aid, serverSitNum);
			}
			// if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
			// 	cutil.playEffect(this.gameType, "male/sound_man_draw_win.mp3");
			// } else {
			// 	cutil.playEffect(this.gameType, "female/sound_woman_draw_win.mp3");
			// }
		} else if (aid == const_val.OP_KONG_WIN || aid == const_val.OP_GIVE_WIN) {
			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.last_op = const_val.aid;
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", aid, serverSitNum);
			}
			// if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
			// 	cutil.playEffect(this.gameType, "male/sound_man_win.mp3");
			// } else {
			// 	cutil.playEffect(this.gameType, "female/sound_woman_win.mp3");
			// }
		} else if (aid == const_val.OP_READY) {

		} else if (aid == const_val.OP_CUT) {
			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.last_op = const_val.OP_CUT;
			}
			this.curGameRoom.leftTileNum--
			this.curGameRoom.cutIdxsList[serverSitNum].push(this.curGameRoom.discardTilesList[serverSitNum].length)
			this.curGameRoom.discardTilesList[serverSitNum].push(tileList[0]);
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_roominfo_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_discard_tiles", serverSitNum);
				// h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_discard_anim", serverSitNum)
			}
		} else if (aid == const_val.OP_KONG_WREATH) {
			cc.log("玩家 杠花")
			if (this.serverSitNum == serverSitNum) {
				this.curGameRoom.last_op = const_val.OP_KONG_WREATH;
			}
			var idx = this.curGameRoom.handTilesList[this.serverSitNum].indexOf(tileList[0]);
			if (idx >= 0) {
				this.curGameRoom.handTilesList[this.serverSitNum].splice(idx, 1);
			} else {
				//删除1张即可
				this.curGameRoom.handTilesList[serverSitNum].splice(0, 1);
			}
			this.curGameRoom.wreathsList[serverSitNum].push(tileList[0])

			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("playOperationEffect", const_val.OP_KONG_WREATH, serverSitNum, tileList[0]);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_wreath_panel", serverSitNum);
			}
			if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
				cutil.playEffect(this.gameType, "male/sound_man_buhua.mp3");
			} else {
				cutil.playEffect(this.gameType, "female/sound_woman_buhua.mp3");
			}
		}
		if (this.serverSitNum != serverSitNum && h1global.curUIMgr.roomLayoutMgr) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_wintips_btn");
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel");
		}
	},

	selfPostOperation: function (aid, tiles) {
		// 由于自己打的牌自己不需要经服务器广播给自己，因而只要在doOperation时，自己postOperation给自己
		// 而doOperation和postOperation的参数不同，这里讲doOperation的参数改为postOperation的参数
		var tileList = tiles.slice(0);
		if (aid == const_val.OP_PASS) {

		} else if (aid == const_val.OP_DRAW) {

		} else if (aid == const_val.OP_DISCARD) {

		} else if (aid == const_val.OP_CHOW) {

		} else if (aid == const_val.OP_PONG) {
			tileList = [tileList[0], tileList[0], tileList[0]];
		} else if (aid == const_val.OP_EXPOSED_KONG) {
			tileList = [tileList[0], tileList[0], tileList[0], tileList[0]];
		} else if (aid == const_val.OP_CONCEALED_KONG) {
			tileList = [0, 0, 0, tileList[0]];
		} else if (aid == const_val.OP_DRAW_WIN) {

		} else if (aid == const_val.OP_WREATH_WIN) {

		} else if (aid == const_val.OP_KONG_WIN) {

		} else if (aid == const_val.OP_GIVE_WIN) {

		} else if (aid == const_val.OP_READY) {

		} else if (aid == const_val.OP_KONG_WREATH) {

		}
		// 用于转换doOperation到postOperation的参数
		this.sourcePlayer.postOperation(this.serverSitNum, aid, tileList);
	},

	waitForOperation: function (aid_list, tileList) {
		cc.log("waitForOperation", aid_list, tileList);
		// 摸打模式
		this.curGameRoom.waitAidList = aid_list;
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getWaitOpDict(aid_list, tileList), const_val.SHOW_CONFIRM_OP);
		}
	},


	doOperation: function (aid, tileList) {
		cc.log("doOperation: ", aid, tileList);
		if (this.curGameRoom.curPlayerSitNum === this.serverSitNum && aid === const_val.OP_PASS) {
			return;
		}
		if (this.curGameRoom.curPlayerSitNum !== this.serverSitNum) {
			return;
		}
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_discard_tips");
		}
		// 自己的操作直接本地执行，不需要广播给自己
		this.selfPostOperation(aid, tileList);
		this.sourcePlayer.cellCall("doOperation", aid, tileList);
	},

	postWinOperation: function (serverSitNum, op, result) {
		// 播放 胡牌结果语音
		var value = -1; // 平胡 坎胡 吊胡 堆胡 坎堆胡 七对 清七对 清一色 一条龙 清一色套龙 十三幺 十三不靠
		var voice_list = ["draw_win", "win", "gangkai", "qiduizi", "qingqidui"];

		if (result.length <= 4) {
			if (result[0] > 0) {
				if (op === const_val.OP_KONG_WIN) {
					value = 2;
				} else {
					value = op === const_val.OP_DRAW_WIN ? 0 : 1;
				}
			} else if (result[5] > 0) {
				value = 3;
			} else if (result[6] > 0) {
				value = 4;
			}
		}

		if (value < 0) {
			value = op === const_val.OP_DRAW_WIN ? 0 : 1;
		}
		if(this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1){
			cutil.playEffect(this.gameType, "male/sound_man_" + voice_list[value] + ".mp3");
		} else {
			cutil.playEffect(this.gameType, "female/sound_woman_" + voice_list[value] + ".mp3");
		}

	},
});
