import React from 'react';
import { getUploadUrl } from '../../../../api';

export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout }) {
  return (
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
  );
}
