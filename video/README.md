# LavaMoat explainer video

A ~2.5 minute animated explainer for [LavaMoat](https://github.com/LavaMoat/LavaMoat),
built with [Remotion](https://remotion.dev). The narrative and visual style follow the
[Devcon 6 talk](https://github.com/kumavis/talk-lavamoat-devcon6-2022)
("The Attacker is Inside") — same palette, lava-wave title, icons, and
event-stream headline screenshots.

## Story beats

1. **Title** — LavaMoat: javascript supplychain security
2. **Your app, on npm** — a few deps explode into 1,000+ transitive packages
3. **2018 event-stream incident** — malicious code shipped inside the Copay wallet
4. **Attack surface** — install (lifecycle scripts) → build (tooling) → runtime
5. **Why JS is easy to attack #1** — everything is mutable (`Array.prototype.map = ...`)
6. **#2 — ambient authority** — any package can `fetch(process.env)` unnoticed
7. **The foundation** — Hardened JavaScript (SES): `lockdown()` + `Compartment`
8. **How LavaMoat works** — every package in its own compartment, enforced by an
   auto-generated `policy.json`
9. **Adopt incrementally** — `@lavamoat/allow-scripts`, `lavamoat-node`, bundler plugins
10. **Outro** — battle-tested at MetaMask; github.com/LavaMoat/LavaMoat

## Rendering

```sh
npm install
npm run render          # writes out/lavamoat-explainer.mp4
npm run studio          # live-preview / edit the composition
```

Scene durations are driven by the narration audio: `src/timing.json` maps each
scene to its clip length and is checked in along with the generated audio, so
rendering works out of the box.

## Regenerating narration / music

Narration is synthesized locally with [Piper TTS](https://github.com/OHF-Voice/piper1-gpl)
(voice: `en_US-lessac-medium`), and the ambient music bed is procedurally
generated. To tweak the script (edit text in `scripts/build-narration.mjs`):

```sh
pip install piper-tts
python3 -m piper.download_voices en_US-lessac-medium   # run inside voices/
npm run narration       # rebuilds public/audio/*.mp3 + src/timing.json
npm run music           # rebuilds public/audio/music.mp3
```

`ffmpeg` is required (audio encoding + duration probing).

## Credits

- Logo, icons, and headline screenshots from the
  [talk-lavamoat-devcon6-2022](https://github.com/kumavis/talk-lavamoat-devcon6-2022) deck
- Example code and policy snippets from the talk and the
  [LavaMoat README](https://github.com/LavaMoat/LavaMoat)
