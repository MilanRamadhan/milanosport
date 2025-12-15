import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <span className="logo-icon">M</span>
            {!sidebarCollapsed && <span className="logo-text"> Admin</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Toggle sidebar">
            <span className={`arrow ${sidebarCollapsed ? "collapsed" : ""}`}>❮</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="icon">■</i>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/admin/bookings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="icon">☰</i>
            {!sidebarCollapsed && <span>Bookings</span>}
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="icon">◉</i>
            {!sidebarCollapsed && <span>Users</span>}
          </NavLink>

          <NavLink to="/admin/finance" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="icon">$</i>
            {!sidebarCollapsed && <span>Finance</span>}
          </NavLink>

          <NavLink to="/admin/analytics" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="icon">▲</i>
            {!sidebarCollapsed && <span>Analytics</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => navigate("/")} className="nav-item">
            <i className="icon">←</i>
            {!sidebarCollapsed && <span>Back to Site</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="page-title">Admin Panel</h1>
          </div>
          <div className="topbar-right">
            <div className="admin-user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Admin</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
