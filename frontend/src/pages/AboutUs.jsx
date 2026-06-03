import React from 'react';

export default function AboutUs() {
  return (
    <div className="container py-5 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-gradient display-4">About Tripzy Sri Lanka</h1>
        <p className="lead text-muted col-lg-8 mx-auto">
          We are dedicated to bringing the pearl of the Indian Ocean closer to your fingertips through a centralized, intelligent, and seamless booking experience.
        </p>
      </div>

      {/* Visual / Introduction */}
      <div className="row align-items-center mb-5 g-5">
        <div className="col-lg-6">
          <img 
            src="https://images.unsplash.com/photo-1544085311-11a028465b53?auto=format&fit=crop&w=800&q=80" 
            alt="Beautiful Sri Lanka Ella" 
            className="img-fluid rounded-4 shadow animate-float"
          />
        </div>
        <div className="col-lg-6">
          <h2 className="fw-bold mb-3 text-gradient">Smart Travel Redefined</h2>
          <p className="text-muted">
            Tripzy is a state-of-the-art travel assistant portal designed to satisfy every aspect of Sri Lankan tourism. Whether you want to explore ancient ruins, hike through misty tea fields, surf on tropical beaches, or camp in deep wildlife reserves, we coordinate it all under one dashboard.
          </p>
          <p className="text-muted">
            We empower local hospitality and travel companies (Hotel Providers, Vehicle Renters, Local Tour Guides, and Camping Gear Providers) by offering them a direct channel to connect with global and local tourists. Our core mission is to promote sustainable, easy, and affordable travel across Sri Lanka.
          </p>
          <div className="row g-3 mt-2">
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-4"></i>
                <span className="fw-bold">100% Secure Auth</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-4"></i>
                <span className="fw-bold">Dynamic Weather Sync</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-4"></i>
                <span className="fw-bold">Verified Service Providers</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-4"></i>
                <span className="fw-bold">Companion Matcher</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="row g-4 text-center">
        <div className="col-md-4">
          <div className="card glass-card h-100 p-4 border-0">
            <i className="bi bi-shield-fill-check fs-1 text-primary mb-3"></i>
            <h4 className="fw-bold">Trust & Integrity</h4>
            <p className="text-muted small mb-0">Every provider registration goes through an admin vetting phase to ensure tourists enjoy secure and top-tier services.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card glass-card h-100 p-4 border-0">
            <i className="bi bi-people-fill fs-1 text-success mb-3"></i>
            <h4 className="fw-bold">Community Driven</h4>
            <p className="text-muted small mb-0">Our unique Companion Finder builds community travel groups, making expensive tours highly accessible through budget-sharing.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card glass-card h-100 p-4 border-0">
            <i className="bi bi-activity fs-1 text-info mb-3"></i>
            <h4 className="fw-bold">Real-time Intellgence</h4>
            <p className="text-muted small mb-0">With live weather integration and 7-day prediction models, plan your routes wisely to avoid sudden monsoons.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
