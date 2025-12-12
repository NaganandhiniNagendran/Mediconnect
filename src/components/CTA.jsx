export default function CTA({ onGetStarted }) {
  return (
    <section className="cta-section">
      <div className="section-container">
        <div className="cta-container">
          <h2 className="cta-title">
            Ready to Experience Better Healthcare?
          </h2>
          <p className="cta-subtitle">
            Join thousands of patients already using MediConnect for convenient, quality healthcare
          </p>
          <div className="cta-buttons">
          <button className="cta-button-primary" onClick={onGetStarted}>
              Get Started Free
            </button>
            <button className="cta-button-secondary">
              Schedule Demo
            </button>
          </div>
          <p className="cta-note">
            No credit card required. Start your first consultation today.
          </p>
        </div>
      </div>
    </section>
  );
}