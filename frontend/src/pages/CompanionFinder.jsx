import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';

export default function CompanionFinder({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Filters
  const [filterDest, setFilterDest] = useState('');
  const [filterGender, setFilterGender] = useState('');

  // Create Post Form State
  const [dest, setDest] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [companionsNeeded, setCompanionsNeeded] = useState(1);
  const [genderPref, setGenderPref] = useState('Any');
  const [interests, setInterests] = useState('');
  const [desc, setDesc] = useState('');

  // Request Join Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filterDest, filterGender]);

  const fetchPosts = async () => {
    try {
      const res = await apiRequest('companions', 'list_posts', 'GET', {
        destination: filterDest,
        gender_preference: filterGender
      });
      setPosts(res.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setMsg({ type: 'danger', text: 'You must log in to create companion posts.' });
      return;
    }
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      await apiRequest('companions', 'create_post', 'POST', {
        destination_place: dest,
        start_date: startDate,
        end_date: endDate,
        budget_range: budget,
        companions_needed: companionsNeeded,
        gender_preference: genderPref,
        travel_interests: interests,
        description: desc
      });
      
      setMsg({ type: 'success', text: 'Companion finder post created successfully!' });
      setDest('');
      setStartDate('');
      setEndDate('');
      setBudget('');
      setCompanionsNeeded(1);
      setGenderPref('Any');
      setInterests('');
      setDesc('');

      fetchPosts();
      
      // Close modal
      const modalElement = document.getElementById('createPostModal');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to join trips.");
      return;
    }
    try {
      await apiRequest('companions', 'send_request', 'POST', {
        post_id: selectedPost.id,
        message: requestMsg
      });
      alert("Join request sent successfully! You will be notified via email once the host approves.");
      setRequestMsg('');
      
      const modalElement = document.getElementById('requestJoinModal');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold text-gradient display-5">Travel Companion Finder</h1>
          <p className="text-muted mb-0">Don't travel alone. Find like-minded companions to explore Sri Lanka and share expenses.</p>
        </div>
        {currentUser ? (
          <button 
            className="btn btn-gradient px-4 py-2 rounded-3 shadow" 
            data-bs-toggle="modal" 
            data-bs-target="#createPostModal"
          >
            <i className="bi bi-plus-circle-fill me-2"></i> Post Travel Plan
          </button>
        ) : (
          <span className="text-muted small">Log in to post your travel plan</span>
        )}
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type} text-center`} role="alert">
          {msg.text}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="card glass-card p-3 border-0 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label small fw-bold">Filter Destination</label>
            <input 
              type="text" 
              className="form-control rounded-3" 
              placeholder="e.g. Ella, Kandy..." 
              value={filterDest}
              onChange={(e) => setFilterDest(e.target.value)}
            />
          </div>
          <div className="col-md-5">
            <label className="form-label small fw-bold">Gender Preference</label>
            <select className="form-select rounded-3" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="">Any Gender Preference</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
              <option value="Any">Co-ed / Any</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-gradient w-100 py-2 rounded-3" onClick={() => { setFilterDest(''); setFilterGender(''); }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* POSTINGS GRID */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Posts...</span>
          </div>
        </div>
      ) : posts.length > 0 ? (
        <div className="row g-4">
          {posts.map((post) => {
            const age = post.date_of_birth ? new Date().getFullYear() - new Date(post.date_of_birth).getFullYear() : 25;
            return (
              <div className="col-md-6 col-lg-4" key={post.id}>
                <div className="card glass-card h-100 border-0 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-3">
                      <img 
                        src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80`} 
                        alt={post.full_name} 
                        className="rounded-circle border border-2 border-primary" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="fw-bold mb-0">{post.full_name}</h6>
                        <span className="text-muted small text-capitalize">{post.owner_gender}, {age} yrs</span>
                      </div>
                    </div>

                    <h4 className="fw-bold text-gradient mb-2">{post.destination_place}</h4>
                    
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-primary bg-opacity-10 text-primary small">
                        <i className="bi bi-calendar-event me-1"></i> {post.start_date} to {post.end_date}
                      </span>
                      <span className="badge bg-success bg-opacity-10 text-success small">
                        <i className="bi bi-wallet2 me-1"></i> LKR {post.budget_range}
                      </span>
                    </div>

                    <p className="text-muted small line-clamp-3 mb-3">{post.description}</p>
                    
                    <div className="mb-3">
                      <span className="small d-block fw-bold text-secondary">Travel Interests:</span>
                      <span className="text-muted small">{post.travel_interests}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="small text-muted">
                      Need: <strong className="text-dark">{post.companions_needed}</strong> companions
                    </span>
                    {currentUser && currentUser.id == post.owner_id ? (
                      <span className="badge bg-info text-white rounded-pill px-3 py-2">Your Post</span>
                    ) : (
                      <button 
                        className="btn btn-gradient btn-sm rounded-pill px-3"
                        data-bs-toggle="modal"
                        data-bs-target="#requestJoinModal"
                        onClick={() => setSelectedPost(post)}
                      >
                        Join Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5 card glass-card border-0">
          <i className="bi bi-people fs-1 text-muted"></i>
          <h4 className="fw-bold mt-3">No Active Companion Searches</h4>
          <p className="text-muted">Create a new travel plan to find companions.</p>
        </div>
      )}

      {/* CREATE COMPANION PLAN MODAL */}
      <div className="modal fade" id="createPostModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Create Companion Request Post</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Destination / Place</label>
                  <input 
                    type="text" 
                    className="form-control rounded-3" 
                    value={dest} 
                    onChange={(e) => setDest(e.target.value)} 
                    required 
                    placeholder="e.g. Ella, Kandy, Sigiriya"
                  />
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

                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Budget Range (LKR)</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3" 
                      value={budget} 
                      onChange={(e) => setBudget(e.target.value)} 
                      required 
                      placeholder="e.g. 10,000 - 20,000"
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Companions Needed</label>
                    <input 
                      type="number" 
                      className="form-control rounded-3" 
                      min="1"
                      value={companionsNeeded} 
                      onChange={(e) => setCompanionsNeeded(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Gender Preference</label>
                  <select className="form-select rounded-3" value={genderPref} onChange={(e) => setGenderPref(e.target.value)}>
                    <option value="Any">Co-ed / Any Gender</option>
                    <option value="male">Male Companions Only</option>
                    <option value="female">Female Companions Only</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Travel Interests</label>
                  <input 
                    type="text" 
                    className="form-control rounded-3" 
                    value={interests} 
                    onChange={(e) => setInterests(e.target.value)} 
                    required 
                    placeholder="e.g. Hiking, Photography, Camping"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">About the Trip / Description</label>
                  <textarea 
                    className="form-control rounded-3" 
                    rows="3" 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
                    required 
                    placeholder="Describe your trip itinerary, plans, and who you are looking to travel with..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-gradient rounded-pill px-4" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* REQUEST JOIN MODAL */}
      <div className="modal fade" id="requestJoinModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Request to Join Trip</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSendRequest}>
              <div className="modal-body p-4">
                {selectedPost && (
                  <div className="bg-light p-3 rounded-3 mb-3">
                    <span className="small text-muted d-block">Requesting to join trip of:</span>
                    <strong className="text-dark">{selectedPost.full_name}</strong> to <strong>{selectedPost.destination_place}</strong>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-bold">Introduction Message</label>
                  <textarea 
                    className="form-control rounded-3" 
                    rows="4" 
                    value={requestMsg} 
                    onChange={(e) => setRequestMsg(e.target.value)} 
                    required 
                    placeholder="Introduce yourself, mention why you want to join and how your budget fits..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-gradient rounded-pill px-4">Send Join Request</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
