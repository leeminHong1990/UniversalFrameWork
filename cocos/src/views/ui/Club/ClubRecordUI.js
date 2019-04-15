"use strict";

var ClubRecordUI = UIBase.extend({
    ctor:function () {
        this._super();
        this.resourceFilename = "res/ui/ClubRecordUI.json";
    },

    show_by_info:function (club_id) {
        if(!h1global.player() || !h1global.player().club_entity_dict[club_id]){return}
        this.club = h1global.player().club_entity_dict[club_id];
        this.show();
    },

    initUI:function () {
        var self = this;
	    let info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
	    this.nickname = info_dict["nickname"];

        this.all_page_index = 0;
        this.yest_page_index = 0;
        this.mine_page_index = 0;
        this.page_show_num = 10;
        this.filters = {};//上传参数
        this.cur_page_num = 1;//当前页数
        this.max_page_num = 1;//最大页数

        var record_panel = this.rootUINode.getChildByName("record_panel");
        //适配
        this.main_panel = this.rootUINode.getChildByName("main_panel");
        this.main_panel.getChildByName("right_panel").setPositionY(this.main_panel.getChildByName("top_bg").getPositionY()-this.main_panel.getChildByName("top_bg").height + 10);
        this.main_panel.getChildByName("left_panel").setPositionY(this.main_panel.getChildByName("top_bg").getPositionY()-this.main_panel.getChildByName("top_bg").height + 10);

        this.detail_panel = record_panel.getChildByName("detail_panel");
        this.back_btn = record_panel.getChildByName("back_btn");
        this.return_btn = record_panel.getChildByName("return_btn");
        this.title_img = record_panel.getChildByName("title_img")
        this.right_panel = this.rootUINode.getChildByName("main_panel").getChildByName("right_panel");
        this.left_panel = this.rootUINode.getChildByName("main_panel").getChildByName("left_panel");
        this.left_btn_panel = this.rootUINode.getChildByName("main_panel").getChildByName("left_panel").getChildByName("info_panel");

        function return_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.hide();
            }
        }
        function back_btn_event(sender, eventType) {
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                self.title_img.loadTexture("res/ui/CirclePopUI/record_title.png");
                self.right_panel.setVisible(true);
                self.left_panel.setVisible(true);
                self.detail_panel.setVisible(false);
                self.back_btn.setVisible(false);
                self.return_btn.setVisible(true);
                //self.curState = 0;
            }
        }
        this.back_btn.addTouchEventListener(back_btn_event);
        this.return_btn.addTouchEventListener(return_btn_event);

        var record_all_btn = this.left_btn_panel.getChildByName("record_all_btn");
        var record_yesterday_btn = this.left_btn_panel.getChildByName("record_yesterday_btn");
        var record_mine_btn = this.left_btn_panel.getChildByName("record_mine_btn");

        var record_all_scroll = this.right_panel.getChildByName("record_all_scroll");
        var record_yesterday_scroll = this.right_panel.getChildByName("record_yesterday_scroll");
        var record_mine_scroll = this.right_panel.getChildByName("record_mine_scroll");

        this.btn_list = [record_all_btn, record_yesterday_btn, record_mine_btn];
        this.scroll_list = [record_all_scroll, record_yesterday_scroll, record_mine_scroll];

        function update_now_tab(index){
            self.now_options = index;
            // self.update_page_panel(self);
            self.reset_filters(index);
            cutil.lock_ui();
            h1global.player().clubOperation(const_val.CLUB_OP_GET_FILTER_RECORDS, self.club.club_id,[0,self.page_show_num,self.filters]);
        }
        UICommonWidget.create_tab(this.btn_list, this.scroll_list,undefined,undefined,update_now_tab);
        //h1global.player().clubOperation(const_val.CLUB_OP_GET_RECORDS, self.club.club_id);

        this.init_page_btn_pt();
    },

    init_page_btn_pt:function () {
        var page_panel = this.rootUINode.getChildByName("main_panel").getChildByName("right_panel").getChildByName("page_panel");
        var left_page_btn = page_panel.getChildByName("left_page_btn");
        var right_page_btn = page_panel.getChildByName("right_page_btn");

        left_page_btn.hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(-size.width*0.1, -size.height * 0.3, size.width, size.height * 1.3);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        right_page_btn.hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(-size.width*0.1, -size.height * 0.3, size.width, size.height * 1.3);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };

        var self = this;
        left_page_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(self.cur_page_num==1){return;}
                self.cur_page_num--;
                h1global.player().clubOperation(const_val.CLUB_OP_GET_FILTER_RECORDS, self.club.club_id,[self.cur_page_num-1,self.page_show_num,self.filters]);
            }
        });

        right_page_btn.addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(self.cur_page_num == self.max_page_num){return;};
                self.cur_page_num++;
                h1global.player().clubOperation(const_val.CLUB_OP_GET_FILTER_RECORDS, self.club.club_id,[self.cur_page_num-1,self.page_show_num,self.filters]);
            }
        });


    },
    
    update_recrod:function (club_id, record_list) {
        if(!this.is_show){return;}
        if(this.club.club_id !== club_id){return;}
        // 时间排序 从大到小
        record_list.sort(function (a, b) {
           return b.time - a.time;
        });
        // 分数排序 从 大到小
        for(var i=0; i<record_list.length; i++){
            record_list[i]["player_info_list"].sort(function (a,b) {
                return b.score - a.score;
            })
        }
        var group_record_list = this.group_record(record_list);
        this.group_record_list = group_record_list;
        var self = this;
        //this.update_page_panel(self);
    },

    update_scroll:function (scroll, info_list) {
        if(info_list.length>0){
            this.rootUINode.getChildByName("main_panel").getChildByName("right_panel").getChildByName("printed").setVisible(false);
        }else{
            this.rootUINode.getChildByName("main_panel").getChildByName("right_panel").getChildByName("printed").setVisible(true);
        }
        var self = this;
        function init_panel_item(itemPanel, itemData, idx) {
            //cc.log(itemData);
            var room_id_label = itemPanel.getChildByName("room_id_label");
            var time_label = itemPanel.getChildByName("time_label");

            itemPanel.getChildByName("light_img").setVisible(idx%2 !== 1);


            room_id_label.setString("房号:" + itemData["roomID"]);
            time_label.setString(cutil.convert_timestamp_to_mdhms(itemData["time"]));
            // if(itemData["cost"]){
            //     itemPanel.getChildByName("cost_label").setString("消耗房卡:"+itemData["cost"]);
            // }else{
            //     itemPanel.getChildByName("cost_label").setVisible(false);
            // }
            itemPanel.getChildByName("cost_label").setString("消耗房卡:"+itemData["cost"]);
            itemPanel.getChildByName("room_type_label").setString(const_val.GameType2CName[itemData["gameType"]]);
            var pay_type_label = "";
            if(itemData["pay_mode"]){
                if(itemData["pay_mode"]==const_val.AA_PAY_MODE){
                    pay_type_label = "AA支付";
                }
                if(itemData["pay_mode"]==const_val.CLUB_PAY_MODE){
                    pay_type_label = "房主支付";
                }
                if(itemData["pay_mode"]==const_val.NORMAL_PAY_MODE){
                    pay_type_label = "房主支付";
                }
            }
            itemPanel.getChildByName("pay_type_label").setString(pay_type_label);

            for(var i=0; i<itemData["player_info_list"].length; i++){
                var name_label = itemPanel.getChildByName("name_label_" + String(i));
                var score_label = itemPanel.getChildByName("score_label_" + String(i));

                var info = itemData["player_info_list"][i];
                name_label.setString(cutil.info_sub_ver2(info["nickname"], 4) + "(" + info["userId"].toString() + ")");
                score_label.setTextColor(cc.color(255, 255, 255));
				name_label.setTextColor(cc.color(255, 255, 255));
                if(info["score"] > 0){
                    score_label.setString("+" + info["score"]);
                    score_label.setTextColor(cc.color(210, 41, 8));
                }else{
                    score_label.setString(info["score"]);
                    score_label.setTextColor(cc.color(65, 140, 35));
                }
                // if(info["score"] >= itemData["player_info_list"][0]["score"]){
				// 得分最多的人 名字特殊显示
                if(info["score"] > 0){
					name_label.setTextColor(cc.color(210, 41, 8));
                }else{
					name_label.setTextColor(cc.color(151, 70, 40));
				}
            }
			var len = itemData["player_info_list"].length;
			for(var i = 0;i<5;i++){
				if(i<len){
					itemPanel.getChildByName("name_label_"+i).setVisible(true);
					itemPanel.getChildByName("score_label_"+i).setVisible(true);
				}else{
					itemPanel.getChildByName("name_label_"+i).setVisible(false);
					itemPanel.getChildByName("score_label_"+i).setVisible(false);
				}
			}
            //新增的详情按钮
            var detail_btn = itemPanel.getChildByName("detail_btn");
            if(itemData["roundResult"]!="[]"){
                //cc.log(itemData["roundResult"]);
                detail_btn.setVisible(true);
                detail_btn.addTouchEventListener(function (sender, eventType) {
                    if (eventType === ccui.Widget.TOUCH_ENDED) {
                        self.title_img.loadTexture("res/ui/CirclePopUI/record_details_title.png");
                        self.back_btn.setVisible(true);
                        self.return_btn.setVisible(false);
                        self.left_panel.setVisible(false);
                        self.right_panel.setVisible(false);
                        self.detail_panel.setVisible(true);
                        cc.log(itemData);

                        self.detail_panel.getChildByName("name_panel").getChildByName("name_label").setString("("+const_val.GameType2CName[itemData["gameType"]]+")");
                        var time_label = self.detail_panel.getChildByName("name_panel").getChildByName("time_label");
                        time_label.setString(cutil.convert_timestamp_to_datetime_exsec(itemData["time"]));

                        var item_list = eval("(" + itemData["roundResult"] + ")");
                        for (var i = 0;i<item_list.length;i++){
                            item_list[i]["roomID"] = itemData["roomID"];
                            item_list[i]["owner_name"] = self.club.owner["nickname"];
                            item_list[i]["player_info_list"] = itemData["player_info_list"];
                        }
                        cc.log(item_list);

                        UICommonWidget.update_scroll_items(self.detail_panel.getChildByName("record_all_scroll"), item_list, function (itemPanel, itemData, idx) {
                            var time = parseInt(itemData["time"].slice(itemData["time"].indexOf(":")+1));
                            if(time<10){
                                time = '0' + time;
                            }
                            itemPanel.getChildByName("time_label").setString(itemData["date"]+'\n'+itemData["time"].slice(0,itemData["time"].indexOf(":")+1)+time);
                            itemPanel.getChildByName("room_id_label").setString(itemData["roomID"]);
                            itemPanel.getChildByName("owner_label").setString(itemData["owner_name"]);
                            itemPanel.getChildByName("round_label").setString((idx+1).toString());
                            itemPanel.getChildByName("light_img").setVisible(idx%2 !== 1);

                            for(var i=0; i<itemData["round_record"].length; i++){
                                var name_label = itemPanel.getChildByName("player_name_label_" + String(i));
                                var score_label = itemPanel.getChildByName("player_score_label_" + String(i));

                                var info = itemData["player_info_list"][i];
                                var list = itemData["round_record"];
                                for(var j =0; j<list.length;j++){
                                    if(list[j]["userID"]==info["userId"]){
                                        info["score"]=list[j]["score"];
                                    }
                                }
                                name_label.setString(cutil.info_sub_ver2(info["nickname"], 4) + "(" + info["userId"].toString() + ")");
                                score_label.setTextColor(cc.color(255, 255, 255));
                                if(info["score"] > 0){
                                    score_label.setString("+" + info["score"]);
                                    score_label.setTextColor(cc.color(220, 56, 12));
                                }else{
                                    score_label.setString(info["score"]);
                                    score_label.setTextColor(cc.color(26, 146, 95));
                                }

                                if(info["score"] >= itemData["player_info_list"][0]["score"]){
                                    // 得分最多的人 名字特殊显示
                                    name_label.setTextColor(cc.color(255, 255, 255));
                                    name_label.setTextColor(cc.color(220, 56, 12));
                                }
                            }
							var len = itemData["round_record"].length;
							for(var i = 0;i<5;i++){
								if(i<len){
									itemPanel.getChildByName("player_name_label_"+i).setVisible(true);
									itemPanel.getChildByName("player_score_label_"+i).setVisible(true);
								}else{
									itemPanel.getChildByName("player_name_label_"+i).setVisible(false);
									itemPanel.getChildByName("player_score_label_"+i).setVisible(false);
								}
							}

                            var replay_btn = itemPanel.getChildByName("replay_btn");
                            replay_btn.addTouchEventListener(function (sender, eventType) {
                                if (eventType === ccui.Widget.TOUCH_ENDED) {
                                    self.reqPlayback(itemData["recordId"]);
                                }
                            });

	                        var share_btn = itemPanel.getChildByName("share_btn");
	                        share_btn.addTouchEventListener(function (sender, eventType) {
		                        if (eventType === ccui.Widget.TOUCH_ENDED) {
			                        let share_title = switches.gameName + ' 回放码【' + itemData['recordId'] + '】';
			                        let share_desc = '玩家[' + self.nickname + ']分享了游戏录像,点击战绩-观看他人回放,输入回放码即可查看。';
			                        if ((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) {
				                        jsb.reflection.callStaticMethod(switches.package_name + "/AppActivity", "callWechatShareUrl", "(ZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", true, switches.share_android_url, share_title, share_desc);
			                        } else if ((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)) {
				                        jsb.reflection.callStaticMethod("WechatOcBridge", "callWechatShareUrlToSession:fromUrl:withTitle:andDescription:", true, switches.share_ios_url, share_title, share_desc);
			                        } else {
				                        cc.log("share not support web", share_title, share_desc);
			                        }
		                        }
	                        });

                        });
                        // let recordData = recordList[i];

                        // UICommonWidget.update_scroll_items(self.recorddetails_scroll, recordData['round_result'], function (view, itemData, index) {
                        //     self.update_record_details_small(view, itemData, index);
                        // });
                    }
                });
            }else{
                detail_btn.setVisible(false);
            }

        }
        UICommonWidget.update_scroll_items(scroll, info_list, init_panel_item);
    },
    reqPlayback: function (text) {
        if (cutil.isPositiveNumber(text)) {
            let player = h1global.player();
            if (!player) {
                cc.log('player undefined');
                return false;
            }
            player.reqPlayback(cc.isNumber(text) ? text : parseInt(text));
            return true;
        } else {
            h1global.globalUIMgr.info_ui.show_by_info("回放码错误！")
        }
        return false;
    },
    group_record:function (record_list) {
        var group_record_list = [[], [], []];
        for(let i=0; i<record_list.length; i++){
            group_record_list[0].push(record_list[i]);
            if(cutil.convert_timestamp_to_ymd(record_list[i]["time"]) != cutil.convert_timestamp_to_ymd(Math.floor(Date.parse(new Date())/1000))){
                group_record_list[1].push(record_list[i]);
            }

            var player_info_list = record_list[i]["player_info_list"];
            for(let j=0; j<player_info_list.length; j++){
                if(h1global.player().userId === player_info_list[j]["userId"]){
                    group_record_list[2].push(record_list[i]);
                    break;
                }
            }
        }
        return group_record_list
    },

	update_page: function (page_panel, index, total, id) {
		if (id) {
            page_panel.getChildByName("page_label").setString("1/1")
		} else {
            this.max_page_num = Math.ceil(total / this.page_show_num);
            if(this.max_page_num==0){this.max_page_num=1};
            this.cur_page_num = index+1;
            page_panel.getChildByName("page_label").setString(this.cur_page_num.toString() + "/" + this.max_page_num.toString())
		}
        if(this.cur_page_num == 1){
            page_panel.getChildByName("left_page_btn").setEnabled(false);
        }else{
            page_panel.getChildByName("left_page_btn").setEnabled(true);
        }
        if(this.cur_page_num == this.max_page_num){
            page_panel.getChildByName("right_page_btn").setEnabled(false);
        }else{
            page_panel.getChildByName("right_page_btn").setEnabled(true);
        }
	},

    reset_filters:function(index){
        this.filters = {};//重置搜索条件
        //更新搜索条件
        switch (index){
            case 0:
                cc.log("亲友圈战绩条件");
                var days_num = 2;//查询到前几天
                var start=new Date();
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0);
                start.setMilliseconds(0);
                var beginTime=Date.parse(start)/1000;
                beginTime -= (24*60*60)*days_num;
                this.filters["beginTime"] = beginTime;
                this.filters["endTime"] = Math.round(new Date() / 1000);
                break;
            case 1:
                cc.log("昨日战绩条件");
                var start=new Date();
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0);
                start.setMilliseconds(0);
                var endTime=Date.parse(start)/1000;
                this.filters["beginTime"] = endTime - 24*60*60;
                this.filters["endTime"] = endTime;
                break;
            case 2:
                cc.log("与我相关战绩条件");
                this.filters["userId"] = this.club.owner.userId;
                break;
            default:
                break;
        }
    },

    update_page_panel2:function(club_id, records, current_page, page_size, total,filters){
        if(!this.is_show){return;}
        if(this.club.club_id !== club_id){return;}

        var page_panel = this.rootUINode.getChildByName("main_panel").getChildByName("right_panel").getChildByName("page_panel");

        this.update_page(page_panel,current_page,total);
        this.update_scroll(this.scroll_list[this.now_options],records);
        this.scroll_list[this.now_options].jumpToTop();
    },
});