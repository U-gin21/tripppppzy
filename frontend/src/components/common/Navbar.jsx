import React from 'react';
import { getUploadUrl } from '../../api';
import logo from '../../assets/logo.png';

export default function Navbar({ page, setPage, currentUser, handleLogout, setAuthMode }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
      <div className="container">
        <a className="navbar-brand fw-extrabold fs-3 text-gradient d-flex align-items-center gap-2" href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>
          <img src={logo} alt="Tripzy Logo" style={{ height: '35px', width: 'auto', objectFit: 'contain' }} /> Tripzy
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2">
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'home' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Home</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'explore' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('explore'); }}>Explore Destinations</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'companions' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('companions'); }}>Companion Finder</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'about' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('about'); }}>About Us</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'faqs' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('faqs'); }}>FAQs</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'contact' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setPage('contact'); }}>Contact Us</a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {currentUser ? (
              <div className="dropdown ms-2">
                <div 
                  className="rounded-circle border overflow-hidden bg-white shadow-sm" 
                  style={{ width: '38px', height: '38px', borderColor: '#e2e8f0', cursor: 'pointer' }} 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  title="User Panel"
                >
                  <img 
                    src={currentUser.profile_photo && currentUser.profile_photo !== 'default_profile.jpg'
                      ? getUploadUrl(currentUser.profile_photo)
                      : (currentUser.gender === 'female' 
                          ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                          : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80")}
                    alt={currentUser.full_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3" style={{ minWidth: '160px' }}>
                  <li>
                    <a className="dropdown-item fw-bold py-2 d-flex align-items-center gap-2" href="#" onClick={(e) => { e.preventDefault(); setPage('dashboard'); }}>
                      <i className="bi bi-speedometer2 text-primary"></i> Dashboard
                    </a>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <a className="dropdown-item text-danger fw-bold py-2 d-flex align-items-center gap-2" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                      <i className="bi bi-box-arrow-right text-danger"></i> Logout
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <button className="btn btn-outline-gradient btn-sm rounded-pill px-3 fw-bold" onClick={() => { setPage('auth'); setAuthMode('login'); }}>
                  Login
                </button>
                <button className="btn btn-gradient btn-sm rounded-pill px-3" onClick={() => { setPage('auth'); setAuthMode('register'); }}>
                  Register
                </button>
                <div className="rounded-circle border d-flex align-items-center justify-content-center bg-white shadow-sm ms-1" style={{ width: '38px', height: '38px', borderColor: '#e2e8f0', cursor: 'pointer' }} onClick={() => { setPage('auth'); setAuthMode('login'); }}>
                  <i className="bi bi-person text-secondary fs-5"></i>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
