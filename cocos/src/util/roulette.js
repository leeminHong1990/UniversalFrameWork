var roulette = function(){}

/**
 * function init_roulette_2d
 * @param parent 父节点
 */
roulette.init_roulette_2d = function(parent){
    var player = h1global.player();
    var curServerSitNum = (player.serverSitNum - player.curGameRoom.dealerIdx + 4) % 4;
    if(player.curGameRoom.player_num==4){
        parent.setRotation((90 * curServerSitNum) % 360);
    }
    //加载动画资源
    var wordList =["res/ui/GameRoom2DUI/east_word.png","res/ui/GameRoom2DUI/south_word.png","res/ui/GameRoom2DUI/west_word.png","res/ui/GameRoom2DUI/north_word.png"];
    var wordPosList = [cc.p(60,19.5),cc.p(100,60),cc.p(60, 100),cc.p(19.7, 59.7)];
    var airList =["res/ui/GameRoom2DUI/east_air.png","res/ui/GameRoom2DUI/south_air.png","res/ui/GameRoom2DUI/west_air.png","res/ui/GameRoom2DUI/north_air.png"];

    for(var i =0;i<wordList.length;i++){
        var direct_word = new cc.Sprite(wordList[i]);
        var direct_air = new cc.Sprite(airList[i]);
        direct_air.setName("direct_air"+i.toString());
        direct_word.setName("direct_word"+i.toString());
        parent.addChild(direct_air);
        parent.addChild(direct_word);
        direct_air.setPosition(parent.getChildByName("direct_img"+i.toString()).getPosition());
        direct_air.setAnchorPoint(parent.getChildByName("direct_img"+i.toString()).getAnchorPoint());
        //cc.log(parent.getChildByName("direct_img"+i.toString()).isFlippedX());
        //direct_air.setFlippedX(parent.getChildByName("direct_img"+i.toString()).isFlippedX());//不能work
        if(parent.getChildByName("direct_img"+i.toString()).isFlippedX()){
            direct_air.setScaleX(-1);
            direct_word.setScaleX(-1);
        }
        direct_word.setPosition(wordPosList[i]);
    }
};

/**
 * function update_roulette_2d
 * @param parent 父节点
 * @param serverSitNum 当前打牌的人
 */
roulette.update_roulette_2d = function(parent,serverSitNum){
    var player = h1global.player();
    var curServerSitNum = (serverSitNum - player.curGameRoom.dealerIdx + 4) % 4;
    if(player.curGameRoom.player_num==3){
        curServerSitNum = player.server2CurSitNum(curServerSitNum);
    }
	if (player.curGameRoom.player_num == 2) {
		parent.getChildByName("direct_img1").setVisible(false);
		parent.getChildByName("direct_air1").setVisible(false);
		parent.getChildByName("direct_word1").setVisible(false);
		parent.getChildByName("direct_img3").setVisible(false);
		parent.getChildByName("direct_air3").setVisible(false);
		parent.getChildByName("direct_word3").setVisible(false);
		for(var i = 0; i < 2; i++){
			var index = i < 1 ? i : 2;
			var light_img = parent.getChildByName("direct_img" + index.toString());
			var direct_air = parent.getChildByName("direct_air" + index.toString());
			var direct_word = parent.getChildByName("direct_word" + index.toString());
			if( i == ((serverSitNum + 2 - h1global.player().serverSitNum)%2) ){
				light_img.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.FadeIn.create(0.58), cc.FadeOut.create(0.58))));
				light_img.setVisible(true);
				direct_air.setVisible(true);
				direct_word.setVisible(true);
			} else {
				light_img.stopAllActions();
				light_img.setVisible(false);
				direct_air.setVisible(false);
				direct_word.setVisible(false);
			}
		}
	} else if (player.curGameRoom.player_num == 3) {
		parent.getChildByName("direct_img2").setVisible(false);
		parent.getChildByName("direct_air2").setVisible(false);
		parent.getChildByName("direct_word2").setVisible(false);
		for(var i = 0; i < 3; i++){
			var index = i < 2 ? i : 3;
			var light_img = parent.getChildByName("direct_img" + index.toString());
			var direct_air = parent.getChildByName("direct_air" + index.toString());
			var direct_word = parent.getChildByName("direct_word" + index.toString());
			if( i == ((serverSitNum + 3 - h1global.player().serverSitNum)%3) ){
				light_img.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.FadeIn.create(0.58), cc.FadeOut.create(0.58))));
				light_img.setVisible(true);
				direct_air.setVisible(true);
				direct_word.setVisible(true);
			} else {
				light_img.stopAllActions();
				light_img.setVisible(false);
				direct_air.setVisible(false);
				direct_word.setVisible(false);
			}
		}
	} else {
		for (var i = 0; i < 4; i++) {
			var direct_img = parent.getChildByName("direct_img" + i.toString());
			var direct_air = parent.getChildByName("direct_air" + i.toString());
			var direct_word = parent.getChildByName("direct_word" + i.toString());
			if (i == curServerSitNum) {
				direct_img.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.FadeIn.create(0.58), cc.FadeOut.create(0.58))));
				direct_img.setVisible(true);
				direct_air.setVisible(true);
				direct_word.setVisible(true);
			} else {
				direct_img.stopAllActions();
				direct_img.setVisible(false);
				direct_air.setVisible(false);
				direct_word.setVisible(false);
			}
		}
	}
};

/**
 * function init_roulette_3d
 * @param parent 父节点
 */
roulette.init_roulette_3d = function(parent){
    var player = h1global.player();
    var curServerSitNum = (player.serverSitNum - player.curGameRoom.dealerIdx + 4) % 4;

    var bgList = ["east", "south", "west", "north"];
    var wordList =[["east_word","south_word","west_word","north_word"],["south_word","west_word","north_word","east_word"],["west_word","north_word","east_word","south_word"],["north_word","east_word","south_word","west_word"]];
    var wordPosList = [cc.p(57,29.5),cc.p(120,70),cc.p(59.2, 103),cc.p(-3, 70)];
    var rotaList = [0,270,180,90];
    var lightList = [["down_east", "right_south", "top_west", "left_north"], ["down_south", "right_west", "top_north", "left_east"], ["down_west", "right_north", "top_east", "left_south"], ["down_north", "right_east", "top_south", "left_west"]];
    var bg_img = parent.getChildByName("bg_img");
    bg_img.loadTexture("res/ui/GameRoomUI/curplayer_" + bgList[curServerSitNum] + "_bg.png");
    for(var i = 0; i < 4; i++) {
        var light_img = parent.getChildByName("light_img" + i.toString());
        light_img.loadTexture("res/ui/GameRoomUI/" + lightList[curServerSitNum][i] + ".png");
        //新增部分
        var direct_word = new cc.Sprite("res/ui/GameRoomUI/" +wordList[curServerSitNum][i]+".png");
        var direct_air = new cc.Sprite("res/ui/GameRoomUI/" + lightList[curServerSitNum][i] + "_air.png");
        direct_air.setName("direct_air"+i.toString());
        direct_word.setName("direct_word"+i.toString());
        parent.addChild(direct_air);
        parent.addChild(direct_word);
        direct_air.setPosition(parent.getChildByName("light_img"+i.toString()).getPosition());
        direct_air.setAnchorPoint(parent.getChildByName("light_img"+i.toString()).getAnchorPoint());
        direct_word.setPosition(wordPosList[i]);
        direct_word.setRotation(rotaList[i]);

        direct_word.setVisible(false);
        direct_air.setVisible(false);
    }
};

/**
 * function update_roulette_3d
 * @param parent 父节点
 * @param serverSitNum 当前打牌的人
 */
roulette.update_roulette_3d = function(parent,serverSitNum){
    var player = h1global.player();
	if (player.curGameRoom.player_num == 2) {
		for(var i = 0; i < 2; i++){
			var index = i < 1 ? i : 2;
			var light_img = parent.getChildByName("light_img" + index.toString());
			var direct_air = parent.getChildByName("direct_air" + index.toString());
			var direct_word = parent.getChildByName("direct_word" + index.toString());
			if( i == ((serverSitNum + 2 - h1global.player().serverSitNum)%2) ){
				light_img.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.FadeIn.create(0.58), cc.FadeOut.create(0.58))));
				light_img.setVisible(true);
				direct_air.setVisible(true);
				direct_word.setVisible(true);
			} else {
				light_img.stopAllActions();
				light_img.setVisible(false);
				direct_air.setVisible(false);
				direct_word.setVisible(false);
			}
		}
	} else if (player.curGameRoom.player_num == 3) {
        for(var i = 0; i < 3; i++){
            var index = i < 2 ? i : 3;
            var light_img = parent.getChildByName("light_img" + index.toString());
            var direct_air = parent.getChildByName("direct_air" + index.toString());
            var direct_word = parent.getChildByName("direct_word" + index.toString());
            if( i == ((serverSitNum + 3 - h1global.player().serverSitNum)%3) ){
                light_img.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.FadeIn.create(0.58), cc.FadeOut.create(0.58))));
                light_img.setVisible(true);
                direct_air.setVisible(true);
                direct_word.setVisible(true);
            } else {
                light_img.stopAllActions();
                light_img.setVisible(false);
                direct_air.setVisible(false);
                direct_word.setVisible(false);
            }
        }
    } else {
        for(var i = 0; i < 4; i++){
            var light_img = parent.getChildByName("light_img" + i.toString());
            var direct_air = parent.getChildByName("direct_air" + i.toString());
            var direct_word = parent.getChildByName("direct_word" + i.toString());
            if( i == ((serverSitNum + 4 - h1global.player().serverSitNum)%4) ){
                light_img.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.FadeIn.create(0.58), cc.FadeOut.create(0.58))));
                light_img.setVisible(true);
                direct_air.setVisible(true);
                direct_word.setVisible(true);
            } else {
                light_img.stopAllActions();
                light_img.setVisible(false);
                direct_air.setVisible(false);
                direct_word.setVisible(false);
            }
        }
    }
};