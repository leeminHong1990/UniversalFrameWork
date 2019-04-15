# -*- coding: utf-8 -*-
"""
统计个人日活
"""
import datetime
import json
import time

import const
import switch
import utility
import x42
from Functor import Functor
from KBEDebug import *


class iStatOperation:

	def __init__(self):
		self.process_game_round()

	def _get_game_round(self, start, end=None):
		start_timestamp = int(time.mktime(start.timetuple()))
		if end is not None:
			end_timestamp = int(time.mktime(end.timetuple()))
		else:
			end_timestamp = start_timestamp
		result = []
		for key, data in self.stat_game_round.items():
			date = key[0]
			if start_timestamp <= date <= end_timestamp:
				result.append(data)
		return result

	def get_game_round(self, begin_timestamp, end_timestamp):
		begin = datetime.date.fromtimestamp(begin_timestamp)
		end = datetime.date.fromtimestamp(end_timestamp)
		data = self._get_game_round(begin, end)
		count = 0
		for item in data:
			count += item['count']
		return count

	def addAvatarGameRound(self, game_type, value=1):
		x42.GW.add_dau_by_game(self.userId, game_type)
		self.gameRound += value
		now = datetime.datetime.now()
		now_date = now.date()
		today_timestamp = int(time.mktime(now_date.timetuple()))
		key = (today_timestamp, game_type)
		if key in self.stat_game_round:
			data = self.stat_game_round[key]
			data['count'] = data['count'] + value
		else:
			self.stat_game_round[key] = {
				'date': today_timestamp,
				'count': value,
				'type': game_type
			}
		self.pushTodayGameRound()
		self.auto_check_tasks()
		# self.checkAndSendRound()

	def pushTodayGameRound(self):
		if self.hasClient:
			timestamp = datetime.datetime.today().timestamp()
			self.client.pushTodayGameRound(self.get_game_round(timestamp, timestamp))

	def queryGameRound(self, begin_timestamp, end_timestamp):
		begin = datetime.date.fromtimestamp(begin_timestamp)
		end = datetime.date.fromtimestamp(end_timestamp)
		data = self._get_game_round(begin, end)
		if self.hasClient:
			self.client.gotGameRound(data, begin_timestamp, end_timestamp)

	def process_game_round(self):
		keys = list(self.stat_game_round.keys())
		for key in keys:
			diff = datetime.date.today() - datetime.date.fromtimestamp(key[0])
			if diff.days > const.MAX_AVATAR_ROUND_SIZE:
				del self.stat_game_round[key]

	def checkAndSendRound(self):
		if self.gameRound >= const.LINK_THRESHOLD and self.roundFlag == 0:

			def callback(uid, content):
				res = True
				if content is None:
					res = False
				try:
					ret = json.loads(content)
					if ret['errcode'] != 0:
						res = False
						DEBUG_MSG('update_valid {} error code={}, msg={}'.format(uid, ret['errcode'], ret['errmsg']))
				except:
					res = False
					import traceback
					ERROR_MSG(traceback.format_exc())

				if res:
					p = x42.GW.avatars.get(uid)
					if p and not p.isDestroyed:
						p.roundFlag = 1

			if switch.DEBUG_BASE > 0:
				DEBUG_MSG("send link, round {} ".format(self.gameRound))
				self.showTip("达成绑定条件！")
				self.roundFlag = 1
			else:
				utility.update_valid_account(self.accountName, Functor(callback, self.userId))
