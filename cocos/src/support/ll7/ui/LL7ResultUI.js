var LL7ResultUI = PokerResultUI.extend({

	set_panels_x:function(panels,sum_width){
        panels[0].setPositionX(sum_width * 0.107);
        panels[1].setPositionX(sum_width * 0.3035);
        panels[2].setPositionX(sum_width * 0.5);
        panels[3].setPositionX(sum_width * 0.6965);
        panels[4].setPositionX(sum_width * 0.893);
    }

});
