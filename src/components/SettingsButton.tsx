import { useState } from 'react';
import { useLanguage } from '../locales';

export function SettingsButton() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors"
        title={t.common.settings}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-purple-100 p-4 z-20 min-w-50">
            <h3 className="font-semibold text-purple-900 mb-3">{t.common.language}</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setLanguage('he');
                  setIsOpen(false);
                }}
                className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                  language === 'he'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'hover:bg-purple-50 text-gray-700'
                }`}
              >
                {t.common.hebrew}
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setIsOpen(false);
                }}
                className={`w-full text-right px-3 py-2 rounded-lg transition-colors ${
                  language === 'en'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'hover:bg-purple-50 text-gray-700'
                }`}
              >
                {t.common.english}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
