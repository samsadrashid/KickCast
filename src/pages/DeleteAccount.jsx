const T = {
  navy: "#0A1931",
  navyMid: "#0F2847",
  navyLight: "#162F55",
  gold: "#B4FF02",
  white: "#F5F0E8",
  gray: "#8A9BB5",
  red: "#E63946",
};

const s = {
  page: {
    minHeight: "100vh",
    background: T.navy,
    color: T.white,
    fontFamily: "'Barlow', sans-serif",
    padding: "0 0 80px",
  },
  header: {
    background: T.navyMid,
    borderBottom: `1px solid ${T.navyLight}`,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  back: {
    color: T.gold,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 1,
    fontFamily: "'Barlow Condensed', sans-serif",
  },
  title: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 22,
    color: T.gold,
    letterSpacing: 1,
    flex: 1,
  },
  updated: {
    fontSize: 11,
    color: T.gray,
  },
  body: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "32px 24px",
  },
  section: {
    marginBottom: 32,
  },
  h2: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 18,
    color: T.gold,
    letterSpacing: 1,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1px solid ${T.navyLight}`,
  },
  p: {
    fontSize: 14,
    lineHeight: 1.7,
    color: T.white,
    marginBottom: 10,
    opacity: 0.9,
  },
  li: {
    fontSize: 14,
    lineHeight: 1.7,
    color: T.white,
    opacity: 0.9,
    marginBottom: 6,
    paddingLeft: 8,
  },
  highlight: {
    background: T.navyLight,
    borderLeft: `3px solid ${T.gold}`,
    padding: "12px 16px",
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 13,
    color: T.white,
    lineHeight: 1.6,
  },
  warn: {
    background: "#0d0505",
    borderLeft: `3px solid ${T.red}`,
    padding: "12px 16px",
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 13,
    color: T.red,
    lineHeight: 1.6,
  },
  stepCard: {
    background: T.navyMid,
    border: `1px solid ${T.navyLight}`,
    borderRadius: 10,
    padding: "18px 20px",
    marginBottom: 12,
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  stepNum: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 900,
    fontSize: 22,
    color: T.gold,
    minWidth: 28,
    lineHeight: 1,
  },
  stepText: {
    fontSize: 14,
    color: T.white,
    lineHeight: 1.65,
    opacity: 0.9,
  },
  stepLabel: {
    fontWeight: 700,
    color: T.white,
    display: "block",
    marginBottom: 4,
  },
  dataTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    marginBottom: 12,
  },
  th: {
    background: T.navyLight,
    color: T.gold,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    padding: "8px 12px",
    textAlign: "left",
    letterSpacing: 0.5,
  },
  td: {
    padding: "8px 12px",
    color: T.white,
    opacity: 0.85,
    borderBottom: `1px solid ${T.navyLight}`,
  },
  emailBtn: {
    display: "inline-block",
    background: T.navyLight,
    border: `1px solid ${T.gold}44`,
    color: T.gold,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 0.5,
    padding: "10px 20px",
    borderRadius: 8,
    textDecoration: "none",
    marginTop: 8,
  },
  contact: {
    background: T.navyMid,
    border: `1px solid ${T.navyLight}`,
    borderRadius: 10,
    padding: "20px 24px",
    marginTop: 8,
  },
  contactRow: {
    fontSize: 13,
    color: T.white,
    opacity: 0.85,
    marginBottom: 6,
  },
  link: {
    color: T.gold,
    opacity: 0.8,
  },
};

export default function DeleteAccount() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A1931; }
        ul { padding-left: 20px; }
      `}</style>
      <div style={s.page}>
        <div style={s.header}>
          <a href="https://kick-cast.vercel.app" style={s.back}>← KICKCAST</a>
          <span style={s.title}>DELETE ACCOUNT</span>
          <span style={s.updated}>Updated Jun 30, 2026</span>
        </div>

        <div style={s.body}>

          <div style={s.section}>
            <div style={s.highlight}>
              You can delete your KickCast account and all associated data at any time. Deletion is <strong>permanent and irreversible</strong>. The fastest way is directly from the app.
            </div>
          </div>

          {/* Primary: in-app */}
          <div style={s.section}>
            <div style={s.h2}>Option 1 — Delete Inside the App (Recommended)</div>
            <p style={s.p}>Account deletion is available directly in the KickCast app and takes effect immediately.</p>

            <div style={s.stepCard}>
              <span style={s.stepNum}>1</span>
              <span style={s.stepText}><span style={s.stepLabel}>Open KickCast</span>Tap the <strong>More</strong> tab (bottom-right of the navigation bar).</span>
            </div>
            <div style={s.stepCard}>
              <span style={s.stepNum}>2</span>
              <span style={s.stepText}><span style={s.stepLabel}>Find your profile</span>Your name and email appear at the top of the More screen.</span>
            </div>
            <div style={s.stepCard}>
              <span style={s.stepNum}>3</span>
              <span style={s.stepText}><span style={s.stepLabel}>Tap "🗑️ Delete Account"</span>The red <strong>Delete Account</strong> button appears next to the Edit Profile button. You can also find it under <strong>More → Settings → Danger Zone</strong>.</span>
            </div>
            <div style={s.stepCard}>
              <span style={s.stepNum}>4</span>
              <span style={s.stepText}><span style={s.stepLabel}>Confirm twice</span>Two confirmation prompts appear to prevent accidental deletion. Confirm both to proceed.</span>
            </div>
            <div style={s.stepCard}>
              <span style={s.stepNum}>5</span>
              <span style={s.stepText}><span style={s.stepLabel}>Deletion completes instantly</span>All your data is deleted immediately from our servers. You are signed out automatically.</span>
            </div>
          </div>

          {/* What gets deleted */}
          <div style={s.section}>
            <div style={s.h2}>What Gets Deleted</div>
            <div style={s.warn}>
              Account deletion is <strong>permanent and cannot be undone</strong>. There is no grace period — data is removed immediately.
            </div>
            <table style={s.dataTable}>
              <thead>
                <tr>
                  <th style={s.th}>Data</th>
                  <th style={s.th}>Deleted</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Account credentials (email, password hash)", "Immediately"],
                  ["All match score predictions", "Immediately"],
                  ["Knockout bracket picks", "Immediately"],
                  ["Vote history", "Immediately"],
                  ["Profile (display name, avatar)", "Immediately"],
                  ["Leaderboard scores", "Immediately"],
                  ["Scheduled match notifications", "Immediately (cancelled on device)"],
                ].map(([data, timing], i) => (
                  <tr key={i}>
                    <td style={s.td}>{data}</td>
                    <td style={{ ...s.td, color: "#4CAF50", fontWeight: 600 }}>{timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ ...s.p, opacity: 0.6, fontSize: 12 }}>
              We do not retain any personal data after deletion. Anonymised, aggregated analytics (no personal identifiers) may remain for internal product metrics only.
            </p>
          </div>

          {/* Fallback: email request */}
          <div style={s.section}>
            <div style={s.h2}>Option 2 — Request Deletion by Email</div>
            <p style={s.p}>If you cannot access the app, you can request account deletion by emailing us. We will process your request within <strong>7 days</strong> and confirm by email once complete.</p>
            <p style={s.p}>Send an email to <a href="mailto:samsadsam35@gmail.com?subject=Account Deletion Request&body=Please delete my KickCast account.%0A%0AEmail address registered: " style={s.link}>samsadsam35@gmail.com</a> with:</p>
            <ul>
              <li style={s.li}>Subject: <strong>Account Deletion Request</strong></li>
              <li style={s.li}>The email address linked to your KickCast account</li>
            </ul>
            <a
              href="mailto:samsadsam35@gmail.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20KickCast%20account.%0A%0AEmail%20address%20registered%3A%20"
              style={s.emailBtn}
            >
              ✉️  Send Deletion Request
            </a>
          </div>

          {/* Timeframe */}
          <div style={s.section}>
            <div style={s.h2}>Deletion Timeframe</div>
            <table style={s.dataTable}>
              <thead>
                <tr>
                  <th style={s.th}>Method</th>
                  <th style={s.th}>Timeframe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={s.td}>In-app deletion (recommended)</td>
                  <td style={{ ...s.td, color: "#4CAF50", fontWeight: 600 }}>Immediate</td>
                </tr>
                <tr>
                  <td style={s.td}>Email request</td>
                  <td style={{ ...s.td, color: T.gold, fontWeight: 600 }}>Within 7 days</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Contact */}
          <div style={s.section}>
            <div style={s.h2}>Contact</div>
            <div style={s.contact}>
              <div style={s.contactRow}><strong>Email:</strong> <a href="mailto:samsadsam35@gmail.com" style={s.link}>samsadsam35@gmail.com</a></div>
              <div style={s.contactRow}><strong>Developer:</strong> Samsad</div>
              <div style={s.contactRow}><strong>Privacy Policy:</strong> <a href="https://kick-cast.vercel.app/privacy-policy" style={s.link}>kick-cast.vercel.app/privacy-policy</a></div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
