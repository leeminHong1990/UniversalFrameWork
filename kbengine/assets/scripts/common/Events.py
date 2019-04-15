# -*- coding: utf-8 -*-

# 事件码定义
EVENT_PLAYER_O_STATUS_CHANGE		= 1  # 玩家上下线
EVENT_PLAYER_G_STATUS_CHANGE		= 2  # 玩家进入或者退出游戏
EVENT_ROOM_PARAMS_CHANGE			= 3  # 开房模式修改
EVENT_SEAT_INFO_CHANGE				= 4  # 桌子座位信息变化
EVENT_MEMBER_NUM_CHANGE				= 5  # 成员人数发生变化
EVENT_CLUB_NAME_CHANGE				= 6  # 名字修改
EVENT_CLUB_NOTICE_CHANGE			= 7  # 公告修改
EVENT_DEFAULT_ROOM_PARAMS_CHANGE	= 8  # 默认开房模式修改
EVENT_CLUB_ROOM_SWITCH_CHANGE		= 9  # 是否修改开房模式的开关
EVENT_CLUB_CARD_SWITCH_CHANGE		= 10 # 是否显示房卡的开关
EVENT_CLUB_MEMBER_INFO_UPDATE		= 11 # 成员信息更新
EVENT_CLUB_PAY_MODE_SWITCH_CHANGE	= 12 # 是否允许修改支付模式的开关
EVENT_ROOM_STATE_CHANGE				= 13 # 房间状态变化
EVENT_ROOM_ROUND_CHANGE				= 14 # 房间局数变化
EVENT_CLUB_APPLY_HINT				= 15 # 有无申请成员变化
EVENT_CLUB_LOCK_SWITCH_CHANGE		= 16 # 是否锁定房间的开关
EVENT_CLUB_MEMBER_CHANGE			= 17 # 成员信息变化 增改查
EVENT_CLUB_MEMBER_REMOVE			= 18 # 成员删除
EVENT_CLUB_DISMISS_ROOM_PLAN_CHANGE	= 19 # 解散房间方案的变化
EVENT_CLUB_ADMIN_CHANGE				= 20 # 管理員信息变化 增改查
EVENT_CLUB_ADMIN_FIRE				= 21 # 管理員解雇
EVENT_CLUB_BLACK_CHANGE				= 22 # 新增黑名单
EVENT_CLUB_BLACK_KICK				= 23 # 踢除黑名单


class EventMgr(object):

	def __init__(self):
		self.subscribers = dict()

	def push_event(self, event_id, event_args=None):
		_list = self.subscribers.get(event_id, [])
		for x in _list:
			x(event_args)

	def register_event(self, event_id, subscriber):
		_list = self.subscribers.get(event_id, [])

		if subscriber not in _list:
			_list.append(subscriber)

		self.subscribers[event_id] = _list

	def unregister_event(self, event_id, subscriber):
		_list = self.subscribers.get(event_id, [])

		if subscriber in _list:
			_list.remove(subscriber)

	def destroy(self):
		self.subscribers.clear()
