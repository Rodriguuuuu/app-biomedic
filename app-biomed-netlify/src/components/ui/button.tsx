import React from 'react';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'outline'|'ghost', size?: 'sm'|'icon'|'md' };
export function Button({variant='default', size='md', className='', ...rest}: Props){
  const v = variant==='outline' ? 'border bg-white hover:bg-slate-50' : variant==='ghost' ? 'bg-transparent hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800';
  const s = size==='sm' ? 'h-8 px-3 text-sm' : size==='icon' ? 'h-9 w-9 p-0' : 'h-10 px-4';
  return <button className={`rounded-xl ${v} ${s} ${className}`} {...rest} />;
}
