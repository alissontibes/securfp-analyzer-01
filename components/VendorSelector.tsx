import React from 'react';
import { SECURITY_DOMAINS, SecurityDomainType, VendorContext, Language } from '../types';
import { translations } from '../utils/translations';
import { Layers, Check, Server, Shield, Cloud, Mail, Globe, Lock } from 'lucide-react';

interface VendorSelectorProps {
  currentContext: VendorContext;
  onChange: (context: VendorContext) => void;
  disabled: boolean;
  language: Language;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ currentContext, onChange, disabled, language }) => {
  const domains = Object.keys(SECURITY_DOMAINS) as SecurityDomainType[];
  const t = translations[language];

  const getIcon = (domain: SecurityDomainType) => {
    switch (domain) {
      case 'Network Security (NGFW)': return <Server className="w-4 h-4" />;
      case 'Endpoint Protection (EPP/EDR)': return <Shield className="w-4 h-4" />;
      case 'SSE / SASE': return <Globe className="w-4 h-4" />;
      case 'Email Security': return <Mail className="w-4 h-4" />;
      case 'Cloud Security (CNAPP)': return <Cloud className="w-4 h-4" />;
      case 'WAF (Web Application Firewall)': return <Lock className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getTranslatedDomain = (domain: SecurityDomainType) => {
      // Map domain keys to translation keys or fallback
      if(domain === 'Network Security (NGFW)') return t.domain_Network;
      if(domain === 'Endpoint Protection (EPP/EDR)') return t.domain_Endpoint;
      if(domain === 'SSE / SASE') return t.domain_SASE;
      if(domain === 'Email Security') return t.domain_Email;
      if(domain === 'Cloud Security (CNAPP)') return t.domain_Cloud;
      if(domain === 'WAF (Web Application Firewall)') return t.domain_WAF;
      if(domain === 'AI Security / Protection') return t.domain_AI;
      return domain;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          {t.configTitle}
        </h2>
      </div>

      <div className="p-4">
        {/* Domain Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => onChange({ domain, vendor: SECURITY_DOMAINS[domain][0] })}
              disabled={disabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentContext.domain === domain
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {getIcon(domain)}
              {getTranslatedDomain(domain)}
            </button>
          ))}
        </div>

        {/* Vendor Selection */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {t.selectVendor}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SECURITY_DOMAINS[currentContext.domain].map((vendor) => (
              <button
                key={vendor}
                onClick={() => onChange({ ...currentContext, vendor })}
                disabled={disabled}
                className={`relative px-4 py-3 rounded-lg border text-left transition-all ${
                  currentContext.vendor === vendor
                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-semibold ${
                    currentContext.vendor === vendor ? 'text-indigo-900' : 'text-slate-700'
                  }`}>
                    {vendor}
                  </span>
                  {currentContext.vendor === vendor && (
                    <div className="bg-indigo-600 rounded-full p-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {currentContext.domain.split('(')[1]?.replace(')', '') || 'Security'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSelector;