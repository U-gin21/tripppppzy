import React, { useEffect, useState } from 'react';
import { apiRequest, getUploadUrl } from '../api';

export default function TouristDashboard({ currentUser, onProfileUpdate, initialTab, initialServiceType }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'bookings'); // bookings, services, companion, profile, notifications

  // Data states
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Profile update form state
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [nameWithInitial, setNameWithInitial] = useState(currentUser.name_with_initial || '');
  const [contactNo, setContactNo] = useState(currentUser.contact_no);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Booking Form State
  const [selectedService, setSelectedService] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingDetails, setBookingDetails] = useState('');

  // Review Form State
  const [reviewServiceId, setReviewServiceId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Search service filter
  const [serviceTypeFilter, setServiceTypeFilter] = useState(initialServiceType || 'hotel');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialServiceType) {
      setServiceTypeFilter(initialServiceType);
    }
  }, [initialServiceType]);

  // Load details
  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchCompanionDetails();
    fetchNotifications();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await apiRequest('bookings', 'tourist_list');
      setBookings(res.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await apiRequest('services', 'list', 'GET', { type: serviceTypeFilter });
      setServices(res.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Re-fetch services when filter changes
  useEffect(() => {
    fetchServices();
  }, [serviceTypeFilter]);

  const fetchCompanionDetails = async () => {
    try {
      const postRes = await apiRequest('companions', 'my_posts');
      setMyPosts(postRes.posts || []);
      const reqRes = await apiRequest('companions', 'my_requests');
      setMyRequests(reqRes.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    // Simulated system notification load or from database table
    setNotifications([
      { id: 1, message: "Welcome to Tripzy! Explore destinations to plan your tour.", date: "Just now" },
      { id: 2, message: "Always pay physically to the provider upon arrival. Tripzy uses offline payment.", date: "1 hour ago" }
    ]);
  };

  // Photo preview effect
  useEffect(() => {
    if (!profilePhoto) {
      setPreviewPhotoUrl('');
      return;
    }
    const url = URL.createObjectURL(profilePhoto);
    setPreviewPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePhoto]);

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      let changed = false;

      const trimmedFull = fullName ? fullName.trim() : '';
      if (trimmedFull !== '' && trimmedFull !== (currentUser.full_name || '')) {
        formData.append('full_name', trimmedFull);
        changed = true;
      }

      const trimmedInit = nameWithInitial ? nameWithInitial.trim() : '';
      if (trimmedInit !== '' && trimmedInit !== (currentUser.name_with_initial || '')) {
        formData.append('name_with_initial', trimmedInit);
        changed = true;
      }

      const trimmedContact = contactNo ? contactNo.trim() : '';
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
        setProfileLoading(false);
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

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('bookings', 'create', 'POST', {
        service_id: selectedService.id,
        service_type: selectedService.service_type,
        start_date: startDate,
        end_date: endDate,
        booking_details: bookingDetails
      });
      alert(res.message);
      setStartDate('');
      setEndDate('');
      setBookingDetails('');
      setSelectedService(null);
      
      const modalElement = document.getElementById('bookServiceModal');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();

      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('services', 'add_review', 'POST', {
        service_id: reviewServiceId,
        rating,
        comment
      });
      alert("Review submitted successfully! Thank you for your feedback.");
      setComment('');
      setRating(5);
      setReviewServiceId(null);

      const modalElement = document.getElementById('addReviewModal');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-person-circle text-primary me-2"></i>Tourist Panel
        </div>
        <div className="text-center mb-4">
          <img 
            src={getUploadUrl(currentUser.profile_photo) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
            alt="Profile" 
            className="rounded-circle border-2 border-success mb-2" 
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <h6 className="fw-bold mb-0 text-white">{currentUser.full_name}</h6>
          <span className="badge bg-success rounded-pill px-2 py-1 mt-1 small">Tourist</span>
        </div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <a href="#" onClick={() => setActiveTab('bookings')}>
              <i className="bi bi-calendar-check"></i> Bookings & History
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'services' ? 'active' : ''}`}>
            <a href="#" onClick={() => setActiveTab('services')}>
              <i className="bi bi-shop"></i> Book Services
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'companion' ? 'active' : ''}`}>
            <a href="#" onClick={() => setActiveTab('companion')}>
              <i className="bi bi-people"></i> My Companions
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
            <a href="#" onClick={() => setActiveTab('profile')}>
              <i className="bi bi-person-fill-gear"></i> Manage Profile
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}>
            <a href="#" onClick={() => setActiveTab('notifications')}>
              <i className="bi bi-bell-fill"></i> Notifications
            </a>
          </li>
        </ul>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="dashboard-content animate-fade-in">
        
        {/* TAB: BOOKINGS & HISTORY */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">My Bookings History</h2>
            <div className="card glass-card border-0 p-4">
              {bookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Ref No</th>
                        <th>Service</th>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(book => (
                        <tr key={book.id}>
                          <td><strong className="text-primary">{book.ref_no}</strong></td>
                          <td>{book.name_of_institute}</td>
                          <td className="text-capitalize">{book.service_type}</td>
                          <td>{book.start_date} to {book.end_date}</td>
                          <td>LKR {Number(book.price).toLocaleString()}</td>
                          <td>
                            <span className={`badge-${book.status}`}>
                              {book.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {book.status === 'completed' && (
                              <button 
                                className="btn btn-outline-gradient btn-sm rounded-pill"
                                data-bs-toggle="modal"
                                data-bs-target="#addReviewModal"
                                onClick={() => setReviewServiceId(book.service_id)}
                              >
                                <i className="bi bi-star-fill me-1"></i> Review
                              </button>
                            )}
                            {book.status === 'pending' && (
                              <span className="text-muted small">Awaiting Payment</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x fs-1 text-muted"></i>
                  <p className="mt-3 text-muted">You haven't made any bookings yet. Head to the 'Book Services' tab to book accommodation, guides, or vehicles.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: BOOK SERVICES */}
        {activeTab === 'services' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <h2 className="fw-bold text-gradient mb-0">Book Tourism Services</h2>
              <div className="btn-group" role="group">
                <button 
                  className={`btn btn-sm ${serviceTypeFilter === 'hotel' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setServiceTypeFilter('hotel')}
                >
                  Hotels
                </button>
                <button 
                  className={`btn btn-sm ${serviceTypeFilter === 'vehicle' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setServiceTypeFilter('vehicle')}
                >
                  Vehicles
                </button>
                <button 
                  className={`btn btn-sm ${serviceTypeFilter === 'guide' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setServiceTypeFilter('guide')}
                >
                  Tour Guides
                </button>
                <button 
                  className={`btn btn-sm ${serviceTypeFilter === 'camping_tool' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setServiceTypeFilter('camping_tool')}
                >
                  Camping Tools
                </button>
              </div>
            </div>

            {services.length > 0 ? (
              <div className="row g-4">
                {services.map(srv => (
                  <div className="col-md-6 col-lg-4" key={srv.id}>
                    <div className="card glass-card h-100 border-0 overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80`} 
                        alt={srv.name_of_institute} 
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                      <div className="card-body p-4 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-info bg-opacity-10 text-info text-capitalize">{srv.service_type}</span>
                            <span className="text-warning small fw-bold">
                              ★ {Number(srv.average_rating).toFixed(1)} ({srv.review_count} reviews)
                            </span>
                          </div>
                          <h5 className="fw-bold text-gradient mb-2">{srv.name_of_institute}</h5>
                          <p className="text-muted small line-clamp-3 mb-3">{srv.description}</p>
                          <div className="mb-3 small">
                            <span className="fw-bold d-block">Contact Support:</span>
                            <span className="text-muted">{srv.contact_no} | {srv.email}</span>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                          <div>
                            <span className="text-muted small">Price / Day:</span>
                            <h5 className="fw-bold mb-0 text-success">LKR {Number(srv.price).toLocaleString()}</h5>
                          </div>
                          <button 
                            className="btn btn-gradient btn-sm rounded-pill px-4"
                            data-bs-toggle="modal"
                            data-bs-target="#bookServiceModal"
                            onClick={() => setSelectedService(srv)}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 card glass-card border-0">
                <i className="bi bi-shop fs-1 text-muted"></i>
                <h5 className="fw-bold mt-3">No Services Available</h5>
                <p className="text-muted">No verified providers are currently listed in this category.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: COMPANIONS */}
        {activeTab === 'companion' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Travel Companion Management</h2>
            <div className="row g-4">
              
              {/* My Companion Posts */}
              <div className="col-md-6">
                <div className="card glass-card border-0 p-4 h-100">
                  <h4 className="fw-bold mb-3 text-primary"><i className="bi bi-postcard-fill me-2"></i> My Travel Posts</h4>
                  {myPosts.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {myPosts.map(post => (
                        <div className="list-group-item bg-transparent px-0 py-3" key={post.id}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="fw-bold mb-1">{post.destination_place}</h6>
                              <span className="text-muted small"><i className="bi bi-calendar"></i> {post.start_date} to {post.end_date}</span>
                            </div>
                            <span className={`badge bg-${post.status === 'open' ? 'success' : 'secondary'} rounded-pill`}>
                              {post.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small text-center py-4">You haven't posted any companion search plans yet.</p>
                  )}
                </div>
              </div>

              {/* My Join Requests Status */}
              <div className="col-md-6">
                <div className="card glass-card border-0 p-4 h-100">
                  <h4 className="fw-bold mb-3 text-success"><i className="bi bi-person-fill-add me-2"></i> Sent Join Requests</h4>
                  {myRequests.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {myRequests.map(req => (
                        <div className="list-group-item bg-transparent px-0 py-3" key={req.id}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="fw-bold mb-1">To: {req.owner_name} ({req.destination_place})</h6>
                              <p className="text-muted small mb-0 italic">Message: "{req.message}"</p>
                              {req.status === 'accepted' && (
                                <div className="bg-success bg-opacity-10 text-success p-2 rounded mt-2 small">
                                  <strong>Contact Info Unlocked:</strong><br />
                                  Phone: {req.owner_contact} <br />
                                  Email: {req.owner_email}
                                </div>
                              )}
                            </div>
                            <span className={`badge-${req.status}`}>
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small text-center py-4">You haven't requested to join other companion plans yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Notification Center</h2>
            <div className="card glass-card border-0 p-4">
              <div className="d-flex flex-column gap-3">
                {notifications.map(n => (
                  <div className="d-flex align-items-start gap-3 p-3 bg-white rounded-3 shadow-sm border-start border-4 border-primary" key={n.id}>
                    <i className="bi bi-info-circle-fill text-primary fs-4"></i>
                    <div>
                      <p className="mb-0 text-dark small">{n.message}</p>
                      <span className="text-muted" style={{ fontSize: '10px' }}>{n.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="fw-bold text-gradient mb-4">Manage Your Tourist Profile</h2>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card glass-card p-4 border-0">
                  <div className="text-center mb-4">
                    <img
                      src={profilePhoto ? previewPhotoUrl : getUploadUrl(currentUser.profile_photo) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt="Profile"
                      className="rounded-circle border-2 border-success mb-3"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <h5 className="fw-bold">{currentUser.full_name}</h5>
                    <p className="text-muted small mb-0">{currentUser.email}</p>
                  </div>
                  <form onSubmit={handleProfileUpdateSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Full Name</label>
                      <input
                        type="text"
                        className="form-control rounded-3 form-control-sm"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={currentUser.full_name || ''}
                      />
                      <div className="form-text small">Leave empty to keep your current name.</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Name with Initials</label>
                      <input
                        type="text"
                        className="form-control rounded-3 form-control-sm"
                        value={nameWithInitial}
                        onChange={(e) => setNameWithInitial(e.target.value)}
                        placeholder={currentUser.name_with_initial || ''}
                      />
                      <div className="form-text small">Leave empty to keep your current initials.</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Contact Phone Number</label>
                      <input
                        type="tel"
                        className="form-control rounded-3 form-control-sm"
                        value={contactNo}
                        onChange={(e) => setContactNo(e.target.value)}
                        placeholder={currentUser.contact_no || ''}
                      />
                      <div className="form-text small">Leave empty to keep your current contact number.</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Update Profile Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control rounded-3 form-control-sm"
                        onChange={(e) => setProfilePhoto(e.target.files[0] || null)}
                      />
                    </div>
                    <button type="submit" className="btn btn-gradient btn-sm rounded-pill px-4" disabled={profileLoading}>
                      {profileLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      <div className="modal fade" id="bookServiceModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Create Service Booking Request</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            {selectedService && (
              <form onSubmit={handleCreateBooking}>
                <div className="modal-body p-4">
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <span className="small text-muted d-block">Booking Service:</span>
                    <strong className="text-dark">{selectedService.name_of_institute}</strong>
                    <span className="d-block text-success fw-bold">LKR {Number(selectedService.price).toLocaleString()} / day</span>
                  </div>

                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold">Start Date</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold">End Date</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Special Requests / Requirements</label>
                    <textarea 
                      className="form-control rounded-3" 
                      rows="3" 
                      value={bookingDetails} 
                      onChange={(e) => setBookingDetails(e.target.value)}
                      placeholder="e.g. Flight arrival time, twin bed requests, dietary parameters..."
                    ></textarea>
                  </div>

                  <div className="alert alert-info py-2 small mb-0" role="alert">
                    <i className="bi bi-info-circle-fill me-1"></i> Tripzy operates **offline cash payments**. You pay physically to the provider.
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-gradient rounded-pill px-4">Submit Request</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* RATING & REVIEW MODAL */}
      <div className="modal fade" id="addReviewModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Feedback & Rating System</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Provide Rating</label>
                  <select className="form-select rounded-3" value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="5">★★★★★ (5 - Excellent)</option>
                    <option value="4">★★★★☆ (4 - Very Good)</option>
                    <option value="3">★★★☆☆ (3 - Average)</option>
                    <option value="2">★★☆☆☆ (2 - Poor)</option>
                    <option value="1">★☆☆☆☆ (1 - Horrible)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Your Review Feedback</label>
                  <textarea 
                    className="form-control rounded-3" 
                    rows="4" 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    required 
                    placeholder="Tell us about your experience with this service provider..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Close</button>
                <button type="submit" className="btn btn-gradient rounded-pill px-4">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
