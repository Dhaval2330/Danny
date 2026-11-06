import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, TOTAL_SECONDS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition id="FlashMatch" component={Main} durationInFrames={TOTAL_SECONDS * FPS} fps={FPS} width={1920} height={1080} />
);
