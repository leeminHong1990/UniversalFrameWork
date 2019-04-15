from datetime import datetime

from tasks import TaskCondition


class GameRoundTaskCondition(TaskCondition.TaskCondition):

	def __init__(self, round):
		super().__init__()
		self.target = round

	def condition(self, task_id, avatar_mb, args):
		timestamp = int(datetime.now().timestamp())
		count = avatar_mb.get_game_round(timestamp, timestamp)
		return count >= self.target

	def completion(self, task_id, avatar_mb, args):
		if args and 'claim' in args and 'settle' in args and 'complete' in args:
			if task_id not in args['claim'] and (task_id in args['settle'] or task_id in args['complete']):
				return [self.target, self.target]
		timestamp = int(datetime.now().timestamp())
		count = avatar_mb.get_game_round(timestamp, timestamp)
		return [min(count, self.target), self.target]


def create(condition):
	return GameRoundTaskCondition(condition['round'])
