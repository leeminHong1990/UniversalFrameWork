"use strict";
/*-----------------------------------------------------------------------------------------
 interface
 -----------------------------------------------------------------------------------------*/
var TYKDDMJGameRules = TYKDDMJRoomOperationAdapter.extend({

    getCanTingTiles:function () {
        var handTiles = this.curGameRoom.handTilesList[this.serverSitNum].concat([]);
        var canTingTiles = [];
	    var kingClassified = cutil_tykddmj.classifyKingTiles(handTiles, this.curGameRoom.kingTiles);
	    var kings   = kingClassified[0];
	    var kingTilesNum = kings.length;
        for (var n = 0 ; n < handTiles.length ; n++) {
            var handTilesCopy = cutil.deepCopy(handTiles);
            handTilesCopy.splice(n, 1);
            var canWinTiles = [];
            var allTiles = [const_val.CHARACTER, const_val.BAMBOO, const_val.DOT, const_val.WINDS, const_val.DRAGONS];
            for (var i = 0; i < allTiles.length; i++) {
                for (var j = 0; j < allTiles[i].length; j++) {
                    var t = allTiles[i][j];
                    if (t > const_val.BOUNDARY || t % 10 >= const_val.CHARACTER[5]) {
                        var temp_handTiles = handTilesCopy.concat([t]);
                        // cc.log("getCanTingTiles temp_handTiles:",temp_handTiles)
                        if (this.canWin(temp_handTiles, t, this.serverSitNum, const_val.OP_GIVE_WIN)) {
                            canWinTiles.push(t);
                        }
                    }
                }
            }
            // cc.log("getCanTingTiles canWinTiles:",canWinTiles);
            for (var m = 0 ; m < canWinTiles.length ; m++) {
                var t = canWinTiles[m];
                if (this.curGameRoom.kingTiles.indexOf(t) >= 0) {
                    if (this.curGameRoom.game_mode === const_tykddmj.KING_GAME_MODE && this.curGameRoom.ting_mouse === 1) {
	                    var tempHandTiles = handTilesCopy.concat([t]);
	                    if (kingTilesNum === 0) {
		                    if (cutil_tykddmj.canNormalWinWithKing3N2(tempHandTiles, kingTilesNum)) {
			                    cc.log("can ting_mouse!");
		                    } else if (cutil_tykddmj.checkIs7Pairs(tempHandTiles, kingTilesNum) && (this.curGameRoom.game_mode === const_tykddmj.KING_GAME_MODE && this.curGameRoom.seven_pair === 1)) {
			                    cc.log("can ting_mouse!");
		                    } else {
			                    continue;
		                    }
                        } else {
		                    if (cutil_tykddmj.canNormalWinWithKing3N2(tempHandTiles, kingTilesNum - 1)) {
			                    cc.log("can ting_mouse!");
		                    } else if (cutil_tykddmj.checkIs7Pairs(tempHandTiles, kingTilesNum - 1) && (this.curGameRoom.game_mode === const_tykddmj.KING_GAME_MODE && this.curGameRoom.seven_pair === 1)) {
			                    cc.log("can ting_mouse!");
		                    } else {
			                    continue;
		                    }
                        }
                    } else {
	                    continue;
                    }
                }
                if (t > const_val.BOUNDARY || t % 10 >= const_val.CHARACTER[5]) {
                    canTingTiles.push(handTiles[n]);
                    break;
                }
            }
        }
        cc.log("canTingTiles:",canTingTiles);
        return canTingTiles;
    },

    checkCanTing:function (opDict) {
        //轮到自己，是否可以听牌
        opDict = opDict || {};
        if (this.curGameRoom.discardStateList[this.serverSitNum] === const_tykddmj.DISCARD_FREE) {
            if ((Object.keys(opDict).length == 2 && (opDict["58"] == undefined && opDict["57"] == undefined)) || Object.keys(opDict).length > 2) {
                return false;
            }
            cc.log("检测是否可以听牌！");
            this.canTingTiles = this.getCanTingTiles();
            if (this.canTingTiles.length > 0) {
                cc.log("可以听牌！");
                return true;
            }
        }
        return false;
    },

    getCanWinTiles: function (select_tile, serverSitNum, aid, handTiles) {
        select_tile = select_tile || 0;
        serverSitNum = serverSitNum || this.serverSitNum;
        aid = aid || const_val.OP_DRAW_WIN;
        handTiles = handTiles || this.curGameRoom.handTilesList[serverSitNum].concat([]);
        // var time1 = (new Date()).getTime();

        //听牌提示
        var canWinTiles = [];
        // var handTiles = this.curGameRoom.handTilesList[serverSitNum].concat([]);
        var allTiles = [const_val.CHARACTER, const_val.BAMBOO, const_val.DOT, const_val.WINDS, const_val.DRAGONS]
        var select_tile_pos = handTiles.indexOf(select_tile);
        if(select_tile_pos >= 0){
            handTiles.splice(select_tile_pos, 1);
        }
        if(handTiles.length%3 != 1){
            return canWinTiles
        }
        for (var i = 0; i < allTiles.length; i++) {
            for (var j = 0; j < allTiles[i].length; j++) {
                var t = allTiles[i][j]
                var temp_handTiles = handTiles.concat([t]);
                if (this.canWin(temp_handTiles, t, serverSitNum, aid)) {
                    canWinTiles.push(t);
                }
            }
        }
        // var real_canWinTiles = [];
        // for (var m = 0 ; m < canWinTiles.length ; m++) {
        //    var t = canWinTiles[m];
        //    if (t > const_val.BOUNDARY || t % 10 >= const_val.CHARACTER[2]) {
        //     real_canWinTiles.push(t);
        //    }
        // }
        // var time2 = (new Date()).getTime();
        // cc.log("getCanWinTiles222 cost = ", time2 - time1);
        return canWinTiles;
    },

    isOpLimit:function (serverSitNum) {
        return false;
        serverSitNum = serverSitNum || this.serverSitNum;
        return !(this.curGameRoom.discard_king_idx < 0 || this.curGameRoom.discard_king_idx === serverSitNum);
    },

    canDiscardTile:function(t){
        // Note: 回放时不可能用到这个方法，不考虑serverSitNum
        return true;
        if (this.curGameRoom.discard_king_idx < 0 || this.curGameRoom.discard_king_idx === this.serverSitNum) {
            return true;
        }
        return t === this.curGameRoom.lastDrawTile;
    },

    canDiscardIdx:function (idx) {
        // Note: 回放时不可能用到这个方法，不考虑serverSitNum
        cc.log("canDiscardIdx ",idx);
        return true;
        cc.log(this.curGameRoom.discard_king_idx, this.curGameRoom.discard_king_idx)
        if (this.curGameRoom.discard_king_idx < 0 || this.curGameRoom.discard_king_idx === this.serverSitNum){
            cc.log("===============")
            return true;
        }
        cc.log("------------------",this.curGameRoom.handTilesList[this.serverSitNum].length)
        return idx === this.curGameRoom.handTilesList[this.serverSitNum].length - 1
    },

    getContinueKongUpIdx: function (upTilesList, tile) {
        // if (this.curGameRoom.kingTiles.indexOf(tile) >= 0) {
        //     return -1;
        // }
        for (var i = 0; i < upTilesList.length; i++) {
            if (upTilesList[i].length === 3 && tile === upTilesList[i][0] &&
                upTilesList[i][0] === upTilesList[i][1] && upTilesList[i][1] === upTilesList[i][2]) {
                return i;
            }
        }
        return -1;
    },

    getCanChowTilesList: function (keyTile, serverSitNum) {
        var chowTilesList = [];
        if (this.curGameRoom.kingTiles.indexOf(keyTile) >= 0){
            return chowTilesList
        }
        var intead = keyTile
        if(keyTile === const_val.DRAGON_WHITE && this.curGameRoom.kingTiles.length > 0){
            intead = this.curGameRoom.kingTiles[0]
        }
        if(intead >= const_val.BOUNDARY){
            return chowTilesList
        }
        var tiles = this.curGameRoom.handTilesList[serverSitNum];
        // 预处理
        tiles = cutil.deepCopy(tiles);
        for (let i = 0; i < this.curGameRoom.kingTiles.length; i++){
            cutil.batch_delete(tiles, this.curGameRoom.kingTiles[i]);
        }
        if (this.curGameRoom.kingTiles.length > 0) {
            cutil.batch_replace(tiles, const_val.DRAGON_WHITE, this.curGameRoom.kingTiles[0]);
        }

        var match = [[-2,-1], [-1, 1], [1, 2]];
        for (var i = 0; i < match.length; i++){
            var match_0 = match[i][0] + intead;
            var match_1 = match[i][1] + intead;
            if (tiles.indexOf(match_0) >= 0 && tiles.indexOf(match_1) >= 0){
                if (this.curGameRoom.kingTiles.indexOf(match_0) >= 0) {
                    match_0 = const_val.DRAGON_WHITE;
                }
                if (this.curGameRoom.kingTiles.indexOf(match_1) >= 0) {
                    match_1 = const_val.DRAGON_WHITE;
                }
                chowTilesList.push([keyTile, match_0, match_1]);
            }
        }
        return chowTilesList;
    },

    getDrawOpDict: function (drawTile, serverSitNum) {
        drawTile = drawTile || 0;
        serverSitNum = serverSitNum || this.serverSitNum;
        var op_dict = {}
        var handTiles = this.curGameRoom.handTilesList[serverSitNum];
        var uptiles = this.curGameRoom.upTilesList[serverSitNum];
        if (this.isOpLimit()) {
            //胡
            if (handTiles.length % 3 === 2 && this.canWin(handTiles, drawTile, serverSitNum, const_val.OP_DRAW_WIN) && this.curGameRoom.discardStateList[serverSitNum] === const_tykddmj.DISCARD_FORCE) {
                op_dict[const_val.OP_DRAW_WIN] = [[drawTile]]
            }
            //过
            if (Object.keys(op_dict).length > 0) {
                op_dict[const_val.OP_PASS] = [[drawTile]]
            }
            return op_dict
        }
        //杠
        //接杠
        cc.log(handTiles, uptiles)
	    for (var j = 0; j < uptiles.length; j++) {
		    var upMeld = uptiles[j]
		    if (upMeld.length === 3 && upMeld[0] === upMeld[1] && upMeld[1] === upMeld[2] && upMeld[0] === drawTile) {
			    if (!op_dict[const_val.OP_CONTINUE_KONG]) {
				    op_dict[const_val.OP_CONTINUE_KONG] = []
			    }
			    op_dict[const_val.OP_CONTINUE_KONG].push([drawTile])
		    }
	    }
        if (this.curGameRoom.repeat_kong === 1 && Object.keys(op_dict).length === 0) {
	        for (var i = 0; i < handTiles.length; i++) {
		        for (var j = 0; j < uptiles.length; j++) {
			        var upMeld = uptiles[j]
			        if (upMeld.length === 3 && upMeld[0] === upMeld[1] && upMeld[1] === upMeld[2] && upMeld[0] === handTiles[i]) {
				        if (this.curGameRoom.discardStateList[this.serverSitNum] === const_tykddmj.DISCARD_FORCE) {
					        var p_tiles = cutil.deepCopy(handTiles).sort(function(a,b){return a-b;});
					        p_tiles.splice(p_tiles.indexOf(parseInt(drawTile)), 1);
					        var a_tiles = cutil.deepCopy(handTiles).sort(function(a,b){return a-b;});
					        a_tiles.splice(a_tiles.indexOf(parseInt(handTiles[i])), 1);
					        var canWinTilesPre = this.getCanWinTiles(undefined, undefined, undefined, p_tiles);
					        var canWinTilesAft = this.getCanWinTiles(undefined, undefined, undefined, a_tiles);
					        var isSmall = true;
					        var isChange = false;
					        for (var m = 0 ; m < canWinTilesAft.length ; m++) {
						        if (this.curGameRoom.kingTiles.indexOf(canWinTilesAft[m]) >= 0) {
							        // if (this.curGameRoom.game_mode === const_tykddmj.KING_GAME_MODE && this.curGameRoom.ting_mouse === 1) {
								     //    var tempHandTiles = a_tiles.concat(canWinTilesAft[m]);
								     //    var kingClassified = cutil_tykddmj.classifyKingTiles(tempHandTiles, this.curGameRoom.kingTiles);
								     //    var kings   = kingClassified[0];
								     //    var handTilesButKing  = kingClassified[1];
								     //    handTilesButKing.push(canWinTilesAft[m]);
								     //    var kingTilesNum = kings.length;
								     //    if (cutil_tykddmj.canNormalWinWithKing3N2(handTilesButKing, kingTilesNum - 1) || cutil_tykddmj.canNormalWinWithKing3N2(handTilesButKing, 0)) {
									 //        cc.log("OP_CONTINUE_KONG!");
								     //    } else {
									 //        continue;
								     //    }
							        // } else {
								        continue;
							        // }
						        }
						        if (canWinTilesPre.indexOf(canWinTilesAft[m]) < 0) {
							        isChange = true;
							        break;
						        }
						        if (canWinTilesAft[m] > const_val.BOUNDARY || canWinTilesAft[m] % 10 >= 6) {
							        isSmall = false;
						        }
					        }
					        if (canWinTilesAft.length === 0 || isSmall || isChange) {
						        continue;
					        }
				        }
				        if (!op_dict[const_val.OP_CONTINUE_KONG]) {
					        op_dict[const_val.OP_CONTINUE_KONG] = []
				        }
				        op_dict[const_val.OP_CONTINUE_KONG].push([handTiles[i]])
			        }
		        }
	        }
        }
        //暗杠
        var tile2NumDict = cutil_tykddmj.getTileNumDict(handTiles)
        for (var key in tile2NumDict) {
            // if (this.curGameRoom.kingTiles.indexOf(eval(key)) >= 0 && this.curGameRoom.reward === 1){
            //     continue;
            // }
            if (tile2NumDict[key] === 4) {
                if (this.curGameRoom.discardStateList[this.serverSitNum] === const_tykddmj.DISCARD_FORCE) {
                    var p_tiles = cutil.deepCopy(handTiles).sort(function(a,b){return a-b;});
                    p_tiles.splice(p_tiles.indexOf(parseInt(drawTile)), 1);
                    var a_tiles = cutil.deepCopy(handTiles).sort(function(a,b){return a-b;});
                    a_tiles.splice(a_tiles.indexOf(parseInt(key)), 4);
                    var canWinTilesPre = this.getCanWinTiles(undefined, undefined, undefined, p_tiles);
                    var canWinTilesAft = this.getCanWinTiles(undefined, undefined, undefined, a_tiles);
                    var isSmall = true;
                    var isChange = false;
                    for (var i = 0 ; i < canWinTilesAft.length ; i++) {
                        if (this.curGameRoom.kingTiles.indexOf(canWinTilesAft[i]) >= 0) {
	                        // if (this.curGameRoom.game_mode === const_tykddmj.KING_GAME_MODE && this.curGameRoom.ting_mouse === 1) {
	                        //    var tempHandTiles = a_tiles.concat(canWinTilesAft[i]);
	                        //    var kingClassified = cutil_tykddmj.classifyKingTiles(tempHandTiles, this.curGameRoom.kingTiles);
	                        //    var kings   = kingClassified[0];
	                        //    var handTilesButKing  = kingClassified[1];
	                        //    handTilesButKing.push(canWinTilesAft[i]);
	                        //    var kingTilesNum = kings.length;
	                        //    if (cutil_tykddmj.canNormalWinWithKing3N2(handTilesButKing, kingTilesNum - 1) || cutil_tykddmj.canNormalWinWithKing3N2(handTilesButKing, 0)) {
	                        //        cc.log("OP_CONTINUE_KONG!");
	                        //    } else {
	                        //        continue;
	                        //    }
	                        // } else {
	                        continue;
	                        // }
                        }
                        if (canWinTilesPre.indexOf(canWinTilesAft[i]) < 0) {
                            isChange = true;
                            break;
                        }
                        if (canWinTilesAft[i] > const_val.BOUNDARY || canWinTilesAft[i] % 10 >= 6) {
                            isSmall = false;
                        }
                    }
                    if (canWinTilesAft.length === 0 || isSmall || isChange) {
                        continue;
                    }
                }
                if (!op_dict[const_val.OP_CONCEALED_KONG]) {
                    op_dict[const_val.OP_CONCEALED_KONG] = []
                }
                op_dict[const_val.OP_CONCEALED_KONG].push([eval(key)])
            }
        }
        //胡
        if (handTiles.length % 3 === 2 && this.canWin(handTiles, drawTile, serverSitNum, const_val.OP_DRAW_WIN) && this.curGameRoom.discardStateList[serverSitNum] === const_tykddmj.DISCARD_FORCE) {
            op_dict[const_val.OP_DRAW_WIN] = [[drawTile]]
        }
        //过
        if (Object.keys(op_dict).length > 0) {
            op_dict[const_val.OP_PASS] = [[drawTile]]
        }
        cc.log("getDrawOpDict==>:", op_dict, drawTile, serverSitNum)
        if (this.curGameRoom.discardStateList[this.serverSitNum] === const_tykddmj.DISCARD_FORCE) {
            for (var op in op_dict) {
                if ((op >> 3) === const_val.SHOW_WIN) {
                    this.checkPassWin = true;
                }
            }
        }
        return op_dict
    },

    getPongKongOpDict: function (serverSitNum) {
        serverSitNum = serverSitNum || this.serverSitNum;
        var op_dict = {};
        if (this.isOpLimit()) {
            return op_dict
        }
        var handTiles = this.curGameRoom.handTilesList[serverSitNum];
        var uptiles = this.curGameRoom.upTilesList[serverSitNum];
        //杠
        //接杠
        cc.log(handTiles, uptiles)
        for (var i = 0; i < handTiles.length; i++) {
            for (var j = 0; j < uptiles.length; j++) {
                var upMeld = uptiles[j]
                if (upMeld.length === 3 && upMeld[0] === upMeld[1] && upMeld[1] === upMeld[2] && upMeld[0] === handTiles[i]) {
                    if (!op_dict[const_val.OP_CONTINUE_KONG]) {
                        op_dict[const_val.OP_CONTINUE_KONG] = []
                    }
                    op_dict[const_val.OP_CONTINUE_KONG].push([handTiles[i]])
                }
            }
        }
        //暗杠
        var tile2NumDict = cutil_tykddmj.getTileNumDict(handTiles)
        for (var key in tile2NumDict) {
            if (this.curGameRoom.kingTiles.indexOf(eval(key)) >= 0){
                continue;
            }
            if (tile2NumDict[key] === 4) {
                if (!op_dict[const_val.OP_CONCEALED_KONG]) {
                    op_dict[const_val.OP_CONCEALED_KONG] = []
                }
                op_dict[const_val.OP_CONCEALED_KONG].push([eval(key)])
            }
        }
        //过
        if (Object.keys(op_dict).length > 0) {
            op_dict[const_val.OP_PASS] = [[0]]
        }
        cc.log("getPongKongOpDict==>:", op_dict, serverSitNum);
        return op_dict
    },

    getWaitOpDict: function (wait_aid_list, tileList, serverSitNum) {
        serverSitNum = serverSitNum || this.serverSitNum;
        var op_dict = {}
        // 吃碰杠 胡
        for (var i = 0; i < wait_aid_list.length; i++) {
            if (wait_aid_list[i] === const_val.OP_CHOW) { // 吃要特殊处理，告诉服务端吃哪一组
                cc.log("====>:", tileList)
                var canChowTileList = this.getCanChowTilesList(tileList[0], serverSitNum);
                cc.log("====", canChowTileList)
                if (canChowTileList.length > 0) {
                    op_dict[wait_aid_list[i]] = canChowTileList
                }
            } else {
                op_dict[wait_aid_list[i]] = [[tileList[0]]]
            }
        }
        if (Object.keys(op_dict).length > 0) {
            op_dict[const_val.OP_PASS] = [[tileList[0]]]
        }
        cc.log("getWaitOpDict==>", wait_aid_list, tileList, op_dict, serverSitNum);
        return op_dict
    },

    canWin:function(handTiles, finalTile, serverSitNum, aid){
        //检测最后一张牌能否正常的胡牌
        if(this.nomalCanWin(handTiles, finalTile, serverSitNum, aid)){
            //扣点点的规则限制列表

            //过胡只能自摸
            if (aid !== const_val.OP_DRAW_WIN && this.curGameRoom.pass_win_list[this.serverSitNum] === const_tykddmj.PASS_WIN) {
                return false;
            }

            //如果最后一张是财神也ok
            if(finalTile == this.curGameRoom.kingTiles && aid === const_val.OP_DRAW_WIN){
                // if (this.curGameRoom.reward === 1) {
                //    return false;
                // }
                return true;
            }

            //点炮只能5点以上
            if (finalTile > const_val.BOUNDARY || finalTile % 10 >= const_val.CHARACTER[5]) {
                return true;
            }
            if (aid === const_val.OP_DRAW_WIN && this.curGameRoom.game_mode === const_tykddmj.KING_GAME_MODE && this.curGameRoom.mouse_general === 1 && this.curGameRoom.mouse_general_onetwo === 1) {
                if (cutil_tykddmj.isMouseGeneral(handTiles,
			            cutil_tykddmj.classifyKingTiles(handTiles, this.curGameRoom.kingTiles)[1],
			            cutil_tykddmj.classifyKingTiles(handTiles, this.curGameRoom.kingTiles)[0].length,
			            this.curGameRoom.kingTiles,
			            finalTile) === true) {
		            return true;
	            }
            }
            //自摸必须2点以上
            if(finalTile % 10 >= const_val.CHARACTER[2] && aid ===const_val.OP_DRAW_WIN){
                return true;
            }
        }
        return false;
    },

    nomalCanWin: function (handTiles, finalTile, serverSitNum, aid) {
        //7对 3x+2
        if (handTiles.length % 3 !== 2) {
            return false;
        }
        var handCopyTile = handTiles.concat([]);
        handCopyTile.sort(function(a,b){return a-b;});

        var kingClassified = cutil_tykddmj.classifyKingTiles(handCopyTile, this.curGameRoom.kingTiles);
        var kings   = kingClassified[0];
        var handTilesButKing  = kingClassified[1];

        var kingTilesNum = kings.length;

	    if (((this.curGameRoom.game_mode === const_tykddmj.KING_GAME_MODE && this.curGameRoom.seven_pair === 1) || this.curGameRoom.game_mode !== const_tykddmj.KING_GAME_MODE) && cutil_tykddmj.checkIs7Pairs(handTilesButKing, kingTilesNum)) {              // 7对
	        return true;
        } else if (this.curGameRoom.game_mode === const_tykddmj.SPECIAL_GAME_MODE && cutil_tykddmj.getThirteenOrphans(handTilesButKing, kingTilesNum)) { // 十三幺
            return true;
        } else if(kingTilesNum > 0){                                            // 有癞子
            return cutil_tykddmj.canNormalWinWithKing3N2(handTilesButKing, kingTilesNum);
        } else {                                                                // 没癞子
            return cutil_tykddmj.canNormalWinWithoutKing3N2(handTilesButKing);
        }
        // }
    },

});
