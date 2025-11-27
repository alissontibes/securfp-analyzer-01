import React from 'react';
import { ShieldCheck, Globe } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const t = translations[language];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">{t.appTitle}</h1>
              <p className="text-xs text-slate-500 font-medium">{t.appSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Language Selector */}
             <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
                <button 
                  onClick={() => setLanguage('pt')} 
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${language === 'pt' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Português"
                >
                  PT
                </button>
                <button 
                  onClick={() => setLanguage('en')} 
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${language === 'en' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  title="English"
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('es')} 
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${language === 'es' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  title="Español"
                >
                  ES
                </button>
             </div>

             <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {t.geminiBadge}
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;