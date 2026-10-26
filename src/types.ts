export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  price: string;
  category: string;
  badge?: string;
  badgeColor?: 'blue' | 'red' | 'purple' | 'amber' | 'emerald';
  highlight?: boolean;
}

export interface LogoSample {
  id: string;
  brandName: string;
  tagline: string;
  industry: 'Tech & AI' | 'Corporate & Legal' | 'Trade & Commerce' | 'Creative & Modern';
  category: string;
  palette: string[];
  markType: string;
  description: string;
}

export interface QueryFormData {
  service: string;
  name: string;
  email: string;
  whatsapp: string;
  query: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  showWhatsAppButton?: boolean;
}
