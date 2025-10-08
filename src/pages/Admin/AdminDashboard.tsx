import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingApi, type Booking } from "../../api/bookingApi";
import "./AdminDashboard.css";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "cancelled">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getAllBookings();
      setBookings(response.data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data booking");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (bookingId: string, newStatus: "pending" | "paid" | "failed") => {
    try {
      await bookingApi.updatePaymentStatus(bookingId, newStatus);
      alert(`Status pembayaran berhasil diubah menjadi ${newStatus}`);
      fetchAllBookings(); // Refresh data
      setShowModal(false);
      setSelectedBooking(null);
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status pembayaran");
    }
  };

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFieldName = (fieldId: any) => {
    if (typeof fieldId === "string") return fieldId;
    return fieldId?.name || "N/A";
  };

  const getFieldSport = (fieldId: any) => {
    if (typeof fieldId === "string") return "";
    return fieldId?.sport || "";
  };

  const getUserEmail = (userId: any) => {
    if (typeof userId === "string") return "";
    return userId?.email || "";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "active":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800";
      case "paid":
        return "#4CAF50";
      case "failed":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Memuat data booking...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Dashboard Admin - Manajemen Booking</h1>
        <button onClick={() => navigate("/")} className="btn-back">
          Kembali ke Home
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Booking</h3>
          <p className="stat-number">{bookings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number" style={{ color: "#FFA500" }}>
            {bookings.filter((b) => b.status === "pending").length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <p className="stat-number" style={{ color: "#4CAF50" }}>
            {bookings.filter((b) => b.status === "active").length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Cancelled</h3>
          <p className="stat-number" style={{ color: "#F44336" }}>
            {bookings.filter((b) => b.status === "cancelled").length}
          </p>
        </div>
      </div>

      <div className="filter-section">
        <label>Filter Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="filter-select">
          <option value="all">Semua</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Lapangan</th>
              <th>Tanggal</th>
              <th>Waktu</th>
              <th>Durasi</th>
              <th>Total Harga</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>
                  Tidak ada booking
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <code>{booking._id.slice(-8)}</code>
                  </td>
                  <td>
                    <div>
                      <strong>{booking.customerName}</strong>
                      <br />
                      <small>{booking.customerPhone}</small>
                      <br />
                      <small style={{ color: "#666" }}>{getUserEmail(booking.userId)}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{getFieldName(booking.fieldId)}</strong>
                      <br />
                      <small style={{ color: "#666" }}>{getFieldSport(booking.fieldId)}</small>
                    </div>
                  </td>
                  <td>{formatDate(booking.date)}</td>
                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td>{booking.totalHours} jam</td>
                  <td>
                    <strong>{formatCurrency(booking.totalPrice)}</strong>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getPaymentStatusColor(booking.paymentStatus) }}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openModal(booking)} className="btn-detail">
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Booking */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Booking</h2>
              <button onClick={closeModal} className="btn-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Informasi Customer</h3>
                <p>
                  <strong>Nama:</strong> {selectedBooking.customerName}
                </p>
                <p>
                  <strong>Telepon:</strong> {selectedBooking.customerPhone}
                </p>
                <p>
                  <strong>Email:</strong> {getUserEmail(selectedBooking.userId)}
                </p>
              </div>

              <div className="detail-section">
                <h3>Informasi Lapangan</h3>
                <p>
                  <strong>Lapangan:</strong> {getFieldName(selectedBooking.fieldId)}
                </p>
                <p>
                  <strong>Jenis Olahraga:</strong> {getFieldSport(selectedBooking.fieldId)}
                </p>
              </div>

              <div className="detail-section">
                <h3>Informasi Booking</h3>
                <p>
                  <strong>Tanggal:</strong> {formatDate(selectedBooking.date)}
                </p>
                <p>
                  <strong>Waktu:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}
                </p>
                <p>
                  <strong>Durasi:</strong> {selectedBooking.totalHours} jam
                </p>
                <p>
                  <strong>Total Harga:</strong> {formatCurrency(selectedBooking.totalPrice)}
                </p>
                <p>
                  <strong>Catatan:</strong> {selectedBooking.notes || "-"}
                </p>
              </div>

              <div className="detail-section">
                <h3>Status</h3>
                <p>
                  <strong>Status Booking:</strong>{" "}
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedBooking.status) }}>
                    {selectedBooking.status}
                  </span>
                </p>
                <p>
                  <strong>Status Pembayaran:</strong>{" "}
                  <span className="status-badge" style={{ backgroundColor: getPaymentStatusColor(selectedBooking.paymentStatus) }}>
                    {selectedBooking.paymentStatus}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h3>Bukti Transfer</h3>
                {selectedBooking.proofOfPayment ? (
                  <div>
                    <img src={selectedBooking.proofOfPayment} alt="Bukti Transfer" style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }} />
                    <br />
                    <a href={selectedBooking.proofOfPayment} target="_blank" rel="noopener noreferrer" className="btn-link">
                      Lihat Full Image
                    </a>
                  </div>
                ) : (
                  <p>Tidak ada bukti transfer</p>
                )}
              </div>

              <div className="detail-section">
                <h3>Update Status Pembayaran</h3>
                <div className="payment-actions">
                  <button onClick={() => handleUpdatePaymentStatus(selectedBooking._id, "paid")} className="btn-success" disabled={selectedBooking.paymentStatus === "paid"}>
                    ✓ Terima Pembayaran
                  </button>
                  <button onClick={() => handleUpdatePaymentStatus(selectedBooking._id, "failed")} className="btn-danger" disabled={selectedBooking.paymentStatus === "failed"}>
                    ✗ Tolak Pembayaran
                  </button>
                  <button onClick={() => handleUpdatePaymentStatus(selectedBooking._id, "pending")} className="btn-warning" disabled={selectedBooking.paymentStatus === "pending"}>
                    ⟳ Set Pending
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

export default AdminDashboard;
