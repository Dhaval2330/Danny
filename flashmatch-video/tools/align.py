import re, subprocess, sys, json
vo, script = sys.argv[1], sys.argv[2]
out = subprocess.run(['ffmpeg','-i',vo,'-af','silencedetect=noise=-35dB:d=0.28','-f','null','-'],capture_output=True,text=True).stderr
starts=[float(m) for m in re.findall(r'silence_start: ([\d.]+)',out)]
ends=[float(m) for m in re.findall(r'silence_end: ([\d.]+)',out)]
durs=dict(zip([float(m) for m in re.findall(r'silence_end: ([\d.]+)',out)],[float(m) for m in re.findall(r'silence_duration: ([\d.]+)',out)]))
first = ends[0] if starts and starts[0] < 0.05 else 0.0
last = starts[-1] if len(starts) > len(ends) else float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',vo],capture_output=True,text=True).stdout)
paras=[p.strip() for p in open(script).read().strip().split('\n') if p.strip()]
# paragraph starts: estimate by chars, snap to pause ends
tot=sum(len(p) for p in paras); cum=0; res=[]
pauses=[e for e in ends if e>first+0.5]
for i,p in enumerate(paras):
    if i==0: t=first
    else:
        est=first+(last-first)*cum/tot
        near=[e for e in pauses if abs(e-est)<3.0] or pauses
        t=max(near,key=lambda e:durs[e]-0.08*abs(e-est)) if near is not pauses else min(pauses,key=lambda e:abs(e-est))
    res.append(round(t,2)); cum+=len(p)
for t,p in zip(res,paras): print(f"{t:7.2f}  {p[:70]}")
json.dump(res,open(sys.argv[3],'w'))
