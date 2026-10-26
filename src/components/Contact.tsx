import React from 'react';

interface ContactProps {
  onOpenQueryModal: (serviceName?: string) => void;
  onOpenAdmin?: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onOpenQueryModal, onOpenAdmin }) => {
  return (
    <footer id="contact" className="w-full bg-[#090e1f] text-white pt-24 pb-28 sm:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-20 border-b border-white/10">
          {/* Brand info */}
          <div className="lg:col-span-5">
            <span
              className="text-2xl font-bold tracking-[0.28em] text-white block mb-6 select-none"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              REGISTREE
            </span>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm mb-8">
              Websites, AI automation and business registration in India, built for domestic and international clients.
            </p>
            <button
              onClick={() => onOpenQueryModal('General Consultation')}
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-[#0047ff] hover:bg-white hover:text-[#090e1f] text-white transition-colors duration-150 cursor-pointer"
            >
              Start Your Project &rarr;
            </button>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#0047ff] font-semibold mb-2">
                Location
              </p>
              <p className="text-gray-300 font-medium">New Delhi, India</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#0047ff] font-semibold mb-2">
                Phone / WhatsApp
              </p>
              <a
                href="https://wa.me/916005534878"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors font-medium inline-flex items-center gap-2"
              >
                +91-6005534878
                <span className="text-xs text-[#0047ff] font-normal underline">Open WhatsApp</span>
              </a>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#0047ff] font-semibold mb-2">
                Email
              </p>
              <a
                href="mailto:theregistreein@gmail.com"
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                theregistreein@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Services navigation */}
          <div className="lg:col-span-3 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0047ff] font-semibold mb-4">
              Practice Areas
            </p>
            <ul className="space-y-2.5 text-gray-400 text-xs">
              <li><a href="#exim" className="hover:text-white transition-colors text-white/90 font-medium">Import Export Docs (IEC, AD Code)</a></li>
              <li><a href="#exim" className="hover:text-white transition-colors">Council RCMC (APEDA, Spices, EEPC)</a></li>
              <li><a href="#exim" className="hover:text-white transition-colors">FSSAI & ICEGATE Port Linkages</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Website Design (Free Logo)</a></li>
              <li><a href="#portfolio" className="hover:text-white transition-colors">Logo Design (@ ₹999)</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">AI Automation & Voice Agent</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Company & Trademark Setup</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">GST, LUT & Port Clearances</a></li>
            </ul>
          </div>
        </div>

        {/* Minimal Copyright and Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <p>© REGISTREE. All rights reserved.</p>
            <span className="text-gray-600 hidden sm:inline">•</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5"
                title="Staff Login"
              >
                <span>🔒</span>
                <span>Staff Access</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 pr-16 sm:pr-24">
            <span>New Delhi, India</span>
            <span>theregistreein@gmail.com</span>
            <span>+91-6005534878</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
