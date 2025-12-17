import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingApi, timeUtils } from "../../api/bookingApi";
import type { CreateBookingRequest } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext";
import StepIndicator from "../../components/common/StepIndicator";
import "./Step3_BookingForm.css";

interface FormData {
  customerName: string;
  customerPhone: string;
  paymentProof?: File;
  notes: string;
}

const PAYMENT_METHODS = [
  {
    id: "bank_transfer_bsi",
    name: "Transfer BSI",
    desc: "Bank Syariah Indonesia",
  },
];

const Step3_BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Get reservation data from URL parameters
  const reservationData = {
    fieldId: searchParams.get("fieldId") || "",
    selectedField: searchParams.get("fieldName") || searchParams.get("field") || "",
    selectedDate: searchParams.get("date") || "",
    selectedTime: searchParams.get("time") || "",
    duration: parseInt(searchParams.get("duration") || "1"),
    totalPrice: parseInt(searchParams.get("totalPrice") || "0"),
  };

  const handleBack = () => {
    const params = new URLSearchParams({
      field: reservationData.fieldId || reservationData.selectedField,
    });
    navigate(`/jadwal?${params.toString()}`);
  };

  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerPhone: "",
    notes: "",
  });

  // Auto-fill customer data from logged in user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || "",
        // Note: If user has phone in profile, add it here
        // customerPhone: user.phone || "",
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, paymentProof: file || undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Nama lengkap wajib diisi";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Nomor telepon wajib diisi";
    } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(formData.customerPhone.replace(/[^0-9+]/g, ""))) {
      newErrors.customerPhone = "Format nomor telepon tidak valid";
    }

    if (!formData.paymentProof) {
      newErrors.paymentProof = "Bukti transfer wajib diupload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!formData.paymentProof) {
      alert("Bukti transfer wajib diupload");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate end time
      const endTime = timeUtils.calculateEndTime(reservationData.selectedTime, reservationData.duration);

      // Prepare booking data matching backend schema
      const bookingData: CreateBookingRequest = {
        fieldId: reservationData.fieldId,
        date: reservationData.selectedDate,
        startTime: reservationData.selectedTime,
        endTime: endTime,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        notes: formData.notes || "",
        proofOfPayment: formData.paymentProof,
      };

      // Create booking via API
      const response = await bookingApi.createBooking(bookingData);

      // Navigate to success page with booking data
      navigate("/booking-success", {
        state: {
          bookingData: {
            bookingId: response.data.bookingId,
            fieldName: reservationData.selectedField,
            fieldSport: "Futsal", // TODO: Get from field data
            date: reservationData.selectedDate,
            startTime: reservationData.selectedTime,
            endTime: endTime,
            totalPrice: reservationData.totalPrice,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            paymentStatus: response.data.booking.status || "pending",
          },
        },
      });
    } catch (error: any) {
      alert(`Gagal membuat reservasi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string, duration?: number) => {
    if (!duration) return time;
    const endTime = timeUtils.calculateEndTime(time, duration);
    return `${time} - ${endTime}`;
  };

  return (
    <div className="booking-form-container">
      <StepIndicator currentStep={3} />

      <div className="booking-header">
        <button className="back-button" onClick={handleBack}>
          Kembali
        </button>
        <div className="booking-title-section">
          <h1 className="booking-title">Konfirmasi Reservasi</h1>
          <p className="booking-subtitle">Lengkapi data dan konfirmasi booking Anda</p>
        </div>
      </div>

      <div className="booking-content">
        <div className="booking-form-section">
          {/* Reservation Summary */}
          <div className="reservation-summary-card">
            <h2 className="card-title">Ringkasan Reservasi</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-icon">🏟️</span>
                <div className="summary-details">
                  <span className="summary-label">Lapangan</span>
                  <span className="summary-value">{reservationData.selectedField}</span>
                </div>
              </div>

              <div className="summary-item">
                <span className="summary-icon">📅</span>
                <div className="summary-details">
                  <span className="summary-label">Tanggal</span>
                  <span className="summary-value">{reservationData.selectedDate && formatDate(reservationData.selectedDate)}</span>
                </div>
              </div>

              <div className="summary-item">
                <span className="summary-icon">⏰</span>
                <div className="summary-details">
                  <span className="summary-label">Waktu</span>
                  <span className="summary-value">{reservationData.selectedTime && formatTime(reservationData.selectedTime, reservationData.duration)}</span>
                </div>
              </div>

              <div className="summary-item">
                <span className="summary-icon">💰</span>
                <div className="summary-details">
                  <span className="summary-label">Total Harga</span>
                  <span className="summary-value price">Rp {reservationData.totalPrice?.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="form-card">
            <h2 className="card-title">Data Pemesan</h2>
            <div className="form-grid">
              <FormField label="Nama Lengkap" type="text" value={formData.customerName} onChange={(value) => handleInputChange("customerName", value)} error={errors.customerName} placeholder="Masukkan nama lengkap" required />

              <FormField label="Nomor Telepon" type="tel" value={formData.customerPhone} onChange={(value) => handleInputChange("customerPhone", value)} error={errors.customerPhone} placeholder="08xxxxxxxxxx" required />

              <div className="form-field full-width">
                <label className="form-label">Catatan (Opsional)</label>
                <textarea className="form-textarea" value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} placeholder="Tambahkan catatan khusus untuk reservasi Anda" rows={3} />
              </div>
            </div>
          </div>

          {/* Payment Method - Fixed to Transfer BSI */}
          <div className="form-card">
            <h2 className="card-title">Metode Pembayaran</h2>
            <div className="payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <div key={method.id} className="payment-card selected">
                  <div className="payment-radio">
                    <div className="radio-dot selected"></div>
                  </div>
                  <div className="payment-info">
                    <h3 className="payment-name">{method.name}</h3>
                    <p className="payment-desc">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Account Information for Transfer BSI */}
          <div className="form-card">
            <h2 className="card-title">Informasi Rekening Transfer</h2>
            <div className="bank-info-card">
              <div className="bank-header">
                <span className="bank-icon">🏦</span>
                <div className="bank-details">
                  <h3 className="bank-name">Bank Syariah Indonesia (BSI)</h3>
                  <p className="bank-subtitle">Silakan transfer ke rekening berikut</p>
                </div>
              </div>

              <div className="account-details">
                <div className="account-item">
                  <span className="account-label">Nomor Rekening:</span>
                  <div className="account-value-container">
                    <span className="account-value">1234567890123456</span>
                    <button className="copy-button" onClick={() => navigator.clipboard.writeText("1234567890123456")} title="Salin nomor rekening">
                      📋
                    </button>
                  </div>
                </div>

                <div className="account-item">
                  <span className="account-label">Atas Nama:</span>
                  <span className="account-value">MilanoSport Aceh</span>
                </div>

                <div className="account-item">
                  <span className="account-label">Total Transfer:</span>
                  <span className="account-value amount">Rp {reservationData.totalPrice?.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="transfer-notes">
                <h4>Petunjuk Transfer:</h4>
                <ul>
                  <li>Transfer sesuai nominal yang tertera</li>
                  <li>Simpan bukti transfer untuk diupload</li>
                  <li>Konfirmasi pembayaran maksimal 1x24 jam</li>
                  <li>Reservasi akan dibatalkan otomatis jika tidak ada konfirmasi</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Proof Upload - Always show since only transfer is available */}
          <div className="form-card">
            <h2 className="card-title">Bukti Pembayaran</h2>
            <PaymentProofUpload onFileChange={handleFileChange} error={errors.paymentProof} />
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button className="submit-button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading-text">
                  <span className="spinner"></span>
                  Memproses...
                </span>
              ) : (
                "Konfirmasi Reservasi"
              )}
            </button>
            <p className="submit-note">Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang berlaku</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Field Component
const FormField: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}> = ({ label, type, value, onChange, error, placeholder, required }) => (
  <div className="form-field">
    <label className="form-label">
      {label} {required && <span className="required">*</span>}
    </label>
    <input type={type} className={`form-input ${error ? "error" : ""}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    {error && <span className="error-message">{error}</span>}
  </div>
);

// Payment Proof Upload Component
const PaymentProofUpload: React.FC<{
  onFileChange: (file: File | null) => void;
  error?: any;
}> = ({ onFileChange, error }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    onFileChange(file);
  };

  return (
    <div>
      <div className="upload-zone">
        <input type="file" id="payment-proof" accept="image/*,.pdf" onChange={handleFileSelect} className="upload-input" />
        <label htmlFor="payment-proof" className="upload-label">
          <div className="upload-icon">📎</div>
          <div className="upload-text">
            {selectedFile ? (
              <span className="file-selected">{selectedFile.name}</span>
            ) : (
              <>
                <span className="upload-main">Klik untuk upload bukti pembayaran</span>
                <span className="upload-sub">PNG, JPG maksimal 5MB</span>
              </>
            )}
          </div>
        </label>
      </div>
      {error && <span className="error-message">{typeof error === "string" ? error : "Bukti transfer wajib diupload"}</span>}
    </div>
  );
};

export default Step3_BookingForm;
