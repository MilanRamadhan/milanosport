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
        {/* Success Header with Icon */}
        <div className="success-header">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#43a047" />
              <path d="M25 40L35 50L55 30" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="success-title">Reservasi Berhasil Dibuat!</h1>
          <p className="success-subtitle">Terima kasih telah melakukan reservasi. Booking Anda sedang menunggu verifikasi pembayaran.</p>
        </div>

        {/* Booking ID Card */}
        <div className="info-card booking-id-section">
          <div className="info-label">Booking ID</div>
          <div className="booking-id">{bookingData.bookingId.slice(-12).toUpperCase()}</div>
        </div>

        {/* Countdown Timer Card */}
        <div className="info-card countdown-card">
          <div className="countdown-header">
            <span className="countdown-icon">⏱️</span>
            <div>
              <h3>Menunggu Verifikasi</h3>
              <p>Booking akan dibatalkan otomatis jika belum dikonfirmasi</p>
            </div>
          </div>

          <div className="countdown-timer">
            <div className="timer-value">{formatTime(countdown)}</div>
            <div className="timer-label">Waktu Tersisa</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(countdown / 900) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="info-card details-card">
          <h3 className="card-title">Detail Reservasi</h3>
          <div className="details-grid">
            <div className="detail-row">
              <span className="detail-icon">🏟️</span>
              <div className="detail-content">
                <div className="detail-label">Lapangan</div>
                <div className="detail-value">{bookingData.fieldName}</div>
                <div className="detail-sub">{bookingData.fieldSport}</div>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-icon">📅</span>
              <div className="detail-content">
                <div className="detail-label">Tanggal</div>
                <div className="detail-value">{formatDate(bookingData.date)}</div>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-icon">⏰</span>
              <div className="detail-content">
                <div className="detail-label">Waktu</div>
                <div className="detail-value">
                  {bookingData.startTime} - {bookingData.endTime}
                </div>
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-icon">👤</span>
              <div className="detail-content">
                <div className="detail-label">Pemesan</div>
                <div className="detail-value">{bookingData.customerName}</div>
                <div className="detail-sub">{bookingData.customerPhone}</div>
              </div>
            </div>
          </div>
          <div className="total-payment">
            <span>Total Pembayaran</span>
            <span className="total-amount">{formatCurrency(bookingData.totalPrice)}</span>
          </div>
        </div>

        {/* Payment Instructions Card */}
        <div className="info-card payment-card">
          <h3 className="card-title">📝 Instruksi Pembayaran</h3>
          <div className="payment-steps">
            <div className="payment-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <p>
                  Transfer sejumlah <strong>{formatCurrency(bookingData.totalPrice)}</strong> ke rekening berikut:
                </p>
                <div className="bank-info-box">
                  <div className="bank-name">Bank Syariah Indonesia (BSI)</div>
                  <div className="bank-account-number">1234567890</div>
                  <div className="bank-holder">a.n. Milano Sport</div>
                </div>
              </div>
            </div>
            <div className="payment-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <p>Bukti transfer sudah berhasil diupload</p>
              </div>
            </div>
            <div className="payment-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <p>Tunggu verifikasi dari admin (maksimal 1x24 jam)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="action-section">
          <button onClick={() => navigate("/my-bookings")} className="btn-primary-large">
            Lihat Riwayat Booking
          </button>
          <p className="info-text">
            💡 Booking akan otomatis dibatalkan jika tidak dikonfirmasi dalam 15 menit. Untuk bantuan, hubungi <a href="https://wa.me/6281234567890">WhatsApp Kami</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
