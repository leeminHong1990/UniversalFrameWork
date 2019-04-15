"use strict"
var MultipleRoomLayout = cc.Class.extend({

	ctor: function (uiMgr, ui_list, gameType) {
		this.curUIMgr = uiMgr;
		this.ui_list = ui_list;
		this.all_show = true;
		this.showObservers = null;
		this.backgroundStrategy = null;
		this.gameType = gameType;
	},
	/**
	 * 游戏背景图更新策略
	 */
	setBackgroundStrategy: function (strategy) {
		this.backgroundStrategy = strategy;
	},

    isShow: function () {
        if (this.ui_list) {
            for (var ui of this.ui_list) {
                if (!ui.is_show) return false;
            }
            return true;
        }
        return false;
    },

	notifyObserver: function (notification) {
		Array.prototype.shift.apply(arguments);
		for (var i = 0; i < this.ui_list.length; i++) {
			if (cc.isFunction(this.ui_list[i][notification])) {
				this.ui_list[i][notification].apply(this.ui_list[i], arguments)
			} else {
				cc.error("notifyObserver " + notification + " is not found!", this.ui_list[i])
			}
		}
	},

	notifyObserver2: function (notification) {
		if(!this.isShow()){
			cc.log("room ui not show");
			return;
		}
		Array.prototype.shift.apply(arguments);
		for (var i = 0; i < this.ui_list.length; i++) {
			if (cc.isFunction(this.ui_list[i][notification])) {
				this.ui_list[i][notification].apply(this.ui_list[i], arguments)
			} else {
				cc.error("notifyObserver " + notification + " is not found!", this.ui_list[i])
			}
		}
	},

	/**
	 * 需要调用的函数第一个参数必须是callback类型
	 * @param notification
	 * @param callback
	 */
	notifyObserverWithCallback: function (notification, callback) {
		let complete = 0;
		let count = this.ui_list.length;

		function proxy() {
			complete++;
			callback(count === complete, arguments);
		}

		Array.prototype.shift.apply(arguments);
		arguments[0] = proxy;
		for (var i = 0; i < this.ui_list.length; i++) {
			var ui = this.ui_list[i];
			if (cc.isFunction(ui[notification])) {
				ui[notification].apply(ui, arguments);
			} else {
				cc.error("notifyObserver " + notification + " is not found!", this.ui_list[i])
			}
		}
	},

	iterUI: function (callback) {
		for (var i = 0; i < this.ui_list.length; i++) {
			var ui = this.ui_list[i];
			if (ui && ui.is_show && callback) {
				callback(ui)
			}
		}
	},

	registerShowObserver: function (func) {
		if (this.showObservers === null) {
			this.showObservers = [];
		}
		this.showObservers.push(func);
	},

    showGameRoomUI: function (callback) {
        var complete = false;
        var count = 0;
        var self = this;
        this.notifyObserver( "show", function () {
            count++;
            complete = count === self.ui_list.length;
            // Note: 在多个ui未加载完成时先隐藏ui，不然会出现ui闪现
            // 但是如果有一套资源出现问题加载不完可能会一直不显示
            if (self.all_show) {
                for (var ui in self.ui_list) {
                    if(ui.is_show){
                        ui.setVisible(false);
                        ui.setLocalZOrder(const_val.GameRoomZOrder);
                    }
                }
            }
            if (callback) callback(complete & self.all_show);
	        self.setGameRoomUI2Top(cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", self.gameType)));
	        if (self.showObservers !== null && complete) {
				for (var i = 0; i < self.showObservers.length; i++) {
					self.showObservers[i]();
				}
				self.showObservers = null;
			}
		})
	},

	setGameRoomUI2Top: function (gameroom_type) {
		for (var ui of this.ui_list) {
			if (ui.is_show) {
				ui.setVisible(gameroom_type == ui.uiType)
			}
		}
		var game_room_bg_type = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_BG", this.gameType));
		this.backgroundStrategy.updateBackground(gameroom_type, game_room_bg_type);
	},

	startGame: function (callback) {
		var self = this;
		self.count = 0;
		self.complete = false;

		function wrapper() {
			self.count++;
			self.complete = self.count === self.ui_list.length;
			if (self.complete) {
				self.setGameRoomUI2Top(cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_UI", self.gameType)));
			}
			if (callback) {
				callback(self.complete);
			}
			if (self.complete && self.showObservers != null) {
				for (var i = 0; i < self.showObservers.length; i++) {
					self.showObservers[i]();
				}
				self.showObservers = null;
			}
			if (self.complete) {
				self.count = null;
				self.complete = null;
			}
		}

		for (var i = 0; i < this.ui_list.length; i++) {
			let ui = this.ui_list[i];
			if (ui.is_show) {
				ui.reset();
				ui.setVisible(false);
				ui.startGame();
				wrapper()
			} else {
				ui.show(function () {
					ui.setVisible(false);
					ui.setLocalZOrder(const_val.GameRoomZOrder);
					ui.startGame();
					wrapper()
				});
			}
		}
	}
});
