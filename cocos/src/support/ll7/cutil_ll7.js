"use strict";
var cutil_ll7 = function () {
}

cutil_ll7.get_suit = function (value) {
	return value & 3;
};

cutil_ll7.get_rank = function (value) {
	return value >> 2;
};

cutil_ll7.to_card = function (suit, rank) {
	return (rank << 2) + suit;
};


cutil_ll7.getCardImgPath = function (cardInt) {
	let rank = cutil_ll7.get_rank(cardInt);
	let suit = cutil_ll7.get_suit(cardInt);
	// 大小王
	let index = const_ll7.JOKERS.indexOf(cardInt);
	if (index !== -1) {
		return "Poker/pic_poker_" + const_ll7.JOKERS_IMAGE_INDEX[index] + '.png';
	}
	if (rank > 13) {
		rank -= 13;
	}
	return "Poker/pic_poker_" + const_ll7.POKER_COLOR_DICT[suit] + "" + rank + '.png';
};

cutil_ll7.getSmall7Path = function(cardInt){
	let rank = cutil_ll7.get_rank(cardInt);
	if(rank != 7 ){
		cc.error("主牌不是7!")
		return;
	}
	let suit = cutil_ll7.get_suit(cardInt);
	return const_ll7.SMALL_7[suit];
};

cutil_ll7.pokerCompare = function (a, b) {
	var s1 = cutil_ll7.get_suit(a);
	var s2 = cutil_ll7.get_suit(b);

	var v1 = cutil_ll7.get_rank(a);
	var v2 = cutil_ll7.get_rank(b);

	if (s1 === s2) {
		return v2 - v1;
	}
	return s2 - s1;
};


cutil_ll7.sort = function (pokers, mainPoker) {
	var jokers = [];
	var major7 = [];
	var minor7 = [];
	var major2 = [];
	var minor2 = [];
	var major = [];
	var minor = [];

	var mainSuit = -1;
	if (!cc.isUndefined(mainPoker)) {
		mainSuit = cutil_ll7.get_suit(mainPoker);
	}

	for (var i = 0; i < pokers.length; i++) {
		var p = pokers[i];
		if (const_ll7.JOKERS.indexOf(p) !== -1) {
			jokers.push(p);
			continue;
		}
		var suit = cutil_ll7.get_suit(p);
		var rank = cutil_ll7.get_rank(p);
		if (rank === 7) {
			if (mainSuit === suit) {
				major7.push(p);
			} else {
				minor7.push(p);
			}
		} else if (rank === 15) {
			if (mainSuit === suit) {
				major2.push(p);
			} else {
				minor2.push(p);
			}
		} else {
			if (mainSuit === suit) {
				major.push(p);
			} else {
				minor.push(p);
			}
		}
	}

	jokers = jokers.sort(collections.compareReverse);
	major7 = major7.sort(collections.compareReverse);
	minor7 = minor7.sort(collections.compareReverse);
	major2 = major2.sort(collections.compareReverse);
	minor2 = minor2.sort(collections.compareReverse);
	major = major.sort(cutil_ll7.pokerCompare);
	minor = minor.sort(cutil_ll7.pokerCompare);
	return jokers.concat(major7, minor7, major2, minor2, major, minor);
};

cutil_ll7.produceOneAndPair27 = function (pokers, lord_color) {
    return collections.map(pokers, function (_poker) {
        // 如果是2
        if((_poker>>const_ll7.POKER_OFFSET) === const_ll7.HHMF_VALUE[12]){
            if(const_ll7.TWO.indexOf(_poker) === lord_color){ // 主牌花色
                return (const_ll7.HHMF_VALUE[12] << const_ll7.POKER_OFFSET) + 1;
            }
            //普通花色
            return const_ll7.HHMF_VALUE[12] << const_ll7.POKER_OFFSET;
        }
        // 如果是7
        if((_poker>>const_ll7.POKER_OFFSET) === const_ll7.HHMF_VALUE[4]){
            if(const_ll7.SEVEN.indexOf(_poker) === lord_color){ // 主牌花色
                return (const_ll7.HHMF_VALUE[4] << const_ll7.POKER_OFFSET) + 41;
            }
            //普通花色
            return (const_ll7.HHMF_VALUE[4] << const_ll7.POKER_OFFSET) + 40;
        }
        return _poker;
    })
};

cutil_ll7.produceSeq2 = function (numPokers) {
    if(collections.any(numPokers, function(x){return x === const_ll7.HHMF_VALUE[12]})){
        return collections.map(numPokers, function (x) {
			if(x === const_ll7.HHMF_VALUE[11] || x === const_ll7.HHMF_VALUE[12]){
				return x-const_ll7.HHMF_VALUE[10]
			}
			return x;
        })
    }
    return numPokers
};

cutil_ll7.pokers2Num = function (pokers) {
	return collections.map(pokers, function (x) {
        return x>>const_ll7.POKER_OFFSET
    })
};

cutil_ll7.pokers_color = function (pokers, lord_color) {
    if(collections.all(pokers, function (x) {return const_ll7.SUIT_POKERS[lord_color].indexOf(x)>=0 || const_ll7.LORD_POKERS.indexOf(x)>=0})){
        return const_ll7.POKER_LORD
	} else if(collections.all(pokers, function (x) {return const_ll7.HEI.indexOf(x)>=0 && const_ll7.LORD_POKERS.indexOf(x)<0})){
        return const_ll7.POKER_HEI
    } else if(collections.all(pokers, function (x) {return const_ll7.HONG.indexOf(x)>=0 && const_ll7.LORD_POKERS.indexOf(x)<0})){
        return const_ll7.POKER_HONG
    } else if(collections.all(pokers, function (x) {return const_ll7.MEI.indexOf(x)>=0 && const_ll7.LORD_POKERS.indexOf(x)<0})){
        return const_ll7.POKER_MEI
    } else if(collections.all(pokers, function (x) {return const_ll7.FANG.indexOf(x)>=0 && const_ll7.LORD_POKERS.indexOf(x)<0})){
        return const_ll7.POKER_FANG
    }
    return const_ll7.POKER_MESS
};

cutil_ll7.suit_pattern = function (pokers, lord_color) {
    var pokers_color = cutil_ll7.pokers_color(pokers, lord_color);
	if(pokers_color === const_ll7.CARDS_MESS){return const_ll7.CARDS_MESS}
	if(cutil_ll7.is_one(pokers)){
        return (pokers_color<<const_ll7.TYPE_OFFSET) + const_ll7.TYPE_ONE;
	} else if(cutil_ll7.is_pair(pokers)){
        return (pokers_color<<const_ll7.TYPE_OFFSET) + const_ll7.TYPE_PAIR;
	} else if (cutil_ll7.is_seq_color(pokers) && cutil_ll7.is_seq_pair(pokers)[0]){
        return (pokers_color<<const_ll7.TYPE_OFFSET) + const_ll7.TYPE_SEQ_PAIR;
	}
	return (pokers_color<<const_ll7.TYPE_OFFSET) + const_ll7.TYPE_NONE;
};

cutil_ll7.is_one = function (pokers) {
	return pokers.length === 1
};

cutil_ll7.is_pair = function (pokers) {
	return pokers.length === 2 && pokers[0] === pokers[1]
};

cutil_ll7.is_seq_color = function (pokers) {
	return collections.all(pokers, function (x) {return const_ll7.HEI.indexOf(x) >= 0})
		|| collections.all(pokers, function (x) {return const_ll7.HONG.indexOf(x) >= 0})
		|| collections.all(pokers, function (x) {return const_ll7.MEI.indexOf(x) >= 0})
		|| collections.all(pokers, function (x) {return const_ll7.FANG.indexOf(x) >= 0})
		|| collections.all(pokers, function (x) {return const_ll7.JOKERS.indexOf(x) >= 0})
};

// 只判断数字连对不判断花色
cutil_ll7.is_seq_pair = function (pokers) {
    var numPokers = cutil_ll7.pokers2Num(pokers);
    // 有 2 特殊处理一下
    numPokers = cutil_ll7.produceSeq2(numPokers);
    numPokers.sort(collections.compare);

    var poker2NumDict = collections.groupBy(numPokers);
	if(pokers.length<4 || collections.any(collections.dictValuesToArray(poker2NumDict), function (x) {return x !== 2;})){return [false, numPokers]}

	var numKeys = collections.map(Object.keys(poker2NumDict), function (x) {return parseInt(x)});
    var is_seq = true;
    for(var i=0; i<numKeys.length-1; i++){
        if(numKeys[i]+1 !== numKeys[i+1]){
            is_seq = false;
            break;
        }
    }
	return [is_seq, numPokers]
};

cutil_ll7.is_seq_one = function (pokers) {
    var numPokers = cutil_ll7.pokers2Num(pokers);
    // 有 2 特殊处理一下
    numPokers = cutil_ll7.produceSeq2(numPokers);
    numPokers.sort(collections.compare);
    if(pokers.length<2){return [false, numPokers]}
    var is_seq = true;
    for(var i=0; i<numPokers.length-1; i++){
		if(numPokers[i]+1 !== numPokers[i+1]){
            is_seq = false;
            break;
		}
    }
    return [is_seq, numPokers]
};

cutil_ll7.get_color_pokers = function (pokers, color, lord_color) {
    if(color === const_ll7.POKER_MESS){
        return collections.filter(pokers, function (x) {return true})
	} else if(color === const_ll7.POKER_LORD){
		return collections.filter(pokers, function (x) {
			return const_ll7.SUIT_POKERS[lord_color].indexOf(x)>=0 || const_ll7.LORD_POKERS.indexOf(x)>=0
        })
	}
	return collections.filter(pokers, function (x) {
        return const_ll7.SUIT_POKERS[color].indexOf(x)>=0 && const_ll7.LORD_POKERS.indexOf(x)<0
    })
};

cutil_ll7.get_type_pokers = function (pokers, type) {
	var pokers2NumDict = collections.groupBy(pokers);
	var keys = collections.map(Object.keys(pokers2NumDict), function (x) {return parseInt(x)}).sort(collections.compare);
	if(type === const_ll7.TYPE_ONE){
		return collections.map(keys, function (x) {return [x]})
	} else if(type === const_ll7.TYPE_PAIR){
		var pair_keys = collections.filter(keys, function (x) {return pokers2NumDict[x.toString()] === 2});
        return collections.map(pair_keys, function (x) {return [x, x]})
	} else if(type === const_ll7.TYPE_SEQ_PAIR){
        var pair_keys = collections.filter(keys, function (x) {return pokers2NumDict[x.toString()] === 2});
		var sub_pairs = [];
        for (var i = 0; i < pair_keys.length-1; i++){
            for (var j = i+1; j < pair_keys.length; j++){
				var temp = [];
				for (var k = i; k <= j; k++) {
					temp.push(pair_keys[k])
				}
				sub_pairs.push(temp)
            }
		}
		var color_filter = collections.filter(sub_pairs, function (pokers) {return cutil_ll7.is_seq_color(pokers)});
		var seq_color_filter = collections.filter(color_filter, function (pokers) {return cutil_ll7.is_seq_one(pokers)[0]});
		return collections.map(seq_color_filter, function (pokers) {return pokers.concat(pokers).sort(collections.compare)}).sort(function (a, b) {
            if(a.length === b.length){
                return collections.max(cutil_ll7.produceSeq2(cutil_ll7.pokers2Num(a))) - collections.max(cutil_ll7.produceSeq2(cutil_ll7.pokers2Num(b)))
            }
            return a.length - b.length;
        })
	}
	return []
};