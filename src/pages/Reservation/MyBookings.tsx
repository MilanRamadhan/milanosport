import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingApi, type Booking } from "../../api/bookingApi";
import "./MyBookings.css";

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "cancelled">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getUserBookings();
      setBookings(response.data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data booking");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan booking ini?")) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await bookingApi.cancelBooking(bookingId);
      alert("Booking berhasil dibatalkan");
      fetchUserBookings(); // Refresh data
      if (showModal) {
        setShowModal(false);
        setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.message || "Gagal membatalkan booking");
    } finally {
      setCancellingId(null);
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
      weekday: "long",
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
    if (typeof fieldId === "string") return "Field #" + fieldId.slice(-4);
    return fieldId?.name || "N/A";
  };

  const getFieldSport = (fieldId: any) => {
    if (typeof fieldId === "string") return "";
    return fieldId?.sport || "";
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu Verifikasi",
      active: "Aktif",
      cancelled: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu Pembayaran",
      paid: "Lunas",
      failed: "Gagal",
    };
    return labels[status] || status;
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
      <div className="my-bookings-container">
        <div className="loading">Memuat data booking Anda...</div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <h1>Riwayat Reservasi Saya</h1>
        <button onClick={() => navigate("/reservasi")} className="btn-new-booking">
          + Buat Reservasi Baru
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>Belum Ada Reservasi</h2>
          <p>Anda belum melakukan reservasi apapun. Mulai pesan lapangan favorit Anda sekarang!</p>
          <button onClick={() => navigate("/reservasi")} className="btn-primary">
            Mulai Reservasi
          </button>
        </div>
      ) : (
        <>
          <div className="bookings-stats">
            <div className="stat-item">
              <span className="stat-label">Total Booking</span>
              <span className="stat-value">{bookings.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending</span>
              <span className="stat-value" style={{ color: "#FFA500" }}>
                {bookings.filter((b) => b.status === "pending").length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Aktif</span>
              <span className="stat-value" style={{ color: "#4CAF50" }}>
                {bookings.filter((b) => b.status === "active").length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Dibatalkan</span>
              <span className="stat-value" style={{ color: "#F44336" }}>
                {bookings.filter((b) => b.status === "cancelled").length}
              </span>
            </div>
          </div>

          <div className="filter-section">
            <label>Filter:</label>
            <div className="filter-buttons">
              <button className={filter === "all" ? "filter-btn active" : "filter-btn"} onClick={() => setFilter("all")}>
                Semua
              </button>
              <button className={filter === "pending" ? "filter-btn active" : "filter-btn"} onClick={() => setFilter("pending")}>
                Pending
              </button>
              <button className={filter === "active" ? "filter-btn active" : "filter-btn"} onClick={() => setFilter("active")}>
                Aktif
              </button>
              <button className={filter === "cancelled" ? "filter-btn active" : "filter-btn"} onClick={() => setFilter("cancelled")}>
                Dibatalkan
              </button>
            </div>
          </div>

          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-id">
                    <span className="id-label">Booking ID:</span>
                    <code>{booking._id.slice(-8).toUpperCase()}</code>
                  </div>
                  <div className="booking-status-badges">
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>

                <div className="booking-card-body">
                  <div className="booking-field-info">
                    <div className="field-icon">{getFieldSport(booking.fieldId) === "Futsal" ? "🥅" : getFieldSport(booking.fieldId) === "MiniSoccer" ? "⚽" : getFieldSport(booking.fieldId) === "Badminton" ? "🏸" : "🎾"}</div>
                    <div className="field-details">
                      <h3>{getFieldName(booking.fieldId)}</h3>
                      <p className="field-sport">{getFieldSport(booking.fieldId)}</p>
                    </div>
                  </div>

                  <div className="booking-info-grid">
                    <div className="info-item">
                      <span className="info-label">📅 Tanggal</span>
                      <span className="info-value">{formatDate(booking.date)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">⏰ Waktu</span>
                      <span className="info-value">
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">⏱️ Durasi</span>
                      <span className="info-value">{calculateDuration(booking.startTime, booking.endTime)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">💰 Total Harga</span>
                      <span className="info-value price">{formatCurrency(booking.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="payment-status-section">
                    <span className="payment-label">Status Pembayaran:</span>
                    <span className="payment-badge" style={{ backgroundColor: getPaymentStatusColor(booking.paymentStatus) }}>
                      {getPaymentStatusLabel(booking.paymentStatus)}
                    </span>
                  </div>

                  {booking.notes && (
                    <div className="booking-notes">
                      <span className="notes-label">Catatan:</span>
                      <p>{booking.notes}</p>
                    </div>
                  )}
                </div>

                <div className="booking-card-footer">
                  <button onClick={() => openModal(booking)} className="btn-detail">
                    Lihat Detail
                  </button>
                  {booking.status === "pending" && (
                    <button onClick={() => handleCancelBooking(booking._id)} className="btn-cancel" disabled={cancellingId === booking._id}>
                      {cancellingId === booking._id ? "Membatalkan..." : "Batalkan"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Detail Booking */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Reservasi</h2>
              <button onClick={closeModal} className="btn-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Informasi Booking</h3>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <strong>Booking ID:</strong>
                    <code>{selectedBooking._id}</code>
                  </div>
                  <div className="modal-info-item">
                    <strong>Status:</strong>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedBooking.status) }}>
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Informasi Lapangan</h3>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <strong>Lapangan:</strong>
                    <span>{getFieldName(selectedBooking.fieldId)}</span>
                  </div>
                  <div className="modal-info-item">
                    <strong>Jenis Olahraga:</strong>
                    <span>{getFieldSport(selectedBooking.fieldId)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Jadwal & Durasi</h3>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <strong>Tanggal:</strong>
                    <span>{formatDate(selectedBooking.date)}</span>
                  </div>
                  <div className="modal-info-item">
                    <strong>Waktu:</strong>
                    <span>
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </span>
                  </div>
                  <div className="modal-info-item">
                    <strong>Durasi:</strong>
                    <span>{calculateDuration(selectedBooking.startTime, selectedBooking.endTime)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Informasi Pemesan</h3>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <strong>Nama:</strong>
                    <span>{selectedBooking.customerName}</span>
                  </div>
                  <div className="modal-info-item">
                    <strong>Telepon:</strong>
                    <span>{selectedBooking.customerPhone}</span>
                  </div>
                </div>
                {selectedBooking.notes && (
                  <div className="modal-info-item">
                    <strong>Catatan:</strong>
                    <p style={{ marginTop: "5px", color: "#666" }}>{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="modal-section">
                <h3>Pembayaran</h3>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <strong>Total Harga:</strong>
                    <span className="price-large">{formatCurrency(selectedBooking.totalPrice)}</span>
                  </div>
                  <div className="modal-info-item">
                    <strong>Metode Pembayaran:</strong>
                    <span>Transfer Bank (BSI)</span>
                  </div>
                  <div className="modal-info-item">
                    <strong>Status Pembayaran:</strong>
                    <span className="payment-badge" style={{ backgroundColor: getPaymentStatusColor(selectedBooking.paymentStatus) }}>
                      {getPaymentStatusLabel(selectedBooking.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Bukti Transfer</h3>
                {selectedBooking.proofOfPayment ? (
                  <div className="proof-image-container">
                    <img src={selectedBooking.proofOfPayment} alt="Bukti Transfer" className="proof-image" />
                    <a href={selectedBooking.proofOfPayment} target="_blank" rel="noopener noreferrer" className="btn-link">
                      Buka Gambar Full Size
                    </a>
                  </div>
                ) : (
                  <p style={{ color: "#999" }}>Tidak ada bukti transfer</p>
                )}
              </div>

              {selectedBooking.status === "pending" && (
                <div className="modal-actions">
                  <button onClick={() => handleCancelBooking(selectedBooking._id)} className="btn-cancel-modal" disabled={cancellingId === selectedBooking._id}>
                    {cancellingId === selectedBooking._id ? "Membatalkan..." : "Batalkan Booking"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
