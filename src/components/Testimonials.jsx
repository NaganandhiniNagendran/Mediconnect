export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'MediConnect saved me time and money. I got my prescription in 15 minutes without leaving home!',
      avatar: '👩‍⚕️',
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Healthcare Provider',
      content: 'An excellent platform for providing remote care. My patients appreciate the convenience and reliability.',
      avatar: '👨‍💼',
    },
    {
      name: 'Emma Davis',
      role: 'Patient',
      content: 'The interface is so user-friendly. I recommended it to all my friends and family members.',
      avatar: '👩‍🔬',
    },
  ];

  return (
    <section id="benefits" className="testimonials-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            Trusted by
            <span className="gradient-text"> Thousands</span>
          </h2>
          <p className="section-subtitle">
            Real stories from our community of patients and healthcare providers
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card"
            >
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {testimonial.avatar}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
              <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}