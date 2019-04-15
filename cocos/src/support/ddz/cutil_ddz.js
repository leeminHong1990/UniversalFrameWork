"use strict";
var cutil_ddz = function () {
};
cutil_ddz.get_playing_room_detail = function (room_info) {
	let str_list = [];

	let mode = room_info['game_mode'];
	str_list.push(const_ddz.GAME_MODE_STRING[mode]);
	str_list.push(room_info["game_round"] + "局");
	if (room_info["pay_mode"] === 1) {
		str_list.push("房主支付");
	} else if(room_info["pay_mode"] === 2) {
		str_list.push("AA支付");
	}else{
        str_list.push("房主支付");
	}

	if(room_info["flower_mode"]==1){
        str_list.push("花牌");
	}

	if (room_info['op_seconds'] > 0) {
		str_list.push("限时：" + room_info['op_seconds'] + "秒")
	}

	if (room_info["hand_prepare"] === 0) {
		str_list.push("手动准备");
	} else {
		str_list.push("自动准备");
	}

	return str_list.join(',');
};

cutil_ddz.get_complete_room_detail = function (room_info) {
	let str_list = [];

	let mode = room_info['game_mode'];
	str_list.push(const_ddz.GAME_MODE_STRING[mode]);
	if (room_info['max_boom_times'] !== 9999) {
		str_list.push("炸弹上限：" + room_info['max_boom_times'])
	}
	str_list.push(room_info["game_round"] + "局");
	if (room_info['op_seconds'] > 0) {
		str_list.push("限时：" + room_info['op_seconds'] + "秒")
	}

    if(room_info["flower_mode"]==1){
        str_list.push("花牌");
    }

	if (room_info["hand_prepare"] === 0) {
		str_list.push("手动准备");
	} else {
		str_list.push("自动准备");
	}
	return str_list.join(',');
};

cutil_ddz.get_club_share_desc = function (room_info) {
	var str_list = [];
	let mode = room_info['game_mode'];
	str_list.push(const_ddz.GAME_MODE_STRING[mode]);
	if (room_info['max_boom_times'] !== 9999) {
		str_list.push("炸弹上限：" + room_info['max_boom_times'])
	}
	str_list.push(room_info["game_round"] + "局");

    if (room_info["pay_mode"] === 1) {
        str_list.push("房主支付");
    } else if(room_info["pay_mode"] === 2) {
        str_list.push("AA支付");
    }else{
        str_list.push("房主支付");
    }

    if(room_info["flower_mode"]==1){
        str_list.push("花牌");
    }

	if (room_info['op_seconds'] > 0) {
		str_list.push("限时：" + room_info['op_seconds'] + "秒")
	}

	if (room_info["hand_prepare"] === 0) {
		str_list.push("手动准备");
	} else {
		str_list.push("自动准备");
	}
	return str_list.join(',');
};

cutil_ddz.change_fight_dealer_mul_list = function (list, spring) {
	let player = h1global.player();
	if(!player || !list){
		return [];
	}
	var mul = 1;
	for (var i = 0; i < list.length; i++) {
		if (list[i] > 0) {
			mul *= list[i];
		}
	}
	cc.log("更新炸弹次数：", player.curGameRoom.boom_times);
	let boom_times = player.curGameRoom.boom_times;
	if (boom_times > 0) {
		var times = 1;
		for (var i = 0; i < boom_times; i++) {
			times *= 2;
		}
		mul *= times;
	}
	//春天
	//cc.log(spring);
	if (spring) {
		return [mul * 2, mul * 2, mul * 2];
	}
	return [mul, mul, mul];
};