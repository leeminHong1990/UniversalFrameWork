"use strict"

var LockUI = UIBase.extend({
	ctor:function(){
		this._super();
		this.resourceFilename = "res/ui/LockUI.json";
		this.setLocalZOrder(const_val.MAX_LAYER_NUM + 1);
	},

	initUI:function(){
        var winSize = cc.director.getWinSize();
        var effect = cc.Sprite.create("res/ui/Default/lock_mid.png");
        effect.setPosition(winSize.width*0.5,winSize.height*0.5);
        var action = cc.Sprite.create("res/ui/Default/lock_anime.png");
        action.setPosition(winSize.width*0.5,winSize.height*0.5);
        this.rootUINode.addChild(effect);
        this.rootUINode.addChild(action);

        action.runAction(cc.RepeatForever.create(cc.rotateBy(1,300)));


        var msg_label = new cc.LabelTTF("正在加载,请稍等...","zhunyuan",28);
        this.rootUINode.addChild(msg_label);
        msg_label.setPosition(effect.getPositionX(),effect.getPositionY()-100);
	},
});