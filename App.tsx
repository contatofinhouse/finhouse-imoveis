import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PropertiesPage from './pages/PropertiesPage';
import AdvertisePage from './pages/AdvertisePage';
import ReferProperty from './pages/ReferProperty';
import BecomeConsultant from './pages/BecomeConsultant';
import BrokerTools from './pages/BrokerTools';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ScrollToTop from './components/ScrollToTop';
import MobileNav from './components/MobileNav';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        {/* pb-24 adds space for the mobile bottom nav on small screens */}
        <main className="flex-grow pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<PropertiesPage />} />
            <Route path="/favoritos" element={<PropertiesPage favoritesOnly />} />
            <Route path="/anunciar" element={<AdvertisePage />} />
            <Route path="/indique" element={<ReferProperty />} />
            <Route path="/ferramentas" element={<BrokerTools />} />
            <Route path="/consultor" element={<BecomeConsultant />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/termos" element={<TermsOfUse />} />
          </Routes>
        </main>
        <Footer />
        {/* Mobile App-style Nav */}
        <MobileNav />
        <FloatingWhatsApp />
      </div>
    </Router>
  );
};

export default App;