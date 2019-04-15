"use strict";
/*-----------------------------------------------------------------------------------------
 interface
 -----------------------------------------------------------------------------------------*/
var DDZGameRules = DDZRoomOperationAdapter.extend({

	getWaitOpDict: function (wait_aid_list, data_list, serverSitNum) {
		serverSitNum = serverSitNum || this.serverSitNum;
		var op_dict = {};
		for (var i = 0; i < wait_aid_list.length; i++) {
			op_dict[wait_aid_list[i]] = data_list[i];
		}
		if (Object.keys(op_dict).length > 0) {
			op_dict[const_ddz.OP_PASS] = []
		}
		cc.log("getWaitOpDict==>", wait_aid_list, data_list, op_dict, serverSitNum);
		return op_dict
	},

	compareCards: function (src, dest, converted, ignoreGreater) {
		if (!converted) {
			src = ddz_rules.convert(src, false, false);
			dest = ddz_rules.convert(dest, false, false);
		}

		function compare(infoA, infoB) {
			if (ddz_rules.SEQS.indexOf(infoA[1]) >= 0) {
				if (infoB[2] > infoA[2] && infoB[3] - infoB[2] === infoA[3] - infoA[2]) {
					return infoB[2] - infoA[2];
				}
			} else {
				return ddz_rules.compare_rank(infoB[2], infoA[2]);
			}
			return -1;
		}

		let hasFlower = this.curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER;

		let srcInfo = ddz_rules.test_with_rule(src, true, true, true, hasFlower, this.curGameRoom.only3_1);
		if (!srcInfo[0]) {
			return -1;
		}
		let srcType = srcInfo[1];
		let func = ddz_rules.COMPARE_TYPE_FUNC_MAP[srcType];
		let destInfo = func(dest);
		if (destInfo[0]) {
			return compare(srcInfo, destInfo);
		}
		if (ignoreGreater) {
			return -1;
		}
		let types = ddz_rules.getGreaterThan(srcType);
		if (types !== null) {
			for (var i = 0; i < types.length; i++) {
				if (!hasFlower && types[i] === ddz_rules.TYPE_FLOWER) {
					continue;
				}
				let info = ddz_rules.COMPARE_TYPE_FUNC_MAP[types[i]](dest);
				if (info[0]) {
					return true;
				}
			}
		}
		return -1;
	},

	canDiscard: function (cards, serverSitNum) {
		if (!this.curGameRoom) {
			return false;
		}
		serverSitNum = serverSitNum || this.serverSitNum;
		if (this.curGameRoom.curPlayerSitNum !== serverSitNum) {
			return false;
		}
		let hasFlower = this.curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER;

		let lastCards = this.curGameRoom.getLastDiscard(serverSitNum);
		if (lastCards) {
			return this.compareCards(lastCards, cards) > 0;
		} else {
			// 可以出任意牌
			return ddz_rules.test_with_rule(cards, false, false, false, hasFlower, this.curGameRoom.only3_1);
		}
	},

	/**
	 *
	 * @param type
	 * @param src 需要比这个牌大
	 * @param ignoreTail 忽略类似3带1 中的1
	 * @param targetCards 从目标中选择
	 * @param ignoreGreater 是否不比较优先级高的牌
	 * @returns {*}
	 */
	getGreaterThanCards: function (type, src, ignoreTail, ignoreGreater, targetCards) {
		ignoreGreater = ignoreGreater || false;
		src = src || this.curGameRoom.getLastDiscard(this.serverSitNum);
		if (src) {
			src = ddz_rules.convert(src, false, false);
		}
		targetCards = targetCards || ddz_rules.convert(this.curGameRoom.handTilesList[this.serverSitNum], false, false);
		let iter = ddz_rules.ITER_TYPE_FUNC_MAP[type];
		let iterData = iter(targetCards, true, true, ignoreTail && ddz_rules.IGNORE_TAIL_FUNC.indexOf(iter) >= 0);
		if (!src) {
			return iterData;
		}
		let hasFlower = this.curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER;

		let srcInfo = ddz_rules.test_with_rule(src, true, true, true, hasFlower, this.curGameRoom.only3_1);
		if (!srcInfo[0]) {
			cc.warn("data error", src);
			return ddz_rules.emptyIter(targetCards, "data_error");
		}

		let srcPriority = ddz_rules.getPriority(srcInfo[1]);
		let destPriority = ddz_rules.getPriority(type);
		if (srcInfo[0]) {
			// Note:  排除不满足条件选项
			if (srcPriority > destPriority || (srcPriority === destPriority && srcInfo[1] !== type)) {
				return ddz_rules.emptyIter(targetCards, "priority_ignore_" + type + "_" + srcInfo[1]);
			}
		}

		var self = this;
		let wrapper = {};
		wrapper._sourceType = type;
		wrapper._source = iterData;
		wrapper.next = function () {
			if (!this.nextData) {
				if (this.hasNext()) {
					let data = this.nextData;
					this.nextData = null;
					return data;
				}
				return null;
			}
			let tmp = this.nextData;
			this.nextData = null;
			return tmp;
		};
		wrapper.hasNext = function () {
			if (this.nextData) {
				return true;
			}
			while (iterData.hasNext()) {
				var data = iterData.next();
				if (self.compareCards(src, data, true, ignoreGreater) > 0) {
					this.nextData = data;
					return true;
				}
			}
			return false;
		};
		return wrapper;
	},

	hasGreaterThan: function () {
		let src = this.curGameRoom.getLastDiscard(this.serverSitNum);
		if (!src) {
			return this.curGameRoom.handTilesList[this.serverSitNum].length > 0;
		}
		src = ddz_rules.convert(src, false, false);
		let hasFlower = this.curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER;
		let srcInfo = ddz_rules.test_with_rule(src, true, true, true, hasFlower, this.curGameRoom.only3_1);
		if (srcInfo[0]) {
			let types = ddz_rules.getGreaterThan(srcInfo[1]);
			if (types === null) {
				types = [srcInfo[1]];
			} else {
				types.splice(0, 0, srcInfo[1]);
			}
			for (var i = 0; i < types.length; i++) {
				if (!hasFlower && types[i] === ddz_rules.TYPE_FLOWER) {
					continue;
				}
				let iter = this.getGreaterThanCards(types[i], src, true);
				if (iter.hasNext()) {
					return true;
				}
			}
		}
		return false;
	},

	getBestTip: function (selectCards) {
		selectCards = ddz_rules.convert(selectCards, false, false);
		let lastCards = this.curGameRoom.getLastDiscard(this.serverSitNum);
		let lastType = null;
		let hasFlower = this.curGameRoom.flower_mode === const_ddz.MODE_HAS_FLOWER;
		if (lastCards) {
			let lastInfo = ddz_rules.test_with_rule(lastCards, false, false, true, hasFlower, this.curGameRoom.only3_1);
			if (lastInfo) {
				lastType = lastInfo[1];
			}
		}
		let best = null;
		for (var i = 0; i < ddz_rules.ALL_TYPES.length; i++) {
			if (!hasFlower && ddz_rules.ALL_TYPES[i] === ddz_rules.TYPE_FLOWER) {
				continue;
			}
			let iter = this.getGreaterThanCards(ddz_rules.ALL_TYPES[i], lastCards, true, false, selectCards);
			if (lastType === ddz_rules.ALL_TYPES[i]) {
				if (iter.hasNext()) {
					return iter.next();
				}
			} else {
				let tmp = iter.next();
				if (tmp != null) {
					if (best === null || tmp.length > best.length) {
						best = tmp;
					}
				}
			}
		}
		return best;
	}

});