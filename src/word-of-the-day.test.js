import { test } from "node:test";
import assert from "node:assert/strict";
import { cardForDate, parseDateParam, shiftDate, toDateParam } from "./word-of-the-day.js";

const makeCards = (count) =>
  Array.from({ length: count }, (_, i) => ({ en: `word ${i}`, el: `λέξη ${i}`, tr: `lexi ${i}` }));

const localDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 13, 30);
};

test("the same calendar day always shows the same card", () => {
  const cards = makeCards(1000);
  const morning = new Date(2026, 8, 24, 0, 5);
  const night = new Date(2026, 8, 24, 23, 55);
  assert.deepEqual(cardForDate({ cards, date: morning }), cardForDate({ cards, date: night }));
});

test("consecutive days show different cards", () => {
  const cards = makeCards(1000);
  const today = cardForDate({ cards, date: localDate("2026-09-24") });
  const tomorrow = cardForDate({ cards, date: localDate("2026-09-25") });
  assert.notDeepEqual(today.card, tomorrow.card);
});

test("every card is shown exactly once before any card repeats", () => {
  const cards = makeCards(1000);
  const start = localDate("2026-01-01");
  const seen = new Set(
    Array.from({ length: 1000 }, (_, i) => cardForDate({ cards, date: shiftDate({ date: start, days: i }) }).card.en),
  );
  assert.equal(seen.size, 1000);
});

test("the deck is shuffled rather than shown in source order", () => {
  const cards = makeCards(1000);
  const start = localDate("2026-01-01");
  const first = cardForDate({ cards, date: start }).number;
  const next = cardForDate({ cards, date: shiftDate({ date: start, days: 1 }) }).number;
  assert.notEqual(Math.abs(next - first), 1);
});

test("the card number is its 1-based position in the deck", () => {
  const cards = makeCards(1000);
  const { card, number } = cardForDate({ cards, date: localDate("2026-09-24") });
  assert.equal(card.en, `word ${number - 1}`);
});

test("shifting across a daylight-saving change still moves exactly one calendar day", () => {
  const beforeDst = new Date(2026, 2, 7, 23, 30);
  const next = shiftDate({ date: beforeDst, days: 1 });
  assert.equal(next.getDate(), 8);
  assert.equal(shiftDate({ date: next, days: 1 }).getDate(), 9);
});

test("a valid date parameter is parsed as a local calendar day", () => {
  const parsed = parseDateParam("2026-03-05");
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 2);
  assert.equal(parsed.getDate(), 5);
});

test("a missing or malformed date parameter yields null", () => {
  assert.equal(parseDateParam(null), null);
  assert.equal(parseDateParam("tomorrow"), null);
  assert.equal(parseDateParam("2026-02-31"), null);
});

test("a date round-trips through its shareable URL parameter", () => {
  assert.equal(toDateParam(localDate("2026-03-05")), "2026-03-05");
  assert.equal(toDateParam(parseDateParam("2027-12-31")), "2027-12-31");
});

test("cards that are only numerals, times or dates are left out of the daily rotation", () => {
  const numeric = ["48", "1,000", "2:05", "2014-01-01", "3%"].map((en) => ({ en, el: "αριθμός", tr: "arithmós" }));
  const cards = [...makeCards(10), ...numeric];
  const start = localDate("2026-01-01");
  const shown = Array.from({ length: cards.length * 2 }, (_, i) =>
    cardForDate({ cards, date: shiftDate({ date: start, days: i }) }).card.en,
  );
  assert.equal(new Set(shown).size, 10);
  assert.ok(shown.every((en) => en.startsWith("word ")));
});

test("phrases that contain a number stay in the rotation", () => {
  const cards = [{ en: "I'm 22 years old", el: "Είμαι 22 χρονών", tr: "Eímai 22 chronón" }, { en: "7", el: "επτά", tr: "eptá" }];
  assert.equal(cardForDate({ cards, date: localDate("2026-09-24") }).card.en, "I'm 22 years old");
});
