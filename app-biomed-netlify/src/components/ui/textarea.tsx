import React from 'react';
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return <textarea {...props} className={`min-h-[80px] p-3 rounded-md border w-full ${props.className||''}`}/>;
}
