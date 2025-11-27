import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { RFPItem, VendorContext, SECURITY_DOMAINS, Language } from './types';
import { analyzeRFPRequirement } from './services/ollamaService';
import { translations } from './utils/translations';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultsList from './components/ResultsList';
import VendorSelector from './components/VendorSelector';
import { Download, PlayCircle, RotateCcw, StopCircle } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<RFPItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  
  // Ref to handle cancellation signal
  const abortRef = useRef<boolean>(false);
  
  // Track specific locked hardware model across the session
  const hardwareLockRef = useRef<string | undefined>(undefined);

  // Initialize context with first domain and its first vendor
  const [context, setContext] = useState<VendorContext>({
    domain: 'Network Security (NGFW)',
    vendor: SECURITY_DOMAINS['Network Security (NGFW)'][0]
  });

  const t = translations[language];

  // Add items to the list
  const handleAddItems = (newRequirements: string[]) => {
    const newItems: RFPItem[] = newRequirements.map(req => ({
      id: uuidv4(),
      requirement: req,
      status: 'pending'
    }));
    setItems(prev => [...prev, ...newItems]);
  };

  // Process a single item
  const processItem = async (item: RFPItem, currentContext: VendorContext): Promise<RFPItem> => {
    try {
      const result = await analyzeRFPRequirement(
        item.requirement, 
        currentContext, 
        language, 
        hardwareLockRef.current // Pass the locked model if exists
      );

      // If the result suggested a model and we don't have one locked yet, lock it!
      if (result.suggestedModel && !hardwareLockRef.current) {
         hardwareLockRef.current = result.suggestedModel;
         // console.log("Hardware Locked to:", result.suggestedModel);
      }

      return { ...item, status: 'completed', analysis: result };
    } catch (error: any) {
      return { ...item, status: 'error', errorMsg: error.message };
    }
  };

  const handleStopAnalysis = () => {
    abortRef.current = true;
  };

  // Trigger analysis for all pending items
  const handleAnalyzeAll = useCallback(async () => {
    if (isProcessing) return;
    
    const pendingItems = items.filter(i => i.status === 'pending' || i.status === 'error');
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    abortRef.current = false;
    hardwareLockRef.current = undefined; // Reset hardware lock for new batch run if starting fresh

    const idsToProcess = pendingItems.map(i => i.id);
    const batchContext = { ...context };

    for (let i = 0; i < idsToProcess.length; i++) {
       const id = idsToProcess[i];

       // Check for abort signal
       if (abortRef.current) {
          break;
       }

       // Add a delay between requests to mitigate API Rate Limits (429)
       // Skip delay for the very first item
       if (i > 0) {
           await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second throttle
       }

       setItems(prev => prev.map(item => 
         item.id === id ? { ...item, status: 'analyzing', errorMsg: undefined } : item
       ));

       const currentItem = items.find(i => i.id === id);
       if(currentItem) {
          const updatedItem = await processItem(currentItem, batchContext);
          
          // Check abort again before setting state
          if (abortRef.current) {
             setItems(prev => prev.map(item => 
                 item.id === id ? { ...item, status: 'pending' } : item 
             ));
             break;
          }

          setItems(prev => prev.map(item => 
            item.id === id ? updatedItem : item
          ));
       }
    }

    setIsProcessing(false);
    abortRef.current = false;
  }, [items, isProcessing, context, language]);

  // Export to Excel with structured columns matching the user request
  const handleExportExcel = () => {
    const dataToExport = items.map(item => ({
      'Requisito': item.requirement,
      'Atende?': item.analysis?.supportStatus || 'N/A',
      'Link de Referência': item.analysis?.sources?.[0]?.uri || 'N/A',
      'Descrição Técnica': item.analysis?.response || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    
    // Adjust column widths
    const wscols = [
      { wch: 60 }, // Requisito
      { wch: 10 }, // Atende?
      { wch: 60 }, // Link
      { wch: 60 }, // Descrição
    ];
    worksheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Compliance Matrix");
    XLSX.writeFile(workbook, `RFP_Analise_${context.vendor.replace(/[^a-z0-9]/gi, '_')}.xlsx`);
  };

  const handleClearAll = () => {
    if (window.confirm(t.confirmClear)) {
        setItems([]);
        hardwareLockRef.current = undefined;
    }
  };

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const completedCount = items.filter(i => i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Vendor Configuration Section */}
        <VendorSelector 
          currentContext={context} 
          onChange={setContext} 
          disabled={isProcessing} 
          language={language}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-1 space-y-6">
            <InputSection onAddItems={handleAddItems} isAnalyzing={isProcessing} language={language} />
            
            {/* Stats / Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="font-semibold text-slate-800 mb-4">{t.actionsTitle}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{t.targetVendor}</span>
                  <span className="font-bold text-indigo-700 text-right max-w-[150px] truncate" title={context.vendor}>{context.vendor}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{t.totalItems}</span>
                  <span className="font-mono font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{t.pending}</span>
                  <span className="font-mono font-medium text-amber-600">{pendingCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{t.processed}</span>
                  <span className="font-mono font-medium text-emerald-600">{completedCount}</span>
                </div>
              </div>

              <div className="space-y-3">
                {isProcessing ? (
                   <button
                    onClick={handleStopAnalysis}
                    className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm animate-pulse"
                  >
                    <StopCircle className="w-4 h-4" />
                    {t.abortMission}
                  </button>
                ) : (
                  <button
                    onClick={handleAnalyzeAll}
                    disabled={pendingCount === 0}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {t.validatePending}
                  </button>
                )}

                <button
                  onClick={handleExportExcel}
                  disabled={items.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  {t.exportExcel}
                </button>

                 <button
                  onClick={handleClearAll}
                  disabled={isProcessing || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.clearAll}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-2">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">{t.complianceMatrix}</h2>
             </div>
             
             <ResultsList items={items} language={language} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;