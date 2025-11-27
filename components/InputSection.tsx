import React, { useState, useRef } from 'react';
import { Plus, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
import { Language, translations } from '../utils/translations';

// Configure worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

interface InputSectionProps {
  onAddItems: (items: string[]) => void;
  isAnalyzing: boolean;
  language: Language;
}

const InputSection: React.FC<InputSectionProps> = ({ onAddItems, isAnalyzing, language }) => {
  const [inputText, setInputText] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  // Helper to filter noise from imported files
  const filterImportedLines = (lines: string[]): string[] => {
    const noisePatterns = [
        /^(page|página|pag)\s*\d+$/i, // Page numbers
        /^\d+$/, // Standalone numbers
        /^confidential|confidencial$/i, // Watermarks
        /^table of contents|índice$/i, // TOC
    ];

    // Commercial/Price/Administrative keywords to discard
    const nonTechnicalPatterns = [
        /preço|price|valor|cost|custo|orçamento|budget/i,
        /total.*(?:r\$|usd|\$|€)/i,
        /investimento/i,
        /capex|opex/i,
        /proposal validity|validade da proposta/i,
        /prazo de entrega|delivery time|cronograma|schedule/i,
        /assinatura|signature|representante legal/i,
        /multa|penalty|garantia contratual/i,
        // Detect Emails (often indicates contact person, not tech requirement)
        /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/i
    ];

    return lines
        .map(l => l.trim())
        // Remove empty lines and very short lines that are likely noise
        .filter(l => l.length > 15)
        // Remove lines matching noise patterns
        .filter(l => !noisePatterns.some(p => p.test(l)))
        // Remove lines matching commercial/admin patterns
        .filter(l => !nonTechnicalPatterns.some(p => p.test(l)));
  };

  const handleAdd = () => {
    if (!inputText.trim()) return;
    
    // Split by new lines OR semicolons to support the user's specific delimiter request
    const items = inputText
      .split(/[;\n]+/) // Split by semicolon or newline
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (items.length > 0) {
      // We apply the same filtering logic to manual input to keep it clean if user pastes a mess
      const cleanItems = filterImportedLines(items);
      if (cleanItems.length > 0) {
          onAddItems(cleanItems);
          setInputText('');
      } else {
          // If strict filtering removed everything (e.g. user typed just short words), 
          // fallback to adding the raw items if they are at least meaningful
          const fallbackItems = items.filter(i => i.length > 3);
          if (fallbackItems.length > 0) {
             onAddItems(fallbackItems);
             setInputText('');
          }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAdd();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);

    // 1. PDF Handling
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    // Join items with space, preserving some layout flow
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n';
                }

                // Split requirements by: Newline OR Semicolon OR Bullet points looking like "1.1 "
                const rawLines = fullText.split(/(?:\r?\n|;|\.\s{2,})/);
                const items = filterImportedLines(rawLines);

                if (items.length > 0) {
                    onAddItems(items);
                } else {
                    alert('Não foi possível extrair texto legível deste PDF. Verifique se é um arquivo escaneado (imagem).');
                }
            } catch (error) {
                console.error("PDF Error", error);
                alert("Erro ao processar PDF.");
            } finally {
                setIsReadingFile(false);
            }
        };
        reader.readAsArrayBuffer(file);
        
    // 2. CSV / TXT Handling
    } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
       const reader = new FileReader();
       reader.onload = (event) => {
         const text = event.target?.result as string;
         // Split by newline OR semicolon
         const rawLines = text.split(/(?:\r?\n|;)/);
         const items = filterImportedLines(rawLines);
         
         if (items.length > 0) onAddItems(items);
         setIsReadingFile(false);
       };
       reader.readAsText(file);

    // 3. Excel Handling
    } else {
       const reader = new FileReader();
       reader.onload = (event) => {
         try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            const rawItems: string[] = [];
            
            jsonData.forEach(row => {
               if (row && row.length > 0) {
                   // Find the first string cell in the row
                   const cell = row.find(c => typeof c === 'string');
                   if (cell) {
                       // CRITICAL: Split cell content by semicolon too. 
                       // Often cells contain "Req 1; Req 2; Req 3"
                       const cellParts = cell.split(/[;\n]+/);
                       rawItems.push(...cellParts);
                   }
               }
            });

            const items = filterImportedLines(rawItems);

            if (items.length > 0) onAddItems(items);

         } catch (error) {
            console.error("Erro ao ler Excel", error);
            alert("Erro ao ler arquivo Excel.");
         } finally {
            setIsReadingFile(false);
         }
       };
       reader.readAsArrayBuffer(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          {t.inputTitle}
        </h2>
        <button
           onClick={() => fileInputRef.current?.click()}
           className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg disabled:opacity-50"
           disabled={isAnalyzing || isReadingFile}
        >
           {isReadingFile ? <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-3.5 h-3.5" />}
           {isReadingFile ? 'Lendo...' : t.uploadFile}
        </button>
        <input 
           type="file" 
           ref={fileInputRef} 
           className="hidden" 
           accept=".xlsx,.xls,.csv,.txt,.pdf" 
           onChange={handleFileUpload}
        />
      </div>
      
      <p className="text-sm text-slate-500 mb-4">
        {t.inputSubtitle}
      </p>
      
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.inputPlaceholder}
          className="w-full h-32 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm transition-all"
          disabled={isAnalyzing}
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
          {t.ctrlEnter}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleAdd}
          disabled={!inputText.trim() || isAnalyzing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t.addQueue}
        </button>
      </div>
    </div>
  );
};

export default InputSection;