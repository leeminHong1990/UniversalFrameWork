var table_params = {
    1:{
        'id':1,
        'type':1, // 多选一
        'reset':1, //是否需要重新刷新界面
        'key':'game_round',
        'values':{
			4:'4局(1房卡)',
			8:'8局(2房卡)',
			12:'12局(3房卡)',
        },
        'title':'游戏局数', // 标题
        'text':'游戏局数',
    },

    2:{
        'id':2,
        'type':1, // 多选一
        'reset':1,
        'key':'game_round',
        'values':{
			8:'8局(1房卡)',
			16:'16局(2房卡)',
        },
        'title':'游戏局数', // 标题
        'text':'游戏局数',
    },

    3:{
        'id':3,
        'type':1, // 多选一
        'reset':1,
        'key':'game_round',
        'values':{
			4:'4局(2房卡)',
			8:'8局(3房卡)',
			12:'12局(4房卡)',
        },
        'title':'局数：', // 标题
        'text':'局数',
    },

    4:{
        'id':4,
        'type':1, // 多选一
        'reset':1,
        'key':'game_round',
        'values':{
			16:'16局(2房卡)',
			8:'8局(1房卡)',
        },
        'title':'局数：', // 标题
        'text':'局数',
    },

    5:{
        'id':5,
        'type':1, // 多选一
        'key':'pay_mode',
        'reset':1,
        'values':{
            1 : '房主支付',
            2 : 'AA支付',
        },
        'title':'支付模式', // 标题
        'text':'支付模式',
    },

    6:{
        'id':6,
        'type':1, // 多选一
        'key':'pay_mode',
        'reset':1,
        'values':{
            '03' : '房主支付',
            '02' : 'AA支付',
        },
        'title':'支付模式', // 标题
        'text':'支付模式',
    },

    7:{
        'id':7,
        'type':1, // 多选一
        'key':'pay_mode',
        'reset':1,
        'values':{
            1 : '房主支付',
            2 : 'AA支付',
        },
        'title':'支付：', // 标题
        'text':'普通支付',
    },

    8:{
        'id':8,
        'type':1, // 多选一
        'key':'pay_mode',
        'reset':1,
        'values':{
            '03' : '房主支付',
            '02' : 'AA支付',
        },
        'title':'支付：', // 标题
        'text':'亲友圈支付',
    },

    9:{
        'id':9,
        'type':1, // 多选一
        'key':'game_mode',
        'values':{
            0:'叫分',
            1:'抢庄',
        },
        'title':'游戏模式', // 标题
        'text':'斗地主游戏模式',
    },

    10:{
        'id':10,
        'type':1, // 多选一
        'key':'max_boom_times',
        'h_size':2, //每行最多个数
        'values':{
            3 : '3',
            4 : '4',
            5 : '5',
            9999 : '无上限',
        },
        'title':'炸弹上限', // 标题
        'text':'斗地主炸弹上限',
    },

    11:{
        'id':11,
        'type': 2, // 复选框
        'h_size':2,
        'key':'flower',
        'values':[
            {'key':'mul_mode','txt':'加倍','val':[0,1]},
            {'key':'dealer_joker','txt':'双王必叫','val':[0,1]},
            {'key':'dealer_42','txt':'四个二必叫','val':[0,1]},
            {'key':'is_emotion','txt':'禁用表情','val':[0,1]},
            {'key':'only3_1','txt':'三张只能带一','val':[0,1]},
        ],
        'title':'高级选项', // 标题
        'text':'斗地主高级选项',
    },

    12:{
        'id':12,
        'type': 1, // 多选一
        'key': 'game_mode',
        'values':{
            '01' : '特殊牌型',
            '00' : '普通玩法',
        },
        'title':'玩法：', // 标题
        'text':'推倒胡玩法',
    },

    13:{
        'id':13,
        'type': 2, // 复选框
        'h_size':3,
        'values':[
            {'key':'add_winds','txt':'带风','val':[0,1]},
            {'key':'add_dealer','txt':'带庄','val':[0,1]},
            {'key':'kong_follow_win','txt':'杠随胡','val':[0,1]},
            {'key':'king_mode','txt':'耗子','val':[0,1]},
            //{'key':'bao_hu','txt':'包胡','val':[0,1]},
            {'key':'multiplayer_win','txt':'一炮多响','val':[0,1]},
            {'key':'need_ting','txt':'报听','val':[0,1]},
            {'key':'lack_door','txt':'缺一门','val':[0,1]},
        ],
        'title':'',     // 标题
        'text':'推倒胡玩法',
    },

    14:{
        'id':14,
        'type': 2, // 复选框
        'h_size':3,
        'values':[
            {'key':'add_winds','txt':'带风','val':[0,1]},
            {'key':'add_dealer','txt':'带庄','val':[0,1]},
            {'key':'kong_follow_win','txt':'杠随胡','val':[0,1]},
            {'key':'need_ting','txt':'报听','val':[0,1]},
            {'key':'bao_hu','state':1,'txt':'包胡','val':[0,1]},
            {'key':'multiplayer_win','txt':'一炮多响','val':[0,1]},
            {'key':'king_mode','txt':'耗子','val':[0,1]},
            {'key':'lack_door','txt':'缺一门','val':[0,1]},
        ],
        'title':'',     // 标题
        'text':'推倒胡玩法',
    },

    15:{
        'id':15,
        'type': 1, // 多选一
        'reset':1,
        'key': 'game_mode',
        'values':{
            '01' : '特殊牌型',
            '00' : '普通玩法',
            '02' : '耗子玩法',
        },
        'title':'玩法：', // 标题
        'text':'扣点点玩法',
    },

    16:{
        'id':16,
        'type': 1, // 多选一
        'key': 'king_mode',
        'values':{
            0 : '风耗子',
            1 : '单耗子',
        },
        'title':'', // 标题
        'text':'扣点点耗子',
    },

    17:{
        'id':17,
        'type': 2, // 复选框
	    'h_size':3,
	    'premise':1,
        'values':[
	        {'key':'seven_pair','txt':'七小对','val':[0,1]},
	        {'key':'mouse_general','txt':'耗子吊将','val':[0,1],'premise':1},
	        {'key':'mouse_general_onetwo','txt':'耗子吊将12能胡','val':[0,1],'premise':2},
	        {'key':'ting_mouse','txt':'可以单听耗子','val':[0,1]},
	        {'key':'reward','txt':'赏金','val':[0,1]},
	        {'key':'ekong_is_dwin','txt':'明杠杠开算自摸','val':[0,1]},
	        {'key':'bao_kong','txt':'点杠不包杠','val':[0,1]},
	        {'key':'repeat_kong','txt':'回手杠','val':[0,1]},
	        {'key':'add_dealer','txt':'加庄','val':[0,1]},
        ],
        'title':'',     // 标题
        'text':'扣点点玩法',
    },

    18:{
        'id':18,
        'type': 2, // 复选框
	    'h_size':2,
        'values':[
	        {'key':'ekong_is_dwin','txt':'明杠杠开算自摸','val':[0,1]},
	        {'key':'bao_kong','txt':'点杠不包杠','val':[0,1]},
	        {'key':'repeat_kong','txt':'回手杠','val':[0,1]},
            {'key':'add_dealer','txt':'加庄','val':[0,1]},
        ],
        'title':'',     // 标题
        'text':'扣点点玩法',
    },

    19:{
        'id':19,
        'type': 2, // 复选框
        'values':[
            {'key':'same_suit_mode','txt':'清一色','val':[0,1]},
            //{'key':'same_suit_loong','txt':'青龙','val':[0,1]},
        ],
        'title':'玩法：',     // 标题
        'text':'立四玩法',
    },


    20:{
        'id':20,
        'type': 2, // 多选一
        'key': 'play_mode',//panel名
        'parallel': 1, //是平行线
        'values':[
            {'key':'win_mode','txt':'硬八张','val':[0,1]},
            {'key':'king_num','txt':'带混','val':[0,1]},
        ],
        'title':'玩法：', // 标题
        'text':'拐三角财神',
    },

    21:{
        'id':21,
        'type': 2, // 复选框
        'values':[
            {'key':'suit_mode','txt':'7对','val':[0,2]},
            {'key':'job_mode','txt':'包胡','val':[0,1]},
        ],
        'title':'',     // 标题
        'text':'拐三角玩法',
    },

    22:{
        'id':22,
        'type': 0, // 创建按钮
        'key':'create_btn',
        'values':"res/ui/Default/ok_btn.png",
        'title':'',     // 标题
        'text':'按钮',
    },

    23:{
        'id':23,
        'type': 3, // 房卡消耗
        'key':'cost',
        'values':"res/ui/GameHallUI/card.png",
        'title':'房卡：',     // 标题
        'text':'',
    },

    24:{
        'id':24,
        'type': 2, // 复选框
        'key':'prepare',
        'values':[
            {'key':'hand_prepare','txt':'手动准备开局','val':[1,0]}
        ],
        'title':'', // 标题
        'text':'手动准备开局',
    },

    25:{
        'id':25,
        'type': 2, // 多选一
        'values':[
            {'key':'king_num','txt':'带混','val':[0,1]},
            {'key':'win_mode','state':1,'txt':'硬八张','val':[0,1]},
        ],
        'title':'玩法：', // 标题
        'text':'拐三角财神',
    },

    26:{
        'id':26,
        'type': 2, // 多选一
        'values':[
            {'key':'king_num','state':1,'txt':'带混','val':[0,1]},
            {'key':'win_mode','txt':'硬八张','val':[0,1]},
        ],
        'title':'玩法：', // 标题
        'text':'拐三角财神',
    },

    27:{
        'id':27,
        'type': 2,
        'key': 'dealer',//panel名
        'parallel': 1, //是平行线
        'values':[
            {'key':'add_dealer','txt':'连庄','val':[0,1]},
            {'key':'base_score','txt':'带庄','val':[0,1]},
        ],
        'title':'',
        'text':'拐三角财神',
    },

    28:{
        'id':28,
        'type': 2,
        'values':[
            {'key':'add_dealer','state':1,'txt':'连庄','val':[0,1]},
            {'key':'base_score','txt':'带庄','val':[0,1]},
        ],
        'title':'',
        'text':'拐三角财神',
    },

    29:{
        'id':29,
        'type': 2,
        'values':[
            {'key':'base_score','state':1,'txt':'带庄','val':[0,1]},
            {'key':'add_dealer','state':1,'txt':'连庄','val':[0,1]},
        ],
        'title':'',
        'text':'拐三角财神',
    },

    30:{
        'id':30,
        'type': 4, // 创建按钮
        'key':'tips_label',
        'values':'注：房卡在开始游戏后扣除，提前解散房间不扣房卡',
        'title':'',
        'text':'底部的提示信息',
    },

    31:{
        'id':31,
        'type': 2, // 复选框
        'key':'stand_four',
        'values':[
            {'key':'stand_four','txt':'立四','val':[0,1]},
        ],
        'title':'玩法：',     // 标题
        'text':'晋中',
    },

    32:{
        'id':32,
        'type':5, // 多选一
        'key':'base_score',
        'src':{
            'left_btn_normal':"res/ui/Default/base_score_left_btn_normal.png",
            'left_btn_select':"res/ui/Default/base_score_left_btn_select.png",
            'right_btn_normal':"res/ui/Default/base_score_right_btn_normal.png",
            'right_btn_select':"res/ui/Default/base_score_right_btn_select.png",
            'base_printed':"res/ui/Default/base_score_printed.png",
        },
        'values':{
            0:1,
            1:2,
            2:3,
            3:4,
            4:5,
            5:10,
            6:20,
            7:50,
        },
        'title':'倍数：', // 标题
        'text':'晋中底分',
    },

    33:{
        'id':33,
        'type':1, // 多选一
        'reset':1, //是否需要重新刷新界面
        'key':'base_score',
        'values':{
            1:'1分',
            2:'2分',
            5:'5分',
        },
        'title':'底分：', // 标题
        'text':'大同乱刮风底分',
    },

    34:{
        'id':34,
        'type': 2, // 复选框
        // 'h_size':2, //每行最多个数
        'values':[
            {'key':'seven_pair','txt':'七对','val':[0,1]},
            {'key':'kong_mode','txt':'杠算分','val':[0,1]},
        ],
        'title':'玩法：',     // 标题
        'text':'大同乱刮风玩法',
    },

    35:{
        'id':35,
        'type': 2,
        'key': 'dtlgf_mode',//panel名
        'parallel': 1, //是平行线
        'values':[
            {'key':'game_mode','txt':'只能自摸胡','val':[0,1]},
            {'key':'score_mode','txt':'防作弊玩法','val':[0,1]},
        ],
        'title':'',
        'text':'大同乱刮风玩法',
    },

	36:{
		'id':36,
		'type': 1, // 多选一
		'reset':1,
		'key': 'game_mode',
		'values':{
			'01' : '特殊牌型',
			'00' : '普通玩法',
			'02' : '捉耗子',
		},
		'title':'玩法：', // 标题
		'text':'吕梁扣点点玩法',
	},

	37:{
		'id':37,
		'type': 1, // 多选一
		'key': 'king_mode',
		'values':{
			0 : '风耗子',
			1 : '单耗子',
			2 : '双耗子',
		},
		'title':'', // 标题
		'text':'吕梁扣点点耗子',
	},

	38:{
		'id':38,
		'type': 2, // 复选框
        'h_size':3,
		'premise':1,
		'values':[
			{'key':'seven_pair','txt':'七小对','val':[0,1]},
			{'key':'mouse_general','txt':'耗子吊将','val':[0,1],'premise':1},
			{'key':'mouse_general_onetwo','txt':'耗子吊将12能胡','val':[0,1],'premise':2},
			{'key':'ting_mouse','txt':'可以单听耗子','val':[0,1]},
			// {'key':'reward','txt':'赏金','val':[0,1]},
			{'key':'ekong_is_dwin','txt':'明杠杠开算自摸','val':[0,1]},
			{'key':'bao_kong','txt':'点杠不包杠','val':[0,1]},
			{'key':'repeat_kong','txt':'回手杠','val':[0,1]},
			{'key':'add_dealer','txt':'加庄','val':[0,1]},
		],
		'title':'',     // 标题
		'text':'吕梁扣点点玩法',
	},

	39:{
		'id':39,
		'type': 2, // 复选框
		'h_size':2,
		'values':[
			{'key':'ekong_is_dwin','txt':'明杠杠开算自摸','val':[0,1]},
			{'key':'bao_kong','txt':'点杠不包杠','val':[0,1]},
			{'key':'repeat_kong','txt':'回手杠','val':[0,1]},
			{'key':'add_dealer','txt':'加庄','val':[0,1]},
		],
		'title':'',     // 标题
		'text':'吕梁扣点点玩法',
	},

    40:{
        'id':40,
        'type':5,
        'key':'base_score',
        'src':{
            'left_btn_normal':"res/ui/Default/base_score_left_btn_normal.png",
            'left_btn_select':"res/ui/Default/base_score_left_btn_select.png",
            'right_btn_normal':"res/ui/Default/base_score_right_btn_normal.png",
            'right_btn_select':"res/ui/Default/base_score_right_btn_select.png",
            'base_printed':"res/ui/Default/base_score_printed.png",
        },
        'values':{
            0:1,
            1:2,
            2:5,
        },
        'title':'倍数：', // 标题
        'text':'灵石底分',
    },
	41:{
		'id':41,
		'type':5,
		'key':'base_score',
		'src':{
			'left_btn_normal':"res/ui/Default/base_score_left_btn_normal.png",
			'left_btn_select':"res/ui/Default/base_score_left_btn_select.png",
			'right_btn_normal':"res/ui/Default/base_score_right_btn_normal.png",
			'right_btn_select':"res/ui/Default/base_score_right_btn_select.png",
			'base_printed':"res/ui/Default/base_score_printed.png",
		},
		'values':{
			0:1,
			1:2,
			2:5,
		},
		'title':'倍数：', // 标题
		'text':'灵石编龙倍数',
	},

	42:{
		'id':42,
		'type':5, // 多选一
		'key':'base_score',
		'src':{
			'left_btn_normal':"res/ui/Default/base_score_left_btn_normal.png",
			'left_btn_select':"res/ui/Default/base_score_left_btn_select.png",
			'right_btn_normal':"res/ui/Default/base_score_right_btn_normal.png",
			'right_btn_select':"res/ui/Default/base_score_right_btn_select.png",
			'base_printed':"res/ui/Default/base_score_printed.png",
		},
		'values':{
			0:1,
			1:2,
			// 2:3,
			// 3:4,
			2:5,
			// 5:10,
			// 6:20,
			// 7:50,
		},
		'title':'倍数：', // 标题
		'text':'吕梁扣点点倍数',
	},

    43:{
        'id':43,
        'type': 2, // 复选框
        'values':[
            {'key':'play_mode','txt':'扣底翻倍','val':[0,1]},
            {'key':'sig_double','txt':'单打翻倍','val':[0,1]},
			{'key':'bottom_level','txt':'抠底加级','val':[0,1]},
        ],
        'title':'玩法：',
        'text':'打七玩法',
    },

    44:{
        'id':44,
        'type':1, // 多选一
        'key':'max_level',
        'values':{
            3:'3级封顶',
            5:'5级封顶',
        },
        'title':'封顶：',
        'text':'封顶',
    },

    45:{
        'id':45,
        'type':5,
        'key':'mul_level',
        'src':{
            'left_btn_normal':"res/ui/Default/base_score_left_btn_normal.png",
            'left_btn_select':"res/ui/Default/base_score_left_btn_select.png",
            'right_btn_normal':"res/ui/Default/base_score_right_btn_normal.png",
            'right_btn_select':"res/ui/Default/base_score_right_btn_select.png",
            'base_printed':"res/ui/Default/base_score_printed.png",
        },
        'values':{
            0:1,
            1:2,
            2:5,
        },
        'title':'倍数：', // 标题
        'text':'打七底分',
    },

	46:{
		'id':3,
		'type':1, // 多选一
		'reset':1,
		'key':'game_round',
		'values':{
			4:'4局(2房卡)',
			6:'6局(3房卡)',
			8:'8局(4房卡)',
		},
		'title':'局数：', // 标题
		'text':'局数',
	},

	47:{
		'id':47,
		'type': 2, // 复选框
		'h_size':2,
		'values':[
			{'key':'special_mul','txt':'特殊牌型翻倍','val':[0,1]},
			{'key':'ekong_is_dwin','txt':'明杠杠开算自摸','val':[0,1]},
			{'key':'bao_kong','txt':'点杠不包杠','val':[0,1]},
			{'key':'repeat_kong','txt':'回手杠','val':[0,1]},
			{'key':'add_dealer','txt':'加庄','val':[0,1]},
		],
		'title':'',     // 标题
		'text':'扣点点玩法',
	},

	48:{
		'id':48,
		'type': 2, // 复选框
		'h_size':2,
		'values':[
			{'key':'special_mul','txt':'特殊牌型翻倍','val':[0,1]},
			{'key':'ekong_is_dwin','txt':'明杠杠开算自摸','val':[0,1]},
			{'key':'bao_kong','txt':'点杠不包杠','val':[0,1]},
			{'key':'repeat_kong','txt':'回手杠','val':[0,1]},
			{'key':'add_dealer','txt':'加庄','val':[0,1]},
		],
		'title':'',     // 标题
		'text':'吕梁扣点点玩法',
	},

	49:{
		'id':49,
		'type':1, // 多选一
		'reset':1,
		'key':'game_round',
		'values':{
			4:'4局(1房卡)',
			6:'6局(1房卡)',
			8:'8局(1房卡)',
		},
		'title':'局数：', // 标题
		'text':'局数',
	},

	54:{
		'id':54,
		'type':1, // 多选一
		'key':'player_num',
		'reset':1,
		'values':{
			2:'2人',
			3:'3人',
			4:'4人',
		},
		'title':'人数：', // 标题
		'text':'人数',
	},

	61:{
		'id':3,
		'type':1, // 多选一
		'reset':1,
		'key':'game_round',
		'values':{
			4:'4局(1房卡)',
			8:'8局(2房卡)',
			12:'12局(3房卡)',
		},
		'title':'局数：', // 标题
		'text':'局数',
	},

	62:{
		'id':62,
		'type': 1, // 多选一
		'reset':1,
		'key': 'game_mode',
		'values':{
			'01' : '特殊牌型',
			'02' : '耗子玩法',
		},
		'title':'玩法：', // 标题
		'text':'缺一门玩法',
	},

	63:{
		'id':63,
		'type': 2, // 复选框
		'h_size':2,
		'values':[
			{'key':'need_ting','txt':'报听','val':[0,1]},
			{'key':'add_dealer','txt':'带庄','val':[0,1]},
			{'key':'guo_hu','txt':'过胡只能自摸','val':[0,1]},
			{'key':'san_hua','txt':'三花不算杠','val':[0,1]},
			{'key':'shisan_yao','txt':'十三幺','val':[0,1]},
		],
		'title':'',     // 标题
		'text':'缺一门特殊玩法',
	},

	64:{
		'id':64,
		'type': 2, // 复选框
		'h_size':2,
		'values':[
			{'key':'need_ting','txt':'报听','val':[0,1]},
			{'key':'add_dealer','txt':'带庄','val':[0,1]},
			{'key':'guo_hu','txt':'过胡只能自摸','val':[0,1]},
			{'key':'san_hua','txt':'三花不算杠','val':[0,1]},
		],
		'title':'',     // 标题
		'text':'缺一门耗子玩法',
	},

    68:{
        'id':68,
        'type':5, // 多选一
        'key':'mul_score',
        'src':{
            'left_btn_normal':"res/ui/Default/base_score_left_btn_normal.png",
            'left_btn_select':"res/ui/Default/base_score_left_btn_select.png",
            'right_btn_normal':"res/ui/Default/base_score_right_btn_normal.png",
            'right_btn_select':"res/ui/Default/base_score_right_btn_select.png",
            'base_printed':"res/ui/Default/base_score_printed.png",
        },
        'values':{
            0:1,
            1:2,
            2:3,
            3:4,
            4:5,
        },
        'title':'底分倍数', // 标题
        'text':'斗地主倍数',
    },

	70:{
		'id':68,
		'type': 2, // 复选框
		'values':[
			{'key':'is_emotion','txt':'禁用表情','val':[0,1]},
		],
		'title':'高级：',     // 标题
		'text':'高级',
	},

};