"use strict";
var NoviceGiftUI = UIBase.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/NoviceGiftUI.json";
        this.setLocalZOrder(const_val.MAX_LAYER_NUM);
    },

    initUI:function(){
        //如果买过礼物 则直接return
        var mark_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        var remark_dict = null;
        if(mark_dict["remark"]){
            var str = Base64.decode(mark_dict["remark"]);
            remark_dict = JSON.parse(str);
        }
        if(remark_dict && remark_dict["buy_gift"] && remark_dict["buy_gift"] == 1){
            cc.log("符合不出现首充礼包的条件");
            this.check = 1;
            if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                h1global.curUIMgr.gamehall_ui.remove_gift_btn();
            }
            return;
        }
		this.use_native_pay = false;
		if(cc.sys.localStorage.getItem('HAS_NATIVE_PAY') == 1){
			this.use_native_pay = true;
		}

        var self = this;
        var gift_panel = this.rootUINode.getChildByName("gift_panel");
        var gift_btn = gift_panel.getChildByName("gift_btn");
        gift_btn.addTouchEventListener(function (sender, eventType) {
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                cc.log("跳转到购买api");
                cutil.lock_ui();
				if(self.use_native_pay){
					cutil.get_pay_url2(7);
				}else{
					if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
						if (switches.appstore_check == true) {
							var funcId = cutil.addFunc(function (result) {
								cutil.unlock_ui();
								cc.log(result);
								if (result == 'YES') {
									h1global.curUIMgr.gamehall_ui.updateCharacterCard();
								}
							});
							cutil.lock_ui();
							jsb.reflection.callStaticMethod("IAPOcBridge", "startPurchWithID:completeHandle:", "20_cards", funcId);
						} else {
							cutil.get_pay_url(7);
						}
					} else if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
						cutil.get_pay_url(7);
					} else {
						cutil.get_pay_url(7);
					}
                }
            }
        });
        gift_panel.getChildByName("effect").runAction(cc.RepeatForever.create(cc.Sequence.create(
            cc.rotateBy(1,180)
        )));
    },

    onShow: function () {
        if(this.check){
            this.hide();
            return;
        }
        let self = this;
        BasicDialogUI.addColorMask(this.rootUINode, 0.5, function () {
            self.hide()
        }, cc.color(0,0,0,255*0.8));
        BasicDialogUI.applyShowEffect(this);
    },

});