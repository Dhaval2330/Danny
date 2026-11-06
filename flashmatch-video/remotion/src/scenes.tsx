import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { C, SANS, SERIF } from "./theme";
import { At, Body, Clip, Counter, Eyebrow, Footer, Headline, money, prog, Reveal, Rule, useSec, Vignette } from "./ui";

type S = { d: number };
const PAD = 128;

/* ---------- 0 · Cold open ---------- */
export const Open: React.FC<S> = ({ d }) => {
  const t = useSec();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: prog(t, 0, 1.6) }}>
        <Clip n={1} rate={0.85} durSec={d} zoom={[1.0, 1.1]} dim={0.15} />
      </AbsoluteFill>
      <Vignette strength={0.7} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
        <Reveal at={0.6} dur={1.4}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: C.ivory, letterSpacing: 0.5 }}>
            Some opportunities announce themselves quietly.
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 1 · Title (slide 1) ---------- */
export const Title: React.FC<S> = ({ d }) => {
  const t = useSec();
  const frame = prog(t, 0.2, 1.6);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ opacity: 0.28 }}>
        <Clip n={1} rate={0.6} durSec={d} zoom={[1.12, 1.2]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${C.ink} 30%, rgba(21,18,14,0.6) 100%)` }} />
      <div
        style={{
          position: "absolute",
          inset: 64,
          border: `1px solid rgba(201,164,92,${0.45 * frame})`,
          transform: `scale(${1.02 - 0.02 * frame})`,
        }}
      />
      <div style={{ position: "absolute", left: 160, top: 220 }}>
        <Reveal at={0.2}>
          <Eyebrow size={22}>Investor Presentation · February 2027 Launch</Eyebrow>
        </Reveal>
        <Reveal at={0.5} dur={1.2} y={40}>
          <div style={{ fontFamily: SERIF, fontSize: 170, color: C.ivory, lineHeight: 1, marginTop: 50 }}>Flash Match</div>
        </Reveal>
        <Reveal at={1.0} dur={1.2} y={40}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 170, color: C.gold, lineHeight: 1.1 }}>International</div>
        </Reveal>
        <Rule at={1.8} width={160} style={{ marginTop: 34 }} />
        <div style={{ display: "flex", gap: 160, marginTop: 50 }}>
          <Reveal at={4.6}>
            <Eyebrow color={C.muted} size={19}>The raise</Eyebrow>
            <Counter at={4.9} to={360000} dur={1.4} format={money} style={{ fontFamily: SERIF, fontSize: 60, color: C.ivory, marginTop: 14 }} />
          </Reveal>
          <Reveal at={2.4}>
            <Eyebrow color={C.muted} size={19}>Presented by</Eyebrow>
            <div style={{ fontFamily: SERIF, fontSize: 60, color: C.ivory, marginTop: 14 }}>Janis Spindel · Carly Spindel</div>
          </Reveal>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2 · At a glance (slide 2) ---------- */
const Stat: React.FC<{ at: number; value: React.ReactNode; label: string; divider?: boolean }> = ({ at, value, label, divider }) => {
  const t = useSec();
  return (
    <div style={{ flex: 1, paddingLeft: divider ? 64 : 0, paddingRight: 24, position: "relative" }}>
      {divider ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1, height: 300 * prog(t, at - 0.4, at + 0.6), background: "#4A4236" }} />
      ) : null}
      <div style={{ fontFamily: SERIF, fontSize: 142, color: C.gold, lineHeight: 1, whiteSpace: "nowrap", textShadow: `0 0 ${40 * prog(t, at, at + 0.5) * (1 - prog(t, at + 0.5, at + 2))}px rgba(201,164,92,0.6)` }}>
        {value}
      </div>
      <Reveal at={at + 0.5}>
        <Body size={28} color="#C9C1B2" style={{ marginTop: 28, maxWidth: 470 }}>
          {label}
        </Body>
      </Reveal>
    </div>
  );
};

export const Glance: React.FC<S> = () => {
  return (
    <AbsoluteFill style={{ background: C.ink, padding: `130px ${PAD}px` }}>
      <Reveal at={0.1}>
        <Eyebrow>At a glance</Eyebrow>
      </Reveal>
      <Reveal at={0.3}>
        <Headline size={78} style={{ marginTop: 18 }}>
          The investment in one view
        </Headline>
      </Reveal>
      <div style={{ display: "flex", marginTop: 120 }}>
        <Stat
          at={2.2}
          value={<Counter at={2.2} to={1.56} dur={1.8} format={(v) => `$${v.toFixed(2)}M`} />}
          label="base-case revenue in the first 40 weeks"
        />
        <Stat divider at={7.8} value={<Counter at={7.8} to={84} dur={1.4} format={(v) => `${Math.round(v)}¢`} />} label="of every dollar is contribution before overhead" />
        <Stat divider at={12.0} value={<Counter at={12.0} to={11} dur={1.2} format={(v) => `${Math.round(v)} wks`} />} label="for base-case contribution to equal the $360,000 raise" />
      </div>
      <Reveal at={17.2} dur={1.2}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 48, color: C.ivory, marginTop: 110 }}>
          Even at half the sales, the raise is covered in about <span style={{ color: C.gold }}>17 weeks.</span>
        </div>
      </Reveal>
      <Footer />
    </AbsoluteFill>
  );
};

/* ---------- 3 · Team (slide 18 + photo) ---------- */
const Person: React.FC<{ at: number; name: string; role: string; text: string }> = ({ at, name, role, text }) => (
  <Reveal at={at} style={{ marginBottom: 46 }}>
    <Rule at={at} width={640} color="#4A4236" />
    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 50, color: C.ivory, marginTop: 22 }}>{name}</div>
    <Eyebrow size={18} style={{ marginTop: 6 }}>
      {role}
    </Eyebrow>
    <Body size={24} style={{ marginTop: 10, maxWidth: 640 }}>
      {text}
    </Body>
  </Reveal>
);

export const Team: React.FC<S> = ({ d }) => {
  const t = useSec();
  const z = interpolate(t, [0, d], [1.04, 1.14]);
  const y = interpolate(t, [0, d], [0, -40]);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 860, height: 1080, overflow: "hidden" }}>
        <Img src={staticFile("team.jpg")} style={{ width: 860, height: 1222, objectFit: "cover", transform: `translateY(${y}px) scale(${z})`, transformOrigin: "50% 30%", filter: "saturate(0.88) contrast(1.04)" }} />
        <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(21,18,14,0) 55%, ${C.ink} 100%)` }} />
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(21,18,14,0.75) 0%, rgba(21,18,14,0) 25%)" }} />
        <div style={{ position: "absolute", left: 40, bottom: 34, fontFamily: SANS, fontSize: 16, color: "#B8B0A2", letterSpacing: 1 }}>
          Janis Spindel &amp; Carly Spindel · Photo: Gabriele Di Martino
        </div>
      </div>
      <div style={{ position: "absolute", left: 960, top: 120, width: 820 }}>
        <Reveal at={0.2}>
          <Eyebrow>Team and milestones</Eyebrow>
        </Reveal>
        <Reveal at={0.5}>
          <Headline size={66} style={{ marginTop: 16, marginBottom: 56 }}>
            An established <span style={{ fontStyle: "italic" }}>matchmaking family</span>
          </Headline>
        </Reveal>
        <Person at={3.3} name="Janis Spindel" role="Founder" text="Founder of Janis & Carly Spindel Serious Matchmaking, New York. Approves every member and every match." />
        <Person at={8.1} name="Carly Spindel" role="Chief Editor" text="Interviews every Preferred man on a private Zoom call, and meets women at meet-and-greets with Janis." />
        <Person at={11.9} name="Allen Spindel" role="Engineer" text="Systems and launch: trademarks, company setup, automation. Early investor." />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4 · Opportunity (slide 3) ---------- */
const Pillar: React.FC<{ at: number; num: string; title: string; text: string; tag: string }> = ({ at, num, title, text, tag }) => (
  <Reveal at={at} style={{ flex: 1 }}>
    <Rule at={at} width={500} color={C.ink} />
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 56, color: C.goldDeep, marginTop: 34 }}>{num}</div>
    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 48, color: C.ink, marginTop: 8 }}>{title}</div>
    <Body size={27} color="#4A453D" style={{ marginTop: 14, maxWidth: 500 }}>
      {text}
    </Body>
    <Eyebrow color={C.goldDeep} size={19} style={{ marginTop: 44 }}>
      {tag}
    </Eyebrow>
  </Reveal>
);

export const Opportunity: React.FC<S> = ({ d }) => {
  const t = useSec();
  const wipe = prog(t, 3.6, 4.6, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Clip n={4} rate={1} durSec={5} dim={0.35} />
      <Vignette />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - wipe }}>
        <Reveal at={0.2} dur={1.1}>
          <Headline size={92} style={{ textAlign: "center" }}>
            Accomplished men pay for results.
          </Headline>
        </Reveal>
        <Reveal at={2.5} dur={1}>
          <Headline size={92} color={C.gold} style={{ fontStyle: "italic", textAlign: "center", marginTop: 10 }}>
            We deliver.
          </Headline>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.cream, clipPath: `inset(0 ${100 - wipe * 100}% 0 0)`, padding: `130px ${PAD}px` }}>
        <Eyebrow color={C.goldDeep}>The opportunity</Eyebrow>
        <Headline size={76} color={C.ink} style={{ marginTop: 18 }}>
          Accomplished men pay for results. <span style={{ fontStyle: "italic" }}>We deliver.</span>
        </Headline>
        <div style={{ display: "flex", gap: 64, marginTop: 110 }}>
          <Pillar at={4.2} num="I" title="Real matchmakers" text="Janis and Carly Spindel personally make every match. That human judgment is the product." tag="Competitive advantage" />
          <Pillar at={6.7} num="II" title="Automated operations" text="Applications, payments, safety screening and scheduling run on their own, so the model scales." tag="Hybrid matchmaking model" />
          <Pillar at={13.1} num="III" title="Premium pricing" text="Packages at $10,000 and $25,000, paid in full up front, in markets with no fee cap." tag="Revenue per client" />
        </div>
        <Footer dark={false} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 5 · Funnels + price ladder (slides 4–5) ---------- */
const Bullets: React.FC<{ items: [number, string][]; color: string }> = ({ items, color }) => (
  <div style={{ marginTop: 26 }}>
    {items.map(([at, s]) => (
      <Reveal key={s} at={at} y={14}>
        <div style={{ display: "flex", gap: 18, fontFamily: SANS, fontSize: 28, color, lineHeight: 1.45, marginBottom: 16 }}>
          <span style={{ color: C.gold }}>•</span>
          <span>{s}</span>
        </div>
      </Reveal>
    ))}
  </div>
);

const Step: React.FC<{ at: number; price: string; title: string; text: string; h: number; i: number }> = ({ at, price, title, text, h, i }) => {
  const t = useSec();
  const p = prog(t, at, at + 1.1, Easing.out(Easing.cubic));
  const shades = ["#1E1B17", "#24201A", "#2A241C", "#312820"];
  return (
    <div style={{ flex: 1, height: 620, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", height: h * p, background: shades[i], borderTop: `2px solid ${C.gold}`, overflow: "hidden", padding: "36px 36px 0" }}>
        <div style={{ opacity: prog(t, at + 0.4, at + 1.1) }}>
          <div style={{ fontFamily: SERIF, fontSize: 84, color: C.gold, lineHeight: 1 }}>{price}</div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: C.ivory, marginTop: 14 }}>{title}</div>
          <Body size={22} style={{ marginTop: 10 }}>
            {text}
          </Body>
        </div>
      </div>
    </div>
  );
};

export const Funnels: React.FC<S> = ({ d }) => {
  const t = useSec();
  const toLadder = prog(t, 12.2, 13.0, Easing.inOut(Easing.cubic));
  const clipOut = prog(t, 2.0, 2.8);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {/* intro: hands clip */}
      <AbsoluteFill style={{ opacity: 1 - clipOut }}>
        <Clip n={7} rate={1} durSec={3} dim={0.25} />
        <Vignette />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Reveal at={0.2}>
            <Headline size={96}>
              Two funnels, <span style={{ fontStyle: "italic", color: C.gold }}>one network</span>
            </Headline>
          </Reveal>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* slide 4 */}
      <AbsoluteFill style={{ background: C.cream, opacity: clipOut * (1 - toLadder), padding: `130px ${PAD}px` }}>
        <Eyebrow color={C.goldDeep}>The business model</Eyebrow>
        <Headline size={76} color={C.ink} style={{ marginTop: 18 }}>
          Two funnels, one network
        </Headline>
        <div style={{ display: "flex", gap: 48, marginTop: 70, height: 590 }}>
          <div style={{ flex: 1, background: C.paper, border: `1px solid ${C.line}`, padding: 56, transform: `translateX(${(1 - prog(t, 2.4, 3.4)) * -60}px)`, opacity: prog(t, 2.4, 3.4) }}>
            <Eyebrow color={C.goldDeep} size={20}>Funnel one</Eyebrow>
            <Headline size={64} color={C.ink} style={{ marginTop: 14 }}>Women</Headline>
            <Bullets
              color="#4A453D"
              items={[
                [3.0, "$25 application, reviewed by Janis"],
                [7.9, "35% upgrade to $500 Preferred membership"],
                [9.0, "Invite-only events and meet-and-greets with Janis and Carly"],
                [10.0, "Eligible for introductions to Flash Match men"],
              ]}
            />
          </div>
          <div style={{ flex: 1, background: C.ink, padding: 56, transform: `translateX(${(1 - prog(t, 2.6, 3.6)) * 60}px)`, opacity: prog(t, 2.6, 3.6) }}>
            <Eyebrow size={20}>Funnel two</Eyebrow>
            <Headline size={64} style={{ marginTop: 14 }}>Men</Headline>
            <Bullets
              color="#D6CEBF"
              items={[
                [3.3, "$25 application, reviewed by Janis"],
                [8.2, "35% go on to the $500 private video call"],
                [9.3, "Automatic ID and sex-offender registry check"],
                [10.3, "Convert to $10,000 or $25,000 packages"],
              ]}
            />
          </div>
        </div>
        <Footer dark={false} />
      </AbsoluteFill>
      {/* slide 5 */}
      <AbsoluteFill style={{ background: C.ink, opacity: toLadder, padding: `130px ${PAD}px` }}>
        <Eyebrow>The price ladder for men</Eyebrow>
        <Headline size={76} style={{ marginTop: 18 }}>
          We compete on results, not promises
        </Headline>
        <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 140, display: "flex", gap: 26 }}>
          <Step i={0} at={12.6} h={300} price="$25" title="Application" text="Read by Janis. Charged only if approved." />
          <Step i={1} at={13.0} h={380} price="$500" title="Preferred call" text="Verified, screened, then a 15-minute private Zoom with Carly." />
          <Step i={2} at={14.0} h={460} price="$10K" title="Signature introduction" text="One personally curated introduction, selected exclusively for him. Selective acceptance." />
          <Step i={3} at={16.9} h={540} price="$25K" title="Three introductions" text="Up to three carefully curated introductions. Selective acceptance." />
        </div>
        <Footer />
      </AbsoluteFill>
      <div style={{ display: "none" }}>{d}</div>
    </AbsoluteFill>
  );
};

/* ---------- 6 · Operations & safety (slides 6–7) ---------- */
const CARDS: [string, string, boolean][] = [
  ["01 · Automatic", "Applies; $25 authorized", false],
  ["02 · Janis", "Approves; card is charged", true],
  ["03 · Automatic", "Pays $500 Preferred fee", false],
  ["04 · Automatic", "Stripe ID verification", false],
  ["05 · Automatic", "National sex-offender registry search", false],
  ["06 · Automatic", "Zoom booked with Carly", false],
  ["07 · Carly", "15-minute private call", true],
  ["08 · One click", "Accepted as a member", false],
];

export const Safety: React.FC<S> = ({ d }) => {
  const t = useSec();
  const clipOut = prog(t, 2.0, 2.8);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ opacity: 1 - clipOut }}>
        <Clip n={6} durSec={3} dim={0.3} />
        <Vignette />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.cream, opacity: clipOut, padding: `130px ${PAD}px` }}>
        <Eyebrow color={C.goldDeep}>Operations and safety</Eyebrow>
        <Headline size={76} color={C.ink} style={{ marginTop: 18 }}>
          Two human moments. <span style={{ fontStyle: "italic" }}>Everything else runs itself.</span>
        </Headline>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 70 }}>
          {CARDS.map(([k, v, human], i) => {
            const at = 2.6 + i * 0.32;
            const p = prog(t, at, at + 0.6);
            const glow = human ? prog(t, 4.6, 5.4) : 0;
            return (
              <div
                key={k}
                style={{
                  height: 176,
                  padding: "30px 30px",
                  background: human ? C.ink : C.paper,
                  border: `1px solid ${human ? C.ink : C.line}`,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 20}px) scale(${1 + 0.04 * glow})`,
                  boxShadow: human ? `0 0 ${50 * glow}px rgba(201,164,92,${0.55 * glow})` : undefined,
                  outline: human ? `2px solid rgba(201,164,92,${glow})` : undefined,
                }}
              >
                <Eyebrow size={19} color={human ? C.gold : C.goldDeep}>
                  {k}
                </Eyebrow>
                <div style={{ fontFamily: SANS, fontSize: 28, color: human ? C.ivory : C.ink, marginTop: 18, lineHeight: 1.35 }}>{v}</div>
              </div>
            );
          })}
        </div>
        <Reveal at={4.2}>
          <Body size={28} color="#4A453D" style={{ marginTop: 52 }}>
            Dark cards are the two human moments. Every male member is identity-verified and screened against sex-offender registries before he meets anyone.
          </Body>
        </Reveal>
        <Footer dark={false} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - clipOut, justifyContent: "center", alignItems: "center" }}>
        <Reveal at={0.2}>
          <Headline size={92} style={{ textAlign: "center" }}>
            Two human moments.
            <br />
            <span style={{ fontStyle: "italic", color: C.gold }}>Everything else runs itself.</span>
          </Headline>
        </Reveal>
      </AbsoluteFill>
      <div style={{ display: "none" }}>{d}</div>
    </AbsoluteFill>
  );
};

/* ---------- 7 · Launch market (slides 8–9) ---------- */
const MarketCard: React.FC<{ at: number; tag: string; name: string; text: string; dark?: boolean; big?: string; dim?: number }> = ({
  at,
  tag,
  name,
  text,
  dark,
  big,
  dim = 0,
}) => {
  const t = useSec();
  const p = prog(t, at, at + 0.8);
  return (
    <div
      style={{
        flex: 1,
        height: 560,
        padding: 48,
        background: dark ? C.ink : C.paper,
        border: `1px solid ${dark ? C.ink : C.line}`,
        opacity: p * (1 - dim * 0.55),
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <Eyebrow size={19} color={dark ? C.gold : C.goldDeep}>
        {tag}
      </Eyebrow>
      <Headline size={60} color={dark ? C.ivory : C.ink} style={{ marginTop: 16 }}>
        {name}
      </Headline>
      {big ? <div style={{ fontFamily: SERIF, fontSize: 120, color: C.ink, lineHeight: 1.1, marginTop: 12 }}>{big}</div> : null}
      <Body size={26} color={dark ? "#CFC7B8" : "#4A453D"} style={{ marginTop: 22 }}>
        {text}
      </Body>
    </div>
  );
};

const LowerThird: React.FC<{ title: React.ReactNode; sub: string }> = ({ title, sub }) => (
  <div style={{ position: "absolute", left: PAD, bottom: 120 }}>
    <Rule at={0.3} width={120} />
    <Reveal at={0.4}>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 72, color: C.ivory, marginTop: 22 }}>{title}</div>
    </Reveal>
    <Reveal at={0.8}>
      <Body size={28} color="#D6CEBF" style={{ marginTop: 6, maxWidth: 900 }}>
        {sub}
      </Body>
    </Reveal>
  </div>
);

export const Market: React.FC<S> = ({ d }) => {
  const t = useSec();
  const toronto = 8.4;
  const montreal = 10.6;
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <AbsoluteFill style={{ padding: `130px ${PAD}px` }}>
        <Reveal at={0.1}>
          <Eyebrow color={C.goldDeep}>The rules, market by market</Eyebrow>
        </Reveal>
        <Reveal at={0.3}>
          <Headline size={76} color={C.ink} style={{ marginTop: 18 }}>
            We launch where our pricing is allowed
          </Headline>
        </Reveal>
        <div style={{ display: "flex", gap: 32, marginTop: 70 }}>
          <MarketCard at={2.6} tag="Deferred" name="New York" big="$1,000" text="Dating contracts capped at $1,000. The rule follows where the client lives." dim={prog(t, 6.3, 7)} />
          <MarketCard at={6.3} dark tag="Flagship" name="Ontario" text="General consumer protection law, broader and in most ways less restrictive. No $1,000 cap. No required monthly referral count." />
          <MarketCard at={7.2} tag="Adapted terms" name="Quebec" text="No payment before service begins. At least two roughly equal instalments. Clients may cancel at any time with a small penalty." />
        </div>
        <Footer dark={false} />
      </AbsoluteFill>
      <At from={toronto} dur={montreal - toronto + 0.6}>
        <AbsoluteFill style={{ opacity: prog(t - toronto, 0, 0.6) }}>
          <Clip n={2} rate={1} durSec={3} dim={0.1} />
          <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(21,18,14,0.85) 0%, rgba(21,18,14,0) 55%)" }} />
          <LowerThird title={<>Toronto, Ontario <span style={{ fontStyle: "italic", color: C.gold, fontWeight: 400 }}>· flagship</span></>} sub="General consumer-contract rules. No dating-service fee cap." />
        </AbsoluteFill>
      </At>
      <At from={montreal} dur={d - montreal + 1}>
        <AbsoluteFill style={{ opacity: prog(t - montreal, 0, 0.6) }}>
          <Clip n={3} rate={0.8} durSec={3} dim={0.1} />
          <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(21,18,14,0.85) 0%, rgba(21,18,14,0) 55%)" }} />
          <LowerThird title={<>Montreal, Quebec <span style={{ fontStyle: "italic", color: C.gold, fontWeight: 400 }}>· opportunity</span></>} sub="Dating agencies are regulated under Quebec’s consumer protection framework, with specific contract and cancellation rules." />
        </AbsoluteFill>
      </At>
    </AbsoluteFill>
  );
};

/* ---------- 8 · Go-to-market (slide 10) ---------- */
export const GoToMarket: React.FC<S> = ({ d }) => {
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ opacity: 0.55 }}>
        <Clip n={5} rate={0.6} durSec={d} zoom={[1.05, 1.18]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${C.ink} 35%, rgba(21,18,14,0.55) 100%)` }} />
      <AbsoluteFill style={{ padding: `130px ${PAD}px` }}>
        <Reveal at={0.1}>
          <Eyebrow>Go-to-market</Eyebrow>
        </Reveal>
        <Reveal at={0.3}>
          <Headline size={76} style={{ marginTop: 18 }}>
            A casting call with publicist <span style={{ fontStyle: "italic", color: C.gold }}>Deborah Knight</span>
          </Headline>
        </Reveal>
        <div style={{ display: "flex", gap: 64, marginTop: 220 }}>
          <Reveal at={1.4} style={{ flex: 1 }}>
            <Rule at={1.4} width={500} />
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 50, color: C.ivory, marginTop: 30 }}>Proven playbook</div>
            <Body size={27} style={{ marginTop: 12 }}>
              Janis ran a casting call with Deborah Knight in Canada before. We are repeating what worked.
            </Body>
          </Reveal>
          <Reveal at={3.6} style={{ flex: 1 }}>
            <Rule at={3.6} width={500} />
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 50, color: C.ivory, marginTop: 30 }}>Earned media</div>
            <Body size={27} style={{ marginTop: 12 }}>
              Press coverage fills the women’s pipeline and brings men to the site.
            </Body>
          </Reveal>
          <Reveal at={6.5} style={{ flex: 1 }}>
            <Rule at={6.5} width={500} />
            <Counter at={6.6} to={500} dur={1.6} format={(v) => `${Math.round(v)}`} style={{ fontFamily: SERIF, fontSize: 150, color: C.gold, lineHeight: 1, marginTop: 14 }} />
            <Body size={27} style={{ marginTop: 6 }}>
              unique, high-intent visits a day already reach us through search
            </Body>
          </Reveal>
        </div>
      </AbsoluteFill>
      <Footer />
    </AbsoluteFill>
  );
};

/* ---------- FINANCIALS ---------- */
const FinBadge: React.FC = () => (
  <div style={{ position: "absolute", right: PAD, top: 136, fontFamily: SANS, fontWeight: 700, fontSize: 17, letterSpacing: 5, color: C.gold, border: `1px solid ${C.gold}`, padding: "8px 18px" }}>
    FINANCIALS
  </div>
);

/* 9 · Model assumptions (slide 11) */
export const Assumptions: React.FC<S> = () => {
  const t = useSec();
  const steps: [number, React.ReactNode, string][] = [
    [1.3, <Counter key="a" at={1.3} to={500} dur={1.2} format={(v) => `${Math.round(v)}`} />, "unique visits a day"],
    [2.8, <Counter key="b" at={2.8} to={1} dur={0.8} format={(v) => `${Math.round(v)}%`} />, "apply at $25: 5 a day per side"],
    [3.9, <Counter key="c" at={3.9} to={35} dur={1.0} format={(v) => `${Math.round(v)}%`} />, "upgrade to $500 Preferred"],
    [6.5, <span key="d">1 / wk</span>, "$25,000 package sold"],
  ];
  const rows: [string, string, string][] = [
    ["Applications at $25", "1,400", "1,400"],
    ["Preferred at $500 (35%)", "490", "490"],
    ["$25,000 packages", "—", "40"],
  ];
  return (
    <AbsoluteFill style={{ background: C.ink, padding: `130px ${PAD}px` }}>
      <FinBadge />
      <Reveal at={0.1}>
        <Eyebrow>Model assumptions · 40 weeks</Eyebrow>
      </Reveal>
      <Reveal at={0.3}>
        <Headline size={76} style={{ marginTop: 18 }}>
          From 500 daily visits to <span style={{ color: C.gold }}>40 premium clients</span>
        </Headline>
      </Reveal>
      <div style={{ display: "flex", marginTop: 70 }}>
        {steps.map(([at, v, l], i) => (
          <div key={l} style={{ flex: 1, paddingLeft: i ? 44 : 0, borderLeft: i ? `1px solid rgba(74,66,54,${prog(t, at - 0.3, at)})` : undefined }}>
            <Reveal at={at - 0.05} dur={0.6}>
              <div style={{ fontFamily: SERIF, fontSize: 116, color: C.gold, lineHeight: 1 }}>{v}</div>
              <Body size={24} color="#C9C1B2" style={{ marginTop: 14 }}>
                {l}
              </Body>
            </Reveal>
          </div>
        ))}
      </div>
      <Reveal at={7.4} style={{ marginTop: 64 }}>
        <div style={{ display: "flex", background: "#000", padding: "18px 26px", fontFamily: SANS, fontWeight: 700, fontSize: 27, color: C.ivory }}>
          <div style={{ flex: 3 }}>Over 40 weeks (280 days)</div>
          <div style={{ flex: 1, textAlign: "right" }}>Women</div>
          <div style={{ flex: 1, textAlign: "right" }}>Men</div>
        </div>
        {rows.map(([a, w, m], i) => (
          <Reveal key={a} at={7.7 + i * 0.35} y={10} blur={false}>
            <div style={{ display: "flex", padding: "16px 26px", fontFamily: SANS, fontSize: 27, color: "#E6DFD2", background: i % 2 ? C.ink2 : "transparent", borderBottom: "1px solid #2E281F" }}>
              <div style={{ flex: 3 }}>{a}</div>
              <div style={{ flex: 1, textAlign: "right" }}>{w}</div>
              <div style={{ flex: 1, textAlign: "right", color: i === 2 ? C.gold : undefined, fontWeight: i === 2 ? 700 : 400 }}>{m}</div>
            </div>
          </Reveal>
        ))}
        <Reveal at={8.8}>
          <Body size={21} style={{ marginTop: 16 }}>
            Assumes men and women each reach 5 applications a day.
          </Body>
        </Reveal>
      </Reveal>
      <Footer />
    </AbsoluteFill>
  );
};

/* 10 · Revenue (slide 12) */
const STREAMS: [string, string, number, string][] = [
  ["Women · $25 applications", "1,400", 35000, "#6E6352"],
  ["Women · $500 Preferred", "490", 245000, "#9C8554"],
  ["Men · $25 applications", "1,400", 35000, "#7E7158"],
  ["Men · $500 private video call", "490", 245000, "#B39557"],
  ["Men · $25,000 three-introduction package", "40", 1000000, C.gold],
];

export const Revenue: React.FC<S> = () => {
  const t = useSec();
  const BAR = 1664;
  const total = 1560000;
  let acc = 0;
  return (
    <AbsoluteFill style={{ background: C.ink, padding: `130px ${PAD}px` }}>
      <FinBadge />
      <Reveal at={0.1}>
        <Eyebrow>Base case · first 40 weeks</Eyebrow>
      </Reveal>
      <div style={{ fontFamily: SERIF, fontSize: 150, color: C.ivory, lineHeight: 1, marginTop: 26 }}>
        <Counter at={0.6} to={1560000} dur={3.6} format={money} />
        <span style={{ fontSize: 60, color: C.muted, opacity: prog(t, 3.5, 4.3) }}> in revenue</span>
      </div>
      {/* stacked bar */}
      <div style={{ position: "relative", width: BAR, height: 70, marginTop: 60, background: "#1F1B16" }}>
        {STREAMS.map(([label, , v, col], i) => {
          const at = 0.6 + i * 0.6;
          const w = (v / total) * BAR * prog(t, at, at + 0.9, Easing.out(Easing.cubic));
          const left = (acc / total) * BAR;
          acc += v;
          const isMem = i < 4;
          const hl = prog(t, 5.4, 6.0);
          return (
            <div
              key={label}
              style={{ position: "absolute", left, top: 0, height: 70, width: w, background: col, opacity: isMem ? 1 : 1 - 0.65 * hl, outline: isMem ? `2px solid rgba(243,239,232,${0.8 * hl})` : undefined }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 56, marginTop: 50 }}>
        <div style={{ flex: 1.35 }}>
          {STREAMS.map(([label, vol, v, col], i) => (
            <Reveal key={label} at={0.8 + i * 0.6} y={10} blur={false}>
              <div style={{ display: "flex", alignItems: "center", fontFamily: SANS, fontSize: 26, color: "#E6DFD2", padding: "13px 0", borderBottom: "1px solid #2E281F" }}>
                <div style={{ width: 18, height: 18, background: col, marginRight: 20 }} />
                <div style={{ flex: 4 }}>{label}</div>
                <div style={{ flex: 1, textAlign: "right", color: C.muted }}>{vol}</div>
                <div style={{ flex: 1.4, textAlign: "right" }}>{money(v)}</div>
              </div>
            </Reveal>
          ))}
          <Reveal at={3.8} y={10} blur={false}>
            <div style={{ display: "flex", fontFamily: SANS, fontWeight: 700, fontSize: 27, color: C.ivory, padding: "16px 0" }}>
              <div style={{ flex: 4, paddingLeft: 38 }}>Total revenue</div>
              <div style={{ flex: 2.4, textAlign: "right", color: C.gold }}>$1,560,000</div>
            </div>
          </Reveal>
          <Reveal at={4.2}>
            <Body size={20}>Figures in U.S. dollars.</Body>
          </Reveal>
        </div>
        <Reveal at={5.4} style={{ flex: 1 }}>
          <div style={{ background: C.ink2, border: `1px solid rgba(201,164,92,0.5)`, padding: 52, height: 420 }}>
            <Eyebrow size={20}>Memberships alone</Eyebrow>
            <Counter at={5.5} to={560000} dur={1.6} format={money} style={{ fontFamily: SERIF, fontSize: 116, color: C.ivory, marginTop: 24 }} />
            <Body size={28} color="#CFC7B8" style={{ marginTop: 16 }}>
              before a single $25,000 package is sold
            </Body>
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

/* 11 · Margins waterfall (slide 13) */
const WF: [string, number, number][] = [
  // label, start, end
  ["Total revenue", 0, 1560000],
  ["Card processing (2.9% + $0.30)", 1560000, 1513600],
  ["Stripe ID verification ($1.50 × 2,800 applicants)", 1513600, 1509400],
  ["Carly’s call fee ($400 × 490 calls)", 1509400, 1313400],
  ["Contribution before overhead", 0, 1313400],
];
const WF_VAL = ["$1,560,000", "−$46,400", "−$4,200", "−$196,000", "$1,313,400"];

export const Margins: React.FC<S> = () => {
  const t = useSec();
  const H = 470;
  const max = 1560000;
  const y = (v: number) => H - (v / max) * H;
  return (
    <AbsoluteFill style={{ background: C.ink, padding: `130px ${PAD}px` }}>
      <FinBadge />
      <Reveal at={0.1}>
        <Eyebrow>Margins · base case</Eyebrow>
      </Reveal>
      <Reveal at={0.3}>
        <Headline size={76} style={{ marginTop: 18 }}>
          <Counter at={0.4} to={84} dur={1.2} format={(v) => `${Math.round(v)}`} style={{ color: C.gold }} /> cents of every dollar is contribution
        </Headline>
      </Reveal>
      <div style={{ display: "flex", gap: 70, marginTop: 70 }}>
        <div style={{ position: "relative", width: 1040, height: H + 150 }}>
          {WF.map(([label, a, b], i) => {
            const at = 0.6 + i * 1.1;
            const p = prog(t, at, at + 0.9, Easing.out(Easing.cubic));
            const top = Math.min(y(a), y(b));
            const h = Math.abs(y(a) - y(b));
            const isEnd = i === 0 || i === 4;
            const minH = 6;
            const hh = Math.max(h, minH) * p;
            const fromTop = i > 0 && i < 4;
            return (
              <div key={label}>
                <div
                  style={{
                    position: "absolute",
                    left: i * 208,
                    width: 150,
                    top: fromTop ? top : top + Math.max(h, minH) - hh,
                    height: hh,
                    background: isEnd ? (i === 4 ? C.gold : "#8C7A55") : "#6B3A35",
                    boxShadow: i === 4 ? `0 0 ${60 * prog(t, at + 0.6, at + 1.4)}px rgba(201,164,92,0.5)` : undefined,
                  }}
                />
                <div style={{ position: "absolute", left: i * 208 - 20, width: 190, top: top - 50, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 25, color: i === 4 ? C.gold : i ? "#D9A69E" : C.ivory, opacity: prog(t, at + 0.5, at + 1) }}>
                  {WF_VAL[i]}
                </div>
                <div style={{ position: "absolute", left: i * 208 - 20, width: 190, top: H + 24, textAlign: "center", fontFamily: SANS, fontSize: 19, lineHeight: 1.3, color: C.muted, opacity: prog(t, at + 0.3, at + 0.9) }}>
                  {label}
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, top: H, width: 980, height: 1, background: "#4A4236" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
          <Reveal at={10.8}>
            <div style={{ background: C.paper, padding: "36px 44px" }}>
              <Counter at={10.9} to={24275} dur={1.2} format={money} style={{ fontFamily: SERIF, fontSize: 92, color: C.goldDeep, lineHeight: 1 }} />
              <Body size={26} color="#4A453D" style={{ marginTop: 8 }}>
                net on each $25,000 package
              </Body>
            </div>
          </Reveal>
          <Reveal at={9.3}>
            <div style={{ background: C.ink2, border: `1px solid rgba(201,164,92,0.5)`, padding: "36px 44px" }}>
              <Counter at={9.4} to={32835} dur={1.4} format={money} style={{ fontFamily: SERIF, fontSize: 92, color: C.gold, lineHeight: 1 }} />
              <Body size={26} color="#CFC7B8" style={{ marginTop: 8 }}>
                average contribution per week
              </Body>
            </div>
          </Reveal>
          <Reveal at={11.8}>
            <Body size={21}>Sex-offender registry checks, about 10¢ per member, we did not list.</Body>
          </Reveal>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 12 · Scenarios (slide 14) */
const SC: [string, string, number, string, number, string][] = [
  ["Downside", "~17 weeks", 827906, "20 packages, one every two weeks.", 0.0, "#6E6352"],
  ["Base", "~11 weeks", 1313400, "40 packages, one a week.", 4.7, "#C9A45C"],
  ["Upside", "~8 weeks", 1701788, "Base plus 40 single $10,000 introductions.", 7.0, "#E3CB97"],
];

export const Scenarios: React.FC<S> = () => {
  const t = useSec();
  const H = 520;
  const max = 1701788;
  const raiseY = H - (360000 / max) * H;
  return (
    <AbsoluteFill style={{ background: C.ink, padding: `130px ${PAD}px` }}>
      <FinBadge />
      <Reveal at={0.0}>
        <Eyebrow>Scenarios · 40-week contribution before overhead</Eyebrow>
      </Reveal>
      <Reveal at={0.2}>
        <Headline size={76} style={{ marginTop: 18 }}>
          Even at half the sales, <span style={{ fontStyle: "italic", color: C.gold }}>the raise is covered</span>
        </Headline>
      </Reveal>
      <div style={{ display: "flex", gap: 80, marginTop: 70 }}>
        <div style={{ position: "relative", width: 820, height: H + 80 }}>
          {SC.map(([name, , v, , at, col], i) => {
            const p = prog(t, at + 0.2, at + 1.4, Easing.out(Easing.cubic));
            const h = (v / max) * H * p;
            return (
              <div key={name}>
                <div style={{ position: "absolute", left: 60 + i * 260, width: 170, top: H - h, height: h, background: col, boxShadow: i === 1 ? `0 0 ${50 * p}px rgba(201,164,92,0.35)` : undefined }} />
                <div style={{ position: "absolute", left: 20 + i * 260, width: 250, top: H - h - 50, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 27, color: C.ivory, opacity: prog(t, at + 1, at + 1.5) }}>
                  {money(v * (p >= 1 ? 1 : p))}
                </div>
                <div style={{ position: "absolute", left: 20 + i * 260, width: 250, top: H + 22, textAlign: "center", fontFamily: SANS, fontSize: 24, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>{name}</div>
              </div>
            );
          })}
          {/* raise line */}
          <div style={{ position: "absolute", left: 0, top: raiseY, width: 820 * prog(t, 0.4, 1.4), height: 0, borderTop: `2px dashed ${C.ivory}`, opacity: 0.7 }} />
          <div style={{ position: "absolute", left: 0, top: H + 70, fontFamily: SANS, fontSize: 19, letterSpacing: 3, color: C.ivory, opacity: 0.8 * prog(t, 1.0, 1.6) }}>- - -  THE $360,000 RAISE</div>
          <div style={{ position: "absolute", left: 0, top: H, width: 820, height: 1, background: "#4A4236" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          {SC.map(([name, wk, , sub, at], i) => {
            const active = i === 1 ? prog(t, at, at + 0.6) : 0;
            return (
              <Reveal key={name} at={at} y={16}>
                <div style={{ background: i === 1 ? `rgba(201,164,92,${0.12 * active})` : C.ink2, border: `1px solid ${i === 1 ? C.gold : "#2E281F"}`, padding: "30px 38px" }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 44, color: i === 1 ? C.gold : C.ivory }}>
                    {name} · repaid in {wk}
                  </div>
                  <Body size={23} style={{ marginTop: 8 }}>
                    {sub}
                  </Body>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 13 · The ask (slide 15) */
const FUNDS: [string, string][] = [
  ["Company formation and Canada accounting setup", "$5,000"],
  ["U.S. and Canada trademarks · Canadian legal review", "$5,000"],
  ["PR and casting call with Deborah Knight", "$10,000"],
  ["New landing page and payment system", "$3,800"],
  ["T & E, events and working capital, VIP Road Show", "$336,200"],
];

export const Ask: React.FC<S> = ({ d }) => {
  return (
    <AbsoluteFill style={{ background: C.burgundy }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 20% 40%, rgba(201,164,92,0.12) 0%, rgba(0,0,0,0) 55%)" }} />
      <div style={{ position: "absolute", left: PAD, top: 290 }}>
        <Reveal at={0.1}>
          <Eyebrow>The ask</Eyebrow>
        </Reveal>
        <Counter at={1.0} to={360000} dur={1.8} format={money} style={{ fontFamily: SERIF, fontSize: 170, color: C.ivory, lineHeight: 1, marginTop: 30 }} />
        <Reveal at={2.4}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 62, color: C.gold, lineHeight: 1.25, marginTop: 30, width: 700 }}>
            to launch Flash Match International in Canada
          </div>
        </Reveal>
      </div>
      <div style={{ position: "absolute", left: 1000, right: PAD, top: 300 }}>
        <Reveal at={2.8} y={10} blur={false}>
          <div style={{ display: "flex", background: C.burgundy2, padding: "20px 26px", fontFamily: SANS, fontWeight: 700, fontSize: 25, color: C.gold }}>
            <div style={{ flex: 1 }}>Use of funds</div>
            <div>Amount</div>
          </div>
        </Reveal>
        {FUNDS.map(([a, b], i) => (
          <Reveal key={a} at={3.1 + i * 0.4} y={10} blur={false}>
            <div style={{ display: "flex", padding: "18px 26px", fontFamily: SANS, fontSize: 24, color: C.ivory, background: i % 2 ? "transparent" : "rgba(255,255,255,0.04)" }}>
              <div style={{ flex: 1 }}>{a}</div>
              <div>{b}</div>
            </div>
          </Reveal>
        ))}
        <Reveal at={5.2} y={10} blur={false}>
          <div style={{ display: "flex", background: C.burgundy2, padding: "20px 26px", fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.ivory }}>
            <div style={{ flex: 1 }}>Total</div>
            <div style={{ color: C.gold }}>$360,000</div>
          </div>
        </Reveal>
      </div>
      <Footer />
      <div style={{ display: "none" }}>{d}</div>
    </AbsoluteFill>
  );
};

/* 14 · Investor return (slides 16–17) */
const YearBar: React.FC<{ at: number; i: number; label: string; sub: string; val: number; h: number; gold?: boolean }> = ({ at, i, label, sub, val, h, gold }) => {
  const t = useSec();
  const p = prog(t, at, at + 1.1, Easing.out(Easing.cubic));
  return (
    <div style={{ flex: 1, height: 330, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", height: h * p, background: ["#1E1B17", "#25201A", "#2F271D"][i], borderTop: `2px solid ${C.gold}`, padding: "28px 30px", overflow: "hidden" }}>
        <div style={{ opacity: prog(t, at + 0.4, at + 1) }}>
          <Eyebrow size={17}>{label}</Eyebrow>
          <Body size={22} style={{ marginTop: 8 }}>
            {sub}
          </Body>
          <Counter at={at + 0.4} to={val} dur={1.2} format={(v) => "~" + money(v)} style={{ fontFamily: SERIF, fontSize: 52, color: gold ? C.gold : C.ivory, marginTop: 16 }} />
        </div>
      </div>
    </div>
  );
};

export const Returns: React.FC<S> = () => {
  const t = useSec();
  const optB = 14.0;
  const focusB = prog(t, optB, optB + 0.8);
  return (
    <AbsoluteFill style={{ background: C.ink, padding: `130px ${PAD}px` }}>
      <Reveal at={0.1}>
        <Eyebrow>Investor return · illustrative</Eyebrow>
      </Reveal>
      <Reveal at={0.3}>
        <Headline size={76} style={{ marginTop: 18 }}>
          Two ways to structure the return
        </Headline>
      </Reveal>
      <div style={{ display: "flex", gap: 40, marginTop: 60 }}>
        {/* Option A */}
        <Reveal at={2.4} style={{ flex: 1 }}>
          <div style={{ background: C.paper, padding: 50, height: 680, filter: `brightness(${1 - 0.4 * focusB})`, transform: `scale(${1 - 0.02 * focusB})` }}>
            <Eyebrow color={C.goldDeep} size={20}>Option A · Equity</Eyebrow>
            <Counter at={3.7} to={20} dur={1} format={(v) => `${Math.round(v)}%`} style={{ fontFamily: SERIF, fontSize: 120, color: C.ink, lineHeight: 1.1, marginTop: 14 }} />
            <Body size={26} color="#4A453D" style={{ marginTop: 6 }}>
              $360,000 for 20% of Flash Match International, a $1.8 million valuation.
            </Body>
            <div style={{ display: "flex", gap: 14, marginTop: 30, background: C.ink, padding: "20px 18px 0" }}>
              <YearBar at={8.5} i={0} label="Year 1 · Base case" sub="$1.31M contribution" val={262700} h={230} />
              <YearBar at={10.4} i={1} label="Year 2 · Illustrative" sub="$2M contribution" val={400000} h={275} />
              <YearBar at={11.4} i={2} label="Year 3 · Illustrative" sub="$3M contribution" val={600000} h={320} gold />
            </div>
          </div>
        </Reveal>
        {/* Option B */}
        <Reveal at={optB} style={{ flex: 1 }}>
          <div style={{ background: C.ink2, border: `1px solid rgba(201,164,92,${0.3 + 0.5 * focusB})`, padding: 50, height: 680, boxShadow: `0 0 ${60 * focusB}px rgba(201,164,92,0.18)` }}>
            <Eyebrow size={20}>Option B · Preferred return</Eyebrow>
            <Counter at={17.9} to={1.5} dur={1.2} format={(v) => `${v.toFixed(1)}×`} style={{ fontFamily: SERIF, fontSize: 120, color: C.gold, lineHeight: 1.1, marginTop: 14 }} />
            <Body size={26} color="#D6CEBF" style={{ marginTop: 6 }}>
              The investor receives 50% of contribution until paid 1.5× ($540,000), then keeps 10% equity.
            </Body>
            {/* 40-week timeline */}
            <div style={{ marginTop: 70, position: "relative", height: 150 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 50, height: 2, background: "#3A3329" }} />
              <div style={{ position: "absolute", left: 0, top: 49, height: 4, width: `${(33 / 40) * 100 * prog(t, 24.6, 27.4, Easing.inOut(Easing.cubic))}%`, background: C.gold }} />
              <div style={{ position: "absolute", left: `${(33 / 40) * 100}%`, top: 0, transform: "translateX(-50%)", textAlign: "center", opacity: prog(t, 27.0, 27.6) }}>
                <div style={{ fontFamily: SERIF, fontSize: 40, color: C.gold, whiteSpace: "nowrap" }}>~33 weeks</div>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: C.gold, margin: "14px auto 0" }} />
              </div>
              <div style={{ position: "absolute", left: 0, top: 92, fontFamily: SANS, fontSize: 19, color: C.muted, letterSpacing: 2 }}>LAUNCH</div>
              <div style={{ position: "absolute", right: 0, top: 92, fontFamily: SANS, fontSize: 19, color: C.muted, letterSpacing: 2 }}>WEEK 40</div>
              <Reveal at={27.4}>
                <Body size={24} color="#D6CEBF" style={{ position: "absolute", top: 135 }}>
                  Base case: 1.5× returned in about 33 weeks, inside the first launch year.
                </Body>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal at={5}>
        <Body size={21} style={{ marginTop: 22 }}>
          Illustrations only; final terms set by the company and its counsel. Years 2 and 3 show what 20% would be worth at higher contribution; they are not forecasts.
        </Body>
      </Reveal>
    </AbsoluteFill>
  );
};

/* 15 · Milestones (slide 18) */
export const Milestones: React.FC<S> = ({ d }) => {
  const items: [number, string, string][] = [
    [0.2, "January 2027", "Florida company formed; trademarks filed; Canadian contract reviewed"],
    [3.9, "February 2027", "Launch in Toronto, Ontario and Montreal, Quebec"],
    [5.6, "40 weeks in", "Base case: 40 packages sold, $1M in package revenue"],
  ];
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ opacity: 0.6 }}>
        <Clip n={8} rate={0.7} durSec={d} zoom={[1.02, 1.1]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(21,18,14,0.95) 15%, rgba(21,18,14,0.2) 70%)" }} />
      <div style={{ position: "absolute", left: PAD, top: 130 }}>
        <Eyebrow>Milestones</Eyebrow>
      </div>
      <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 170, display: "flex" }}>
        {items.map(([at, h, s], i) => (
          <Reveal key={h} at={at} style={{ flex: 1, paddingLeft: i ? 48 : 0, borderLeft: i ? "1px solid #4A4236" : undefined }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: C.gold }}>{h}</div>
            <Body size={27} color="#E6DFD2" style={{ marginTop: 12, maxWidth: 480 }}>
              {s}
            </Body>
          </Reveal>
        ))}
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

/* 16 · Mission close (slide 20) */
export const Close: React.FC<S> = ({ d }) => {
  const t = useSec();
  const out = prog(t, d - 1.6, d, Easing.inOut(Easing.quad));
  const frame = prog(t, 0.1, 1.4);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <div style={{ position: "absolute", inset: 64, border: `1px solid rgba(201,164,92,${0.5 * frame})` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 220px" }}>
        <Reveal at={0.1}>
          <Eyebrow>Our mission</Eyebrow>
        </Reveal>
        <Reveal at={0.5} dur={1.4}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 66, color: C.ivory, lineHeight: 1.3, marginTop: 50 }}>
            “To bring exceptional people together and help create lasting relationships that enrich lives.”
          </div>
        </Reveal>
        <Rule at={1.4} width={160} style={{ marginTop: 56 }} />
        <Reveal at={1.6}>
          <Body size={30} color="#D6CEBF" style={{ marginTop: 40 }}>
            Real matchmakers make the match. Technology does the heavy lifting.
          </Body>
        </Reveal>
        <Reveal at={4.7} dur={1.2}>
          <div style={{ fontFamily: SERIF, fontSize: 56, color: C.gold, marginTop: 50 }}>Flash Match International</div>
          <div style={{ fontFamily: SANS, fontSize: 22, color: C.muted, letterSpacing: 3, marginTop: 14 }}>media@janisspindelmatchmaker.com</div>
        </Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};
