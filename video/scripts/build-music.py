#!/usr/bin/env python3
"""Generates a quiet ambient synth pad (public/audio/music.wav) for the video bed."""
import wave
import struct
import math
import os
import subprocess

SR = 44100
CHORD_SEC = 9.0
# i-VI-III-VII in E minor, voiced low and sparse
PROGRESSION = [
    ["E2", "B2", "E3", "G3"],
    ["C2", "G2", "C3", "E3"],
    ["G2", "D3", "G3", "B3"],
    ["D2", "A2", "D3", "F#3"],
]
TOTAL_SEC = 152.0

NOTE_INDEX = {n: i for i, n in enumerate(
    ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def freq(note):
    name, octave = note[:-1], int(note[-1])
    semis = NOTE_INDEX[name] + (octave + 1) * 12 - 69  # A4 = 440
    return 440.0 * (2 ** (semis / 12))


def pad_tone(f, n_samples, sr, phase, detune_cents):
    f = f * (2 ** (detune_cents / 1200))
    out = []
    attack = int(2.2 * sr)
    release = int(2.8 * sr)
    for i in range(n_samples):
        t = i / sr
        env = min(1.0, i / attack) * min(1.0, (n_samples - i) / release)
        vib = 1.0 + 0.0015 * math.sin(2 * math.pi * 0.18 * t + phase)
        w = (math.sin(2 * math.pi * f * vib * t + phase)
             + 0.35 * math.sin(2 * math.pi * 2 * f * vib * t + phase * 1.7)
             + 0.12 * math.sin(2 * math.pi * 3 * f * vib * t + phase * 2.3))
        out.append(env * w)
    return out


def main():
    n_total = int(TOTAL_SEC * SR)
    left = [0.0] * n_total
    right = [0.0] * n_total
    chord_samples = int(CHORD_SEC * SR)
    overlap = int(2.0 * SR)

    pos = 0
    ci = 0
    while pos < n_total:
        chord = PROGRESSION[ci % len(PROGRESSION)]
        n = min(chord_samples + overlap, n_total - pos)
        for vi, note in enumerate(chord):
            f = freq(note)
            phase = (ci * 1.3 + vi * 2.1) % (2 * math.pi)
            toneL = pad_tone(f, n, SR, phase, -4)
            toneR = pad_tone(f, n, SR, phase + 0.5, +4)
            gain = 0.16 / len(chord)
            for i in range(n):
                left[pos + i] += gain * toneL[i]
                right[pos + i] += gain * toneR[i]
        pos += chord_samples
        ci += 1

    # master fade in/out
    fade_in = int(3 * SR)
    fade_out = int(6 * SR)
    for i in range(fade_in):
        left[i] *= i / fade_in
        right[i] *= i / fade_in
    for i in range(fade_out):
        j = n_total - 1 - i
        left[j] *= i / fade_out
        right[j] *= i / fade_out

    out_path = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "music.wav")
    with wave.open(out_path, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for i in range(n_total):
            for ch in (left[i], right[i]):
                v = max(-1.0, min(1.0, ch))
                frames += struct.pack("<h", int(v * 32767))
        w.writeframes(bytes(frames))
    mp3_path = out_path.replace(".wav", ".mp3")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", out_path,
         "-codec:a", "libmp3lame", "-q:a", "4", mp3_path],
        check=True,
    )
    os.remove(out_path)
    print(f"wrote {mp3_path} ({TOTAL_SEC}s)")


if __name__ == "__main__":
    main()
