import datetime
import json

import const
import x42
from KBEDebug import *
from tasks import Task, TaskCondition, TaskAction
from worldmembers import iTaskManager

TYPES_STATE_MAP = {
	"claim": const.TASK_STATE_CLAIM,
	"complete": const.TASK_STATE_COMPLETE,
	"settle": const.TASK_STATE_SETTLE,
}


class iTaskOperation:

	def __init__(self):
		# 已完成的任务
		# self.complete_tasks = []
		# 正在进行的任务
		# self.claim_tasks = []
		# 需要领取奖励的任务
		# self.settle_tasks = []
		# 任务数组操作执行顺序  claim ==> settle ==> complete
		# 任务执行顺序  claim ==> submit ==> settle
		self.reset_tasks()

	def auto_claim_task(self, tasks):
		# 只处理每日任务
		for task_id in tasks.keys():
			if tasks not in self.complete_tasks and tasks[task_id].task_type == Task.TYPE_DAILY and task_id not in self.claim_tasks:
				self.claim_tasks.append(task_id)
		DEBUG_MSG("auto_claim_task:: {}, {}".format(self.userId, self.claim_tasks))

	def reset_tasks(self, force=False):
		# 返回值用于判断是否已经下发数据，避免重复
		if not force and self.task_reset_time > 0:
			if not iTaskManager.can_refresh_daily_task(self.task_reset_time):
				# 检查任务信息是否重置过
				if x42.GW.check_tasks_valid(self.claim_tasks) \
						and x42.GW.check_tasks_valid(self.complete_tasks) \
						and x42.GW.check_tasks_valid(self.settle_tasks):
					return

		DEBUG_MSG("reset_tasks:: user id {}".format(self.userId))
		tasks = x42.GW.available_tasks
		old_complete_task = self.complete_tasks
		self.complete_tasks = []
		for task_id in filter(lambda t: t in tasks, old_complete_task):
			task = tasks[task_id]
			if task.task_type != Task.TYPE_DAILY:
				self.complete_tasks.append(task_id)

		old_claim_tasks = self.claim_tasks
		self.claim_tasks = []
		for task_id in filter(lambda t: t in tasks, old_claim_tasks):
			task = tasks[task_id]
			if task.task_type != Task.TYPE_DAILY:
				self.claim_tasks.append(task_id)

		old_settle_tasks = self.settle_tasks
		self.settle_tasks = []
		for task_id in filter(lambda t: t in tasks, old_settle_tasks):
			task = tasks[task_id]
			if task.task_type != Task.TYPE_DAILY:
				self.settle_tasks.append(task_id)

		self.task_reset_time = int(datetime.datetime.now().timestamp())
		DEBUG_MSG("reset_tasks::finish user id {}, claim {} complete {} ".format(self.userId, self.claim_tasks, self.complete_tasks))
		self.auto_claim_task(tasks)
		self.auto_check_tasks()

	def taskOperation(self, op_id, task_id, args):
		args = json.loads(args)
		if op_id == const.TASK_OPERATION_SUBMIT:
			self.submitTask(task_id, args)
		elif op_id == const.TASK_OPERATION_SETTLE:
			self.settleTask(task_id, args)
		else:
			DEBUG_MSG("not support task operation: {} {} {} {}".format(self.userId, op_id, task_id, args))

	def do_submit_task(self, task):
		# 将任务提交到待领取队列
		DEBUG_MSG("submit_task:: user id:{} {}".format(self.userId, task.id))
		task_id = task.id
		self.settle_tasks.append(task_id)
		task_id in self.claim_tasks and self.claim_tasks.remove(task_id)

	def do_settle_task(self, task):
		# 领取任务的奖励
		DEBUG_MSG("do_settle_task:: user id:{} {} {}".format(self.userId, task.id, task.action))
		task_id = task.id
		self.complete_tasks.append(task_id)
		task_id in self.settle_tasks and self.settle_tasks.remove(task_id)
		action = TaskAction.TaskActionFactory.create_from_task(task)
		action.run(self, self.userId)

	def task_action_complete(self, task_id, args=None):
		DEBUG_MSG("task_action_complete:: {} {} {}".format(self.userId, task_id, args))
		self.taskOperationSuccess(const.TASK_OPERATION_SETTLE, task_id)

	def submitTask(self, task_id, args):
		DEBUG_MSG("submitTask:: user id: {} {} {}".format(self.userId, task_id, args))
		if task_id in self.complete_tasks:
			self.taskOperationFailed(const.TASK_OPERATION_SUBMIT, task_id, "任务已完成！")
			return
		if task_id not in self.claim_tasks:
			self.taskOperationFailed(const.TASK_OPERATION_SUBMIT, task_id, "任务未领取！")
			return
		task = x42.GW.find_task(task_id)
		if task is None:
			self.taskOperationFailed(const.TASK_OPERATION_SUBMIT, task_id, "任务不存在！")
			return

		if task.end_time > 0:
			if int(datetime.datetime.now().timestamp()) > task.end_time:
				self.taskOperationFailed(const.TASK_OPERATION_SUBMIT, task_id, "任务已过期！")
				return
		task_condition = TaskCondition.TaskConditionFactory.create_from_task(task)
		if task_condition.condition(task_id, self, args):
			self.do_submit_task(task)
			self.taskOperationSuccess(const.TASK_OPERATION_SUBMIT, task_id)
		else:
			self.taskOperationFailed(const.TASK_OPERATION_SUBMIT, task_id, "任务未完成！")

	def settleTask(self, task_id, args):
		if task_id in self.complete_tasks:
			self.taskOperationFailed(const.TASK_OPERATION_SETTLE, task_id, "任务已完成！")
			return
		if task_id not in self.settle_tasks:
			self.taskOperationFailed(const.TASK_OPERATION_SETTLE, task_id, "任务未提交！")
			return
		task = x42.GW.find_task(task_id)
		if task is None:
			self.taskOperationFailed(const.TASK_OPERATION_SETTLE, task_id, "任务不存在！")
			return
		self.do_settle_task(task)

	def taskOperationSuccess(self, op, task_id):
		if self.hasClient:
			self.client.taskOperationSuccess(op, task_id)

	def taskOperationFailed(self, op, task_id, msg):
		if self.hasClient:
			self.client.taskOperationFailed(op, task_id, msg)

	def _convert_task(self, task, state):
		item = task.asDict()
		# if 'action' in item:
		# del item['action']
		item['action'] = json.dumps(item['action'])
		item['condition'] = json.dumps(item['condition'])
		item['state'] = state
		return item

	def pushTasks(self):
		# 由于push 和 query 基本一样，以后需要改动时在修改
		self.queryTasks()

	def queryTasks(self):
		# 查询玩家拥有的任务
		tasks = x42.GW.available_tasks
		data = []
		claim_tasks = list(filter(lambda t: t in tasks, self.claim_tasks))
		complete_tasks = list(filter(lambda t: t in tasks, self.complete_tasks))
		settle_tasks = list(filter(lambda t: t in tasks, self.settle_tasks))
		args = {
			"claim": claim_tasks,
			"complete": complete_tasks,
			"settle": settle_tasks,
		}
		for key, ts in args.items():
			for id in ts:
				task = tasks[id]
				item = self._convert_task(task, TYPES_STATE_MAP[key])
				task_condition = TaskCondition.TaskConditionFactory.create_from_task(task)
				item['completion'] = task_condition.completion(id, self, args)
				data.append(item)

		if self.hasClient:
			self.client.gotTasks(data)

	def queryAvailableTasks(self):
		tasks = x42.GW.available_tasks
		data = []
		for task in tasks.values():
			item = self._convert_task(task, const.TASK_STATE_NONE)
			item['completion'] = [0, 0]
			data.append(item)
		if self.hasClient:
			self.client.gotAvailableTasks(data)

	# ----------------------------------------------------------------------------------------------------------------------

	def auto_check_tasks(self):
		args = {}
		for task_id in reversed(self.claim_tasks):
			if task_id in self.complete_tasks:
				continue
			if task_id not in self.claim_tasks:
				continue
			task = x42.GW.find_task(task_id)
			if task is None:
				continue
			if 0 < task.end_time < int(datetime.datetime.now().timestamp()):
				continue
			task_condition = TaskCondition.TaskConditionFactory.create_from_task(task)
			if task_condition.condition(task_id, self, args):
				self.do_submit_task(task)
				DEBUG_MSG("auto_check_round:: auto submit task {} {}".format(self.userId, task_id))
