import datetime
import json

import const
import switch
import tasks.Task
import x42
from KBEDebug import *

test_task = """

{"0": {"id": 0, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 0}, "action": {"type": "AwardCardAction", "card": 0}, "end_time": 0}, "1": {"id": 1, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 1}, "action": {"type": "AwardCardAction", "card": 1}, "end_time": 0}, "2": {"id": 2, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 2}, "action": {"type": "AwardCardAction", "card": 2}, "end_time": 0}, "3": {"id": 3, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 3}, "action": {"type": "AwardCardAction", "card": 3}, "end_time": 0}, "4": {"id": 4, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 4}, "action": {"type": "AwardCardAction", "card": 4}, "end_time": 0}, "5": {"id": 5, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 5}, "action": {"type": "AwardCardAction", "card": 5}, "end_time": 0}, "6": {"id": 6, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 6}, "action": {"type": "AwardCardAction", "card": 6}, "end_time": 0}, "7": {"id": 7, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 7}, "action": {"type": "AwardCardAction", "card": 7}, "end_time": 0}, "8": {"id": 8, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 8}, "action": {"type": "AwardCardAction", "card": 8}, "end_time": 0}, "9": {"id": 9, "task_type": 0, "desc": "i am task ", "condition": {"type": "GameRoundTaskCondition", "round": 9}, "action": {"type": "AwardCardAction", "card": 9}, "end_time": 0}}

"""

design_path = './scripts/data/design.json'


class iTaskManager:

	def __init__(self):
		self.tasks = {}
		self.refresh_timestamp = 0
		self.refresh_tasks()

	@property
	def available_tasks(self):
		tmp = {}
		for task_id, task in self.tasks.items():
			if task.end_time == 0 or datetime.datetime.now().timestamp() < task.end_time:
				tmp[int(task_id)] = task
		return tmp

	def find_task(self, task_id):
		return self.tasks.get(task_id)

	def check_tasks_valid(self, task_id_list):
		for id in task_id_list:
			if id not in self.tasks:
				return False
		return True

	def load_local_data(self):
		try:
			if KBEngine.hasRes(design_path):
				fs = KBEngine.open(design_path, 'r')
				text = fs.read()
				self.tasks = json.loads(text, cls=tasks.Task.TaskDecoder)
		except:
			import traceback
			ERROR_MSG(traceback.format_exc())

	def refresh_tasks(self, refresh_avatars=False):
		self.refresh_timestamp = datetime.datetime.now().timestamp()
		DEBUG_MSG("refresh tasks:: {} {}".format(self.refresh_timestamp, refresh_avatars))
		# 服务端刷新所有可用的任务列表
		# 由于没有设定在线拉数据需求，所以都从本地取数据
		if switch.DEBUG_BASE > 0:
			self.load_local_data()
		else:
			self.load_local_data()
		if refresh_avatars:
			avatars = x42.GW.avatars
			for avatar in avatars.values():
				if avatar and not avatar.isDestroyed:
					avatar.reset_tasks(True)


def can_refresh_daily_task(timestamp):
	last = datetime.datetime.fromtimestamp(timestamp)
	today = datetime.datetime.today()
	# 每日上午6点重置
	reset_time = datetime.datetime(year=today.year, month=today.month, day=today.day, hour=const.SERVER_REFRESH_TIME[0])
	diff = last - reset_time
	if diff.days > 0 or (diff.days == 0 and diff.seconds >= 0):
		return False
	if today.timestamp() - reset_time.timestamp() < 0:
		return False
	return True
# diff = datetime.date.today() - datetime.date.fromtimestamp(self.task_reset_time)
# if diff.days == 0:
# 	return
