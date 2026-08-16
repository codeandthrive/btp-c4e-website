# Trial acknowledgment mailer

Takes the email address from the trial form on `xelerator-trial.html` and sends
that person a branded acknowledgment via Mailjet.

One file: `worker.js`. No build step, no CLI, no config files.

## Why this isn't in the page

The website is static HTML, so anything in it is readable via View Source. A
Mailjet key allows unrestricted sending on your account, so putting one in the
page means anyone can send mail as `btpc4e.com` — spam from your domain,
blocklisting, suspended account. The Worker is the only thing that holds the
credentials; the browser just tells it a name and an email address.

## Setup (about 5 minutes)

1. **Rotate your Mailjet keys** if they were ever pasted into a file, chat, or
   commit: Mailjet → Account Settings → API Key Management.

2. In Mailjet, verify `info@btpc4e.com` as a sender (Account Settings → Sender
   domains & addresses). Unverified senders are rejected outright.

3. <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Start
   with Hello World** → **Deploy**. Name it `btpc4e-trial-mailer`.

4. **Edit code** → delete the placeholder → paste all of `worker.js` → **Deploy**.

5. **Settings → Variables and Secrets** → add two, both of type **Secret**:

   | Name | Value |
   |---|---|
   | `MJ_API_KEY` | your Mailjet API key |
   | `MJ_API_SECRET` | your Mailjet API secret |

   Deploy again after saving.

6. Copy the Worker URL (`https://btpc4e-trial-mailer.<subdomain>.workers.dev`)
   and paste it into `ACK_ENDPOINT` near the bottom of `xelerator-trial.html`:

   ```js
   var ACK_ENDPOINT = "https://btpc4e-trial-mailer.<subdomain>.workers.dev";
   ```

**Until step 6 there is no network call to the mailer** — an empty
`ACK_ENDPOINT` means "not configured yet", so the form works normally and just
skips the acknowledgment. That is why nothing appears in the Network tab.

## Editing without redeploying anything else

Everything except the two secrets is plain config at the top of `worker.js`:
`FROM_EMAIL`, `FROM_NAME`, `ALLOWED_ORIGINS`. The email wording lives in
`textBody()` and `htmlBody()` at the bottom. Edit, paste, Deploy.

`ALLOWED_ORIGINS` already includes `127.0.0.1:5500` and `localhost:5500`, so it
works against the local server and production without switching.

## Checking it

Open the Worker's **Logs** tab and submit the form. You should see the request;
if Mailjet refuses, its reason is logged there. Common causes:

- `FROM_EMAIL` not verified in Mailjet
- Wrong or unrotated API key/secret
- Origin not in `ALLOWED_ORIGINS` (returns 403 before Mailjet is even called)

## Security notes

- Subject and body are fixed in the Worker; the caller cannot supply them, so
  this can never be used to send arbitrary content from your domain.
- Origin is checked on every request, not just the CORS preflight — CORS alone
  only constrains browsers, not `curl`.
- Recipient addresses are format-validated and length-capped before any send.
- **Residual risk:** someone could replay the request to send acknowledgments to
  addresses of their choosing. Content is fixed and harmless, volume isn't. Add
  Cloudflare Turnstile or a Rate Limiting rule on the route if that matters.
