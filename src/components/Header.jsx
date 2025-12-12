import { useState } from 'react';

export default function Header({ onSignIn, onGetStarted }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <div className="logo-box">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="logo-text">MediConnect</span>
        </div>

        <nav className="nav-desktop">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="button-group">
          <button className="btn-secondary" onClick={onSignIn}>
            Sign In
          </button>
          <button className="btn-primary" onClick={onGetStarted}>
            Get Started
          </button>
        </div>

        <button
          className="nav-mobile-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="nav-mobile-menu">
            <div className="nav-mobile-container">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="nav-link"
                >
                  {link.label}
                </a>
              ))}
              <button className="btn-secondary" onClick={onSignIn}>
                Sign In
              </button>
              <button className="btn-primary" onClick={onGetStarted}>
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}