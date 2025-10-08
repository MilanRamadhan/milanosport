import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.60:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Booking API interfaces matching backend schema
export interface CreateBookingRequest {
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  proofOfPayment: File;
}

export interface Booking {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  fieldId: string | { _id: string; name: string; pricePerHour: number; sport: string };
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  paymentMethod: string;
  proofOfPayment: string;
  status: string;
  paymentStatus: string;
  totalHours: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  status: number;
  data: {
    bookingId: string;
    booking: Booking;
    paymentInfo?: {
      totalPrice: number;
      paymentMethod: string;
      paymentStatus: string;
    };
  };
  message: string;
}

export interface BookingListResponse {
  status: number;
  data: Booking[];
  message: string;
}

// API functions
export const bookingApi = {
  createBooking: async (bookingData: CreateBookingRequest): Promise<BookingResponse> => {
    try {
      const formData = new FormData();
      formData.append("fieldId", bookingData.fieldId);
      formData.append("date", bookingData.date);
      formData.append("startTime", bookingData.startTime);
      formData.append("endTime", bookingData.endTime);
      formData.append("customerName", bookingData.customerName);
      formData.append("customerPhone", bookingData.customerPhone);
      if (bookingData.notes) formData.append("notes", bookingData.notes);
      if (bookingData.proofOfPayment) formData.append("proofOfPayment", bookingData.proofOfPayment);

      const response = await api.post("/bookings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal membuat booking");
    }
  },

  getUserBookings: async (): Promise<BookingListResponse> => {
    try {
      const response = await api.get("/bookings/me");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil daftar booking");
    }
  },

  getBookingById: async (bookingId: string): Promise<BookingResponse> => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil detail booking");
    }
  },

  cancelBooking: async (bookingId: string): Promise<BookingResponse> => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal membatalkan booking");
    }
  },

  // Admin functions
  getAllBookings: async (): Promise<BookingListResponse> => {
    try {
      const response = await api.get("/bookings");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil semua booking");
    }
  },

  updatePaymentStatus: async (bookingId: string, paymentStatus: "pending" | "paid" | "failed"): Promise<BookingResponse> => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/payment`, { paymentStatus });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengubah status pembayaran");
    }
  },
};

// Utility functions for time calculations
export const timeUtils = {
  calculateEndTime: (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHour = hours + duration;
    const endMinutes = minutes;
    return `${endHour.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  },

  timeToMinutes: (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  },

  minutesToTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  },

  formatDateForAPI: (date: Date): string => {
    return date.toISOString().split("T")[0];
  },
};

export default bookingApi;
