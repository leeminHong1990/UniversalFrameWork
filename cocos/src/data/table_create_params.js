var table_create_params = {
	1: {
		'game_type': 1009,
		'is_show': 1,
		'name': 'ddz',
		'create_sort': 1,
		'init': {
			'flower_mode': 0,
			'game_mode': 0,
			'game_round': 8,
			'hand_prepare': 1,
			'max_boom_times': 3,
			'op_seconds': 0,
			'pay_mode': 1,
			'player_num': 3,
			'room_type': 1,
			'mul_mode': 0,
			'dealer_joker': 0,
			'dealer_42': 0,
			'mul_score': 1,
			'only3_1': 0,
			'is_emotion': 0,
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [1, 5, 68, 9, 10, 11], // 房主支付
						2: [2, 5, 68, 9, 10, 11], // AA支付
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [1, 6, 68, 9, 10, 11], // 房主支付
						2: [2, 6, 68, 9, 10, 11], // AA支付
					}
				}
			}
		}
	},
	2: {
		'game_type': 1012,
		'is_show': 1,
		'name': 'tdhmj',
		'create_sort': 4,
		'init': {
			'add_dealer': 0,
			'add_winds': 1,
			'bao_hu': 1,
			'game_mode': 1,
			'game_round': 8,
			'hand_prepare': 1,
			'king_mode': 0,
			'kong_follow_win': 0,
			'multiplayer_win': 0,
			'need_ting': 1,
			'lack_door': 0,
			'pay_mode': 1,
			'room_type': 1,
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [3, 7, 12, 13], // 房主支付
						2: [4, 7, 12, 13], // AA支付
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [3, 8, 12, 13], // 房主支付
						2: [4, 8, 12, 13], // AA支付
					}
				}
			}
		}
	},
	3: {
		'game_type': 1004,
		'is_show': 1,
		'name': 'tykddmj',
		'create_sort': 2,
		'init': {
			'player_num': 4,
			'ekong_is_dwin': 1,
			'special_mul': 0,
			'seven_pair': 1,
			'mouse_general': 1,
			'mouse_general_onetwo': 0,
			'ting_mouse': 0,
			'bao_kong': 0,
			'repeat_kong': 0,
			'add_dealer': 0,
			'game_mode': 1,
			'game_round': 8,
			'hand_prepare': 1,
			'king_mode': 0,
			'pay_mode': 1,
			'reward': 0,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: {  // 房主支付
							'game_mode': {
								0: {
									'player_num': {
										2: [61, 7, 54, 15, 18],
										3: [3, 7, 54, 15, 18],
										4: [3, 7, 54, 15, 18],
									}
								},
								1: {
									'player_num': {
										2: [61, 7, 54, 15, 47],
										3: [3, 7, 54, 15, 47],
										4: [3, 7, 54, 15, 47],
									}
								},
								2: {
									'player_num': {
										2: [61, 7, 54, 15, 16, 17],
										3: [3, 7, 54, 15, 16, 17],
										4: [3, 7, 54, 15, 16, 17],
									}
								}
							}
						},
						2: {  // AA支付
							'game_mode': {
								0: [4, 7, 54, 15, 18],
								1: [4, 7, 54, 15, 47],
								2: [4, 7, 54, 15, 16, 17]
							}
						}
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: {  // 房主支付
							'game_mode': {
								0: {
									'player_num': {
										2: [61, 8, 54, 15, 18],
										3: [3, 8, 54, 15, 18],
										4: [3, 8, 54, 15, 18],
									}
								},
								1: {
									'player_num': {
										2: [61, 8, 54, 15, 47],
										3: [3, 8, 54, 15, 47],
										4: [3, 8, 54, 15, 47],
									}
								},
								2: {
									'player_num': {
										2: [61, 8, 54, 15, 16, 17],
										3: [3, 8, 54, 15, 16, 17],
										4: [3, 8, 54, 15, 16, 17],
									}
								}
							}
						},
						2: {  // AA支付
							'game_mode': {
								0: [4, 8, 54, 15, 18],
								1: [4, 8, 54, 15, 47],
								2: [4, 8, 54, 15, 16, 17]
							}
						}
					}
				}
			}
		}
	},
	4: {
		'game_type': 1005,
		'is_show': 1,
		'name': 'tylsmj',
		'create_sort': 6,
		'init': {
			'game_round': 8,
			'hand_prepare': 1,
			'play_list': [1, 0],
			"same_suit_mode": 1,
			"same_suit_loong": 0,
			'pay_mode': 1,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [3, 7, 19],
						2: [4, 7, 19]
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [3, 8, 19],
						2: [4, 8, 19]
					}
				}
			}
		}
	},
	5: {
		'game_type': 1011,
		'is_show': 1,
		'name': 'gsjmj',
		'create_sort': 8,
		'init': {
			'base_score': 1,
			'game_max_lose': 9999,
			'game_mode': 0,
			'game_round': 8,
			'hand_prepare': 1,
			'job_mode': 0,
			'king_num': 0,
			'pay_mode': 1,
			'room_type': 1,
			'suit_mode': 2,
			'win_mode': 1,
			'add_dealer': 1,
			'base_score': 0,
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [3, 7, 20, 21, 27],
						2: [4, 7, 20, 21, 27]
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [3, 8, 20, 21, 27],
						2: [4, 8, 20, 21, 27]
					}
				}
			}
		}
	},
	6: {
		'game_type': 1013,
		'is_show': 1,
		'name': 'jzmj',
		'create_sort': 7,
		'init': {
			'game_round': 8,
			'hand_prepare': 1,
			'base_score': 1,
			'stand_four': 0,
			'pay_mode': 1,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [3, 7, 32, 31],
						2: [4, 7, 32, 31]
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [3, 8, 32, 31],
						2: [4, 8, 32, 31]
					}
				}
			}
		}
	},
	7: {
		'game_type': 1014,
		'is_show': 0,
		'name': 'jzgsjmj',
		'create_sort': 7,
		'init': {
			'game_round': 8,
			'hand_prepare': 1,
			'base_score': 1,
			'pay_mode': 1,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [3, 7, 32],
						2: [4, 7, 32]
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [3, 8, 32],
						2: [4, 8, 32]
					}
				}
			}
		}
	},
	8: {
		'game_type': 1015,
		'is_show': 0,
		'name': 'dtlgfmj',
		'create_sort': 9,
		'init': {
			'game_mode': 0,
			'game_round': 8,
			'score_mode': 1,
			'seven_pair': 1,
			'base_score': 1,
			'kong_mode': 1,
			'hand_prepare': 1,
			'pay_mode': 1,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [3, 7, 33, 34, 35],
						2: [4, 7, 33, 34, 35]
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [3, 8, 33, 34, 35],
						2: [4, 8, 33, 34, 35]
					}
				}
			}
		}
	},
	9: {
		'game_type': 1016,
		'is_show': 1,
		'name': 'llkddmj',
		'create_sort': 3,
		'init': {
			'player_num': 4,
			'ekong_is_dwin': 1,
			'special_mul': 0,
			'seven_pair': 1,
			'mouse_general': 1,
			'mouse_general_onetwo': 0,
			'ting_mouse': 0,
			'bao_kong': 0,
			'repeat_kong': 0,
			'add_dealer': 0,
			'base_score': 1,
			'game_mode': 2,
			'game_round': 8,
			'hand_prepare': 1,
			'king_mode': 0,
			'pay_mode': 1,
			'reward': 0,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: {  // 房主支付
							'game_mode': {
								0: {
									'player_num': {
										2: [61, 7, 54, 42, 36, 39],
										3: [3, 7, 54, 42, 36, 39],
										4: [3, 7, 54, 42, 36, 39],
									}
								},
								1: {
									'player_num': {
										2: [61, 7, 54, 42, 36, 48],
										3: [3, 7, 54, 42, 36, 48],
										4: [3, 7, 54, 42, 36, 48],
									}
								},
								2: {
									'player_num': {
										2: [61, 7, 54, 42, 36, 37, 38],
										3: [3, 7, 54, 42, 36, 37, 38],
										4: [3, 7, 54, 42, 36, 37, 38]
									}
								}
							}
						},
						2: {  // AA支付
							'game_mode': {
								0: [4, 7, 54, 42, 36, 39],
								1: [4, 7, 54, 42, 36, 48],
								2: [4, 7, 54, 42, 36, 37, 38]
							}
						}
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: {  // 房主支付
							'game_mode': {
								0: {
									'player_num': {
										2: [61, 8, 54, 42, 36, 39],
										3: [3, 8, 54, 42, 36, 39],
										4: [3, 8, 54, 42, 36, 39],
									}
								},
								1: {
									'player_num': {
										2: [61, 8, 54, 42, 36, 48],
										3: [3, 8, 54, 42, 36, 48],
										4: [3, 8, 54, 42, 36, 48],
									}
								},
								2: {
									'player_num': {
										2: [61, 8, 54, 42, 36, 37, 38],
										3: [3, 8, 54, 42, 36, 37, 38],
										4: [3, 8, 54, 42, 36, 37, 38]
									}
								}
							}
						},
						2: {  // AA支付
							'game_mode': {
								0: [4, 8, 54, 42, 36, 39],
								1: [4, 8, 54, 42, 36, 48],
								2: [4, 8, 54, 42, 36, 37, 38]
							}
						}
					}
				}
			}
		}
	},
	10: {
		'game_type': 1017,
		'is_show': 1,
		'name': 'll7',
		'create_sort': 5,
		'init': {
			'player_num': 5,
			'op_seconds': 0,
			'game_round': 6,
			'play_mode': 1,
			'sig_double': 1,
			'max_level': 3,
			'mul_level': 1,
			'bottom_level': 0,
			'hand_prepare': 1,
			'pay_mode': 1,
			'is_emotion': 0,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [46, 7, 45, 43, 44, 70],
						2: [49, 7, 45, 43, 44, 70]
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [46, 8, 45, 43, 44, 70],
						2: [49, 8, 45, 43, 44, 70]
					}
				}
			}
		}
	},
	11: {
		'game_type': 1018,
		'is_show': 1,
		'name': 'lsbmzmj',
		'create_sort': 10,
		'init': {
			'game_round': 8,
			'hand_prepare': 1,
			'base_score': 1,
			'pay_mode': 1,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [3, 7, 40],
						2: [4, 7, 40]
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [3, 8, 40],
						2: [4, 8, 40]
					}
				}
			}
		}
	},
	12: {
		'game_type': 1019,
		'is_show': 1,
		'name': 'lsblmj',
		'create_sort': 9,
		'init': {
			'game_round': 8,
			'hand_prepare': 1,
			'base_score': 1,
			'stand_four': 0,
			'pay_mode': 1,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: [3, 7, 41],
						2: [4, 7, 41]
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: [3, 8, 41],
						2: [4, 8, 41]
					}
				}
			}
		}
	},
	13: {
		'game_type': 1023,
		'is_show': 1,
		'name': 'fyqymmj',
		'create_sort': 3,
		'init': {
			'player_num': 4,
			'need_ting': 1,
			'add_dealer': 0,
			'guo_hu': 0,
			'san_hua': 0,
			'shisan_yao': 0,
			'game_mode': 1,
			'base_score': 1,
			'game_round': 8,
			'hand_prepare': 1,
			'pay_mode': 1,
			'room_type': 1
		},
		'create': {
			'room_type': {
				1: { // 普通开房
					'pay_mode': {
						1: {  // 房主支付
							'game_mode': {
								1: {
									'player_num': {
										2: [61, 7, 54, 42, 62, 63],
										3: [3, 7, 54, 42, 62, 63],
										4: [3, 7, 54, 42, 62, 63],
									}
								},
								2: {
									'player_num': {
										2: [61, 7, 54, 42, 62, 64],
										3: [3, 7, 54, 42, 62, 64],
										4: [3, 7, 54, 42, 62, 64],
									}
								}
							}
						},
						2: {  // AA支付
							'game_mode': {
								1: [4, 7, 54, 42, 62, 63],
								2: [4, 7, 54, 42, 62, 64]
							}
						}
					}
				},
				2: { // 亲友圈开房
					'pay_mode': {
						3: {  // 房主支付
							'game_mode': {
								1: {
									'player_num': {
										2: [61, 8, 54, 42, 62, 63],
										3: [3, 8, 54, 42, 62, 63],
										4: [3, 8, 54, 42, 62, 63],
									}
								},
								2: {
									'player_num': {
										2: [61, 8, 54, 42, 62, 64],
										3: [3, 8, 54, 42, 62, 64],
										4: [3, 8, 54, 42, 62, 64],
									}
								}
							}
						},
						2: {  // AA支付
							'game_mode': {
								1: [4, 8, 54, 42, 62, 63],
								2: [4, 8, 54, 42, 62, 64]
							}
						}
					}
				}
			}
		}
	},
};
