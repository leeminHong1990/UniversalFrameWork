"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impCommunicate = impCell.extend({
	__init__ : function()
	{
		this._super();
  	},

	sendEmotion : function(eid){
		// TEST:
		this.cellCall("sendEmotion", eid);
		this.recvEmotion(this.serverSitNum, eid);
		// cc.localStorage.setItem("send_emotion_or_msg_time",Math.round(new Date() / 1000));
		if(h1global.player()){
            h1global.player().emotion_time = Math.round(new Date() / 1000);
		}
	},

	recvEmotion : function(serverSitNum, eid){
		if(eid <= 0 || eid >= 19){
			return;
		}
		if (!h1global.curUIMgr) {
			return;
		}
		if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && h1global.curUIMgr.gameroomprepare_ui.playEmotionAnim) {
			h1global.curUIMgr.gameroomprepare_ui.playEmotionAnim(serverSitNum, eid);
		} else if (h1global.curUIMgr && h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("playEmotionAnim", serverSitNum, eid);
		}
	},

	sendMsg : function(mid, msg){
		// TEST
        msg = msg || "";
		this.cellCall("sendMsg", mid, msg);
		this.recvMsg(this.serverSitNum, mid, msg);
        if(h1global.player()){
            h1global.player().msg_time = Math.round(new Date() / 1000);
        }
	},

	recvMsg: function (serverSitNum, mid, msg) {
		if (mid < 0 && msg == "") {
			return;
		}
		if (!this.curGameRoom) {
			return;
		}
		// var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
		if (mid >= 0 && !table_msg[mid]) {
			return;
		}
		var info_dict = this.curGameRoom.playerInfoList[serverSitNum];
		msg = msg == "" ? table_msg[mid]['name'] : msg;
		var baseDir = "";
		var info = table_msg[mid];
		if (info) {
			baseDir = info['root'];
		}
		if (!h1global.curUIMgr) {
			return;
		}
		if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && h1global.curUIMgr.gameroomprepare_ui.playMessageAnim) {
			h1global.curUIMgr.gameroomprepare_ui.playMessageAnim(serverSitNum, msg);
			if (mid >= 0) {
				if (info_dict["sex"] == 1) {
					cc.audioEngine.playEffect(baseDir + "male/sound_man_msg_" + mid.toString() + ".mp3");
				} else {
					cc.audioEngine.playEffect(baseDir + "female/sound_woman_msg_" + mid.toString() + ".mp3");
				}
			}
		} else if (h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
			h1global.curUIMgr.roomLayoutMgr.notifyObserver("playMessageAnim", serverSitNum, msg);
			if (mid > 0) {
				if (info_dict["sex"] == 1) {
					cc.audioEngine.playEffect(baseDir + "male/sound_man_msg_" + mid.toString() + ".mp3");
				} else {
					cc.audioEngine.playEffect(baseDir + "female/sound_woman_msg_" + mid.toString() + ".mp3");
				}
			}
		}
	},

    sendExpression : function(fromIdx, toIdx, eid){
        // TEST:
		cc.log("fromIdx:" + fromIdx + " toIdx:" + toIdx + " eid:" + eid);
        this.cellCall("sendExpression", fromIdx, toIdx, eid);
        this.recvExpression(fromIdx, toIdx, eid);
    },

    recvExpression : function(fromIdx, toIdx, eid){
        if(eid < 0 || eid > const_val.EXPRESSION_ANIM_LIST.length - 1){
            return;
        }
        fromIdx = h1global.player().server2CurSitNum(fromIdx);
        toIdx = h1global.player().server2CurSitNum(toIdx);
        if (h1global.curUIMgr &&  h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
            h1global.curUIMgr.roomLayoutMgr.notifyObserver( "playExpressionAnim", fromIdx, toIdx, eid);
            var effect_root = "res/sound/effect/";
            switch(eid){
                case 0:
                    cc.audioEngine.playEffect(effect_root + const_val.EXPRESSION_ANIM_LIST[eid] +".mp3");
                    break;
                case 1:
                    cc.audioEngine.playEffect(effect_root + "kiss.mp3");
                    break;
                case 2:
                    cc.audioEngine.playEffect(effect_root + "cheers.mp3");
                    break;
                case 3:
                    //cc.audioEngine.playEffect(effect_root + "money.mp3");
                    break;
                default:
                    break;
            }
        }
    },

	sendVoice : function(url, record_time){
		this.cellCall("sendVoice", url, record_time);
		this.recvVoice(this.serverSitNum, url, record_time);
	},

	sendAppVoice : function(url, record_time){
		this.cellCall("sendAppVoice", url, record_time);
		this.recvAppVoice(this.serverSitNum, url, record_time);
	},

	recvVoice : function(serverSitNum, url, record_time){
        if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
			return;
		}
		var self = this;
		wx.downloadVoice({
	      	serverId: url,
	      	success: function (res) {
	        	// alert('下载语音成功，localId 为' + res.localId);
	        	// voice.localId = res.localId;
	        	// 直接播放
	        	// var talk_img = undefined;
		        if (!h1global.curUIMgr) {
			        return
		        }
				if(h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && h1global.curUIMgr.gameroomprepare_ui.playVoiceAnim){
					h1global.curUIMgr.gameroomprepare_ui.playVoiceAnim(serverSitNum, record_time)
				} else if (h1global.curUIMgr &&  h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()){
					h1global.curUIMgr.roomLayoutMgr.notifyObserver( "playVoiceAnim", serverSitNum, record_time);
				}
				// self.voiceCache[res.localId] = talk_img;
	        	wx.playVoice({
			      	localId: res.localId,
			    });
	      	}
	    });
	},

	recvAppVoice : function(serverSitNum, fileID, record_time){
		cc.log("recvAppVoice#######################################################");
		cc.log(fileID);
        // 直接播放
		if (!h1global.curUIMgr) {
			return;
		}
		if (h1global.curUIMgr.gameroomprepare_ui && h1global.curUIMgr.gameroomprepare_ui.is_show && h1global.curUIMgr.gameroomprepare_ui.playVoiceAnim) {
            h1global.curUIMgr.gameroomprepare_ui.playVoiceAnim(serverSitNum, record_time / 1000);
        } else if(h1global.curUIMgr &&  h1global.curUIMgr.roomLayoutMgr && h1global.curUIMgr.roomLayoutMgr.isShow()) {
            h1global.curUIMgr.roomLayoutMgr.notifyObserver( "playVoiceAnim", serverSitNum, record_time / 1000);
        }
        cutil.download_voice(fileID);
	},

	sendEffect:function(eid){
		this.cellCall("sendEffect", eid);
		this.recvEffect(this.serverSitNum, eid);
		// cc.localStorage.setItem("send_emotion_or_msg_time",Math.round(new Date() / 1000));
		if(h1global.player()){
			h1global.player().effect_time = Math.round(new Date() / 1000);
		}
	},

	recvEffect:function(serverSitNum, eid){
		if(const_val.EFFECT_NUM_LIST.indexOf(eid) === -1){
			return;
		}
		if (!h1global.curUIMgr || !h1global.curUIMgr.gameroominfo_ui) {
			return;
		}
		if(h1global.curUIMgr.getChildByName("effect_ui")){
			emotion.playFiscal(h1global.curUIMgr.getChildByName("effect_ui"),eid,serverSitNum);
		}else{
			var effect_ui = new cc.Layer();
			effect_ui.setContentSize(cc.director.getWinSize());
			effect_ui.setName("effect_ui");
			h1global.curUIMgr.addChild(effect_ui , const_val.CommunicateZOrder+5);
			emotion.playFiscal(effect_ui,eid,serverSitNum);
		}
		//播放文字
		// emotion.playFiscalWord(h1global.curUIMgr.getChildByName("effect_ui"),eid,serverSitNum);
	},
});
