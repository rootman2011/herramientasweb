
import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher.tsx';

const Header: React.FC = () => {
  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkStyle = "bg-primary text-white";
  const inactiveLinkStyle = "text-base-content/70 hover:bg-secondary/20 hover:text-base-content";

  return (
    <header className="bg-base-100 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
             <NavLink to="/" className="flex items-center space-x-2">
                <span className="text-2xl">🛠️</span>
                <span className="text-xl font-bold text-base-content whitespace-nowrap">Herramientas Web y Más</span>
             </NavLink>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:flex items-baseline space-x-4 mr-4">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
              >
                Inicio
              </NavLink>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;