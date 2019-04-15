# -*- coding: utf-8 -*-

import const
from gsjmj.const_gsjmj import *
from utility import classifyTiles, meld_only_need_num, meld_with_pair_need_num, getTile2NumDict, isMeld, isMeldWithPair


def getCanWinTiles(handTiles):
	result = []
	if (len(handTiles) % 3 != 1):
		return result

	tryTuple = (const.CHARACTER, const.BAMBOO, const.DOT, const.WINDS, const.DRAGONS)
	for tup in tryTuple:
		for t in tup:
			tmp = list(handTiles)
			tmp.append(t)
			tmp = sorted(tmp)
			if canWinWithoutKing3N2(tmp):
				result.append(t)

	return result


def isWinTile(handTiles, kingTiles):
	length = len(handTiles)
	if length % 3 != 2:
		return False

	handCopyTiles = list(handTiles)
	handCopyTiles = sorted(handCopyTiles)
	classifyList = classifyTiles(handCopyTiles, kingTiles)
	kingTilesNum = len(classifyList[0])  # 百搭的数量
	handTilesButKing = []  # 除百搭外的手牌
	for i in range(1, len(classifyList)):
		handTilesButKing.extend(classifyList[i])

	is7Pair, _, _ = checkIs7Pair(handCopyTiles, handTilesButKing, kingTilesNum + 1, kingTiles, kingTiles[0])
	if is7Pair:
		return True
	normalWin = canWinWithKing3N2(handCopyTiles, kingTiles)
	return normalWin


def winWith3N2NeedKing(handTilesButKing):
	"""
	Attention: 正常的胡牌(3N + 2), 七对胡那种需要特殊判断, 这里不处理，这里也不判断张数
	:param handTilesButKing: 除癞子牌外手牌
	:return: num #需要癞子牌数量
	"""
	_, chars, bambs, dots, winds, dragons = classifyTiles(handTilesButKing)
	meld_list = [chars, bambs, dots, winds, dragons]
	meld_need = []
	mos = mps = 0
	for tiles in meld_list:
		mo = meld_only_need_num(tiles)
		mp = meld_with_pair_need_num(tiles)
		mos += mo
		mps += mp
		meld_need.append((mo, mp))

	need_list = []
	for mo, mp in meld_need:
		need_list.append(mp + (mos - mo))
	return min(need_list)


def winWith3NNeedKing(handTilesButKing):
	"""
	Attention: 正常的胡牌(3N), 七对胡那种需要特殊判断, 这里不处理，这里也不判断张数
	:param handTilesButKing: 除癞子外牌
	:return: num #需要癞子牌数量
	"""
	_, chars, bambs, dots, winds, dragons = classifyTiles(handTilesButKing)
	meld_list = [chars, bambs, dots, winds, dragons]
	return sum([meld_only_need_num(tiles) for tiles in meld_list])


def canWinWithKing3N2(handTiles, kingTiles):
	"""
	Attention: 正常的胡牌(3N + 2, 有赖子牌), 七对胡那种需要特殊判断, 这里不处理
	:param handTiles: 手牌
	:param kingTiles: 赖子牌列表
	:return: True or False
	"""
	if len(handTiles) % 3 != 2:
		return False

	kings, chars, bambs, dots, winds, dragons = classifyTiles(handTiles, kingTiles)
	kingTilesNum = len(kings)
	others = [chars, bambs, dots, winds, dragons]
	meld_need = []
	mos = mps = 0
	for tiles in others:
		mo = meld_only_need_num(tiles)
		mp = meld_with_pair_need_num(tiles)
		mos += mo
		mps += mp
		meld_need.append((mo, mp))

	for mo, mp in meld_need:
		if mp + (mos - mo) <= kingTilesNum:
			return True
	return False


def canWinWithoutKing3N2(handTiles):
	"""
	Attention: 正常的的胡牌(3N + 2, 没有赖子), 七对胡那种需要特殊判断, 这里不处理
	:param handTiles: 手牌
	:return: True or False
	"""
	if (len(handTiles) % 3 != 2):
		return False

	_, chars, bambs, dots, winds, dragons = classifyTiles(handTiles)
	hasPair = False

	for w in const.WINDS:
		n = winds.count(w)
		if n == 1:
			return False
		elif n == 2:
			if hasPair:
				return False
			hasPair = True
		else:
			continue

	for d in const.DRAGONS:
		n = dragons.count(d)
		if n == 1:
			return False
		elif n == 2:
			if hasPair:
				return False
			hasPair = True
		else:
			continue

	tiles = chars + bambs + dots
	if hasPair:
		return isMeld(tiles)
	else:
		return isMeldWithPair(tiles)


"""拐三角 算法"""


def checkIs7Pair(handTilesButKing, kingTilesNum):
	"""
	:return: 7对 ，清一色，杠数量
	"""
	if len(handTilesButKing) + kingTilesNum != 14:
		return False, False, 0
	handTilesButKing = sorted(handTilesButKing)
	needNum = 0
	tileDict = getTile2NumDict(handTilesButKing)
	meld_list = []
	for tile in tileDict:
		meld_list.append([tile] * tileDict[tile])
	for meld in meld_list:
		if len(meld) % 2 != 0:
			meld.append(-1)
			needNum += 1
	if needNum > kingTilesNum:
		return False, False, 0

	return True, handTilesButKing[-1] - handTilesButKing[0] <= 8, sum([1 for tile in tileDict if tileDict[tile] == 4])


# 十三不靠
def get13Mismatch(handTiles, kingTiles=None):
	if len(handTiles) != 14:
		return False
	kings, chars, bambs, dots, winds, dragons = classifyTiles(handTiles, kingTiles)
	winds_dragons = winds + dragons
	if len(chars) > 3 or len(bambs) > 3 or len(dots) > 3 or len(winds_dragons) > 7:
		return False
	kingTileNum = len(kings)
	if kingTileNum > 2:
		return False
	need_tiles_num = 5 - len(winds_dragons)
	if need_tiles_num > kingTileNum:
		return False

	char_dict = getTile2NumDict(chars)
	bambo_dict = getTile2NumDict(bambs)
	dot_dict = getTile2NumDict(dots)
	wind_dragon_dict = getTile2NumDict(winds_dragons)
	# 必须全部是单张
	if (len(char_dict) > 0 and max(char_dict.values()) > 1) \
			or (len(bambo_dict) > 0 and max(bambo_dict.values()) > 1) \
			or (len(dot_dict) > 0 and max(dot_dict.values()) > 1) \
			or (len(wind_dragon_dict) > 0 and max(wind_dragon_dict.values()) > 1):
		return False

	def check_is_match(tryList):
		size = len(tryList)
		if size <= 1:
			return True
		if size == 2:
			return tryList[1] - tryList[0] >= 3
		if size == 3:
			return tryList[1] - tryList[0] >= 3 and tryList[2] - tryList[1] >= 3
		return False

	if not check_is_match(chars) or not check_is_match(bambs) or not check_is_match(dots):
		return False

	flags = [False] * 3

	def tryFill(tryList):
		size = len(tryList)
		need = 3 - size
		if size > 0:
			tmp = int(tryList[0] / 10)
			if tmp == 0:
				index = 0
			elif tmp == 3:
				index = 1
			elif tmp == 5:
				index = 2
			else:
				return -1
			if not flags[index]:
				flags[index] = True
				return need
		return -1

	tile_group = [chars, bambs, dots]
	for group in tile_group:
		if len(group) == 0:
			need = 3
		else:
			need = tryFill(group)
		if need >= 0:
			need_tiles_num += need
		else:
			return False

	return need_tiles_num == kingTileNum


# 十三幺
def getThirteenOrphans(handTilesButKing, kingTilesNum):
	if len(handTilesButKing) + kingTilesNum != 14:
		return False

	need_tiles = [1, 9, 31, 39, 51, 59]
	need_tiles.extend(const.WINDS_DRAGONS)

	def without_kings():
		for t in need_tiles:
			if t not in handTilesButKing:
				return False

		for t in need_tiles:
			if handTilesButKing.count(t) == 2:
				return True
		return False

	if kingTilesNum == 0:
		return without_kings()
	else:
		# 计算步骤
		# 移除手牌上已经需要的牌
		# 移除癞子牌
		win_need_tile = []
		handTilesButKing = list(handTilesButKing)
		for tile in need_tiles:
			if tile not in handTilesButKing:
				win_need_tile.append(tile)
			else:
				handTilesButKing.remove(tile)

		# 计算缺少的字牌
		# 如果字牌大于1张或者存在多张牌则不能胡

		count = len(handTilesButKing)
		if count > 1:
			return False
		elif count == 1 and handTilesButKing[0] not in need_tiles:
			return False
		need_sum = len(win_need_tile)
		if count == 0:
			need_sum += 1
		return need_sum == kingTilesNum


# 一条龙
def checkIsOneDragon(handTiles, kingTilesNum, kingTiles):
	""" 在已经是胡牌牌型的情况下，判断是否是一条龙 """
	"""
	:param handTiles: 所有手牌
	:param kingTilesNum: 癞子个数
	:param kingTiles: 癞子列表
	:return: 是否是一条龙牌型
	"""
	if len(handTiles) < 9:
		return False

	def checkCharacterBambooDot(handTiles, checkList, kingTilesNum, kingTiles):
		dragonNum = 0
		for t in checkList:
			if t in handTiles:
				dragonNum += 1
		surplusKingNum = kingTilesNum + dragonNum - 9
		if surplusKingNum >= 0:
			handCopyTiles = list(handTiles)
			for t in checkList:
				if t in handTiles:
					handCopyTiles.remove(t)
			for i in range(kingTilesNum - surplusKingNum):
				if len(kingTiles) > 0:
					if kingTiles[0] in handCopyTiles:
						handCopyTiles.remove(kingTiles[0])
			if surplusKingNum == 0:
				if meld_with_pair_need_num(handCopyTiles) <= 0:
					return True
			elif canWinWithKing3N2(handCopyTiles, kingTiles):
				return True
		return False

	if checkCharacterBambooDot(handTiles, const.CHARACTER, kingTilesNum, kingTiles):
		return True
	if checkCharacterBambooDot(handTiles, const.BAMBOO, kingTilesNum, kingTiles):
		return True
	if checkCharacterBambooDot(handTiles, const.DOT, kingTilesNum, kingTiles):
		return True
	return False


# 移除边 3张 不判断胡
def getRemoveEdgeDict(handTilesButKing, finalTile, kingTilesList=[]):
	tiles = handTilesButKing[:]

	removeEdgeDict = {}  # example: [-1, 2, 3]: 1

	if finalTile in kingTilesList:

		for t in const.LEFT_EDGE:
			edgeList = []
			if t - 1 in tiles:
				edgeList.append(t - 1)
			else:
				edgeList.append(-1)

			if t - 2 in tiles:
				edgeList.append(t - 2)
			else:
				edgeList.append(-1)
			edgeList.append(-1)
			key = tuple(edgeList)
			removeEdgeDict[key] = sum([1 for i in key if i == -1])

		for t in const.RIGHT_EDGE:
			edgeList = [-1]
			if t + 1 in tiles:
				edgeList.append(t + 1)
			else:
				edgeList.append(-1)

			if t + 2 in tiles:
				edgeList.append(t + 2)
			else:
				edgeList.append(-1)
			key = tuple(edgeList)
			removeEdgeDict[key] = sum([1 for i in key if i == -1])
	elif finalTile in const.LEFT_EDGE:
		edgeList = []
		if finalTile - 1 in tiles:
			edgeList.append(finalTile - 1)
		else:
			edgeList.append(-1)

		if finalTile - 2 in tiles:
			edgeList.append(finalTile - 2)
		else:
			edgeList.append(-1)
		edgeList.append(finalTile)
		key = tuple(edgeList)
		removeEdgeDict[key] = sum([1 for i in key if i == -1])
	elif finalTile in const.RIGHT_EDGE:
		edgeList = [finalTile]
		if finalTile + 1 in tiles:
			edgeList.append(finalTile + 1)
		else:
			edgeList.append(-1)

		if finalTile + 2 in tiles:
			edgeList.append(finalTile + 2)
		else:
			edgeList.append(-1)
		key = tuple(edgeList)
		removeEdgeDict[key] = sum([1 for i in key if i == -1])
	return removeEdgeDict


# 移除夹 3张 不判断胡
def getRemoveMidDict(handTilesButKing, finalTile, kingTilesList=[]):
	tiles = handTilesButKing[:]
	removeMidDict = {}

	if finalTile in kingTilesList:
		for midTuple in const.MID:
			for midTile in midTuple:
				midList = []
				if midTile - 1 in tiles:
					midList.append(midTile - 1)
				else:
					midList.append(-1)
				midList.append(-1)
				if midTile + 1 in tiles:
					midList.append(midTile + 1)
				else:
					midList.append(-1)

				key = tuple(midList)
				removeMidDict[key] = sum([1 for i in key if i == -1])
	elif finalTile in const.CHAR_MID or finalTile in const.DOT_MID or finalTile in const.BAMB_MID:
		midList = []
		if finalTile - 1 in tiles:
			midList.append(finalTile - 1)
		else:
			midList.append(-1)
		midList.append(finalTile)
		if finalTile + 1 in tiles:
			midList.append(finalTile + 1)
		else:
			midList.append(-1)

		key = tuple(midList)
		removeMidDict[key] = sum([1 for i in key if i == -1])
	return removeMidDict


# 移除单吊 2张 不判断胡
def getRemoveSingleCraneDict(handTilesButKing, finalTile, kingTilesList=[]):
	tiles = handTilesButKing[:]
	tile2NumDict = getTile2NumDict(tiles)
	removeSingleCraneDict = {}
	if finalTile in const.SEASON or finalTile in const.FLOWER:
		return removeSingleCraneDict

	if finalTile in kingTilesList:
		for t in tile2NumDict:
			key = (-1, t)
			removeSingleCraneDict[key] = sum([1 for i in key if i == -1])
		key = (-1, -1)
		removeSingleCraneDict[key] = sum([1 for i in key if i == -1])
	elif finalTile in tile2NumDict:
		if tile2NumDict[finalTile] == 1:
			key = (finalTile, -1)
			removeSingleCraneDict[key] = sum([1 for i in key if i == -1])
		elif tile2NumDict[finalTile] >= 2:
			key = (finalTile, finalTile)
			removeSingleCraneDict[key] = sum([1 for i in key if i == -1])
	return removeSingleCraneDict


def checkIsEdgeMidSingle(handTiles, finalTile, kingTiles=[]):
	classifyList = classifyTiles(handTiles, kingTiles)
	kingTilesNum = len(classifyList[0])
	handTilesButKing = list(filter(lambda x: x not in kingTiles, handTiles))

	def removeCheckPairWin(handTilesButKing, removeList, useKingNum, kingTilesNum):
		if useKingNum <= kingTilesNum:
			tryHandTilesButKing = handTilesButKing[:]
			for i in removeList:
				t = list(i)
				for tile in t:
					if tile != -1:
						tryHandTilesButKing.remove(tile)
			if meld_with_pair_need_num(tryHandTilesButKing) <= kingTilesNum - useKingNum:
				return True
		return False

	def removeCheckOnlyWin(handTilesButKing, removeList, useKingNum, kingTilesNum):
		if useKingNum <= kingTilesNum:
			tryHandTilesButKing = handTilesButKing[:]
			for i in removeList:
				t = list(i)
				for tile in t:
					if tile != -1:
						tryHandTilesButKing.remove(tile)
			if meld_only_need_num(tryHandTilesButKing) <= kingTilesNum - useKingNum:
				return True
		return False

	def can_win_only(handTilesButKing):
		finalTile in handTilesButKing and handTilesButKing.remove(finalTile)
		tiles = const.CHARACTER + const.BAMBOO + const.DOT
		count = 0
		for t in tiles:
			copy_tiles = handTilesButKing[:]
			copy_tiles.append(t)
			if kingTilesNum == 0:
				if canWinWithoutKing3N2(copy_tiles):
					count += 1
			else:
				if canWinWithKing3N2(copy_tiles, kingTiles):
					count += 1

		return count == 1

	removeEdgeDict = getRemoveEdgeDict(handTilesButKing, finalTile, kingTiles)

	isEdge = False
	isMid = False
	isSingle = False
	for key in removeEdgeDict:
		useKingNum = removeEdgeDict[key]
		if removeCheckPairWin(handTilesButKing, [key], useKingNum, kingTilesNum):
			isEdge = can_win_only(handTilesButKing[:])
			break
	if not isEdge:
		removeMidDict = getRemoveMidDict(handTilesButKing, finalTile, kingTiles)
		for key in removeMidDict:
			useKingNum = removeMidDict[key]
			if removeCheckPairWin(handTilesButKing, [key], useKingNum, kingTilesNum):
				isMid = can_win_only(handTilesButKing[:])
				break
	if not isEdge and not isMid:
		removeSingleCraneDict = getRemoveSingleCraneDict(handTilesButKing, finalTile, kingTiles)
		for key in removeSingleCraneDict:
			useKingNum = removeSingleCraneDict[key]
			if removeCheckOnlyWin(handTilesButKing, [key], useKingNum, kingTilesNum):
				isSingle = can_win_only(handTilesButKing[:])
				break
	if isEdge:
		return 1, 0, 0
	elif isMid:
		return 0, 1, 0
	elif isSingle:
		return 0, 0, 1
	return 0, 0, 0


# 是否是堆胡，不判断胡
def is_heap_color(handTilesButKing, upTiles, kingNum=0):
	character_count = kingNum
	bamboo_count = kingNum
	dot_count = kingNum
	for t in handTilesButKing:
		if t < 10:
			character_count += 1
		elif 30 < t < 40:
			bamboo_count += 1
		elif 50 < t < 60:
			dot_count += 1

	for tiles in upTiles:
		t = max(tiles)
		if t < 10:
			character_count += len(tiles)
		elif 30 < t < 40:
			bamboo_count += len(tiles)
		elif 50 < t < 60:
			dot_count += len(tiles)

	return character_count >= 8 or bamboo_count >= 8 or dot_count >= 8


# 是否是清一色
def is_uniform_color(handTilesButKing, upTiles=[]):
	"""
	:param handTilesButKing: 没有财神的手牌
	:param upTiles: 碰杠吃的牌
	"""
	handTilesButKing = handTilesButKing[:]
	for ts in upTiles:
		handTilesButKing += ts
	handTilesButKing = sorted(handTilesButKing)
	return handTilesButKing[-1] - handTilesButKing[0] < 9


def get_continuous_dealer(arr):
	""" 获取玩家连庄次数 """
	count = 0
	for i in reversed(arr):
		if i == ROUND_RESULT_DEALER:
			count += 1
		elif i == ROUND_RESULT_END:
			return count
		else:
			return count
	return count


def getRoomParams(create_dict):
	return {
		'game_mode': create_dict['game_mode'],
		'base_score': create_dict['base_score'],
		'game_max_lose': create_dict['game_max_lose'],
		'game_round': create_dict['game_round'],
		'hand_prepare': create_dict['hand_prepare'],
		'pay_mode': create_dict['pay_mode'],
		'room_type': create_dict['room_type'],
		'king_num': create_dict['king_num'],
		'win_mode': create_dict['win_mode'],
		'suit_mode': create_dict['suit_mode'],
		'job_mode': create_dict['job_mode'],
	}
