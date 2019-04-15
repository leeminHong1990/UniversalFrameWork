var actionMgr = function () {
}
actionMgr.is_playing = false;
actionMgr.wait_list = [];
/**
 * function load_action_resource 管理界面, 负责统一给 gameroomprepare_ui 和 gameroom_ui 加东西
 * @param parent 需要管理的UI界面的根节点
 * @param name 需要载入资源的名称
 * @param pos  位置
 * @param loop 是否可以循环
 * @return null;
 */
actionMgr.load_action_resource = function (parent, name, pos) {
	if (parent.getChildByName(name)) {
		return;
	}
	var pos = pos || cc.p(parent.width * 0.5, parent.height * 0.5);
	var resource = ccs.load("res/ui/" + name + ".json");   //加载CocosStudio导出的Json文件
	var resource_node = resource.node;
	var resource_action = resource.action; // 动作
	resource_action.gotoFrameAndPlay(0, resource_action.getDuration(), 0, false);
	resource_action.setLastFrameCallFunc(function () {
		resource_node.setVisible(false);
		resource_action.gotoFrameAndPause(0);
		actionMgr.is_playing = false;
		//如果等待列表不为空
		if(actionMgr.wait_list.length>0){
			actionMgr.play_action_preload(actionMgr.wait_list[0][0],const_val.EFFECT_NAME_LIST[actionMgr.wait_list[0][1]],actionMgr.wait_list[0][3]);
			emotion.playFiscalWord(actionMgr.wait_list[0][0],actionMgr.wait_list[0][1],actionMgr.wait_list[0][2]);
			actionMgr.wait_list.shift();
		}
	});
	resource_node.runAction(resource_action); // 播放动作
	parent.addChild(resource_node);
	resource_node.setPosition(pos);
	resource_node.setName(name);
	resource_node._animeTag = resource_action.getTag();
	resource_node.setVisible(false);
};

/**
 * function play_action_once 执行动画一遍
 * @param parent 动画节点的父节点
 * @param name 节点名字
 * @return null;
 */
actionMgr.play_action_once = function (parent, name) {
	var anime_node = parent.getChildByName(name);
	if (!anime_node) {
		return;
		// actionMgr.load_action_resource(parent, name,cc.p(100,0));
		// anime_node = parent.getChildByName(name);
	}
	var node_action = anime_node.getActionByTag(anime_node._animeTag);
	anime_node.setVisible(true);
	node_action.gotoFrameAndPlay(0, node_action.getDuration(), 0, false);
};

/**
 * function play_action_preload 执行动画一遍,但如果没有动画资源的话 会去预加载 , 缺点就是每次
 * @param parent 动画节点的父节点
 * @param name 节点名字
 * @return null;
 */
actionMgr.play_action_preload = function (parent, name, pos) {
	var anime_node = parent.getChildByName(name);
	if (!anime_node) {
		actionMgr.load_action_resource(parent, name, pos);
		anime_node = parent.getChildByName(name);
	}
	var node_action = anime_node.getActionByTag(anime_node._animeTag);
	anime_node.setVisible(true);
	node_action.gotoFrameAndPlay(0, node_action.getDuration(), 0, false);
	actionMgr.is_playing = true;
};

/**
 * function is_playing actionMgr检查是否正在播放动画
 * @param parent 动画节点的父节点
 * @param name 节点名字
 * @return bool;
 */
actionMgr.is_playing_by_name = function(parent, name){
	var anime_node = parent.getChildByName(name);
	if (!anime_node) {
		return false;
	}
	var node_action = anime_node.getActionByTag(anime_node._animeTag);
	return node_action.isPlaying();
};

/**
 * function reset 重置actionMgr的成员变量
 * @return null;
 */
actionMgr.reset = function(){
	actionMgr.is_playing = false;
	actionMgr.wait_list = [];
};