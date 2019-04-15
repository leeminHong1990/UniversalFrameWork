class Card(object):
	# the basics
	STR_RANKS = '23456789TJQKA'
	INT_RANKS = range(2, 15)
	LITTLE_JOKER = 21
	BIG_JOKER = 22
	FLOWER = 23  # 特殊牌

	# converstion from string => int
	CHAR_RANK_TO_INT_RANK = dict(zip(list(STR_RANKS), INT_RANKS))
	CHAR_SUIT_TO_INT_SUIT = {
		's': 1,  # spades
		'h': 2,  # hearts
		'd': 4,  # diamonds
		'c': 8,  # clubs
	}
	INT_SUIT_TO_CHAR_SUIT = {
		1: 's',
		2: 'h',
		4: 'd',
		8: 'c'
	}

	ALL_CARD_INT = tuple((1 << _m << 8) | _n for _m in range(0, 4) for _n in range(2, 15)) + (FLOWER, LITTLE_JOKER, BIG_JOKER)

	# for pretty printing
	PRETTY_SUITS = {
		1: u"\u2660".encode('utf-8'),  # spades
		2: u"\u2764".encode('utf-8'),  # hearts
		4: u"\u2666".encode('utf-8'),  # diamonds
		8: u"\u2663".encode('utf-8')  # clubs
	}

	@staticmethod
	def new(string):
		rank_char = string[0]  # point
		suit_char = string[1]  # color
		rank_int = Card.CHAR_RANK_TO_INT_RANK[rank_char]
		suit_int = Card.CHAR_SUIT_TO_INT_SUIT[suit_char]
		return suit_int | rank_int

	@staticmethod
	def int_to_str(card_int):
		rank_int = Card.get_rank_int(card_int)
		suit_int = Card.get_suit_int(card_int)
		return Card.STR_RANKS[rank_int] + Card.INT_SUIT_TO_CHAR_SUIT[suit_int]

	@staticmethod
	def get_rank_int(card_int):
		return card_int & 0x000000ff

	@staticmethod
	def get_suit_int(card_int):
		return (card_int & 0x0000ff00) >> 8

	@staticmethod
	def valid_card(cards_int):
		return all(c in Card.ALL_CARD_INT for c in cards_int)

	@staticmethod
	def card_compare(a, b, suit=True):
		if a == b:
			return 0

		a_rank = Card.get_rank_int(a)
		b_rank = Card.get_rank_int(b)

		a_suit = Card.get_suit_int(a)
		b_suit = Card.get_suit_int(b)

		if a_rank == 2:
			a_rank += 13
		if b_rank == 2:
			b_rank += 13
		value = a_rank - b_rank
		if value == 0 and suit:
			return a_suit - b_suit
		return value

	@staticmethod
	def hand_to_binary(card_strs):
		"""
		Expects a list of cards as strings and returns a list
		of integers of same length corresponding to those strings.
		"""
		bhand = []
		for c in card_strs:
			bhand.append(Card.new(c))
		return bhand

	@staticmethod
	def int_to_pretty_str(card_int):
		"""
		Prints a single card
		"""
		if card_int == Card.LITTLE_JOKER or card_int == Card.BIG_JOKER:
			return " [ {} ] ".format(card_int)
		# suit and rank
		suit_int = Card.get_suit_int(card_int)
		rank_int = Card.get_rank_int(card_int)

		s = Card.PRETTY_SUITS[suit_int]
		r = Card.STR_RANKS[rank_int - 2]

		return " [ " + r + " " + s.decode("utf-8") + " ] "

	@staticmethod
	def print_pretty_cards(card_ints):
		"""
		Expects a list of cards in integer form.
		"""
		output = " "
		for i in range(len(card_ints)):
			c = card_ints[i]
			if i != len(card_ints) - 1:
				output += Card.int_to_pretty_str(c) + ","
			else:
				output += Card.int_to_pretty_str(c) + " "
		print(output)
