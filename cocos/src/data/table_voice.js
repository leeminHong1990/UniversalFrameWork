"use strict";

var table_voice = {
    1 :{
        'name': '普通话',
        'used': [1001, 1002, 1003, 1004, 1005, 1006, 1011, 1012, 1013, 1014, 1015, 1016,1018,1019, 1023],
        'root': "res/sound/voice/mahjong_mandarin/"
    },

    2 :{
        'name': '太原话',
        'used': [1004, 1005, 1016,1018,1019],
        'root': "res/sound/voice/mahjong_tykdd/"
    },

    3 : {
        'name': '普通话',
        'used': [1007, 1008, 1009, 1010],
        'root': "res/sound/voice/poker_mandarin/"
    },

	4 : {
		'name': '普通话',
		'used': [1017],
		'root': "res/sound/voice/poker_llda7/"
	}
};

var table_game2voice = {};
for(var i=1; i<= Object.keys(table_voice).length; i++){
    var info = table_voice[i];
    for(var j=0; j< info["used"].length; j++){
        var value = info["used"][j];
        if(!table_game2voice[value]){
            table_game2voice[value] = [];
        }
        table_game2voice[value].push(i);
    }
}

