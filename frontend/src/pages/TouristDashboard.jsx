import React, { useEffect, useState, useRef } from 'react';
import { apiRequest, getUploadUrl } from '../api';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default function TouristDashboard({ currentUser, onProfileUpdate, initialServiceType, onLogout, activeTab, setActiveTab, showConfirm }) {

  // Data states
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [companionPosts, setCompanionPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
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
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [serviceBookings, setServiceBookings] = useState([]);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const startDateInstance = useRef(null);
  const endDateInstance = useRef(null);

  // Review Form State
  const [reviewServiceId, setReviewServiceId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Companion Post Form State
  const [postDest, setPostDest] = useState('');
  const [postStartDate, setPostStartDate] = useState('');
  const [postEndDate, setPostEndDate] = useState('');
  const [postBudget, setPostBudget] = useState('');
  const [postCompanionsNeeded, setPostCompanionsNeeded] = useState(1);
  const [postGenderPref, setPostGenderPref] = useState('Any');
  const [postInterests, setPostInterests] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [requestPost, setRequestPost] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Search service filter
  const [serviceTypeFilter, setServiceTypeFilter] = useState(initialServiceType || 'hotel');



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

  useEffect(() => {
    if (selectedService) {
      fetchServiceBookings(selectedService.id);
    } else {
      setServiceBookings([]);
    }
  }, [selectedService]);

  const fetchServiceBookings = async (serviceId) => {
    try {
      const res = await apiRequest('bookings', 'service_bookings', 'GET', { service_id: serviceId });
      setServiceBookings(res.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Destroy previous instances if they exist
    if (startDateInstance.current) {
      startDateInstance.current.destroy();
      startDateInstance.current = null;
    }
    if (endDateInstance.current) {
      endDateInstance.current.destroy();
      endDateInstance.current = null;
    }

    if (!selectedService || !startDateRef.current || !endDateRef.current) return;

    const disableRanges = serviceBookings.map(b => ({
      from: b.start_date,
      to: b.end_date
    }));

    // Initialize Start Date Picker
    startDateInstance.current = flatpickr(startDateRef.current, {
      dateFormat: "Y-m-d",
      minDate: "today",
      disable: disableRanges,
      onChange: (selectedDates, dateStr) => {
        setStartDate(dateStr);
        // Clear end date if it is before start date or overlaps
        if (endDate) {
          const sVal = new Date(dateStr);
          const eVal = new Date(endDate);
          sVal.setHours(0,0,0,0);
          eVal.setHours(0,0,0,0);
          if (sVal > eVal) {
            setEndDate('');
            if (endDateInstance.current) {
              endDateInstance.current.clear();
            }
          } else {
            // Check overlap
            const overlap = serviceBookings.some(b => {
              const sOld = new Date(b.start_date);
              const eOld = new Date(b.end_date);
              sOld.setHours(0,0,0,0);
              eOld.setHours(0,0,0,0);
              return sVal <= eOld && eVal >= sOld;
            });
            if (overlap) {
              setEndDate('');
              if (endDateInstance.current) {
                endDateInstance.current.clear();
              }
            }
          }
        }
      }
    });

    // Initialize End Date Picker
    endDateInstance.current = flatpickr(endDateRef.current, {
      dateFormat: "Y-m-d",
      minDate: startDate || "today",
      disable: disableRanges,
      onChange: (selectedDates, dateStr) => {
        setEndDate(dateStr);
      }
    });

    // Clean up instances when unmounting or dependencies change
    return () => {
      if (startDateInstance.current) {
        startDateInstance.current.destroy();
        startDateInstance.current = null;
      }
      if (endDateInstance.current) {
        endDateInstance.current.destroy();
        endDateInstance.current = null;
      }
    };
  }, [selectedService, serviceBookings]);

  // Adjust minDate of End Date Picker when startDate changes
  useEffect(() => {
    if (endDateInstance.current) {
      endDateInstance.current.set("minDate", startDate || "today");
    }
  }, [startDate]);

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
      const sharedPostsRes = await apiRequest('companions', 'list_posts', 'GET');
      setCompanionPosts(sharedPostsRes.posts || []);
      const postRes = await apiRequest('companions', 'my_posts');
      setMyPosts(postRes.posts || []);
      const reqRes = await apiRequest('companions', 'my_requests');
      setMyRequests(reqRes.requests || []);
      const incomingRes = await apiRequest('companions', 'incoming_requests');
      setIncomingRequests(incomingRes.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to safely hide modals
  const safeHideModal = (modalId) => {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement && window.bootstrap && window.bootstrap.Modal) {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
    } catch (err) {
      console.error(`Error hiding modal ${modalId}:`, err);
    }
  };

  const handleSendCompanionRequest = async (e) => {
    e.preventDefault();
    if (!requestPost) {
      return;
    }
    setRequestSubmitting(true);
    try {
      await apiRequest('companions', 'send_request', 'POST', {
        post_id: requestPost.id,
        message: requestMsg
      });
      alert('Join request sent successfully! The host will be notified.');
      setRequestMsg('');
      setRequestPost(null);
      fetchCompanionDetails();
      safeHideModal('requestJoinModal');
    } catch (err) {
      alert(err.message);
    } finally {
      setRequestSubmitting(false);
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

  const handleStartDateChange = (val) => {
    if (!val) {
      setStartDate('');
      return;
    }
    const selectedDate = new Date(val);
    selectedDate.setHours(0,0,0,0);
    
    const isBooked = serviceBookings.some(b => {
      const s = new Date(b.start_date);
      const e = new Date(b.end_date);
      s.setHours(0,0,0,0);
      e.setHours(0,0,0,0);
      return selectedDate >= s && selectedDate <= e;
    });

    if (isBooked) {
      alert("This date is already booked. Please select an available date.");
      setStartDate('');
      return;
    }

    if (endDate) {
      const eNew = new Date(endDate);
      eNew.setHours(0,0,0,0);
      if (selectedDate > eNew) {
        alert("Start date cannot be after end date.");
        setStartDate('');
        return;
      }
      
      const hasOverlap = serviceBookings.some(b => {
        const sOld = new Date(b.start_date);
        const eOld = new Date(b.end_date);
        sOld.setHours(0,0,0,0);
        eOld.setHours(0,0,0,0);
        return selectedDate <= eOld && eNew >= sOld;
      });

      if (hasOverlap) {
        alert("The selected range overlaps with an existing booking. Please choose a different range.");
        setStartDate('');
        return;
      }
    }
    setStartDate(val);
  };

  const handleEndDateChange = (val) => {
    if (!val) {
      setEndDate('');
      return;
    }
    const selectedDate = new Date(val);
    selectedDate.setHours(0,0,0,0);

    const isBooked = serviceBookings.some(b => {
      const s = new Date(b.start_date);
      const e = new Date(b.end_date);
      s.setHours(0,0,0,0);
      e.setHours(0,0,0,0);
      return selectedDate >= s && selectedDate <= e;
    });

    if (isBooked) {
      alert("This date is already booked. Please select an available date.");
      setEndDate('');
      return;
    }

    if (startDate) {
      const sNew = new Date(startDate);
      sNew.setHours(0,0,0,0);
      if (selectedDate < sNew) {
        alert("End date cannot be before start date.");
        setEndDate('');
        return;
      }
      
      const hasOverlap = serviceBookings.some(b => {
        const sOld = new Date(b.start_date);
        const eOld = new Date(b.end_date);
        sOld.setHours(0,0,0,0);
        eOld.setHours(0,0,0,0);
        return sNew <= eOld && selectedDate >= sOld;
      });

      if (hasOverlap) {
        alert("The selected range overlaps with an existing booking. Please choose a different range.");
        setEndDate('');
        return;
      }
    }
    setEndDate(val);
  };

  const isDateOverlapping = (start, end) => {
    if (!start || !end) return false;
    const sNew = new Date(start);
    const eNew = new Date(end);
    sNew.setHours(0,0,0,0);
    eNew.setHours(0,0,0,0);

    return serviceBookings.some(b => {
      const sOld = new Date(b.start_date);
      const eOld = new Date(b.end_date);
      sOld.setHours(0,0,0,0);
      eOld.setHours(0,0,0,0);
      return sNew <= eOld && eNew >= sOld;
    });
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (bookingSubmitting) return;

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date.");
      return;
    }

    if (isDateOverlapping(startDate, endDate)) {
      alert("This service is already booked for the selected dates. Please choose a different date range.");
      return;
    }

    setBookingSubmitting(true);
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
      safeHideModal('bookServiceModal');
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setBookingSubmitting(false);
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
      safeHideModal('addReviewModal');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCompanionPost = async (e) => {
    e.preventDefault();
    setPostSubmitting(true);
    try {
      await apiRequest('companions', 'create_post', 'POST', {
        destination_place: postDest,
        start_date: postStartDate,
        end_date: postEndDate,
        budget_range: postBudget,
        companions_needed: postCompanionsNeeded,
        gender_preference: postGenderPref,
        travel_interests: postInterests,
        description: postDesc
      });
      alert('Companion post created successfully.');
      setPostDest('');
      setPostStartDate('');
      setPostEndDate('');
      setPostBudget('');
      setPostCompanionsNeeded(1);
      setPostGenderPref('Any');
      setPostInterests('');
      setPostDesc('');
      fetchCompanionDetails();
      safeHideModal('createCompanionPostModal');
    } catch (err) {
      alert(err.message);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await apiRequest('companions', 'update_request', 'POST', {
        request_id: requestId,
        status: 'accepted'
      });
      alert("Request accepted! Contact details have been shared via email.");
      fetchCompanionDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await apiRequest('companions', 'update_request', 'POST', {
        request_id: requestId,
        status: 'rejected'
      });
      alert("Request rejected.");
      fetchCompanionDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePost = (postId) => {
    showConfirm(
      "Are you sure you want to delete this companion post? This action cannot be undone.",
      async () => {
        try {
          await apiRequest('companions', 'delete_post', 'POST', { post_id: postId });
          alert("Companion post deleted successfully.");
          fetchCompanionDetails();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete Companion Post"
    );
  };

  const handleClosePost = (postId) => {
    showConfirm(
      "Close this companion search? You will no longer accept new requests.",
      async () => {
        try {
          await apiRequest('companions', 'close_post', 'POST', { post_id: postId });
          alert("Companion post closed. No more join requests accepted.");
          fetchCompanionDetails();
        } catch (err) {
          alert(err.message);
        }
      },
      "Close Companion Search"
    );
  };

  const handleCancelRequest = (requestId) => {
    showConfirm(
      "Cancel this join request? You can send another request later.",
      async () => {
        try {
          await apiRequest('companions', 'cancel_request', 'POST', { request_id: requestId });
          alert("Join request cancelled.");
          fetchCompanionDetails();
        } catch (err) {
          alert(err.message);
        }
      },
      "Cancel Join Request"
    );
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
            src={currentUser.profile_photo && currentUser.profile_photo !== 'default_profile.jpg'
              ? getUploadUrl(currentUser.profile_photo)
              : (currentUser.gender === 'female' 
                  ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                  : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80")} 
            alt="Profile" 
            className="rounded-circle border-2 border-success mb-2" 
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <h6 className="fw-bold mb-0 text-white">{currentUser.full_name}</h6>
          <span className="badge bg-success rounded-pill px-2 py-1 mt-1 small">Tourist</span>
        </div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('bookings'); }}>
              <i className="bi bi-calendar-check"></i> Bookings & History
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'services' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('services'); }}>
              <i className="bi bi-shop"></i> Book Services
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'companion' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('companion'); }}>
              <i className="bi bi-people"></i> My Companions
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
              <i className="bi bi-person-fill-gear"></i> Manage Profile
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('notifications'); }}>
              <i className="bi bi-bell-fill"></i> Notifications
            </a>
          </li>
          <li className="sidebar-item mt-4 border-top pt-3">
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="text-danger fw-bold">
              <i className="bi bi-box-arrow-right text-danger"></i> Logout
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
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom pb-3">
              <div>
                <h2 className="fw-bold text-gradient mb-1">Book Tourism Services</h2>
                <p className="text-muted small mb-0">Reserve premium hotels, vehicles, guides, or camping tools in Sri Lanka.</p>
              </div>
              <div className="d-flex gap-2 bg-white p-2 rounded-pill shadow-sm border">
                {[
                  { id: 'hotel', label: 'Hotels', icon: 'bi-building' },
                  { id: 'vehicle', label: 'Vehicles', icon: 'bi-car-front' },
                  { id: 'guide', label: 'Guides', icon: 'bi-compass' },
                  { id: 'camping_tool', label: 'Camping', icon: 'bi-backpack' },
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`btn px-3 py-2 rounded-pill fw-bold border-0 transition d-flex align-items-center gap-2`}
                    style={{
                      background: serviceTypeFilter === item.id ? 'var(--grad-blue-green)' : 'transparent',
                      color: serviceTypeFilter === item.id ? '#fff' : '#64748b',
                      fontSize: '13px',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onClick={() => setServiceTypeFilter(item.id)}
                  >
                    <i className={`bi ${item.icon}`}></i> {item.label}
                  </button>
                ))}
              </div>
            </div>

            {services.length > 0 ? (
              <div className="row g-4">
                {services.map(srv => (
                  <div className="col-md-6 col-lg-4" key={srv.id}>
                    <div className="card glass-card h-100 border-0 overflow-hidden">
                      <img 
                        src={getUploadUrl(srv.photo) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'} 
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold text-gradient mb-1">Travel Companion Management</h2>
                <p className="text-muted small mb-0">Create posts, manage requests and share travel plans with other tourists.</p>
              </div>
              <button
                className="btn btn-gradient btn-sm rounded-pill"
                data-bs-toggle="modal"
                data-bs-target="#createCompanionPostModal"
              >
                <i className="bi bi-plus-circle-fill me-1"></i> Create Post
              </button>
            </div>

            <div className="card glass-card border-0 p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-1">Open Companion Posts</h5>
                  <p className="text-muted small mb-0">Browse all currently open travel plans from other tourists.</p>
                </div>
                <button className="btn btn-sm btn-outline-gradient" onClick={fetchCompanionDetails}>
                  Refresh Feed
                </button>
              </div>
              {companionPosts.length > 0 ? (
                <div className="row g-3">
                  {companionPosts.map((post) => (
                    <div className="col-md-6 col-lg-4" key={post.id}>
                      <div className="card glass-card border-0 p-3 h-100">
                        <h6 className="fw-bold mb-2">{post.destination_place}</h6>
                        <p className="text-muted small mb-2">{post.start_date} to {post.end_date}</p>
                        <p className="text-muted small mb-2">Need: {post.companions_needed} companion{post.companions_needed !== 1 ? 's' : ''}</p>
                        <p className="text-muted small mb-2">{post.travel_interests}</p>
                        <p className="small text-secondary text-truncate">{post.description}</p>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                          <span className="badge bg-success bg-opacity-10 text-success small">{post.gender_preference}</span>
                          {currentUser && currentUser.id !== post.owner_id ? (
                            <button
                              className="btn btn-gradient btn-sm rounded-pill px-3"
                              data-bs-toggle="modal"
                              data-bs-target="#requestJoinModal"
                              onClick={() => {
                                setRequestPost(post);
                                setRequestMsg('');
                              }}
                            >
                              Request Join
                            </button>
                          ) : (
                            <span className="badge bg-info bg-opacity-10 text-info small">Your Post</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No open companion posts are available right now.</p>
                </div>
              )}
            </div>

            <div className="row g-4">
              
              {/* Column 1: My Companion Posts */}
              <div className="col-lg-4">
                <div className="card glass-card border-0 p-4 h-100">
                  <h5 className="fw-bold mb-3 text-primary"><i className="bi bi-postcard-fill me-2"></i> My Travel Posts</h5>
                  {myPosts.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {myPosts.map(post => {
                        const incomingCount = incomingRequests.filter(r => r.post_id === post.id && r.status === 'pending').length;
                        return (
                          <div className="list-group-item bg-transparent px-0 py-3 border-bottom" key={post.id}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1">
                                <h6 className="fw-bold mb-1">{post.destination_place}</h6>
                                <span className="text-muted small d-block"><i className="bi bi-calendar"></i> {post.start_date} to {post.end_date}</span>
                              </div>
                              <span className={`badge bg-${post.status === 'open' ? 'success' : 'danger'} rounded-pill small`}>
                                {post.status.toUpperCase()}
                              </span>
                            </div>
                            {incomingCount > 0 && (
                              <span className="badge bg-info rounded-pill small mb-2">
                                {incomingCount} new request{incomingCount !== 1 ? 's' : ''}
                              </span>
                            )}
                            <div className="d-flex gap-2 pt-2">
                              {post.status === 'open' && (
                                <>
                                  <button 
                                    className="btn btn-warning btn-sm btn-sm rounded-2 flex-grow-1"
                                    onClick={() => handleClosePost(post.id)}
                                    title="Close this post when you've found enough companions"
                                  >
                                    Close
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm rounded-2"
                                    onClick={() => handleDeletePost(post.id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </>
                              )}
                              {post.status === 'closed' && (
                                <button 
                                  className="btn btn-danger btn-sm w-100 rounded-2"
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted small text-center py-4">No companion search posts yet.</p>
                  )}
                </div>
              </div>

              {/* Column 2: Incoming Requests (NEW!) */}
              <div className="col-lg-4">
                <div className="card glass-card border-0 p-4 h-100">
                  <h5 className="fw-bold mb-3 text-warning"><i className="bi bi-inbox-fill me-2"></i> Incoming Requests</h5>
                  {incomingRequests.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {incomingRequests.map(req => {
                        const age = req.date_of_birth ? new Date().getFullYear() - new Date(req.date_of_birth).getFullYear() : '?';
                        return (
                          <div className="list-group-item bg-transparent px-0 py-3 border-bottom" key={req.id}>
                            <div className="mb-2">
                              <div className="d-flex gap-2 align-items-start mb-2">
                                <img 
                                  src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80`} 
                                  alt={req.requester_name} 
                                  className="rounded-circle" 
                                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                  <h6 className="fw-bold mb-0 small">{req.requester_name}</h6>
                                  <span className="text-muted text-capitalize" style={{ fontSize: '11px' }}>
                                    {req.requester_gender}, {age} yrs • {req.destination_place}
                                  </span>
                                </div>
                              </div>
                              <p className="text-muted small mb-2 italic" style={{ fontSize: '12px' }}>"{req.message}"</p>
                              <span className={`badge badge-${req.status} small`}>
                                {req.status.toUpperCase()}
                              </span>
                            </div>
                            {req.status === 'pending' && (
                              <div className="d-flex gap-2 pt-2">
                                <button 
                                  className="btn btn-success btn-sm flex-grow-1 rounded-2"
                                  onClick={() => handleApproveRequest(req.id)}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm flex-grow-1 rounded-2"
                                  onClick={() => handleRejectRequest(req.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted small text-center py-4">No incoming requests yet.</p>
                  )}
                </div>
              </div>

              {/* Column 3: Sent Join Requests */}
              <div className="col-lg-4">
                <div className="card glass-card border-0 p-4 h-100">
                  <h5 className="fw-bold mb-3 text-success"><i className="bi bi-person-fill-add me-2"></i> Sent Requests</h5>
                  {myRequests.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {myRequests.map(req => (
                        <div className="list-group-item bg-transparent px-0 py-3 border-bottom" key={req.id}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold mb-1 small">To: {req.owner_name}</h6>
                              <span className="text-muted small d-block">{req.destination_place}</span>
                              <span className="text-muted small d-block" style={{ fontSize: '11px' }}>
                                {req.start_date} to {req.end_date}
                              </span>
                            </div>
                            <span className={`badge badge-${req.status} small`}>
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                          {req.status === 'accepted' && (
                            <div className="bg-success bg-opacity-10 text-success p-2 rounded mb-2 small">
                              <strong>Contact Info Shared:</strong><br />
                              <i className="bi bi-telephone"></i> {req.owner_contact} <br />
                              <i className="bi bi-envelope"></i> {req.owner_email}
                            </div>
                          )}
                          {req.status === 'pending' && (
                            <button 
                              className="btn btn-outline-danger btn-sm w-100 rounded-2"
                              onClick={() => handleCancelRequest(req.id)}
                            >
                              Cancel Request
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small text-center py-4">No sent requests yet.</p>
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
                      <label htmlFor="profile-photo-input" className="profile-upload-overlay" title="Upload New Photo">
                        <i className="bi bi-camera-fill"></i>
                      </label>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="profile-photo-input"
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => setProfilePhoto(e.target.files[0] || null)}
                  />
                  <h4 className="fw-bold mb-1 text-gradient">{currentUser.full_name}</h4>
                  <div className="mb-2">
                    <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-10 px-3 py-1">Tourist Account</span>
                  </div>
                  <div className="profile-verified-badge mb-4">
                    <i className="bi bi-shield-fill-check"></i> {currentUser.email} (Verified)
                  </div>
                  
                  <div className="px-3">
                    <h6 className="fw-bold text-start text-uppercase text-secondary small mb-3 border-bottom pb-2">Platform Activity</h6>
                    <div className="row g-3 text-start">
                      <div className="col-6">
                        <div className="profile-stat-box text-center">
                          <div className="profile-stat-icon bg-success bg-opacity-10 text-success mx-auto">
                            <i className="bi bi-calendar-check-fill"></i>
                          </div>
                          <h4 className="fw-bold mb-0 text-dark">{bookings.length}</h4>
                          <span className="text-muted small">Total Bookings</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="profile-stat-box text-center">
                          <div className="profile-stat-icon bg-primary bg-opacity-10 text-primary mx-auto">
                            <i className="bi bi-compass-fill"></i>
                          </div>
                          <h4 className="fw-bold mb-0 text-dark">{myPosts.length}</h4>
                          <span className="text-muted small">Travel Plans</span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="profile-stat-box d-flex align-items-center gap-3">
                          <div className="profile-stat-icon bg-warning bg-opacity-10 text-warning mb-0">
                            <i className="bi bi-person-plus-fill"></i>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0 text-dark">{myRequests.length}</h5>
                            <span className="text-muted small">Sent Join Requests</span>
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
                  <h4 className="fw-bold mb-2 text-gradient"><i className="bi bi-person-fill-gear me-2"></i>Account Information</h4>
                  <p className="text-muted small mb-4">Edit fields you wish to update. Unchanged fields will remain as they are.</p>
                  <form onSubmit={handleProfileUpdateSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Full Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-secondary"></i></span>
                          <input
                            type="text"
                            className="form-control rounded-end-3"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
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
                            value={nameWithInitial}
                            onChange={(e) => setNameWithInitial(e.target.value)}
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
                            value={contactNo}
                            onChange={(e) => setContactNo(e.target.value)}
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
                        type="text" 
                        ref={startDateRef}
                        className="form-control rounded-3 bg-white" 
                        value={startDate} 
                        placeholder="Select Start Date"
                        readOnly
                        required 
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold">End Date</label>
                      <input 
                        type="text" 
                        ref={endDateRef}
                        className="form-control rounded-3 bg-white" 
                        value={endDate} 
                        placeholder="Select End Date"
                        readOnly
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
                  <button type="submit" className="btn btn-gradient rounded-pill px-4" disabled={bookingSubmitting}>
                    {bookingSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
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

      {/* COMPANION CREATE POST MODAL */}
      <div className="modal fade" id="createCompanionPostModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Create Companion Post</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleCreateCompanionPost}>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Destination / Place</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={postDest}
                    onChange={(e) => setPostDest(e.target.value)}
                    required
                    placeholder="e.g. Nuwara Eliya, Galle, Kandy"
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Start Date</label>
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={postStartDate}
                      onChange={(e) => setPostStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">End Date</label>
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={postEndDate}
                      onChange={(e) => setPostEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3 row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Budget Range</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={postBudget}
                      onChange={(e) => setPostBudget(e.target.value)}
                      placeholder="e.g. 15,000 - 25,000"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Companions Needed</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control rounded-3"
                      value={postCompanionsNeeded}
                      onChange={(e) => setPostCompanionsNeeded(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3 row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Gender Preference</label>
                    <select
                      className="form-select rounded-3"
                      value={postGenderPref}
                      onChange={(e) => setPostGenderPref(e.target.value)}
                    >
                      <option>Any</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Travel Interests</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={postInterests}
                      onChange={(e) => setPostInterests(e.target.value)}
                      placeholder="e.g. hiking, culture, food"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Additional Details</label>
                  <textarea
                    className="form-control rounded-3"
                    rows="4"
                    value={postDesc}
                    onChange={(e) => setPostDesc(e.target.value)}
                    placeholder="Describe your travel plan, preferred activities, and what kind of companion you are looking for..."
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-gradient rounded-pill px-4" disabled={postSubmitting}>
                  {postSubmitting ? 'Posting...' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* COMPANION REQUEST JOIN MODAL */}
      <div className="modal fade" id="requestJoinModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Request to Join Trip</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSendCompanionRequest}>
              <div className="modal-body p-4">
                {requestPost ? (
                  <>
                    <div className="mb-3">
                      <span className="small text-muted d-block">Trip destination</span>
                      <strong>{requestPost.destination_place}</strong>
                    </div>
                    <div className="mb-3">
                      <span className="small text-muted d-block">Host</span>
                      <strong>{requestPost.full_name}</strong>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Message to Host</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="4"
                        value={requestMsg}
                        onChange={(e) => setRequestMsg(e.target.value)}
                        placeholder="Tell them why you want to join or what kind of travel companion you are..."
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-muted small">Select a trip to request to join.</p>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-gradient rounded-pill px-4" disabled={requestSubmitting || !requestPost}>
                  {requestSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
