#!/usr/bin/env python3
"""Generates the ambient-groove music bed (public/audio/music.mp3).

Reads src/timing.json so the track always covers the full video length.
Layers: warm synth pad, soft four-on-the-floor kick, round bass, and a
plucky arpeggio — all procedural, mixed quiet enough to sit under narration.
"""
import json
import os
import subprocess

import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
SR = 44100
BPM = 104
BEAT = 60.0 / BPM
BAR = BEAT * 4
CHORD_LEN = BAR * 2

NOTE_INDEX = {n: i for i, n in enumerate(
    ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}

# Em -> G -> D -> C, voiced low
PROGRESSION = [
    ["E2", "B2", "E3", "G3"],
    ["G2", "D3", "G3", "B3"],
    ["D2", "A2", "D3", "F#3"],
    ["C2", "G2", "C3", "E3"],
]


def freq(note: str) -> float:
    name, octave = note[:-1], int(note[-1])
    semis = NOTE_INDEX[name] + (octave + 1) * 12 - 69  # A4 = 440
    return 440.0 * (2 ** (semis / 12))


def total_seconds() -> float:
    with open(os.path.join(ROOT, "src", "timing.json")) as f:
        timing = json.load(f)
    return sum(t["durationSec"] for t in timing.values()) + 2.0


def env_fade(n, attack_s, release_s):
    e = np.ones(n)
    a = int(attack_s * SR)
    r = int(release_s * SR)
    e[:a] = np.linspace(0, 1, a)
    e[n - r:] = np.linspace(1, 0, r)
    return e


def pad_layer(t, chord_at):
    out = np.zeros((2, t.size))
    n_chords = int(np.ceil(t[-1] / CHORD_LEN)) + 1
    for ci in range(n_chords):
        start = ci * CHORD_LEN
        seg = (t >= start) & (t < start + CHORD_LEN + 1.5)
        if not seg.any():
            continue
        ts = t[seg] - start
        local = np.zeros(ts.size)
        chord = chord_at(ci)
        for vi, note in enumerate(chord):
            f = freq(note)
            ph = ci * 1.3 + vi * 2.1
            vib = 1 + 0.0015 * np.sin(2 * np.pi * 0.2 * ts + ph)
            w = (np.sin(2 * np.pi * f * vib * ts + ph)
                 + 0.4 * np.sin(2 * np.pi * 2 * f * vib * ts + ph * 1.7)
                 + 0.15 * np.sin(2 * np.pi * 3 * f * vib * ts + ph * 2.3))
            local += w / len(chord)
        att = np.minimum(1, ts / 0.9)
        rel = np.minimum(1, np.maximum(0, (CHORD_LEN + 1.5 - ts) / 1.2))
        local *= att * rel
        out[0, seg] += local
        out[1, seg] += np.roll(local, 7)  # tiny stereo decorrelation
    return out


def kick_layer(t):
    out = np.zeros(t.size)
    n_beats = int(t[-1] / BEAT) + 1
    dur = 0.11
    n = int(dur * SR)
    ts = np.arange(n) / SR
    sweep = np.sin(2 * np.pi * (95 * np.exp(-ts * 18) + 42) * ts)
    shape = sweep * np.exp(-ts * 30)
    for b in range(n_beats):
        i = int(b * BEAT * SR)
        if i + n < out.size:
            out[i:i + n] += shape
    return np.vstack([out, out])


def bass_layer(t, chord_at):
    out = np.zeros(t.size)
    n_beats = int(t[-1] / BEAT) + 1
    dur = 0.5
    n = int(dur * SR)
    ts = np.arange(n) / SR
    for b in range(n_beats):
        ci = int((b * BEAT) / CHORD_LEN)
        root = freq(chord_at(ci)[0])
        # root-root-fifth-root pattern per bar
        f = root * 1.5 if b % 4 == 2 else root
        tone = (np.sin(2 * np.pi * f * ts) + 0.3 * np.sin(2 * np.pi * 2 * f * ts))
        tone *= np.exp(-ts * 6) * np.minimum(1, ts / 0.01)
        i = int(b * BEAT * SR)
        if i + n < out.size:
            out[i:i + n] += tone
    return np.vstack([out, out])


def arp_layer(t, chord_at):
    left = np.zeros(t.size)
    right = np.zeros(t.size)
    step = BEAT / 2  # eighth notes
    n_steps = int(t[-1] / step) + 1
    dur = 0.22
    n = int(dur * SR)
    ts = np.arange(n) / SR
    decay = np.exp(-ts * 22) * np.minimum(1, ts / 0.004)
    pattern = [0, 1, 2, 3, 2, 1]  # up-down over chord tones
    for s in range(n_steps):
        ci = int((s * step) / CHORD_LEN)
        chord = chord_at(ci)
        note = chord[pattern[s % len(pattern)] % len(chord)]
        f = freq(note) * 2  # one octave up
        tone = (np.sin(2 * np.pi * f * ts) + 0.25 * np.sin(2 * np.pi * 3 * f * ts)) * decay
        i = int(s * step * SR)
        if i + n >= left.size:
            continue
        if s % 2 == 0:
            left[i:i + n] += tone * 0.9
            right[i:i + n] += tone * 0.45
        else:
            left[i:i + n] += tone * 0.45
            right[i:i + n] += tone * 0.9
    return np.vstack([left, right])


def main():
    total = total_seconds()
    t = np.arange(int(total * SR)) / SR
    chord_at = lambda ci: PROGRESSION[ci % len(PROGRESSION)]

    mix = pad_layer(t, chord_at) * 0.30
    groove_in = np.clip((t - 8.0) / 4.0, 0, 1)      # kick+bass enter ~8s
    arp_in = np.clip((t - 16.0) / 4.0, 0, 1)        # arp enters ~16s
    mix += kick_layer(t) * 0.42 * groove_in
    mix += bass_layer(t, chord_at) * 0.30 * groove_in
    mix += arp_layer(t, chord_at) * 0.16 * arp_in
    mix *= env_fade(t.size, 1.5, 6.0)

    peak = np.abs(mix).max()
    mix = mix / peak * 0.6

    out_dir = os.path.join(ROOT, "public", "audio")
    wav_path = os.path.join(out_dir, "music.wav")
    mp3_path = os.path.join(out_dir, "music.mp3")
    pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
    import wave
    with wave.open(wav_path, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", wav_path,
         "-codec:a", "libmp3lame", "-q:a", "4", mp3_path],
        check=True,
    )
    os.remove(wav_path)
    print(f"wrote {mp3_path} ({total:.1f}s, {BPM} BPM)")


if __name__ == "__main__":
    main()
