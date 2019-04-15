"use strict";

var cutil_dtlgfmj = function () {};

cutil_dtlgfmj.get_count = function(tiles, t){
    var sum = 0;
    for(var i = 0; i < tiles.length; i++){
        if(tiles[i] === t){
            sum++;
        }
    }
    return sum;
};

cutil_dtlgfmj.meld_history = {};

cutil_dtlgfmj.meld_with_pair_need_num = function(tiles, history, used) {
    history = history || this.meld_history;
    var case1 = 999;
    var case2 = 999;
    var idx = -1;

    if (cutil_dtlgfmj.meld_only_need_num(tiles, history) === 0){
        case1 = 2;
    }

    for(var i = 0; i < tiles.length; i++){
        var tmp = tiles.concat([]);

        if (cutil_dtlgfmj.get_count(tiles, tiles[i]) === 1){
            idx = tmp.indexOf(tiles[i]);
            tmp.splice(idx, 1);
            case2 = Math.min(case2, 1 + cutil_dtlgfmj.meld_only_need_num(tmp, history));
        } else {
            idx = tmp.indexOf(tiles[i]);
            tmp.splice(idx, 1);
            idx = tmp.indexOf(tiles[i]);
            tmp.splice(idx, 1);
            case2 = Math.min(case2, cutil_dtlgfmj.meld_only_need_num(tmp, history));
        }
    }

    return Math.min(case1, case2);
};

cutil_dtlgfmj.meld_only_need_num = function(tiles, history, used){
    history = history || this.meld_history;
    used = used || 0;
    if (used > 4){
        return 999;
    }

    var key = tiles.concat([]).sort(function(a, b){return a-b;});
    if (history.hasOwnProperty(key)) {
        return history[key];
    }

    var size = tiles.length;
    if (size == 0){
        return 0;
    }
    if (size == 1){
        return 2;
    }
    if (size == 2){
        var p1 = tiles[0];
        var p2 = tiles[1];
        var case1 = 999;
        if (p1 < const_val.BOUNDARY && p2 - p1 <= 2){
            case1 = 1;
        }
        case2 = 0;
        if (p1 == p2) {
            case2 = 1;
        } else {
            case2 = 4
        }
        return Math.min(case1, case2);
    }

    var first = tiles[0];
    // 自己组成顺子
    var case1 = 0;
    var left1 = tiles.slice();
    left1.shift();
    // console.log("left1 = ", left1);
    if (first >= const_val.BOUNDARY) {
        case1 = 999
    } else {
        var idx1 = left1.indexOf(first+1);
        if (idx1 >= 0) {
            left1.splice(idx1, 1);
        } else {
            case1 += 1;
        }
        var idx2 = left1.indexOf(first+2);
        if (idx2 >= 0) {
            left1.splice(idx2, 1);
        } else {
            case1 += 1;
        }
        var res1 = this.meld_only_need_num(left1, history, used);
        history[left1] = res1;
        case1 += res1
    }


    // 自己组成刻子
    var case2 = 0;
    var left2 = tiles.slice();
    left2.shift();
    var count = this.get_count(left2, first);
    if (count >= 2) {
        var idx = left2.indexOf(first);
        left2.splice(idx, 1);
        idx = left2.indexOf(first);
        left2.splice(idx, 1);
    } else if (count == 1) {
        var idx = left2.indexOf(first);
        left2.splice(idx, 1);
        case2 += 1;
    } else {
        case2 += 2;
    }
    var res2 = this.meld_only_need_num(left2, history, used);
    history[left2] = res2;
    case2 += res2;
    var result = Math.min(case1, case2);
    history[tiles] = result;
    return result;
};

// 判断能否听牌, 如果不能, 就不用检查哪些能够胡牌了.
// 这个问题可以等价为: 给你一张癞子牌, 你能否胡牌.
cutil_dtlgfmj.canTenPai = function (handTiles, kingTiles) {
    kingTiles = kingTiles || [];
    if (handTiles.length % 3 !== 1) {
        return false;
    }

    var classifyList = this.classifyTiles(handTiles, kingTiles);
    var kingTilesNum = classifyList[0].length;
    var handTilesButKing = [];
    for (var i = 1; i < classifyList.length; i++) {
        handTilesButKing = handTilesButKing.concat(classifyList[i])
    }

    // 先处理特殊情况
    // 7对胡
    if (cutil_dtlgfmj.is7DoubleWin(handTiles, handTilesButKing, kingTilesNum + 1)) {
        return true;
    }

    var num = this.meld_with_pair_need_num(handTilesButKing);
    return (num - kingTilesNum <= 1);
};

// Attention: 正常的胡牌(3N + 2, 有赖子牌), 七对胡那种需要特殊判断, 这里不处理
cutil_dtlgfmj.canNormalWinWithKing = function (handTiles, kingTiles) {
    kingTiles = kingTiles || [];
    if (handTiles.length % 3 !== 2) {
        return false;
    }

    var classified = this.classifyTiles(handTiles, kingTiles);
    var kings	= classified[0];
    var chars	= classified[1];
    var bambs	= classified[2];
    var dots	= classified[3];
    var winds	= classified[4];
    var dragons	= classified[5];
    var kingTilesNum = kings.length;
    var others = [chars, bambs, dots, winds, dragons];
    var meldNeed = [];
    var mos = 0, mps = 0, i, mo, mp;
    for (i = 0; i < others.length; i++) {
        var tiles = others[i];
        mo = this.meld_only_need_num(tiles);
        mp = this.meld_with_pair_need_num(tiles);
        mos += mo;
        mps += mp;
        meldNeed.push([mo, mp]);
    }

    for (i = 0; i < meldNeed.length; i++) {
        mo = meldNeed[i][0];
        mp = meldNeed[i][1];
        if (mp + (mos - mo) <= kingTilesNum) {
            return true;
        }
    }
    return false;
};


// Attention: 正常的的胡牌(3N + 2, 没有赖子), 七对胡那种需要特殊判断, 这里不处理
cutil_dtlgfmj.canNormalWinWithoutKing = function (handTiles) {
    if (handTiles.length % 3 !== 2) {
        return false;
    }

    var classified = this.classifyTiles(handTiles);
    var chars	= classified[1];
    var bambs	= classified[2];
    var dots	= classified[3];
    var winds	= classified[4];
    var dragons	= classified[5];
    var hasPair = false;
    var i, n;
    // 先把东西南北中发财拿出来单独处理
    for (i = 0; i < const_val.WINDS.length; i++) {
        var w = const_val.WINDS[i];
        n = this.get_count(winds, w);
        switch (n) {
            case 1:
                return false;
            case 2:
                if (hasPair) return false;
                hasPair = true;
                break;
        }
    }

    for (i = 0; i < const_val.DRAGONS.length; i++) {
        var d = const_val.DRAGONS[i];
        n = this.get_count(dragons, d);
        switch (n) {
            case 1:
                return false;
            case 2:
                if (hasPair) return false;
                hasPair = true;
                break;
        }
    }

    // 判断万, 条, 筒这些
    var tiles = [];
    tiles = tiles.concat(chars);
    tiles = tiles.concat(bambs);
    tiles = tiles.concat(dots);

    if (hasPair) {
        return this.isMeld(tiles);
    } else {
        return this.isMeldWithPair(tiles);
    }
};

cutil_dtlgfmj.isMeld = function (tiles) {
    if (tiles.length % 3 !== 0) {
        return false;
    }
    var tilesCopy = tiles.concat([]);
    var total = 0;
    for (var i = 0; i < tilesCopy.length; i++) {
        total += tilesCopy[i];
    }
    var magic = total % 3;
    var idx1 = -1;
    var idx2 = -1;
    if (magic === 0) {
        tilesCopy.sort(function(a, b) {return a-b;});
        while (tilesCopy.length >= 3) {
            var left = tilesCopy[0];
            var n = this.get_count(tilesCopy, left);
            tilesCopy.shift();
            switch (n) {
                case 1:
                    // 移除一个顺子
                    idx1 = tilesCopy.indexOf(left + 1);
                    if (idx1 >= 0) {
                        tilesCopy.splice(idx1, 1);
                    } else {
                        return false;
                    }
                    idx2 = tilesCopy.indexOf(left + 2);
                    if (idx2 >= 0) {
                        tilesCopy.splice(idx2, 1);
                    } else {
                        return false;
                    }
                    break;
                case 2:
                    // 移除两个顺子
                    tilesCopy.shift();
                    if (this.get_count(tilesCopy, left + 1) >= 2) {
                        idx1 = tilesCopy.indexOf(left + 1);
                        tilesCopy.splice(idx1, 2);
                    } else {
                        return false;
                    }
                    if (this.get_count(tilesCopy, left + 2) >= 2) {
                        idx2 = tilesCopy.indexOf(left + 2);
                        tilesCopy.splice(idx2, 2);
                    } else {
                        return false;
                    }
                    break;
                default:
                    // 移除一个刻子
                    tilesCopy.shift();
                    tilesCopy.shift();
                    break;
            }
        }
    }
    return tilesCopy.length === 0;
};


cutil_dtlgfmj.isMeldWithPair = function (tiles) {
    if (tiles.length % 3 !== 2) {
        return false;
    }
    var total = 0;
    for (var i = 0; i < tiles.length; i++) {
        total += tiles[i];
    }
    var magic = total % 3;
    var possible;
    switch (magic) {
        case 0:
            possible = [3, 6, 9, 33, 36, 39, 51, 54, 57];
            return this.checkMeldInPossible(tiles, possible);
        case 1:
            possible = [2, 5, 8, 32, 35, 38, 53, 56, 59];
            return this.checkMeldInPossible(tiles, possible);
        case 2:
            possible = [1, 4, 7, 31, 34, 37, 52, 55, 58];
            return this.checkMeldInPossible(tiles, possible);
    }
    return false;
};

cutil_dtlgfmj.checkMeldInPossible = function (tiles, possibleList) {
    var idx;
    for (var i = 0; i < possibleList.length; i++) {
        var p = possibleList[i];
        if (this.get_count(tiles, p) >= 2) {
            var tmp = tiles.concat([]);
            idx = tmp.indexOf(p);
            tmp.splice(idx, 2);
            if (this.isMeld(tmp)) {
                return true;
            }
        }
    }
    return false;
};

cutil_dtlgfmj.tileSortFunc = function(a, b){
    if(a == b){
        return 0;
    }

    var player = h1global.player()
    if (!player.curGameRoom || player.curGameRoom.kingTiles.length <= 0) {
        return a-b;
    }

    if (player.curGameRoom.kingTiles.indexOf(a) >= 0) {
        return -1
    }
    if (player.curGameRoom.kingTiles.indexOf(b) >= 0) {
        return 1
    }

    return a-b;
};

cutil_dtlgfmj.classifyTiles = function(tiles, kingTiles){
    kingTiles = kingTiles || [];
    var kings = [];
    var chars = [];
    var bambs = [];
    var dots  = [];
    var winds = [];
    var dragons = [];

    tiles = cutil.deepCopy(tiles)
    tiles.sort(function(a,b){return a-b;})

    for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i]
        if (kingTiles.indexOf(t) >= 0) {
            kings = kings.concat(t)
        } else if (const_val.CHARACTER.indexOf(t) >= 0) {
            chars = chars.concat(t)
        } else if (const_val.BAMBOO.indexOf(t) >= 0) {
            bambs = bambs.concat(t)
        } else if (const_val.DOT.indexOf(t) >= 0) {
            dots = dots.concat(t)
        } else if (const_val.WINDS.indexOf(t) >= 0) {
            winds = winds.concat(t)
        } else if (const_val.DRAGONS.indexOf(t) >= 0) {
            dragons = dragons.concat(t)
        } else {
            cc.log("iRoomRules classify tiles failed, no this tile " + t.toString());
        }
    }
    return [kings, chars, bambs, dots, winds, dragons]
};

//获取同样牌的张数 dict
cutil_dtlgfmj.getTileNumDict = function(tiles){
    var tileDict = {}
    for (var i = 0; i < tiles.length; i++) {
        var t = tiles[i]
        if (!tileDict[t]) {
            tileDict[t] = 1
        }else{
            tileDict[t] += 1
        }
    }
    return tileDict
};

cutil_dtlgfmj.is7DoubleWin = function(handTiles, handTilesButKing, kingTilesNum){
    kingTilesNum = kingTilesNum || 0;
    if (handTiles.length != 14) {return false}
    var tileDict = cutil_dtlgfmj.getTileNumDict(handTilesButKing);
    var need_num = 0
    for(var tile in tileDict){
        need_num += (tileDict[tile] % 2);
    }
    if (need_num <= kingTilesNum) {
        return true
    }
    return false
};