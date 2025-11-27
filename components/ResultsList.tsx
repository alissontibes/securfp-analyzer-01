import React, { useState, useEffect } from 'react';
import { RFPItem, Language } from '../types';
import { translations } from '../utils/translations';
import { Loader2, CheckCircle2, XCircle, ExternalLink, FileText, AlertTriangle, Link as LinkIcon, RefreshCcw } from 'lucide-react';

interface ResultsListProps {
  items: RFPItem[];
  language: Language;
}

const ResultsList: React.FC<ResultsListProps> = ({ items, language }) => {
  const t = translations[language];

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-slate-500 font-medium">{t.noItemsTitle}</h3>
        <p className="text-slate-400 text-sm mt-1">{t.noItemsSub}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sim': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Não': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Parcial': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Sim': return t.statusSim;
      case 'Não': return t.statusNao;
      case 'Parcial': return t.statusParcial;
      default: return t.statusIndeterminado;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sim': return <CheckCircle2 className="w-5 h-5" />;
      case 'Não': return <XCircle className="w-5 h-5" />;
      case 'Parcial': return <AlertTriangle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
            item.status === 'analyzing' ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-slate-200'
          }`}
        >
          {/* Header with Requirement and Status */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex gap-3 flex-1">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 mt-0.5">
                {index + 1}
              </span>
              <h3 className="text-sm font-semibold text-slate-900 leading-snug pt-0.5">
                {item.requirement}
              </h3>
            </div>
            
            <div className="flex-shrink-0">
              {item.status === 'analyzing' && (
                <span className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t.verifying}
                </span>
              )}
              {item.status === 'completed' && item.analysis && (
                 <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border font-bold text-sm ${getStatusColor(item.analysis.supportStatus)}`}>
                    {getStatusIcon(item.analysis.supportStatus)}
                    <span>{getStatusLabel(item.analysis.supportStatus).toUpperCase()}</span>
                 </div>
              )}
              {item.status === 'error' && <span className="text-xs font-medium px-2 py-1 bg-rose-100 text-rose-600 rounded">{t.error}</span>}
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {item.status === 'analyzing' && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
              </div>
            )}
            
            {item.status === 'error' && (
               <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                 {t.error}: {item.errorMsg}
               </div>
            )}

            {item.status === 'completed' && item.analysis && (
              <div className="grid grid-cols-1 gap-4">
                
                {/* Descrição Técnica */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t.techAnalysis} ({item.analysis.manufacturer})
                  </h4>
                  <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-line">
                    {item.analysis.response}
                  </div>
                </div>

                {/* Link de Referência - Estilo Raw URL com Validação Visual */}
                <div>
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                     <LinkIcon className="w-3 h-3" />
                     {t.refLink}
                   </h4>
                   {item.analysis.sources.length > 0 ? (
                     <div className="space-y-2">
                       {item.analysis.sources.slice(0, 1).map((source, idx) => (
                         <UrlChecker key={idx} uri={source.uri} t={t} />
                       ))}
                     </div>
                   ) : (
                     <span className="text-xs text-slate-400 italic">{t.noLink}</span>
                   )}
                </div>

              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Sub-component to handle basic URL validation visualization
const UrlChecker = ({ uri, t }: { uri: string, t: any }) => {
    // Basic regex for URL syntax
    const isValidSyntax = /^(https?:\/\/)/i.test(uri) && uri.length > 10;
    
    // We cannot reliably check status code 200 due to CORS from client. 
    // We rely on the AI's improved prompt, but show visual warnings for obviously bad syntax.

    return (
        <div className="flex items-center gap-2">
            <a 
                href={uri}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs font-mono break-all px-2 py-1.5 rounded border block w-full truncate transition-colors ${
                    isValidSyntax 
                    ? 'text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 border-indigo-100' 
                    : 'text-rose-600 hover:text-rose-800 bg-rose-50 border-rose-100 line-through'
                }`}
            >
                {uri}
            </a>
            <a 
                href={uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                title="Abrir em nova guia"
            >
                <ExternalLink className="w-4 h-4" />
            </a>
            {!isValidSyntax && (
                 <span className="text-[10px] text-rose-500 font-medium whitespace-nowrap">
                    {t.linkInvalid}
                 </span>
            )}
        </div>
    )
}

export default ResultsList;