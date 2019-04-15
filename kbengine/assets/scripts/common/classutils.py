# -*- coding: utf-8 -*-
import inspect
from types import MethodType
from functools import wraps


def checkEntityID(func):
	""" check client to cell RPC """
	@wraps(func)
	def wrapper(self, callerEntityID, *args):
		if self.id != callerEntityID:
			return
		return func(self, callerEntityID, *args)

	return wrapper


def MergePropertiesAndMethod(instance_dst, instance_src):
	for name in dir(instance_src):
		if not (name.startswith('__') and name.endswith('__')):
			attr = getattr(instance_src, name)
			if hasattr(instance_dst, name):
				msg = "{} and {} have duplicate Attribute [{}]".format(type(instance_dst), type(instance_src), name)
				if hasattr(instance_dst, 'logs'):
					instance_dst.logs(msg, 'ERROR')
				else:
					print(msg)
			if inspect.ismethod(attr):
				setattr(instance_dst, name, MethodType(attr.__func__, instance_dst))
			elif inspect.isfunction(attr):
				setattr(instance_dst, name, attr)
			else:
				setattr(instance_dst, name, attr)
