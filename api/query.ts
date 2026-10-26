export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { service, name, email, whatsapp, query } = req.body || {};
  const refId = `REQ-${Date.now().toString().slice(-6)}`;

  // 1. Direct dispatch to theregistreein@gmail.com and CC to mashek.org@gmail.com
  try {
    await fetch('https://formsubmit.co/ajax/theregistreein@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `[REGISTREE Query] ${service || 'General'} - ${name || 'Client'}`,
        _captcha: 'false',
        _template: 'table',
        _cc: 'mashek.org@gmail.com',
        Service: service,
        Name: name,
        Email: email,
        WhatsApp: whatsapp,
        Query: query,
        ReferenceID: refId,
        Timestamp: new Date().toLocaleString(),
      }),
    });
  } catch (err) {
    console.warn('Vercel serverless FormSubmit direct notice:', err);
  }

  // 2. Backup dispatch to verified token
  try {
    await fetch('https://formsubmit.co/ajax/cce1b353682c5d915f2606d479acf68b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `[REGISTREE Query] ${service || 'General'} - ${name || 'Client'}`,
        _captcha: 'false',
        Service: service,
        Name: name,
        Email: email,
        WhatsApp: whatsapp,
        Query: query,
        ReferenceID: refId,
      }),
    });
  } catch (err) {
    console.warn('Vercel serverless FormSubmit token notice:', err);
  }

  return res.status(200).json({
    success: true,
    referenceId: refId,
    message: 'Your query has been recorded and dispatched to theregistreein@gmail.com.',
  });
}
