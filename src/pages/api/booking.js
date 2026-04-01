import nodemailer from 'nodemailer';

function redirect(path) {
  return new Response(null, { status: 303, headers: { Location: path } });
}

const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: parseInt(import.meta.env.SMTP_PORT || '587'),
  secure: import.meta.env.SMTP_PORT === '465',
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASS,
  },
});

// Rate limiting: 5 requests per IP per 15 minutes
const rateLimit = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+41|0041|0)\s*\d[\d\s\-\/]{6,14}\d$/;
const VALID_TIMES = ['Morgens', 'Mittags', 'Nachmittags', 'Abends'];

function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-\/\(\)]/g, '');
  if (cleaned.startsWith('+41')) return cleaned.length === 12 && /^\+41\d{9}$/.test(cleaned);
  if (cleaned.startsWith('0041')) return cleaned.length === 13 && /^0041\d{9}$/.test(cleaned);
  if (cleaned.startsWith('0')) return cleaned.length === 10 && /^0\d{9}$/.test(cleaned);
  return false;
}

function validate(data) {
  const errors = [];
  if (!data.vorname?.trim()) errors.push('Vorname ist erforderlich');
  if (!data.nachname?.trim()) errors.push('Nachname ist erforderlich');
  if (!data.email?.trim() || !EMAIL_REGEX.test(data.email))
    errors.push('Gültige E-Mail-Adresse ist erforderlich');
  if (!data.telefon?.trim()) {
    errors.push('Telefonnummer ist erforderlich');
  } else if (!validatePhone(data.telefon)) {
    errors.push('Gültige Schweizer Telefonnummer erforderlich (z.B. 079 123 45 67)');
  }
  if (!data.datum) {
    errors.push('Datum ist erforderlich');
  } else {
    const selected = new Date(data.datum);
    
    // Ensure selected date is at least "tomorrow" (midnight UTC)
    const today = new Date();
    const tomorrow = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));
    
    if (selected < tomorrow) errors.push('Datum muss in der Zukunft liegen (ab morgen)');
    const day = selected.getUTCDay();
    if (day === 0 || day === 6) errors.push('Bitte wählen Sie einen Wochentag (Montag–Freitag)');
  }
  if (!VALID_TIMES.includes(data.zeit))
    errors.push('Gültige Zeitpräferenz ist erforderlich');
  if (!data.beschreibung?.trim())
    errors.push('Beschreibung ist erforderlich');
  return errors;
}

export async function POST({ request }) {
  const contentType = request.headers.get('content-type') || '';
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const isFormPost = contentType.includes('application/x-www-form-urlencoded');

  if (isRateLimited(ip)) {
    if (isFormPost) {
      return redirect('/termin?error=rate');
    }
    return new Response(JSON.stringify({ error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let data;
  if (isFormPost) {
    const formData = await request.formData();
    data = Object.fromEntries(formData);
  } else {
    data = await request.json();
  }

  // Honeypot check
  if (data.website) {
    if (isFormPost) {
      return redirect('/termin?success=1');
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const errors = validate(data);
  if (errors.length > 0) {
    if (isFormPost) {
      return redirect(`/termin?error=${encodeURIComponent(errors[0])}`);
    }
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formattedDate = new Date(data.datum).toLocaleDateString('de-CH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const htmlEmail = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAFAFA; padding: 40px 20px; color: #423E3C;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #EB690B; padding: 30px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 500;">Neue Terminanfrage</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; margin-top: 0; margin-bottom: 25px; color: #66615F; line-height: 1.5;">
            Es ist eine neue Terminanfrage über die Webseite eingegangen. Hier sind die übermittelten Angaben:
          </p>
          
          <table style="border-collapse: collapse; width: 100%; font-size: 15px;">
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; width: 40%; color: #66615F; font-weight: 600;">Name</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; width: 60%; color: #423E3C; font-weight: 500;">${escapeHtml(data.vorname)} ${escapeHtml(data.nachname)}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #66615F; font-weight: 600;">E-Mail</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; font-weight: 500;"><a href="mailto:${escapeHtml(data.email)}" style="color: #EB690B; text-decoration: none;">${escapeHtml(data.email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #66615F; font-weight: 600;">Telefon</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #423E3C; font-weight: 500;">${escapeHtml(data.telefon)}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #66615F; font-weight: 600;">Gewünschtes Datum</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #423E3C; font-weight: 500;">${escapeHtml(formattedDate)}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #66615F; font-weight: 600;">Zeitpräferenz</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #423E3C; font-weight: 500;">${escapeHtml(data.zeit)}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; color: #66615F; font-weight: 600; vertical-align: top;">Beschreibung</td>
              <td style="padding: 14px 0; color: #423E3C; font-weight: 500; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.beschreibung)}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px;"></div>
        </div>

        <!-- Footer -->
        <div style="background-color: #FFF4EB; padding: 20px; text-align: center; border-top: 1px solid #FDE6D5;">
          <p style="margin: 0; font-size: 13px; color: #EB690B;">Physiotherapie Alke van Leeuwen &bull; <a href="https://physiotherapie-alkevanleeuwen.ch" style="color: #EB690B; text-decoration: underline;">Webseite aufrufen</a></p>
        </div>
        
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: import.meta.env.SMTP_FROM || 'Terminanfrage <noreply@physiotherapie-alkevanleeuwen.ch>',
      to: import.meta.env.SMTP_TO || 'info@physiotherapie-alkevanleeuwen.ch',
      replyTo: data.email,
      subject: `Terminanfrage von ${data.vorname} ${data.nachname}`,
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.error('Email send failed:', e);
    if (isFormPost) {
      return redirect('/termin?error=send');
    }
    return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (isFormPost) {
    return redirect('/termin?success=1');
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
