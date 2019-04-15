"use strict"

var CSUI = BasicDialogUI.extend({
   ctor:function () {
       this._super();
       this.resourceFilename = "res/ui/CSUI.json";
   },

    initUI:function () {
        var self = this;
        var cs_panel = this.rootUINode.getChildByName("cs_panel");

        // cs_panel.getChildByName("wx_label").setString(switches.customerService_wx);
        var service_panel_0 = cs_panel.getChildByName("service_panel_0");
        var service_panel_1 = cs_panel.getChildByName("service_panel_1");
        service_panel_0.getChildByName("wx_label").setString("FXQP01A");
        service_panel_1.getChildByName("wx_label").setString("飞侠互娱");

        var return_btn = cs_panel.getChildByName("return_btn");
        function return_btn_event(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.hide()
            }
        }
        return_btn.addTouchEventListener(return_btn_event);

        var copy_btn = service_panel_0.getChildByName("copy_btn");
        function copy_btn_event(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                cutil.copyToClipBoard("FXQP01A");
            }
        }
        copy_btn.addTouchEventListener(copy_btn_event);

        var copy_btn2 = service_panel_1.getChildByName("copy_btn");
        function copy_btn_event2(sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                cutil.copyToClipBoard("飞侠互娱");
            }
        }
        copy_btn2.addTouchEventListener(copy_btn_event2);

        this.init_submit_panel();
    },

    init_submit_panel:function(){
       var self = this;
       var submit_panel = this.rootUINode.getChildByName("cs_panel").getChildByName("submit_panel");
       var phone_num_tf = submit_panel.getChildByName("phone_tf");
       var msg_tf = submit_panel.getChildByName("msg_tf");

       // msg_tf.setPlaceHolderColor(cc.color(251,241,210));
       // phone_num_tf.setPlaceHolderColor(cc.color(251,241,210));
        msg_tf.setPlaceHolderColor(cc.color(255,255,255));
        phone_num_tf.setPlaceHolderColor(cc.color(255,255,255));
        msg_tf.setTextColor(cc.color(128,59,31));
        phone_num_tf.setTextColor(cc.color(128,59,31));

        // cc.log(msg_tf);

       submit_panel.getChildByName("submit_btn").addTouchEventListener(function(sender, eventType) {
           if (eventType == ccui.Widget.TOUCH_ENDED) {
               var phone_num = phone_num_tf.getString();
               if(phone_num) {
                   //一个粗略的判断手机号的正则表达式
                   if ((/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/).test(phone_num)) {
                        var msg = msg_tf.getString();
                        if(msg && msg.length>=10 && /.*[\u4e00-\u9fa5]+.*$/.test(msg)){
                            // self.hide();
                            // h1global.globalUIMgr.info_ui.show_by_info("提交成功，感谢您的建议！");
                            // return;
                            var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                            var bind_xhr = cc.loader.getXMLHttpRequest();
                            bind_xhr.open("POST", switchesnin1.PHP_SERVER_URL + "/api/feedback", true);
                            bind_xhr.onreadystatechange = function(){
                                cutil.unlock_ui();
                                if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
                                    var result = JSON.parse(bind_xhr.responseText);
                                    if(result && result["errcode"]==0){
                                        self.hide();
                                        h1global.globalUIMgr.info_ui.show_by_info("提交成功，感谢您的建议！");
                                    }else{
                                        h1global.globalUIMgr.info_ui.show_by_info("提交失败！请再试试");
                                        return;
                                    }
                                }else{
                                    h1global.globalUIMgr.info_ui.show_by_info("提交失败！请再试试");
                                    return;
                                }
                            };
                            bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
                            bind_xhr.send(cutil.postDataFormat({"phone": phone_num_tf.getString(),"content": msg_tf.getString()}));
                            cutil.lock_ui();
                        }else{
                            if(msg){
                                if(/.*[\u4e00-\u9fa5]+.*$/.test(msg)){
                                    h1global.globalUIMgr.info_ui.show_by_info("提交内容不能少于10个字");
                                }else{
                                    h1global.globalUIMgr.info_ui.show_by_info("请输入中文");
                                }
                                return;
                            }
                            h1global.globalUIMgr.info_ui.show_by_info("提交不能为空！");
                        }
                   } else {
                       h1global.globalUIMgr.info_ui.show_by_info("手机号码错误！");
                       phone_num_tf.setString("");
                   }
               }else {
                   h1global.globalUIMgr.info_ui.show_by_info("手机号码不能为空！");
               }
           }
       });

    },
});