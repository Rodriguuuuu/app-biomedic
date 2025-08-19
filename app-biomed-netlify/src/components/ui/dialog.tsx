'use client';
import React, { createContext, useContext, useState } from 'react';
const Ctx = createContext<{open:boolean,setOpen:(b:boolean)=>void}>({open:false,setOpen:()=>{}});
export function Dialog({children}:{children:any}){ const [open,setOpen]=useState(false); return <Ctx.Provider value={{open,setOpen}}><div>{children}</div></Ctx.Provider>; }
export function DialogTrigger({asChild,children}:{asChild?:boolean,children:any}){ const {setOpen}=useContext(Ctx); const onClick=()=>setOpen(true); return asChild&&React.isValidElement(children)? React.cloneElement(children as any,{onClick}): <button onClick={onClick}>{children}</button>; }
export function DialogContent({children,className='' }:{children:any,className?:string}){ const {open,setOpen}=useContext(Ctx); if(!open) return null; return (<div className="fixed inset-0 z-50">
  <div className="absolute inset-0 bg-black/30" onClick={()=>setOpen(false)}></div>
  <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl border w-[min(700px,95vw)] ${className}`}>
    {children}
  </div></div>); }
export function DialogHeader({children}:{children:any}){ return <div className="p-4 border-b">{children}</div> }
export function DialogTitle({children}:{children:any}){ return <h3 className="font-semibold text-lg">{children}</h3> }
export function DialogDescription({children}:{children:any}){ return <div className="p-4 text-sm text-slate-700">{children}</div> }
