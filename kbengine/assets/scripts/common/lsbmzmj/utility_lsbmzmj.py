# -*- coding: utf-8 -*-
import const
from lsbmzmj.const_lsbmzmj import *
import utility
from KBEDebug import *

def checkIs7Pair(handTiles, handTilesButKing, kingTilesNum, kingTiles, finalTile): #return 7对，暴头，杠数
	if len(handTiles) != 14:
		return False, False, 0
	needNum = 0
	tileDict = utility.getTile2NumDict(handTilesButKing)
	meld_list = []
	for tile in tileDict:
		meld_list.append([tile] * tileDict[tile])
	for meld in meld_list:
		if len(meld) % 2 != 0:
			meld.append(-1)
			needNum += 1
	if needNum > kingTilesNum:
		return False, False, 0
	# 暴头
	isBaoTou = False
	if kingTilesNum > 0:
		if finalTile in kingTiles: #最后一张是财神 必须 财神凑成对子
			isBaoTou = kingTilesNum - needNum >= 2
		else:
			isBaoTou = any(finalTile in meld and -1 in meld for meld in meld_list) or kingTilesNum - needNum >= 2
	# # 全部配对后，剩余必然是偶数
	restKingPairNum = int((kingTilesNum - needNum)/2)
	pairNum = sum([1 for meld in meld_list if len(meld) == 2])
	kongPairNum = sum([1 for meld in meld_list if len(meld) == 4])

	return True, isBaoTou, kongPairNum + min(restKingPairNum, pairNum)
	# return True, isBaoTou, sum([1 for tile in tileDict if tileDict[tile] == 4])


"""扣点麻将相关 算法"""
# 一条龙
def checkIsOneDragon(handTilesButKing):
	""" 在已经是胡牌牌型的情况下，判断是否是一条龙 """
	if len(handTilesButKing) < 9:
		return False
	handTilesButKing = sorted(handTilesButKing)
	dragonCharacter = False
	dragonNum = 0
	for c in const.CHARACTER:
		if c in handTilesButKing:
			dragonNum += 1
		if dragonNum >= len(const.CHARACTER):
			dragonCharacter = True
			# return True
	dragonBamboo = False
	dragonNum = 0
	if dragonCharacter == False:
		for b in const.BAMBOO:
			if b in handTilesButKing:
				dragonNum += 1
			if dragonNum >= len(const.BAMBOO):
				dragonBamboo = True
	dragonDot = False
	dragonNum = 0
	if dragonCharacter == False and dragonBamboo == False:
		for d in const.DOT:
			if d in handTilesButKing:
				dragonNum += 1
			if dragonNum >= len(const.DOT):
				dragonDot = True
	handTilesButKingTemp = list(handTilesButKing)
	if dragonCharacter:
		for t in const.CHARACTER:
			if t in handTilesButKing:
				handTilesButKingTemp.remove(t)
	if dragonBamboo:
		for t in const.BAMBOO:
			if t in handTilesButKing:
				handTilesButKingTemp.remove(t)
	if dragonDot:
		for t in const.DOT:
			if t in handTilesButKing:
				handTilesButKingTemp.remove(t)
	if dragonCharacter or dragonBamboo or dragonDot:
		if utility.meld_with_pair_need_num(handTilesButKingTemp) <= 0:
			return True
	return False

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

# 七对头
def get7DoubleWin(handTiles, handTilesButKing, kingTilesNum, lastTile):
	""" 返回值为(是否是七对,是否是豪七,是否是双豪七) """
	if len(handTiles) != 14:
		return False, False, False
	tileDict = utility.getTile2NumDict(handTilesButKing)
	need_kingtiles_num = 0
	isBrightTiles = False
	isDarkTiles = False
	for tile in tileDict:
		need_kingtiles_num  += tileDict[tile] % 2
		if tileDict[tile] == 4:
			if tile == lastTile:
				isBrightTiles = True
			else:
				isDarkTiles = True
	DEBUG_MSG("get7DoubleWin {0}, {1}".format(need_kingtiles_num,kingTilesNum))
	if kingTilesNum == need_kingtiles_num or need_kingtiles_num == 0:
		return True, isBrightTiles, isDarkTiles
	else:
		return False, False, False

# 清一色 字一色 混一色
def getTileColorType(handTilesButKing, uptiles):
	suitNumList = [0, 0, 0]
	honorNum = 0
	for t in handTilesButKing:
		if t in const.CHARACTER:
			suitNumList[0] = 1
		elif t in const.BAMBOO:
			suitNumList[1] = 1
		elif t in const.DOT:
			suitNumList[2] = 1
		elif t in const.DRAGONS or t in const.WINDS:
			honorNum = 1

	for meld in uptiles:
		for t in meld:
			if t in const.CHARACTER:
				suitNumList[0] = 1
			elif t in const.BAMBOO:
				suitNumList[1] = 1
			elif t in const.DOT:
				suitNumList[2] = 1
			elif t in const.DRAGONS or t in const.WINDS:
				honorNum = 1

	suitNum = sum([num for num in suitNumList])
	if suitNum > 1:
		return const.MIX_X_SUIT
	elif suitNum == 1:
		if honorNum == 1:
			return const.MIXED_ONE_SUIT
		else:
			return const.SAME_SUIT
	else:
		if honorNum == 1:
			return const.SAME_HONOR
		else:
			return const.MIX_X_SUIT

# 耗子吊将
def isMouseGeneral(handTiles, handTilesButKing, kingTilesNum, kingTiles, finalTile):
	""" 在已经是胡牌牌型的情况下，判断是否是耗子吊将 """
	if kingTilesNum < 1:
		return False
	if len(kingTiles) == 0:
		return False
	handCopyTiles = list(handTiles)
	handCopyTiles = sorted(handCopyTiles)
	handCopyTilesButKing = list(handTilesButKing)
	handCopyTilesButKing = sorted(handCopyTilesButKing)
	for t in handCopyTiles:
		if t in kingTiles:
			handCopyTiles.remove(t)
			break
	for t in handCopyTiles:
		if t == finalTile and finalTile not in kingTiles:
			handCopyTiles.remove(t)
			handCopyTilesButKing.remove(t)
			break
		elif t == finalTile and finalTile in kingTiles:
			handCopyTiles.remove(t)
			break
	needKingNum = utility.getMeldNeed(handCopyTilesButKing)
	DEBUG_MSG("isMouseGeneral needKingNum:{} kingTilesNum:{}".format(needKingNum, kingTilesNum))
	if needKingNum <= kingTilesNum - 1:
		return True
	return False

def multiplyCalc(game_mode, win_op, result_list):
	sBase_score = 0
	if game_mode == SPECIAL_GAME_MODE:
		if result_list[3] == 1:
			sBase_score = 20
		elif result_list[1] == 1:
			sBase_score = 10
		elif result_list[2] == 1:
			sBase_score = 10
		elif result_list[4] == 1:
			sBase_score = 10
		elif result_list[5] == 1:
			sBase_score = 10
		else:
			sBase_score = 0
	return sBase_score

def isValidUid(uid):
	if not isinstance(uid, int):
		return False
	if len(str(uid)) != 7:
		return False
	return True

def isWinTile(handTiles, kingTiles):
	length = len(handTiles)
	if length % 3 != 2:
		return False

	handCopyTiles = list(handTiles)
	handCopyTiles = sorted(handCopyTiles)
	classifyList = utility.classifyTiles(handCopyTiles, kingTiles)
	kingTilesNum = len(classifyList[0])  # 百搭的数量
	handTilesButKing = []  # 除百搭外的手牌
	for i in range(1, len(classifyList)):
		handTilesButKing.extend(classifyList[i])

	is7Pair, _, _ = checkIs7Pair(handCopyTiles, handTilesButKing, kingTilesNum + 1, kingTiles, handCopyTiles[0])
	if is7Pair:
		return False
	isThirteenOrphans = getThirteenOrphans(handTilesButKing, kingTilesNum)
	if isThirteenOrphans:
		return False
	normalWin = utility.canWinWithKing3N2(handCopyTiles, kingTiles)
	return normalWin
