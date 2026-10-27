import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the official conversational AI voice and chat representative for REGISTREE, a premier corporate setup, EXIM trade documentation desk, and AI automation agency based in New Delhi, India.

About REGISTREE:
REGISTREE helps founders and enterprises launch corporate websites, automate workflows, and operate legally in India with complete cross-border trade facilitation.

Our Core Services & Offers:
1. Website Design: High-performance corporate websites built to scale. Starts from ₹19,999 (~$230 USD). SPECIAL OFFER: Every website comes with a 100% FREE custom professional logo design AND free business domain email setup (you@yourbrand.com)!
2. Standalone Professional Logo Design: High-resolution vector logo design & brand kit for only ₹999 INR (~$12 USD).
3. Import Export (EXIM) Documentation & Port Clearances:
   - IEC (Import Export Code): 10-digit DGFT lifetime code for cross-border trade.
   - AD Code & Port Registration: Bank 14-digit code registered at sea/air customs ports for duty drawbacks & RoDTEP.
   - ICEGATE Account: Customs portal registration, e-Sanchit paperless clearance, and digital ID setup.
   - Class 3 DSC: High-security USB cryptographic token for DGFT, ICEGATE, and MCA.
   - FSSAI Food Import / Export Licence: Central licensing for cross-border food & beverage trade.
   - Export Promotion Councils (RCMC): APEDA (agri & food), Spices Board (CRES), EEPC (engineering), GJEPC (gems & jewellery), AEPC (apparel), PHARMEXCIL (pharma), FIEO (apex multi-product), MSME / Udyam RCMC.
   - GST & LUT (Letter of Undertaking): Annual Form GST RFD-11 for 0% IGST export without blocking capital.
   - Customs Dossiers: Bill of Entry, Shipping Bill, Certificate of Origin, and port compliance.
4. AI Automation & AI Voice Agents: 24/7 conversational inbound/outbound voice autonomy tailored to business workflows.
5. Company Registration in India: Pvt Ltd, LLP, and OPC incorporation with complete MCA, RBI, and FEMA compliance.
6. Trademark Registration: Domestic & Madrid protocol international IP filing across classes 1-45.
7. International Cargo & Freight: Air and ocean freight forwarding and door-to-door customs logistics.

Pricing Policy:
- Website Design: Starting from ₹19,999 (~$230 USD) with FREE custom logo design.
- Standalone Logo Design: Only ₹999 (~$12 USD).
- Other services (Company Registration, EXIM documentation, AI automation, etc.) have tailored packages based on scope.
- CRITICAL RULE: Never invent arbitrary prices beyond ₹19,999 for Website Design (with Free Logo) and ₹999 for Standalone Logo Design.

Response Style & Guidelines:
- Speak naturally, warmly, concisely, and professionally (2-3 sentences max).
- Whenever discussing next steps, onboarding, or custom quotes, invite them to connect on WhatsApp at +91-6005534878 (https://wa.me/916005534878) or email theregistreein@gmail.com.
- Desk Location: New Delhi, India.`;

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'REGISTREE AI Chat Service' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const { message, history } = body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A valid message is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

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

      const reply = response.text?.trim();
      if (reply) {
        return res.status(200).json({ reply });
      }
    } catch (err: any) {
      console.warn('Gemini generateContent notice:', err?.message || err);
    }
  }

  // Smart contextual fallback when API key is pending or network rate-limited
  const lower = message.toLowerCase();
  let fallbackReply = 'Hello! REGISTREE helps businesses launch websites from ₹19,999 (~$230 USD) with a free custom logo, standalone logos for ₹999, and complete Import Export (EXIM) filings (IEC, AD Code, APEDA, FSSAI). Connect directly with our advisors on WhatsApp at +91-6005534878.';

  if (lower.includes('website') || lower.includes('web') || lower.includes('site')) {
    fallbackReply = 'Our Website Design packages start at ₹19,999 (~$230 USD) and include a 100% FREE custom vector logo design and business email setup. Message us on WhatsApp at +91-6005534878 to see live demo samples.';
  } else if (lower.includes('logo') || lower.includes('999') || lower.includes('design')) {
    fallbackReply = 'Our standalone Professional Logo Design service is just ₹999 INR (~$12 USD). You receive multiple vector concepts, print-ready files, and lifetime commercial rights. Would you like to start your brand logo today?';
  } else if (lower.includes('iec') || lower.includes('export') || lower.includes('import') || lower.includes('ad code') || lower.includes('apeda') || lower.includes('fssai') || lower.includes('rcmc') || lower.includes('spices')) {
    fallbackReply = 'Our EXIM Desk handles complete DGFT Import Export Codes (IEC), bank AD Code port linkages, ICEGATE setups, FSSAI import licenses, and council RCMCs (APEDA, Spices Board, EEPC, FIEO). Message our Trade Desk on WhatsApp at +91-6005534878 for the document checklist.';
  } else if (lower.includes('company') || lower.includes('pvt') || lower.includes('llp') || lower.includes('register')) {
    fallbackReply = 'We handle complete Company Incorporation (Private Limited, LLP, OPC) in India, including Name Approval, MOA/AOA drafting, PAN/TAN, and bank account setup. Let us know your preferred business structure!';
  }

  return res.status(200).json({ reply: fallbackReply });
}
