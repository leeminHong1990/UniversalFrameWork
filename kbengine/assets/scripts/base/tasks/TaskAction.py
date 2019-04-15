import importlib


class TaskAction:
	def __init__(self):
		self.id = 0
		self.task_id = 0
		self.action_type = type(self).__name__

	def run(self, entityCall, args):
		pass


"""
{
	type: 'AwardCardAction',
	card: '10',
}
"""


class TaskActionFactory:

	@staticmethod
	def create_from_task(task):
		class_name = task.action['type']
		meta = importlib.import_module("tasks." + class_name)
		action = meta.create(task.action)
		action.task_id = task.id
		return action
