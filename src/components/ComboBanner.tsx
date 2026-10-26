import React from 'react';

interface ComboBannerProps {
  onOpenQueryModal: (serviceName: string) => void;
}

export const ComboBanner: React.FC<ComboBannerProps> = ({ onOpenQueryModal }) => {
  return (
    <section className="w-full relative overflow-hidden py-14 lg:py-20 bg-gradient-to-r from-[#090e1f] via-[#1a103c] to-[#090e1f] text-white border-y border-white/10">
      {/* LTM-style vivid ambient color glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#dc2626] rounded-full blur-[120px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-[#0047ff] rounded-full blur-[130px] opacity-35 pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-[#f59e0b] rounded-full blur-[140px] opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="bg-white/5 backdrop-blur-md border border-white/15 p-8 sm:p-12 lg:p-14 relative overflow-hidden">
          {/* Decorative Corner Badge */}
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-l from-[#dc2626] to-[#0047ff] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-1.5 shadow-md">
              Special Bundle Offer
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#dc2626]/20 to-[#0047ff]/20 border border-[#dc2626]/30 px-3.5 py-1 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#fecdd3]">
                  Website + Free Logo Combo
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-[11px] text-[#fde047] font-semibold">
                  Save ₹999 INR
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
                Launch Your Website from <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60a5fa] via-[#f43f5e] to-[#fbbf24]">₹19,999</span>. <br />
                Get a Custom Logo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f43f5e] to-[#fbbf24] font-black">100% Free</span>.
              </h2>

              <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed max-w-2xl mb-8">
                Building an impressive digital presence shouldn't require hiring multiple agencies. Every corporate website package includes a bespoke, high-resolution vector logo crafted specifically for your business at zero extra cost.
              </p>

              {/* Combo Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-xs">
                <div className="bg-white/5 border border-white/10 p-3.5">
                  <span className="block font-bold text-white text-sm mb-1 text-[#60a5fa]">
                    Corporate Website
                  </span>
                  <span className="text-gray-300">
                    From ₹19,999 (~$230 USD). Responsive, lightning fast, SEO-ready.
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5">
                  <span className="block font-bold text-white text-sm mb-1 text-[#f43f5e]">
                    + Free Custom Logo
                  </span>
                  <span className="text-gray-300">
                    Full vector package (SVG, PNG, EPS) + commercial rights (Worth ₹999).
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5">
                  <span className="block font-bold text-white text-sm mb-1 text-[#fbbf24]">
                    + Free Custom Email
                  </span>
                  <span className="text-gray-300">
                    Professional domain email setup (you@yourcompany.com) at zero fee.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => onOpenQueryModal('Website Design (+ Free Logo Bundle)')}
                  className="px-8 py-4 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#0047ff] to-[#dc2626] hover:from-[#dc2626] hover:to-[#0047ff] text-white shadow-lg transition-all duration-200 cursor-pointer text-center"
                >
                  Claim Website + Free Logo &rarr;
                </button>

                <button
                  onClick={() => onOpenQueryModal('Standalone Logo Design (₹999)')}
                  className="px-8 py-4 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors duration-150 cursor-pointer text-center"
                >
                  Order Logo Only @ ₹999
                </button>
              </div>
            </div>

            {/* Right Visual Graphic Badge */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-full max-w-xs p-6 bg-gradient-to-b from-white/10 to-white/5 border border-white/20 shadow-2xl text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#dc2626] via-[#f59e0b] to-[#0047ff] flex items-center justify-center text-white text-2xl font-black shadow-inner">
                  FREE
                </div>

                <h4 className="text-lg font-bold text-white mb-1">
                  Logo Design Gift
                </h4>
                <p className="text-xs text-gray-300 mb-4">
                  Complimentary with each ₹19,999 website
                </p>

                <div className="border-t border-white/15 pt-4 text-left space-y-2 text-xs text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>3 Unique Concepts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>Vector & Web Formats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>Free Custom Domain Email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>100% Commercial Ownership</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>48-Hour Delivery</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/15">
                  <span className="text-[11px] text-gray-400 block mb-2">
                    Or separate service for just ₹999
                  </span>
                  <a
                    href="https://wa.me/916005534878?text=Hello%20REGISTREE,%20I%20am%20interested%20in%20the%20Website%20plus%20Free%20Logo%20Bundle%20or%20the%20Rs%20999%20Logo."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-semibold text-[#60a5fa] hover:text-white underline transition-colors"
                  >
                    Quick Chat on WhatsApp (+91-6005534878)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
