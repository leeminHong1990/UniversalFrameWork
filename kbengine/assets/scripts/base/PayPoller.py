# -*- coding: utf-8 -*-
import KBEngine
import socket
import json
import const
import switch
from utility import get_md5
from KBEDebug import *


class PayPoller:
	"""
	演示：
	可以向kbengine注册一个socket，由引擎层的网络模块处理异步通知收发。
	用法:
	from Poller import Poller
	poller = Poller()

	开启(可在onBaseappReady执行)
	poller.start("localhost", 12345)

	停止
	poller.stop()
	"""

	def __init__(self):
		self._socket = None
		self._clients = {}

	def start(self, addr, port):
		"""
		virtual method.
		"""
		self._socket = socket.socket()
		self._socket.bind((addr, port))
		self._socket.listen(10)

		KBEngine.registerReadFileDescriptor(self._socket.fileno(), self.onRecv)

	# KBEngine.registerWriteFileDescriptor(self._socket.fileno(), self.onWrite)

	def stop(self):
		if self._socket:
			KBEngine.deregisterReadFileDescriptor(self._socket.fileno())
			self._socket.close()
			self._socket = None

	def onWrite(self, fileno):
		pass

	def onRecv(self, fileno):
		if self._socket.fileno() == fileno:
			sock, addr = self._socket.accept()
			self._clients[sock.fileno()] = (sock, addr)
			KBEngine.registerReadFileDescriptor(sock.fileno(), self.onRecv)
			DEBUG_MSG("Poller::onRecv: new channel[%s/%i]" % (addr, sock.fileno()))
		else:
			sock, addr = self._clients.get(fileno, None)
			if sock is None:
				return
			if addr[0] not in ('localhost', '127.0.0.1'):
				return

			data = sock.recv(2048)
			DEBUG_MSG("Poller::onRecv: %s/%i get data, size=%i" % (addr, sock.fileno(), len(data)))
			DEBUG_MSG("Poller::onRecv: data = {}".format(data))
			try:
				data = data.decode()
				data = str(data).split('\r\n')
				content = json.loads(data[-1])
				self.processData(content)
			except:
				import traceback
				ERROR_MSG(traceback.format_exc())
			finally:
				KBEngine.deregisterReadFileDescriptor(sock.fileno())
				sock.close()
				del self._clients[fileno]

	def processData(self, data):
		"""
		处理接收数据
		"""
		DEBUG_MSG("Poller processData: {}".format(data))
		res, msg = self.verifyData(data)
		if not res:
			DEBUG_MSG("Poller verify data failed. msg: %s" % msg)
			return

		op_code = data['op_code']
		op_args = data['op_args']
		err_msg = None
		if op_code == const.INTERFACE_OP_ADD_TABLE:
			if len(op_args) != 2:
				err_msg = "Error interface op_args."
			else:
				club_id, num = op_args[0], op_args[1]
				KBEngine.globalData["ClubStub"].addTableForClub(club_id, num)
		elif op_code == const.INTERFACE_OP_CREATE_CLUB:
			if len(op_args) != 2:
				err_msg = "Error interface op_args."
			else:
				user_id, club_name = op_args[0], op_args[1]
				KBEngine.globalData["ClubStub"].createClubFromServer(user_id, club_name)
		else:
			err_msg = "No this operation."
		if err_msg:
			ERROR_MSG(err_msg + " [op_code: {}, op_args: {})".format(op_code, op_args))

	def verifyData(self, data):
		fix_keys = ['op_code', 'op_args', 'op_desc', 'sign']
		for key in fix_keys:
			if key not in data:
				return False, 'miss necessary key %s' % key

		sign = data['sign']
		to_sign = '_'.join(
			[str(data['op_code']), json.dumps(data['op_args']), str(data['op_desc']), switch.PHP_SERVER_SECRET])
		v_sign = get_md5(to_sign)
		if sign != v_sign:
			return False, 'sign not match %s, %s' % (sign, v_sign)
		return True, None
