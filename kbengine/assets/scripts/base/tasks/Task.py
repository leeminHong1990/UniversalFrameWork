import json

from json.decoder import WHITESPACE

# 每日任务
TYPE_DAILY = 0
# 主线任务
TYPE_MAIN = 1


class Task:

	def __init__(self):
		self.id = 0
		# # 完成状态
		# self.state = False
		# 重复任务
		self.repeatable = False
		# 任务类型
		self.task_type = TYPE_MAIN
		# 任务标题
		self.title = ''
		# 任务描述
		self.desc = ''
		# 完成条件
		self.condition = None
		# 完成后操作
		self.action = None
		# 有效期
		self.end_time = 0

	def asDict(self):
		data = {
			'id': self.id,
			'task_type': self.task_type,
			'title': self.title,
			'desc': self.desc,
			'condition': self.condition,
			'action': self.action,
			'end_time': self.end_time,
		}
		return data


class TaskEncoder(json.JSONEncoder):
	def default(self, obj):
		if isinstance(obj, Task):
			return obj.asDict()
		return json.JSONEncoder.default(self, obj)


class TaskDecoder(json.JSONDecoder):
	def decode(self, s, _w=WHITESPACE.match):
		dic = super().decode(s, _w)
		tasks = {}
		for id, data in dic.items():
			task = Task()
			task.id = int(data['id'])
			task.task_type = data.get('task_type')
			task.title = data.get('title', '')
			task.desc = data.get('desc', '')
			task.condition = data.get('condition')
			task.action = data.get('action')
			task.end_time = data.get('end_time', 0)
			tasks[int(id)] = task
		return tasks
