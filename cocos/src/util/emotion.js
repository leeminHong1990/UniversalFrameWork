var emotion = function () {
}

/**
 * function playEmotion
 * @param parent 父节点
 * @param eid  表情号
 * @param serverSitNum 座位号
 * @param setPos 手动设置表情位置
 */
emotion.playEmotion = function (parent, eid, serverSitNum, setPos) {
	cc.log(serverSitNum);
	setPos = setPos || cc.p(0.5, 0.5);
	var curSitNum = h1global.entityManager.player().server2CurSitNum(serverSitNum);
	let player = h1global.player();
	if (!player) {
		return;
	}
	if (player.curGameRoom.curRound <= 0 && player.curGameRoom.gameType != const_val.DouDiZhu) {
		curSitNum = serverSitNum;
	}
	var player_info_panel = parent.getChildByName("player_info_panel" + curSitNum);
	if (!player_info_panel) {
		cc.log("找不到player_info_panel");
		return;
	}
	//如果上一个动画还在 就移除
	if (player_info_panel.getChildByName("talk_img")) {
		player_info_panel.getChildByName("talk_img").removeFromParent();
	}
	//将表情载入纹理中
	var cache = cc.spriteFrameCache;
	cache.addSpriteFrames("res/effect/biaoqing.plist", "res/effect/biaoqing.png");
	if (eid == 0) {
		eid = 12;
	}

	var anim_frames = [];
	for (var i = 0; i < const_val.ANIM_LIST[eid]; i++) {
		var frame = cache.getSpriteFrame("biaoqing/emotion_" + eid + "_" + i + ".png");
		if (frame) {
			anim_frames.push(frame);
		}
	}
	var effect_animation = new cc.Animation(anim_frames, const_val.ANIM_SPEED_LIST[eid] / const_val.ANIM_LIST[eid]);
	var effect_action = new cc.Animate(effect_animation);

	var talk_img = cc.Sprite.create();
	talk_img.setName("talk_img");
	player_info_panel.addChild(talk_img);
	talk_img.setPosition(player_info_panel.width * setPos.x, player_info_panel.height * setPos.y);
	player_info_panel.reorderChild(talk_img, 4);

	// var effect_action = cc.Sequence.create(cc.moveBy(0.5,0,14),cc.moveBy(0.5,0,-14));
	talk_img.runAction(cc.Sequence.create(cc.Repeat.create(effect_action, 2 / (const_val.ANIM_SPEED_LIST[eid])), cc.removeSelf()));
};
/**
 * function playFiscal 播放付费动画
 * @param parent 父节点
 * @param eid  表情号
 * @param serverSitNum 座位号
 * @param pos 手动设置表情位置
 */
emotion.playFiscal = function (parent, eid, serverSitNum, pos) {
	if (actionMgr.is_playing) {
		actionMgr.wait_list.push([parent, eid, serverSitNum, pos]);
	} else {
		actionMgr.play_action_preload(parent, const_val.EFFECT_NAME_LIST[eid]);
		emotion.playFiscalWord(parent, eid, serverSitNum);
	}
};

/**
 * function playFiscalWord 播放付费动画文字
 * @param parent 父节点
 * @param eid  表情号
 * @param serverSitNum 座位号
 * @param pos 手动设置文字位置
 */
emotion.playFiscalWord = function (parent, eid, serverSitNum, pos) {
	pos = pos || cc.p(parent.width * 0.5, parent.height * 0.8);
	var player = h1global.player();
	var player_name = serverSitNum + 1 + "号";
	if (player && player.curGameRoom.playerInfoList[serverSitNum]) {
		player_name = player.curGameRoom.playerInfoList[serverSitNum].nickname
	}
	var tips_label = parent.getChildByName("tips_label");
	if (!tips_label) {
		tips_label = ccui.Text.create("玩家" + player_name + const_val.EFFECT_WORD_LIST[eid], "zhunyuan", 30);
		tips_label.setPosition(pos);
		tips_label.setTextColor(cc.color(255, 255, 0));
		tips_label.setName("tips_label");
		parent.addChild(tips_label);
	} else {
		tips_label.setPosition(pos);
		tips_label.setString("玩家" + player_name + const_val.EFFECT_WORD_LIST[eid]);
	}
	tips_label.setVisible(true);
	tips_label.stopAllActions();
	tips_label.runAction(cc.Sequence.create(
		cc.MoveTo.create(2, cc.p(tips_label.getPositionX(), tips_label.getPositionY() + 50)),
		cc.CallFunc.create(function () {
			tips_label.setVisible(false);
			tips_label.setPositionY(tips_label.getPositionY() - 50);
		})
	));
};

/**
 * function getExpressionPos 麻将的魔法表情位置
 * @param player_info_panel
 * @param idx  玩家的座号
 */
emotion.getExpressionPos = function (player_info_panel, idx) {
	if (player_info_panel && player_info_panel.getChildByName("frame_img")) {
		return player_info_panel.getChildByName("frame_img").convertToWorldSpaceAR();
	} else {
		cc.error("传入的头像节点不正确或没有frame_img");
	}
};

/**
 * function getMsgPos 麻将的说话位置
 * @param player_info_panel
 * @param idx  玩家的座号
 */
emotion.getMsgPos = function (player_info_panel, idx) {
	if(!h1global.player() || !h1global.player().curGameRoom){
		return;
	}
	var player_num = h1global.player().curGameRoom.player_num;
	player_num = player_num ? player_num : 4;
	if (player_info_panel && player_info_panel.getChildByName("frame_img")) {
		var pos = player_info_panel.getChildByName("frame_img").convertToWorldSpaceAR();
		switch (player_num) {
			case 2:
				pos.x = idx == 1 ? pos.x - 50 : pos.x + 50;
				break;
			case 3:
				pos.x = idx == 1 ? pos.x - 50 : pos.x + 50;
				break;
			case 4:
				pos.x = idx > 0 && idx < 3 ? pos.x - 50 : pos.x + 50;
				break;
			case 5:
				pos.x = idx > 0 && idx < 3 ? pos.x - 50 : pos.x + 50;
				break;
			default:
				break;
		}
		return pos;
	} else {
		cc.error("传入的头像节点不正确或没有frame_img");
	}
};

/**
 * function playMessageAnim 将说话方法抽出来
 * @param his == this //移植版就是把 this全换成his
 * @param serverSitNum
 * @param idx  玩家的座号
 * @param player_num 玩家的座号
 */
emotion.playMessageAnim = function (his,serverSitNum, msg) {
	if (!msg || msg == "") {
		return;
	}
	if(!h1global.player() || !h1global.player().curGameRoom){
		return;
	}
	var player_num = h1global.player().curGameRoom.player_num;
	player_num = player_num ? player_num : 4;

	var idx = h1global.player().server2CurSitNum(serverSitNum);
	var player_info_panel = his.rootUINode.getChildByName("player_info_panel" + idx);
	var talk_img = ccui.ImageView.create();
	var talk_angle_img = ccui.ImageView.create();
	talk_img.setAnchorPoint(0,0.5);
	talk_img.setPosition(his.getMsgPos(player_info_panel, idx));
	talk_img.loadTexture("res/ui/Default/talk_frame.png");
	talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
	talk_img.addChild(talk_angle_img);
	his.rootUINode.addChild(talk_img);

	var msg_label = cc.LabelTTF.create("", "Arial", 22);
	msg_label.setString(msg);
	msg_label.setDimensions(msg_label.getString().length * 26, 0);
	msg_label.setColor(cc.color(20, 85, 80));
	msg_label.setAnchorPoint(cc.p(0.5, 0.5));
	talk_img.addChild(msg_label);
	talk_img.setScale9Enabled(true);
	talk_img.setContentSize(cc.size(msg_label.getString().length * 23 + 20, talk_img.getContentSize().height));
	talk_angle_img.setPosition(3,talk_img.getContentSize().height*0.5);

	if(player_num == 4){ // 4个人麻将
		if(idx > 0 && idx < 3){
			msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.37 + 10, 23));
			talk_img.setScaleX(-1);
			msg_label.setScaleX(-1);
		}else {
			msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.50 + 13, 23));
			// talk_angle_img.setLocalZOrder(3);
		}
	}else if (player_num == 3 || player_num == 2){ // 2，3个人麻将
		if(idx == 1){
			msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.37 + 10, 23));
			talk_img.setScaleX(-1);
			msg_label.setScaleX(-1);
		}else {
			msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.50 + 13, 23));
		}
	}else if (player_num == 5){ // 5个人牌类
		if(idx == 1 || idx == 2){
			msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.37 + 10, 23));
			talk_img.setScaleX(-1);
			msg_label.setScaleX(-1);
		}else {
			msg_label.setPosition(cc.p(msg_label.getString().length * 26 * 0.50 + 13, 23));
		}
	}

	msg_label.runAction(cc.Sequence.create(cc.DelayTime.create(2.0), cc.CallFunc.create(function(){
		talk_img.removeFromParent();
	})));
};

/**
 * function playVoiceAnim 发语音方法抽出来
 * @param his == this //移植版就是把 this全换成his
 * @param serverSitNum
 * @param idx  玩家的座号
 * @param player_num 玩家的座号
 */
emotion.playVoiceAnim = function (his,serverSitNum, record_time) {
	if(!h1global.player() || !h1global.player().curGameRoom){
		return;
	}
	var player_num = h1global.player().curGameRoom.player_num;
	player_num = player_num ? player_num : 4;

	var self = his;
	if(cc.audioEngine.isMusicPlaying()){
		cc.audioEngine.pauseMusic();
		cc.audioEngine.pauseAllEffects();
		cc.audioEngine.setEffectsVolume(0);
	}
	var idx = h1global.player().server2CurSitNum(serverSitNum);
	var interval_time = 0.8;
	his.talk_img_num += 1;
	var player_info_panel = undefined;
	if(serverSitNum < 0){
		player_info_panel = his.rootUINode.getChildByName("agent_info_panel");
	} else {
		player_info_panel = his.rootUINode.getChildByName("player_info_panel" + h1global.player().server2CurSitNum(serverSitNum));
	}
	var talk_img = ccui.ImageView.create();
	talk_img.setPosition(his.getMsgPos(player_info_panel, idx));
	talk_img.loadTexture("res/ui/Default/talk_frame.png");
	talk_img.setScale9Enabled(true);
	talk_img.setContentSize(cc.size(100, talk_img.getContentSize().height));
	his.rootUINode.addChild(talk_img);
	var talk_angle_img = ccui.ImageView.create();
	talk_angle_img.loadTexture("res/ui/Default/talk_angle.png");
	talk_img.addChild(talk_angle_img);

	var voice_img1 = ccui.ImageView.create();
	voice_img1.loadTexture("res/ui/Default/voice_img1.png");
	voice_img1.setPosition(cc.p(50, 23));
	talk_img.addChild(voice_img1);
	var voice_img2 = ccui.ImageView.create();
	voice_img2.loadTexture("res/ui/Default/voice_img2.png");
	voice_img2.setPosition(cc.p(50, 23));
	voice_img2.setVisible(false);
	talk_img.addChild(voice_img2);
	voice_img2.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time), cc.CallFunc.create(function(){voice_img1.setVisible(false);voice_img2.setVisible(true);voice_img3.setVisible(false);}), cc.DelayTime.create(interval_time*2), cc.CallFunc.create(function(){voice_img2.setVisible(false)}))));
	var voice_img3 = ccui.ImageView.create();
	voice_img3.loadTexture("res/ui/Default/voice_img3.png");
	voice_img3.setPosition(cc.p(50, 23));
	voice_img3.setVisible(false);
	talk_img.addChild(voice_img3);
	voice_img3.runAction(cc.RepeatForever.create(cc.Sequence.create(cc.DelayTime.create(interval_time*2), cc.CallFunc.create(function(){voice_img1.setVisible(false);voice_img2.setVisible(false);voice_img3.setVisible(true);}), cc.DelayTime.create(interval_time), cc.CallFunc.create(function(){voice_img3.setVisible(false);voice_img1.setVisible(true);}))));
	talk_angle_img.setPosition(3,talk_img.getContentSize().height*0.5);

	if(player_num == 4){ // 4个人麻将
		if(idx > 0 && idx < 3){
			talk_img.setScale(-1);
			talk_img.setPositionX(talk_img.getPositionX() - 40);
		}else {
			talk_img.setPositionX(talk_img.getPositionX() + 40);
		}
	}else if (player_num == 3 || player_num == 2){ // 2，3个人麻将
		if(idx == 1){
			talk_img.setScale(-1);
			talk_img.setPositionX(talk_img.getPositionX() - 40);
		}else {
			talk_img.setPositionX(talk_img.getPositionX() + 40);
		}
	}else if (player_num == 5){ // 2，3个人麻将
		if(idx > 0 && idx < 3){
			talk_img.setScale(-1);
			talk_img.setPositionX(talk_img.getPositionX() - 40);
		}else {
			talk_img.setPositionX(talk_img.getPositionX() + 40);
		}
	}

	talk_img.runAction(cc.Sequence.create(cc.DelayTime.create(record_time), cc.CallFunc.create(function(){
		talk_img.removeFromParent();
		self.talk_img_num -= 1;
		if(self.talk_img_num == 0){
			if(!cc.audioEngine.isMusicPlaying()){
				cc.audioEngine.resumeMusic();
				cc.audioEngine.resumeAllEffects();
				cc.audioEngine.setEffectsVolume(cc.sys.localStorage.getItem("EFFECT_VOLUME") * 0.01);
			}
		}
	})));
};