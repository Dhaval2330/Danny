"""Builds the viral selfie-reel reference sheet (PDF) from vidIQ outlier-search results."""
import html, subprocess, sys
from pathlib import Path

HERE = Path(__file__).parent

# (platform, handle, views, x_median, followers, posted, format, setup_hook, audio, match, url)
REELS = [
    ("IG", "gabisklar", "4.6M", "20.7x", "2M", "12 Oct", "Lip-sync, phone placed", "Lying on the floor, looks up into the lens and sings along; on-screen lyrics", "Training Season – Dua Lipa", "High", "https://www.instagram.com/reel/DeaXGjyuSC4"),
    ("TT", "emilyruthc", "2.5M", "65.5x", "99.5K", "19 Aug", "Mirror selfie lip-sync", "Sitting on a chair in front of a mirror in sleepwear, posing; 10s, raw/unedited", "Upbeat pop vocal", "High", "https://www.tiktok.com/@emilyruthc/video/7675767857208151318"),
    ("IG", "abbypowledge", "2.0M", "20.7x", "62K", "23 Sep", "Lip-sync + dance, phone placed", "Kitchen, holding a spatula, starts dancing on frame 1; lyrics as text", "Pop song (relationship lyrics)", "High", "https://www.instagram.com/reel/DdozNARx0Yx"),
    ("TT", "gidoiahorror", "1.9M", "3.5x", "55.5K", "24 Aug", "Selfie-camera dance lip-sync", "Bedroom close-up, looks into the camera and starts moving to the beat", "Ride It – Regard", "High", "https://www.tiktok.com/@gidoiahorror/video/7677610953915026720"),
    ("IG", "bbyshanzz", "1.6M", "6.3x", "208K", "3 Sep", "Dance, phone placed", "At home, sudden move toward the camera on the beat drop", "Dangerous – Hyo ft. Yunhway", "High", "https://www.instagram.com/reel/Dc1SFaDtPek"),
    ("TT", "peach_fuzzz0", "1.6M", "15.8x", "140K", "31 Aug", "Selfie lip-sync", "Moves into frame and plays to the camera; 11s", "Barbie Girl – Aqua", "High", "https://www.tiktok.com/@peach_fuzzz0/video/7680260139173022998"),
    ("TT", "lala.od", "1.6M", "519x", "57K", "21 Sep", "Mirror selfie pose", "Full-body mirror shot in a brown dress, posing immediately; 5s loop", "Trending R&B/pop snippet", "High", "https://www.tiktok.com/@lala.od/video/7688130646434221326"),
    ("TT", "misslilianagarcia", "1.5M", "4.7x", "1.2M", "3 Aug", "Mirror selfie pose", "Gym outfit mirror selfie with slight movement; text 'Gym outfit today'", "Upbeat rhythmic track", "High", "https://www.tiktok.com/@misslilianagarcia/video/7669907650863222029"),
    ("IG", "aiiezy", "1.3M", "4.0x", "134K", "23 Aug", "Mirror selfie lip-sync", "Phone up at the mirror, dances and lip-syncs from second 1, showing outfit", "Everybody Hates Chris (sped up) – J Dot", "High", "https://www.instagram.com/reel/DcY75gAtWZf"),
    ("TT", "151.emily", "1.3M", "17.5x", "61.6K", "7 Sep", "Mirror selfie OOTD", "Bedroom mirror, holding phone, outfit-of-the-day pose; 8s", "Trendy pop snippet", "High", "https://www.tiktok.com/@151.emily/video/7682870714285739296"),
    ("TT", "5pammz1e", "1.3M", "5.6x", "435K", "30 Aug", "Selfie + text meme", "Blank stare into camera with relatable caption; 5s loop", "Rhythmic music track", "Medium", "https://www.tiktok.com/@5pammz1e/video/7679931115234135303"),
    ("IG", "maeurn.tv", "1.2M", "6.0x", "3.4M", "1 Aug", "Mirror selfie reveal", "Camera pans from legs up to the face to reveal a swimsuit look, ends on a pose", "Rhythmic pop song", "High", "https://www.instagram.com/reel/DbggTGZydW3"),
    ("TT", "elegant__official", "1.1M", "19.2x", "89.5K", "29 Sep", "Selfie lip-sync + dance", "Bedroom close-up, engages the camera immediately", "Trending audio", "High", "https://www.tiktok.com/@elegant__official/video/7691103697929129237"),
    ("IG", "nounie.06", "1.0M", "115x", "68K", "9 Sep", "Phone placed, to camera", "'Morning hair' — styling curls straight to camera, already mid-action", "Upbeat R&B/hip-hop", "Medium", "https://www.instagram.com/reel/DdEmoVBxOXT"),
    ("IG", "mayaalessiaaaa", "998K", "3.8x", "182K", "27 Jul", "Mirror selfie lip-sync", "Squatting pose at the mirror, lip-syncs from the first beat; repeating motion", "Jealousy – Emei", "High", "https://www.instagram.com/reel/DbTO6j-NR-j"),
    ("TT", "heyyitsliz", "981K", "46.5x", "268K", "19 Oct", "Mirror selfie pose", "Adjusts pose to show the dress shape; 7s loop", "Dramatic orchestral beat", "High", "https://www.tiktok.com/@heyyitsliz/video/7698195500222172429"),
    ("IG", "bubblebunny4k", "980K", "27.0x", "954K", "11 Aug", "Close-up selfie lip-sync", "Tight face close-up staring into the lens, lip-syncs from word 1", "Rap track ('I jump on your song…')", "High", "https://www.instagram.com/reel/Db59aS4KLgw"),
    ("IG", "reaganewman", "826K", "5.0x", "442K", "12 Sep", "Dance, phone placed", "Bedroom, white summer dress, steps toward the camera on the drop", "One Way Or Another (Remix)", "High", "https://www.instagram.com/reel/DdM25gCSU8A"),
    ("TT", "deals.and.daisies", "813K", "18.1x", "241K", "26 Aug", "Mirror lip-sync outfit", "Hand on hip at the mirror, smiling; lip-syncs a movie-dialogue sound", "Trending movie dialogue", "Medium", "https://www.tiktok.com/@deals.and.daisies/video/7678142698867526926"),
    ("IG", "buffiethebody", "771K", "11.5x", "112K", "11 Oct", "Mirror selfie fit check", "Adjusts hair and poses to the beat in a form-fitting outfit; loopable", "Hip-hop track", "High", "https://www.instagram.com/reel/DeV-sXeuLSu"),
]

EXTRAS = [
    ("IG", "_miohonda", "737K", "17.0x", "Mirror selfie, slow pan up + text hook", "https://www.instagram.com/reel/Dd981anzFSF"),
    ("TT", "liya.lovess", "729K", "14.4x", "Selfie close-up + relatable text, smiling", "https://www.tiktok.com/@liya.lovess/video/7692068460892933398"),
    ("TT", "mariac.50", "605K", "6.9x", "Lying in bed at night, selfie + text", "https://www.tiktok.com/@mariac.50/video/7699967345426550038"),
    ("IG", "medesoo0", "539K", "50.0x", "Selfie, looks into lens then away + text", "https://www.instagram.com/reel/DcP1JKniW4F"),
]

PATTERNS = [
    ("Start on frame 1", "Almost every reel starts mid-action: already posing, dancing or lip-syncing. No intro, no 'hi guys'."),
    ("Static, single shot", "One take, phone held or propped. 'Low visual change' was tagged on nearly all 20 — realism beats editing."),
    ("Short and loopable", "Most are 5–15 s and end where they begin, so viewers watch 2–3 times (boosts watch time)."),
    ("Mirror selfie = top format", "8 of 20 are mirror selfies: outfit/pose + trending audio. Easiest to film, very high outlier scores (up to 519x)."),
    ("Trending audio carries it", "Music-only mix on almost all. A recognisable song or sped-up remix is the hook, not the person talking."),
    ("Text hook optional", "When used, it's one relatable line (\"Gym outfit today\", \"me when…\"). Lyrics-as-text also works."),
    ("Home, natural light", "Bedroom, kitchen, mirror, floor. Daylight from a window or a simple warm lamp. Nothing studio-like."),
]

def esc(s): return html.escape(s)

rows = "\n".join(
    f"""<tr><td class="n">{i}</td>
<td><span class="pf {p.lower()}">{'Instagram' if p=='IG' else 'TikTok'}</span><br><b>@{esc(h)}</b><br><span class="sub">{esc(fo)} followers · {esc(d)}</span></td>
<td class="v"><b>{esc(v)}</b><br><span class="sub">{esc(x)} median</span></td>
<td><b>{esc(fmt)}</b><br>{esc(hook)}</td>
<td>{esc(audio)}</td>
<td><span class="m {m.lower()}">{m}</span></td>
<td><a href="{esc(u)}">Open reel ↗</a></td></tr>"""
    for i, (p, h, v, x, fo, d, fmt, hook, audio, m, u) in enumerate(REELS, 1))

extras = "\n".join(
    f"<tr><td>{'Instagram' if p=='IG' else 'TikTok'}</td><td><b>@{esc(h)}</b></td><td>{v} ({x})</td><td>{esc(f)}</td><td><a href='{esc(u)}'>Open reel ↗</a></td></tr>"
    for p, h, v, x, f, u in EXTRAS)

patterns = "\n".join(f"<div class='pat'><b>{esc(a)}</b><p>{esc(b)}</p></div>" for a, b in PATTERNS)

doc = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: A4 landscape; margin: 12mm 12mm 14mm; }}
* {{ box-sizing: border-box; }}
body {{ font-family: 'Inter', 'DejaVu Sans', sans-serif; color: #141414; font-size: 9.5pt; margin: 0; }}
h1 {{ font-size: 22pt; margin: 0 0 2mm; letter-spacing: -0.5px; }}
h2 {{ font-size: 13pt; margin: 6mm 0 3mm; border-left: 4px solid #9BCB00; padding-left: 3mm; }}
.lead {{ color: #555; margin: 0 0 4mm; }}
.meta {{ display: flex; gap: 4mm; margin-bottom: 4mm; }}
.meta div {{ background: #f3f6ea; border-radius: 6px; padding: 2.5mm 4mm; }}
.meta b {{ display: block; font-size: 14pt; }}
table {{ width: 100%; border-collapse: collapse; }}
th {{ text-align: left; font-size: 8pt; text-transform: uppercase; letter-spacing: .5px; color: #666; border-bottom: 2px solid #141414; padding: 2mm 2mm; }}
td {{ border-bottom: 1px solid #e3e3e3; padding: 2mm; vertical-align: top; }}
tr {{ page-break-inside: avoid; }}
td.n {{ font-weight: 700; color: #9BCB00; font-size: 12pt; width: 8mm; }}
td.v {{ white-space: nowrap; }}
.sub {{ color: #777; font-size: 8pt; }}
.pf {{ font-size: 7pt; font-weight: 700; padding: .5mm 1.5mm; border-radius: 3px; color: #fff; }}
.pf.ig {{ background: #d62976; }} .pf.tt {{ background: #111; }}
.m {{ font-weight: 700; padding: .7mm 2mm; border-radius: 3px; font-size: 8pt; }}
.m.high {{ background: #C6FF00; }} .m.medium {{ background: #ffe08a; }}
a {{ color: #1a56db; text-decoration: none; font-weight: 600; white-space: nowrap; }}
.pats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }}
.pat {{ border: 1px solid #e3e3e3; border-radius: 6px; padding: 3mm; }}
.pat p {{ margin: 1mm 0 0; color: #444; font-size: 8.5pt; }}
.note {{ font-size: 8pt; color: #666; margin-top: 3mm; }}
</style></head><body>
<h1>Viral Selfie-Reel Reference Sheet</h1>
<p class="lead">20 simple, phone-shot reels (selfie, propped phone or mirror · lip-sync / pose to trending audio · home setting) that strongly outperformed their creator's usual views. For format &amp; style reference — make original content, don't copy people.</p>
<div class="meta">
<div><b>20</b>references</div><div><b>771K – 4.6M</b>views each</div><div><b>10 IG · 10 TikTok</b>platforms</div><div><b>Jul – Oct 2026</b>posted</div><div><b>50K+</b>followers per creator</div>
</div>
<h2>Top 20 references (sorted by views)</h2>
<table><thead><tr><th>#</th><th>Creator</th><th>Views</th><th>Format &amp; setup / hook</th><th>Audio</th><th>Match</th><th>Link</th></tr></thead>
<tbody>{rows}</tbody></table>
<p class="note">"x median" = how many times more views this reel got than the creator's typical reel (vidIQ outlier score) — a high number means the <i>format</i> worked, not just the account size. Match = how closely it fits the brief (simple, home, selfie/propped phone, lip-sync/pose to music).</p>
<h2>What these 20 have in common</h2>
<div class="pats">{patterns}</div>
<h2>Extra references</h2>
<table><thead><tr><th>Platform</th><th>Creator</th><th>Views</th><th>Format</th><th>Link</th></tr></thead><tbody>{extras}</tbody></table>
<p class="note">Source: vidIQ Instagram/TikTok outlier search, run 26 Oct 2026 (posts from 1 Jun 2026, 300K+ views, creators with 50K+ followers). View counts are as of that date. Format descriptions come from vidIQ's automated analysis of each reel. Links may stop working if a creator deletes a post.</p>
</body></html>"""

out_html = HERE / "reel_references.html"
out_html.write_text(doc)
js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://{out_html}');await p.pdf({{path:'{HERE / "reel_references.pdf"}',format:'A4',landscape:true,printBackground:true,
displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:7pt;color:#888;width:100%;text-align:center">Viral Selfie-Reel Reference Sheet · page <span class=pageNumber></span>/<span class=totalPages></span></div>',margin:{{top:'12mm',bottom:'14mm',left:'12mm',right:'12mm'}}}});await b.close();}})();"""
subprocess.run(["node", "-e", js], check=True)
print("wrote", HERE / "reel_references.pdf")
