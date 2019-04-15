var GameHallSceneUIManager = UIManagerBase.extend({
    onCreate: function () {
        var initUIClassNameList = ["GameHallUI", "CreateRoomUI", "JoinRoomUI", "HelpUI",
            "PlayerInfoUI", "RecordUI", "ConfigUI", "AuthentucateUI", "ActivityUI", "ShopUI",
            "WebViewUI","BroadcastUI", "GameHallShareUI",
            "ClubUI", "ClubViewUI", "ClubRecordUI", "ClubMemberUI", "ClubMgrUI", "ClubRoomDetailUI", "ConfirmUI",
            "CreateClubUI", "EditorUI", "JoinClubUI", "CSUI", "ShareCircleUI", "PublicNumUI","ClubConfigUI",
            "ShowClubUI","ClubRankUI", "ClubModeUI","RulerUI","DisclaimerUI","LotteryUI","TaskUI","NoticeUI","NoviceGiftUI","BindCodeUI",
            "InviteUI", "DismissRoomPlanUI", "ClubStatisticsUI", "ClubBindUI"];

        for (var uiClassName of initUIClassNameList) {
            this.add_ui(uiClassName.slice(0, uiClassName.length - 2).toLowerCase() + "_ui", [], uiClassName);
        }
    }
});