import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className="navbar" id="main-navbar">
      {/* Brand */}
      <NavLink to="/" className="navbar__brand">
        <svg
          className="navbar__brand-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        Spotify
      </NavLink>

      {/* Hamburger button (mobile) */}
      <button
        className={`navbar__toggle ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        id="navbar-toggle"
      >
        <span className="navbar__toggle-bar"></span>
        <span className="navbar__toggle-bar"></span>
        <span className="navbar__toggle-bar"></span>
      </button>

      {/* Navigation menu */}
      <div className={`navbar__menu ${menuOpen ? "open" : ""}`}>
        <ul className="navbar__links">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navbar__link ${isActive ? "active" : ""}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/artist/dashboard"
              className={({ isActive }) =>
                `navbar__link ${isActive ? "active" : ""}`
              }
            >
              Artist Dashboard
            </NavLink>
          </li>
        </ul>

        <NavLink to="/login" className="navbar__cta" id="navbar-login-btn">
          Log In
        </NavLink>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`navbar__overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>
    </nav>
  );
};

export default Navbar;
