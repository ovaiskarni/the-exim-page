import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onOpenQuoteModal: (serviceName?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuoteModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Import Export (EXIM)', href: '#exim' },
    { label: 'Logo Portfolio (₹999)', href: '#portfolio' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 bg-white ${
        isScrolled ? 'border-b border-gray-200 shadow-xs' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* LOGO: Text-only "REGISTREE" in bold letter-spaced font. No icon, no shape, no image. */}
        <a
          href="#"
          className="text-xl sm:text-2xl font-bold tracking-[0.28em] text-[#090e1f] hover:text-[#0047ff] transition-colors select-none"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          REGISTREE
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide text-[#090e1f]/80">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#0047ff] transition-colors py-1 flex items-center gap-1"
            >
              {link.label}
              {link.href === '#portfolio' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></span>
              )}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center space-x-3">
          <a
            href="https://wa.me/916005534878"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            WhatsApp Desk
          </a>
          <button
            onClick={() => onOpenQuoteModal('General Inquiry')}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#090e1f] text-white hover:bg-[#0047ff] transition-colors duration-150 cursor-pointer shadow-xs"
          >
            Get a Quote
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => onOpenQuoteModal('General Inquiry')}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#090e1f] text-white hover:bg-[#0047ff] transition-colors"
          >
            Quote
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#090e1f] focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-current transition-all duration-200 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-current transition-opacity duration-200 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-current transition-all duration-200 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-[#090e1f] hover:text-[#0047ff] py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuoteModal('General Inquiry');
              }}
              className="w-full py-3 text-center text-xs font-bold uppercase tracking-wider bg-[#0047ff] text-white"
            >
              Get a Quote
            </button>
            <a
              href="https://wa.me/916005534878"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 text-center text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white"
            >
              Chat on WhatsApp (+91-6005534878)
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
