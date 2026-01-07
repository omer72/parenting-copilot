import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const clickableClass = onClick ? 'cursor-pointer hover:shadow-lg active:scale-[0.98]' : '';

  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-4 transition-all duration-200 ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
