import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Child, Session, AppState, CompletedInteraction } from '../types';

interface AppContextType extends AppState {
  addChild: (child: Omit<Child, 'id'>) => void;
  updateChild: (id: string, child: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  setCurrentSession: (session: Partial<Session> | null) => void;
  updateSession: (updates: Partial<Session>) => void;
  getChildById: (id: string) => Child | undefined;
  completedInteractions: CompletedInteraction[];
  saveInteraction: (interaction: Omit<CompletedInteraction, 'id'>) => void;
  getInteractionsForDate: (date: string, childId?: string) => CompletedInteraction[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedChildren, setSavedChildren] = useLocalStorage<Child[]>('parenting-copilot-children', []);
  const [currentSession, setCurrentSession] = useLocalStorage<Partial<Session> | null>('parenting-copilot-session', null);
  const [completedInteractions, setCompletedInteractions] = useLocalStorage<CompletedInteraction[]>('parenting-copilot-interactions', []);

  const addChild = (child: Omit<Child, 'id'>) => {
    const newChild: Child = {
      ...child,
      id: crypto.randomUUID(),
    };
    setSavedChildren(prev => [...prev, newChild]);
  };

  const updateChild = (id: string, updates: Partial<Child>) => {
    setSavedChildren(prev =>
      prev.map(child => (child.id === id ? { ...child, ...updates } : child))
    );
  };

  const deleteChild = (id: string) => {
    setSavedChildren(prev => prev.filter(child => child.id !== id));
  };

  const updateSession = (updates: Partial<Session>) => {
    setCurrentSession(prev => (prev ? { ...prev, ...updates } : updates));
  };

  const getChildById = (id: string) => {
    return savedChildren.find(child => child.id === id);
  };

  const saveInteraction = (interaction: Omit<CompletedInteraction, 'id'>) => {
    const newInteraction: CompletedInteraction = {
      ...interaction,
      id: crypto.randomUUID(),
    };
    setCompletedInteractions(prev => [...prev, newInteraction]);
  };

  const getInteractionsForDate = (date: string, childId?: string): CompletedInteraction[] => {
    return completedInteractions.filter(i => {
      const interactionDate = new Date(i.timestamp).toISOString().split('T')[0];
      const dateMatch = interactionDate === date;
      const childMatch = childId ? i.childId === childId : true;
      return dateMatch && childMatch;
    });
  };

  return (
    <AppContext.Provider
      value={{
        children: savedChildren,
        currentSession,
        addChild,
        updateChild,
        deleteChild,
        setCurrentSession,
        updateSession,
        getChildById,
        completedInteractions,
        saveInteraction,
        getInteractionsForDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
