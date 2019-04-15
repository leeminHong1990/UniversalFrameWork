# -*- coding: utf-8 -*-
import copy
import time

import const
import dbi
import switch
import utility
import x42
from Functor import Functor
from KBEDebug import *

day_time = 24 * 60 * 60


class iLotteryOperation:

	def checkRewardTime(self):
		# reward_list 目前只会存在一个物品
		if len(self.reward_list) == 0:
			return False
		reward = self.reward_list[0]
		now_time = int(time.time())
		# 领奖时间超过期限
		if now_time > reward['add_time'] + reward['effect_time'] * day_time:
			return False
		over = reward.get('over_time', -1)
		if over == 0:
			return True
		if now_time > over:
			return False
		return True

	def lotteryDaily(self):
		if self.lotteryDailyCount > 0:
			x42.Lottery.doLottery(self.userId, self)
		else:
			self.lotteryDailyFailed(0, '您没有抽奖机会！')

	def gotLotteryDailyInfo(self, lottery_id, reward):
		self.lotteryDailyCount -= 1
		if reward['type'] != "thanks":
			self.reward_list.append(reward)
		if self.hasClient:
			self.client.gotLotteryDailyInfo(lottery_id, self.lotteryDailyCount)

	def lotteryDailyFailed(self, err, msg):
		if self.hasClient:
			self.client.lotteryDailyFailed(err, msg)

	def pushLotteryDailyCount(self):
		if self.hasClient:
			self.client.pushLotteryDailyCount(self.lotteryDailyCount)

	def getLotteryDict(self):
		if self.hasClient:
			self.client.gotLotteryDict(self.reward_list[:], self.lotteryDailyCount, x42.Lottery.get_items)

	def getReward(self, op):
		# 默认操作为领取 0 领取 1转房卡
		DEBUG_MSG("getReward:: {} op is {}".format(self.userId, op))
		# 检查领奖物品是否过期
		if not self.checkRewardTime():
			# 清空记录
			self.reward_list = []
			if self.hasClient:
				self.client.gotReward(const.LOTTERY_OVER_TIME, '您的奖品已经超过领取时间！')
				return

		reward = copy.copy(self.reward_list[0])
		# reward 不可能为空
		if op == const.LOTTERY_OPERATION_1:
			num = reward['change']
			reward_type = 'card'
		else:
			num = reward['num']
			reward_type = reward['type']

		def db_cb(state, error):
			DEBUG_MSG("update offline reward : {} {}".format(state, error))

		dbid = self.databaseID

		# 房卡增加的回调函数
		def callback(user_id, msg, dbid, reward, content):
			DEBUG_MSG("{} lottery add card {}".format(user_id, content))
			avatar = x42.GW.avatars.get(user_id)
			if avatar is None or avatar.isDestroyed:
				dbi.deleteFromAvatarReward(dbid, reward, db_cb)
				DEBUG_MSG("Lottery card: entityCall isDestroyed, user id {}, type {}, num {}".format(user_id, reward_type, num))
			else:
				self.reward_list = []
				if avatar.hasClient:
					avatar.client.gotReward(const.LOTTERY_SUCCESS, msg)

		def add_card_cb(accountName, user_id, msg, content):
			if content is None:
				WARNING_MSG("add card error")
			DEBUG_MSG("add_card_cb:: card {}".format(content))
			utility.post_award_msg(accountName, Functor(callback, user_id, msg, dbid, reward), "lottery type {} award {} is_change_card {}".format(reward_type, num, op))

		# 如果
		if reward_type == 'card':
			msg = '领取奖励成功！增加了' + str(num) + '张房卡'
			if switch.DEBUG_BASE > 0:
				callback(self.userId, msg, dbid, reward, 'test')
			else:
				utility.update_card_diamond(self.accountName, num, 0, Functor(add_card_cb, self.accountName, self.userId, msg), "lottery type {} award {} is_change_card {}".format(reward_type, num, op))
		if reward_type == 'call':
			msg = '领取话费奖励成功！话费将在1~3个工作日内为您充值！'
			if switch.DEBUG_BASE > 0:
				callback(self.userId, msg, dbid, reward, 'test')
			else:
				# 通知php服 有人抽到了话费
				# callback(self.userId,'领取话费奖励成功！话费将在1~3个工作日内为您充值！')
				utility.post_award_msg(self.accountName, Functor(callback, self.userId, msg, dbid, reward), "lottery type {} award {} is_change_card {}".format(reward_type, num, op))
