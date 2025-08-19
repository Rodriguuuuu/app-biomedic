
'use client';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, Search, Info, TrendingUp, Building2, SlidersHorizontal, Plus, Trash2, Save } from "lucide-react";

/* ---------- Constantes & Seeds ---------- */
const AREAS = [
  "Programação","Software/ML","Dados/Estatística","Imagiologia","Sinais/Processamento",
  "Dispositivos/Instrumentação","Controlo/Robótica","Biomecânica","Biomateriais",
  "Ciências da Vida","Gestão/Saúde","Fundamentos","Saúde Digital","Bioinformática",
  "Eletrónica/Hardware","Processos/Indústria","Regulação/Qualidade","Cloud/DevOps","IoT/Edge","Empreendedorismo/Inovação","Outra"
];
const STORAGE = { state:"appbiomed_state_v2" };
const EXP_TIPOS=["Núcleo","Estágio","Júnior Empresa","Voluntariado","Projeto","Competição/Hackathon","Erasmus/Intercâmbio","Part-time","Bolsa/Investigação","Organização de Evento"];
const pesoTipo=(t:string)=>({"Núcleo":.8,"Estágio":1,"Júnior Empresa":1,"Voluntariado":.6,"Projeto":.7,"Competição/Hackathon":.9,"Erasmus/Intercâmbio":.7,"Part-time":.6,"Bolsa/Investigação":1,"Organização de Evento":.7} as any)[t]||.7;

function inferAreasAI(name:string){
  const s=(name||"").toLowerCase(), has=(k:string)=>s.includes(k); const out=new Set<string>();
  if(has("program")||has("algorithm")||has("computational")) out.add("Programação");
  if(has("ml")||has("machine")||has("learning")||has("ai")||(has("modelling")&&!has("mechanics"))) out.add("Software/ML");
  if(has("probabilit")||has("statistic")) out.add("Dados/Estatística");
  if(has("signal")||has("biosignal")||has("bioelectric")) out.add("Sinais/Processamento");
  if(has("imaging")||has("radiolog")) out.add("Imagiologia");
  if(has("instrument")||has("device")||has("sensor")) out.add("Dispositivos/Instrumentação");
  if(has("robot")||has("control")) out.add("Controlo/Robótica");
  if(has("mechanics")||has("biomechan")) { out.add("Biomecânica"); if(has("computational")) out.add("Programação"); }
  if(has("biology")||has("genomic")||has("genetic")||has("bioinform")||has("physiology")||has("pharmacolog")||has("disease")||has("anatomy")||has("histology")||has("metabolic")) out.add("Ciências da Vida");
  if(has("management")||has("value")||has("project")) out.add("Gestão/Saúde");
  if(has("digital health")||has("ehealth")||has("telemed")) out.add("Saúde Digital");
  if(has("bioinform")||has("genomic")||has("sequenc")) out.add("Bioinformática");
  if(has("circuit")||has("electronics")||has("analog")||has("embedded")) out.add("Eletrónica/Hardware");
  if(has("process")||has("manufact")||has("industry")||has("gmp")) out.add("Processos/Indústria");
  if(has("regulat")||has("quality")||has("iso")) out.add("Regulação/Qualidade");
  if(has("cloud")||has("devops")||has("kubernetes")||has("aws")||has("azure")) out.add("Cloud/DevOps");
  if(has("iot")||has("edge")||has("embedded")||has("sensor")) out.add("IoT/Edge");
  if(has("entrepreneur")||has("startup")||has("innovation")) out.add("Empreendedorismo/Inovação");
  if(has("calculus")||has("algebra")||has("physics")||has("chemistry")||has("organic chemistry")) out.add("Fundamentos");
  if(has("hass")||has("option")) out.add("Outra");
  if(has("bioengineering")||has("biomedical engineering")) out.add("Fundamentos");
  return Array.from(out.size?out:["Outra"]);
}

const UC_SEED = [
  ["Linear Algebra",6],["Differential and Integral Calculus I",6],["Anatomy and Histology",6],["Introduction to Biological Sciences",6],["Chemistry",6],
  ["Differential and Integral Calculus II",6],["Fundamentals of Organic Chemistry",6],["HASS I",3],["Introduction to Bioengineering",6],["HASS II",3],
  ["Computation and Programming",6],["Introduction to Biomedical Engineering",3],["Differential and Integral Calculus III",6],["Bioelectricity",6],
  ["Molecular Biology and Genetics",3],["Physics I",6],["Algorithms and Computational Modelling",6],["Principles of Pharmacology",3],
  ["Probability and Statistics",6],["Systems Physiology",6],["Cellular Engineering",3],["Physics II",6],["Introduction to Instrumental Analysis",3],
  ["Mechanics Applied to Biomedicine",6],["Systems of Metabolic Integration and Regulation",6],["Principles of Bioinstrumentation",3],
  ["Computational Modelling in Mechanics",6],["Signals and Systems",6],["Management",3],["Option 1",6],
  ["1st Cycle Integrated Project in Biomedical Engineering",6],["General Mechanisms of Disease",6],["Health Value Measurement",3],
  ["Principles of Biosignals and Biomedical Imaging",6],["Option 2",6]
].map(([nome,ects])=>({nome,ects,areas:inferAreasAI(String(nome)),nota:""}));

const EMPRESAS_SEED = [
  { nome:"Siemens Healthineers", regiao:"Lisboa/Porto", funcoes:"Eng. Aplicações, Service, I&D", tags:"Imagiologia; Dispositivos; Dados", espirito:"Imagiologia clínica e dispositivos médicos.", notas:"MedTech" },
  { nome:"Philips", regiao:"Lisboa", funcoes:"Clinical Specialist, Sales", tags:"Imagiologia; Saúde Digital; Dispositivos", espirito:"Saúde conectada e diagnóstico por imagem.", notas:"Saúde" },
  { nome:"GE HealthCare", regiao:"Lisboa", funcoes:"Clinical Apps, Service", tags:"Imagiologia; Dispositivos; Saúde Digital", espirito:"Imaging, soluções clínicas digitais.", notas:"MedTech" },
  { nome:"Medtronic", regiao:"Lisboa", funcoes:"Clinical/Service", tags:"Dispositivos; Saúde", espirito:"Dispositivos implantáveis.", notas:"MedTech" },
  { nome:"Roche", regiao:"Lisboa", funcoes:"Clinical Specialist, Dados", tags:"Farma; Diagnóstica; Saúde Digital", espirito:"Diagnóstica e dados clínicos.", notas:"Farma/MedTech" },
  { nome:"Abbott", regiao:"Lisboa", funcoes:"Clinical, Sales", tags:"Diagnóstica; Dispositivos; Saúde", espirito:"Dispositivos e diagnóstica.", notas:"Saúde" },
  { nome:"Bial", regiao:"Porto", funcoes:"I&D, Qualidade", tags:"Farma; Ciências da Vida; Dados/Estatística", espirito:"Investigação farmacêutica e qualidade.", notas:"Farma" },
  { nome:"Hovione", regiao:"Loures", funcoes:"Eng. Processo, Qualidade", tags:"Farma; Indústria; Processos/Indústria; Regulação/Qualidade", espirito:"Processo farmacêutico, GMP.", notas:"Farma/Indústria" },
  { nome:"Grifols", regiao:"Porto", funcoes:"Clinical, Quality", tags:"Farma; Diagnóstica; Regulação/Qualidade", espirito:"Plasma, diagnóstica.", notas:"Farma" },
  { nome:"OutSystems", regiao:"Lisboa", funcoes:"Produto, Dev", tags:"Programação; Software/ML; Cloud/DevOps", espirito:"Plataforma low-code, engenharia de software.", notas:"Plataforma" },
  { nome:"Critical TechWorks", regiao:"Lisboa/Porto", funcoes:"Software, Data", tags:"Programação; Dados/Estatística; Cloud/DevOps", espirito:"Software automóvel com dados.", notas:"Tech" },
  { nome:"Talkdesk", regiao:"Lisboa/Porto", funcoes:"Produto, Data", tags:"Programação; Cloud/DevOps; Dados/Estatística", espirito:"SaaS e contact center cloud.", notas:"SaaS" },
  { nome:"Feedzai", regiao:"Coimbra/Lisboa", funcoes:"ML, Data", tags:"Software/ML; Dados/Estatística; Cloud/DevOps", espirito:"IA para fraude.", notas:"AI/Fintech" },
  { nome:"Farfetch", regiao:"Porto", funcoes:"Data, Eng.", tags:"Programação; Dados/Estatística; Cloud/DevOps", espirito:"Plataforma e e‑commerce.", notas:"Tech" },
  { nome:"Deloitte", regiao:"Lisboa/Porto", funcoes:"Consultoria, Analytics", tags:"Consultoria; Dados/Estatística; Saúde", espirito:"Estratégia, analytics, comunicação.", notas:"Consultoria" },
  { nome:"Accenture", regiao:"Lisboa/Porto", funcoes:"Consultoria, Tech", tags:"Consultoria; Cloud/DevOps; Dados/Estatística", espirito:"Transformação digital.", notas:"Consultoria" },
  { nome:"PwC", regiao:"Lisboa/Porto", funcoes:"Consultoria", tags:"Consultoria; Dados/Estatística; Saúde", espirito:"Consultoria e deals.", notas:"Consultoria" },
  { nome:"KPMG", regiao:"Lisboa/Porto", funcoes:"Consultoria", tags:"Consultoria; Dados/Estatística", espirito:"Advisory com foco em risco e dados.", notas:"Consultoria" },
  { nome:"EY", regiao:"Lisboa/Porto", funcoes:"Consultoria", tags:"Consultoria; Dados/Estatística", espirito:"Transformação, risco e analytics.", notas:"Consultoria" },
  { nome:"Bosch", regiao:"Braga/Aveiro", funcoes:"I&D, QA", tags:"Eletrónica/Hardware; IoT/Edge; Processos/Indústria", espirito:"Electrónica, sensores, indústria.", notas:"Indústria" },
  { nome:"Siemens", regiao:"Lisboa", funcoes:"Automation, Energy", tags:"Controlo/Robótica; IoT/Edge; Processos/Indústria", espirito:"Automação e energia.", notas:"Indústria/Energia" },
  { nome:"EDP", regiao:"Lisboa", funcoes:"Dados, Eng.", tags:"Energia; Dados/Estatística; Processos/Indústria", espirito:"Transição energética e dados.", notas:"Energia" },
  { nome:"Galp", regiao:"Lisboa", funcoes:"Processo, Dados", tags:"Energia; Processos/Indústria; Dados/Estatística", espirito:"Refinação, energia e inovação.", notas:"Energia" },
  { nome:"REN", regiao:"Lisboa", funcoes:"Operação, Dados", tags:"Energia; Controlo/Robótica; Dados/Estatística", espirito:"Transporte de energia.", notas:"Energia" },
  { nome:"Fraunhofer AICOS", regiao:"Porto", funcoes:"Investigação, ML, mHealth", tags:"Software/ML; Dados; Saúde Digital", espirito:"Investigação aplicada, IA e mobile health.", notas:"I&D" },
  { nome:"Champalimaud Foundation", regiao:"Lisboa", funcoes:"I&D, Imaging", tags:"Imagiologia; Saúde Digital; Dados/Estatística", espirito:"Investigação clínica e imagem.", notas:"I&D" },
  { nome:"INESCTEC", regiao:"Porto", funcoes:"I&D, Robotics", tags:"Controlo/Robótica; IoT/Edge; Software/ML", espirito:"Investigação e transferência de tecnologia.", notas:"I&D" }
];

const DEFAULT_SETTINGS = { limiarAreaForte:15, pesosSucesso:{media:.5, areasFortes:.2, fatores:.15, experiencias:.1, interesses:.05}, fatoresExtras:{ experiencia:0, ingles:0, projetos:0, publicacoes:0, softskills:0 }, interesses:[] as string[] };

/* ---------- Utils ---------- */
const clamp01=(x:number)=>Math.max(0,Math.min(1,x));
const numberOrEmpty=(v:any)=>{const x=parseFloat(String(v).replace(",",".")); return Number.isFinite(x)?x:""};
const parseCSV=(txt:string)=>{const L=txt.split(/\r?\n/).filter(Boolean); if(!L.length) return []; const sep=L[0].includes(";")?";":","; const H=L[0].split(sep).map(h=>h.trim().toLowerCase());
  return L.slice(1).map(line=>{let inQ=false,cur="",cells:string[]=[]; for(const ch of line){ if(ch=='"'){inQ=!inQ;continue;} if(ch===sep&&!inQ){cells.push(cur.trim());cur="";continue;} cur+=ch;} cells.push(cur.trim()); const o:any={}; H.forEach((h,i)=>o[h]=(cells[i]||"").trim()); return o;}); };
const fatoresScore=(f:any)=>{const v=[f.experiencia,f.ingles,f.projetos,f.publicacoes,f.softskills].map((x:number)=>Math.max(0,Math.min(10,parseFloat(String(x))||0))); return (v.reduce((a,b)=>a+b,0)/v.length)/10; };
const interesseScore=(interesses:string[]=[],medias:{area:string,media:number}[] =[])=>{ if(!interesses.length||!medias.length) return 0; const map=new Map(medias.map(m=>[m.area,m.media])); let s=0,c=0; for(const a of interesses){ c++; s+=clamp01((map.get(a)||0)/20); } return s/Math.max(1,c); };
const jaccardWeighted=(perfil:string[], empresa:string)=>{ if(!empresa) return 0; const e=empresa.split(/[,;]+/).map(t=>t.trim()).filter(Boolean); if(!e.length) return 0; const w=new Map(perfil.map((t,i)=>[t,(perfil.length-i)/perfil.length])); let inter=0, uni=new Set([...perfil,...e]).size; for(const t of e){ if(w.has(t)) inter+=.5+.5*(w.get(t)||0);} return clamp01(inter/Math.max(1,uni)); };
const deriveWeights=(e:any)=>{const t=((e.tags||"")+" "+(e.espirito||"")).toLowerCase();
  if(t.includes("consult")) return {media:.20,areas:.15,fatores:.20,tags:.25,essencia:.05,exp:.10};
  if(/program|software|ml|ai|data|digital|cloud|devops/.test(t)) return {media:.25,areas:.20,fatores:.10,tags:.30,essencia:.05,exp:.10};
  if(/imagiolog|imaging|device|medtech|diagn/.test(t)) return {media:.25,areas:.25,fatores:.10,tags:.20,essencia:.10,exp:.10};
  if(/farma|pharma|hospital|saúde|health/.test(t)) return {media:.25,areas:.25,fatores:.10,tags:.20,essencia:.10,exp:.10};
  if(/energia|industry|indústria|automation|controlo|control|iot/.test(t)) return {media:.25,areas:.25,fatores:.15,tags:.20,essencia:.05,exp:.10};
  return {media:.25,areas:.25,fatores:.15,tags:.25,essencia:.10,exp:.10};
};
const perfilKeywords=(fortes:string[],f:any)=>{const map:any={
  "Programação":["programming","algorithms","software","development","dev"],
  "Software/ML":["machine learning","ai","ml","modeling","modelling"],
  "Dados/Estatística":["data","analytics","statistics","probability","biostatistics"],
  "Imagiologia":["imaging","radiology","image","mri","ct"],
  "Sinais/Processamento":["signals","signal processing","biosignals","ecg","eeg"],
  "Dispositivos/Instrumentação":["devices","instrumentation","hardware","sensors"],
  "Controlo/Robótica":["control","automation","robotics"],
  "Biomecânica":["biomechanics","mechanics"],
  "Biomateriais":["biomaterials","materials","polymers"],
  "Ciências da Vida":["biology","genetics","physiology","pharmacology","disease"],
  "Gestão/Saúde":["management","health economics","value","policy","hospital"],
  "Fundamentos":["math","calculus","physics","chemistry"],
  "Saúde Digital":["digital health","ehealth","telemedicine","clinical software"],
  "Bioinformática":["bioinformatics","genomics","sequencing","variant"],
  "Eletrónica/Hardware":["electronics","circuits","embedded","fpga"],
  "Processos/Indústria":["process","manufacturing","lean","six sigma"],
  "Regulação/Qualidade":["regulatory","quality","gmp","iso"],
  "Cloud/DevOps":["cloud","kubernetes","docker","devops"],
  "IoT/Edge":["iot","edge","sensors","embedded"],
  "Empreendedorismo/Inovação":["startup","entrepreneurship","innovation","incubator"]
}; const set=new Set<string>(); fortes.forEach(a=>(map[a]||[]).forEach((x:string)=>set.add(x)));
  if((f.ingles||0)>=7){set.add("english");set.add("international");} if((f.softskills||0)>=7){set.add("communication");set.add("teamwork");}
  if((f.projetos||0)>=7)set.add("projects"); if((f.publicacoes||0)>=6){set.add("research");set.add("publications");}
  if((f.experiencia||0)>=6){set.add("experience");set.add("internship");}
  return Array.from(set);
};
const essenceSim=(kws:string[],txt:string)=>{txt=(txt||"").toLowerCase(); if(!txt) return 0; let m=0,c=0; for(const k of kws){ if(k.length<3) continue; c++; if(txt.includes(k)) m++; } return c? m/Math.max(3,c):0; };
const relevanciaAuto=(e:any,emp:any)=>{const t=((emp.tags||"")+" "+(emp.espirito||"")).toLowerCase(); const cat=t.includes("consult")?"consult":/program|software|ml|ai|data|digital|cloud|devops/.test(t)?"tech":/imagiolog|imaging|device|medtech|diagn|saúde|health/.test(t)?"med":/energia|industry|indústria|automation|controlo|control|iot/.test(t)?"energy":"other"; const favT:any={consult:["Júnior Empresa","Núcleo","Organização de Evento"],tech:["Competição/Hackathon","Projeto","Estágio"],med:["Estágio","Bolsa/Investigação","Projeto"],energy:["Estágio","Projeto","Núcleo"]}; const favA:any={consult:["Gestão/Saúde","Dados/Estatística","Programação"],tech:["Programação","Software/ML","Dados/Estatística","Cloud/DevOps"],med:["Imagiologia","Dispositivos/Instrumentação","Ciências da Vida","Regulação/Qualidade","Saúde Digital"],energy:["Controlo/Robótica","Eletrónica/Hardware","Processos/Indústria","IoT/Edge"]}; let s=5; if((favT[cat]||[]).includes(e.tipo)) s+=2; if((favA[cat]||[]).includes(e.area)) s+=2; s+=Math.min(2,(+e.meses||0)/6); return Math.max(0,Math.min(10,s));};
const expScoreAll=(ex:any[]=[])=>{if(!ex.length) return 0; let n=0,d=0; for(const e of ex){const b=.5*clamp01((+e.meses||0)/12)+.5*clamp01((+e.relev||0)/10); const w=pesoTipo(e.tipo); n+=b*w; d+=w;} return d? n/d:0;};
const expFitEmpresa=(ex:any[]=[],emp:any={})=>{if(!ex.length) return 0; const t=((emp.tags||"")+" "+(emp.espirito||"")).toLowerCase(); let n=0,d=0; for(const e of ex){let w=pesoTipo(e.tipo); if(t.includes("consult")&&(e.tipo==="Júnior Empresa"||e.tipo==="Núcleo")) w*=1.4; if(/program|software|ml|ai|data|cloud|devops/.test(t)&&(e.tipo==="Competição/Hackathon"||e.tipo==="Projeto"||e.tipo==="Estágio")) w*=1.3; if(/imagiolog|imaging|medtech|device|diagn|saúde|health/.test(t)&&(e.tipo==="Estágio"||e.tipo==="Bolsa/Investigação")) w*=1.3; if(/energia|industry|indústria|automation|controlo|control|iot/.test(t)&&(e.tipo==="Estágio"||e.tipo==="Núcleo"||e.tipo==="Projeto")) w*=1.25; const relA=relevanciaAuto(e,emp); const b=.5*clamp01((+e.meses||0)/12)+.5*clamp01(relA/10); n+=b*w; d+=w;} return clamp01(n/Math.max(1,d));};

/* ---------- UI Helpers ---------- */
function Donut({ value, label, suffix="%"}:{value:number,label:string,suffix?:string}){
  const v=Math.max(0,Math.min(100,value)); const data=[{name:label,value:v},{name:"resto",value:100-v}];
  return (
    <div className="w-full h-56">
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={70} outerRadius={90} startAngle={90} endAngle={-270}>{data.map((_,i)=><Cell key={i}/>)}</Pie>
          <ReTooltip formatter={(val:any)=>`${(+val).toFixed(1)}${suffix}`}/>
        </PieChart>
      </ResponsiveContainer>
      <div className="-mt-36 text-center">
        <div className="text-3xl font-semibold">{v.toFixed(1)}{suffix}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}
function AreasSelector({ value=[], onChange }:{value:string[],onChange:(v:string[])=>void}){
  const [open,setOpen]=useState(false);
  const toggle=(a:string)=> onChange(value.includes(a)? value.filter(x=>x!==a): [...value,a]);
  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 items-center">
        {value.length? value.map(a=> <span key={a} className="px-2 py-1 rounded-full border text-xs bg-slate-50">{a}</span>): <span className="text-xs text-muted-foreground">Sem áreas</span>}
        <Button type="button" variant="outline" size="sm" onClick={()=>setOpen(o=>!o)} className="ml-1">{open?"Fechar":"Escolher"}</Button>
      </div>
      {open && (
        <div className="absolute z-20 mt-2 w-72 bg-white border rounded-xl p-2 shadow-lg max-h-56 overflow-auto">
          <div className="flex flex-wrap gap-1">{AREAS.map(a=>
            <button key={a} onClick={()=>toggle(a)} className={`px-2 py-1 rounded-full text-xs border ${value.includes(a)?"bg-slate-900 text-white":"bg-slate-100 hover:bg-slate-200"}`}>{a}</button>
          )}</div>
          <div className="flex justify-between mt-2">
            <Button type="button" variant="outline" size="sm" onClick={()=>onChange([])}>Limpar</Button>
            <Button type="button" size="sm" onClick={()=>setOpen(false)}>OK</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Cálculos ---------- */
const mediaPonderada=(ucs:any[])=>{const f=ucs.filter(u=>u.nota!==""&&Number.isFinite(+u.nota)); const ects=f.reduce((a,u)=>a+u.ects,0); const soma=f.reduce((a,u)=>a+(+u.nota)*u.ects,0); return ects? soma/ects:0;};
const mediasPorArea=(ucs:any[])=>{const map:any={}; for(const u of ucs){const n=+u.nota; if(!Number.isFinite(n)) continue; const areas=u.areas?.length?u.areas:["Outra"]; const k=Math.max(1,areas.length); for(const a of areas){ map[a]??={ects:0,soma:0}; const sh=u.ects/k; map[a].ects+=sh; map[a].soma+=n*sh; }} return Object.entries(map).map(([area,v]:any)=>({area,media:v.ects? v.soma/v.ects:0,ects:v.ects})).sort((a,b)=>b.media-a.media); };
const areasFortes=(medias:any[],limiar:number)=> medias.filter(m=>m.media>=limiar).map(m=>m.area);
const tagsPerfil=(ucs:any[])=>{const c:any={}; for(const u of ucs){const n=+u.nota; if(!Number.isFinite(n)||n<10) continue; for(const a of (u.areas?.length?u.areas:["Outra"])) c[a]=(c[a]||0)+1;} return Object.entries(c).sort((a:any,b:any)=>b[1]-a[1]).map((x:any)=>x[0]); };

/* ---------- App ---------- */
export default function Page(){
  const [tab,setTab]=useState("preencher");
  const [ucs,setUcs]=useState(UC_SEED);
  const [empresas,setEmpresas]=useState(EMPRESAS_SEED);
  const [experiencias,setExperiencias]=useState<any[]>([]);
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const [filtro,setFiltro]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{ try{localStorage.setItem(STORAGE.state,JSON.stringify({ucs,empresas,settings,experiencias}));}catch{} },[ucs,empresas,settings,experiencias]);
  useEffect(()=>{ try{const raw=localStorage.getItem(STORAGE.state); if(raw){const j=JSON.parse(raw); j.ucs&&setUcs(j.ucs); j.empresas&&setEmpresas(j.empresas); j.settings&&setSettings(j.settings); j.experiencias&&setExperiencias(j.experiencias);} }catch{} },[]);

  const mediaGlobal=useMemo(()=> mediaPonderada(ucs),[ucs]);
  const mediasArea=useMemo(()=> mediasPorArea(ucs),[ucs]);
  const fortes=useMemo(()=> areasFortes(mediasArea, settings.limiarAreaForte),[mediasArea, settings.limiarAreaForte]);
  const sucesso=useMemo(()=>{const cM=clamp01(mediaGlobal/20), cA=clamp01(fortes.length/Math.max(1,Math.floor(AREAS.length*0.4))), cF=fatoresScore(settings.fatoresExtras), cE=expScoreAll(experiencias), cI=interesseScore(settings.interesses||[],mediasArea); const p=settings.pesosSucesso; return 100*clamp01(p.media*cM+p.areasFortes*cA+p.fatores*cF+(p.experiencias||0)*cE+(p.interesses||0)*cI);},[mediaGlobal,fortes.length,settings,experiencias,mediasArea]);
  const perfilTags=useMemo(()=> tagsPerfil(ucs),[ucs]);

  const ranking=useMemo(()=>{const cM=clamp01(mediaGlobal/20), cA=clamp01(fortes.length/Math.max(1,Math.floor(AREAS.length*0.4))), cF=fatoresScore(settings.fatoresExtras); const kws=perfilKeywords(fortes,settings.fatoresExtras);
    return empresas.map(e=>{const t=jaccardWeighted(perfilTags,e.tags); const es=essenceSim(kws,e.espirito); const w=deriveWeights(e); const x=expFitEmpresa(experiencias,e); const s=(w.media*cM+w.areas*cA+w.fatores*cF+w.tags*t+w.essencia*es+w.exp*x)/(w.media+w.areas+w.fatores+w.tags+w.essencia+w.exp); return {...e, afinidade:100*clamp01(s)};}).sort((a,b)=>b.afinidade-a.afinidade);
  },[empresas,perfilTags,fortes.length,mediaGlobal,settings,experiencias]);

  const onImport=async(file:File)=>{const txt=await file.text(); if(file.name.toLowerCase().endsWith(".json")){try{const arr=JSON.parse(txt); if(Array.isArray(arr)) setEmpresas(arr);}catch{}}
    else{const rows=parseCSV(txt); const mapped=rows.map((r:any)=>({nome:r.nome||r.company||"",regiao:r.regiao||r.region||"",funcoes:r.funcoes||r.roles||"",tags:r.tags||r.areas||"",espirito:r.espirito||r.essencia||r.essence||r.spirit||"",notas:r.notas||r.notes||""})); setEmpresas(mapped.filter((e:any)=>e.nome)); } };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><SlidersHorizontal className="w-5 h-5"/><h1 className="text-lg font-semibold">APP‑BIOMED · IST</h1></div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={()=>{try{localStorage.setItem(STORAGE.state,JSON.stringify({ucs,empresas,settings,experiencias})); setSaved(true); setTimeout(()=>setSaved(false),1800);}catch{}}}><Save className="w-4 h-4 mr-1"/>Guardar</Button>
            {saved && <span className="text-xs text-green-600">Guardado ✓</span>}
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" size="sm"><Info className="w-4 h-4 mr-1"/>Como calculamos</Button></DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Transparência</DialogTitle></DialogHeader>
                <DialogDescription>
                  <ul className="list-disc ml-6 space-y-2 mt-3 text-sm text-slate-700">
                    <li><b>Média Global</b> = soma(nota×ECTS)/soma(ECTS).</li>
                    <li><b>Média por Área</b>: reparte ECTS quando a UC tem várias áreas.</li>
                    <li><b>Áreas fortes</b>: média ≥ limiar ({settings.limiarAreaForte}).</li>
                    <li><b>Taxa de Sucesso</b> = 100×[{settings.pesosSucesso.media}×(média/20)+{settings.pesosSucesso.areasFortes}×(n.º áreas fortes/40% áreas)+{settings.pesosSucesso.fatores}×(média fatores/10)+{settings.pesosSucesso.experiencias||0}×(experiências)+{settings.pesosSucesso.interesses||0}×(interesses)].</li>
                    <li><b>Afinidade por empresa</b>: pesos variáveis pelo <i>espírito</i> (média, áreas, fatores, tags, semântica, <b>experiências</b>).</li>
                  </ul>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="preencher"><SlidersHorizontal className="w-4 h-4 mr-1"/>Preenchimento (UCs & Parâmetros)</TabsTrigger>
            <TabsTrigger value="resultados"><TrendingUp className="w-4 h-4 mr-1"/>Resultados</TabsTrigger>
            <TabsTrigger value="empresas"><Building2 className="w-4 h-4 mr-1"/>Base de Empresas</TabsTrigger>
          </TabsList>

          <TabsContent value="resultados" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card><CardHeader><CardTitle>Média Global</CardTitle></CardHeader><CardContent><Donut value={(mediaGlobal/20)*100} label="Média (normalizada)"/><div className="-mt-4 text-sm">Média ponderada: <b>{mediaGlobal?mediaGlobal.toFixed(2):"–"}</b>/20</div></CardContent></Card>
              <Card><CardHeader><CardTitle>Taxa de Sucesso Estimada</CardTitle></CardHeader><CardContent><Donut value={sucesso} label="Sucesso previsto"/><div className="-mt-4 text-sm">Áreas fortes: <b>{fortes.length}</b></div></CardContent></Card>
              <Card><CardHeader><CardTitle>Áreas fortes</CardTitle></CardHeader><CardContent>{fortes.length? <div className="flex flex-wrap gap-2">{fortes.map(a=> <span key={a} className="px-2 py-1 rounded-full bg-slate-100 text-xs border">{a}</span>)}</div> : <div className="text-sm text-muted-foreground">Sem áreas fortes ainda.</div>}</CardContent></Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mt-4">
              <Card className="lg:col-span-2"><CardHeader><CardTitle>Ranking de Empresas</CardTitle><div className="text-sm text-muted-foreground">Pesos adaptados ao "espírito".</div></CardHeader>
                <CardContent>
                  <div className="space-y-3">{ranking.slice(0,30).map((e,i)=>
                    <div key={i} className="grid md:grid-cols-12 items-start gap-3 p-3 rounded-2xl border">
                      <div className="md:col-span-5"><div className="font-medium">{i+1}. {e.nome}</div><div className="text-xs text-muted-foreground">{e.regiao}</div></div>
                      <div className="md:col-span-3 text-xs">{e.tags}</div>
                      <div className="md:col-span-2 text-xs">{e.funcoes}</div>
                      <div className="md:col-span-2 text-right font-semibold">{e.afinidade.toFixed(1)}%</div>
                    </div>)}
                  </div>
                </CardContent>
              </Card>
              <Card><CardHeader><CardTitle>Perfil Académico</CardTitle><div className="text-sm text-muted-foreground">Tags derivadas das tuas áreas com nota ≥10.</div></CardHeader>
                <CardContent>
                  {perfilTags.length? <div className="flex flex-wrap gap-2">{perfilTags.map(t=> <span key={t} className="px-2 py-1 rounded-full border text-xs">{t}</span>)}</div> : <div className="text-sm text-muted-foreground">Sem tags ainda.</div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="empresas" className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
              <div className="flex-1 relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/><Input placeholder="Pesquisar por nome, função, tags ou região" className="pl-9" value={filtro} onChange={e=>setFiltro((e.target as any).value)}/></div>
              <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) onImport(f); (e.currentTarget as any).value="";}}/>
              <Button variant="outline" onClick={()=>fileRef.current?.click()}><Upload className="w-4 h-4 mr-1"/>Importar</Button>
              <Button variant="outline" onClick={()=>{const blob=new Blob([JSON.stringify(empresas,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="empresas.json"; a.click(); URL.revokeObjectURL(url);}}><Download className="w-4 h-4 mr-1"/>Exportar</Button>
            </div>
            <div className="text-sm text-muted-foreground mb-3">Total: <b>{empresas.length}</b> empresas</div>
            <div className="grid gap-3">
              {empresas.filter(e=>!filtro||JSON.stringify(e).toLowerCase().includes(filtro.toLowerCase())).map((e,idx)=>
                <div key={idx} className="grid md:grid-cols-12 gap-2 p-3 border rounded-2xl">
                  <Input className="md:col-span-3" placeholder="Nome" value={e.nome} onChange={ev=>setEmpresas(v=>v.map((x,i)=>i===idx?{...x,nome:(ev.target as any).value}:x))}/>
                  <Input className="md:col-span-2" placeholder="Região" value={e.regiao} onChange={ev=>setEmpresas(v=>v.map((x,i)=>i===idx?{...x,regiao:(ev.target as any).value}:x))}/>
                  <Input className="md:col-span-3" placeholder="Funções" value={e.funcoes} onChange={ev=>setEmpresas(v=>v.map((x,i)=>i===idx?{...x,funcoes:(ev.target as any).value}:x))}/>
                  <Input className="md:col-span-3" placeholder="Tags (; ou ,)" value={e.tags} onChange={ev=>setEmpresas(v=>v.map((x,i)=>i===idx?{...x,tags:(ev.target as any).value}:x))}/>
                  <div className="md:col-span-1 flex items-center justify-end"><Button variant="ghost" size="icon" onClick={()=>setEmpresas(v=>v.filter((_,i)=>i!==idx))}><Trash2 className="w-4 h-4"/></Button></div>
                  <Textarea className="md:col-span-12" placeholder="Espírito (missão, valores, foco tecnológico)" value={e.espirito||""} onChange={ev=>setEmpresas(v=>v.map((x,i)=>i===idx?{...x,espirito:(ev.target as any).value}:x))}/>
                  <Textarea className="md:col-span-12" placeholder="Notas" value={e.notas||""} onChange={ev=>setEmpresas(v=>v.map((x,i)=>i===idx?{...x,notas:(ev.target as any).value}:x))}/>
                </div>)}
            </div>
            <div className="mt-3"><Button onClick={()=>setEmpresas(v=>[...v,{nome:"",regiao:"",funcoes:"",tags:"",espirito:"",notas:""}])}><Plus className="w-4 h-4 mr-1"/>Adicionar empresa</Button></div>
          </TabsContent>

          <TabsContent value="preencher" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader><CardTitle>Parâmetros de Cálculo</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><Label>Limiar de área forte (0–20)</Label><Input type="number" step={0.1} value={settings.limiarAreaForte as any} onChange={e=>setSettings(s=>({...s,limiarAreaForte:parseFloat((e.target as any).value)||0}))}/></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Peso: Média</Label><Input type="number" step={0.05} value={settings.pesosSucesso.media as any} onChange={e=>setSettings(s=>({...s,pesosSucesso:{...s.pesosSucesso,media:parseFloat((e.target as any).value)||0}}))}/></div>
                    <div><Label>Peso: Áreas</Label><Input type="number" step={0.05} value={settings.pesosSucesso.areasFortes as any} onChange={e=>setSettings(s=>({...s,pesosSucesso:{...s.pesosSucesso,areasFortes:parseFloat((e.target as any).value)||0}}))}/></div>
                    <div><Label>Peso: Fatores</Label><Input type="number" step={0.05} value={settings.pesosSucesso.fatores as any} onChange={e=>setSettings(s=>({...s,pesosSucesso:{...s.pesosSucesso,fatores:parseFloat((e.target as any).value)||0}}))}/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Peso: Experiências</Label><Input type="number" step={0.05} value={(settings.pesosSucesso as any).experiencias||0 as any} onChange={e=>setSettings(s=>({...s,pesosSucesso:{...s.pesosSucesso,experiencias:parseFloat((e.target as any).value)||0}}))}/></div>
                    <div><Label>Peso: Interesses</Label><Input type="number" step={0.05} value={(settings.pesosSucesso as any).interesses||0 as any} onChange={e=>setSettings(s=>({...s,pesosSucesso:{...s.pesosSucesso,interesses:parseFloat((e.target as any).value)||0}}))}/></div>
                  </div>
                  <div className="pt-3 border-t"><div className="font-medium mb-2">Fatores adicionais (0–10)</div>
                    {[{k:"experiencia",l:"Experiência profissional"},{k:"ingles",l:"Inglês"},{k:"projetos",l:"Projetos"},{k:"publicacoes",l:"Publicações"},{k:"softskills",l:"Soft skills"}].map((f:any)=>
                      <div key={f.k}><Label>{f.l}</Label><Input type="number" step={1} min={0} max={10} value={(settings.fatoresExtras as any)[f.k] as any} onChange={e=>setSettings(s=>({...s,fatoresExtras:{...s.fatoresExtras,[f.k]:numberOrEmpty((e.target as any).value)}}))}/></div>
                    )}
                  </div>
                  <div className="pt-3 border-t"><div className="font-medium mb-2">Áreas de interesse (para a taxa de sucesso)</div>
                    <AreasSelector value={settings.interesses||[]} onChange={(val)=>setSettings(s=>({...s,interesses:val}))}/>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle>Unidades Curriculares (IST)</CardTitle>
                      <div className="text-sm text-muted-foreground">Preenche as notas (0–20). Associa <b>várias áreas</b> por UC.</div>
                    </div>
                    <Button variant="outline" onClick={()=>setUcs(v=>v.map(u=>({...u,areas:inferAreasAI(u.nome)})))}>Associar Áreas (IA)</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-12 gap-2 font-medium text-slate-600 mb-2"><div className="col-span-4">Disciplina</div><div className="col-span-2">ECTS</div><div className="col-span-4">Áreas</div><div className="col-span-2">Nota</div></div>
                  {ucs.map((u,idx)=>
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                      <Input className="col-span-4" value={u.nome} onChange={e=>setUcs(v=>v.map((x,i)=>i===idx?{...x,nome:(e.target as any).value}:x))}/>
                      <Input className="col-span-2" type="number" step={0.5} value={u.ects as any} onChange={e=>setUcs(v=>v.map((x,i)=>i===idx?{...x,ects:parseFloat((e.target as any).value)||0}:x))}/>
                      <div className="col-span-4"><AreasSelector value={u.areas||[]} onChange={(val)=>setUcs(v=>v.map((x,i)=>i===idx?{...x,areas:val}:x))}/></div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Input type="number" step={0.1} placeholder="0–20" value={u.nota as any} onChange={e=>setUcs(v=>v.map((x,i)=>i===idx?{...x,nota:numberOrEmpty((e.target as any).value)}:x))}/>
                        <Button variant="ghost" size="icon" onClick={()=>setUcs(v=>v.filter((_,i)=>i!==idx))}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3"><Button onClick={()=>setUcs(v=>[...v,{nome:"",ects:6,areas:[],nota:""}])}><Plus className="w-4 h-4 mr-1"/>Adicionar UC</Button></div>

                  <div className="pt-3 border-t mt-4">
                    <div className="font-medium mb-2">Experiências</div>
                    {experiencias.map((x,i)=> (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center mb-2">
                        <select className="col-span-3 border rounded-md h-9 px-2" value={x.tipo} onChange={ev=>setExperiencias(v=>v.map((y,j)=>j===i?{...y,tipo:(ev.target as any).value}:y))}>{EXP_TIPOS.map(t=><option key={t}>{t}</option>)}</select>
                        <select className="col-span-3 border rounded-md h-9 px-2" value={x.area||""} onChange={ev=>setExperiencias(v=>v.map((y,j)=>j===i?{...y,area:(ev.target as any).value}:y))}>
                          <option value="">— área —</option>
                          {AREAS.map(a=> <option key={a}>{a}</option>)}
                        </select>
                        <Input className="col-span-2" type="number" step={1} placeholder="Meses" value={x.meses||"" as any} onChange={ev=>setExperiencias(v=>v.map((y,j)=>j===i?{...y,meses:numberOrEmpty((ev.target as any).value)}:y))}/>
                        <Input className="col-span-3" type="number" step={1} placeholder="Relev. 0–10 (global)" value={x.relev||"" as any} onChange={ev=>setExperiencias(v=>v.map((y,j)=>j===i?{...y,relev:numberOrEmpty((ev.target as any).value)}:y))}/>
                        <Button className="col-span-1" variant="ghost" size="icon" onClick={()=>setExperiencias(v=>v.filter((_,j)=>j!==i))}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    ))}
                    <Button onClick={()=>setExperiencias(v=>[...v,{tipo:EXP_TIPOS[1],area:"",meses:"",relev:""}])}><Plus className="w-4 h-4 mr-1"/>Adicionar experiência</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500">Protótipo APP‑BIOMED · Sem backend · Dados ficam no navegador.</footer>
    </div>
  );
}
