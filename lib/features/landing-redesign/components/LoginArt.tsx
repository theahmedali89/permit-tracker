import styles from "../landing-redesign.module.css";

/**
 * Mini orbit + skyline motif for the sign-in brand panel (from the
 * approved preview). Presentational CSS art only. The two floating
 * chips use honest generic copy — not the preview's sample "2 permits
 * expiring soon" line, which would present invented specifics as
 * fact on a logged-out page.
 */
export function LoginArt() {
  return (
    <div className={styles.loginArt} aria-hidden="true">
      <div className={styles.miniOrbit}>
        <div className={styles.oplane}>
          <div className={`${styles.ring} ${styles.r1}`} />
          <div className={`${styles.ring} ${styles.r2}`} />
          <div className={`${styles.ring} ${styles.r3}`} />
          <div className={`${styles.arm} ${styles.armA}`}>
            <div className={styles.holder}>
              <div className={styles.sat} />
            </div>
          </div>
          <div className={`${styles.arm} ${styles.armB}`}>
            <div className={styles.holder}>
              <div className={`${styles.sat} ${styles.satBlue}`} />
            </div>
            <div className={styles.holder} style={{ top: "100%" }}>
              <div className={styles.sat} />
            </div>
          </div>
          <div className={`${styles.arm} ${styles.armC}`}>
            <div className={styles.holder}>
              <div className={`${styles.sat} ${styles.satBlue}`} />
            </div>
          </div>
        </div>
        <div className={styles.miniDial}>
          <i>92%</i>
        </div>
      </div>
      <span className={`${styles.loginChip} ${styles.chipA}`}>
        <span className={`${styles.dot} ${styles.dotAmber}`} />
        Reminders before every deadline
      </span>
      <span className={`${styles.loginChip} ${styles.chipB}`}>
        <span className={`${styles.dot} ${styles.dotTeal}`} />
        Apply-by dates built in
      </span>
      <div className={styles.miniSky}>
        <div className={styles.bldg} style={{ left: "2%", width: 52, height: 90 }} />
        <div className={styles.bldg} style={{ left: "20%", width: 64, height: 130 }} />
        <div className={styles.bldg} style={{ left: "42%", width: 48, height: 74 }} />
        <div className={styles.bldg} style={{ left: "62%", width: 70, height: 112 }} />
        <div className={styles.bldg} style={{ left: "84%", width: 54, height: 84 }} />
      </div>
    </div>
  );
}
