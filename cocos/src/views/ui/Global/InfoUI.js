"use strict";
var InfoUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/InfoUI.json";
	},

	initUI:function(){
		cutil.unlock_ui();
		this.info_panel = this.rootUINode.getChildByName("info_panel");
		var self = this;
		this.info_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				self.hide();
			}
		});
	},

	show_by_info:function(content, c_size, confirm_btn_func, hide_on_close){
		if (hide_on_close === undefined) {
			hide_on_close = true;
		}
		if(this.is_show){
			return;
		}
		c_size = c_size || cc.size(530, 302);
		var self = this;
		this.show(function(){
			// self.info_panel.setContentSize(cc.size(c_size.width + 70, c_size.height + 70));
			// self.info_panel.getChildByName("return_btn").setPosition(cc.p((c_size.width + 70) * 0.95, (c_size.height + 70) * 0.95));
			var content_label = self.info_panel.getChildByName("content_label");
			// content_label.setPosition(cc.p((c_size.width + 70) * 0.5, (c_size.height + 70) * 0.5));
			// content_label.setContentSize(c_size);
			content_label.setString(content);
			if(confirm_btn_func){
				self.info_panel.getChildByName("return_btn").addTouchEventListener(function(sender, eventType){
					if(eventType == ccui.Widget.TOUCH_ENDED){
						if (hide_on_close) {
							self.hide();
						}
						confirm_btn_func();
					}
				});
				var confirm_btn = self.info_panel.getChildByName("confirm_btn");
				confirm_btn.addTouchEventListener(function(sender, eventType){
					if(eventType == ccui.Widget.TOUCH_ENDED){
						if (hide_on_close) {
							self.hide();
						}
						confirm_btn_func();
					}
				});
				//confirm_btn.setVisible(true);
			}
		});
	},

	show_by_time:function(head,content,wait_time,touch_time){
        if(this.is_show){
            return;
        }

        var self = this;
        this.show(function(){
            var content_label = self.info_panel.getChildByName("content_label");
            content_label.runAction(cc.repeat(cc.sequence(cc.callFunc(function () {
                var now_time = Math.round(new Date() / 1000);
                if(now_time - touch_time < wait_time){
                    cc.log(wait_time-(now_time - touch_time)+"秒之后可以重新获取。");
                    content_label.setString(head+(wait_time-(now_time - touch_time))+content);
                }else{
                    cc.log("时间到~");
                    self.hide();
                    return;
                }
            }),cc.delayTime(1.0)),wait_time));

        });
	},
});