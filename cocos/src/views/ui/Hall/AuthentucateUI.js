"use strict";
var AuthentucateUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/AuthentucateUI.json";
    },

    initUI:function() {
        var self = this;
        this.authentucate_panel = this.rootUINode.getChildByName("authentucate_panel");
        this.authentucate_panel.getChildByName("close_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        });
        this.touch_time = 0;
        this.wait_time = 60;
        this.msg_id = undefined;

        this.init_panel = this.authentucate_panel.getChildByName("init_panel");
        this.cellphone_panel = this.authentucate_panel.getChildByName("cellphone_panel");
        this.id_panel = this.authentucate_panel.getChildByName("id_panel");
        this.init_panel.setVisible(true);
        this.cellphone_panel.setVisible(false);
        this.id_panel.setVisible(false);
        this.update_init_panel();
        //检测是否在60秒的验证码时间内
        var touch_json = cc.sys.localStorage.getItem("PHONE_TOUCH_TIME_JSON");
        if(touch_json){
            var touch_dict = JSON.parse(touch_json);
            this.touch_time = touch_dict["touch_time"];
            //判断如果验证码时间还未结束，就继续显示等待
            var now_time = Math.round(new Date() / 1000);
            if(now_time - self.touch_time < self.wait_time){
                self.show_wait_label();
            }
        }

        //防沉迷协议
        this.id_panel.getChildByName("anti_addiction_btn").hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(0, -size.height * 0.3, size.width, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        this.id_panel.getChildByName("anti_addiction_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cc.log("防沉迷协议");
                cutil.open_url("http://sxqpupdate.zjfeixia.com/protocols/anti_addiction_agreement.html");
            }
        });

        var phone_num_tf = this.cellphone_panel.getChildByName("phone_num_tf");
        var verificate_num_tf = this.cellphone_panel.getChildByName("verificate_num_tf");
        //获取验证码
        this.cellphone_panel.getChildByName("verificate_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cc.log("verificate_btn");
                // //模仿这个方法
                // self.touch_time = Math.round(new Date() / 1000);
                // var json = '{"touch_time":'+ self.touch_time +'}';
                // cc.sys.localStorage.setItem("PHONE_TOUCH_TIME_JSON", json);
                //
                // self.show_wait_label();
                // return;
                var phone_num = phone_num_tf.getString();
                if(phone_num) {
                    //一个粗略的判断手机号的正则表达式
                    if ((/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/).test(phone_num)) {
                        var now_time = Math.round(new Date() / 1000);
                        if(now_time - self.touch_time < self.wait_time){
                            // h1global.globalUIMgr.info_ui.show_by_time("","秒之后可以重新获取。",self.wait_time,self.touch_time);
                            self.show_wait_label();
                        }else{
                            var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                            var bind_xhr = cc.loader.getXMLHttpRequest();
                            cc.log(cutil.appendUrlParam(switches.PHP_SERVER_URL + "/sms/get_code", ['phone', phone_num]));
                            bind_xhr.open("GET", cutil.appendUrlParam(switches.PHP_SERVER_URL + "/sms/get_code", ['phone', phone_num]), true);
                            bind_xhr.onreadystatechange = function(){
                                cutil.unlock_ui();
                                if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
                                    var result = JSON.parse(bind_xhr.responseText);
                                    if(result && result["errcode"]==0){
                                        phone_num_tf.setTouchEnabled(false);
                                        self.touch_time = Math.round(new Date() / 1000);
                                        var json = '{"touch_time":'+ self.touch_time +'}';
                                        cc.sys.localStorage.setItem("PHONE_TOUCH_TIME_JSON", json);
                                        self.show_wait_label();
                                        self.msg_id = result["msg_id"];
                                        cc.log(self.msg_id);
                                        h1global.globalUIMgr.info_ui.show_by_info("发送成功，请等待验证码短信！");
                                    }else{
                                        h1global.globalUIMgr.info_ui.show_by_info("发送失败！请再试试");
                                        return;
                                    }
                                }else{
                                    h1global.globalUIMgr.info_ui.show_by_info("发送失败！请再试试");
                                    return;
                                }
                            };
                            bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
                            bind_xhr.send();
                            cutil.lock_ui();
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

        //手机验证提交
        this.cellphone_panel.getChildByName("submit_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                cc.log("phone:", phone_num_tf.getString());
                cc.log("msg_id:", self.msg_id);
                cc.log("code:", verificate_num_tf.getString());
                // var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                // info_dict["phone"] = phone_num_tf.getString();
                // cc.sys.localStorage.setItem("INFO_JSON",JSON.stringify(info_dict));
                // self.hide();
                // return;

                var verificate_num = verificate_num_tf.getString();
                if(verificate_num && (/^\d{6}$/).test(verificate_num)){
                    self.now_phone = phone_num_tf.getString();
                    var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                    var bind_xhr = cc.loader.getXMLHttpRequest();
                    bind_xhr.open("POST", switchesnin1.PHP_SERVER_URL + "/api/update_phone", true);
                    bind_xhr.onreadystatechange = function(){
                        cutil.unlock_ui();
                        cc.log("result:",bind_xhr.responseText);
                        if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
                            var result = JSON.parse(bind_xhr.responseText);
                            if(result && result["errcode"]==0){
                                self.hide();
                                h1global.globalUIMgr.info_ui.show_by_info("手机验证成功！");
                                var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                                info_dict["phone"] = self.now_phone;
                                cc.log(info_dict);
                                cc.sys.localStorage.setItem("INFO_JSON",JSON.stringify(info_dict));
                                if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                                    h1global.curUIMgr.gamehall_ui.updateCharacterCard();
                                    h1global.curUIMgr.gamehall_ui.update_authenticate_btn();
                                }
                            }else{
                                h1global.globalUIMgr.info_ui.show_by_info("手机验证失败！请重试");
                                return;
                            }
                        }else{
                            h1global.globalUIMgr.info_ui.show_by_info("提交失败！请重试");
                            return;
                        }
                    };
                    bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
                    bind_xhr.send(cutil.postDataFormat({"phone": phone_num_tf.getString(),"msg_id": self.msg_id,"code": verificate_num_tf.getString()}));
                    cutil.lock_ui();
                }else{
                    h1global.globalUIMgr.info_ui.show_by_info("验证码错误，请重试！");
                }
            }
        });

        var name_tf = this.id_panel.getChildByName("name_tf");
        var id_num_tf = this.id_panel.getChildByName("id_num_tf");
        //身份证验证提交
        this.id_panel.getChildByName("submit_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {


                //return
                cc.log("id submit_btn");
                var id_num = id_num_tf.getString();
                var name = name_tf.getString();
                var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");//判断是否为汉字的正则表达式
                if(name && id_num) {
                    if(reg.test(name)) {
                        //一个粗略的判断身份证号的正则表达式
                        //if ((/^[1-9]\d{5}(19|20)\d{2}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/).test(id_num)) {
                        if ((/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/).test(id_num)) {
                            //h1global.globalUIMgr.info_ui.show_by_info("暂未开放！");
                            if(h1global.player()){
                                var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                                // if (!((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) || switches.TEST_OPTION)) {
                                //
                                // }else{
                                //     self.hide();
                                //     var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                                //     if(info_dict["remark"]){
                                //         var str = Base64.decode(info_dict["remark"]);
                                //         var remark_dict = JSON.parse(str);
                                //         cc.log(remark_dict);
                                //         remark_dict["identity"] = 1;
                                //         remark_dict["name"] = 1;
                                //         info_dict["remark"] = Base64.encode(JSON.stringify(remark_dict));
                                //         cc.log(remark_dict);
                                //     }else{
                                //         info_dict["remark"] = Base64.encode(JSON.stringify({"name":1,"identity":1}));
                                //         cc.log(info_dict["remark"]);
                                //     }
                                //
                                //     cc.sys.localStorage.setItem("INFO_JSON",JSON.stringify(info_dict));
                                //     if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                                //         h1global.curUIMgr.gamehall_ui.update_authenticate_btn();
                                //     }
                                //     h1global.globalUIMgr.info_ui.show_by_info("验证成功，但在浏览器上没用！");
                                //     return;
                                // }
                                var bind_xhr = cc.loader.getXMLHttpRequest();
                                bind_xhr.open("POST", switchesnin1.PHP_SERVER_URL + "/api/update_realname", true);
                                bind_xhr.onreadystatechange = function(){
                                    cutil.unlock_ui();
                                    if(bind_xhr.readyState === 4 && bind_xhr.status === 200){
                                        var temp = JSON.parse(bind_xhr.responseText);
                                        if(temp && temp["errcode"]==0){
                                            self.hide();
                                            var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                                            if(info_dict["remark"]){
                                                var str = Base64.decode(info_dict["remark"]);
                                                var remark_dict = JSON.parse(str);
                                                cc.log(remark_dict);
                                                remark_dict["identity"] = 1;
                                                remark_dict["name"] = 1;
                                                info_dict["remark"] = Base64.encode(JSON.stringify(remark_dict));
                                                cc.log(remark_dict);
                                            }else{
                                                info_dict["remark"] = Base64.encode(JSON.stringify({"name":1,"identity":1}));
                                                cc.log(info_dict["remark"]);
                                            }
                                            cc.sys.localStorage.setItem("INFO_JSON",JSON.stringify(info_dict));
                                            if(h1global.curUIMgr.gamehall_ui && h1global.curUIMgr.gamehall_ui.is_show){
                                                h1global.curUIMgr.gamehall_ui.update_authenticate_btn();
                                            }
                                            h1global.globalUIMgr.info_ui.show_by_info("验证成功！");
                                        }else{
                                            h1global.globalUIMgr.info_ui.show_by_info("验证失败！");
                                            return;
                                        }
                                    }else{
                                        h1global.globalUIMgr.info_ui.show_by_info("验证失败！请重试");
                                        return;
                                    }
                                };
                                bind_xhr.setRequestHeader("Authorization", "Bearer " + info_dict["token"]);
                                bind_xhr.send(cutil.postDataFormat({"name": name_tf.getString(),"identity": id_num_tf.getString()}));
                                cutil.lock_ui();
                            }
                        } else {
                            h1global.globalUIMgr.info_ui.show_by_info("请输入正确的身份证号码！");
                        }
                    }else {
                        h1global.globalUIMgr.info_ui.show_by_info("姓名不合法！");
                    }
                }else {
                    h1global.globalUIMgr.info_ui.show_by_info("姓名或身份证号不能为空！");
                }
            }
        });
        //注释掉这段代码就可以 开启手机验证界面了
        // this.init_panel.setVisible(false);
        // this.id_panel.setVisible(true);
    },

    update_init_panel:function(){
        var self = this;
        this.init_panel.getChildByName("cellphone_btn").getChildByName("get_check_img").setVisible(false);
        this.init_panel.getChildByName("identification_btn").getChildByName("get_check_img").setVisible(false);

        this.init_panel.getChildByName("cellphone_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                self.init_panel.setVisible(false);
                self.cellphone_panel.setVisible(true);
            }
        });
        this.init_panel.getChildByName("identification_btn").addTouchEventListener(function(sender, eventType) {
            if(eventType == ccui.Widget.TOUCH_ENDED) {
                self.init_panel.setVisible(false);
                self.id_panel.setVisible(true);
            }
        });
        var mark_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
        if(mark_dict["remark"]){
            var str = Base64.decode(mark_dict["remark"]);
            var remark_dict = JSON.parse(str);
            if(remark_dict["identity"]){
                this.init_panel.getChildByName("identification_btn").getChildByName("get_check_img").setVisible(true);
                this.init_panel.getChildByName("identification_btn").setTouchEnabled(false);
            }
        }
        cc.log("mark_dict['phone']:",mark_dict["phone"]);
        if(mark_dict["phone"] && mark_dict["phone"].toString().length==11){
            this.init_panel.getChildByName("cellphone_btn").getChildByName("get_check_img").setVisible(true);
            this.init_panel.getChildByName("cellphone_btn").setTouchEnabled(false);
        }

        //送几张房卡

        // if(1){
        //     this.init_panel.getChildByName("prompt_panel").getChildByName("label_0").setString("不送房卡");
        //     this.init_panel.getChildByName("prompt_panel").getChildByName("label_1").setVisible(false);
        // }else{
        //     this.init_panel.getChildByName("prompt_panel").getChildByName("label_1").setString("2张房卡");
        // }

    },

    show_wait_label:function(){
        var self = this;
        var label = ccui.Text.create("","zhunyuan",30);
        label.setTextColor(cc.color(169, 111, 89));
        self.cellphone_panel.getChildByName("verificate_btn").setVisible(false);
        self.cellphone_panel.addChild(label);
        label.setPosition(self.cellphone_panel.getChildByName("verificate_btn").getPosition());

        cutil.set_time_label(label,"","秒",self.wait_time,self.touch_time,function(){
            self.cellphone_panel.getChildByName("verificate_btn").setVisible(true);
            label.removeFromParent(true);
        });
    },
});