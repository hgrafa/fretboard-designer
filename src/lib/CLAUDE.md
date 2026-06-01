# Lib — Utilities & Persistence

## Files
- `utils.ts` — shadcn `cn()` class-name helper. Leave as the shadcn default.
- `tuningStorage.ts` — load/save the tuning to localStorage (`fretboard.tuning`). Validates shape on load and falls back to the default instrument on anything invalid.

## Conventions
- Persisted tuning is `NoteName[]` (pitch classes). Octaves are NOT persisted — they're derived in `core/pitch.ts`.
- Storage access is wrapped in try/catch (private mode / quota).

## What NOT to do
- Don't widen the stored schema to include octaves or spelling — keep it pitch-class only.
- This is a one-off, not a generic persistence framework; if a second persisted concern appears, that's when to generalize (currently out of scope).
