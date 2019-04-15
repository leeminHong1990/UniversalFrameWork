# -*- coding: utf-8 -*-
"""
统计日活
"""
import datetime
import time

import const
from KBEDebug import *


class iDAU:

	def _get_dau(self, start, end=None):
		start_timestamp = int(time.mktime(start.timetuple()))
		if end is not None:
			end_timestamp = int(time.mktime(end.timetuple()))
		else:
			end_timestamp = start_timestamp
		result = []
		for data in reversed(self.dau_date_list):
			if start_timestamp <= data['date'] <= end_timestamp:
				result.extend(data['user_dau_list'])
		return result if len(result) > 0 else None

	def _get_date_user_dau(self, date):
		timestamp = int(time.mktime(date.timetuple()))
		for data in reversed(self.dau_date_list):
			if data['date'] == timestamp:
				return data
		return None

	def get_today_dau(self):
		return self._get_dau(datetime.datetime.now().date()) or []

	def get_yesterday_dau(self):
		return self._get_dau((datetime.datetime.now() + datetime.timedelta(days=-1)).date()) or []

	def update_dau(self, player_info_list):
		DEBUG_MSG("update_dau", player_info_list)
		now = datetime.datetime.now()
		now_date = now.date()
		today_timestamp = int(time.mktime(now_date.timetuple()))

		date_user_dau = self._get_date_user_dau(now_date)
		create_flag = False  # Note:由于引擎内存貌似不支持直接更新数据， 再这里创建标记再最后重新赋值上去
		if date_user_dau is None:
			dau_list = []
			create_flag = True
		else:
			dau_list = date_user_dau['user_dau_list']

		def get_dau_dict(dau_list, userId):
			for dau in dau_list:
				if dau["userId"] == userId:
					return dau

			return None

		for info in player_info_list:
			uid = info['userId']
			data = get_dau_dict(dau_list, uid)
			if data is None:
				data = {
					'nickname': info['nickname'],
					'head_icon': info['head_icon'],
					'sex': info['sex'],
					'userId': uid,
					'score': info['score'],
					'count': 1,
					'timestamp': today_timestamp
				}
				dau_list.append(data)
			else:
				data['count'] += 1
				data['score'] += info['score']

		if create_flag:
			self.dau_date_list.append({
				'date': today_timestamp,
				'user_dau_list': dau_list
			})
			if len(self.dau_date_list) > const.MAX_DAU_SIZE:
				self.dau_date_list.pop(0)