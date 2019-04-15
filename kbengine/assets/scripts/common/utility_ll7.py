# -*- encoding:utf-8 -*-

import const_ll7

def produceSeqPair2(pokers):
	return list(map(lambda x:x-const_ll7.HHMF_VALUE[-3] if x==const_ll7.HHMF_VALUE[-1] or x==const_ll7.HHMF_VALUE[-2] else x, pokers))

def produceOneAndPair27(pokers, lord_color):
	n_pokers = []
	for _c in pokers:
		if _c>>const_ll7.POKER_OFFSET == const_ll7.HHMF_VALUE[4]:
			if const_ll7.SEVEN.index(_c) == lord_color:
				n_pokers.append((const_ll7.HHMF_VALUE[4] << const_ll7.POKER_OFFSET) + 41)
			else:
				n_pokers.append((const_ll7.HHMF_VALUE[4]<<const_ll7.POKER_OFFSET) + 40)
		elif _c>>const_ll7.POKER_OFFSET == const_ll7.HHMF_VALUE[-1]:
			if const_ll7.TWO.index(_c) == lord_color:
				n_pokers.append((const_ll7.HHMF_VALUE[-1] << const_ll7.POKER_OFFSET) + 1)
			else:
				n_pokers.append(const_ll7.HHMF_VALUE[-1]<<const_ll7.POKER_OFFSET)
		else:
			n_pokers.append(_c)
	return n_pokers

def getPokers2NumDict(pokers):
	poker2NumDict = {}
	for t in pokers:
		poker2NumDict[t] = poker2NumDict.get(t, 0) + 1
	return poker2NumDict

def getPokersColor(pokers, lord_color):
	if all(_c in const_ll7.POKER_HHMF[lord_color] or _c in const_ll7.KEY_LORD for _c in pokers):
		return const_ll7.POKER_LORD
	elif all(_c in const_ll7.HEI and _c not in const_ll7.KEY_LORD for _c in pokers):
		return const_ll7.POKER_HEI
	elif all(_c in const_ll7.HONG and _c not in const_ll7.KEY_LORD for _c in pokers):
		return const_ll7.POKER_HONG
	elif all(_c in const_ll7.MEI and _c not in const_ll7.KEY_LORD for _c in pokers):
		return const_ll7.POKER_MEI
	elif all(_c in const_ll7.FANG and _c not in const_ll7.KEY_LORD for _c in pokers):
		return const_ll7.POKER_FANG
	else:
		return const_ll7.POKER_MESS

def isSeqColor(pokers):
	return all(_c in const_ll7.HEI for _c in pokers) \
			or all(_c in const_ll7.HONG for _c in pokers) \
			or all(_c in const_ll7.MEI  for _c in pokers) \
			or all(_c in const_ll7.FANG  for _c in pokers) \
			or all(_c in const_ll7.JOKER  for _c in pokers)

def getPokersType(pokers, lord_color):
	color = getPokersColor(pokers, lord_color)
	if color == const_ll7.POKER_MESS:
		return const_ll7.CARDS_MESS
	if isOne(pokers):
		return (color<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_ONE
	elif isPair(pokers):
		return (color<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_PAIR
	elif isSeqColor(pokers) and isSeqPair(pokers)[0]:
		return (color<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_SEQ_PAIR
	return (color<<const_ll7.TYPE_OFFSET)+const_ll7.TYPE_NONE

def isOne(pokers):
	return len(pokers)==1

def isPair(pokers):
	return len(pokers)==2 and pokers[0]==pokers[1]

# tips:这里只判断 组成连对 不判断是否同一花色
def isSeqPair(pokers):
	m_pokers = sorted(pokers)
	r_pokers = [_c >> const_ll7.POKER_OFFSET for _c in m_pokers]
	if len(pokers)<4 or len(pokers)%2==1:
		return False, r_pokers
	if any(all(_c in _pokers for _c in m_pokers) for _pokers in const_ll7.POKER_HHMF) \
			or all(_c in const_ll7.JOKER for _c in pokers):

		# 如果 有2 就必须把A 和 2 换成最小
		if any(_c==const_ll7.HHMF_VALUE[-1] for _c in r_pokers):
			r_pokers = produceSeqPair2(r_pokers)
			r_pokers = sorted(r_pokers)
	return all(r_pokers[i]+(i%2)==r_pokers[i+1] for i in range(len(r_pokers)-1)), r_pokers

# tips:这里只判断 连续单张 不判断是否同一花色
def isSeqOne(pokers):
	m_pokers = sorted(pokers)
	r_pokers = [_c >> const_ll7.POKER_OFFSET for _c in m_pokers]

	if len(pokers) < 2:
		return False, r_pokers
	# 如果 有2 就必须把A 和 2 换成最小
	if any(_c == const_ll7.HHMF_VALUE[-1] for _c in r_pokers):
		r_pokers = produceSeqPair2(r_pokers)
		r_pokers = sorted(r_pokers)
	return all(r_pokers[i]+1 == r_pokers[i+1] for i in range(len(r_pokers)-1)), r_pokers

def compare(round_pokers, pokers_tuple, lord_color):
	c_idx = round_pokers[1]
	c_type = round_pokers[4]
	c_pokers = round_pokers[6][c_idx]

	d_type = pokers_tuple[0]
	d_pokers = pokers_tuple[1]
	if d_type == const_ll7.CARDS_MESS or d_type >> const_ll7.TYPE_OFFSET == const_ll7.POKER_MESS:
		return False
	if c_type & ((1<<const_ll7.TYPE_OFFSET)-1) == d_type & ((1<<const_ll7.TYPE_OFFSET)-1):
		if c_type == d_type:
			if c_type & ((1<<const_ll7.TYPE_OFFSET)-1) == const_ll7.TYPE_SEQ_PAIR: # 连对 特殊处理 有2 必须转换一下
				c_t_pokers = [_c >> const_ll7.POKER_OFFSET for _c in c_pokers]
				d_t_pokers = [_c >> const_ll7.POKER_OFFSET for _c in d_pokers]
				if const_ll7.HHMF_VALUE[-1] in c_t_pokers:
					c_t_pokers = produceSeqPair2(c_t_pokers)
				if const_ll7.HHMF_VALUE[-1] in d_t_pokers:
					d_t_pokers = produceSeqPair2(d_t_pokers)

				return max(d_t_pokers) > max(c_t_pokers)
			# 2/7要特殊处理一下
			return max(produceOneAndPair27(d_pokers, lord_color)) > max(produceOneAndPair27(c_pokers, lord_color))
		elif d_type >> const_ll7.TYPE_OFFSET == const_ll7.POKER_LORD:
			return True
	return False


# color:某一类型的牌 lord_color:主牌花色
def getColorPokers(pokers, color, lord_color):
	if color==const_ll7.POKER_MESS:
		return pokers
	if color==const_ll7.POKER_LORD:
		return [_c for _c in pokers if _c in const_ll7.KEY_LORD or _c in const_ll7.POKER_HHMF[lord_color]]
	return [_c for _c in pokers if _c not in const_ll7.KEY_LORD and _c in const_ll7.POKER_HHMF[color]]

def getTypePokers(pokers, c_type):
	pokers2NumDict = getPokers2NumDict(pokers)
	keys = sorted(list(pokers2NumDict.keys()))
	if c_type == const_ll7.TYPE_ONE:
		return [[_c] for _c in keys]
	elif c_type == const_ll7.TYPE_PAIR:
		return [[_c, _c] for _c in keys if pokers2NumDict[_c] == 2]
	elif c_type == const_ll7.TYPE_SEQ_PAIR:
		pair = [_c for _c in keys if pokers2NumDict[_c] == 2]
		sub_pair = [pair[i:j+1] for i in range(len(pair)-1) for j in range(i+1, len(pair))]
		return [sorted(_s*2) for _s in sub_pair if isSeqColor(_s) and isSeqOne(_s)[0]]
	else:
		return []


def isSub(pokers, subPokers):
	pokersDict = getPokers2NumDict(pokers)
	subPokersDict = getPokers2NumDict(subPokers)
	return all(_c in pokersDict and pokersDict[_c] >= subPokersDict[_c]  for _c in list(subPokersDict.keys()))


def validPoker(poker):
	return poker in const_ll7.HEI \
		or poker in const_ll7.HONG \
		or poker in const_ll7.MEI \
		or poker in const_ll7.FANG \
		or poker in const_ll7.JOKER

def lord_color(pokers):
	if len(pokers)>0 and pokers[0] in const_ll7.SEVEN:
		return const_ll7.SEVEN.index(pokers[0])
	else:
		return -1