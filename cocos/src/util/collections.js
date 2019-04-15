"use strict";
var collections = function () {

};

collections.batch_replace = function (array, val, repVal) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === val) {
			array[i] = repVal
		}
	}
};

collections.batch_delete = function (array, val) {
	for (var i = array.length - 1; i >= 0; i--) {
		if (array[i] === val) {
			array.splice(i, 1)
		}
	}
};

collections.removeArray = function (src, valArr, limit) {
	for (var i = 0; i < valArr.length; i++) {
		var val = valArr[i];
		for (var j = src.length - 1; j >= 0; j--) {
			if (src[j] === val) {
				src.splice(j, 1);
				if (limit) {
					break;
				}
			}
		}
	}
};

collections.shuffle = function (arr) {
	for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x) ;
	return arr;
};


/**
 * 将一个数组排列组合输出
 * @param arr
 * @param count 组合长度
 * @param callback
 */
collections.combinations = function (arr, count, callback) {
	if (count < 2) {
		return;
	}

	function moveNext(bs, m) {
		var start = -1;
		while (start < m) {
			start++;
			if (bs.get(start)) {
				break;
			}
		}
		if (start >= m)
			return false;

		var end = start;
		while (end < m) {
			end++;
			if (!bs.get(end)) {
				break;
			}
		}
		if (end >= m)
			return false;
		for (var i = start; i < end; i++) {
			bs.clear(i);
		}
		for (var j = 0; j < end - start - 1; j++) {
			bs.set(j);
		}
		bs.set(end);
		return true;
	}

	var m = arr.length;
	if (m < count) {
		cc.error("arrayCombinations: m < n ", arr, count);
		return;
	}
	var bs = new BitSet();
	for (var i = 0; i < count; i++) {
		bs.set(i)
	}

	do {
		var out = [];
		for (var j = 0; j < arr.length; j++) {
			if (bs.get(j)) {
				out.push(arr[j])
			}
		}
		if (callback && callback(out)) {
			return;
		}
	} while (moveNext(bs, m))
};

collections.sum = function (arr, func) {
    func = func || function(_x){return _x;};
	let s = 0;
	for (var i = 0; i < arr.length; i++) {
		s += func(arr[i]);
	}
	return s;
};
collections.compare = function (a, b) {
	return a - b;
};
collections.compareReverse = function (a, b) {
	return b - a;
};

collections.max = function (arr, compareFn) {
	let length = arr.length;
	if (length === 0) {
		return null;
	}
	if (length === 1) {
		return arr[0];
	}
	compareFn = compareFn || collections.compare;
	let max = arr[0];
	for (var i = 1; i < length; i++) {
		if (compareFn(arr[i], max) > 0) {
			max = arr[i];
		}
	}
	return max;
};

collections.min = function (arr, compareFn) {
	let length = arr.length;
	if (length === 0) {
		return null;
	}
	if (length === 1) {
		return arr[0];
	}
	compareFn = compareFn || collections.compare;
	let min = arr[0];
	for (var i = 1; i < length; i++) {
		if (compareFn(arr[i], min) < 0) {
			min = arr[i];
		}
	}
	return min;
};

collections.contains = function (arr, element) {
	if (cc.isArray(arr)) {
		return arr.indexOf(element) >= 0;
	} else {
		for (var i in arr) {
			if (arr[i] === element) {
				return true;
			}
		}
		return false;
	}
};

collections.binarySearch = function (targetList, val, func) {
	func = func || function (x, val) {
		return val - x;
	};
	var curIndex = 0;
	var fromIndex = 0;
	var toIndex = targetList.length - 1;
	while (toIndex > fromIndex) {
		curIndex = Math.floor((fromIndex + toIndex) / 2);
		if (func(targetList[curIndex], val) < 0) {
			toIndex = curIndex;
		} else if (func(targetList[curIndex], val) > 0) {
			fromIndex = curIndex + 1;
		} else if (func(targetList[curIndex], val) === 0) {
			return curIndex + 1;
		}
	}
	return toIndex;
};

collections.count = function (arr, element) {
	var sum = 0;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === element) {
			sum++;
		}
	}
	return sum;
};

//获取同样牌的张数 dict
collections.groupBy = function (arr) {
	var tileDict = {};
	for (var i = 0; i < arr.length; i++) {
		var t = arr[i];
		if (!tileDict[t]) {
			tileDict[t] = 1
		} else {
			tileDict[t] += 1
		}
	}
	return tileDict
};

collections.groups = function (arr, key_func, val_func) {
    key_func = key_func || function (_x) {return _x;};
    val_func = val_func || function (_x) {return _x;};
    var _groups = {};
    for (var i = 0; i < arr.length; i++) {
        var _k = key_func(arr[i]);
        if (!_groups[_k]) {
            _groups[_k] = []
        }
        _groups[_k].push(val_func(arr[i]));
    }
    return _groups;
}

collections.map = function (arr, func) {
	var newArr = [];
	for (var i = 0; i < arr.length; i++) {
		newArr.push(func(arr[i]));
	}
	return newArr;
};

collections.any = function (arr, func) {
	for (var i = 0; i < arr.length; i++) {
		if (func(arr[i]) === true) {
			return true;
		}
	}
	return false;
};

collections.all = function (arr, func) {
	for (var i = 0; i < arr.length; i++) {
		let result = func(arr[i]);
		if (cc.isUndefined(result) || result == null || result === false) {
			return false;
		}
	}
	return true;
};

collections.unique = function (arr) {
	var r = [];
	for (var i = 0, l = arr.length; i < l; i++) {
		for (var j = i + 1; j < l; j++) {
			if(typeof arr[i] === "number" || arr[j] === "number"){
				if(arr[i] === arr[j]){
                    j = ++i;
				}
			}else if (arr[i].toString() === arr[j].toString()) {
                j = ++i;
			}
		}
		r.push(arr[i]);
	}
	return r;
};

// 差集
collections.difference = function (src, arr) {
	let new_src = [];
	for (var i = 0; i < src.length; i++) {
		if (arr.indexOf(src[i]) < 0 && new_src.indexOf(src[i]) < 0) {
			new_src.push(src[i]);
		}
	}
    for (var i = 0; i < arr.length; i++) {
        if (src.indexOf(arr[i]) < 0 && new_src.indexOf(arr[i]) < 0) {
            new_src.push(arr[i]);
        }
    }
	return new_src;
};

collections.filter = function (src, func) {
	let new_src = [];
	for (var i = 0; i < src.length; i++) {
		if (func(src[i])) {
			new_src.push(src[i])
		}
	}
	return new_src;
};

//字典的值转换为数组
collections.dictValuesToArray = function (dict) {
	var arr = [];
	for (var values in dict) {
		arr.push(dict[values]);
	}
	return arr;
};

//一个数组是否包含另一个
collections.sub = function (arr, subArr) {
	var arr_group = collections.groupBy(arr);
	var subArr_group = collections.groupBy(subArr);
	for(var k in subArr_group){
		if(!arr_group[k] || subArr_group[k] > arr_group[k]){
			return false
		}
	}
	return true
};

// 多维数组src 降num维
collections.reduce = function (src, num) {
    num = num || 0;
	if(num<=0 || collections.any(src, function (x) {return !(x instanceof Array)})){return src;}
	var arr = [];
    for (var i = 0; i < src.length; i++) {
        arr = arr.concat(src[i])
    }
    num -= 1;
	return num>0 ? collections.reduce(arr, num) : arr;
};

// 从数组src中挑选num个数 按从头到尾截取 src = [1,2,3] num = 2 return [[1,2],[2,3]]
collections.select = function (src, num) {
	if(src.length < num || num <= 0){return [];}
	var arr = [];
    for(var i=0; i< src.length-num+1; i++) {
    	arr.push(src.slice(i, i+num));
    }
    return arr;
};

collections.classify = function (src, func) {
	var src_dict = {};
    for (var i = 0; i < src.length; i++) {
    	var _key = func(src[i]);
        if (!src_dict[_key]) {
            src_dict[_key] = [src[i]]
        } else {
            src_dict[_key].push(src[i])
		}
    }
    return src_dict
};

