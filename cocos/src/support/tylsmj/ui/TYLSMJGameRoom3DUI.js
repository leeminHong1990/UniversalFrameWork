"use strict"

var TYLSMJGameRoom3DUI = TYLSMJGameRoomUI.extend({
	className:"TYLSMJGameRoom3DUI",
	uiType: const_val.GAME_ROOM_3D_UI,
	ctor:function(){
		this._super();
        this.resourceFilename = "res/ui/TYLSMJGameRoom3DUI.json";
		this.initDelayTime = const_val.DISCARD_SPEED;
	},

    init_curplayer_panel_direction:function(){
        roulette.init_roulette_3d(this.cur_player_panel);
    },

    init_discard_tile_anim_img:function(){
        //加载动画资源
        var tile_img = ccui.ImageView.create();
        // tile_img.setScale(1.5);
        // tile_img.loadTexture("Mahjong/mahjong_tile_fly.png", ccui.Widget.PLIST_TEXTURE);
        this.load_discard_tile_anim_img(tile_img);
        this.rootUINode.addChild(tile_img);
        var mahjong_img = ccui.ImageView.create();
        mahjong_img.setPosition(cc.p(60, 60));
        mahjong_img.setName("mahjong_img");
        tile_img.addChild(mahjong_img);
        tile_img.setAnchorPoint(cc.p(0.5,0.5));
        tile_img.setVisible(false);
        this.discard_tile_anim_img = tile_img;
    },

    getHandTileConfig:function(){
        var config = {}
        config.tile_width   = 120;
        config.tile_height  = 136;
        config.real_width   = 85;
        config.real_height  = 122;
        config.bottom_height = 12;
        config.sel_posy     = 30;
        return config
    },

    load_discard_tile_anim_img:function(tile_img){
        tile_img.loadTexture("Mahjong/mahjong_tile_player_hand.png", ccui.Widget.PLIST_TEXTURE);
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
		var mahjongStr = "";
		if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
			mahjongStr = "MahjongYellow/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue/blue_";
		} else {
			mahjongStr = "Mahjong/";
		}
		var options = {};
		if(index == 0){
			options.tilePanelOffsetFunc = function(tileCount , panel){
				panel.setPositionX(tileCount * 260 + 23);
			};
			options.tilePanelDownOffsetFunc = function(tileCount , panel){
				panel.setPositionX(tileCount * 260 + 23);
			};

			options.mahjongHandImgPath = mahjongStr + "mahjong_tile_player_hand.png";
			options.mahjongTxtImgPath ="Mahjong/mahjong_big_%d.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_player_hand.png";

            options.tilePositionFunc = function(tile_img, i){
                tile_img.setPosition(cc.p(85 * i - 18,0));
            }
            options.tileDownPositionFunc = function(tile_img , i) {
                tile_img.setPositionX(84 *i-15);
            };

            options.kingtilemark ={};
            options.kingtilemark.anchorPoint = cc.p(0,1);
            options.kingtilemark.position = cc.p(0, 90);
            options.kingtilemark.scale = 0.7;

            options.draw = {};
            options.draw.offset = cc.p(20,0);
            options.draw.animFrom = cc.p(0,20);
            options.draw.animTo = cc.p(0,-20);
        }else if(index == 1){

            options.tilePanelOffsetFunc = function(tileCount , panel){
                panel.setPositionY(tileCount * 98);
            };
            options.tilePanelDownOffsetFunc = function(tileCount , panel){
                panel.setPositionY(tileCount * 98);
            };

			options.mahjongHandImgPath = mahjongStr + "mahjong_tile_left_hand.png";
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_left_up.png";
			options.mahjongTxtImgPath ="Mahjong/mahjong_big_%d.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_left_down.png";

            var tilePositionX = [-31,-31,-32,-31,-31,-31,-31,-31,-30,-30,-29,-29,-29,-28];
            var tilePositionY = [0,34,67,101,133.5,165,196,226.5,257,285,313.5,341,368,394];
            options.tilePositionFunc = function(tile_img, i){
                tile_img.setPosition(cc.p(tilePositionX[i] ,tilePositionY[i] + 10));
            }
            options.tileDownPositionFunc = function(tile_img , i) {
                tile_img.setPosition(cc.p(tilePositionX[i] + 10 ,tilePositionY[i] + 10 - i * 2));
            };
            options.tilescale = [100,98,98,95,93,91,89.5,88,85,83.5,81,79.5,79,75];

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
                panel.setPositionX(680 - tileCount * 128);
            };
            options.tilePanelDownOffsetFunc = function(tileCount , panel){
                panel.setPositionX(680 - tileCount * 128);
            };

			options.mahjongHandImgPath = mahjongStr + "mahjong_tile_top_hand.png";
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_player_up.png";
			options.mahjongTxtImgPath ="Mahjong/mahjong_big_%d.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_player_down%d.png";
			options.mahjongDownImgPathList = [0,1,2,3,4,5,6,7,8,8,8,9,10,11];
			options.tileOrderList = [0,1,2,3,4,5,6,5,4,3,3,2,1,0];
			options.tileFlippedX = true;

            options.tilePositionFunc = function(tile_img, i){
                tile_img.setPosition(cc.p(1070 - 84 * i ,150));
            }
            options.tileDownPositionFunc = function(tile_img , i) {
                tile_img.setPosition(cc.p(1100 - 77 * i + 50 ,132));
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
                panel.setPositionY(515 - tileCount * 96);
            };
            options.tilePanelDownOffsetFunc = function(tileCount , panel){
                panel.setPositionY(530 - tileCount * 96);
            };
			options.mahjongHandImgPath = mahjongStr + "mahjong_tile_left_hand.png";
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_left_up.png";
			options.mahjongTxtImgPath ="Mahjong/mahjong_big_%d.png";
			options.mahjongDownImgPath =mahjongStr + "mahjong_tile_left_down.png";

            var tilePositionX = [12,12,11,10,9,8,7,6,5,4,3,2,1];
            var tilePositionY = [403,377,349,321,292,262,231,200,168,135,102,68,35,0];
            options.tilePositionFunc = function(tile_img, i){
                tile_img.setPosition(cc.p(tilePositionX[i] , tilePositionY[i]));
            }
            options.tileDownPositionFunc = function(tile_img , i , upTilesListLength) {
                tile_img.setPosition(cc.p(tilePositionX[i] - 2 - i / 2 - 4 * upTilesListLength, tilePositionY[i] - (13 - i) * 2));
            };
            options.tilescale = [76,76,79.5,81,83.5,85,88,89.5,91,93,95,98,98,100];
            options.tiledownscale = [76,76,79.5,81,83.5,85,88,89.5,91,93,95,98,98,100];

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

	get_update_player_up_tiles_config: function (index) {
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
			mahjongStr = "MahjongYellow/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue/blue_";
		} else {
			mahjongStr = "Mahjong/";
		}
		var options = {};
		var upcards_skewlist = [16, 13, 12, 9, 6, 3, 0, 0, 0, -3, -6, -9];//const.val
		if (index === 0) {
			options.mahjongUpImgPath = function (a, b) {
				return mahjongStr + "mahjong_tile_player_up" + (a * 3 + b).toString() + ".png"
			};
			options.mahjongDownImgPath = function (a, b) {
				return mahjongStr + "mahjong_tile_player_down" + (a * 3 + b).toString() + ".png"
			};
			options.mahjongTxtPath = "Mahjong/mahjong_big_%d.png";

            options.kongArrowOffset = cc.p(0, 28);

            options.mahjongTxtSkew = function (a, b) {
                return cc.p(upcards_skewlist[(b + 3 * a)], 0);
            };
            options.mahjongTxtScale = 0.8;

            options.kingtilemark = {};
            options.kingtilemark.anchorPoint = cc.p(0, 1);
            options.kingtilemark.position = cc.p(0, 60);
            options.kingtilemark.scale = 0.46;

			options.mahjongUpKongImgPath = function (i) {
				return mahjongStr + "mahjong_tile_player_up" + (i * 3 + 1).toString() + ".png";
			};
			options.mahjongDownKongImgPath = function (i) {
				return mahjongStr + "mahjong_tile_player_down" + (i * 3 + 1).toString() + ".png";
			};

            options.mahjongKongTxtSkew = function (i) {
                return cc.p(upcards_skewlist[(1 + 3 * i)], 0);
            };

            // options.fromImgPos = cc.p(-10, 0);
            options.fromImgPos = [[-10,0],[-6,0],[-4,0],[-2,0]];

			options.kongTileUpOffset = {};
			options.kongTileUpOffset.x = [-6,-2,0,4];
			options.kongTileUpOffset.y = 30;
		} else if (index === 1) {
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_left_up.png";
			options.mahjongDownImgPath = mahjongStr + "mahjong_tile_left_down.png";

            options.mahjongTxtPath = "Mahjong/mahjong_big_%d.png";

            options.tilescale = [100,98,96,96,94,92,92,90,89,89,87,86];

            options.kongArrowOffset = cc.p(8, 20);
            options.kongTilePos = cc.p(0, 8);

            options.mahjongTxtSkew =cc.p(0,19);
            options.mahjongTxtScale = cc.p(0.4,0.5);

            options.kingtilemark = {};
            options.kingtilemark.anchorPoint = cc.p(0, 1);
            options.kingtilemark.position = cc.p(20, 20);
            options.kingtilemark.scale = 0.4;
            options.kingtilemark.rotate = -90;

            options.mahjongTxtFlippedY = true;

            options.mahjongUpKongImgPath = options.mahjongUpImgPath;
            options.mahjongDownKongImgPath = options.mahjongDownImgPath;

            options.fromImgRotate = 16;
            options.fromImgPos = cc.p(1, -3);

			// options.kongTileUpOffset = cc.p(10, 20);
			options.kongTileUpOffset = {};
			options.kongTileUpOffset.x = [10,9,9,9];
			options.kongTileUpOffset.y = [17,17,17,17];
		} else if (index === 2) {
			options.mahjongUpImgPath = function (a, b) {
				return mahjongStr + "mahjong_tile_player_up" + (a * 3 + b).toString() + ".png"
			};
			options.mahjongDownImgPath = function (a, b) {
				return mahjongStr + "mahjong_tile_player_down" + (a * 3 + b).toString() + ".png"
			};
			options.mahjongTxtPath = "Mahjong/mahjong_big_%d.png";

            options.kongArrowOffset = cc.p(10, 15);

            options.mahjongTxtSkew = function (a, b) {
                return cc.p(upcards_skewlist[(b + 3 * a)], 0);
            };
            options.mahjongTxtScale = cc.p(0.95,0.75);

            options.kingtilemark = {};
            options.kingtilemark.anchorPoint = cc.p(0, 1);
            options.kingtilemark.position = cc.p(40, 14);
            options.kingtilemark.scale = 0.4;
            options.kingtilemark.rotate = 180;

			options.mahjongUpKongImgPath = function (i) {
				return mahjongStr + "mahjong_tile_player_up"+ (i * 3 + 1).toString() +".png";
			};
			options.mahjongDownKongImgPath = function (i) {
				return mahjongStr + "mahjong_tile_player_down" + (i * 3 + 1).toString() + ".png";
			};
			options.mahjongKongTxtSkew = function (i) {
				return cc.p(upcards_skewlist[(3 * i + 1)], 0);
			};
			// options.mahjongTxtFlippedX = true;
			options.mahjongTxtFlippedY = true;
			options.kingtilemark.anchorPoint = cc.p(0, -0.35);
			options.kingtilemark.flippedY = true;
			options.mahjongTxtFlippedY = false;
			options.mahjongTxtFlippedX = true;

            // options.fromImgPos = cc.p(-5, 16);
            options.fromImgPos = [[-5,16],[-6,16],[-7,16],[-8,16]];

			// options.kongTileUpOffset = cc.p(0, 30);
			options.kongTileUpOffset = {};
			options.kongTileUpOffset.x = [5,2,0,-3];
			options.kongTileUpOffset.y = 30;
		}else if (index === 3) {
			options.mahjongUpImgPath = mahjongStr + "mahjong_tile_left_up.png";
			options.mahjongDownImgPath = mahjongStr + "mahjong_tile_left_down.png";

            options.mahjongTxtPath = "Mahjong/mahjong_big_%d.png";

            options.tilescale = [86,87,89,89,90,92,92,94,96,96,98,100];

            options.kongArrowOffset = cc.p(-12, 18);

            options.mahjongTxtSkew =cc.p(0,-19);
            options.mahjongTxtScale = cc.p(0.4,0.5);

            options.kingtilemark = {};
            options.kingtilemark.anchorPoint = cc.p(0, 1);
            options.kingtilemark.position = cc.p(68, 56);
            options.kingtilemark.scale = 0.4;
            options.kingtilemark.rotate = 90;

            options.mahjongUpKongImgPath = options.mahjongUpImgPath;
            options.mahjongDownKongImgPath = options.mahjongDownImgPath;

            options.fromImgRotate = -16;
            options.fromImgPos = cc.p(3, -3);

			// options.kongTileUpOffset = cc.p(-8, 16);
			options.kongTileUpOffset = {};
			options.kongTileUpOffset.x = [-10,-9,-9,-9];
			options.kongTileUpOffset.y = [14,14,16,17];
		}
		this.mahjongUpType[index] = mahjongType;
		this.cacheUpTilesOptions[index] = options;
		return options;
	},

	get_update_player_exposed_tiles_config: function (index) {
		var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
		var mahjongStr = "";
		if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
			mahjongStr = "MahjongYellow/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue/blue_";
		} else {
			mahjongStr = "Mahjong/";
		}
		var options = {};
		var upcards_rotationList = [16, 13, 12, 9, 6, 3, 0, 0, 0, 0, 0, -3, -6, -9, -9];//const.val
		options.mahjongUpImgPath = mahjongStr + "mahjong_tile_player_up%d.png";
		options.mahjongTxtImgPath = "Mahjong/mahjong_big_%d.png";

        if (index === 0) {
            options.tilePositionFunc = function (tile_img, i) {
                tile_img.setPositionX(80 * i);
            };
            options.tilePanelOffsetFunc = function (tileCount, panel) {
                panel.setPositionX(panel.editorOrigin.x + tileCount * 251);
            };
            options.mahjongOrderList = [0,1,2,3,4,5,6,6,6,5,4,3,2,1];
            options.mahjongRotationXList = upcards_rotationList;
            options.mahjongTxtScale = cc.p(0.8,0.8);
            options.mahjongUpImgList = [0,1,2,3,4,5,6,7,8,8,8,9,10,11];
            options.mahjongTxtImgPath = "Mahjong/mahjong_big_%d.png";

            options.draw = {};
            options.draw.offset = cc.p(20,0);
            options.draw.animFrom = cc.p(0,20);
            options.draw.animTo = cc.p(0,-20);
        } else if (index === 1) {
            var tilePositionY = [0,30,60,90,120,150,180,210,240,270,300,334,360,390];
	        options.mahjongUpImgPath = mahjongStr + "mahjong_tile_left_up.png";
            options.tilePositionFunc = function (tile_img, i) {
                tile_img.setPositionY(tilePositionY[i]);
            };
            options.tilePanelOffsetFunc = function (tileCount, panel) {
                panel.setPositionY(panel.editorOrigin.y + tileCount * (33.5 * 3));
            };
            options.mahjongTxtFlippedY = true;
            options.mahjongSkewY = 19;
            options.mahjongTxtScale = cc.p(0.4,0.5);
            options.mahjongTxtImgPath = "Mahjong/mahjong_big_%d.png";
            options.draw = {};
            options.draw.offset = cc.p(0,10);
            options.draw.animFrom = cc.p(0,10);
            options.draw.animTo = cc.p(0,-10);

        } else if (index === 2) {
            options.tilePositionFunc = function (tile_img, i) {
                tile_img.setPositionX(1260 - 80 * i);
            };
            options.tilePanelOffsetFunc = function (tileCount, panel) {
                panel.setPositionX(panel.editorOrigin.x - tileCount * (44 * 3) - 12);
            };
            options.mahjongOrderList = [0,1,2,3,4,5,6,6,6,5,4,3,2,1];
            options.mahjongTxtFlippedY = true;
            options.mahjongRotationXList = upcards_rotationList;
            options.mahjongTxtScale = cc.p(0.95,0.75);
            options.mahjongUpImgList = [0,1,2,3,4,5,6,7,8,8,8,9,10,11];
            options.mahjongTxtImgPath = "Mahjong/mahjong_big_%d.png";


            options.draw = {};
            options.draw.offset = cc.p(-20,0);
            options.draw.animFrom = cc.p(0,10);
            options.draw.animTo = cc.p(0,-10);
	        options.mahjongTxtFlippedY = false;
	        options.mahjongTxtFlippedX = true;
        } else if (index === 3) {
            var tilePositionY = [403,377,349,321,292,262,235,210,180,150,120,90,60,30];
	        options.mahjongUpImgPath = mahjongStr + "mahjong_tile_left_up.png";
            options.tilePositionFunc = function (tile_img, i) {
                tile_img.setPositionY(tilePositionY[i]);
                tile_img.setPositionX(0);
            };
            options.tilePanelOffsetFunc = function (tileCount, panel) {
                panel.setPositionY(panel.editorOrigin.y - tileCount * (32 * 3));
            };
            options.mahjongSkewY = -19;
            options.mahjongTxtScale = cc.p(0.4,0.5);
            options.mahjongTxtImgPath = "Mahjong/mahjong_big_%d.png";

            options.draw = {};
            options.draw.offset = cc.p(0,-10);
            options.draw.animFrom = cc.p(0,10);
            options.draw.animTo = cc.p(0,-10);
        } else {
            cc.error("not support index", index);
        }
        return options;
    },

    get_start_begin_anim_config: function () {
        var options = {};
        options.groupSize = 3;
	    var mahjongType = cc.sys.localStorage.getItem(cutil.keyConvert("GAME_ROOM_MAHJONG_BG", h1global.curUIMgr.gameType));
	    var mahjongStr = "";
	    if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_YELLOW) {
		    mahjongStr = "MahjongYellow/yellow_";
	    } else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
		    mahjongStr = "MahjongBlue/blue_";
	    } else {
		    mahjongStr = "Mahjong/";
	    }
        options.tileDownImgPaths = [
            mahjongStr + "mahjong_tile_player_down6.png",
            mahjongStr + "mahjong_tile_left_down.png",
            mahjongStr + "mahjong_tile_player_down6.png",
            mahjongStr + "mahjong_tile_left_down.png"
        ];
        // options.tileDownImgPaths = [
        //     "Mahjong/mahjong_tile_player_down%d.png",
        //     "Mahjong/mahjong_tile_left_down.png",
        //     "Mahjong/mahjong_tile_player_down%d.png",
        //     "Mahjong/mahjong_tile_left_down.png"
        // ];
        // options.tileTopAndDownImgPaths = [
        //     [0,1,2,3,4,5,6,7,8,8,9,10,11],
        //     [],
        //     [0,1,2,3,4,5,6,7,8,8,9,10,11],
        //     []
        // ];
        options.downRootNodeScales = [1, 0.95, 0.6, 0.95];
        options.downRootNodeRotations = [0, 16, 0, -16];
        options.downRootNodeAnchorPointX = [0, 1, 0, 0];
        options.downRootNodeFlippedX = [0, 1, 0, 0];
        options.downRootNodeOffsets = [
            cc.p(0, 0), cc.p(0, -80), cc.p(40, 0), cc.p(-20, -20)
        ];
        options.tilescale = [100,97,95,93,91,89,87,85,83,81,79,77,75,73];
        options.downTilePositionFuncs = [
            function (index) {
                return cc.p(78 * index, 0);
            },
            function (index) {
                return cc.p(-40, 485 - 32 * index)
            },
            function (index) {
                return cc.p(78 * index, 0)
            },
            function (index) {
                return cc.p(-2 * index, 485 - 32 * index)
            }
        ]
        return options;
    },

	play_discard_fly_anim: function (tile_img, discard_tile, start_position, end_position, mid_position, index) {
		if (start_position == undefined || end_position == undefined || tile_img == undefined) {
			cc.error("3D play_discard_fly_anim params error", tile_img, start_position, end_position);
			return;
		}
		discard_tile.setVisible(false);
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
		tile_img.runAction(cc.Sequence.create(
			// cc.DelayTime.create(1),
			// cc.MoveTo.create(3, mid_position),
			// cc.Spawn.create(cc.MoveTo.create(0.1, mid_position),cc.ScaleTo.create(0.1, 0.8)),
			cc.Spawn.create(cc.DelayTime.create(self.initDelayTime), cc.ScaleTo.create(self.initDelayTime * 0.1, 1.0, 1.0)),
			// cc.Spawn.create(cc.MoveTo.create(3, end_position),cc.ScaleTo.create(3,0.63,0.63)),
			cc.Spawn.create(cc.MoveTo.create(0.05, end_position), cc.Sequence.create(cc.DelayTime.create(0.02), cc.ScaleTo.create(0.03, 0.6, 0.6))),
			cc.CallFunc.create(function () {
				tile_img.setVisible(false);
				tile_img.setScale(1.0);
				if (discard_tile.tile_num && discard_tile.tile_num > 0) {
					discard_tile.setVisible(true);
				}
			})
		));
	},

	get_play_fly_anim_end_time:function () {
		return 0.05 + this.initDelayTime;
	},

    get_play_discard_anim_config:function(serverSitNum, index, onlyTilePointer){
        var cur_player_hand_panel = this.rootUINode.getChildByName("player_tile_panel" + index.toString()).getChildByName("player_hand_panel");

        var player = h1global.player();
        var handTilesList = player.curGameRoom.handTilesList[serverSitNum]

        var options= {};
        options.pointerScale = 0.8;
        var player = h1global.player();
        var discardTileIdx = player.curGameRoom.discardTilesList[serverSitNum].length;
        if(discardTileIdx > const_tylsmj.MAX_DISCARD_TILES_SIZE){
            discardTileIdx = Math.min(discardTileIdx , const_tylsmj.MAX_DISCARD_TILES_SIZE);
        }
        discardTileIdx = Math.max(0 , --discardTileIdx);
        var cur_player_discard_panel = this.game_info_panel.getChildByName("player_discard_panel" + index);
        var cur_discard_tile_img = cur_player_discard_panel.getChildByName("tile_img_" + discardTileIdx);
        var cur_discard_tile_position = cur_discard_tile_img.getPosition();
        var cur_hand_tile_position = undefined
        var cur_delay_tile_position = undefined;

        if(index == 0){
            options.pointerPosition = cc.p(41, 83);
            if(!onlyTilePointer){
	            cur_delay_tile_position = cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.361);
	            this.initDelayTime = 0;
                if(this.lastDiscardPosition == undefined){
                    cur_hand_tile_position = cur_player_hand_panel.convertToWorldSpace(cc.p(84 * handTilesList.length ,0));
                }else{
                    cur_hand_tile_position = this.lastDiscardPosition;
                    cur_hand_tile_position.x = cur_hand_tile_position.x + 60;
                    cur_hand_tile_position.y = cur_hand_tile_position.y + 60;
                }
                // cur_discard_tile_position.x = cur_discard_tile_position.x + cur_discard_tile_img.width * 0.3;
                cur_discard_tile_position.y = cur_discard_tile_position.y - cur_discard_tile_img.height * 0.3;
                cur_discard_tile_position = cur_player_discard_panel.convertToWorldSpace(cur_discard_tile_position);
            }
        } else if(index == 1){
            options.pointerPosition = cc.p(41, 78);
            if(!onlyTilePointer){
	            this.initDelayTime = const_val.DISCARD_SPEED;
	            cur_delay_tile_position = cc.p(cc.winSize.width * 0.68, cc.winSize.height * 0.583);
                cur_hand_tile_position = cur_player_hand_panel.convertToWorldSpace(cc.p(-57, handTilesList.length * 32));
                cur_discard_tile_position.x = cur_discard_tile_position.x - cur_discard_tile_img.width * 0.4;
                cur_discard_tile_position.y = cur_discard_tile_position.y + cur_discard_tile_img.height * 0.7;
                cur_discard_tile_position = cur_player_discard_panel.convertToWorldSpace(cur_discard_tile_position);
            }
        } else if(index == 2){
            options.pointerPosition = cc.p(42, 82);
            if(!onlyTilePointer){
	            this.initDelayTime = const_val.DISCARD_SPEED;
	            cur_delay_tile_position = cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.76);
                cur_hand_tile_position = cur_player_hand_panel.convertToWorldSpace(cc.p(84 * (13 - handTilesList.length), 0));
                cur_discard_tile_position.x = cur_discard_tile_position.x - cur_discard_tile_img.width * 0.1;
                cur_discard_tile_position.y = cur_discard_tile_position.y - cur_discard_tile_img.height * 0.5;
                cur_discard_tile_position = cur_player_discard_panel.convertToWorldSpace(cur_discard_tile_position);
            }
        } else if(index == 3){
            options.pointerPosition = cc.p(41, 78);
            if(!onlyTilePointer){
	            this.initDelayTime = const_val.DISCARD_SPEED;
	            cur_delay_tile_position = cc.p(cc.winSize.width * 0.32, cc.winSize.height * 0.583);
                cur_hand_tile_position = cur_player_hand_panel.convertToWorldSpace(cc.p(0, (13 - handTilesList.length) * 32));
                cur_discard_tile_position.x = cur_discard_tile_position.x - cur_discard_tile_img.width * 0.4;
                cur_discard_tile_position.y = cur_discard_tile_position.y - cur_discard_tile_img.height * 0.5;
                cur_discard_tile_position = cur_player_discard_panel.convertToWorldSpace(cur_discard_tile_position);
            }
        }
        if(!onlyTilePointer){
            options.mahjongTxtPath = "Mahjong/mahjong_big_%d.png";
            options.tileStartPosition = cur_hand_tile_position;
            options.tileMidPosition = cur_delay_tile_position;
            options.tileEndPosition = cur_discard_tile_position;
        }
        return options;
    },

	get_player_discard_tiles_config:function(index){
		cc.log("This is 3D get_player_discard_tiles_config!");
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
			mahjongStr = "MahjongYellow/yellow_";
		} else if (mahjongType == const_val.GAME_ROOM_MAHJONG_BG_BULE) {
			mahjongStr = "MahjongBlue/blue_";
		} else {
			mahjongStr = "Mahjong/";
		}
		var options = {};
		options.kingtilemark = {};
		options.mahjong = {};
		options.mahjongTxtPath = "Mahjong/mahjong_big_%d.png";
		if(index == 0){
			options.mahjongDeskImgPath = mahjongStr + "mahjong_tile_player_desk%d.png";
			options.mahjongDownImgPath = mahjongStr + "desk_mahjong_tile_player_down%d.png";
			options.mahjongdesk = [0,1,2,3,4,4,3,2,1,0];

            options.mahjong.scale = [0.65,0.45];
            options.mahjong.rotationX = [6,4,4,2,0,0,2,4,4,6];
            options.mahjong.flippedX_list = [0,0,0,0,0,0,1,1,1,1];
            options.mahjong.positionX = [40,41,42,42,42,42,42,42,42,42];

            options.kingtilemark.anchorPoint = cc.p(0.0, 1.0);
            options.kingtilemark.position = cc.p(0, 60);
            options.kingtilemark.scale = 0.4;
        }else if(index == 1){
			options.mahjongDeskImgPath = mahjongStr + "mahjong_tile_left_desk.png";
			options.mahjongDownImgPath = mahjongStr + "desk_mahjong_tile_left_down.png";

            options.mahjong.scale = [0.4,0.55];
            options.mahjong.skewY = 12;
            options.mahjong.flippedX = true;

            options.kingtilemark.anchorPoint = cc.p(0.0, 1.0);
            options.kingtilemark.position = cc.p(6, 16);
            options.kingtilemark.scale = 0.4;
            options.kingtilemark.rotate = -90;
        }else if(index == 2){
			options.mahjongDeskImgPath = mahjongStr + "mahjong_tile_player_desk%d.png";
			options.mahjongDownImgPath = mahjongStr + "desk_mahjong_tile_player_down%d.png";
            options.mahjongdesk = [0,1,2,3,4,4,3,2,1,0];

            options.mahjong.scale = [0.65,0.45];
            options.mahjong.rotationX = [6,4,4,2,0,0,2,4,4,6];
            options.mahjong.flippedX_list = [0,0,0,0,1,1,1,1,1,1];
            options.mahjong.flippedY = true;

            options.kingtilemark.anchorPoint = cc.p(0.0, 1.0);
            options.kingtilemark.position = cc.p(40, 14);
            options.kingtilemark.scale = 0.4;
            options.kingtilemark.rotate = 180;
			options.mahjong.flippedX_list = [1,1,1,1,0,0,0,0,0,0];
			options.mahjong.flippedY = false;
			options.kingtilemark.anchorPoint = cc.p(0.40, 0.27);
			options.kingtilemark.flippedX_list = [0,0,0,0,1,1,1,1,1,1];
			options.kingtilemark.flippedY = true;
        }else if(index == 3){
			options.mahjongDeskImgPath = mahjongStr + "mahjong_tile_left_desk.png";
			options.mahjongDownImgPath = mahjongStr + "desk_mahjong_tile_left_down.png";

            options.mahjong.scale = [0.4,0.55];
            options.mahjong.skewY = -12;

            options.kingtilemark.anchorPoint = cc.p(0.0, 1.0);
            options.kingtilemark.position = cc.p(54, 50);
            options.kingtilemark.scale = 0.4;
            options.kingtilemark.rotate = 90;
        }
		this.mahjongDiscardType[index] = mahjongType;
		this.cacheDiscardTilesOptions[index] = options;
        return options;
    },

    adapter_operation_panel: function (panel, editorOrigin, can_win) {
        if (can_win) {
            panel.setPositionX(editorOrigin.x - 50)
        } else {
            panel.setPositionX(editorOrigin.x)
        }
    },

});