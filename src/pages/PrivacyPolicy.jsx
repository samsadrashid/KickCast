const T = {
  navy: "#0A1931",
  navyMid: "#0F2847",
  navyLight: "#162F55",
  gold: "#B4FF02",
  white: "#F5F0E8",
  gray: "#8A9BB5",
  grayDark: "#3A4F6E",
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
    marginBottom: 36,
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 12,
    fontSize: 13,
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
  highlight: {
    background: T.navyLight,
    borderLeft: `3px solid ${T.gold}`,
    padding: "12px 16px",
    borderRadius: 4,
    marginBottom: 10,
    fontSize: 13,
    color: T.white,
    lineHeight: 1.6,
  },
  link: {
    color: T.gold,
    opacity: 0.8,
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
  badge: {
    display: "inline-block",
    background: T.gold + "22",
    border: `1px solid ${T.gold}44`,
    color: T.gold,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 1,
    padding: "2px 8px",
    borderRadius: 4,
    marginRight: 8,
  },
};

export default function PrivacyPolicy() {
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
          <span style={s.title}>PRIVACY POLICY</span>
          <span style={s.updated}>Updated Jun 16, 2026</span>
        </div>

        <div style={s.body}>

          <div style={s.section}>
            <div style={s.highlight}>
              KickCast is committed to protecting your privacy. We collect only what's needed to run the app — nothing more.
            </div>
          </div>

          <div style={s.section}>
            <div style={s.h2}>1. Who We Are</div>
            <p style={s.p}><strong>App:</strong> KickCast — FIFA World Cup 2026 Predictor</p>
            <p style={s.p}><strong>Developer:</strong> Samsad</p>
            <p style={s.p}><strong>Contact:</strong> <a href="mailto:samsadsam35@gmail.com" style={s.link}>samsadsam35@gmail.com</a></p>
            <p style={s.p}><strong>Effective Date:</strong> June 16, 2026</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>2. Information We Collect</div>
            <p style={s.p}><span style={s.badge}>ACCOUNT</span>Email address and encrypted password when you sign up.</p>
            <p style={s.p}><span style={s.badge}>CONTENT</span>Match score predictions, bracket picks, and tournament selections you submit.</p>
            <p style={s.p}><span style={s.badge}>DEVICE</span>Device type, OS version, app version, and notification preferences.</p>
            <p style={s.p}>We do <strong>not</strong> collect real name, phone number, location, payment info, contacts, or camera data.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>3. How We Use Your Data</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Purpose</th>
                  <th style={s.th}>Data Used</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Authenticate your account", "Email, password hash"],
                  ["Save and sync predictions", "User ID, prediction data"],
                  ["Display leaderboard rankings", "User ID, prediction scores"],
                  ["Match reminder notifications", "Scheduled locally on device"],
                  ["Improve the app", "Aggregated, anonymous patterns"],
                ].map(([purpose, data], i) => (
                  <tr key={i}>
                    <td style={s.td}>{purpose}</td>
                    <td style={{ ...s.td, color: T.gray }}>{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ ...s.p, color: T.gray }}>We do not sell, rent, or trade your personal information to third parties.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>4. Third-Party Services</div>
            <p style={s.p}><strong style={{ color: T.gold }}>Supabase</strong> — Our database and authentication provider. Your email and app data are stored on Supabase servers (SOC 2 Type II certified). See <a href="https://supabase.com/privacy" style={s.link} target="_blank" rel="noreferrer">supabase.com/privacy</a>.</p>
            <p style={s.p}><strong style={{ color: T.gold }}>Expo</strong> — App framework used to build KickCast. Local notifications are scheduled on-device and no personal data is sent to Expo servers. See <a href="https://expo.dev/privacy" style={s.link} target="_blank" rel="noreferrer">expo.dev/privacy</a>.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>5. Data Security</div>
            <ul>
              <li style={s.li}>All data transmitted over HTTPS/TLS encryption.</li>
              <li style={s.li}>Passwords hashed and never stored in plain text.</li>
              <li style={s.li}>Supabase row-level security — you can only access your own records.</li>
              <li style={s.li}>Account deletion removes all your data within 30 days.</li>
            </ul>
          </div>

          <div style={s.section}>
            <div style={s.h2}>6. Notifications</div>
            <p style={s.p}>Match reminder notifications are scheduled entirely on your device. They are not routed through external servers and are fully optional. Disable them anytime in your device settings.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>7. Children's Privacy</div>
            <p style={s.p}>KickCast is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided their information, contact us immediately and we will delete it.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>8. Your Rights</div>
            <p style={s.p}>You may have the right to <strong>access</strong>, <strong>correct</strong>, <strong>delete</strong>, or <strong>export</strong> your data, and to <strong>withdraw consent</strong> at any time. To exercise any of these rights, email <a href="mailto:samsadsam35@gmail.com" style={s.link}>samsadsam35@gmail.com</a> with subject line <em>"Privacy Request"</em>.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>9. Changes to This Policy</div>
            <p style={s.p}>We may update this policy from time to time. The "Updated" date at the top will reflect changes. Continued use of the app after changes constitutes acceptance.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>10. Contact</div>
            <div style={s.contact}>
              <div style={s.contactRow}><strong>Email:</strong> <a href="mailto:samsadsam35@gmail.com" style={s.link}>samsadsam35@gmail.com</a></div>
              <div style={s.contactRow}><strong>Developer:</strong> Samsad</div>
              <div style={s.contactRow}><strong>App:</strong> KickCast — FIFA World Cup 2026 Predictor</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
