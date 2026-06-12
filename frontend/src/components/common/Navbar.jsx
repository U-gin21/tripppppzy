import React from 'react';
import { getUploadUrl } from '../../api';
import logo from '../../assets/logo.png';

export default function Navbar({ page, setPage, currentUser, handleLogout, setAuthMode }) {
  const closeNavbar = () => {
    const navbar = document.getElementById('navbarNav');
    if (navbar && navbar.classList.contains('show')) {
      if (window.bootstrap && window.bootstrap.Collapse) {
        try {
          const bsCollapse = window.bootstrap.Collapse.getInstance(navbar) || new window.bootstrap.Collapse(navbar, { toggle: false });
          bsCollapse.hide();
        } catch (e) {
          navbar.classList.remove('show');
        }
      } else {
        navbar.classList.remove('show');
      }
    }
  };

  const handleNavClick = (targetPage, e) => {
    if (e) e.preventDefault();
    setPage(targetPage);
    closeNavbar();
  };

  const handleAuthClick = (mode) => {
    setPage('auth');
    setAuthMode(mode);
    closeNavbar();
  };

  const handleLogoutClick = (e) => {
    if (e) e.preventDefault();
    handleLogout();
    closeNavbar();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
      <div className="container">
        <a 
          className="navbar-brand fw-extrabold fs-3 text-gradient d-flex align-items-center gap-2" 
          href="#" 
          onClick={(e) => handleNavClick('home', e)}
        >
          <img src={logo} alt="Tripzy Logo" style={{ height: '35px', width: 'auto', objectFit: 'contain' }} /> Tripzy
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2">
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'home' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('home', e)}>Home</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'explore' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('explore', e)}>Explore Destinations</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'companions' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('companions', e)}>Companion Finder</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'about' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('about', e)}>About Us</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'faqs' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('faqs', e)}>FAQs</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link nav-link-custom ${page === 'contact' ? 'active' : ''}`} href="#" onClick={(e) => handleNavClick('contact', e)}>Contact Us</a>
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
                    <a className="dropdown-item fw-bold py-2 d-flex align-items-center gap-2" href="#" onClick={(e) => handleNavClick('dashboard', e)}>
                      <i className="bi bi-speedometer2 text-primary"></i> Dashboard
                    </a>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <a className="dropdown-item text-danger fw-bold py-2 d-flex align-items-center gap-2" href="#" onClick={(e) => handleLogoutClick(e)}>
                      <i className="bi bi-box-arrow-right text-danger"></i> Logout
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <button className="btn btn-outline-gradient btn-sm rounded-pill px-3 fw-bold" onClick={() => handleAuthClick('login')}>
                  Login
                </button>
                <button className="btn btn-gradient btn-sm rounded-pill px-3" onClick={() => handleAuthClick('register')}>
                  Register
                </button>
                <div 
                  className="rounded-circle border d-flex align-items-center justify-content-center bg-white shadow-sm ms-1" 
                  style={{ width: '38px', height: '38px', borderColor: '#e2e8f0', cursor: 'pointer' }} 
                  onClick={() => handleAuthClick('login')}
                >
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
