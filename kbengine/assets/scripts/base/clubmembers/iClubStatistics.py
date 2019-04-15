# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
import utility
import time
import const
from datetime import timedelta
from operator import itemgetter
import Events

class iClubStatistics(object):
	"""亲友圈 数据统计"""

	def __init__(self):
		"""重启时清除无效亲友圈的统计信息"""
		self.updateDailyData()
		return

	def updateClubStatistics(self, cost, uid_list):
		self.updateDailyData()
		increment = [uid for uid in uid_list if uid not in self.active_members]
		self.active_members.extend(increment)
		# 以今日凌晨时间戳为key
		d = time.localtime(int(self.dailyTime))
		date = int(int(self.dailyTime) - timedelta(hours=d.tm_hour, minutes=d.tm_min, seconds=d.tm_sec).seconds)
		if date in self.statistics:
			# 存量
			self.statistics[date]['round']  += 1
			self.statistics[date]['cost']  	+= cost
			self.statistics[date]['active'] += len(increment)
		else:
			# 增量
			if len(self.statistics) >= const.CLUB_STATISTICS_LIMIT:
				self.statistics.pop(sorted(list(self.statistics.keys()))[0], None)
			self.statistics[date] = {
					'date' 	: date,
					'round'	: 1,
					'cost' 	: cost,
					'active': len(self.active_members),
				}

	def _orderStatistics(self, statistics, order, page=0, size=None):
		if order is not None:
			order_statistics = sorted(statistics, key=itemgetter('date', 'active', 'cost', 'round'), reverse=True)
		else:
			order_statistics = sorted(statistics, key=itemgetter('date'), reverse=True)

		if size is not None:
			order_statistics = order_statistics[page*size : min(page*size+size, len(statistics))]
		return order_statistics

	def getPageClubStatistics(self, avatar_mb, current_page, size, filter=None, order=None):
		statistics = list(self.statistics.values())
		order_statistics = self._orderStatistics(statistics, order, current_page, size)
		avatar_mb.gotPageClubStatistics(self.clubId, order_statistics, current_page, size, len(self.statistics))

	def updateDailyData(self):
		"""刷新每日亲友圈状态"""
		if not utility.is_same_day(self.dailyTime, time.time()):
			self.dailyTime = int(time.time())
			self.active_members = []
		return