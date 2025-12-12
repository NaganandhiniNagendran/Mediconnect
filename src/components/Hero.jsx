export default function Hero({ onStart }) {
  return (
    <section className="hero-section">
      <div className="section-container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              Healthcare,
              <span className="gradient-text"> Reimagined</span>
            </h1>
            <p className="hero-subtitle">
              Connect with qualified healthcare professionals from the comfort of your home. MediConnect brings telehealth to your fingertips with secure, reliable, and affordable medical consultations.
            </p>
            <div className="hero-buttons">
            <button className="btn-primary" onClick={onStart}>
              Start Your Consultation
            </button>
              <button className="btn-secondary">Watch Demo</button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Patients</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Doctors Online</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9/5</span>
                <span className="stat-label">App Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-image-container">
            <div className="image-overlay"></div>
            <div className="image-card">
              <img 
                src="https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg" 
                alt="Professional doctor with arms crossed" 
              />
              <div className="image-caption">
                <p className="caption-title">24/7 Online Consultation</p>
                <p className="caption-subtitle">Connect with certified doctors instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}