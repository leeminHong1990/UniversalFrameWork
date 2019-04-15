# -*- coding: utf-8 -*-

import json
from operator import itemgetter, methodcaller

import const
import x42

SORTED_KEYS = ['nickname', 'sex', 'userId', 'score', 'count', 'timestamp']
DAU_ID2FUNC = {
	const.DAU_TODAY: "get_today_dau",
	const.DAU_YESTERDAY: "get_yesterday_dau",
}


class iDAUOperation(object):

	def _processDau(self, src, page, size, order):
		flag = True
		if len(order) == 0:
			flag = False
		else:
			for i in order:
				if i not in SORTED_KEYS:
					flag = False
					break
		if flag:
			src = sorted(src, key=itemgetter(*order), reverse=True)
		src = src[page * size: (page + 1) * size]
		return src

	def queryTodayDAU(self, club_id, page, size, order):
		if x42.ClubStub.isClubMember(club_id, self.userId):
			club = x42.ClubStub.clubs[club_id]
			data = club.get_today_dau()
			total = len(data)
			data = self._processDau(data, page, size, order)
			self.queryDAUResult(club_id, data, const.DAU_TODAY, page, size, total, order)
		else:
			self.queryDAUFailed(-1)

	def queryYesterdayDAU(self, club_id, page, size, order):
		if x42.ClubStub.isClubMember(club_id, self.userId):
			club = x42.ClubStub.clubs[club_id]
			data = club.get_yesterday_dau()
			total = len(data)
			data = self._processDau(data, page, size, order)
			self.queryDAUResult(club_id, data, const.DAU_YESTERDAY, page, size, total, order)
		else:
			self.queryDAUFailed(-1)

	def queryDAUResult(self, club_id, data, query_type, page, size, total, order):
		if getattr(self, 'client', None):
			self.client.queryDAUResult(club_id, data, query_type, page, size, total, order)

	def queryDAUFailed(self, code):
		if getattr(self, 'client', None):
			self.client.queryDAUFailed(code)

	def queryMyDAU(self, club_id, query_type, order):
		if query_type in DAU_ID2FUNC and x42.ClubStub.isClubMember(club_id, self.userId):
			club = x42.ClubStub.clubs[club_id]
			data = methodcaller(DAU_ID2FUNC[query_type])(club)
			data = self._processDau(data, 0, len(data), order)
			index = -1
			result = {}

			for i, d in enumerate(data):
				if d['userId'] == self.userId:
					index = i
					result = dict(d)
					break
			result = json.dumps(result)
			self.queryMyDauResult(club_id, result, query_type, index)
		else:
			self.queryDAUFailed(-1)

	def queryMyDauResult(self, club_id, data, query_type, index):
		if getattr(self, 'client', None):
			self.client.queryMyDAUResult(club_id, data, query_type, index)
