# -*- coding: utf-8 -*-
import functools
import itertools

from deuces.card import Card

TYPE_SINGLE = 0
TYPE_PAIR_JOKER = 1
TYPE_PAIR2 = 2
TYPE_PAIR3 = 3
TYPE_PAIR3_1 = 4
TYPE_PAIR3_2 = 5
TYPE_PAIR4 = 6
# TYPE_PAIR4_2 = 7
TYPE_SEQ_PAIR2 = 8
TYPE_SEQ_PAIR3 = 9
TYPE_SEQ_PAIR3_1 = 10
TYPE_SEQ_PAIR3_2 = 11
TYPE_SEQ = 12
TYPE_PAIR4_2_1 = 13
TYPE_PAIR4_2_2 = 14
TYPE_FLOWER = 15


def convert(func):
	@functools.wraps(func)
	def call_func(*args, **kwargs):
		cards_int = args[0]
		if kwargs is not None:
			if "converted" in kwargs and not kwargs["converted"]:
				cards_int = list(map(Card.get_rank_int, cards_int))
			if "sorted" in kwargs and not kwargs["sorted"]:
				cards_int = sorted(cards_int)
		return func(cards_int, **kwargs)

	return call_func


def extract_pair(ints, count):
	""" 提取数组中的对子 """
	groups = itertools.groupby(ints)
	arr = []
	for key, g in groups:
		l = len(tuple(g))
		if l >= count:
			# arr.extend([key for _ in range(0, int(l / count))])
			arr.append(key)
	return arr


def extract_pair2(ints, count):
	""" 提取数组中的对子  count == 2 ==> 1,1,1,1,2,3 ==> 1,1"""
	groups = itertools.groupby(ints)
	arr = []
	for key, g in groups:
		l = len(tuple(g))
		if l >= count:
			for _ in range(0, int(l / count)):
				arr.append(key)
	return arr


def is_seq_array(cards_int):
	length = len(cards_int)
	if length < 2:
		return False
	c0 = cards_int[0]
	index = 1
	while index < length:
		if cards_int[index] - c0 != 1:
			return False
		c0 = cards_int[index]
		index += 1
	return True


def is_single(cards_int, **kwargs):
	return len(cards_int) == 1 and cards_int[0] != Card.FLOWER, TYPE_SINGLE, cards_int[0]


def is_flower(cards_int, **kwargs):
	return len(cards_int) == 1 and cards_int[0] == Card.FLOWER, TYPE_FLOWER, cards_int[0]


def is_pair_joker(cards_int, **kwargs):
	return len(cards_int) == 2 and sum(cards_int) == Card.BIG_JOKER + Card.LITTLE_JOKER, TYPE_PAIR_JOKER, cards_int[0]


@convert
def is_pair2(cards_int, **kwargs):
	return len(cards_int) == 2 and cards_int[0] == cards_int[1], TYPE_PAIR2, cards_int[0]


@convert
def is_pair3(cards_int, **kwargs):
	return len(cards_int) == 3 and cards_int == [cards_int[0]] * 3, TYPE_PAIR3, cards_int[0]


@convert
def is_pair3_1(cards_int, **kwargs):
	if not len(cards_int) == 4 or Card.FLOWER in cards_int:
		return False, TYPE_PAIR3_1, -1
	c0 = cards_int[0]
	c2 = cards_int[3]
	is_match = cards_int.count(c0) == 3 or cards_int.count(c2) == 3
	return is_match, TYPE_PAIR3_1, -1 if not is_match else (c0 if cards_int.count(c0) == 3 else c2)


@convert
def is_pair3_2(cards_int, **kwargs):
	if not len(cards_int) == 5:
		return False, TYPE_PAIR3_2, -1
	groups = itertools.groupby(cards_int)
	has3 = False
	has2 = False
	primary = -1
	for key, g in groups:
		l = len(tuple(g))
		if l == 3:
			has3 = True
			primary = key
		elif l == 2:
			has2 = True
		else:
			return False, TYPE_PAIR3_2, -1
	return has2 and has3, TYPE_PAIR3_2, primary


@convert
def is_pair4(cards_int, **kwargs):
	return len(cards_int) == 4 and cards_int[0] == cards_int[1] == cards_int[2] == cards_int[3], TYPE_PAIR4, cards_int[0]


def is_pair4_2_x(cards_int, card_type, tail_count):
	if not len(cards_int) == 4 + tail_count * 2 or Card.FLOWER in cards_int:
		return False, card_type, -1
	groups = itertools.groupby(cards_int)
	has4 = False
	count1 = 0
	count2 = 0
	primary = -1
	for key, g in groups:
		l = len(tuple(g))
		if l == 4:
			has4 = True
			primary = key
		else:
			if l == 1:
				count1 += 1
			elif l == 2:
				count2 += 1
			else:
				return False, card_type, -1
	if tail_count == 1:
		has2 = (count1 == 2 and count2 == 0) or (count1 == 0 and count2 == 1)
	else:
		has2 = count1 == 0 and count2 == 2
	return has4 and has2, card_type, primary


@convert
def is_pair4_2_1(cards_int, **kwargs):
	return is_pair4_2_x(cards_int, TYPE_PAIR4_2_1, 1)


@convert
def is_pair4_4(cards_int, **kwargs):
	if len(cards_int) != 8:
		return False, TYPE_PAIR4_2_2, -1
	groups = itertools.groupby(cards_int)
	count = 0
	primary = 0
	for key, g in groups:
		if len(tuple(g)) == 4:
			primary = max(primary, key)
			count += 1
		else:
			return False, TYPE_PAIR4_2_2, -1
	return count == 2, TYPE_PAIR4_2_2, primary


@convert
def is_pair4_2_2(cards_int, **kwargs):
	data = is_pair4_2_x(cards_int, TYPE_PAIR4_2_2, 2)
	if data[0]:
		return data
	return is_pair4_4(cards_int, sorted=True, converted=True)


def is_seq_pair_x(cards_int, pair_count, card_type):
	length = len(cards_int)
	c0 = cards_int[0]
	c1 = cards_int[length - 1]
	if c1 - c0 == length / pair_count - 1:
		groups = itertools.groupby(cards_int)
		for key, g in groups:
			if len(tuple(g)) != pair_count:
				return False, card_type, -1, -1
		return True, card_type, c0, c1
	return False, card_type, -1, -1


@convert
def is_seq_pair2(cards_int, **kwargs):
	l = len(cards_int)
	if l % 2 != 0 or l < 6:
		return False, TYPE_SEQ_PAIR2, -1, -1
	return is_seq_pair_x(cards_int, 2, TYPE_SEQ_PAIR2)


@convert
def is_seq_pair3(cards_int, **kwargs):
	l = len(cards_int)
	if l % 3 != 0 or l < 6:
		return False, TYPE_SEQ_PAIR3, -1, -1
	return is_seq_pair_x(cards_int, 3, TYPE_SEQ_PAIR3)


def is_seq_pair3_with_any(cards_int, tail_count, card_type):
	if Card.FLOWER in cards_int:
		return False, card_type, -1, -1
	cards_len = len(cards_int)
	if cards_len % (3 + tail_count) != 0 or cards_len < (3 + tail_count) * 2:
		return False, card_type, -1, -1

	n = int(cards_len / (3 + tail_count))

	pair3_arr = extract_pair(cards_int, 3)  # sorted
	if len(pair3_arr) < n or n < 2:
		return False, card_type, -1, -1

	groups = itertools.combinations(pair3_arr, n)
	for g in groups:
		tmp = tuple(g)
		if tmp[0] != 2 and is_seq_array(tmp):
			src_copy = cards_int[:]
			for i in tmp:
				for _ in range(0, 3):
					src_copy.remove(i)
			tail_arr = extract_pair2(src_copy, tail_count)
			if len(tail_arr) == n:
				return True, card_type, tmp[0], tmp[len(tmp) - 1]
	return False, card_type, -1, -1


@convert
def is_seq_pair3_1(cards_int, **kwargs):
	return is_seq_pair3_with_any(cards_int, 1, TYPE_SEQ_PAIR3_1)


@convert
def is_seq_pair3_2(cards_int, **kwargs):
	return is_seq_pair3_with_any(cards_int, 2, TYPE_SEQ_PAIR3_2)


@convert
def is_seq(cards_int, **kwargs):
	l = len(cards_int)
	if l < 5 or cards_int[0] < 3:
		return False, TYPE_SEQ, -1, -1
	if is_seq_array(cards_int):
		return True, TYPE_SEQ, cards_int[0], cards_int[l - 1]
	return False, TYPE_SEQ, -1, -1


CARDS_PRIORITY = [
	[TYPE_SINGLE, TYPE_PAIR2, TYPE_PAIR3,
	 TYPE_PAIR3_1, TYPE_PAIR3_2, TYPE_PAIR4_2_1, TYPE_PAIR4_2_2,
	 TYPE_SEQ_PAIR2, TYPE_SEQ_PAIR3, TYPE_SEQ_PAIR3_1, TYPE_SEQ_PAIR3_2, TYPE_SEQ],
	[TYPE_FLOWER],
	[TYPE_PAIR4],
	[TYPE_PAIR_JOKER]
]

COMPARE_TYPE_FUNC_MAP = {
	TYPE_SINGLE: is_single,
	TYPE_PAIR_JOKER: is_pair_joker,
	TYPE_PAIR2: is_pair2,
	TYPE_PAIR3: is_pair3,
	TYPE_PAIR3_1: is_pair3_1,
	TYPE_PAIR3_2: is_pair3_2,
	TYPE_PAIR4: is_pair4,
	TYPE_PAIR4_2_1: is_pair4_2_1,
	TYPE_PAIR4_2_2: is_pair4_2_2,
	TYPE_SEQ_PAIR2: is_seq_pair2,
	TYPE_SEQ_PAIR3: is_seq_pair3,
	TYPE_SEQ_PAIR3_1: is_seq_pair3_1,
	TYPE_SEQ_PAIR3_2: is_seq_pair3_2,
	TYPE_SEQ: is_seq,
	TYPE_FLOWER: is_flower
}

SEQS = [TYPE_SEQ, TYPE_SEQ_PAIR2, TYPE_SEQ_PAIR3, TYPE_SEQ_PAIR3_1, TYPE_SEQ_PAIR3_2]
