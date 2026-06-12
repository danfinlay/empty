#!/usr/bin/env node
// Generates narration audio (Piper TTS) for each scene and writes
// src/timing.json so the Remotion composition can size scenes to the audio.
//
// NOTE: piper's --sentence-silence flag is intentionally NOT used — some
// piper builds fill the inserted "silence" with uninitialized buffer memory,
// producing loud white-noise bursts between sentences.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = join(root, 'public', 'audio');
mkdirSync(audioDir, { recursive: true });

const MODEL = join(root, 'voices', 'en_GB-alba-medium.onnx');

export const scenes = [
  {
    id: 'title',
    lead: 0.4,
    tail: 0.8,
    text: "This is LavaMoat: security tools that protect JavaScript apps from supply chain attacks. Here's why you need it.",
  },
  {
    id: 'deps',
    lead: 0.5,
    tail: 0.9,
    text: "A modern JavaScript app is mostly code you didn't write. You add six dependencies; they bring along twelve hundred more. That's code from hundreds of strangers, all running with full access to your application.",
  },
  {
    id: 'incident',
    lead: 0.5,
    tail: 0.9,
    text: 'And this is not hypothetical. Twenty eighteen: the event-stream package, with millions of downloads a week, gets handed to a new maintainer. Malicious code ships inside the Copay Bitcoin wallet, and steals users’ private keys.',
  },
  {
    id: 'stages',
    lead: 0.5,
    tail: 0.9,
    text: 'A malicious package can strike anywhere in your pipeline. At install: lifecycle scripts run arbitrary code on your machine. At build: it rides inside your tooling. And at runtime: it ships in the app your users trust.',
  },
  {
    id: 'mutable',
    lead: 0.5,
    tail: 0.9,
    text: 'So why is JavaScript such an easy target? Reason one: everything is mutable. Any package can overwrite Array prototype map, and instantly, the entire app is compromised.',
  },
  {
    id: 'ambient',
    lead: 0.5,
    tail: 0.9,
    text: "Reason two: ambient authority. That innocent little string library has every power your own code has. One malicious update, and it's shipping your secrets to an evil lair, while working perfectly, so nobody notices.",
  },
  {
    id: 'hardened',
    lead: 0.5,
    tail: 0.9,
    text: "Enter LavaMoat. It's built on Hardened JavaScript. Lockdown freezes the primordials: nobody tampers with shared built-ins, ever. And Compartments give each package its own isolated globals. It touches only what you explicitly hand it.",
  },
  {
    id: 'policy',
    lead: 0.5,
    tail: 0.9,
    text: "Here's the magic. LavaMoat wraps every dependency in its own compartment, enforced by a policy: exactly which globals, which built-ins, which packages each one may access. And LavaMoat writes that policy for you. Automatically. One command.",
  },
  {
    id: 'toolkit',
    lead: 0.5,
    tail: 0.9,
    text: 'Adopt it one step at a time. Allow-scripts blocks surprise install scripts. LavaMoat Node shields your build. And bundler plugins for webpack and browserify lock down your runtime.',
  },
  {
    id: 'outro',
    lead: 0.5,
    tail: 1.6,
    text: 'Today, LavaMoat guards MetaMask in production: tens of millions of users, every single day. The attacker is already inside your dependency tree. Give them a moat. github dot com, slash LavaMoat.',
  },
];

const probeSeconds = (file) =>
  parseFloat(
    execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file,
    ]).toString(),
  );

const timing = {};
for (const scene of scenes) {
  const wav = join(audioDir, `${scene.id}.wav`);
  const mp3 = join(audioDir, `${scene.id}.mp3`);
  execFileSync('piper', ['-m', MODEL, '-f', wav, '--length-scale', '0.98'], {
    input: scene.text,
  });
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '4', mp3]);
  rmSync(wav);
  const audioSec = probeSeconds(mp3);
  timing[scene.id] = {
    audio: `audio/${scene.id}.mp3`,
    lead: scene.lead,
    audioSec,
    durationSec: Math.max(scene.lead + audioSec + scene.tail, 4),
  };
  console.log(`${scene.id.padEnd(10)} ${audioSec.toFixed(2)}s`);
}

writeFileSync(join(root, 'src', 'timing.json'), JSON.stringify(timing, null, 2));
const total = Object.values(timing).reduce((sum, t) => sum + t.durationSec, 0);
console.log(`total ≈ ${total.toFixed(1)}s`);
