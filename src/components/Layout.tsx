import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SettingsButton } from './SettingsButton';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show logo on landing page or home page
  const showLogo = location.pathname !== '/' && location.pathname !== '/home';

  return (
    <div className="relative">
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <SettingsButton />
        {showLogo && (
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
            title="Home"
          >
            <img
              src="/logo.png"
              alt="Home"
              className="w-full h-full object-cover"
            />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
