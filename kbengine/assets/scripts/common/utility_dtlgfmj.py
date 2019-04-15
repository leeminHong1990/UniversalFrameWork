# -*- coding:utf-8 -*-
import const
import utility

def classifyKings(handTiles, kingTiles):
	return list(filter(lambda x: True if x not in kingTiles else False, handTiles)), \
		   list(filter(lambda x: True if x in kingTiles else False, handTiles))

def check_7Pair(handTilesButKing, kingNum):
	if len(handTilesButKing)+kingNum != 14:
		return False
	tileDict = utility.getTile2NumDict(handTilesButKing)
	return sum([1 for k in tileDict if tileDict[k]%2==1]) <= kingNum

def check_uniform(handTilesButKing, upTiles):
	char, bamb, dot, wind, dragon = 0, 0, 0, 0, 0
	for t in handTilesButKing:
		if t in const.CHARACTER:
			char = 1
		elif t in const.BAMBOO:
			bamb = 1
		elif t in const.DOT:
			dot = 1
		elif t in const.WINDS:
			wind = 1
		elif t in const.DRAGONS:
			dragon = 1

	for meld in upTiles:
		if meld[0] in const.CHARACTER:
			char = 1
		elif meld[0] in const.BAMBOO:
			bamb = 1
		elif meld[0] in const.DOT:
			dot = 1
		elif meld[0] in const.WINDS:
			wind = 1
		elif meld[0] in const.DRAGONS:
			dragon = 1

	return  char + bamb + dot == 1 and wind + dragon == 0

# 一条龙
def checkIsOneDragon(handTilesButKing, kingNum, kingTiles):
	""" 在已经是胡牌牌型的情况下，判断是否是一条龙 """

	if len(handTilesButKing)+kingNum < 9:
		return False

	def check(handTilesButKing, checkList, kingNum, kingTiles):
		tiles = list(handTilesButKing)
		for t in checkList:
			if t in tiles:
				tiles.remove(t)
			elif t in kingTiles:
				if kingNum > 0:
					kingNum -= 1
				else:
					return False
			else:
				return False

		return len(tiles) >= 0 and utility.winWith3N2NeedKing(tiles) <= kingNum

	return check(handTilesButKing, const.CHARACTER, kingNum, kingTiles) or \
		   check(handTilesButKing, const.BAMBOO, kingNum, kingTiles) or \
		   check(handTilesButKing, const.DOT, kingNum, kingTiles)