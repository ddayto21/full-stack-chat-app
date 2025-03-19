// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * Button component styled with Tailwind CSS.
 * It provides basic styling for primary buttons.
 */
export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}