import React, { useState } from 'react';
import { apiRequest } from '../api';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('tourist'); // tourist, provider, admin
  const [fullName, setFullName] = useState('');
  const [nameWithInitial, setNameWithInitial] = useState('');
  const [nicPassport, setNicPassport] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Forgot / Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI States
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await apiRequest('auth', 'login', 'POST', {
        email: loginEmail,
        password: loginPassword
      });
      setMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 1000);
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    // Validate age
    const age = calculateAge(dob);
    if (age < 18) {
      setMsg({ type: 'danger', text: 'Registration restricted: You must be at least 18 years old.' });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('user_type', userType);
      formData.append('full_name', fullName);
      formData.append('name_with_initial', nameWithInitial);
      formData.append('nic_passport', nicPassport);
      formData.append('contact_no', contactNo);
      formData.append('gender', gender);
      formData.append('date_of_birth', dob);
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      const res = await apiRequest('auth', 'register', 'POST', formData);
      setMsg({ type: 'success', text: res.message + ' Please log in now.' });
      setTimeout(() => {
        setIsLogin(true);
        setMsg({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await apiRequest('auth', 'forgot_password', 'POST', { email: resetEmail });
      setMsg({ type: 'success', text: res.message });
      setResetMode(true);
      setForgotMode(false);
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await apiRequest('auth', 'reset_password', 'POST', {
        token: resetToken,
        password: newPassword
      });
      setMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setResetMode(false);
        setIsLogin(true);
        setMsg({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card glass-card p-4 border-0 shadow animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-gradient">Tripzy Sri Lanka</h2>
              <p className="text-muted">Smart Tourism Management & Booking System</p>
            </div>

            {msg.text && (
              <div className={`alert alert-${msg.type} text-center py-2`} role="alert">
                {msg.text}
              </div>
            )}

            {/* FORGOT PASSWORD SECTION */}
            {forgotMode && (
              <form onSubmit={handleForgotPassword}>
                <h4 className="fw-bold mb-3">Forgot Password</h4>
                <p className="text-muted small">Enter your registered email address and we'll send a 6-digit reset token to simulate with PHPMailer.</p>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control form-control-lg rounded-3"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 btn-lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Verification Token'}
                </button>
                <div className="text-center mt-3">
                  <button type="button" className="btn btn-link text-decoration-none small text-secondary" onClick={() => { setForgotMode(false); setIsLogin(true); }}>
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* RESET PASSWORD SECTION */}
            {resetMode && (
              <form onSubmit={handleResetPassword}>
                <h4 className="fw-bold mb-3">Reset Password</h4>
                <div className="mb-3">
                  <label className="form-label small fw-bold">6-Digit Verification Token</label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-3 text-center"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    placeholder="123456"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">New Secure Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg rounded-3"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 btn-lg" disabled={loading}>
                  {loading ? 'Resetting...' : 'Update Password'}
                </button>
              </form>
            )}

            {/* LOGIN FORM SECTION */}
            {isLogin && !forgotMode && !resetMode && (
              <form onSubmit={handleLogin}>
                <h4 className="fw-bold mb-3">Login to Tripzy</h4>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-bold">Password</label>
                    <button type="button" className="btn btn-link p-0 text-decoration-none small text-secondary" onClick={() => { setForgotMode(true); setIsLogin(false); }}>
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    className="form-control rounded-3"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                  />
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 fs-5 mt-2" disabled={loading}>
                  {loading ? 'Verifying...' : 'Login'}
                </button>
                <div className="text-center mt-3">
                  <span className="text-muted small">Don't have an account? </span>
                  <button type="button" className="btn btn-link p-0 text-decoration-none small fw-bold" onClick={() => setIsLogin(false)}>
                    Register
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM SECTION */}
            {!isLogin && !forgotMode && !resetMode && (
              <form onSubmit={handleRegister}>
                <h4 className="fw-bold mb-3">Create User Account</h4>
                
                <div className="mb-3">
                  <label className="form-label small fw-bold">I want to register as a:</label>
                  <select className="form-select rounded-3" value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="tourist">Tourist (Direct Active Access)</option>
                    <option value="provider">Service Provider (Requires Verification)</option>
                    <option value="admin">Site Administrator (Pending Admin Review)</option>
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Name with Initials</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={nameWithInitial}
                      onChange={(e) => setNameWithInitial(e.target.value)}
                      required
                      placeholder="J. Doe"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">NIC or Passport No</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={nicPassport}
                      onChange={(e) => setNicPassport(e.target.value)}
                      required
                      placeholder="991234567V"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Contact Number</label>
                    <input
                      type="tel"
                      className="form-control rounded-3"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      required
                      placeholder="0771234567"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Gender</label>
                    <select className="form-select rounded-3" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Email Address (One-time registration)</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Secure Password</label>
                  <input
                    type="password"
                    className="form-control rounded-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Profile Picture</label>
                  <input
                    type="file"
                    className="form-control rounded-3"
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files[0])}
                  />
                </div>

                <button type="submit" className="btn btn-gradient w-100 py-2 fs-5 mt-2" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register'}
                </button>

                <div className="text-center mt-3">
                  <span className="text-muted small">Already have an account? </span>
                  <button type="button" className="btn btn-link p-0 text-decoration-none small fw-bold" onClick={() => setIsLogin(true)}>
                    Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
