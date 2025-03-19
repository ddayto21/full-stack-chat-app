// src/components/ui/card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card component provides a styled container with rounded corners and a shadow.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className || ''}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * CardContent component provides inner padding for a Card.
 */
export function CardContent({ children, className }: CardContentProps) {
  return <div className={`p-4 ${className || ''}`}>{children}</div>;
}