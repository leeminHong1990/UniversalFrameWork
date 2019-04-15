"use strict"
var JZGSJMJSettlementUI = JZMJSettlementUI.extend({
	show_rules: function (curGameRoom) {
		var share_list = [];

		if (curGameRoom.base_score) {
			share_list.push("倍数:" + curGameRoom.base_score);
		}
		// if (curGameRoom.stand_four === 1) {
		// 	share_list.push("立四");
		// }
		var shareStr = share_list.join(',');

		var rule_label = this.rootUINode.getChildByName("settlement_panel").getChildByName("rule_label");
		rule_label.setString(shareStr);
	}
});
