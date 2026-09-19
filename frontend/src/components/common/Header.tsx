import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        <Link to="/" className="brand-link" aria-label="AlgoViz Home">
          <span>AlgoViz</span>
        </Link>

        <nav aria-label="Primary Navigation">
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/catalog"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Catalog
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Admin
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                className="btn-icon"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
