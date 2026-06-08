import { useEffect, useState } from 'react';
import { apiRequest, getUploadUrl } from './api';
import logo from './assets/logo.png';
import Home from './pages/public/Home';
import Explore from './pages/public/Explore';
import AboutUs from './pages/public/AboutUs';
import ContactUs from './pages/public/ContactUs';
import FAQs from './pages/public/FAQs';
import CompanionFinder from './pages/public/CompanionFinder';
import Auth from './pages/public/Auth';
import TouristDashboard from './pages/tourist/TouristDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardIntent, setDashboardIntent] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('bookings');
  const [toasts, setToasts] = useState([]);
  const [modalState, setModalState] = useState({
    show: false,
    type: 'confirm', // 'alert' or 'confirm'
    severity: 'warning', // 'info', 'success', 'error', 'warning'
    title: 'Confirm Action',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const showConfirm = (message, onConfirm, title = 'Confirm Action') => {
    setModalState({
      show: true,
      type: 'confirm',
      severity: 'warning',
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setModalState(prev => ({ ...prev, show: false }));
      },
      onCancel: () => {
        setModalState(prev => ({ ...prev, show: false }));
      }
    });
  };

  const showAlert = (message, title = 'Notification', severity = 'info') => {
    setModalState({
      show: true,
      type: 'alert',
      severity,
      title,
      message,
      onConfirm: () => {
        setModalState(prev => ({ ...prev, show: false }));
      },
      onCancel: null
    });
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    window.showToast = showToast;
    window.alert = (message) => {
      let severity = 'info';
      let title = 'Notification';
      const lower = String(message).toLowerCase();
      if (
        lower.includes('success') ||
        lower.includes('approve') ||
        lower.includes('accept') ||
        lower.includes('verify') ||
        lower.includes('thank you') ||
        lower.includes('created') ||
        lower.includes('published')
      ) {
        severity = 'success';
        title = 'Success';
      } else if (
        lower.includes('error') ||
        lower.includes('fail') ||
        lower.includes('invalid') ||
        lower.includes('wrong') ||
        lower.includes('not allow') ||
        lower.includes('cannot') ||
        lower.includes('overlap') ||
        lower.includes('already booked') ||
        lower.includes('decline') ||
        lower.includes('reject')
      ) {
        severity = 'error';
        title = 'Error';
      } else if (
        lower.includes('warning') ||
        lower.includes('attention') ||
        lower.includes('sure') ||
        lower.includes('delete') ||
        lower.includes('cancel') ||
        lower.includes('close')
      ) {
        severity = 'warning';
        title = 'Warning';
      }
      showAlert(message, title, severity);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.user_type === 'tourist') {
        setActiveTab('bookings');
      } else if (currentUser.user_type === 'provider') {
        setActiveTab('listings');
      } else if (currentUser.user_type === 'admin') {
        setActiveTab('stats');
      }
    }
  }, [currentUser]);

  const checkSession = async () => {
    try {
      const res = await apiRequest('auth', 'me');
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('tripzy_logged_in', 'true');
        sessionStorage.setItem('tripzy_session_active', 'true');
      } else {
        localStorage.removeItem('tripzy_logged_in');
      }
    } catch (err) {
      console.log('No active session:', err.message);
      localStorage.removeItem('tripzy_logged_in');
    } finally {
      setLoading(false);
    }
  };

  // Check active session on startup with tab/browser closure detection
  useEffect(() => {
    const initSession = async () => {
      const loggedIn = localStorage.getItem('tripzy_logged_in');
      const sessionActive = sessionStorage.getItem('tripzy_session_active');

      if (loggedIn === 'true') {
        if (sessionActive === 'true') {
          await checkSession();
        } else {
          // User opened a new tab or restarted browser, clear old server session
          try {
            await apiRequest('auth', 'logout', 'POST');
          } catch (err) {
            console.log('Error clearing session:', err.message);
          }
          localStorage.removeItem('tripzy_logged_in');
          sessionStorage.setItem('tripzy_session_active', 'true');
          setLoading(false);
        }
      } else {
        sessionStorage.setItem('tripzy_session_active', 'true');
        setLoading(false);
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    if (page !== 'dashboard') {
      setDashboardIntent(null);
    }
  }, [page]);

  const navigate = (target, options = {}) => {
    if (target === 'dashboard') {
      setDashboardIntent(options);
      if (options.initialTab) {
        setActiveTab(options.initialTab);
      }
    }
    setPage(target);
  };

  const performLogout = async () => {
    try {
      await apiRequest('auth', 'logout', 'POST');
      localStorage.removeItem('tripzy_logged_in');
      sessionStorage.removeItem('tripzy_session_active');
      setCurrentUser(null);
      setPage('home');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    showConfirm("Are you sure you want to log out?", performLogout, "Confirm Logout");
  };



  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <img src={logo} alt="Tripzy Logo" className="animate-float mb-3" style={{ height: '80px', width: 'auto' }} />
          <div className="spinner-border d-block mx-auto mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem', color: 'var(--primary-color)' }}>
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
            <img src={logo} alt="Tripzy Logo" style={{ height: '35px', width: 'auto', objectFit: 'contain' }} /> Tripzy
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

      {/* RENDER ACTIVE SCREEN */}
      <main style={{ minHeight: '80vh' }}>
        {page === 'home' && <Home onNavigate={navigate} currentUser={currentUser} />}
        {page === 'explore' && <Explore />}
        {page === 'companions' && <CompanionFinder currentUser={currentUser} onNavigate={navigate} />}
        {page === 'about' && <AboutUs />}
        {page === 'faqs' && <FAQs />}
        {page === 'contact' && <ContactUs />}
        {page === 'auth' && (
          <Auth 
            initialMode={authMode} 
            onLoginSuccess={(user) => { 
              localStorage.setItem('tripzy_logged_in', 'true'); 
              sessionStorage.setItem('tripzy_session_active', 'true'); 
              setCurrentUser(user); 
              setPage('dashboard'); 
            }} 
          />
        )}
        {page === 'dashboard' && currentUser && (
          <>
            {currentUser.user_type === 'tourist' && (
              <TouristDashboard
                currentUser={currentUser}
                onProfileUpdate={setCurrentUser}
                initialServiceType={dashboardIntent?.serviceType}
                onLogout={handleLogout}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showConfirm={showConfirm}
              />
            )}
            {currentUser.user_type === 'provider' && (
              <ProviderDashboard 
                currentUser={currentUser} 
                onProfileUpdate={setCurrentUser} 
                onLogout={handleLogout} 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showConfirm={showConfirm}
              />
            )}
            {currentUser.user_type === 'admin' && (
              <AdminDashboard 
                currentUser={currentUser} 
                onProfileUpdate={setCurrentUser} 
                onLogout={handleLogout} 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showConfirm={showConfirm}
              />
            )}
          </>
        )}
      </main>

      {/* GLOBAL TOAST SYSTEM */}
      <div className="toast-container-custom">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-custom toast-${t.type} animate-slide-in`}>
            <div className="toast-icon">
              {t.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
              {t.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
              {t.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
              {t.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
            </div>
            <div className="toast-content">
              <span className="toast-message">{t.message}</span>
            </div>
            <button 
              className="toast-close-btn" 
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        ))}
      </div>

      {/* CUSTOM UNIFIED MODAL (ALERT & CONFIRM) */}
      {modalState.show && (
        <div className="custom-modal-backdrop animate-fade-in" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 25, 44, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div className="card glass-card p-4 text-center shadow-lg border border-light animate-slide-in" style={{
            maxWidth: '400px',
            width: '90%',
            background: 'var(--glass-bg)',
            borderRadius: '24px'
          }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{
              width: '60px',
              height: '60px',
              background: modalState.severity === 'success' ? 'rgba(0, 154, 167, 0.1)' :
                          modalState.severity === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                          modalState.severity === 'warning' ? 'rgba(255, 159, 28, 0.1)' :
                          'rgba(12, 50, 84, 0.1)',
              color: modalState.severity === 'success' ? 'var(--primary-color)' :
                     modalState.severity === 'error' ? '#ef4444' :
                     modalState.severity === 'warning' ? 'var(--accent-color)' :
                     'var(--secondary-color)'
            }}>
              {modalState.severity === 'success' && <i className="bi bi-check-circle fs-3"></i>}
              {modalState.severity === 'error' && <i className="bi bi-x-circle fs-3"></i>}
              {modalState.severity === 'warning' && <i className="bi bi-exclamation-triangle fs-3"></i>}
              {modalState.severity === 'info' && <i className="bi bi-info-circle fs-3"></i>}
            </div>
            <h4 className="fw-bold mb-2 text-gradient">{modalState.title}</h4>
            <p className="text-muted small mb-4">{modalState.message}</p>
            <div className="d-flex gap-2">
              {modalState.type === 'confirm' && (
                <button 
                  className="btn btn-light rounded-pill flex-grow-1 py-2 fw-semibold" 
                  onClick={modalState.onCancel}
                >
                  Cancel
                </button>
              )}
              <button 
                className="btn btn-gradient rounded-pill flex-grow-1 py-2 fw-semibold" 
                onClick={modalState.onConfirm}
              >
                {modalState.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
