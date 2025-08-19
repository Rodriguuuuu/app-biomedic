import React from 'react';
export function Card({className='',...p}:{className?:string,children:any}){return <div className={`rounded-2xl border bg-white ${className}`} {...p}/>}
export function CardHeader({className='',...p}:{className?:string,children:any}){return <div className={`p-4 border-b ${className}`} {...p}/>}
export function CardTitle({className='',...p}:{className?:string,children:any}){return <h3 className={`font-semibold text-lg ${className}`} {...p}/>}
export function CardContent({className='',...p}:{className?:string,children:any}){return <div className={`p-4 ${className}`} {...p}/>}
