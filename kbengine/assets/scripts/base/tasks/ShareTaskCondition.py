import tasks.TaskCondition


class ShareTaskCondition(tasks.TaskCondition.TaskCondition):

	def condition(self, task_id, entityCall, args):
		if args and 'shareId' in args:
			return True
		return False

	def completion(self, task_id, entityCall, args):
		if args and 'claim' in args and 'settle' in args and 'complete' in args:
			if task_id not in args['claim'] and (task_id in args['settle'] or task_id in args['complete']):
				return [1, 1]
		return [0, 1]


def create(condition):
	return ShareTaskCondition()
