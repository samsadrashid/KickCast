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
  warn: {
    background: "#1a0a0a",
    borderLeft: `3px solid #E63946`,
    padding: "12px 16px",
    borderRadius: 4,
    marginBottom: 10,
    fontSize: 12,
    color: "#E63946",
    lineHeight: 1.6,
    opacity: 0.9,
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

export default function TermsAndConditions() {
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
          <span style={s.title}>TERMS & CONDITIONS</span>
          <span style={s.updated}>Updated Jun 16, 2026</span>
        </div>

        <div style={s.body}>

          <div style={s.section}>
            <div style={s.highlight}>
              By using KickCast, you agree to these Terms. Please read them carefully.
            </div>
          </div>

          <div style={s.section}>
            <div style={s.h2}>1. Acceptance of Terms</div>
            <p style={s.p}>By downloading, installing, or using the KickCast mobile application ("App"), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the App.</p>
            <p style={s.p}>These Terms form a legally binding agreement between you ("User") and Samsad ("we", "us", "our").</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>2. What Is KickCast</div>
            <p style={s.p}>KickCast is a FIFA World Cup 2026 prediction and bracket game app. It lets you predict match scores, build a knockout bracket, compete on a leaderboard, and receive match notifications.</p>
            <div style={s.warn}>
              KickCast is an unofficial fan application. It is not affiliated with, endorsed by, or sponsored by FIFA, any national football association, or any tournament organizer.
            </div>
          </div>

          <div style={s.section}>
            <div style={s.h2}>3. Eligibility</div>
            <p style={s.p}>You must be at least <strong>13 years old</strong> to use the App. By using it, you confirm you meet this requirement. If you are under 18, you confirm you have parental or guardian consent.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>4. User Accounts</div>
            <p style={s.p}><span style={s.badge}>SECURITY</span>You are responsible for keeping your password confidential and for all activity under your account. Notify us immediately of any unauthorized use.</p>
            <p style={s.p}><span style={s.badge}>ACCURACY</span>You agree to provide accurate information. We may suspend accounts with false or misleading details.</p>
            <p style={s.p}><span style={s.badge}>ONE ACCOUNT</span>Each user may hold only one account. Multiple accounts to gain leaderboard advantages are prohibited.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>5. Acceptable Use</div>
            <p style={s.p}>You agree <strong>not</strong> to:</p>
            <ul>
              <li style={s.li}>Use the App for any unlawful purpose</li>
              <li style={s.li}>Hack, reverse-engineer, or tamper with the App or its servers</li>
              <li style={s.li}>Submit automated or scripted predictions</li>
              <li style={s.li}>Harass, abuse, or harm other users</li>
              <li style={s.li}>Impersonate any person or entity</li>
              <li style={s.li}>Exploit bugs or glitches for unfair leaderboard advantages</li>
              <li style={s.li}>Damage, overload, or impair our infrastructure</li>
            </ul>
          </div>

          <div style={s.section}>
            <div style={s.h2}>6. Predictions &amp; Leaderboard</div>
            <div style={s.warn}>
              KickCast is for entertainment purposes only. It is not a gambling, betting, or wagering platform. No real money is won or lost.
            </div>
            <p style={s.p}>Leaderboard scores are calculated against actual match results. We make no guarantees regarding the accuracy or timeliness of match data. We reserve the right to correct scoring errors, and final standings are determined at our sole discretion in cases of data disputes.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>7. Intellectual Property</div>
            <p style={s.p}><span style={s.badge}>OUR CONTENT</span>The App and all original content, design, and code are owned by Samsad and protected by applicable intellectual property laws.</p>
            <p style={s.p}><span style={s.badge}>FOOTBALL DATA</span>Tournament fixtures, results, team names, and related data are used for non-commercial informational purposes. KickCast makes no claim of ownership over football statistics or tournament data.</p>
            <p style={s.p}><span style={s.badge}>YOUR CONTENT</span>You retain ownership of your picks and predictions. By submitting, you grant us a non-exclusive, royalty-free license to store and display them within the App for scoring purposes.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>8. Disclaimers</div>
            <p style={s.p}>THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee the App will be available at all times or that match data will be error-free. We are not liable for any loss resulting from App unavailability or data inaccuracies.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>9. Limitation of Liability</div>
            <p style={s.p}>To the maximum extent permitted by law, Samsad shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App. Our total liability for any claims shall not exceed the amount you paid us in the prior twelve months (which is $0, as the App is free).</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>10. Termination</div>
            <p style={s.p}>We may suspend or terminate your account at any time for violation of these Terms, harmful conduct, or extended inactivity (12+ months). You may delete your account at any time by contacting <a href="mailto:samsadsam35@gmail.com" style={s.link}>samsadsam35@gmail.com</a>.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>11. Changes to Terms</div>
            <p style={s.p}>We may revise these Terms at any time. The "Updated" date at the top will reflect changes. Continued use after changes constitutes acceptance. For material changes, we will notify you within the App.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>12. Governing Law</div>
            <p style={s.p}>These Terms are governed by applicable laws. Disputes will first be attempted to be resolved through good-faith negotiation.</p>
          </div>

          <div style={s.section}>
            <div style={s.h2}>13. Contact</div>
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
