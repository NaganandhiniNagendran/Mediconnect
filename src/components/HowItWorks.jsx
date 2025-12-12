export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Sign up and complete your medical history in just 2 minutes',
    },
    {
      number: '02',
      title: 'Choose Your Doctor',
      description: 'Browse and select from our network of qualified healthcare professionals',
    },
    {
      number: '03',
      title: 'Video Consultation',
      description: 'Connect via secure video call at your scheduled time',
    },
    {
      number: '04',
      title: 'Get Prescription',
      description: 'Receive treatment plans and prescriptions digitally',
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            Simple Process,
            <span className="gradient-text"> Better Results</span>
          </h2>
          <p className="section-subtitle">
            Get quality healthcare in four simple steps
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="step-card">
                <div className="step-number">
                  {step.number}
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}