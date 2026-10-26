import React, { useState } from 'react';

interface EximSectionProps {
  onOpenQueryModal: (serviceName: string) => void;
}

interface EximDocItem {
  id: string;
  code: string;
  name: string;
  fullName: string;
  authority: string;
  category: 'gateways' | 'statutory' | 'rcmc' | 'clearance';
  description: string;
  keyBenefits: string[];
  mandatoryFor: string;
  turnaroundTime: string;
  badge?: string;
  isPopular?: boolean;
}

export const EXIM_DOCS: EximDocItem[] = [
  {
    id: 'iec-code',
    code: 'IEC',
    name: 'Import Export Code (IEC)',
    fullName: 'Directorate General of Foreign Trade (DGFT) 10-Digit Code',
    authority: 'DGFT, Ministry of Commerce & Industry',
    category: 'gateways',
    description: 'Mandatory PAN-linked 10-digit registration issued by DGFT. Without an active IEC, no commercial consignment can clear Indian customs or receive international payments.',
    keyBenefits: ['Lifetime validity with annual online re-validation', 'Mandatory for international foreign remittance receipts', 'Eligible for all central government export incentive schemes'],
    mandatoryFor: 'All Commercial Importers, Exporters, & Service Exporters',
    turnaroundTime: '24–48 Hours',
    isPopular: true,
  },
  {
    id: 'ad-code',
    code: 'AD CODE',
    name: 'AD Code & Port Registration',
    fullName: 'Authorised Dealer Code Bank Port Registration',
    authority: 'RBI Authorised Dealer Bank & Indian Customs (EDI Ports)',
    category: 'gateways',
    description: '14-digit bank-certified code registered with ICEGATE across specific air and sea ports (Nhava Sheva, Mundra, IGI Airport, Chennai, Kolkata, etc.) to allow export cargo customs processing and direct export duty drawback deposits.',
    keyBenefits: ['Direct credit of government duty drawbacks (DBK) & RoDTEP', 'Enables Shipping Bill generation on ICEGATE', 'Port-wise linkage across all Indian air cargo & sea terminals'],
    mandatoryFor: 'Every Exporter shipping physical goods via Indian sea/air ports',
    turnaroundTime: '2–3 Working Days',
    isPopular: true,
  },
  {
    id: 'icegate',
    code: 'ICEGATE',
    name: 'ICEGATE Account & Digital ID',
    fullName: 'Indian Customs Electronic Data Interchange Gateway',
    authority: 'Central Board of Indirect Taxes & Customs (CBIC)',
    category: 'gateways',
    description: 'Registration on customs electronic gateway for digital filing, e-Sanchit paperless document uploads, electronic Shipping Bills, Bill of Entry filing, and digital signing with Class 3 DSC.',
    keyBenefits: ['Complete paperless customs clearance with e-Sanchit', 'Real-time consignment tracking & duty payment portal', 'Direct linking with bank account for export incentives'],
    mandatoryFor: 'All Customs Clearing Agents, Exporters, & Importers',
    turnaroundTime: '1–2 Working Days',
  },
  {
    id: 'dsc-class3',
    code: 'DSC CLASS 3',
    name: 'Class 3 Digital Signature (DSC)',
    fullName: 'Cryptographic USB Token (Signing + Encryption)',
    authority: 'Controller of Certifying Authorities (CCA)',
    category: 'gateways',
    description: 'High-security FIPS-compliant Class 3 USB Cryptographic Token with dual certificates (Signing & Encryption) required for DGFT portal, ICEGATE registration, and electronic customs declarations.',
    keyBenefits: ['2-Year or 3-Year validity on secure crypto token', 'Compatible with DGFT, ICEGATE, MCA, and GST portals', 'Fast identity verification with zero physical paperwork'],
    mandatoryFor: 'Authorized signatories signing DGFT & Customs filings',
    turnaroundTime: 'Same Day / 24 Hours',
  },
  {
    id: 'fssai-license',
    code: 'FSSAI',
    name: 'FSSAI Food Import / Export Licence',
    fullName: 'Central FSSAI Licensing for Cross-Border Food Trade',
    authority: 'Food Safety and Standards Authority of India',
    category: 'statutory',
    description: 'Central FSSAI licence with international trade endorsement for manufacturers, traders, and repackagers importing or exporting food articles, beverages, spices, tea/coffee, and dietary supplements.',
    keyBenefits: ['Endorsement for customs food clearance at Indian ports', 'Strict compliance with global safety & residue standards', 'Valid for 1 to 5 years with seamless renewal'],
    mandatoryFor: 'Importers & Exporters of any edible items or agri-food products',
    turnaroundTime: '7–15 Working Days',
    isPopular: true,
  },
  {
    id: 'gst-lut',
    code: 'GST & LUT',
    name: 'GST Registration & Export LUT',
    fullName: 'Letter of Undertaking (Form GST RFD-11)',
    authority: 'Goods & Services Tax Network (GSTN)',
    category: 'statutory',
    description: 'Filing of annual Letter of Undertaking (LUT) on GST portal allowing exporters to ship goods and furnish international services at 0% IGST without upfront tax payments or blocking working capital.',
    keyBenefits: ['Zero tax liability on export turnover without capital lock-in', 'No requirement for bank guarantee or physical bonds', 'Seamless processing of accumulated Input Tax Credit (ITC) refunds'],
    mandatoryFor: 'All exporters of goods and services under GST regime',
    turnaroundTime: '24–48 Hours',
    isPopular: true,
  },
  {
    id: 'trademark',
    code: 'TRADEMARK',
    name: 'Trademark & Brand Protection',
    fullName: 'International & Domestic Trademark Registration',
    authority: 'Controller General of Patents, Designs and Trade Marks & WIPO',
    category: 'statutory',
    description: 'Comprehensive brand search, application filing under relevant Madrid Protocol classes (1 to 45), and legal defense to protect your export packaging, labels, and brand identity in domestic and global markets.',
    keyBenefits: ['10-year renewable legal brand ownership across India & overseas', 'Prevents overseas distributors from hijacking your private brand', 'Pre-requisite for Amazon Global Selling & international retail shelves'],
    mandatoryFor: 'Exporters selling under their own proprietary brand or packaging',
    turnaroundTime: 'Same Day Filing (Govt review timeline)',
  },
  {
    id: 'company-reg',
    code: 'COMPANY INCORPORATION',
    name: 'Company Registration for EXIM',
    fullName: 'Private Limited / LLP Setup for Cross-Border Trade',
    authority: 'Ministry of Corporate Affairs (MCA) & Reserve Bank of India',
    category: 'statutory',
    description: 'Incorporation of Private Limited, Limited Liability Partnership (LLP), or One Person Company structured specifically for international trade, Foreign Direct Investment (FDI), and international commercial banking.',
    keyBenefits: ['Limited liability protection for high-value shipping contracts', 'Credibility with overseas institutional buyers and banks', 'Includes PAN, TAN, EPFO, ESIC, and corporate current bank accounts'],
    mandatoryFor: 'Businesses needing institutional export trade contracts & credit limits',
    turnaroundTime: '3–5 Working Days',
  },
  {
    id: 'customs-clearance',
    code: 'CUSTOMS',
    name: 'Customs Clearance Documentation',
    fullName: 'Pre & Post Shipment Regulatory Clearance Dossiers',
    authority: 'Indian Customs (CBIC) & Port Authorities',
    category: 'clearance',
    description: 'Comprehensive preparation and validation of mandatory shipping dossiers including Shipping Bills, Bill of Entry, Commercial Invoices, Packing Lists, Certificates of Origin, and Port NOCs.',
    keyBenefits: ['Zero container detention & demurrage penalty risk', 'Accurate HSN / ITC(HS) 8-digit tariff code classification', 'Guidance on FTA / CEPA preferential duty concession certificates'],
    mandatoryFor: 'Any consignment traversing Indian maritime, air, or land ports',
    turnaroundTime: 'Immediate / Shipment Specific',
  },
  {
    id: 'apeda-rcmc',
    code: 'APEDA RCMC',
    name: 'APEDA Registration (RCMC)',
    fullName: 'Agricultural and Processed Food Products Export Development Authority',
    authority: 'Ministry of Commerce & Industry, Govt of India',
    category: 'rcmc',
    description: 'Mandatory Registration-cum-Membership Certificate (RCMC) for commercial exporters of fresh fruits, vegetables, basmati and non-basmati rice, cereals, pulses, confectionery, and processed food products.',
    keyBenefits: ['Mandatory for customs export clearance of 14 scheduled food groups', 'Access to financial assistance schemes for transport and quality labs', 'Buyer-seller meets and international trade fairs subsidized access'],
    mandatoryFor: 'Exporters of agri-commodities, rice, meat, poultry, and processed foods',
    turnaroundTime: '3–5 Working Days',
    isPopular: true,
  },
  {
    id: 'spices-board',
    code: 'SPICES BOARD',
    name: 'Spices Board CRES / RCMC',
    fullName: 'Certificate of Registration as Exporter of Spices',
    authority: 'Spices Board India, Ministry of Commerce',
    category: 'rcmc',
    description: 'Mandatory CRES issued by Spices Board India for exporting whole spices, ground/crushed spices, curry powders, spice oils, cardamom, pepper, and organic seasonings to overseas markets.',
    keyBenefits: ['Legal authority to ship 52 scheduled spices from Indian ports', 'Pre-shipment quality lab testing and aflatoxin analysis guidance', 'Financial assistance for modern processing and packaging upgrades'],
    mandatoryFor: 'All spice farmers, processors, and merchant spice exporters',
    turnaroundTime: '5–7 Working Days',
    isPopular: true,
  },
  {
    id: 'eepc-rcmc',
    code: 'EEPC INDIA',
    name: 'EEPC India Registration (RCMC)',
    fullName: 'Engineering Export Promotion Council of India',
    authority: 'Ministry of Commerce & Industry',
    category: 'rcmc',
    description: 'Primary export promotion council for Indian engineering enterprises exporting machinery, metal products, auto parts, precision instruments, electronic components, hardware, and fasteners.',
    keyBenefits: ['Essential for availing duty-free import of raw materials (Advance Authorisation)', 'Assistance with international trade disputes and technical standards', 'Subsidized stall space in world engineering expos (Hannover, etc.)'],
    mandatoryFor: 'Manufacturers and merchant exporters of engineering and metal goods',
    turnaroundTime: '3–5 Working Days',
  },
  {
    id: 'gjepc-rcmc',
    code: 'GJEPC',
    name: 'GJEPC Registration (RCMC)',
    fullName: 'Gem & Jewellery Export Promotion Council',
    authority: 'Ministry of Commerce & Industry',
    category: 'rcmc',
    description: 'Mandatory apex membership for Indian exporters of cut and polished diamonds, gold jewellery, silver ornaments, lab-grown diamonds, and precious coloured gemstones.',
    keyBenefits: ['Mandatory for gold metal loans and replenishment schemes', 'Kimberley Process Certification (KPCS) for rough diamonds', 'Consignment exhibition hand-carry export approvals'],
    mandatoryFor: 'Diamond merchants, jewellers, and gemstone exporters',
    turnaroundTime: '4–6 Working Days',
  },
  {
    id: 'aepc-rcmc',
    code: 'AEPC',
    name: 'AEPC Apparel Council (RCMC)',
    fullName: 'Apparel Export Promotion Council of India',
    authority: 'Ministry of Textiles, Govt of India',
    category: 'rcmc',
    description: 'Council registration for garment factories, apparel designers, knitwear manufacturers, and fashion houses exporting readymade garments (RMG) to Europe, the US, Gulf, and global markets.',
    keyBenefits: ['Market development assistance (MDA) & export credit support', 'Duty-free import quotas for apparel trimmings & accessories', 'Direct connection with global buying houses and fashion retailers'],
    mandatoryFor: 'Manufacturers and merchant exporters of readymade garments',
    turnaroundTime: '3–5 Working Days',
  },
  {
    id: 'pharmexcil-rcmc',
    code: 'PHARMEXCIL',
    name: 'PHARMEXCIL (Pharma RCMC)',
    fullName: 'Pharmaceuticals Export Promotion Council of India',
    authority: 'Department of Commerce, Govt of India',
    category: 'rcmc',
    description: 'Specialized council membership for exporters of generic pharmaceuticals, active pharmaceutical ingredients (APIs), veterinary drugs, surgical disposables, herbal formulations, and Ayurveda products.',
    keyBenefits: ['Assistance with foreign drug regulatory submissions (US FDA, EMA, WHO)', 'Financial reimbursement for overseas patent and dossier filing', 'Bilateral pharma trade delegations and bilateral quota allocations'],
    mandatoryFor: 'Pharma laboratories, API exporters, and healthcare manufacturers',
    turnaroundTime: '4–7 Working Days',
  },
  {
    id: 'fieo-rcmc',
    code: 'FIEO RCMC',
    name: 'FIEO Registration (RCMC)',
    fullName: 'Federation of Indian Export Organisations (Apex Body)',
    authority: 'Ministry of Commerce & Industry',
    category: 'rcmc',
    description: 'The premier umbrella body set up by the Ministry of Commerce for multi-product exporters, trading houses, export houses, and companies whose products do not fall under a specific council.',
    keyBenefits: ['Multi-product coverage under a single universal RCMC', 'Direct policy lobbying with DGFT, Ministry of Finance, and RBI', 'Complimentary access to global trade lead databases & tender alerts'],
    mandatoryFor: 'Service exporters, multi-commodity merchants, & Star Export Houses',
    turnaroundTime: '3–5 Working Days',
    isPopular: true,
  },
  {
    id: 'msme-udyam',
    code: 'MSME / UDYAM',
    name: 'MSME / Udyam RCMC & Subsidies',
    fullName: 'Ministry of Micro, Small and Medium Enterprises Registration',
    authority: 'Ministry of MSME, Govt of India',
    category: 'statutory',
    description: 'Government of India Udyam certificate tailored for exporters to claim priority sector credit, interest subvention on pre-shipment/post-shipment credit, and international trade fair travel subsidies.',
    keyBenefits: ['Eligible for 3% to 5% export credit interest equalization subsidy', 'Concessions on international trademark & patent registration fees', 'Collateral-free trade financing under CGTMSE government guarantees'],
    mandatoryFor: 'Micro, Small, & Medium manufacturing/services exporters in India',
    turnaroundTime: 'Same Day / 24 Hours',
  },
];

export const EximSection: React.FC<EximSectionProps> = ({ onOpenQueryModal }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'gateways' | 'statutory' | 'rcmc' | 'clearance'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocDetails, setSelectedDocDetails] = useState<EximDocItem | null>(null);

  const filteredDocs = EXIM_DOCS.filter((doc) => {
    const matchesTab = activeTab === 'all' || doc.category === activeTab;
    const matchesSearch =
      doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <section id="exim" className="w-full bg-[#090e1f] text-white py-24 md:py-32 border-b border-white/10 relative overflow-hidden">
      {/* Subtle Grid Architectural Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-[#0047ff]"></span>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0047ff]">
                Regulatory Trade Compliance Desk
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Import Export Documentation & Council Licences.
            </h2>
            <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
              From DGFT IEC codes, ICEGATE customs setup, and Bank AD Code port registrations to statutory FSSAI import licenses, Export Promotion Councils (RCMC), and GST LUT zero-tax clearance. We clear the entire regulatory chain so your containers move without customs bottlenecks.
            </p>
          </div>

          {/* Rapid Summary Box */}
          <div className="bg-white/5 border border-white/10 p-5 lg:max-w-sm shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#0047ff] block mb-2">
              Turnkey Desk Guarantee
            </span>
            <ul className="space-y-1.5 text-xs text-gray-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Direct DGFT & ICEGATE Electronic Port Integration
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> All 37+ Export Promotion Councils (APEDA, Spices, EEPC, FIEO)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Fast-track 24–48hr turnaround on core statutory IDs
              </li>
            </ul>
          </div>
        </div>

        {/* Turnkey Exporter Launch Banner (PRIME SPOTLIGHT) */}
        <div className="mb-14 p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-[#0047ff]/20 to-transparent border-2 border-[#0047ff]/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0047ff] bg-white px-2 py-0.5">
                Prime Package
              </span>
              <span className="text-xs font-semibold text-gray-300">
                New Exporter Turnkey Launch Dossier
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              IEC + ICEGATE + AD Code + GST LUT + Class 3 DSC + Council RCMC
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
              Launch export operations in one single unified onboarding. We file your DGFT Import Export Code, link your bank AD Code with customs ports, file GST LUT for zero-tax exports, issue Class 3 DSC, and register your product with the appropriate Export Council.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onOpenQueryModal('Turnkey EXIM Launch Package (IEC + ICEGATE + AD Code + RCMC)')}
              className="px-6 py-3.5 bg-[#0047ff] hover:bg-white hover:text-[#090e1f] text-white text-xs font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer shadow-lg text-center"
            >
              Get Turnkey EXIM Quote &rarr;
            </button>
            <a
              href={`https://wa.me/916005534878?text=${encodeURIComponent(
                'Hello REGISTREE, I need turnkey Import Export documentation support (IEC, AD Code, ICEGATE, Council RCMC). Please share onboarding checklist.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors text-center"
            >
              WhatsApp Trade Desk
            </a>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#090e1f]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All Licenses ({EXIM_DOCS.length})
            </button>
            <button
              onClick={() => setActiveTab('gateways')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'gateways'
                  ? 'bg-white text-[#090e1f]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Gateways & Port Codes (IEC, AD Code, ICEGATE)
            </button>
            <button
              onClick={() => setActiveTab('rcmc')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'rcmc'
                  ? 'bg-white text-[#090e1f]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Export Councils / RCMC (APEDA, Spices, EEPC, FIEO)
            </button>
            <button
              onClick={() => setActiveTab('statutory')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'statutory'
                  ? 'bg-white text-[#090e1f]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Statutory & Tax (FSSAI, GST LUT, Trademark)
            </button>
            <button
              onClick={() => setActiveTab('clearance')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'clearance'
                  ? 'bg-white text-[#090e1f]'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Customs Clearance
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code (e.g. APEDA, IEC, FSSAI)..."
              className="w-full px-3.5 py-2 text-xs bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-hidden focus:border-[#0047ff] font-mono"
            />
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`group flex flex-col justify-between bg-white/5 border transition-all duration-150 p-6 sm:p-7 relative ${
                doc.isPopular
                  ? 'border-[#0047ff] hover:bg-white/10 hover:border-white'
                  : 'border-white/10 hover:border-white/40 hover:bg-white/10'
              }`}
            >
              <div>
                {/* Code Tag & Authority */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 bg-white/10 text-white border border-white/20">
                    {doc.code}
                  </span>
                  <span className="text-[11px] text-[#0047ff] font-semibold uppercase tracking-wider">
                    {doc.turnaroundTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#0047ff] transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {doc.name}
                </h3>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3">
                  {doc.fullName}
                </p>

                {/* Description */}
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {doc.description}
                </p>

                {/* Key Benefits */}
                <div className="mb-4 pt-3 border-t border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-2">
                    Key Deliverables:
                  </span>
                  <ul className="space-y-1 text-xs text-gray-200">
                    {doc.keyBenefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#0047ff] font-bold">›</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scope */}
                <div className="bg-black/30 p-2.5 border border-white/5 mb-5 text-[11px] text-gray-400">
                  <span className="text-gray-300 font-semibold">Mandatory For: </span>
                  {doc.mandatoryFor}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => onOpenQueryModal(`Documentation Inquiry: ${doc.name} (${doc.code})`)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#0047ff] text-[#090e1f] hover:text-white transition-colors duration-150 cursor-pointer text-center"
                >
                  Apply & Get Quote &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDocDetails(selectedDocDetails?.id === doc.id ? null : doc)}
                  className="p-2.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  title="View required documents checklist"
                >
                  📋
                </button>
              </div>

              {/* Expandable Document Checklist Modal / Flyout */}
              {selectedDocDetails?.id === doc.id && (
                <div className="mt-4 p-4 bg-black/60 border border-blue-400/40 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#0047ff] uppercase tracking-wider text-[11px]">
                      Required Checklist for {doc.code}:
                    </span>
                    <button
                      onClick={() => setSelectedDocDetails(null)}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                  <ul className="space-y-1 text-[11px] text-gray-300">
                    <li>• Entity PAN Card (Company/LLP/Individual)</li>
                    <li>• Current Bank Account Cancelled Cheque / Certificate</li>
                    <li>• Registered Business Address Proof (Electricity Bill/Rent Deed)</li>
                    <li>• Directors / Partners Aadhaar & Passport Photo</li>
                    <li>• Active Class 3 DSC token (can be issued concurrently)</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Trade Help Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            <span className="text-white font-semibold">Need advice on specific Export Promotion Council (RCMC)?</span>
            <p className="text-gray-400 text-xs mt-0.5">
              We also handle CAPEXIL, CHEMEXCIL, CLE (Leather), MPEDA (Marine), TEXPROCIL, EPCES, and TEA/COFFEE/RUBBER Boards.
            </p>
          </div>
          <button
            onClick={() => onOpenQueryModal('General Export Import Regulatory Consultation')}
            className="px-5 py-2.5 bg-white/10 hover:bg-white text-white hover:text-[#090e1f] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Consult Trade Specialist &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};
