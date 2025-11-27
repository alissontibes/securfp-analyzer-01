export interface SourceReference {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  supportStatus: 'Sim' | 'Não' | 'Parcial' | 'Indeterminado';
  manufacturer?: string;
  response: string; // Will hold the Description
  sources: SourceReference[]; // Will hold the specific proof link
  suggestedModel?: string;
}

export interface RFPItem {
  id: string;
  requirement: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  analysis?: AnalysisResult;
  errorMsg?: string;
}

export type SecurityDomainType = 
  | 'Network Security (NGFW)'
  | 'Endpoint Protection (EPP/EDR)'
  | 'SSE / SASE'
  | 'Email Security'
  | 'Cloud Security (CNAPP)'
  | 'WAF (Web Application Firewall)'
  | 'AI Security / Protection';

export interface VendorContext {
  domain: SecurityDomainType;
  vendor: string;
}

export type Language = 'pt' | 'en' | 'es';

export const SECURITY_DOMAINS: Record<SecurityDomainType, string[]> = {
  'Network Security (NGFW)': [
    'Palo Alto Networks',
    'Fortinet',
    'Check Point',
    'Cisco',
    'Juniper Networks',
    'Sophos'
  ],
  'Endpoint Protection (EPP/EDR)': [
    'CrowdStrike',
    'SentinelOne',
    'Microsoft Defender',
    'Trend Micro',
    'Sophos',
    'Broadcom (Symantec)'
  ],
  'SSE / SASE': [
    'Zscaler',
    'Netskope',
    'Check Point (Harmony SASE)',
    'Palo Alto Networks (Prisma Access)',
    'Cato Networks',
    'Cloudflare'
  ],
  'Email Security': [
    'Proofpoint',
    'Mimecast',
    'Microsoft',
    'Check Point (Harmony Email/Avanan)',
    'Barracuda'
  ],
  'Cloud Security (CNAPP)': [
    'Wiz',
    'Orca Security',
    'Palo Alto Networks (Prisma Cloud)',
    'Check Point (CloudGuard)',
    'Sysdig',
    'Lacework'
  ],
  'WAF (Web Application Firewall)': [
    'Akamai',
    'Cloudflare',
    'Imperva',
    'F5',
    'Check Point (CloudGuard WAF)',
    'Fortinet',
    'AWS WAF'
  ],
  'AI Security / Protection': [
    'Palo Alto Networks (Secure AI)',
    'Check Point',
    'Microsoft (Security Copilot)',
    'HiddenLayer',
    'Protect AI'
  ]
};