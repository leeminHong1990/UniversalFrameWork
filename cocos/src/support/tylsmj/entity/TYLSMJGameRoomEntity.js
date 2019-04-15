"use strict";

var TYLSMJGameRoomEntity = GameRoomEntity.extend({
	ctor: function (player_num, gameType) {
		this._super(player_num, gameType);
		this.luckyTileNum = 0;
		this.dealerIdx = 0;
		this.king_num = 1;
		this.pay_mode = 0;
		this.game_mode = 0;
		// this.reward = 0;
		this.king_mode = 0;
		this.hand_prepare = 1;
        this.club_id = 0;
		this.same_suit_mode = 0;
		this.same_suit_loong = 0;

		this.playerInfoList = [null, null, null, null];
		this.playerDistanceList = [[-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1]];
		this.playerStateList = [0, 0, 0, 0];
		this.handTilesList = [[], [], [], []];
		this.upTilesList = [[], [], [], []];
		this.upTilesOpsList = [[], [], [], []];
		this.discardTilesList = [[], [], [], []];
		this.cutIdxsList = [[], [], [], []];
		this.wreathsList = [[], [], [], []];

		this.tingTileList = [-1, -1, -1, -1];
		this.standTileList = [[], [], [], []];

		this.discardStateList = [const_tylsmj.DISCARD_FREE, const_tylsmj.DISCARD_FREE, const_tylsmj.DISCARD_FREE, const_tylsmj.DISCARD_FREE]

		this.prevailing_wind = const_val.WIND_EAST
		this.playerWindList = [const_val.WIND_EAST, const_val.WIND_SOUTH, const_val.WIND_WEST, const_val.WIND_NORTH]
		this.curPlayerSitNum = 0;
		this.lastDiscardTile = -1;
		this.lastDrawTile = -1;
    	this.last_op = -1;
		this.lastDiscardTileFrom = -1;
		this.discard_king_idx = -1;
		this.leftTileNum = 60;

		this.kingTiles = [];	// 财神(多个)

		this.waitAidList = []; // 玩家操作列表，[]表示没有玩家操作

		this.pass_win_list = [const_tylsmj.NO_PASS_WIN,const_tylsmj.NO_PASS_WIN,const_tylsmj.NO_PASS_WIN,const_tylsmj.NO_PASS_WIN]; //玩家是否过胡

		// 每局不清除的信息
		this.playerScoreList = [0, 0, 0, 0];
		this.msgList = [];		//所有的聊天记录
	    KBEngine.DEBUG_MSG("Create GameRoomEntity")
  	},

  	reconnectRoomData : function(recRoomInfo){
  		cc.log("reconnectRoomData",recRoomInfo)
	    this._super(recRoomInfo);
  		this.curPlayerSitNum = recRoomInfo["curPlayerSitNum"];
  		this.lastDiscardTile = recRoomInfo["lastDiscardTile"];
  		this.lastDrawTile = recRoomInfo["lastDrawTile"]
  		this.lastDiscardTileFrom = recRoomInfo["lastDiscardTileFrom"];
  		this.leftTileNum = recRoomInfo["leftTileNum"];
  		this.kingTiles = recRoomInfo["kingTiles"];
  		this.prevailing_wind = recRoomInfo["prevailing_wind"];
        this.last_op = recRoomInfo["last_op"];
        this.discard_king_idx =recRoomInfo["discard_king_idx"];
	    this.pass_win_list = recRoomInfo["pass_win_list"];
	    this.tingTileList = recRoomInfo["tingTileList"];
	    this.standTileList = recRoomInfo["standTileList"];
  		for(var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++){

  			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
  			this.wreathsList[i] = curPlayerInfo["wreaths"];
  			this.playerWindList[i] = curPlayerInfo["wind"];

  			this.handTilesList[i] = curPlayerInfo["tiles"];
  			this.discardTilesList[i] = curPlayerInfo["discard_tiles"];
  			this.cutIdxsList[i] = curPlayerInfo["cut_idxs"];

  			for(var j = 0; j < curPlayerInfo["op_list"].length; j++){
  				var op_info = curPlayerInfo["op_list"][j]; //[opId, [tile]]
  				if(op_info["opId"] === const_val.OP_PONG){
  					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
  					this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] === const_val.OP_EXPOSED_KONG){ //明杠
  					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
  					this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] === const_val.OP_CONTINUE_KONG){ // 风险杠
  					var kongIdx = h1global.player().gameOperationAdapter.getContinueKongUpIdx(this.upTilesList[i], op_info["tiles"][0]);
  					this.upTilesList[i][kongIdx].push(op_info["tiles"][0]);
	  				this.upTilesOpsList[i][kongIdx].push(op_info);
  				}else if(op_info["opId"] === const_val.OP_CONCEALED_KONG){ // 暗杠
  					this.upTilesList[i].push([0, 0, 0, op_info["tiles"][0]]);
  					this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] === const_val.OP_CHOW){
  					var sortTiles = op_info["tiles"].concat();
  					sortTiles = cutil_tylsmj.sortChowTileList(sortTiles[0], sortTiles);
                    // cutil_tylsmj.tileSort(sortTiles, this.kingTiles);
  					this.upTilesList[i].push(sortTiles);
  					this.upTilesOpsList[i].push([op_info]);
  				}
  			}
  		}

		this.waitAidList = recRoomInfo["waitAidList"];
		for (var i = 0; i < recRoomInfo["discardStateList"].length; i++) {
			this.updateDiscardState(i, recRoomInfo["discardStateList"][i])
		}
		this.updateRoomData(recRoomInfo["init_info"]);
		for(var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++){
			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			this.playerInfoList[i]["score"] = curPlayerInfo["score"]
			this.playerInfoList[i]["total_score"] = curPlayerInfo["total_score"]
		}
  	},

  	updateRoomData : function(roomInfo){
  		cc.log('updateRoomData:',roomInfo)
	    this._super(roomInfo);
  		this.dealerIdx = roomInfo["dealerIdx"];
  		this.king_num = roomInfo["king_num"];
  		this.player_num = roomInfo["player_num"];
  		this.pay_mode = roomInfo["pay_mode"];
  		this.game_mode = roomInfo["game_mode"];
	    this.king_mode = roomInfo["king_mode"];
	    this.luckyTileNum = roomInfo["lucky_num"];
	    this.hand_prepare = roomInfo["hand_prepare"];
	    this.club_id = roomInfo["club_id"];
	    this.same_suit_mode = roomInfo["same_suit_mode"];
	    this.same_suit_loong = roomInfo["same_suit_loong"];
	    // this.reward = roomInfo["reward"];
  		for(var i = 0; i < roomInfo["player_base_info_list"].length; i++){
  			this.updatePlayerInfo(roomInfo["player_base_info_list"][i]["idx"], roomInfo["player_base_info_list"][i]);
		}
        this.updateDistanceList();
  	},

  	updateDiscardState : function(serverSitNum, state){
  		this.discardStateList[serverSitNum] = state
  	},

	updateDistanceList : function () {
        for(var i = 0 ; i < this.playerInfoList.length ; i++) {
            for(var j = 0 ; j < this.playerInfoList.length ; j++) {
                if(i === j){this.playerDistanceList[i][j] = -1;continue;}
                if(this.playerInfoList[i] && this.playerInfoList[j]) {
                    var distance = cutil.calc_distance(parseFloat(this.playerInfoList[i]["lat"]), parseFloat(this.playerInfoList[i]["lng"]), parseFloat(this.playerInfoList[j]["lat"]), parseFloat(this.playerInfoList[j]["lng"]));
                    this.playerDistanceList[i][j] = (distance || distance == 0 ? distance : -1);
                }else {
                    this.playerDistanceList[i][j] = -1;
				}
            }
        }
    },

	getRoomCreateDict:function () {
  		return {
		    "game_name"         : "tylsmj",
  			"room_type"			: this.roomType,
            "game_round" 		: this.game_round,
			"same_suit_mode"	: this.same_suit_mode,
			"same_suit_loong"	: this.same_suit_loong,
			"pay_mode"			: this.pay_mode,
			"hand_prepare"		: this.hand_prepare
		};
    },

  	startGame : function(kingTiles, wreathsList){
  		this.room_state = const_val.ROOM_PLAYING;
  		this.wreathsList = wreathsList;
  		this.kingTiles = kingTiles;
  		var wreathsNum = 0;
      	this.last_op = -1;
        this.discard_king_idx = -1;
  		for (var i = 0; i < wreathsList.length; i++) {
  			wreathsNum += wreathsList[i].length
  		}
		this.handTilesList = [	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
  		this.upTilesList = [[], [], [], []];
  		this.upTilesOpsList = [[], [], [], []];
  		this.discardTilesList = [[], [], [], []];
  		this.cutIdxsList = [[], [], [], []];
  		this.standTileList = [[], [], [], []];
  		this.waitAidList = [];
	    this.discardStateList = [const_tylsmj.DISCARD_FREE, const_tylsmj.DISCARD_FREE, const_tylsmj.DISCARD_FREE, const_tylsmj.DISCARD_FREE]
	    this.pass_win_list = [const_tylsmj.NO_PASS_WIN,const_tylsmj.NO_PASS_WIN,const_tylsmj.NO_PASS_WIN,const_tylsmj.NO_PASS_WIN]; //玩家是否过胡
	    this.tingTileList = [-1, -1, -1, -1];
  		// if (this.king_mode === 1) {
	    this.leftTileNum = 83 - wreathsNum;
        // } else {
        //     this.leftTileNum = 83 - wreathsNum;
        // }
  	},

	swap_seat : function (swap_list) {
		if(!swap_list){
			return;
		}
		var tempPlayerInfoList = [];
		for (var i = 0; i < swap_list.length; i++) {
			tempPlayerInfoList[i] = this.playerInfoList[swap_list[i]];
			tempPlayerInfoList[i].idx = i;
		}
		cc.log(tempPlayerInfoList);
		this.playerInfoList = tempPlayerInfoList;
		this.updateDistanceList();
	},
});