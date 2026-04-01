import nodemailer from 'nodemailer';
import { client } from '../../lib/sanity'; // Adjust path if needed

const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: parseInt(import.meta.env.SMTP_PORT || '587'),
  secure: import.meta.env.SMTP_PORT === '465',
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASS,
  },
});

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
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST({ request }) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';

  if (isRateLimited(ip)) {
    return Response.redirect(new URL('/bewertung?error=rate', request.url), 303);
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Honeypot check
  if (data.website) {
    return Response.redirect(new URL('/bewertung?success=1', request.url), 303);
  }

  // Validate required fields
  const errors = [];
  if (!data.name?.trim()) errors.push('Name ist erforderlich');
  if (!data.text?.trim()) errors.push('Bewertungstext ist erforderlich');
  if (!data.rating) errors.push('Bewertung ist erforderlich');

  if (errors.length > 0) {
    return Response.redirect(new URL(`/bewertung?error=${encodeURIComponent(errors[0])}`, request.url), 303);
  }

  const ratingNum = parseFloat(data.rating);
  const contactRequested = data.contactRequested === 'on';
  
  // Format Date for sanity if not provided
  let reviewDate = data.date;
  if (!reviewDate) {
    reviewDate = new Date().toISOString().split('T')[0];
  }

  // Sanity submission
  let createdDocId = '';
  try {
    const writeClient = client.withConfig({ token: import.meta.env.SANITY_API_TOKEN });
    
    // Test if token is configured
    if (!import.meta.env.SANITY_API_TOKEN) {
      console.warn("WARNING: SANITY_API_TOKEN is missing. Cannot write to Sanity.");
      throw new Error("CMS Konfigurationsfehler: Token fehlt.");
    }

    const docToCreate = {
      _type: 'testimonial',
      name: data.name,
      text: data.text,
      rating: ratingNum,
      date: reviewDate,
      email: data.email || null,
      contactRequested: contactRequested,
      featured: false // WICHTIG: Noch nicht auf Startseite anzeigen
    };

    const created = await writeClient.create(docToCreate);
    createdDocId = created._id;
  } catch (e) {
    console.error('Sanity creation failed:', e);
    return Response.redirect(new URL('/bewertung?error=cms', request.url), 303);
  }

  // Send Email Notification
  const htmlEmail = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAFAFA; padding: 40px 20px; color: #423E3C;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <div style="background-color: #EB690B; padding: 30px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 500;">Neue Bewertung eingetroffen</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px; margin-top: 0; margin-bottom: 25px; color: #66615F; line-height: 1.5;">
            Jemand hat eine neue Bewertung auf deiner Website hinterlassen. 
            Sie ist im CMS gespeichert, aber <strong>noch nicht veröffentlicht</strong>.
          </p>
          
          <table style="border-collapse: collapse; width: 100%; font-size: 15px;">
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; width: 40%; color: #66615F; font-weight: 600;">Name</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; width: 60%; color: #423E3C; font-weight: 500;">${escapeHtml(data.name)}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #66615F; font-weight: 600;">Sterne</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #423E3C; font-weight: 500;">${ratingNum} / 5</td>
            </tr>
            ${data.email ? `
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #66615F; font-weight: 600;">E-Mail</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; font-weight: 500;">
                <a href="mailto:${escapeHtml(data.email)}" style="color: #EB690B; text-decoration: none;">${escapeHtml(data.email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; color: #66615F; font-weight: 600;">Rückfrage erwünscht?</td>
              <td style="padding: 14px 0; border-bottom: 1px solid #EBEBEB; font-weight: 500;">
                ${contactRequested ? '<span style="color:#e53e3e; font-weight:bold;">Ja</span>' : 'Nein'}
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 14px 0; color: #66615F; font-weight: 600; vertical-align: top;">Bewertungstext</td>
              <td style="padding: 14px 0; color: #423E3C; font-weight: 500; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.text)}</td>
            </tr>
          </table>
          
          <div style="margin-top: 35px; text-align: center;">
            <a href="https://physiotherapie-alkevanleeuwen.ch/studio/desk/testimonial;${createdDocId}" style="display: inline-block; background-color: #EB690B; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">Bewertung prüfen & veröffentlichen</a>
          </div>
          
          <p style="text-align: center; margin-top: 15px; font-size: 13px; color: #888;">
            (Klicke auf den Button, um den Eintrag im CMS zu öffnen. Aktiviere "Auf Startseite anzeigen", falls die Bewertung passend ist).
          </p>
        </div>

        <div style="background-color: #FFF4EB; padding: 20px; text-align: center; border-top: 1px solid #FDE6D5;">
          <p style="margin: 0; font-size: 13px; color: #EB690B;">Physiotherapie Alke van Leeuwen &bull; <a href="https://physiotherapie-alkevanleeuwen.ch" style="color: #EB690B; text-decoration: underline;">Webseite aufrufen</a></p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: import.meta.env.SMTP_FROM || 'Bewertungen <noreply@physiotherapie-alkevanleeuwen.ch>',
      to: import.meta.env.SMTP_TO || 'test-bewertung@scheuber.dev', // Später zurück auf info@physiotherapie-alkevanleeuwen.ch ändern
      replyTo: data.email || undefined,
      subject: `Neue Bewertung zum prüfen eingetroffen (${ratingNum} Sterne von ${data.name})`,
      html: htmlEmail,
    };
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.error('Email send failed:', e);
    // Even if email fails, it's in Sanity, but we might want to warn them. Usually redirect to success anyway.
  }

  return Response.redirect(new URL('/bewertung?success=1', request.url), 303);
}
