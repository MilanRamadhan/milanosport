import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingApi, type Booking } from "../../api/bookingApi";
import "./AdminHome.css";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  todayBookings: number;
  paidBookings: number;
  unpaidBookings: number;
}

const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    paidBookings: 0,
    unpaidBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getAllBookings();
      const bookings = response.data;

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const todayBookings = bookings.filter(
        (b) => b.date.split("T")[0] === today
      );

      const statsData: DashboardStats = {
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b) => b.status === "pending").length,
        activeBookings: bookings.filter((b) => b.status === "active").length,
        cancelledBookings: bookings.filter((b) => b.status === "cancelled")
          .length,
        totalRevenue: bookings
          .filter((b) => b.paymentStatus === "paid")
          .reduce((sum, b) => sum + b.totalPrice, 0),
        todayBookings: todayBookings.length,
        paidBookings: bookings.filter((b) => b.paymentStatus === "paid").length,
        unpaidBookings: bookings.filter((b) => b.paymentStatus === "pending")
          .length,
      };

      setStats(statsData);
      setRecentBookings(bookings.slice(0, 5)); // Get 5 most recent
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <p className="subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">☰</div>
          <div className="stat-info">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">$</div>
          <div className="stat-info">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">○</div>
          <div className="stat-info">
            <h3>{stats.pendingBookings}</h3>
            <p>Pending Bookings</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">●</div>
          <div className="stat-info">
            <h3>{stats.activeBookings}</h3>
            <p>Active Bookings</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">×</div>
          <div className="stat-info">
            <h3>{stats.cancelledBookings}</h3>
            <p>Cancelled</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">▪</div>
          <div className="stat-info">
            <h3>{stats.todayBookings}</h3>
            <p>Today's Bookings</p>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>{stats.paidBookings}</h3>
            <p>Paid</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">!</div>
          <div className="stat-info">
            <h3>{stats.unpaidBookings}</h3>
            <p>Unpaid</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button
            className="action-btn"
            onClick={() => navigate("/admin/bookings")}
          >
            <span className="action-icon">☰</span>
            <span>Manage Bookings</span>
          </button>
          <button
            className="action-btn"
            onClick={() => navigate("/admin/users")}
          >
            <span className="action-icon">◉</span>
            <span>Manage Users</span>
          </button>
          <button
            className="action-btn"
            onClick={() => navigate("/admin/finance")}
          >
            <span className="action-icon">$</span>
            <span>Finance</span>
          </button>
          <button
            className="action-btn"
            onClick={() => navigate("/admin/analytics")}
          >
            <span className="action-icon">▲</span>
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-section">
        <div className="section-header">
          <h3>Recent Bookings</h3>
          <button
            className="btn-view-all"
            onClick={() => navigate("/admin/bookings")}
          >
            View All →
          </button>
        </div>

        <div className="recent-bookings-list">
          {recentBookings.length === 0 ? (
            <p className="no-data">No recent bookings</p>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking._id} className="booking-item">
                <div className="booking-info">
                  <h4>{booking.customerName}</h4>
                  <p className="booking-detail">
                    {typeof booking.fieldId === "object"
                      ? booking.fieldId.name
                      : booking.fieldId}{" "}
                    • {formatDate(booking.date)} • {booking.startTime} -{" "}
                    {booking.endTime}
                  </p>
                </div>
                <div className="booking-meta">
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                  <span className="booking-price">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
