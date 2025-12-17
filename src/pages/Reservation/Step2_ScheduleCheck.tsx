import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { timeUtils } from "../../api/bookingApi";
import { fieldApi, type Field } from "../../api/fieldApi";
import StepIndicator from "../../components/common/StepIndicator";
import "./Step2_ScheduleCheck.css";

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}

const generateDates = () => {
  const dates = [];
  const today = new Date();
  // Batasi booking hanya 7 hari ke depan (sesuai backend)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const Step2_ScheduleCheck: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedFieldFromUrl = searchParams.get("field");

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [currentField, setCurrentField] = useState<string>(selectedFieldFromUrl || "");
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);

  // Function to calculate End Time
  const calculateEndTime = (startTime: string, duration: number): string => {
    return timeUtils.calculateEndTime(startTime, duration);
  };

  // Fetch booked slots when date and field change
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !currentField) {
        setBookedSlots([]);
        return;
      }

      try {
        // Find field details to get field ID
        const fieldDetails = fields.find((f) => f.name === currentField || f._id === currentField || f.sport === currentField);
        if (!fieldDetails) return;

        const response = await bookingApi.getBookedSlots(fieldDetails._id, selectedDate);
        setBookedSlots(response.data);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, currentField, fields]);

  // Fetch fields from backend
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const response = await fieldApi.getAllFields();
        setFields(response.data);
      } catch (error) {
        console.error("Error fetching fields:", error);
        // Set empty array on error
        setFields([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  // Generate available time slots based on field availability
  useEffect(() => {
    if (currentField && selectedDate) {
      generateAvailableTimeSlots();
    }
  }, [currentField, selectedDate]);

  const generateAvailableTimeSlots = async () => {
    const field = fields.find((f) => f.name === currentField || f._id === currentField || f.sport === currentField);
    if (!field || !selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    try {
      // Get availability from backend
      const availabilityResponse = await fieldApi.getFieldAvailability(field._id, selectedDate);

      if (!availabilityResponse.data.available) {
        setAvailableTimeSlots([]);
        return;
      }

      const { openTime, closeTime, bookedSlots } = availabilityResponse.data;
      if (!openTime || !closeTime) {
        setAvailableTimeSlots([]);
        return;
      }

      const slots: TimeSlot[] = [];
      const openMinutes = timeUtils.timeToMinutes(openTime);
      const closeMinutes = timeUtils.timeToMinutes(closeTime);

      // Generate hourly slots
      for (let minutes = openMinutes; minutes < closeMinutes; minutes += 60) {
        const time = timeUtils.minutesToTime(minutes);
        let priceMultiplier = 1;

        // Apply price multipliers based on time
        const hour = Math.floor(minutes / 60);
        if (hour < 8) {
          priceMultiplier = 0.8; // Morning discount
        } else if (hour >= 16 && hour < 21) {
          priceMultiplier = 1.2; // Peak hours
        }

        // Check if time slot conflicts with booked slots
        const isBooked = bookedSlots.some((booked) => {
          const bookedStart = timeUtils.timeToMinutes(booked.startTime);
          const bookedEnd = timeUtils.timeToMinutes(booked.endTime);
          return minutes >= bookedStart && minutes < bookedEnd;
        });

        slots.push({
          time,
          available: !isBooked,
          price: priceMultiplier,
        });
      }

      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailableTimeSlots([]);
    }
  };

  const dates = generateDates();

  // Find field details based on current field name, ID, or sport
  const fieldDetails = fields.find((f) => f.name === currentField || f._id === currentField || f.sport === currentField);
  const basePrice = fieldDetails?.pricePerHour || 0;

  const handleFieldSelect = (fieldId: string) => {
    setCurrentField(fieldId);
    // Reset time selection when field changes
    setSelectedTime("");
  };

  const handleBack = () => {
    navigate("/reservasi");
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime && duration > 0 && currentField && fieldDetails) {
      const totalPrice = calculateTotalPrice();
      const params = new URLSearchParams({
        fieldId: fieldDetails._id,
        fieldName: fieldDetails.name,
        date: selectedDate,
        time: selectedTime,
        duration: duration.toString(),
        totalPrice: totalPrice.toString(),
      });
      navigate(`/booking?${params.toString()}`);
    }
  };

  if (loading) {
    return (
      <div className="schedule-container">
        <div className="schedule-header">
          <h1 className="schedule-title">Memuat data lapangan...</h1>
        </div>
      </div>
    );
  }

  const getSelectedTimeSlot = () => {
    return availableTimeSlots.find((slot) => slot.time === selectedTime);
  };

  const calculateTotalPrice = () => {
    const timeSlot = getSelectedTimeSlot();
    if (!timeSlot) return 0;
    return Math.round(basePrice * timeSlot.price * duration);
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    setSelectedDate(dateString);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  const getDateLabel = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hari ini";
    if (date.toDateString() === tomorrow.toDateString()) return "Besok";
    return formatDate(date);
  };

  return (
    <div className="schedule-container">
      <StepIndicator currentStep={2} />

      <div className="schedule-header">
        <button className="back-button" onClick={handleBack}>
          Kembali
        </button>
        <div className="schedule-title-section">
          <h1 className="schedule-title">Pilih Waktu Bermain</h1>
          {currentField ? (
            <p className="selected-field">
              Lapangan: <span>{fieldDetails?.name || currentField}</span>
            </p>
          ) : (
            <p className="selected-field">Silakan pilih lapangan terlebih dahulu</p>
          )}
        </div>
      </div>

      <div className="schedule-content">
        {/* Field Selection (jika belum dipilih) */}
        {!currentField && (
          <div className="field-selection-section">
            <h2 className="section-title">Pilih Lapangan</h2>
            <div className="field-selector-grid">
              {fields.map((field) => (
                <button key={field._id} className="field-selector-card" onClick={() => handleFieldSelect(field._id)}>
                  <span className="field-selector-icon">🏟️</span>
                  <span className="field-selector-name">{field.name}</span>
                  <span className="field-selector-price">Rp {field.pricePerHour.toLocaleString("id-ID")}/jam</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Selection */}
        {currentField && (
          <div className="date-section">
            <h2 className="section-title">Pilih Tanggal</h2>
            <div className="date-grid">
              {dates.map((date, index) => (
                <button key={index} className={`date-card ${selectedDate === date.toISOString().split("T")[0] ? "selected" : ""}`} onClick={() => handleDateSelect(date)}>
                  <span className="date-day">{date.getDate()}</span>
                  <span className="date-label">{getDateLabel(date)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Selection */}
        {selectedDate && (
          <div className="time-section">
            <h2 className="section-title">Pilih Jam</h2>
            <div className="time-grid">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.time}
                  className={`time-slot ${!slot.available ? "unavailable" : ""} ${selectedTime === slot.time ? "selected" : ""}`}
                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                >
                  <span className="time-text">{slot.time}</span>
                  <span className="price-multiplier">
                    {slot.price === 0.8 && <span className="discount">-20%</span>}
                    {slot.price === 1.2 && <span className="peak">Peak</span>}
                    {slot.price === 1 && <span className="normal">Normal</span>}
                  </span>
                </button>
              ))}
            </div>
            {availableTimeSlots.length === 0 && <p className="no-slots-message">Tidak ada jadwal tersedia untuk hari ini</p>}
          </div>
        )}

        {/* Duration Selection */}
        {selectedTime && (
          <div className="duration-section">
            <h2 className="section-title">Durasi Bermain</h2>
            <div className="duration-controls">
              <button className="duration-btn" onClick={() => setDuration(Math.max(1, duration - 1))} disabled={duration <= 1}>
                -
              </button>
              <span className="duration-display">{duration} jam</span>
              <button className="duration-btn" onClick={() => setDuration(Math.min(4, duration + 1))} disabled={duration >= 4}>
                +
              </button>
            </div>
            <p className="duration-note">Maksimal 4 jam per booking</p>
          </div>
        )}

        {/* Booking Summary */}
        {selectedDate && selectedTime && (
          <div className="booking-summary">
            <h2 className="section-title">Ringkasan Booking</h2>
            <div className="summary-card">
              <div className="summary-item">
                <span className="summary-label">Lapangan:</span>
                <span className="summary-value">{fieldDetails?.name || currentField}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tanggal:</span>
                <span className="summary-value">
                  {new Date(selectedDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Waktu:</span>
                <span className="summary-value">
                  {selectedTime} - {calculateEndTime(selectedTime, duration)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Durasi:</span>
                <span className="summary-value">{duration} jam</span>
              </div>
              <div className="summary-item total">
                <span className="summary-label">Total Harga:</span>
                <span className="summary-value">Rp {calculateTotalPrice().toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button className="continue-button" onClick={handleContinue}>
              Lanjutkan ke Pembayaran
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2_ScheduleCheck;
