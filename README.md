<div align="center">

<img src="public/banner.svg" alt="Scale Training — guitar fretboard visualization" width="100%" />

<br/>

**A visual guitar fretboard tool for learning scales, intervals, and box patterns.**

Type notes or intervals in a simple text syntax. See them instantly on an interactive fretboard.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue?logo=typescript)](https://www.typescriptlang.org)

</div>

---

## 🎯 How it works

Write notes or intervals in the editor and the fretboard updates in real time.

**🎵 Notes mode** — just list the notes:
```
C E G Bb
```

**🔢 Intervals mode** — set a root, then list intervals:
```
root: A
1 b3 4 5 b7
```

The fretboard shows every occurrence of those notes across the neck, with optional labels (note names, intervals, or none) and root highlighting.

## ✨ Features

- 🎹 **Two input modes** — absolute notes or intervals over a root
- 🏷️ **Toggleable labels** — show note names, interval numbers, or clean dots
- 🎯 **Root highlighting** — visually distinguish the tonic in red
- 📦 **Box patterns** — auto-generated positional patterns (2 or 3 notes per string)
- 🔎 **Adjustable fret range** — focus on any region of the neck
- 📋 **Copy to clipboard** — one click to copy the fretboard as an image

## 🚀 Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Input syntax

| Input | Mode | Result |
|---|---|---|
| `C E G` | Notes | C major triad on the fretboard |
| `root: G`<br>`1 b3 5 b7` | Intervals | G minor 7 arpeggio |
| `root: A`<br>`1 2 3 5 6` | Intervals | A major pentatonic scale |
| `root: E`<br>`1 b3 4 5 b7` | Intervals | E minor pentatonic scale |

**Supported intervals:** `1` `b2` `2` `b3` `3` `4` `b5` `5` `#5` `6` `b7` `7`

**Accepted note formats:** sharps (`C#`, `F#`) and flats (`Db`, `Bb`, `Eb`)

## 🛠 Built with

React · TypeScript · Tailwind CSS · shadcn/ui

## 📄 License

[MIT](LICENSE)
