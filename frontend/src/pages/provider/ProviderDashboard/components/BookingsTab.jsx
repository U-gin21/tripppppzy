import React from 'react';
import { apiRequest } from '../../../../api';

export default function BookingsTab({ bookings, setSelectedCust, fetchBookings }) {
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
  );
}
