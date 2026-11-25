import "../landing-redesign.css";

/**
 * Mini orbit + skyline motif for the sign-in brand panel (from the
 * approved preview). Presentational CSS art only. The two floating
 * chips use honest generic copy — not the preview's sample "2 permits
 * expiring soon" line, which would present invented specifics as
 * fact on a logged-out page.
 */
export function LoginArt() {
  return (
    <div className="lr-loginArt" aria-hidden="true">
      <div className="lr-miniOrbit">
        <div className="lr-oplane">
          <div className={`lr-ring lr-r1`} />
          <div className={`lr-ring lr-r2`} />
          <div className={`lr-ring lr-r3`} />
          <div className={`lr-arm lr-armA`}>
            <div className="lr-holder">
              <div className="lr-sat" />
            </div>
          </div>
          <div className={`lr-arm lr-armB`}>
            <div className="lr-holder">
              <div className={`lr-sat lr-satBlue`} />
            </div>
            <div className="lr-holder" style={{ top: "100%" }}>
              <div className="lr-sat" />
            </div>
          </div>
          <div className={`lr-arm lr-armC`}>
            <div className="lr-holder">
              <div className={`lr-sat lr-satBlue`} />
            </div>
          </div>
        </div>
        <div className="lr-miniDial">
          <i>92%</i>
        </div>
      </div>
      <span className={`lr-loginChip lr-chipA`}>
        <span className={`lr-dot lr-dotAmber`} />
        Reminders before every deadline
      </span>
      <span className={`lr-loginChip lr-chipB`}>
        <span className={`lr-dot lr-dotTeal`} />
        Apply-by dates built in
      </span>
      <div className="lr-miniSky">
        <div className="lr-bldg" style={{ left: "2%", width: 52, height: 90 }} />
        <div className="lr-bldg" style={{ left: "20%", width: 64, height: 130 }} />
        <div className="lr-bldg" style={{ left: "42%", width: 48, height: 74 }} />
        <div className="lr-bldg" style={{ left: "62%", width: 70, height: 112 }} />
        <div className="lr-bldg" style={{ left: "84%", width: 54, height: 84 }} />
      </div>
    </div>
  );
}
