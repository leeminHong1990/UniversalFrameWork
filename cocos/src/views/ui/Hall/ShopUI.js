// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
var ShopUI = BasicDialogUI.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/ShopUI.json";
	},

	initUI:function(){
		this.use_native_pay = false;
		this.shop_panel = this.rootUINode.getChildByName("shop_panel");
		var self = this;
		var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');

		if(cc.sys.localStorage.getItem('HAS_NATIVE_PAY') == 1){
            this.use_native_pay = true;
		}

		this.shop_panel.getChildByName("return_btn").addTouchEventListener(function (sender, eventType) {
			if(eventType == ccui.Widget.TOUCH_ENDED) {
				self.hide();
				cutil.get_user_info("wx_" + info_dict["unionid"], function(content){
					if(content[0] != '{'){
						return;
					}
					var info = eval('(' + content + ')');
					h1global.curUIMgr.gamehall_ui.update_roomcard(info["card"].toString());
					if(h1global.player()){
						h1global.player().card_num = info["card"];
					}
				});

			}
		});

		var card_panel = this.shop_panel.getChildByName("card_panel");
		var card_scroll = card_panel;
		for (var i = 0 ; i < 6 ; i++) {
			let idx = i;
			var item_panel = card_scroll.getChildByName("item_panel_" + idx.toString());
			var shop_buy_btn = item_panel.getChildByName("shop_buy_btn");
			shop_buy_btn.addTouchEventListener(function (sender, eventType) {
				if (eventType == ccui.Widget.TOUCH_ENDED) {
					// h1global.globalUIMgr.info_ui.show_by_info("暂未开放！");
					cutil.lock_ui();
					if(self.use_native_pay){
						// cutil.get_pay_url2(idx+1);
						cutil.get_pay_url2(sender.goods_id);
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
                                jsb.reflection.callStaticMethod("IAPOcBridge", "startPurchWithID:completeHandle:", const_val.CARD_NUM_LIST[idx].toString() + "_cards", funcId);
                            } else {
                                cutil.get_pay_url(idx + 1);
                            }
                        } else if (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
                            cutil.get_pay_url(idx + 1);
                        } else {
                            cutil.get_pay_url(idx + 1);
                        }
					}
				}
			});
		}

		this.update_card_price();
	},

	update_card_price: function () {
		var bottom_panel = this.shop_panel.getChildByName("bottom_panel");
		bottom_panel.getChildByName("bottom_tips_label").setVisible(false);//隐藏绑定邀请码更优惠的文字
		var card_panel = this.shop_panel.getChildByName("card_panel");
		var card_scroll = card_panel;
		for(var i = 0;i<6;i++){
			var item_panel = card_scroll.getChildByName("item_panel_" + i.toString());
			item_panel.setVisible(false);
		}
		if(this.price_list){
			for(var k in this.price_list){
				if(k>5){
					break;
				}
				// var item_panel = card_scroll.getChildByName("item_panel_" + (this.price_list[k]["id"]-1).toString());
				var item_panel = card_scroll.getChildByName("item_panel_" + k.toString());
				item_panel.setVisible(true);
				var card_num = this.price_list[k]["ori"];
				var handsel_num = this.price_list[k]["number"]-this.price_list[k]["ori"];
				var price_num = parseInt(this.price_list[k]["price"]);
				item_panel.getChildByName("card_num_label").setString(card_num+"房卡");
				item_panel.getChildByName("handsel_img").getChildByName("label").setString("送"+handsel_num);
				if(handsel_num <= 0){
					item_panel.getChildByName("handsel_img").setVisible(false);
				}
				var shop_buy_btn = item_panel.getChildByName("shop_buy_btn");
				shop_buy_btn.goods_id = this.price_list[k]["id"];
				shop_buy_btn.loadTextureNormal("ShopUI/shop_buy_btn_" + price_num + ".png", ccui.Widget.PLIST_TEXTURE);
			}

		}
	},

	show_by_info:function(price_list,is_agent){
		if(this.is_show){
			return;
		}
		if(!this.price_list){
			this.price_list = [];
		}
		this.price_list.unshift(price_list);
		this.price_list = price_list;
		var self = this;
		this.show(()=>{
			if(is_agent){
				var title_img = self.shop_panel.getChildByName("title_img");
				title_img.loadTexture("ShopUI/proxy_title_img.png", ccui.Widget.PLIST_TEXTURE);
				title_img.ignoreContentAdaptWithSize(true);
			}

		});
	},

});