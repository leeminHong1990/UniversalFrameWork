"use strict";
var cutil_gsjmj = function () {
};
cutil_gsjmj.get_count = function (tiles, t) {
	var sum = 0;
	for (var i = 0; i < tiles.length; i++) {
		if (tiles[i] === t) {
			sum++;
		}
	}
	return sum;
};

cutil_gsjmj.meld_history = {};

cutil_gsjmj.meld_with_pair_need_num = function (tiles, history, used) {
	history = history || this.meld_history;
	var case1 = 999;
	var case2 = 999;
	var idx = -1;

	if (cutil_gsjmj.meld_only_need_num(tiles, history) === 0) {
		case1 = 2;
	}

	for (var i = 0; i < tiles.length; i++) {
		var tmp = tiles.concat([]);

		if (cutil_gsjmj.get_count(tiles, tiles[i]) === 1) {
			idx = tmp.indexOf(tiles[i]);
			tmp.splice(idx, 1);
			case2 = Math.min(case2, 1 + cutil_gsjmj.meld_only_need_num(tmp, history));
		} else {
			idx = tmp.indexOf(tiles[i]);
			tmp.splice(idx, 1);
			idx = tmp.indexOf(tiles[i]);
			tmp.splice(idx, 1);
			case2 = Math.min(case2, cutil_gsjmj.meld_only_need_num(tmp, history));
		}
	}

	return Math.min(case1, case2);
};

cutil_gsjmj.meld_only_need_num = function (tiles, history, used) {
	history = history || this.meld_history;
	used = used || 0;
	if (used > 4) {
		return 999;
	}

	var key = tiles.concat([]).sort(function (a, b) {
		return a - b;
	});
	if (history.hasOwnProperty(key)) {
		return history[key];
	}

	var size = tiles.length;
	if (size == 0) {
		return 0;
	}
	if (size == 1) {
		return 2;
	}
	if (size == 2) {
		var p1 = tiles[0];
		var p2 = tiles[1];
		var case1 = 999;
		if (p1 < const_val.BOUNDARY && p2 - p1 <= 2) {
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
		var idx1 = left1.indexOf(first + 1);
		if (idx1 >= 0) {
			left1.splice(idx1, 1);
		} else {
			case1 += 1;
		}
		var idx2 = left1.indexOf(first + 2);
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
cutil_gsjmj.canTenPai = function (handTiles, kingTiles) {
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
	if (cutil_gsjmj.checkIs7Pairs(handTiles, handTilesButKing, kingTilesNum + 1)) {
		return true;
	}

	var num = this.meld_with_pair_need_num(handTilesButKing);
	return (num - kingTilesNum <= 1);
};

cutil_gsjmj.checkIs7Pairs = function (handTilesButKing, kingTilesNum) {
	if (handTilesButKing.length + kingTilesNum !== 14) {
		return false
	}
	var tileDict = cutil_gsjmj.getTileNumDict(handTilesButKing);
	var need_num = 0
	for (var tile in tileDict) {
		need_num += (tileDict[tile] % 2);
	}
	if (need_num <= kingTilesNum) {
		return true
	}
	return false
};

// 十三不靠
cutil_gsjmj.get13Mismatch = function (handTiles, kingTiles) {
	if (handTiles.length !== 14) {
		return false;
	}
	let classifyTiles = cutil_gsjmj.classifyTiles(handTiles, kingTiles);
	let kings = classifyTiles[0];
	let chars = classifyTiles[1];
	let bambs = classifyTiles[2];
	let dots = classifyTiles[3];
	let winds = classifyTiles[4];
	let dragons = classifyTiles[5];
	let winds_dragons = winds.concat(dragons);
	for (var i = 1; i < 4; i++) {
		if (classifyTiles[i].length > 3) {
			return false
		}
	}
	if (winds_dragons.length > 7) {
		return false
	}
	let kingTileNum = kings.length;
	if (kingTileNum > 2) {
		return false;
	}
	let need_tiles_num = 5 - winds_dragons.length;
	if (need_tiles_num > kingTileNum) {
		return false;
	}
	let char_dict = cutil_gsjmj.getTileNumDict(chars);
	let bamb_dict = cutil_gsjmj.getTileNumDict(bambs);
	let dot_dict = cutil_gsjmj.getTileNumDict(dots);
	let wind_dragon_dict = cutil_gsjmj.getTileNumDict(winds_dragons);

	var tmp_char_dict = cutil_gsjmj.dictValuesToArray(char_dict);
	var tmp_bamb_dict = cutil_gsjmj.dictValuesToArray(bamb_dict);
	var tmp_dot_dict = cutil_gsjmj.dictValuesToArray(dot_dict);
	var tmp_wind_dragon_dict = cutil_gsjmj.dictValuesToArray(wind_dragon_dict);
	if ((tmp_char_dict.length > 0 && collections.max(tmp_char_dict) > 1) ||
		(tmp_bamb_dict.length > 0 && collections.max(tmp_bamb_dict) > 1) ||
		(tmp_dot_dict.length > 0 && collections.max(tmp_dot_dict) > 1) ||
		(tmp_wind_dragon_dict.length > 0 && collections.max(tmp_wind_dragon_dict) > 1)) {
		return false;
	}

	function check_is_match(arr) {
		let len = arr.length;
		if (len <= 1) {
			return true;
		}
		if (len === 2) {
			return arr[1] - arr[0] >= 3
		}
		if (len === 3) {
			return arr[1] - arr[0] >= 3 && arr[2] - arr[1] >= 3;
		}
		return false
	}

	if (!check_is_match(chars) || !check_is_match(bambs) || !check_is_match(dots)) {
		return false;
	}
	var flags = [false, false, false];

	function tryFill(arr) {
		let len = arr.length;
		let need = 3 - len;
		if (len > 0) {
			let tmp = parseInt(arr[0] / 10);
			var index = -1;
			if (tmp === 0) {
				index = 0;
			} else if (tmp === 3) {
				index = 1;
			} else if (tmp === 5) {
				index = 2;
			} else {
				return -1;
			}
			if (flags[index]) {
				return -1;
			} else {
				flags[index] = true;
				return need;
			}
		}
	}

	let tile_group = [chars, bambs, dots];
	for (var i = 0; i < 3; i++) {
		if (tile_group[i].length === 0) {
			need_tiles_num += 3;
		} else {
			let need = tryFill(tile_group[i]);
			if (need < 0) {
				return false;
			}
			need_tiles_num += need;
		}
	}
	return need_tiles_num === kingTileNum;
};

// 十三幺
cutil_gsjmj.getThirteenOrphans = function (handTilesButKing, kingTilesNum) {
	if (handTilesButKing.length + kingTilesNum !== 14) {
		return false;
	}
	let need_tiles = [1, 9, 31, 39, 51, 59, 71, 72, 73, 74, 75, 76, 77];

	function withoutKings() {
		for (var t of need_tiles) {
			if (handTilesButKing.indexOf(t) < 0) {
				return false;
			}
		}
		for (var i = 0; i < need_tiles.length; i++) {
			if (cutil_gsjmj.get_count(handTilesButKing, need_tiles[i]) === 2) {
				return true;
			}
		}
		return false;
	}

	if (kingTilesNum > 0) {
		let copyHand = handTilesButKing.slice(0);
		let win_need_tile = [];
		for (var i = 0; i < need_tiles.length; i++) {
			var tile = need_tiles[i];
			let index = copyHand.indexOf(tile);
			if (index >= 0) {
				copyHand.splice(index, 1);
			} else {
				win_need_tile.push(tile);
			}
		}

		if (copyHand.length > 1) {
			return false;
		}

		if (copyHand.length === 1 && need_tiles.indexOf(copyHand[0]) < 0) {
			return false;
		}
		let need_sum = win_need_tile.length;
		need_sum += copyHand.length === 0 ? 1 : 0;
		return need_sum === kingTilesNum;
	} else {
		return withoutKings();
	}
};

// Attention: 正常的胡牌(3N + 2, 有赖子牌), 七对胡那种需要特殊判断, 这里不处理
cutil_gsjmj.canNormalWinWithKing3N2 = function (handTilesButKing, kingTilesNum) {
	if ((handTilesButKing.length + kingTilesNum) % 3 !== 2) {
		return false;
	}
	var classified = this.classifyTiles(handTilesButKing, []);
	var chars = classified[1];
	var bambs = classified[2];
	var dots = classified[3];
	var winds = classified[4];
	var dragons = classified[5];
	var class_list = [chars, bambs, dots, winds, dragons];
	var meldNeed = [];
	var mos = 0, mps = 0, i, mo, mp;
	for (i = 0; i < class_list.length; i++) {
		var tiles = class_list[i];
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
cutil_gsjmj.canNormalWinWithoutKing3N2 = function (handTiles) {
	if (handTiles.length % 3 !== 2) {
		return false;
	}
	var classified = this.classifyTiles(handTiles);
	var chars = classified[1];
	var bambs = classified[2];
	var dots = classified[3];
	var winds = classified[4];
	var dragons = classified[5];
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

cutil_gsjmj.isMeld = function (tiles) {
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
		tilesCopy.sort(function (a, b) {
			return a - b;
		});
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


cutil_gsjmj.isMeldWithPair = function (tiles) {
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

cutil_gsjmj.checkMeldInPossible = function (tiles, possibleList) {
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

cutil_gsjmj.sortChowTileList = function (chowTile, tiles) {
	var tempTiles = tiles.concat();
	var endTile = tempTiles.pop();
	tempTiles.splice(0, 1);
	return [tempTiles[0], chowTile, endTile];
};

cutil_gsjmj.tileSortFunc = function (a, b) {
	if (a == b) {
		return 0;
	}

	var player = h1global.player();
	if (!player.curGameRoom || player.curGameRoom.kingTiles.length <= 0) {
		return a - b;
	}

	if (player.curGameRoom.kingTiles.indexOf(a) >= 0) {
		return -1
	}
	if (player.curGameRoom.kingTiles.indexOf(b) >= 0) {
		return 1
	}

	return a - b;
};

cutil_gsjmj.tileSort = function (tiles, kingTiles) {
	var kings = kingTiles || [];
	tiles.sort(function (a, b) {
		if (kings.indexOf(a) >= 0 && kings.indexOf(b) >= 0) {
			return a - b;
		} else if (kings.indexOf(a) >= 0) {
			return -1
		} else if (kings.indexOf(b) >= 0) {
			return 1
		} else if (kingTiles.length > 0 && a === const_val.DRAGON_WHITE && b === const_val.DRAGON_WHITE) {
			return 0
		} else if (kingTiles.length > 0 && a === const_val.DRAGON_WHITE) {
			return kings[0] - b;
		} else if (kingTiles.length > 0 && b === const_val.DRAGON_WHITE) {
			return a - kings[0];
		} else {
			return a - b;
		}
	})
};

cutil_gsjmj.classifyTiles = function (tiles, kingTiles) {
	kingTiles = kingTiles || [];
	var kings = [];
	var chars = [];
	var bambs = [];
	var dots = [];
	var winds = [];
	var dragons = [];

	tiles = cutil.deepCopy(tiles);
	tiles.sort(function (a, b) {
		return a - b;
	})

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

cutil_gsjmj.classifyKingTiles = function (tiles, kingTiles) {
	kingTiles = kingTiles || [];
	var kings = [];
	var others = [];
	for (var i = 0; i < tiles.length; i++) {
		var t = tiles[i];
		if (kingTiles.indexOf(t) >= 0) {
			kings.push(t);
		} else {
			others.push(t);
		}
	}
	return [kings, others]
};

//获取同样牌的张数 dict
cutil_gsjmj.getTileNumDict = function (tiles) {
	var tileDict = {};
	for (var i = 0; i < tiles.length; i++) {
		var t = tiles[i];
		if (!tileDict[t]) {
			tileDict[t] = 1
		} else {
			tileDict[t] += 1
		}
	}
	return tileDict
};

cutil_gsjmj.count = function (list, key) {
	var dict = {};
	for (var i = 0; i < list.length; i++) {
		if (dict[list[i]]) {
			dict[list[i]] += 1;
		} else {
			dict[list[i]] = 1;
		}
	}
	if (dict[key]) {
		return dict[key]
	}
	return 0
};


// 是否是堆胡，不判断胡
cutil_gsjmj.is_heap_color = function (handTilesButKing, upTiles, kingNum) {
	var character_count = kingNum;
	var bamboo_count = kingNum;
	var dot_count = kingNum;
	for (var i = 0; i < handTilesButKing.length; i++) {
		var t = handTilesButKing[i];
		if (t < 10) {
			character_count++;
		}
		else if (t > 30 && t < 40) {
			bamboo_count++;
		} else if (t > 50 && t < 60) {
			dot_count++;
		}
	}
	for (var i = 0; i < upTiles.length; i++) {
		var t = collections.max(upTiles[i]);
		if (t < 10) {
			character_count += upTiles[i].length;
		}
		else if (t > 30 && t < 40) {
			bamboo_count += upTiles[i].length;
		} else if (t > 50 && t < 60) {
			dot_count += upTiles[i].length;
		}
	}
	return character_count >= 8 || bamboo_count >= 8 || dot_count >= 8;
};

cutil_gsjmj.get_playing_room_detail = function (room_info) {
	var str_list = [];

	str_list.push(room_info["game_round"] + "局");

	if (room_info['king_num'] > 0) {
		str_list.push("带混");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_7PAI) === const_gsjmj.SUIT_7PAI) {
		str_list.push("七对");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_13MISMATCH) === const_gsjmj.SUIT_13MISMATCH) {
		str_list.push("十三不靠");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_13ORPHAN) === const_gsjmj.SUIT_13ORPHAN) {
		str_list.push("十三幺");
	}
	// if (room_info["base_score"]) {
	// 	str_list.push("底分" + room_info["base_score"])
	// }
	if (room_info["pay_mode"] === const_val.AA_PAY_MODE) {
		str_list.push("AA支付");
	}

	// if(room_info["hand_prepare"] === 0){
	//    str_list.push("手动准备");
	// } else {
	//    str_list.push("自动准备");
	// }

	return str_list.join(',');
};

cutil_gsjmj.get_complete_room_detail = function (room_info) {
	var str_list = [];

	str_list.push(room_info["game_round"] + "局");
	if (room_info['king_num'] > 0) {
		str_list.push("带混");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_7PAI) === const_gsjmj.SUIT_7PAI) {
		str_list.push("七对");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_13MISMATCH) === const_gsjmj.SUIT_13MISMATCH) {
		str_list.push("十三不靠");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_13ORPHAN) === const_gsjmj.SUIT_13ORPHAN) {
		str_list.push("十三幺");
	}
	// if (room_info["base_score"]) {
	// 	str_list.push("底分" + room_info["base_score"])
	// }
	if (room_info["pay_mode"] === const_val.AA_PAY_MODE) {
		str_list.push("AA支付");
	}

	// if(room_info["hand_prepare"] === 0){
	//     str_list.push("手动准备");
	// } else {
	//     str_list.push("自动准备");
	// }

	return str_list.join(',');
};

cutil_gsjmj.get_club_share_desc = function (room_info) {
	var str_list = [];

	str_list.push(room_info["game_round"] + "局");
	if (room_info['king_num'] > 0) {
		str_list.push("带混");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_7PAI) === const_gsjmj.SUIT_7PAI) {
		str_list.push("七对");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_13MISMATCH) === const_gsjmj.SUIT_13MISMATCH) {
		str_list.push("十三不靠");
	}
	if ((room_info['suit_mode'] & const_gsjmj.SUIT_13ORPHAN) === const_gsjmj.SUIT_13ORPHAN) {
		str_list.push("十三幺");
	}

	// if (room_info["base_score"]) {
	// 	str_list.push("底分" + room_info["base_score"])
	// }

	if (room_info["pay_mode"] === const_val.AA_PAY_MODE) {
		str_list.push("AA支付");
	}

	// if(room_info["hand_prepare"] === 0){
	//     str_list.push("手动准备");
	// } else {
	//     str_list.push("自动准备");
	// }

	return str_list.join(',');
};