import React, { useEffect, useState } from "react";
import { adminApi, type User } from "../../api/adminApi";
import "./UsersManagement.css";

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      setUsers(response.data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.")) {
      try {
        await adminApi.deleteUser(userId);
        alert("User berhasil dihapus");
        fetchUsers();
        setShowModal(false);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus user");
      }
    }
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((user) => {
    const roleMatch = roleFilter === "all" || (roleFilter === "admin" && user.role === true) || (roleFilter === "user" && user.role === false);

    const searchMatch = searchTerm === "" || user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return roleMatch && searchMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const adminCount = users.filter((u) => u.role === true).length;
  const userCount = users.filter((u) => u.role === false).length;

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading">Loading users data...</div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h2>Users Management</h2>
          <p className="subtitle">Manage all registered users and their roles</p>
        </div>
        <button onClick={fetchUsers} className="btn-refresh">
          ↻ Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{users.length}</span>
        </div>
        <div className="stat-item admin">
          <span className="stat-label">Admins</span>
          <span className="stat-value">{adminCount}</span>
        </div>
        <div className="stat-item user">
          <span className="stat-label">Regular Users</span>
          <span className="stat-value">{userCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="filter-select">
          <option value="all">All Roles</option>
          <option value="admin">Admin Only</option>
          <option value="user">Users Only</option>
        </select>

        {(searchTerm || roleFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
            }}
            className="btn-clear-filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                  {searchTerm || roleFilter !== "all" ? "No users match your filters" : "No users found"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-name">
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge role-${user.role ? "admin" : "user"}`}>{user.role ? "Admin" : "User"}</span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.updatedAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => openModal(user)} className="btn-action view" title="View Details">
                        ▸
                      </button>
                      <button onClick={() => handleDeleteUser(user._id)} className="btn-action delete" title="Delete User">
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={closeModal} className="btn-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="user-detail-card">
                <div className="user-avatar">{selectedUser.name.charAt(0).toUpperCase()}</div>

                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">{selectedUser.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Role:</span>
                    <span className={`badge role-${selectedUser.role ? "admin" : "user"}`}>{selectedUser.role ? "Admin" : "User"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">User ID:</span>
                    <span className="value">
                      <code>{selectedUser._id}</code>
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Account Information</h3>
                  <div className="detail-row">
                    <span className="label">Registered:</span>
                    <span className="value">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Last Updated:</span>
                    <span className="value">{formatDate(selectedUser.updatedAt)}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button onClick={() => handleDeleteUser(selectedUser._id)} className="btn-modal-action delete">
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
