# Flash Match International — Investor Film

Storyboard and production notes. 1920×1080, 30 fps, 3:49. The 20-slide deck
`Flash_Match_MASTER_Investor_Option_B` is the source for every figure in the film.

## Look

- Deck palette: ink `#15120E`, cream `#F3EFE8`, gold `#C9A45C`, burgundy `#3A1A20` for the ask.
- Type: EB Garamond (headlines and figures) and Lato (labels in tracked caps). These
  stand in for the deck's Garamond and Gill Sans.
- Motion: slow push-ins, blur-to-sharp reveals, gold rules that draw in, and numbers
  that count up and stop on the exact figure from the deck. Scenes cross-fade
  (0.6 s). There are no flashy wipes.
- Financial scenes carry a small "FINANCIALS" badge and get the most motion: a funnel,
  a stacked revenue bar, a waterfall and scenario bars.

## Scenes

| # | Time | Slide | Picture | Voice-over (abridged) |
|---|------|-------|---------|-----------------------|
| 1 | 0:00 | — | AI clip: liquid gold in black | "Some opportunities announce themselves quietly." |
| 2 | 0:05 | 1 | Title card in a gold frame; $360,000 counts up | "Flash Match International… The raise: $360,000." |
| 3 | 0:13 | 2 | $1.56M, 84¢, 11 wks land one by one | "…even at half the sales, about seventeen weeks." |
| 4 | 0:35 | 18 | Team photo (slow push) and three name cards | "An established matchmaking family…" |
| 5 | 0:50 | 3 | AI lounge clip, then a cream wipe to pillars I/II/III | "Accomplished men pay for results. We deliver." |
| 6 | 1:09 | 4–5 | AI hands clip, then Women/Men split, then the price ladder rising | "Two funnels. One network…" |
| 7 | 1:30 | 6 | AI laptop clip, then 8-step grid; Janis and Carly cards glow | "Two human moments…" |
| 8 | 1:39 | 8–9 | NY / Ontario / Quebec cards, then AI Toronto and Montreal clips with lower-thirds | "We launch where our pricing is allowed." |
| 9 | 1:53 | 10 | AI champagne clip under go-to-market; 500 counts up | "…publicist Deborah Knight." |
| 10 | 2:06 | 11 | 500 → 1% → 35% → 1/wk, then volumes table | "Now, the numbers." |
| 11 | 2:17 | 12 | $1,560,000 counter; stacked bar of five streams; $560,000 call-out | "…before a single package is sold." |
| 12 | 2:28 | 13 | Waterfall from $1,560,000 to $1,313,400; $32,835 and $24,275 | "…thirty-two thousand, eight hundred thirty-five a week." |
| 13 | 2:43 | 14 | Scenario bars $827,906 / $1,313,400 / $1,701,788 against the $360,000 line | "…seventeen… eleven… eight." |
| 14 | 2:52 | 15 | Burgundy ask: $360,000 and the use-of-funds table | "The ask…" |
| 15 | 2:59 | 16–17 | Option A with year bars; Option B with a 33-week timeline | "Two ways to structure the return…" |
| 16 | 3:30 | 18 | AI boardroom clip; January 2027 / February 2027 / 40 weeks in | "January… February…" |
| 17 | 3:37 | 20 | Mission quote, tagline, contact; fade to black | "Real matchmakers make the match…" |

## Assets

| Asset | Source | Credits |
|-------|--------|---------|
| 8 B-roll clips (5 s, 1080p) | Higgsfield · Kling 4.0 | 130.00 |
| Music bed (240 s, instrumental) | Higgsfield · ElevenLabs Music v2.5 | 34.88 |
| Voice-over (male, "Arthur") | Higgsfield · ElevenLabs v4 Turbo | 9.45 |
| Charts, numbers, typography | Remotion (code) | 0 |
| **Total** | | **174.33** |

The team photo is the client's own, by Gabriele Di Martino, and is credited on screen.
No AI was used on the people in it.

## Checking the figures

Every on-screen figure is typed in from the deck. These were recomputed and agree:
the revenue sum, $1,313,400, 84%, $32,835 a week, 11 / ~17 / ~8 weeks, $262,700,
$24,275, ~33 weeks and the $360,000 use of funds.

Items for the client to confirm (shown exactly as in the deck unless noted):

1. Slide 11: "500 visits, 1% apply: 5 a day per side". 1% of 500 is 5 in total, not 5 per side.
2. Slide 13: Stripe ID is costed on 2,800 applicants, but slide 7 places the ID check
   after the $500 payment, which only 490 men make.
3. Slide 14: the chart has no labels. The film labels the bars Downside, Base and Upside
   and formats the values as dollars.
4. Slide 15: "New Landing page and payment system, or not." The film shows "New landing
   page and payment system".

## Build

```
cd remotion && npm install
npx remotion studio                 # preview
npx remotion render src/index.ts FlashMatch ../out/raw.mp4 --codec=h264 --crf=16
```

`tools/align.py` finds the voice-over's paragraph start times from its pauses and
writes them to `remotion/src/vo_times.json`.
