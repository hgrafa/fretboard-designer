# Project Health Pass — Design Spec

**Date:** 2026-05-31
**Branch / worktree:** `refactor-health` (based on `origin/main` @ `8631ad4`)
**Status:** Approved design, ready for implementation planning

## Goal

Make the fretboard-designer codebase healthier and AI-friendly without changing
how the site works today (with one intentional exception — see #1). The repo is
maintained primarily by Claude; a senior SWE reviews. Code and docs must be easy
for a fresh Claude session to orient in and extend safely.

This spec addresses three of the four known problems, plus a documentation pass:

- **#2** — split the monolithic "god" context.
- **#3** — collapse the duplicated fretboard SVG into one shared primitive.
- **#1** — replace the sharps-only, octave-less note model with a spelling layer
  (visible: `Db` not `C#`) and a derived octave layer (invisible foundation).
- **Docs** — an internal `CLAUDE.md` in every folder, reflecting the end state.

## Hard constraint: behavior preservation

The site must keep working exactly as it does today, with one deliberate exception:

- **#2 and #3 produce zero visible change.** Pixel-identical diagrams, identical
  state, defaults, persistence, and derivations.
- **#1 spelling is an intentional visible change** — notes are labeled with correct
  enharmonic spelling (e.g. `Db` instead of `C#`).
- **#1 octaves are invisible** — derived, never displayed, nothing consumes them yet.

The guiding invariant for #1: **pitch class stays the source of truth for all
math** (note membership, intervals, box patterns). Spelling and octave are
*additive layers* on top. `FretPosition.note` (pitch class) is never removed, so
existing tests that assert on pitch class stay valid.

## Scope

**In scope:** #2, #3, #1 (spelling + derived octaves), and the documentation pass.

**Out of scope (deferred, documented as future work):**

- **#4 box-pattern algorithm.** Changing the heuristic changes which boxes render
  = behavior change. Left as-is; only mechanically refactored if Phase 1 touches it.
- **Parser syntax expansion** (chords, tuning-in-text, comments).
- **Generalized persistence pattern.** `tuningStorage.ts` stays a one-off; a shared
  pattern is only worth it once a second piece of persisted state exists.
- **Audio playback / pitch sorting.** The octave layer is the *foundation* for these;
  the features themselves are future work.

**Verification:** existing test suite green (`pnpm test`) + type-check (`pnpm build`)
+ manual browser spot-checks. No characterization snapshots — accepted trade-off;
the implementer moves layout constants verbatim and diffs visually.

## Sequencing

Refactors first (zero risk), behavior change last (on a clean base):

```
Phase 0  Light test net for notes.ts + parser.ts
Phase 1  Shared <FretboardDiagram> primitive            (#3)
Phase 2  Split the god context                          (#2)
Phase 3a Spelling layer  (visible: Db not C#)           (#1)
Phase 3b Derived octave layer (invisible foundation)    (#1)
Phase 4  CLAUDE.md coverage for every folder            (docs)
```

One commit per phase, each green and manually verified before the next.
Each phase updates the `CLAUDE.md` of folders it touches; Phase 4 audits all of
them and fills gaps.

---

## Phase 0 — Light test net

The two untested core modules (`notes.ts`, `parser.ts`) get focused tests that
capture *current* behavior before #1 touches them. Not exhaustive — a tripwire.

- `notes.ts`: `normalizeNote` (sharp/flat/case), `transpose`, `intervalBetween`,
  `resolveInterval`, `isValidInterval`.
- `parser.ts`: notes mode, intervals mode, root handling, dedup, error cases.

Existing tests (`fretboard`, `instruments`, `tuningStorage`, `useFretboardContext`,
`smoke`) cover the rest.

---

## Phase 1 — Shared `<FretboardDiagram>` primitive (#3)

**Problem:** `Fretboard.tsx` and `BoxFretboard` (inside `BoxPatterns.tsx`)
duplicate nearly all of the SVG — layout constants (with *different* values:
`FRET_WIDTH` 80 vs 60, `STRING_SPACING` 30 vs 26), `fretX`/`stringY`/`dotX`, nut,
fret lines, strings, single/double-dot markers, fret numbers, dot rendering. Every
visual change is two edits that drift. The `const STRING_COUNT = stringCount`
aliasing trick is a symptom of pasted code.

**Solution:** one pure presentational primitive.

- **New file:** `src/components/FretboardDiagram.tsx`.
- **Props:**
  - `positions: FretPosition[]`
  - `stringCount: number`
  - fret window (`minFret`/`maxFret` to render)
  - `dimensions: FretboardDimensions` — a preset bundling every pixel value:
    fret width, string spacing, paddings, nut width, dot radius, marker radius,
    fret-number offset, and the string/fret stroke-width formulas.
  - display options: `displayMode`, `highlightRoot`, `root`, and a label resolver.
  - optional hover handlers (`onHoverPosition`) — used by the main diagram's
    tooltip; omitted by the box diagram.
- **Two dimension presets** (exported constants) reproduce today's exact values:
  - `MAIN_DIMENSIONS` — 80 / 30 / 40 / 50 / 50 / 6 / 11 / 5 / 30, string stroke
    `1 + i*0.3`, fret stroke `2`.
  - `BOX_DIMENSIONS` — 60 / 26 / 32 / 40 / 40 / 5 / 10 / 4 / 24, string stroke
    `0.8 + i*0.25`, fret stroke `1.5`.
- The nut, fret lines, strings, both marker types (incl. the double-dot guard),
  fret numbers, and dot rendering live **once** in the primitive.

**Call sites become thin wrappers:**

- `Fretboard.tsx`: pulls from context, passes `MAIN_DIMENSIONS`, owns the tooltip
  state and wires `onHoverPosition`. Tooltip stays main-only.
- `BoxFretboard` (in `BoxPatterns.tsx`): keeps its display-window math
  (`extraFrets`, `MIN_DISPLAY_FRETS`), passes `BOX_DIMENSIONS`, no hover/tooltip.

**Behavior:** every existing pixel value is preserved via the presets → diagrams
render identically. Verified by visual diff in the browser.

---

## Phase 2 — Split the god context (#2)

**Problem:** `useFretboardContext.tsx` holds everything — editor text, parse
result/error, display mode, highlight-root, fret range, notes-per-string, tuning,
instrumentId, and derived positions/boxPatterns. Any field change re-renders every
consumer, and unrelated concerns are tangled in one object.

**Solution:** focused providers composed under one `FretboardProvider`, each with
its own hook. Same state, defaults, persistence, and derivations — just partitioned.

- **`useInput()`** — `inputText`, `setInputText`, derived `noteSet`, `parseError`.
  (Parsing belongs with the input it parses.)
- **`useDisplay()`** — `displayMode`, `highlightRoot`, `fretRange`,
  `notesPerString` + setters.
- **`useInstrument()`** — `tuning`, `instrumentId`, `setInstrument`,
  `setStringTuning`, `setStringCount`, and the localStorage persistence effect.
- **`useDerived()`** — `positions`, `boxPatterns`, memoized from the inputs of the
  other three. Lives in a small provider that consumes them.

**Consumer migration:**

- `Editor` → `useInput()`
- `TuningControls` → `useInstrument()`
- `Toolbar` → `useDisplay()`
- `Fretboard` / `BoxPatterns` → `useDisplay()` + `useInput()` + `useDerived()`

The monolithic `useFretboard()` is removed. A tuning change no longer re-renders
the editor, etc. `useFretboardContext.test.tsx` is updated to the new hooks.

**Behavior:** identical state and outputs; only render granularity improves.

---

## Phase 3a — Spelling layer (#1, the visible change)

**Problem:** `NoteName` is the 12 chromatic notes as sharps only; `core/notes.ts`
normalizes everything to sharps. `Db` major renders `C#`, `F` minor renders `D#`,
etc. — wrong notation in real keys. `IntervalName` is a fixed 12-value union.

**Solution:** add a spelling layer; keep pitch class as the math identity.

**Types (`src/types/music.ts`):**

- `NoteName` stays the canonical **pitch-class** identity (sharp names). Used
  everywhere for lookup / `transpose` / `intervalBetween`. Unchanged.
- New `SpelledNote = { letter: 'A'|'B'|'C'|'D'|'E'|'F'|'G', accidental: number }`
  where accidental is `-2..+2` (𝄫, ♭, ♮, ♯, 𝄪).
- `NoteSet.notes: SpelledNote[]`, `NoteSet.root?: SpelledNote`.
- `FretPosition` gains `spelled: SpelledNote`. Existing `note: NoteName` (pitch
  class) is **kept** for math and test back-compat.

**Helpers (`core/notes.ts`):**

- `spelledToPitchClass(s: SpelledNote): NoteName`
- `formatSpelled(s: SpelledNote): string` → `"Db"`, `"F#"`, `"Bbb"`, `"Fx"`, …
- A map from each `IntervalName` to a diatonic **degree** (1–7):
  `1→1, b2→2, 2→2, b3→3, 3→3, 4→4, b5→5, 5→5, #5→5, 6→6, b7→7, 7→7`.

**Parser (`parser.ts`) — gets its tests in Phase 0:**

- **Notes mode:** parse the *typed* spelling. `Bb` → `{ letter: 'B', accidental: -1 }`,
  rendered as `Bb` (today it force-converts to `A#`). This honors the user's input.
- **Intervals mode:** the root is a `SpelledNote`; each interval carries a degree.
  Spelling = advance the root letter by `degree − 1` letters, then pick the
  accidental so the pitch class equals `rootPc + semitones`. From `root: A`,
  `1 b3 4 5 b7` → `A C D E G` — each degree on its own letter.
- Genuine same-degree scales (blues `1 b3 4 b5 5 b7` → `Gb` **and** `G`)
  legitimately share a letter. That is correct spelling, not a regression.

**Fretboard + render:**

- `mapNotesToFretboard` builds a `pitchClass → SpelledNote` map from the note set
  and stamps `spelled` on each emitted position (matched by pitch class).
- In `displayMode === 'note'`, `<FretboardDiagram>` labels with
  `formatSpelled(pos.spelled)`. Interval mode, root highlight (compared by pitch
  class), tooltip, and box patterns are unchanged.

**Behavior:** the only visible change is correct note spelling. Verified manually:
`root: Db` major shows flats; `root: A` minor pentatonic shows `A C D E G`; notes
mode preserves typed accidentals.

---

## Phase 3b — Derived octave layer (#1, invisible foundation)

**Problem:** no octaves anywhere — can't reason about pitch height, sort by pitch,
or play audio.

**Key design decision:** octaves are **derived, not stored**. This avoids a
storage-schema change, migration, and any new UI — `tuningStorage.ts` keeps
persisting `NoteName[]`, `TuningControls` keeps editing pitch classes.

- `Tuning` stays `NoteName[]` (pitch classes, low→high) — what the user edits and
  what is persisted. Unchanged.
- **New `core/pitch.ts`:**
  - `Pitch = SpelledNote & { octave: number }`
  - `assignOctaves(tuning: NoteName[], baseOctave = 2): Pitch[]` — walks low→high,
    incrementing the octave each time the pitch class wraps. Standard tunings →
    `E2 A2 D3 G3 B3 E4`.
  - `getPitchAtPosition(tuning, stringIndex, fret): Pitch`
  - A MIDI-number helper for ordering / future audio.
- Purely additive — **nothing consumes it yet**, so zero visible change.

**Honest caveat:** this is foundation-only right now; payoff (audio, pitch
sorting) is future work. The octave-wrap rule is a sensible default; exotic custom
tunings can be refined when audio is actually built.

---

## Phase 4 — `CLAUDE.md` coverage for every folder (docs)

Because Claude does most of the work and a senior SWE reviews, every folder carries
an internal `CLAUDE.md` reflecting the **post-refactor** end state. Earlier phases
update the docs they touch; Phase 4 audits all of them for consistency and fills
gaps.

**Files:**

- **Update:** repo-root `CLAUDE.md`, `src/core/CLAUDE.md`, `src/components/CLAUDE.md`.
- **Add:** `src/hooks/CLAUDE.md`, `src/types/CLAUDE.md`, `src/lib/CLAUDE.md`,
  `src/test/CLAUDE.md`, `src/components/ui/CLAUDE.md`.

**Consistent shape** for each (scaled to the folder):

1. **Purpose** — what this folder is for, one or two sentences.
2. **Key files** — each file and its responsibility.
3. **Conventions** — patterns to follow here.
4. **Gotchas** — non-obvious invariants (e.g. "pitch class is the math identity;
   spelling and octave are additive layers", "octaves are derived, not stored").
5. **What NOT to do** — e.g. "don't normalize spelling away to sharps", "don't add
   React imports to `core/`", "don't duplicate the fretboard SVG — use
   `<FretboardDiagram>`".

Docs must match the code at the end of the pass — no stale references to the god
context, the duplicated SVG, or the sharps-only model.

---

## Risks

- **`FretPosition` / `NoteSet` shape change** ripples into `fretboard.test.ts` and
  `useFretboardContext.test.tsx`. Mitigated by keeping `note: NoteName` additive
  (pitch-class assertions stay valid); spelling assertions are added alongside.
- **Light safety net.** No characterization snapshots, so Phases 1–2 rely on manual
  visual diffing. Accepted trade-off; constants are moved verbatim.
- **Octave-wrap heuristic** may mis-octave pathological custom tunings. Acceptable —
  nothing consumes octaves yet; refine when audio is built.

## Definition of done

- All phases committed, each green (`pnpm build` + `pnpm test`) and manually verified.
- Site behaves identically except correct note spelling.
- Every folder has an accurate internal `CLAUDE.md`.
- `#4`, parser-syntax expansion, generalized persistence, and audio are explicitly
  recorded as future work.
