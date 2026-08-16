/**
 * Trial acknowledgment mailer for BTPC4E.
 *
 * Takes the email address from the trial form and sends that person a branded
 * acknowledgment via Mailjet.
 *
 * Setup: paste this file into a Cloudflare Worker, then add exactly two
 * secrets under Settings -> Variables and Secrets (type "Secret"):
 *
 *   MJ_API_KEY     - Mailjet API key
 *   MJ_API_SECRET  - Mailjet API secret
 *
 * Everything else is the plain config below. The credentials cannot live in
 * the website itself: it is static, so anything in it is readable via View
 * Source, and Mailjet keys allow unrestricted sending on your account.
 */

// ---------------------------------------------------------------------------
// Config - edit these directly, none of them are secret.
// ---------------------------------------------------------------------------

// Must be a sender address VERIFIED in Mailjet, or sends are rejected.
// btpc4e.com is validated at domain level, so any address on it is allowed.
const FROM_EMAIL = "dev@btpc4e.com";
const FROM_NAME = "BTPC4E";

// Where replies go. The email invites people to reply, and that should reach
// the monitored inbox rather than the sending address.
const REPLY_TO_EMAIL = "info@btpc4e.com";

// Origins allowed to call this Worker. Keep localhost here while testing.
const ALLOWED_ORIGINS = [
  "https://btpc4e.com",
  "https://www.btpc4e.com",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

// Echo Mailjet's rejection reason back to the caller. Useful while setting up;
// turn off once sends are working.
const DEBUG_ERRORS = true;

const MAILJET_ENDPOINT = "https://api.mailjet.com/v3.1/send";

// ---------------------------------------------------------------------------

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = ALLOWED_ORIGINS.includes(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin, allowed) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin, allowed);
    }
    // Without this the Worker is an open relay for anyone who finds the URL.
    if (!allowed) {
      return json({ error: "Forbidden" }, 403, origin, allowed);
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return json({ error: "Invalid JSON" }, 400, origin, allowed);
    }

    const email = String(body.email || "").trim();
    const name = String(body.first_name || "")
      .replace(/[<>&"'\r\n]/g, "")
      .slice(0, 60)
      .trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      return json({ error: "Invalid email" }, 400, origin, allowed);
    }

    try {
      const res = await fetch(MAILJET_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${env.MJ_API_KEY}:${env.MJ_API_SECRET}`),
        },
        body: JSON.stringify({
          Messages: [
            {
              From: { Email: FROM_EMAIL, Name: FROM_NAME },
              ReplyTo: { Email: REPLY_TO_EMAIL, Name: FROM_NAME },
              To: [{ Email: email, Name: name || email }],
              Subject: "We've received your Xelerator trial request",
              TextPart: textBody(name),
              HTMLPart: htmlBody(name),
            },
          ],
        }),
      });

      const detail = await res.text();

      if (!res.ok) {
        console.error("Mailjet rejected the send", res.status, detail);
        // Mailjet's own reason is echoed back so setup problems (unverified
        // sender, bad credentials) are visible without digging through logs.
        // Safe enough: this endpoint is origin-locked. Set DEBUG_ERRORS to
        // false once it is working.
        return json(
          DEBUG_ERRORS
            ? { error: "Send failed", mailjet_status: res.status, mailjet: detail }
            : { error: "Send failed" },
          502,
          origin,
          allowed
        );
      }
      return json({ success: true }, 200, origin, allowed);
    } catch (err) {
      console.error("Mailjet request threw", err);
      return json(
        DEBUG_ERRORS
          ? { error: "Send failed", threw: String(err) }
          : { error: "Send failed" },
        502,
        origin,
        allowed
      );
    }
  },
};

function cors(origin, allowed) {
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status, origin, allowed) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { "Content-Type": "application/json", ...cors(origin, allowed) },
  });
}

function escapeHtml(v) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain-text alternative. Required: HTML-only mail scores as spam. */
function textBody(name) {
  return [
    name ? `Hi ${name},` : "Hi,",
    "",
    "Thanks for requesting a free trial of Xelerator.",
    "",
    "Your request is with our team and a Xelerator specialist will contact you within 1-2 business days.",
    "",
    "WHAT HAPPENS NEXT",
    "1. Discovery call (1-2 business days) - a specialist gets in touch to schedule a 30-minute call and capture your use case.",
    "2. Deploy and onboard (about 10 minutes) - we connect Xelerator to your environment in a guided session. No code changes required.",
    "3. Evaluate (15 days) - run real workloads, get live results, and plan your next steps.",
    "",
    "YOUR TRIAL",
    "Length: 15 days, starting when your access is approved",
    "Setup: about 10 minutes",
    "Cost: free, no credit card, no obligation to continue",
    "",
    "Questions before then? Just reply to this email, or write to info@btpc4e.com.",
    "",
    "BTPC4E",
    "SAP BTP Center for Enablement",
    "https://btpc4e.com",
  ].join("\n");
}

/**
 * Table-based layout with inline styles: the only thing that renders reliably
 * across Outlook, Gmail and Apple Mail.
 */
function htmlBody(name) {
  const hello = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  const step = (num, time, title, copy) => `
    <tr>
      <td style="padding:0 0 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="34" valign="top" style="padding-top:2px;">
              <div style="width:26px;height:26px;border-radius:50%;background:#1680fb;color:#ffffff;font:700 13px/26px Arial,Helvetica,sans-serif;text-align:center;">${num}</div>
            </td>
            <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:15px;font-weight:bold;color:#0d294a;padding-bottom:3px;">${title} <span style="font-weight:normal;color:#8996a5;">&nbsp;${time}</span></div>
              <div style="font-size:14px;line-height:1.6;color:#5a6b7b;">${copy}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  const fact = (label, value) => `
    <td width="33.33%" valign="top" style="padding:14px 10px;background:#f8faff;border:1px solid #e7ebf6;border-radius:10px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:11px;font-weight:bold;letter-spacing:0.6px;text-transform:uppercase;color:#8996a5;padding-bottom:5px;">${label}</div>
      <div style="font-size:15px;font-weight:bold;color:#0d294a;">${value}</div>
    </td>`;

  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#eef1fb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef1fb;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;">

          <tr>
            <td style="background:#1680fb;padding:26px 34px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:19px;font-weight:bold;color:#ffffff;letter-spacing:0.4px;">BTPC4E</div>
              <div style="font-size:13px;color:#d6e7ff;padding-top:3px;">SAP BTP Center for Enablement</div>
            </td>
          </tr>

          <tr>
            <td style="padding:34px 34px 0;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0 0 18px;font-size:23px;line-height:1.3;color:#0d294a;">We've received your Xelerator trial request</h1>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#45586b;">${hello}</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#45586b;">Thanks for requesting a free trial of Xelerator. Your request is with our team, and a Xelerator specialist will contact you within <strong style="color:#0d294a;">1-2 business days</strong>.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:14px 34px 6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${fact("Trial length", "15 days")}
                  <td width="10"></td>
                  ${fact("Setup", "~10 minutes")}
                  <td width="10"></td>
                  ${fact("Cost", "Free")}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:26px 34px 0;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:12px;font-weight:bold;letter-spacing:0.8px;text-transform:uppercase;color:#8996a5;padding-bottom:16px;">What happens next</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${step("1", "1-2 business days", "Discovery call", "A specialist gets in touch to schedule a 30-minute call and capture your use case.")}
                ${step("2", "~10 minutes", "Deploy &amp; onboard", "We connect Xelerator to your environment in a guided session. No code changes required.")}
                ${step("3", "15 days", "Evaluate", "Run real workloads, get live results, and plan your next steps.")}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 34px 34px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 6px;font-size:15px;line-height:1.7;color:#45586b;">Your 15 days start when your access is approved, not today, so you get the full trial. No credit card, and no obligation to continue.</p>
              <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#45586b;">Questions before then? Just reply to this email, or write to <a href="mailto:info@btpc4e.com" style="color:#1680fb;text-decoration:none;font-weight:bold;">info@btpc4e.com</a>.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 34px;background:#f8faff;border-top:1px solid #e7ebf6;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:14px;font-weight:bold;color:#0d294a;">BTPC4E</div>
              <div style="font-size:13px;line-height:1.6;color:#8996a5;padding-top:4px;">SAP BTP Center for Enablement<br />Bangalore (APAC) &nbsp;&middot;&nbsp; Dallas (Americas)</div>
              <div style="font-size:12px;color:#a4b0bd;padding-top:12px;">You're receiving this because you requested a Xelerator trial at btpc4e.com.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
