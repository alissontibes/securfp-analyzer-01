import { AnalysisResult, SourceReference, VendorContext, Language } from "../types";

// Ollama configuration
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2:3b'; // Default model, can be changed

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if Ollama is available
export const checkOllamaConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Generate content using Ollama
const generateWithOllama = async (prompt: string, model: string = OLLAMA_MODEL): Promise<string> => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.0, // Zero temperature for maximum determinism
        top_p: 0.9,
        top_k: 40,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.response || "Sem resposta gerada.";
};

export const analyzeRFPRequirement = async (
  requirement: string, 
  context?: VendorContext, 
  lang: Language = 'pt',
  hardwareLock?: string
): Promise<AnalysisResult> => {
  // Check Ollama connection
  const isAvailable = await checkOllamaConnection();
  if (!isAvailable) {
    throw new Error("Ollama não está disponível. Por favor, verifique se o Ollama está rodando em " + OLLAMA_BASE_URL);
  }

  // Default values if no context provided
  const targetVendor = context?.vendor || "Fabricante Líder";

  const langInstruction = lang === 'en' ? 'ENGLISH' : lang === 'es' ? 'SPANISH' : 'PORTUGUESE';

  // Construct hardware instruction based on lock
  let hardwareInstruction = `
    2. HARDWARE / DIMENSIONAMENTO:
       - Se o requisito exigir throughput, portas ou capacidade: **ESCOLHA APENAS UM (1) MODELO**.
       - Selecione o modelo "Best Fit" (Melhor Encaixe) que atenda com folga. Não liste famílias inteiras.
       - Exemplo Correto: "Modelo Quantum 6600 (3.7 Gbps Threat Prevention, 2x 10G SFP+)."
  `;

  if (hardwareLock) {
    hardwareInstruction = `
    2. HARDWARE / DIMENSIONAMENTO (LOCKED):
       - O cliente já definiu o modelo: "${hardwareLock}".
       - Valide o requisito APENAS considerando as capacidades deste modelo específico.
       - Se o modelo não suportar, responda "Não".
    `;
  }

  // Vendor Specific Deep Search Logic
  let deepSearchInstruction = "";
  const vendorLower = targetVendor.toLowerCase();

  if (vendorLower.includes("check point") || vendorLower.includes("cloudguard") || vendorLower.includes("harmony")) {
    deepSearchInstruction = `
      - PRIORIDADE TOTAL para domínios: 'sc1.checkpoint.com', 'supportcenter.checkpoint.com', 'docs.checkpoint.com', 'research.checkpoint.com'.
      - PROIBIDO usar 'www.checkpoint.com/products/' ou 'www.checkpoint.com/quantum/'.
      - Busque por termos como 'SK', 'Admin Guide', 'Release Notes', 'Datasheet'.
    `;
  } else if (vendorLower.includes("palo alto") || vendorLower.includes("prisma")) {
    deepSearchInstruction = `
      - PRIORIDADE TOTAL para: 'docs.paloaltonetworks.com', 'knowledgebase.paloaltonetworks.com'.
      - PROIBIDO usar landing pages de marketing.
    `;
  } else if (vendorLower.includes("fortinet") || vendorLower.includes("fortigate")) {
    deepSearchInstruction = `
      - PRIORIDADE TOTAL para: 'docs.fortinet.com', 'kb.fortinet.com', 'handbook.fortinet.com'.
    `;
  } else if (vendorLower.includes("cisco")) {
    deepSearchInstruction = `
      - PRIORIDADE TOTAL para: 'cisco.com/c/en/us/td/docs/', 'cisco.com/c/en/us/support/'.
    `;
  } else {
    deepSearchInstruction = `
      - EVITE páginas principais (.com/).
      - PRIORIZE subdomínios de documentação técnica (docs.*, support.*, kb.*, help.*).
    `;
  }

  const prompt = `
    Atue como um Engenheiro de Sistemas Sênior (Pre-Sales) especializado em ${targetVendor}.
    
    OBJETIVO:
    Validar tecnicamente se a solução da **${targetVendor}** atende ao requisito, provendo prova técnica específica.
    
    REQUISITO DE ENTRADA:
    "${requirement}"

    DIRETRIZES ESTRITAS:
    1. CONCISÃO E ASSERTIVADE:
       - Sua resposta deve ser CURTA e DIRETA. Máximo de 3 linhas.
       - Use linguagem técnica. Evite "chatter".
       - Não use "A solução parece suportar". Use "Suporta nativamente via feature X".

    ${hardwareInstruction}
    
    3. FILTRAGEM DE RUÍDO:
       - Se o requisito for ADMINISTRATIVO (prazos, entrega, garantia legal, multas), NOMES DE PESSOAS, EMAILS ou PROCESSOS DE RFP: Responda "N/A - Requisito Administrativo/Logístico" e marque como Indeterminado.
       - Se for PREÇO: Responda "N/A - Comercial".

    4. FONTE E LINKS (CRÍTICO - DEEP SEARCH):
       ${deepSearchInstruction}
       - O link DEVE levar a um documento técnico (Admin Guide, SK, KB Article, Datasheet PDF).
       - Se você fornecer uma URL genérica de marketing (ex: pagina inicial do produto), você falhou.
       - Se não encontrar documentação técnica EXATA, não invente. Deixe o link em branco.
       - Baseie-se no seu conhecimento técnico sobre ${targetVendor}.

    5. IDIOMA DE RESPOSTA: **${langInstruction}**.

    FORMATO DE RESPOSTA OBRIGATÓRIO:
    Atende: [Sim/Não/Parcial]
    Modelo: [Nome do modelo específico se citado/necessário, caso contrário deixar vazio]
    Link de referencia: [URL pura, específica e técnica]
    Descricao: [Texto técnico conciso citando a feature exata, comando CLI ou parâmetro que atende.]
  `;

  // Retry Logic
  let attempts = 0;
  const maxRetries = 3;
  let lastError: any;

  while (attempts <= maxRetries) {
    try {
      const textResponse = await generateWithOllama(prompt, OLLAMA_MODEL);
      
      // Parse strict format
      let supportStatus: 'Sim' | 'Não' | 'Parcial' | 'Indeterminado' = 'Indeterminado';
      let description = textResponse;
      let explicitLink = '';
      let suggestedModel = undefined;

      // 1. Extract Status (Handle multi-language matches)
      const statusMatch = textResponse.match(/Atende:\s*(Sim|Yes|Si|Não|No|Parcial|Partial)/i);
      if (statusMatch) {
          const rawStatus = statusMatch[1].toLowerCase();
          if (['sim', 'yes', 'si'].includes(rawStatus)) supportStatus = 'Sim';
          else if (['não', 'nao', 'no'].includes(rawStatus)) supportStatus = 'Não';
          else supportStatus = 'Parcial';
      }

      // Extract Model
      const modelMatch = textResponse.match(/Modelo:\s*(.*)/i);
      if (modelMatch) {
          const m = modelMatch[1].trim();
          if (m && !m.toLowerCase().includes('n/a') && !m.toLowerCase().includes('vazio') && m.length > 2) {
              suggestedModel = m;
          }
      }

      // 2. Extract Link (Context-aware extraction)
      const linkMatch = textResponse.match(/Link de referencia:\s*(https?:\/\/[^\s\n]+)/i);
      if (linkMatch) {
          explicitLink = linkMatch[1].trim();
          // Cleanup trailing punctuation
          if (explicitLink.endsWith('.') || explicitLink.endsWith(',')) {
              explicitLink = explicitLink.slice(0, -1);
          }
      }

      // 3. Extract Description
      const descMatch = textResponse.match(/Descricao:\s*([\s\S]*?)$/i);
      if (descMatch) {
          description = descMatch[1].trim();
      } else {
          // Fallback cleanup
          description = textResponse
              .replace(/Atende:.*\n?/i, '')
              .replace(/Modelo:.*\n?/i, '')
              .replace(/Link de referencia:.*\n?/i, '')
              .trim();
      }

      const sources: SourceReference[] = [];
      
      if (explicitLink) {
          sources.push({ title: 'Documentação Técnica', uri: explicitLink });
      }

      // Clean up description if it accidentally captured labels
      description = description.replace(/^Sim\s*|^Não\s*|^Yes\s*|^No\s*|^Si\s*/i, '').trim();

      return {
        supportStatus,
        manufacturer: targetVendor,
        response: description,
        sources: sources,
        suggestedModel
      };

    } catch (error: any) {
      lastError = error;
      
      // Check if it's a connection error
      const isConnectionError = error.message?.includes('fetch') || 
                                error.message?.includes('network') ||
                                error.message?.includes('ECONNREFUSED');

      if (isConnectionError && attempts < maxRetries) {
          attempts++;
          const waitTime = 1000 * attempts; // Linear backoff: 1s, 2s, 3s
          console.warn(`Erro de conexão com Ollama. Retentativa ${attempts}/${maxRetries} em ${waitTime}ms...`);
          await delay(waitTime);
          continue;
      }
      
      // If not connection error or max retries exceeded, throw
      break;
    }
  }

  console.error("Erro fatal na análise AI após retentativas:", lastError);
  throw new Error(lastError?.message || "Falha ao conectar com o Ollama. Verifique se o Ollama está rodando.");
};

