import React, { useState } from 'react';
import { getUploadUrl } from '../../../../api';

export default function UsersTab({ users, handleToggleUserStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter users based on query, role, and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nic_passport.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.user_type === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="card glass-card p-4 border-0 shadow-lg mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Registered Users Management</h2>
          <p className="text-muted small mb-0">Suspend or reactivate accounts, filter roles, and monitor user statuses</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <span className="badge bg-emerald rounded-pill px-3 py-2">
            Total Users: {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-5">
          <label className="form-label small fw-bold text-muted">Search User</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by name, email, or NIC/Passport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-bold text-muted">Role Filter</label>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ boxShadow: 'none' }}
          >
            <option value="all">All Roles</option>
            <option value="tourist">Tourists</option>
            <option value="provider">Service Providers</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-bold text-muted">Status Filter</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ boxShadow: 'none' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        {filteredUsers.length > 0 ? (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Contact info</th>
                <th>NIC/Passport</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={getUploadUrl(user.profile_photo) || 'default_profile.jpg'}
                        alt={user.full_name}
                        className="rounded-circle shadow-sm"
                        style={{ width: '40px', height: '40px', objectFit: 'cover', border: '2px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                        data-bs-toggle="modal"
                        data-bs-target="#adminUserDetailModal"
                        onClick={() => setSelectedUser(user)}
                      />
                      <div>
                        <h6 
                          className="fw-bold mb-0 text-dark text-gradient-hover text-decoration-none"
                          style={{ cursor: 'pointer' }}
                          data-bs-toggle="modal"
                          data-bs-target="#adminUserDetailModal"
                          onClick={() => setSelectedUser(user)}
                        >
                          {user.full_name}
                        </h6>
                        <span className="text-muted small">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.user_type === 'tourist' ? (
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '10px' }}>
                        Tourist
                      </span>
                    ) : (
                      <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '10px' }}>
                        Provider
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="small text-muted">{user.contact_no}</span>
                  </td>
                  <td>
                    <span className="small text-muted">{user.nic_passport}</span>
                  </td>
                  <td>
                    {user.status === 'active' && (
                      <span className="badge bg-success bg-opacity-12 text-success rounded-pill px-3 py-1 fw-semibold">
                        Active
                      </span>
                    )}
                    {user.status === 'suspended' && (
                      <span className="badge bg-danger bg-opacity-12 text-danger rounded-pill px-3 py-1 fw-semibold">
                        Suspended
                      </span>
                    )}
                    {user.status === 'pending' && (
                      <span className="badge bg-warning bg-opacity-12 text-warning rounded-pill px-3 py-1 fw-semibold">
                        Pending
                      </span>
                    )}
                    {user.status === 'rejected' && (
                      <span className="badge bg-secondary bg-opacity-12 text-secondary rounded-pill px-3 py-1 fw-semibold">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    {user.status === 'active' && (
                      <button
                        className="btn btn-danger btn-sm rounded-pill px-3 fw-bold"
                        onClick={() => handleToggleUserStatus(user.id, 'active')}
                      >
                        <i className="bi bi-slash-circle me-1"></i> Suspend
                      </button>
                    )}
                    {user.status === 'suspended' && (
                      <button
                        className="btn btn-emerald btn-sm rounded-pill px-3 fw-bold text-white"
                        onClick={() => handleToggleUserStatus(user.id, 'suspended')}
                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                      >
                        <i className="bi bi-check-circle me-1"></i> Activate
                      </button>
                    )}
                    {(user.status === 'pending' || user.status === 'rejected') && (
                      <span className="text-muted small italic">Manage in Approvals Tab</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-people-fill text-muted fs-1"></i>
            <p className="mt-3 text-muted">No registered users found matching the filter criteria.</p>
          </div>
        )}
      </div>

      {/* User Detail Summary Modal */}
      <div className="modal fade" id="adminUserDetailModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">User Profile Summary</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4 text-center">
              {selectedUser ? (
                <>
                  <img
                    src={getUploadUrl(selectedUser.profile_photo) || 'default_profile.jpg'}
                    alt={selectedUser.full_name}
                    className="rounded-circle mb-3 shadow-sm"
                    style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid var(--primary-color)' }}
                  />
                  <h4 className="fw-bold text-dark mb-1">{selectedUser.full_name}</h4>
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 fw-bold text-uppercase mb-4" style={{ fontSize: '11px' }}>
                    {selectedUser.user_type}
                  </span>

                  <div className="text-start bg-light p-3 rounded-3 mb-0">
                    <div className="row g-2 text-dark">
                      <div className="col-6 mb-2">
                        <span className="small text-muted d-block">Name with Initial:</span>
                        <strong className="small">{selectedUser.name_with_initial || 'N/A'}</strong>
                      </div>
                      <div className="col-6 mb-2">
                        <span className="small text-muted d-block">Email Address:</span>
                        <strong className="small" style={{ wordBreak: 'break-all' }}>{selectedUser.email}</strong>
                      </div>
                      <div className="col-6 mb-2">
                        <span className="small text-muted d-block">NIC / Passport:</span>
                        <strong className="small">{selectedUser.nic_passport}</strong>
                      </div>
                      <div className="col-6 mb-2">
                        <span className="small text-muted d-block">Contact No:</span>
                        <strong className="small">{selectedUser.contact_no}</strong>
                      </div>
                      <div className="col-6 mb-2">
                        <span className="small text-muted d-block">Gender:</span>
                        <strong className="small text-capitalize">{selectedUser.gender}</strong>
                      </div>
                      <div className="col-6 mb-2">
                        <span className="small text-muted d-block">Date of Birth:</span>
                        <strong className="small">{selectedUser.date_of_birth}</strong>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block">Status:</span>
                        <strong className="small text-capitalize">{selectedUser.status}</strong>
                      </div>
                      <div className="col-6">
                        <span className="small text-muted d-block">Registration Date:</span>
                        <strong className="small">{new Date(selectedUser.created_at).toLocaleDateString()}</strong>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted">Loading user profile summary...</p>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-gradient rounded-pill px-4 w-100" data-bs-dismiss="modal">
                Close Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
