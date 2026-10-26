import React from 'react';

interface PricingProps {
  onOpenQuoteModal: (serviceName?: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenQuoteModal }) => {
  return (
    <section id="pricing" className="w-full bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="border-2 border-gray-200 bg-gradient-to-b from-[#ffffff] via-[#fcfcfd] to-[#f8fafc] p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-sm">
          {/* LTM-style vivid decorative accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0047ff] via-[#dc2626] to-[#f59e0b]" />

          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.25em] text-[#0047ff] mb-4">
              <span>Transparent Pricing</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#dc2626]">No Hidden Overheads</span>
            </div>

            {/* Required Simple Line */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#090e1f] leading-tight mb-4">
              Plans start from ₹19,999 (approx. $230 USD)
            </h2>

            {/* Clarification that ₹19,999 is specifically for Website Design + includes free logo */}
            <p className="text-base sm:text-lg text-[#090e1f]/80 leading-relaxed mb-6 font-medium">
              ₹19,999 is the starting price for <strong className="text-[#0047ff]">Website Design</strong>, which includes a <strong className="text-[#dc2626]">100% Free Custom Logo Design</strong> (worth ₹999).
            </p>

            {/* Required Note */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-10">
              Final pricing depends on requirements. Prices shown in INR and USD for international clients.
            </p>

            {/* Pricing Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-xs">
              {/* Card 1: Website + Logo Combo */}
              <div className="p-5 bg-white border-2 border-[#0047ff] shadow-md relative">
                <span className="absolute -top-3 left-4 bg-[#0047ff] text-white text-[10px] font-bold uppercase px-2.5 py-0.5">
                  Best Value Combo
                </span>
                <h4 className="text-sm font-bold text-[#090e1f] mb-1">Website Design</h4>
                <div className="text-xl font-black text-[#0047ff] mb-2">₹19,999 <span className="text-xs text-gray-500 font-normal">(~$230 USD)</span></div>
                <p className="text-gray-600 mb-4">Full responsive corporate website with SEO, speed optimization, and CMS support.</p>
                <div className="bg-red-50 text-[#dc2626] font-bold p-2 text-center text-[11px] mb-2">
                  + Free Custom Logo Design Included
                </div>
                <div className="bg-emerald-50 text-emerald-800 font-bold p-2 text-center text-[11px] mb-4">
                  + Free Custom Domain Business Email
                </div>
                <button
                  onClick={() => onOpenQuoteModal('Website Design (+ Free Logo Bundle)')}
                  className="w-full py-2.5 bg-[#0047ff] text-white font-bold uppercase tracking-wider text-[11px] hover:bg-[#090e1f] transition-colors cursor-pointer"
                >
                  Choose Website Combo
                </button>
              </div>

              {/* Card 2: Standalone Logo Design */}
              <div className="p-5 bg-white border-2 border-[#dc2626] shadow-md relative">
                <span className="absolute -top-3 left-4 bg-[#dc2626] text-white text-[10px] font-bold uppercase px-2.5 py-0.5">
                  Brand Identity Only
                </span>
                <h4 className="text-sm font-bold text-[#090e1f] mb-1">Logo Design Service</h4>
                <div className="text-xl font-black text-[#dc2626] mb-2">₹999 <span className="text-xs text-gray-500 font-normal">(~$12 USD)</span></div>
                <p className="text-gray-600 mb-4">3 unique custom logo concepts, vector master files (SVG, PNG, EPS), 48h turnaround.</p>
                <div className="bg-gray-50 text-gray-700 font-semibold p-2 text-center text-[11px] mb-4">
                  Full Commercial Copyright Transfer
                </div>
                <button
                  onClick={() => onOpenQuoteModal('Standalone Logo Design (₹999)')}
                  className="w-full py-2.5 bg-[#dc2626] text-white font-bold uppercase tracking-wider text-[11px] hover:bg-[#090e1f] transition-colors cursor-pointer"
                >
                  Order Logo for ₹999
                </button>
              </div>

              {/* Card 3: Business Setup & AI Services */}
              <div className="p-5 bg-white border border-gray-300">
                <span className="inline-block text-gray-500 text-[10px] font-bold uppercase mb-1">
                  Legal & AI Automation
                </span>
                <h4 className="text-sm font-bold text-[#090e1f] mb-1">Corporate & Compliances</h4>
                <div className="text-xl font-black text-[#090e1f] mb-2">Custom Scope</div>
                <p className="text-gray-600 mb-4">Company incorporation, Trademark, GST, Voice AI, and Cross-border trade facilitation.</p>
                <div className="bg-gray-50 text-gray-700 font-semibold p-2 text-center text-[11px] mb-4">
                  Milestone-Based Transparent Retainers
                </div>
                <button
                  onClick={() => onOpenQuoteModal('Corporate Setup & Compliance Inquiry')}
                  className="w-full py-2.5 bg-[#090e1f] text-white font-bold uppercase tracking-wider text-[11px] hover:bg-[#0047ff] transition-colors cursor-pointer"
                >
                  Request Scope & Quote
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="https://wa.me/916005534878"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-xs font-bold uppercase tracking-wider bg-[#25d366] text-white hover:bg-[#20ba5a] transition-colors duration-150 shadow-xs"
              >
                Discuss Pricing on WhatsApp (+91-6005534878) &rarr;
              </a>
              <button
                onClick={() => onOpenQuoteModal('General Inquiry')}
                className="inline-flex items-center justify-center px-8 py-4 text-xs font-bold uppercase tracking-wider border-2 border-[#090e1f] text-[#090e1f] hover:bg-[#090e1f] hover:text-white transition-colors duration-150 cursor-pointer"
              >
                Send Requirements via Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
