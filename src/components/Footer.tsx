import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="wrap footer-inner">
        <Link href="/" className="brand">
          <span className="mark">神威</span>
          <span className="brand-word">KAMUI</span>
        </Link>
        <div className="footer-meta">
          <p className="copyright">&copy; 2026 KAMUI Streaming. All rights reserved.</p>
          <p className="footer-note">
            Concept design for an anime streaming platform. Titles, art, and synopses are original to this demo.
          </p>
        </div>
      </div>
    </footer>
  );
};
