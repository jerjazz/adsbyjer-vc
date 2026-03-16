/**
 * Netlify Function: handles audit-download form submissions.
 * 1. Validates the data
 * 2. Fetches the PDF from the deployed site
 * 3. Emails it to the user via Resend
 * 4. Returns a redirect to /audit-thank-you
 *
 * Required env var: RESEND_API_KEY
 * Optional env var: RESEND_FROM_EMAIL (defaults to onboarding@resend.dev)
 */

export async function handler(event) {
  // Only accept POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  // Parse form data
  const params = new URLSearchParams(event.body);
  const name = params.get("name") || "";
  const email = params.get("email") || "";
  const firm = params.get("firm") || "";
  const botField = params.get("bot-field") || "";

  // Honeypot check
  if (botField) {
    return { statusCode: 302, headers: { Location: "/audit-thank-you" } };
  }

  // Validate required fields
  if (!email || !name) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html" },
      body: "<html><body><p>Name and email are required.</p><a href='/'>Go back</a></body></html>",
    };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set — skipping email, redirecting user");
    return {
      statusCode: 302,
      headers: { Location: "/audit-thank-you" },
    };
  }

  // Fetch the PDF from the deployed site
  const siteUrl = process.env.URL || "https://vc.adsbyjer.com";
  let pdfBase64;

  try {
    const pdfRes = await fetch(`${siteUrl}/portfolio-paid-media-audit.pdf`);
    if (!pdfRes.ok) throw new Error(`PDF fetch failed: ${pdfRes.status}`);
    const pdfBuffer = await pdfRes.arrayBuffer();
    pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
  } catch (err) {
    console.error("Failed to fetch PDF:", err);
    // Still redirect user — they can download directly from the thank-you page
    return {
      statusCode: 302,
      headers: { Location: "/audit-thank-you" },
    };
  }

  // Build the email
  const firstName = name.split(" ")[0] || "there";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#F5F3EF; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F3EF; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0C1220; padding:28px 36px;">
              <span style="color:#C9B98A; font-size:12px; font-weight:bold; letter-spacing:2px;">ADS BY JER</span>
              <br />
              <span style="color:#9A9AA6; font-size:11px;">Performance Marketing for VC Portfolios</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              <h1 style="margin:0 0 16px; font-size:22px; color:#1A1A1F; line-height:1.3;">
                Hey ${firstName}, your audit template is attached.
              </h1>
              <p style="margin:0 0 20px; font-size:15px; color:#4A4A52; line-height:1.7;">
                Thanks for downloading the <strong>Portfolio Paid Media Audit Template</strong>. The PDF is attached to this email so you have it whenever you need it.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F3EF; border-radius:8px; margin:20px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px; font-size:13px; font-weight:bold; color:#1A1A1F; text-transform:uppercase; letter-spacing:1px;">How to use it:</p>
                    <p style="margin:0 0 8px; font-size:14px; color:#4A4A52; line-height:1.6;">
                      <span style="color:#A68B5B; font-weight:bold;">1.</span> Score each portfolio company 1-5 across all 10 areas
                    </p>
                    <p style="margin:0 0 8px; font-size:14px; color:#4A4A52; line-height:1.6;">
                      <span style="color:#A68B5B; font-weight:bold;">2.</span> Any company below 25 needs immediate intervention
                    </p>
                    <p style="margin:0; font-size:14px; color:#4A4A52; line-height:1.6;">
                      <span style="color:#A68B5B; font-weight:bold;">3.</span> Book a call to walk through your results together
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 20px; font-size:15px; color:#4A4A52; line-height:1.7;">
                Want help interpreting the results? I'll walk through your scores and pinpoint exactly where the leverage is — no pitch, just an honest read.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #A68B5B, #B8A472); border-radius:6px;">
                    <a href="https://calendly.com/adsbyjer/30m?back=1" target="_blank" style="display:inline-block; padding:14px 32px; color:#0C1220; font-size:14px; font-weight:bold; text-decoration:none; letter-spacing:0.3px;">
                      Book 15 Minutes with Jer
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #E8E5DE; padding:24px 36px; text-align:center;">
              <p style="margin:0 0 4px; font-size:12px; color:#9A9AA6;">
                Ads by Jer &mdash; Growth Marketing for Venture Capital
              </p>
              <p style="margin:0; font-size:12px; color:#9A9AA6;">
                <a href="mailto:jer@adsbyjer.com" style="color:#A68B5B; text-decoration:none;">jer@adsbyjer.com</a>
                &nbsp;&middot;&nbsp;
                <a href="https://vc.adsbyjer.com" style="color:#A68B5B; text-decoration:none;">vc.adsbyjer.com</a>
                &nbsp;&middot;&nbsp;
                (650) 944-9904
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Send via Resend API
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: "Your Portfolio Paid Media Audit Template — Ads by Jer",
        html: htmlBody,
        attachments: [
          {
            filename: "Portfolio-Paid-Media-Audit-Template.pdf",
            content: pdfBase64,
          },
        ],
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", JSON.stringify(result));
    } else {
      console.log(`Audit PDF emailed to ${email} (firm: ${firm}) — Resend ID: ${result.id}`);
    }
  } catch (err) {
    console.error("Failed to send email:", err);
  }

  // Always redirect to thank-you page (email is best-effort)
  return {
    statusCode: 302,
    headers: { Location: "/audit-thank-you" },
  };
}
