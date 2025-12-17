import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BookingSuccess.css";

interface BookingData {
  bookingId: string;
  fieldName: string;
  fieldSport: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  paymentStatus: string;
}

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData as BookingData;
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    if (!bookingData) {
      navigate("/reservasi");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="booking-success-page">
      <div className="success-container">
        {/* Success Icon */}
        <div className="success-icon-wrapper">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#43a047" />
              <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="success-message">
          <h1>Reservasi Berhasil Dibuat!</h1>
          <p>Terima kasih telah melakukan reservasi. Booking Anda sedang menunggu verifikasi pembayaran.</p>
        </div>

        {/* Booking ID */}
        <div className="booking-id-card">
          <span className="id-label">Booking ID</span>
          <code className="booking-id">{bookingData.bookingId.slice(-12).toUpperCase()}</code>
        </div>

        {/* Status Card */}
        <div className="status-card">
          <div className="status-header">
            <div className="status-icon">⏳</div>
            <div className="status-info">
              <h3>Menunggu Pembayaran</h3>
              <p>Selesaikan pembayaran sebelum booking hangus</p>
            </div>
          </div>

          <div className="countdown-timer">
            <div className="timer-label">Waktu Tersisa</div>
            <div className="timer-display">{formatTime(countdown)}</div>
            <div className="timer-progress">
              <div className="timer-progress-bar" style={{ width: `${(countdown / 900) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="booking-details-card">
          <h3>Detail Reservasi</h3>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">🏟️ Lapangan</span>
              <span className="detail-value">
                {bookingData.fieldName}
                <small>{bookingData.fieldSport}</small>
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">📅 Tanggal</span>
              <span className="detail-value">{formatDate(bookingData.date)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">⏰ Waktu</span>
              <span className="detail-value">
                {bookingData.startTime} - {bookingData.endTime}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">👤 Pemesan</span>
              <span className="detail-value">
                {bookingData.customerName}
                <small>{bookingData.customerPhone}</small>
              </span>
            </div>

            <div className="detail-item highlight">
              <span className="detail-label">💰 Total Pembayaran</span>
              <span className="detail-value price">{formatCurrency(bookingData.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="payment-instructions">
          <h3>📝 Instruksi Pembayaran</h3>
          <ol>
            <li>
              Transfer sejumlah <strong>{formatCurrency(bookingData.totalPrice)}</strong> ke rekening BSI berikut:
            </li>
            <div className="bank-account">
              <div className="bank-info">
                <strong>Bank Syariah Indonesia (BSI)</strong>
                <code>1234567890</code>
                <span>a.n. Milano Sport</span>
              </div>
            </div>
            <li>Simpan bukti transfer Anda</li>
            <li>Klik tombol "Upload Bukti Transfer" di bawah</li>
            <li>Tunggu verifikasi dari admin (maksimal 1x24 jam)</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => navigate("/my-bookings")} className="btn-secondary">
            Lihat Riwayat Booking
          </button>
          <button onClick={() => navigate("/my-bookings")} className="btn-primary">
            Upload Bukti Transfer
          </button>
        </div>

        {/* Additional Info */}
        <div className="info-box">
          <p>
            <strong>💡 Perhatian:</strong> Booking Anda akan otomatis dibatalkan jika pembayaran tidak dikonfirmasi dalam 15 menit. Untuk pertanyaan lebih lanjut, hubungi kami di WhatsApp:{" "}
            <a href="https://wa.me/6281234567890">0812-3456-7890</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
