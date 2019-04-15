"use strict";
var DTLGFMJGameRoomEntity = GameRoomEntity.extend({
	ctor: function (player_num, gameType) {
		this._super(player_num, gameType);
		this.lucky_num = 0;
		this.dealerIdx = 0;
		this.king_num = 1;
		this.game_mode = 0;
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
		this.leftTileNum = 60;

		this.kingTiles = [];	// 财神(多个)

		this.waitAidList = []; // 玩家操作列表，[]表示没有玩家操作

        this.hint_state = 1;
        this.hint_list = [[], [], [], []]
        this.realHandTiles = []

		KBEngine.DEBUG_MSG("Create GXMJGameRoomEntity")
	},

	reconnectRoomData: function (recRoomInfo) {
		this._super(recRoomInfo);
		this.curPlayerSitNum = recRoomInfo["curPlayerSitNum"];
		this.lastDiscardTile = recRoomInfo["lastDiscardTile"];
		this.lastDrawTile = recRoomInfo["lastDrawTile"];
		this.lastDiscardTileFrom = recRoomInfo["lastDiscardTileFrom"];
		this.leftTileNum = recRoomInfo["leftTileNum"];
		this.kingTiles = recRoomInfo["kingTiles"];
		this.prevailing_wind = recRoomInfo["prevailing_wind"];
		this.last_op = recRoomInfo["last_op"];
		this.hint_list = recRoomInfo["hint_list"];
		this.hint_state = recRoomInfo["hint_state"];
		for (var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++) {

			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			this.wreathsList[i] = curPlayerInfo["wreaths"];
			this.playerWindList[i] = curPlayerInfo["wind"];

			this.handTilesList[i] = curPlayerInfo["tiles"];
			this.discardTilesList[i] = curPlayerInfo["discard_tiles"];
			this.cutIdxsList[i] = curPlayerInfo["cut_idxs"];

			for (var j = 0; j < curPlayerInfo["op_list"].length; j++) {
				var op_info = curPlayerInfo["op_list"][j]; //[opId, [tile]]
				if (op_info["opId"] == const_val.OP_PONG) {
					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
					this.upTilesOpsList[i].push([op_info]);
				} else if (op_info["opId"] == const_val.OP_EXPOSED_KONG) { //明杠
					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
					this.upTilesOpsList[i].push([op_info]);
				} else if (op_info["opId"] == const_val.OP_CONTINUE_KONG) { // 风险杠
					var kongIdx = h1global.player().gameOperationAdapter.getContinueKongUpIdx(this.upTilesList[i], op_info["tiles"][0]);
					this.upTilesList[i][kongIdx].push(op_info["tiles"][0]);
					this.upTilesOpsList[i][kongIdx].push(op_info);
				} else if (op_info["opId"] == const_val.OP_CONCEALED_KONG) { // 暗杠
					this.upTilesList[i].push([0, 0, 0, op_info["tiles"][0]]);
					this.upTilesOpsList[i].push([op_info]);
				} else if (op_info["opId"] == const_val.OP_CHOW) {
					this.upTilesList[i].push((op_info["tiles"].concat()).sort(cutil_dtlgfmj.tileSortFunc));
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
		if (const_val.FAKE_COUNTDOWN > 0) {
			onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
		}
	},

	updateRoomData: function (roomInfo) {
		this._super(roomInfo);

		this.dealerIdx = roomInfo["dealerIdx"];
		this.king_num = roomInfo["king_num"];
		this.game_mode = roomInfo["game_mode"];
		this.lucky_num = roomInfo["lucky_num"];
		this.kong_mode = roomInfo["kong_mode"];
        this.score_mode = roomInfo["score_mode"];
        this.seven_pair = roomInfo["seven_pair"];
        this.base_score = roomInfo["base_score"];
		this.current_serial_dealer = roomInfo["current_serial_dealer"];
		this.max_serial_dealer = roomInfo["max_serial_dealer"];

		this.updateDistanceList();
	},

	getRoomCreateDict: function () {
		return {
            "game_name": "dtlgfmj",
            "room_type"	: this.roomType,
            "game_mode": this.game_mode,
			"game_round": this.game_round,
			"score_mode": this.score_mode,
			"seven_pair": this.seven_pair,
			"base_score": this.base_score,
			"kong_mode": this.kong_mode,
			"pay_mode": this.pay_mode,
			"hand_prepare": this.hand_prepare,
		};
	},

	startGame: function (kingTiles, wreathsList) {
		this.room_state = const_val.ROOM_PLAYING;
		this.wreathsList = wreathsList
		this.kingTiles = kingTiles
		var wreathsNum = 0
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
		this.leftTileNum = 84 - wreathsNum;
		this.hint_state = 1;
        this.hint_list = [[], [], [], []]
        this.realHandTiles = []
	},
});