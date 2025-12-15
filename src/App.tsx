// src/App.tsx

import React from "react";
import { Routes, Route } from "react-router-dom";

import { Navbar } from "./components/common/Navbar";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AdminRoute } from "./context/AdminRoute.tsx";
import Home from "./pages/Home.tsx"; // Pastikan path ini benar
import AboutUs from "./pages/AboutUs.tsx"; // Pastikan path ini benar

// Import Reservation Components
import Step1_FieldSelection from "./pages/Reservation/Step1_FieldSelection.tsx";
import Step2_ScheduleCheck from "./pages/Reservation/Step2_ScheduleCheck.tsx";
import Step3_BookingForm from "./pages/Reservation/Step3_BookingForm.tsx";
import MyBookings from "./pages/Reservation/MyBookings";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Profile/Profile";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminHome from "./pages/Admin/AdminHome";
import BookingsList from "./pages/Admin/BookingsList";
import UsersManagement from "./pages/Admin/UsersManagement";
import FinanceManagement from "./pages/Admin/FinanceManagement";
import Analytics from "./pages/Admin/Analytics.tsx";

// Layout component that includes Navbar
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="main-content">{children}</div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/reservasi"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Step1_FieldSelection />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jadwal"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Step2_ScheduleCheck />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Step3_BookingForm />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyBookings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tentang"
        element={
          <MainLayout>
            <AboutUs />
          </MainLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="bookings" element={<BookingsList />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="finance" element={<FinanceManagement />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="*"
        element={
          <MainLayout>
            <h1>404 Not Found</h1>
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default App;
