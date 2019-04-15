# -*- coding: utf-8 -*-
import random
import time

import const
import utility
from KBEDebug import *
from interfaces.GameObject import GameObject

INTERVAL_TIME = 60 * 60

class iBase(GameObject):
	"""
	服务端游戏对象的基础接口类
	"""
	def __init__(self):
		GameObject.__init__(self)
		self.taskTimer = None
		self.setTimerByHour()

	def setTimerByHour(self):
		offset = 0
		ctime = time.time()
		ctime_s = list(time.localtime())
		if ctime_s[4] != 0 or ctime_s[5] != 0:
			ctime_s[3] += 1
			ctime_s[4] = 0
			ctime_s[5] = 0
			atime = time.mktime(time.struct_time(ctime_s))
			offset = atime - ctime

		ran = random.random() * 60
		offset += ran
		DEBUG_MSG("iTask::setTimerByHour: offset, %f random, %f" % (offset, ran))
		if self.taskTimer is not None:
			self.cancel_timer(self.taskTimer)
			self.taskTimer = None
		self.taskTimer = self.add_timer(offset, self.refresh_task_callback)

	def refresh_task_callback(self):
		self.checkDailyRefresh()
		self.taskTimer = self.add_repeat_timer(INTERVAL_TIME, INTERVAL_TIME, self.checkDailyRefresh)

	def checkDailyRefresh(self):
		""" 检测清空日常任务 """
		ttime = time.time()
		tlocaltime = time.localtime()
		ctime_s = list(tlocaltime)
		server_refresh = const.SERVER_REFRESH_TIME
		if ctime_s[3] == server_refresh[0]:
			self.refreshOnResetDay(ttime, tlocaltime)

	def initBase(self):
		""" 初始化 """
		ttime = time.time()
		tlocaltime = time.localtime()
		if not utility.is_same_day(ttime, self.lastResetDayTime):
			self.refreshOnResetDay(ttime, tlocaltime)

		self.client and self.client.pushAvatarInfo(self.getAvatarInfo())
