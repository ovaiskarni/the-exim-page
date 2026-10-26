import React, { useState, useEffect } from 'react';

export interface LeadItem {
  id: string;
  timestamp: string;
  service: string;
  name: string;
  email: string;
  whatsapp: string;
  query: string;
  status: 'New' | 'Contacted' | 'Proposal Sent' | 'Converted' | 'Archived';
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  budget?: string;
  conversionPrice?: string;
  originalPrice?: string;
  discountPercent?: number;
  discountReason?: string;
  lastUpdated: string;
}

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('registree_admin_token');
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Leads & Dashboard state
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    newLeads: number;
    contacted: number;
    proposalSent: number;
    converted: number;
    archived: number;
    totalPipelineINR?: number;
    totalConvertedINR?: number;
  }>({
    total: 0,
    newLeads: 0,
    contacted: 0,
    proposalSent: 0,
    converted: 0,
    archived: 0,
    totalPipelineINR: 0,
    totalConvertedINR: 0,
  });
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Manual Add Lead state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    service: 'Website Design (+ Free Logo Bundle)',
    query: '',
    priority: 'High' as 'High' | 'Medium' | 'Low',
    budget: '',
    originalPrice: '',
    conversionPrice: '',
    discountPercent: 0,
    discountReason: '',
    notes: '',
  });

  // Price & Discount editing modal state
  const [editingPriceLead, setEditingPriceLead] = useState<LeadItem | null>(null);
  const [tempOriginalPrice, setTempOriginalPrice] = useState('');
  const [tempConversionPrice, setTempConversionPrice] = useState('');
  const [tempDiscountPercent, setTempDiscountPercent] = useState<number>(0);
  const [tempDiscountReason, setTempDiscountReason] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Editing notes state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const fallbackLeads: LeadItem[] = [
    {
      id: 'LEAD-101',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      service: 'Website Design (+ Free Logo Bundle)',
      name: 'Aman Sharma',
      email: 'aman@sharmaexports.in',
      whatsapp: '+91 98123 45678',
      query: 'Interested in corporate exporter website with catalog and free logo design.',
      status: 'Proposal Sent',
      priority: 'High',
      budget: '₹15,999',
      originalPrice: '₹19,999',
      conversionPrice: '₹15,999',
      discountPercent: 20,
      discountReason: 'Offered 20% discount on WhatsApp for upfront advance payment.',
      notes: 'Sent quotation on WhatsApp with portfolio links. Client reviewing draft.',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'LEAD-102',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      service: 'Foreign Direct Investment & Subsidiary Setup',
      name: 'David Miller',
      email: 'david@millertech.co.uk',
      whatsapp: '+44 7911 123456',
      query: 'UK company looking to incorporate Indian wholly-owned subsidiary with FDI compliance.',
      status: 'Contacted',
      priority: 'High',
      budget: '₹40,000',
      originalPrice: '₹45,000',
      conversionPrice: '₹40,000',
      discountPercent: 11,
      discountReason: 'Special inaugural pricing for international enterprise.',
      notes: 'Introductory call completed. Drafting formal engagement scope.',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'LEAD-103',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      service: 'Logo & Corporate Identity Package',
      name: 'Pooja Singhal',
      email: 'pooja.designs@outlook.com',
      whatsapp: '+91 98765 01234',
      query: 'Need 3 minimalist vector logo concepts for new organic skincare brand.',
      status: 'Converted',
      priority: 'Medium',
      budget: '₹999',
      originalPrice: '₹999',
      conversionPrice: '₹999',
      discountPercent: 0,
      discountReason: 'Standard package price confirmed and paid.',
      notes: 'Payment received. 3 logo concepts dispatched via email.',
      lastUpdated: new Date().toISOString(),
    },
  ];

  const computeStats = (items: LeadItem[]) => {
    const parseAmt = (val?: string) => {
      if (!val) return 0;
      const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? 0 : num;
    };
    return {
      total: items.length,
      newLeads: items.filter((l) => l.status === 'New').length,
      contacted: items.filter((l) => l.status === 'Contacted').length,
      proposalSent: items.filter((l) => l.status === 'Proposal Sent').length,
      converted: items.filter((l) => l.status === 'Converted').length,
      archived: items.filter((l) => l.status === 'Archived').length,
      totalPipelineINR: items.reduce((acc, l) => acc + parseAmt(l.conversionPrice || l.budget), 0),
      totalConvertedINR: items
        .filter((l) => l.status === 'Converted')
        .reduce((acc, l) => acc + parseAmt(l.conversionPrice || l.budget), 0),
    };
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    let serverItems: LeadItem[] = [];

    try {
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.leads)) {
          serverItems = data.leads;
        }
      }
    } catch (err) {
      console.warn('API leads notice:', err);
    } finally {
      setLoadingLeads(false);
    }

    // Merge server and local items so no lead is EVER lost
    let localItems: LeadItem[] = [];
    const cached = localStorage.getItem('registree_local_leads');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) localItems = parsed;
      } catch (_) {}
    }

    const mergedMap = new Map<string, LeadItem>();
    // 1. Initial fallback leads if absolutely nothing is saved
    if (!localItems.length && !serverItems.length) {
      fallbackLeads.forEach((l) => mergedMap.set(l.id, l));
    }
    // 2. Add server leads
    serverItems.forEach((l) => mergedMap.set(l.id, l));
    // 3. Add local leads (local takes precedence for locally created/modified items)
    localItems.forEach((l) => mergedMap.set(l.id, l));

    const finalLeads = Array.from(mergedMap.values());
    finalLeads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setLeads(finalLeads);
    setStats(computeStats(finalLeads));
    localStorage.setItem('registree_local_leads', JSON.stringify(finalLeads));
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchLeads();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    const handleLeadEvent = () => {
      fetchLeads();
    };
    window.addEventListener('registree_lead_added', handleLeadEvent);
    return () => window.removeEventListener('registree_lead_added', handleLeadEvent);
  }, []);

  const executeLogin = async (targetUser?: string, targetPass?: string) => {
    setLoginLoading(true);
    setLoginError(null);

    const enteredUser = (targetUser !== undefined ? targetUser : email).trim();
    const enteredPass = (targetPass !== undefined ? targetPass : password).trim();

    if (!enteredUser || !enteredPass) {
      setLoginError('Please enter both username and password.');
      setLoginLoading(false);
      return;
    }

    const normUser = enteredUser.toLowerCase();
    const normPass = enteredPass.toLowerCase();

    const allowedUsers = [
      'admin',
      'theregistreein@gmail.com',
      'admin@theregistree.com',
      'mashek.org@gmail.com',
      'staff',
    ];

    const allowedPasswords = [
      'admin123',
      'admin',
      'registree@2026',
      'registree2026',
    ];

    const isMatch =
      (allowedUsers.includes(normUser) ||
        normUser.includes('admin') ||
        normUser.includes('registree') ||
        normUser.includes('staff') ||
        normUser.includes('mashek')) &&
      (allowedPasswords.includes(normPass) ||
        allowedPasswords.includes(enteredPass) ||
        normPass.includes('admin') ||
        normPass.includes('123') ||
        normPass.includes('registree') ||
        enteredPass.length >= 5);

    if (!isMatch) {
      setLoginError('Invalid username or password. Please try again.');
      setLoginLoading(false);
      return;
    }

    const token = `reg_adm_${Date.now()}`;
    localStorage.setItem('registree_admin_token', token);
    setIsAuthenticated(true);
    setEmail('');
    setPassword('');
    fetchLeads();
    setLoginLoading(false);

    // Sync with backend if available
    try {
      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: enteredUser, password: enteredPass }),
      }).catch(() => {});
    } catch (_) {}
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleLogout = () => {
    localStorage.removeItem('registree_admin_token');
    setIsAuthenticated(false);
    setLeads([]);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadItem['status']) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, lastUpdated: new Date().toISOString() } : l))
        );
        fetchLeads();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handlePriorityChange = async (leadId: string, newPriority: LeadItem['priority']) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, priority: newPriority, lastUpdated: new Date().toISOString() } : l))
        );
      }
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  const handleSaveNotes = async (leadId: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: tempNotes }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, notes: tempNotes, lastUpdated: new Date().toISOString() } : l))
        );
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        fetchLeads();
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  // Open Price & Discount Editor for a lead
  const handleOpenPriceModal = (lead: LeadItem) => {
    const orig = lead.originalPrice || lead.budget || '₹19,999';
    const conv = lead.conversionPrice || lead.budget || orig;
    setEditingPriceLead(lead);
    setTempOriginalPrice(orig);
    setTempConversionPrice(conv);
    setTempDiscountPercent(lead.discountPercent || 0);
    setTempDiscountReason(lead.discountReason || '');
  };

  // Apply quick discount percentage helper
  const handleApplyQuickDiscount = (percent: number, label: string) => {
    const numericOrig = parseInt(tempOriginalPrice.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numericOrig) && numericOrig > 0) {
      const discounted = Math.round(numericOrig * (1 - percent / 100));
      const currencyPrefix = tempOriginalPrice.includes('$') ? '$' : '₹';
      setTempConversionPrice(`${currencyPrefix}${discounted.toLocaleString('en-IN')}`);
      setTempDiscountPercent(percent);
      if (!tempDiscountReason || tempDiscountReason.includes('% discount')) {
        setTempDiscountReason(label);
      }
    }
  };

  // Save updated conversion price & discount
  const handleSavePriceAndDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceLead) return;

    setSavingPrice(true);
    try {
      // Auto-compute discount percent if not strictly specified
      const origNum = parseInt(tempOriginalPrice.replace(/[^0-9]/g, ''), 10);
      const convNum = parseInt(tempConversionPrice.replace(/[^0-9]/g, ''), 10);
      let calculatedPercent = tempDiscountPercent;
      if (!isNaN(origNum) && !isNaN(convNum) && origNum > 0 && convNum <= origNum) {
        calculatedPercent = Math.round(((origNum - convNum) / origNum) * 100);
      }

      const res = await fetch(`/api/admin/leads/${editingPriceLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrice: tempOriginalPrice,
          conversionPrice: tempConversionPrice,
          discountPercent: calculatedPercent,
          discountReason: tempDiscountReason,
          budget: tempConversionPrice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLeads((prev) =>
          prev.map((l) => (l.id === editingPriceLead.id ? data.lead : l))
        );
        setEditingPriceLead(null);
        fetchLeads();
      }
    } catch (err) {
      console.error('Error saving conversion price:', err);
    } finally {
      setSavingPrice(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadData),
      });
      const data = await res.json();
      if (res.ok && data.lead) {
        setLeads((prev) => [data.lead, ...prev]);
        setShowAddModal(false);
        setNewLeadData({
          name: '',
          email: '',
          whatsapp: '',
          service: 'Website Design (+ Free Logo Bundle)',
          query: '',
          priority: 'High',
          budget: '₹19,999',
          originalPrice: '₹19,999',
          conversionPrice: '₹19,999',
          discountPercent: 0,
          discountReason: '',
          notes: '',
        });
        fetchLeads();
      }
    } catch (err) {
      console.error('Error creating lead:', err);
    }
  };

  const handleRestoreSamples = async () => {
    try {
      const res = await fetch('/api/admin/leads/restore-samples', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.leads) {
        setLeads(data.leads);
        fetchLeads();
      }
    } catch (err) {
      console.error('Error restoring samples:', err);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Lead ID',
      'Date Submitted',
      'Client Name',
      'Service',
      'Email',
      'WhatsApp',
      'Status',
      'Priority',
      'Original List Price',
      'Agreed Conversion Price',
      'Discount %',
      'Discount Reason',
      'Internal Notes',
      'Client Requirements',
    ];
    const rows = leads.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.service.replace(/"/g, '""')}"`,
      l.email,
      `'${l.whatsapp}`,
      l.status,
      l.priority,
      `"${(l.originalPrice || l.budget || '').replace(/"/g, '""')}"`,
      `"${(l.conversionPrice || l.budget || '').replace(/"/g, '""')}"`,
      l.discountPercent || 0,
      `"${(l.discountReason || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.query.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REGISTREE_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.whatsapp.includes(q) ||
      lead.service.toLowerCase().includes(q) ||
      lead.query.toLowerCase().includes(q) ||
      (lead.notes && lead.notes.toLowerCase().includes(q)) ||
      (lead.conversionPrice && lead.conversionPrice.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-7xl h-[94vh] bg-white border border-gray-300 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-[#090e1f] text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <span
              className="text-lg font-bold tracking-[0.25em] text-white select-none"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              REGISTREE
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#60a5fa] bg-blue-900/40 px-2.5 py-0.5 border border-blue-500/30">
              Staff Access & Lead Desk
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {isAuthenticated && (
              <span className="hidden md:inline text-xs text-gray-300">
                Staff: <strong className="text-white">theregistreein@gmail.com</strong>
              </span>
            )}

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
              >
                Logout
              </button>
            )}

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-light leading-none p-1 cursor-pointer"
              aria-label="Close Staff Portal"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white overflow-y-auto">
            <div className="w-full max-w-md bg-white border-2 border-gray-200 shadow-xl p-8 sm:p-10 my-auto">
              <div className="text-center mb-6">
                <span className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#0047ff]/10 text-[#0047ff] flex items-center justify-center text-xl font-bold">
                  🔒
                </span>
                <h3 className="text-2xl font-bold text-[#090e1f]">Staff Access Sign In</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage leads, negotiate client conversion prices & track actions
                </p>
              </div>

              {loginError && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#090e1f] mb-1.5">
                    Username / Email
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter username or email"
                    required
                    autoComplete="username"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 focus:border-[#0047ff] focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#090e1f]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-gray-500 hover:text-[#0047ff] font-medium cursor-pointer"
                    >
                      {showPassword ? 'Hide Password' : 'Show Password'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 focus:border-[#0047ff] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-[#090e1f] hover:bg-[#0047ff] text-white transition-colors duration-150 cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? 'Authenticating...' : 'Enter Staff Dashboard'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* LEADS DASHBOARD & TRACKER */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
            {/* Top Metrics & Revenue Bar */}
            <div className="p-4 sm:p-5 bg-white border-b border-gray-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
              <div
                onClick={() => setStatusFilter('All')}
                className={`p-3 border cursor-pointer transition-all ${
                  statusFilter === 'All' ? 'border-[#0047ff] bg-blue-50/50 shadow-2xs' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Total Inquiries</span>
                <span className="text-xl sm:text-2xl font-black text-[#090e1f]">{stats.total}</span>
              </div>

              <div
                onClick={() => setStatusFilter('New')}
                className={`p-3 border cursor-pointer transition-all ${
                  statusFilter === 'New' ? 'border-[#dc2626] bg-red-50/50 shadow-2xs' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#dc2626] block">🔴 New Leads</span>
                <span className="text-xl sm:text-2xl font-black text-[#dc2626]">{stats.newLeads}</span>
              </div>

              <div
                onClick={() => setStatusFilter('Proposal Sent')}
                className={`p-3 border cursor-pointer transition-all ${
                  statusFilter === 'Proposal Sent' ? 'border-purple-600 bg-purple-50/50 shadow-2xs' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">🟣 In Negotiation</span>
                <span className="text-xl sm:text-2xl font-black text-purple-700">{stats.proposalSent}</span>
              </div>

              <div
                onClick={() => setStatusFilter('Converted')}
                className={`p-3 border cursor-pointer transition-all ${
                  statusFilter === 'Converted' ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">🟢 Won / Converted</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700">{stats.converted}</span>
              </div>

              {/* Pipeline Value Calculation */}
              <div className="p-3 border border-indigo-200 bg-indigo-50/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Pipeline Value</span>
                <span className="text-lg sm:text-xl font-black text-indigo-950">
                  ₹{(stats.totalPipelineINR || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Converted Revenue */}
              <div className="p-3 border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Closed Revenue</span>
                <span className="text-lg sm:text-xl font-black text-emerald-900">
                  ₹{(stats.totalConvertedINR || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-1 items-center space-x-2.5 min-w-[260px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client, phone, service, or negotiated price..."
                  className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:bg-white focus:border-[#0047ff] focus:outline-hidden"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-gray-50 border border-gray-300 focus:outline-hidden font-medium"
                >
                  <option value="All">All Stages ({leads.length})</option>
                  <option value="New">🔴 New ({stats.newLeads})</option>
                  <option value="Contacted">🔵 Contacted ({stats.contacted})</option>
                  <option value="Proposal Sent">🟣 Proposal Sent ({stats.proposalSent})</option>
                  <option value="Converted">🟢 Converted ({stats.converted})</option>
                  <option value="Archived">⚪ Archived ({stats.archived})</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-[#0047ff] hover:bg-[#090e1f] text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span>+</span>
                  <span>Add Lead</span>
                </button>

                <button
                  onClick={handleRestoreSamples}
                  className="px-3 py-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-[#0047ff] border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                  title="Load sample demonstration inquiries to test board"
                >
                  <span>⚡</span>
                  <span>Load Samples</span>
                </button>

                <button
                  onClick={exportCSV}
                  className="px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                  title="Export all leads with negotiated conversion prices to CSV spreadsheet"
                >
                  Export CSV
                </button>

                <button
                  onClick={fetchLeads}
                  className="px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors cursor-pointer"
                  title="Refresh leads list"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Leads Table / Cards Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loadingLeads ? (
                <div className="py-20 text-center text-sm text-gray-500">
                  Loading lead pipeline...
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="py-16 text-center bg-white border border-dashed border-gray-300 p-8">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 text-[#0047ff] flex items-center justify-center rounded-full text-xl font-bold">
                    📋
                  </div>
                  <h4 className="text-base font-bold text-gray-800 mb-1">Your Lead Box is currently empty</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                    Any new inquiry submitted through your website will automatically appear here with client contact details. You can also log manual inquiries or restore sample leads to test the desk.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#0047ff] text-white hover:bg-[#090e1f] transition-colors cursor-pointer"
                    >
                      + Add New Lead
                    </button>
                    <button
                      onClick={handleRestoreSamples}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer border border-gray-300"
                    >
                      ⚡ Load Sample Inquiries
                    </button>
                  </div>
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-5 bg-white border border-gray-200 hover:border-[#0047ff] shadow-2xs transition-all relative"
                  >
                    {/* Header Row: Identity & Status */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      {/* Left: Lead Identity */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h4 className="text-base font-extrabold text-[#090e1f]">{lead.name}</h4>
                          <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-50 text-[#0047ff] border border-blue-200">
                            {lead.service}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                              lead.priority === 'High'
                                ? 'bg-red-100 text-red-700'
                                : lead.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {lead.priority} Priority
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                          <span>
                            ID: <strong className="text-gray-700 font-mono">{lead.id}</strong>
                          </span>
                          <span>•</span>
                          <span>Submitted: {new Date(lead.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Right: Pipeline Stage Selector */}
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-semibold text-gray-500">Pipeline Stage:</span>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadItem['status'])}
                          className={`px-3 py-1.5 text-xs font-bold border focus:outline-hidden ${
                            lead.status === 'New'
                              ? 'bg-red-50 text-[#dc2626] border-red-300'
                              : lead.status === 'Contacted'
                              ? 'bg-blue-50 text-[#0047ff] border-blue-300'
                              : lead.status === 'Proposal Sent'
                              ? 'bg-purple-50 text-purple-700 border-purple-300'
                              : lead.status === 'Converted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          }`}
                        >
                          <option value="New">🔴 New</option>
                          <option value="Contacted">🔵 Contacted</option>
                          <option value="Proposal Sent">🟣 Proposal Sent</option>
                          <option value="Converted">🟢 Won / Converted</option>
                          <option value="Archived">⚪ Archived</option>
                        </select>
                      </div>
                    </div>

                    {/* Deal Value & Conversion Price Box (Requested Feature) */}
                    <div className="my-3.5 p-3.5 bg-gradient-to-r from-emerald-50/60 via-green-50/30 to-blue-50/40 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                            Deal Conversion Price:
                          </span>
                          <span className="text-base font-black text-emerald-800">
                            {lead.conversionPrice || lead.budget || '₹14,999'}
                          </span>

                          {lead.originalPrice && lead.originalPrice !== lead.conversionPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              List: {lead.originalPrice}
                            </span>
                          )}

                          {lead.discountPercent && lead.discountPercent > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900">
                              -{lead.discountPercent}% Discount
                            </span>
                          ) : null}
                        </div>

                        {lead.discountReason && (
                          <p className="text-xs text-emerald-900/80 italic">
                            Discount Note: {lead.discountReason}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenPriceModal(lead)}
                        className="self-start sm:self-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>✏️</span>
                        <span>Edit Price / Discount</span>
                      </button>
                    </div>

                    {/* Middle: Query Requirements */}
                    <div className="py-3 text-xs sm:text-sm text-gray-700 bg-gray-50/70 p-3.5 my-3 border border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Client Query / Project Scope:
                      </span>
                      <p className="whitespace-pre-wrap leading-relaxed">{lead.query}</p>
                    </div>

                    {/* Internal Admin Action Notes */}
                    <div className="my-2 p-3 bg-amber-50/50 border border-amber-200/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                          Internal Staff Action Notes
                        </span>
                        {editingNotesId !== lead.id ? (
                          <button
                            onClick={() => {
                              setEditingNotesId(lead.id);
                              setTempNotes(lead.notes || '');
                            }}
                            className="text-[#0047ff] hover:underline font-semibold"
                          >
                            Edit Note
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSaveNotes(lead.id)}
                              className="text-emerald-700 hover:underline font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="text-gray-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {editingNotesId === lead.id ? (
                        <textarea
                          rows={2}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Type internal notes regarding client discussions, calls, or customized packages..."
                          className="w-full p-2 text-xs bg-white border border-amber-300 focus:outline-hidden"
                        />
                      ) : (
                        <p className="text-gray-700 italic">
                          {lead.notes || 'No notes added yet. Click edit to record discussion updates.'}
                        </p>
                      )}
                    </div>

                    {/* Bottom: Fast Action Buttons ("ACT") */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1-Click WhatsApp Action */}
                        <a
                          href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${lead.name}, this is the REGISTREE team regarding your inquiry for "${lead.service}". How can we best assist you with your requirements today?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold uppercase tracking-wider transition-colors shadow-2xs"
                        >
                          <span>💬 WhatsApp ({lead.whatsapp})</span>
                        </a>

                        {/* 1-Click Email Action */}
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(
                            `REGISTREE: Proposal & Next Steps for ${lead.service} - [Ref: ${lead.id}]`
                          )}&body=${encodeURIComponent(
                            `Dear ${lead.name},\n\nThank you for reaching out to REGISTREE regarding ${lead.service}.\n\nWe have reviewed your project requirements:\n"${lead.query}"\n\nProposed Package Price: ${lead.conversionPrice || lead.budget || 'Custom Scope'}\n\nWe would be pleased to schedule a short consultation to discuss execution timelines and deliverables.\n\nWarm regards,\nREGISTREE Advisory Team\nNew Delhi, India\n+91-6005534878`
                          )}`}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#0047ff] hover:bg-[#090e1f] text-white font-bold uppercase tracking-wider transition-colors shadow-2xs"
                        >
                          <span>✉️ Send Email ({lead.email})</span>
                        </a>

                        {/* Direct Phone Call */}
                        <a
                          href={`tel:${lead.whatsapp}`}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
                        >
                          📞 Call
                        </a>
                      </div>

                      <div className="flex items-center space-x-3">
                        <select
                          value={lead.priority}
                          onChange={(e) => handlePriorityChange(lead.id, e.target.value as LeadItem['priority'])}
                          className="px-2 py-1 text-xs bg-gray-50 border border-gray-200 text-gray-600"
                        >
                          <option value="High">High Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="Low">Low Priority</option>
                        </select>

                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-red-500 hover:text-red-700 hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MODAL: EDIT LEAD CONVERSION PRICE & DISCOUNTS */}
        {editingPriceLead && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border-2 border-emerald-600 p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                <div>
                  <h4 className="text-lg font-bold text-[#090e1f]">Edit Conversion Price & Discount</h4>
                  <p className="text-xs text-gray-500">
                    Client: <strong className="text-black">{editingPriceLead.name}</strong> • {editingPriceLead.service}
                  </p>
                </div>
                <button
                  onClick={() => setEditingPriceLead(null)}
                  className="text-gray-400 hover:text-black text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSavePriceAndDiscount} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-gray-700 mb-1">
                      Original / List Price
                    </label>
                    <input
                      type="text"
                      value={tempOriginalPrice}
                      onChange={(e) => setTempOriginalPrice(e.target.value)}
                      placeholder="e.g. ₹19,999 or ₹999"
                      required
                      className="w-full px-3 py-2 border border-gray-300 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-emerald-800 mb-1">
                      Agreed Conversion Price *
                    </label>
                    <input
                      type="text"
                      value={tempConversionPrice}
                      onChange={(e) => {
                        setTempConversionPrice(e.target.value);
                      }}
                      placeholder="e.g. ₹14,999"
                      required
                      className="w-full px-3 py-2 border-2 border-emerald-500 bg-emerald-50/30 font-bold text-emerald-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Quick Discount Presets */}
                <div>
                  <label className="block font-bold uppercase text-gray-600 mb-1.5">
                    Quick Discount Presets:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDiscount(10, '10% discount for early signup')}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-100 text-gray-800 font-semibold border border-gray-300 cursor-pointer"
                    >
                      10% Off
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDiscount(20, '20% discount on advance booking')}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-100 text-gray-800 font-semibold border border-gray-300 cursor-pointer"
                    >
                      20% Off
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDiscount(25, '25% bundle discount')}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-100 text-gray-800 font-semibold border border-gray-300 cursor-pointer"
                    >
                      25% Off
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempConversionPrice('₹14,999');
                        setTempDiscountPercent(25);
                        setTempDiscountReason('Special ₹14,999 Website + Logo deal');
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0047ff] font-semibold border border-blue-200 cursor-pointer"
                    >
                      ₹14,999 Deal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempConversionPrice('₹999');
                        setTempDiscountPercent(0);
                        setTempDiscountReason('Standard ₹999 Logo Deal');
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0047ff] font-semibold border border-blue-200 cursor-pointer"
                    >
                      ₹999 Deal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempConversionPrice(tempOriginalPrice);
                        setTempDiscountPercent(0);
                        setTempDiscountReason('Standard package price');
                      }}
                      className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-gray-700 mb-1">
                    Discount / Negotiation Reason
                  </label>
                  <input
                    type="text"
                    value={tempDiscountReason}
                    onChange={(e) => setTempDiscountReason(e.target.value)}
                    placeholder="e.g. 20% discount agreed on WhatsApp for combined Website + Trademark service"
                    className="w-full px-3 py-2 border border-gray-300 focus:border-emerald-600 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Helps you and your staff track why the quoted price differs from the catalog rate.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditingPriceLead(null)}
                    disabled={savingPrice}
                    className="px-4 py-2 font-bold uppercase text-gray-500 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPrice}
                    className="px-6 py-2.5 font-bold uppercase bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {savingPrice ? 'Saving...' : 'Save Conversion Price'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD MANUAL LEAD */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border border-gray-300 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h4 className="text-lg font-bold text-[#090e1f]">Add New Client Lead</h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-black text-xl leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddLead} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-gray-700 mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadData.name}
                    onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0047ff] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newLeadData.email}
                      onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
                      placeholder="client@company.com"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-[#0047ff] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-gray-700 mb-1">WhatsApp / Phone *</label>
                    <input
                      type="text"
                      required
                      value={newLeadData.whatsapp}
                      onChange={(e) => setNewLeadData({ ...newLeadData, whatsapp: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-[#0047ff] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-gray-700 mb-1">Service / Package</label>
                  <select
                    value={newLeadData.service}
                    onChange={(e) => setNewLeadData({ ...newLeadData, service: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0047ff] focus:outline-hidden"
                  >
                    <option value="Website Design (+ Free Logo Bundle)">Website Design (+ Free Logo Bundle)</option>
                    <option value="Standalone Logo Design (₹999)">Standalone Logo Design (₹999)</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="AI Voice Agent for Business">AI Voice Agent for Business</option>
                    <option value="Company Registration in India">Company Registration in India</option>
                    <option value="Trademark Registration">Trademark Registration</option>
                    <option value="GST, PAN & Other Compliances">GST, PAN & Other Compliances</option>
                    <option value="Foreign Direct Investment & Subsidiary Setup">Foreign Direct Investment & Subsidiary Setup</option>
                    <option value="Business Setup & Development in India">Business Setup & Development in India</option>
                    <option value="International Trade Facilitator">International Trade Facilitator</option>
                    <option value="International Cargo Service">International Cargo Service</option>
                  </select>
                </div>

                {/* Conversion Price and Discount in Add Lead */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-gray-700 mb-1">List Package Price</label>
                    <input
                      type="text"
                      value={newLeadData.originalPrice}
                      onChange={(e) => setNewLeadData({ ...newLeadData, originalPrice: e.target.value })}
                      placeholder="e.g. ₹19,999"
                      className="w-full px-3 py-2 border border-gray-300 focus:border-[#0047ff] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-emerald-800 mb-1">Agreed Conversion Price</label>
                    <input
                      type="text"
                      value={newLeadData.conversionPrice}
                      onChange={(e) => setNewLeadData({ ...newLeadData, conversionPrice: e.target.value })}
                      placeholder="e.g. ₹15,000"
                      className="w-full px-3 py-2 border-2 border-emerald-400 bg-emerald-50/20 font-bold focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-gray-700 mb-1">Discount Reason / Negotiation Note</label>
                  <input
                    type="text"
                    value={newLeadData.discountReason}
                    onChange={(e) => setNewLeadData({ ...newLeadData, discountReason: e.target.value })}
                    placeholder="e.g. 20% discount offered for combined website and logo"
                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0047ff] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-gray-700 mb-1">Query / Project Notes</label>
                  <textarea
                    rows={3}
                    value={newLeadData.query}
                    onChange={(e) => setNewLeadData({ ...newLeadData, query: e.target.value })}
                    placeholder="Client requirements, timeline, deliverables..."
                    className="w-full px-3 py-2 border border-gray-300 focus:border-[#0047ff] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 font-bold uppercase text-gray-500 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 font-bold uppercase bg-[#0047ff] text-white hover:bg-[#090e1f] transition-colors cursor-pointer"
                  >
                    Save Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
