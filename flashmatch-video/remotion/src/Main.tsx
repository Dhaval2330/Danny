import React from "react";
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { C, T, TOTAL_SECONDS } from "./theme";
import { At, SceneIn } from "./ui";
import * as S from "./scenes";

const OVERLAP = 0.6;

// One scene per voice-over paragraph group: [component, start paragraph].
const PLAN: [React.FC<{ d: number }>, number][] = [
  [S.Open, 0],
  [S.Title, 1],
  [S.Glance, 2],
  [S.Team, 3],
  [S.Opportunity, 4],
  [S.Funnels, 5],
  [S.Safety, 6],
  [S.Market, 7],
  [S.GoToMarket, 8],
  [S.Assumptions, 9],
  [S.Revenue, 10],
  [S.Margins, 11],
  [S.Scenarios, 12],
  [S.Ask, 13],
  [S.Returns, 14],
  [S.Milestones, 15],
  [S.Close, 16],
];

export const Main: React.FC = () => {
  const { fps } = useVideoConfig();
  const total = TOTAL_SECONDS;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {PLAN.map(([Comp, p], i) => {
        // Scenes start slightly before the line that introduces them.
        const start = Math.max(0, T[p] - (i ? 0.35 : 0));
        const next = i + 1 < PLAN.length ? T[PLAN[i + 1][1]] - 0.35 : total;
        const d = next - start + OVERLAP;
        return (
          <At key={i} from={start} dur={d}>
            <SceneIn fade={i ? OVERLAP : 0.01}>
              <Comp d={d} />
            </SceneIn>
          </At>
        );
      })}
      <Audio src={staticFile("vo.mp3")} volume={1} />
      <Audio
        src={staticFile("music.mp3")}
        volume={(f) => {
          const s = f / fps;
          const fadeIn = interpolate(s, [0, 2], [0, 1], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(s, [total - 5, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return 0.22 * fadeIn * fadeOut;
        }}
      />
    </AbsoluteFill>
  );
};
