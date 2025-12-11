import React, { useEffect, useState } from "react";
import { adminApi, type ActivityLog } from "../../api/adminApi";
import "./ActivityLogs.css";

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getActivityLogs();
      setLogs(response.data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Gagal mengambil activity logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const actionMatch = actionFilter === "all" || log.action === actionFilter;
    const searchMatch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    return actionMatch && searchMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getUserName = (userId: any) => {
    if (typeof userId === "string") return "Unknown User";
    return userId?.name || "Unknown User";
  };

  const getUserEmail = (userId: any) => {
    if (typeof userId === "string") return "";
    return userId?.email || "";
  };

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  if (loading) {
    return (
      <div className="logs-page">
        <div className="loading">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div className="logs-page">
      <div className="page-header">
        <div>
          <h2>Activity Logs</h2>
          <p className="subtitle">Track all admin and user activities</p>
        </div>
        <button onClick={fetchLogs} className="btn-refresh">
          ↻ Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="logs-stats">
        <div className="stat-item">
          <span className="stat-label">Total Logs</span>
          <span className="stat-value">{logs.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unique Actions</span>
          <span className="stat-value">{uniqueActions.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Today</span>
          <span className="stat-value">
            {
              logs.filter(
                (l) =>
                  new Date(l.timestamp).toDateString() ===
                  new Date().toDateString()
              ).length
            }
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>

        {(searchTerm || actionFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setActionFilter("all");
            }}
            className="btn-clear-filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  {searchTerm || actionFilter !== "all"
                    ? "No logs match your filters"
                    : "No logs found"}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id}>
                  <td className="timestamp">{formatDate(log.timestamp)}</td>
                  <td>
                    <div className="user-info">
                      <strong>{getUserName(log.userId)}</strong>
                      <small>{getUserEmail(log.userId)}</small>
                    </div>
                  </td>
                  <td>
                    <span className="badge action-badge">{log.action}</span>
                  </td>
                  <td className="details">{log.details}</td>
                  <td>
                    <code>{log.ipAddress || "N/A"}</code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;
