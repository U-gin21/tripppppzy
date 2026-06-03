import { useEffect, useState } from 'react';
import { apiRequest } from './api';
import Home from './pages/Home';
import Explore from './pages/Explore';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import FAQs from './pages/FAQs';
import CompanionFinder from './pages/CompanionFinder';
import Auth from './pages/Auth';
import TouristDashboard from './pages/TouristDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardIntent, setDashboardIntent] = useState(null);

  const checkSession = async () => {
    try {
      const res = await apiRequest('auth', 'me');
      if (res.success && res.user) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      console.log('No active session:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check active session on startup
  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (page !== 'dashboard') {
      setDashboardIntent(null);
    }
  }, [page]);

  const navigate = (target, options = {}) => {
    if (target === 'dashboard') {
      setDashboardIntent(options);
    }
    setPage(target);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    try {
      await apiRequest('auth', 'logout', 'POST');
      setCurrentUser(null);
      setPage('home');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading Tripzy...</span>
          </div>
          <h5 className="fw-bold text-gradient">Tripzy Sri Lanka</h5>
          <p className="text-muted small">Loading platform settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* GLOBAL NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
        <div className="container">
          <a className="navbar-brand fw-extrabold fs-3 text-gradient d-flex align-items-center gap-2" href="#" onClick={() => setPage('home')}>
            <i className="bi bi-compass-fill"></i> Tripzy
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2">
              <li className="nav-item">
                <a className={`nav-link nav-link-custom ${page === 'home' ? 'active' : ''}`} href="#" onClick={() => setPage('home')}>Home</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link nav-link-custom ${page === 'explore' ? 'active' : ''}`} href="#" onClick={() => setPage('explore')}>Explore Destinations</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link nav-link-custom ${page === 'companions' ? 'active' : ''}`} href="#" onClick={() => setPage('companions')}>Companion Finder</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link nav-link-custom ${page === 'about' ? 'active' : ''}`} href="#" onClick={() => setPage('about')}>About Us</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link nav-link-custom ${page === 'faqs' ? 'active' : ''}`} href="#" onClick={() => setPage('faqs')}>FAQs</a>
              </li>
              <li className="nav-item">
                <a className={`nav-link nav-link-custom ${page === 'contact' ? 'active' : ''}`} href="#" onClick={() => setPage('contact')}>Contact Us</a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              {currentUser ? (
                <>
                  <button className="btn btn-outline-gradient btn-sm rounded-pill px-3" onClick={() => setPage('dashboard')}>
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </button>
                  <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </>
              ) : (
                <button className="btn btn-gradient btn-sm rounded-pill px-4" onClick={() => setPage('auth')}>
                  <i className="bi bi-person-fill me-1"></i> Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* RENDER ACTIVE SCREEN */}
      <main style={{ minHeight: '80vh' }}>
        {page === 'home' && <Home onNavigate={navigate} currentUser={currentUser} />}
        {page === 'explore' && <Explore />}
        {page === 'companions' && <CompanionFinder currentUser={currentUser} />}
        {page === 'about' && <AboutUs />}
        {page === 'faqs' && <FAQs />}
        {page === 'contact' && <ContactUs />}
        {page === 'auth' && (
          <Auth onLoginSuccess={(user) => { setCurrentUser(user); setPage('dashboard'); }} />
        )}
        {page === 'dashboard' && currentUser && (
          <>
            {currentUser.user_type === 'tourist' && (
              <TouristDashboard
                currentUser={currentUser}
                onProfileUpdate={setCurrentUser}
                initialTab={dashboardIntent?.initialTab}
                initialServiceType={dashboardIntent?.serviceType}
              />
            )}
            {currentUser.user_type === 'provider' && (
              <ProviderDashboard currentUser={currentUser} onProfileUpdate={setCurrentUser} />
            )}
            {currentUser.user_type === 'admin' && (
              <AdminDashboard currentUser={currentUser} onProfileUpdate={setCurrentUser} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
