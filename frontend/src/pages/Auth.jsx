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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className={isLogin || forgotMode || resetMode || verifyMode ? "col-md-6 col-lg-5" : "col-md-9 col-lg-7"}>
          <div className="card glass-card p-4 border-0 shadow-sm animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-gradient">Tripzy Sri Lanka</h2>
              <p className="text-muted small">Smart Tourism Management & Booking System</p>
            </div>

            {msg.text && (
              <div className={`alert alert-${msg.type} text-center py-2`} role="alert" style={{ fontSize: '14px' }}>
                {msg.text}
              </div>
            )}

            {/* FORGOT PASSWORD SECTION */}
            {forgotMode && (
              <form onSubmit={handleForgotPassword}>
                <h4 className="fw-bold mb-3 text-gradient">Forgot Password</h4>
                <p className="text-muted small">Enter the email address used for your Tripzy login. We will send a 6-digit OTP to that same email so you can verify and reset your password.</p>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="Enter registered email address"
                  />
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 btn-lg mt-2 shadow-sm" disabled={loading}>
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
                <h4 className="fw-bold mb-3 text-gradient">Verify OTP</h4>
                <p className="text-muted small">Enter the 6-digit code that was sent to your email address.</p>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Verification Token</label>
                  <input
                    type="text"
                    className="form-control rounded-3 border-light-subtle text-center py-2 shadow-sm fw-bold fs-5"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    placeholder="123456"
                    maxLength="6"
                  />
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 btn-lg mt-2 shadow-sm" disabled={loading}>
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
                <h4 className="fw-bold mb-3 text-gradient">Reset Password</h4>
                <p className="text-muted small">Verification successful. Enter a new password for your account.</p>
                <div className="mb-3">
                  <label className="form-label small fw-bold">New Secure Password</label>
                  <input
                    type="password"
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 btn-lg mt-2 shadow-sm" disabled={loading}>
                  {loading ? 'Resetting...' : 'Update Password'}
                </button>
              </form>
            )}

            {/* LOGIN FORM SECTION */}
            {isLogin && !forgotMode && !resetMode && !verifyMode && (
              <form onSubmit={handleLogin}>
                <h4 className="fw-bold mb-3 text-gradient">Login to Tripzy</h4>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input
                    type="email"
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Password</label>
                  <input
                    type="password"
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                  />
                </div>
                <div className="text-end mb-3">
                  <button type="button" className="btn btn-link p-0 text-decoration-none small text-secondary" onClick={() => { setForgotMode(true); setIsLogin(false); setVerifyMode(false); setResetMode(false); setResetEmail(loginEmail); }}>
                    Forgot Password?
                  </button>
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 fs-5 shadow-sm" disabled={loading}>
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
            {!isLogin && !forgotMode && !resetMode && !verifyMode && (
              <form onSubmit={handleRegister}>
                <h4 className="fw-bold mb-3 text-gradient">Create User Account</h4>
                
                <div className="mb-3">
                  <label className="form-label small fw-bold">I want to register as a:</label>
                  <select className="form-select rounded-3 border-light-subtle py-2 shadow-sm" value={userType} onChange={(e) => setUserType(e.target.value)}>
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
                      className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
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
                      className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
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
                      className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
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
                      className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
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
                    <select className="form-select rounded-3 border-light-subtle py-2 shadow-sm" value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
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
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
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
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
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
                    className="form-control rounded-3 border-light-subtle py-2 shadow-sm"
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files[0])}
                  />
                </div>

                <button type="submit" className="btn btn-gradient w-100 py-2 fs-5 mt-2 shadow-sm" disabled={loading}>
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
