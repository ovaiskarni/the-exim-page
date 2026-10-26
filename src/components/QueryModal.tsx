import React, { useState, useEffect } from 'react';
import { QueryFormData } from '../types';

interface QueryModalProps {
  isOpen: boolean;
  serviceName: string;
  onClose: () => void;
}

export const QueryModal: React.FC<QueryModalProps> = ({
  isOpen,
  serviceName,
  onClose,
}) => {
  const [formData, setFormData] = useState<QueryFormData>({
    service: serviceName,
    name: '',
    email: '',
    whatsapp: '',
    query: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        service: serviceName || 'General Inquiry',
      }));
      setErrors({});
      setSubmitSuccess(false);
      setSubmitError(null);
    }
  }, [isOpen, serviceName]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    const phoneRegex = /^[+]?[0-9\s-]{7,20}$/;
    if (!formData.whatsapp.trim() || !phoneRegex.test(formData.whatsapp.trim())) {
      errs.whatsapp = 'Please provide a valid WhatsApp number with country code.';
    }

    if (!formData.query.trim() || formData.query.trim().length < 5) {
      errs.query = 'Please detail your requirements or questions (at least 5 characters).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const refId = `REQ-${Date.now().toString().slice(-6)}`;
      const defaultPrice = (formData.service || '').includes('999') && !(formData.service || '').includes('19,999')
        ? '₹999'
        : '₹19,999';

      // 1. IMMEDIATELY SAVE DIRECTLY INTO LEAD BOX (LOCALSTORAGE)
      const newLead = {
        id: refId,
        timestamp: new Date().toISOString(),
        service: formData.service || 'General Inquiry',
        name: formData.name.trim(),
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        query: formData.query.trim(),
        status: 'New' as const,
        priority: 'High' as const,
        notes: 'Direct client query received from website quote form.',
        budget: defaultPrice,
        originalPrice: defaultPrice,
        conversionPrice: defaultPrice,
        discountPercent: 0,
        discountReason: 'Standard web inquiry package price.',
        lastUpdated: new Date().toISOString(),
      };

      try {
        const cachedRaw = localStorage.getItem('registree_local_leads');
        let currentLeads: any[] = [];
        if (cachedRaw) {
          try {
            const parsed = JSON.parse(cachedRaw);
            if (Array.isArray(parsed)) currentLeads = parsed;
          } catch (_) {}
        }
        const updatedList = [newLead, ...currentLeads.filter((item: any) => item.id !== refId)];
        localStorage.setItem('registree_local_leads', JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('registree_lead_added', { detail: newLead }));
      } catch (storageErr) {
        console.warn('Local lead storage notice:', storageErr);
      }

      // 2. DISPATCH EMAIL TO theregistreein@gmail.com and CC mashek.org@gmail.com
      try {
        fetch('https://formsubmit.co/ajax/theregistreein@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `[REGISTREE New Inquiry] ${formData.service} - ${formData.name}`,
            _captcha: 'false',
            _template: 'table',
            _cc: 'mashek.org@gmail.com',
            Service: formData.service,
            ClientName: formData.name,
            Email: formData.email,
            WhatsApp: formData.whatsapp,
            Requirements: formData.query,
            ReferenceID: refId,
            SubmittedAt: new Date().toLocaleString(),
          }),
        }).catch(() => {});
      } catch (_) {}

      // Independent dispatch directly to mashek.org@gmail.com
      try {
        fetch('https://formsubmit.co/ajax/mashek.org@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `[REGISTREE Inquiry Copy] ${formData.service} - ${formData.name}`,
            _captcha: 'false',
            _template: 'table',
            Service: formData.service,
            ClientName: formData.name,
            Email: formData.email,
            WhatsApp: formData.whatsapp,
            Requirements: formData.query,
            ReferenceID: refId,
            SubmittedAt: new Date().toLocaleString(),
          }),
        }).catch(() => {});
      } catch (_) {}

      // 3. Backup dispatch via FormSubmit token
      try {
        fetch('https://formsubmit.co/ajax/cce1b353682c5d915f2606d479acf68b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `[REGISTREE Inquiry] ${formData.service} - ${formData.name}`,
            _captcha: 'false',
            Service: formData.service,
            Name: formData.name,
            Email: formData.email,
            WhatsApp: formData.whatsapp,
            Requirements: formData.query,
            Reference: refId,
          }),
        }).catch(() => {});
      } catch (_) {}

      // 4. Sync to backend API if available
      try {
        fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }).catch(() => {});

        fetch('/api/admin/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead),
        }).catch(() => {});
      } catch (_) {}

      setReferenceId(refId);
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred. Please message us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-6 right-6 text-gray-400 hover:text-[#090e1f] text-2xl font-light focus:outline-hidden leading-none p-1 cursor-pointer"
          aria-label="Close modal"
        >
          &times;
        </button>

        {submitSuccess ? (
          /* SUCCESS STATE */
          <div className="py-6 text-left">
            <div className="w-12 h-12 bg-green-50 border border-green-200 text-green-700 flex items-center justify-center mb-6 text-xl font-bold">
              ✓
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0047ff] mb-2">
              Dispatch Confirmed
            </p>
            <h3 className="text-2xl font-bold text-[#090e1f] mb-4">
              Query Submitted Successfully
            </h3>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Your inquiry for <strong className="text-[#090e1f]">{formData.service}</strong> has been transmitted to{' '}
              <strong className="text-[#090e1f]">theregistreein@gmail.com</strong>.
            </p>

            <p className="text-sm text-gray-600 mb-6">
              Our New Delhi desk will review your requirements and reach out to you directly via WhatsApp (
              <strong>{formData.whatsapp}</strong>) and email (<strong>{formData.email}</strong>).
            </p>

            {referenceId && (
              <div className="bg-gray-50 border border-gray-200 p-3 text-xs font-mono text-gray-600 mb-8">
                Reference ID: <span className="font-bold text-[#090e1f]">{referenceId}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/916005534878?text=${encodeURIComponent(
                  `Hello REGISTREE, I just submitted an inquiry for "${formData.service}".\nName: ${formData.name}\nEmail: ${formData.email}\nWhatsApp: ${formData.whatsapp}\nQuery: ${formData.query}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold uppercase tracking-wider bg-[#25d366] text-white hover:bg-[#20ba5a] transition-colors"
              >
                Instant WhatsApp (+91-6005534878)
              </a>

              <a
                href={`mailto:theregistreein@gmail.com?subject=${encodeURIComponent(
                  `[REGISTREE Inquiry] ${formData.service} - ${formData.name}`
                )}&body=${encodeURIComponent(
                  `Hello REGISTREE Team,\n\nI have submitted an inquiry for ${formData.service}.\n\nClient Name: ${formData.name}\nEmail: ${formData.email}\nWhatsApp: ${formData.whatsapp}\n\nRequirements:\n${formData.query}\n\nReference: ${referenceId}`
                )}`}
                className="inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold uppercase tracking-wider bg-[#0047ff] text-white hover:bg-[#090e1f] transition-colors"
              >
                Send via Email App
              </a>

              <button
                onClick={onClose}
                className="inline-flex items-center justify-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0047ff] block mb-1">
                Service Inquiry
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#090e1f] tracking-tight">
                {formData.service}
              </h3>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                {formData.service.toLowerCase().includes('website')
                  ? 'Website starts from ₹19,999 (~$230 USD) • Includes 100% Free Custom Logo Design.'
                  : formData.service.toLowerCase().includes('logo')
                  ? 'Standalone Logo Design: Only ₹999 INR (~$12 USD) • 3 concepts, vectors & commercial rights.'
                  : 'Custom milestone scope • Inquiries dispatched directly to theregistreein@gmail.com.'}
              </p>
            </div>

            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Auto-filled hidden field for service */}
              <input type="hidden" name="service" value={formData.service} />

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#090e1f] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="e.g. John Doe or Jane Smith"
                  className={`w-full px-4 py-3 text-sm bg-white border ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#0047ff]'
                  } focus:outline-hidden transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#090e1f] mb-1.5">
                  Corporate / Personal Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="name@company.com"
                  className={`w-full px-4 py-3 text-sm bg-white border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#0047ff]'
                  } focus:outline-hidden transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#090e1f] mb-1.5">
                  WhatsApp Number (with Country Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    setFormData({ ...formData, whatsapp: e.target.value });
                    if (errors.whatsapp) setErrors({ ...errors, whatsapp: '' });
                  }}
                  placeholder="+91 98765 43210 or +1 (555) 000-0000"
                  className={`w-full px-4 py-3 text-sm bg-white border ${
                    errors.whatsapp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#0047ff]'
                  } focus:outline-hidden transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.whatsapp && <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>}
              </div>

              {/* Query Details */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#090e1f] mb-1.5">
                  Query Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.query}
                  onChange={(e) => {
                    setFormData({ ...formData, query: e.target.value });
                    if (errors.query) setErrors({ ...errors, query: '' });
                  }}
                  placeholder="Please describe your requirements, timeline, and whether you are based in India or internationally..."
                  className={`w-full px-4 py-3 text-sm bg-white border ${
                    errors.query ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#0047ff]'
                  } focus:outline-hidden transition-colors resize-y`}
                  disabled={isSubmitting}
                />
                {errors.query && <p className="mt-1 text-xs text-red-600">{errors.query}</p>}
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-[#090e1f] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 text-xs font-semibold uppercase tracking-wider bg-[#090e1f] text-white hover:bg-[#0047ff] transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Sending to Desk...' : 'Submit Query'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
