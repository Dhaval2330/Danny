import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { C, SANS, SERIF } from "./theme";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export const useSec = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** 0→1 progress between a and b seconds (scene-local), eased. */
export const prog = (t: number, a: number, b: number, ease = EASE) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const Reveal: React.FC<{
  at: number;
  dur?: number;
  y?: number;
  blur?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, dur = 0.9, y = 24, blur = true, style, children }) => {
  const t = useSec();
  const p = prog(t, at, at + dur);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * y}px)`,
        filter: blur ? `blur(${(1 - p) * 8}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Gold rule that draws from left to right. */
export const Rule: React.FC<{ at: number; width: number; color?: string; dur?: number; style?: React.CSSProperties }> = ({
  at,
  width,
  color = C.gold,
  dur = 1.1,
  style,
}) => {
  const t = useSec();
  return <div style={{ height: 1.5, width: width * prog(t, at, at + dur), background: color, ...style }} />;
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.gold,
  size = 22,
  style,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: size * 0.32,
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Headline: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.ivory,
  size = 76,
  style,
}) => (
  <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: size, lineHeight: 1.12, color, ...style }}>{children}</div>
);

export const Body: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.muted,
  size = 28,
  style,
}) => (
  <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: size, lineHeight: 1.45, color, ...style }}>{children}</div>
);

export const money = (v: number) => "$" + Math.round(v).toLocaleString("en-US");

/** Number that counts up and lands exactly on `to`. */
export const Counter: React.FC<{
  at: number;
  to: number;
  dur?: number;
  format: (v: number) => string;
  style?: React.CSSProperties;
}> = ({ at, to, dur = 1.6, format, style }) => {
  const t = useSec();
  const p = prog(t, at, at + dur, Easing.out(Easing.cubic));
  const v = p >= 1 ? to : to * p;
  const o = prog(t, at - 0.1, at + 0.4);
  const s = 0.94 + 0.06 * prog(t, at, at + 1.2);
  return (
    <span style={{ display: "inline-block", opacity: o, transform: `scale(${s})`, transformOrigin: "left bottom", ...style }}>
      {format(v)}
    </span>
  );
};

/** Full-frame AI clip with slow push and optional darkening. */
export const Clip: React.FC<{ n: number; rate?: number; dim?: number; zoom?: [number, number]; durSec: number }> = ({
  n,
  rate = 1,
  dim = 0,
  zoom = [1.04, 1.12],
  durSec,
}) => {
  const t = useSec();
  const z = interpolate(t, [0, durSec], zoom, { extrapolateRight: "clamp" });
  // Never run past the end of the 5 s source clip.
  const r = Math.min(rate, 4.95 / durSec);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <Video src={staticFile(`clip${n}.mp4`)} muted playbackRate={r} objectFit="cover" style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      {dim > 0 ? <AbsoluteFill style={{ background: C.ink, opacity: dim }} /> : null}
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/** Bottom-left brand footer + page-style marker, as on every slide of the deck. */
export const Footer: React.FC<{ dark?: boolean }> = ({ dark = true }) => (
  <div
    style={{
      position: "absolute",
      left: 128,
      bottom: 62,
      fontFamily: SANS,
      fontSize: 18,
      letterSpacing: 6,
      color: dark ? "#8C8476" : "#6E675B",
    }}
  >
    FLASH MATCH INTERNATIONAL
  </div>
);

/** Wraps a scene: crossfades in over `fade` seconds, slight scale settle. */
export const SceneIn: React.FC<{ fade?: number; children: React.ReactNode; bg?: string }> = ({ fade = 0.6, children, bg }) => {
  const t = useSec();
  const p = prog(t, 0, fade, Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill style={{ opacity: p, background: bg }}>
      <AbsoluteFill style={{ transform: `scale(${1.015 - 0.015 * prog(t, 0, 1.4)})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const At: React.FC<{ from: number; dur: number; children: React.ReactNode }> = ({ from, dur, children }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(from * fps)} durationInFrames={Math.max(1, Math.round(dur * fps))}>
      {children}
    </Sequence>
  );
};
