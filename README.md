# Greek Word of the Day

A mobile-first static site that shows one of the 1000 most common Greek words each day.
Tap the card to flip from English to Greek (with transliteration and word forms), use ‹ › or swipe to browse other days, and tap **Hear it** for pronunciation (browser speech synthesis).

- Every calendar day maps to a card through a fixed shuffle, so each card appears once before any repeats (~2.4-year cycle).
- Cards that are only numerals (numbers, clock times, dates, `3%`) are left out of the rotation, leaving 880 words.
- Share a specific day with `?d=YYYY-MM-DD`.

## Develop

```sh
npm test        # node:test, no dependencies
npm run serve   # http://localhost:8000
```

## Data

`src/words.json` was extracted from Flashcardo's free
[1000 English–Greek flashcards PDF](https://flashcardo.com/cdn/printable/english/Flashcards-Single-Page-1000-English-To-Greek.pdf)
with `scripts/parse-pdf.py` (needs `pdftotext -bbox-layout` output). One card (`x < y`) wraps across lines in the PDF and was fixed by hand.
