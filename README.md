# คู่มือสอบพระอภิธรรม 2/2569 · Abhidhamma Exam Guide

**Live:** https://drtinkooo.github.io/abhidhamma-exam-2569/

This is an unofficial, bilingual (Thai/English), mobile-first web app. Students use it to find their exam seat, room and schedule for the Abhidhamma Jotika College exams on 20–22 Nov 2026 (B.E. 2569).

Source: the official announcement page (https://sites.google.com/a/mcu.ac.th/abhidham/สอบพระอภิธรรมภาค22569) and its five embedded Drive files. All seating data comes from `ผู้มีสิทธิ์สอบ6902.xlsx`, copied here as `tools/exam-6902-source.xlsx`.

## Run locally
```
python -m http.server 8765        # then open http://127.0.0.1:8765
```
The app is a plain static site with no build step. A service worker caches the app for offline use at the venue.

## Deployment
GitHub Pages serves the `main` branch root of `drtinkooo/abhidhamma-exam-2569`; `.nojekyll` makes Pages serve files as-is. All paths are relative, so the site works under the `/abhidhamma-exam-2569/` sub-path. To publish a change, commit and push to `main`. If you changed the data or any cached file, bump `VERSION` in `sw.js` first so returning visitors get the new copy.

## Rebuild the data (if the college publishes a new list)
```
python tools/build_data.py path/to/new.xlsx   # writes data/exam-data.json
```
After rebuilding, bump `VERSION` in `sw.js` so installed copies refresh.

## Files
- `index.html`, `styles.css`, `app.js`: the UI. The timetable and all Thai/English text live in `app.js`.
- `data/exam-data.json`: 3,697 list entries (775 central and 2,922 across 47 branch centres), plus rooms, centres and data-quality flags.
- `tools/build_data.py`: converts the workbook to JSON. It holds the English centre names and the per-centre map queries.

## Source-data quirks the app handles
- At the central campus, Cūḷa-Do and Cūḷa-Eka are listed only as "ตึก มจร" with no room, so the app shows "room not listed".
- Wat Phutthabucha has the building and room columns swapped. The build script normalises them.
- 10 entries list the same person (same ID and name) at two venues. These are flagged so the student confirms with their centre.
- 63 entries share a student ID with a different name, which is probably a typo in the source. These are flagged too.
- The lists hold 3,697 entries, but the statistics sheet totals 3,691. Wat Tha Ma O lists 35 people while the statistics show 29.
