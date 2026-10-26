import React, { useState } from 'react';
import { LOGO_PORTFOLIO } from '../data/services';
import { LogoSample } from '../types';

interface LogoPortfolioProps {
  onOpenQueryModal: (serviceName: string) => void;
}

export const LogoPortfolio: React.FC<LogoPortfolioProps> = ({ onOpenQueryModal }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [previewLogo, setPreviewLogo] = useState<LogoSample | null>(null);

  const industries = ['All', 'Tech & AI', 'Corporate & Legal', 'Trade & Commerce', 'Creative & Modern'];

  const filteredLogos = selectedIndustry === 'All'
    ? LOGO_PORTFOLIO
    : LOGO_PORTFOLIO.filter((logo) => logo.industry === selectedIndustry);

  // Render SVG logo marks dynamically based on markType
  const renderLogoMark = (type: string) => {
    switch (type) {
      case 'ai-orbit':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-sm">
            <defs>
              <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0047FF" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="34" stroke="url(#auraGrad)" strokeWidth="6" fill="none" strokeDasharray="140 30" />
            <circle cx="50" cy="50" r="20" stroke="#0047FF" strokeWidth="4" fill="none" />
            <circle cx="50" cy="50" r="8" fill="url(#auraGrad)" />
            <circle cx="75" cy="30" r="5" fill="#EC4899" />
          </svg>
        );

      case 'legal-pillar':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-sm">
            <defs>
              <linearGradient id="nexusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4C0519" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            <polygon points="50,15 85,32 15,32" fill="url(#nexusGrad)" />
            <rect x="24" y="38" width="8" height="42" fill="#4C0519" />
            <rect x="46" y="38" width="8" height="42" fill="url(#nexusGrad)" />
            <rect x="68" y="38" width="8" height="42" fill="#4C0519" />
            <rect x="16" y="82" width="68" height="7" fill="#1E1B4B" />
          </svg>
        );

      case 'trade-waves':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-sm">
            <defs>
              <linearGradient id="tradeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <path
              d="M15,65 Q35,40 55,65 T95,65 L88,78 Q68,55 48,78 Z"
              fill="url(#tradeGrad)"
            />
            <path
              d="M20,45 Q40,20 60,45 T98,45 L92,56 Q72,35 52,56 Z"
              fill="#0369A1"
            />
            <circle cx="78" cy="28" r="8" fill="#F59E0B" />
          </svg>
        );

      case 'fintech-vortex':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-sm">
            <defs>
              <linearGradient id="vortexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <path
              d="M50,15 C69,15 85,31 85,50 C85,69 69,85 50,85 C31,85 15,69 15,50"
              stroke="url(#vortexGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="50" cy="50" r="14" fill="url(#vortexGrad)" />
            <path d="M42,50 L48,56 L60,42" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );

      case 'pharma-cell':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-sm">
            <defs>
              <linearGradient id="cellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <circle cx="42" cy="45" r="24" fill="url(#cellGrad)" fillOpacity="0.8" />
            <circle cx="58" cy="55" r="24" fill="#0284C7" fillOpacity="0.75" />
            <path
              d="M50,30 Q65,50 50,70 Q35,50 50,30 Z"
              fill="#FFFFFF"
              fillOpacity="0.9"
            />
          </svg>
        );

      case 'realty-crown':
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-sm">
            <defs>
              <linearGradient id="realtyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <polygon points="20,70 30,30 50,55 70,30 80,70" fill="url(#realtyGrad)" />
            <rect x="20" y="74" width="60" height="6" fill="#1F2937" />
            <circle cx="30" cy="24" r="4" fill="#F59E0B" />
            <circle cx="50" cy="46" r="4" fill="#F59E0B" />
            <circle cx="70" cy="24" r="4" fill="#F59E0B" />
          </svg>
        );

      default:
        return (
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
            LOG
          </div>
        );
    }
  };

  return (
    <section id="portfolio" className="w-full bg-[#fbfbfd] py-24 md:py-32 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.25em] text-[#dc2626] mb-3">
              <span>Brand Identity Studio</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#0047ff]">Only ₹999 / Free with Website</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#090e1f] leading-tight mb-4">
              Logo Portfolio Quality.
            </h2>
            <p className="text-base sm:text-lg text-[#090e1f]/70 font-normal">
              Review sample logos crafted by our design team. High-definition vector graphics, tailored typography, and complete commercial rights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onOpenQueryModal('Standalone Logo Design (₹999)')}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider bg-[#dc2626] text-white hover:bg-[#090e1f] transition-colors duration-150 cursor-pointer shadow-xs text-center"
            >
              Order Logo for ₹999 &rarr;
            </button>
            <button
              onClick={() => onOpenQueryModal('Website Design (+ Free Logo Bundle)')}
              className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider border border-[#0047ff] text-[#0047ff] hover:bg-[#0047ff] hover:text-white transition-colors duration-150 cursor-pointer text-center"
            >
              Get Free with Website
            </button>
          </div>
        </div>

        {/* Industry Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-12 border-b border-gray-200 pb-4">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedIndustry === ind
                  ? 'bg-[#090e1f] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:text-[#090e1f] border border-gray-200'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Logo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLogos.map((logo) => (
            <div
              key={logo.id}
              className="group bg-white border border-gray-200 hover:border-[#0047ff] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Logo Preview Canvas */}
              <div className="p-10 bg-gradient-to-b from-[#f8fafc] to-[#ffffff] border-b border-gray-100 flex flex-col items-center justify-center min-h-[220px] relative">
                {/* Visual Mark */}
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {renderLogoMark(logo.markType)}
                </div>

                {/* Typography Wordmark */}
                <span
                  className="text-lg font-extrabold tracking-[0.2em] text-[#090e1f] text-center"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {logo.brandName}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-gray-500 mt-1 text-center font-medium">
                  {logo.tagline}
                </span>

                {/* Category tag */}
                <span className="absolute top-4 left-4 text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1">
                  {logo.industry}
                </span>

                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-[#dc2626] bg-red-50 border border-red-100 px-2 py-0.5">
                  ₹999 Sample
                </span>
              </div>

              {/* Logo Details */}
              <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-900">
                      Style: {logo.category}
                    </span>

                    {/* Color Swatches */}
                    <div className="flex items-center space-x-1.5">
                      {logo.palette.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-2xs"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-6">
                    {logo.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Standalone</span>
                    <span className="text-xs font-bold text-[#090e1f]">₹999 INR</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenQueryModal(`Logo Design - Style: ${logo.brandName} (₹999)`)}
                      className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider bg-[#090e1f] hover:bg-[#0047ff] text-white transition-colors cursor-pointer"
                    >
                      Order Style
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Commitment Bar */}
        <div className="mt-14 p-6 sm:p-8 bg-gradient-to-r from-[#090e1f] via-[#1a1c38] to-[#090e1f] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-white">
              What's Included in every ₹999 Logo or Website Bundle?
            </h4>
            <p className="text-xs sm:text-sm text-gray-300">
              3 Initial Concepts • Unlimited Minor Tweaks • Vector Formats (SVG, PNG, EPS, PDF) • 100% Commercial Copyright Transfer.
            </p>
          </div>

          <a
            href="https://wa.me/916005534878?text=Hello%20REGISTREE,%20I%20saw%20your%20Logo%20Portfolio%20and%20want%20to%20order%20a%20logo%20for%20Rs%20999."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#25d366] hover:bg-[#20ba5a] text-white whitespace-nowrap transition-colors"
          >
            WhatsApp Instant Order (+91-6005534878)
          </a>
        </div>
      </div>
    </section>
  );
};
