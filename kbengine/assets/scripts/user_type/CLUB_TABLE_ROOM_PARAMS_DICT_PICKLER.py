# -*- coding: utf-8 -*-
import json


class CLUB_TABLE_ROOM_PARAMS_DICT_TYPE(dict):
	""" 亲友圈桌子信息在内存中数据结构的重定义 """

	def __init__(self):
		dict.__init__(self)

	def asDict(self):
		data = []
		for key in self.keys():
			p = {'idx': key, 'game_type': self[key]['game_type'], 'params': self[key]['params']}
			data.append(p)
		return {'values': data}

	def createFromDict(self, dictData):
		values = dictData['values']
		for info in values:
			idx = info['idx']
			game = info['game_type']
			params = info['params']
			self[idx] = {
				'game_type': game,
				'params': params,
			}
		return self


class CLUB_TABLE_ROOM_PARAMS_DICT_PICKLER(object):

	def __init__(self):
		pass

	# 此接口被C++底层调用
	# 引擎将数据交给脚本层管理，脚本层可以将这个字典重定义为任意类型
	# createObjFromDict被调用后，返回的数据将直接赋值到脚本中的变量
	def createObjFromDict(self, dct):
		return CLUB_TABLE_ROOM_PARAMS_DICT_TYPE().createFromDict(dct)

	# 此接口被C++底层调用
	# 底层需要从脚本层中获取数据，脚本层此时应该将数据结构还原为固定字典
	def getDictFromObj(self, obj):
		return obj.asDict()

	def isSameType(self, obj):
		return isinstance(obj, CLUB_TABLE_ROOM_PARAMS_DICT_TYPE)


inst = CLUB_TABLE_ROOM_PARAMS_DICT_PICKLER()
