"use strict";

var ClubRankUI = UIBase.extend({
    ctor:function () {
        this._super();
        this.resourceFilename = "res/ui/ClubRankUI.json";
    },

    show_by_info:function (club_id) {
        if(!h1global.player()){return};
        if(!h1global.player().club_entity_dict[club_id]){return};
        this.club = h1global.player().club_entity_dict[club_id];
        this.show();
    },

    initUI:function () {
        var self = this;
        var club_rank_panel = this.rootUINode.getChildByName("club_rank_panel");
        club_rank_panel.getChildByName("return_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        });
        this.yest_page_index = 0;
        this.today_page_index = 0;
        this.page_index_list = [this.today_page_index,this.yest_page_index];
		this.today_total = 0;
		this.yest_total = 0;
        this.page_total_list = [this.today_total,this.yest_total];
        this.page_show_num = 10;
        this.dauList_today = [];
        this.dauList_yesterday = [];
        this.dau_list = [this.dauList_today,this.dauList_yesterday];
        this.title_sort = "score";
        this.timestamp = 0;
        this.init_page_btn_pt();
        this.init_title_btn();
		this.init_self_item_data();
        var left_btn_panel = club_rank_panel.getChildByName("left_btn_panel")

        var yest_btn = left_btn_panel.getChildByName("yesterday_btn");
        var today_btn = left_btn_panel.getChildByName("today_btn");

        var yest_scroll = club_rank_panel.getChildByName("yest_scroll").getChildByName("info_panel");
        var today_scroll = club_rank_panel.getChildByName("today_scroll").getChildByName("info_panel");
        this.self_panel = club_rank_panel.getChildByName("self_panel");
        this.btn_list = [today_btn, yest_btn];
        this.scroll_list = [today_scroll, yest_scroll];

        function update_now_tab(index){
            // self.now_options = index;
            // self.update_page_panel(self);
			cutil.lock_ui();
			//这里是切换按钮 所以反过来
			if(self.now_options == 1){
				h1global.player().queryTodayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
				h1global.player().queryMyDAU(self.club.club_id,1,[self.title_sort]);
			}else{
				h1global.player().queryYesterdayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
				h1global.player().queryMyDAU(self.club.club_id,2,[self.title_sort]);
			}
            for(var i = 0; i<self.btn_list.length;i++){
                if(i == index){
                    self.btn_list[i].getChildByName("label_select").setVisible(true);
                    self.btn_list[i].getChildByName("label_normal").setVisible(false);
                }else{
                    self.btn_list[i].getChildByName("label_select").setVisible(false);
                    self.btn_list[i].getChildByName("label_normal").setVisible(true);
                }
            }
        }

        UICommonWidget.create_tab(this.btn_list, this.scroll_list,undefined,undefined,update_now_tab);

        h1global.player().queryTodayDAU(this.club.club_id,0,this.page_show_num,[this.title_sort]);
        h1global.player().queryMyDAU(this.club.club_id,1,[this.title_sort]);
        // h1global.player().queryYesterdayDAU(this.club.club_id,0,this.page_show_num,[this.title_sort]);
    },

    init_page_btn_pt:function () {
        var page_panel = this.rootUINode.getChildByName("club_rank_panel").getChildByName("base_panel").getChildByName("page_panel");
        var left_page_btn = page_panel.getChildByName("left_page_btn");
        var right_page_btn = page_panel.getChildByName("right_page_btn");

        left_page_btn.hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(-size.width*0.1, -size.height * 0.3, size.width, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        right_page_btn.hitTest = function (pt) {
            var size = this.getContentSize();
            var bb = cc.rect(-size.width*0.1, -size.height * 0.3, size.width, size.height * 2);
            return cc.rectContainsPoint(bb, this.convertToNodeSpace(pt));
        };
        var self = this;
		page_panel.getChildByName("left_page_btn").addTouchEventListener(function (sender, eventType) {
			if(eventType === ccui.Widget.TOUCH_ENDED){
				if(self.page_index_list[self.now_options] <= 0){
					return
				}
				self.page_index_list[self.now_options]--;
				cutil.lock_ui();
				if(self.now_options == 0){
					h1global.player().queryTodayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
                }else{
					h1global.player().queryYesterdayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
				}
			}
		});

		page_panel.getChildByName("right_page_btn").addTouchEventListener(function (sender, eventType) {
			if(eventType === ccui.Widget.TOUCH_ENDED){
				// if(now_index + 1 >= Math.ceil(now_list.length/self.page_show_num)){
				// 	return
				// }
				// self.page_index_list[self.now_options]++;
				// self.update_page(page_panel, now_index + 1, now_list.length, id);
				// var show_list = now_list.slice(now_index * self.page_show_num, now_index * self.page_show_num + self.page_show_num);
				// self.update_rank_page(info_panel, show_list);
				// info_panel.jumpToTop();
				if(self.page_index_list[self.now_options] >= Math.ceil(self.page_total_list[self.now_options]/self.page_show_num)){
					return
				}
				self.page_index_list[self.now_options]++;
				cutil.lock_ui();
				if(self.now_options == 0){
					h1global.player().queryTodayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
				}else{
					h1global.player().queryYesterdayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
				}
			}
		});

		if(!this.club.is_owner(h1global.player().userId) || this.club.is_admin()){
			page_panel.setVisible(false);
		}
    },


	update_page: function (page_panel, index, total, id) {
		if (id || total==0) {
			page_panel.getChildByName("page_label").setString("1/1");
		} else {
			page_panel.getChildByName("page_label").setString(index.toString() + "/" + Math.ceil(total / this.page_show_num).toString());
		}
        if(index == 1){
            page_panel.getChildByName("left_page_btn").setEnabled(false);
        }else{
            page_panel.getChildByName("left_page_btn").setEnabled(true);
        }
        if(total==0 || index == Math.ceil(total / this.page_show_num)){
            page_panel.getChildByName("right_page_btn").setEnabled(false);
        }else{
            page_panel.getChildByName("right_page_btn").setEnabled(true);
        }
	},

    update_dau:function(club_id, dauList, queryType,now_page,page_show_num,total,sort_str){
		if(!this.is_show){return;}
		if(this.club.club_id !== club_id){return;}
		if(queryType==1 || queryType==2){
			this.now_options = queryType - 1;
			this.dau_list[this.now_options] = dauList;
			this.page_index_list[this.now_options] = now_page+1;
			this.page_total_list[this.now_options] = total;
            cc.log(this.page_total_list,this.page_index_list,this.dau_list)
			var self = this;
			this.update_page_panel(self);
        }
    },

	update_my_dau:function (club_id,data,query_type,index) {
		if(!this.is_show){return;}
		if(this.club.club_id !== club_id){return;}
		var self = this;
		function update_item_func(itemPanel, itemData, index){
			var head_img_frame = itemPanel.getChildByName("head_img_frame");
			itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder()-10);
			itemPanel.__imgUrl = itemData["head_icon"];
			cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function(img){
				if(self && self.is_show && cc.sys.isObjectValid(itemPanel)){
					if (itemPanel.__imgUrl != itemData["head_icon"]) {
						return;
					}
					if(itemPanel.getChildByName("head_icon")){
						itemPanel.removeChild(itemPanel.getChildByName("head_icon"))
					}
					var portrait_sprite  = new cc.Sprite(img);
					portrait_sprite.setScale(74/portrait_sprite.getContentSize().width);
					itemPanel.addChild(portrait_sprite);
					portrait_sprite.setPosition(head_img_frame.getPosition());
					portrait_sprite.setName("head_icon");
					itemPanel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder())
				}
			});
			itemPanel.getChildByName("player_name").setString(cutil.info_sub_ver2(itemData["nickname"], 4));
			itemPanel.getChildByName("player_id").setString(itemData["userId"]);
			itemPanel.getChildByName("player_score").setString(itemData["score"]);
			itemPanel.getChildByName("player_round").setString(itemData["count"]);
			itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light2_img.png");

			if(itemData["rank"]<1){
				itemPanel.getChildByName("rank_label").setVisible(false);
				itemPanel.getChildByName("rank_img").setVisible(false);
			}else if(itemData["rank"]<4){
				itemPanel.getChildByName("rank_img").setVisible(true);
				itemPanel.getChildByName("rank_img").loadTexture("res/ui/CirclePopUI/rank"+itemData["rank"]+".png");
				itemPanel.getChildByName("rank_label").setVisible(false);
			}else{
				itemPanel.getChildByName("rank_img").setVisible(false);
				itemPanel.getChildByName("rank_label").setVisible(true);
				itemPanel.getChildByName("rank_label").setString(itemData["rank"]);
				itemPanel.getChildByName("rank_label").ignoreContentAdaptWithSize(true);
			}
		}
		if(data == "{}"){
			var itemData = this.self_item_data;
		}else{
			var itemData = JSON.parse(data);
		}

		// if(this.timestamp > itemData["timestamp"] && itemData["timestamp"]!=0){
		// 	return;
		// }else{
		// 	this.timestamp = itemData["timestamp"];
		// }
		if(this.now_options != query_type-1){
			return;
		}
		itemData["rank"] = index+1;
		update_item_func(this.self_panel,itemData);
		this.self_panel.setVisible(true);
	},

    update_page_panel:function(self,id){
        if(!this.is_show){return;}
        //var self = this;

        var club_player_panel = this.rootUINode.getChildByName("club_rank_panel");

        //var player_panel = club_player_panel.getChildByName("player_panel");
        //var yest_scroll = club_player_panel.getChildByName("yest_scroll");
        var base_panel = club_player_panel.getChildByName("base_panel");

        var page_panel = base_panel.getChildByName("page_panel");

        var info_panel = this.scroll_list[this.now_options];
        var now_list = this.dau_list[this.now_options];
        var now_index = this.page_index_list[this.now_options];

        // switch (this.now_options){
        //     case 0:
        //         info_panel = this.scroll_list[0];
        //         now_list = this.dauList_today;
        //         now_index = this.page_index_list[0];
        //         break;
        //     case 1:
        //         info_panel = this.scroll_list[1];
        //         now_list = this.dauList_yesterday;
        //         now_index = this.page_index_list[1];
        //         break;
        //     default:
        //         break;
        // }
        if(!now_list||!info_panel){return ;};
        cc.log(now_list);
        // //排序
        // now_list.sort(function(a,b){
        //    return b[self.title_sort]-a[self.title_sort]
        // });
        //加排名
        for ( var i = 0;i<now_list.length;i++){
            now_list[i]["rank"]=i+1;
        }

        // if(now_index >= Math.ceil(now_list.length/now_index) && now_index > 0){
        //     now_index -= 1;
        // }
        // var show_list = now_list.slice(now_index * this.page_show_num, now_index * this.page_show_num + this.page_show_num);

        // if(id){
        //     show_list = [];
        //     for(var i =0;i<now_list.length;i++){
        //         if(now_list[i]["userId"]==id){
        //             show_list.push(now_list[i]);
        //         }
        //     }
        // }

	    self.update_page(page_panel, now_index, this.page_total_list[this.now_options], id);
		if(this.club.is_owner(h1global.player().userId) || this.club.is_admin()){
			this.update_rank_page(info_panel, now_list);
		}else{
			this.update_rank_page(info_panel, now_list.slice(0,5));
        }
    },

    update_rank_page:function (info_panel, show_list) {
        if(!this.is_show){return;}
        var self = this;

        function update_item_func(itemPanel, itemData, index){
            // if(index%2 === 1){
            //     itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/rank_scroll_bg2.png");
            // } else {
            //     itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/rank_scroll_bg1.png");
            // }
            var head_img_frame = itemPanel.getChildByName("head_img_frame");
            itemPanel.reorderChild(itemPanel.getChildByName("light_img"), head_img_frame.getLocalZOrder()-10);
			itemPanel.__imgUrl = itemData["head_icon"];
            cutil.loadPortraitTexture(itemData["head_icon"], itemData["sex"], function(img){
                if(self && self.is_show && cc.sys.isObjectValid(itemPanel)){
					if (itemPanel.__imgUrl != itemData["head_icon"]) {
						return;
					}
                    if(itemPanel.getChildByName("head_icon")){
                        itemPanel.removeChild(itemPanel.getChildByName("head_icon"))
                    }
                    var portrait_sprite  = new cc.Sprite(img);
                    portrait_sprite.setScale(74/portrait_sprite.getContentSize().width);
                    itemPanel.addChild(portrait_sprite);
                    portrait_sprite.setPosition(head_img_frame.getPosition());
                    portrait_sprite.setName("head_icon");
                    itemPanel.reorderChild(portrait_sprite, head_img_frame.getLocalZOrder())
                }
            });

            itemPanel.getChildByName("player_name").setString(cutil.info_sub_ver2(itemData["nickname"], 4));
            itemPanel.getChildByName("player_id").setString(itemData["userId"]);
            itemPanel.getChildByName("player_score").setString(itemData["score"]);
            itemPanel.getChildByName("player_round").setString(itemData["count"]);
            //itemPanel.getChildByName("time_label").setString(cutil.convert_timestamp_to_ymd(itemData["ts"]));
            // itemPanel.getChildByName("detail_btn").setVisible(false);

            if(itemData["rank"]<4){
                itemPanel.getChildByName("rank_img").setVisible(true);
                itemPanel.getChildByName("rank_img").loadTexture("res/ui/CirclePopUI/rank"+itemData["rank"]+".png");
                itemPanel.getChildByName("rank_label").setVisible(false);
            }else{
                itemPanel.getChildByName("rank_img").setVisible(false);
                itemPanel.getChildByName("rank_label").setVisible(true);
                //itemPanel.getChildByName("rank_label").setString('第'+itemData["rank"]+'名');
                itemPanel.getChildByName("rank_label").setString(itemData["rank"]);
                itemPanel.getChildByName("rank_label").ignoreContentAdaptWithSize(true);
            }
            // if(h1global.player().userId === itemData.userId){
            //     itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light2_img.png");
            // }
            // else{
            //     itemPanel.getChildByName("light_img").loadTexture("res/ui/CirclePopUI/light_img.png");
            // }
        }
        UICommonWidget.update_scroll_items(info_panel, show_list, update_item_func)
    },

    init_title_btn:function(){
      var title_panel = this.rootUINode.getChildByName("club_rank_panel").getChildByName("title_panel");

      var self = this;
      function set_list_sort(sort_word){
          self.title_sort = sort_word;
		  cc.log(self.title_sort);
	  };

      title_panel.getChildByName("score_btn").addTouchEventListener(function (sender, eventType) {
          if (eventType === ccui.Widget.TOUCH_ENDED) {
              set_list_sort("score");
              // self.update_page_panel(self);
			  cutil.lock_ui();
			  if(self.now_options == 0){
				  h1global.player().queryTodayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
			  }else{
				  h1global.player().queryYesterdayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
			  }
			  h1global.player().queryMyDAU(self.club.club_id,self.now_options+1,[self.title_sort]);
          }
      });
      title_panel.getChildByName("round_btn").addTouchEventListener(function (sender, eventType) {
          if (eventType === ccui.Widget.TOUCH_ENDED) {
              set_list_sort("count");
              // self.update_page_panel(self);
			  cutil.lock_ui();
			  if(self.now_options == 0){
				  h1global.player().queryTodayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
			  }else{
				  h1global.player().queryYesterdayDAU(self.club.club_id,self.page_index_list[self.now_options]-1,self.page_show_num,[self.title_sort]);
			  }
			  h1global.player().queryMyDAU(self.club.club_id,self.now_options+1,[self.title_sort]);
          }
      });
    },

	init_self_item_data:function(){
		var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
		this.self_item_data = {"head_icon": info_dict["headimgurl"], "score": 0, "count": 0, "nickname": info_dict["nickname"], "sex": info_dict["sex"], "userId": info_dict["user_id"],"rank":-1,"timestamp":0};
	},
});