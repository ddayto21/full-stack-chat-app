// src/components/ui/Input.tsx
import React from "react";

/**
 * Input component styled with Tailwind CSS.
 * It provides a consistent look for text input fields.
 */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200 ${
        className || ""
      }`}
      {...props}
    />
  );
}
