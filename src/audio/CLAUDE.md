# Audio — Web Audio Engine

Browser audio (Web Audio API). This is the **only** place `AudioContext`, oscillators,
and device routing live. Kept out of `core/` (which stays pure music theory, no DOM).

## Modules

### metronomeMath.ts
- Pure timing math, no Web Audio: `beatInterval`, `isAccent`, `nextBeat`, `clampBpm` (+ `MIN_BPM`/`MAX_BPM`).
- Fully unit-tested (`metronomeMath.test.ts`). Put any new tempo/beat logic here so it stays testable.

### metronome.ts
- `Metronome` class — look-ahead scheduler (coarse `setInterval` schedules precise clicks ahead of the audio clock; tempo stays steady despite timer jitter). See https://web.dev/articles/audio-scheduling.
- Synthesized clicks (oscillator + gain envelope); accent = higher pitch on the downbeat.
- `start`/`stop`/`dispose`, `configure`, `setOutputDevice`, `onBeat` callback for UI flashing.
- One `AudioContext` per metronome instance; routed via `applySink`.

### devices.ts
- Output-device discovery + routing capability detection.
- `isOutputRoutingSupported` gates per-device routing (Chromium-only `setSinkId`).
- `listOutputDevices` / `revealDeviceLabels` (labels hidden until an audio permission is granted).
- `applySink` is a no-op where `setSinkId` is missing → graceful fallback to the default output.

### pitchAudio.ts
- `frequencyFromMidi` — equal-temperament MIDI→Hz (A4 = 440). Pure, tested.

### noteSequence.ts
- `buildAscendingMidis(root, notes, octave?)` — turns a note set into an ascending
  scale run of MIDI numbers, closing on the octave. Pure, tested.

### noteSynth.ts
- `NoteSynth` class — plays pitched notes (`playMidi`, `playSequence`) on its **own**
  `AudioContext`, so it can route to a different device than the metronome.
- Configurable waveform/volume/note length; short envelope to avoid clicks.

## Key invariant
Per-device routing is a **progressive enhancement**. Everything must still work (through the
system default output) when `setSinkId` is unavailable (Firefox/Safari).

Each sound source owns its **own `AudioContext`** so it can be routed independently — that's
what makes multi-output (metronome on speakers, notes on headphones) possible. Device
*discovery* is shared (`hooks/AudioDevicesContext.tsx`); device *selection* is per-source.

## Consumers
- `hooks/AudioDevicesContext.tsx` — shared device list + label-reveal, used by all sources.
- `hooks/MetronomeContext.tsx` owns a `Metronome` instance; `components/MetronomePanel.tsx` is its modal.
- `hooks/NotesAudioContext.tsx` owns a `NoteSynth`; `components/NotesPanel.tsx` is its modal.
  Clicking a fret dot (via `FretboardDiagram`'s `onSelectPosition`) plays that pitch.

## What NOT to do
- Don't add music-theory math here — that belongs in `core/`. Import pitch data from there.
- Don't assume `setSinkId` exists — always go through `devices.ts` helpers.
- Don't create a second `AudioContext` per source on the same device — share one context per device.
