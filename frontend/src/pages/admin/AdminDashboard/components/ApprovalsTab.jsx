import React from 'react';

export default function ApprovalsTab({ pendingAdmins, pendingProviders, handleApproveUser }) {
  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">Pending Requests Approval Panel</h2>
      
      <div className="row g-4">
        {/* Admin Registrations approvals */}
        <div className="col-md-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h4 className="fw-bold mb-3 text-danger"><i className="bi bi-person-lock"></i> Pending Admins</h4>
            {pendingAdmins.length > 0 ? (
              <div className="list-group list-group-flush">
                {pendingAdmins.map(adm => (
                  <div className="list-group-item bg-transparent px-0 py-3 d-flex justify-content-between align-items-center" key={adm.id}>
                    <div>
                      <h6 className="fw-bold mb-0">{adm.full_name}</h6>
                      <span className="text-muted small">{adm.email} | NIC: {adm.nic_passport}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => handleApproveUser(adm.id, 'active', 'admin')}>Approve</button>
                      <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleApproveUser(adm.id, 'rejected', 'admin')}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small text-center py-4">No pending admin registration requests.</p>
            )}
          </div>
        </div>

        {/* Service Provider approvals */}
        <div className="col-md-6">
          <div className="card glass-card p-4 border-0 h-100">
            <h4 className="fw-bold mb-3 text-success"><i className="bi bi-briefcase"></i> Pending Service Providers</h4>
            {pendingProviders.length > 0 ? (
              <div className="list-group list-group-flush">
                {pendingProviders.map(prov => (
                  <div className="list-group-item bg-transparent px-0 py-3 d-flex justify-content-between align-items-center" key={prov.id}>
                    <div>
                      <h6 className="fw-bold mb-0">{prov.full_name}</h6>
                      <span className="text-muted small">{prov.email} | Contact: {prov.contact_no}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => handleApproveUser(prov.id, 'active', 'provider')}>Approve</button>
                      <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleApproveUser(prov.id, 'rejected', 'provider')}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small text-center py-4">No pending provider verification requests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
