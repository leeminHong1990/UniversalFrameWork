"use strict";
var cutil = function(){}

cutil.lock_ui = function (){
	if(h1global.globalUIMgr){
		h1global.globalUIMgr.lock_ui.show();
	}
};

cutil.unlock_ui = function (){
	if(h1global.globalUIMgr){
		h1global.globalUIMgr.lock_ui.hide();
	}
};

String.prototype.contains = String.prototype.contains || function(str) {
	return this.indexOf(str) >= 0;
};

String.prototype.startsWith = String.prototype.startsWith || function(prefix) {
	return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = String.prototype.endsWith || function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) >= 0;
};

cutil.deepCopy = function(obj){
    var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //系列化对象
        newobj = JSON.parse(str); //还原
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ?
            cutil.deepCopy(obj[i]) : obj[i];
        }
    }
    return newobj;
};

cutil.angle = function (a, b) { // 平面坐标系 b点到a点的角度 0-360
    let angel = Math.atan((b.y - a.y) / (b.x - a.x))*180/Math.PI
	if (b.x - a.x >= 0 && b.y - a.y >= 0) { // 第一象限
		return angel
	} else if (b.x - a.x < 0 && b.y - a.y >= 0) { // 第二象限
		return 180 + angel
	} else if (b.x - a.x <= 0 && b.y - a.y <= 0) { // 第三象限
		return 180 + angel
	} else {
		return 360 + angel
	}
};

cutil.distance = function (a_point, b_point){
	var y_distance = b_point.y - a_point.y;
	var x_distance = b_point.x - a_point.x;
	return Math.sqrt(Math.pow(x_distance, 2) + Math.pow(y_distance, 2))
};

cutil.isPositiveNumber = function (text) {
    if (text == undefined) return false;
    if (cc.isNumber(text)) {
        return text % 1 === 0;
    }
    return /^[1-9]\d*$/.test(text);
};

cutil.arrayShuffle = function(arr){
	for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
	return arr;
};

cutil.convert_time_to_date = function (rtime)
{
	var temp = os.date("*t", rtime)
	return temp.year.toString() + "年" + temp.month.toString() + "月" + temp.day.toString() + "日"
};

cutil.convert_time_to_hour2second = function (rtime)
{
	var temp = os.date("*t", rtime)
	return temp.hour.toString() + ":" + temp.min.toString()
};

cutil.convert_time_to_stime = function (ttime)
{
	var temp = os.date("*t", ttime)
	return temp.year.toString() + "/" + temp.month.toString() + "/" + temp.day.toString() + "  "+ temp.hour.toString() + ":"+ temp.min.toString() + ":" + temp.sec.toString()
};

cutil.convert_timestamp_to_datetime = function (ts) {
    var date	= new Date(ts * 1000);
    var year	= date.getFullYear();
    var month	= ('0' + (date.getMonth() + 1)).substr(-2);
    var day		= ('0' + date.getDate()).substr(-2);
    var hour	= ('0' +date.getHours()).substr(-2);
    var min		= ('0' + date.getMinutes()).substr(-2);
    var sec		= ('0' + date.getSeconds()).substr(-2);

    var time_str = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    return time_str;
};

cutil.convert_timestamp_to_datetime_exsec = function (ts) {
	var date = new Date(ts * 1000);
	var year = date.getFullYear();
	var month = ('0' + (date.getMonth() + 1)).substr(-2);
	var day = ('0' + date.getDate()).substr(-2);
	var hour = ('0' + date.getHours()).substr(-2);
	var min = ('0' + date.getMinutes()).substr(-2);
	var sec = ('0' + date.getSeconds()).substr(-2);

	var time_str = year + '-' + month + '-' + day + '   ' + hour + ':' + min;
	return time_str;
};

cutil.convert_timestamp_to_ymd = function (ts) {
    var date	= new Date(ts * 1000);
    var year	= date.getFullYear();
    var month	= ('0' + (date.getMonth() + 1)).substr(-2);
    var day		= ('0' + date.getDate()).substr(-2);

    var time_str = year + '-' + month + '-' + day;
    return time_str;
};

cutil.convert_timestamp_to_mdhms = function (ts) {
    var date	= new Date(ts * 1000);
    var year	= date.getFullYear();
    var month	= ('0' + (date.getMonth() + 1)).substr(-2);
    var day		= ('0' + date.getDate()).substr(-2);
    var hour	= ('0' +date.getHours()).substr(-2);
    var min		= ('0' + date.getMinutes()).substr(-2);
    var sec		= ('0' + date.getSeconds()).substr(-2);

    return year + '-' + month + '-' + day + '\n' + hour + ':' + min + ':' + sec;
};

cutil.convert_seconds_to_decimal = function(seconds, decimalNum){
	seconds = String(seconds)
	var lis = [[], []]
	var index = 0
	for (var i = 0; i < seconds.length; i++) {
		if (seconds[i] === '.') {
			index += 1
		}
		if (index <= 1 && seconds[i] !== '.') {
			lis[index].push(seconds[i])
		}
	}
	if (lis[0].length <= 0) {
		return null;
	}
	var integerPart = ""
	for (var i = 0; i < lis[0].length; i++) {
		integerPart += lis[0][i];
	}
	var decimalPart = ""
	if (lis[1].length < decimalNum) {
		for (var i = 0; i < lis[1].length; i++) {
			decimalPart += lis[1][i];
		}
		for (var i = 0; i < decimalNum-lis[1].length; i++) {
			decimalPart += '0';
		}
	} else {
		for (var i = 0; i < decimalNum; i++) {
			decimalPart += lis[1][i];
		}
	}
	return integerPart + "." + decimalPart
}

cutil.convert_second_to_hms = function (sec)
{
	if (!sec || sec <= 0) {return "00:00:00";}
	sec = Math.floor(sec);
	var hour = Math.floor(sec / 3600);
	var minute = Math.floor((sec % 3600) / 60);
	var second = (sec % 3600) % 60;
	// cc.log(second)

	var timeStr = "";
	if (hour < 10) {
		timeStr = timeStr + "0" + hour + ":";
	}else {
        timeStr = hour + ":";
    }
	if (minute < 10) {
		timeStr = timeStr + "0" + minute + ":";
	} else {
		timeStr = timeStr + minute + ":";
	}
	if (second < 10) {
		timeStr = timeStr + "0" + second;
	} else {
		timeStr = timeStr + second;
	}
	return timeStr;
}

cutil.convert_second_to_ms = function (sec)
{
	if (!sec || sec <= 0) {return "00:00";}
	sec = Math.floor(sec);

	var minute = Math.floor(sec / 60);
	var second = sec % 60;
	// cc.log(second)

	var timeStr = "";
	if (minute < 10) {
		timeStr = timeStr + "0" + minute + ":";
	} else {
		timeStr = timeStr + minute + ":";
	}
	if (second < 10) {
		timeStr = timeStr + "0" + second;
	} else {
		timeStr = timeStr + second;
	}
	return timeStr;
};


cutil.resize_img = function( item_img, size )
{
	var rect = item_img.getContentSize()
	var scale = size / rect.height
	var width = rect.width * scale
	if (width > size)
		scale = size / rect.width
	item_img.setScale(scale)
};

cutil.show_portrait_by_num = function (portrait_img,  characterNum)
{
	if (characterNum <= 100){
        portrait_img.loadTexture("res/portrait/zhujue" + characterNum + ".png")
	}
    else
    {
		// var table_mercenary = require("data/table_mercenary")
		var mercenary_info = table_mercenary[characterNum]
		KBEngine.DEBUG_MSG("mercenary_info", mercenary_info["PORTRAIT"])
		portrait_img.loadTexture("res/portrait/" + mercenary_info["PORTRAIT"] + ".png")
    }
};


cutil.print_table = function (lst)
{
	if (lst === undefined)
	{
		KBEngine.DEBUG_MSG("ERROR------>Table is undefined")
		return;
	}
	for (var key in lst)
	{
		var info = lst[key];
    	KBEngine.DEBUG_MSG(key + " : " + info)
    	if (info instanceof Array)
    	{
        	cutil.print_table(info);
    	}
	}
};

cutil.is_in_list = function (x, t){
	for(var index in t){
		if (t[index] === x) {
			return  index;
		}
	}
	return null;
}


cutil.str_sub = function (strinput, len)
{
	if (strinput.length < len)
		return strinput
	if (strinput.length >= 128 && strinput.length < 192)
		return cutil.str_sub(strinput, len - 1)
	return strinput.substring(0, len)
};

cutil.info_sub = function (strinput, len, ellipsis)
{
    ellipsis = ellipsis || "...";
	var output = cutil.str_sub(strinput, len)
	if (output.length < strinput.length)
	{
		return output + ellipsis
	}
	return output
};
//info_sub的上面加了一层判断中文为2个长度。
cutil.info_sub_ver2 = function (strinput, need_len,ellipsis)
{
	var push_arr = [];
	(function (str){
        for (var i=0; i<str.length; i++) {
            var c = str.charCodeAt(i);
            //单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
                push_arr.push(1)
            }
            else {
                push_arr.push(2)
            }
        }
    })(strinput);
	var i =0;
	var j =0;
	while(i <= need_len-0.5){
		j++;
		if(push_arr[j] == 1){
			i-=0.5;
		}
		i++;
	}
    return cutil.info_sub(strinput,j,ellipsis);
};

cutil.share_func = function (title, desc) {
	wx.onMenuShareAppMessage({
		title: title, // 分享标题
		desc: desc, // 分享描述
		link: switches.h5entrylink, // 分享链接
		imgUrl: '', // 分享图标
		type: '', // 分享类型,music、video或link，不填默认为link
		dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
		success: function () {
			// 用户确认分享后执行的回调函数
			cc.log("ShareAppMessage Success!");
		},
		cancel: function () {
			// 用户取消分享后执行的回调函数
			cc.log("ShareAppMessage Cancel!");
		},
		fail: function() {
			cc.log("ShareAppMessage Fail")
		},
	});
	wx.onMenuShareTimeline({
		title: title, // 分享标题
		desc: desc, // 分享描述
		link: switches.h5entrylink, // 分享链接
		imgUrl: '', // 分享图标
		type: '', // 分享类型,music、video或link，不填默认为link
		dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
		success: function () {
			// 用户确认分享后执行的回调函数
			cc.log("onMenuShareTimeline Success!");
		},
		cancel: function () {
			// 用户取消分享后执行的回调函数
			cc.log("onMenuShareTimeline Cancel!");
		},
		fail: function() {
			cc.log("onMenuShareTimeline Fail")
		},
	});
};

/*
cutil.deep_copy_table =
	function (tb)
		if type(tb) ~= "table" then return tb end
		var result = {}
		for i, j in pairs(tb) do
			result[i] = cutil.deep_copy_table(j)
		end
		return result
	end
*/
cutil.convert_num_to_chstr = function(num)
{
	if (typeof num !== "number") {
		// 处理UINT64
		num = num.toDouble();
	}
	function convert(num, limit, word)
	{
		var integer = Math.floor(num / limit);
		var res_str = integer.toString();
		var floatNum = 0;
		if (integer < 10)
		{
			// floatNum = (Math.floor((num % limit) / (limit / 100))) * 0.01;
			floatNum = (Math.floor((num % limit) / (limit / 100)));
			if(floatNum < 1){
			} else if(floatNum < 10) {
				res_str = res_str + ".0" + floatNum.toString();
			} else {
				res_str = res_str + "." + floatNum.toString();
			}
		}
		else if (integer < 100)
		{
			floatNum = (Math.floor((num % limit) / (limit / 10)));
			if(floatNum < 1){
			} else {
				res_str = res_str + "." + floatNum.toString();
			}
		}
		// floatNum = Math.floor(floatNum * limit)/limit
		// integer += floatNum;

		// return integer.toString() + word;
		// cc.log(num)
		// cc.log(res_str + word)
		return res_str + word;
	}

	if (num >= 1000000000)
	{
		return convert(num, 1000000000, "B");
	}
	else if (num >= 1000000)
	{
		return convert(num, 1000000, "M");
	}
	else if (num >= 1000)
	{
		return convert(num, 1000, "K");
	}
	else
	{
		return Math.floor(num).toString();
	}

};

cutil.splite_list = function (list, interval, fix_length)
{
	var result_list = [];
	for (var i = 0; i < list.length; ++i)
	{
		var idx = Math.floor(i / interval);
		if (idx >= result_list.length)
		{
			result_list[idx] = [];
		}
		result_list[idx][i - idx * interval] = list[i];
	}

	if (fix_length && result_list.length < fix_length)
	{
		for (var i = result_list.length; i < fix_length; ++i)
		{
			result_list.push([]);
		}
	}
	return result_list;
};


cutil.get_rotation_angle = function(vec2)
{
	var vec2_tan = Math.abs(vec2.y) / Math.abs(vec2.x);
	var angle = 0
	if (vec2.y == 0)
	{
		if (vec2.x > 0){
			angle = 90
		}
		else if (vec2.x < 0){
			angle = 270
		}
	}
	else if (vec2.x == 0){
		if (vec2.y > 0){
			angle = 0
		}
		else if (vec2.y < 0){
			angle = 180
		}
	}
	else if (vec2.y > 0 && vec2.x < 0){
		angle = Math.atan(vec2_tan)*180 / Math.pi - 90;
	}
	else if (vec2.y > 0 && vec2.x > 0){
		angle = 90 - Math.atan(vec2_tan)*180/Math.pi
	}
	else if (vec2.y < 0 && vec2.x < 0){
		angle = -Math.atan(vec2_tan)*180/Math.pi - 90;
	}
	else if (vec2.y < 0 && vec2.x > 0){
		angle = Math.atan(vec2_tan)*180/Math.pi + 90;
	}
	return angle
};

cutil.post_php_info = function (info, msg)
{
	var xhr = new cc.XMLHttpRequest()
	xhr.responseType = 0 // cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr.open("GET", "http://" + serverconfig.httpServerIP + "/log_client.php?key=" + info +   "&value=" +  msg)
	function onReadyStateChange()
	{

	}
	xhr.registerScriptHandler(onReadyStateChange)
	xhr.send()
};


cutil.post_php_feedback = function (info, msg)
{
	var xhr = new cc.XMLHttpRequest()
	xhr.responseType = 0 // cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr.open("GET", "http://" + serverconfig.httpServerIP + "/log_feedback.php?key=" + info +  "&value=" + msg)
	function onReadyStateChange(){}
	xhr.registerScriptHandler(onReadyStateChange)
	xhr.send()
};


cutil.printMessageToLogcat = function (message)
{
	if (targetPlatform === cc.PLATFORM_OS_ANDROID)
	{
        //var ok,ret  = luaj.callStaticMethod("org/cocos2dx/lua/AppActivity", "sPrintMsg", { message }, "(Ljava/lang/String;)V")
	}
};

cutil.get_uint32 = function (inputNum)
{
	return Math.ceil(inputNum) % 4294967294
};

cutil.schedule = function(node, callback, delay)
{
	// var delayAction = cc.DelayTime.create(delay);
	// var sequence = cc.Sequence.create(delay, cc.CallFunc.create(callback));
	// var action = cc.RepeatForever.create(sequence);
	// node.runAction(action);
	var action = cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(delay), cc.CallFunc.create(callback)));
	node.runAction(action);
	return action;
};

cutil.performWithDelay = function(node, callback, delay)
{
	var delayAction = cc.DelayTime.create(delay);
	var sequence = cc.Sequence.create(delay, cc.CallFunc.create(callback));
	node.runAction(sequence);
	return sequence;
};

cutil.binarySearch = function(targetList, val, func){
	func = func || function(x, val){return val - x;};
	var curIndex = 0;
	var fromIndex = 0;
	var toIndex = targetList.length - 1;
	while(toIndex > fromIndex){
		curIndex = Math.floor((fromIndex + toIndex) / 2);
		if (func(targetList[curIndex], val) < 0){
			toIndex = curIndex;
		}else if (func(targetList[curIndex], val) > 0){
			fromIndex = curIndex + 1;
		}else if (func(targetList[curIndex], val) === 0){
			return curIndex + 1;
		}
	}
	return toIndex;
};

// 用于调用本地时，保存回调方法的闭包
cutil.callFuncs = {};
cutil.callFuncMax = 10000;
cutil.callFuncIdx = -1;
cutil.addFunc = function(callback){
    cutil.callFuncIdx = (cutil.callFuncIdx + 1) % cutil.callFuncMax;
    cutil.callFuncs[cutil.callFuncIdx] = callback;
    return cutil.callFuncIdx;
};
cutil.runFunc = function(idx, param){
    if(cutil.callFuncs[idx]){
        (cutil.callFuncs[idx])(param);
        cutil.callFuncs[idx] = undefined;
    }
};

cutil.portraitCache = {};

cutil.loadURLTexture = function (url, callback) {
    if(cutil.portraitCache[url]){
        callback(cutil.portraitCache[url]);
        return;
    }
    var filename = encodeURIComponent(url) + ".png";
	if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
		if (jsb.fileUtils.isFileExist("/mnt/sdcard/portraits/" + filename)) {
			callback("/mnt/sdcard/portraits/" + filename);
			return
		}
	}
    var fid = cutil.addFunc(function(img){cutil.portraitCache[url] = img;callback(img);});
    if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)){
        jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "downloadAndStoreFile", "(Ljava/lang/String;Ljava/lang/String;I)V", url, filename, fid);
    } else if((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
        jsb.reflection.callStaticMethod("DownloaderOCBridge", "downloadAndStorePortrait:WithLocalFileName:AndFuncId:", url, filename, fid);
    } else {
        cc.loader.loadImg([url], {"isCrossOrigin":false}, function(err, img){cutil.runFunc(fid, img);});
    }
};

cutil.loadPortraitTexture = function(url, sex, callback){
	cc.log("loadPortraitTexture:", url);
    if (!url || !(url.indexOf("http") === 0 || url.indexOf("https") === 0)) {
        if(sex === 1){
            callback && callback("res/ui/Default/male.png");
        }else {
            callback && callback("res/ui/Default/famale.png");
        }
        return;
    }
    cutil.loadURLTexture(url, function (img) {
        if(img){
            callback && callback(img);
        }else{
            if(sex === 1){
                callback && callback("res/ui/Default/male.png");
            }else {
                callback && callback("res/ui/Default/famale.png");
            }
        }
    })
};

cutil.captureScreenCallback = function(success, filepath){
    // 安卓截屏回调
    if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) && success){
        if (filepath.substring(filepath.length-7, filepath.length) == "_MJ.png") {
            jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "saveScreenShot", "(Ljava/lang/String;)V", filepath);
        }
        else {
	        if (cc.sys.localStorage.getItem("SHARE_XIANLIAO") !== undefined && cc.sys.localStorage.getItem("SHARE_XIANLIAO") !== null && cc.sys.localStorage.getItem("SHARE_XIANLIAO") == "1") {
		        jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callXianliaoShareImg", "(Ljava/lang/String;)V", filepath);
	        } else {
		        jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callWechatShareImg", "(ZLjava/lang/String;)V", true, filepath);
	        }
        }
    }
};

// 语音相关 -- start
cutil.start_record = function(filename, fid) {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        jsb.reflection.callStaticMethod(switches.package_name + "/gvoice/GVoiceJavaBridge", "startRecording", "(Ljava/lang/String;I)V", filename, fid);
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        jsb.reflection.callStaticMethod("GVoiceOcBridge", "startRecording:withFuncID:", filename, fid);
    }
    else {
        cc.log("not native, start_record pass");
    }
};

cutil.stop_record = function() {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        jsb.reflection.callStaticMethod(switches.package_name + "/gvoice/GVoiceJavaBridge", "stopRecording", "()V");
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        jsb.reflection.callStaticMethod("GVoiceOcBridge", "stopRecording");
    }
    else {
        cc.log("not native, stop_record pass");
    }
};

cutil.download_voice = function(fileID) {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        jsb.reflection.callStaticMethod(switches.package_name + "/gvoice/GVoiceJavaBridge", "downloadVoice", "(Ljava/lang/String;)V", fileID);
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        jsb.reflection.callStaticMethod("GVoiceOcBridge", "downloadVoiceWithID:", fileID);
    }
    else {
        cc.log("not native, download_voice pass");
    }
};
// 语音相关 -- end

// 定位相关 -- start
cutil.start_location = function() {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "startLocation", "()V");
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        jsb.reflection.callStaticMethod("AMapOCBridge", "startLocation");
    }
    else {
        cc.log("not native, start_location pass");
    }
};
cutil.get_location_geo = function() {
    // G_LOCATION_GEO
	return cc.sys.localStorage.getItem("G_LOCATION_GEO");
};

cutil.get_location_lat = function() {
    // G_LOCATION_LAT
    return cc.sys.localStorage.getItem("G_LOCATION_LAT");
};

cutil.get_location_lng = function() {
    // G_LOCATION_LNG
    return cc.sys.localStorage.getItem("G_LOCATION_LNG");
};
cutil.calc_distance = function(lat1, lng1, lat2, lng2) {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        return jsb.reflection.callStaticMethod(switches.package_name + "/util/UtilJavaBridge", "calcDistance", "(FFFF)F", lat1, lng1, lat2, lng2);
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        return jsb.reflection.callStaticMethod("UtilOcBridge", "calcDistanceFromLat:Lng:ToLat:Lng:", lat1, lng1, lat2, lng2);
    }
    else {
        cc.log("not native, calc_distance pass");
    }
};

cutil.open_url = function(url) {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "openURL", "(Ljava/lang/String;)V", url);
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        jsb.reflection.callStaticMethod("UtilOcBridge", "openURL:", url);
    }
    else {
        cc.log("not native, open_url pass");
    }
};

cutil.getOpenUrlIntentData = function (action) {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        return jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "getOpenUrlIntentData", "(Ljava/lang/String;)Ljava/lang/String;", action);
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        return jsb.reflection.callStaticMethod("UtilOcBridge", "getOpenUrlIntentData:", action);
    }
    else {
        cc.log('pass getOpenUrlIntentData');
    }
};

cutil.clearOpenUrlIntentData = function () {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        return jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "clearOpenUrlIntentData", "()V");
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        return jsb.reflection.callStaticMethod("UtilOcBridge", "clearOpenUrlIntentData");
    }
    else {
        cc.log('pass clearOpenUrlIntentData');
    }
};

cutil.callEnterRoom = function (roomId) {
    if (roomId == undefined) {
        let player = h1global.player();
        if(player){
            roomId = cutil.getOpenUrlIntentData("joinroom");
            if (!roomId || roomId.length === 0) {
                cc.warn('cutil.callEnterRoom error');
                return;
            }
        }
    }
    if (cutil.isPositiveNumber(roomId)) {
        let rid = parseInt(roomId);
        let scene = cc.director.getRunningScene();
	    if (scene.className.endsWith('GameRoomScene')) {
            let player = h1global.player();
            if (player) {
                cutil.lock_ui();
                player.enterRoom(rid);
            }
        }
    }
};

cutil.callTaskOp = function () {
	return;
	// cc.log("cutil.callTaskOp() is run!")
	// var str = cc.sys.localStorage.getItem("TASK_CHECK_JSON");
	// cc.log("str is ",str);
	// if(str){
     //    var dict = JSON.parse(str);
     //    cc.log("dict is ",dict);
     //    if(dict && dict['check']==1){
     //        cc.sys.localStorage.setItem("TASK_CHECK_JSON", JSON.stringify({'check':0}));
     //        cutil.wechatTimelineCallback();
	// 	}
	// }
};

cutil.clearEnterRoom = function () {
    cutil.clearOpenUrlIntentData();
};

cutil.registerGameShowEvent= function () {
    if(cc._event_show_func){
        return;
    }
    cc._event_show_func = function () {
        cutil.callEnterRoom();
    };
    cc.eventManager.addCustomListener(cc.game.EVENT_INTENT, cc._event_show_func);
};

//复制到剪贴板
cutil.copyToClipBoard = function(content) {
    if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
        return jsb.reflection.callStaticMethod(switchesnin1.package_name + "/AppActivity", "copyToClipBoard", "(Ljava/lang/String;)V", content);
    }
    else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
        return jsb.reflection.callStaticMethod("UtilOcBridge", "copyToClipBoard:", content);
    }
    else {
        cc.log("not native, copyToClipBoard pass");
    }
};

cutil.wechatTimelineCallback = function(){
	// 微信分享成功回调
	var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
	var bind_xhr = cc.loader.getXMLHttpRequest();
	bind_xhr.open("POST", switchesnin1.PHP_SERVER_URL + "/api/share_award", true);
	bind_xhr.onreadystatechange = function(){
		if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
			if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
				h1global.curUIMgr.gamehall_ui.updateCharacterCard();
			}
		}
	};
	bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
	bind_xhr.send();
	cc.sys.localStorage.setItem("LAST_TIMELINE_DATE", new Date().toLocaleDateString());
};

cutil.get_award = function(accountName, callback){
    var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
    var user_info_xhr = cc.loader.getXMLHttpRequest();
    user_info_xhr.open("POST", switches.PHP_SERVER_URL + "/api/spread/get_award", true);
    user_info_xhr.onreadystatechange = function(){
        if(user_info_xhr.readyState === 4 && user_info_xhr.status === 200){
            // cc.log(user_info_xhr.responseText);
            if(callback){
                callback(user_info_xhr.responseText);
            }
        }
    };
    user_info_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
    user_info_xhr.send();
};

cutil.postDataFormat = function(obj){
    if(typeof obj != "object" ) {
        alert("输入的参数必须是对象");
        return;
    }

    // 支持有FormData的浏览器（Firefox 4+ , Safari 5+, Chrome和Android 3+版的Webkit）
    if(typeof FormData == "function") {
        var data = new FormData();
        for(var attr in obj) {
            data.append(attr,obj[attr]);
        }
        return data;
    }else {
        // 不支持FormData的浏览器的处理
        var arr = new Array();
        var i = 0;
        for(var attr in obj) {
            arr[i] = encodeURIComponent(attr) + "=" + encodeURIComponent(obj[attr]);
            i++;
        }
        return arr.join("&");
    }
};

cutil.spread_bind = function(invite_id, callback){
    var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
    var bind_xhr = cc.loader.getXMLHttpRequest();
    bind_xhr.open("POST", switches.PHP_SERVER_URL + "/api/spread/bind", true);
    bind_xhr.onreadystatechange = function(){
        if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
            // cc.log(bind_xhr.responseText);
            if(callback){
                callback(bind_xhr.responseText);
            }
        }
    };
    bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
    bind_xhr.send(cutil.postDataFormat({"invite_id" : invite_id}));
};

cutil.appendUrlParam = function (url, arr) {
	if (!arr || arr.length === 0 || arr.length % 2 !== 0) {
		cc.warn("url params error! ", arr);
		return url;
	}
	if (url.indexOf('?') === -1) {
		url += '?';
	}
	for (var i = 0; i < arr.length; i += 2) {
		url += encodeURIComponent(arr[i]) + "=" + encodeURIComponent(arr[i + 1]);
		if (i !== arr.length - 2) {
			url += '&';
		}
	}
	return url;
};

cutil.get_pay_url = function(goods_id){
	var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
	var bind_xhr = cc.loader.getXMLHttpRequest();
	bind_xhr.open("GET", cutil.appendUrlParam(switches.PHP_SERVER_URL + "/zhangling/order_info", ['good_id', goods_id]), true);
	bind_xhr.onreadystatechange = function(){
		cutil.unlock_ui();
		if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
			// cc.log(bind_xhr.responseText);
			if(bind_xhr.responseText[0] == "{") {
				var pay_url_dict = JSON.parse(bind_xhr.responseText);
				if (pay_url_dict["errcode"] == 0) {
					cutil.open_url(cutil.appendUrlParam(switches.PHP_SERVER_URL + "/zhangling/jump_wx", ['orderInfo', pay_url_dict["data"]]))
				}else if(pay_url_dict["errcode"] == -3 && goods_id===7){
                    var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                    cc.log(info_dict["remark"]);
                    if(info_dict["remark"]){
                        var str = Base64.decode(info_dict["remark"]);
                        var remark_dict = JSON.parse(str);
                        remark_dict["buy_gift"] = 1;
                        info_dict["remark"] = Base64.encode(JSON.stringify(remark_dict));
                    }else{
                        info_dict["remark"] = Base64.encode(JSON.stringify({"buy_gift":1}));
                        cc.log(info_dict["remark"]);
                    }
                    cc.sys.localStorage.setItem("INFO_JSON",JSON.stringify(info_dict));
                    cc.log("save info_json success");
                    cc.log(info_dict["remark"]);
                    if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                        h1global.curUIMgr.gamehall_ui.remove_gift_btn();
                    }
                    if(h1global.curUIMgr.novicegift_ui&& h1global.curUIMgr.novicegift_ui.is_show){
                        h1global.curUIMgr.novicegift_ui.hide();
                    }
				}
				else {
					cc.log("Get Pay Url Error! The Error Code is " + pay_url_dict["errcode"].toString() + "!");
					h1global.globalUIMgr.info_ui.show_by_info("无效的支付链接！", cc.size(300, 200));
				}
			} else {
				cc.log("The Pay Url is Illegall!");
				h1global.globalUIMgr.info_ui.show_by_info("无效的支付链接！", cc.size(300, 200));
			}
		}
	};
	bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
	bind_xhr.send();
};

cutil.get_pay_url2 = function(goods_id){
	var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
	var bind_xhr = cc.loader.getXMLHttpRequest();
	if(!info_dict.hasOwnProperty("openid")){
		cc.log("not have openid");
		return;
	}
	cc.log(cutil.appendUrlParam(switches.PHP_SERVER_URL + "/api/prepay_info", ['goods_id', goods_id,'openid',info_dict['openid']]));
	bind_xhr.open("GET", cutil.appendUrlParam(switches.PHP_SERVER_URL + "/api/prepay_info", ['goods_id', goods_id,'openid',info_dict['openid']]), true);

	bind_xhr.onreadystatechange = function () {
		// cutil.unlock_ui();
		if (bind_xhr.readyState === 4 && bind_xhr.status === 200) {
			cc.log(bind_xhr.responseText);
			if(bind_xhr.responseText[0] == "{") {
				cutil.unlock_ui();
				var pay_url_dict = JSON.parse(bind_xhr.responseText);
				if (pay_url_dict["errcode"] == 0) {
					cc.log("error code is 0 ");
					if(pay_url_dict.hasOwnProperty("data")){
						var data = pay_url_dict["data"];
						if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
							jsb.reflection.callStaticMethod("WechatOcBridge", "callWechatPayWithPrepayID:andNonceStr:andTimeStamp:andSign:", data.prepayid, data.noncestr, data.timestamp, data.sign);
						} else if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
							jsb.reflection.callStaticMethod(switchesnin1.package_name + "/AppActivity", "callWechatPay", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", data.prepayid, data.noncestr, data.timestamp, data.sign);
						} else {
							cc.log('pass');
						}
					}else{
						cc.log("not find data");
					}
				}else{
					cc.log("Get Pay Url Error! The Error Code is " + pay_url_dict["errcode"].toString() + "!");
					h1global.globalUIMgr.info_ui.show_by_info("无效的支付链接！", cc.size(300, 200));
				}
			} else {
				cc.log("The Pay Url is Illegall!");
				h1global.globalUIMgr.info_ui.show_by_info("无效的支付链接！", cc.size(300, 200));
			}
		}else{
			cc.log("readyState error",bind_xhr.readyState);
			cc.log("bind_xhr.status",bind_xhr.status);
		}
	};
	bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
	bind_xhr.send();
};

cutil.get_user_info = function(accountName, callback){
    var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
    var user_info_xhr = cc.loader.getXMLHttpRequest();
    user_info_xhr.open("GET", switches.PHP_SERVER_URL + "/api/user_info", true);
    user_info_xhr.onreadystatechange = function(){
        if(user_info_xhr.readyState === 4 && user_info_xhr.status === 200){
            // cc.log(user_info_xhr.responseText);
            if(callback){
                callback(user_info_xhr.responseText);
            }
        }
    };
    user_info_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
    user_info_xhr.send();
};

//battery
cutil.getBattery = function () {
	if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
		return jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "getBattery", "()I");
	} else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
		return jsb.reflection.callStaticMethod("UtilOcBridge", "getBattery");
	} else {
		cc.warn("not support getBattery");
		return 50;
	}
};

cutil.get_club_share_desc = function (room_info) {
    var str_list = [];

    str_list.push(room_info["game_round"] + "局");

    if(room_info['pay_mode'] === const_val.AA_PAY_MODE){
        str_list.push("AA支付");
    } else if(room_info['pay_mode'] === const_val.AGENT_PAY_MODE){
        str_list.push("代理支付");
    } else if(room_info['pay_mode'] === const_val.CLUB_PAY_MODE){
        str_list.push("房主支付");
    } else if(room_info['pay_mode'] === const_val.NORMAL_PAY_MODE){
        str_list.push("房主支付");
    }

    if (room_info["max_lose"] === const_gxmj.MAX_LOSE[0]) {
        str_list.push("不封顶");
    } else {
        str_list.push(room_info["max_lose"].toString() + "分封顶");
    }

    if (room_info["lucky_num"] === 0) {
        str_list.push("不摸宝");
    } else {
        str_list.push("摸" + room_info["lucky_num"].toString() + "宝");
    }

    if (room_info['hand_prepare'] === const_val.AUTO_PREPARE) {
        str_list.push("自动准备");
    } else {
        str_list.push("手动准备");
    }

    return str_list.join(',');
};

cutil.simpleIterWithoutNull = function (arr) {
	var iter = {};
	iter.next = function () {
		if (this.index >= arr.length) {
			return null;
		}
		while (this.index < arr.length) {
			var item = arr[this.index];
			this.index++;
			if (!(item === undefined || item == null)) {
				return item;
			}
		}
	};
	iter._size = -1;
	iter.size = function () {
		if (this._size !== -1) {
			return this._size;
		}
		var size = 0;
		for (var i = 0; i < arr.length; i++) {
			var item = arr[i];
			if (!(item === undefined || item == null)) {
				size++;
			}
		}
		this._size = size;
		return size;
	};

	iter.index = 0;
	return iter;
};

// Note : 当存储一个多个游戏共同变化的值时，先把key做一次转换 然后存储和读取
cutil.keyConvertFilters = ["GAME_ROOM_UI", "GAME_ROOM_BG", "GAME_ROOM_MAHJONG_BG"];
cutil.keyConvertLanguaeFilters = [const_val.JinZhongMJ, const_val.GuaiSanJiaoMJ, const_val.DouDiZhu, const_val.TuiDaoHuMJ, const_val.JinZhongGSJMJ, const_val.DaTongLGFMJ, const_val.LvLiang7];
cutil.keyConvert = function (key, gameType) {
	if(key == 'LANGUAGE') {
		if (cutil.keyConvertLanguaeFilters.indexOf(Number(gameType)) == -1) {
			return key;
		}
		return key + "_" + gameType;
	}

	if (cutil.keyConvertFilters.indexOf(key) >= 0 && gameType != const_val.DouDiZhu && gameType!= const_val.LvLiang7) {
		return key;
	}
	return key + "_" + gameType;
};

cutil.playEffect = function (gameType, path) {
	var language = cc.sys.localStorage.getItem(cutil.keyConvert("LANGUAGE", gameType));
	cc.log(language, gameType, path)
	if (language){
		var new_path = table_voice[Number(language)]["root"] + path;
		if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
			if (jsb.fileUtils.isFileExist(new_path)) {
				cc.audioEngine.playEffect(new_path);
			} else {
				// get default path and play
			}
		} else {
			cc.audioEngine.playEffect(new_path);
		}
	}
};

cutil.get_share_title = function(curGameRoom,game_type){
    var title_list = table_prepare_msg[game_type]; //获取当前分享游戏的 标题数据

    var need_title_list = undefined; // 获取当前分享游戏 需要出现的 标题数据

	if(curGameRoom.club_id>0){
        need_title_list = title_list["club_need_title"];
	}else{
        need_title_list = title_list["normal_need_title"];
	}

	//接下来才是正戏 title_type 表示 要插入数据的类型 0 不需要, 1 放后面, 2 放前面 3 只要数据
    var str = '';
    for(var i in need_title_list){		// 遍历需要出现的标题数据 并查询title_list获取数据  加入到显示字符串中
    	var add_str ='';

    	switch (+need_title_list[i]["title_type"]){
			case 0:
                add_str += need_title_list[i]["title"];
                break;
			case 1:
                add_str += need_title_list[i]["title"] + curGameRoom[need_title_list[i]["title_desc"]];
				break;
			case 2:
                add_str += curGameRoom[need_title_list[i]["title_desc"]] + need_title_list[i]["title"];
				break;
			case 3:
                add_str += curGameRoom[need_title_list[i]["title_desc"]];
			default:
				break;
		}
        str +=add_str;
	}
	return str;

};

cutil.get_share_desc = function(curGameRoom,game_type){
    var desk_list = table_room_params[game_type]; //获取当前分享游戏的 标题数据
    //接下来才是正戏 title_type 表示 要插入数据的类型 0 不需要, 1 放后面, 2 放前面 3 只要数据
    var str = '';
    for(var k in desk_list){		// 遍历需要出现的标题数据 并查询title_list获取数据  加入到显示字符串中
        var add_str ='';
        add_str = desk_list[k][curGameRoom[k]];
		if(add_str){
            str +=add_str+' ';
		}
    }
    return str;
};

/**
 * function set_time_label 设置倒计时
 * @param label_node 想要倒计时的label
 * @param head 前半段文字
 * @param content 后半段文字
 * @param wait_time 倒计时的时间
 * @param touch_time 倒计时开始的时间
 * @param cbk_func 倒计时结束后的回调函数
 */
cutil.set_time_label = function(label,head,content,wait_time,touch_time,cbk_func){
    var content_label = label;
    content_label.runAction(cc.repeatForever(cc.sequence(cc.callFunc(function () {
        var now_time = Math.round(new Date() / 1000);
        if(now_time - touch_time < wait_time){
            var time_label = wait_time-(now_time - touch_time)
            cc.log(time_label+"秒之后可以重新获取。");
            if(time_label<10){
            	time_label = "0"+time_label;
			}
            content_label.setString(head+time_label+content);
        }else{
            cc.log("时间到~");
            content_label.stopAllActions();
            if(cbk_func){
            	cbk_func();
			}
            return;
        }
    }),cc.delayTime(1.0))));
};

/**
 * function get_off_online_time
 * @param logout_time 离线时间
 * @return string;
 */
cutil.get_off_online_time = function(logout_time){
	if(!logout_time || logout_time==0){
		return "未知";
	}
	var now_time = Math.round(new Date() / 1000);
	var off_time = now_time-logout_time;
	// var off_time = logout_time
	if(off_time<300){
        return "刚刚"
	}else if(off_time<3600){
        return "离线"+parseInt(off_time/60)+"分钟";
    }else if(off_time<86400){
		return "离线"+parseInt(off_time/60/60)+"小时";
	}else if(off_time<2592000){
		return "离线"+parseInt(off_time/60/60/24)+"天";
	}else if(off_time<31104000){
        return "离线"+parseInt(off_time/60/60/24/30)+"个月";
    }else{
		return "离线1年以上";
	}
};

/**
 * function get_notices
 * @return null;
 */
cutil.get_notices = function(notice_id){
    var bind_xhr = cc.loader.getXMLHttpRequest();
    cc.log(cutil.appendUrlParam(switches.PHP_SERVER_URL + "/notices", []));
    bind_xhr.open("GET", cutil.appendUrlParam(switches.PHP_SERVER_URL + "/notices", []), true);
    bind_xhr.onreadystatechange = function(){
        if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
            if(bind_xhr.responseText[0] == "{") {
                var result = JSON.parse(bind_xhr.responseText);
                if (result["errcode"] == 0){
                    if(result.hasOwnProperty("notices")){
                    	var notices = cutil.deepCopy(result["notices"]);
                        var now_time = Math.round(new Date() / 1000);
                        var from_date = (new Date(notices[0]["from_date"]).getTime())/1000;
                        var to_date = (new Date(notices[0]["to_date"]).getTime())/1000;
                        if(from_date<now_time && now_time<to_date){
                            if(notice_id && notices[0]["id"] == notice_id){
                                cc.log("notice_id is return");
                                return;
                            }
                            var notices_str = JSON.stringify(result["notices"]);
                            cc.log("set notices_str",notices_str);
                            cc.sys.localStorage.setItem("NOTICES_JSON", notices_str);
                            if(h1global.curUIMgr.notice_ui && !h1global.curUIMgr.notice_ui.is_show){
                                h1global.curUIMgr.notice_ui.show();
                                cc.sys.localStorage.setItem("NOTICES_DATA", now_time);
                                cc.sys.localStorage.setItem("NOTICES_ID",notices[0]["id"]);
                            }
                            return
						}
						if(!cc.sys.localStorage.getItem("NOTICES_JSON")){
							var notices_str = JSON.stringify(result["notices"]);
							cc.sys.localStorage.setItem("NOTICES_JSON", notices_str);
						}
                    }

				}
            }
        }else{
            cc.log("readyState error",bind_xhr.readyState);
            cc.log("bind_xhr.status",bind_xhr.status);
            // h1global.globalUIMgr.info_ui.show_by_info("获取公告信息失败，请重试");
        }
    };
    // bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
    bind_xhr.send();
};

// 是否安装了闲聊
cutil.isXianliaoInstalled = function() {
	if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
		return jsb.reflection.callStaticMethod(switchesnin1.package_name + "/AppActivity", "isXianliaoInstalled", "()Z");
	} else if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
		return jsb.reflection.callStaticMethod("XianliaoOcBridge", "isXianliaoInstalled");
	} else {
		return false;
	}
};

/**
 * function swap_node_name //互换两个节点的名字
 * @param node_a 节点a
 * @param node_b 节点b
 * @return null;
 */
cutil.swap_node_name = function (node_a, node_b) {
	let node_a_name = node_a.getName();
	let node_b_name = node_b.getName();
	node_a.setName(node_b_name);
	node_b.setName(node_a_name);
};

/**
 * function change_idx //转换序号
 * @param player_num    当前游戏人数
 * @param idx           当前位置
 * @return idx;         UI中节点转换的位置
 */
cutil.change_idx = function (player_num, idx) {
	if (player_num === 3) {
		if (idx === 2) {idx = 3;}
	} else if (player_num === 2) {
		if (idx === 1) {idx = 2;}
	}
	return idx;
};

/**
 * function get_shop_list 获取商城价目表
 * @return null;
 */
cutil.get_shop_list = function(){
	var bind_xhr = cc.loader.getXMLHttpRequest();
	var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
	// bind_xhr.open("GET", cutil.appendUrlParam("http://sxqp.zjfeixia.com/api/goods_info", []), true);
	bind_xhr.open("GET", cutil.appendUrlParam(switches.PHP_SERVER_URL + "/api/goods_info", []), true);

	bind_xhr.onreadystatechange = function () {
		// cutil.unlock_ui();
		if (bind_xhr.readyState === 4 && bind_xhr.status === 200) {
			cc.log(bind_xhr.responseText);
			if(bind_xhr.responseText[0] == "{") {
				cutil.unlock_ui();
				var pay_url_dict = JSON.parse(bind_xhr.responseText);
				if (pay_url_dict["errcode"] == 0) {
					cc.log("error code is 0 ");
					if(pay_url_dict.hasOwnProperty("data") && pay_url_dict.hasOwnProperty("isAgent")){
						// var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
						// var data = info_dict["isAgent"] ? pay_url_dict["proxy"]:pay_url_dict["user"];
						var data = pay_url_dict["data"];
						var is_agent = pay_url_dict["isAgent"];
						if(h1global.curUIMgr.shop_ui && !h1global.curUIMgr.shop_ui.is_show){
							h1global.curUIMgr.shop_ui.show_by_info(data,is_agent);
						}
					}else{
						cc.log("not find user and proxy");
					}
				}else{
					h1global.globalUIMgr.info_ui.show_by_info("无法找到商城价格表！", cc.size(300, 200));
				}
			} else {
				h1global.globalUIMgr.info_ui.show_by_info("商城请求失败！", cc.size(300, 200));
			}
		}else{
			cc.log("readyState error",bind_xhr.readyState);
			cc.log("bind_xhr.status",bind_xhr.status);
		}
	};
	bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
	bind_xhr.send();
};
