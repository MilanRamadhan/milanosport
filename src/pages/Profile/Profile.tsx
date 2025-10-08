import React, { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { Camera, User, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/common/Navbar";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import "./Profile.css";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  profileImage: string | null;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    profileImage: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile data from backend
  useEffect(() => {
    const loadProfile = async () => {
      // ProtectedRoute sudah handle authentication check
      // Jadi kita tidak perlu cek user di sini lagi
      if (!user) {
        // Jika user null, berarti sedang dalam proses logout
        // Biarkan handleLogout yang handle redirect
        return;
      }

      try {
        setIsLoading(true);
        const response = await authApi.getProfile();

        // Set profile dengan data dari backend (yang sudah ada saat registrasi)
        setProfile({
          name: response.data.name || user.name || "",
          email: response.data.email || user.email || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          birthDate: response.data.birthDate || "",
          profileImage: response.data.profileImage || null,
        });
      } catch (error: any) {
        console.error("Error loading profile:", error);

        // Jika gagal load dari backend, gunakan data user dari context
        if (user) {
          setProfile({
            name: user.name || "",
            email: user.email || "",
            phone: "",
            address: "",
            birthDate: "",
            profileImage: null,
          });
        }

        setMessage({
          text: "Menggunakan data lokal. " + (error.message || "Gagal memuat profil dari server"),
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setMessage({
          text: "Ukuran file terlalu besar. Maksimal 5MB",
          type: "error",
        });
        return;
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          text: "Format file tidak didukung. Gunakan JPG, PNG, atau GIF",
          type: "error",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Compress image using canvas
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set max dimensions
          const maxWidth = 800;
          const maxHeight = 800;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression (0.7 quality)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          setProfile((prev) => ({
            ...prev,
            profileImage: compressedBase64,
          }));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setMessage(null);

      // Update profile in backend with all fields
      const response = await authApi.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        birthDate: profile.birthDate,
        profileImage: profile.profileImage || undefined,
      });

      // Update local state with response data
      setProfile({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
        birthDate: response.data.birthDate || "",
        profileImage: response.data.profileImage || null,
      });

      setMessage({
        text: "Profil berhasil diperbarui",
        type: "success",
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        text: error.message || "Gagal memperbarui profil",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (!confirmLogout) return;

    try {
      setIsLoggingOut(true);

      // Navigate dulu sebelum logout untuk menghindari ProtectedRoute redirect
      navigate("/", { replace: true });

      // Lalu baru panggil logout untuk clear state
      await logout();
    } catch (error: any) {
      console.error("Error during logout:", error);
      setMessage({
        text: error.message || "Gagal logout",
        type: "error",
      });
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <div className="loading-container">
            <p>Memuat profil...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-content">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-image-container">
              <img src={profile.profileImage || "/assets/default-avatar.png"} alt="Profile" className="profile-image" />
              <label className="profile-image-upload" htmlFor="profile-image">
                <Camera size={20} />
                <input type="file" id="profile-image" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" hidden />
              </label>
            </div>
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-email">{profile.email}</p>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">12</div>
                <div className="stat-label">Reservasi</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">4.8</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>

            <button className="logout-button" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut size={20} />
              {isLoggingOut ? "Logging out..." : "Keluar"}
            </button>
          </aside>

          {/* Main Content */}
          <main className="profile-main">
            <div className="profile-section">
              <h3 className="section-title">
                <User size={24} />
                Informasi Profil
              </h3>

              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Nama Lengkap
                  </label>
                  <input type="text" id="name" name="name" className="form-input" value={profile.name} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input type="email" id="email" name="email" className="form-input" value={profile.email} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Nomor Telepon
                  </label>
                  <input type="tel" id="phone" name="phone" className="form-input" value={profile.phone} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate" className="form-label">
                    Tanggal Lahir
                  </label>
                  <input type="date" id="birthDate" name="birthDate" className="form-input" value={profile.birthDate} onChange={handleInputChange} />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address" className="form-label">
                    Alamat
                  </label>
                  <input type="text" id="address" name="address" className="form-input" value={profile.address} onChange={handleInputChange} />
                </div>

                {message && (
                  <div className={`${message.type === "success" ? "success-message" : "error-message"}`}>
                    {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}

                <button type="submit" className="save-button" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Profile;
