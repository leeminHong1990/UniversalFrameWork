# -*- coding: utf-8 -*-
import KBEngine
from KBEDebug import *
from interfaces.GameObject import GameObject
from clubmembers.ClubTable import TableManager
from clubmembers.iDAU import iDAU
from clubmembers.iClubStatistics import iClubStatistics
from roomParamsHelper import roomParamsChecker, roomParamsGetter, updateRoomParamsGetter
import const
import x42
from Functor import Functor
import utility
import inspect
import dbi
import copy
import Events
import json
from operator import itemgetter
import time
import table_white

OP2NAME = {
	const.CLUB_OP_AGREE_IN				: 'agreeInClub',
	const.CLUB_OP_REFUSE_IN				: 'refuseInClub',
	const.CLUB_OP_INVITE_IN				: 'inviteInClub',
	const.CLUB_OP_KICK_OUT				: 'kickOutClub',
	const.CLUB_OP_APPLY_IN				: 'applyInClub',
	const.CLUB_OP_APPLY_OUT				: 'applyOutClub',
	const.CLUB_OP_SET_NAME				: 'setClubName',
	const.CLUB_OP_SET_NOTICE			: 'setClubNotice',
	const.CLUB_OP_GET_MEMBERS			: 'getClubMembers',
	const.CLUB_OP_GET_MEMBERS2			: 'getPageableClubMembers',
	const.CLUB_OP_GET_APPLICANTS		: 'getClubApplicants',
	const.CLUB_OP_SIT_DOWN				: 'sitDown',
	const.CLUB_OP_GET_RECORDS			: 'getClubRecords',
	const.CLUB_OP_GET_FILTER_RECORDS	: 'getClubRecordsByFilter',
	const.CLUB_OP_SET_ROOM_SWITCH		: 'setClubRoomSwitch',
	const.CLUB_OP_SET_CARD_SWITCH		: 'setClubCardSwitch',
	const.CLUB_OP_SET_LOCK_SWITCH		: 'setClubLockSwitch',
	const.CLUB_OP_SET_MEMBER_NOTES		: 'setMemberNotes',
	const.CLUB_OP_GET_TABLE_DETAIL		: 'getTableDetailInfo',
	const.CLUB_OP_SET_ROOM_PARAMS		: 'setTableRoomParams',
	const.CLUB_OP_SET_DEFAULT_ROOM		: 'setDefaultRoomParams',
	const.CLUB_OP_SET_PAY_MODE_SWITCH	: 'setClubPayModeSwitch',
	const.CLUB_OP_DISMISS_ROOM			: 'dismissClubRoom',
	const.CLUB_OP_INVITE_MEMBER_ROOM	: 'inviteMemberRoom',
	const.CLUB_OP_SET_DISMISS_ROOM_PLAN	: 'setClubRoomDismissRoomPlan',
	const.CLUB_OP_GET_STATISTICS		: 'getPageClubStatistics',
	const.CLUB_OP_GET_ADMINS			: 'getClubAdmins',
	const.CLUB_OP_SET_ADMIN				: 'setClubAdmin',
	const.CLUB_OP_FIRE_ADMIN			: 'fireClubAdmin',
	const.CLUB_OP_GET_PAGE_BLACKS		: 'getPageClubBlacks',
	const.CLUB_OP_SET_BLACK				: 'setClubBlack',
	const.CLUB_OP_KICK_BLACK			: 'kickOutBlack',
}

OWNER_ONLY_OP = [const.CLUB_OP_SET_LOCK_SWITCH, const.CLUB_OP_SET_MEMBER_NOTES, const.CLUB_OP_SET_ADMIN,
				 const.CLUB_OP_FIRE_ADMIN]
ADMIN_ONLY_OP = []
POWER_COMMON_OP = [const.CLUB_OP_AGREE_IN, const.CLUB_OP_REFUSE_IN, const.CLUB_OP_INVITE_IN, const.CLUB_OP_KICK_OUT,
				 const.CLUB_OP_SET_NAME, const.CLUB_OP_GET_APPLICANTS, const.CLUB_OP_SET_NOTICE,
				 const.CLUB_OP_SET_ROOM_SWITCH, const.CLUB_OP_SET_CARD_SWITCH, const.CLUB_OP_SET_DEFAULT_ROOM,
				 const.CLUB_OP_GET_STATISTICS, const.CLUB_OP_SET_PAY_MODE_SWITCH, const.CLUB_OP_DISMISS_ROOM,
				 const.CLUB_OP_GET_PAGE_BLACKS, const.CLUB_OP_SET_BLACK, const.CLUB_OP_KICK_BLACK,
				 const.CLUB_OP_GET_ADMINS]

MEMBER_ONLY_OP = [const.CLUB_OP_APPLY_OUT]
COMMON_OP = [const.CLUB_OP_GET_MEMBERS, const.CLUB_OP_GET_MEMBERS2, const.CLUB_OP_SIT_DOWN, const.CLUB_OP_GET_TABLE_DETAIL,
			 const.CLUB_OP_GET_RECORDS, const.CLUB_OP_SET_ROOM_PARAMS, const.CLUB_OP_GET_FILTER_RECORDS,
			 const.CLUB_OP_INVITE_MEMBER_ROOM]
NON_MEMBER_OP = [const.CLUB_OP_APPLY_IN]


class Club(KBEngine.Entity, GameObject, iDAU, iClubStatistics):

	def __init__(self):
		KBEngine.Entity.__init__(self)
		GameObject.__init__(self)
		iDAU.__init__(self)
		iClubStatistics.__init__(self)

		self.gameType, self.roomParams = updateRoomParamsGetter(self.gameType, dict(self.roomParams))

		self._processDeskRoomParams()

		# 先初始化消息管理器
		self.event_mgr = Events.EventMgr()
		self.table_mgr = TableManager(self)
		# 初始化好之后注册消息
		self.registerEvent()
		# 维护成员在线状态
		self.member_status = dict()
		self.initMembersStatus()
		self.initPower()

	def initMembersStatus(self):
		for key in self.members.keys():
			mem = self.members[key]
			self.member_status[key] = {'online': False, 'free': True, 'login_time': mem['login_time'], 'logout_time': mem['logout_time']}

	def initPower(self):
		if self.owner['userId'] in self.members:
			self.members[self.owner['userId']]['power'] = const.CLUB_POWER_OWNER

	def _processDeskRoomParams(self):
		tmp = copy.deepcopy(self.tableRoomParams)
		self.tableRoomParams.clear()
		for idx, p in tmp.items():
			params = p['params']
			game_type = p['game_type']
			game_type, params = updateRoomParamsGetter(game_type, dict(params))
			self.tableRoomParams[idx] = {
				'game_type': game_type,
				'params': params
			}

	def registerEvent(self):
		self.event_mgr.destroy()
		self.event_mgr.register_event(Events.EVENT_PLAYER_O_STATUS_CHANGE, self.onMemberOnlineStatusChange)
		self.event_mgr.register_event(Events.EVENT_PLAYER_G_STATUS_CHANGE, self.onMemberGameStatusChange)
		self.event_mgr.register_event(Events.EVENT_ROOM_PARAMS_CHANGE, self.onRoomParamsChange)
		self.event_mgr.register_event(Events.EVENT_SEAT_INFO_CHANGE, self.onTableSeatInfoChange)
		self.event_mgr.register_event(Events.EVENT_MEMBER_NUM_CHANGE, self.onMemberNumChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_NAME_CHANGE, self.onClubNameChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_NOTICE_CHANGE, self.onClubNoticeChange)
		self.event_mgr.register_event(Events.EVENT_DEFAULT_ROOM_PARAMS_CHANGE, self.onClubDefaultRoomParamsChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_ROOM_SWITCH_CHANGE, self.onClubRoomSwitchChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_CARD_SWITCH_CHANGE, self.onClubCardSwitchChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_MEMBER_INFO_UPDATE, self.onClubMemberInfoUpdate)
		self.event_mgr.register_event(Events.EVENT_CLUB_PAY_MODE_SWITCH_CHANGE, self.onClubPayModeSwitchChange)
		self.event_mgr.register_event(Events.EVENT_ROOM_STATE_CHANGE, self.onTableRoomStateChange)
		self.event_mgr.register_event(Events.EVENT_ROOM_ROUND_CHANGE, self.onTableRoomRoundChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_APPLY_HINT, self.onClubApplyHintChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_LOCK_SWITCH_CHANGE, self.onClubLockSwitchChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_MEMBER_CHANGE, self.onClubMemberChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_MEMBER_REMOVE, self.onClubMemberRemove)
		self.event_mgr.register_event(Events.EVENT_CLUB_DISMISS_ROOM_PLAN_CHANGE, self.onClubDismissRoomPlanChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_ADMIN_CHANGE, self.onClubAdminChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_ADMIN_FIRE, self.onClubAdminFire)
		self.event_mgr.register_event(Events.EVENT_CLUB_BLACK_CHANGE, self.onClubBlackChange)
		self.event_mgr.register_event(Events.EVENT_CLUB_BLACK_KICK, self.onClubBlackKick)

	def doOperation(self, avatar_mb, op, args):
		""" 各种操作的dispatcher, 集中检查权限 """
		INFO_MSG("Club doOperation op_uid = {}, op = {}, args = {}".format(avatar_mb.userId, op, args))
		uid = avatar_mb.userId

		# 检查操作是否存在
		if op not in OP2NAME:
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_WRONG_ARGS)
			return

		# 检查操作权限
		if op not in NON_MEMBER_OP and not self.isMember(uid):
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_PERMISSION_DENY)
			return
		if op in OWNER_ONLY_OP and not (self.isOwner(uid) or self.isWhite(uid)):
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_PERMISSION_DENY)
			return
		if op in ADMIN_ONLY_OP and not self.isAdmin(uid):
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_PERMISSION_DENY)
			return
		if op in POWER_COMMON_OP and not self.isPower(uid):
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_PERMISSION_DENY)
			return
		if op in MEMBER_ONLY_OP and op == const.CLUB_OP_APPLY_OUT and self.isOwner(uid):
			avatar_mb.showTip("无法退出, 请解散亲友圈")
			return

		f = getattr(self, OP2NAME[op])
		if callable(f):
			sig = inspect.signature(f)
			if len(sig.parameters.keys()) == len(args) + 1:
				f(avatar_mb, *args)
			else:
				ERROR_MSG("Club doOperation Arguments Error:{}".format((avatar_mb.userId, op, args)))
		else:
			ERROR_MSG("Club doOperation NonFunction Error:{}".format((avatar_mb.userId, op, args)))

		##################################################################################################################
		# ---------------------------------------------- CLUB OPERATION --------------------------------------------------
		##################################################################################################################
	def applyInClub(self, avatar_mb):
		uid = avatar_mb.userId
		if not avatar_mb.canJoinClub():
			avatar_mb.showTip("达到亲友圈数量上限, 无法加入更多亲友圈")
			return
		if uid in self.members:
			avatar_mb.showTip("您已经在该亲友圈中, 无需重复加入")
			return
		if self.isApplicant(uid) and avatar_mb.userId not in table_white.data:
			avatar_mb.showTip("请等待审核, 无需重复申请")
			return
		if len(self.members) >= const.CLUB_MEMBER_LIMIT:
			avatar_mb.showTip("亲友圈成员已满, 请加入别的亲友圈")
			return

		app_info = {
			'userId': uid,
			'uuid': avatar_mb.uuid,
			'sex':avatar_mb.sex,
			'nickname': avatar_mb.name,
			'head_icon': avatar_mb.head_icon,
			'login_time': avatar_mb.login_time,
			'logout_time': avatar_mb.logout_time,
			'ts': utility.get_cur_timestamp(),
		}
		if avatar_mb.userId in table_white.data:
			# 将玩家加入亲友圈成员
			mem_info = {
				'userId': uid,
				'uuid': app_info['uuid'],
				'sex': app_info['sex'],
				'nickname': app_info['nickname'],
				'head_icon': app_info['head_icon'],
				'login_time': app_info['login_time'],
				'logout_time': app_info['logout_time'],
				'notes': '',
				'ts': utility.get_cur_timestamp(),
				'power': const.CLUB_POWER_CIVIL
			}

			def add_cb(avatar_mb, result, msg=None):
				msg and avatar_mb.showTip(msg)
			self._addMemberIn(uid, mem_info, Functor(add_cb, avatar_mb))
			return

		self.applicants[uid] = app_info
		# 新增玩家申请
		len(self.applicants) == 1 and self.event_mgr.push_event(Events.EVENT_CLUB_APPLY_HINT)

		avatar_mb.showTip("申请已发送, 请联系亲友圈老板通过审核")

	def applyOutClub(self, avatar_mb):
		uid = avatar_mb.userId
		if self.isOwner(uid):
			avatar_mb.showTip("无法退出, 请解散亲友圈")
			return
		if self.isAdmin(uid):
			self.event_mgr.push_event(Events.EVENT_CLUB_ADMIN_FIRE, self.members.get(uid))
		if uid in self.members:
			del self.members[uid]
			self.member_status.pop(uid, None)
			self.event_mgr.push_event(Events.EVENT_MEMBER_NUM_CHANGE)
		avatar_mb.leaveOneClub(self.clubId, "退出亲友圈成功")

	def agreeInClub(self, avatar_mb, target_uid):
		app_info = self.applicants.get(target_uid)
		if app_info is None:
			app_list = self.getApplicants()
			avatar_mb.gotClubApplicants(app_list)
			return
		if len(self.members) >= const.CLUB_MEMBER_LIMIT:
			avatar_mb.showTip("操作失败, 亲友圈成员已满")
			return

		# 移出申请列表
		del self.applicants[target_uid]
		# 没有玩家申请
		len(self.applicants) == 0 and self.event_mgr.push_event(Events.EVENT_CLUB_APPLY_HINT)

		if target_uid in self.members:
			avatar_mb.showTip("该玩家已经是亲友圈成员")
			avatar_mb.gotClubApplicants(self.getApplicants())
			return

		# 将玩家加入亲友圈成员
		mem_info = {
			'userId': target_uid,
			'uuid': app_info['uuid'],
			'sex': app_info['sex'],
			'nickname': app_info['nickname'],
			'head_icon': app_info['head_icon'],
			'login_time': app_info['login_time'],
			'logout_time': app_info['logout_time'],
			'notes': '',
			'ts': utility.get_cur_timestamp(),
			'power': const.CLUB_POWER_CIVIL
		}

		def add_cb(avatar_mb, result, msg=None):
			if result:
				# avatar_mb.gotClubMembers(self.clubId, self.getMembers())
				data = {
					'op': const.CLUB_MEMBER_OP_ADD,
					'online': self.member_status[target_uid]['online'],
					'free': self.member_status[target_uid]['free']
				}
				data.update(mem_info)
				self.event_mgr.push_event(Events.EVENT_CLUB_MEMBER_CHANGE, data)
				self.event_mgr.push_event(Events.EVENT_MEMBER_NUM_CHANGE)
			else:
				msg and avatar_mb.showTip(msg)
		self._addMemberIn(target_uid, mem_info, Functor(add_cb, avatar_mb))
		avatar_mb.gotClubApplicants(self.getApplicants())

	def refuseInClub(self, avatar_mb, target_uid):
		if target_uid in self.applicants:
			del self.applicants[target_uid]
			# 没有玩家申请
			len(self.applicants) == 0 and self.event_mgr.push_event(Events.EVENT_CLUB_APPLY_HINT)

		avatar_mb.gotClubApplicants(self.getApplicants())

	def kickOutClub(self, avatar_mb, target_uid):
		if target_uid not in self.members:
			avatar_mb.showTip("玩家已经移除亲友圈")
			# avatar_mb.gotClubMembers(self.clubId, self.getMembers())
			return
		if self.isOwner(target_uid):
			avatar_mb.showTip("不能对亲友圈老板进行该操作")
			return
		if avatar_mb.userId == target_uid:
			avatar_mb.showTip("不能对自己进行该操作")
			return
		if self._getPower(avatar_mb.userId) <= self.members.get(target_uid)['power']:
			avatar_mb.showTip("踢出亲友圈权限不足")
			return
		if self.isAdmin(target_uid):
			self.event_mgr.push_event(Events.EVENT_CLUB_ADMIN_FIRE, self.members.get(target_uid))
		self._kickMemberOut(target_uid)
		# avatar_mb.gotClubMembers(self.clubId, self.getMembers())
		self.event_mgr.push_event(Events.EVENT_CLUB_MEMBER_REMOVE, target_uid)
		self.event_mgr.push_event(Events.EVENT_MEMBER_NUM_CHANGE)

	def setClubName(self, avatar_mb, new_name):
		new_name = utility.filter_emoji(new_name)
		new_name = new_name[:const.CLUB_NAME_LENGTH]
		self.name = new_name
		avatar_mb.setClubNameSucceed(self.clubId, new_name)
		self.event_mgr.push_event(Events.EVENT_CLUB_NAME_CHANGE)

	def setClubNotice(self, avatar_mb, new_notice):
		new_notice = utility.filter_emoji(new_notice)
		new_notice = new_notice[:const.CLUB_NOTICE_LENGTH]
		self.notice = new_notice
		avatar_mb.setClubNoticeSucceed(self.clubId, new_notice)
		self.event_mgr.push_event(Events.EVENT_CLUB_NOTICE_CHANGE)

	def setMemberNotes(self, avatar_mb, target_uid, notes):
		mem = self.members.get(target_uid)
		if mem:
			notes = utility.filter_emoji(notes)
			notes = notes[:const.MEMBER_NOTES_LENGTH]
			mem['notes'] = notes
			# avatar_mb.gotClubMembers(self.clubId, self.getMembers())
			data = {
				'ts': utility.get_cur_timestamp(),
				'op': const.CLUB_MEMBER_OP_UPDATE,
				'online': self.member_status[target_uid]['online'],
				'free': self.member_status[target_uid]['free']
			}
			data.update(mem)
			self.event_mgr.push_event(Events.EVENT_CLUB_MEMBER_CHANGE, data)
		else:
			avatar_mb.showTip("成员不存在")
		# avatar_mb.gotClubMembers(self.clubId, self.getMembers())

	def setClubAdmin(self, avatar_mb, target_uid):
		if target_uid not in self.members:
			avatar_mb.showTip("成员不存在")
			return
		if self.isOwner(target_uid):
			avatar_mb.showTip("不能对亲友圈老板进行该操作")
			return
		if self.isAdmin(target_uid):
			avatar_mb.showTip("不能重复操作")
			return
		if len(self.getAdmins()) >= const.CLUB_ADMIN_LIMIT:
			avatar_mb.showTip("管理员数量已经达到上限")
			return
		data = self.members.get(target_uid)
		data['power'] = const.CLUB_POWER_ADMIN
		self.event_mgr.push_event(Events.EVENT_CLUB_ADMIN_CHANGE, data)

	def fireClubAdmin(self, avatar_mb, target_uid):
		if target_uid not in self.members:
			avatar_mb.showTip("成员不存在")
			return
		if not self.isAdmin(target_uid):
			avatar_mb.showTip("玩家不是管理员")
			return
		# 此处必须发送给被移除管理员的玩家 先通知后移除
		data = self.members.get(target_uid)
		fire_data = dict(data)
		fire_data['power'] = const.CLUB_POWER_CIVIL
		self.event_mgr.push_event(Events.EVENT_CLUB_ADMIN_FIRE, fire_data)
		data['power'] = const.CLUB_POWER_CIVIL

	def setClubBlack(self, avatar_mb, target_uid):
		if target_uid in self.blacks:
			avatar_mb.showTip("玩家已经在黑名单中")
			return
		if len(self.blacks) >= const.CLUB_BLACKS_LIMIT:
			avatar_mb.showTip("黑名单数量已满,请删除后再加")
			return
		def query_cb(uinfo):
			if uinfo is None:
				avatar_mb.showTip("查无此人")
				return
			# 将玩家加入亲友圈成员
			black_info = {
				'userId': target_uid,
				'uuid': uinfo['uuid'],
				'sex': uinfo['sex'],
				'nickname': uinfo['name'],
				'head_icon': uinfo['head_icon'],
				'notes': '',
				'ts': utility.get_cur_timestamp(),
			}

			def add_cb(avatar_mb, result, msg=None):
				if result:
					avatar_mb.showTip("设置黑名单成功")
					self.event_mgr.push_event(Events.EVENT_CLUB_BLACK_CHANGE, black_info)
				else:
					msg and avatar_mb.showTip(msg)
			self._addBlackIn(target_uid, black_info, Functor(add_cb, avatar_mb))
		x42.GW.getUserInfoByUID(target_uid, query_cb)

	def kickOutBlack(self, avatar_mb, target_uid):
		if target_uid not in self.blacks:
			avatar_mb.showTip("玩家不在黑名单中")
			return
		self.event_mgr.push_event(Events.EVENT_CLUB_BLACK_KICK, self.blacks.get(target_uid))
		self._kickBlackOut(target_uid)

	def inviteInClub(self, avatar_mb, target_uid):
		if target_uid in self.members:
			avatar_mb.showTip("该玩家已经是亲友圈成员")
			return

		def query_cb(uinfo):
			if uinfo is None:
				avatar_mb.showTip("查无此人")
				return
			# 将玩家加入亲友圈成员
			mem_info = {
				'userId': target_uid,
				'uuid': uinfo['uuid'],
				'sex': uinfo['sex'],
				'nickname': uinfo['name'],
				'head_icon': uinfo['head_icon'],
				'login_time': uinfo['login_time'],
				'logout_time': uinfo['logout_time'],
				'notes': '',
				'ts': utility.get_cur_timestamp(),
				'power': const.CLUB_POWER_CIVIL
			}

			def add_cb(avatar_mb, result, msg=None):
				if result:
					avatar_mb.showTip("邀请成功")
					# avatar_mb.gotClubMembers(self.clubId, self.getMembers())
					data = {
						'op': const.CLUB_MEMBER_OP_ADD,
						'online': self.member_status[target_uid]['online'],
						'free': self.member_status[target_uid]['free']
					}
					data.update(mem_info)
					self.event_mgr.push_event(Events.EVENT_CLUB_MEMBER_CHANGE, data)
					self.event_mgr.push_event(Events.EVENT_MEMBER_NUM_CHANGE)
					# 移出申请列表
					self.applicants.pop(target_uid, None)
					# 没有玩家申请
					len(self.applicants) == 0 and self.event_mgr.push_event(Events.EVENT_CLUB_APPLY_HINT)
				else:
					msg and avatar_mb.showTip(msg)

			self._addMemberIn(target_uid, mem_info, Functor(add_cb, avatar_mb))

		x42.GW.getUserInfoByUID(target_uid, query_cb)

	def _getPower(self, uid):
		if self.isOwner(uid):
			power = const.CLUB_POWER_OWNER
		elif self.isWhite(uid):
			power = const.CLUB_POWER_WHITE
		elif self.isAdmin(uid):
			power = const.CLUB_POWER_ADMIN
		else:
			power = const.CLUB_POWER_CIVIL
		return power

	def getClubMembers(self, avatar_mb):
		if self.isPower(avatar_mb.userId):
			mem_list = self.getMembers()
		else:
			mem_list = self.getMembersWithoutNotes()
		avatar_mb.gotClubMembers(self.clubId, mem_list)

	def getPageableClubMembers(self, avatar_mb, current_page, size, filter=None, order=None):
		if self.isPower(avatar_mb.userId):
			mem_list = self.getMembers(current_page, size, filter, order)
		else:
			mem_list = self.getMembersWithoutNotes(current_page, size, filter, order)
		avatar_mb.gotPageClubMembers(self.clubId, mem_list, current_page, size, len(self.members))

	def getPageClubBlacks(self, avatar_mb, current_page, size, filter=None, order=None):
		blacks_list = list(self.blacks.values())
		blacks_list = self._orderBlacks(copy.deepcopy(blacks_list), order, current_page, size)
		avatar_mb.gotPageClubBlacks(self.clubId, blacks_list, current_page, size, len(self.blacks))

	def getClubApplicants(self, avatar_mb):
		app_list = self.getApplicants()
		avatar_mb.gotClubApplicants(app_list)

	def getClubAdmins(self, avatar_mb):
		admins = self.getAdmins()
		avatar_mb.gotClubAdmins(self.clubId, admins)

	def sitDown(self, avatar_mb, table_idx):
		if self.isLocked():
			avatar_mb.showTip("亲友圈已被关闭无法开房")
			return
		if self.isBlack(avatar_mb.userId):
			avatar_mb.showTip("您已在黑名单中")
			return
		self.table_mgr.takeASeat(avatar_mb, table_idx)

	def getTableDetailInfo(self, avatar_mb, table_idx):
		table = self.table_mgr.getTable(table_idx)
		if table is None:
			avatar_mb.showTip("桌子编号错误")
			return

		detail = table.getDetailInfo()
		if detail:
			avatar_mb.gotTableDetailInfo(table_idx, detail)

	def getClubRecords(self, avatar_mb):
		rec = list(self.records)
		avatar_mb.gotClubRecords(self.clubId, rec)

	def getClubRecordsByFilter(self, avatar_mb, page, page_size, filters):
		rec = self._club_record_filter(filters)
		total = len(rec)
		rec = sorted(rec, key=lambda x: x['time'], reverse=True)
		if page * page_size >= total:
			# 如果存在参数错误，默认返回第一页数据
			# 可能发生在服务端处理历史数据时客户端的参数依然为上一次数据时
			rec = rec[0: page_size]
			avatar_mb.gotPageClubRecords(self.clubId, rec, page, page_size, total, filters)
			return
		rec = rec[page * page_size: min(page * page_size + page_size, total)]
		avatar_mb.gotPageClubRecords(self.clubId, rec, page, page_size, total, filters)

	def _club_record_filter(self, filters):
		rec = []
		for r in self.records:
			flag = True
			if 'userId' in filters:
				user_id = filters['userId']
				flag = False
				for info in r['player_info_list']:
					if info['userId'] == user_id:
						flag = True
			if 'beginTime' in filters and 'endTime' in filters:
				begin = filters['beginTime']
				end = filters['endTime']
				if begin > r['time'] or r['time'] > end:
					flag = False
			flag and rec.append(r)
		return rec

	def setClubRoomSwitch(self, avatar_mb, state):
		""" 是否允许成员修改桌子默认玩法 """
		if state == 0:
			self.roomSwitch = 0
		else:
			self.roomSwitch = 1
		self.event_mgr.push_event(Events.EVENT_CLUB_ROOM_SWITCH_CHANGE)

	def setClubCardSwitch(self, avatar_mb, state):
		""" 是否显示亲友圈房卡信息 """
		if state == 0:
			self.cardSwitch = 0
		else:
			self.cardSwitch = 1
		# 房卡只能茶楼老板看到, 并不显示, 所以这里就不推送了.
		# self.event_mgr.push_event(Events.EVENT_CLUB_CARD_SWITCH_CHANGE)

	def setClubLockSwitch(self, avatar_mb, state):
		""" 是否允许成员玩游戏 """
		if state == 0:
			self.lockSwitch = 0
		else:
			self.lockSwitch = 1
		self.event_mgr.push_event(Events.EVENT_CLUB_LOCK_SWITCH_CHANGE)

	def setClubRoomDismissRoomPlan(self, avatar_mb, dismissRoomList):
		""" 设置房间申请解散方案 """
		self.dismissRoomList = dismissRoomList
		self.event_mgr.push_event(Events.EVENT_CLUB_DISMISS_ROOM_PLAN_CHANGE)

	def setClubPayModeSwitch(self, avatar_mb, state):
		""" 是否允许成员修改支付方式 """
		if state == 0:
			self.payModeSwitch = 0
		else:
			self.payModeSwitch = 1
		self.event_mgr.push_event(Events.EVENT_CLUB_PAY_MODE_SWITCH_CHANGE)

	def setTableRoomParams(self, avatar_mb, table_idx, game_type, create_dict):
		if self.roomSwitch == 0 and not self.isPower(avatar_mb.userId):
			avatar_mb.clubOperationFailed(const.CLUB_OP_ERR_PERMISSION_DENY)
			return
		if self.isBlack(avatar_mb.userId):
			avatar_mb.showTip("您已在黑名单中")
			return
		if create_dict['pay_mode'] != self.roomParams['pay_mode'] and self.payModeSwitch == 0:
			create_dict['pay_mode'] = self.roomParams['pay_mode']
			avatar_mb.showTip("不允许修改支付方式, 以默认支付方式开房")
		self.table_mgr.changeTableRoomParams(avatar_mb, table_idx, game_type, create_dict)

	def setDefaultRoomParams(self, avatar_mb, game_type, create_dict):
		create_dict['room_type'] = const.CLUB_ROOM
		if not roomParamsChecker(game_type, create_dict):
			avatar_mb.showTip("房间参数错误")
			return

		room_params = roomParamsGetter(game_type, create_dict)
		room_params['owner_uid'] = self.owner['userId']
		room_params['club_id'] = self.clubId
		self.gameType = game_type
		self.roomParams = room_params
		self.table_mgr.changeDefaultRoomParams(game_type, room_params)
		self.tableRoomParams.clear()
		event_args = {
			'game_type': game_type,
			'room_params': json.dumps(room_params),
		}
		self.event_mgr.push_event(Events.EVENT_DEFAULT_ROOM_PARAMS_CHANGE, event_args)

	def dismissClubRoom(self, avatar_mb, table_idx):
		self.table_mgr.dismissTableRoom(avatar_mb, table_idx)

	def inviteMemberRoom(self, avatar_mb, room_id, inviter_info, gameType, roomParams, userId_list):
		if self.isLocked():
			avatar_mb.showTip("亲友圈已被关闭无法邀请玩家")
			return
		if len(userId_list) <= 0:
			avatar_mb.showTip("邀请列表不能为空")
			return
		for uid in userId_list:
			if uid not in self.members.keys():
				avatar_mb.showTip("玩家ID:{}不在亲友圈中".format(uid))
				break
			if not self.member_status[uid]['online']:
				avatar_mb.showTip("玩家{}不在线".format(self.members[uid]["nickname"]))
				break
			if not self.member_status[uid]['free']:
				avatar_mb.showTip("玩家{}正在游戏中".format(self.members[uid]["nickname"]))
				break
			if self.isBlack(uid):
				avatar_mb.showTip("邀请玩家ID:{}在黑名单中".format(uid))
				break
		else:
			invite_msg = {
				"room_id"		: room_id,
				"inviter_info" 	: inviter_info,
				"club_id"		: self.clubId,
				"club_name"		: self.name,
				"roomParams"	: roomParams,
				"gameType"		: gameType
			}
			x42.GW.inviteClubMemberRoom(invite_msg, userId_list)
			avatar_mb.showTip("已成功邀请玩家")

	def addClubTable(self, value=1):
		""" 加桌子 """
		if self.tableNum >= const.CLUB_TABLE_LIMIT:
			return

		self.tableNum += value
		self.table_mgr.addNewTable()
		for uid in self.members.keys():
			avt = x42.GW.avatars.get(uid)
			if avt and avt.hasClient:
				avt.client.gotClubDetailInfo(self.getDetailInfo(uid))
				avt.pushClubSeatInfo(self.clubId)

			##################################################################################################################
			# ---------------------------------------------- CLUB OPERATION --------------------------------------------------
			##################################################################################################################

	def _kickALLMembersOut(self):
		""" 仅仅在解散的时候调用 """
		for uid in self.members:
			avt = x42.GW.avatars.get(uid)
			if avt and not avt.isDestroyed:
				avt.leaveOneClub(self.clubId)

		# 玩家上线的时候会检查处理, 其实这里不操作DB也没问题
		def delete_cb(result, error):
			if error:
				ERROR_MSG("kickOutClub delete_cb Error = {}".format(error))

		dbi.deleteClub(self.clubId, delete_cb)

	def _kickMemberOut(self, target_uid):
		""" 这里写的通用逻辑, 不要直接使用此接口, 因为没有检查权限 """
		# 移出亲友圈成员列表
		self.members.pop(target_uid, None)
		self.member_status.pop(target_uid, None)
		# 处理玩家的亲友圈列表
		avt = x42.GW.avatars.get(target_uid)
		if avt and not avt.isDestroyed:
			avt.leaveOneClub(self.clubId)
		else:
			# 玩家上线的时候会检查处理, 其实这里不操作DB也没问题
			def kick_cb(club_id, uid, result, error):
				if not result:
					ERROR_MSG("_kickMemberOut kick_cb clubId:{}, userId: Error = {}".format(club_id, uid, error))

			dbi.kickOfflineMemberOutClub(self.clubId, target_uid, Functor(kick_cb, self.clubId, target_uid))

	def _addMemberIn(self, target_uid, mem_info, callback=None):
		""" 这里写的通用逻辑, 不要直接使用此接口, 因为没有检查权限 """
		# 需要检查玩家加入的亲友圈数量
		avt = x42.GW.avatars.get(target_uid)
		if avt and not avt.isDestroyed:
			if avt.canJoinClub():
				# 加入亲友圈成员列表
				self.members[target_uid] = mem_info
				self.member_status[target_uid] = {'online': True, 'free': avt.cell is None, 'login_time': mem_info['login_time'], 'logout_time': mem_info['logout_time']}
				avt.joinOneClub(self.clubId)
				callable(callback) and callback(True)
			else:
				callable(callback) and callback(False, "该玩家亲友圈数量达到上限, 无法再加入本亲友圈")
		else:
			def add_cb(result, error):
				if result:
					# 加入亲友圈成员列表
					self.members[target_uid] = mem_info
					self.member_status[target_uid] = {'online': False, 'free': True, 'login_time': mem_info['login_time'], 'logout_time': mem_info['logout_time']}
					callable(callback) and callback(True)
				else:
					DEBUG_MSG("_addMemberIn add_cb clubId:{}, userId: Error = {}".format(self.clubId, target_uid, error))
					callable(callback) and callback(False, "该玩家亲友圈数量达到上限, 无法再加入本亲友圈")

			dbi.addOfflineMemberInClub(self.clubId, target_uid, add_cb)


	def _addBlackIn(self, target_uid, black_Info, callback=None):
		self.blacks[target_uid] = black_Info
		callable(callback) and callback(True)

	def _kickBlackOut(self, target_uid):
		self.blacks.pop(target_uid, None)

	def dismiss(self):
		""" 解散亲友圈, 此条目将从数据库中删除 """
		try:
			x42.GW.clubDismissed(self.clubId)
			self._kickALLMembersOut()
		except:
			import traceback
			ERROR_MSG(traceback.format_exc())
		finally:
			self.destroy(True)

	def saveTableResult(self, result):
		self.records.append(result)

	def processTableResult(self):
		now = utility.get_cur_timestamp()
		keep = []
		for r in self.records:
			ts = r['time']
			if now - ts < const.CLUB_TABLE_RESULT_TTL:
				keep.append(r)
		self.records = keep

	def isPower(self, user_id):
		return self.isOwner(user_id) or self.isAdmin(user_id) or self.isWhite(user_id)

	def isOwner(self, user_id):
		return self.owner['userId'] == user_id

	def isAdmin(self, user_id):
		return self.isMember(user_id) and self.members[user_id]['power'] == const.CLUB_POWER_ADMIN

	def isWhite(self, user_id):
		return self.isMember(user_id) and user_id in table_white.data

	def isMember(self, user_id):
		return user_id in self.members

	def isBlack(self, user_id):
		return user_id in self.blacks

	def isLocked(self):
		return self.lockSwitch

	def isApplicant(self, user_id):
		return user_id in self.applicants

	def findTableRoomParams(self, desk_idx):
		if desk_idx not in self.tableRoomParams:
			return None, None
		p = self.tableRoomParams[desk_idx]
		return p['game_type'], dict(p['params'])

	def _orderMembers(self, mem_list, order, page=0, size=None):
		if order is not None:
			mem_list = sorted(mem_list, key=itemgetter('online', 'free', 'login_time'), reverse=True)
		else:
			mem_list = sorted(mem_list, key=itemgetter('login_time'), reverse=True)

		if size is not None:
			total = len(mem_list)
			mem_list = mem_list[page * size: min(page * size + size, total)]

		return mem_list

	def _orderBlacks(self, blacks_list, order, page=0, size=None):
		if order is not None:
			blacks_list = sorted(blacks_list, key=itemgetter('ts', 'userId'), reverse=True)
		else:
			blacks_list = sorted(blacks_list, key=itemgetter('ts'), reverse=True)
		if size is not None:
			blacks_list = blacks_list[page*size: min(page*size+size, len(blacks_list))]
		return blacks_list

	def getMembers(self, page=0, size=None, filter=None, order=None):
		mem_list = list(self.members.values())
		mem_list = copy.deepcopy(mem_list)
		for mem in mem_list:
			uid = mem['userId']
			mem['online'] = self.member_status[uid]['online']
			mem['free'] = self.member_status[uid]['free']
			mem['login_time'] = self.member_status[uid]['login_time']
			mem['logout_time'] = self.member_status[uid]['logout_time']

		mem_list = self._orderMembers(mem_list, order, page, size)
		return mem_list

	def getApplicants(self):
		app_list = copy.deepcopy(list(self.applicants.values()))
		app_list = sorted(app_list, key=lambda x: x['ts'])
		return app_list

	def getAdmins(self):
		members = copy.deepcopy(list(self.members.values()))
		admins = [mem for mem in members if mem['power'] == const.CLUB_POWER_ADMIN]
		for adm in admins:
			uid = adm['userId']
			adm['online'] = self.member_status[uid]['online']
			adm['free'] = self.member_status[uid]['free']
			adm['login_time'] = self.member_status[uid]['login_time']
			adm['logout_time'] = self.member_status[uid]['logout_time']
		return sorted(admins, key=lambda x: x['ts'])

	def getMembersWithoutNotes(self, page=0, size=None, filter=None, order=None):
		mem_list = list(self.members.values())
		mem_list = copy.deepcopy(mem_list)
		for mem in mem_list:
			uid = mem['userId']
			mem['notes'] = ''
			mem['online'] = self.member_status[uid]['online']
			mem['free'] = self.member_status[uid]['free']
			mem['login_time'] = self.member_status[uid]['login_time']
			mem['logout_time'] = self.member_status[uid]['logout_time']

		mem_list = self._orderMembers(mem_list, order, page, size)
		return mem_list

	def getOnlineMemberNum(self):
		num = 0
		for key in self.members.keys():
			if key in self.member_status and self.member_status[key].get('online', False):
				num += 1
		return num

	def getDetailInfo(self, uid):
		self.updateDailyData()
		if not self.dismissRoomList:
			# 同意人数和秒数
			self.dismissRoomList = [4, 300]
		return {
			'club_id': self.clubId,
			'club_name': self.name,
			'club_notice': self.notice,
			'member_num': len(self.members),
			'online_num': self.getOnlineMemberNum(),
			'apply_hint': 1 if len(self.applicants) > 0 else 0,
			'r_switch': self.roomSwitch,
			'c_switch': self.cardSwitch,
			'p_switch': self.payModeSwitch,
			'l_switch': self.lockSwitch,
			'owner': dict(self.owner),
			'power': self._getPower(uid),
			'game_type': self.gameType,
			'room_params': json.dumps(self.roomParams),
			'dismissRoomList' : self.dismissRoomList,
			'table_info_list': self.table_mgr.getTableListInfo(False),
		}
	# ------------------------------------------- CLUB EVENTS AND BROADCAST --------------------------------------------

	def onMemberOnlineStatusChange(self, event_args):
		uid = event_args['uid']
		if uid not in self.members:
			return

		online = event_args['online']
		login_time = event_args['login_time']
		logout_time = event_args['logout_time']

		self.members[uid]['login_time'] = login_time
		self.members[uid]['logout_time'] = logout_time

		if uid in self.member_status:
			self.member_status[uid]['online'] = online
			self.member_status[uid]['login_time'] = login_time
			self.member_status[uid]['logout_time'] = logout_time
		else:
			self.member_status[uid] = {'online': online, 'free': True, 'login_time': login_time, 'logout_time': logout_time}
		online_num = self.getOnlineMemberNum()
		data = {
			'userId': uid,
			'online': online,
			'login_time': login_time,
			'logout_time': logout_time,
			'online_num': online_num
		}
		self.broadCastEvent(Events.EVENT_PLAYER_O_STATUS_CHANGE, data)

	def onMemberGameStatusChange(self, event_args):
		uid = event_args['uid']
		if uid not in self.members:
			return

		free = event_args['free']
		login_time = event_args['login_time']
		logout_time = event_args['logout_time']
		if uid in self.member_status:
			self.member_status[uid]['free'] = free
		else:
			self.member_status[uid] = {'online': True, 'free': free, 'login_time': login_time, 'logout_time': logout_time}
		data = {
			'userId': uid,
			'online': self.member_status[uid]['online'],
			'free': free,
			'login_time': login_time,
			'logout_time': logout_time,
		}
		self.broadCastEvent(Events.EVENT_PLAYER_G_STATUS_CHANGE, data)

	def onRoomParamsChange(self, event_args):
		data = {
			'idx': event_args['idx'],
			'game_type': event_args['gameType'],
			'room_params': event_args['roomParams'],
		}
		self.broadCastEvent(Events.EVENT_ROOM_PARAMS_CHANGE, data)

	def onTableSeatInfoChange(self, event_args):
		data = {
			'idx': event_args['idx'],
			'seat_info': event_args['seat'],
			'ts': int(time.time()),
		}
		self.broadCastEvent(Events.EVENT_SEAT_INFO_CHANGE, data)

	def onMemberNumChange(self, event_args):
		data = {
			'member_num': len(self.members),
			'online_num': self.getOnlineMemberNum(),
		}
		self.broadCastEvent(Events.EVENT_MEMBER_NUM_CHANGE, data)

	def onClubNameChange(self, event_args):
		data = self.name
		self.broadCastEvent(Events.EVENT_CLUB_NAME_CHANGE, data)

	def onClubNoticeChange(self, event_args):
		data = self.notice
		self.broadCastEvent(Events.EVENT_CLUB_NOTICE_CHANGE, data)

	def onClubDefaultRoomParamsChange(self, event_args):
		data = {
			'game_type': event_args['game_type'],
			'room_params': event_args['room_params'],
		}
		self.broadCastEvent(Events.EVENT_DEFAULT_ROOM_PARAMS_CHANGE, data)

	def onClubRoomSwitchChange(self, event_args):
		data = self.roomSwitch
		self.broadCastEvent(Events.EVENT_CLUB_ROOM_SWITCH_CHANGE, data)

	def onClubDismissRoomPlanChange(self, event_args):
		data = self.dismissRoomList
		self.broadCastEvent(Events.EVENT_CLUB_DISMISS_ROOM_PLAN_CHANGE, data)

	def onClubCardSwitchChange(self, event_args):
		data = self.cardSwitch
		self.broadCastEvent(Events.EVENT_CLUB_CARD_SWITCH_CHANGE, data)

	def onClubPayModeSwitchChange(self, event_args):
		data = self.payModeSwitch
		self.broadCastEvent(Events.EVENT_CLUB_PAY_MODE_SWITCH_CHANGE, data)

	def onClubLockSwitchChange(self, event_args):
		data = self.lockSwitch
		self.broadCastEvent(Events.EVENT_CLUB_LOCK_SWITCH_CHANGE, data)

	def onClubMemberChange(self, event_args):
		self.broadCastEvent(Events.EVENT_CLUB_MEMBER_CHANGE, event_args)

	def onClubMemberRemove(self, event_args):
		self.broadCastEvent(Events.EVENT_CLUB_MEMBER_REMOVE, event_args)

	def onClubAdminChange(self, event_args):
		self.broadCastPowerEvent(Events.EVENT_CLUB_ADMIN_CHANGE, event_args)

	def onClubAdminFire(self, event_args):
		self.broadCastPowerEvent(Events.EVENT_CLUB_ADMIN_FIRE, event_args)

	def onClubBlackChange(self, event_args):
		self.broadCastPowerEvent(Events.EVENT_CLUB_BLACK_CHANGE, event_args)

	def onClubBlackKick(self, event_args):
		self.broadCastPowerEvent(Events.EVENT_CLUB_BLACK_KICK, event_args)

	def onClubMemberInfoUpdate(self, event_args):
		uid = event_args['userId']
		if uid not in self.members:
			return

		data = {
			'sex': event_args['sex'],
			'nickname': event_args['nickname'],
			'head_icon': event_args['head_icon'],
		}
		self.members[uid].update(data)
		if self.isOwner(uid) and self.owner['isAgent'] != event_args['isAgent']:
			# 仅代理状态发生变化才向客户端推送
			self.owner['isAgent'] = event_args['isAgent']
			data['isAgent'] = event_args['isAgent']
			self.broadCastEvent(Events.EVENT_CLUB_MEMBER_INFO_UPDATE, data)

	def onTableRoomStateChange(self, event_args):
		data = {
			'idx': event_args['idx'],
			'state': event_args['state'],
		}
		self.broadCastEvent(Events.EVENT_ROOM_STATE_CHANGE, data)

	def onTableRoomRoundChange(self, event_args):
		data = {
			'idx':event_args['idx'],
			'current_round': event_args['current_round'],
			'game_round': event_args['game_round']
		}
		self.broadCastEvent(Events.EVENT_ROOM_ROUND_CHANGE, data)

	def onClubApplyHintChange(self, event_args):
		data = 1 if len(self.applicants) > 0 else 0
		self.broadCastPowerEvent(Events.EVENT_CLUB_APPLY_HINT, data)

	def broadCastEvent(self, event_id, data):
		INFO_MSG("###Event### broadCastEvent club[{}] event[{}] data:{}".format(self.clubId, event_id, data))
		for uid in self.members.keys():
			avt = x42.GW.avatars.get(uid)
			if avt and avt.isDestroyed is False:
				avt.pushClubEventToClient(self.clubId, event_id, data)

	def broadCastPowerEvent(self, event_id, data):
		INFO_MSG("###Event### broadCastPowerEvent club[{}] event[{}] data:{}".format(self.clubId, event_id, data))
		for uid in self.members.keys():
			if self.isPower(uid):
				avt = x42.GW.avatars.get(uid)
				if avt and avt.isDestroyed is False:
					avt.pushClubEventToClient(self.clubId, event_id, data)

	def broadCastOwnerEvent(self, event_id, data):
		INFO_MSG("###Event### broadCastOwnerEvent club[{}] event[{}] data:{}".format(self.clubId, event_id, data))
		avt = x42.GW.avatars.get(self.owner['userId'])
		if avt and avt.isDestroyed is False:
			avt.pushClubEventToClient(self.clubId, event_id, data)

	def broadCastWhiteEvent(self, event_id, data):
		INFO_MSG("###Event### broadCastWhiteEvent club[{}] event[{}] data:{}".format(self.clubId, event_id, data))
		for uid in self.members.keys():
			if self.isWhite(uid):
				avt = x42.GW.avatars.get(uid)
				if avt and avt.isDestroyed is False:
					avt.pushClubEventToClient(self.clubId, event_id, data)

	def broadCastAdminEvent(self, event_id, data):
		INFO_MSG("###Event### broadCastAdminEvent club[{}] event[{}] data:{}".format(self.clubId, event_id, data))
		for uid in self.members.keys():
			if self.isAdmin(uid):
				avt = x42.GW.avatars.get(uid)
				if avt and avt.isDestroyed is False:
					avt.pushClubEventToClient(self.clubId, event_id, data)