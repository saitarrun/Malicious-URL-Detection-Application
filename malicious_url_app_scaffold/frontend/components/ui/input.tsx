import * as React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export default function Input({ label, id, className = '', ...props }: Props) {
  const inputId = id || React.useId();
  return (
    <label className="block">
      {label && <span className="block text-sm text-neutral-700 mb-1">{label}</span>}
      <input id={inputId} className={`input-field ${className}`} {...props} />
    </label>
  );
}