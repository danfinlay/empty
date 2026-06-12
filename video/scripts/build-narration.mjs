#!/usr/bin/env node
// Generates narration audio (Piper TTS) for each scene and writes
// src/timing.json so the Remotion composition can size scenes to the audio.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = join(root, 'public', 'audio');
mkdirSync(audioDir, { recursive: true });

const MODEL = join(root, 'voices', 'en_US-lessac-medium.onnx');

export const scenes = [
  {
    id: 'title',
    lead: 0.4,
    tail: 0.8,
    text: 'This is LavaMoat — a set of tools that secures JavaScript projects against software supply chain attacks.',
  },
  {
    id: 'deps',
    lead: 0.5,
    tail: 0.9,
    text: "A modern JavaScript app is mostly code you didn't write. You add a few dependencies. Those dependencies bring their own. And suddenly, you're shipping code from hundreds of strangers — every one of them running with full access to your application.",
  },
  {
    id: 'incident',
    lead: 0.5,
    tail: 0.9,
    text: "This isn't hypothetical. In 2018, the popular event-stream package was handed off to a new maintainer, who slipped in malicious code targeting the Copay Bitcoin wallet. It shipped inside an official release, and stole users' private keys.",
  },
  {
    id: 'stages',
    lead: 0.5,
    tail: 0.9,
    text: 'A malicious dependency can strike at every stage of your pipeline. At install time, through lifecycle scripts. At build time, inside your tooling. And at runtime, in the app you ship to users.',
  },
  {
    id: 'mutable',
    lead: 0.5,
    tail: 0.9,
    text: 'Why is JavaScript such an easy target? First: everything is mutable. Any package can overwrite built-ins, like Array prototype map — and the whole app is affected.',
  },
  {
    id: 'ambient',
    lead: 0.5,
    tail: 0.9,
    text: 'Second: ambient authority. That innocent string utility has the same powers as your own code. It can quietly send your secrets to an evil lair — while working normally, so nobody notices.',
  },
  {
    id: 'hardened',
    lead: 0.5,
    tail: 0.9,
    text: 'LavaMoat is built on Hardened JavaScript. Lockdown freezes the primordials, so no package can tamper with shared built-ins. And Compartments give each package its own isolated globals — it can only touch what you explicitly hand it.',
  },
  {
    id: 'policy',
    lead: 0.5,
    tail: 0.9,
    text: 'LavaMoat wraps every dependency in its own compartment, enforced by a policy that declares exactly what each package may access — which globals, which built-ins, which other packages. Best of all, LavaMoat generates the policy for you, automatically.',
  },
  {
    id: 'toolkit',
    lead: 0.5,
    tail: 0.9,
    text: 'And you can adopt it one step at a time. Allow-scripts blocks unexpected install scripts. LavaMoat Node protects your build process. And bundler plugins for webpack and browserify protect your app at runtime.',
  },
  {
    id: 'outro',
    lead: 0.5,
    tail: 1.6,
    text: 'LavaMoat runs in production at MetaMask, protecting tens of millions of users. The attacker is already inside your dependency tree — give them a moat. Get started at github dot com, slash LavaMoat.',
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
  execFileSync(
    'piper',
    ['-m', MODEL, '-f', wav, '--length-scale', '1.05', '--sentence-silence', '0.45'],
    { input: scene.text },
  );
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
