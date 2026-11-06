import { continueRender, delayRender, staticFile } from "remotion";
import times from "./vo_times.json";

// Fonts are bundled locally (public/fonts) so rendering needs no network.
const FACES: [string, string, string, string][] = [
  ["EB Garamond", "normal", "400 800", "EBGaramond-normal-400.woff2"],
  ["EB Garamond", "italic", "400 800", "EBGaramond-italic-400.woff2"],
  ["Lato", "normal", "300", "Lato-normal-300.woff2"],
  ["Lato", "normal", "400", "Lato-normal-400.woff2"],
  ["Lato", "normal", "700", "Lato-normal-700.woff2"],
];
if (typeof document !== "undefined") {
  const handle = delayRender("fonts");
  Promise.all(
    FACES.map(([family, style, weight, file]) => {
      const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { style, weight });
      document.fonts.add(f);
      return f.load();
    }),
  ).then(() => continueRender(handle));
}

export const SERIF = "'EB Garamond', Georgia, serif";
export const SANS = "Lato, 'Helvetica Neue', Arial, sans-serif";

// Palette taken from the deck.
export const C = {
  ink: "#15120E",
  ink2: "#1E1A15",
  ink3: "#2B241B",
  cream: "#F3EFE8",
  paper: "#FAF7F1",
  ivory: "#F4EFE6",
  gold: "#C9A45C",
  goldLight: "#E3CB97",
  goldDeep: "#7A5A22",
  muted: "#A39A8A",
  mutedDark: "#5F584C",
  line: "#D9D1C3",
  burgundy: "#3A1A20",
  burgundy2: "#2B1217",
};

export const FPS = 30;
// Paragraph start times of the voice-over, in seconds (see tools/align.py).
export const T: number[] = times;
export const VO_END = 224.3;
export const TOTAL_SECONDS = 229;
