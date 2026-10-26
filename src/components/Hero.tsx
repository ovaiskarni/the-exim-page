import React from 'react';

interface HeroProps {
  onOpenChat: () => void;
  onOpenQueryModal: (serviceName?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenChat, onOpenQueryModal }) => {
  return (
    <section className="relative w-full bg-white pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden border-b border-gray-100">
      {/* LTM-style vivid atmospheric background glows */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-[#0047ff]/15 via-[#dc2626]/10 to-[#f59e0b]/10 rounded-full blur-[110px] pointer-events-none -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-[#7c3aed]/10 via-[#0047ff]/10 to-transparent rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-8">
            {/* Combo highlight pill banner */}
            <div className="inline-flex flex-wrap items-center gap-2 mb-8">
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#dc2626] text-white shadow-xs">
                <span>Free Logo Included</span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider px-3.5 py-1 bg-blue-50 text-[#0047ff] border border-blue-200">
                Websites from ₹19,999 (~$230 USD)
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200">
                Logo Only @ ₹999
              </span>
            </div>

            {/* Headline: "Your Business, Ready for the World." */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#090e1f] leading-[1.05] mb-8">
              Your Business, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#090e1f] via-[#0047ff] to-[#dc2626]">
                Ready for the World.
              </span>
            </h1>

            {/* Subtext: "Websites, AI automation and business registration in India, built for domestic and international clients." */}
            <p className="text-lg sm:text-xl md:text-2xl text-[#090e1f]/75 font-normal leading-relaxed max-w-2xl mb-10">
              Websites, AI automation and business registration in India, built for domestic and international clients.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 text-xs font-bold uppercase tracking-wider bg-[#090e1f] text-white hover:bg-[#0047ff] transition-all duration-150 text-center shadow-md cursor-pointer"
              >
                Explore Services
              </a>

              <a
                href="#portfolio"
                className="inline-flex items-center justify-center px-8 py-4 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white hover:opacity-95 transition-opacity duration-150 text-center shadow-md cursor-pointer"
              >
                View ₹999 Logos &rarr;
              </a>

              <button
                onClick={onOpenChat}
                className="inline-flex items-center justify-center px-8 py-4 text-xs font-bold uppercase tracking-wider border-2 border-[#090e1f] text-[#090e1f] hover:bg-[#090e1f] hover:text-white transition-colors duration-150 cursor-pointer text-center"
              >
                Chat with Us
              </button>
            </div>
          </div>

          {/* Right Showcase Card - LTM High-Impact Style */}
          <div className="lg:col-span-4">
            <div className="relative p-6 sm:p-8 bg-gradient-to-b from-white via-white to-gray-50 border-2 border-gray-200 shadow-2xl relative overflow-hidden">
              {/* Colorful gradient strip top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0047ff] via-[#dc2626] to-[#f59e0b]" />

              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0047ff]">
                  Featured Bundle
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-red-100 text-[#dc2626]">
                  100% Free Logo
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#090e1f] mb-3 leading-snug">
                Complete Digital Launch Bundle
              </h3>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0047ff] flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-[#090e1f] block text-xs">
                      Corporate Website Design
                    </span>
                    <span className="text-xs text-gray-500">
                      Starting ₹19,999 (~$230 USD). Custom layouts, speed, SEO.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-[#dc2626] flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-[#090e1f] block text-xs">
                      Free Custom Logo (Included)
                    </span>
                    <span className="text-xs text-gray-500">
                      High-res vector logo worth ₹999 gifted free with website.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-[#090e1f] block text-xs">
                      Free Custom Business Email
                    </span>
                    <span className="text-xs text-gray-500">
                      Professional domain mailbox (you@company.com) setup included.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </span>
                  <div>
                    <span className="font-bold text-[#090e1f] block text-xs">
                      Standalone Logo Service
                    </span>
                    <span className="text-xs text-gray-500">
                      Need only a logo? Available separately for just ₹999.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenQueryModal('Website Design (+ Free Logo Bundle)')}
                className="w-full py-3.5 text-center text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0047ff] to-[#dc2626] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md"
              >
                Claim This Offer &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Minimalist corporate divider line with key highlights */}
        <div className="mt-20 pt-8 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-[#090e1f]/60 uppercase tracking-widest font-medium">
          <div className="border-l-2 border-[#0047ff] pl-3">
            <span className="text-[#090e1f] font-bold block text-sm">Domestic & Foreign</span>
            Incorporation & compliances
          </div>
          <div className="border-l-2 border-[#dc2626] pl-3">
            <span className="text-[#090e1f] font-bold block text-sm">Website + Free Logo</span>
            Starting from ₹19,999 (~$230)
          </div>
          <div className="border-l-2 border-[#f59e0b] pl-3">
            <span className="text-[#090e1f] font-bold block text-sm">Logo Design Only</span>
            Just ₹999 INR (~$12 USD)
          </div>
          <div className="border-l-2 border-[#7c3aed] pl-3">
            <span className="text-[#090e1f] font-bold block text-sm">AI Voice & Systems</span>
            24/7 business autonomy
          </div>
        </div>
      </div>
    </section>
  );
};
