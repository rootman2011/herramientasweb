import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import HectareCalculatorPage from './pages/HectareCalculatorPage.tsx';
import PayPalCalculatorPage from './pages/PayPalCalculatorPage.tsx';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools/hectare-calculator" element={<HectareCalculatorPage />} />
            <Route path="/tools/paypal-calculator" element={<PayPalCalculatorPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;