// Zenkai Automated Email Notification Service
// Supports Resend API, SMTP, and graceful development logger

class EmailService {
  constructor() {
    this.resendApiKey = process.env.RESEND_API_KEY || null;
    this.fromEmail = process.env.EMAIL_FROM || 'Zenkai Radar <noreply@zenkai.app>';
  }

  generateHtmlWrapper(title, contentHtml) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; }
          .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 20px; }
          .card { background-color: #0f172a; border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 24px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .logo { display: inline-flex; align-items: center; gap: 8px; font-weight: 900; font-size: 24px; color: #ffffff; text-decoration: none; letter-spacing: -0.05em; }
          .logo span { color: #6366f1; }
          .badge { display: inline-block; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
          h1 { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.02em; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; }
          .highlight-box { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 18px; margin: 20px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 14px; font-size: 13px; font-weight: bold; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); }
          .footer { text-align: center; padding-top: 24px; font-size: 11px; color: #64748b; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://zenkai.vercel.app" class="logo">ZENKAI<span>.</span></a>
          </div>
          <div class="card">
            ${contentHtml}
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} Zenkai Anime Radar • Sub-2ms Latency Engine</p>
            <p style="margin: 4px 0 0 0;">You received this because you are an active member of Zenkai.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendMail({ to, subject, html }) {
    if (this.resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.resendApiKey}`,
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: [to],
            subject,
            html,
          }),
        });
        const data = await response.json();
        console.log(`📧 [Resend] Dispatched email to ${to}:`, data.id || 'OK');
        return { success: true, data };
      } catch (err) {
        console.warn(`[Resend Error] Failed to send email to ${to}:`, err.message);
      }
    }

    // Graceful development logger
    console.log(`\n======================================================`);
    console.log(`📧 [Zenkai Email Dispatch - Simulated / Ready]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  async sendWelcomeEmail(user) {
    if (!user || !user.email) return;

    const name = user.displayName || user.username || 'Otaku';
    const content = `
      <span class="badge">Welcome to the Inner Sanctum</span>
      <h1>Welcome to Zenkai, ${name}! 🔥</h1>
      <p>Your anime journey has officially evolved. Track over 500+ flagship and newly airing anime with zero lag, instant watch order chronologies, and head-to-head matchup comparisons.</p>
      
      <div class="highlight-box">
        <h3 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 14px;">⚡ Quick Start Milestones:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.8;">
          <li>Search and pin your <strong>Top 4 Favorite Anime</strong> on your Profile.</li>
          <li>Craft custom S/A/B/C/D rankings in the <strong>Tier List Studio</strong>.</li>
          <li>Activate <strong>Mobile Simulcast Push Alerts</strong> in the Notification Bell.</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://zenkai.vercel.app/explore" class="btn">Explore Anime Catalog →</a>
      </div>
    `;

    return this.sendMail({
      to: user.email,
      subject: `⚡ Welcome to Zenkai, ${name}! Your Anime Chronicle Begins`,
      html: this.generateHtmlWrapper('Welcome to Zenkai', content),
    });
  }

  async sendAiringAlertEmail(user, animeTitle, episodeNumber, animeId) {
    if (!user || !user.email) return;

    const name = user.displayName || user.username || 'Friend';
    const epText = episodeNumber ? `Episode ${episodeNumber}` : 'A new episode';

    const content = `
      <span class="badge">Simulcast Release Ping</span>
      <h1>${animeTitle} is Now Streaming! 🎬</h1>
      <p>Hey ${name}, <strong>${epText}</strong> of <strong>${animeTitle}</strong> has officially finished broadcasting and is ready to stream.</p>
      
      <div class="highlight-box" style="text-align: center;">
        <p style="color: #38bdf8; font-size: 16px; font-weight: bold; margin: 0;">⚡ ${animeTitle}</p>
        <span style="color: #94a3b8; font-size: 12px; font-family: monospace;">${epText} • Available on Simulcast Networks</span>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://zenkai.vercel.app/anime/${animeId || ''}" class="btn">Log Episode & View Chronicle →</a>
      </div>
    `;

    return this.sendMail({
      to: user.email,
      subject: `⚡ Airing Alert: ${animeTitle} ${epText} is Live!`,
      html: this.generateHtmlWrapper('Airing Alert', content),
    });
  }
}

module.exports = new EmailService();
