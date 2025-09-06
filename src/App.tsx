import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Save, FolderOpen, Settings, Image as ImageIcon, Camera, Move, Wand2, Square, Scissors, Crop, SkipBack, SkipForward, Library as LibraryIcon, Video, Brush, Palette, Eraser, Trash2, PersonStanding, ChevronsDown, Pencil, RotateCw, ZoomIn, Star } from "lucide-react";

/* == constants/helpers (compact) == */
const BB = "#aee2ff"; const ol = (w=1)=>({outline:`${w}px solid ${BB}`}); const arMap:any={"16:9":16/9,"4:3":4/3,"1:1":1,"9:16":9/16,"2.39:1":2.39};
const fitAR=(w:number,h:number,r?:number)=>{if(!r)return{w,h};const c=w/h;return c>r?{w:h*r,h}:{w,h:w/r}};
const eText=(t:string)=>{const b=(t||"").trim();if(!b)return"Cinematic sequence: moody lighting; shallow DOF; textured film grain.";if(/Cinematic sequence:|Lens:|Lighting:|Motion:|Stock:/.test(b))return b;return`Cinematic sequence: ${b}.\nLens: 35mm, T1.8.\nLighting: soft key, practical spill, haze.\nMotion: subtle dolly/handheld drift.\nPalette: muted neutrals + baby blue.\nStock: 400 ISO, light halation.`};
const secs=(tf:number,fps:number)=>Array.from({length:Math.max(1,Math.round(tf/Math.max(1,fps)))+1},(_,i)=>i);

/* == tiny inline icons == */
const TrajectoryIcon=({size=16,stroke="currentColor"}:{size?:number;stroke?:string})=> (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17c4-6 14-6 18 0"/><path d="M19 15l2 2-2 2"/></svg>
);
const ShotExt=({size=16,stroke="currentColor"}:{size?:number;stroke?:string})=> (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="7"/><path d="M12 6V3"/><path d="M9 3h6"/><path d="M12 10v4"/><path d="M14 12h-4"/><path d="M18 8h3"/><path d="M19.5 6.5v3"/></svg>
);
const StyleIcon=({size=16,stroke="currentColor"}:{size?:number;stroke?:string})=> (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="14" height="12" rx="2"/><path d="M19 5v4"/><path d="M17 7h4"/></svg>
);

/* == global styles (lean + spring) == */
const Global=()=> (<style>{`
  /* baby-blue sliders */
  .slider-baby .bg-primary, .slider-baby [class*="bg-primary"]{background:${BB}!important}
  .slider-baby .bg-secondary, .slider-baby [class*="bg-secondary"]{background:rgba(174,226,255,.18)!important}
  .slider-baby [role="slider"]{width:10px;height:10px;border:1px solid ${BB}!important;background:${BB}!important}
  /* brush range */
  .brush-range{accent-color:${BB}}
  .brush-range::-webkit-slider-thumb,.brush-range::-moz-range-thumb{width:10px;height:10px;border-radius:9999px;background:${BB}}
  /* micro animations */
  .slide-in{transform:translateY(-8px);opacity:0;animation:slide .28s cubic-bezier(.18,.9,.2,1) forwards}
  @keyframes slide{to{transform:translateY(0);opacity:1}}
  .spring-in{animation:spring .42s cubic-bezier(.2,1.2,.2,1)}
  @keyframes spring{0%{transform:scale(.96)}60%{transform:scale(1.04)}100%{transform:scale(1)}}
  .dropfx{position:absolute;inset:0;pointer-events:none}
  .dropfx::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at center, rgba(174,226,255,.22), transparent 60%);animation:fade .6s ease-out forwards}
  @keyframes fade{from{opacity:1}to{opacity:0}}
  .spring-section{animation:reveal .44s cubic-bezier(.16,1,.3,1)}
  @keyframes reveal{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  .kf-pop{animation:kf .38s cubic-bezier(.2,1.2,.2,1)}
  @keyframes kf{0%{transform:translateY(-4px) scale(.92)}60%{transform:translateY(0) scale(1.06)}100%{transform:translateY(0) scale(1)}}
`}</style>);

/* == lightweight panel wrapper == */
const Panel=({title,icon:Icon,children}:{title?:string;icon?:any;children:any})=> (
  <div className="bg-neutral-900/50 rounded-xl p-3" style={ol(1)}>
    {title!=null && (<div className="text-sm mb-2 flex items-center gap-2" style={{color:BB}}>{Icon&&<Icon size={14}/>}<span>{title}</span></div>)}
    <div className="space-y-3">{children}</div>
  </div>
);

/* == palette/references == */
function PalettePanel(){ const [colors,setColors]=useState<string[]>([""]); const setAt=(i:number,v:string)=>setColors(p=>p.map((c,ix)=>ix===i?v:c)); const add=()=>colors.length<6&&setColors([...colors,""]); const rem=()=>colors.length>1&&setColors(colors.slice(0,-1));
  return (
    <Panel title="References" icon={ImageIcon}>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({length:4}).map((_,i)=>(<div key={i} className="aspect-square rounded bg-neutral-800/60 flex items-center justify-center" style={ol()}><ImageIcon size={20} style={{color:BB}}/></div>))}
      </div>
      <div className="space-y-2">
        <div className="text-xs text-neutral-200">Palette</div>
        <div className="flex flex-wrap gap-2 items-center">
          {colors.map((c,i)=>(<label key={i} className="relative"><input type="color" value={c||"#000000"} onChange={e=>setAt(i,(e.target as HTMLInputElement).value)} className="absolute opacity-0 inset-0 cursor-pointer"/><div className="h-6 w-6 rounded flex items-center justify-center text-[10px]" style={{...ol(),background:c||"transparent",color:c?"transparent":"#bbb"}}>{c?"":"+"}</div></label>))}
          {colors.length<6&&(<Button size="sm" variant="outline" onClick={add} className="h-6 px-2" style={{...ol(),color:BB,backgroundColor:"#000"}}>+ Color</Button>)}
          {colors.length>1&&(<Button size="sm" variant="ghost" onClick={rem} className="h-6 px-2" style={{color:"#bbb"}}>Remove</Button>)}
        </div>
        <div className="text-[10px] text-neutral-300">Activate a swatch; add up to 6.</div>
      </div>
    </Panel>
  );}

/* simple shutter: ring + crosshair */
const Shutter=()=> (
  <div className="shutter">
    <style>{`
      .shutter{position:absolute;inset:0;pointer-events:none;z-index:6}
      .shutter .ring{position:absolute;left:50%;top:50%;width:140vmax;height:140vmax;border:1.25px solid ${BB};border-radius:50%;transform:translate(-50%,-50%) scale(1);opacity:.9;animation:irisRing 680ms cubic-bezier(.2,.9,.2,1) forwards}
      @keyframes irisRing{from{transform:translate(-50%,-50%) scale(1);opacity:.9} to{transform:translate(-50%,-50%) scale(0);opacity:.45}}
      .shutter .cross{position:absolute;left:50%;top:50%;width:12vmin;height:12vmin;transform:translate(-50%,-50%);opacity:.7}
      .shutter .cross:before,.shutter .cross:after{content:"";position:absolute;left:50%;top:50%;background:${BB};opacity:.28}
      .shutter .cross:before{width:12vmin;height:1.25px;transform:translate(-50%,-50%) scaleX(.15);animation:chx 620ms cubic-bezier(.2,.9,.2,1) forwards}
      .shutter .cross:after{width:1.25px;height:12vmin;transform:translate(-50%,-50%) scaleY(.15);animation:chy 620ms cubic-bezier(.2,.9,.2,1) forwards}
      @keyframes chx{0%{opacity:0;transform:translate(-50%,-50%) scaleX(.15)}60%{opacity:.5}100%{opacity:.28;transform:translate(-50%,-50%) scaleX(1)}}
      @keyframes chy{0%{opacity:0;transform:translate(-50%,-50%) scaleY(.15)}60%{opacity:.5}100%{opacity:.28;transform:translate(-50%,-50%) scaleY(1)}}
    `}</style>
    <div className="ring"/>
    <div className="cross"/>
  </div>
);

export default function MoonvalleyUI(){
  /* tools */
  const tools=[
    {t:"Text/Image to Video",i:ImageIcon},{t:"Motion Transfer",i:Move},{t:"Camera Control",i:Camera},{t:"Trajectory Control",i:TrajectoryIcon},{t:"Pose Transfer",i:PersonStanding},{t:"Depth Control",i:Square},{t:"Reframe Shot",i:Crop},{t:"Inpainting",i:Brush},{t:"Background Replace",i:Scissors},{t:"Sketch to Video",i:Pencil},{t:"Shot Extension",i:ShotExt},
  ];
  const [tool,setTool]=useState("Text/Image to Video"); const isSketch=tool==="Sketch to Video"; const isCam=tool==="Camera Control"; const isReframe=tool==="Reframe Shot"; const needVid=["Motion Transfer","Pose Transfer","Depth Control","Reframe Shot"].includes(tool);

  /* prompt/model */
  const [prompt,setPrompt]=useState(""); const [enh,setEnh]=useState(false); const onEnh=()=>{setPrompt(eText(prompt)); setEnh(true); setTimeout(()=>setEnh(false),700);}; const [model,setModel]=useState("turbo");

  /* timeline basics */
  const [fps,setFps]=useState(24); const [len,setLen]=useState(10); const [frames,setFrames]=useState(len*fps); useEffect(()=>setFrames(len*fps),[len,fps]);
  const extSec = tool==="Shot Extension"?5:0; const dFrames = frames + extSec*fps;
  const [ph,setPh]=useState(0); const [sel,setSel]=useState<number|null>(null); const [kfs,setKfs]=useState<{id:number;frame:number;thumb?:string;styleNote?:string;styleRef?:string;}[]>([]);
  const [newKFId,setNewKFId]=useState<number|null>(null);
  const prev=()=>{ if(!kfs.length){setPh(0);setSel(null);return;} const p=kfs.filter(k=>k.frame<ph).sort((a,b)=>a.frame-b.frame).pop(); if(p){setPh(p.frame);setSel(p.id);} else {setPh(0);setSel(null);} };
  const next=()=>{ if(!kfs.length){setSel(null);setPh(frames);return;} const n=kfs.filter(k=>k.frame>ph).sort((a,b)=>a.frame-b.frame)[0]; if(n){setPh(n.frame);setSel(n.id);} else {setPh(frames);setSel(null);} };
  const [shut,setShut]=useState(false); const snap=()=>{setShut(true); setTimeout(()=>setShut(false),720);};
  const add=()=>{ const id=(kfs[kfs.length-1]?.id??0)+1; setKfs([...kfs,{id,frame:ph}]); snap(); setNewKFId(id); setTimeout(()=>{ setNewKFId(null); },480); };
  const del=(id:number)=>setKfs(p=>p.filter(k=>k.id!==id));
  const scr=useRef(false); const tlRef=useRef<HTMLDivElement|null>(null); const trackRef=useRef<HTMLDivElement|null>(null); const [secPx,setSecPx]=useState(100);
  const upd=()=>{ const el=trackRef.current||tlRef.current; if(!el) return; const r=el.getBoundingClientRect(); setSecPx(r.width/Math.max(1,len+extSec)); }; useEffect(()=>{upd(); window.addEventListener("resize",upd); return()=>window.removeEventListener("resize",upd);},[]); useEffect(()=>{upd();},[len,extSec,tool]);
  const setFrom=(e:any)=>{ const el=trackRef.current||tlRef.current; if(!el) return; const r=el.getBoundingClientRect(); const x=Math.min(Math.max(e.clientX-r.left,0),r.width); setPh(Math.round((x/r.width)*dFrames)); };
  const dragKF=useRef<number|null>(null); const dragRAF=useRef<number|null>(null); const dragTargetF=useRef<number|null>(null);

  /* play loop */
  const playRef=useRef(false); const [playing,setPlaying]=useState(false); const raf=useRef<number|null>(null); const last=useRef(0);
  const toggle=()=>{ playRef.current=!playRef.current; setPlaying(playRef.current); if(playRef.current){ last.current=performance.now(); const step=(now:number)=>{ const dt=now-last.current,adv=Math.floor((dt/1000)*fps); if(adv>=1){ setPh(p=>{ const n=Math.min(frames,p+adv); if(n>=frames){ playRef.current=false; setPlaying(false); if(raf.current) cancelAnimationFrame(raf.current); raf.current=null;} return n;}); last.current=now;} if(playRef.current) raf.current=requestAnimationFrame(step);}; raf.current=requestAnimationFrame(step);} else { if(raf.current) cancelAnimationFrame(raf.current); raf.current=null; } };
  useEffect(()=>()=>{ if(raf.current) cancelAnimationFrame(raf.current); },[]);

  /* canvas */
  const [cImg,setCImg]=useState<string|null>(null); const [cVid,setCVid]=useState<string|null>(null); const contRef=useRef<HTMLDivElement|null>(null);
  const [layers]=useState([{id:1,name:"Layer 1"}]); const [active]=useState(1); const canv=useRef<Map<number,HTMLCanvasElement>>(new Map()); const [bSize,setBSize]=useState(12); const [bColor,setBColor]=useState(BB); const [erase,setErase]=useState(false); const drawing=useRef(false);
  const [ar,setAr]=useState("16:9"); const [guide,setGuide]=useState({w:0,h:0});
  const [dropFx,setDropFx]=useState(false);
  const onDrop=(e:any)=>{ e.preventDefault(); const lib=e.dataTransfer.getData('application/x-library'); if(lib){ try{ const it=JSON.parse(lib); if(it.kind==='video'){ setCVid(it.src); setCImg(null);} else if(it.kind==='image'){ setCImg(it.src); setCVid(null);} add(); setDropFx(true); setTimeout(()=>setDropFx(false),600); return;}catch{}} const f=e.dataTransfer.files?.[0]; if(!f) return; const url=URL.createObjectURL(f); if(f.type?.startsWith("video")){ setCVid(url); setCImg(null);} else { setCImg(url); setCVid(null);} setDropFx(true); setTimeout(()=>setDropFx(false),600); };
  const prevent=(e:any)=>e.preventDefault();
  const resize=()=>{ if(!contRef.current) return; const {clientWidth:w,clientHeight:h}=contRef.current; canv.current.forEach(c=>{c.width=w; c.height=h;}); setGuide(fitAR(w,h,arMap[ar])); };
  useEffect(()=>{ resize(); window.addEventListener("resize",resize); return()=>window.removeEventListener("resize",resize);},[]); useEffect(()=>{resize();},[ar]);
  const startDraw=(e:any)=>{ if(!isSketch) return; drawing.current=true; draw(e); }; const endDraw=()=>{ drawing.current=false; };
  const draw=(e:any)=>{ if(!drawing.current||!isSketch) return; const c=canv.current.get(active); if(!c) return; const r=c.getBoundingClientRect(); const x=e.clientX-r.left,y=e.clientY-r.top; const ctx=c.getContext("2d"); if(!ctx) return; ctx.globalCompositeOperation=erase?"destination-out":"source-over"; ctx.fillStyle=bColor; ctx.beginPath(); ctx.arc(x,y,bSize/2,0,Math.PI*2); ctx.fill(); };

  /* reframe + camera */
  const [rf,setRf]=useState({x:0,y:0,scale:1}); const rfDrag=useRef(false); const rfLast=useRef({x:0,y:0});
  const onRfDown=(e:any)=>{ if(!isReframe) return; rfDrag.current=true; rfLast.current={x:e.clientX-rf.x,y:e.clientY-rf.y}; };
  const onRfMove=(e:any)=>{ if(!isReframe||!rfDrag.current) return; setRf(p=>({...p,x:e.clientX-rfLast.current.x,y:e.clientY-rfLast.current.y})); };
  const onRfUp=()=>{ rfDrag.current=false; };
  const onWheel=(e:any)=>{ if(!isReframe) return; e.preventDefault(); const d=Math.sign(e.deltaY); setRf(p=>({...p,scale:Math.max(0.2,Math.min(5,p.scale*(d<0?1.05:0.95)))})); };
  const [cam,setCam]=useState({yaw:0,pitch:-20,roll:0}); const [camTool,setCamTool]=useState("rotation"); const camDrag=useRef(false);
  const startCam=()=>{ if(!isCam) return; camDrag.current=true; }; const endCam=()=>{ camDrag.current=false; };
  const onCamMove=(e:any)=>{ if(!isCam||!camDrag.current||!contRef.current) return; setCam(p=>({yaw:p.yaw+e.movementX*0.2,pitch:Math.max(-89,Math.min(89,p.pitch+e.movementY*0.2)),roll:p.roll})); };
  const [camPreset,setCamPreset]=useState("None"); const tweenTo=(t:any)=>{ const dur=600; let st=0; const from={...cam}; const step=(tm:number)=>{ if(!st) st=tm; const k=Math.min(1,(tm-st)/dur); const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; setCam({yaw:from.yaw+(t.yaw-from.yaw)*e,pitch:from.pitch+(t.pitch-from.pitch)*e,roll:from.roll+(t.roll-from.roll)*e}); if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
  const applyPreset=(p:string)=>{ setCamPreset(p); const map:any={"Orbit Left":{yaw:cam.yaw-60,pitch:cam.pitch,roll:0},"Orbit Right":{yaw:cam.yaw+60,pitch:cam.pitch,roll:0},"Dolly In":{yaw:cam.yaw,pitch:cam.pitch-10,roll:0},"Crane Up":{yaw:cam.yaw,pitch:cam.pitch-30,roll:0}}; if(map[p]) tweenTo(map[p]); };

  /* outputs + style frame */
  const [gallery]=useState(Array.from({length:6}).map((_,i)=>({id:i+1,thumb:null,title:`Clip ${i+1}`,duration:`${(i%5)+4}s`,src:""})));
  const [libTab,setLibTab]=useState("Videos"); const [gen,setGen]=useState(false); const genNow=()=>{ setGen(true); setTimeout(()=>setGen(false),800); };
  const [more,setMore]=useState(false); const [flip,setFlip]=useState(false); useEffect(()=>{ setFlip(true); const t=setTimeout(()=>setFlip(false),140); return()=>clearTimeout(t); },[tool]);
  const [favs,setFavs]=useState<Set<number>>(new Set()); const toggleFav=(id:number)=>setFavs(p=>{const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n;});
  const [sfOpen,setSfOpen]=useState(false); const [sfText,setSfText]=useState(""); const [sfTarget,setSfTarget]=useState<{id?:number;frame?:number}|null>(null);
  const openSF=(t:{id?:number;frame?:number})=>{ setSfTarget(t); setSfText(""); setSfOpen(true); snap(); };
  const applySF=()=>{ if(sfTarget?.id!=null){ setKfs(p=>p.map(k=>k.id===sfTarget.id?{...k,styleNote:sfText}:k)); } setSfOpen(false); snap(); };
  const sfRef=useRef<HTMLInputElement|null>(null); const onSFUpload=(e:any)=>{ const f=e.target.files?.[0]; if(!f) return; const url=URL.createObjectURL(f); if(sfTarget?.id!=null){ setKfs(p=>p.map(k=>k.id===sfTarget.id?{...k,styleRef:url}:k)); } e.target.value=""; };
  const openSFBtn=()=>{ let t=kfs.find(k=>k.frame===ph); if(!t){ const id=(kfs[kfs.length-1]?.id??0)+1; t={id,frame:ph,thumb:cImg||undefined} as any; setKfs([...kfs,t as any]); } setSel((t as any).id); openSF({id:(t as any).id,frame:(t as any).frame}); };

  /* flip animation key for tool panel */
  const [panelKey,setPanelKey]=useState(0); useEffect(()=>{ setPanelKey(k=>k+1); },[isSketch,isCam]);

  return (
    <div className="fixed inset-0 flex flex-col text-neutral-100 font-sans">
      <Global/>
      <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,#202225,#181a1e 60%,#13161a)"}}/>
      <div className="pointer-events-none absolute inset-0 opacity-[0.16]" style={{backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,0.06) 0 1px,transparent 1px 3px)"}}/>

      {/* header */}
      <header className="relative z-10 flex justify-between items-center px-6 py-3 bg-neutral-950/70">
        <div className="flex gap-2"><Button variant="ghost"><FolderOpen size={18}/></Button><Button variant="ghost"><Save size={18}/></Button></div>
        <Input defaultValue="Untitled Project" className="bg-transparent border-none text-lg font-semibold tracking-wide text-center w-1/3 text-white placeholder-neutral-400"/>
        <div className="flex gap-2"><Button variant="ghost"><Settings size={18}/></Button></div>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* left */}
        <aside className="w-[26rem] p-4 space-y-3 overflow-y-auto">
          <Panel title="Shot">
            <Input placeholder="Shot name" className="bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-neutral-400"/>
            <div className="space-y-2">
              <label className="text-xs" style={{color:BB}}>Prompt</label>
              <div>
                <Textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={10} placeholder="Describe your video..." className="bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-neutral-400"/>
                <div className="mt-3 flex justify-end"><Button onClick={onEnh} className="h-8 px-3 rounded-md text-[11px] flex items-center gap-1" style={{color:enh?"#0b0f13":BB,background:enh?BB:"#000",...ol()}}><Wand2 size={14}/><span>Enhance prompt</span></Button></div>
              </div>
            </div>
            <div className="space-y-2"><label className="text-xs" style={{color:BB}}>Negative Prompt</label><Textarea rows={3} placeholder="What to avoid..." className="bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-neutral-400"/></div>
            <Button onClick={genNow} className="w-full font-semibold" style={{backgroundColor:gen?"#000":BB,color:gen?BB:"#0b0f13",border:gen?`1px solid ${BB}`:undefined}}><Play size={16} className="mr-2"/>{tool==="Shot Extension"?"Extend Shot":"Generate"}</Button>
            <div className="grid grid-cols-2 gap-2 text-xs">{["turbo","quality"].map(m=>(<Button key={m} onClick={()=>setModel(m)} variant="ghost" className="h-8 rounded-md" style={{...ol(),backgroundColor:model===m?BB:"#000",color:model===m?"#0b0f13":"#e6f6ff"}}>{m==="turbo"?"Fast (Turbo)":"Quality"}</Button>))}</div>
          </Panel>
        </aside>

        {/* center */}
        <main className="flex-1 flex flex-col overflow-auto">
          <div className="px-4 pt-3 pb-2 flex items-center gap-2 flex-wrap mb-2">
            {tools.map(({t,i:Icon})=>{ const a=tool===t; return (<Button key={t} size="icon" variant="ghost" onClick={()=>setTool(t)} className={`h-10 w-10 rounded-lg ${a?"bg-neutral-800/40":"hover:bg-neutral-800/30"}`} title={t} style={{color:a?BB:"#d9f1ff",outline:a?`1px solid ${BB}`:undefined}}><Icon size={18}/></Button>); })}
            <div className="ml-2 text-xs" style={{color:BB,transition:"transform 300ms, opacity 300ms",transform:flip?"rotateX(90deg)":"rotateX(0deg)",opacity:flip?0.6:1}}>{tool}</div>
          </div>

          <div className="px-4 pb-2 flex flex-col items-center gap-2">
            {(isSketch||isCam)&&(
              <div key={panelKey} className="slide-in flex items-center gap-3 text-xs rounded-lg px-3 py-2" style={{color:"#e8f7ff",background:"rgba(17,18,22,0.6)",...ol()}}>
                {isSketch&&(<><Brush size={14} style={{color:BB}}/> Brush<div className="flex items-center gap-2"><span>Size</span><input type="range" min="1" max="50" value={bSize} onChange={e=>setBSize(parseInt((e.target as HTMLInputElement).value))} className="brush-range"/></div><div className="flex items-center gap-2"><Palette size={14} style={{color:BB}}/><input type="color" value={bColor} onChange={e=>setBColor((e.target as HTMLInputElement).value)} className="h-5 w-8 bg-transparent rounded"/></div><Button size="icon" variant="ghost" title="Eraser" onClick={()=>setErase(!erase)} style={{color:erase?"#0b0f13":BB,backgroundColor:erase?BB:"transparent"}}><Eraser size={14}/></Button></>)}
                {isCam&&(<div className="flex items-center gap-4"><div className="text-neutral-200"><span style={{color:BB}}>3D Camera</span> - WASD + drag</div><div className="flex items-center gap-2">{["position","rotation","zoom"].map(m=>{ const a=camTool===m; const I:any=m==="position"?Move:m==="rotation"?RotateCw:ZoomIn; return (<Button key={m} size="icon" variant="ghost" onClick={()=>setCamTool(m)} title={m} className="h-8 w-8" style={{...ol(),color:a?"#0b0f13":BB,backgroundColor:a?BB:"transparent"}}><I size={14}/></Button>); })}</div><Select value={camPreset} onValueChange={applyPreset}><SelectTrigger className="w-40 bg-neutral-900 text-neutral-100" style={ol()}><SelectValue placeholder="Preset"/></SelectTrigger><SelectContent className="bg-neutral-900 text-neutral-100" style={ol()}>{["None","Orbit Left","Orbit Right","Dolly In","Crane Up"].map(p=>(<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>)}
              </div>
            )}

            <div ref={contRef} onDrop={onDrop} onDragOver={prevent} onMouseMove={e=>{onCamMove(e); onRfMove(e);}} onMouseDown={e=>{startCam(); onRfDown(e);}} onMouseUp={()=>{endCam(); onRfUp();}} onMouseLeave={()=>{endCam(); onRfUp();}} onWheel={onWheel} className={`relative w-full max-w-5xl h-80 rounded-2xl overflow-hidden ${dropFx?"spring-in":""}`} style={ol(1)}>
              {!isCam&&(<div className="absolute inset-0 opacity-[0.14]" style={{backgroundImage:`linear-gradient(to right, ${BB} 1px, transparent 1px), linear-gradient(to bottom, ${BB} 1px, transparent 1px)`,backgroundSize:"24px 24px"}}/>) }
              {isCam&&(<><div className="absolute inset-0 pointer-events-none" style={{zIndex:0}}><div className="absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2" style={{perspective:"1400px"}}><div className="w-[600%] h-[600%] origin-center" style={{transformStyle:"preserve-3d",transform:`rotateX(${70+cam.pitch}deg) rotateY(${cam.yaw}deg) rotateZ(${cam.roll}deg) translateZ(-360px)`}}><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" style={{backgroundImage:`linear-gradient(${BB} 2px, transparent 2px), linear-gradient(90deg, ${BB} 2px, transparent 2px)`,backgroundSize:"48px 48px",opacity:.9,transform:"rotateX(90deg) translateZ(360px)"}}/></div></div></div><div className="absolute left-3 bottom-3 w-16 h-16" style={{perspective:"700px",zIndex:2}}><div className="relative w-full h-full" style={{transformStyle:"preserve-3d",transform:`rotateX(${cam.pitch}deg) rotateY(${cam.yaw}deg) rotateZ(${cam.roll}deg)`}}><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-[2px]" style={{background:BB,opacity:.95}}/><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-[2px]" style={{background:BB,opacity:.95}}/><div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-10" style={{background:BB,opacity:.9,transform:"rotateY(90deg) translateZ(14px)"}}/><div className="absolute right-0 top-0 text-[9px]" style={{color:BB}}>X</div><div className="absolute right-0 bottom-0 text-[9px]" style={{color:BB}}>Y</div><div className="absolute left-0 top-0 text-[9px]" style={{color:BB}}>Z</div></div></div></>)}

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center"><div style={{width:guide.w,height:guide.h,outline:`1px dashed ${BB}`,opacity:.35,borderRadius:8}}/></div>
              {!cImg&&!cVid&&(<div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-300 text-xs space-y-2 pointer-events-none"><ImageIcon size={28} style={{color:BB}}/><span>{needVid?"Import video to preview":"Import image or video to preview"}</span></div>)}
              <div className="absolute inset-0" style={isReframe?{transform:`translate(${rf.x}px,${rf.y}px) scale(${rf.scale})`,transformOrigin:"center"}:{}}>
                {cVid&&(<video src={cVid} className={`absolute inset-0 w-full h-full ${isReframe?"object-cover":"object-contain"}`} autoPlay loop muted playsInline/>) }
                {cImg&&(<img src={cImg} alt="canvas" className={`absolute inset-0 w-full h-full ${isReframe?"object-cover":"object-contain"}`}/>) }
              </div>
              {layers.map(l=>(<canvas key={l.id} ref={el=>{ if(el) canv.current.set(l.id,el as any); }} onMouseDown={startDraw} onMouseUp={endDraw} onMouseLeave={endDraw} onMouseMove={draw} className={`absolute inset-0 ${isSketch?"cursor-crosshair":"pointer-events-none"}`}/>))}
              {shut&&(<Shutter/>)}
              {dropFx&&(<div className="dropfx"/>) }
            </div>
          </div>

          {/* timeline */}
          <div className="h-[188px] px-4 pb-2">
            <div className="flex flex-col h-full rounded-xl p-2 text-neutral-300" style={ol(1)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div onClick={add} className="cursor-pointer rounded-md px-2 py-1 text-[11px] text-neutral-200" style={{...ol(),background:"rgba(17,18,22,0.6)"}}>+ Add Keyframe</div>
                  <Button size="icon" variant="ghost" title="Delete selected keyframe" onClick={()=>sel!=null&&del(sel)} disabled={sel==null} className="h-7 w-7" style={{color:sel==null?"#6b7280":BB,...ol(),background:sel==null?"transparent":"rgba(17,18,22,0.6)"}}><Trash2 size={14}/></Button>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" title="Previous Keyframe" onClick={prev} style={{color:BB}}><SkipBack size={16}/></Button>
                  <Button size="icon" variant="ghost" title={playing?"Pause":"Play"} onClick={toggle} style={{color:BB}}>{playing?<Pause size={16}/>:<Play size={16}/>}</Button>
                  <Button size="icon" variant="ghost" title="Next Keyframe" onClick={next} style={{color:BB}}><SkipForward size={16}/></Button>
                </div>
                <div className="w-48 flex justify-end"><Button size="sm" variant="ghost" onClick={openSFBtn} className="h-8 px-2 flex items-center gap-2" style={{...ol(),color:BB}} title="Style Frame"><StyleIcon size={14}/><span className="text-xs">Style Frame</span></Button></div>
              </div>
              <div className="h-7 relative text-[10px] text-neutral-200 flex items-end">
                <div className="absolute inset-y-0" style={{backgroundImage:`repeating-linear-gradient(to right, rgba(255,255,255,0.35) 0 1px, transparent 1px ${secPx}px)`,opacity:.25,left:"38px",right:"38px"}}/>
                <div className="flex-1 flex justify-between px-[38px] w-full">{secs(dFrames,fps).map(n=>(<span key={n}>{n}s</span>))}</div>
              </div>
              <div
                ref={tlRef}
                onMouseDown={e=>{scr.current=true; setFrom(e);}}
                onMouseMove={e=>{ const r=(trackRef.current||tlRef.current)?.getBoundingClientRect(); if(dragKF.current!=null&&r){ const x=Math.min(Math.max(e.clientX-r.left,0),r.width); const f=Math.round((x/r.width)*dFrames); dragTargetF.current=f; if(!dragRAF.current){ const step=()=>{ if(dragKF.current!=null && dragTargetF.current!=null){ setKfs(p=>p.map(k=>k.id===dragKF.current?{...k,frame:dragTargetF.current as number}:k)); dragRAF.current=requestAnimationFrame(step); } else { dragRAF.current=null; } }; dragRAF.current=requestAnimationFrame(step);} } else if(scr.current) setFrom(e); }}
                onMouseUp={()=>{scr.current=false; dragKF.current=null; dragTargetF.current=null; if(dragRAF.current){ cancelAnimationFrame(dragRAF.current); dragRAF.current=null; }}}
                onMouseLeave={()=>{scr.current=false; dragKF.current=null; dragTargetF.current=null; if(dragRAF.current){ cancelAnimationFrame(dragRAF.current); dragRAF.current=null; }}}
                className="relative flex-1 min-h-[5.6rem] rounded-lg text-xs text-neutral-200 px-0 py-3 overflow-hidden" style={{outline:`1px dashed ${BB}`,paddingBottom:10}}
              >
                <div className="pointer-events-none absolute inset-y-0 left-[38px] right-[38px]" style={{backgroundImage:`repeating-linear-gradient(to right, rgba(255,255,255,0.25) 0 1px, transparent 1px ${secPx}px)`,opacity:.15}}/>
                {/* Shot Extension cross-hatch */}
                {extSec>0 && (
                  <div className="absolute inset-y-2 left-[38px] right-[38px] pointer-events-none">
                    <div className="absolute top-0 bottom-0" style={{left:`${(frames/Math.max(1,dFrames))*100}%`, right:0, backgroundImage:"repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0 8px, transparent 8px 16px)", opacity:.25}}/>
                  </div>
                )}
                <div ref={trackRef} className="absolute inset-y-2 left-[38px] right-[38px]">
                  {/* drop zone bounds */}
                  <div className="absolute top-0 bottom-0 w-[2px] opacity-30" style={{left:0, background:"rgba(255,255,255,0.22)"}}/>
                  <div className="absolute top-0 bottom-0 w-[2px] opacity-30" style={{right:0, background:"rgba(255,255,255,0.22)"}}/>
                  {kfs.map(k=>{ const left=(k.frame/Math.max(1,dFrames))*100; const on=sel===k.id; const at=k.frame===ph; return (
                    <div key={k.id} onMouseDown={(e)=>{e.stopPropagation(); dragKF.current=k.id; setSel(k.id);}} onMouseUp={()=>{dragKF.current=null; dragTargetF.current=null;}} onClick={(e)=>{e.stopPropagation(); setSel(k.id);}} onDoubleClick={(e)=>{e.stopPropagation(); setSel(k.id); openSF({id:k.id,frame:k.frame});}} className="absolute select-none cursor-grab active:cursor-grabbing" style={{left:`calc(${left}% )`,transform:"translateX(-50%)",top:1,willChange:"left, transform"}}>
                      <div className={`${k.id===newKFId?"kf-pop":""} flex flex-col items-center`}>
                        <div className="mb-2 rotate-45" style={{width:12,height:12,backgroundColor:on||at?"#fff":BB,boxShadow:on||at?`0 0 0 2px ${BB}`:"none"}}/>
                        <div onDoubleClick={()=>openSF({id:k.id,frame:k.frame})} className="relative w-[72px] h-12 bg-neutral-800/60 rounded overflow-hidden flex items-center justify-center" style={ol()}>
                          {k.thumb?<img src={k.thumb} className="w-full h-full object-cover"/>:<ImageIcon size={18} style={{color:BB}}/>}
                          {k.styleNote&&(<div className="absolute top-1 left-1 rounded px-1 py-0.5 flex items-center gap-1" style={{background:BB,color:"#0b0f13"}}><StyleIcon size={10} stroke="#0b0f13"/><span className="text-[9px] leading-none">SF</span></div>)}
                          <div className="absolute bottom-0 right-0 text-[10px] px-1 py-0.5 bg-neutral-900/80" style={{color:BB,borderTopLeftRadius:4}}>F{k.frame}</div>
                        </div>
                      </div>
                      {on&&(<Button size="icon" variant="ghost" title="Delete keyframe" onClick={(e)=>{e.stopPropagation(); del(k.id);}} onMouseDown={(e)=>{e.stopPropagation();}} className="h-7 w-7 absolute -right-2 -top-2" style={{zIndex:10}}><Trash2 size={12}/></Button>)}
                    </div>
                  );})}
                  <div className="absolute top-0 h-full w-[2px]" style={{left:`${(ph/Math.max(1,dFrames))*100}%`,backgroundColor:BB}}/>
                </div>
              </div>
            </div>
          </div>

          {sfOpen&&(<section className="px-4 pb-2 spring-section"><div className="max-w-5xl mx-auto rounded-xl p-3 bg-neutral-900/60" style={ol()}><div className="flex items-center justify_between text-xs mb-2" style={{color:BB}}><span>Style Frame ({sfTarget?.frame!=null?sfTarget.frame:Math.round(ph)})</span></div><Textarea rows={4} value={sfText} onChange={e=>setSfText(e.target.value)} placeholder="Describe the style or change for this frame..." className="bg-neutral-800 border-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0 text_white placeholder-neutral-400"/><div className="mt-2 flex items-center justify-between"><span><input ref={sfRef} type="file" accept="image/*" className="hidden" onChange={onSFUpload}/><Button size="icon" variant="ghost" onClick={()=>sfRef.current?.click()} title="Upload image" style={{color:BB}}><ImageIcon size={14}/></Button></span><div className="flex gap-2"><Button onClick={applySF} className="h-8 px-3" style={{...ol(),background:BB,color:"#0b0f13"}}>Apply Style</Button><Button variant="ghost" onClick={()=>setSfOpen(false)} className="h-8 px-3" style={{color:BB}}>Cancel</Button></div></div></div></section>)}

          {/* outputs */}
          <div className="flex justify-center pt-1"><Button variant="ghost" onClick={()=>setMore(v=>!v)} size="sm" className="h-7 px-2 flex items-center gap-2" style={{color:BB}}><ChevronsDown className={`${more?"rotate-180":""} transition-transform`} size={16}/><span className="text-xs">History</span></Button></div>
          {more&&(<section className="px-4 pb-8 mt-6 spring-section"><div className="max-w-6xl mx_auto"><h3 className="text-sm mb-3" style={{color:BB}}>Outputs</h3><div className="grid grid-cols-3 gap-3">{gallery.map(it=>(<div key={it.id} className="aspect-video rounded-xl overflow-hidden bg-neutral-800/60 relative" style={ol()} draggable onDragStart={e=>{e.dataTransfer.setData('application/x-library',JSON.stringify({kind:'video',src:it.src||''}));}}><Button size="icon" variant="ghost" onClick={e=>{e.stopPropagation(); toggleFav(it.id);}} className="absolute top-2 right-2 h-7 w-7 rounded-md" style={{...ol(),backgroundColor:favs.has(it.id)?BB:"transparent",color:favs.has(it.id)?"#0b0f13":BB}} title={favs.has(it.id)?"Unstar":"Star"}><Star size={14} fill={favs.has(it.id)?"#0b0f13":"none"}/></Button><div className="absolute inset-0 flex items-center justify-center text-neutral-300"><Video size={28}/></div><div className="absolute left-0 right-0 bottom-0 text-[11px] px-2 py-1 bg-neutral-950/70 flex justify-between"><span>{it.title}</span><span>{it.duration}</span></div></div>))}</div></div></section>)}
        </main>

        {/* right */}
        <aside className="w-[22rem] p-4 space-y-3 overflow-y-auto">
          <Panel title="Library" icon={LibraryIcon}>
            <div className="grid grid-cols-4 gap-2 text-[11px]">{["Images","Videos","Outputs","Projects"].map(t=>(<Button key={t} variant="ghost" onClick={()=>setLibTab(t)} className="h-7 px-2" style={{color:libTab===t?"#0b0f13":BB,backgroundColor:libTab===t?BB:"transparent",...ol()}}>{t}</Button>))}</div>
            <div className="mt-2" style={{minHeight:"220px"}}>
              {libTab==="Images"&&(<div className="grid grid-cols-3 gap-2">{Array.from({length:6}).map((_,i)=>(<div key={i} className="aspect-video rounded bg-neutral-800/60 flex items-center justify-center" style={ol()} draggable onDragStart={e=>{e.dataTransfer.setData('application/x-library',JSON.stringify({kind:'image',src:''}));}}><ImageIcon size={18} style={{color:BB}}/></div>))}</div>)}
              {libTab==="Videos"&&(<div className="grid grid-cols-3 gap-2">{gallery.slice(0,6).map(it=>(<div key={it.id} className="aspect-video rounded overflow-hidden bg-neutral-800/60" style={ol()} draggable onDragStart={e=>{e.dataTransfer.setData('application/x-library',JSON.stringify({kind:'video',src:it.src||''}));}}><div className="w-full h-full flex items-center justify-center text-neutral-300"><Video size={20}/></div></div>))}</div>)}
              {libTab==="Outputs"&&(<div className="grid grid-cols-3 gap-2">{gallery.slice(0,6).map(it=>(<div key={it.id} className="aspect-video rounded overflow-hidden bg-neutral-800/60" style={ol()}><div className="w-full h-full flex items-center justify-center text-neutral-300"><Video size={20}/></div></div>))}</div>)}
              {libTab==="Projects"&&(<div className="flex flex-wrap gap-2 text-xs">{["Sci-Fi Short","Dance Promo","Brand Film"].map(p=>(<span key={p} className="px-2 py-1 rounded" style={ol()}>{p}</span>))}</div>)}
            </div>
          </Panel>

          <Panel title="Preset"><Select><SelectTrigger className="w-full bg-neutral-900 text-neutral-100" style={ol()}><SelectValue placeholder="Select preset"/></SelectTrigger><SelectContent className="bg-neutral-900 text-neutral-100" style={ol()}>{["Claymation","2D Animation","3D Animation","Cinematic","Documentary","Experimental"].map(p=>(<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></Panel>

          <PalettePanel/>

          <Panel title="Advanced Settings">
            <div className="grid grid-cols-2 gap-4 text-xs text-neutral-100">
              <div className="space-y-1"><label>Length</label><Select value={String(len)} onValueChange={v=>setLen(parseInt(v))}><SelectTrigger className="w-full bg-neutral-900 text-neutral-100" style={ol()}><SelectValue placeholder="10 seconds"/></SelectTrigger><SelectContent className="bg-neutral-900 text-neutral-100" style={ol()}>{[2,5,10,15].map(s=>(<SelectItem key={s} value={String(s)}>{s} seconds</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-1"><label>Framerate</label><Select value={String(fps)} onValueChange={v=>setFps(parseInt(v))}><SelectTrigger className="w-full bg-neutral-900 text-neutral-100" style={ol()}><SelectValue placeholder="24"/></SelectTrigger><SelectContent className="bg-neutral-900 text-neutral-100" style={ol()}>{[12,24,30,60].map(r=>(<SelectItem key={r} value={String(r)}>{r} fps</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-1"><label>Aspect Ratio</label><Select value={ar} onValueChange={v=>setAr(v)}><SelectTrigger className="w-full bg-neutral-900 text-neutral-100" style={ol()}><SelectValue placeholder="16:9"/></SelectTrigger><SelectContent className="bg-neutral-900 text-neutral-100" style={ol()}>{["16:9","4:3","1:1","9:16","2.39:1"].map(r=>(<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-1"><label>Seed</label><Input placeholder="-1 (random)" className="bg-neutral-800 text-white placeholder-neutral-400 focus-visible:ring-0"/></div>
              {[
                {k:"Guidance (CFG)",d:8,M:20,s:1},
                {k:"Steps",d:100,M:300,s:10},
                {k:"Denoise Strength",d:50,M:100,s:1},
                {k:"Motion Weight",d:60,M:100,s:1},
                {k:"Camera Smooth",d:40,M:100,s:1},
                {k:"Variation",d:20,M:100,s:1},
                {k:"Motion Speed",d:50,M:100,s:1},
              ].map(({k,d,M,s})=> (
                <div key={k} className="space-y-1">
                  <label>{k}</label>
                  <Slider className="slider-baby" defaultValue={[d]} max={M} step={s} />
                </div>
              ))}
            </div>
          </Panel>

        </aside>
      </div>
    </div>
  );
}
