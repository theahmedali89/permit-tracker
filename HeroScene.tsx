"use client";

import { useEffect, useRef } from "react";
import "../landing-redesign.css";

/**
 * Merged 3D hero scene — city skyline (back) + deadline orbit
 * (middle) + fanned permit deck (front), from the approved preview.
 *
 * Presentational hero art only: the orbit chips and deck cards carry
 * the same illustrative sample content as the preview (and as the
 * existing DashboardMockup) — they are NOT live data. The scene is
 * aria-hidden; the caption below it is readable.
 *
 * One mousemove handler tilts the whole scene (lerped via
 * requestAnimationFrame) and drives per-layer parallax through the
 * --rx / --ry / --px CSS vars. Disabled under
 * prefers-reduced-motion and for coarse pointers.
 */

const SKYLINE_BACK: { left: string; width: number; height: number; antenna?: boolean }[] = [
  { left: "2%", width: 44, height: 130 },
  { left: "14%", width: 56, height: 185 },
  { left: "28%", width: 38, height: 105, antenna: true },
  { left: "42%", width: 62, height: 160 },
  { left: "60%", width: 46, height: 205 },
  { left: "74%", width: 54, height: 140 },
  { left: "88%", width: 42, height: 170 },
];

const SKYLINE_MID: { left: string; width: number; height: number; antenna?: boolean }[] = [
  { left: "5%", width: 58, height: 165 },
  { left: "22%", width: 50, height: 230, antenna: true },
  { left: "40%", width: 70, height: 148 },
  { left: "62%", width: 54, height: 195 },
  { left: "80%", width: 64, height: 130 },
];

const SKYLINE_FRONT: { left: string; width: number; height: number }[] = [
  { left: "0", width: 78, height: 110 },
  { left: "19%", width: 66, height: 178 },
  { left: "47%", width: 86, height: 96 },
  { left: "73%", width: 72, height: 152 },
  { left: "92%", width: 56, height: 84 },
];

function Building({
  left,
  width,
  height,
  antenna,
}: {
  left: string;
  width: number;
  height: number;
  antenna?: boolean;
}) {
  return (
    <div
      className={`lr-bldg${antenna ? ` lr-antenna` : ""}`}
      style={{ left, width, height }}
    />
  );
}

export function HeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const hero = scene.closest("section");
    if (!hero) return;
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;

    let tx = 8;
    let ty = -8;
    let cx = 8;
    let cy = -8;
    let raf: number | null = null;

    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      scene.style.setProperty("--rx", `${cx.toFixed(2)}deg`);
      scene.style.setProperty("--ry", `${cy.toFixed(2)}deg`);
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ty = -8 + px * 18;
      tx = 8 - py * 12;
      document.documentElement.style.setProperty("--px", (px * 2).toFixed(3));
      kick();
    };
    const onLeave = () => {
      tx = 8;
      ty = -8;
      document.documentElement.style.setProperty("--px", "0");
      kick();
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="lr-sceneWrap" aria-hidden="true">
        <div ref={sceneRef} className="lr-scene">
          {/* Base layer — skyline */}
          <div className="lr-skyline">
            <div className={`lr-layer lr-slBack`}>
              {SKYLINE_BACK.map((b, i) => (
                <Building key={i} {...b} />
              ))}
            </div>
            <div className={`lr-layer lr-slMid`}>
              {SKYLINE_MID.map((b, i) => (
                <Building key={i} {...b} />
              ))}
              <div className="lr-crane" aria-hidden="true">
                <span className="lr-mast" />
                <span className="lr-jib" />
                <span className="lr-counterj" />
                <span className="lr-apex" />
                <span className="lr-cable" />
                <span className="lr-load" />
              </div>
            </div>
            <div className={`lr-layer lr-slFront`}>
              {SKYLINE_FRONT.map((b, i) => (
                <Building key={i} {...b} />
              ))}
            </div>
          </div>

          {/* Middle layer — orbit */}
          <div className="lr-orbit">
            <div className="lr-oplane">
              <div className={`lr-ring lr-r1`} />
              <div className={`lr-ring lr-r2`} />
              <div className={`lr-ring lr-r3`} />
              <div className={`lr-arm lr-armA`}>
                <div className="lr-holder">
                  <div className="lr-counter">
                    <div className="lr-ochip">
                      <span className={`lr-dot lr-dotAmber`} />
                      <b>Austin</b>
                      <span>Building · TX</span>
                      <span className="lr-days">12d left</span>
                    </div>
                  </div>
                </div>
                <div className="lr-holder" style={{ top: "100%" }}>
                  <div className="lr-sat" />
                </div>
              </div>
              <div className={`lr-arm lr-armB`}>
                <div className="lr-holder">
                  <div className="lr-counter">
                    <div className="lr-ochip">
                      <span className={`lr-dot lr-dotAmber`} />
                      <b>Dallas</b>
                      <span>Electrical · TX</span>
                      <span className="lr-days">5d left</span>
                    </div>
                  </div>
                </div>
                <div className="lr-holder" style={{ top: "100%" }}>
                  <div className="lr-counter">
                    <div className="lr-ochip">
                      <span className={`lr-dot lr-dotBlue`} />
                      <b>Phoenix</b>
                      <span>HVAC · AZ</span>
                      <span className={`lr-days lr-daysOk`}>19d left</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`lr-arm lr-armC`}>
                <div className="lr-holder">
                  <div className="lr-counter">
                    <div className="lr-ochip">
                      <span className={`lr-dot lr-dotTeal`} />
                      <b>Houston</b>
                      <span>Roofing · TX</span>
                      <span className={`lr-days lr-daysOk`}>21d left</span>
                    </div>
                  </div>
                </div>
                <div className="lr-holder" style={{ top: "100%" }}>
                  <div className={`lr-sat lr-satBlue`} />
                </div>
              </div>
            </div>
            <div className="lr-dialWrap">
              <div className="lr-dial">
                <div className="lr-dialIn">
                  <div>
                    <b>92%</b>
                    <span>Compliance score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Front layer — fanned permit deck */}
          <div className="lr-deck">
            <article className="lr-dc1">
              <div className="lr-dcard">
                <span className={`lr-pillL lr-pillOk`}>Active</span>
                <span className="lr-city">Austin, TX</span>
                <h3>Building Permit</h3>
                <span className="lr-num">#2024-1147 · Travis County</span>
                <dl>
                  <div>
                    <dt>Expires</dt>
                    <dd>Dec 18, 2026</dd>
                  </div>
                  <div>
                    <dt>Apply by</dt>
                    <dd>Nov 20, 2026</dd>
                  </div>
                </dl>
              </div>
            </article>
            <article className="lr-dc2">
              <div className="lr-dcard">
                <span className={`lr-pillL lr-pillWarn`}>Renew soon</span>
                <span className="lr-city">Dallas, TX</span>
                <h3>Electrical Permit</h3>
                <span className="lr-num">#EL-88412 · Dallas County</span>
                <dl>
                  <div>
                    <dt>Expires</dt>
                    <dd>Dec 05, 2026</dd>
                  </div>
                  <div>
                    <dt>Apply by</dt>
                    <dd>Nov 14, 2026</dd>
                  </div>
                </dl>
              </div>
            </article>
            <article className="lr-dc3">
              <div className="lr-dcard">
                <span className={`lr-pillL lr-pillOk`}>Active</span>
                <span className="lr-city">Houston, TX</span>
                <h3>Roofing Permit</h3>
                <span className="lr-num">#RF-30921 · Harris County</span>
                <dl>
                  <div>
                    <dt>Expires</dt>
                    <dd>Jan 09, 2027</dd>
                  </div>
                  <div>
                    <dt>Apply by</dt>
                    <dd>Dec 12, 2026</dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>
          <div className="lr-ground" />
        </div>
      </div>
      <p className="lr-sceneCap">
        One 3D scene, three layers — <b>city skyline</b> behind, <b>deadline orbit</b> in the
        middle, <b>permit deck</b> up front. Move your mouse over the hero to tilt it.
      </p>
    </>
  );
}
