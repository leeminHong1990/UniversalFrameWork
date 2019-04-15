# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *


# 创建Singleton
def createSingletonFromDB(entityName, globalname, dbid, props):
	def onCreateCallBack(baseRef, databaseID, wasActive):
		if baseRef:
			DEBUG_MSG("createSingletonFromDB: %s create from DB success, databaseID:[%i]" % (entityName, databaseID))
			baseRef.writeToDB()
			# 向全局共享数据中注册这个管理器的mailbox以便在所有逻辑进程中可以方便的访问
			KBEngine.globalData[globalname] = baseRef
		else:
			WARNING_MSG("createSingletonFromDB: %s create from DB failed" % entityName)
			singleton = KBEngine.createEntityLocally( entityName, props )
			def onWriteToDB(success, entity):
				if success:
					DEBUG_MSG("createSingletonFromDB: %s writeToDB success, dbid:[%i]" % (entityName, entity.databaseID))
					entity.writeToDB()	# TODO, to delete if auto-writeToDB each 15 min
					KBEngine.globalData[globalname] = entity
				else:
					ERROR_MSG("createSingletonFromDB: %s writeToDB failed" % entityName)
			singleton.writeToDB(onWriteToDB)

	KBEngine.createEntityFromDBID(entityName, dbid, onCreateCallBack)
