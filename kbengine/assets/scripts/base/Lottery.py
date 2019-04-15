# -*- coding: utf-8 -*-
import copy
import json
import random
import time

import x42
from KBEDebug import *
from interfaces.GameObject import GameObject

lottery_path = 'scripts/data/lotteryData.json'


class Lottery(KBEngine.Entity, GameObject):
	def __init__(self):
		KBEngine.Entity.__init__(self)
		GameObject.__init__(self)
		self.replace_items = []
		self.reloadLotteryList()
		x42.Lottery = self

	# 抽奖方法
	def doLottery(self, user_id, entityCall):
		if len(self.items) == 0:
			ERROR_MSG("Lottery.server_list is []!")
			entityCall.lotteryDailyFailed(1, '暂时无法抽奖')
			return
		item = self.pick()
		DEBUG_MSG("Lottery:: {} pick item: {}".format(user_id, item))
		if item is None:
			entityCall.lotteryDailyFailed(1, '暂时无法抽奖')
			return
		else:
			count = self.history.get(item['id'], 0)
			if item['top'] != -1 and count >= item['top']:
				if len(self.replace_items) > 0:
					DEBUG_MSG("Lottery:: {} item {} limit".format(user_id, item['id']))
					index = random.randint(0, len(self.replace_items) - 1)
					item = self.replace_items[index]
					DEBUG_MSG("Lottery:: {} real pick item: {}".format(user_id, item))
				else:
					entityCall.lotteryDailyFailed(1, '暂时无法抽奖')
					return
			self.history[item['id']] = count + 1

		reward = copy.copy(item)
		del reward['replace']
		reward['add_time'] = int(time.time())
		entityCall.gotLotteryDailyInfo(item['id'], reward)

	def reloadLotteryList(self):
		self.load_from_design()

	def load_from_design(self):
		try:
			if KBEngine.hasRes(lottery_path):
				fs = KBEngine.open(lottery_path, 'r')
				items = json.load(fs)['lottery_data']
				if sum([item['rate'] for item in items]) <= 1:
					self.items = items
					self.replace_items = list(filter(lambda x: x['replace'] == 1, items))
					INFO_MSG("open reloadLotteryList!")
				else:
					ERROR_MSG("design data error", items)
		except:
			ERROR_MSG("reloadLotteryList Failed!")
			import traceback
			ERROR_MSG(traceback.format_exc())
			return

	def pick(self):
		rate = random.random()
		temp = 0
		for item in self.items:
			r = item['rate']
			if temp <= rate < temp + r:
				return item
			temp += r

		if len(self.replace_items) > 0:
			index = random.randint(0, len(self.replace_items) - 1)
			return self.replace_items[index]
		return None

	@property
	def get_items(self):
		items = []
		for item in self.items:
			tmp = copy.copy(item)
			del tmp['replace']
			items.append(tmp)
		return items
