import React from 'react';

export default function BookingsTab({ bookings, setReviewServiceId }) {
  return (
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
  );
}
