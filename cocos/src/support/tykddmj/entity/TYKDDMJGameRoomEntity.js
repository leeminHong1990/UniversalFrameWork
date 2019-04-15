"use strict";

var TYKDDMJGameRoomEntity = GameRoomEntity.extend({
	ctor : function(player_num, gameType)
	{

        this._super(player_num, gameType);
		this.roomID = undefined;
		this.curRound = 0;

		this.game_round = 8;
		this.luckyTileNum = 0;
		this.ownerId = undefined;
		this.dealerIdx = 0;
		this.roomType = undefined;
		this.king_num = 1;
		this.player_num = player_num || 4;
		this.pay_mode = 0;
		this.game_mode = 0;
		this.reward = 0;
		this.add_dealer = 0;
		this.ekong_is_dwin = 0;
		this.special_mul = 0;
		this.seven_pair = 0;
		this.mouse_general = 0;
		this.mouse_general_onetwo = 0;
		this.ting_mouse = 0;
		this.bao_kong = 0;
		this.repeat_kong = 0;
		this.king_mode = 0;
		this.hand_prepare = 1;
        this.club_id = 0;

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

		this.discardStateList = [const_tykddmj.DISCARD_FREE, const_tykddmj.DISCARD_FREE, const_tykddmj.DISCARD_FREE, const_tykddmj.DISCARD_FREE]

		this.prevailing_wind = const_val.WIND_EAST
		this.playerWindList = [const_val.WIND_EAST, const_val.WIND_SOUTH, const_val.WIND_WEST, const_val.WIND_NORTH]
		this.curPlayerSitNum = 0;
		this.room_state = const_val.ROOM_WAITING;
		this.lastDiscardTile = -1;
		this.lastDrawTile = -1;
    	this.last_op = -1;
		this.lastDiscardTileFrom = -1;
		this.discard_king_idx = -1;
		this.leftTileNum = 60;

		this.kingTiles = [];	// 财神(多个)

		this.applyCloseLeftTime = 0;
		this.applyCloseFrom = 0;
		this.applyCloseStateList = [0, 0, 0, 0];

		this.waitAidList = []; // 玩家操作列表，[]表示没有玩家操作

		this.pass_win_list = [const_tykddmj.NO_PASS_WIN,const_tykddmj.NO_PASS_WIN,const_tykddmj.NO_PASS_WIN,const_tykddmj.NO_PASS_WIN]; //玩家是否过胡

		// 每局不清除的信息
		this.playerScoreList = [0, 0, 0, 0];
		this.msgList = [];		//所有的聊天记录
	    KBEngine.DEBUG_MSG("Create GameRoomEntity")
  	},

  	reconnectRoomData : function(recRoomInfo){
  		cc.log("reconnectRoomData",recRoomInfo)
  		this.curPlayerSitNum = recRoomInfo["curPlayerSitNum"];
  		this.room_state = recRoomInfo["room_state"];
  		this.playerStateList = recRoomInfo["player_state_list"];
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
		this.player_num = recRoomInfo["player_num"];
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
  					sortTiles = cutil.sortChowTileList(sortTiles[0], sortTiles);
                    // cutil_tykddmj.tileSort(sortTiles, this.kingTiles);
  					this.upTilesList[i].push(sortTiles);
  					this.upTilesOpsList[i].push([op_info]);
  				}
  			}
  		}

  		this.applyCloseLeftTime = recRoomInfo["applyCloseLeftTime"];
  		this.applyCloseFrom = recRoomInfo["applyCloseFrom"];
		this.applyCloseStateList = recRoomInfo["applyCloseStateList"];
		if(this.applyCloseLeftTime > 0){
			onhookMgr.setApplyCloseLeftTime(this.applyCloseLeftTime);
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
        if (const_val.FAKE_COUNTDOWN > 0) {
            onhookMgr.setWaitLeftTime(const_val.FAKE_COUNTDOWN);
        }
  	},

  	updateRoomData : function(roomInfo){
  		cc.log('updateRoomData:',roomInfo)
        this._super(roomInfo);
  		this.dealerIdx = roomInfo["dealerIdx"];
  		this.king_num = roomInfo["king_num"];
  		this.game_mode = roomInfo["game_mode"];
	    this.king_mode = roomInfo["king_mode"];
	    this.luckyTileNum = roomInfo["lucky_num"];
	    this.reward = roomInfo["reward"];
	    this.add_dealer = roomInfo["add_dealer"];
	    this.ekong_is_dwin = roomInfo["ekong_is_dwin"];
	    this.special_mul = roomInfo["special_mul"];
	    this.seven_pair = roomInfo["seven_pair"];
	    this.mouse_general = roomInfo["mouse_general"];
	    this.mouse_general_onetwo = roomInfo["mouse_general_onetwo"];
	    this.ting_mouse = roomInfo["ting_mouse"];
	    this.bao_kong = roomInfo["bao_kong"];
	    this.repeat_kong = roomInfo["repeat_kong"];
		this.player_num = roomInfo["player_num"];
  		for(var i = 0; i < roomInfo["player_base_info_list"].length; i++){
  			this.updatePlayerInfo(roomInfo["player_base_info_list"][i]["idx"], roomInfo["player_base_info_list"][i]);
		}
        this.updateDistanceList();
  	},

  	updatePlayerInfo : function(serverSitNum, playerInfo){
  		this.playerInfoList[serverSitNum] = playerInfo;
  	},

  	updatePlayerState : function(serverSitNum, state){
  		this.playerStateList[serverSitNum] = state;
  	},

  	updatePlayerOnlineState : function(serverSitNum, state){
  		this.playerInfoList[serverSitNum]["online"] = state;
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
            "game_name"			: "tykddmj",
  			"room_type"			: this.roomType,
  			"game_mode" 		: this.game_mode,
            "game_round" 		: this.game_round,
			"king_mode" 		: this.king_mode,
			"reward"			: this.reward,
			"add_dealer"		: this.add_dealer,
			"ekong_is_dwin"		: this.ekong_is_dwin,
			"special_mul"		: this.special_mul,
			"seven_pair"		: this.seven_pair,
			"mouse_general"		: this.mouse_general,
			"mouse_general_onetwo"		: this.mouse_general_onetwo,
		    "ting_mouse"		: this.ting_mouse,
		    "bao_kong"		    : this.bao_kong,
		    "repeat_kong"		: this.repeat_kong,
		    "pay_mode"			: this.pay_mode,
			"player_num"		: this.player_num,
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
  		this.waitAidList = [];
	    this.discardStateList = [const_tykddmj.DISCARD_FREE, const_tykddmj.DISCARD_FREE, const_tykddmj.DISCARD_FREE, const_tykddmj.DISCARD_FREE];
	    this.pass_win_list = [const_tykddmj.NO_PASS_WIN,const_tykddmj.NO_PASS_WIN,const_tykddmj.NO_PASS_WIN,const_tykddmj.NO_PASS_WIN]; //玩家是否过胡
        this.tingTileList = [-1, -1, -1, -1];
		this.leftTileNum = gameroomUIMgr.get_sum_tile_num(this.player_num,this.king_mode);
		this.leftTileNum -= wreathsNum;
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

  	endGame : function(){
  		// 重新开始准备
  		this.room_state = const_val.ROOM_WAITING;
  		this.playerStateList = [0, 0, 0, 0];
  	},
});