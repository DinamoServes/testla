import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);
  const id = Math.random().toString(36).substring(2, 10);
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      aria-describedby={id}
    >
      {children}
      {show && (
        <span
          id={id}
          role="tooltip"
          className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap"
        >
          {content}
        </span>
      )}
    </span>
  );
} 