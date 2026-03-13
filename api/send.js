// Vercel serverless function — requires RESEND_API_KEY env variable
// Deploy to Vercel: https://vercel.com/new — import this repo, add env var, done.

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://carerliaison.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, score, tier, answers } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const firstName = name ? name.split(' ')[0] : null;
  const greeting  = firstName ? `Hi ${firstName},` : 'Hi,';

  // Identify high-pressure areas (score 3 or 4)
  const pressureAreas = (answers || []).filter(a => a.score >= 3);

  const tierConfig = {
    'Steady Carer':        { color: '#2e7d32', bg: '#e8f5e9', emoji: '🟢' },
    'Under Pressure':      { color: '#a05c00', bg: '#fff8e1', emoji: '🟡' },
    'Running on Empty':    { color: '#b53a1f', bg: '#fce4ec', emoji: '🟠' },
    'At Crisis Point':     { color: '#c62828', bg: '#ffebee', emoji: '🔴' },
  };
  const tc = tierConfig[tier] || tierConfig['Under Pressure'];

  function personalizedOpening(tier, score) {
    if (tier === 'Steady Carer') {
      return `Your score of <strong>${score}/24</strong> puts you in the <strong>Steady Carer</strong> category. You're managing reasonably well — but the carers who burn out most severely are often those who were "coping fine" until suddenly they weren't. Proactive support now is far easier than crisis support later.`;
    }
    if (tier === 'Under Pressure') {
      return `Your score of <strong>${score}/24</strong> tells us you're <strong>Under Pressure</strong>. You're carrying more than most people realise, and the cumulative weight of this role is real. The good news: there's structured support available right now that most carers don't know they can access.`;
    }
    if (tier === 'Running on Empty') {
      return `Your score of <strong>${score}/24</strong> puts you firmly in the <strong>Running on Empty</strong> category. This is more than one person should sustain. Your answers show you're giving more than you have — and that's not sustainable. Please read the resources below and take at least one action today.`;
    }
    return `Your score of <strong>${score}/24</strong> indicates you're <strong>At Crisis Point</strong>. We want to make sure you know that immediate, free support is available right now. Please contact the Carer Gateway (below) today — they can arrange emergency respite, financial assistance, and connect you with a carer support worker.`;
  }

  function pressurePointsHTML(areas) {
    if (!areas.length) return '';
    const bullets = areas.map(a => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0efea; vertical-align: top;">
          <span style="font-weight: 700; color: #1a1a1a;">${a.category}</span><br>
          <span style="font-size: 14px; color: #6b6b68;">You answered: <em>${a.answer}</em></span>
        </td>
      </tr>`).join('');
    return `
      <h3 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 18px; color: #1a1a1a; margin: 28px 0 12px;">Your key pressure points</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #f0efea;">${bullets}</table>`;
  }

  function crisisResourcesHTML(tier) {
    if (tier !== 'At Crisis Point' && tier !== 'Running on Empty') return '';
    return `
      <div style="background: #fff8e1; border-left: 4px solid #f57f17; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0;">
        <strong style="color: #a05c00;">Immediate support available now</strong><br>
        <span style="font-size: 14px; color: #6b6b68;">Carer Gateway — free government-funded support for carers<br>
        📞 <a href="tel:1800422737" style="color: #008080;">1800 422 737</a> (available 24/7)<br>
        🌐 <a href="https://www.carergateway.gov.au" style="color: #008080;">carergateway.gov.au</a></span>
      </div>`;
  }

  const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Personalised Carer Action Plan</title></head>
<body style="margin:0;padding:0;background:#F6F5EF;font-family:'DM Sans',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F5EF;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

      <!-- Header -->
      <tr><td style="background:#008080;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
        <span style="font-family:Georgia,serif;font-size:22px;color:white;font-weight:400;letter-spacing:-0.02em;">Carer Liaison</span>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:white;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e0dfda;border-top:none;">

        <!-- Tier badge -->
        <div style="display:inline-block;background:${tc.bg};border:1.5px solid ${tc.color};border-radius:100px;padding:6px 16px;margin-bottom:20px;">
          <span style="font-size:13px;font-weight:700;color:${tc.color};text-transform:uppercase;letter-spacing:0.08em;">${tc.emoji} ${tier}</span>
        </div>

        <p style="font-size:16px;color:#4a4a48;margin:0 0 8px;">${greeting}</p>

        <h1 style="font-family:Georgia,serif;font-size:26px;color:#1a1a1a;line-height:1.25;margin:0 0 16px;font-weight:400;">Your Personalised Carer Action Plan</h1>

        <p style="font-size:15px;color:#6b6b68;line-height:1.7;margin:0 0 20px;">${personalizedOpening(tier, score)}</p>

        ${crisisResourcesHTML(tier)}
        ${pressurePointsHTML(pressureAreas)}

        <!-- What Carer Liaison does -->
        <h3 style="font-family:Georgia,serif;font-size:18px;color:#1a1a1a;margin:28px 0 12px;">How Carer Liaison addresses this</h3>
        <p style="font-size:15px;color:#6b6b68;line-height:1.7;margin:0 0 12px;">Carer Liaison is an AI-powered personal operating system built for exactly this situation — where one person is holding everything together. Here's what it does:</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0efea;">
            <span style="font-weight:600;color:#1a1a1a;">🫀 Health Intelligence</span><br>
            <span style="font-size:14px;color:#6b6b68;">One-press body state logging. Sleep quality tracked via Apple Watch. The system learns what predicts a good day — and adapts the plan before you even ask.</span>
          </td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0efea;">
            <span style="font-weight:600;color:#1a1a1a;">📋 Daily Planning</span><br>
            <span style="font-size:14px;color:#6b6b68;">Therapy recommendations matched to today's physical ability. Meal plans. Grocery lists. All delivered automatically — no apps to open.</span>
          </td></tr>
          <tr><td style="padding:10px 0;">
            <span style="font-weight:600;color:#1a1a1a;">💡 Purpose &amp; Ideas</span><br>
            <span style="font-size:14px;color:#6b6b68;">Every idea captured, researched, and stored. The system finds what to look forward to each week — so the person you care for stays seen.</span>
          </td></tr>
        </table>

        <!-- NDIS -->
        <div style="background:#f0fafa;border-left:3px solid #008080;border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;">
          <strong style="color:#006666;">NDIS Funding Pathway</strong><br>
          <span style="font-size:14px;color:#6b6b68;">Key components of Carer Liaison are fundable under your NDIS plan:<br>
          • <strong>Category 05 — Assistive Technology:</strong> Apple Watch, iPad, Stream Deck, Smart Speaker<br>
          • <strong>Category 07 — Capacity Building:</strong> System setup and personalisation as Improved Daily Living<br>
          • <strong>Feb 2026 CSIRO AI-AT Framework</strong> directly supports this category of assistive technology.<br>
          We guide you through the OT assessment process to build the funding case.</span>
        </div>

        <!-- Free resources -->
        <h3 style="font-family:Georgia,serif;font-size:18px;color:#1a1a1a;margin:28px 0 12px;">Free resources available now</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;border-bottom:1px solid #f0efea;font-size:14px;color:#6b6b68;">
            📞 <strong style="color:#1a1a1a;">Carer Gateway:</strong> 1800 422 737 — free government support, respite, counselling
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #f0efea;font-size:14px;color:#6b6b68;">
            🌐 <strong style="color:#1a1a1a;">Carer Gateway online:</strong> <a href="https://www.carergateway.gov.au" style="color:#008080;">carergateway.gov.au</a> — self-guided support plan
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #f0efea;font-size:14px;color:#6b6b68;">
            📋 <strong style="color:#1a1a1a;">NDIS:</strong> <a href="https://www.ndis.gov.au" style="color:#008080;">ndis.gov.au</a> — participant and carer resources
          </td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#6b6b68;">
            🧠 <strong style="color:#1a1a1a;">Beyond Blue:</strong> <a href="https://www.beyondblue.org.au" style="color:#008080;">beyondblue.org.au</a> — mental health support for carers
          </td></tr>
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin:32px 0 8px;">
          <a href="https://carerliaison.com" style="display:inline-block;background:#008080;color:white;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:-0.01em;">Learn More About Carer Liaison →</a>
          <p style="font-size:13px;color:#6b6b68;margin-top:12px;">You're on the early access waitlist. We'll be in touch as soon as pilot spots open.</p>
        </div>

      </td></tr>

      <!-- Footer -->
      <tr><td style="text-align:center;padding:20px 0;font-size:12px;color:#9b9b98;">
        © 2026 Carer Liaison · <a href="https://carerliaison.com" style="color:#008080;">carerliaison.com</a><br>
        <a href="mailto:hello@carerliaison.com" style="color:#9b9b98;">hello@carerliaison.com</a>
        · You're receiving this because you completed the Carer Check-In.
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  // Send email to user
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Carer Liaison <hello@carerliaison.com>',
      to: [email],
      subject: `Your Personalised Carer Action Plan — ${tier}`,
      html: emailHTML
    })
  });

  if (!resendRes.ok) {
    const err = await resendRes.json().catch(() => ({}));
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }

  // Notify admin
  const summaryLines = (answers || []).map(a =>
    `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:13px;"><strong>${a.category}:</strong> ${a.answer || '—'} (${a.score}/4)</td></tr>`
  ).join('');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Carer Liaison <hello@carerliaison.com>',
      to: ['hello@carerliaison.com'],
      subject: `New assessment: ${tier} (${score}/24) — ${email}`,
      html: `<p><strong>Name:</strong> ${name || '(not provided)'}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Score:</strong> ${score}/24 — ${tier}</p>
             <table style="border-collapse:collapse;margin-top:12px;">${summaryLines}</table>`
    })
  }).catch(() => {}); // Admin notification — non-blocking

  return res.status(200).json({ success: true });
}
