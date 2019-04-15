"use strict";
/*-----------------------------------------------------------------------------------------
 interface
 -----------------------------------------------------------------------------------------*/
var DTLGFMJGameRules = DTLGFMJRoomOperationAdapter.extend({

    getCanWinTiles: function (select_tile) {
        select_tile = select_tile || 0;
        // var time1 = (new Date()).getTime();

        //听牌提示
        var canWinTiles = [];
        var handTiles = this.curGameRoom.handTilesList[this.serverSitNum].concat([]);
        var allTiles = [const_val.CHARACTER, const_val.BAMBOO, const_val.DOT, const_val.WINDS, const_val.DRAGONS]
        var select_tile_pos = handTiles.indexOf(select_tile);
        if(select_tile_pos >= 0){
            handTiles.splice(select_tile_pos, 1);
        }
        for (var i = 0; i < allTiles.length; i++) {
            for (var j = 0; j < allTiles[i].length; j++) {
                var t = allTiles[i][j]
                var temp_handTiles = handTiles.concat([t]);
                if (this.canWin(temp_handTiles)) {
                    canWinTiles.push(t);
                }
            }
        }
        // var time2 = (new Date()).getTime();
        // cc.log("getCanWinTiles222 cost = ", time2 - time1);
        return canWinTiles;
    },

    canConcealedKong: function (tiles) {
        //暗杠
        if (this.getOneConcealedKongNum(tiles) > 0) {
            return true;
        } else {
            return false;
        }
    },

    getOneConcealedKongNum: function (tiles) {
        var hashDict = {};
        for (var i = 0; i < tiles.length; i++) {
            if (this.curGameRoom.kingTiles.indexOf(tiles[i]) >= 0) {
                continue;
            }
            if (hashDict[tiles[i]]) {
                hashDict[tiles[i]]++;
                if (hashDict[tiles[i]] >= 4) {
                    return tiles[i];
                }
            } else {
                hashDict[tiles[i]] = 1;
            }
        }
        return 0;
    },

    canExposedKong: function (tiles, keyTile) {
        if (this.curGameRoom.kingTiles.indexOf(keyTile) >= 0) {
            return false;
        }
        var tile = 0;
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i] == keyTile) {
                tile++;
            }
        }
        if (tile >= 3) {
            return true;
        }
        return false;
    },

    canContinueKongTile: function (upTilesList, tile) {
        return this.getContinueKongUpIdx(upTilesList, tile) >= 0 ? true : false;
    },

    canContinueKongHandTiles:function(upTilesList, handTiles){
        return this.getContinueKongTileList(upTilesList, handTiles).length > 0 ? true : false;
    },

    getContinueKongTileList:function(upTilesList, handTiles){
        var tilelist = []
        for (var i = 0; i < handTiles.length; i++) {
            // 财神可以碰杠
            // if (this.curGameRoom.kingTiles.indexOf(handTiles[i]) >= 0) {continue;}
            for (var j = 0; j < upTilesList.length; j++) {
                if (upTilesList[j].length == 3 && upTilesList[j][0] == upTilesList[j][1] && upTilesList[j][1] == upTilesList[j][2] && handTiles[i] == upTilesList[j][0]) {
                    tilelist.push(handTiles[i])
                }
            }
        }
        return tilelist
    },

    getContinueKongHandIdxList: function (upTilesList, handTiles) {
        var idxList = []
        for (var i = 0; i < handTiles.length; i++) {
            // 财神可以碰杠
            // if (this.curGameRoom.kingTiles.indexOf(handTiles[i]) >= 0) {continue;}
            for (var j = 0; j < upTilesList.length; j++) {
                if (upTilesList[j].length == 3 && upTilesList[j][0] == upTilesList[j][1] && upTilesList[j][1] == upTilesList[j][2] && handTiles[i] == upTilesList[j][0]) {
                    idxList.push(i)
                }
            }
        }
        return idxList
    },

    getContinueKongUpIdx: function (upTilesList, tile) {
        // 财神可以碰杠
        // if (this.curGameRoom.kingTiles.indexOf(tile) >= 0) {
        //     return -1;
        // }
        for (var i = 0; i < upTilesList.length; i++) {
            if (upTilesList[i].length == 3 && tile == upTilesList[i][0] &&
                upTilesList[i][0] == upTilesList[i][1] && upTilesList[i][1] == upTilesList[i][2]) {
                return i;
            }
        }
        return -1;
    },

    canPong: function (tiles, keyTile) {
        // 财神可以碰杠
        // if (this.curGameRoom.kingTiles.indexOf(keyTile) >= 0) {
        //     return false;
        // }
        // 正常碰牌逻辑
        var tile = 0;
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i] == keyTile) {
                tile++;
            }
        }
        if (tile >= 2) {
            return true;
        }
        return false;
    },

    getCanChowTilesList: function (keyTile, serverSitNum) {
        return []
        // var chowTilesList = [];
        // // 下面两行其实加不加都行，该方法仅在canChow返回值为true时才会被调用
        // // if (!this.canOperationByTimesLimit()) {return []}
        // // if (!this.canOperationByKingTile()) {return []}
        // if (keyTile == this.curGameRoom.kingTile) {return []}
        // if (keyTile >= 30) {
        //     return chowTilesList;
        // }
        // var tiles = this.curGameRoom.handTilesList[this.serverSitNum];
        // var neighborTileNumList = [0, 0, 1, 0, 0];
        // for (var i = 0; i < tiles.length; i++) {
        //     if (tiles[i] - keyTile >= -2 && tiles[i] - keyTile <= 2 && tiles[i] != this.curGameRoom.kingTile) {
        //         neighborTileNumList[tiles[i] - keyTile + 2]++;
        //     }
        // }
        // for (var i = 0; i < 3; i++) {
        //     var tileList = [];
        //     for (var j = i; j < i + 3; j++) {
        //         if (neighborTileNumList[j] > 0) {
        //             tileList.push(keyTile - 2 + j);
        //         } else {
        //             break;
        //         }
        //     }
        //     // 三张连续的牌
        //     if (tileList.length >= 3) {
        //         chowTilesList.push(tileList);
        //     }
        // }
        // return chowTilesList;
    },

    getDrawOpDict: function (drawTile, serverSitNum) {
        drawTile = drawTile || 0;
        serverSitNum = serverSitNum || this.serverSitNum;
        var op_dict = {}
        var handTiles = this.curGameRoom.handTilesList[serverSitNum];
        var uptiles = this.curGameRoom.upTilesList[serverSitNum];
        //杠
        //接杠
        cc.log(handTiles, uptiles)
        for (var i = 0; i < handTiles.length; i++) {
            for (var j = 0; j < uptiles.length; j++) {
                var upMeld = uptiles[j]
                if (upMeld.length == 3 && upMeld[0] == upMeld[1] && upMeld[1] == upMeld[2] && upMeld[0] == handTiles[i]) {
                    if (!op_dict[const_val.OP_CONTINUE_KONG]) {
                        op_dict[const_val.OP_CONTINUE_KONG] = []
                    }
                    op_dict[const_val.OP_CONTINUE_KONG].push([handTiles[i]])
                }
            }
        }
        //暗杠
        var tile2NumDict = cutil_dtlgfmj.getTileNumDict(handTiles)
        for (var key in tile2NumDict) {
            if (tile2NumDict[key] == 4) {
                if (!op_dict[const_val.OP_CONCEALED_KONG]) {
                    op_dict[const_val.OP_CONCEALED_KONG] = []
                }
                op_dict[const_val.OP_CONCEALED_KONG].push([eval(key)])
            }
        }
        //胡
        if (handTiles.length%3 == 2 && this.canWin(handTiles)) {
            op_dict[const_val.OP_DRAW_WIN] = [[drawTile]]
        }
        //过
        if (Object.keys(op_dict).length > 0) {
            op_dict[const_val.OP_PASS] = [[drawTile]]
        }
        cc.log("getDrawOpDict==>:", op_dict, drawTile)
        return op_dict
    },

    getPongKongOpDict: function (serverSitNum) {
        serverSitNum = serverSitNum || this.serverSitNum;
        var op_dict = {}
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
        var tile2NumDict = cutil_dtlgfmj.getTileNumDict(handTiles)
        for (var key in tile2NumDict) {
            // 财神可以碰杠
            // if (this.curGameRoom.kingTiles.indexOf(eval(key)) >= 0){
            //     continue;
            // }
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
        cc.log("getPongKongOpDict==>:", op_dict)
        return op_dict
    },

    getWaitOpDict: function (wait_aid_list, tileList, serverSitNum) {
        serverSitNum = serverSitNum || this.serverSitNum;
        var op_dict = {}
        // 吃碰杠 胡
        for (var i = 0; i < wait_aid_list.length; i++) {
            if (wait_aid_list[i] === const_val.OP_CHOW) { // 吃要特殊处理，告诉服务端吃哪一组
                var canChowTileList = this.getCanChowTilesList(tileList[0], serverSitNum);
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

    canChow: function (tiles, keyTile, seatNum) {
        return false
        // // if (!this.canOperationByTimesLimit()) {return false}
        // // if (!this.canOperationByKingTile()) {return false}
        // if (keyTile == this.curGameRoom.kingTile) {return false}
        // if (this.curGameRoom.lastDiscardTileFrom != (seatNum + 3) % 4) {
        //     return false
        // }
        // if (keyTile >= 30) {return false;}
        // var neighborTileNumList = [0, 0, 1, 0, 0];
        // for (var i = 0; i < tiles.length; i++) {
        //     if (tiles[i] - keyTile >= -2 && tiles[i] - keyTile <= 2 && tiles[i] != this.curGameRoom.kingTile) {
        //         neighborTileNumList[tiles[i] - keyTile + 2]++;
        //     }
        // }
        // for (var i = 0; i < 3; i++) {
        //     var tileNum = 0
        //     for (var j = i; j < i + 3; j++) {
        //         if (neighborTileNumList[j] > 0) {
        //             tileNum++;
        //         } else {
        //             break;
        //         }
        //     }
        //     // 三张连续的牌
        //     if (tileNum >= 3) {
        //         return true;
        //     }
        // }
        // return false;
    },

    canPassiveHint:function () {
        if(!this.curGameRoom){
            return false
        }
        var handTiles = this.curGameRoom.handTilesList[this.serverSitNum];
        if(this.curGameRoom.hint_state === 1 && this.serverSitNum == this.curGameRoom.curPlayerSitNum){
            // 摸牌能胡就不会passiveHint
            if(this.canWin(handTiles) && this.curGameRoom.last_op == const_val.OP_DRAW){
                return false
            }
            var n_sum = 0
            for(var i=0; i<const_val.WINDS.length; i++) {
                if(this.curGameRoom.kingTiles.indexOf(const_val.WINDS[i])<0){
                    n_sum += cutil_dtlgfmj.get_count(handTiles, const_val.WINDS[i]);
                }
            }
            for(var i=0; i<const_val.DRAGONS.length; i++) {
                if(this.curGameRoom.kingTiles.indexOf(const_val.DRAGONS[i])<0){
                    n_sum += cutil_dtlgfmj.get_count(handTiles, const_val.DRAGONS[i]);
                }
            }
            return n_sum >= 3
        }
        return false
    },

    canActiveHint:function () {
        if(!this.curGameRoom){
            return false
        }
        var handTiles = this.curGameRoom.handTilesList[this.serverSitNum];
        if(this.curGameRoom.hint_state === 1 && this.serverSitNum == this.curGameRoom.curPlayerSitNum){
            var n_sum = 0;
            var k_sum = 0;

            for(var i=0; i<const_val.WINDS.length; i++){
                var sum = cutil_dtlgfmj.get_count(handTiles, const_val.WINDS[i]);
                if(this.curGameRoom.kingTiles.indexOf(const_val.WINDS[i])>=0){
                    k_sum += sum
                } else {
                    n_sum += sum
                }
            }
            for(var i=0; i<const_val.DRAGONS.length; i++){
                var sum = cutil_dtlgfmj.get_count(handTiles, const_val.DRAGONS[i]);
                if(this.curGameRoom.kingTiles.indexOf(const_val.DRAGONS[i])>=0){
                    k_sum += sum
                } else {
                    n_sum += sum
                }

            }
            return (0 < n_sum < 3 && k_sum + n_sum >= 3) || (n_sum >= 3 && this.canWin(handTiles) && this.curGameRoom.last_op == const_val.OP_DRAW)
        }
        return false;
    },

    canDiscard:function (t) {
        var handTiles = this.curGameRoom.handTilesList[this.serverSitNum];
        if(handTiles.indexOf(t) < 0){return false;}
        if(this.canPassiveHint()){return false;}

        var tile2NumDict = cutil_dtlgfmj.getTileNumDict(handTiles);

        var d_list = [];
        for(var k in tile2NumDict){
            if(tile2NumDict[k] == 1){
                var tile = parseInt(k);
                if(this.curGameRoom.kingTiles.indexOf(tile)<0 && (const_val.WINDS.indexOf(tile) >= 0 || const_val.DRAGONS.indexOf(tile)>=0)){
                    d_list.push(tile)
                }
            }
        }

        if(0 < d_list.length){
            return this.curGameRoom.kingTiles.indexOf(t)<0 && (const_val.WINDS.indexOf(t) >= 0 || const_val.DRAGONS.indexOf(t)>=0)
        }
        
        return d_list.length <= 0 || d_list.indexOf(t) >= 0;
    },

    opLimit:function (t) {
        return !this.canDiscard(t)
    },

    canWin: function(handTiles){
        // 如果有亮风 则 手上有 非财神风字牌不能胡
        if (handTiles.length % 3 != 2) {
            return false;
        }
        var handCopyTile = handTiles.concat([]);
        handCopyTile.sort(function(a,b){return a-b;});
        var classifyList = cutil_dtlgfmj.classifyTiles(handTiles, this.curGameRoom.kingTiles);
        var handTilesButKing = [];
        for (var i = 1; i < classifyList.length; i++) {
            handTilesButKing = handTilesButKing.concat(classifyList[i])
        }
        var kingNum = classifyList[0].length;
        return h1global.player().curGameRoom.seven_pair && cutil_dtlgfmj.is7DoubleWin(handTiles, handTilesButKing, kingNum) ?  true : cutil_dtlgfmj.canNormalWinWithKing(handTiles, this.curGameRoom.kingTiles);
    },

});
