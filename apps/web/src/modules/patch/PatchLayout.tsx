import { useState, useEffect } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import "../../styles/patch.css";

interface PatchNavLink {
  href: string;
  label: string;
  badge?: string;
}

const NAV_LINKS: PatchNavLink[] = [
  { href: "#hero", label: "Overview" },
  { href: "#why", label: "Value Drivers" },
  { href: "#process", label: "6-Step Process" },
  { href: "#systems", label: "Supported Systems" },
  { href: "#automox", label: "Automox Platform" },
  { href: "#tiers", label: "Service Tiers" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#contact", label: "Contact Us" },
];

export function PatchLayout() {
  const [activeSection, setActiveSection] = useState<string>("#hero");

  useEffect(() => {
    const handleScrollSpy = () => {
      const sectionIds = NAV_LINKS.map(link => link.href);
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.querySelector(sectionIds[i]);
        if (section) {
          const top = (section as HTMLElement).offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setActiveSection(href);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sb-portal patch-fade">
      {/* 1. Official Scheidt & Bachmann Corporate Top Utility Header */}
      <header className="sb-header-top">
        <div className="sb-header-container">
          <div className="sb-brand-area">
            <a href="#hero" onClick={(e) => handleScroll(e, "#hero")} className="sb-logo-link">
              <span className="sb-logo-text">SCHEIDT &amp; BACHMANN</span>
              <span className="sb-logo-tag">PATCH MANAGEMENT</span>
            </a>
          </div>

          <div className="sb-top-utilities">
            <div className="sb-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search patches, bulletins, systems..." />
            </div>

            <div className="sb-lang-switcher">
              <span className="active">FR</span>
              <span>EN</span>
              <span>DE</span>
            </div>

            <a
              href="https://utransfer.scheidt-bachmann.de/s/nYj4yaXK7A5ysCW"
              target="_blank"
              rel="noreferrer"
              className="sb-util-btn"
            >
              📖 Documentation
            </a>

            <Link to="/" className="sb-util-btn sb-util-btn-secondary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              Service Hub
            </Link>

            <div className="sb-user-profile">
              <span className="sb-user-avatar">KH</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Scheidt & Bachmann Main Navigation Bar with Holdbar */}
      <nav className="sb-main-nav">
        <div className="sb-nav-container">
          <div className="sb-nav-links">
            {NAV_LINKS.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className={`sb-nav-link${activeSection === item.href ? " active" : ""}`}
              >
                {item.label}
                {item.badge && <span className="sb-nav-badge">{item.badge}</span>}
              </a>
            ))}
          </div>

          {/* Right Horizontal Holdbar */}
          <div className="sb-nav-holdbar">
            <div className="sb-holdbar-status">
              <span className="sb-holdbar-dot" />
              WSUS ACTIVE
            </div>

            <button
              className="p-btn p-btn-secondary p-btn-sm"
              style={{ background: "rgba(255,255,255,0.08)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.2)" }}
              onClick={() => {
                const el = document.querySelector("#process");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Run Cycle
            </button>

            <button className="sb-action-btn" style={{ padding: "6px 14px", fontSize: 12.5 }} onClick={() => {
              const el = document.querySelector("#contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}>
              ⚡ Request Demo
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Main Content Container */}
      <main className="sb-main-body">
        <div className="sb-body-container">
          <Outlet />
        </div>
      </main>

      {/* Floating Scroll-to-Top Widget */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#001E42",
            color: "#FFC200",
            border: "2px solid #FFC200",
            boxShadow: "0 6px 20px rgba(0,30,66,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: "bold"
          }}
          title="Scroll to top"
        >
          ↑
        </button>
      </div>

      {/* 4. Official Corporate Footer (Scheidt & Bachmann Portal) */}
      <footer className="sb-footer">
        <div className="sb-footer-container">
          <div className="sb-footer-cols">
            <div className="sb-footer-col">
              <div className="sb-footer-brand">SCHEIDT &amp; BACHMANN</div>
              <p className="sb-footer-desc">
                Global leaders in intelligent hardware &amp; software solutions for Parking Systems, Signalling Systems, Energy Retail, and Fare Collection.
              </p>
              <div style={{ fontFamily: "Outfit", fontSize: 13, fontWeight: 800, color: "#FFC200" }}>
                "Your Trusted IT Security Partner"
              </div>
            </div>

            <div className="sb-footer-col">
              <div className="sb-footer-title">Navigation</div>
              <ul className="sb-footer-links">
                <li><a href="#hero" onClick={(e) => handleScroll(e, "#hero")}>Overview</a></li>
                <li><a href="#why" onClick={(e) => handleScroll(e, "#why")}>Why Patch Management</a></li>
                <li><a href="#process" onClick={(e) => handleScroll(e, "#process")}>6-Step Process</a></li>
                <li><a href="#systems" onClick={(e) => handleScroll(e, "#systems")}>Supported Systems</a></li>
                <li><a href="#automox" onClick={(e) => handleScroll(e, "#automox")}>Automox Platform</a></li>
              </ul>
            </div>

            <div className="sb-footer-col">
              <div className="sb-footer-title">Services &amp; Legal</div>
              <ul className="sb-footer-links">
                <li><a href="#tiers" onClick={(e) => handleScroll(e, "#tiers")}>Service Tiers</a></li>
                <li><a href="#roadmap" onClick={(e) => handleScroll(e, "#roadmap")}>Next Steps Roadmap</a></li>
                <li><a href="#contact" onClick={(e) => handleScroll(e, "#contact")}>Contact Experts</a></li>
                <li><a href="https://utransfer.scheidt-bachmann.de/s/nYj4yaXK7A5ysCW" target="_blank" rel="noreferrer">Documentation</a></li>
              </ul>
            </div>

            <div className="sb-footer-col">
              <div className="sb-footer-title">Talk With Experts</div>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", margin: "0 0 6px" }}>Scheidt &amp; Bachmann Service Desk</p>
              <p style={{ fontSize: 13.5, color: "#FFFFFF", fontWeight: 700, margin: "0 0 4px" }}>Phone: +49 2166 266-0</p>
              <p style={{ fontSize: 13.5, color: "#FFC200", fontWeight: 700, margin: 0 }}>Email: customer@scheidt-bachmann.de</p>
            </div>
          </div>

          <div className="sb-footer-bottom">
            <div>© 2026 Scheidt &amp; Bachmann GmbH. All rights reserved.</div>
            <div className="sb-footer-legal">
              <span>Privacy Policy</span>
              <span>Cookie Settings</span>
              <span>Terms of Service</span>
              <span>Imprint</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
