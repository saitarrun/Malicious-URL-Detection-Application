import * as React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'soft' | 'ghost';
  full?: boolean;
};

export default function Button({ variant = 'solid', full, className = '', ...props }: Props) {
  const variants = {
    solid: 'bg-gradient-to-r from-[#00bfa6] to-[#009e8e] text-white',
    soft: 'bg-neutral-900/5 text-neutral-900',
    ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-900/5',
  };
  return (
    <button
      {...props}
      className={`rounded-xl h-11 px-5 font-medium shadow-sm hover:shadow transition ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
    />
  );
}