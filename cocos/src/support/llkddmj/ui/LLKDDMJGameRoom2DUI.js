"use strict"

var LLKDDMJGameRoom2DUI = LLKDDMJGameRoomUI.extend({
    className: "LLKDDMJGameRoom2DUI",
    uiType: const_val.GAME_ROOM_2D_UI,
    ctor: function () {
        this._super();
        this.resourceFilename = "res/ui/LLKDDMJGameRoom2DUI.json";
	    this.initDelayTime = const_val.DISCARD_SPEED;
    },
    init_discard_tile_anim_img: function () {
        this._super();
        this.discard_tile_anim_img.setAnchorPoint(0, 0);
        // this.discard_tile_anim_img.scale = 0.8;
        var mahjong_img = this.discard_tile_anim_img.getChildByName("mahjong_img");
        mahjong_img.setPosition(45,48);
        var cur_player_tile_panel = this.rootUINode.getChildByName("player_tile_panel0");
        // this.discard_tile_anim_img.setOrderOfArrival(cur_player_tile_panel.getOrderOfArrival() - 1);

    },
    load_discard_tile_anim_img: function (tile_img) {
        tile_img.loadTexture("Mahjong2D/mahjong_tile_player_hand.png", ccui.Widget.PLIST_TEXTURE);
    },

    init_curplayer_panel_direction:function(){
        var player_panel = this.cur_player_panel.getChildByName("player_panel");
        roulette.init_roulette_2d(player_panel);
    },

    update_curplayer_panel: function (serverSitNum) {
        if (!this.is_show) { return; }
        var player_panel = this.cur_player_panel.getChildByName("player_panel");
        roulette.update_roulette_2d(player_panel,serverSitNum);
    },

    getHandTileConfig:function(){
        var config = {};
        config.tile_width   = 92;
        config.tile_height  = 122;
        config.real_width   = 84;
        config.real_height  = 118;
        config.bottom_height = 3;
        config.sel_posy     = 30;
        return config;
    },

	get_update_player_hand_tiles_config:function(index){
		if (!this.cacheHandTilesOptions) {
			this.cacheHandTilesOptions=[];
		}
		if (!this.mahjongHandType) {
			this.mahjongHandType=[-1,-1,-1,-1];
		}
		var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
		if (this.cacheHandTilesOptions[index] && this.mahjongHandType[index] == mahjongType) {
			return this.cacheHandTilesOptions[index];
		}
		var options = {};
		var mahjongStr = "";
		if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
			mahjongStr = "MahjongYellow2D/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue2D/blue_";
		} else {
			mahjongStr = "Mahjong2D/";
		}
		if(index == 0){
			options.tilePanelOffsetFunc = function(tileCount , panel){
				panel.setPositionX(tileCount * (84 * 3 - 5));
			};
			options.tilePanelDownOffsetFunc = function(tileCount , panel){
				panel.setPositionX(tileCount * (84 * 3 - 5));
			};

			options.mahjongHandImgPath = mahjongStr + "mahjong_tile_player_hand.png";
			options.mahjongTxtImgPath ="Mahjong/mahjong_big_%d.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_down.png";

			options.tilePositionFunc = function(tile_img,i){
				tile_img.setPositionX(84 *i-3);
			};
			options.tileDownPositionFunc = function(tile_img , i) {
				tile_img.setPositionX(84 *i-3);
			};

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(5, 98);
			options.kingtilemark.scale = 1;

			options.draw = {};
			options.draw.offset = cc.p(20,0);
			options.draw.animFrom = cc.p(0,20);
			options.draw.animTo = cc.p(0,-20);
		}else if(index == 1){
			let p1 = [0, 32 * 4, 32 * 4 * 2 - 15, 32 * 4 * 3 - 30, 32 * 4 * 4 - 60];
			options.tilePanelOffsetFunc = function(tileCount , panel){
				panel.setPositionY(p1[tileCount]);
			};
			let p2 = [0, 32 * 4, 32 * 4 * 2 - 15, 32 * 4 * 3 - 30, 32 * 4 * 4 - 60];
			options.tilePanelDownOffsetFunc = function(tileCount , panel){
				panel.setPositionY(p2[tileCount]);
				panel.setPositionX(panel.editorOrigin.x + 5);
			};
			options.tileDownPositionFunc = function(tile_img , i) {
				tile_img.setPositionY(35 *i);
			};

			options.mahjongHandImgPath = mahjongStr + "mahjong_tile_side_hand.png";
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_side_desk.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_side_down.png";
			options.mahjongTxtImgPath ="Mahjong/mahjong_small_%d.png";

			options.tilePositionFunc = function(tile_img,i){
				tile_img.setPositionY(32 *i);
			};

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(20, 20);
			options.kingtilemark.rotate = -90;
			options.kingtilemark.scale = 0.4;

			options.draw = {};
			options.draw.offset = cc.p(0,10);
			options.draw.animFrom = cc.p(0,10);
			options.draw.animTo = cc.p(0,-10);
		}else if(index == 2){
			options.tilePanelOffsetFunc = function(tileCount , panel){
				panel.setPositionX(703 - tileCount * (84 * 3 + 12) * 0.5);
			};
			options.tilePanelDownOffsetFunc = function(tileCount , panel){
				panel.setPositionX(713 - tileCount * (84 * 3 + 12) * 0.5);
			};
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_down.png";
			options.mahjongHandImgPath = mahjongStr + "mahjong_tile_top_hand.png";
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_player_desk.png";
			options.mahjongTxtImgPath ="Mahjong/mahjong_small_%d.png";

			options.tilePositionFunc = function(tile_img,i){
				tile_img.setPositionX(1092 - 84 * i);
			};
			options.tileDownPositionFunc = function(tile_img , i) {
				tile_img.setPositionX(1092 - 78 * i);
			};

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(40, 14);
			options.kingtilemark.rotate = 180;
			options.kingtilemark.scale = 0.4;

			options.draw = {};
			options.draw.offset = cc.p(-20,0);
			options.draw.animFrom = cc.p(0,10);
			options.draw.animTo = cc.p(0,-10);
		}else if(index  == 3){
			options.tilePanelOffsetFunc = function(tileCount , panel){
				panel.setPositionY(540 - tileCount * (42 * 2 + 10));
			};

			let p2 = [0, (42 * 2 + 15), (42 * 2 + 15) * 2 + 10, 32 * 4 * 3 - 60, 32 * 4 * 4 - 80];
			options.tilePanelDownOffsetFunc = function (tileCount, panel) {
				panel.setPositionY(550 - p2[tileCount]);
			};
			options.mahjongHandImgPath = mahjongStr + "mahjong_tile_side_hand.png";
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_side_desk.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_side_down.png";
			options.mahjongTxtImgPath ="Mahjong/mahjong_small_%d.png";

			options.tilePositionFunc = function(tile_img,i){
				tile_img.setPositionY(390 - 32 * i);
			};
			options.tileDownPositionFunc = function(tile_img , i) {
				tile_img.setPositionY(390 - 35 * i);
			};
			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(68, 56);
			options.kingtilemark.rotate = 90;
			options.kingtilemark.scale = 0.4;

			options.draw = {};
			options.draw.offset = cc.p(0,-10);
			options.draw.animFrom = cc.p(0,10);
			options.draw.animTo = cc.p(0,-10);
		}else{
			cc.error("not support index", index);
		}
		this.mahjongHandType[index] = mahjongType;
		this.cacheHandTilesOptions[index] = options;
		return options;
	},

	get_update_player_exposed_tiles_config: function (index) {
		var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
		var mahjongStr = "";
		if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
			mahjongStr = "MahjongYellow2D/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue2D/blue_";
		} else {
			mahjongStr = "Mahjong2D/";
		}
		var options = {};
		options.mahjongTxtImgPath = mahjongStr + "mahjong_tile_player_up.png";
		options.mahjongTxtImgPath = "Mahjong/mahjong_big_%d.png";

		if (index === 0) {
			options.tilePositionFunc = function (tile_img, i) {
				tile_img.setPositionX(78 * i);
			};
			options.tilePanelOffsetFunc = function (tileCount, panel) {
				panel.setPositionX(panel.editorOrigin.x + tileCount * (84 * 3) + 15);
			};
			options.mahjongTxtImgPath = "Mahjong/mahjong_big_%d.png";

			options.draw = {};
			options.draw.offset = cc.p(20,0);
			options.draw.animFrom = cc.p(0,20);
			options.draw.animTo = cc.p(0,-20);

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(6, 119);
			options.kingtilemark.scale = 0.8;
		} else if (index === 1) {
			options.tilePositionFunc = function (tile_img, i) {
				tile_img.setPositionY(37 * i);
			};
			options.tilePanelOffsetFunc = function (tileCount, panel) {
				panel.setPositionY(panel.editorOrigin.y + tileCount * (37 * 3) + 15);
			};
			options.mahjongTxtImgPath = "Mahjong/mahjong_small_%d.png";

			options.draw = {};
			options.draw.offset = cc.p(0,10);
			options.draw.animFrom = cc.p(0,10);
			options.draw.animTo = cc.p(0,-10);

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(5, 19);
			options.kingtilemark.scale = 0.4;
			options.kingtilemark.rotate = -90;
		} else if (index === 2) {
			options.tilePositionFunc = function (tile_img, i) {
				tile_img.setPositionX(486 - 42 * i);
			};
			options.tilePanelOffsetFunc = function (tileCount, panel) {
				panel.setPositionX(panel.editorOrigin.x - tileCount * (42 * 3) - 12);
			};
			options.mahjongTxtImgPath = "Mahjong/mahjong_small_%d.png";

			options.draw = {};
			options.draw.offset = cc.p(-20,0);
			options.draw.animFrom = cc.p(0,10);
			options.draw.animTo = cc.p(0,-10);

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(49, 17);
			options.kingtilemark.scale = 0.4;
			options.kingtilemark.rotate = 180;
			options.kingtilemark.anchorPoint = cc.p(2.4,-1.5);
			options.kingtilemark.flippedY = true;
			options.kingtilemark.flippedX = true;
			options.mahjongTxtFlippedY = true;
			options.mahjongTxtFlippedX = true;
		} else if (index === 3) {
			options.tilePositionFunc = function (tile_img, i) {
				tile_img.setPositionY(37 * (14 - i));
			};
			options.tilePanelOffsetFunc = function (tileCount, panel) {
				panel.setPositionY(panel.editorOrigin.y - tileCount * (37 * 3) - 37);
			};
			options.mahjongTxtImgPath = "Mahjong/mahjong_small_%d.png";

			options.draw = {};
			options.draw.offset = cc.p(0,-10);
			options.draw.animFrom = cc.p(0,10);
			options.draw.animTo = cc.p(0,-10);

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(61, 56);
			options.kingtilemark.scale = 0.4;
			options.kingtilemark.rotate = 90;
		} else {
			cc.error("not support index", index);
		}
		return options;
	},

	get_update_player_up_tiles_config:function(index){
		if (!this.cacheUpTilesOptions) {
			this.cacheUpTilesOptions=[];
		}
		if (!this.mahjongUpType) {
			this.mahjongUpType=[-1,-1,-1,-1];
		}
		var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
		if (this.cacheUpTilesOptions[index] && this.mahjongUpType[index] == mahjongType) {
			return this.cacheUpTilesOptions[index];
		}
		var mahjongStr = "";
		if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
			mahjongStr = "MahjongYellow2D/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue2D/blue_";
		} else {
			mahjongStr = "Mahjong2D/";
		}
		var options = {};
		if(index == 0){
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_player_up.png";
			options.mahjongDownImgPath = mahjongStr + "mahjong_tile_down.png";
			options.mahjongUpKongImgPath = options.mahjongUpImgPath;
			options.mahjongDownKongImgPath = options.mahjongDownImgPath;
			options.mahjongTxtPath = "Mahjong/mahjong_big_%d.png";

			options.kongArrowOffset = cc.p(0,28);

			options.kongTileUpOffset = cc.p(0,23); //明杠
			options.kongTileDownOffset = cc.p(0,32); //暗杠

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(7, 115);
			options.kingtilemark.scale = 1.1;

		}else if(index == 1){
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_side_desk.png";
			options.mahjongDownImgPath = mahjongStr + "mahjong_tile_side_down.png";
			options.mahjongTxtPath = "Mahjong/mahjong_small_%d.png";
			options.mahjongUpKongImgPath = options.mahjongUpImgPath;
			options.mahjongDownKongImgPath = options.mahjongDownImgPath;

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(5, 19);
			options.kingtilemark.scale = 0.7;
			options.kingtilemark.rotate = -90;

			options.kongArrowOffset = cc.p(0,12);

			options.kongTileUpOffset = cc.p(0,12); //明杠
			options.kongTileDownOffset = cc.p(0,12); //暗杠

			options.upPanelOffset = cc.p(0,5)
			options.upPanelOffsetFunc = function(upCount, originPosition){
				return cc.p(originPosition.x, -5*upCount);
			}
		}else if(index == 2){
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_player_desk.png";
			options.mahjongDownImgPath = mahjongStr + "mahjong_tile_down.png";
			options.mahjongTxtPath = "Mahjong/mahjong_small_%d.png";
			options.mahjongUpKongImgPath = options.mahjongUpImgPath;
			options.mahjongDownKongImgPath = options.mahjongDownImgPath;

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(48, 18);
			options.kingtilemark.scale = 0.7;
			options.kingtilemark.rotate = 180;

			options.kongArrowOffset = cc.p(0,16);

			options.kongTileUpOffset = cc.p(0,13); //明杠
			options.kongTileDownOffset = cc.p(0,16); //暗杠

			options.upPanelOffsetFunc = function(upCount, originPosition){
				return cc.p(703 + upCount * 5 , originPosition.y)
			}

			options.kingtilemark.anchorPoint = cc.p(1.33, -0.4);
			options.kingtilemark.flippedX = true;
			options.kingtilemark.flippedY = true;
			options.mahjongTxtFlippedY = true;
			options.mahjongTxtFlippedX = true;
		}else if(index == 3){
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_side_desk.png";
			options.mahjongDownImgPath = mahjongStr + "mahjong_tile_side_down.png";
			options.mahjongTxtPath = "Mahjong/mahjong_small_%d.png";
			options.mahjongUpKongImgPath = options.mahjongUpImgPath;
			options.mahjongDownKongImgPath = options.mahjongDownImgPath;

			options.kingtilemark ={};
			options.kingtilemark.anchorPoint = cc.p(0,1);
			options.kingtilemark.position = cc.p(59, 55);
			options.kingtilemark.scale = 0.7;
			options.kingtilemark.rotate = 90;

			options.kongArrowOffset = cc.p(0,12);

			options.kongTileUpOffset = cc.p(0,12); //明杠
			options.kongTileDownOffset = cc.p(0,12); //暗杠
			options.upPanelOffsetFunc = function(upCount, originPosition){
				return cc.p(originPosition.x,555 + upCount * 5)
			}
		}else{
			cc.error("not support index", index);
		}
		this.mahjongUpType[index] = mahjongType;
		this.cacheUpTilesOptions[index] = options;
		return options
	},

    get_play_discard_anim_config: function (serverSitNum, index, onlyTilePointer) {
        var cur_player_hand_panel = this.rootUINode.getChildByName("player_tile_panel" + index.toString()).getChildByName("player_hand_panel");

        var player = h1global.player();
        var handTilesList = player.curGameRoom.handTilesList[serverSitNum]

        var options = {};
        options.pointerScale = 0.8
        var discardTileIdx = player.curGameRoom.discardTilesList[serverSitNum].length;
        if(discardTileIdx > const_llkddmj.MAX_DISCARD_TILES_SIZE){
            discardTileIdx = Math.min(discardTileIdx , const_llkddmj.MAX_DISCARD_TILES_SIZE);
        }
        discardTileIdx = Math.max(0 , --discardTileIdx);
        var cur_player_discard_panel = this.game_info_panel.getChildByName("player_discard_panel" + index);
        var cur_discard_tile_img = cur_player_discard_panel.getChildByName("tile_img_" + discardTileIdx);
        var cur_discard_tile_position = cur_discard_tile_img.getPosition();
        var cur_hand_tile_position = undefined
	    var cur_delay_tile_position = undefined;

        if (index == 0) {
            options.pointerPosition = cc.p(26, 68);
            if (!onlyTilePointer) {
	            cur_delay_tile_position = cc.p(cc.winSize.width * 0.453, cc.winSize.height * 0.266);
	            this.initDelayTime = 0;
                if(this.lastDiscardPosition == undefined){
                    cur_hand_tile_position = cur_player_hand_panel.convertToWorldSpace(cc.p(84 * handTilesList.length ,0));
                }else{
                    cur_hand_tile_position = this.lastDiscardPosition;
                }
                cur_discard_tile_position.x = cur_discard_tile_position.x - cur_discard_tile_img.anchorX * cur_discard_tile_img.width;
                cur_discard_tile_position.y = cur_discard_tile_position.y - cur_discard_tile_img.anchorY * cur_discard_tile_img.height;
                cur_discard_tile_position = cur_player_discard_panel.convertToWorldSpace(cur_discard_tile_position);
            }
        } else if (index == 1) {
            options.pointerPosition = cc.p(30, 56);
            if (!onlyTilePointer) {
	            this.initDelayTime = const_val.DISCARD_SPEED;
	            cur_delay_tile_position = cc.p(cc.winSize.width * 0.62, cc.winSize.height * 0.488);
                cur_hand_tile_position = cur_player_hand_panel.convertToWorldSpace(cc.p(-57, handTilesList.length * 32));
                cur_discard_tile_position = cur_player_discard_panel.convertToWorldSpace(cur_discard_tile_position);
            }
        } else if (index == 2) {
            options.pointerPosition = cc.p(26, 60);
            if (!onlyTilePointer) {
	            this.initDelayTime = const_val.DISCARD_SPEED;
	            cur_delay_tile_position = cc.p(cc.winSize.width * 0.453, cc.winSize.height * 0.627);
                cur_hand_tile_position = cur_player_hand_panel.convertToWorldSpace(cc.p(84 * (13 - handTilesList.length), 0));
                cur_discard_tile_position.x = cur_discard_tile_position.x - cur_discard_tile_img.anchorX * cur_discard_tile_img.width;
                cur_discard_tile_position.y = cur_discard_tile_position.y - cur_discard_tile_img.anchorY * cur_discard_tile_img.height;
                cur_discard_tile_position = cur_player_discard_panel.convertToWorldSpace(cur_discard_tile_position);
            }
        } else if (index == 3) {
            options.pointerPosition = cc.p(30, 56);
            if (!onlyTilePointer) {
	            this.initDelayTime = const_val.DISCARD_SPEED;
	            cur_delay_tile_position = cc.p(cc.winSize.width * 0.285, cc.winSize.height * 0.488);
                cur_hand_tile_position = cur_player_hand_panel.convertToWorldSpace(cc.p(0, (13 - handTilesList.length) * 32));
                cur_discard_tile_position.x = cur_discard_tile_position.x - cur_discard_tile_img.anchorX * cur_discard_tile_img.width;
                cur_discard_tile_position.y = cur_discard_tile_position.y - cur_discard_tile_img.anchorY * cur_discard_tile_img.height;
                cur_discard_tile_position = cur_player_discard_panel.convertToWorldSpace(cur_discard_tile_position);
            }
        }
        if (!onlyTilePointer) {
            options.mahjongTxtPath = "Mahjong/mahjong_big_%d.png";
            options.tileStartPosition = cur_hand_tile_position;
	        options.tileMidPosition = cur_delay_tile_position;
            options.tileEndPosition = cur_discard_tile_position;
        }
        return options;
    },

	get_play_fly_anim_end_time:function () {
		return 0.05 + this.initDelayTime;
	},

    play_discard_fly_anim: function (tile_img, discard_tile, start_position, end_position, mid_position, index) {
        if (start_position == undefined || end_position == undefined || tile_img == undefined) {
            cc.error("play_discard_fly_anim params error", tile_img, start_position, end_position);
            return;
        }
        discard_tile.setVisible(false);
        var mahjong_img = tile_img.getChildByName("mahjong_img");
        //mahjong_img.setAnchorPoint(0.25,0.35);
        mahjong_img.setPosition(60,55);
        tile_img.setScale(0.8);
	    this.initDelayTime = const_val.DISCARD_SPEED;
	    if (index == 0) {
		    this.initDelayTime = 0;
		    tile_img.setPosition(start_position);
	    } else {
		    index = undefined;
		    tile_img.setPosition(mid_position);
	    }
	    var self = this;
	    tile_img.runAction(cc.Spawn.create(
			// cc.scaleTo(0.15, 0.8, 0.8),
			cc.Sequence.create(
				// cc.DelayTime.create(self.initDelayTime),
				cc.Spawn.create(cc.DelayTime.create(self.initDelayTime), cc.ScaleTo.create(self.initDelayTime * 0.1, 1.0, 1.0)),
				cc.MoveTo.create(0.05, end_position),
				cc.CallFunc.create(function () {
					tile_img.setVisible(false);
					tile_img.setScale(1.0);
					if (discard_tile.tile_num && discard_tile.tile_num > 0) {
						discard_tile.setVisible(true);
					}
				}))
		));
	},

	get_player_discard_tiles_config: function (index) {
		if (!this.cacheDiscardTilesOptions) {
			this.cacheDiscardTilesOptions=[];
		}
		if (!this.mahjongDiscardType) {
			this.mahjongDiscardType=[-1,-1,-1,-1];
		}
		var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
		if (this.cacheDiscardTilesOptions[index] && this.mahjongDiscardType[index] == mahjongType) {
			return this.cacheDiscardTilesOptions[index];
		}
		var mahjongStr = "";
		if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
			mahjongStr = "MahjongYellow2D/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue2D/blue_";
		} else {
			mahjongStr = "Mahjong2D/";
		}
		var options = {};
		options.mahjongTxtPath = "Mahjong/mahjong_small_%d.png";
		options.kingtilemark = {}
		if (index == 0) {
			options.mahjongDeskImgPath = mahjongStr + "mahjong_tile_player_desk.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_down.png";

			options.kingtilemark.anchorPoint = cc.p(0.0, 1.0);
			options.kingtilemark.position = cc.p(7, 64);
			options.kingtilemark.scale = 0.8;
		} else if (index == 1) {
			options.mahjongDeskImgPath = mahjongStr + "mahjong_tile_side_desk.png";
			options.mahjongDownImgPath = mahjongStr + "mahjong_tile_side_down.png";

			options.kingtilemark.anchorPoint = cc.p(0.0, 1.0);
			options.kingtilemark.position = cc.p(6, 20);
			options.kingtilemark.scale = 0.8;
			options.kingtilemark.rotate = -90;
		} else if (index == 2) {
			options.mahjongDeskImgPath = mahjongStr + "mahjong_tile_player_desk.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_down.png";

			options.kingtilemark.anchorPoint = cc.p(0.0, 1.0);
			options.kingtilemark.position = cc.p(6, 18);
			options.kingtilemark.scale = 0.8;
			options.kingtilemark.rotate = 180;
			options.kingtilemark.flippedX = true;
			options.kingtilemark.anchorPoint = cc.p(1.16, -0.23);
			options.kingtilemark.flippedX = false;
			options.kingtilemark.flippedY = true;

			options.mahjong = {};
			options.mahjong.flippedX = false;
			options.mahjong.flippedY = true;
		} else if (index == 3) {
			options.mahjongDeskImgPath = mahjongStr + "mahjong_tile_side_desk.png";
			options.mahjongDownImgPath = mahjongStr + "mahjong_tile_side_down.png";

			options.kingtilemark.anchorPoint = cc.p(0.0, 1.0);
			options.kingtilemark.position = cc.p(60, 55);
			options.kingtilemark.scale = 0.8;
			options.kingtilemark.rotate = 90;
		}
		this.mahjongDiscardType[index] = mahjongType;
		this.cacheDiscardTilesOptions[index] = options;
		return options;
	},

    get_start_begin_anim_config: function () {
	    var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
	    var mahjongStr = "";
	    if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
		    mahjongStr = "MahjongYellow2D/yellow_";
	    } else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
		    mahjongStr = "MahjongBlue2D/blue_";
	    } else {
		    mahjongStr = "Mahjong2D/";
	    }
        var options = {};
        options.groupSize = 3;
        options.tileDownImgPaths = [
	        mahjongStr + "mahjong_tile_down.png",
	        mahjongStr + "mahjong_tile_side_down.png",
	        mahjongStr + "mahjong_tile_down.png",
	        mahjongStr + "mahjong_tile_side_down.png"
        ];
        options.downRootNodeScales = [1, 0.95, 0.6, 0.95];
        options.downRootNodeOffsets = [
            cc.p(0, 0), cc.p(0, -30), cc.p(100, 0), cc.p(0, 40)
        ];
        options.downTilePositionFuncs = [
            function (index) {
                return cc.p(76 * index, 0);
            },
            function (index) {
                return cc.p(0, 485 - 38 * index)
            },
            function (index) {
                return cc.p(76 * index, 0)
            },
            function (index) {
                return cc.p(0, 485 - 38 * index)
            }
        ]
        return options;
    },

    adapter_operation_panel: function (panel, editorOrigin, can_win) {
        if (can_win) {
            panel.setPositionX(editorOrigin.x - 20)
        } else {
            panel.setPositionX(editorOrigin.x)
        }
    },
});