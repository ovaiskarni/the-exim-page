import React from 'react';
import { SERVICES_LIST } from '../data/services';
import { ServiceItem } from '../types';

interface ServicesProps {
  onOpenQueryModal: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onOpenQueryModal }) => {
  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-50 text-[#dc2626] border-red-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blue':
      default:
        return 'bg-blue-50 text-[#0047ff] border-blue-200';
    }
  };

  return (
    <section id="services" className="w-full bg-[#fcfcfd] py-24 md:py-32 border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0047ff] mb-3">
              Full Spectrum Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#090e1f] leading-tight mb-4">
              Services Built for Market Leadership.
            </h2>
            <p className="text-base sm:text-lg text-[#090e1f]/70 font-normal">
              Digital infrastructure, brand identity, autonomous AI, and cross-border regulatory compliance in India.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="px-3 py-1.5 bg-red-100 text-[#dc2626] font-bold">
              Website Starts ₹19,999 (Free Logo)
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-[#0047ff] font-bold">
              Logo Only @ ₹999
            </span>
          </div>
        </div>

        {/* Clean Colorful Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SERVICES_LIST.map((service: ServiceItem) => (
            <div
              key={service.id}
              className={`group flex flex-col justify-between bg-white border ${
                service.highlight
                  ? 'border-2 border-gray-300 hover:border-[#dc2626] shadow-sm hover:shadow-xl'
                  : 'border border-gray-200 hover:border-[#0047ff]'
              } p-8 transition-all duration-200 relative overflow-hidden`}
            >
              {/* Highlight ribbon for top combo services */}
              {service.id === 'website-design' && (
                <div className="absolute top-0 right-0 bg-[#0047ff] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                  Free Logo Included
                </div>
              )}
              {service.id === 'logo-design' && (
                <div className="absolute top-0 right-0 bg-[#dc2626] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                  Just ₹999
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-[#0047ff] transition-colors">
                    {service.number}
                  </span>
                  {service.badge && (
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 border ${getBadgeStyle(
                        service.badgeColor
                      )}`}
                    >
                      {service.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#090e1f] mb-3 tracking-tight group-hover:text-[#0047ff] transition-colors">
                  {service.title}
                </h3>

                <p className="text-sm text-[#090e1f]/70 leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-4">
                <div className="mb-4">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-medium">
                    Pricing
                  </span>
                  <p className="text-sm font-bold text-[#090e1f]">
                    {service.price}
                  </p>
                </div>

                <button
                  onClick={() => onOpenQueryModal(service.title)}
                  className={`w-full inline-flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all duration-150 cursor-pointer ${
                    service.id === 'website-design'
                      ? 'bg-gradient-to-r from-[#0047ff] to-[#090e1f] hover:from-[#dc2626] hover:to-[#0047ff]'
                      : service.id === 'logo-design'
                      ? 'bg-[#dc2626] hover:bg-[#090e1f]'
                      : 'bg-[#090e1f] hover:bg-[#0047ff]'
                  }`}
                >
                  <span>Send Query</span>
                  <span className="font-mono text-sm leading-none">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
