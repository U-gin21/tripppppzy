import { useEffect, useState } from 'react';
import { authService } from './services/authService';
import logo from './assets/logo.png';
import Home from './pages/public/Home/Home';
import Explore from './pages/public/Explore/Explore';
import AboutUs from './pages/public/AboutUs/AboutUs';
import ContactUs from './pages/public/ContactUs/ContactUs';
import FAQs from './pages/public/FAQs/FAQs';
import CompanionFinder from './pages/public/CompanionFinder/CompanionFinder';
import Auth from './pages/public/Auth/Auth';
import TouristDashboard from './pages/tourist/TouristDashboard/TouristDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard/ProviderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import Navbar from './components/common/Navbar';
import ToastSystem from './components/common/ToastSystem';
import CustomModal from './components/common/CustomModal';

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
      const timer = setTimeout(() => {
        if (currentUser.user_type === 'tourist') {
          setActiveTab('bookings');
        } else if (currentUser.user_type === 'provider') {
          setActiveTab('listings');
        } else if (currentUser.user_type === 'admin') {
          setActiveTab('stats');
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const checkSession = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
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
            await authService.logout();
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
      const timer = setTimeout(() => {
        setDashboardIntent(null);
      }, 0);
      return () => clearTimeout(timer);
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
      await authService.logout();
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
      <Navbar
        page={page}
        setPage={setPage}
        currentUser={currentUser}
        handleLogout={handleLogout}
        setAuthMode={setAuthMode}
      />

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
      <ToastSystem
        toasts={toasts}
        onCloseToast={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* CUSTOM UNIFIED MODAL (ALERT & CONFIRM) */}
      <CustomModal modalState={modalState} />

    </div>
  );
}
