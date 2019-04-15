import switch
import utility
import x42
from Functor import Functor
from KBEDebug import *
from tasks.TaskAction import TaskAction


# 不处理掉线情况
class AwardCardAction(TaskAction):

	def __init__(self, card):
		super().__init__()
		self.card = card

	def callback(self, user_id, json):
		DEBUG_MSG("AwardCardAction:: task id {}, user id {}, result {}".format(self.task_id, user_id, json))
		avatar = x42.GW.avatars.get(user_id)
		if avatar and not avatar.isDestroyed:
			avatar.task_action_complete(self.task_id, self.card)
		else:
			DEBUG_MSG("AwardCardAction:: user offline. task id {}, user id {}, result {}".format(self.task_id, user_id, json))

	def run(self, entityCall, user_id):
		if entityCall.isDestroyed:
			DEBUG_MSG("Award card: entityCall isDestroyed, user id {}, task id {}, card {}".format(user_id, self.task_id, self.card))
		else:
			if switch.DEBUG_BASE > 0:
				entityCall.task_action_complete(self.task_id, self.card)
			else:
				utility.update_card_diamond(entityCall.accountName, self.card, 0, Functor(self.callback, user_id), "task {} award {}".format(self.task_id, self.card))


def create(action):
	return AwardCardAction(action['card'])
