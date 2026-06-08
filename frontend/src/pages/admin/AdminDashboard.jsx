import { useEffect, useState } from 'react';
import { apiRequest, getUploadUrl } from '../../api';

export default function AdminDashboard({ currentUser, onProfileUpdate, onLogout, activeTab, setActiveTab, showConfirm }) {
  
  // Data states
  const [stats, setStats] = useState(null);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Profile edit state
  const [profileFullName, setProfileFullName] = useState('');
  const [profileNameWithInitial, setProfileNameWithInitial] = useState('');
  const [profileContactNo, setProfileContactNo] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Destination Creation State
  const [destName, setDestName] = useState('');
  const [destDistrict, setDestDistrict] = useState('Colombo');
  const [destDesc, setDestDesc] = useState('');
  const [destImage, setDestImage] = useState(null);
  const [destActivities, setDestActivities] = useState('');
  const [destBudget, setDestBudget] = useState('mid-range');
  const [destInterest, setDestInterest] = useState('Beaches');
  const [destLat, setDestLat] = useState('');
  const [destLon, setDestLon] = useState('');

  // FAQ Creation State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  useEffect(() => {
    fetchStats();
    fetchPendingUsers();
    fetchDestinations();
    fetchFaqs();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setProfileFullName(currentUser.full_name || '');
    setProfileNameWithInitial(currentUser.name_with_initial || '');
    setProfileContactNo(currentUser.contact_no || '');
    setProfilePhoto(null);
  }, [currentUser]);

  useEffect(() => {
    if (!profilePhoto) {
      setPreviewPhotoUrl('');
      return;
    }
    const url = URL.createObjectURL(profilePhoto);
    setPreviewPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePhoto]);

  async function fetchStats() {
    try {
      const res = await apiRequest('admin', 'stats');
      setStats(res);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPendingUsers() {
    try {
      const adminRes = await apiRequest('admin', 'pending_admins');
      setPendingAdmins(adminRes.pending_admins || []);
      
      const provRes = await apiRequest('admin', 'pending_providers');
      setPendingProviders(provRes.pending_providers || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchDestinations() {
    try {
      const res = await apiRequest('destinations', 'list');
      setDestinations(res.destinations || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchFaqs() {
    try {
      const res = await apiRequest('faqs', 'list');
      setFaqs(res.faqs || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchBookings() {
    try {
      const res = await apiRequest('bookings', 'all');
      setBookings(res.bookings || []);
    } catch (err) {
      console.error(err);
    }
  }

  const handleApproveUser = async (id, status, type) => {
    try {
      await apiRequest('admin', 'approve_user', 'POST', { id, status });
      alert(`User status has been successfully set to ${status.toUpperCase()} and the user was notified.`);
      if (type === 'admin') {
        setPendingAdmins((prev) => prev.filter((user) => user.id !== id));
      } else if (type === 'provider') {
        setPendingProviders((prev) => prev.filter((user) => user.id !== id));
      }
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      let hasChanges = false;

      if (profileFullName !== currentUser.full_name) {
        formData.append('full_name', profileFullName);
        hasChanges = true;
      }
      if (profileNameWithInitial !== currentUser.name_with_initial) {
        formData.append('name_with_initial', profileNameWithInitial);
        hasChanges = true;
      }
      if (profileContactNo !== currentUser.contact_no) {
        formData.append('contact_no', profileContactNo);
        hasChanges = true;
      }
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
        hasChanges = true;
      }

      if (!hasChanges) {
        alert('No changes made to your profile. Update the fields you want to change.');
        setProfileLoading(false);
        return;
      }

      const res = await apiRequest('profile', 'update', 'POST', formData);
      alert(res.message);
      if (onProfileUpdate) {
        onProfileUpdate({
          ...currentUser,
          full_name: profileFullName,
          name_with_initial: profileNameWithInitial,
          contact_no: profileContactNo,
          profile_photo: res.profile_photo || currentUser.profile_photo
        });
      }
      setProfilePhoto(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateDestination = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', destName);
      formData.append('district', destDistrict);
      formData.append('description', destDesc);
      formData.append('activities', destActivities);
      formData.append('budget_category', destBudget);
      formData.append('interest_category', destInterest);
      formData.append('latitude', destLat);
      formData.append('longitude', destLon);
      if (destImage) {
        formData.append('image', destImage);
      }

      await apiRequest('destinations', 'create', 'POST', formData);
      alert("Destination created successfully!");
      setDestName('');
      setDestDesc('');
      setDestActivities('');
      setDestLat('');
      setDestLon('');
      setDestImage(null);
      
      fetchDestinations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDestination = (id) => {
    showConfirm(
      "Delete this destination?",
      async () => {
        try {
          await apiRequest('destinations', 'delete', 'POST', { id });
          alert("Destination deleted.");
          fetchDestinations();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete Destination"
    );
  };

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('faqs', 'create', 'POST', {
        question: faqQuestion,
        answer: faqAnswer
      });
      alert("FAQ created successfully!");
      setFaqQuestion('');
      setFaqAnswer('');
      fetchFaqs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFaq = (id) => {
    showConfirm(
      "Delete this FAQ?",
      async () => {
        try {
          await apiRequest('faqs', 'delete', 'POST', { id });
          alert("FAQ deleted.");
          fetchFaqs();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete FAQ"
    );
  };

  // Helper variables
  const interestOptions = ['Beaches', 'Mountains', 'Camping', 'Wildlife', 'Historical places', 'Adventure', 'Nature', 'Cultural destinations'];
  const districts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Trincomalee', 'Badulla', 'Anuradhapura', 'Polonnaruwa'];

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-shield-lock-fill text-danger me-2"></i>Admin Panel
        </div>
        <div className="text-center mb-4">
          <img 
            src={currentUser.profile_photo && currentUser.profile_photo !== 'default_profile.jpg'
              ? getUploadUrl(currentUser.profile_photo)
              : (currentUser.gender === 'female' 
                  ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                  : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80")} 
            alt="Profile" 
            className="rounded-circle border border-2 border-danger mb-2" 
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <h6 className="fw-bold mb-0 text-white">{currentUser.full_name}</h6>
          <span className="badge bg-danger rounded-pill px-2 py-1 mt-1 small">Admin</span>
        </div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'stats' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('stats'); }}>
              <i className="bi bi-graph-up-arrow"></i> System Statistics
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'approvals' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('approvals'); }}>
              <i className="bi bi-check2-all"></i> Pending Approvals
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'destinations' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('destinations'); }}>
              <i className="bi bi-geo-alt-fill"></i> Destinations
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'faqs' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('faqs'); }}>
              <i className="bi bi-question-circle"></i> FAQs Manage
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
              <i className="bi bi-person-circle"></i> Profile
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('bookings'); }}>
              <i className="bi bi-collection-fill"></i> Monitor Bookings
            </a>
          </li>
          <li className="sidebar-item mt-4 border-top pt-3">
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="text-danger fw-bold">
              <i className="bi bi-box-arrow-right text-danger"></i> Logout
            </a>
          </li>
        </ul>
      </div>

      {/* ADMIN WORKSPACE */}
      <div className="dashboard-content animate-fade-in">
        
        {/* TAB: SYSTEM STATS */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">System Overview Statistics</h2>
            
            {stats ? (
              <div>
                <div className="row g-4 mb-5">
                  <div className="col-md-3">
                    <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                      <h6 className="text-muted small uppercase">Total Admins/Tourists</h6>
                      <h3 className="fw-bold text-primary mt-2">
                        {stats.users.reduce((acc, curr) => acc + curr.count, 0)} Accounts
                      </h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                      <h6 className="text-muted small uppercase">Active Services Listed</h6>
                      <h3 className="fw-bold text-success mt-2">
                        {stats.services.reduce((acc, curr) => acc + curr.count, 0)} listings
                      </h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                      <h6 className="text-muted small uppercase">Bookings Logged</h6>
                      <h3 className="fw-bold text-info mt-2">
                        {stats.bookings.reduce((acc, curr) => acc + curr.count, 0)} trips
                      </h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                      <h6 className="text-muted small uppercase">Total Offline Revenue</h6>
                      <h3 className="fw-bold text-warning mt-2">
                        LKR {Number(stats.bookings.find(b => b.status === 'completed')?.total_earnings || 0).toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card glass-card p-4 border-0">
                      <h5 className="fw-bold mb-3 text-gradient">User Directory Breakdown</h5>
                      <ul className="list-group list-group-flush">
                        {stats.users.map(u => (
                          <li className="list-group-item bg-transparent d-flex justify-content-between text-capitalize" key={u.user_type}>
                            <span>{u.user_type}s</span>
                            <strong>{u.count}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card glass-card p-4 border-0">
                      <h5 className="fw-bold mb-3 text-gradient">Service Posts Breakdown</h5>
                      <ul className="list-group list-group-flush">
                        {stats.services.map(s => (
                          <li className="list-group-item bg-transparent d-flex justify-content-between text-capitalize" key={s.service_type}>
                            <span>{s.service_type.replace('_', ' ')}s</span>
                            <strong>{s.count}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted">Loading system metrics...</p>
            )}
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Admin Profile Settings</h2>
            <div className="row g-4 mb-4">
              {/* Profile Preview Card & Statistics */}
              <div className="col-lg-4">
                <div className="card glass-card border-0 overflow-hidden text-center pb-4 h-100">
                  <div className="profile-card-header"></div>
                  <div className="profile-avatar-container mb-3">
                    <div className="profile-avatar-wrapper">
                      <img
                        src={profilePhoto ? previewPhotoUrl : (currentUser.profile_photo && currentUser.profile_photo !== 'default_profile.jpg' ? getUploadUrl(currentUser.profile_photo) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80')}
                        alt="Profile"
                        className="profile-avatar-img"
                      />
                      <label htmlFor="admin-profile-photo-input" className="profile-upload-overlay" title="Upload New Photo">
                        <i className="bi bi-camera-fill"></i>
                      </label>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="admin-profile-photo-input"
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => setProfilePhoto(e.target.files[0] || null)}
                  />
                  <h4 className="fw-bold mb-1 text-gradient">{currentUser.full_name}</h4>
                  <div className="mb-2">
                    <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10 px-3 py-1">System Administrator</span>
                  </div>
                  <div className="profile-verified-badge mb-4">
                    <i className="bi bi-shield-fill-check"></i> {currentUser.email} (Verified)
                  </div>
                  
                  <div className="px-3">
                    <h6 className="fw-bold text-start text-uppercase text-secondary small mb-3 border-bottom pb-2">Platform Infrastructure</h6>
                    <div className="row g-3 text-start">
                      <div className="col-6">
                        <div className="profile-stat-box text-center">
                          <div className="profile-stat-icon bg-success bg-opacity-10 text-success mx-auto">
                            <i className="bi bi-geo-alt"></i>
                          </div>
                          <h4 className="fw-bold mb-0 text-dark">{destinations.length}</h4>
                          <span className="text-muted small">Locations</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="profile-stat-box text-center">
                          <div className="profile-stat-icon bg-primary bg-opacity-10 text-primary mx-auto">
                            <i className="bi bi-question-circle"></i>
                          </div>
                          <h4 className="fw-bold mb-0 text-dark">{faqs.length}</h4>
                          <span className="text-muted small">FAQs</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="profile-stat-box text-center">
                          <div className="profile-stat-icon bg-info bg-opacity-10 text-info mx-auto">
                            <i className="bi bi-journal-album"></i>
                          </div>
                          <h4 className="fw-bold mb-0 text-dark">{bookings.length}</h4>
                          <span className="text-muted small">Bookings</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="profile-stat-box text-center">
                          <div className="profile-stat-icon bg-danger bg-opacity-10 text-danger mx-auto">
                            <i className="bi bi-shield-exclamation"></i>
                          </div>
                          <h4 className="fw-bold mb-0 text-dark">{pendingAdmins.length + pendingProviders.length}</h4>
                          <span className="text-muted small">Approvals</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Edit Fields Form */}
              <div className="col-lg-8">
                <div className="card glass-card p-4 border-0 h-100">
                  <h4 className="fw-bold mb-2 text-gradient"><i className="bi bi-person-fill-gear me-2"></i>Admin Information</h4>
                  <p className="text-muted small mb-4">Edit fields you wish to update. Unchanged fields will remain as they are.</p>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Full Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-secondary"></i></span>
                          <input
                            type="text"
                            className="form-control rounded-end-3"
                            value={profileFullName}
                            onChange={(e) => setProfileFullName(e.target.value)}
                            placeholder={currentUser.full_name || ''}
                          />
                        </div>
                        <div className="form-text small">Leave empty to keep your current name.</div>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Name with Initials</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0"><i className="bi bi-person-badge text-secondary"></i></span>
                          <input
                            type="text"
                            className="form-control rounded-end-3"
                            value={profileNameWithInitial}
                            onChange={(e) => setProfileNameWithInitial(e.target.value)}
                            placeholder={currentUser.name_with_initial || ''}
                          />
                        </div>
                        <div className="form-text small">Leave empty to keep your current initials.</div>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label small fw-bold">Contact Phone Number</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0"><i className="bi bi-telephone text-secondary"></i></span>
                          <input
                            type="tel"
                            className="form-control rounded-end-3"
                            value={profileContactNo}
                            onChange={(e) => setProfileContactNo(e.target.value)}
                            placeholder={currentUser.contact_no || ''}
                          />
                        </div>
                        <div className="form-text small">Leave empty to keep your current contact number.</div>
                      </div>
                      
                      <div className="col-12 mt-4 pt-3 border-top">
                        <button type="submit" className="btn btn-gradient w-100 py-3 rounded-pill shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 animate-float-hover" disabled={profileLoading}>
                          {profileLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Saving Profile Details...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle-fill"></i>
                              Save Profile Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PENDING APPROVALS */}
        {activeTab === 'approvals' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Pending Requests Approval Panel</h2>
            
            <div className="row g-4">
              {/* Admin Registrations approvals */}
              <div className="col-md-6">
                <div className="card glass-card p-4 border-0 h-100">
                  <h4 className="fw-bold mb-3 text-danger"><i className="bi bi-person-lock"></i> Pending Admins</h4>
                  {pendingAdmins.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {pendingAdmins.map(adm => (
                        <div className="list-group-item bg-transparent px-0 py-3 d-flex justify-content-between align-items-center" key={adm.id}>
                          <div>
                            <h6 className="fw-bold mb-0">{adm.full_name}</h6>
                            <span className="text-muted small">{adm.email} | NIC: {adm.nic_passport}</span>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => handleApproveUser(adm.id, 'active', 'admin')}>Approve</button>
                            <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleApproveUser(adm.id, 'rejected', 'admin')}>Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small text-center py-4">No pending admin registration requests.</p>
                  )}
                </div>
              </div>

              {/* Service Provider approvals */}
              <div className="col-md-6">
                <div className="card glass-card p-4 border-0 h-100">
                  <h4 className="fw-bold mb-3 text-success"><i className="bi bi-briefcase"></i> Pending Service Providers</h4>
                  {pendingProviders.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {pendingProviders.map(prov => (
                        <div className="list-group-item bg-transparent px-0 py-3 d-flex justify-content-between align-items-center" key={prov.id}>
                          <div>
                            <h6 className="fw-bold mb-0">{prov.full_name}</h6>
                            <span className="text-muted small">{prov.email} | Contact: {prov.contact_no}</span>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => handleApproveUser(prov.id, 'active', 'provider')}>Approve</button>
                            <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleApproveUser(prov.id, 'rejected', 'provider')}>Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small text-center py-4">No pending provider verification requests.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DESTINATIONS */}
        {activeTab === 'destinations' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Destination Management</h2>
            <div className="row g-4">
              {/* Form to Create Destination */}
              <div className="col-md-4">
                <div className="card glass-card p-4 border-0">
                  <h5 className="fw-bold mb-3 text-gradient">Add New Destination</h5>
                  <form onSubmit={handleCreateDestination}>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Destination Name</label>
                      <input type="text" className="form-control rounded-3 form-control-sm" value={destName} onChange={(e) => setDestName(e.target.value)} required />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Select District</label>
                      <select className="form-select rounded-3 form-select-sm" value={destDistrict} onChange={(e) => setDestDistrict(e.target.value)}>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Interest Category</label>
                      <select className="form-select rounded-3 form-select-sm" value={destInterest} onChange={(e) => setDestInterest(e.target.value)}>
                        {interestOptions.map(io => <option key={io} value={io}>{io}</option>)}
                      </select>
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Latitude</label>
                        <input type="text" className="form-control rounded-3 form-control-sm" value={destLat} onChange={(e) => setDestLat(e.target.value)} required placeholder="e.g. 6.87" />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Longitude</label>
                        <input type="text" className="form-control rounded-3 form-control-sm" value={destLon} onChange={(e) => setDestLon(e.target.value)} required placeholder="e.g. 81.04" />
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Budget Tier</label>
                      <select className="form-select rounded-3 form-select-sm" value={destBudget} onChange={(e) => setDestBudget(e.target.value)}>
                        <option value="budget">Budget</option>
                        <option value="mid-range">Mid-Range</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold">Activities</label>
                      <input type="text" className="form-control rounded-3 form-control-sm" value={destActivities} onChange={(e) => setDestActivities(e.target.value)} required placeholder="e.g. Hiking, Surfing" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Destination Photo</label>
                      <input type="file" className="form-control rounded-3 form-control-sm" accept="image/*" onChange={(e) => setDestImage(e.target.files[0])} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Description</label>
                      <textarea className="form-control rounded-3 form-control-sm" rows="3" value={destDesc} onChange={(e) => setDestDesc(e.target.value)} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-gradient btn-sm w-100 py-2 rounded-pill shadow-sm">Save Destination</button>
                  </form>
                </div>
              </div>

              {/* List Destinations */}
              <div className="col-md-8">
                <div className="card glass-card p-4 border-0">
                  <h5 className="fw-bold mb-3 text-gradient">Current Active Locations</h5>
                  <div className="table-responsive" style={{ maxHeight: '550px' }}>
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Location</th>
                          <th>District</th>
                          <th>Interest</th>
                          <th>Coordinates</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {destinations.map(d => (
                          <tr key={d.id}>
                            <td><strong>{d.name}</strong></td>
                            <td>{d.district}</td>
                            <td><span className="badge bg-success bg-opacity-10 text-success">{d.interest_category}</span></td>
                            <td><span className="small text-muted">{d.latitude}, {d.longitude}</span></td>
                            <td>
                              <button className="btn btn-outline-danger btn-sm rounded-circle" onClick={() => handleDeleteDestination(d.id)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FAQs */}
        {activeTab === 'faqs' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">FAQ Management</h2>
            <div className="row g-4">
              {/* Form */}
              <div className="col-md-4">
                <div className="card glass-card p-4 border-0">
                  <h5 className="fw-bold mb-3 text-gradient">Add FAQ Item</h5>
                  <form onSubmit={handleCreateFaq}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">FAQ Question</label>
                      <input type="text" className="form-control rounded-3" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-bold">FAQ Answer</label>
                      <textarea className="form-control rounded-3" rows="4" value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} required></textarea>
                    </div>
                    <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill shadow-sm">Save FAQ</button>
                  </form>
                </div>
              </div>
              
              {/* List */}
              <div className="col-md-8">
                <div className="card glass-card p-4 border-0">
                  <h5 className="fw-bold mb-3 text-gradient">System FAQs</h5>
                  <div className="list-group list-group-flush">
                    {faqs.map(f => (
                      <div className="list-group-item bg-transparent px-0 py-3" key={f.id}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-bold mb-1">{f.question}</h6>
                            <p className="text-muted small mb-0">{f.answer}</p>
                          </div>
                          <button className="btn btn-outline-danger btn-sm rounded-circle ms-3" onClick={() => handleDeleteFaq(f.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MONITOR BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Monitor System Bookings</h2>
            <div className="card glass-card border-0 p-4">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Ref No</th>
                      <th>Service Name</th>
                      <th>Type</th>
                      <th>Tourist Client</th>
                      <th>Service Provider</th>
                      <th>Pricing</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td><strong className="text-primary">{b.ref_no}</strong></td>
                        <td>{b.name_of_institute}</td>
                        <td className="text-capitalize">{b.service_type}</td>
                        <td>{b.tourist_name}</td>
                        <td>{b.provider_name}</td>
                        <td>LKR {Number(b.price).toLocaleString()}</td>
                        <td>
                          <span className={`badge-${b.status}`}>
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
