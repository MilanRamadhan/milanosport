import React, { useEffect, useState } from "react";
import { bookingApi, type Booking } from "../../api/bookingApi";
import "./BookingsList.css";

const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "active" | "cancelled"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "pending" | "paid" | "failed"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleUpdatePaymentStatus = async (
    bookingId: string,
    newStatus: "pending" | "paid" | "failed"
  ) => {
    try {
      await bookingApi.updatePaymentStatus(bookingId, newStatus);
      alert(`Status pembayaran berhasil diubah menjadi ${newStatus}`);
      fetchAllBookings();
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
    const statusMatch = filter === "all" || booking.status === filter;
    const paymentMatch =
      paymentFilter === "all" || booking.paymentStatus === paymentFilter;
    const searchMatch =
      searchTerm === "" ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && paymentMatch && searchMatch;
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

  const calculateDuration = (startTime: string, endTime: string): string => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    
    const startInMinutes = startHour * 60 + startMin;
    const endInMinutes = endHour * 60 + endMin;
    const durationInMinutes = endInMinutes - startInMinutes;
    
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    
    if (minutes === 0) {
      return `${hours} jam`;
    } else {
      return `${hours} jam ${minutes} menit`;
    }
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="loading">Memuat data booking...</div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h2>Bookings Management</h2>
          <p className="subtitle">
            Manage all customer bookings and payment status
          </p>
        </div>
        <button onClick={fetchAllBookings} className="btn-refresh">
          ↻ Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Summary */}
      <div className="bookings-stats">
        <div className="stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-value">{bookings.length}</span>
        </div>
        <div className="stat-item pending">
          <span className="stat-label">Pending</span>
          <span className="stat-value">
            {bookings.filter((b) => b.status === "pending").length}
          </span>
        </div>
        <div className="stat-item active">
          <span className="stat-label">Active</span>
          <span className="stat-value">
            {bookings.filter((b) => b.status === "active").length}
          </span>
        </div>
        <div className="stat-item cancelled">
          <span className="stat-label">Cancelled</span>
          <span className="stat-value">
            {bookings.filter((b) => b.status === "cancelled").length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by name, phone, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as any)}
          className="filter-select"
        >
          <option value="all">All Payment</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>

        {(searchTerm || filter !== "all" || paymentFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
              setPaymentFilter("all");
            }}
            className="btn-clear-filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <div className="table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Field</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  {searchTerm || filter !== "all" || paymentFilter !== "all"
                    ? "No bookings match your filters"
                    : "No bookings available"}
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <code className="booking-id">{booking._id.slice(-8)}</code>
                  </td>
                  <td>
                    <div className="customer-info">
                      <strong>{booking.customerName}</strong>
                      <small>{booking.customerPhone}</small>
                    </div>
                  </td>
                  <td>
                    <div className="field-info">
                      <strong>{getFieldName(booking.fieldId)}</strong>
                      <small>{getFieldSport(booking.fieldId)}</small>
                    </div>
                  </td>
                  <td>
                    <div className="datetime-info">
                      <span>{formatDate(booking.date)}</span>
                      <small>
                        {booking.startTime} - {booking.endTime}
                      </small>
                    </div>
                  </td>
                  <td>{calculateDuration(booking.startTime, booking.endTime)}</td>
                  <td>
                    <strong className="price">
                      {formatCurrency(booking.totalPrice)}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge payment-${booking.paymentStatus}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openModal(booking)}
                      className="btn-action"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button onClick={closeModal} className="btn-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">
                      {selectedBooking.customerName}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="value">
                      {selectedBooking.customerPhone}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">
                      {getUserEmail(selectedBooking.userId) || "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Field Information</h3>
                  <div className="detail-row">
                    <span className="label">Field:</span>
                    <span className="value">
                      {getFieldName(selectedBooking.fieldId)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Sport:</span>
                    <span className="value">
                      {getFieldSport(selectedBooking.fieldId)}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Booking Information</h3>
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">
                      {formatDate(selectedBooking.date)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Time:</span>
                    <span className="value">
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">
                      {calculateDuration(selectedBooking.startTime, selectedBooking.endTime)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Price:</span>
                    <span className="value price">
                      {formatCurrency(selectedBooking.totalPrice)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">
                      {selectedBooking.notes || "-"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Status</h3>
                  <div className="detail-row">
                    <span className="label">Booking Status:</span>
                    <span className={`badge status-${selectedBooking.status}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Status:</span>
                    <span
                      className={`badge payment-${selectedBooking.paymentStatus}`}
                    >
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.proofOfPayment && (
                <div className="detail-section full-width">
                  <h3>Proof of Payment</h3>
                  <img
                    src={selectedBooking.proofOfPayment}
                    alt="Payment Proof"
                    className="payment-proof-img"
                  />
                  <a
                    href={selectedBooking.proofOfPayment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-view-full"
                  >
                    View Full Image
                  </a>
                </div>
              )}

              <div className="detail-section full-width">
                <h3>Update Payment Status</h3>
                <div className="payment-actions">
                  <button
                    onClick={() =>
                      handleUpdatePaymentStatus(selectedBooking._id, "paid")
                    }
                    className="btn-payment-action success"
                    disabled={selectedBooking.paymentStatus === "paid"}
                  >
                    ✓ Approve Payment
                  </button>
                  <button
                    onClick={() =>
                      handleUpdatePaymentStatus(selectedBooking._id, "failed")
                    }
                    className="btn-payment-action danger"
                    disabled={selectedBooking.paymentStatus === "failed"}
                  >
                    ✗ Reject Payment
                  </button>
                  <button
                    onClick={() =>
                      handleUpdatePaymentStatus(selectedBooking._id, "pending")
                    }
                    className="btn-payment-action warning"
                    disabled={selectedBooking.paymentStatus === "pending"}
                  >
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

export default BookingsList;
