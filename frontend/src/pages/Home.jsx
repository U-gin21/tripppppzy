import React from 'react';

export default function Home({ onNavigate }) {
  const testimonials = [
    { name: "Sarah Miller", text: "The hotel booking and companion system was incredibly easy to use. Highly recommended for solo travelers!", location: "United Kingdom" },
    { name: "Suresh Perera", text: "Registered my vehicle hiring business on Tripzy. Within days, I had multiple bookings from international tourists.", location: "Colombo, Sri Lanka" },
    { name: "Max Dupont", text: "Weather predictions were 100% accurate. Saved us from a stormy hike in Ella! The companion matching details were super helpful.", location: "France" }
  ];

  const servicesList = [
    { title: "Hotel Reservation", icon: "bi-building", desc: "Find comfortable, luxury, or budget-friendly resorts and hotels across the country." },
    { title: "Vehicle Hiring", icon: "bi-car-front-fill", desc: "Rent cars, motorbikes, or tour vans with verified drivers for secure transportation." },
    { title: "Tour Guide Booking", icon: "bi-compass-fill", desc: "Hire certified multilingual tour guides to explain the heritage sites." },
    { title: "Camping Tools Rental", icon: "bi-backpack-fill", desc: "Rent high-quality tents, sleeping bags, and camping tools for wilderness treks." }
  ];

  return (
    <div className="animate-fade-in">
      {/* HERO SECTION */}
      <section className="hero-section text-center py-5 d-flex align-items-center justify-content-center flex-column" style={{ minHeight: '65vh' }}>
        <div className="hero-gradient-overlay"></div>
        <div className="container position-relative z-1">
          <span className="badge bg-success rounded-pill px-3 py-2 mb-3">🌴 AYUBOWAN - WELCOME TO SRI LANKA</span>
          <h1 className="display-3 fw-bold text-white mb-3">Explore Sri Lanka's Natural Beauty</h1>
          <p className="lead text-white-50 col-md-8 mx-auto mb-4">
            Plan your complete itinerary with Tripzy. Secure offline payments, dynamic weather forecasts, certified local guides, and shared travel groups.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-gradient btn-lg rounded-pill px-4" onClick={() => onNavigate('explore')}>
              Explore Destinations
            </button>
            <button className="btn btn-outline-light btn-lg rounded-pill px-4" onClick={() => onNavigate('companions')}>
              Find Travel Companions
            </button>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="text-primary small fw-bold"><i className="bi bi-info-circle-fill"></i> SMART TOURISM MANAGEMENT</span>
            <h2 className="fw-bold text-gradient mt-2 mb-3">Why Travel in Sri Lanka with Tripzy?</h2>
            <p className="text-muted">
              Sri Lanka is a tropical paradise, renowned for pristine beaches, ancient cities, tea plantations, and dense safari forests. Tripzy organizes multiple tourism services into one centralized hub, enabling tourists to plan and book their trips with absolute peace of mind.
            </p>
            <p className="text-muted">
              Our unique system operates an **Offline Payment Model** where you confirm your reservations online and pay physically to the service providers upon arrival. No credit card information is collected, keeping transactions risk-free.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="row g-4">
              <div className="col-sm-6">
                <div className="card glass-card border-0 p-4 shadow-sm text-center">
                  <h3 className="fw-bold text-success mb-1">100%</h3>
                  <span className="text-muted small">Risk-Free Offline Cash Payments</span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="card glass-card border-0 p-4 shadow-sm text-center">
                  <h3 className="fw-bold text-primary mb-1">Live</h3>
                  <span className="text-muted small">7-Day Weather Forecasting</span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="card glass-card border-0 p-4 shadow-sm text-center">
                  <h3 className="fw-bold text-info mb-1">Social</h3>
                  <span className="text-muted small">Travel Companion Finder</span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="card glass-card border-0 p-4 shadow-sm text-center">
                  <h3 className="fw-bold text-warning mb-1">Vetted</h3>
                  <span className="text-muted small">Local Service Providers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE DIRECTORY */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-success small fw-bold">OUR SERVICES</span>
            <h2 className="fw-bold text-gradient">Tourism Booking Modules</h2>
            <p className="text-muted col-md-6 mx-auto">Get connected with vetted local providers offering premium services across the country.</p>
          </div>

          <div className="row g-4">
            {servicesList.map((srv, index) => (
              <div className="col-md-6 col-lg-3" key={index}>
                <div className="card border-0 p-4 rounded-4 shadow-sm text-center h-100 bg-white">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className={`bi ${srv.icon} fs-3`}></i>
                  </div>
                  <h5 className="fw-bold">{srv.title}</h5>
                  <p className="text-muted small mb-0">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <span className="text-primary small fw-bold">FEEDBACK</span>
          <h2 className="fw-bold text-gradient">What Our Travelers Say</h2>
        </div>

        <div className="row g-4">
          {testimonials.map((test, index) => (
            <div className="col-md-4" key={index}>
              <div className="testimonial-card h-100 d-flex flex-column justify-content-between">
                <p className="text-muted italic">"{test.text}"</p>
                <div>
                  <h6 className="fw-bold mb-0">{test.name}</h6>
                  <span className="text-muted small">{test.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark text-white pt-5 pb-3">
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <h4 className="fw-bold text-gradient">Tripzy Sri Lanka</h4>
              <p className="text-muted small mt-2">
                A centralized digital tourism management and booking ecosystem designed to boost local entrepreneurship and traveler safety in Sri Lanka.
              </p>
            </div>
            <div className="col-md-4 col-lg-3 offset-lg-1">
              <h6 className="fw-bold text-white mb-3">Quick Navigation</h6>
              <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                <li><a href="#" className="text-muted text-decoration-none" onClick={() => onNavigate('home')}>Home</a></li>
                <li><a href="#" className="text-muted text-decoration-none" onClick={() => onNavigate('explore')}>Explore Destinations</a></li>
                <li><a href="#" className="text-muted text-decoration-none" onClick={() => onNavigate('companions')}>Companion Finder</a></li>
                <li><a href="#" className="text-muted text-decoration-none" onClick={() => onNavigate('faqs')}>FAQs</a></li>
              </ul>
            </div>
            <div className="col-md-4 col-lg-4">
              <h6 className="fw-bold text-white mb-3">Newsletter</h6>
              <p className="text-muted small">Subscribe to get notifications on seasonal Sri Lankan festivals and hotel promotions.</p>
              <div className="input-group">
                <input type="email" className="form-control" placeholder="Email Address" />
                <button className="btn btn-gradient btn-sm">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="border-top border-secondary pt-3 text-center text-muted small">
            <p className="mb-0">&copy; {new Date().getFullYear()} Tripzy Sri Lanka (Smart Tourism System). All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
