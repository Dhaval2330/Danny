"""Synthesizes the 20 s soundtrack for the DANNY intro (no samples, no AI).

120 BPM, F minor. Timeline is shared with scene.js:
  0-4   intro drone, glitch blips, reverse cymbal
  4-6   letter hits D A N N on each beat
  6-8   Y hit, snare roll + riser, pre-drop silence at 7.75
  8-16  drop: kick / clap / hats / 808, phonk cowbell from 12
  16-18 stutter breakdown
  18-20 final impact + tail
"""
import sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(7)


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def note(name):
    names = {"C": 0, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "Gb": 6,
             "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
    pitch, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + names[pitch]
    return 440.0 * 2 ** ((midi - 69) / 12)


def lp(x, fc, order=2):
    b, a = signal.butter(order, min(fc, SR / 2 - 100) / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def place(buf, snd, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(snd))
    buf[i:j] += snd[: j - i] * gain


def to_stereo(x, width=0.0):
    return np.stack([x, x], axis=1)


# ---------- instruments ----------

def kick(d=0.45, f0=160, f1=42, punch=1.0):
    t = t_arr(d)
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7)
    click = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 300) * 0.4
    return np.tanh((body + click * punch) * 1.6)


def sub808(freq, d=1.0, glide_to=None):
    t = t_arr(d)
    f = np.full_like(t, freq)
    if glide_to:
        f = freq + (glide_to - freq) * np.clip((t - d * 0.4) / (d * 0.5), 0, 1)
    f = f * (1 + 0.6 * np.exp(-t * 40))  # punchy pitch drop on attack
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.exp(-t * 2.2) * np.clip(t * 400, 0, 1)
    env[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return np.tanh(np.sin(ph) * env * 2.2) * 0.9


def clap(d=0.35):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    env = np.zeros_like(t)
    for k, off in enumerate([0, 0.011, 0.022]):
        env += np.exp(-np.clip(t - off, 0, None) * 120) * (t >= off) * (0.8 if k < 2 else 1)
    env += np.exp(-t * 18) * 0.35
    snd = bp(n, 900, 5000) * env
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4
    return np.tanh((snd + tone) * 1.4)


def snare(d=0.18, pitch=1.0):
    t = t_arr(d)
    n = bp(rng.standard_normal(len(t)), 1500 * pitch, min(9000, 8000 * pitch)) * np.exp(-t * 35)
    tone = np.sin(2 * np.pi * 220 * pitch * t) * np.exp(-t * 40)
    return n * 0.9 + tone * 0.5


def hat(d=0.05, open_=False):
    d = 0.25 if open_ else d
    t = t_arr(d)
    n = hp(rng.standard_normal(len(t)), 7000, 4)
    return n * np.exp(-t * (14 if open_ else 90)) * 0.6


def cowbell(freq, d=0.22):
    t = t_arr(d)
    a = signal.square(2 * np.pi * freq * t)
    b = signal.square(2 * np.pi * freq * 1.48 * t)
    x = bp((a + b) * 0.5, freq * 0.8, freq * 4)
    env = np.exp(-t * 16) * np.clip(t * 2000, 0, 1)
    return np.tanh(x * env * 2.5) * 0.55


def impact(d=3.0, size=1.0):
    t = t_arr(d)
    f = 30 + 90 * np.exp(-t * 12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    crash = lp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 3.5) * 0.45
    hiss = hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 1.2) * 0.12
    return np.tanh((boom * 1.4 + crash + hiss) * size)


def riser(d, f0=200, f1=4000):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    # sweep a band-pass by filtering blocks
    out = np.zeros_like(n)
    blk = 2048
    for i in range(0, len(n), blk):
        p = i / len(n)
        c = f0 * (f1 / f0) ** p
        seg = n[max(0, i - 512): i + blk]
        y = bp(seg, c * 0.7, min(c * 1.6, SR / 2 - 200))
        out[i:i + blk] = y[-len(n[i:i + blk]):]
    sweep_f = 80 * (16 ** (t / d))
    tone = signal.sawtooth(2 * np.pi * np.cumsum(sweep_f) / SR) * 0.15
    env = (t / d) ** 2.2
    return (out * 1.2 + lp(tone, 3000)) * env


def reverse_cymbal(d):
    t = t_arr(d)
    n = hp(rng.standard_normal(len(t)), 3000)
    return n * (t / d) ** 3 * 0.5


def whoosh(d=0.5):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    env = np.sin(np.pi * t / d) ** 2
    return bp(n, 400, 3000) * env * 0.5


def blip(freq=1800, d=0.04):
    t = t_arr(d)
    x = signal.square(2 * np.pi * freq * t) * np.exp(-t * 60)
    return np.round(x * 4) / 4 * 0.25  # bitcrushed


def pad(d, freqs, cutoff_from=300, cutoff_to=1600):
    t = t_arr(d)
    x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.13):
            x += signal.sawtooth(2 * np.pi * f * (1 + det / 100 * 3) * t + rng.random() * 6)
    x /= len(freqs) * 3
    out = np.zeros_like(x)
    blk = 4096
    for i in range(0, len(x), blk):
        p = i / len(x)
        c = cutoff_from * (cutoff_to / cutoff_from) ** p
        seg = x[max(0, i - 1024): i + blk]
        y = lp(seg, c)
        out[i:i + blk] = y[-len(x[i:i + blk]):]
    env = np.clip(t / 0.8, 0, 1) * np.clip((d - t) / 0.5, 0, 1)
    return out * env


def reverb_ir(d=1.8, decay=3.2):
    t = t_arr(d)
    ir = rng.standard_normal(len(t)) * np.exp(-t * decay)
    ir = lp(ir, 5000)
    return ir / np.sqrt(np.sum(ir ** 2))


def convolve(x, ir):
    return signal.fftconvolve(x, ir)[: len(x)]


# ---------- arrangement ----------

drums = np.zeros(N)
bass = np.zeros(N)
fx = np.zeros(N)
music = np.zeros(N)
verb_send = np.zeros(N)

F1, Ab1, Db2, C2 = note("F1"), note("Ab1"), note("Db2"), note("C2")

# A: intro 0-4
music += np.pad(pad(4.3, [note("F2"), note("C3"), note("Ab3")], 150, 900), (0, N))[:N] * 0.35
place(bass, sub808(F1, 3.8), 0.0, 0.25)
for at, f in [(0.6, 1900), (1.4, 2400), (1.45, 1200), (2.2, 3100), (2.9, 1600),
              (3.3, 2800), (3.35, 2200), (3.4, 1500), (3.6, 3600), (3.62, 900)]:
    place(fx, blip(f), at, 1.0)
for k in range(8):  # ticking 8th hats, getting louder
    place(drums, hat(), 2.0 + k * 0.25, 0.25 + k * 0.08)
place(fx, reverse_cymbal(2.0), 2.0, 0.8)

# B: letter hits 4-6 (D A N N) and C: Y at 6
letter_hits = [4.0, 4.5, 5.0, 5.5, 6.0]
letter_notes = [F1, F1, Ab1, Db2, F1]
for i, at in enumerate(letter_hits):
    big = i == 4
    place(drums, kick(0.5, 170, 45), at, 1.0)
    place(drums, snare(0.25, 0.8), at, 0.5)
    place(fx, impact(0.9 if not big else 1.6, 0.8), at, 0.45 if not big else 0.7)
    place(bass, sub808(letter_notes[i], 0.48), at, 0.7)
    place(verb_send, snare(0.25, 0.8), at, 0.6)
    if i < 4:
        place(fx, whoosh(0.35), at + 0.15, 0.6)

# C: snare roll + riser 6.5-7.75
roll = []
roll += [6.5 + k * 0.125 for k in range(4)]
roll += [7.0 + k * 0.0625 for k in range(8)]
roll += [7.5 + k * 0.03125 for k in range(8)]
for k, at in enumerate(roll):
    p = k / len(roll)
    place(drums, snare(0.12, 0.9 + p * 0.8), at, 0.25 + p * 0.6)
place(fx, riser(1.75, 200, 7000), 6.0, 0.9)
place(music, pad(1.75, [note("F3"), note("C4"), note("F4")], 300, 5000), 6.0, 0.25)
place(fx, reverse_cymbal(0.22), 7.78, 0.9)  # suck-in before the drop

# D: drop 8-16 (and its grid reused for the 16-18 breakdown)
place(fx, impact(3.5, 1.2), 8.0, 1.0)
place(verb_send, impact(1.0, 1.0), 8.0, 0.5)
music_drop = pad(10.0, [note("F2"), note("Ab2"), note("C3"), note("Eb3")], 500, 1400)
place(music, music_drop, 8.0, 0.22)

bass_pattern = [  # (offset in 2-bar phrase, freq, length, glide)
    (0.0, F1, 0.7, None), (0.75, F1, 0.7, None), (1.5, Ab1, 0.5, None),
    (2.0, Db2, 0.7, None), (2.75, Db2, 0.7, None), (3.5, C2, 0.5, F1),
]
for bar in range(5):  # 8-18
    b0 = 8.0 + bar * 2.0
    for off in (0.0, 0.75, 1.5):
        place(drums, kick(), b0 + off, 0.95)
    place(drums, clap(), b0 + 1.0, 0.75)
    place(verb_send, clap(), b0 + 1.0, 0.5)
    for k in range(16):
        at = b0 + k * 0.125
        acc = 0.55 if k % 2 == 0 else 0.3
        place(drums, hat(), at, acc)
    if bar % 2 == 1:  # hat roll before next bar
        for k in range(6):
            place(drums, hat(0.03), b0 + 1.75 + k * 0.04167, 0.35)
    else:
        place(drums, hat(open_=True), b0 + 1.375, 0.35)
for phrase in range(3):
    p0 = 8.0 + phrase * 4.0
    for off, f, ln, gl in bass_pattern:
        if p0 + off < 18.0:
            place(bass, sub808(f, ln, gl), p0 + off, 0.85)

# phonk cowbell melody 12-16 (and through breakdown)
mel = {
    0: "F5", 3: "Ab5", 6: "C6", 8: "Bb5", 10: "Ab5", 12: "G5", 14: "F5",
    16: "Db6", 19: "C6", 22: "Ab5", 24: "F5", 26: "Ab5", 28: "C6", 30: "Eb6",
}
for rep in range(3):
    for step, nm in mel.items():
        at = 12.0 + rep * 4.0 + step * 0.125
        if at < 18.0:
            place(music, cowbell(note(nm)), at, 0.5)
            place(verb_send, cowbell(note(nm)), at, 0.25)

# ---------- mix ----------

# sidechain: duck pad + music on kicks during the drop
kick_times = [8.0 + b * 2 + o for b in range(5) for o in (0.0, 0.75, 1.5)]
duck = np.ones(N)
for kt in kick_times:
    i = int(kt * SR)
    ln = int(0.25 * SR)
    j = min(N, i + ln)
    duck[i:j] = np.minimum(duck[i:j], 0.35 + 0.65 * np.linspace(0, 1, j - i) ** 1.5)
music *= duck

wet = convolve(verb_send, reverb_ir())
mix = drums * 0.9 + bass * 0.8 + fx * 0.75 + music * 0.9 + wet * 0.35

# E: stutter breakdown 16-18 — re-chop the 16.0-16.5 slice
src = mix[int(16.0 * SR): int(16.5 * SR)].copy()
seg_plan = [(16.0, 0.25)] * 4 + [(17.0, 0.125)] * 4 + [(17.5, 0.0625)] * 6
pos = 16.0
for _, ln in seg_plan:
    chunk = src[: int(ln * SR)].copy()
    fade = min(len(chunk), 200)
    chunk[-fade:] *= np.linspace(1, 0, fade)
    i = int(pos * SR)
    mix[i:i + len(chunk)] = chunk
    pos += ln
mix[int(17.875 * SR): int(18.0 * SR)] = 0.0
# low-pass sweep across the breakdown (closing then opening)
b_start, b_end = int(16.0 * SR), int(17.875 * SR)
seg = mix[b_start:b_end]
out = np.zeros_like(seg)
blk = 2048
for i in range(0, len(seg), blk):
    p = i / len(seg)
    c = 8000 * (1 - p) ** 2 + 400
    s = seg[max(0, i - 512): i + blk]
    y = lp(s, c)
    out[i:i + blk] = y[-len(seg[i:i + blk]):]
mix[b_start:b_end] = out * 0.85
place(mix, riser(1.8, 300, 8000) * 0.45, 16.0)
place(mix, reverse_cymbal(0.3), 17.6, 0.6)

# F: final 18-20
place(mix, impact(2.0, 1.4), 18.0, 1.1)
place(mix, kick(0.6, 180, 40), 18.0, 1.0)
place(mix, sub808(F1, 2.0, note("F0")), 18.0, 0.9)
place(mix, convolve(np.pad(clap(), (0, SR)), reverb_ir(2.0, 2.0)), 18.0, 0.5)
place(mix, pad(2.0, [note("F3"), note("Ab3"), note("C4")], 1500, 300), 18.0, 0.25)
for at, f in [(19.2, 2600), (19.25, 1300), (19.3, 3400), (19.33, 800), (19.4, 2100)]:
    place(mix, blip(f), at, 1.2)

# master
mix = hp(mix, 25)
mix /= np.percentile(np.abs(mix), 99.9)
mix = np.tanh(mix * 0.9)
mix /= np.max(np.abs(mix)) / 0.89
fade_in = int(0.05 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)
fade_out = int(0.6 * SR)
mix[-fade_out:] *= np.linspace(1, 0, fade_out) ** 2

# light stereo widening via short delay on one side for hats/fx feel
left = mix
right = np.concatenate([np.zeros(int(0.0004 * SR)), mix])[:N]
stereo = np.stack([left, 0.85 * right + 0.15 * left], axis=1)
out_path = sys.argv[1] if len(sys.argv) > 1 else "music.wav"
wavfile.write(out_path, SR, (stereo * 32767).astype(np.int16))
print("wrote", out_path)
