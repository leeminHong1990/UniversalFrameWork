"use strict";
var ShareSelectUI = BasicDialogUI.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/ShareSelectUI.json";
		this.setLocalZOrder(const_val.MAX_LAYER_NUM + 1);
	},

	initUI:function(){
		this.info_panel = this.rootUINode.getChildByName("info_panel");
		var self = this;
		this.check_num = 0;
		this.info_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				self.hide();
			}
		});
	},

	check_self:function (software) {
		var self = this;
		software = software || undefined;
		self.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function () {
			if (self.check_num >= 5) {
				cc.log("shareselect_ui check overtime!");
				return;
			}
			if (h1global.curUIMgr.ui_show_stack.indexOf(self) < 0) {
				self.check_num = 0;
				if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
					jsb.fileUtils.captureScreen("", "screenShot.png");
				} else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
					if (software == "Wechat") {
						jsb.reflection.callStaticMethod("WechatOcBridge", "takeScreenShot");
					} else if (software == "Xianliao") {
						jsb.reflection.callStaticMethod("XianliaoOcBridge", "takeScreenShot");
					} else {
						cc.log("Unknown software!");
					}
				} else {
					cc.log("share not support web");
				}
			} else {
				cc.log("shareselect_ui not pop!");
				self.check_num++;
				self.check_self(software);
			}
		})))
	},

	show_by_info:function(share_url, share_title, share_desc){
		if(this.is_show){
			return;
		}
		share_url = share_url || undefined;
		share_title = share_title || undefined;
		share_desc = share_desc || undefined;
		var self = this;
		this.show(function(){

			self.info_panel.getChildByName("wechat_btn").addTouchEventListener(function(sender, eventType){
				if(eventType == ccui.Widget.TOUCH_ENDED){
					self.hide();
					if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
						if (share_url !== undefined) {
							jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", true, share_url, share_title, share_desc);
						} else {
							cc.sys.localStorage.setItem("SHARE_XIANLIAO", 0);
							self.check_self();
						}
					} else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
						if (share_url !== undefined) {
							jsb.reflection.callStaticMethod("WechatOcBridge", "callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", true, share_url, share_title, share_desc);
						} else {
							cc.sys.localStorage.setItem("SHARE_XIANLIAO", 0);
							self.check_self("Wechat");
						}
					} else {
						cc.log("share not support web");
					}
				}
			});

			self.info_panel.getChildByName("xianliao_btn").addTouchEventListener(function(sender, eventType){
				if(eventType == ccui.Widget.TOUCH_ENDED) {
					self.hide();
					if (cutil.isXianliaoInstalled()) {
						if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
							if (share_url !== undefined) {
								jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callXianliaoShareUrl", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", share_url, share_title, share_desc);
							} else {
								cc.sys.localStorage.setItem("SHARE_XIANLIAO", 1);
								self.check_self();
							}
						} else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
							if (share_url !== undefined) {
								jsb.reflection.callStaticMethod("XianliaoOcBridge","callXianliaoShareUrlFrom:withTitle:andDescription:", share_url, share_title, share_desc);
							} else {
								cc.sys.localStorage.setItem("SHARE_XIANLIAO", 1);
								self.check_self("Xianliao");
							}
						} else {
							cc.log("share not support web");
						}
					} else {
						h1global.globalUIMgr.info_ui.show_by_info("您没有安装闲聊！");
					}
				}
			});
		});
	},
});