import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../api';

// Components
import Sidebar from './components/Sidebar';
import ListingsTab from './components/ListingsTab';
import AddServiceTab from './components/AddServiceTab';
import ProfileTab from './components/ProfileTab';
import BookingsTab from './components/BookingsTab';
import CustomerDetailsModal from './components/CustomerDetailsModal';

export default function ProviderDashboard({ 
  currentUser, 
  onProfileUpdate, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  showConfirm 
}) {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);

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

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* CONTENT REGION */}
      <div className="dashboard-content animate-fade-in">
        {activeTab === 'listings' && (
          <ListingsTab 
            listings={listings} 
            fetchListings={fetchListings} 
            showConfirm={showConfirm} 
          />
        )}

        {activeTab === 'add_service' && (
          <AddServiceTab 
            currentUser={currentUser} 
            setActiveTab={setActiveTab} 
            fetchListings={fetchListings} 
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab 
            currentUser={currentUser} 
            onProfileUpdate={onProfileUpdate} 
            listings={listings} 
            bookings={bookings} 
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab 
            bookings={bookings} 
            setSelectedCust={setSelectedCust} 
            fetchBookings={fetchBookings} 
          />
        )}
      </div>

      {/* MODAL */}
      <CustomerDetailsModal selectedCust={selectedCust} />
    </div>
  );
}
