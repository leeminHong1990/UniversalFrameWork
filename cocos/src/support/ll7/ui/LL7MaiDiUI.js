var LL7MaiDiUI = UIBase.extend({

	ctor: function () {
		this._super();
		this.resourceFilename = "res/ui/LL7MaiDiUI.json";
	},
	show_by_info: function (serverSitNum, handTiles, coverPokers, mainPoker) {
		this.serverSitNum = serverSitNum;
		this.handTiles = handTiles;
		this.coverPokers = coverPokers;
		this.selectCount = 0;
		this.maxSelectCount = coverPokers.length;
		this.mainPoker = mainPoker;
		this.show()
	},

	initUI: function () {
		let panel = this.rootUINode.getChildByName("mai_panel");
		let tiles_panel0 = panel.getChildByName("tiles_panel0");
		let tiles_panel1 = panel.getChildByName("tiles_panel1");
		let coverPokers = this.coverPokers;
		let handTiles = this.handTiles;
		let tiles = handTiles.concat(coverPokers);
		tiles = cutil_ll7.sort(tiles, this.mainPoker);
		let count = 0;
		let num = 0;
		let index = -1;
		var self = this;

		var player = h1global.player();

		var handCardUI0 = [];
		var handCardUI1 = [];
		panel.getChildByName("select_count_label").setString(0);

		var temp = coverPokers.slice(0);

		for (var i = 0; i < tiles.length; i++) {

			num = tiles[i];
			let tile_img = null;
			if (i < 14) {
				tile_img = tiles_panel0.getChildByName("tile_img_" + i);
				handCardUI0.push(tile_img);
			} else {
				tile_img = tiles_panel1.getChildByName("tile_img_" + i);
				handCardUI1.push(tile_img);
			}
			tile_img.setTouchEnabled(false);
			let mark = tile_img.getChildByName("mark");
			let di_img = tile_img.getChildByName("di_img");
			tile_img.num = num;
			index = temp.indexOf(num);
			mark.setVisible(index !== -1);
			di_img.setVisible(index !== -1);
			if (index !== -1) {
				temp.splice(index, 1);
			}
			tile_img.loadTexture(cutil_ll7.getCardImgPath(num), ccui.Widget.PLIST_TEXTURE);
			if (player && player.curGameRoom) {
				tile_img.getChildByName("star").setVisible(player.gameOperationAdapter.isMain(num));
			}
		}
		panel.getChildByName("mai_btn").addClickEventListener(UICommonWidget.touchEventVisibleCheckListener(function () {
			let p = h1global.player();
			if (!(p && p.curGameRoom)) {
				return;
			}
			if (!cc.sys.isObjectValid(panel)) {
				return;
			}
			var list = [];
			var all = handCardUI0.concat(handCardUI1);
			for (var i = 0; i < all.length; i++) {
				let tile_img = all[i];
				if (tile_img.selectedFlag) {
					list.push(tile_img.num);
				}
			}
			p.doOperation(const_ll7.COVER_POKER, list);
			self.hide();
		}));
		panel.getChildByName("mai_btn").setTouchEnabled(false);
		panel.getChildByName("mai_btn").setBright(false);
		let left_time_label = panel.getChildByName("clock").getChildByName("left_time");
		left_time_label.stopAllActions();
		left_time_label.setString(const_ll7.MAIDI_TIME);
		var time = const_ll7.MAIDI_TIME;
		left_time_label.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
			left_time_label.setString(Math.max(0, --time));
		})).repeat(const_ll7.MAIDI_TIME));

		this.addTouchSelect(tiles_panel0, handCardUI0);
		this.addTouchSelect(tiles_panel1, handCardUI1);

		let giveupBtn = panel.getChildByName("giveup_btn");
		if (player && player.curGameRoom) {
			giveupBtn.setVisible(player.curGameRoom.mainPokers.length === 1 && player.curGameRoom.getMain7Count(player.serverSitNum, tiles) === 2);
		}

		giveupBtn.addTouchEventListener(UICommonWidget.touchEventVisibleCheckListener(function (source, eventType) {
			if (eventType === ccui.Widget.TOUCH_ENDED) {
				let p = h1global.player();
				if (p) {
					p.doOperation(const_ll7.SURRENDER_SECOND, [1]);
				}
			}
		}));
	},


	addTouchSelect: function (panel, uiList) {
		var self = this;
		var visibleCount = 14;
		var oldSelect = 0;
		UICommonWidget.addTouchSelect(panel, uiList, {
			select: function (ui, isSelect) {
				self._toggleCard(ui, isSelect);
			},
			convertLast: function (width, p, m) {
				return m * (width / visibleCount) + 86 > p.x && m * (width / visibleCount) < p.x;
			},
			visibleLength: function () {
				return 14;
			},
			width: function (source) {
				return source.width - 99;
			},
			cancel: function () {
				for (var i = 0; i < uiList.length; i++) {
					self._toggleCard(uiList[i], false);
				}
			},
			touch: function (source, eventType, allCards) {
				if (eventType === ccui.Widget.TOUCH_ENDED || eventType === ccui.Widget.TOUCH_CANCELED) {
					if (!cc.sys.isObjectValid(source)) {
						return;
					}
					var count = 0;
					for (var i = 0; i < allCards.length; i++) {
						if (allCards[i].selectedFlag) {
							count++;
						}
					}
					self.selectCount += count - oldSelect;
					oldSelect = count;
					self.update_btn_state(self.selectCount);
				}
			}
		});
	},

	update_btn_state: function (count) {
		let panel = this.rootUINode.getChildByName("mai_panel");
		let btn = panel.getChildByName("mai_btn");
		btn.setTouchEnabled(count === this.maxSelectCount);
		btn.setBright(count === this.maxSelectCount);
		panel.getChildByName("select_count_label").setString(count);
	},

	_toggleCard: function (ui, isSelect) {
		if (isSelect === undefined) {
			isSelect = !ui.selectedFlag;
		}
		ui.selectedFlag = isSelect;
		if (isSelect) {
			if (ui.originY != undefined) {
				ui.y = ui.originY + const_ll7.SELECT_OFFSET;
			} else {
				ui.originY = ui.y;
				ui.y += const_ll7.SELECT_OFFSET;
			}
		} else {
			if (ui.originY != undefined) {
				ui.y = ui.originY;
			}
		}
		return isSelect;
	}
});
