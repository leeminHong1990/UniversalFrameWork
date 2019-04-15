# -*- coding: utf-8 -*-
"""
一个限制长度的队列，当容量满时添加会把第一个移除
"""


class LimitQueue:

	def __init__(self, limit):
		self.limit = limit
		self.items = []

	@property
	def full(self):
		return self.limit == len(self.items)

	def append(self, item):
		self.items.append(item)
		if len(self.items) > self.limit:
			self.items.pop(0)

	def pop(self, index):
		if len(self.items) > 0:
			self.items.pop(index)

	def clear(self):
		self.items.clear()

	def __len__(self):
		return len(self.items)

	def __iter__(self, *args, **kwargs):
		return iter(self.items)

	def __getitem__(self, y):
		return self.items[y]
