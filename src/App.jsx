import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import LoginPage from './pages/Login';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  if (showLogin) {
    return <LoginPage onBack={closeLogin} />;
  }

  return (
    <div className="app-container">
      <Header onSignIn={openLogin} onGetStarted={openLogin} />
      <Hero onStart={openLogin} />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA onGetStarted={openLogin} />
      <Footer />
    </div>
  );
}