import importlib


class TaskCondition:

	def __init__(self):
		self.id = 0
		self.task_id = 0
		self.condition_type = type(self).__name__

	def condition(self, task_id, entityCall, args):
		return False

	def completion(self, task_id, entityCall, args):
		return [0, 0]


"""
{
	type: 'GameRoundTaskCondition',
	round: '11',
}
"""


class TaskConditionFactory:

	@staticmethod
	def create_from_task(task):
		class_name = task.condition['type']
		meta = importlib.import_module("tasks." + class_name)
		condition = meta.create(task.condition)
		condition.task_id = task.id
		return condition
