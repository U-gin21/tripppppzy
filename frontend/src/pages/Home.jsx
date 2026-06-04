import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import waterfall from '../assets/waterfall.png';
import guidImg from '../assets/guid.jpeg';


const slides = [
  {
    image: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80",
    badge: "🌴 AYUBOWAN - WELCOME TO SRI LANKA",
    headline: "Explore Sri Lanka's Natural Beauty",
    description: "Plan your complete itinerary with Tripzy. Secure offline payments, dynamic weather forecasts, certified local guides, and shared travel groups."
  },
  {
    image: waterfall,
    badge: "⛰️ ELLA HIGHLANDS - SCENIC VISTAS",
    headline: "Journey Through Misty Tea Fields & Waterfalls",
    description: "Connect with certified local guides for hikes on the famous Nine Arches Bridge, Ella Rock, and Adams Peak."
  },
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    badge: "🌊 SOUTHERN BEACHES - SUN & SURF",
    headline: "Relax Along Golden Tropical Shores",
    description: "Find travel companions, rent surfing gear, and secure beachfront resort bookings with easy offline payments."
  }
];

export default function Home({ onNavigate, currentUser }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const testimonials = [
    { name: "Sarah Miller", text: "The hotel booking and companion system was incredibly easy to use. Highly recommended for solo travelers!", location: "United Kingdom" },
    { name: "Suresh Perera", text: "Registered my vehicle hiring business on Tripzy. Within days, I had multiple bookings from international tourists.", location: "Colombo, Sri Lanka" },
    { name: "Max Dupont", text: "Weather predictions were 100% accurate. Saved us from a stormy hike in Ella! The companion matching details were super helpful.", location: "France" }
  ];

  const servicesList = [
    { title: "Hotel Reservation", icon: "bi-building", desc: "Find comfortable, luxury, or budget-friendly resorts and hotels across the country.", serviceType: 'hotel' },
    { title: "Vehicle Hiring", icon: "bi-car-front-fill", desc: "Rent cars, motorbikes, or tour vans with verified drivers for secure transportation.", serviceType: 'vehicle' },
    { title: "Tour Guide Booking", icon: "bi-compass-fill", desc: "Hire certified multilingual tour guides to explain the heritage sites.", serviceType: 'guide' },
    { title: "Camping Tools Rental", icon: "bi-backpack-fill", desc: "Rent high-quality tents, sleeping bags, and camping tools for wilderness treks.", serviceType: 'camping_tool' },
    { title: "Travel Companion Finder", icon: "bi-people", desc: "Create posts and join other tourists for shared trips, expenses, and local adventure.", serviceType: 'companions' }
  ];

  const handleServiceClick = (service) => {
    if (service.serviceType === 'companions') {
      onNavigate('companions');
      return;
    }

    if (currentUser && currentUser.user_type === 'tourist') {
      onNavigate('dashboard', { initialTab: 'services', serviceType: service.serviceType });
      return;
    }
    onNavigate('auth');
  };

  return (
    <div className="animate-fade-in">
      {/* HERO SECTION */}
      <section className="hero-section text-center d-flex align-items-center justify-content-center flex-column" style={{ minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>
        {/* Slideshow background layers */}
        {slides.map((slide, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.65), rgba(15, 23, 42, 0.35)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: idx === currentSlide ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: 0
            }}
          />
        ))}

        <div className="hero-gradient-overlay" style={{ zIndex: 1 }}></div>

        <div className="container position-relative z-3 text-white">
          <div key={currentSlide} className="d-flex flex-column align-items-center">
            <span className="badge bg-success rounded-pill px-3 py-2 mb-3 animate-text-reveal" style={{ animationDelay: '0ms', opacity: 0 }}>
              {slides[currentSlide].badge}
            </span>
            <h1 className="display-3 fw-bold text-white mb-3 animate-text-reveal" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)', animationDelay: '150ms', opacity: 0 }}>
              {slides[currentSlide].headline}
            </h1>
            <p className="lead text-white-50 col-md-8 mx-auto mb-4 animate-text-reveal" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.3)', animationDelay: '300ms', opacity: 0 }}>
              {slides[currentSlide].description}
            </p>
          </div>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-gradient btn-lg rounded-pill px-4" onClick={() => onNavigate('explore')}>
              Explore Destinations
            </button>
            <button className="btn btn-outline-light btn-lg rounded-pill px-4" onClick={() => onNavigate('companions')}>
              Find Travel Companions
            </button>
          </div>
        </div>

        {/* Slideshow indicators */}
        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-2" style={{ zIndex: 10 }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="rounded-circle border-0"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: idx === currentSlide ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            />
          ))}
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

      {/* SERVICE DIRECTORY (BENTO GRID) */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="text-success small fw-bold">OUR SERVICES</span>
            <h2 className="fw-bold text-gradient">Tourism Booking Modules</h2>
            <p className="text-muted col-md-6 mx-auto">Get connected with vetted local providers offering premium services across the country.</p>
          </div>

          <div className="bento-grid">
            {/* Hotel Reservation */}
            <div className="bento-item wide" onClick={() => handleServiceClick(servicesList[0])} style={{ cursor: 'pointer' }}>
              <div className="bento-img-wrapper">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" alt="Hotels" />
              </div>
              <div className="bento-overlay"></div>
              <div className="bento-content">
                <span className="badge bg-success rounded-pill px-3 py-2 mb-2 align-self-start" style={{ width: 'fit-content' }}>STAY</span>
                <h3 className="fw-bold mb-2">Hotel Reservations</h3>
                <p className="text-white-50 small mb-0">Handpicked luxury villas, beach resorts, and cozy boutique hotels across Sri Lanka.</p>
              </div>
            </div>

            {/* Vehicle Hiring */}
            <div className="bento-item medium" onClick={() => handleServiceClick(servicesList[1])} style={{ cursor: 'pointer' }}>
              <div className="bento-img-wrapper">
                <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80" alt="Vehicles" />
              </div>
              <div className="bento-overlay"></div>
              <div className="bento-content">
                <span className="badge bg-info rounded-pill px-3 py-2 mb-2" style={{ width: 'fit-content' }}>DRIVE</span>
                <h3 className="fw-bold mb-2">Vehicle Hiring</h3>
                <p className="text-white-50 small mb-0">Rent premium SUVs, comfortable vans, or local Tuk-Tuks with verified drivers.</p>
              </div>
            </div>

            {/* Tour Guides */}
            <div className="bento-item medium" onClick={() => handleServiceClick(servicesList[2])} style={{ cursor: 'pointer' }}>
              <div className="bento-img-wrapper">
                <img src={guidImg} alt="Guides" />
              </div>
              <div className="bento-overlay"></div>
              <div className="bento-content">
                <span className="badge bg-warning text-dark rounded-pill px-3 py-2 mb-2" style={{ width: 'fit-content' }}>GUIDE</span>
                <h3 className="fw-bold mb-2">Tour Guides</h3>
                <p className="text-white-50 small mb-0">Hire certified multilingual local guides to explain the heritage sites.</p>
              </div>
            </div>

            {/* Camping Tools Rental */}
            <div className="bento-item wide" onClick={() => handleServiceClick(servicesList[3])} style={{ cursor: 'pointer' }}>
              <div className="bento-img-wrapper">
                <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80" alt="Camping" />
              </div>
              <div className="bento-overlay"></div>
              <div className="bento-content d-flex flex-row justify-content-between align-items-end flex-wrap gap-3">
                <div style={{ flex: '1 1 300px' }}>
                  <span className="badge bg-danger rounded-pill px-3 py-2 mb-2" style={{ width: 'fit-content' }}>ADVENTURE</span>
                  <h3 className="fw-bold mb-2">Camping Tools Rental</h3>
                  <p className="text-white-50 small mb-0">Rent top-quality tents, backpacks, lighting, and sleeping bags for wilderness trails.</p>
                </div>
                <div className="d-flex gap-3 mb-1" style={{ zIndex: 10 }}>
                  <div className="bg-white bg-opacity-25 text-white px-3 py-2 rounded-4 text-center border border-white border-opacity-10" style={{ minWidth: '70px', backdropFilter: 'blur(5px)' }}>
                    <i className="bi bi-tent fs-5 d-block"></i>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Tents</span>
                  </div>
                  <div className="bg-white bg-opacity-25 text-white px-3 py-2 rounded-4 text-center border border-white border-opacity-10" style={{ minWidth: '70px', backdropFilter: 'blur(5px)' }}>
                    <i className="bi bi-lightbulb fs-5 d-block"></i>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Lighting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Companion Finder */}
            <div className="bento-item full" onClick={() => handleServiceClick(servicesList[4])} style={{ cursor: 'pointer' }}>
              <div className="bento-img-wrapper">
                <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80" alt="Companion" />
              </div>
              <div className="bento-overlay"></div>
              <div className="bento-content">
                <span className="badge bg-primary rounded-pill px-3 py-2 mb-2" style={{ width: 'fit-content' }}>SOCIAL</span>
                <h3 className="fw-bold mb-2">Travel Companion Finder</h3>
                <p className="text-white-50 small mb-0">Don't travel alone! Join verified trip groups, share expenses, and meet international friends to explore Sri Lanka's beauty together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 STEPS ROADMAP */}
      <section className="container py-5 my-3">
        <div className="text-center mb-5">
          <span className="text-success small fw-bold">EASY START</span>
          <h2 className="fw-bold text-gradient display-5">Start Your Adventure in 3 Steps</h2>
          <p className="text-muted col-md-6 mx-auto">Getting ready for your dream trip to the Pearl of the Indian Ocean is easier than ever.</p>
        </div>

        <div className="row g-4 text-center mt-2">
          <div className="col-md-4">
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 animate-float" style={{ width: '80px', height: '80px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                <i className="bi bi-person-badge-fill fs-2"></i>
              </div>
              <h5 className="fw-bold">1. Create a Profile</h5>
              <p className="text-muted small col-10 mx-auto">Tell us about your travel style, interests, and where you're from to help us tailor your experience.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 animate-float" style={{ width: '80px', height: '80px', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
                <i className="bi bi-people-fill fs-2"></i>
              </div>
              <h5 className="fw-bold">2. Book or Find Companions</h5>
              <p className="text-muted small col-10 mx-auto">Reserve luxury stays and vehicles, or browse our social feed to find the perfect travel buddy.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3 animate-float" style={{ width: '80px', height: '80px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                <i className="bi bi-compass-fill fs-2"></i>
              </div>
              <h5 className="fw-bold">3. Discover Sri Lanka</h5>
              <p className="text-muted small col-10 mx-auto">Embark on your journey with everything managed and your companions ready for an unforgettable time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <span className="text-primary small fw-bold">TRAVELERS' STORIES</span>
          <h2 className="fw-bold text-gradient display-5">What Our Travelers Say</h2>
          <p className="text-muted col-md-6 mx-auto">Real experiences from those who explored the wonder with us.</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="testimonial-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>
                </div>
                <p className="text-muted italic">"Tripzy made our honeymoon in Ella absolutely magical. The villa they recommended had the most breathtaking view of the Nine Arches Bridge!"</p>
              </div>
              <div className="d-flex align-items-center gap-3 mt-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Sarah Miller"
                  className="rounded-circle border border-2 border-emerald"
                  style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0">Sarah Miller</h6>
                  <span className="text-muted small text-secondary">London, UK</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="testimonial-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>
                </div>
                <p className="text-muted italic">"Professional from start to finish. The vehicle we rented was pristine and our driver knew all the best local spots for authentic Kottu!"</p>
              </div>
              <div className="d-flex align-items-center gap-3 mt-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="David Chen"
                  className="rounded-circle border border-2 border-emerald"
                  style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0">David Chen</h6>
                  <span className="text-muted small text-secondary">Singapore</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="testimonial-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="text-warning mb-3">
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>{' '}
                  <i className="bi bi-star-fill text-success"></i>
                </div>
                <p className="text-muted italic">"Renting camping gear through Tripzy for our trek in Yala was so easy. High-quality equipment that kept us safe and comfortable."</p>
              </div>
              <div className="d-flex align-items-center gap-3 mt-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Elena Rodriguez"
                  className="rounded-circle border border-2 border-emerald"
                  style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="fw-bold mb-0">Elena Rodriguez</h6>
                  <span className="text-muted small text-secondary">Madrid, Spain</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark text-white pt-5 pb-3">
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <img src={logo} alt="Tripzy Logo" style={{ height: '40px', width: 'auto' }} />
                <h4 className="fw-bold text-gradient mb-0">Tripzy Sri Lanka</h4>
              </div>
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
