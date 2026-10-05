# CLD

An animated causal loop diagram extracted from Act 04 of the motion-design reel.

## Run locally

```bash
cd create-motion-design-portfolio
npm ci
npm run dev -- --host 0.0.0.0
```

- `/` — the CLD page: four clockwise-linked variables, independently flipping cubes, and a polarity card that switches between `+` and `−`.
- `/reel` — the original five-act motion-design reel.

The diagram can be paused from the bottom control. Cube turns are randomized independently; reduced-motion preferences are respected.
