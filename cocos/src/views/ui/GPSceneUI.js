//var GPSceneUI = UIBase.extend({
var GPSceneUI = BasicDialogUI.extend({
    ctor:function() {
        this._super();
        this.resourceFilename = "res/ui/GPSceneUI.json";
        this.setLocalZOrder(const_val.GPSceneZOrder);
    },

    initUI:function(){
        var player = h1global.player();
        var self = this;
        var playerInfoList = player.curGameRoom.playerInfoList;
        cc.log(playerInfoList);

        var player_num = playerInfoList.length;
        if(player_num >4){
            this.gps_panel = this.rootUINode.getChildByName("gps_panel").getChildByName("five_panel");
            this.rootUINode.getChildByName("gps_panel").getChildByName("three_four_panel").setVisible(false);
            this.gps_panel.setVisible(true);
        }else{
            this.gps_panel = this.rootUINode.getChildByName("gps_panel").getChildByName("three_four_panel");
        }

        this.Avatar_panel=this.gps_panel.getChildByName("Avatar_panel");
        this.word_panel=this.gps_panel.getChildByName("word_panel");

        for(var i = 0 ; i < playerInfoList.length ; i++){
            let idx = i;
            if(playerInfoList[i]==null){
                continue;
            }
            cutil.loadPortraitTexture(playerInfoList[i]["head_icon"], playerInfoList[i]["sex"], function(img){
                if(self&&self.is_show){
                    var portrait_sprite  = new cc.Sprite(img);
                    portrait_sprite.setScale(100/portrait_sprite.getContentSize().width);
                    var head_frame = self.Avatar_panel.getChildByName("head_frame_img_"+ idx.toString());
                    head_frame.getChildByName("alert_img").setVisible(false);
                    if(head_frame.getChildByName("portrait_sprite")){
                        head_frame.getChildByName("portrait_sprite").removeFromParent();
                    }
                    portrait_sprite.setName("portrait_sprite");
                    head_frame.addChild(portrait_sprite);
                    portrait_sprite.x+=69;
                    portrait_sprite.y+=67;
                }
            });
        }
        // cc.error(player.curGameRoom.playerDistanceList);
        //5人定位图
        if(player_num >4){
            for (var i =0;i<player_num;i++){
                for(var j = i+1 ;j<player_num ; j++){
                    var distance = this.get_distance(i,j);
                    this.word_panel.getChildByName("word_panel_"+i+"_"+j).getChildByName("label").setString(distance !== -1 ? (distance > 1000 ? parseInt(distance / 1000) + "k" : distance) + "m" : "距离未知");
                }
            }
            return;
        }



        if(player.curGameRoom.playerDistanceList[3]!=null){
            var distance = this.get_distance(2,3);
            this.word_panel.getChildByName("word_panel_0").getChildByName("label").setString(distance !== -1 ? (distance > 1000 ? parseInt(distance / 1000) + "k" : distance) + "m" : "距离未知");
            var distance = this.get_distance(1,3);
            this.word_panel.getChildByName("word_panel_1").getChildByName("label").setString(distance !== -1 ? (distance > 1000 ? parseInt(distance / 1000) + "k" : distance) + "m" : "距离未知");
            var distance = this.get_distance(0,3);
            this.word_panel.getChildByName("word_panel_2").getChildByName("label").setString(distance !== -1 ? (distance > 1000 ? parseInt(distance / 1000) + "k" : distance) + "m" : "距离未知");
        }
        var distance = this.get_distance(0,2);
        this.word_panel.getChildByName("word_panel_3").getChildByName("label").setString(distance !== -1 ? (distance > 1000 ? parseInt(distance / 1000) + "k" : distance) + "m" : "距离未知");
        var distance = this.get_distance(0,1);
        this.word_panel.getChildByName("word_panel_4").getChildByName("label").setString(distance !== -1 ? (distance > 1000 ? parseInt(distance / 1000) + "k" : distance) + "m" : "距离未知");
        var distance = this.get_distance(1,2);
        this.word_panel.getChildByName("word_panel_5").getChildByName("label").setString(distance !== -1 ? (distance > 1000 ? parseInt(distance / 1000) + "k" : distance) + "m" : "距离未知");

        if(player.curGameRoom.playerDistanceList[3]==null){
            this.line_panel=this.gps_panel.getChildByName("line_panel");
            this.line_panel.getChildByName("line_img_0").setVisible(false);
            this.line_panel.getChildByName("line_img_1").setVisible(false);
            this.line_panel.getChildByName("line_img_4").setVisible(false);
            this.word_panel.getChildByName("word_panel_0").setVisible(false);
            this.word_panel.getChildByName("word_panel_1").setVisible(false);
            this.word_panel.getChildByName("word_panel_2").setVisible(false);
            this.Avatar_panel.getChildByName("head_frame_img_3").setVisible(false);
            this.word_panel.getChildByName("word_panel_3").setPositionX(250);
        }
    },

    get_distance:function (serverSitNum1,serverSitNum2){
        var player = h1global.player();
        // cc.log(player.curGameRoom.playerDistanceList);
        //var playerDistanceList = [[-1,200,300,199999], [200,-1,250,199999], [300,250,-1,199999], [199999,199999,1999999,-1]];
        var playerDistanceList = player.curGameRoom.playerDistanceList;
        var distance1 = parseInt(playerDistanceList[serverSitNum1][serverSitNum2]);
        var distance2 = parseInt(playerDistanceList[serverSitNum2][serverSitNum1]);
        return distance1>distance2 ? distance1:distance2;
    }

});