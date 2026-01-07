import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const clickableClass = onClick ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]' : '';

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-5 transition-all duration-300 border border-purple-100 ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
