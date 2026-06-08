import React, { useEffect, useState } from 'react';
import { apiRequest, getUploadUrl } from '../../api';

export default function ProviderDashboard({ currentUser, onProfileUpdate, onLogout, activeTab, setActiveTab, showConfirm }) {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Profile edit state
  const [profileFullName, setProfileFullName] = useState(currentUser.full_name || '');
  const [profileNameWithInitial, setProfileNameWithInitial] = useState(currentUser.name_with_initial || '');
  const [profileContactNo, setProfileContactNo] = useState(currentUser.contact_no || '');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Create Service Form State
  const [serviceType, setServiceType] = useState('hotel');
  const [nameOfInstitute, setNameOfInstitute] = useState('');
  const [contactNo, setContactNo] = useState(currentUser.contact_no || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);

  // Edit Service Form State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Selected Booking Customer Details Modal
  const [selectedCust, setSelectedCust] = useState(null);

  useEffect(() => {
    fetchListings();
    fetchBookings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await apiRequest('services', 'provider_list');
      setListings(res.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await apiRequest('bookings', 'provider_list');
      setBookings(res.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('service_type', serviceType);
      formData.append('name_of_institute', nameOfInstitute);
      formData.append('contact_no', contactNo);
      formData.append('email', email);
      formData.append('price', price);
      formData.append('description', description);
      if (photo) {
        formData.append('photo', photo);
      } else {
        alert("Please upload a picture of the service listing.");
        return;
      }

      await apiRequest('services', 'create', 'POST', formData);
      alert("Service post created successfully! It is now enabled on the system.");
      
      // Reset form
      setNameOfInstitute('');
      setPrice('');
      setDescription('');
      setPhoto(null);
      
      setActiveTab('listings');
      fetchListings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
      await apiRequest('services', 'toggle_status', 'POST', { id, status: nextStatus });
      fetchListings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteListing = (id) => {
    showConfirm(
      "Are you sure you want to permanently delete this listing?",
      async () => {
        try {
          await apiRequest('services', 'delete', 'POST', { id });
          alert("Listing deleted successfully.");
          fetchListings();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete Listing"
    );
  };

  const handleEditInit = (srv) => {
    setEditingId(srv.id);
    setEditName(srv.name_of_institute);
    setEditPrice(srv.price);
    setEditDesc(srv.description);
  };

  const handleUpdateServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('services', 'update', 'POST', {
        id: editingId,
        name_of_institute: editName,
        price: editPrice,
        description: editDesc
      });
      alert("Listing updated successfully.");
      setEditingId(null);
      fetchListings();
    } catch (err) {
      alert(err.message);
    }
  };

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      let changed = false;

      const trimmedFull = profileFullName ? profileFullName.trim() : '';
      if (trimmedFull !== '' && trimmedFull !== (currentUser.full_name || '')) {
        formData.append('full_name', trimmedFull);
        changed = true;
      }

      const trimmedInit = profileNameWithInitial ? profileNameWithInitial.trim() : '';
      if (trimmedInit !== '' && trimmedInit !== (currentUser.name_with_initial || '')) {
        formData.append('name_with_initial', trimmedInit);
        changed = true;
      }

      const trimmedContact = profileContactNo ? profileContactNo.trim() : '';
      if (trimmedContact !== '' && trimmedContact !== (currentUser.contact_no || '')) {
        formData.append('contact_no', trimmedContact);
        changed = true;
      }

      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
        changed = true;
      }

      if (!changed) {
        alert('No changes to save. Update at least one field.');
        return;
      }

      const res = await apiRequest('profile', 'update', 'POST', formData);
      alert(res.message);

      if (onProfileUpdate) {
        const updated = { ...currentUser };
        if (trimmedFull !== '' && trimmedFull !== (currentUser.full_name || '')) updated.full_name = trimmedFull;
        if (trimmedInit !== '' && trimmedInit !== (currentUser.name_with_initial || '')) updated.name_with_initial = trimmedInit;
        if (trimmedContact !== '' && trimmedContact !== (currentUser.contact_no || '')) updated.contact_no = trimmedContact;
        if (res.profile_photo) updated.profile_photo = res.profile_photo;
        onProfileUpdate(updated);
      }
      setProfilePhoto(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await apiRequest('bookings', 'update_status', 'POST', { id, status });
      alert(`Booking has been marked as ${status.toUpperCase()} and the tourist has been emailed.`);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-building-fill text-success me-2"></i>Provider Panel
        </div>
        <div className="text-center mb-4">
          <img 
            src={currentUser.profile_photo && currentUser.profile_photo !== 'default_profile.jpg'
              ? getUploadUrl(currentUser.profile_photo)
              : (currentUser.gender === 'female' 
                  ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                  : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80")} 
            alt="Profile" 
            className="rounded-circle border-2 border-primary mb-2" 
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <h6 className="fw-bold mb-0 text-white">{currentUser.full_name}</h6>
          <span className="badge bg-primary rounded-pill px-2 py-1 mt-1 small">Service Provider</span>
        </div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'listings' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('listings'); }}>
              <i className="bi bi-card-list"></i> My Service Posts
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'add_service' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('add_service'); }}>
              <i className="bi bi-plus-circle"></i> Create Offer Listing
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
              <i className="bi bi-person-circle"></i> Manage Profile
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('bookings'); }}>
              <i className="bi bi-briefcase"></i> Incoming Bookings
            </a>
          </li>
          <li className="sidebar-item mt-4 border-top pt-3">
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="text-danger fw-bold">
              <i className="bi bi-box-arrow-right text-danger"></i> Logout
            </a>
          </li>
        </ul>
      </div>

      {/* CONTENT REGION */}
      <div className="dashboard-content animate-fade-in">
        
        {/* TAB: MY LISTINGS */}
        {activeTab === 'listings' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">My Service Listings</h2>
            {editingId && (
              <div className="card glass-card p-4 border-0 mb-4 animate-fade-in">
                <h5 className="fw-bold text-primary mb-3">Edit Offer Post</h5>
                <form onSubmit={handleUpdateServiceSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Name of Institute</label>
                      <input type="text" className="form-control rounded-3" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Price / Day (LKR)</label>
                      <input type="number" className="form-control rounded-3" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Description</label>
                      <textarea className="form-control rounded-3" rows="3" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required></textarea>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button type="submit" className="btn btn-gradient btn-sm rounded-pill px-4 me-2">Save</button>
                    <button type="button" className="btn btn-light btn-sm rounded-pill px-4" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {listings.length > 0 ? (
              <div className="row g-4">
                {listings.map(srv => (
                  <div className="col-md-6 col-lg-4" key={srv.id}>
                    <div className="card glass-card h-100 border-0 overflow-hidden d-flex flex-column justify-content-between">
                      <img 
                        src={getUploadUrl(srv.photo) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'} 
                        alt={srv.name_of_institute} 
                        style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                      />
                      <div className="p-4">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="badge bg-secondary bg-opacity-10 text-dark text-capitalize">{srv.service_type}</span>
                          <span className={`badge ${srv.status === 'enabled' ? 'bg-success' : 'bg-danger'} text-white`}>
                            {srv.status === 'enabled' ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <h5 className="fw-bold mb-2">{srv.name_of_institute}</h5>
                        <p className="text-muted small line-clamp-3 mb-3">{srv.description}</p>
                        <div className="mb-3 small">
                          <span className="fw-bold d-block">Contact Info:</span>
                          <span className="text-muted">{srv.contact_no} | {srv.email}</span>
                          <span className="d-block fw-bold text-success mt-2">LKR {Number(srv.price).toLocaleString()} / day</span>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-3 border-top mt-auto d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => handleEditInit(srv)}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button 
                          className={`btn btn-${srv.status === 'enabled' ? 'outline-warning' : 'warning'} btn-sm flex-fill`}
                          onClick={() => handleToggleStatus(srv.id, srv.status)}
                        >
                          {srv.status === 'enabled' ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteListing(srv.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 card glass-card border-0">
                <i className="bi bi-card-list fs-1 text-muted"></i>
                <h5 className="fw-bold mt-3">You Haven't Offered Any Services Yet</h5>
                <p className="text-muted">Click the 'Create Offer Listing' tab to list your hotel, vehicle, guide, or camping gear services.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: CREATE LISTING */}
        {activeTab === 'add_service' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Create Offer Post</h2>
            <div className="card glass-card border-0 p-4 col-lg-8">
              <form onSubmit={handleCreateService}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Select Service Category</label>
                    <select className="form-select rounded-3" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                      <option value="hotel">Hotel / Resort Booking</option>
                      <option value="vehicle">Vehicle Hiring</option>
                      <option value="guide">Tour Guide Hiring</option>
                      <option value="camping_tool">Camping Gear Rental</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Name of Institute / Service Post Title</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      value={nameOfInstitute} 
                      onChange={(e) => setNameOfInstitute(e.target.value)} 
                      required 
                      placeholder="e.g. Sigiriya Villa Resort, Ella Safaris"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Contact Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control rounded-3" 
                      value={contactNo} 
                      onChange={(e) => setContactNo(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control rounded-3" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Price / Day (LKR)</label>
                    <input 
                      type="number" 
                      className="form-control rounded-3" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      required 
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold">Listing Image / Photo</label>
                    <input 
                      type="file" 
                      className="form-control rounded-3" 
                      accept="image/*" 
                      onChange={(e) => setPhoto(e.target.files[0])} 
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold">Description / About the Service</label>
                  <textarea 
                    className="form-control rounded-3" 
                    rows="4" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    placeholder="Provide pricing parameters, inclusions, safety records, or policies..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-gradient px-5 py-2 rounded-pill shadow-sm">
                  Publish Post
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Manage Your Provider Profile</h2>
            <div className="row g-4 mb-4">
              {/* Profile Preview Card & Statistics */}
              <div className="col-lg-4">
                <div className="card glass-card border-0 overflow-hidden text-center pb-4 h-100">
                  <div className="profile-card-header"></div>
                  <div className="profile-avatar-container mb-3">
                    <div className="profile-avatar-wrapper">
                      <img
                        src={profilePhoto ? previewPhotoUrl : (currentUser.profile_photo && currentUser.profile_photo !== 'default_profile.jpg' ? getUploadUrl(currentUser.profile_photo) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')}
                        alt="Profile"
                        className="profile-avatar-img"
                      />
                      <label htmlFor="provider-profile-photo-input" className="profile-upload-overlay" title="Upload New Photo">
                        <i className="bi bi-camera-fill"></i>
                      </label>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="provider-profile-photo-input"
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => setProfilePhoto(e.target.files[0] || null)}
                  />
                  <h4 className="fw-bold mb-1 text-gradient">{currentUser.full_name}</h4>
                  <div className="mb-2">
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 px-3 py-1">Service Provider Account</span>
                  </div>
                  <div className="profile-verified-badge mb-4">
                    <i className="bi bi-shield-fill-check"></i> {currentUser.email} (Verified)
                  </div>
                  
                  <div className="px-3">
                    <h6 className="fw-bold text-start text-uppercase text-secondary small mb-3 border-bottom pb-2">Business Activity</h6>
                    <div className="row g-3 text-start">
                      <div className="col-6">
                        <div className="profile-stat-box text-center">
                          <div className="profile-stat-icon bg-success bg-opacity-10 text-success mx-auto">
                            <i className="bi bi-briefcase-fill"></i>
                          </div>
                          <h4 className="fw-bold mb-0 text-dark">{listings.length}</h4>
                          <span className="text-muted small">Active Listings</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="profile-stat-box text-center">
                          <div className="profile-stat-icon bg-primary bg-opacity-10 text-primary mx-auto">
                            <i className="bi bi-journal-check"></i>
                          </div>
                          <h4 className="fw-bold mb-0 text-dark">{bookings.length}</h4>
                          <span className="text-muted small">Total Bookings</span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="profile-stat-box d-flex align-items-center gap-3">
                          <div className="profile-stat-icon bg-warning bg-opacity-10 text-warning mb-0">
                            <i className="bi bi-clock-history"></i>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0 text-dark">
                              {bookings.filter(b => b.status === 'pending').length}
                            </h5>
                            <span className="text-muted small">Pending Booking Requests</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Edit Fields Form */}
              <div className="col-lg-8">
                <div className="card glass-card p-4 border-0 h-100">
                  <h4 className="fw-bold mb-2 text-gradient"><i className="bi bi-person-fill-gear me-2"></i>Business Information</h4>
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

        {/* TAB: INCOMING BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Incoming Tourist Booking Requests</h2>
            <div className="card glass-card border-0 p-4">
              {bookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Ref No</th>
                        <th>Tourist Client</th>
                        <th>Dates</th>
                        <th>Price Sum</th>
                        <th>Request Details</th>
                        <th>Status</th>
                        <th>Action Buttons</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(book => (
                        <tr key={book.id}>
                          <td><strong className="text-primary">{book.ref_no}</strong></td>
                          <td>
                            <button 
                              className="btn btn-link p-0 text-decoration-none fw-bold"
                              data-bs-toggle="modal"
                              data-bs-target="#customerDetailsModal"
                              onClick={() => setSelectedCust(book)}
                            >
                              {book.tourist_name}
                            </button>
                          </td>
                          <td>{book.start_date} to {book.end_date}</td>
                          <td>LKR {Number(book.price).toLocaleString()}</td>
                          <td><span className="small text-muted">{book.booking_details || 'None'}</span></td>
                          <td>
                            <span className={`badge-${book.status}`}>
                              {book.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {book.status === 'pending' ? (
                              <div className="d-flex gap-2">
                                <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => handleUpdateBookingStatus(book.id, 'completed')}>
                                  Verify Cash
                                </button>
                                <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={() => handleUpdateBookingStatus(book.id, 'rejected')}>
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted small">No action needed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-briefcase fs-1 text-muted"></i>
                  <p className="mt-3 text-muted">No tourist bookings have been made for your items yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CUSTOMER DETAILS MODAL */}
      <div className="modal fade" id="customerDetailsModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Tourist Profile Details</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              {selectedCust && (
                <div className="d-flex flex-column align-items-center text-center">
                  <img 
                    src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`} 
                    alt="Customer" 
                    className="rounded-circle mb-3 border-2 border-primary" 
                    style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                  />
                  <h5 className="fw-bold mb-1">{selectedCust.tourist_name}</h5>
                  <span className="badge bg-secondary mb-3">Tourist Member</span>
                  
                  <div className="w-100 text-start bg-light p-3 rounded-3 mt-2">
                    <p className="mb-2"><strong>Email Address:</strong> {selectedCust.tourist_email}</p>
                    <p className="mb-0"><strong>Contact Phone:</strong> {selectedCust.tourist_contact}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
