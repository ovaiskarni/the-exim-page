import React, { useState } from 'react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Website & Logo',
    question: 'How does the "Website + Free Logo" bundle work?',
    answer:
      'When you order any corporate website design package (starting from ₹19,999 / ~$230 USD), you receive a 100% complimentary custom logo design (regularly ₹999). This includes 3 unique vector concepts, full typography guidelines, web & print file formats (SVG, PNG, EPS, PDF), and 100% commercial copyright transfer at no additional fee.',
  },
  {
    id: 'faq-email',
    category: 'Website & Logo',
    question: 'Can I get a free custom business email with my website?',
    answer:
      'Yes! Every website package includes free custom business email setup (e.g. contact@yourcompany.com, hello@yourcompany.com). We configure your DNS records (MX, SPF, DKIM) and integrate it with secure business email infrastructure (such as Zoho Mail Free Tier for up to 5 user mailboxes or Cloudflare email routing), so you look fully professional from day one without paying monthly email software fees.',
  },
  {
    id: 'faq-2',
    category: 'Pricing',
    question: 'Can I purchase only the logo design for ₹999 without a website?',
    answer:
      'Yes, absolutely. Standalone professional logo design is available as an independent service for just ₹999 INR (~$12 USD). You get custom concepts crafted specifically for your industry within 24 to 48 hours, vector master files, and complete commercial ownership.',
  },
  {
    id: 'faq-3',
    category: 'Registration Timelines',
    question: 'How long does company registration in India take?',
    answer:
      'For Private Limited (Pvt Ltd) and LLP entities, standard incorporation typically takes 7 to 10 working days from the submission of verified KYC documents. We handle DSC (Digital Signature Certificates), DIN, name approval via SPICe+, MoA/AoA drafting, PAN/TAN, and certificate of incorporation issued by the Ministry of Corporate Affairs (MCA).',
  },
  {
    id: 'faq-4',
    category: 'Foreign Founders',
    question: 'Can foreign founders and NRIs establish a business in India?',
    answer:
      'Yes. India allows 100% Foreign Direct Investment (FDI) under the automatic route for most tech, e-commerce, and consulting sectors. Foreign directors require apostilled or notarized passport and address proofs. REGISTREE assists with end-to-end documentation, resident director mandates, RBI reporting, and corporate bank account opening.',
  },
  {
    id: 'faq-5',
    category: 'Trademark & IP',
    question: 'What is the timeline for Trademark (TM) registration in India?',
    answer:
      'We conduct a comprehensive trademark conflict search within 24 hours. Once your application is filed with the Indian Trademark Registry (usually within 24–48 hours), you legally receive your TM application number and can immediately start using the ™ symbol alongside your brand. Final registration certificate (®) is awarded post-examination and public journal notice (typically 6–10 months).',
  },
  {
    id: 'faq-6',
    category: 'AI & Automation',
    question: 'What is an AI Voice Agent and how does it integrate into my business?',
    answer:
      'Our AI voice agents are ultra-realistic conversational bots capable of answering inbound client calls, booking appointments, screening prospects, and placing automated outbound reminders 24/7. They connect directly to your existing Indian or international VoIP/telephony numbers (Twilio, Exotel, Plivo) and sync seamlessly with your CRM and WhatsApp.',
  },
  {
    id: 'faq-7',
    category: 'Billing & Currencies',
    question: 'What payment methods and currencies do you support?',
    answer:
      'We support both domestic INR payments (UPI, Netbanking, IMPS, RTGS, Corporate Cards) with standard GST invoices, as well as international USD payments (Swift International Wire, Stripe, PayPal) with formal commercial service invoices.',
  },
  {
    id: 'faq-8',
    category: 'Trade & Cargo',
    question: 'How quickly can I obtain an Import Export Code (IEC)?',
    answer:
      'IEC issuance through the Directorate General of Foreign Trade (DGFT) is generally completed within 1 to 2 business days once the business PAN, bank certificate, and address proof are submitted and verified.',
  },
  {
    id: 'faq-cargo',
    category: 'Trade & Cargo',
    question: 'How does the International Cargo Service operate and which routes are covered?',
    answer:
      'We coordinate air freight (3–5 business days express) and sea freight (FCL & LCL container shipments) connecting India to key global ports across North America, Europe, the UAE/Middle East, and Southeast Asia. We handle customs clearance at major Indian ports (Nhava Sheva, Mundra, IGI Airport New Delhi), warehousing, bill of lading documentation, and door-to-door tracking.',
  },
];

interface FAQProps {
  onOpenQueryModal: (serviceName?: string) => void;
}

export const FAQ: React.FC<FAQProps> = ({ onOpenQueryModal }) => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Website & Logo', 'Registration Timelines', 'Pricing', 'Foreign Founders', 'AI & Automation', 'Trade & Cargo'];

  const filteredFaqs = activeCategory === 'All'
    ? FAQS_DATA
    : FAQS_DATA.filter((f) => f.category === activeCategory);

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="w-full bg-white py-24 md:py-32 border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="mb-14 text-left">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.25em] text-[#0047ff] mb-3">
            <span>Knowledge Base & Clarifications</span>
            <span className="text-gray-300">•</span>
            <span className="text-[#dc2626]">Instant Self-Service</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#090e1f] leading-tight mb-4">
            Frequently Asked Questions.
          </h2>

          <p className="text-base sm:text-lg text-[#090e1f]/75 max-w-2xl font-normal">
            Everything you need to know about our service bundles, incorporation timelines, pricing benchmarks, and international onboarding.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-gray-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#090e1f] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:text-[#090e1f] hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Minimalist Accordion List */}
        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="transition-colors duration-150 hover:bg-[#fafafc]"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full py-6 flex items-start justify-between text-left gap-4 focus:outline-hidden cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0047ff] block mb-1.5">
                      {faq.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#090e1f] leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="shrink-0 pt-1">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-sm font-semibold transition-transform duration-200 ${
                        isOpen
                          ? 'border-[#0047ff] bg-[#0047ff] text-white rotate-45'
                          : 'border-gray-300 text-gray-500 bg-white'
                      }`}
                    >
                      +
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="pb-6 pr-10 text-sm sm:text-base text-gray-600 leading-relaxed animate-in fade-in duration-200">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Desk Callout */}
        <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-[#090e1f] mb-1">
              Have a specific question not covered here?
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Our New Delhi corporate desk is ready to answer questions directly on WhatsApp or email.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/916005534878?text=Hello%20REGISTREE,%20I%20have%20a%20question%20regarding%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 text-xs font-bold uppercase tracking-wider bg-[#25d366] hover:bg-[#20ba5a] text-white transition-colors text-center"
            >
              Ask on WhatsApp
            </a>

            <button
              onClick={() => onOpenQueryModal('FAQ Inquiry')}
              className="px-5 py-3 text-xs font-bold uppercase tracking-wider border border-[#090e1f] text-[#090e1f] hover:bg-[#090e1f] hover:text-white transition-colors text-center cursor-pointer"
            >
              Send Query
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
