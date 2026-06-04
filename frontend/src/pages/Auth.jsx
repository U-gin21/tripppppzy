import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import logo from '../assets/logo.png';

export default function Auth({ onLoginSuccess, initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('tourist'); // tourist, provider, admin
  const [fullName, setFullName] = useState('');
  const [nicPassport, setNicPassport] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Forgot / Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyMode, setVerifyMode] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // UI States
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setForgotMode(false);
    setResetMode(false);
    setVerifyMode(false);
  }, [initialMode]);

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

    if (password !== confirmPassword) {
      setMsg({ type: 'danger', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    if (!gender) {
      setMsg({ type: 'danger', text: 'Please select your gender.' });
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setMsg({ type: 'danger', text: 'You must agree to the Terms of Service & Privacy Policy.' });
      setLoading(false);
      return;
    }

    // Validate age
    const age = calculateAge(dob);
    if (age < 18) {
      setMsg({ type: 'danger', text: 'Registration restricted: You must be at least 18 years old.' });
      setLoading(false);
      return;
    }

    // Auto-generate name_with_initial from full_name
    let generatedInitials = '';
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length > 1) {
      generatedInitials = nameParts.slice(0, -1).map(p => p[0].toUpperCase() + '.').join(' ') + ' ' + nameParts[nameParts.length - 1];
    } else {
      generatedInitials = fullName;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('user_type', userType);
      formData.append('full_name', fullName);
      formData.append('name_with_initial', generatedInitials);
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
      setVerifyMode(true);
      setForgotMode(false);
      setResetMode(false);
      setOtpVerified(false);
      setResetToken('');
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await apiRequest('auth', 'verify_reset_token', 'POST', { token: resetToken });
      setMsg({ type: 'success', text: res.message });
      setVerifyMode(false);
      setResetMode(true);
      setOtpVerified(true);
      setResetToken('');
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
      if (!otpVerified) {
        throw new Error('Please verify your OTP before resetting your password.');
      }
      const res = await apiRequest('auth', 'reset_password', 'POST', {
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
    <div className="auth-page-container py-5 px-3">
      {/* Decorative Background Blobs */}
      <div className="auth-bg-blob-1"></div>
      <div className="auth-bg-blob-2"></div>

      <div className="container my-auto">
        <div className="row justify-content-center">
          <div className={isLogin || forgotMode || resetMode || verifyMode ? "col-12 col-md-6 col-lg-5" : "col-12 col-lg-9 col-xl-8"}>
            <div className="card auth-form-card p-4 p-md-5 border-0 animate-fade-in">
              
              {msg.text && (
                <div className={`alert alert-${msg.type} text-center py-2 mb-4`} role="alert" style={{ fontSize: '14px' }}>
                  {msg.text}
                </div>
              )}

              {/* FORGOT PASSWORD SECTION */}
              {forgotMode && (
                <form onSubmit={handleForgotPassword}>
                  <div className="text-center mb-5">
                    <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Forgot Password</h2>
                    <p className="text-muted">Enter the email address used for your Tripzy login.</p>
                  </div>
                  
                  <p className="text-muted small mb-4">We will send a 6-digit OTP to that same email so you can verify and reset your password.</p>
                  
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary mb-2">Email Address</label>
                    <div className="custom-input-group">
                      <span className="input-icon">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        placeholder="Enter registered email address"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" style={{ borderRadius: '12px', background: 'var(--primary-color)' }} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Verification Token'}
                  </button>
                  
                  <div className="text-center mt-3">
                    <button type="button" className="btn btn-link text-decoration-none small text-secondary fw-bold" onClick={() => { setForgotMode(false); setIsLogin(true); setVerifyMode(false); setResetMode(false); }}>
                      Back to Login
                    </button>
                  </div>
                </form>
              )}

              {/* VERIFY OTP SECTION */}
              {verifyMode && (
                <form onSubmit={handleVerifyToken}>
                  <div className="text-center mb-5">
                    <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Verify OTP</h2>
                    <p className="text-muted">Enter the 6-digit verification code</p>
                  </div>
                  
                  <p className="text-muted small mb-4">Enter the 6-digit code that was sent to your email address.</p>
                  
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary mb-2">Verification Token</label>
                    <div className="custom-input-group">
                      <span className="input-icon">
                        <i className="bi bi-shield-check"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control text-center fw-bold fs-5"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        required
                        placeholder="123456"
                        maxLength="6"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" style={{ borderRadius: '12px', background: 'var(--primary-color)' }} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  
                  <div className="text-center mt-3">
                    <button type="button" className="btn btn-link text-decoration-none small text-secondary fw-bold" onClick={() => { setVerifyMode(false); setForgotMode(true); setResetMode(false); }}>
                      Back to Email
                    </button>
                  </div>
                </form>
              )}

              {/* RESET PASSWORD SECTION */}
              {resetMode && (
                <form onSubmit={handleResetPassword}>
                  <div className="text-center mb-5">
                    <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Reset Password</h2>
                    <p className="text-muted">Enter a new secure password</p>
                  </div>
                  
                  <p className="text-muted small mb-4">Verification successful. Enter a new password for your account.</p>
                  
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary mb-2">New Secure Password</label>
                    <div className="custom-input-group">
                      <span className="input-icon">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" style={{ borderRadius: '12px', background: 'var(--primary-color)' }} disabled={loading}>
                    {loading ? 'Resetting...' : 'Update Password'}
                  </button>
                </form>
              )}

              {/* LOGIN FORM SECTION */}
              {isLogin && !forgotMode && !resetMode && !verifyMode && (
                <form onSubmit={handleLogin}>
                  <div className="text-center mb-5">
                    <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Login to Tripzy</h2>
                    <p className="text-muted">Smart Tourism Management & Booking System</p>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary mb-2">Email Address</label>
                    <div className="custom-input-group">
                      <span className="input-icon">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-2">Password</label>
                    <div className="custom-input-group">
                      <span className="input-icon">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  <div className="text-end mb-4">
                    <button type="button" className="btn btn-link p-0 text-decoration-none small text-muted hover-text-primary" onClick={() => { setForgotMode(true); setIsLogin(false); setVerifyMode(false); setResetMode(false); setResetEmail(loginEmail); }}>
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" style={{ borderRadius: '12px', background: 'var(--primary-color)' }} disabled={loading}>
                    {loading ? 'Verifying...' : 'Login'}
                  </button>

                  <div className="text-center mt-3">
                    <span className="text-muted small">Don't have an account? </span>
                    <button type="button" className="btn btn-link p-0 text-decoration-none small fw-bold text-primary hover-text-primary" onClick={() => setIsLogin(false)}>
                      Register
                    </button>
                  </div>
                </form>
              )}

              {/* REGISTER FORM SECTION */}
              {!isLogin && !forgotMode && !resetMode && !verifyMode && (
                <form onSubmit={handleRegister}>
                  <div className="text-center mb-4">
                    <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Create Your Account</h2>
                    <p className="text-muted">Join Tripzy and start your curated Sri Lankan journey today.</p>
                  </div>

                  {/* Role selection cards */}
                  <div className="row g-3 mb-4">
                    {/* I am a Tourist */}
                    <div className="col-md-4">
                      <div 
                        className={`role-card ${userType === 'tourist' ? 'selected-tourist' : ''}`}
                        onClick={() => setUserType('tourist')}
                      >
                        {userType === 'tourist' && (
                          <span className="role-card-badge-tourist">
                            <i className="bi bi-check-circle-fill"></i>
                          </span>
                        )}
                        <div className="role-icon-container role-icon-tourist">
                          <i className="bi bi-globe-asia-australia"></i>
                        </div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: '#1e293b' }}>I am a Tourist</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '11px', lineHeight: '1.3' }}>Plan your perfect island getaway</p>
                      </div>
                    </div>

                    {/* I am a Service Provider */}
                    <div className="col-md-4">
                      <div 
                        className={`role-card ${userType === 'provider' ? 'selected-provider' : ''}`}
                        onClick={() => setUserType('provider')}
                      >
                        {userType === 'provider' && (
                          <span className="role-card-badge-provider">
                            <i className="bi bi-check-circle-fill"></i>
                          </span>
                        )}
                        <div className="role-icon-container role-icon-provider">
                          <i className="bi bi-briefcase"></i>
                        </div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: '#1e293b' }}>I am a Service Provider</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '11px', lineHeight: '1.3' }}>Offer experiences and grow your business</p>
                      </div>
                    </div>

                    {/* I am an Admin */}
                    <div className="col-md-4">
                      <div 
                        className={`role-card ${userType === 'admin' ? 'selected-admin' : ''}`}
                        onClick={() => setUserType('admin')}
                      >
                        {userType === 'admin' && (
                          <span className="role-card-badge-admin">
                            <i className="bi bi-check-circle-fill"></i>
                          </span>
                        )}
                        <div className="role-icon-container role-icon-admin">
                          <i className="bi bi-shield"></i>
                        </div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: '#1e293b' }}>I am an Admin</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '11px', lineHeight: '1.3' }}>Manage platform operations and approvals</p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields grid */}
                  <div className="row g-3 mb-4">
                    {/* Full Name */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-2">Full Name</label>
                      <div className="custom-input-group">
                        <span className="input-icon">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-2">Email Address</label>
                      <div className="custom-input-group">
                        <span className="input-icon">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-2">Password</label>
                      <div className="custom-input-group">
                        <span className="input-icon">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-2">Confirm Password</label>
                      <div className="custom-input-group">
                        <span className="input-icon">
                          <i className="bi bi-arrow-counterclockwise"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-2">Date of Birth</label>
                      <div className="custom-input-group">
                        <span className="input-icon">
                          <i className="bi bi-calendar3"></i>
                        </span>
                        <input
                          type="date"
                          className="form-control"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Gender selection */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-2">Gender</label>
                      <div className="custom-input-group">
                        <span className="input-icon">
                          <i className="bi bi-gender-ambiguous"></i>
                        </span>
                        <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)} required>
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* NIC / Passport */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-2">NIC / Passport Number</label>
                      <div className="custom-input-group">
                        <span className="input-icon">
                          <i className="bi bi-card-text"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={nicPassport}
                          onChange={(e) => setNicPassport(e.target.value)}
                          required
                          placeholder="ID Card or Passport"
                        />
                      </div>
                    </div>

                    {/* Contact Number */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-2">Contact Number</label>
                      <div className="custom-input-group">
                        <span className="input-icon">
                          <i className="bi bi-telephone"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control"
                          value={contactNo}
                          onChange={(e) => setContactNo(e.target.value)}
                          required
                          placeholder="+94 XX XXX XXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms agreement checkbox */}
                  <div className="form-check mb-4 d-flex align-items-start gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input border-secondary mt-1"
                      id="termsCheck"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      required
                      style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label small text-muted" htmlFor="termsCheck" style={{ cursor: 'pointer', userSelect: 'none' }}>
                      I agree to the <a href="#" className="text-decoration-none text-primary hover-text-primary fw-semibold">Terms of Service</a> and <a href="#" className="text-decoration-none text-primary hover-text-primary fw-semibold">Privacy Policy</a> of Tripzy Sri Lanka.
                    </label>
                  </div>

                  <div className="text-center">
                    <button type="submit" className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" style={{ borderRadius: '12px', background: 'var(--primary-color)' }} disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : 'Create Account'}
                    </button>

                    <div className="mt-3">
                      <span className="text-muted small">Already have an account? </span>
                      <button type="button" className="btn btn-link p-0 text-decoration-none small fw-bold text-primary hover-text-primary" onClick={() => setIsLogin(true)}>
                        Log In
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Auth Page Footer */}
      <footer className="py-4 mt-5 border-top border-light-subtle" style={{ width: '100%', zIndex: 2, background: 'transparent' }}>
        <div className="container">
          <div className="row align-items-center justify-content-between g-3">
            <div className="col-md-5 text-center text-md-start d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <img src={logo} alt="Tripzy Logo" style={{ height: '30px', width: 'auto' }} />
              <span className="fw-bold fs-5 text-gradient">Tripzy</span>
              <span className="text-muted small">&copy; {new Date().getFullYear()} Tripzy. All rights reserved.</span>
            </div>
            <div className="col-md-4 text-center">
              <div className="d-flex justify-content-center gap-3">
                <a href="#" className="text-muted text-decoration-none small hover-text-primary">Privacy Policy</a>
                <a href="#" className="text-muted text-decoration-none small hover-text-primary">Terms of Service</a>
                <a href="#" className="text-muted text-decoration-none small hover-text-primary">Cookie Policy</a>
                <a href="#" className="text-muted text-decoration-none small hover-text-primary">Support</a>
              </div>
            </div>
            <div className="col-md-3 text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end gap-3">
                <a href="#" className="text-muted hover-text-primary"><i className="bi bi-globe fs-5"></i></a>
                <a href="#" className="text-muted hover-text-primary"><i className="bi bi-instagram fs-5"></i></a>
                <a href="#" className="text-muted hover-text-primary"><i className="bi bi-envelope fs-5"></i></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

