import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import "./Analytics.css";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    netProfit: number;
  };
  bookingsByStatus: Array<{ _id: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; bookings: number }>;
  topFields: Array<{
    _id: string;
    fieldName: string;
    sport: string;
    bookings: number;
    revenue: number;
  }>;
  paymentDistribution: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  popularTimeSlots: Array<{ _id: string; count: number }>;
  userActivity: Array<{ month: string; users: number }>;
  financeSummary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    incomeCount: number;
    expenseCount: number;
  };
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAnalytics();
      console.log("Analytics Data:", response.data);
      setData(response.data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data analytics");
      console.error("Error fetching analytics:", err);
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "#f39c12",
      active: "#3498db",
      completed: "#27ae60",
      cancelled: "#e74c3c",
    };
    return colors[status] || "#95a5a6";
  };

  const getPaymentColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "#e67e22",
      paid: "#27ae60",
      failed: "#e74c3c",
    };
    return colors[status] || "#95a5a6";
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading">Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  console.log("Bookings by Status:", data.bookingsByStatus);
  console.log("User Activity:", data.userActivity);

  const maxRevenue = data.revenueByMonth.length > 0 ? Math.max(...data.revenueByMonth.map((m) => m.revenue), 1) : 1;
  const maxUsers = data.userActivity.length > 0 ? Math.max(...data.userActivity.map((m) => m.users), 1) : 1;
  const maxFieldRevenue = data.topFields.length > 0 ? Math.max(...data.topFields.map((f) => f.revenue), 1) : 1;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p className="subtitle">Business insights and performance metrics</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{formatCurrency(data.overview.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card bookings">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{data.overview.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{data.overview.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className={`stat-card profit ${data.overview.netProfit >= 0 ? "positive" : "negative"}`}>
          <div className="stat-icon">{data.overview.netProfit >= 0 ? "📈" : "📉"}</div>
          <div className="stat-info">
            <h3>{formatCurrency(data.overview.netProfit)}</h3>
            <p>Net Profit</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue by Month */}
        <div className="chart-card">
          <h3>Revenue by Month</h3>
          {data.revenueByMonth && data.revenueByMonth.length > 0 ? (
            <div className="bar-chart">
              {data.revenueByMonth.map((item, index) => (
                <div key={index} className="bar-group">
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        height: `${(item.revenue / maxRevenue) * 100}%`,
                      }}
                      title={formatCurrency(item.revenue)}
                    >
                      <span className="bar-value">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                  <div className="bar-label">{item.month}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">No revenue data available</div>
            </div>
          )}
        </div>

        {/* Bookings by Status */}
        <div className="chart-card">
          <h3>Bookings by Status</h3>
          {data.bookingsByStatus && data.bookingsByStatus.length > 0 ? (
            <div className="pie-chart-container">
              {data.bookingsByStatus.map((item, index) => {
                if (!item._id) return null;
                return (
                  <div key={index} className="pie-item">
                    <div className="pie-color" style={{ backgroundColor: getStatusColor(item._id) }}></div>
                    <div className="pie-info">
                      <span className="pie-label">{item._id.charAt(0).toUpperCase() + item._id.slice(1)}</span>
                      <span className="pie-value">{item.count} bookings</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">No booking data available</div>
            </div>
          )}
        </div>

        {/* Top Fields */}
        <div className="chart-card">
          <h3>Top Performing Fields</h3>
          {data.topFields && data.topFields.length > 0 ? (
            <div className="horizontal-bar-chart">
              {data.topFields.map((field, index) => (
                <div key={index} className="h-bar-item">
                  <div className="h-bar-label">
                    <span className="field-name">{field.fieldName}</span>
                    <span className="field-sport">{field.sport}</span>
                  </div>
                  <div className="h-bar-container">
                    <div
                      className="h-bar"
                      style={{
                        width: `${(field.revenue / maxFieldRevenue) * 100}%`,
                      }}
                    >
                      <span className="h-bar-value">{formatCurrency(field.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-bar-count">{field.bookings} bookings</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏟️</div>
              <div className="empty-state-text">No field data available</div>
            </div>
          )}
        </div>

        {/* Payment Distribution */}
        <div className="chart-card">
          <h3>Payment Distribution</h3>
          {data.paymentDistribution && data.paymentDistribution.length > 0 ? (
            <div className="pie-chart-container">
              {data.paymentDistribution.map((item, index) => {
                if (!item._id) return null;
                return (
                  <div key={index} className="pie-item">
                    <div className="pie-color" style={{ backgroundColor: getPaymentColor(item._id) }}></div>
                    <div className="pie-info">
                      <span className="pie-label">{item._id.charAt(0).toUpperCase() + item._id.slice(1)}</span>
                      <span className="pie-value">
                        {item.count} ({formatCurrency(item.totalAmount)})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-text">No payment data available</div>
            </div>
          )}
        </div>

        {/* User Activity */}
        <div className="chart-card">
          <h3>New Users by Month</h3>
          {data.userActivity && data.userActivity.length > 0 ? (
            <div className="line-chart">
              {data.userActivity.map((item, index) => {
                const percentage = maxUsers > 0 ? (item.users / maxUsers) * 70 : 0;
                return (
                  <div key={index} className="line-point">
                    <div
                      className="point"
                      style={{
                        bottom: `${Math.max(percentage, 10)}%`,
                      }}
                      title={`${item.users} users`}
                    >
                      <span className="point-value">{item.users} users</span>
                    </div>
                    <div className="point-label">{item.month}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">No user activity data available</div>
            </div>
          )}
        </div>

        {/* Popular Time Slots */}
        <div className="chart-card">
          <h3>Popular Time Slots</h3>
          {data.popularTimeSlots && data.popularTimeSlots.length > 0 ? (
            <div className="time-slots-list">
              {data.popularTimeSlots.map((slot, index) => (
                <div key={index} className="time-slot-item">
                  <div className="slot-rank">#{index + 1}</div>
                  <div className="slot-time">{slot._id}</div>
                  <div className="slot-count">{slot.count} bookings</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">⏰</div>
              <div className="empty-state-text">No booking time data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Finance Summary */}
      <div className="finance-summary-card">
        <h3>Finance Summary</h3>
        <div className="finance-grid">
          <div className="finance-item income">
            <div className="finance-label">Total Income</div>
            <div className="finance-amount">{formatCurrency(data.financeSummary.totalIncome)}</div>
            <div className="finance-count">{data.financeSummary.incomeCount} transactions</div>
          </div>
          <div className="finance-item expense">
            <div className="finance-label">Total Expense</div>
            <div className="finance-amount">{formatCurrency(data.financeSummary.totalExpense)}</div>
            <div className="finance-count">{data.financeSummary.expenseCount} transactions</div>
          </div>
          <div className={`finance-item profit ${data.financeSummary.netProfit >= 0 ? "positive" : "negative"}`}>
            <div className="finance-label">Net Profit/Loss</div>
            <div className="finance-amount">{formatCurrency(data.financeSummary.netProfit)}</div>
            <div className="finance-count">{data.financeSummary.netProfit >= 0 ? "Profit" : "Loss"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
