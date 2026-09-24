const MS_PER_DAY = 86_400_000;
const SHUFFLE_SEED = 0x9e3779b9;

const hashIndex = (index) => {
  const a = Math.imul((index ^ SHUFFLE_SEED) >>> 0, 0x85ebca6b);
  const b = Math.imul(a ^ (a >>> 13), 0xc2b2ae35);
  return (b ^ (b >>> 16)) >>> 0;
};

const shuffledOrder = (count) =>
  Array.from({ length: count }, (_, index) => ({ index, key: hashIndex(index) }))
    .sort((left, right) => left.key - right.key)
    .map(({ index }) => index);

const calendarDayNumber = (date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);

const positiveModulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

const isNumeralOnly = (card) => !/\p{L}/u.test(card.en);

export const cardForDate = ({ cards, date }) => {
  const rotation = cards.map((card, index) => ({ card, number: index + 1 })).filter(({ card }) => !isNumeralOnly(card));
  const order = shuffledOrder(rotation.length);
  return rotation[order[positiveModulo(calendarDayNumber(date), rotation.length)]];
};

export const shiftDate = ({ date, days }) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);

export const parseDateParam = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

export const toDateParam = (date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, i) => String(part).padStart(i === 0 ? 4 : 2, "0"))
    .join("-");
