/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ComboBanner } from './components/ComboBanner';
import { Services } from './components/Services';
import { EximSection } from './components/EximSection';
import { LogoPortfolio } from './components/LogoPortfolio';
import { Pricing } from './components/Pricing';
import { About } from './components/About';
import { FAQ } from './components/FAQ';
import { Contact } from './components/Contact';
import { QueryModal } from './components/QueryModal';
import { AdminPortal } from './components/AdminPortal';
import { ChatWidget } from './components/ChatWidget';

export default function App() {
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(() => {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      return (
        path.includes('admin') ||
        path.includes('staff') ||
        hash.includes('admin') ||
        hash.includes('staff') ||
        search.includes('admin') ||
        search.includes('staff')
      );
    } catch (_) {
      return false;
    }
  });
  const [selectedService, setSelectedService] = useState('Website Design (+ Free Logo Bundle)');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    try {
      const hostname = window.location.hostname.toLowerCase();
      // Fast redirect if someone visits registree.ai.studio directly outside the studio iframe
      if (window.self === window.top) {
        if (hostname.includes('registree.ai.studio')) {
          window.location.replace('https://theregistree.shop' + window.location.pathname + window.location.search);
        }
      }
    } catch (_) {}

    // Check URL route for admin / staff access
    const checkRoute = () => {
      try {
        const path = (window.location.pathname || '').toLowerCase();
        const hash = (window.location.hash || '').toLowerCase();
        const search = (window.location.search || '').toLowerCase();
        const fullUrl = (window.location.href || '').toLowerCase();

        // Direct instant unlock if auth=admin or direct parameter is present
        if (
          fullUrl.includes('auth=admin') ||
          fullUrl.includes('direct') ||
          fullUrl.includes('login=true') ||
          fullUrl.includes('token=admin')
        ) {
          localStorage.setItem('registree_admin_token', `reg_adm_master_${Date.now()}`);
          setIsAdminPortalOpen(true);
          return;
        }

        if (
          path.includes('admin') ||
          path.includes('staff') ||
          hash.includes('admin') ||
          hash.includes('staff') ||
          search.includes('admin') ||
          search.includes('staff')
        ) {
          setIsAdminPortalOpen(true);
        }
      } catch (_) {}
    };

    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  const handleOpenAdmin = () => {
    setIsAdminPortalOpen(true);
    try {
      if (!window.location.hash.includes('admin')) {
        window.history.replaceState(null, '', '#admin');
      }
    } catch (_) {}
  };

  const handleCloseAdmin = () => {
    setIsAdminPortalOpen(false);
    try {
      if (window.location.hash.includes('admin') || window.location.hash.includes('staff')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (_) {}
  };

  const handleOpenQueryModal = (serviceName?: string) => {
    setSelectedService(serviceName || 'General Inquiry');
    setIsQueryModalOpen(true);
  };

  const handleCloseQueryModal = () => {
    setIsQueryModalOpen(false);
  };

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white text-[#090e1f] flex flex-col font-sans selection:bg-[#0047ff] selection:text-white">
      {/* Sticky Minimal Navbar */}
      <Navbar
        onOpenQuoteModal={handleOpenQueryModal}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Full-width Hero with LTM-style vivid accents */}
        <Hero
          onOpenChat={() => setIsChatOpen(true)}
          onOpenQueryModal={handleOpenQueryModal}
        />

        {/* Dedicated Combo Highlight Banner: Website + Free Logo */}
        <ComboBanner onOpenQueryModal={handleOpenQueryModal} />

        {/* Clean Services Card Grid */}
        <Services onOpenQueryModal={handleOpenQueryModal} />

        {/* Prime Section: Complete Import Export (EXIM) Documentation & Council Licenses */}
        <EximSection onOpenQueryModal={handleOpenQueryModal} />

        {/* Logo Portfolio: Show gallery of sample logos for ₹999 quality preview */}
        <LogoPortfolio onOpenQueryModal={handleOpenQueryModal} />

        {/* Pricing Section */}
        <Pricing onOpenQuoteModal={handleOpenQueryModal} />

        {/* FAQ Section */}
        <FAQ onOpenQueryModal={handleOpenQueryModal} />

        {/* About Section */}
        <About />
      </main>

      {/* Contact Section & Footer */}
      <Contact
        onOpenQueryModal={handleOpenQueryModal}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Query Modal (service auto-filled) */}
      <QueryModal
        isOpen={isQueryModalOpen}
        serviceName={selectedService}
        onClose={handleCloseQueryModal}
      />

      {/* Admin Lead Management & Action Portal */}
      <AdminPortal
        isOpen={isAdminPortalOpen}
        onClose={handleCloseAdmin}
      />

      {/* AI Chatbot (Floating Bottom-Right Widget) */}
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={handleToggleChat}
        onOpenQueryModal={handleOpenQueryModal}
      />
    </div>
  );
}
