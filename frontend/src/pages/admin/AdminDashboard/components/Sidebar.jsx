import React from 'react';
import { getUploadUrl } from '../../../../api';

export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout }) {
  return (
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
        <li className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}>
            <i className="bi bi-people-fill"></i> Manage Users
          </a>
        </li>
        <li className="sidebar-item mt-4 border-top pt-3">
          <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="text-danger fw-bold">
            <i className="bi bi-box-arrow-right text-danger"></i> Logout
          </a>
        </li>
      </ul>
    </div>
  );
}
