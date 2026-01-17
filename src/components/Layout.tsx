import type { ReactNode } from 'react';
import { SettingsButton } from './SettingsButton';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative">
      <div className="fixed top-4 left-4 z-50">
        <SettingsButton />
      </div>
      {children}
    </div>
  );
}
