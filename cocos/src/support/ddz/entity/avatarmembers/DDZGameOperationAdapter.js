"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var DDZGameOperationAdapter = DDZPlaybackOperationAdapter.extend({

	startGame: function (startInfo) {
		var currentIdx = startInfo["current_idx"];
		var tileList = startInfo["tiles"];
		var hostCards = startInfo["host_cards"];
		var swap_list = startInfo["swap_list"];
		cc.log(currentIdx, tileList, hostCards, swap_list);

		var self = this;
		//交换位置 玩家当前在服务端的位置也改变
		var enterPlayerInfoList = cutil.deepCopy(this.curGameRoom.playerInfoList);
		cc.log(enterPlayerInfoList);
		this.serverSitNum = swap_list.indexOf(this.serverSitNum);
		this.curGameRoom.swap_seat(swap_list);
		this.curGameRoom.curPlayerSitNum = currentIdx;
		this.curGameRoom.canContinue = null;
		this.curGameRoom.dealerIdx = -1;
		this.curGameRoom.hostCards = hostCards;
		this.curGameRoom.startGame();
		let startTilesList = cutil.deepCopy(this.curGameRoom.handTilesList);
		startTilesList[this.serverSitNum] = tileList.concat([]);
		startTilesList[this.serverSitNum].sort(ddz_rules.poker_compare2);
		cc.log("startGame", startTilesList[this.serverSitNum]);

		this.curGameRoom.handTilesList[this.serverSitNum] = tileList;
		this.curGameRoom.handTilesList[this.serverSitNum].sort(ddz_rules.poker_compare2);

		if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui) {
			h1global.curUIMgr.gameroomprepare_ui.hide();
		}

		this.sourcePlayer.startActions["GameRoomUI"] = function () {
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("init_game_info_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("show_cover_cards_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("init_player_wait_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("startBeginAnim", startTilesList[self.serverSitNum], self.serverSitNum, self.curGameRoom);
			}
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_dealer_idx", self.curGameRoom.dealerIdx);
			if (onhookMgr && self.curGameRoom.op_seconds > 0) {
				onhookMgr.setWaitLeftTime(self.curGameRoom.op_seconds + const_ddz.BEGIN_ANIMATION_TIME)
			} else if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
				onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN + const_val.FAKE_BEGIN_ANIMATION_TIME);
			}
		};

		if (this.curGameRoom.curRound <= 1) {
			this.sourcePlayer.startActions["GameRoomScene"] = function () {
				if (h1global.curUIMgr && h1global.curUIMgr.gameroominfo_ui) {
					if (h1global.curUIMgr.gameroominfo_ui.is_show) {
						h1global.curUIMgr.gameroominfo_ui.hide();
					}
					h1global.curUIMgr.gameroominfo_ui.show_by_info(GameRoomInfoUI.ResourceFile3D);
				}
				h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
					if (complete && self.sourcePlayer.startActions["GameRoomUI"]) {
						self.sourcePlayer.startActions["GameRoomUI"]();
						self.sourcePlayer.startActions["GameRoomUI"] = undefined;
					}
				});
			}
		}
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			// 如果GameRoomScene已经加载完成
			if (this.sourcePlayer.startActions["GameRoomScene"]) {
				this.sourcePlayer.startActions["GameRoomScene"]();
				this.sourcePlayer.startActions["GameRoomScene"] = undefined;
			} else {
				h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
					if (complete) {
						if (self.sourcePlayer.startActions["GameRoomUI"]) {
							self.sourcePlayer.startActions["GameRoomUI"]();
							self.sourcePlayer.startActions["GameRoomUI"] = undefined;
						}
					}
				});
			}
		}

		if (h1global.curUIMgr && h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show) {
			h1global.curUIMgr.gameroominfo_ui.update_round();
		}
		// if (h1global.curUIMgr && h1global.curUIMgr.gameconfig_ui && h1global.curUIMgr.gameconfig_ui.is_show) {
		//     h1global.curUIMgr.gameconfig_ui.update_state();
		// }

		if (h1global.curUIMgr && h1global.curUIMgr.config_ui && h1global.curUIMgr.config_ui.is_show) {
			h1global.curUIMgr.config_ui.update_state();
		}
		// 关闭结算界面
		if (h1global.curUIMgr && h1global.curUIMgr.settlement_ui) {
			h1global.curUIMgr.settlement_ui.hide();
		}
		if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.hide();
		}
	},

	redeal: function (currentIdx, tileList, hostCards) {
		cc.log("redeal", tileList, hostCards);
		this.curGameRoom.curPlayerSitNum = currentIdx;
		this.curGameRoom.hostCards = hostCards;
		this.curGameRoom.startGame();
		this.curGameRoom.handTilesList[this.serverSitNum] = tileList;
		this.curGameRoom.handTilesList[this.serverSitNum].sort(ddz_rules.poker_compare2);

		let curGameRoom = this.curGameRoom;
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_dealer_txt_panel");
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("redeal", curGameRoom);
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("startBeginAnim", tileList, this.serverSitNum, curGameRoom);
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_game_info_panel", currentIdx);
		}
		if (onhookMgr && this.curGameRoom.op_seconds > 0) {
			onhookMgr.setWaitLeftTime(this.curGameRoom.op_seconds + const_ddz.BEGIN_ANIMATION_TIME)
		} else if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
			onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN + const_val.FAKE_BEGIN_ANIMATION_TIME);
		}
	},

	readyForNextRound: function (serverSitNum) {
		this._super(serverSitNum);
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			let index = this.server2CurSitNum(serverSitNum);
			h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
				if (!ui.playResultAnim) {
					ui.update_player_ready_state(serverSitNum, 1);
					ui.hide_player_desk_panel(index);
				}
			});
		}

		if (h1global.curUIMgr && h1global.curUIMgr.config_ui && h1global.curUIMgr.config_ui.is_show) {
			if (serverSitNum === this.serverSitNum) {
				h1global.curUIMgr.config_ui.update_state();
			}
		}
	},

	postOperation: function (serverSitNum, aid, data, nextServerSitNum) {
		cc.log("postOperation: ", serverSitNum, aid, data, nextServerSitNum);
		var self = this;
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
				if (ui.beginAnimPlaying) {
					ui.stopBeginAnim(self.serverSitNum, self.curGameRoom);
					self.sourcePlayer.startActions["GameRoomUI"] = undefined;
				}
			});
		}
		//每次操作 改变时钟的位置
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_game_info_panel", nextServerSitNum);
		}

		if (aid === const_ddz.OP_PASS) {
			this.curGameRoom.curPlayerSitNum = nextServerSitNum;

			this.curGameRoom.discard_record.push([]);
			if (this.curGameRoom.discard_record.length > 3) {
				this.curGameRoom.discard_record.splice(0, 1);
			}

			this.sourcePlayer.showWaitOperationTime();
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				// h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_desk_panel", this.server2CurSitNum(serverSitNum));
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_desk_tiles", serverSitNum, [], this.serverSitNum, this.curGameRoom);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_desk_panel", this.server2CurSitNum(nextServerSitNum));
				if (this.serverSitNum === nextServerSitNum) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("unlock_player_hand_tiles");
				} else {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
				}
			}
			let passIndex = parseInt(Math.random() * 4 + 1);
			if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
				cutil.playEffect(this.gameType, "male/pass" + passIndex + ".mp3");
			} else {
				cutil.playEffect(this.gameType, "female/pass" + passIndex + ".mp3");
			}
		} else if (aid === const_ddz.OP_FIGHT_DEALER) {
			if (this.curGameRoom.fight_dealer_mul_list[serverSitNum] === -1) {
				this.curGameRoom.fight_dealer_mul_list[serverSitNum] = data[0];
			} else if (this.curGameRoom.fight_dealer_mul_list[serverSitNum] === const_ddz.GET_DEALER_MUL && data[0] > 0 && !data[1]) {//这个!data[1] 用来判断最后一家抢庄成功的情况
				this.curGameRoom.fight_dealer_mul_list[serverSitNum] *= data[0];
			}
			this.curGameRoom.curPlayerSitNum = nextServerSitNum;
			this.sourcePlayer.showWaitOperationTime();
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_dealer_mul_panel", serverSitNum, data[0]);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_multiple_panel");
				if (nextServerSitNum === this.serverSitNum) {
					let score = this.curGameRoom.fight_dealer_mul_list[nextServerSitNum];
					if (score === -1 || score === const_ddz.GET_DEALER_MUL) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_dealer_operation_panel");
					} else {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel");
					}
				} else {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel");
				}
				for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", i, this.curGameRoom.playerInfoList[i]);
				}

				if (collections.sum(this.curGameRoom.fight_dealer_mul_list) === 0) {
					//
				}
			}

			if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
				if (data[0] === const_ddz.GET_DEALER_MUL) {
					cutil.playEffect(this.gameType, "male/jiaodizhu.mp3");
				} else if (data[0] === const_ddz.FIGHT_DEALER_MUL) {
					cutil.playEffect(this.gameType, "male/qiangdizhu.mp3");
				} else if (data[0] === 0) {
					if (collections.max(this.curGameRoom.fight_dealer_mul_list) === const_ddz.GET_DEALER_MUL) {
						cutil.playEffect(this.gameType, "male/buqiang.mp3");
					} else {
						cutil.playEffect(this.gameType, "male/bujiao.mp3");
					}
				}
			} else {
				if (data[0] === const_ddz.GET_DEALER_MUL) {
					cutil.playEffect(this.gameType, "female/jiaodizhu.mp3")
				} else if (data[0] === const_ddz.FIGHT_DEALER_MUL) {
					cutil.playEffect(this.gameType, "female/qiangdizhu.mp3")
				} else if (data[0] === 0) {
					if (collections.max(this.curGameRoom.fight_dealer_mul_list) === const_ddz.GET_DEALER_MUL) {
						cutil.playEffect(this.gameType, "female/buqiang.mp3");
					} else {
						cutil.playEffect(this.gameType, "female/bujiao.mp3");
					}
				}
			}
		} else if (aid === const_ddz.OP_BET) {
			this.sourcePlayer.showWaitOperationTime();
			this.curGameRoom.curPlayerSitNum = nextServerSitNum;
			this.curGameRoom.bet_score_list[serverSitNum] = data[0];
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_bet_score_panel", serverSitNum, data[0], true);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_dealer_operation_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_multiple_panel");
			}

			if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
				if (data[0] === 0) {
					cutil.playEffect(this.gameType, "male/bujiao.mp3");
				} else if (data[0] === 3 && collections.sum(this.curGameRoom.bet_score_list) === 1) {
					cutil.playEffect(this.gameType, "male/first_callscore3.mp3");
				} else {
					cutil.playEffect(this.gameType, "male/score" + data[0] + ".mp3");
				}
			} else {
				if (data[0] === 0) {
					cutil.playEffect(this.gameType, "female/bujiao.mp3");
				} else if (data[0] === 3 && collections.sum(this.curGameRoom.bet_score_list) === 1) {
					cutil.playEffect(this.gameType, "female/first_callscore3.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/score" + data[0] + ".mp3");
				}
			}
		} else if (aid === const_ddz.OP_EXCHANGE) {
			this.curGameRoom.handTilesList[serverSitNum] = data.slice(0);
			cc.error("not imp OP_EXCHANGE")
		} else if (aid === const_ddz.OP_CONFIRM_DEALER) {
			if (this.curGameRoom.game_mode === const_ddz.GAME_MODE_SCORE) {
				this.postOperation(serverSitNum, const_ddz.OP_BET, data, nextServerSitNum);
			} else {
				if (data[0] > 2) {
					data[1] = 1;
					cc.log("只有最后一家抢庄成功的时候", data);
				}
				this.postOperation(serverSitNum, const_ddz.OP_FIGHT_DEALER, data, nextServerSitNum);
			}
			this.sourcePlayer.showWaitOperationTime();
			this.curGameRoom.dealerIdx = nextServerSitNum;
			this.curGameRoom.curPlayerSitNum = nextServerSitNum;
			this.curGameRoom.handTilesList[nextServerSitNum] = this.curGameRoom.handTilesList[nextServerSitNum].concat(this.curGameRoom.hostCards).sort(ddz_rules.poker_compare2);
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_dealer_idx", nextServerSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_dealer_txt_panel");
				// h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_fight_dealer_anim", serverSitNum);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", nextServerSitNum, this.curGameRoom.handTilesList[nextServerSitNum]);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_host_cards_panel", this.curGameRoom.hostCards);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("play_flip_anime", this.curGameRoom.hostCards);
				for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", i, this.curGameRoom.playerInfoList[i]);
				}
				// if (this.serverSitNum === nextServerSitNum) {
				// 	h1global.curUIMgr.roomLayoutMgr.notifyObserver("unlock_player_hand_tiles");
				// 	h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel");
				// } else {
				// 	h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
				// }
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel");
			}
		} else if (aid === const_ddz.OP_MUL) {
			this.curGameRoom.mul_score_list[serverSitNum] = data[0];
			// 显示加倍字
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_mul_panel", serverSitNum, data[0]);
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_head_mul", serverSitNum, data[0]);
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel");
			if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
				if (data[0] === 2) {
					cutil.playEffect(this.gameType, "male/jiabei.mp3");
				}else {
					cutil.playEffect(this.gameType, "male/bujiabei.mp3");
				}
			} else {
				if (data[0] === 2) {
					cutil.playEffect(this.gameType, "female/jiabei.mp3");
				}else {
					cutil.playEffect(this.gameType, "female/bujiabei.mp3");
				}
			}
			if (collections.all(this.curGameRoom.mul_score_list , function (x) {
				return x > 0;
			}) || collections.count(this.curGameRoom.mul_score_list,1) === 2) {
				// 开始打牌  显示按钮
				this.sourcePlayer.showWaitOperationTime();
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_mul_txt_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel");
			}
		} else if (aid === const_ddz.OP_DISCARD) {
			var oldLastDiscardIdx = this.curGameRoom.last_discard_idx;
			this.sourcePlayer.showWaitOperationTime();
			this.curGameRoom.curPlayerSitNum = nextServerSitNum;
			this.curGameRoom.last_discard_idx = serverSitNum;
			this.curGameRoom.discard_record.push(data);
			if (this.curGameRoom.discard_record.length > 3) {
				this.curGameRoom.discard_record.splice(0, 1);
			}
			if (this.curGameRoom.boom_times < this.curGameRoom.max_boom_times && (ddz_rules.is_pair4(data, false, false)[0] || ddz_rules.is_pair_joker(data)[0] || ddz_rules.is_flower(data)[0])) {
				this.curGameRoom.boom_times++;
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_boom_times", this.curGameRoom.boom_times);
				}
			}
			let handTilesList = this.curGameRoom.handTilesList[serverSitNum];
			if (this.serverSitNum === serverSitNum || this.runMode === const_val.GAME_ROOM_PLAYBACK_MODE) {
				collections.removeArray(handTilesList, data);
			} else {
				handTilesList.splice(0, data.length);
			}
			// 已经是最后一手牌了
			var isLastTile = handTilesList.length === 0;

			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_hand_tiles", serverSitNum, handTilesList);
				for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", i, this.curGameRoom.playerInfoList[i]);
				}
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				if (this.serverSitNum === nextServerSitNum && !isLastTile) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("unlock_player_hand_tiles");
				} else {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
				}
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_desk_tiles", serverSitNum, data, this.serverSitNum, this.curGameRoom);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_desk_panel", this.server2CurSitNum(nextServerSitNum));
			}
			if (handTilesList.length === 2) {
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/lastcard2.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/lastcard2.mp3");
				}
			} else if (handTilesList.length === 1) {
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/lastcard1.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/lastcard1.mp3");
				}
			} else {
				this.playDiscardSound(serverSitNum, data, oldLastDiscardIdx)
			}
		}
		// if (this.serverSitNum !== serverSitNum && h1global.curUIMgr.roomLayoutMgr) {
		//     h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_operation_panel");
		// }
	},

	playDiscardSound: function (serverSitNum, data, lastDiscardIdx) {
		var info = ddz_rules.test_with_rule(data, false, false, true, this.curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER, this.curGameRoom.only3_1);
		if (!info[0]) {
			return
		}
		var lastType = null;
		if (lastDiscardIdx !== -1 && serverSitNum !== lastDiscardIdx) {
			var last = this.curGameRoom.getLastDiscard(lastDiscardIdx);
			var lastInfo = ddz_rules.test_with_rule(last, false, false, true, this.curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER, this.curGameRoom.only3_1);
			if (lastInfo[0]) {
				lastType = lastInfo[1];
			}
		}
		var playDiscardVoice = false;
		if (lastType && (lastType !== ddz_rules.TYPE_SINGLE && lastType !== ddz_rules.TYPE_PAIR2)) {
			playDiscardVoice = lastDiscardIdx !== -1 && serverSitNum !== lastDiscardIdx;
		}
		var passIndex = parseInt(Math.random() * 3 + 1);
		var type = info[1];
		var soundName = null;
		if (type === ddz_rules.TYPE_SINGLE) {
			soundName = info[2];
		} else if (type === ddz_rules.TYPE_FLOWER) {
			// if (playDiscardVoice) {
			// 	soundName = "discard" + passIndex;
			// } else {
			// 	soundName = "zhadan";
			// }
			soundName = "zhadan";
		} else if (type === ddz_rules.TYPE_PAIR2) {
			soundName = "dui" + info[2];
		} else if (type === ddz_rules.TYPE_SEQ_PAIR2) {
			soundName = "liandui";
		} else if (type === ddz_rules.TYPE_SEQ_PAIR3_1 || type === ddz_rules.TYPE_SEQ_PAIR3_2 || type === ddz_rules.TYPE_SEQ_PAIR3) {
			if (playDiscardVoice) {
				soundName = "discard" + passIndex;
			} else {
				soundName = "plane1";
			}
		} else if (type === ddz_rules.TYPE_PAIR4) {
			// if (playDiscardVoice) {
			// 	soundName = "discard" + passIndex;
			// } else {
			// 	soundName = "zhadan";
			// }
			soundName = "zhadan";
		} else if (type === ddz_rules.TYPE_PAIR_JOKER) {
			soundName = "wangzha";
		} else if (type === ddz_rules.TYPE_PAIR3) {
			if (playDiscardVoice) {
				soundName = "discard" + passIndex;
			} else {
				soundName = "sanbudai";
			}
		} else if (type === ddz_rules.TYPE_SEQ) {
			if (playDiscardVoice) {
				soundName = "discard" + passIndex;
			} else {
				soundName = "shunzi";
			}
		} else if (type === ddz_rules.TYPE_PAIR3_1) {
			if (playDiscardVoice) {
				soundName = "discard" + passIndex;
			} else {
				soundName = "sandai1";
			}
		} else if (type === ddz_rules.TYPE_PAIR3_2) {
			if (playDiscardVoice) {
				soundName = "discard" + passIndex;
			} else {
				soundName = "sandai2";
			}
		} else if (type === ddz_rules.TYPE_PAIR4_2_1 || type === ddz_rules.TYPE_PAIR4_2_2) {
			if (playDiscardVoice) {
				soundName = "discard" + passIndex;
			} else {
				soundName = "sidai2";
			}
		} else {
			return;
		}
		if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
			cutil.playEffect(this.gameType, "male/" + soundName + ".mp3")
		} else {
			cutil.playEffect(this.gameType, "female/" + soundName + ".mp3")
		}
	},

	selfPostOperation: function (aid, data) {
		cc.log("selfPostOperation", aid, data);
		// 由于自己打的牌自己不需要经服务器广播给自己，因而只要在doOperation时，自己postOperation给自己
		// 而doOperation和postOperation的参数不同，这里讲doOperation的参数改为postOperation的参数
		var nextServerSitNum = null;
		if (aid === const_ddz.OP_PASS) {
			nextServerSitNum = (this.serverSitNum + 1) % this.curGameRoom.player_num;
		} else if (aid === const_ddz.OP_FIGHT_DEALER) {
			nextServerSitNum = this.serverSitNum;
			var count = this.curGameRoom.player_num * 3;
			while (count > 0) {
				count--;
				nextServerSitNum = (nextServerSitNum + 1) % this.curGameRoom.player_num;
				if (nextServerSitNum == this.curPlayerSitNum) {
					nextServerSitNum = this.serverSitNum;
				}
				if (this.curGameRoom.fight_dealer_mul_list[nextServerSitNum] == -1 ||
					this.curGameRoom.fight_dealer_mul_list[nextServerSitNum] == const_ddz.GET_DEALER_MUL) {
					break
				}
			}
			// nextServerSitNum = (this.serverSitNum + 1) % this.curGameRoom.player_num;
		} else if (aid === const_ddz.OP_BET) {
			nextServerSitNum = (this.serverSitNum + 1) % this.curGameRoom.player_num;
		} else if (aid === const_ddz.OP_DISCARD) {
			nextServerSitNum = (this.serverSitNum + 1) % this.curGameRoom.player_num;
		} else if (aid === const_ddz.OP_MUL) {
			nextServerSitNum = this.curGameRoom.dealerIdx;
		} else if (aid === const_ddz.OP_EXCHANGE) {

		} else if (aid === const_ddz.OP_CONFIRM_DEALER) {
		} else {
			cc.warn("unknown aid : " + aid);
		}
		// 用于转换doOperation到postOperation的参数
		this.postOperation(this.serverSitNum, aid, data, nextServerSitNum);
	},

	doOperation: function (aid, data) {
		cc.log("doOperation: ", aid, data);
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
		}
		// 自己的操作直接本地执行，不需要广播给自己
		this.selfPostOperation(aid, data);
		this.sourcePlayer.cellCall("doOperation", aid, data);
	},

	waitForOperation: function (aid_list, data_list) {
		cc.log("waitForOperation", aid_list, data_list);
		if (!this.curGameRoom) {
			return;
		}
		this.curGameRoom.waitAidList = aid_list;
		this.curGameRoom.waitDataList = data_list;
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_operation_panel", this.getWaitOpDict(aid_list, data_list), const_ddz.SHOW_CONFIRM_OP);
		}
	},

	roundResult: function (roundRoomInfo) {
		var playerInfoList = roundRoomInfo["player_info_list"];
		for (var i = 0; i < playerInfoList.length; i++) {
			let idx = playerInfoList[i]['idx'];
			this.curGameRoom.playerInfoList[idx]["score"] = playerInfoList[i]["score"];
			this.curGameRoom.playerInfoList[idx]["total_score"] = playerInfoList[i]["total_score"];
		}
		var self = this;

		// Note: 此处只在回放上
		var replay_func = undefined;
		if (self.runMode === const_val.GAME_ROOM_PLAYBACK_MODE) {
			replay_func = arguments[1];
		}

		var curGameRoom = this.curGameRoom;
		var serverSitNum = this.serverSitNum;

		function callbackfunc() {
			if (h1global.curUIMgr.settlement_ui) {
				if (self.runMode === const_val.GAME_ROOM_PLAYBACK_MODE) {
					h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom, undefined, replay_func);
				} else {
					h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom);
				}
			}
		}

		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			if (h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", playerInfoList);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_multiple_panel", roundRoomInfo['spring'], 1);
				h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, playerInfoList, roundRoomInfo['result_list'], curGameRoom, serverSitNum, roundRoomInfo['spring']);
			} else {
				h1global.curUIMgr.roomLayoutMgr.registerShowObserver(function () {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_hand_tiles", self.serverSitNum);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", playerInfoList);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_multiple_panel", roundRoomInfo['spring'], 1);
					h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, playerInfoList, roundRoomInfo['result_list'], curGameRoom, serverSitNum, roundRoomInfo['spring']);
				})
			}
		} else {
			callbackfunc();
		}

		if (roundRoomInfo['spring'] === 1) {
			if (roundRoomInfo['win_idx'] === this.serverSitNum || (curGameRoom.dealerIdx !== roundRoomInfo['win_idx'] && this.serverSitNum !== curGameRoom.dealerIdx)) {
				if (curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/spring_win_voice1.mp3")
				} else {
					cutil.playEffect(this.gameType, "female/spring_win_voice1.mp3")
				}
			} else {
				if (curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/spring_fail_voice1.mp3")
				} else {
					cutil.playEffect(this.gameType, "female/spring_fail_voice1.mp3")
				}
			}
		}

	},

	resetRoom: function (roomInfo) {
		this.runMode = const_val.GAME_ROOM_GAME_MODE;
		this.curGameRoom = new GameRoomEntity(roomInfo['player_num']);
		this.curGameRoom.updateRoomData(roomInfo);
		// Note: 续房的时候房主退出房间的标记， 为了在房主退出时给其他玩家提示
		this.curGameRoom.canContinue = true;
		this.curGameRoom.playerStateList = roomInfo["player_state_list"];
		cutil.clearEnterRoom();
	},

	finalResult: function (finalPlayerInfoList, roundRoomInfo) {
		if (onhookMgr) {
			onhookMgr.setWaitLeftTime(null);
		}
		// Note: 为了断线重连后继续停留在总结算上，此处设置一个标志位作为判断
		if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.finalResultFlag = true;
		}

		let curGameRoom = this.curGameRoom;
		let serverSitNum = this.serverSitNum;
		let canContinue = roundRoomInfo['continue_list'][serverSitNum] === const_val.ROOM_CONTINUE;

		var self = this;

		function callbackfunc(complete) {
			if (complete && h1global.curUIMgr.result_ui) {
				if (h1global.curUIMgr && h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
					h1global.curUIMgr.applyclose_ui.hide();
				}		
				h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom, function () {
					if (h1global.curUIMgr.result_ui) {
						h1global.curUIMgr.result_ui.show_by_info(finalPlayerInfoList, curGameRoom, serverSitNum, canContinue);
					}
				});
			}
			// Note: 此时的GameRoom已经是新创建的 更新游戏场不在房间的头像
			let newGameRoom = self.curGameRoom;
			if (h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
				for (var i = 0; i < const_ddz.MAX_PLAYER_NUM; i++) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_player_info_panel", i, newGameRoom.playerInfoList[i])
				}
			}
		}

		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			if (h1global.curUIMgr.roomLayoutMgr.isShow()) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", roundRoomInfo["player_info_list"]);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_multiple_panel", roundRoomInfo['spring'], 1);
				h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, roundRoomInfo["player_info_list"], roundRoomInfo['result_list'], curGameRoom, serverSitNum, roundRoomInfo['spring']);
			} else {
				h1global.curUIMgr.roomLayoutMgr.registerShowObserver(function () {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", roundRoomInfo["player_info_list"]);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_multiple_panel", roundRoomInfo['spring'], 1);
					h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, roundRoomInfo["player_info_list"], roundRoomInfo['result_list'], curGameRoom, serverSitNum, roundRoomInfo['spring']);
				})
			}
		} else {
			callbackfunc();
		}

		if (canContinue) {
			let initRoomInfo = roundRoomInfo['init_info'];
			this.resetRoom(initRoomInfo);
		}
	},

	subtotalResult: function (finalPlayerInfoList) {
		if (onhookMgr) {
			onhookMgr.setApplyCloseLeftTime(null);
		}

		if (h1global.curUIMgr && h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
			h1global.curUIMgr.applyclose_ui.hide();
			onhookMgr.applyCloseLeftTime = 0;
		}
		if (h1global.curUIMgr && h1global.curUIMgr.settlement_ui && h1global.curUIMgr.settlement_ui.is_show) {
			h1global.curUIMgr.settlement_ui.hide()
		}
		// Note: 为了断线重连后继续停留在总结算上，此处设置一个标志位作为判断
		if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.finalResultFlag = true;
		}
		var curGameRoom = this.curGameRoom;
		let serverSitNum = this.serverSitNum;
		if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.show_by_info(finalPlayerInfoList, curGameRoom, serverSitNum, false);
		}
	},

});
