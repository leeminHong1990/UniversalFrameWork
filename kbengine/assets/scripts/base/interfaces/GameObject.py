# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
from Swallower import NonexistentSwallower


class GameObject:
	"""
	服务端游戏对象的基础接口类
	封装了一下引擎的timer
	"""

	def __init__(self):
		self._timers = {}

	def getScriptName(self):
		return self.__class__.__name__

	def destroySelf(self):
		"""
		virtual method
		"""
		if self.cell is not None:
			# 销毁cell实体
			self.destroyCellEntity()
			return

		self.clear_timers()
		# 销毁base
		self.destroy()

	def getSpaces(self):
		"""
		获取场景管理器
		"""
		return KBEngine.globalData["Spaces"]

	def add_timer(self, delay, callback):
		"""
		增加一次性定时器
		:param delay: 触发周期, 单位秒
		:param callback: 触发时需要执行的函数
		:return: 定时器ID, 可用于取消该定时器
		"""
		if delay <= 0:
			callback()
			return None

		tid = self.addTimer(delay, 0, 0)
		self._timers[tid] = (0, callback)
		return tid

	def add_repeat_timer(self, offset, period, callback):
		"""
		增加周期性定时器
		:param offset: 指定定时器第一次触发延时, 单位秒
		:param period: 触发周期, 单位秒
		:param callback: 触发时需要执行的函数
		:return: 定时器ID, 可用于取消该定时器
		"""
		tid = self.addTimer(offset, period, 0)
		self._timers[tid] = (period, callback)
		return tid

	def cancel_timer(self, tid):
		"""
		取消一个定时器
		:param tid: 定时器ID
		:return:
		"""
		if tid in self._timers:
			self.delTimer(tid)
			del self._timers[tid]

	def clear_timers(self):
		for tid in list(self._timers.keys()):
			self.cancel_timer(tid)

		self._timers = {}
		self.add_timer = self.add_repeat_timer = self.onTimer = NonexistentSwallower()

	# --------------------------------------------------------------------------------------------
	#                              Callbacks
	# --------------------------------------------------------------------------------------------
	def onTimer(self, tid, userArg):
		"""
		定时器引擎回调
		:param tid: 定时器ID
		:param userArg: 用户参数
		:return:
		"""
		delay, callback = self._timers[tid]
		callback()
		if delay <= 0:
			# 移除一次性定时器
			self.cancel_timer(tid)

	def onGetCell(self):
		"""
		KBEngine method.
		entity的cell部分实体被创建成功
		"""
		# DEBUG_MSG("%s::onGetCell: %i" % (self.getScriptName(), self.id))
		pass

	def onLoseCell(self):
		"""
		KBEngine method.
		entity的cell部分实体丢失
		"""
		DEBUG_MSG("%s::onLoseCell: %i" % (self.getScriptName(), self.id))
		self.destroySelf()

	def onRestore(self):
		"""
		KBEngine method.
		entity的cell部分实体被恢复成功
		"""
		DEBUG_MSG("%s::onRestore: %s" % (self.getScriptName(), self.cell))
