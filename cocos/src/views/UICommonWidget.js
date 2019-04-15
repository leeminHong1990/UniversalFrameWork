
var UICommonWidget = {
    create_tab:function(btn_list, page_list, init_page, belong_page, btn_func){
        // Desc. 创建一个Table需要一组按钮作为标签，和对应的页数
        // Args. btn_list与page_list长度需要一致；init_page是初始页；belong_page可指向一个翻页page作为父控件也可以为nil；btn_func需要有一个参数，参数为按钮编号
        // Ret . table对象，记录了标签需要的所有信息
        // Noti. 初始化时会调用初始页init_page对应的btn_func
        if (btn_list.length != page_list.length) {
            // error("create_tab wrong arguments!")
            return null;
        }

        // 标记编号
        for (var i = 0; i < btn_list.length; i++) {
            btn_list[i].btn_id = i;
        }

        for (var i = 0; i < page_list.length; i++) {
            page_list[i].page_id = i;
            //[[默认隐藏滚动条中的内容
            if (page_list[i].getDescription() == "ScrollView") {
                var item_list = page_list[i].getChildren();
                for (var j = 1; j < item_list.length; j++) {
                    item_list[j].setVisible(false);
                }
            }
            // ]]
        }

        // 如果tab为翻页形式，将滚动层都加入到翻页层中
        if (belong_page) {
            // for (var i = 0; i < page_list.length; i++) {
            //     page_list[i].setAnchorPoint(0, 0);
            //     page_list[i].setPosition(0, 0);
            //     page_list[i].retain();
            //     page_list[i].removeFromParent();
            //     belong_page.addPage(page_list[i]);
            //     page_list[i].release();
            // }

            function select_page_event(sender, eventType){
                if (eventType == ccui.PageView.EVENT_TURNING) {
                    var cur_page_index = sender.getCurPageIndex();
                    // var cur_page_index = sender.getCurPageIndex() + 1
                    if (btn_func) {
                        btn_func(cur_page_index);
                    }
                    for (var i = 0; i < btn_list.length; i++) {
                        if (i == cur_page_index) {
                            btn_list[i].setBright(false);
                            btn_list[i].setTouchEnabled(false);
                        }else{
                            btn_list[i].setBright(true);
                            btn_list[i].setTouchEnabled(true);
                        }
                    }
                }
            }
            belong_page.addEventListener(select_page_event);
        }

        function select_btn_event(sender, eventType){
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                if (btn_func) {
                    btn_func(sender.btn_id);
                }
                for (var i = 0; i < btn_list.length; i++) {
                    if (i == sender.btn_id) {
                        btn_list[i].setBright(false);
                        btn_list[i].setTouchEnabled(false);
                    }else{
                        btn_list[i].setBright(true);
                        btn_list[i].setTouchEnabled(true);
                    }
                }
                if (belong_page) {
                    // TODO. LZR可能存在内存问题
                    belong_page.scrollToPage(sender.btn_id)
                }else{
                    for (var i = 0; i < page_list.length; i++) {
                        if (i == sender.btn_id) {
                            page_list[i].setVisible(true);
                        }else{
                            page_list[i].setVisible(false);
                        }
                    }
                }
            }
        }
        for (var i = 0; i < btn_list.length; i++) {
            btn_list[i].addTouchEventListener(select_btn_event);
        }
        // 设置初始页
        init_page = init_page || 0;
        for (var i = 0; i < btn_list.length; i++) {
            if (i == init_page) {
                btn_list[i].setBright(false);
                btn_list[i].setTouchEnabled(false);
            }else{
                btn_list[i].setBright(true);
                btn_list[i].setTouchEnabled(true);
            }
        }
        if (belong_page) {
            // scrollToPage会执行默认标签的按钮响应
            belong_page.scrollToPage(init_page);
            for (var i = 0; i < page_list.length; i++) {
                page_list[i].setVisible(true);
            }
        }else{
            // 需手动执行默认标签的按钮响应
            if (btn_func) {
                btn_func(init_page);
            }
            for (var i = 0; i < page_list.length; i++) {
                if (i == init_page) {
                    page_list[i].setVisible(true);
                }else{
                    page_list[i].setVisible(false);
                }
            }
        }
        // 返回一个表作为tab的对象
        return {"btn_list": btn_list, "page_list": page_list, "belong_page": belong_page, "btn_func": btn_func};
    },

    change_to_tab:function(tab_obj, page_no){
        // Desc. 辅助上述table切换标签
        // Args. tab_obj为create_tab返回的对象，page_no为要切换到的页数
        // Ret . 执行成功或失败
        if (page_no >= (tab_obj["btn_list"]).length || page_no < 0) {
            return false;
        }
        var btn_list = tab_obj["btn_list"];
        var page_list = tab_obj["page_list"];
        var belong_page = tab_obj["belong_page"];
        var btn_func = tab_obj["btn_func"];

        for (var i = 0; i < btn_list.length; i++) {
            if (i == page_no) {
                btn_list[i].setBright(false);
                btn_list[i].setTouchEnabled(false);
            }else{
                btn_list[i].setBright(true);
                btn_list[i].setTouchEnabled(true);
            }
        }
        if (belong_page) {
            belong_page.scrollToPage(page_no);
        }else{
            for (var i = 1; i < page_list.length; i++) {
                if (i == page_no) {
                    page_list[i].setVisible(true);
                }else{
                    page_list[i].setVisible(false);
                }
            }
        }
        // 执行默认标签的按钮相应
        if (btn_func) {
            btn_func(page_no);
        }
        return true;
    },

    update_scroll_items:function(cur_scroll, item_info_list, update_func, need_more, more_func){
        // Desc. 以滚动条cur_scroll中自带的唯一一个子控件为模板，根据item_info_list中的数据和update_func方法创建#item_info_list个item
        // Args. cur_scroll中包含一个子结点作为滚动条的item，update_func是一个方法，两个参数第一个参数为item第二个参数为对应的item_info, 第三个参数为当前index
        // Ret . 无
        if (need_more) {
            var item_list = cur_scroll.getChildren();
            var more_label = item_list[item_list.length-1].clone();
            item_list[item_list.length-1].removeFromParent();
            item_list[item_list.length-1] = null;
            // 设置滚动区域大小
            var scroll_content_size = cur_scroll.getContentSize();
            var item_content_size = item_list[0].getContentSize();
            var more_label_size = more_label.getContentSize();
            var inner_width = undefined;
            var inner_height = undefined;
            if (cur_scroll.getDirection() == ccui.ScrollView.DIR_HORIZONTAL) {
                inner_height = item_content_size.height;
                inner_width = (item_info_list.length) * item_content_size.width + more_label_size.width;
            }else{
                inner_width = item_content_size.width;
                inner_height = (item_info_list.length) * item_content_size.height + more_label_size.height;
            }
            if (inner_height < cur_scroll.getContentSize().height) {
                inner_height = cur_scroll.getContentSize().height;
            }
            if (inner_width < cur_scroll.getContentSize().width) {
                inner_width = cur_scroll.getContentSize().width;
            }
            cur_scroll.setInnerContainerSize(cc.size(inner_width, inner_height));

            for (var i = 0; i< item_info_list.length; i++) {
                if (!item_list[i]) {
                    // item_list[i] = item_list[0].clone();
                    var cur_item = item_list[0].clone();
                    cur_scroll.addChild(cur_item);
                }
                item_list[i].setVisible(true);
                //摆放位置
                //var cur_content_size = self.g_MTT_page_list[cur_page_index].getContentSize()
                if (cur_scroll.getDirection() == ccui.ScrollView.DIR_HORIZONTAL) {
                    item_list[i].setPosition(cc.p(i * item_content_size.width, 0));
                }else{
                    item_list[i].setPosition(cc.p(0, inner_height - (i + 1) * item_content_size.height));
                }
                //更新数据
                // update_func(item_list[i], item_info_list[i], i);
            }
            for (var i = 0; i < item_info_list.length; i++) {
                //更新数据
                update_func(item_list[i], item_info_list[i], i);
            }

            if (item_info_list.length < item_list.length) {
                // item多余时处理
                for (var i = item_list.length - 1; i >= item_info_list.length; i--) {
                    if (i == 0) {
                        item_list[i].setVisible(false);
                    }else{
                        item_list[i].removeFromParent();
                        item_list[i] = undefined;
                        //item_list[i].setVisible(false)
                    }
                }
                if (item_info_list.length > 1){
                    item_list.length = item_info_list.length;
                } else {
                    item_list.length = 1;
                }
            }

            cur_scroll.addChild(more_label);
            if (cur_scroll.getDirection() == ccui.ScrollView.DIR_HORIZONTAL) {
                // TODO
                // more_label.setPosition(cc.p((i - 1) * item_content_size.width+more_label_size.width, 0));
            }else{
                more_label.setPosition(cc.p(0, inner_height - (item_info_list.length)*item_content_size.height - more_label_size.height));
            }
            more_label.setString("查看更多玩家");
            more_label.setVisible(true);
            more_label.addTouchEventListener(more_func);
            if (item_info_list.length + const_val.RANK_EACH_NUM > 100) {
                more_label.setVisible(false);
            }
        }else{
            var item_list = cur_scroll.getChildren();
            // 设置滚动区域大小
            var scroll_content_size = cur_scroll.getContentSize();
            var item_content_size = item_list[0].getContentSize();
            var inner_width = undefined;
            var inner_height = undefined;
            if (cur_scroll.getDirection() == ccui.ScrollView.DIR_HORIZONTAL) {
                inner_height = item_content_size.height;
                inner_width = (item_info_list.length) * item_content_size.width;
            }else{
                inner_width = item_content_size.width;
                inner_height = (item_info_list.length) * item_content_size.height;
                if (cur_scroll.getName() == "desk_scroll" || cur_scroll.getName() == "card_scroll") {
	                inner_height = Math.ceil(item_info_list.length / const_val.ONE_ROW_DESK_NUM) * item_content_size.height;
                }
            }
            if (inner_height < cur_scroll.getContentSize().height) {
                inner_height = cur_scroll.getContentSize().height;
            }
            if (inner_width < cur_scroll.getContentSize().width) {
                inner_width = cur_scroll.getContentSize().width;
            }
            cur_scroll.setInnerContainerSize(cc.size(inner_width, inner_height));

            var offpos = item_list[0].getPosition();
            var offsetx = offpos.x;
            var offsety = offpos.y;
            for (var i = 0; i < item_info_list.length; i++) {
                if (!item_list[i]) {
                    if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
                        item_list[i] = item_list[0].clone();
                        cur_scroll.addChild(item_list[i]);
                    } else {
                        var cur_item = item_list[0].clone();
                        cur_scroll.addChild(cur_item);
                    }
                }
                item_list[i].setVisible(true);
	            if (cur_scroll.getName() == "desk_scroll" ||  cur_scroll.getName() == "card_scroll") {
		            item_list[i].setName("item_panel_" + i.toString());
	            }
                //摆放位置
                //var cur_content_size = self.g_MTT_page_list[cur_page_index].getContentSize()
                if (cur_scroll.getDirection() == ccui.ScrollView.DIR_HORIZONTAL) {
                    item_list[i].setPosition(cc.p(i * item_content_size.width, offsety));
                }else{
	                item_list[i].setPosition(cc.p(offsetx, inner_height - (i + 1) * item_content_size.height));
	                if (cur_scroll.getName() == "desk_scroll" ||  cur_scroll.getName() == "card_scroll") {
		                item_list[i].setPosition(cc.p(parseInt(i % 3) * item_content_size.width + offsetx, inner_height - parseInt(i / 3) * item_content_size.height));
	                }
                }
                //更新数据
                // update_func(item_list[i], item_info_list[i], i);
            }
            for (var i = 0; i < item_info_list.length; i++) {
                //更新数据
                update_func(item_list[i], item_info_list[i], i);
            }
            if (item_info_list.length < item_list.length) {
                // item多余时处理
                for (var i = item_list.length - 1; i >= item_info_list.length; i--) {
                    if (i == 0) {
                        item_list[i].setVisible(false);
                    }else{
                        item_list[i].removeFromParent();
                        item_list[i] = undefined;
                        //item_list[i].setVisible(false)
                    }
                }
                if (item_info_list.length > 1){
                    item_list.length = item_info_list.length;
                } else {
                    item_list.length = 1;
                }
            }
        }
    },

    add_scroll_item:function(cur_scroll, cur_item){
        // Desc. 与update_scroll_items类似，向滚动条cur_scroll中增加一个cur_item
        // Args. cur_scroll目标滚动条，初始化滚动范围要与大小一致，cur_item是实际对象不会被clone，复制item对象和填写item都需要在方法外进行
        // Ret . 无
        var content_size = cur_scroll.getContentSize();
        var inner_size = cur_scroll.getInnerContainerSize();
        var cur_item_size = cur_item.getContentSize();
        if (cur_scroll.getDirection() == cc.SCROLLVIEW_DIRECTION_HORIZONTAL) {
            if (inner_size.width > content_size.width) {
                // 滚动范围比显示区域大，代表已填满一页，可以直接增加滚动范围添加item
                cur_scroll.setInnerContainerSize(cc.size(inner_size.width + cur_item_size.width, inner_size.height));
                cur_item.removeFromParent();
                cur_scroll.addChild(cur_item);
                cur_item.setPosition(cc.p(inner_size.width, 0));
            }else{
                // 滚动范围跟显示区域一样大，新增物体后可能小于一页，也可能大于一页，需要分开处理
                var item_list = cur_scroll.getChildren();
                var last_item_pos = 0;
                for (var i = 0; i < item_list.length; i++) {
                    if (item_list[i].isVisible() && item_list[i] !== cur_item) {
                        if (item_list[i].getPositionX() + item_list[i].getContentSize().width > last_item_pos) {
                            last_item_pos = item_list[i].getPositionX() + item_list[i].getContentSize().width;
                        }
                    }
                }
                if (last_item_pos + cur_item_size.width > content_size.width) {
                    // 增加新item后将超过一页
                    cur_scroll.setInnerContainerSize(cc.size(last_item_pos + cur_item_size.width, inner_size.height));
                }
                // 横向的滚动条由于以左侧为锚点，并不需要移动之前已经排布好的item
                cur_item.removeFromParent();
                cur_scroll.addChild(cur_item);
                cur_item.setPosition(cc.p(last_item_pos, 0));
            }
        }else{
            if (inner_size.height > content_size.height) {
                // 滚动范围比显示区域大，代表已填满一页，可以直接增加滚动范围添加item
                cur_scroll.setInnerContainerSize(cc.size(inner_size.width, inner_size.height + cur_item_size.height));
                var item_list = cur_scroll.getChildren();
                for (var i = 0; i < item_list.length; i++) {
                    if (item_list[i].isVisible()) {
                        item_list[i].setPosition(cc.p(item_list[i].getPositionX(), item_list[i].getPositionY() + cur_item_size.height));
                    }
                }
                cur_item.removeFromParent();
                cur_scroll.addChild(cur_item);
                cur_item.setPosition(cc.p(0, 0));
            }else{
                // 滚动范围跟显示区域一样大，新增物体后可能小于一页，也可能大于一页，需要分开处理
                var item_list = cur_scroll.getChildren();
                var last_item_pos = content_size.height;
                for (var i = 0; i < item_list.length; i++) {
                    if (item_list[i].isVisible() && item_list[i] !== cur_item) {
                        if (item_list[i].getPositionY() < last_item_pos) {
                            last_item_pos = item_list[i].getPositionY();
                        }
                    }
                }
                if (last_item_pos < cur_item_size.height) {
                    // 增加新item后将超过一页
                    cur_scroll.setInnerContainerSize(cc.size(inner_size.width, inner_size.height + cur_item_size.height - last_item_pos));
                    for (var i = 0; i < item_list.length; i++) {
                        if (item_list[i].isVisible()) {
                            item_list[i].setPosition(cc.p(item_list[i].getPositionX(), item_list[i].getPositionY() + cur_item_size.height - last_item_pos));
                        }
                    }
                    cur_item.removeFromParent();
                    cur_scroll.addChild(cur_item);
                    cur_item.setPosition(cc.p(0, 0));
                }else{
                    // 增加新item后仍不足一页
                    cur_item.removeFromParent();
                    cur_scroll.addChild(cur_item);
                    cur_item.setPosition(cc.p(0, last_item_pos - cur_item_size.height));
                }
            }
        }
        cur_item.setVisible(true);
    },

    create_btn_array:function(btn_list, btn_func, init_btn_num){
        // Desc. 为一组按钮btn_list创建关联关系，一个被按下其他按钮会被重启提起
        // Args. btn_func需要有一个参数，参数为按钮标号
        // 标记编号
        for (var i = 0; i < btn_list.length; i++) {
            btn_list[i].btn_id = i;
        }
        function player_num_select_event(sender, eventType){
            if (eventType == ccui.Widget.TOUCH_ENDED) {
                btn_func(sender.btn_id);
                for (var i = 0; i < btn_list.length; i++) {
                    if (i == sender.btn_id) {
                        btn_list[i].setBright(false);
                        btn_list[i].setTouchEnabled(false);
                    }else{
                        btn_list[i].setBright(true);
                        btn_list[i].setTouchEnabled(true);
                    }
                }
            }
        }
        for (var i = 0; i < btn_list.length; i++) {
            btn_list[i].addTouchEventListener(player_num_select_event);
        }
        // 设置初始按钮
        init_btn_num = init_btn_num || 1;
        for (var i = 0; i < btn_list.length; i++) {
            if (i == init_btn_num) {
                btn_list[i].setBright(false);
                btn_list[i].setTouchEnabled(false);
            }else{
                btn_list[i].setBright(true);
                btn_list[i].setTouchEnabled(true);
            }
        }
    },

    set_hint_red_dot:function(cur_item, is_visible, anchor_x, anchor_y, scale){
        // Desc. 设置当前组件cur_item是否显示提示红点，红点相对cur_item的位置可以用过anchor_x和anchor_y来设置
        // Ret . 无
        anchor_x = anchor_x || 1.0;
        anchor_y = anchor_y || 1.0;
        var content_size = cur_item.getContentSize();
        var red_dot_img = cur_item.getChildByName("red_dot_img");
        if (red_dot_img) {
            // 已经创建了提示红点
            red_dot_img.setVisible(is_visible);
            red_dot_img.setPosition(anchor_x * content_size.width, anchor_y * content_size.height);
        }else{
            // 未创建过提示红点
            if (true == is_visible) {
                // 红点显示时才进行创建
                red_dot_img = ccui.ImageView.create();
                red_dot_img.setName("red_dot_img");
                red_dot_img.loadTexture("res/ui/Default/red_dot.png");
                // var anchor_point = cur_item.getAnchorPoint();
                cur_item.addChild(red_dot_img);
                red_dot_img.setPosition(anchor_x * content_size.width, anchor_y * content_size.height);
                var circle = new cc.Sprite("res/ui/Default/red_dot_effect.png");
                red_dot_img.addChild(circle);
                circle.setPosition(14,14);
                circle.runAction(cc.RepeatForever.create(cc.Sequence.create(
                    // cc.delayTime(0.1),
                    // cc.callFunc(function () {
                    //     circle.setOpacity(255);
                    //     circle.setScale(0.3);
                    // }),
                    cc.Spawn.create(
                        // cc.scaleTo(0.66666, 2.4, 2.4).easing(cc.easeIn(0.5)),
                        cc.scaleTo(0, 0.3,0.3),
                        cc.fadeIn(0)
                    ),
                    cc.Spawn.create(
                        // cc.scaleTo(0.66666, 2.4, 2.4).easing(cc.easeIn(0.5)),
                        cc.scaleTo(1.5, 2.4, 2.4),
                        cc.fadeOut(1.5)
                    )
                )))
            }
        }
        if (red_dot_img) {
            red_dot_img.setScale(scale);
        }
    },

    create_clipping_single:function(portrait_img, stencil_name){
        // body
        var framesize = portrait_img.getContentSize();
        var stencil = cc.Sprite.create(stencil_name);//"res/ui/GameHallUI/gamehall_portrait_stencil.png")
        stencil.setAnchorPoint(0.5, 0.5);
        //stencil.setPosition(x, y)
        //var size = stencil.getContentSize()
        //stencil.setScaleX(framesize.width / size.width)
        //stencil.setScaleY(framesize.height / size.height)

        var clipping_node = cc.ClippingNode.create();
        clipping_node.setName("clipping_portrait_node");
        //clipping_node.setAnchorPoint(0.5, 0.5)
        clipping_node.setPosition(portrait_img.getPosition());
        clipping_node.setInverted(false);
        clipping_node.setAlphaThreshold(0.5);
        clipping_node.setStencil(stencil);
        //clipping_node.setContentSize(portrait_img.getContentSize())
        portrait_img.retain();
        var parentNode = portrait_img.getParent();
        portrait_img.removeFromParent();
        portrait_img.setPosition(0, 0);
        clipping_node.addChild(portrait_img);
        parentNode.addChild(clipping_node);
        portrait_img.release();
        //clipping_node.setLocalZOrder(const.MAX_LAYER_NUM)
        //parentNode.setLocalZOrder(const.MAX_LAYER_NUM)
    },

    create_clipping:function(item_list, stencil_name, stencil_anchor_x, stencil_anchor_y){
        // Desc. 该方法将创建一个clipping_node插入到item_list[0]和它的父节点之间
        // Ret . 创建的clipping_node作为方法返回值，可以获取后进行所需要的定制

        // 默认stencil的锚点为0, 0
        var anchor_point = item_list[0].getAnchorPoint();
        stencil_anchor_x = stencil_anchor_x || anchor_point.x;
        stencil_anchor_y = stencil_anchor_y || anchor_point.y;
        var parent_node = item_list[0].getParent();
        var stencil = cc.Sprite.create(stencil_name);
        stencil.setAnchorPoint(stencil_anchor_x, stencil_anchor_y);
        stencil.setPosition(0, 0);
        var clipping_node = cc.ClippingNode.create();
        clipping_node.setName("clipping_node");
        clipping_node.setPosition(item_list[0].getPositionX(), item_list[0].getPositionY());
        clipping_node.setInverted(false);
        // clipping_node.setAlphaThreshold(0.5);
        clipping_node.setStencil(stencil);
        clipping_node.setContentSize(item_list[0].getContentSize());
        parent_node.addChild(clipping_node);
        for (var i = 0; i < item_list.length; i++) {
            item_list[i].retain();
            item_list[i].removeFromParent();
            clipping_node.addChild(item_list[i]);
            item_list[i].release();
            if (item_list[i].getPositionType() == ccui.Widget.POSITION_PERCENT) {
                item_list[i].setPositionPercent(cc.p(0, 0));
            }else{
                item_list[i].setPosition(0, 0);
            }
        }
        return clipping_node;
    },

    load_effect_plist:function(name, multi_num){
        // Desc. 根据name加载特效所需要的图片
        // Args. name是特效名称，部分分为多张的特效可以通过multi_num制定图片数目
        // Ret . 无
        // Noti. 无
        //    if name == 'effect_gamehall_all' {
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
        // cc.Texture2D.setDefaultAlphaPixelFormat(cc.TEXTURE2_D_PIXEL_FORMAT_RGB_A4444);
        //    }
        var cache = cc.spriteFrameCache;
        // var cache = cc.spriteFrameCache.getInstance()
        if (multi_num && multi_num > 0) {
            // var res_list = [];
            // for (var i = 0; i < multi_num; i++) {
            //     res_list.push("res/effect/" + name + i.toString() + ".plist");
            //     res_list.push("res/effect/" + name + i.toString() + ".png");
            // }
            // cc.loader.load(res_list);
            for (var i = 0; i < multi_num; i++) {
                cache.addSpriteFrames("res/effect/" + name + i.toString() + ".plist", "res/effect/" + name + i.toString() + ".png");
            }
        }else{
            var plist_path = "res/effect/" + name + ".plist";
            var png_path = "res/effect/" + name + ".png";

            cache.addSpriteFrames(plist_path, png_path);
        }
        //    if name == 'effect_gamehall_all' {
        // cc.Texture2D.setDefaultAlphaPixelFormat(cc.TEXTURE2_D_PIXEL_FORMAT_RGB_A8888)
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
        //    }
    },

    create_effect_action:function(effect_info){
        // Desc. 根据表中的设置创建播放特效的动作
        // Args. effect_info是特效的信息
        // Ret . 创建好的特效动作effect_action
        // Noti. 使用前必须使用load_effect_plist加载相关png
        if (!effect_info) {
            return null;
        }
        var cache = cc.spriteFrameCache;
        // var cache = cc.spriteFrameCache.getInstance()
        var anim_frames = [];
        // var effect_animation = new cc.Animation();
        for (var i = 1; i <= effect_info["FRAMENUM"]; i++) {
            var frame = cache.getSpriteFrame(effect_info["NAME"] + i.toString() + ".png");
            if (frame) {
                anim_frames.push(frame);
            }
            // effect_animation.addSpriteFrame(frame);
        }
        // effect_animation.setDelayPerUnit(effect_info["TIME"]/effect_info["FRAMENUM"]);
        // effect_animation.setRestoreOriginalFrame(true);

        var effect_animation = new cc.Animation(anim_frames, effect_info["TIME"]/effect_info["FRAMENUM"]);

        // var effect_animation = cc.Animation.createWithSpriteFrames(anim_frames, effect_info["TIME"]/effect_info["FRAMENUM"]);
        //effect_animation.setDelayPerUnit(2.8 / #effect_animation.getFrames())
        //effect_animation.setRestoreOriginalFrame(true)
        var effect_action = new cc.Animate(effect_animation);
        // var effect_action = cc.Animate.create(effect_animation);
        return effect_action;
    },

    // 某些情况下使用create_effect_action创建的动画会产生黑边
    // Note: 不建议使用这个方法
    create_effect_action_ugly: function (effect_info, node) {
        if (!effect_info) {
            return null;
        }
        var anim_frames = [];
        var cache = cc.spriteFrameCache;
        for (var i = 1; i <= effect_info["FRAMENUM"]; i++) {
            var frame = cache.getSpriteFrame(effect_info["NAME"] + i.toString() + ".png");
            if (frame) {
                anim_frames.push(frame);
            }
        }
        var index = 0;
        var count = effect_info["FRAMENUM"];
        return cc.sequence(
            cc.callFunc(function () {
                node.setSpriteFrame(anim_frames[index]);
                index = (++index) % count;
            }),
            cc.delayTime(effect_info["TIME"] / effect_info["FRAMENUM"])
        ).repeat(count);
    },

    //[[
    stop_effect:function(effect_sprite, eid){
        // TODO: load
        // var table_effect = require("data/table_effect")
        var table_info = table_effect[eid];
        if (table_info === null || table_info === undefined) {
            return;
        }
        var path = effect_info["PATH"] || "";
        effect_sprite.stopAllActions();
        effect_sprite.setVisible(false);
        cc.spriteFrameCache.removeSpriteFramesFromFile("res/effect/" + path + table_effect[eid]["NAME"] + ".plist");
    },
    // ]]

    create_btn_group:function(btn_list, click_func, init_func){
        for (var i = 0; i < btn_list.length; i++) {
            btn_list[i].btn_id = i;
        }

        if (init_func) {
            for (var i = 0; i < btn_list.length; i++) {
                init_func(btn_list[i]);
            }
        }

        function setBtnState(btn, state){
            btn.setBright(state);
            btn.setTouchEnabled(state);
        }

        function btn_touch_func(sender, eventType){
            if (eventType === ccui.Widget.TOUCH_ENDED) {
                click_func(sender, eventType)
                for (var i = 0; i < btn_list.length; i++) {
                    if (btn_list[i] === sender) {
                        setBtnState(btn_list[i], false);
                    } else {
                        setBtnState(btn_list[i], true);
                    }
                }
            }
        }

        if (click_func) {
            for (var i = 0; i < btn_list.length; i++) {
                btn_list[i].addTouchEventListener(btn_touch_func);
            }
        }
    },

    create_check_box_group:function(parent, chx_name, chx_num, cbk_func, sel_idx, label_name){
        label_name = label_name || "";
        var chx_list = [];
        var label_list = [];
        function chx_event(sender, eventType){
            if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
                for (var i = 0; i < chx_list.length; i++) {
                    if (sender != chx_list[i]) {
                        chx_list[i].setSelected(false);
                        chx_list[i].setTouchEnabled(true);
                        if (label_name) {label_list[i].setTouchEnabled(true);}
                    }else{
                        cbk_func(i);
                        sender.setSelected(true);
                        sender.setTouchEnabled(false);
                        if (label_name) {label_list[i].setTouchEnabled(false);}
                    }
                }
            }
        }
        for (var i = 0; i < chx_num; i++) {
            var chx = ccui.helper.seekWidgetByName(parent, chx_name + String(i+1));
            chx.addTouchEventListener(chx_event);
            chx_list.push(chx);
            if(i === sel_idx){
                chx.setSelected(true);
                chx.setTouchEnabled(false);
            }else {
                chx.setSelected(false);
                chx.setTouchEnabled(true);
            }
        }

        if (label_name) {
            function label_event(sender, eventType){
                if (eventType == ccui.Widget.TOUCH_ENDED) {
                    var sender_idx = sender.getName()[sender.getName().length - 1];
                    for (var i = 0; i < label_list.length; i++) {
                        var chx_i_idx = chx_list[i].getName()[chx_list[i].getName().length - 1];
                        if (sender_idx != chx_i_idx) {
                            chx_list[i].setSelected(false);
                            chx_list[i].setTouchEnabled(true);
                            label_list[i].setTouchEnabled(true);
                        }else{
                            cbk_func(i);
                            chx_list[i].setSelected(true);
                            chx_list[i].setTouchEnabled(false);
                            sender.setTouchEnabled(false);
                        }
                    }
                }
            }
            for (var i = 0; i < chx_num; i++) {
                var label = ccui.helper.seekWidgetByName(parent, label_name + String(i+1));
                label.addTouchEventListener(label_event);
                label_list.push(label);
                if(i === sel_idx){
                    label.setTouchEnabled(false);
                }else {
                    label.setTouchEnabled(true);
                }
            }
        }
    },

    create_check_box_group_by_nomal:function(parent, chx_name, chx_num, cbk_func, sel_idx, label_name,key){
        label_name = label_name || "";
        var chx_list = [];
        var label_list = [];
        function chx_event(sender, eventType){
            if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
                for (var i = 0; i < chx_list.length; i++) {
                    if (sender != chx_list[i]) {
                        chx_list[i].setSelected(false);
                        chx_list[i].setTouchEnabled(true);
                        if (label_name) {
                            label_list[i].setTouchEnabled(true);
							label_list[i].updateDisplayedColor(const_val.ROOM_WORD_NORMAL);
                        }
                    }else{
                        cbk_func(i,key);
                        sender.setSelected(true);
                        sender.setTouchEnabled(false);
                        if (label_name) {
                            label_list[i].setTouchEnabled(false);
							label_list[i].updateDisplayedColor(const_val.ROOM_WORD_SELECT);
                        }
                    }
                }
            }
        }
        for (var i = 0; i < chx_num; i++) {
            var chx = parent.getChildByName(chx_name + String(i+1));
            chx.addTouchEventListener(chx_event);
            chx_list.push(chx);
            if(i === sel_idx){
                chx.setSelected(true);
                chx.setTouchEnabled(false);
            }else {
                chx.setSelected(false);
                chx.setTouchEnabled(true);
            }
        }

        if (label_name) {
            function label_event(sender, eventType){
                if (eventType == ccui.Widget.TOUCH_ENDED) {
                    var sender_idx = sender.getName()[sender.getName().length - 1];
                    for (var i = 0; i < label_list.length; i++) {
                        var chx_i_idx = chx_list[i].getName()[chx_list[i].getName().length - 1];
                        if (sender_idx != chx_i_idx) {
                            chx_list[i].setSelected(false);
                            chx_list[i].setTouchEnabled(true);
                            label_list[i].setTouchEnabled(true);
                            label_list[i].updateDisplayedColor(const_val.ROOM_WORD_NORMAL);
                        }else{
                            cbk_func(i,key);
                            chx_list[i].setSelected(true);
                            chx_list[i].setTouchEnabled(false);
                            sender.setTouchEnabled(false);
							sender.updateDisplayedColor(const_val.ROOM_WORD_SELECT);
                        }
                    }
                }
            }
            for (var i = 0; i < chx_num; i++) {
                var label = parent.getChildByName(label_name + String(i+1));
                label.addTouchEventListener(label_event);
                label_list.push(label);
                if(i === sel_idx){
					label.updateDisplayedColor(const_val.ROOM_WORD_SELECT);
                    label.setTouchEnabled(false);
                }else {
					label.updateDisplayedColor(const_val.ROOM_WORD_NORMAL);
                    label.setTouchEnabled(true);
                }
            }
        }
    },

    create_check_box_group_by_reset:function(parent, chx_name, chx_num, cbk_func, sel_idx, label_name,key){
        label_name = label_name || "";
        var chx_list = [];
        var label_list = [];
        function chx_event(sender, eventType){
            if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
                for (var i = 0; i < chx_list.length; i++) {
                    if (sender == chx_list[i]) {
                        cbk_func(i,key);
                    }
                }
            }
        }
        for (var i = 0; i < chx_num; i++) {
            // var chx = ccui.helper.seekWidgetByName(parent, chx_name + String(i+1));
            var chx = parent.getChildByName(chx_name + String(i+1));
            chx.addTouchEventListener(chx_event);
            chx_list.push(chx);
            if(i === sel_idx){
                chx.setSelected(true);
                chx.setTouchEnabled(false);
            }else {
                chx.setSelected(false);
                chx.setTouchEnabled(true);
            }
        }

        if (label_name) {
            function label_event(sender, eventType){
                if (eventType == ccui.Widget.TOUCH_ENDED) {
                    var sender_idx = sender.getName()[sender.getName().length - 1];
                    cbk_func(sender_idx-1,key);
                }
            }
            for (var i = 0; i < chx_num; i++) {
                var label = parent.getChildByName(label_name + String(i+1));
                label.addTouchEventListener(label_event);
                label_list.push(label);
                if(i === sel_idx){
					label.updateDisplayedColor(const_val.ROOM_WORD_SELECT);
                    label.setTouchEnabled(false);
                }else {
					label.updateDisplayedColor(const_val.ROOM_WORD_NORMAL);
                    label.setTouchEnabled(true);
                }
            }
        }
    },

    create_check_box_single:function (parent, chx_name, cbk_func, is_select, label_name) {
        label_name = label_name || "";
        var chx_flag = true;
        function chx_event(sender, eventType){
            // cc.log(eventType)
            if (eventType == ccui.CheckBox.EVENT_SELECTED) {
                cbk_func(true);
                chx_flag = true;
            } else if(eventType == ccui.CheckBox.EVENT_UNSELECTED){
                cbk_func(false);
                chx_flag = false;
            }
        }
        var chx = ccui.helper.seekWidgetByName(parent, chx_name + String(1));
        chx.addEventListener(chx_event);
        if(is_select){
            chx.setSelected(true);
            chx_flag = true;
        }else{
            chx.setSelected(false);
            chx_flag = false;
        }

        if (label_name) {
            function label_event(sender, eventType){
                // cc.log(eventType)
                if (eventType == ccui.Widget.TOUCH_ENDED) {
                    if (chx_flag) {
                        chx_flag = false;
                        chx.setSelected(false);
                        cbk_func(false);
                    } else {
                        chx_flag = true;
                        chx.setSelected(true);
                        cbk_func(true);
                    }
                }
            }
            var label = ccui.helper.seekWidgetByName(parent, label_name);
            label.setTouchEnabled(true);
            label.addTouchEventListener(label_event);
        }
    },

    create_check_box_single_by_room:function (parent, chx_name, cbk_func, is_select, label_name,key) {
        label_name = label_name || "";
        var chx_flag = true;
		let lab = parent.getChildByName(label_name);
		lab.is_change_select = false;//因为在外面修改lab的点击状态时 无法重置chx_flag的状态产生的问题。
        function chx_event(sender, eventType){
            if (eventType == ccui.CheckBox.EVENT_SELECTED) {
                cbk_func(true,key);
                chx_flag = true;
				lab.updateDisplayedColor(const_val.ROOM_WORD_SELECT);
            } else if(eventType == ccui.CheckBox.EVENT_UNSELECTED){
                cbk_func(false,key);
                chx_flag = false;
				lab.updateDisplayedColor(const_val.ROOM_WORD_NORMAL);
            }
        }
        var chx = parent.getChildByName(chx_name);
        chx.addEventListener(chx_event);
        if(is_select){
            chx.setSelected(true);
            chx_flag = true;
			lab.updateDisplayedColor(const_val.ROOM_WORD_SELECT);
        }else{
            chx.setSelected(false);
            chx_flag = false;
			lab.updateDisplayedColor(const_val.ROOM_WORD_NORMAL);
        }

        if (label_name) {
            function label_event(sender, eventType){
                // cc.log(eventType)
                if (eventType == ccui.Widget.TOUCH_ENDED) {
					if(sender.is_change_select){
						sender.is_change_select = false;
						chx_flag = false;
					}
                    if (chx_flag) {
                        chx_flag = false;
                        chx.setSelected(false);
                        cbk_func(false,key);
						lab.updateDisplayedColor(const_val.ROOM_WORD_NORMAL);
                    } else {
                        chx_flag = true;
                        chx.setSelected(true);
                        cbk_func(true,key);
						lab.updateDisplayedColor(const_val.ROOM_WORD_SELECT);
					}
                }
            }
            var label = parent.getChildByName(label_name);
            label.setTouchEnabled(true);
            label.addTouchEventListener(label_event);
        }
    },

    create_touch_region:function (parentNode, anchor, pos, size, event) {
        //触摸区域的初始化
        var chx_touchregion = ccui.ImageView.create();
        chx_touchregion.setScale9Enabled(true);
        chx_touchregion.setAnchorPoint(anchor);
        chx_touchregion.setContentSize(size);
        chx_touchregion.setPosition(pos);
        chx_touchregion.loadTexture("res/ui/Default/common_blank.png");
        chx_touchregion.setTouchEnabled(true);
        chx_touchregion.addTouchEventListener(event);
        parentNode.addChild(chx_touchregion);
    },

	update_panel_items:function (cur_panel, item_info_list, update_func) {
		var item_list = cur_panel.getChildren();
		var offpos = item_list[0].getPosition();
		var item_content_size = item_list[0].getContentSize();
		var offsetx = offpos.x;
		var offsety = offpos.y;
		for (var i = 0; i < item_info_list.length; i++) {
			if (!item_list[i]) {
				if((cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative)){
					item_list[i] = item_list[0].clone();
					cur_panel.addChild(item_list[i]);
				} else {
					var cur_item = item_list[0].clone();
					cur_panel.addChild(cur_item);
				}
			}
			item_list[i].setVisible(true);
			//摆放位置
			item_list[i].setPosition(cc.p(offsetx, cur_panel.getContentSize().height-item_content_size.height*(i+1)));
		}

		//更新数据
		for (var i = 0; i < item_info_list.length; i++) {
			update_func(item_list[i], item_info_list[i], i);
		}
		if (item_info_list.length < item_list.length) {
			// item多余时处理
			for (var i = item_list.length - 1; i >= item_info_list.length; i--) {
				if (i == 0) {
					item_list[i].setVisible(false);
				}else{
					item_list[i].removeFromParent();
					item_list[i] = undefined;
				}
			}
			if (item_info_list.length > 1){
				item_list.length = item_info_list.length;
			} else {
				item_list.length = 1;
			}
		}
	},


	addOriginPosition: function (node, offsetX, offsetY) {
		if (!node.originEditorPosition) {
			node.originEditorPosition = node.getPosition();
		}
		let origin = node.originEditorPosition;
		node.setPosition(origin.x + offsetX, origin.y + offsetY);
	},

	saveOriginPosition: function (node, position) {
		position = position || node.originEditorPosition;
		if (!node.originEditorPosition) {
			position = position || node.getPosition();
			node.originEditorPosition = position;
		} else {
			if (position) {
				node.originEditorPosition = position;
			}
		}
	},

	resetToOriginPosition: function (node, resetX, resetY) {
		if (node.originEditorPosition) {
			if (resetX === undefined) {
				resetX = true;
			}
			if (resetY === undefined) {
				resetY = true;
			}
			node.setPosition(resetX ? node.originEditorPosition.x : node.getPositionX(), resetY ? node.originEditorPosition.y : node.getPositionY());
		}
	},

	showToast: function (target, msg, pos, duration, background) {
		let node = target.getChildByName("_toast_node");
		let txt = null;
		if (node) {
			node.stopAllActions();
			txt = node.getChildByName("_txt");
			txt.stopAllActions();
			txt.setOpacity(255);
		} else {
			node = new ccui.Layout();
			node.setTouchEnabled(false);
			node.setName("_toast_node");
			txt = ccui.Text.create();
			// txt.setFontName("res/ui/font/zhunyuan.ttf");
			txt.setName("_txt");
			node.addChild(txt);
			txt.setFontSize(24);
			target.addChild(node);
		}
		txt.runAction(cc.sequence(cc.delayTime(duration), cc.fadeOut(0.3)));
		if (background) {
			let bg = node.getChildByName("_bg");
			if (bg) {
				bg.setVisible(true);
				bg.stopAllActions();
			} else {
				bg = cc.Sprite.create("res/ui/Default/toast_bg.png");
				node.addChild(bg);
				bg.setLocalZOrder(-1);
			}
			bg.setOpacity(255);
			bg.runAction(cc.sequence(cc.delayTime(duration), cc.fadeOut(0.3)))
		} else {
			let bg = node.getChildByName("_bg");
			if (bg) {
				bg.setVisible(false)
			}
		}
		txt.setString(msg || "");
		node.setPosition(pos);
		node.runAction(cc.sequence(cc.delayTime(duration + 0.3), cc.removeSelf()))
		// node.runAction(cc.sequence(cc.delayTime(duration), cc.fadeOut(0.2), cc.removeSelf()))
	},
    /*
    *    target: 显示场景
    *    msg: 图片路径;
    *    pos: 相对位置
    *    duration: 销毁时间
    *    background: 背景路径
    */
    playInfoMsg: function (target, msg, pos, duration, background) {
        let node = target.getChildByName("_toast_node");
        let txt = null;
        if (node) {
            node.stopAllActions();
            txt = node.getChildByName("_txt");
            txt.stopAllActions();
            txt.setOpacity(255);
        } else {
            node = new ccui.Layout();
            node.setTouchEnabled(false);
            node.setName("_toast_node");

            txt = cc.Sprite.create(msg);
            node.addChild(txt);
            txt.setName("_txt");

            target.addChild(node);
        }
        txt.runAction(cc.sequence(cc.delayTime(duration), cc.fadeOut(0.3)));
        if (background) {
            let bg = node.getChildByName("_bg");
            if (bg) {
                bg.setVisible(true);
                bg.stopAllActions();
            } else {
                bg = cc.Sprite.create(background);
                node.addChild(bg);
                bg.setLocalZOrder(-1);
            }
            bg.setOpacity(255);
            bg.runAction(cc.sequence(cc.delayTime(duration), cc.fadeOut(0.3)));
        } else {
            let bg = node.getChildByName("_bg");
            if (bg) {
                bg.setVisible(false)
            }
        }
        //txt.setString(msg || "");
        node.setPosition(pos);
        node.runAction(cc.sequence(cc.delayTime(duration + 0.3), cc.removeSelf()))
    },

	createBMFont: function (text, font) {
		var widget = new ccui.TextBMFont();
		widget.setCascadeColorEnabled(true);
		widget.setCascadeOpacityEnabled(true);

		widget.setUnifySizeEnabled(false);
		if (!cc.loader.getRes(font)) {
			cc.loader.load(font, function () {
				if (cc.sys.isObjectValid(widget)) {
					widget.setFntFile(font);
				}
			});
		} else {
			widget.setFntFile(font);
		}
		widget.setString(text);
		widget.ignoreContentAdaptWithSize(true);
		return widget;
	},

	isAncestorsVisible: function (node) {
		if (null == node) {
			return true;
		}
		var parent = node.getParent();

		if (parent && !parent.isVisible()) {
			return false;
		}
		return this.isAncestorsVisible(parent);
	},

	touchEventVisibleCheckListener: function (delegateFunc) {
		function wrapper(source, eventType) {
			if (cc.sys.isObjectValid(source) && UICommonWidget.isAncestorsVisible(source)) {
				delegateFunc && delegateFunc(source, eventType);
			}
		}
		return wrapper;
	},
	/**
     *
	 * @param cur_scroll
	 * @param item_info_list 数据
	 * @param itemUIPathFunc 一条数据对应的ui文件
	 * @param update_func 更新数据方法
	 * @param options 配置参数
	 * @param itemDict 加载完成ui对象
	 */
	update_scroll_items2: function (cur_scroll, item_info_list, itemUIPathFunc, update_func, options, itemDict) {
		if (!cc.sys.isObjectValid(cur_scroll)) {
			return;
		}
		// Note: 由于clone的节点会丢失Component 这里换了一种做法
		options = options || {};
		// var cacheSize = options.cacheSize || 3;
		var offsetX = options.offset ? options.offset.x : 0;
		var offsetY = options.offset ? options.offset.y : 0;
		if (!itemDict) {
			if (!options.res) {
				var pathList = [];
				for (var i = 0; i < item_info_list.length; i++) {
					var path = itemUIPathFunc(item_info_list[i]);
					if (path && pathList.indexOf(path) < 0) {
						pathList.push(path);
					}
				}
			}
			options.res = pathList;
			var resourceFilenameList = options.res;
			if (resourceFilenameList.length > 0) {
				for (var i = resourceFilenameList.length - 1; i >= 0; i--) {
					if (cur_scroll._loadedRes && cur_scroll._loadedRes.indexOf(resourceFilenameList[i]) >= 0) {
						resourceFilenameList.splice(i, 1);
					}
				}
			}
			if (resourceFilenameList.length > 0) {
				cc.loader.load(resourceFilenameList, function () {
					itemDict = {};
					if (cur_scroll._loadedRes) {
						for (var i = 0; i < resourceFilenameList.length; i++) {
							if (cur_scroll._loadedRes.indexOf(resourceFilenameList[i]) == -1) {
								cur_scroll._loadedRes.push(resourceFilenameList[i]);
							}
						}
					} else {
						cur_scroll._loadedRes = resourceFilenameList;
					}
					UICommonWidget.update_scroll_items2(cur_scroll, item_info_list, itemUIPathFunc, update_func, options, itemDict);
				});
				return;
			}
		}
		cur_scroll.removeAllChildren();

		var direction = cur_scroll.getDirection();
		var inner_width = 0;
		var inner_height = 0;

		var node = null;
		var size = null;
		var res = null;
		var data = null;
		var tmpList = [];
		var loadedRes = cur_scroll._loadedRes || [];
		for (var i = 0; i < item_info_list.length; i++) {
			data = item_info_list[i];
			res = itemUIPathFunc(data);
			if (!res) {
				cc.error("not found res", res);
				continue;
			}

			if (loadedRes.indexOf(res) === -1) {
				cc.error("not found res", res);
				continue;
			}

            var temp = ccs.load(res);
            node = temp.node.getChildren()[0];
            node.retain();
            // note: false 不然监听回丢失
            node.removeFromParent(false);

            node._resType = res;
			cur_scroll.addChild(node);
			node.release();
			update_func(node, data, i);
			size = node.getContentSize();
			if (direction === ccui.ScrollView.DIR_HORIZONTAL) {
				node.setPosition(inner_width + offsetX, offsetY);
				inner_width += size.width;
				inner_height = Math.max(size.height, inner_height);
			} else {
				tmpList.push(node);
				// node.setPosition(offsetX, inner_height + offsetY);
				inner_height += size.height;
				inner_width = Math.max(size.width, inner_width);
			}
		}

		var scroll_content_size = cur_scroll.getContentSize();
		if (inner_height < scroll_content_size.height) {
			inner_height = scroll_content_size.height;
		}
		if (inner_width < scroll_content_size.width) {
			inner_width = scroll_content_size.width;
		}
		cur_scroll.setInnerContainerSize(cc.size(inner_width, inner_height));

		// 垂直从上往下排
		if (direction === ccui.ScrollView.DIR_VERTICAL) {
			for (var i = 0; i < tmpList.length; i++) {
				inner_height -= tmpList[i].height;
				tmpList[i].setPosition(offsetX, inner_height - offsetY);
			}
			tmpList = null;
		}
	},
    /**
     * function add_btn_cd  给按钮加上冷却时间的资源
     * @param parent_btn 需要添加模板的按钮 (必填
     * @param resStencil 模板的资源路径 (必填
     * @param set_num 是否要添加CD文字
     * @param num_size 文字大小
     * @param num_color 文字颜色(cc.color)
     * @return null;
     */
    add_btn_cd: function (parent_btn,resStencil,set_num,num_size,num_color) {
        if (!cc.sys.isObjectValid(parent_btn)||parent_btn.getChildByName("progressCooling")) {
            return;
        }
        var sprStencil = new cc.Sprite(resStencil);
        // sprStencil.attr({
        //     x : parent_btn.getContentSize().width*0.5,
        //     y : parent_btn.getContentSize().height*0.5
        // });
        // sprStencil.setPosition(parent_btn.getContentSize().width*0.5,parent_btn.getContentSize().height*0.5);
        // parent_btn.addChild(sprStencil); //这里需要测试

        var progressCooling = new cc.ProgressTimer(sprStencil);
        // progressCooling.setReverseProgress(true);
        progressCooling.setName("progressCooling");
        progressCooling.setPosition(parent_btn.getContentSize().width*0.5,parent_btn.getContentSize().height*0.5);
        parent_btn.addChild(progressCooling);
        if(set_num){
            var num = ccui.Text.create("0","zhunyuan",num_size);
            num.setTextColor(num_color);
            num.setName("numCooling");
            num.setVisible(false);
            num.setPosition(progressCooling.getContentSize().width*0.5,progressCooling.getContentSize().height*0.5);
            progressCooling.addChild(num);
        }
        progressCooling.setVisible(false);
    },

    /**
     * function get_off_online_time
     * @param parent_btn 拥有冷却时间资源的按钮 (必填
     * @param wait_time 转完一圈的时间 (必填
     * @param time_left 剩下的时间 (必填
     * @param show_num 是否显示CD时间
     * @return null;
     */
    set_btn_cd:function(parent_btn,wait_time,time_left,show_num){
        if (!cc.sys.isObjectValid(parent_btn) || !parent_btn.getChildByName("progressCooling")) {
            return;
        }
        if(time_left<=0){
            return;
        }else{
            var progressCooling = parent_btn.getChildByName("progressCooling");
            progressCooling.setVisible(true);
            parent_btn.setTouchEnabled(false);
            if(show_num){
                progressCooling.setPercentage(parseInt((time_left/wait_time)*100));
                progressCooling.getChildByName("numCooling").setVisible(true);
                progressCooling.runAction(cc.sequence(
                    cc.progressTo(time_left,0),
                    cc.callFunc(function(){
                        parent_btn.setTouchEnabled(true);
                    })
                ));
                let time_lefts = time_left;
                progressCooling.runAction(cc.repeat(cc.sequence(cc.callFunc(function () {
                        progressCooling.getChildByName("numCooling").setString(time_lefts.toString());
                        if(time_lefts<=0){
                            progressCooling.setVisible(false);
                        }
                        time_lefts--;
                }),cc.delayTime(1.0)),time_left+1));
            }else{
                progressCooling.setPercentage(parseInt((time_left/wait_time)*100));
                progressCooling.runAction(cc.sequence(
                    cc.progressTo(time_left,0),
                    cc.callFunc(function(){
                        parent_btn.setTouchEnabled(true);
                    })
                ));
            }

		}
	},

	addTouchSelect: function (root, allHandCardUI, options) {
		var maxCount = allHandCardUI.length;
		var selectCardUIs = new Array(maxCount);
		options = options || {};
		var selectFunc = options.select;
		var cancelFunc = options.cancel;
		var touchFunc = options.touch;
		var convertLastFunc = options.convertLast;
		var visibleLengthFunc = options.visibleLength;
		var widthFunc = options.width;

		function tryCancelSelect(eventType) {
			if (eventType !== ccui.Widget.TOUCH_ENDED) {
				return;
			}
			cancelFunc && cancelFunc(allHandCardUI);
		}

		function cancelSelects() {
			for (var i = 0; i < selectCardUIs.length; i++) {
				let ui = selectCardUIs[i];
				if (!ui) {
					break;
				}
				selectFunc && selectFunc(ui, false);
			}
			selectCardUIs.fill(null);
		}

		function selectCards(start, end, eventType) {
			start = Math.min(start, maxCount - 1);
			end = Math.min(end, maxCount - 1);
			let startUI = allHandCardUI [start];
			if (!startUI.isVisible()) {
				if (start === end) {
					tryCancelSelect(eventType);
				}
				return;
			}
			for (var i = 0; i < maxCount; i++) {
				if (selectCardUIs[i]) {
					selectFunc && selectFunc(selectCardUIs[i]);
				} else {
					break;
				}
			}
			selectCardUIs.fill(null);
			selectCardUIs[0] = startUI;
			selectFunc && selectFunc(startUI);
			if (start === end) {
				return;
			}
			for (var i = start + 1; i <= end; i++) {
				let ui = allHandCardUI[i];
				if (ui.isVisible()) {
					selectFunc && selectFunc(ui);
					selectCardUIs[i - start] = ui;
				} else {
					return;
				}
			}
		}

		function convertLast(p, width) {
			for (var i = 0; i < maxCount; i++) {
				let ui = allHandCardUI[i];
				if (!ui.isVisible()) {
					let m = Math.max(i - 1, 0) + 1;
					return convertLastFunc(width, p, m) ? m - 1 : -1;
				}
			}
			return -1;
		}

		function handleSelectEvent(source, eventType) {
			let w = widthFunc(source);
			let begin = source.convertToNodeSpace(source.getTouchBeganPosition());
			let visibleLength = visibleLengthFunc();
			let startIndex = parseInt(begin.x / w * visibleLength);
			let endIndex = -1;
			let c = convertLast(begin, w);
			if (c !== -1) {
				startIndex = c;
			}
			if (eventType === ccui.Widget.TOUCH_BEGAN) {
				endIndex = startIndex;
			} else if (eventType === ccui.Widget.TOUCH_MOVED) {
				let move = source.convertToNodeSpace(source.getTouchMovePosition());
				let c = convertLast(move, w);
				if (c !== -1) {
					endIndex = c;
				} else {
					endIndex = parseInt(move.x / w * visibleLength);
				}
				if (startIndex > endIndex) {
					startIndex ^= endIndex;
					endIndex ^= startIndex;
					startIndex ^= endIndex;
				}
			} else if (eventType === ccui.Widget.TOUCH_ENDED) {
				let end = source.convertToNodeSpace(source.getTouchEndPosition());
				let c = convertLast(end, w);
				if (c !== -1) {
					endIndex = c;
				} else {
					endIndex = parseInt(end.x / w * visibleLength);
				}
				if (startIndex > endIndex) {
					startIndex ^= endIndex;
					endIndex ^= startIndex;
					startIndex ^= endIndex;
				}
			}

			if (startIndex < 0) {
				return;
			}
			selectCards(startIndex, endIndex, eventType);
		}

		root.addTouchEventListener(/*UICommonWidget.touchEventVisibleCheckListener*/(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_BEGAN) {
				selectCardUIs.fill(null);
				handleSelectEvent(source, eventType);
			} else if (eventType === ccui.Widget.TOUCH_MOVED) {
				handleSelectEvent(source, eventType);
			} else if (eventType === ccui.Widget.TOUCH_ENDED) {
				handleSelectEvent(source, eventType);
				selectCardUIs.fill(null);
			} else if (eventType === ccui.Widget.TOUCH_CANCELED) {
				cancelSelects();
			}
			touchFunc && touchFunc(source, eventType, allHandCardUI);
		}));
	},


};
