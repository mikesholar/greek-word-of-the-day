import { cardCaption, cardForDate, parseDateParam, shiftDate, toDateParam } from "./word-of-the-day.js";

const LONG_TEXT_LENGTH = 14;
const SWIPE_THRESHOLD_PX = 50;

const $ = (id) => document.getElementById(id);

const startOfToday = () => shiftDate({ date: new Date(), days: 0 });

const isSameDay = (a, b) => toDateParam(a) === toDateParam(b);

const formatDate = (date) =>
  date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

const greekVoice = () =>
  "speechSynthesis" in window
    ? speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("el"))
    : undefined;

const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "el-GR";
  utterance.rate = 0.85;
  utterance.voice = greekVoice() ?? null;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

const render = ({ cards, date }) => {
  const { card } = cardForDate({ cards, date });
  const today = startOfToday();

  $("date").textContent = formatDate(date);
  $("day-kind").textContent = isSameDay(date, today) ? "Today" : date < today ? "Past word" : "Coming up";
  $("date").dateTime = toDateParam(date);
  $("today").hidden = isSameDay(date, today);

  $("en").textContent = card.en;
  $("en").classList.toggle("long", card.en.length > LONG_TEXT_LENGTH);
  $("note").textContent = card.note;
  $("el").textContent = card.el;
  $("el").classList.toggle("long", card.el.length > LONG_TEXT_LENGTH);
  $("tr").textContent = card.tr;
  $("forms").textContent = card.forms;
  $("count").textContent = cardCaption(card);
  $("topic").textContent = card.topic ?? "";
  $("card").classList.remove("flipped");
  $("card").setAttribute("aria-label", `${card.en}. Tap to reveal the Greek.`);
  $("speak").hidden = !("speechSynthesis" in window);
  $("speak").dataset.text = card.el;

  const url = isSameDay(date, today) ? location.pathname : `?d=${toDateParam(date)}`;
  history.replaceState(null, "", url);
};

const start = async () => {
  const cards = await fetch(new URL("./words.json", import.meta.url)).then((res) => res.json());
  const state = { date: parseDateParam(new URLSearchParams(location.search).get("d")) ?? startOfToday() };

  const goTo = (date) => {
    state.date = date;
    render({ cards, date });
  };
  const step = (days) => goTo(shiftDate({ date: state.date, days }));

  $("prev").addEventListener("click", () => step(-1));
  $("next").addEventListener("click", () => step(1));
  $("today").addEventListener("click", () => goTo(startOfToday()));
  $("speak").addEventListener("click", () => speak($("speak").dataset.text));
  $("card").addEventListener("click", () => {
    const flipped = $("card").classList.toggle("flipped");
    $("card").setAttribute(
      "aria-label",
      flipped ? `${$("el").textContent}, ${$("tr").textContent}` : `${$("en").textContent}. Tap to reveal the Greek.`,
    );
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });

  const touch = { x: 0 };
  document.addEventListener("touchstart", (event) => (touch.x = event.touches[0].clientX), { passive: true });
  document.addEventListener("touchend", (event) => {
    const dx = event.changedTouches[0].clientX - touch.x;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) step(dx < 0 ? 1 : -1);
  });

  render({ cards, date: state.date });
};

start();
