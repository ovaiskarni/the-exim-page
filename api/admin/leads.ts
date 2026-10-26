export const sampleLeadsList = [
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

let inMemoryLeads = [...sampleLeadsList];

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const parseAmount = (val?: string) => {
      if (!val) return 0;
      const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? 0 : num;
    };

    const totalPipelineINR = inMemoryLeads.reduce(
      (acc: number, l: any) => acc + parseAmount(l.conversionPrice || l.budget),
      0
    );
    const totalConvertedINR = inMemoryLeads
      .filter((l: any) => l.status === 'Converted')
      .reduce((acc: number, l: any) => acc + parseAmount(l.conversionPrice || l.budget), 0);

    const stats = {
      total: inMemoryLeads.length,
      newLeads: inMemoryLeads.filter((l: any) => l.status === 'New').length,
      contacted: inMemoryLeads.filter((l: any) => l.status === 'Contacted').length,
      proposalSent: inMemoryLeads.filter((l: any) => l.status === 'Proposal Sent').length,
      converted: inMemoryLeads.filter((l: any) => l.status === 'Converted').length,
      archived: inMemoryLeads.filter((l: any) => l.status === 'Archived').length,
      totalPipelineINR,
      totalConvertedINR,
    };

    return res.status(200).json({
      leads: inMemoryLeads,
      stats,
    });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    
    // Check if restore sample action
    if (req.query && req.query.action === 'restore-samples') {
      inMemoryLeads = [...sampleLeadsList];
      return res.status(200).json({ success: true, count: inMemoryLeads.length, leads: inMemoryLeads });
    }

    const newLead = {
      id: `LEAD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      service: body.service || 'General Consultation',
      name: (body.name || 'Client').trim(),
      email: (body.email || '').trim(),
      whatsapp: (body.whatsapp || '').trim(),
      query: (body.query || 'Inquiry logged').trim(),
      status: body.status || 'New',
      priority: body.priority || 'Medium',
      budget: body.budget || body.conversionPrice || '₹14,999',
      originalPrice: body.originalPrice || body.budget || '₹14,999',
      conversionPrice: body.conversionPrice || body.budget || '₹14,999',
      discountPercent: body.discountPercent ? Number(body.discountPercent) : 0,
      discountReason: body.discountReason || '',
      notes: body.notes || 'Logged via staff portal.',
      lastUpdated: new Date().toISOString(),
    };

    inMemoryLeads.unshift(newLead);
    return res.status(200).json({ success: true, lead: newLead });
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const leadId = req.query?.id || body.id;
    const index = inMemoryLeads.findIndex((l: any) => l.id === leadId);

    if (index === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    inMemoryLeads[index] = {
      ...inMemoryLeads[index],
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({ success: true, lead: inMemoryLeads[index] });
  }

  if (req.method === 'DELETE') {
    const leadId = req.query?.id;
    inMemoryLeads = inMemoryLeads.filter((l: any) => l.id !== leadId);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
