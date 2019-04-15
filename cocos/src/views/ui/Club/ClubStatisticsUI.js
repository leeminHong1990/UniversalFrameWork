"use strict";

var ClubStatisticsUI = UIBase.extend({
    ctor:function () {
        this._super();
        this.resourceFilename = "res/ui/ClubStatisticsUI.json";
    },

    show_by_info:function (club_id) {
        if(!h1global.player() || !h1global.player().club_entity_dict){return}
        if(!h1global.player().club_entity_dict[club_id]){return}
        this.club = h1global.player().club_entity_dict[club_id];
        this.show();
    },

    initUI:function () {
        var self = this;
        var club_statistics_panel = this.rootUINode.getChildByName("club_statistics_panel");
        var statistics_panel = club_statistics_panel.getChildByName("statistics_panel");

        statistics_panel.getChildByName("back_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                self.hide();
            }
        });

	    statistics_panel.getChildByName("owner_label").setString("玩家" + self.club.owner.nickname + "的亲友圈");
	    statistics_panel.getChildByName("id_label").setString("亲友圈ID:" + self.club.club_id);

        this.mem_page_index = 1;
        this.page_show_num = 10;

		this.cur_page_num = 1;//当前页数
		this.max_page_num = 1;//最大页数
		this.mem_total = 0;//成员总人数

        var detail_panel = statistics_panel.getChildByName("detail_panel");
	    detail_panel.setVisible(true);

        this.init_page_btn_pt();

		cutil.lock_ui();
		h1global.player().clubOperation(const_val.CLUB_OP_GET_STATISTICS, self.club.club_id,[0,self.page_show_num,"",["date","round","cost","active"]]);
    },

    init_page_btn_pt:function () {
        var page_panel = this.rootUINode.getChildByName("club_statistics_panel").getChildByName("statistics_panel").getChildByName("page_panel");
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
    },

    update_club_statistics:function (club_id,statistics,now_page, page_size,total) {
        if(!this.is_show){return;}
        if(this.club.club_id !== club_id){return;}
        var self = this;
        this.statistics = statistics;
		this.cur_page_num = now_page+1;//当前页数
		this.mem_total = total;//成员总人数

        this.update_page_panel(self);
    },

	update_page: function (page_panel, index ,total) {
		if (total==0) {
            page_panel.getChildByName("page_label").setString("1/1")
		} else {
            page_panel.getChildByName("page_label").setString(index.toString() + "/" + Math.ceil(total / this.page_show_num).toString())
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

    update_page_panel:function(self){
        if(!this.is_show){return;}

        var club_statistics_panel = this.rootUINode.getChildByName("club_statistics_panel");
        var statistics_panel = club_statistics_panel.getChildByName("statistics_panel");
        var page_panel = statistics_panel.getChildByName("page_panel");
        var info_panel = statistics_panel.getChildByName("detail_panel").getChildByName("record_all_scroll");


        var statistics = this.statistics;

        this.mem_page_index = this.cur_page_num;

        self.update_page(page_panel, this.cur_page_num, this.mem_total);

        page_panel.getChildByName("left_page_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(self.mem_page_index <= 0){
                    return;
                }
                self.mem_page_index--;
                cutil.lock_ui();
                h1global.player().clubOperation(const_val.CLUB_OP_GET_STATISTICS, self.club.club_id,[self.mem_page_index-1,self.page_show_num,"",["date","round","cost","active"]]);
            }
        });

        page_panel.getChildByName("right_page_btn").addTouchEventListener(function (sender, eventType) {
            if(eventType === ccui.Widget.TOUCH_ENDED){
                if(self.mem_page_index >= Math.ceil(self.mem_total/self.page_show_num)){
                    return;
                }
                self.mem_page_index++;
                cutil.lock_ui();
                h1global.player().clubOperation(const_val.CLUB_OP_GET_STATISTICS, self.club.club_id,[self.mem_page_index-1,self.page_show_num,"",["date","round","cost","active"]]);
            }
        });
        this.update_member_page(info_panel, statistics);
    },

	update_member_page:function (info_panel, statistics) {
		if(!this.is_show){return;}

		function update_item_func(itemPanel, itemData, index){
			itemPanel.getChildByName("date_label").setString(cutil.convert_timestamp_to_mdhms(itemData["date"]));
			itemPanel.getChildByName("round_label").setString(itemData["round"]);
			itemPanel.getChildByName("cost_label").setString(itemData["cost"]);
			itemPanel.getChildByName("active_label").setString(itemData["active"]);
		}
		UICommonWidget.update_scroll_items(info_panel, statistics, update_item_func)
	},
});