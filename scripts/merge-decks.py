import json, sys

TOPIC_FIELDS = ("en", "note", "el", "tr", "forms")
most_common = json.load(open(sys.argv[1]))
by_topic = json.load(open(sys.argv[2]))

key = lambda card: (card["en"], card["note"], card["el"])
topic_of = {key(card): card["topic"] for card in by_topic}
common_keys = {key(card) for card in most_common}

ranked = [
    {**card, "rank": rank, **({"topic": topic_of[key(card)]} if key(card) in topic_of else {})}
    for rank, card in enumerate(most_common, 1)
]
extras = [
    {**{field: card[field] for field in TOPIC_FIELDS}, "topic": card["topic"]}
    for card in by_topic
    if key(card) not in common_keys
]
json.dump(ranked + extras, sys.stdout, ensure_ascii=False, indent=1)
