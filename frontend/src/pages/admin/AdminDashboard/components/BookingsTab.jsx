import React from 'react';

export default function BookingsTab({ bookings }) {
  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">Monitor System Bookings</h2>
      <div className="card glass-card border-0 p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Ref No</th>
                <th>Service Name</th>
                <th>Type</th>
                <th>Tourist Client</th>
                <th>Service Provider</th>
                <th>Pricing</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td><strong className="text-primary">{b.ref_no}</strong></td>
                  <td>{b.name_of_institute}</td>
                  <td className="text-capitalize">{b.service_type}</td>
                  <td>{b.tourist_name}</td>
                  <td>{b.provider_name}</td>
                  <td>LKR {Number(b.price).toLocaleString()}</td>
                  <td>
                    <span className={`badge-${b.status}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
