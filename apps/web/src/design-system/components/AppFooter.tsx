import { Link } from "@tanstack/react-router";

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <img src="/sb-logo.svg" alt="Scheidt &amp; Bachmann" />
        <span>entervo Service Hub · Internal platform for S&amp;B staff and partners</span>
        <nav className="app-footer-links" aria-label="Footer">
          <Link to="/">Hub</Link>
          <Link to="/design-system">Design system</Link>
          <a href="https://www.scheidt-bachmann.de" target="_blank" rel="noreferrer">scheidt-bachmann.de</a>
        </nav>
      </div>
    </footer>
  );
}
