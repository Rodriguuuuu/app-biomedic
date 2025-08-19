import React from 'react';
export function Label({children,className='',...rest}:{children:any,className?:string}){
  return <label className={`text-sm text-slate-600 ${className}`} {...rest}>{children}</label>;
}
