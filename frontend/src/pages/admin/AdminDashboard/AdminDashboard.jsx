import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../api';

// Components
import Sidebar from './components/Sidebar';
import StatsTab from './components/StatsTab';
import ApprovalsTab from './components/ApprovalsTab';
import DestinationsTab from './components/DestinationsTab';
import FaqsTab from './components/FaqsTab';
import ProfileTab from './components/ProfileTab';
import BookingsTab from './components/BookingsTab';

export default function AdminDashboard({ 
  currentUser, 
  onProfileUpdate, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  showConfirm 
}) {
  
  // Data states
  const [stats, setStats] = useState(null);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchPendingUsers();
    fetchDestinations();
    fetchFaqs();
    fetchBookings();
  }, []);

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

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* ADMIN WORKSPACE */}
      <div className="dashboard-content animate-fade-in">
        {activeTab === 'stats' && (
          <StatsTab stats={stats} />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsTab 
            pendingAdmins={pendingAdmins} 
            pendingProviders={pendingProviders} 
            handleApproveUser={handleApproveUser} 
          />
        )}

        {activeTab === 'destinations' && (
          <DestinationsTab 
            destinations={destinations} 
            fetchDestinations={fetchDestinations} 
            showConfirm={showConfirm} 
          />
        )}

        {activeTab === 'faqs' && (
          <FaqsTab 
            faqs={faqs} 
            fetchFaqs={fetchFaqs} 
            showConfirm={showConfirm} 
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab 
            currentUser={currentUser} 
            onProfileUpdate={onProfileUpdate} 
            destinations={destinations} 
            faqs={faqs} 
            bookings={bookings} 
            pendingAdmins={pendingAdmins} 
            pendingProviders={pendingProviders} 
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab bookings={bookings} />
        )}
      </div>
    </div>
  );
}
