"use strict";
/*-----------------------------------------------------------------------------------------
 interface
 -----------------------------------------------------------------------------------------*/
var LL7GameRules = LL7RoomOperationAdapter.extend({
	canDiscard: function (pokers) { // 这副牌能不能出
        let fd_pokers = this.curGameRoom.firstDiscardPokers;
        let lord_color = cutil_ll7.get_suit(this.curGameRoom.mainPokers[0]);
        let p_suitPattern = cutil_ll7.suit_pattern(pokers, lord_color);
        let hand_pokers = this.curGameRoom.handTilesList[this.serverSitNum];


        if (!fd_pokers || fd_pokers.length === 0) {
            return p_suitPattern !== const_ll7.POKER_MESS && (p_suitPattern&((1<<const_ll7.TYPE_OFFSET)-1)) > 0;
        }
        if(pokers.length === 0 || pokers.length !== fd_pokers.length || !collections.sub(hand_pokers, pokers)){return false;}

        let fd_suitPattern = cutil_ll7.suit_pattern(fd_pokers, lord_color);
		let fd_color = fd_suitPattern >> const_ll7.TYPE_OFFSET;

        let hand_fit_pokers = cutil_ll7.get_color_pokers(hand_pokers, fd_color, lord_color).sort(collections.compare);
        let discard_fit_pokers = cutil_ll7.get_color_pokers(pokers, fd_color, lord_color).sort(collections.compare);
        // cc.error("fd_pokers", fd_pokers,
			// "lord_color", lord_color,
			// "p_suitPattern", p_suitPattern,
			// "hand_pokers", hand_pokers,
			// "fd_suitPattern", fd_suitPattern,
			// "fd_color", fd_color,
			// "hand_fit_pokers", hand_fit_pokers,
			// "discard_fit_pokers", discard_fit_pokers);
        if(p_suitPattern === const_ll7.POKER_MESS){
			return discard_fit_pokers.toString() === hand_fit_pokers.toString()
		} else if(p_suitPattern === fd_suitPattern){ // 出牌牌型 和 第一手牌一致
        	return true
		} else if((fd_suitPattern&3) === const_ll7.TYPE_ONE){	// 起手单张
			let is_sub = collections.sub(hand_fit_pokers, discard_fit_pokers);
			return is_sub && (hand_fit_pokers.indexOf(pokers[0])>=0 || hand_fit_pokers.length===0)
		} else if((fd_suitPattern&3) === const_ll7.TYPE_PAIR){	// 起手对子
            let is_sub = collections.sub(hand_fit_pokers, discard_fit_pokers);
            let hand_fit_pairs = cutil_ll7.get_type_pokers(hand_fit_pokers, const_ll7.TYPE_PAIR);
            return is_sub && hand_fit_pairs.length<=0 && (pokers.length === discard_fit_pokers.length || hand_fit_pokers.length === discard_fit_pokers.length)
        } else if((fd_suitPattern&3) === const_ll7.TYPE_SEQ_PAIR){ // 起手拖拉机
            let is_sub = collections.sub(hand_fit_pokers, discard_fit_pokers);
            let hand_fit_pairs = cutil_ll7.get_type_pokers(hand_fit_pokers, const_ll7.TYPE_PAIR);
            let discard_fit_pairs = cutil_ll7.get_type_pokers(pokers, const_ll7.TYPE_PAIR);
            // cc.error("is_sub", is_sub, "hand_fit_pairs", hand_fit_pairs, "discard_fit_pairs", discard_fit_pairs);
            let seq_pairs = [];
            // 主牌拖拉机 如果不是拖拉机出牌 必须 是 黑红梅方中的一种 加大小王
			if(fd_color === const_ll7.POKER_LORD){
				let c_pokers = cutil_ll7.get_color_pokers(hand_pokers, fd_color, lord_color);
				seq_pairs = cutil_ll7.get_type_pokers(c_pokers, const_ll7.TYPE_SEQ_PAIR);
				seq_pairs = collections.filter(seq_pairs, function (_pokers) {return _pokers.length >= fd_pokers.length});
                // cc.error("c_pokers", c_pokers, "seq_pairs", seq_pairs);
			} else {
                seq_pairs = cutil_ll7.get_type_pokers(hand_fit_pokers, const_ll7.TYPE_SEQ_PAIR);
                seq_pairs = collections.filter(seq_pairs, function (_pokers) {return _pokers.length >= fd_pokers.length});
                // cc.error("seq_pairs", seq_pairs);
			}
			// 有对子必须出对子
			let single = pokers.length/2 - discard_fit_pairs.length;
			let left_pair_num = hand_fit_pairs.length - discard_fit_pairs.length;
            // cc.error("single", single, "left_pair_num", left_pair_num);
            return is_sub && seq_pairs.length===0 && ((single>0 && left_pair_num<=0) || single<=0) && (pokers.length===discard_fit_pokers.length || hand_fit_pokers.length===discard_fit_pokers.length)
        }
		return false;
	},

	/**
	 * 判断手牌中又多少牌可以打
	 */
	canDiscardPoker: function (pokers) {
		if (!this.curGameRoom) {
			return pokers;
		}
        let fd_pokers = this.curGameRoom.firstDiscardPokers;
        if (!fd_pokers || fd_pokers.length === 0) {
			return pokers;
        }

        let lord_color = cutil_ll7.get_suit(this.curGameRoom.mainPokers[0]);
        let fd_suitPattern = cutil_ll7.suit_pattern(fd_pokers, lord_color);
        let fd_color = fd_suitPattern >> const_ll7.TYPE_OFFSET;

        let hand_fit_pokers = cutil_ll7.get_color_pokers(pokers, fd_color, lord_color).sort(collections.compare);

        if((fd_suitPattern&3) === const_ll7.TYPE_ONE){
        	return hand_fit_pokers.length > 0 ? hand_fit_pokers : pokers
        } else if((fd_suitPattern&3) === const_ll7.TYPE_PAIR){
            if(hand_fit_pokers.length < fd_pokers.length){ // 所有该花色都不够 返回所有牌
				return pokers;
            }
            let hand_fit_pairs = cutil_ll7.get_type_pokers(hand_fit_pokers, const_ll7.TYPE_PAIR);
            return hand_fit_pairs.length>0 ? collections.reduce(hand_fit_pairs, 1).sort(collections.compare) : hand_fit_pokers
        } else if((fd_suitPattern&3) === const_ll7.TYPE_SEQ_PAIR){
            if(hand_fit_pokers.length < fd_pokers.length){ // 所有该花色都不够 返回所有牌
                return pokers;
            }
            let hand_fit_seqpair = cutil_ll7.get_type_pokers(hand_fit_pokers, const_ll7.TYPE_SEQ_PAIR);
            hand_fit_seqpair = collections.filter(hand_fit_seqpair, function (_pokers) {return _pokers.length >= fd_pokers.length});
            let hand_fit_pairs = cutil_ll7.get_type_pokers(hand_fit_pokers, const_ll7.TYPE_PAIR);
           	let merge_seqpair_one = collections.map(Object.keys(collections.groupBy(collections.reduce(hand_fit_seqpair, 1))), function (x) {return parseInt(x)});
           	let merge_pair_one = collections.map(Object.keys(collections.groupBy(collections.reduce(hand_fit_pairs, 1))), function (x) {return parseInt(x)});
            if(merge_seqpair_one.length>0){
				return merge_seqpair_one.concat(merge_seqpair_one)
			} else if (merge_pair_one.length>0){
                return merge_pair_one.length*2 >= fd_pokers.length ? merge_pair_one.concat(merge_pair_one) : hand_fit_pokers;
			}
			return hand_fit_pokers
        }
		return pokers;
	},

	tips:function (pokers) {
		pokers = pokers || this.curGameRoom.handTilesList[this.serverSitNum];
		if(pokers.length<=0 || !this.curGameRoom){return []}
        let lord_color = cutil_ll7.get_suit(this.curGameRoom.mainPokers[0]);
        let fd_pokers = this.curGameRoom.firstDiscardPokers;
        // 对pokers做一个分类 方/梅/红/黑/主牌 [[], [], [], []]
		let color_pokers = collections.map(const_ll7.COLOR_TYPE, function (_color) {
            return _color === lord_color ? [] : cutil_ll7.get_color_pokers(pokers, _color, lord_color).sort(collections.compare);
        });

		// 继续分类 对每一种花色 做 单张/对子/连对 的分类 (单张可能包含在对子中， 对子可能包含在连对中) [[[],[],[]], [[],[],[]], [[],[],[]], [[],[],[]]]
		let color_type_pokers = collections.map(color_pokers, function (_pokers) {
            return collections.map(const_ll7.POKER_TYPE, function (type) {
                return cutil_ll7.get_type_pokers(_pokers, type);
            });
        });
        // cc.error("pokers", pokers, "lord_color", lord_color, "color_pokers", color_pokers, "color_type_pokers", color_type_pokers);
        if (!fd_pokers || fd_pokers.length === 0) {
        	// 第一手牌 按所有手牌 连对/对子/单张 顺序 [[[1], [2], [3]],[[4,4], [5,5]],[[6,6,7,7], [7,7,8,8]]]
			let _pokers = collections.map(const_ll7.POKER_TYPE, function (type) {
                return collections.map(const_ll7.COLOR_TYPE, function (color) {
                    return color_type_pokers[color][type-1]; // type从1开始 取值要从0开始
                });
            });
			// cc.error("第一手牌tips", collections.reduce(_pokers, 2).reverse());
            return collections.reduce(_pokers, 2).reverse();
        }

        let fd_suitPattern = cutil_ll7.suit_pattern(fd_pokers, lord_color);
        let fd_color = fd_suitPattern >> const_ll7.TYPE_OFFSET;

        let filter_pokers = cutil_ll7.get_color_pokers(pokers, fd_color, lord_color).sort(collections.compare);
        let can_discard_pokers = this.canDiscardPoker(pokers);

        if((fd_suitPattern&3) === const_ll7.TYPE_ONE){
        	let values = collections.map(Object.keys(collections.groupBy(can_discard_pokers)), function (x) {return parseInt(x)});
			return collections.map(cutil_ll7.sort(values, this.curGameRoom.mainPokers[0]), function (x) {return [x];}).reverse();
		} else if((fd_suitPattern&3) === const_ll7.TYPE_PAIR){
            // 同花色的 对子
            let filter_poker_pairs = cutil_ll7.get_type_pokers(filter_pokers, const_ll7.TYPE_PAIR);
            if(filter_poker_pairs.length>0){
                return filter_poker_pairs.sort(function (a, b) { // 7 特殊处理一下
                	var a_value = (a[0]>>const_ll7.POKER_OFFSET)===const_ll7.HHMF_VALUE[4] ? a[0] + 40 : a[0];
                	var b_value = (b[0]>>const_ll7.POKER_OFFSET)===const_ll7.HHMF_VALUE[4] ? b[0] + 40 : b[0];
					return a_value-b_value;
                })
            }
            // 没有同花色 或者 同花色 足够
            if(filter_pokers.length < 0 || filter_pokers.length >= fd_pokers.length){ // 全是同花色 或 全不是同花色
				return collections.select(can_discard_pokers, 2);
            }
            // 有同花色 (张数不足)
            let diff_color_pokers = collections.filter(can_discard_pokers, function (_poker) {return filter_pokers.indexOf(_poker) < 0;});
			return collections.map(collections.select(diff_color_pokers, fd_pokers.length-filter_pokers.length), function (_pokers) {
				return _pokers.concat(filter_pokers).sort(collections.compare)
            })
		} else if((fd_suitPattern&3) === const_ll7.TYPE_SEQ_PAIR){
        	// 有可出的连对
            let filter_pokers_seqpair = cutil_ll7.get_type_pokers(filter_pokers, const_ll7.TYPE_SEQ_PAIR);
            filter_pokers_seqpair = collections.filter(filter_pokers_seqpair, function (_pokers) {return _pokers.length === fd_pokers.length});
            if(filter_pokers_seqpair.length > 0){
            	return filter_pokers_seqpair
			}
			//有可出的对子
            let filter_pokers_pairs = cutil_ll7.get_type_pokers(filter_pokers, const_ll7.TYPE_PAIR);
            let merge_pair_one = collections.map(Object.keys(collections.groupBy(collections.reduce(filter_pokers_pairs, 1))), function (x) {return parseInt(x)});
            if(merge_pair_one.length >0){
            	// 对子足够
            	if(merge_pair_one.length*2 >= fd_pokers.length){
					return collections.map(collections.select(merge_pair_one, fd_pokers.length/2), function (_pokers) {
						return _pokers.concat(_pokers).sort(collections.compare)
                    })
				}
				// 对子不足
				// 但是同花色的张数足够
                if(filter_pokers.length >= fd_pokers.length){
                    let filter_but_pairs = collections.filter(filter_pokers, function (_poker) {return merge_pair_one.indexOf(_poker) < 0;});
					return collections.map(collections.select(filter_but_pairs, fd_pokers.length- merge_pair_one.length*2), function (_pokers) {
                        return merge_pair_one.concat(merge_pair_one).concat(_pokers).sort(collections.compare);
                    })
                }
                // 对子不足
                // 同花色的张数也不足
                let diff_color_pokers =  collections.filter(can_discard_pokers, function (_poker) {return filter_pokers.indexOf(_poker) < 0;}); // 可以出牌中不含 同花色的
                return collections.map(collections.select(diff_color_pokers, fd_pokers.length-filter_pokers.length), function (_pokers) {
                    return filter_pokers.concat(_pokers).sort(collections.compare);
                })
			}
			// 没有对子
            // 花色 足够
            if(filter_pokers.length >= fd_pokers.length){
				return collections.select(filter_pokers, fd_pokers.length)
            }
            // 花色不足
            let diff_color_pokers =  collections.filter(can_discard_pokers, function (_poker) {return filter_pokers.indexOf(_poker) < 0;}); // 可以出牌中不含 同花色的
            return collections.map(collections.select(diff_color_pokers, fd_pokers.length-filter_pokers.length), function (_pokers) {
                return filter_pokers.concat(_pokers).sort(collections.compare);
            })
        }
		return []
    },

	// 比较两副牌 discard_pokers > begin_pokers 返回true, begin_pokers 必须是 单张/对子/连对
	compare: function (begin_pokers, discard_pokers, lord_color) {
		var begin_suitPattern = cutil_ll7.suit_pattern(begin_pokers, lord_color);
		var discard_suitPattern = cutil_ll7.suit_pattern(discard_pokers, lord_color);

        if(discard_suitPattern === const_ll7.CARDS_MESS || (discard_suitPattern&3) === const_ll7.POKER_MESS){return false;}

        if((begin_suitPattern&3) === (discard_suitPattern&3)){ // 出的牌 类型一致 (花色可能不一致)
            if(begin_suitPattern === discard_suitPattern){
                //连对需要特殊判断
                if((begin_suitPattern&3)===const_ll7.TYPE_SEQ_PAIR){
                    // 特殊处理2(如果有的话)
                   var begin_num_pokers = cutil_ll7.produceSeq2(collections.map(begin_pokers, function (_poker) {
                       return _poker>>const_ll7.POKER_OFFSET;
                   }));
                    var discard_num_pokers = cutil_ll7.produceSeq2(collections.map(discard_pokers, function (_poker) {
                        return _poker>>const_ll7.POKER_OFFSET;
                    }));
                    return collections.max(discard_num_pokers) > collections.max(begin_num_pokers)
                }
                // 单张 或者 对子 特殊处理 2和7 主牌最大，其他花色 一样大
                return collections.max(cutil_ll7.produceOneAndPair27(discard_pokers, lord_color)) > collections.max(cutil_ll7.produceOneAndPair27(begin_pokers, lord_color))
            } else if((discard_suitPattern>>2) === const_ll7.POKER_LORD){ // 花色不一致并且 出牌是主牌
                return true; // 主牌必然大于副牌
            }
        }
        return false
    },

	isMain: function (poker, curGameRoom) {
		curGameRoom = curGameRoom || this.curGameRoom;
		if (!curGameRoom) {
			return false;
		}
		if (const_ll7.JOKERS.indexOf(poker) !== -1) {
			return true;
		}
		var num = cutil_ll7.get_rank(poker);
		if (num === 15 || num === 7) {
			return true;
		}
		if (curGameRoom.mainPokers.length === 0) {
			return false;
		}
		num = curGameRoom.mainPokers[0];
		var suit = cutil_ll7.get_suit(num);
		var pokerSuit = cutil_ll7.get_suit(poker);

		return suit === pokerSuit;
	},

	isDianpai: function (serverSitNum, pokers, discardHistory, controlIdx, curGameRoom) {
		curGameRoom = curGameRoom || this.curGameRoom;
		discardHistory = discardHistory || curGameRoom.discardHistory;
		controlIdx = controlIdx == undefined ? curGameRoom.controlIdx : controlIdx;
		if (discardHistory.length === 0) {
			return false;
		}
		let mainSuit = cutil_ll7.get_suit(curGameRoom.mainPokers[0]);
		// 比之前的牌小  花色不同
		return !this.compare(discardHistory[controlIdx], pokers, mainSuit);
	},

	isDiaozhu: function (serverSitNum, pokers, discardHistory, controlIdx, curGameRoom) {
		curGameRoom = curGameRoom || this.curGameRoom;
		discardHistory = discardHistory || curGameRoom.discardHistory;
		// 第一首牌 是主牌
		if (discardHistory.length === 0) {
			return this.isMain(pokers[0], curGameRoom);
		}
		return false;
	},

	isDazhu: function (serverSitNum, pokers, discardHistory, controlIdx, curGameRoom) {
		curGameRoom = curGameRoom || this.curGameRoom;
		discardHistory = discardHistory || curGameRoom.discardHistory;
		controlIdx = controlIdx == undefined ? curGameRoom.controlIdx : controlIdx;
		// 出的牌 是当前最大
		let history = discardHistory[controlIdx];
		if (!history) {
			return false;
		}
		let mainSuit = cutil_ll7.get_suit(curGameRoom.mainPokers[0]);
		return this.compare(history, pokers, mainSuit);
	},

	isSha: function (serverSitNum, pokers, discardHistory, controlIdx, curGameRoom) {
		curGameRoom = curGameRoom || this.curGameRoom;
		discardHistory = discardHistory || curGameRoom.discardHistory;
		controlIdx = controlIdx == undefined ? curGameRoom.controlIdx : controlIdx;
		// 第一首 副牌 ， 现在是主牌   比他大
		let first = discardHistory[curGameRoom.startServerSitNum];
		if (first) {
			if (this.isMain(first[0], curGameRoom)) {
				return false;
			}
			for (var i = 0; i < pokers.length; i++) {
				if (!this.isMain(pokers[0], curGameRoom)) {
					return false;
				}
			}
			let target = discardHistory[controlIdx];
			let mainSuit = cutil_ll7.get_suit(curGameRoom.mainPokers[0]);
			return this.compare(target, pokers, mainSuit);
		}
		return false;
	}

});
