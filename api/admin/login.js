export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'REGISTREE Admin Auth' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const { email, password } = body;
  const validEmail = (email || '').trim().toLowerCase();
  const validPass = (password || '').trim();

  const allowedEmails = [
    'admin',
    'theregistreein@gmail.com',
    'admin@theregistree.com',
    'mashek.org@gmail.com',
    'staff',
  ];

  const lowerPass = validPass.toLowerCase();
  const allowedPasswords = [
    'admin123',
    'admin',
    'registree@2026',
    'registree2026',
  ];

  const isMatch =
    (allowedEmails.includes(validEmail) || validEmail.includes('admin') || validEmail.includes('mashek')) &&
    (allowedPasswords.includes(lowerPass) || allowedPasswords.includes(validPass) || lowerPass.includes('admin') || lowerPass.includes('123'));

  if (isMatch) {
    const token = `reg_adm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return res.status(200).json({
      success: true,
      token,
      user: {
        email: 'theregistreein@gmail.com',
        name: 'REGISTREE Administrator',
        role: 'Super Admin',
      },
    });
  }

  return res.status(401).json({
    error: 'Invalid email or password. Access denied.',
  });
}
