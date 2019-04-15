# -*- coding: utf-8 -*-

import const
from KBEDebug import *


class iRecordOperation(object):
	def __init__(self):
		pass

	def initRecord(self):
		pass

	def queryRecord(self, record_id):
		DEBUG_MSG("iRecordOperation queryRecord {0}".format(record_id))
		KBEngine.globalData['GameWorld'].query_record(self, record_id)

	def queryUserRecord(self, user_id, count):
		DEBUG_MSG("iRecordOperation queryRecord {0} {1}".format(user_id, count))
		KBEngine.globalData['GameWorld'].query_user_record(self, user_id, count)

	def queryUserRecordResult(self, records):
		self.queryUserRecordSuccess(records)

	def queryUserRecordSuccess(self, records):
		DEBUG_MSG('queryUserRecordSuccess', records)
		if self.hasClient:
			self.client.queryUserRecordResult(records)

	def queryRecordResult(self, record, game_type):
		if self.isDestroyed:
			return
		if record is None:
			self.queryRecordFailed(const.QUERY_RECORD_NO_EXIST, str(game_type))
		else:
			self.queryRecordSuccess(record, str(game_type))

	def queryRecordSuccess(self, record, game_type):
		if self.hasClient:
			self.client.queryRecordResult(record, str(game_type))

	def queryRecordFailed(self, code, game_type):
		if self.hasClient:
			self.client.queryRecordFailed(code, str(game_type))
