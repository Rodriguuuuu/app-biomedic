import React from 'react';
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={`h-9 px-3 rounded-md border w-full ${props.className||''}`}/>;
}
