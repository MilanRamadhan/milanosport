import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.60:5000/api";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Gunakan sessionStorage agar sesi tidak persist setelah browser/tab ditutup
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem("authToken"); // <-- pindah dari localStorage ke sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ====== Interfaces ======
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: boolean; // true admin, false user
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: number;
  data: {
    _id: string;
    name: string;
    email: string;
    role: boolean;
    token?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  token: string;
  message?: string;
}

export interface ProfileResponse {
  status: number;
  data: {
    _id: string;
    name: string;
    email: string;
    role: boolean;
    phone: string;
    address?: string;
    birthDate?: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LogoutRequest {
  userId: string;
}

// ====== API functions ======
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal melakukan registrasi");
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal melakukan login");
    }
  },

  logout: async (userId: string): Promise<{ status: number; message: string }> => {
    try {
      const response = await api.post("/auth/logout", { userId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal melakukan logout");
    }
  },

  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengambil profil");
    }
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    try {
      const response = await api.put("/auth/profile", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal memperbarui profil");
    }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ status: number; message: string }> => {
    try {
      const response = await api.put("/auth/change-password", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gagal mengubah password");
    }
  },
};

export default authApi;
