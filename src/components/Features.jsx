export default function Features() {
  const features = [
    {
      icon: '🏥',
      title: 'Licensed Doctors',
      description: 'Consult with board-certified healthcare professionals available 24/7',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'End-to-end encryption ensures your medical data stays confidential',
    },
    {
      icon: '⏱️',
      title: 'Quick Appointments',
      description: 'Get connected with a doctor in minutes, not days',
    },
    {
      icon: '💊',
      title: 'Prescriptions',
      description: 'Receive digital prescriptions directly to your pharmacy',
    },
    {
      icon: '📱',
      title: 'Easy Access',
      description: 'Access from any device, anytime, anywhere',
    },
    {
      icon: '💰',
      title: 'Affordable',
      description: 'Quality healthcare at a fraction of traditional costs',
    },
  ];

  return (
    <section id="features" className="features-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            Why Choose <span className="gradient-text">MediConnect?</span>
          </h2>
          <p className="section-subtitle">
            We combine cutting-edge technology with compassionate healthcare to deliver the best telemedicine experience
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}