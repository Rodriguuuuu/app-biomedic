'use client';
import React, {createContext, useContext} from 'react';
type Ctx = { value: string, onValueChange?: (v:string)=>void };
const TabsCtx = createContext<Ctx>({ value: '' });
export function Tabs({value,onValueChange,children}:{value:string,onValueChange:(v:string)=>void,children:any}){
  return <TabsCtx.Provider value={{value,onValueChange}}><div>{children}</div></TabsCtx.Provider>;
}
export function TabsList({children}:{children:any}){ return <div className="inline-flex gap-2 bg-slate-100 p-1 rounded-xl">{children}</div>; }
export function TabsTrigger({value,children}:{value:string,children:any}){
  const ctx=useContext(TabsCtx); const active=ctx.value===value;
  return <button onClick={()=>ctx.onValueChange?.(value)} className={`px-3 h-9 rounded-lg text-sm ${active?'bg-white border':'hover:bg-white/70'}`}>{children}</button>;
}
export function TabsContent({value,children,className=''}:{value:string,children:any,className?:string}){
  const ctx=useContext(TabsCtx); if(ctx.value!==value) return null; return <div className={className}>{children}</div>;
}
