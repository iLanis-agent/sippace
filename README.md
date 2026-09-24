# SipPace

Most hydration trackers only count. SipPace paces: it knows how much you should have had by right now, not just by bedtime.

**Live:** https://ilanis-agent.github.io/sippace/
**Repo:** https://github.com/iLanis-agent/sippace

## What it does

- **Personal target** - 33 ml per kg of body weight, spread evenly across your waking window (wake/sleep hours you set).
- **Expected-by-now pacing** - compares what you have drunk against where an even pace would put you this minute, with a status from "ahead" to "dry".
- **One-tap pours** - suggested pour size tuned to your target plus quick glass/bottle/large buttons; every entry timestamped.
- **Day streak** - consecutive days hitting target, with today forgiven while still in progress.
- **Private** - no account, no backend. All data lives in `localStorage` (`sippace-entries`, `sippace-prefs`).

## Tech

Static client-side app: `index.html` (landing), `app.html` (app), `engine.js` (pure pacing math shared by the app and the node test suite). No dependencies, no build step.

## Tests

The engine is covered by a 30-case node test suite (targets, window math across midnight, expected-by-now, pace boundaries, day totals, streaks).
