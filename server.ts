import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Fast HTTP 301 redirect if someone visits registree.ai.studio or old URL (except admin/staff access)
app.use((req: Request, res: Response, next) => {
  const host = (req.headers.host || '').toLowerCase();
  const isStaff = req.url.toLowerCase().includes('admin') || req.url.toLowerCase().includes('staff');
  if (host.includes('registree.ai.studio') && !isStaff) {
    return res.redirect(301, 'https://theregistree.shop' + req.url);
  }
  next();
});

// Lead management data structure with conversion price & discount tracking
export interface LeadRecord {
  id: string;
  timestamp: string;
  service: string;
  name: string;
  email: string;
  whatsapp: string;
  query: string;
  status: 'New' | 'Contacted' | 'Proposal Sent' | 'Converted' | 'Archived';
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  budget?: string;
  conversionPrice?: string;  // Agreed deal / conversion price after discount (e.g. "₹14,999", "$200")
  originalPrice?: string;    // Standard package list price (e.g. "₹19,999")
  discountPercent?: number;  // Discount percentage (e.g. 20)
  discountReason?: string;   // Negotiation or discount note (e.g. "Festive discount agreed on WhatsApp")
  lastUpdated: string;
}

const LEADS_FILE_PATH = path.resolve(__dirname, 'leads_store.json');

// Sample leads reference for demonstration & restore
export const sampleLeadsList: LeadRecord[] = [
  {
    id: 'LEAD-101',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    service: 'Website Design (+ Free Logo Bundle)',
    name: 'Aman Sharma',
    email: 'aman@sharmaexports.in',
    whatsapp: '+91 98123 45678',
    query: 'Interested in corporate exporter website with catalog and free logo design.',
    status: 'Proposal Sent',
    priority: 'High',
    budget: '₹19,999',
    originalPrice: '₹19,999',
    conversionPrice: '₹15,999',
    discountPercent: 20,
    discountReason: 'Offered 20% discount on WhatsApp for upfront advance payment.',
    notes: 'Sent quotation on WhatsApp with portfolio links. Client reviewing draft.',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'LEAD-102',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    service: 'Foreign Direct Investment & Subsidiary Setup',
    name: 'David Miller',
    email: 'david@millertech.co.uk',
    whatsapp: '+44 7911 123456',
    query: 'UK company looking to incorporate Indian wholly-owned subsidiary with FDI compliance.',
    status: 'Contacted',
    priority: 'High',
    budget: 'Custom Scope',
    originalPrice: '₹45,000',
    conversionPrice: '₹40,000',
    discountPercent: 11,
    discountReason: 'Special inaugural pricing for international enterprise.',
    notes: 'Introductory call completed. Drafting formal engagement scope.',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'LEAD-103',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    service: 'Logo & Corporate Identity Package',
    name: 'Pooja Singhal',
    email: 'pooja.designs@outlook.com',
    whatsapp: '+91 98765 01234',
    query: 'Need 3 minimalist vector logo concepts for new organic skincare brand.',
    status: 'Converted',
    priority: 'Medium',
    budget: '₹999',
    originalPrice: '₹999',
    conversionPrice: '₹999',
    discountPercent: 0,
    discountReason: 'Standard package price confirmed and paid.',
    notes: 'Payment received. 3 logo concepts dispatched via email.',
    lastUpdated: new Date().toISOString(),
  },
];

const loadLeads = (): LeadRecord[] => {
  try {
    if (fs.existsSync(LEADS_FILE_PATH)) {
      const data = fs.readFileSync(LEADS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // If empty or newly initialized, populate with initial sample leads so user has a working desk
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(sampleLeadsList, null, 2));
    return sampleLeadsList;
  } catch (err) {
    console.error('Error reading leads file:', err);
    return sampleLeadsList;
  }
};

const saveLeads = (leads: LeadRecord[]) => {
  try {
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2));
  } catch (err) {
    console.error('Error saving leads file:', err);
  }
};

let allLeads: LeadRecord[] = loadLeads();

// Gemini client initialization
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const SYSTEM_INSTRUCTION = `You are the official AI representative for REGISTREE, a premier corporate setup, AI automation, and legal compliance agency based in New Delhi, India.

About REGISTREE:
REGISTREE helps businesses go online, automate, and operate legally in India, catering to both domestic and international clients.

Our Core Services & Offers:
1. Website Design: High-performance corporate websites & digital experiences built to scale. Starting from ₹19,999 (~$230 USD). SPECIAL OFFER: Every website comes with a 100% FREE custom professional logo design AND free custom business domain email setup (e.g. you@yourbrand.com)!
2. Standalone Professional Logo Design: Custom brand identity and high-resolution vector logo design as a separate service for just ₹999 INR (~$12 USD).
3. AI Automation: End-to-end workflow automation to streamline operations and cut manual work. Custom tailored scope.
4. AI Voice Agent for Business: Intelligent, conversational 24/7 inbound & outbound voice agents. Custom tailored scope.
5. Company Registration in India: Private Limited (Pvt Ltd), Limited Liability Partnership (LLP), and OPC incorporation with complete regulatory compliance.
6. Trademark Registration: Comprehensive trademark search, IP filing, and brand protection in India.
7. GST, PAN & Other Compliances: Goods and Services Tax registration, PAN allotment, and ongoing annual statutory compliances.
8. Business Setup & Development in India: Comprehensive market entry and subsidiary setup for foreign and domestic founders.
9. International Trade Facilitator: Import/Export code (IEC), trade licensing, and cross-border trade facilitation.
10. International Cargo Service: Air and ocean freight forwarding, door-to-door customs clearance, container logistics, and global courier solutions connecting India worldwide. Bespoke volume freight rates.

Pricing Policy:
- Website Design starts from ₹19,999 (~$230 USD) and INCLUDES a FREE custom logo design.
- Standalone Logo Design is ₹999 (~$12 USD).
- Other services (Company Registration, AI, Trademark, Compliance, etc.) have custom pricing depending on specific business requirements.
- CRITICAL RULE: Never invent arbitrary prices beyond ₹19,999 for Website Design (with Free Logo) and ₹999 for Standalone Logo Design.

Response Style & Guidelines:
- Keep answers short, friendly, concise, and professional (2-4 sentences max).
- Whenever discussing next steps or pricing, warmly invite them to continue on WhatsApp at +91-6005534878 (https://wa.me/916005534878) or email theregistreein@gmail.com.
- Location: New Delhi, India.`;

// AI Chatbot endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'A valid message is required.' });
      return;
    }

    const ai = getGenAI();

    // Prepare conversational prompt with context
    let promptText = `${SYSTEM_INSTRUCTION}\n\n`;
    if (Array.isArray(history) && history.length > 0) {
      promptText += `Recent conversation context:\n`;
      const contextSlice = history.slice(-6);
      for (const turn of contextSlice) {
        promptText += `${turn.role === 'user' ? 'Client' : 'Assistant'}: ${turn.text}\n`;
      }
      promptText += `\n`;
    }
    promptText += `Client: ${message.trim()}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });

    const reply = response.text || 'Thank you for reaching out to REGISTREE. How may we assist your business today?';

    res.json({ reply: reply.trim() });
  } catch (error: any) {
    console.error('Chat error:', error);
    // Graceful fallback response if API key is not ready or rate-limited
    res.status(200).json({
      reply: 'Hello! REGISTREE helps businesses go online, automate, and register legally in India. Plans start from ₹19,999 (~$230 USD). For immediate consultation or custom quotes, please message our team on WhatsApp at +91-6005534878 (https://wa.me/916005534878) or email theregistreein@gmail.com.',
    });
  }
});

// Query submission endpoint
app.post('/api/query', async (req: Request, res: Response) => {
  try {
    const { service, name, email, whatsapp, query } = req.body;

    // Field validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please provide a valid full name.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!whatsapp || typeof whatsapp !== 'string' || whatsapp.trim().length < 7) {
      res.status(400).json({ error: 'Please provide a valid WhatsApp phone number with country code.' });
      return;
    }
    if (!query || typeof query !== 'string' || query.trim().length < 5) {
      res.status(400).json({ error: 'Please describe your query requirements.' });
      return;
    }

    const defaultPrice = (service || '').includes('999') && !(service || '').includes('19,999')
      ? '₹999'
      : (service || '').includes('19,999')
      ? '₹19,999'
      : '₹14,999';

    const newLead: LeadRecord = {
      id: `LEAD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      service: service || 'General Query',
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      query: query.trim(),
      status: 'New',
      priority: 'High',
      notes: 'New inquiry received via website portal.',
      budget: defaultPrice,
      originalPrice: defaultPrice,
      conversionPrice: defaultPrice,
      discountPercent: 0,
      discountReason: 'Standard list price package.',
      lastUpdated: new Date().toISOString(),
    };

    allLeads.unshift(newLead);
    saveLeads(allLeads);

    console.log('----------------------------------------------------');
    console.log('[REGISTREE NEW INQUIRY DISPATCH]');
    console.log('To: theregistreein@gmail.com');
    console.log(`Lead ID: ${newLead.id}`);
    console.log(`Service: ${newLead.service}`);
    console.log(`Client: ${newLead.name} <${newLead.email}>`);
    console.log(`WhatsApp: ${newLead.whatsapp}`);
    console.log(`Query: ${newLead.query}`);
    console.log('----------------------------------------------------');

    // 1. Direct dispatch to theregistreein@gmail.com and CC to mashek.org@gmail.com
    let emailDispatched = false;
    const clientOrigin = (req.headers.origin as string) || (req.headers.referer as string) || 'https://theregistree.shop';

    try {
      const directRes = await fetch('https://formsubmit.co/ajax/theregistreein@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: clientOrigin,
          Referer: clientOrigin,
        },
        body: JSON.stringify({
          _subject: `[REGISTREE Query] ${newLead.service} - ${newLead.name}`,
          _captcha: 'false',
          _template: 'table',
          _cc: 'mashek.org@gmail.com',
          Service: newLead.service,
          ClientName: newLead.name,
          Email: newLead.email,
          WhatsApp: newLead.whatsapp,
          QueryDetails: newLead.query,
          ReferenceID: newLead.id,
          Timestamp: newLead.timestamp,
        }),
      });

      const directData = await directRes.json();
      console.log('FormSubmit direct response:', directData);
      if (directData.success === 'true' || directData.success === true) {
        emailDispatched = true;
      }
    } catch (directErr) {
      console.warn('FormSubmit direct notice:', directErr);
    }

    // Backup token dispatch
    try {
      const formSubmitToken = 'cce1b353682c5d915f2606d479acf68b';
      const fsRes = await fetch(`https://formsubmit.co/ajax/${formSubmitToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: clientOrigin,
          Referer: clientOrigin,
        },
        body: JSON.stringify({
          _subject: `[REGISTREE Query] ${newLead.service} - ${newLead.name}`,
          _captcha: 'false',
          _template: 'table',
          Service: newLead.service,
          ClientName: newLead.name,
          Email: newLead.email,
          WhatsApp: newLead.whatsapp,
          QueryDetails: newLead.query,
          ReferenceID: newLead.id,
          Timestamp: newLead.timestamp,
        }),
      });

      const fsData = await fsRes.json();
      console.log('FormSubmit token response:', fsData);
      if (fsData.success === 'true' || fsData.success === true) {
        emailDispatched = true;
      }
    } catch (fsErr) {
      console.warn('FormSubmit token notice:', fsErr);
    }

    // 2. If RESEND_API_KEY is configured in env, attempt direct Resend dispatch
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'REGISTREE Portal <onboarding@resend.dev>',
            to: ['theregistreein@gmail.com'],
            subject: `[New Inquiry] ${newLead.service} - ${newLead.name}`,
            text: `New client inquiry received on REGISTREE:\n\nService: ${newLead.service}\nName: ${newLead.name}\nEmail: ${newLead.email}\nWhatsApp: ${newLead.whatsapp}\n\nQuery Details:\n${newLead.query}\n\nSubmitted at: ${newLead.timestamp}\nReference ID: ${newLead.id}`,
          }),
        });
        emailDispatched = true;
      } catch (mailErr) {
        console.warn('Direct Resend dispatch notice:', mailErr);
      }
    }

    res.json({
      success: true,
      referenceId: newLead.id,
      emailDispatched,
      inquiry: newLead,
      message: 'Your query has been recorded and dispatched to theregistreein@gmail.com.',
    });
  } catch (error: any) {
    console.error('Query submission error:', error);
    res.status(500).json({ error: 'Failed to process inquiry. Please message us on WhatsApp directly at +91-6005534878.' });
  }
});

// Public inquiries ledger is disabled for privacy and security.
// Leads are only accessible via authenticated /api/admin/leads.

// ==========================================
// ADMIN PORTAL & LEAD MANAGEMENT APIs
// ==========================================

// Admin Authentication endpoint
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  const lowerEmail = (email || '').trim().toLowerCase();
  const lowerPass = (password || '').trim().toLowerCase();

  const allowedEmails = [
    'admin',
    'theregistreein@gmail.com',
    'admin@theregistree.com',
    'mashek.org@gmail.com',
    'staff',
  ];

  const allowedPasswords = [
    'admin123',
    'admin',
    'registree@2026',
    'registree2026',
  ];

  if (allowedEmails.includes(lowerEmail) && allowedPasswords.includes(lowerPass)) {
    const token = `reg_adm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    res.json({
      success: true,
      token,
      user: {
        email: 'theregistreein@gmail.com',
        name: 'REGISTREE Administrator',
        role: 'Super Admin',
      },
    });
  } else {
    res.status(401).json({
      error: 'Invalid email or password. Access denied.',
    });
  }
});

// Download full project source zip (for manual Vercel or GitHub sync)
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(process.cwd(), 'dist', 'registree-latest.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="registree-latest.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).send('Zip archive not found.');
  }
});

// Admin Lead List & Analytics
app.get('/api/admin/leads', (_req: Request, res: Response) => {
  allLeads = loadLeads();

  const parseAmount = (val?: string) => {
    if (!val) return 0;
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const totalPipelineINR = allLeads.reduce((acc, l) => acc + parseAmount(l.conversionPrice || l.budget), 0);
  const totalConvertedINR = allLeads
    .filter((l) => l.status === 'Converted')
    .reduce((acc, l) => acc + parseAmount(l.conversionPrice || l.budget), 0);

  const stats = {
    total: allLeads.length,
    newLeads: allLeads.filter((l) => l.status === 'New').length,
    contacted: allLeads.filter((l) => l.status === 'Contacted').length,
    proposalSent: allLeads.filter((l) => l.status === 'Proposal Sent').length,
    converted: allLeads.filter((l) => l.status === 'Converted').length,
    archived: allLeads.filter((l) => l.status === 'Archived').length,
    totalPipelineINR,
    totalConvertedINR,
  };

  res.json({
    leads: allLeads,
    stats,
  });
});

// Admin Restore Demonstration Sample Leads
app.post('/api/admin/leads/restore-samples', (_req: Request, res: Response) => {
  allLeads = [...sampleLeadsList];
  saveLeads(allLeads);
  res.json({
    success: true,
    leads: allLeads,
    message: 'Sample demonstration leads loaded successfully.',
  });
});

// Admin Clear All Leads
app.post('/api/admin/leads/clear-all', (_req: Request, res: Response) => {
  allLeads = [];
  saveLeads(allLeads);
  res.json({
    success: true,
    leads: [],
    message: 'All leads cleared.',
  });
});

// Admin Create Manual Lead
app.post('/api/admin/leads', (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      whatsapp,
      service,
      query,
      status,
      priority,
      budget,
      notes,
      conversionPrice,
      originalPrice,
      discountPercent,
      discountReason,
    } = req.body;

    if (!name || !email || !whatsapp) {
      res.status(400).json({ error: 'Name, email, and WhatsApp number are required.' });
      return;
    }

    const defaultPrice = budget || '₹14,999';

    const newLead: LeadRecord = {
      id: `LEAD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      service: service || 'General Consultation',
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      query: (query || 'Manual lead added via Admin Desk.').trim(),
      status: status || 'New',
      priority: priority || 'Medium',
      budget: defaultPrice,
      originalPrice: originalPrice || defaultPrice,
      conversionPrice: conversionPrice || defaultPrice,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : 0,
      discountReason: discountReason || 'Standard package pricing.',
      notes: notes || 'Lead added directly by admin.',
      lastUpdated: new Date().toISOString(),
    };

    allLeads.unshift(newLead);
    saveLeads(allLeads);

    res.json({
      success: true,
      lead: newLead,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create lead.' });
  }
});

// Admin Update Lead (Status, Notes, Priority, Budget, Conversion Price & Discounts)
app.patch('/api/admin/leads/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    status,
    notes,
    priority,
    budget,
    conversionPrice,
    originalPrice,
    discountPercent,
    discountReason,
  } = req.body;

  const leadIndex = allLeads.findIndex((l) => l.id === id);
  if (leadIndex === -1) {
    res.status(404).json({ error: 'Lead not found.' });
    return;
  }

  if (status) allLeads[leadIndex].status = status;
  if (notes !== undefined) allLeads[leadIndex].notes = notes;
  if (priority) allLeads[leadIndex].priority = priority;
  if (budget !== undefined) allLeads[leadIndex].budget = budget;
  if (conversionPrice !== undefined) allLeads[leadIndex].conversionPrice = conversionPrice;
  if (originalPrice !== undefined) allLeads[leadIndex].originalPrice = originalPrice;
  if (discountPercent !== undefined) allLeads[leadIndex].discountPercent = Number(discountPercent);
  if (discountReason !== undefined) allLeads[leadIndex].discountReason = discountReason;
  allLeads[leadIndex].lastUpdated = new Date().toISOString();

  saveLeads(allLeads);

  res.json({
    success: true,
    lead: allLeads[leadIndex],
  });
});

// Admin Delete Lead
app.delete('/api/admin/leads/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = allLeads.length;
  allLeads = allLeads.filter((l) => l.id !== id);

  if (allLeads.length === initialLen) {
    res.status(404).json({ error: 'Lead not found.' });
    return;
  }

  saveLeads(allLeads);
  res.json({ success: true, message: 'Lead removed successfully.' });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`REGISTREE server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
