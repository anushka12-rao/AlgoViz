import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthProvider } from '../../context/AuthContext';

export const Layout: React.FC = () => {
  return (
    <AuthProvider>
      <div className="app-container">
        <Header />
        <main className="main-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};
