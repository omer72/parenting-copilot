import type { Child, CompletedInteraction } from '../types';

interface ExportData {
  version: 1;
  exportDate: string;
  children: Child[];
  interactions: CompletedInteraction[];
  language: string;
}

const STORAGE_KEYS = {
  children: 'parenting-copilot-children',
  interactions: 'parenting-copilot-interactions',
  language: 'parenting-copilot-language',
} as const;

export function exportData(): void {
  const data: ExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    children: JSON.parse(localStorage.getItem(STORAGE_KEYS.children) || '[]'),
    interactions: JSON.parse(localStorage.getItem(STORAGE_KEYS.interactions) || '[]'),
    language: localStorage.getItem(STORAGE_KEYS.language) || 'he',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kidsit-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<{ children: number; interactions: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }

        const data: ExportData = JSON.parse(text);

        if (!data.version || !Array.isArray(data.children) || !Array.isArray(data.interactions)) {
          reject(new Error('Invalid backup file format'));
          return;
        }

        localStorage.setItem(STORAGE_KEYS.children, JSON.stringify(data.children));
        localStorage.setItem(STORAGE_KEYS.interactions, JSON.stringify(data.interactions));
        if (data.language) {
          localStorage.setItem(STORAGE_KEYS.language, data.language);
        }

        resolve({
          children: data.children.length,
          interactions: data.interactions.length,
        });
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
