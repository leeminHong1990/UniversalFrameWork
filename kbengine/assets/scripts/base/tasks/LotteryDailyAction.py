import x42
from KBEDebug import *
from tasks.TaskAction import TaskAction


# 不处理掉线情况
class LotteryDailyAction(TaskAction):

	def __init__(self, count):
		super().__init__()
		self.count = count

	def callback(self, user_id, json):
		DEBUG_MSG("LotteryDailyAction:: task id {}, user id {}, result {}".format(self.task_id, user_id, json))
		avatar = x42.GW.avatars.get(user_id)
		if avatar and not avatar.isDestroyed:
			avatar.task_action_complete(self.task_id, self.count)
		else:
			DEBUG_MSG("LotteryDailyAction:: user offline. task id {}, user id {}, result {}".format(self.task_id, user_id, json))

	def run(self, entityCall, user_id):
		if entityCall.isDestroyed:
			DEBUG_MSG("LotteryDailyAction: entityCall isDestroyed, user id {}, task id {}, card {}".format(user_id, self.task_id, self.count))
		else:
			entityCall.lotteryDailyCount += self.count
			entityCall.pushLotteryDailyCount()
			entityCall.task_action_complete(self.task_id, self.count)


def create(action):
	return LotteryDailyAction(action['count'])
