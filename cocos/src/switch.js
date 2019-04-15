"use strict";
var switches = function () {
};

if (targetPlatform === cc.PLATFORM_OS_ANDROID) {

}
else if ((targetPlatform === cc.PLATFORM_OS_IPHONE) || (targetPlatform === cc.PLATFORM_OS_IPAD)) {

}
else {

}

switches.kbeServerIP = "192.168.1.52";
switches.kbeServerLoginPort = 20015;

switches.kbeServerIP = "192.168.1.11";
switches.kbeServerLoginPort = 20013;

if (typeof switchesnin1 === 'undefined' ) {
    switches.TEST_OPTION = true;

    switches.download_url = "https://fir.im/fxsxqp";
    switches.share_android_url = "http://fir.im/xhgxmj";
    switches.share_ios_url = "http://fir.im/xhgxmj";
    switches.h5entrylink = "http://h5entrylink";

    switches.PHP_SERVER_URL = "http://10.0.0.4:9981/api/user_info";

    switches.package_name = "com/zjfeixia/gxmj";



    switches.gzh_name = "宣和棋牌汇";
    switches.contact_wx = "xhqph888";
    switches.contact_phone = "4001234567";
    switches.default_broadcast = "欢迎加入宣和贵溪麻将，浙江飞侠科技有限公司提供健康娱乐平台，严禁赌博！";

    switches.gameName = "贵溪棋牌";
    switches.gameEngName = "gxmj";

    switches.h5appid = "";
    switches.currency_mode = 2;
    switches.appstore_check = false;
    switches.show_version = true;

    switches.customerService_wx = "xhgxqp888";

    switches.game_list = ['ddz', 'tdhmj','tykddmj','tylsmj','gsjmj'];// 尝试性将btn_list 放到
}
else {
    switches.TEST_OPTION = switchesnin1.TEST_OPTION;

	switches.download_url = switchesnin1.download_url;
    switches.share_android_url = switchesnin1.share_android_url;
    switches.share_ios_url = switchesnin1.share_ios_url;
    switches.h5entrylink = switchesnin1.h5entrylink;

    switches.PHP_SERVER_URL = switchesnin1.PHP_SERVER_URL;

    switches.package_name = switchesnin1.package_name;

    switches.gzh_name = switchesnin1.gzh_name;
    switches.contact_wx = switchesnin1.contact_wx;
    switches.contact_phone = switchesnin1.contact_phone;
    switches.default_broadcast = switchesnin1.default_broadcast;

    switches.gameName = switchesnin1.gameName;
    switches.gameEngName = switchesnin1.gameEngName;

    switches.h5appid = switchesnin1.h5appid;
    switches.currency_mode = switchesnin1.currency_mode;
    switches.appstore_check = switchesnin1.appstore_check;
    switches.show_version = switchesnin1.show_version;

    switches.customerService_wx = switchesnin1.customerService_wx;
}

switches.test_auto = function () {
    setInterval(function () {
        if (typeof h1global === 'undefined') return;
        if (h1global.entityManager) {
            let player = h1global.entityManager.player();
            if (h1global.curUIMgr && player && player.curGameRoom && !player.curGameRoom.test_rid) {
                cc.sys.localStorage.setItem("_rid_", player.curGameRoom.roomID);
                player.curGameRoom.test_rid = true;
            }
            if (h1global.curUIMgr && h1global.curUIMgr.joinroom_ui) {
                if (!h1global.curUIMgr.joinroom_ui.oo) {
                    h1global.curUIMgr.joinroom_ui.oo = h1global.curUIMgr.joinroom_ui.onShow;
                    h1global.curUIMgr.joinroom_ui.onShow = function () {
                        h1global.curUIMgr.joinroom_ui.curNum = parseInt(cc.sys.localStorage.getItem("_rid_")) || 0;
                        h1global.curUIMgr.joinroom_ui.oo.apply(this);
                        if (h1global.curUIMgr.joinroom_ui.curNum > 9999) {
                            h1global.curUIMgr.joinroom_ui.try_join = function () {
                                if (this.curNum > 9999) {
                                    h1global.player().enterRoom(this.curNum);
                                    cc.sys.localStorage.removeItem("_rid_");
                                    h1global.curUIMgr.joinroom_ui.curNum = 0;
                                }
                            };
                            h1global.curUIMgr.joinroom_ui.update_click_num()
                        }
                    };
                }
            }
        }
        if (h1global.curUIMgr && h1global.curUIMgr.login_ui) {
            if (!h1global.curUIMgr.login_ui.oo) {
                if (h1global.curUIMgr.login_ui.is_show) {
                    let idx = localStorage.getItem("__debug_idx__");
                    if (!idx) {
                        idx = 0;
                    } else {
                        idx = parseInt(idx);
                    }
                    h1global.curUIMgr.login_ui.oo = true;
                    let root = h1global.curUIMgr.login_ui.rootUINode;
                    var account_panel = root.getChildByName("account_panel");
                    var account_input_tf = ccui.helper.seekWidgetByName(account_panel, "account_input_tf");
                    if (account_input_tf.string == "h" + idx) {
                    } else {
                        idx++;
                        if (idx > 100) {
                            idx = 0;
                        }
                        account_input_tf.string = "h" + idx;
                        localStorage.setItem("__debug_idx__", idx + "")
                    }
                    account_input_tf.string = "h";
                }
            }
        }

        if (!cc.test_head_icon) {
            if (cc.sys.localStorage.getItem("INFO_JSON")) {
                var info_dict = eval('(' + cc.sys.localStorage.getItem("INFO_JSON") + ')');
                if (info_dict["headimgurl"] !== "http://192.168.1.66:8087/res/effect/biaoqing.png") {
                    info_dict["headimgurl"] = "http://192.168.1.66:8087/res/effect/biaoqing.png";
                    cc.test_head_icon = true;
                    cc.sys.localStorage.setItem("INFO_JSON", JSON.stringify(info_dict));
                }
            }
        }
    }, 1 / 10.0);
};
switches.test_auto()