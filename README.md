# Greek Word of the Day

A mobile-first static site that shows a new Greek word each day: the 1000 most common words plus extra topic vocabulary (1,565 cards).
Tap the card to flip from English to Greek (with transliteration and word forms), use ‹ › or swipe to browse other days, and tap **Hear it** for pronunciation (browser speech synthesis).

- Every calendar day maps to a card through a fixed shuffle, so each card appears once before any repeats.
- Cards that are only numerals (numbers, clock times, dates, `3%`) are left out of the rotation, leaving about 1,400 words (roughly a 3.9-year cycle).
- Share a specific day with `?d=YYYY-MM-DD`.

## Develop

```sh
npm test        # node:test, no dependencies
npm run serve   # http://localhost:8000
```

## Data

`src/words.json` was extracted from Flashcardo's free [Greek flashcards](https://flashcardo.com/greek-flashcards/):
the [1000 most common words PDF](https://flashcardo.com/cdn/printable/english/Flashcards-Single-Page-1000-English-To-Greek.pdf)
(cards carry `rank`) and the [by-topic PDF](https://flashcardo.com/cdn/printable/english/Flashcards-Single-Page-Topics-English-To-Greek.pdf)
(cards carry `topic`; 565 words not in the top 1000 are appended after the ranked cards).

- `scripts/parse-pdf.py` reads `pdftotext -bbox-layout` output into cards.
- `scripts/merge-decks.py most-common.json by-topic.json > src/words.json` combines them.
- Two cards wrap across lines in the PDFs and were fixed by hand: `x < y` and `cloudy`.
- The PDFs return an error to `curl` unless you pass a browser User-Agent (`-A "Mozilla/5.0"`).
