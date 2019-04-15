"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var LL7GameOperationAdapter = LL7PlaybackOperationAdapter.extend({

	startGame: function (startInfo) {
		cc.log("startGame", startInfo);
		var restart = startInfo.restart === 1;
		var self = this;
		this.curGameRoom.startGame();
		var pokers = startInfo["pokers"];
		this.curGameRoom.handTilesList[this.serverSitNum] = cutil_ll7.sort(pokers);
		if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui) {
			h1global.curUIMgr.gameroomprepare_ui.hide();
		}
		this.sourcePlayer.startActions["GameRoomUI"] = function () {
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
					ui.beginAnimPlaying = true;
				});
				h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
					if (complete) {
						if (restart) {
							h1global.curUIMgr.roomLayoutMgr.notifyObserver2("stopBeginAnim");
						}
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("init_game_info_panel");
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("init_player_wait_panel");
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_operation_panel");
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_panel", pokers, const_ll7.LORD_FIRST, []);
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", self.serverSitNum, const_ll7.LORD_FIRST, undefined, -1);
					}
				});
			}
			h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_dealer_idx", self.curGameRoom.mainServerSitNum, true);
			if (onhookMgr) {
				onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_JIAOZHU)
			}
		};

		if (restart) {
			this.sourcePlayer.startActions["GameRoomUI"]();
		}

		if (this.curGameRoom.curRound <= 1 && !restart) {
			this.sourcePlayer.startActions["GameRoomScene"] = function () {
				if (h1global.curUIMgr.gameroominfo_ui) {
					if (h1global.curUIMgr.gameroominfo_ui.is_show) {
						h1global.curUIMgr.gameroominfo_ui.hide();
					}
					h1global.curUIMgr.gameroominfo_ui.show_by_info(GameRoomInfoUI.ResourceFile2D);
				}
				h1global.curUIMgr.roomLayoutMgr.showGameRoomUI(function (complete) {
					if (complete && self.sourcePlayer.startActions["GameRoomUI"]) {
						self.sourcePlayer.startActions["GameRoomUI"]();
						self.sourcePlayer.startActions["GameRoomUI"] = undefined;
					}
				});
			}
			gameroomUIMgr.game_start();
		}
		if (h1global.curUIMgr.roomLayoutMgr && !restart) {
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

		// if (h1global.curUIMgr && h1global.curUIMgr.gameroominfo_ui && h1global.curUIMgr.gameroominfo_ui.is_show) {
		// 	h1global.curUIMgr.gameroominfo_ui.update_round();
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


	replayGpsUI: function (startInfo) {
		cc.log("startGame", startInfo);
		var self = this;
		var pokers = this.curGameRoom.handTilesList[this.serverSitNum];
		pokers = cutil_ll7.sort(pokers);
		if (h1global.curUIMgr && h1global.curUIMgr.gameroomprepare_ui) {
			h1global.curUIMgr.gameroomprepare_ui.hide();
		}
		this.sourcePlayer.startActions["GameRoomUI"] = function () {
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
					ui.beginAnimPlaying = true;
				});
				h1global.curUIMgr.roomLayoutMgr.startGame(function (complete) {
					if (complete) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("init_game_info_panel");
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("init_player_wait_panel");
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("startBeginAnim", [].concat(pokers), self.serverSitNum);
					}
				});
			}
			h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_dealer_idx", self.curGameRoom.mainServerSitNum, true);
			if (onhookMgr && self.curGameRoom.op_seconds > 0) {
				onhookMgr.setWaitLeftTime(self.curGameRoom.op_seconds + const_ddz.BEGIN_ANIMATION_TIME)
			} else if (onhookMgr && const_val.FAKE_COUNTDOWN > 0) {
				onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN + const_val.FAKE_BEGIN_ANIMATION_TIME);
			}
		};

		if (h1global.curUIMgr.roomLayoutMgr) {
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
	},

	readyForNextRound: function (serverSitNum) {
		if (!this.curGameRoom) {
			return;
		}
		this._super(serverSitNum);
		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
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

		if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && this.curGameRoom.curRound > 0) {
			h1global.curUIMgr.gameroomprepare_ui.hide();
		}
	},

	secondDeal: function (pokers) {
		let temp = this.curGameRoom.handTilesList[this.serverSitNum].concat(collections.shuffle(pokers));
		if (this.curGameRoom.mainPokers.length > 0) {
			this.curGameRoom.handTilesList[this.serverSitNum] = cutil_ll7.sort(temp, this.curGameRoom.mainPokers[0]);
		} else {
			this.curGameRoom.handTilesList[this.serverSitNum] = cutil_ll7.sort(temp);
		}
		this.curGameRoom.lordAid = const_ll7.LORD_SECOND;
		this.curGameRoom.playerOperationList = [0, 0, 0, 0, 0];

		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver2("startBeginAnim", temp, this.serverSitNum);
			h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_operation_panel");
			// h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_panel", this.curGameRoom.handTilesList[this.serverSitNum], const_ll7.LORD_SECOND, this.curGameRoom.mainPokers);
			h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", this.serverSitNum, const_ll7.LORD_SECOND, undefined, -1);
		}
		if (onhookMgr) {
			onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_FANZHU + const_ll7.COUNTDOWN_DEAL);
		}
	},

	postOperation: function (serverSitNum, aid, pokers, next_idx) {
		cc.log("postOperation: ", serverSitNum, aid, pokers, next_idx);
		var self = this;
		let curGameRoom = this.curGameRoom;
		var pokerType = null;

		if (aid === const_ll7.LORD_FIRST) {
			if (pokers.length !== 0) {
				curGameRoom.mainPokers = pokers;
				curGameRoom.mainServerSitNum = serverSitNum;
				curGameRoom.lordAid = const_ll7.LORD_SECOND;
				curGameRoom.handTilesList[this.serverSitNum] = cutil_ll7.sort(curGameRoom.handTilesList[this.serverSitNum], pokers[0]);
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_main_panel", pokers);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_first7", true);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_wait_panel");
					// h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_player_info_op_panel");

					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_operation_panel");

					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_panel", curGameRoom.handTilesList[this.serverSitNum], const_ll7.LORD_SECOND, pokers);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", serverSitNum, const_ll7.LORD_SECOND, pokers, next_idx);

					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_dealer_idx", serverSitNum, true);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_base_card_panel", false);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("playOperationEffect", const_ll7.JIAOZHU, serverSitNum, pokers);
				}
			} else {
				curGameRoom.playerOperationList[serverSitNum] = 1;
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", serverSitNum, const_ll7.LORD_FIRST, pokers, next_idx);
				}
			}
			curGameRoom.curPlayerSitNum = next_idx;
		} else if (aid === const_ll7.LORD_SECOND) {
			if (pokers.length !== 0) {
				let isJiaozhu = curGameRoom.mainPokers.length === 0;
				if (curGameRoom.mainPokers.length > 0) {
					// 反主
				} else {
					// 叫主
					// if (onhookMgr) {
					// 	onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_FANZHU);
					// }
				}
				curGameRoom.playerOperationList = [0, 0, 0, 0, 0];
				var originMainServerSitNum = curGameRoom.mainServerSitNum;
				curGameRoom.mainPokers = pokers;
				curGameRoom.mainServerSitNum = serverSitNum;
				curGameRoom.handTilesList[this.serverSitNum] = cutil_ll7.sort(curGameRoom.handTilesList[this.serverSitNum], pokers[0]);
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					if (serverSitNum !== originMainServerSitNum && curGameRoom.mainPokers.length === 2) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_first7", false);
					}
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_base_card_panel", false);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_main_panel", pokers);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_dealer_idx", serverSitNum, true);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_wait_panel");
					h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
						if (ui.beginAnimPlaying) {
							cc.log("play deal anim ")
						} else {
							ui.update_player_hand_tiles(self.serverSitNum, curGameRoom.handTilesList[self.serverSitNum], false);
						}
					});
					if (curGameRoom.get7MaxCount(this.serverSitNum) === 2) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_operation_panel");
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_panel", curGameRoom.handTilesList[this.serverSitNum], const_ll7.LORD_SECOND, pokers);
					} else {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_panel");
					}
				}
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				if (curGameRoom.get7MaxCount(this.serverSitNum) === 2) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", serverSitNum, const_ll7.LORD_SECOND, pokers, next_idx);
				} else {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", this.serverSitNum, const_ll7.LORD_SECOND, [], next_idx);
				}
			}
			curGameRoom.playerOperationList[serverSitNum] = 1;
			curGameRoom.curPlayerSitNum = next_idx;
			// if (collections.sum(curGameRoom.playerOperationList) === curGameRoom.player_num) {
			// 	if (curGameRoom.mainServerSitNum === this.serverSitNum) {
			// 		// 显示认输
			// 		if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
			// 			h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_giveup_panel", true);
			// 		}
			// 	}
			// }
		} else if (aid === const_ll7.LORD_THIRD) {
			if (pokers.length !== 0) {
				curGameRoom.mainPokers = pokers;
				curGameRoom.mainServerSitNum = serverSitNum;
				curGameRoom.handTilesList[this.serverSitNum] = cutil_ll7.sort(curGameRoom.handTilesList[this.serverSitNum], pokers[0]);
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					if (pokers.length === 2) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_first7", false);
					}
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_main_panel", pokers);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_dealer_idx", serverSitNum, true);
					// if (h1global.curUIMgr.gps_ui && !h1global.curUIMgr.gps_ui.is_show) {
					h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
						if (ui.beginAnimPlaying) {
							cc.log("play deal anim ")
						} else {
							// ui.update_player_hand_tiles(serverSitNum, curGameRoom.handTilesList[serverSitNum], false);
							ui.update_player_hand_tiles(self.serverSitNum, curGameRoom.handTilesList[self.serverSitNum], false);
						}
					});
					// }
				}
			}
			curGameRoom.playerOperationList[serverSitNum] = 1;
			curGameRoom.curPlayerSitNum = next_idx;
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				if (collections.sum(curGameRoom.playerOperationList) >= curGameRoom.player_num) {
					// 出牌
					curGameRoom.lordAid = const_ll7.DISCARD;
					if (this.serverSitNum === next_idx) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_discard_panel");
						if (onhookMgr) {
							onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
						}
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_clock_pos", next_idx);
					}
					for (var i = 0; i < curGameRoom.player_num; i++) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_grab_visible", i !== curGameRoom.mainServerSitNum && i !== curGameRoom.friendServerSitNum, i, 0);
					}
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_bottom_panel");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_wait_panel");
					// h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_player_info_op_panel");
				} else {
					if (this.serverSitNum === next_idx) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_operation_panel");
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_panel", curGameRoom.handTilesList[next_idx], const_ll7.LORD_THIRD, pokers);
					}
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", serverSitNum, const_ll7.LORD_THIRD, pokers, next_idx);
				}
			}
		} else if (aid === const_ll7.DRAW_COVER) {
			curGameRoom.playerOperationList = new Array(curGameRoom.player_num).fill(0);
			curGameRoom.lordAid = aid;
			curGameRoom.coverPokers = pokers;
			curGameRoom.waitAid = -1;
			curGameRoom.waitIdx = -1;
			curGameRoom.curPlayerSitNum = next_idx;
			if (next_idx === this.serverSitNum) {
				if (h1global.curUIMgr && h1global.curUIMgr.ll7maidi_ui) {
					if (h1global.curUIMgr.ll7maidi_ui.is_show) {
						h1global.curUIMgr.ll7maidi_ui.hide();
					}
					h1global.curUIMgr.ll7maidi_ui.show_by_info(next_idx, curGameRoom.handTilesList[next_idx], pokers, this.curGameRoom.mainPokers[0]);
				}
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				// if (h1global.curUIMgr.gps_ui && h1global.curUIMgr.gps_ui.is_show) {
				// 	h1global.curUIMgr.gps_ui.stopAllActions();
				// 	h1global.curUIMgr.gps_ui.hide();
				// 	if (this.sourcePlayer && this.sourcePlayer.startActions["GameRoomUI"]) {
				// 		this.sourcePlayer.startActions["GameRoomUI"]();
				// 		this.sourcePlayer.startActions["GameRoomUI"] = undefined;
				// 	}
				// }
				if (curGameRoom.mainPokers.length === 2) {
					if (onhookMgr) {
						onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_MAIDI);
					}
					if (next_idx !== this.serverSitNum) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_clock_pos", next_idx);
					}
				}
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_wait_panel");
				// h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_player_info_op_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_giveup_panel", false);
				if (this.serverSitNum === serverSitNum) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("stopBeginAnim");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_player_hand_tiles", serverSitNum);
				} else {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", serverSitNum, const_ll7.DRAW_COVER, undefined, next_idx);
				}
			}
		} else if (aid === const_ll7.COVER_POKER) {
			var originCoverPokers = curGameRoom.coverPokers;
			curGameRoom.coverPokers = pokers;
			curGameRoom.curPlayerSitNum = next_idx;
			curGameRoom.playerOperationList[serverSitNum] = 1;
			if (this.serverSitNum === serverSitNum) {
				var tiles = curGameRoom.handTilesList[serverSitNum].concat(originCoverPokers);
				collections.removeArray(tiles, pokers, true);
				curGameRoom.handTilesList[this.serverSitNum] = cutil_ll7.sort(tiles, curGameRoom.mainPokers[0]);
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
						if (ui.beginAnimPlaying) {
							ui.stopBeginAnim();
						} else {
							ui.update_player_hand_tiles(serverSitNum, curGameRoom.handTilesList[serverSitNum], false);
						}
					});
				}
			}
			if (curGameRoom.mainPokers.length === 2) {
				// 出牌
				curGameRoom.lordAid = const_ll7.DISCARD;
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					if (this.serverSitNum === next_idx) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_discard_panel");
						if (onhookMgr) {
							onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
						}
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_clock_pos", next_idx);
					}
					for (var i = 0; i < curGameRoom.player_num; i++) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_grab_visible", i !== curGameRoom.mainServerSitNum && i !== curGameRoom.friendServerSitNum, i, 0);
					}
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_bottom_panel");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_wait_panel");
					// h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_player_info_op_panel");
				}
			} else {
				// 显示认输
				// let canGiveup = false;
				// if (curGameRoom.mainServerSitNum === this.serverSitNum) {
				// 	if (collections.count(curGameRoom.handTilesList[this.serverSitNum], curGameRoom.mainPokers[0]) === 2) {
				// 		canGiveup = true;
				// 	}
				// }

				// if (canGiveup) {
				// 	if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				// 		h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_giveup_panel", true);
				// 	}
				// } else
				{
					// 反主
					if (onhookMgr) {
						onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_FANZHU2);
					}
					curGameRoom.lordAid = const_ll7.LORD_THIRD;
					if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
						if (this.serverSitNum === serverSitNum) {
							h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_clock_pos", -1);
						}
						if (curGameRoom.get7MaxCount(this.serverSitNum) === 2 && this.serverSitNum !== serverSitNum) {
							h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_operation_panel");
							h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_panel", curGameRoom.handTilesList[this.serverSitNum], const_ll7.LORD_THIRD, pokers);
						}
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", serverSitNum, const_ll7.COVER_POKER, undefined, next_idx);
					}
				}
			}
		} else if (aid === const_ll7.DISCARD) {
			if (next_idx >= 0 && h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				if (onhookMgr) {
					onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_DISCARD);
				}
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_clock_pos", next_idx);
			}

			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				h1global.curUIMgr.roomLayoutMgr.iterUI(function (ui) {
					if (ui.beginAnimPlaying) {
						ui.stopBeginAnim();
					}
				});
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("stop_delay_remove_panel", serverSitNum, next_idx);
			}

			let originControlIdx = this.curGameRoom.controlIdx;

			if (curGameRoom.startServerSitNum === -1) {
				curGameRoom.startServerSitNum = serverSitNum;
				curGameRoom.firstDiscardPokers = pokers;
				curGameRoom.discardHistory = [];
				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_player_desk_panel");
				}
				this.curGameRoom.controlIdx = serverSitNum;
			} else {
				let originControl = this.curGameRoom.controlIdx;
				let history = curGameRoom.discardHistory[originControl];
				if (this.compare(history, pokers, cutil_ll7.get_suit(curGameRoom.mainPokers[0]))) {
					this.curGameRoom.controlIdx = serverSitNum;
					if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_player_desk_tiles", originControl, history, this.serverSitNum, curGameRoom);
					}
				}
			}
			let discardPokerType = -1;
			if (this.isDiaozhu(serverSitNum, pokers, curGameRoom.discardHistory, originControlIdx, curGameRoom)) {
				discardPokerType = const_ll7.POKER_TYPE_DIAOZHU;
			} else if (this.isSha(serverSitNum, pokers, curGameRoom.discardHistory, originControlIdx, curGameRoom)) {
				discardPokerType = const_ll7.POKER_TYPE_SHA;
			} else if (this.isDazhu(serverSitNum, pokers, curGameRoom.discardHistory, originControlIdx, curGameRoom)) {
				discardPokerType = const_ll7.POKER_TYPE_DAZHU;
			} else if (this.isDianpai(serverSitNum, pokers, curGameRoom.discardHistory, originControlIdx, curGameRoom)) {
				discardPokerType = const_ll7.POKER_TYPE_DIANPAI;
			}
			pokerType = discardPokerType;

			curGameRoom.discardHistory[serverSitNum] = pokers;
			if (pokers.indexOf(curGameRoom.mainPokers[0]) >= 0) {
				if (serverSitNum !== curGameRoom.mainServerSitNum) {
					// 帮工出现了
					curGameRoom.friendServerSitNum = serverSitNum;
					curGameRoom.cleanGrabScore(serverSitNum);
					if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_total_score_panel", curGameRoom.sumPokerScore);
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_friend_idx", serverSitNum);
						h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_grab_visible", false, serverSitNum);
					}
				}
			}
			let tiles = curGameRoom.handTilesList[serverSitNum];
			if (tiles[0] > 0) {
				collections.removeArray(tiles, pokers, true);
			} else {
				tiles.splice(0, pokers.length);
			}

			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_player_hand_tiles", serverSitNum, tiles, false);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_player_desk_tiles", serverSitNum, pokers, this.serverSitNum, curGameRoom);
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_player_desk_tiles_anim", serverSitNum, pokers, discardPokerType, this.serverSitNum, curGameRoom, true);
			}
			// 新一轮开始
			if ((curGameRoom.startServerSitNum + 4) % curGameRoom.player_num === serverSitNum) {
				curGameRoom.startServerSitNum = -1;
				curGameRoom.firstDiscardPokers = null;
				curGameRoom.lastLoopHistory = curGameRoom.discardHistory;

				var hasScore = curGameRoom.controlIdx !== -1 && (curGameRoom.controlIdx !== curGameRoom.mainServerSitNum && curGameRoom.controlIdx !== curGameRoom.friendServerSitNum);
				if (hasScore) {
					var score = 0;
					for (var i = 0; i < curGameRoom.discardHistory.length; i++) {
						let cards = curGameRoom.discardHistory[i];
						for (var j = 0; j < cards.length; j++) {
							let rank = cutil_ll7.get_rank(cards[j]);
							if (rank === 5) {
								score += 5;
							} else if (rank === 10 || rank === 13) {
								score += 10;
							}
						}
					}
					let lastPokerScore = curGameRoom.sumPokerScore;
					curGameRoom.updateGrabScore(curGameRoom.controlIdx, score);
					if (lastPokerScore < 80 && curGameRoom.sumPokerScore >= 80) {
						if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
							h1global.curUIMgr.roomLayoutMgr.notifyObserver2("playOperationEffect", const_ll7.POPAI, serverSitNum, pokers);
						}
					}
					if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
						if (score > 0) {
							h1global.curUIMgr.roomLayoutMgr.notifyObserver2("play_update_score_anim", curGameRoom.controlIdx, score);
						}
					}
				}

				if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("start_delay_remove_panel", next_idx);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_bottom_panel");
				}
				curGameRoom.controlIdx = -1;
			}
			curGameRoom.curPlayerSitNum = next_idx;

			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				if (next_idx === this.serverSitNum) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_discard_panel");
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_player_hand_tiles", next_idx, curGameRoom.handTilesList[next_idx], true);
				}
			}

		} else if (aid === const_ll7.SHOW_COVER) {
			cc.error("SHOW_COVER")
		}
		this.playDiscardSound(serverSitNum, pokers, curGameRoom.curPlayerSitNum, pokerType, aid);
	},

	playDiscardSound: function (serverSitNum, pokers, lastDiscardIdx, pokerType, aid) {
		if (pokers.length === 0 || aid === const_ll7.SHOW_COVER || aid === const_ll7.DRAW_COVER || aid === const_ll7.COVER_POKER || aid === const_ll7.AID_NONE) {
			return;
		}
		cc.log("playDiscardSound:", serverSitNum, pokers, lastDiscardIdx, pokerType, aid);
		aid = aid || const_ll7.AID_NONE;
		if (aid !== const_ll7.DISCARD) {
			if (aid === const_ll7.LORD_FIRST) {
				//叫主语音
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/jiaozhu.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/jiaozhu.mp3");
				}
			} else if (aid === const_ll7.LORD_SECOND || aid === const_ll7.LORD_THIRD) {
				//反主语音
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/fanzhu.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/fanzhu.mp3");
				}
			}
			return;
		}

		if (pokers.length >= 4) {
			//拖拉机语音
			var mainPoker = this.curGameRoom.mainPokers[0];
			var pokerTypeTemp = cutil_ll7.suit_pattern(pokers, cutil_ll7.get_suit(mainPoker));
			if (pokerTypeTemp === const_ll7.CARDS_SEQ_PAIR_FANG
				|| pokerTypeTemp === const_ll7.CARDS_SEQ_PAIR_MEI
				|| pokerTypeTemp === const_ll7.CARDS_SEQ_PAIR_HONG
				|| pokerTypeTemp === const_ll7.CARDS_SEQ_PAIR_HEI
				|| pokerTypeTemp === const_ll7.CARDS_SEQ_PAIR_LORD) {
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/tuolaji.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/tuolaji.mp3");
				}
				return;
			}
		}

		var soundName = null;
		var pokersList = [-1, 14, 15, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 75, 79];
		if (pokerType === const_ll7.POKER_TYPE_DIAOZHU || pokerType === const_ll7.POKER_TYPE_SHA || pokerType === const_ll7.POKER_TYPE_DAZHU || pokerType === const_ll7.POKER_TYPE_DIANPAI) {
			if (pokerType === const_ll7.POKER_TYPE_DIAOZHU) {
				//吊主语音
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/diaozhu.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/diaozhu.mp3");
				}
			} else if (pokerType === const_ll7.POKER_TYPE_SHA) {
				//杀牌语音
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/shapai.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/shapai.mp3");
				}
			} else if (pokerType === const_ll7.POKER_TYPE_DAZHU) {
				//打住语音
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/dazhu.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/dazhu.mp3");
				}
			} else if (pokerType === const_ll7.POKER_TYPE_DIANPAI) {
				//垫牌语音
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/dianpai.mp3");
				} else {
					cutil.playEffect(this.gameType, "female/dianpai.mp3");
				}
			}
			return;
		}
		if (pokers.length === 1) {
			//单张语音
			var cardNum = pokers[0];
			if (cardNum > 64) {
				cardNum = pokersList.indexOf(cardNum);
			} else {
				cardNum = pokersList.indexOf(cardNum >> 2);
			}
			soundName = "1_" + (cardNum > 0 ? cardNum : 0).toString();
			if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
				cutil.playEffect(this.gameType, "male/" + soundName + ".mp3")
			} else {
				cutil.playEffect(this.gameType, "female/" + soundName + ".mp3")
			}
		} else if (pokers.length === 2) {
			//对子语音
			if (pokers[0] === pokers[1]) {
				var cardNum = pokers[0];
				if (cardNum > 64) {
					cardNum = pokersList.indexOf(cardNum);
				} else {
					cardNum = pokersList.indexOf(cardNum >> 2);
				}
				soundName = "2_" + (cardNum > 0 ? cardNum : 0).toString();
				if (this.curGameRoom.playerInfoList[serverSitNum]["sex"] == 1) {
					cutil.playEffect(this.gameType, "male/" + soundName + ".mp3")
				} else {
					cutil.playEffect(this.gameType, "female/" + soundName + ".mp3")
				}
			}
		}
	},

	selfPostOperation: function (aid, data) {
		cc.log("selfPostOperation", aid, data);
		// 由于自己打的牌自己不需要经服务器广播给自己，因而只要在doOperation时，自己postOperation给自己

		// if (aid === const_ll7.LORD_FIRST) {
		// 	this.postOperation(this.serverSitNum, aid, data, -1);
		// } else if (aid === const_ll7.LORD_SECOND) {
		// 	if (data.length === 1) {
		// 		this.postOperation(this.serverSitNum, aid, data, -1);
		// 	} else {
		// 		this.postOperation(this.serverSitNum, aid, data, this.serverSitNum);
		// 	}
		// } else if (aid === const_ll7.SURRENDER_SECOND) {
		//
		// } else if (aid === const_ll7.LORD_THIRD) {
		// 	this.postOperation(this.serverSitNum, aid, data, this.serverSitNum);
		// } else
		//
		if (aid === const_ll7.DISCARD) {
			var count = 0;
			for (var i = 0; i < this.curGameRoom.discardHistory.length; i++) {
				if (this.curGameRoom.discardHistory[i] && this.curGameRoom.discardHistory[i].length > 0) {
					count++;
				}
			}
			if (count === 4) {
				for (var i = 0; i < this.curGameRoom.handTilesList.length; i++) {
					if (this.curGameRoom.handTilesList[i].length === 0) {
						this.postOperation(this.serverSitNum, aid, data, -1);
						return
					}
				}
				var nextIdx = -1;
				var history = this.curGameRoom.discardHistory[this.curGameRoom.controlIdx];
				if (this.compare(history, data, cutil_ll7.get_suit(this.curGameRoom.mainPokers[0]))) {
					nextIdx = this.serverSitNum;
				} else {
					nextIdx = this.curGameRoom.controlIdx;
				}
				this.postOperation(this.serverSitNum, aid, data, nextIdx);
			} else {
				this.postOperation(this.serverSitNum, aid, data, (this.serverSitNum + 1) % this.curGameRoom.player_num);
			}
		}
	},

	doOperation: function (aid, pokers) {
		cc.log("doOperation: ", aid, pokers);
		// if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
		// 	h1global.curUIMgr.roomLayoutMgr.notifyObserver("lock_player_hand_tiles");
		// }
		// 自己的操作直接本地执行，不需要广播给自己
		this.selfPostOperation(aid, pokers);
		this.sourcePlayer.cellCall("doOperation", aid, pokers);
	},

	waitForOperation: function (serverSitNum, aid) {
		cc.log("waitForOperation", serverSitNum, aid);
		this.curGameRoom.waitAid = aid;
		this.curGameRoom.waitIdx = serverSitNum;
		if (aid === const_ll7.SURRENDER_FIRST || aid === const_ll7.SURRENDER_SECOND) {
			if (aid === const_ll7.SURRENDER_FIRST) {
				this.curGameRoom.lordAid = const_ll7.DRAW_COVER;
				this.curGameRoom.lordIdx = serverSitNum;
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				if (this.serverSitNum === serverSitNum) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_giveup_panel", true);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_wait_panel");
					if (onhookMgr) {
						onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_GIVEUP);
					}
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_clock_pos", serverSitNum);
				} else {
					if (onhookMgr) {
						onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_MAIDI);
					}
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_clock_pos", serverSitNum);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_operation_wait_panel", serverSitNum, const_ll7.DRAW_COVER, undefined, -1);
				}
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_panel");
			}
		} else if (aid === const_ll7.DISCARD) {
			this.curGameRoom.lordAid = const_ll7.DISCARD;
			if (onhookMgr) {
				onhookMgr.setWaitLeftTime(const_ll7.COUNTDOWN_DISCARD);
			}
			if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr) {
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("update_bottom_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_panel");
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("hide_operation_wait_panel");
				if (serverSitNum === this.serverSitNum) {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver2("show_discard_panel");
				}
				h1global.curUIMgr.roomLayoutMgr.notifyObserver2("set_clock_pos", serverSitNum);
			}
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
				// h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_multiple_panel", roundRoomInfo['spring'], 1);
				h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, playerInfoList, roundRoomInfo['result_list'], curGameRoom, serverSitNum, roundRoomInfo['spring']);
			} else {
				h1global.curUIMgr.roomLayoutMgr.registerShowObserver(function () {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("hide_player_hand_tiles", self.serverSitNum);
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", playerInfoList);
					// h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_multiple_panel", roundRoomInfo['spring'], 1);
					h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, playerInfoList, roundRoomInfo['result_list'], curGameRoom, serverSitNum, roundRoomInfo['spring']);
				})
			}
		} else {
			callbackfunc();
		}
	},

	finalResult: function (finalPlayerInfoList, roundRoomInfo) {
		cc.log("finalPlayerInfoList", finalPlayerInfoList);
		cc.log("roundRoomInfo", roundRoomInfo);
		if (onhookMgr) {
			onhookMgr.setWaitLeftTime(null);
		}
		// Note: 为了断线重连后继续停留在总结算上，此处设置一个标志位作为判断
		if (h1global.curUIMgr && h1global.curUIMgr.result_ui) {
			h1global.curUIMgr.result_ui.finalResultFlag = true;
		}

		let curGameRoom = this.curGameRoom;
		let serverSitNum = this.serverSitNum;

		var self = this;

		function callbackfunc(complete) {
			if (complete && h1global.curUIMgr.result_ui) {
				if (h1global.curUIMgr && h1global.curUIMgr.applyclose_ui && h1global.curUIMgr.applyclose_ui.is_show) {
					h1global.curUIMgr.applyclose_ui.hide();
				}
				h1global.curUIMgr.settlement_ui.show_by_info(roundRoomInfo, serverSitNum, curGameRoom, function () {
					if (h1global.curUIMgr.result_ui) {
						h1global.curUIMgr.result_ui.show_by_info(finalPlayerInfoList, curGameRoom, serverSitNum);
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
				h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, roundRoomInfo["player_info_list"], roundRoomInfo['result_list'], curGameRoom, serverSitNum, roundRoomInfo['spring']);
			} else {
				h1global.curUIMgr.roomLayoutMgr.registerShowObserver(function () {
					h1global.curUIMgr.roomLayoutMgr.notifyObserver("update_all_player_score", roundRoomInfo["player_info_list"]);
					h1global.curUIMgr.roomLayoutMgr.notifyObserverWithCallback("play_result_anim", callbackfunc, roundRoomInfo["player_info_list"], roundRoomInfo['result_list'], curGameRoom, serverSitNum, roundRoomInfo['spring']);
				})
			}
		} else {
			callbackfunc();
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
