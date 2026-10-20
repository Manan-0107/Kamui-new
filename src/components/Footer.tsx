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
          <p className="copyright">&copy; 2026 KAMUI. Distributed as a decentralized catalog client.</p>
          <p className="footer-note">
            Data provided by{' '}
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#02a9ff', textDecoration: 'underline' }}
            >
              AniList
            </a>
            . Content streaming requires user-configured extensions.
          </p>
        </div>
      </div>
    </footer>
  );
};
