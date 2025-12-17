import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://milano-sport-backend.vercel.app/api";

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

// User Management Interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  role: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  status: number;
  data: User[];
  message: string;
}

export interface UserResponse {
  status: number;
  data: User;
  message: string;
}

// Finance Management Interfaces
export interface FinanceRecord {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceListResponse {
  status: number;
  data: FinanceRecord[];
  message: string;
}

// Analytics Interfaces
export interface AnalyticsData {
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

export interface AnalyticsResponse {
  status: number;
  data: AnalyticsData;
  message: string;
}

// Activity Log Interfaces
export interface ActivityLog {
  _id: string;
  userId: string | { name: string; email: string };
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface LogsResponse {
  status: number;
  data: ActivityLog[];
  message: string;
}

// Admin API functions
export const adminApi = {
  // User Management
  getAllUsers: async (): Promise<UserListResponse> => {
    try {
      const response = await api.get("/admin/users");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil data users");
    }
  },

  getUserById: async (userId: string): Promise<UserResponse> => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil detail user");
    }
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<UserResponse> => {
    try {
      const response = await api.patch(`/admin/users/${userId}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengupdate user");
    }
  },

  deleteUser: async (userId: string): Promise<{ status: number; message: string }> => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal menghapus user");
    }
  },

  toggleUserRole: async (userId: string): Promise<UserResponse> => {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-role`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengubah role user");
    }
  },

  // Finance Management
  getAllFinanceRecords: async (params?: { from?: string; to?: string; type?: "income" | "expense" }): Promise<FinanceListResponse> => {
    try {
      const response = await api.get("/admin/finance", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil data finance");
    }
  },

  createFinanceRecord: async (record: Omit<FinanceRecord, "_id" | "createdBy" | "createdAt" | "updatedAt">): Promise<{ status: number; data: FinanceRecord; message: string }> => {
    try {
      const response = await api.post("/admin/finance", record);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal membuat record finance");
    }
  },

  updateFinanceRecord: async (recordId: string, updates: Partial<FinanceRecord>): Promise<{ status: number; data: FinanceRecord; message: string }> => {
    try {
      const response = await api.patch(`/admin/finance/${recordId}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengupdate finance record");
    }
  },

  deleteFinanceRecord: async (recordId: string): Promise<{ status: number; message: string }> => {
    try {
      const response = await api.delete(`/admin/finance/${recordId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal menghapus finance record");
    }
  },

  // Analytics
  getAnalytics: async (params?: { from?: string; to?: string }): Promise<AnalyticsResponse> => {
    try {
      const response = await api.get("/admin/analytics", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil data analytics");
    }
  },

  // Activity Logs
  getActivityLogs: async (params?: { userId?: string; action?: string; from?: string; to?: string }): Promise<LogsResponse> => {
    try {
      const response = await api.get("/admin/logs", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil activity logs");
    }
  },

  // Sync Bookings to Finance
  syncBookingsToFinance: async (): Promise<{
    status: number;
    message: string;
    syncedCount: number;
    skippedCount: number;
  }> => {
    try {
      const response = await api.post("/bookings/sync-to-finance");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal melakukan sync bookings");
    }
  },
};

export default adminApi;
