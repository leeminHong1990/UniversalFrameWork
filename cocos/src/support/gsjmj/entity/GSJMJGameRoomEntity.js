"use strict";
var GSJMJGameRoomEntity = GameRoomEntity.extend({
	ctor: function (player_num, gameType) {
		this._super(player_num, gameType);

		this.luckyTileNum = 0;
		this.dealerIdx = 0;
		this.king_num = 1;
		this.game_mode = 0;
		this.game_max_lose = 999999;
		this.base_score = 0;
		this.win_mode = 0;
		this.add_dealer = 1;

		this.playerInfoList = [null, null, null, null];
		this.handTilesList = [[], [], [], []];
		this.upTilesList = [[], [], [], []];
		this.upTilesOpsList = [[], [], [], []];
		this.discardTilesList = [[], [], [], []];
		this.cutIdxsList = [[], [], [], []];
		this.wreathsList = [[], [], [], []];

		this.prevailing_wind = const_val.WIND_EAST;
		this.playerWindList = [const_val.WIND_EAST, const_val.WIND_SOUTH, const_val.WIND_WEST, const_val.WIND_NORTH];
		this.curPlayerSitNum = 0;
		this.lastDiscardTile = -1;
		this.lastDrawTile = -1;
		this.last_op = -1;
		this.lastDiscardTileFrom = -1;
		this.leftTileNum = 108 - 13 * 4 - 1;

		this.kingTiles = [];	// 财神(多个)

		this.waitAidList = []; // 玩家操作列表，[]表示没有玩家操作
		this.op_limit = {};

		// 每局不清除的信息
		this.playerScoreList = [0, 0, 0, 0];
		KBEngine.DEBUG_MSG("Create GSJMJGameRoomEntity")
	},

	reconnectRoomData: function (recRoomInfo) {
		this._super(recRoomInfo);
		this.curPlayerSitNum = recRoomInfo["curPlayerSitNum"];
		this.playerStateList = recRoomInfo["player_state_list"];
		this.lastDiscardTile = recRoomInfo["lastDiscardTile"];
		this.lastDrawTile = recRoomInfo["lastDrawTile"];
		this.lastDiscardTileFrom = recRoomInfo["lastDiscardTileFrom"];
		this.leftTileNum = recRoomInfo["leftTileNum"];
		this.kingTiles = recRoomInfo["kingTiles"];
		this.prevailing_wind = recRoomInfo["prevailing_wind"];
		this.last_op = recRoomInfo["last_op"];
		this.op_limit = recRoomInfo['op_limit'] || {};
		for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {

			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			this.wreathsList[i] = curPlayerInfo["wreaths"];
			this.playerWindList[i] = curPlayerInfo["wind"];

			this.handTilesList[i] = curPlayerInfo["tiles"];
			this.discardTilesList[i] = curPlayerInfo["discard_tiles"];
			this.cutIdxsList[i] = curPlayerInfo["cut_idxs"];

			for (var j = 0; j < curPlayerInfo["op_list"].length; j++) {
				var op_info = curPlayerInfo["op_list"][j]; //[opId, [tile]]
				if (op_info["opId"] === const_val.OP_PONG) {
					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
					this.upTilesOpsList[i].push([op_info]);
				} else if (op_info["opId"] === const_val.OP_EXPOSED_KONG) { //明杠
					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
					this.upTilesOpsList[i].push([op_info]);
				} else if (op_info["opId"] === const_val.OP_CONTINUE_KONG) { // 风险杠
					var kongIdx = h1global.player().gameOperationAdapter.getContinueKongUpIdx(this.upTilesList[i], op_info["tiles"][0]);
					this.upTilesList[i][kongIdx].push(op_info["tiles"][0]);
					this.upTilesOpsList[i][kongIdx].push(op_info);
				} else if (op_info["opId"] === const_val.OP_CONCEALED_KONG) { // 暗杠
					this.upTilesList[i].push([0, 0, 0, op_info["tiles"][0]]);
					this.upTilesOpsList[i].push([op_info]);
				} else if (op_info["opId"] === const_val.OP_CHOW) {
					var sortTiles = op_info["tiles"].concat();
					sortTiles = cutil_gsjmj.sortChowTileList(sortTiles[0], sortTiles);
					// cutil.tileSort(sortTiles, this.kingTiles);
					this.upTilesList[i].push(sortTiles);
					this.upTilesOpsList[i].push([op_info]);
				}
			}
		}

		this.waitAidList = recRoomInfo["waitAidList"];
		this.updateRoomData(recRoomInfo["init_info"]);
		for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {
			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			this.playerInfoList[i]["score"] = curPlayerInfo["score"];
			this.playerInfoList[i]["total_score"] = curPlayerInfo["total_score"]
		}

		if (this.discard_seconds > 0) {
			onhookMgr.setWaitLeftTime(recRoomInfo["waitTimeLeft"])
		} else if (const_gsjmj.FAKE_COUNTDOWN > 0) {
			onhookMgr.setWaitLeftTime(const_gsjmj.FAKE_COUNTDOWN);
		}
	},

	updateRoomData: function (roomInfo) {
		this._super(roomInfo);
		this.dealerIdx = roomInfo["dealerIdx"];
		this.curRound = roomInfo["curRound"];
		this.game_round = roomInfo["game_round"];
		this.king_num = roomInfo["king_num"];
		this.game_mode = roomInfo["game_mode"];
		this.luckyTileNum = roomInfo["lucky_num"];
		this.job_mode = roomInfo["job_mode"];

		this.game_max_lose = roomInfo["game_max_lose"];
		this.base_score = roomInfo["base_score"];
		this.suit_mode = roomInfo["suit_mode"];
		this.win_mode = roomInfo["win_mode"];
		this.discard_seconds = roomInfo["discard_seconds"];
		this.add_dealer = roomInfo['add_dealer'];
		this.updateDistanceList();
	},

	getRoomCreateDict: function () {
		return {
			"game_name": "gsjmj",
			"room_type": this.roomType,
			"game_mode": this.game_mode,
			//"game_round": this.game_round,
			//"game_max_lose": this.game_max_lose,
			"job_mode": this.job_mode,
			"add_dealer": this.add_dealer,
			"base_score": this.base_score,
			"suit_mode": this.suit_mode,
			"win_mode": this.win_mode,
			"pay_mode": this.pay_mode,
			"king_num": this.king_num,
			"game_round":this.game_round
		};
	},

	updateDiscardState: function (serverSitNum, state) {
		this.discardStateList[serverSitNum] = state
	},

	startGame: function (kingTiles, wreathsList) {
		this.room_state = const_val.ROOM_PLAYING;
		this.wreathsList = wreathsList;
		this.kingTiles = kingTiles;
		var wreathsNum = 0;
		this.last_op = -1;
		for (var i = 0; i < wreathsList.length; i++) {
			wreathsNum += wreathsList[i].length
		}
		this.handTilesList = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
		this.upTilesList = [[], [], [], []];
		this.upTilesOpsList = [[], [], [], []];
		this.discardTilesList = [[], [], [], []];
		this.cutIdxsList = [[], [], [], []];
		this.waitAidList = [];
		if (this.game_mode === const_gsjmj.NOWIND_GAME_MODE) {
			this.leftTileNum = 136 - 40 - 28 - wreathsNum;
		} else {
			this.leftTileNum = 83 - wreathsNum;
		}
		this.op_limit = {};
	},
});