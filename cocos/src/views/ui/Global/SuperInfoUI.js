"use strict";
var SuperInfoUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/SuperInfoUI.json";
	},

	initUI:function(){
		cutil.unlock_ui();
        this.bg_img = this.rootUINode.getChildByName("bg_img");
        var self = this;
        this.rootUINode.getChildByName("bg_panel").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        });
        this.rootUINode.getChildByName("bg_panel").setOpacity(0);
	},
    /**
     * function show_by_info
     * @param content 内容  \n 换行
     * @param c_size  显示大小
     * @param f_size  字体大小
     * @param lineHeight 间距
     */
	show_by_info:function(content, c_size,f_size,lineHeight){
		if(this.is_show){
			this.hide();
			// return;
		}
		c_size = c_size || cc.size(653.4,60);
		f_size = f_size || 28;
		var self = this;
		this.show(function(){
			//设置图片大小
			self.bg_img.setContentSize(c_size);
            var msg_label = new cc.LabelTTF(content,"zhunyuan",f_size);
            if(lineHeight){
                msg_label.setLineHeight(lineHeight);
            }
            self.bg_img.addChild(msg_label);
            msg_label.setPosition(self.bg_img.width*0.5,self.bg_img.height*0.5);
		});
	},

	show_by_time:function(head,content,wait_time,touch_time){
        if(this.is_show){
            return;
        }

        var self = this;
        this.show(function(){
            var content_label = self.bg_img.getChildByName("content_label");
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

    /**
     * function show_by_fade
     * @param content 内容  \n 换行
     * @param duration 消失时间
     * @param c_size  显示大小
     * @param f_size  字体大小
     * @param lineHeight 间距
     */
    show_by_fade:function(content,dict){
        if(this.is_show){
            return;
        }
        // this.rootUINode.getChildByName("bg_panel").setVisible(false);
        var duration = dict["duration"] || 1;
        var c_size = dict["c_size"] || cc.size(653.4,60);
        var f_size = dict["f_size"] || 28;
        var img_pos = dict["img_pos"] || cc.p(cc.winSize.width *0.5 , cc.winSize.height * 0.5);

        var self = this;
        this.show(function(){
            self.bg_img.setContentSize(c_size);
            var msg_label = new cc.LabelTTF(content,"zhunyuan",f_size);
            if(dict["lineHeight"]){
                msg_label.setLineHeight(dict["lineHeight"]);
            }
            self.bg_img.addChild(msg_label);
            msg_label.setPosition(self.bg_img.width*0.5,self.bg_img.height*0.5);
            self.bg_img.setPosition(img_pos);

            self.bg_img.runAction(cc.sequence(cc.delayTime(duration), cc.fadeOut(0.3),cc.callFunc(function(){
                self.hide();
            })));

        });
    },


});