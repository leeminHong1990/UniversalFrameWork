"use strict";
var ddz_rules = function () {
};
ddz_rules.POKER_NUM_STRING_DICT = {
	2: '2',
	3: '3',
	4: '4',
	5: '5',
	6: '6',
	7: '7',
	8: '8',
	9: '9',
	10: '10',
	11: 'J',
	12: 'Q',
	13: 'K',
	14: 'A',
	20: 'F',
	21: 'L',
	22: 'B',
};
ddz_rules.A = 14;
ddz_rules.LITTLE_JOKER = 21;
ddz_rules.BIG_JOKER = 22;
ddz_rules.FLOWER = 23;

ddz_rules.POKER_COLOR_DICT = {
	1: "a",
	2: "c",
	8: "b",
	4: "d",
};

ddz_rules.TYPE_SINGLE = 0;
ddz_rules.TYPE_PAIR_JOKER = 1;

ddz_rules.TYPE_PAIR2 = 2;
ddz_rules.TYPE_PAIR3 = 3;
ddz_rules.TYPE_PAIR3_1 = 4;
ddz_rules.TYPE_PAIR3_2 = 5;
ddz_rules.TYPE_PAIR4 = 6;
// ddz_rules.TYPE_PAIR4_2 = 7;
ddz_rules.TYPE_SEQ_PAIR2 = 8;
ddz_rules.TYPE_SEQ_PAIR3 = 9;
ddz_rules.TYPE_SEQ_PAIR3_1 = 10;
ddz_rules.TYPE_SEQ_PAIR3_2 = 11;
ddz_rules.TYPE_SEQ = 12;
ddz_rules.TYPE_PAIR4_2_1 = 13;
ddz_rules.TYPE_PAIR4_2_2 = 14;
ddz_rules.TYPE_FLOWER = 15;


ddz_rules.ALL_TYPES = [
	ddz_rules.TYPE_SINGLE, ddz_rules.TYPE_PAIR2, ddz_rules.TYPE_PAIR3,
	ddz_rules.TYPE_PAIR3_1, ddz_rules.TYPE_PAIR3_2,
	ddz_rules.TYPE_SEQ_PAIR2, ddz_rules.TYPE_SEQ_PAIR3, ddz_rules.TYPE_SEQ_PAIR3_1, ddz_rules.TYPE_SEQ_PAIR3_2, ddz_rules.TYPE_SEQ,
	ddz_rules.TYPE_PAIR4, ddz_rules.TYPE_PAIR4_2_1, ddz_rules.TYPE_PAIR4_2_2,
	ddz_rules.TYPE_FLOWER,
	ddz_rules.TYPE_PAIR_JOKER
];

ddz_rules.get_suit = function (value) {
	return (value & 0x0000ff00) >>> 8;
};

ddz_rules.get_rank = function (value) {
	return value & 0x000000ff;
};

ddz_rules.to_card = function (suit, rank) {
	return (suit << 8) | rank;
};

ddz_rules.poker_compare = function (a, b, suit) {
	suit = suit === undefined ? true : suit;
	let color1 = ddz_rules.get_suit(a);
	let num1 = ddz_rules.get_rank(a);
	let color2 = ddz_rules.get_suit(b);
	let num2 = ddz_rules.get_rank(b);
	if (num1 === num2 && suit) {
		return color1 - color2;
	}
	return ddz_rules.compare_rank(num1, num2);
};

ddz_rules.poker_compare2 = function (a, b, suit) {
	suit = suit === undefined ? true : suit;
	let color1 = ddz_rules.get_suit(a);
	let num1 = ddz_rules.get_rank(a);
	let color2 = ddz_rules.get_suit(b);
	let num2 = ddz_rules.get_rank(b);
	if (num1 === num2 && suit) {
		return color1 - color2;
	}
	return ddz_rules.compare_rank(num2, num1);
};

ddz_rules.compare_rank = function (a, b) {
	if (a === 2) {
		a = a + 16;
	}
	if (b === 2) {
		b = b + 16;
	}
	return a - b;
};

ddz_rules.extract_pair = function (ints, count) {
	//提取数组中的对子
	let groups = collections.groupBy(ints);
	let arr = [];
	for (var k in groups) {
		if (groups[k] >= count) {
			arr.push(Number(k))
		}
	}
	return arr
};

ddz_rules.extract_pair2 = function (ints, count) {
	// 提取数组中的对子  count == 2 ==> 1,1,1,1,2,3 ==> 1,1
	let groups = collections.groupBy(ints);
	let arr = [];
	for (var k in groups) {
		if (groups[k] >= count) {
			for (var i = 0; i < parseInt(groups[k] / count); i++) {
				arr.push(Number(k))
			}
		}
	}
	return arr
};

// 是否是等差数列 差值为1
ddz_rules.isSeq = function (arr) {
	if (arr.length < 2) {
		return false;
	}
	let c0 = arr[0];
	let index = 1;
	while (index < arr.length) {
		if (arr[index] - c0 !== 1) {
			return false;
		}
		c0 = arr[index];
		index++;
	}
	return true;
};

ddz_rules.convert = function (cardsInt, sorted, converted) {
	sorted = sorted === undefined ? true : sorted;
	converted = converted === undefined ? true : converted;
	if (!converted) {
		cardsInt = collections.map(cardsInt, ddz_rules.get_rank)
	}
	if (!sorted) {
		cardsInt = cardsInt.sort(ddz_rules.poker_compare)
	}
	return cardsInt;
};

ddz_rules.is_single = function (cardsInt, sorted, converted) {
	return [cardsInt.length === 1 && cardsInt[0] !== ddz_rules.FLOWER, ddz_rules.TYPE_SINGLE, cardsInt[0]];
};

ddz_rules.is_flower = function (cardsInt, sorted, converted) {
	return [cardsInt.length === 1 && cardsInt[0] === ddz_rules.FLOWER, ddz_rules.TYPE_FLOWER, cardsInt[0]];
};

ddz_rules.is_pair_joker = function (cardsInt, sorted, converted) {
	return [cardsInt.length === 2 && cardsInt[0] + cardsInt[1] === ddz_rules.LITTLE_JOKER + ddz_rules.BIG_JOKER, ddz_rules.TYPE_PAIR_JOKER];
};

ddz_rules.is_pair2 = function (cardsInt, sorted, converted) {
	cardsInt = ddz_rules.convert(cardsInt, true, converted);
	return [cardsInt.length === 2 ? cardsInt[1] === cardsInt[0] : false, ddz_rules.TYPE_PAIR2, cardsInt[0]];
};
ddz_rules.is_pair3 = function (cardsInt, sorted, converted) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return [cardsInt.length === 3 ? (cardsInt[0] === cardsInt[1] && cardsInt[1] === cardsInt[2]) : false, ddz_rules.TYPE_PAIR3, cardsInt[0]];
};

ddz_rules.is_pair3_1 = function (cardsInt, sorted, converted) {
	if (cardsInt.length !== 4 || cardsInt.indexOf(ddz_rules.FLOWER) >= 0) {
		return [false, ddz_rules.TYPE_PAIR3_1, -1]
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	let c0 = cardsInt[0];
	let c2 = cardsInt[3];

	var is_match  = collections.count(cardsInt, c0) === 3 || collections.count(cardsInt, c2) === 3;
	return [is_match, ddz_rules.TYPE_PAIR3_1, is_match ? (collections.count(cardsInt, c0) === 3 ? c0: c2) : -1];
};


ddz_rules.is_pair3_2 = function (cardsInt, sorted, converted) {
	if (cardsInt.length !== 5) {
		return [false, ddz_rules.TYPE_PAIR3_2, -1]
	}
	let has3 = false;
	let has2 = false;
	let primary = -1;
	let groups = collections.groupBy(cardsInt);
	for (var key in groups) {
		if (groups[key] === 3) {
			has3 = true;
			primary = Number(key);
		} else if (groups[key] === 2) {
			has2 = true
		}
		else {
			return [false, ddz_rules.TYPE_PAIR3_2, -1]
		}
	}
	return [has2 && has3, ddz_rules.TYPE_PAIR3_2, primary]
};

ddz_rules.is_pair4 = function (cardsInt, sorted, converted) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return [cardsInt.length === 4 ? cardsInt[0] === cardsInt[1] && cardsInt[1] === cardsInt[2] && cardsInt[2] === cardsInt[3] : false, ddz_rules.TYPE_PAIR4, cardsInt[0]];
};

ddz_rules.is_pair4_X = function (cardsInt, type, tailCount, sorted, converted) {
	if (cardsInt.length !== 4 + tailCount * 2 || cardsInt.indexOf(ddz_rules.FLOWER) >= 0) {
		return [false, type, -1]
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	let groups = collections.groupBy(cardsInt);
	let has4 = false;
	let count1 = 0;
	let count2 = 0;
	let primary = null;
	for (var key in groups) {
		let count = groups[key];
		if (count === 4) {
			has4 = true;
			primary = Number(key);
		} else {
			if (count === 1) {
				count1++;
			} else if (count === 2) {
				count2++;
			} else {
				return [false, type, -1]
			}
		}
	}
	let has2 = false;
	if (tailCount === 1) {
		has2 = (count1 === 2 && count2 === 0) || (count1 === 0 && count2 === 1);
	} else {
		has2 = count1 === 0 && count2 === 2;
	}
	return [has2 && has4, type, primary];
};

ddz_rules.is_pair4_4 = function (cardsInt, sorted, converted) {
	if (cardsInt.length !== 8) {
		return [false, ddz_rules.TYPE_PAIR4_2_2, -1]
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	let groups = collections.groupBy(cardsInt);
	let primary = 0;
	let count = 0;
	for (var key in groups) {
		let c = groups[key];
		if (c === 4) {
			count++;
			primary = Math.max(primary, Number(key));
		} else {
			return [false, ddz_rules.TYPE_PAIR4_2_2, -1]
		}
	}
	return [count === 2, ddz_rules.TYPE_PAIR4_2_2, primary]
};

ddz_rules.is_pair4_2_1 = function (cardsInt, sorted, converted) {
	return ddz_rules.is_pair4_X(cardsInt, ddz_rules.TYPE_PAIR4_2_1, 1, sorted, converted);
};

ddz_rules.is_pair4_2_2 = function (cardsInt, sorted, converted) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	let pair422 = ddz_rules.is_pair4_X(cardsInt, ddz_rules.TYPE_PAIR4_2_2, 2, true, true);
	if (pair422[0]) {
		return pair422;
	}
	return ddz_rules.is_pair4_4(cardsInt, true, true);
};

ddz_rules.is_seq_pair_x = function (cardsInt, pairCount, type) {
	let length = cardsInt.length;
	if ((cardsInt[length - 1] - cardsInt[0]) === (length / pairCount - 1)) {
		let groups = collections.groupBy(cardsInt);
		for (var key in groups) {
			if (groups[key] !== pairCount) {
				return [false, type, -1, -1]
			}
		}
		return [true, type, cardsInt[0], cardsInt[length - 1]]
	}
	return [false, type, -1, -1]
};

ddz_rules.is_seq_pair2 = function (cardsInt, sorted, converted) {
	let l = cardsInt.length;
	if (l % 2 !== 0 || l < 6) {
		return [false, ddz_rules.TYPE_SEQ_PAIR2, -1, -1];
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return ddz_rules.is_seq_pair_x(cardsInt, 2, ddz_rules.TYPE_SEQ_PAIR2);
};

ddz_rules.is_seq_pair3 = function (cardsInt, sorted, converted) {
	let l = cardsInt.length;
	if (l % 3 !== 0 || l < 6) {
		return [false, ddz_rules.TYPE_SEQ_PAIR3, -1, -1];
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return ddz_rules.is_seq_pair_x(cardsInt, 3, ddz_rules.TYPE_SEQ_PAIR3);
};

ddz_rules.is_seq_pair3_with_any = function (cardsInt, tailCount, type) {
	let l = cardsInt.length;
	if (l % (3 + tailCount) !== 0 || l < (3 + tailCount) * 2) {
		return [false, type, -1, -1];
	}
	if (cardsInt.indexOf(ddz_rules.FLOWER) >= 0) {
		return [false, type, -1, -1];
	}

	let n = parseInt(l / (3 + tailCount));
	let pair3Arr = ddz_rules.extract_pair(cardsInt, 3);

	if (pair3Arr.length < n || n < 2) {
		return [false, type, -1, -1];
	}
	var validArr = [];
	collections.combinations(pair3Arr, n, function (output) {
		output.sort(collections.compare);
		if (output[0] !== 2 && ddz_rules.isSeq(output)) {
			validArr.push(output);
		}
	});
	if (validArr.length === 0) {
		return [false, type, -1, -1];
	}
	for (var i = 0; i < validArr.length; i++) {
		let srcCopy = cardsInt.slice(0);
		let tmp = validArr[i];
		for (var j = 0; j < tmp.length; j++) {
			srcCopy.splice(srcCopy.indexOf(tmp[j]), 1);
			srcCopy.splice(srcCopy.indexOf(tmp[j]), 1);
			srcCopy.splice(srcCopy.indexOf(tmp[j]), 1);
		}
		if (ddz_rules.extract_pair2(srcCopy, tailCount).length === n) {
			return [true, type, tmp[0], tmp[tmp.length - 1]];
		}
	}
	return [false, type, -1, -1];
};
ddz_rules.is_seq_pair3_1 = function (cardsInt, sorted, converted) {
	let l = cardsInt.length;
	if (l % 4 !== 0 && l < 8) {
		return [false, ddz_rules.TYPE_SEQ_PAIR3_1, -1, -1];
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return ddz_rules.is_seq_pair3_with_any(cardsInt, 1, ddz_rules.TYPE_SEQ_PAIR3_1);
};
ddz_rules.is_seq_pair3_2 = function (cardsInt, sorted, converted) {
	let l = cardsInt.length;
	if (l % 5 !== 0 && l < 10) {
		return [false, ddz_rules.TYPE_SEQ_PAIR3_2, -1, -1];
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return ddz_rules.is_seq_pair3_with_any(cardsInt, 2, ddz_rules.TYPE_SEQ_PAIR3_2);
};

ddz_rules.is_seq = function (cardsInt, sorted, converted) {
	let len = cardsInt.length;
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	if (len < 5 || cardsInt[0] < 3) {
		return [false, ddz_rules.TYPE_SEQ, -1, -1];
	}
	if (ddz_rules.isSeq(cardsInt)) {
		return [true, ddz_rules.TYPE_SEQ, cardsInt[0], cardsInt[len - 1]]
	}
	return [false, ddz_rules.TYPE_SEQ, -1, -1];
};

ddz_rules.TEST_RULES = [
	ddz_rules.is_single, ddz_rules.is_flower, ddz_rules.is_pair_joker, ddz_rules.is_pair2, ddz_rules.is_pair3, ddz_rules.is_pair4,
	ddz_rules.is_pair3_1, ddz_rules.is_pair3_2,
	ddz_rules.is_pair4_2_1, ddz_rules.is_pair4_2_2,
	ddz_rules.is_seq, ddz_rules.is_seq_pair2, ddz_rules.is_seq_pair3, ddz_rules.is_seq_pair3_1, ddz_rules.is_seq_pair3_2,
];

ddz_rules.test_with_rule = function (cardsInt, sorted, converted, returnInfo, hasFlower, only3_1) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	for (let i = 0; i < ddz_rules.TEST_RULES.length; i++) {
		let matchFunc = ddz_rules.TEST_RULES[i];
		if(only3_1 && (matchFunc === ddz_rules.is_pair3_2 || matchFunc === ddz_rules.is_seq_pair3_2)){
			continue;
		}
		let result = matchFunc(cardsInt, sorted, converted);
		if (!hasFlower && result[1] === ddz_rules.TYPE_FLOWER) {
			continue;
		}
		if (returnInfo && result[0]) {
			return result;
		} else if (result[0]) {
			return true;
		}
	}
	if (returnInfo) {
		return [false];
	}
	return false;
};

ddz_rules.iterSortCompare = function (a, b) {
	if (a === 2) {
		a = a + 16
	}
	if (b === 2) {
		b = b + 16;
	}
	return a - b;
};

ddz_rules.emptyIter = function (cardsInt, type) {
	var iter = {};
	iter._sourceType = type;
	iter.source = cardsInt;
	iter.hasNext = function () {
		return false;
	};
	iter.next = function () {
		return null;
	};
	return iter;
};

// 对数据分类后排序整合 [2,2,3,3,4,] ==> [4,3,2]
// start: 1 ,2,3,4 拍再最前面的
ddz_rules.tidyData = function (cardsInt, start) {
	let groups = collections.groupBy(cardsInt);
	let tmp = [[], [], [], []];
	for (var key  in  groups) {
		let count = groups[key];
		if (count >= start) {
			let arr = tmp[count - start];
			if (!arr) {
				arr = [];
				tmp[count - start] = arr;
			}
			arr.push(Number(key))
		}
	}
	let result = [];
	for (var i = 0; i < tmp.length; i++) {
		if (tmp[i] && tmp [i].length > 0) {
			result = result.concat(tmp[i].sort(ddz_rules.iterSortCompare));
		}
	}
	return result;
};

ddz_rules.single = function (cardsInt, sorted, converted) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);

	let i = cardsInt.indexOf(ddz_rules.FLOWER);
	if (i >= 0) {
		cardsInt.splice(i, 1)
	}
	let arr = ddz_rules.tidyData(cardsInt, 1);

	let iter = {};
	iter.source = cardsInt;
	iter._tmp = arr;
	cardsInt = arr;
	iter.next = function () {
		if (this.hasNext()) {
			return [cardsInt[this.index++]];
		} else {
			return null;
		}
	};
	iter.hasNext = function () {
		return this.index < cardsInt.length;
	};
	iter.index = 0;
	return iter;
};

ddz_rules.flower = function (cardsInt, sorted, converted) {
	let iter = {};
	iter.source = cardsInt;
	iter.next = function () {
		if (this.flag) {
			return null;
		}
		if (this.hasNext()) {
			this.flag = true;
			return [ddz_rules.FLOWER];
		}
		return null;
	};
	iter.hasNext = function () {
		return !this.flag && cardsInt.indexOf(ddz_rules.FLOWER) >= 0;
	};
	iter.flag = false;
	return iter;
};

ddz_rules.pair_joker = function (cardsInt) {
	let iter = {};
	iter.source = cardsInt;
	iter.next = function () {
		if (this.flag) {
			return null;
		}
		if (this.hasNext()) {
			this.flag = true;
			return [ddz_rules.LITTLE_JOKER, ddz_rules.BIG_JOKER];
		}
		return null;
	};
	iter.hasNext = function () {
		return !this.flag && cardsInt.indexOf(ddz_rules.BIG_JOKER) >= 0 && cardsInt.indexOf(ddz_rules.LITTLE_JOKER) >= 0;
	};
	iter.flag = false;
	return iter;
};

ddz_rules.pair = function (cardsInt, count, sorted, converted) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);

	let pairArr = ddz_rules.tidyData(cardsInt, count);
	if (pairArr.length === 0) {
		return ddz_rules.emptyIter(cardsInt, "pair_" + count);
	}
	let iter = {};
	iter.source = cardsInt;
	iter.next = function () {
		if (this.hasNext()) {
			return new Array(count).fill(pairArr[this.index++]);
		}
		return null;
	};
	iter.hasNext = function () {
		if (this.index < pairArr.length) {
			for (var i = this.index; i < pairArr.length; i++) {
				this.index = i;
				return true;
			}
		}
		this.index = -1;
		return false;
	};
	iter.index = 0;
	return iter;
};
ddz_rules.pair2 = function (cardsInt, sorted, converted) {
	return ddz_rules.pair(cardsInt, 2, sorted, converted);
};

ddz_rules.pair3 = function (cardsInt, sorted, converted) {
	return ddz_rules.pair(cardsInt, 3, sorted, converted);
};

ddz_rules.pair4 = function (cardsInt, sorted, converted) {
	return ddz_rules.pair(cardsInt, 4, sorted, converted);
};

ddz_rules.combinationsHeadAndTail = function (heads, tails, ignoreTail) {
	let result = [];
	if (heads.length === tails.length && tails.length === 1) {
		return result;
	}
	var head = null;
	var tail = null;
	if (ignoreTail) {
		for (var i = 0; i < heads.length; i++) {
			head = heads[i];
			var index = 0;
			tail = tails[index];
			while (tail === head && tails.length > index) {
				tail = tails[++index];
			}
			if (!(head === tail || tail === null)) {
				result.push([head, tail]);
			}
		}
	} else {
		for (var i = 0; i < heads.length; i++) {
			head = heads[i];
			for (var j = 0; j < tails.length; j++) {
				tail = tails[j];
				if (head !== tail) {
					result.push([head, tail]);
				}
			}
		}
	}
	return result;
}

ddz_rules.pairAndTail = function (cardsInt, pairCount, tailCount, ignoreTail, sorted, converted) {
	let i = cardsInt.indexOf(ddz_rules.FLOWER);
	if (i >= 0) {
		cardsInt.splice(i, 1)
	}
	if (cardsInt.length < pairCount + tailCount) {
		return ddz_rules.emptyIter(cardsInt, "pair" + pairCount + "_" + tailCount)
	}
	let iter = {};
	iter.source = cardsInt;
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	let pairArr = ddz_rules.extract_pair(cardsInt, pairCount).sort(ddz_rules.iterSortCompare);
	let tailArr = ddz_rules.tidyData(cardsInt, tailCount);

	let result = ddz_rules.combinationsHeadAndTail(pairArr, tailArr, ignoreTail);

	iter.index = 0;
	iter.consume = true;
	iter.result = result;
	iter.hasNext = function () {
		// 上一次 hasNext 还未消费掉
		if (!this.consume) {
			return true;
		}
		return this.index < result.length;
	};
	iter.next = function () {
		if (this.hasNext()) {
			this.consume = true;
			let data = new Array(pairCount + tailCount);
			let pair = result[this.index++];
			data.fill(pair[0], 0, pairCount);
			data.fill(pair[1], pairCount);
			return data;
		}
		this.result = null;
		return null;
	};
	return iter;
};

ddz_rules.pair3_1 = function (cardsInt, sorted, converted, ignoreTail) {
	return ddz_rules.pairAndTail(cardsInt, 3, 1, ignoreTail, sorted, converted);
};

ddz_rules.pair3_2 = function (cardsInt, sorted, converted, ignoreTail) {
	return ddz_rules.pairAndTail(cardsInt, 3, 2, ignoreTail, sorted, converted);
};

ddz_rules.pair4_2_x = function (cardsInt, tailCount, ignoreTail, type) {
	let i = cardsInt.indexOf(ddz_rules.FLOWER);
	if (i >= 0) {
		cardsInt.splice(i, 1)
	}
	if (cardsInt.length < 4 + 2 * tailCount) {
		return ddz_rules.emptyIter(cardsInt, "pair4_2_" + tailCount);
	}
	let pairArr = ddz_rules.extract_pair(cardsInt, 4);
	let tailArr = ddz_rules.extract_pair(cardsInt, tailCount);
	if (tailArr.length < 2 || pairArr.length === 0) {
		return ddz_rules.emptyIter(cardsInt, "pair4_2_" + tailCount);
	}
	pairArr = pairArr.sort(ddz_rules.iterSortCompare);

	let iter = {};
	iter.source = cardsInt;
	iter._sourceType = type;
	iter.pairIndex = 0;
	iter.tailIndex = 0;
	iter.tailCount = 1;
	iter.tailComb = [];
	iter.consume = true;

	collections.combinations(tailArr, 2, function (target) {
		// source: [ [1,2],[2,3]]  target: [3,2]
		// [3 , 2] in  [[1,2] , [2,3]]
		// [3 , 3] not in  [[1,2] , [2,3]]
		let t0 = target[0];
		let t1 = target[1];
		// Note: 不能出现2222，3333这个情况 再这里过滤掉了
		if (tailCount > 1) {
			if (t0 === t1) {
				return;
			}
		}
		for (var i = 0; i < iter.tailComb.length; i++) {
			let src = iter.tailComb[i];
			if ((src[0] === t0 && src[1] === t1) || (src[0] === t1 && src[1] === t0)) {
				return;
			}
		}
		iter.tailComb.push(target);
	});
	iter.hasNext = function () {
		if (!this.consume) {
			return true;
		}
		if (pairArr.length === 0 || this.tailComb.length === 0) {
			return false;
		}
		if (this.pairIndex >= pairArr.length) {
			return false;
		}
		let head = pairArr[this.pairIndex];
		let tail = this.tailComb[this.tailIndex++];
		while (tail.indexOf(head) >= 0) {
			if (this.tailIndex === this.tailComb.length) {
				if (++this.pairIndex < pairArr.length) {
					this.tailIndex = 0;
				} else {
					this.consume = true;
					return false;
				}
			}
			head = pairArr[this.pairIndex];
			tail = this.tailComb[this.tailIndex++];
		}
		if (this.tailIndex === this.tailComb.length) {
			if (++this.pairIndex < pairArr.length) {
				this.tailIndex = 0;
			}
		}
		this.consume = false;
		this.head = head;
		this.tail = tail;
		return true;
	};
	iter.next = function () {
		if (this.hasNext()) {
			this.consume = true;
			let data = new Array(4 + 2 * tailCount);
			data.fill(this.head, 0, 4);
			data.fill(this.tail[0], 4, 4 + tailCount);
			data.fill(this.tail[1], 4 + tailCount, 4 + tailCount * 2);
			return data;
		}
		return null;

	};
	return iter;
};

ddz_rules.pair4_4 = function (cardsInt, sorted, converted) {
	let i = cardsInt.indexOf(ddz_rules.FLOWER);
	if (i >= 0) {
		cardsInt.splice(i, 1)
	}
	if (cardsInt.length < 8) {
		return ddz_rules.emptyIter(cardsInt, "pair4_4");
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	let pairArr = ddz_rules.extract_pair(cardsInt, 4);
	if (pairArr.length < 2) {
		return ddz_rules.emptyIter(cardsInt, "pair4_4");
	}
	var iter = {};
	iter.source = cardsInt;
	iter.index = 0;
	iter.comb = [];
	collections.combinations(pairArr, 2, function (target) {
		for (var i = 0; i < iter.comb.length; i++) {
			let src = iter.comb[i];
			let t0 = target[0];
			let t1 = target[1];
			if ((src[0] === t0 && src[1] === t1) || (src[0] === t1 && src[1] === t0)) {
				return;
			}
		}
		iter.comb.push(target);
	});
	iter.hasNext = function () {
		return this.index < this.comb.length;
	};
	iter.next = function () {
		let arr = this.comb[this.index++];
		if (arr) {
			let data = new Array(8);
			data.fill(arr[0], 0, 4);
			data.fill(arr[1], 4);
			return data;
		}
		return null;
	};
	return iter;
};

ddz_rules.pair4_2_1 = function (cardsInt, sorted, converted, ignoreTail) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return ddz_rules.pair4_2_x(cardsInt, 1, ignoreTail, ddz_rules.TYPE_PAIR4_2_1)
};
ddz_rules.pair4_2_2 = function (cardsInt, sorted, converted, ignoreTail) {
	let i = cardsInt.indexOf(ddz_rules.FLOWER);
	if (i >= 0) {
		cardsInt.splice(i, 1)
	}
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);

	var iter = {};
	iter.source = cardsInt;
	iter.arr = [ddz_rules.pair4_2_x(cardsInt, 2, ignoreTail, ddz_rules.TYPE_PAIR4_2_2), ddz_rules.pair4_4(cardsInt, true, true)];
	iter.index = 0;
	iter.hasNext = function () {
		var cur = this.arr[this.index];
		if (!cur) {
			return false;
		}
		while (!cur || !cur.hasNext()) {
			if (!cur) {
				return false;
			}
			cur = this.arr[++this.index];
		}
		return true;
	};
	iter.next = function () {
		return this.arr[this.index].next();
	};
	return iter;
};

ddz_rules.seq_pair = function (cardsInt, pairCount, seqCount, sorted, converted) {
	if (cardsInt.length < pairCount * seqCount) {
		return ddz_rules.emptyIter(cardsInt, "seq_pair_" + pairCount)
	}
	let iter = {};
	iter.source = cardsInt;
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	let pairArr = null;
	if (pairCount === 1) {
		pairArr = collections.unique(cardsInt);
	} else {
		pairArr = ddz_rules.extract_pair(cardsInt, pairCount);
	}
	iter.seqCount = seqCount;
	iter.combArr = null;
	iter.combIndex = 0;
	iter.hasNext = function () {
		if (this.seqCount > pairArr.length || pairArr.length === 0) {
			return false;
		}
		if (!this.combArr) {
			this.combArr = [];
			while (this.combArr.length === 0 && this.seqCount <= pairArr.length) {
				collections.combinations(pairArr, this.seqCount, function (arr) {
					arr = arr.sort(collections.compare);
					if (arr[0] > 2 && ddz_rules.isSeq(arr)) {
						iter.combArr.push(arr);
					}
				});
				if (this.combArr.length === 0) {
					this.seqCount++;
				}
			}
		}
		return this.combArr.length !== 0;
	};

	iter.next = function () {
		if (this.hasNext()) {
			let arr = this.combArr[this.combIndex++];
			if (this.combIndex >= this.combArr.length) {
				this.seqCount++;
				this.combArr = null;
				this.combIndex = 0;
			}
			let data = new Array(arr.length * pairCount);
			for (var i = 0; i < arr.length; i++) {
				data.fill(arr[i], i * pairCount, i * pairCount + pairCount)
			}
			return data;
		}
		return null;
	};
	return iter;
};

ddz_rules.seq_pair2 = function (cardsInt, sorted, converted) {
	return ddz_rules.seq_pair(cardsInt, 2, 3, sorted, converted);
};

ddz_rules.seq_pair3 = function (cardsInt, sorted, converted) {
	return ddz_rules.seq_pair(cardsInt, 3, 2, sorted, converted);
};

ddz_rules.seq = function (cardsInt, sorted, converted) {
	return ddz_rules.seq_pair(cardsInt, 1, 5, sorted, converted);
};

ddz_rules.seq_pair3_x = function (cardsInt, seqCount, tailCount, ignoreTail) {
	let i = cardsInt.indexOf(ddz_rules.FLOWER);
	if (i >= 0) {
		cardsInt.splice(i, 1)
	}
	if (cardsInt.length < (seqCount * 3 + tailCount * seqCount)) {
		return ddz_rules.emptyIter(cardsInt, "seq_pair3_" + tailCount + "_seq_" + seqCount)
	}
	let pairArr = ddz_rules.extract_pair(cardsInt, 3);
	if (pairArr.length < seqCount) {
		return ddz_rules.emptyIter(cardsInt, "seq_pair3_" + tailCount + "_seq_" + seqCount)
	}
	var iter = {};
	iter.source = cardsInt;
	let tailArr = ddz_rules.extract_pair2(cardsInt, tailCount);
	iter.tailComb = [];
	collections.combinations(tailArr, seqCount, function (target) {
		if (tailCount > 1) {
			if (collections.all(target, function (a) {
				return target[0] === a;
			})) {
				return;
			}
		}
		target = target.sort(collections.compare);

		for (var i = 0; i < iter.tailComb.length; i++) {
			let src = iter.tailComb[i];
			let flag = true;
			for (var j = 0; j < target.length; j++) {
				if (src[j] !== target[j]) {
					flag = false;
					break;
				}
			}
			if (flag) {
				return;
			}
		}
		iter.tailComb.push(target);
	});
	iter.pairComb = [];
	collections.combinations(pairArr, seqCount, function (target) {
		if (target[0] !== 2 && ddz_rules.isSeq(target)) {
			iter.pairComb.push(target);
		}
	});

	iter.sourceGroups = collections.groupBy(cardsInt);
	iter.pairIndex = 0;
	iter.tailIndex = 0;
	iter.consume = true;
	iter.hasNext = function () {
		// 上一次 hasNext 还未消费掉
		if (!this.consume) {
			return true;
		}
		if (this.pairComb.length === 0 || this.tailComb.length < seqCount * 2) {
			return false;
		}
		var head = null;
		var tail = null;
		var find = false;
		while (this.pairIndex < this.pairComb.length) {
			head = this.pairComb[this.pairIndex];
			let flag = true;
			while (this.tailIndex < this.tailComb.length) {
				if (ignoreTail) {
					tail = this.tailComb[this.tailIndex];
				} else {
					tail = this.tailComb[this.tailIndex++];
				}
				if (!collections.any(head, function (val) {
					return tail.indexOf(val) >= 0 && (iter.sourceGroups[val.toString()] < 3 + tailCount || iter.sourceGroups[val.toString()] < collections.count(tail, val) + 3);
				})) {
					if (ignoreTail) {
						this.pairIndex++;
					} else {
						if (this.tailIndex === this.tailComb.length) {
							this.pairIndex++;
							this.tailIndex = 0;
						}
					}
					this.consume = false;
					find = true;
					break
				} else {
					if (ignoreTail) {
						this.tailIndex++;
					}
					if (this.tailIndex === this.tailComb.length) {
						this.tailIndex = 0;
						this.pairIndex++;
						flag = false;
						break;
					}
				}
			}
			if (flag) {
				find = true;
				break
			}
		}
		this.head = head;
		this.tail = tail;
		if (ignoreTail) {
			this.tailIndex = 0;
		}
		return find;
	};

	iter.next = function () {
		if (this.hasNext()) {
			this.consume = true;
			var data = new Array(seqCount * 3 + seqCount * tailCount);
			for (var i = 0; i < seqCount; i++) {
				data.fill(this.head[i], i * 3, i * 3 + 3);
				data.fill(this.tail[i], seqCount * 3 + i * tailCount, seqCount * 3 + i * tailCount + tailCount)
			}
			return data;
		}
		return null;
	};

	return iter;
};

ddz_rules.seq_pair3_with_any = function (cardsInt, tailCount, ignoreTail) {
	let idx = cardsInt.indexOf(ddz_rules.FLOWER);
	if (idx >= 0) {
		cardsInt.splice(idx, 1)
	}
	let pairArr = ddz_rules.extract_pair(cardsInt, 3);
	if (pairArr.length < 2) {
		return ddz_rules.emptyIter(cardsInt, "seq_pair3_with_any_" + tailCount);
	}
	var iter = {};
	iter.source = cardsInt;
	iter.arr = [];
	for (var i = 0; i < pairArr.length - 1; i++) {
		iter.arr.push(ddz_rules.seq_pair3_x(cardsInt, i + 2, tailCount, ignoreTail));
	}
	iter.index = 0;
	iter.hasNext = function () {
		var cur = this.arr[this.index];
		if (!cur) {
			return false;
		}
		while (!cur || !cur.hasNext()) {
			if (!cur) {
				return false;
			}
			cur = this.arr[++this.index];
		}
		return true;
	};
	iter.next = function () {
		return this.arr[this.index].next();
	};
	return iter;
};

ddz_rules.seq_pair3_1 = function (cardsInt, sorted, converted, ignoreTail) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return ddz_rules.seq_pair3_with_any(cardsInt, 1, ignoreTail);
};
ddz_rules.seq_pair3_2 = function (cardsInt, sorted, converted, ignoreTail) {
	cardsInt = ddz_rules.convert(cardsInt, sorted, converted);
	return ddz_rules.seq_pair3_with_any(cardsInt, 2, ignoreTail);
};

ddz_rules.CARDS_PRIORITY = [
	[ddz_rules.TYPE_SINGLE, ddz_rules.TYPE_PAIR2, ddz_rules.TYPE_PAIR3,
		ddz_rules.TYPE_PAIR3_1, ddz_rules.TYPE_PAIR3_2, ddz_rules.TYPE_PAIR4_2_1, ddz_rules.TYPE_PAIR4_2_2,
		ddz_rules.TYPE_SEQ_PAIR2, ddz_rules.TYPE_SEQ_PAIR3, ddz_rules.TYPE_SEQ_PAIR3_1, ddz_rules.TYPE_SEQ_PAIR3_2, ddz_rules.TYPE_SEQ],
	[ddz_rules.TYPE_FLOWER],
	[ddz_rules.TYPE_PAIR4],
	[ddz_rules.TYPE_PAIR_JOKER]
];

ddz_rules.getPriority = function (type) {
	for (var i = 0; i < ddz_rules.CARDS_PRIORITY.length; i++) {
		if (ddz_rules.CARDS_PRIORITY[i].indexOf(type) >= 0) {
			return i;
		}
	}
	return -1;
};

ddz_rules.COMPARE_TYPE_FUNC_MAP = {};
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_SINGLE] = ddz_rules.is_single;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR_JOKER] = ddz_rules.is_pair_joker;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR2] = ddz_rules.is_pair2;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR3] = ddz_rules.is_pair3;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR3_1] = ddz_rules.is_pair3_1;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR3_2] = ddz_rules.is_pair3_2;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR4] = ddz_rules.is_pair4;
// ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR4_2] = ddz_rules.is_pair4_2;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR4_2_1] = ddz_rules.is_pair4_2_1;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR4_2_2] = ddz_rules.is_pair4_2_2;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ_PAIR2] = ddz_rules.is_seq_pair2;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ_PAIR3] = ddz_rules.is_seq_pair3;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ_PAIR3_1] = ddz_rules.is_seq_pair3_1;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ_PAIR3_2] = ddz_rules.is_seq_pair3_2;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ] = ddz_rules.is_seq;
ddz_rules.COMPARE_TYPE_FUNC_MAP[ddz_rules.TYPE_FLOWER] = ddz_rules.is_flower;

ddz_rules.SEQS = [ddz_rules.TYPE_SEQ, ddz_rules.TYPE_SEQ_PAIR2, ddz_rules.TYPE_SEQ_PAIR3, ddz_rules.TYPE_SEQ_PAIR3_1, ddz_rules.TYPE_SEQ_PAIR3_2];


/* 获取比传入牌型大的判断方法 */
ddz_rules.getGreaterThan = function (type) {
	let result = null;
	for (var i = 0; i < ddz_rules.CARDS_PRIORITY.length; i++) {
		if (result) {
			result = result.concat(ddz_rules.CARDS_PRIORITY[i])
		}
		if (!result && ddz_rules.CARDS_PRIORITY[i].indexOf(type) >= 0) {
			result = [];
		}
	}
	return result;
};

ddz_rules.ITER_TYPE_FUNC_MAP = {};
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_SINGLE] = ddz_rules.single;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR_JOKER] = ddz_rules.pair_joker;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR2] = ddz_rules.pair2;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR3] = ddz_rules.pair3;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR3_1] = ddz_rules.pair3_1;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR3_2] = ddz_rules.pair3_2;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR4] = ddz_rules.pair4;
// ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR4_2] = ddz_rules.pair4_2;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ_PAIR2] = ddz_rules.seq_pair2;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ_PAIR3] = ddz_rules.seq_pair3;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ_PAIR3_1] = ddz_rules.seq_pair3_1;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ_PAIR3_2] = ddz_rules.seq_pair3_2;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_SEQ] = ddz_rules.seq;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR4_2_1] = ddz_rules.pair4_2_1;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_PAIR4_2_2] = ddz_rules.pair4_2_2;
ddz_rules.ITER_TYPE_FUNC_MAP[ddz_rules.TYPE_FLOWER] = ddz_rules.flower;


ddz_rules.IGNORE_TAIL_FUNC = [ddz_rules.pair3_1, ddz_rules.pair3_2, ddz_rules.seq_pair3_1, ddz_rules.seq_pair3_2, ddz_rules.pair4_2_1, ddz_rules.pair4_2_2];
