import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import "./Auth.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Mohon isi semua field");
      return;
    }

    setIsLoading(true);
    try {
      // Call backend login API
      const response = await authApi.login({ email, password });

      // Save auth data using AuthContext
      login(response.token, {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      });

      // Redirect berdasarkan role
      if (response.data.role) {
        // Jika admin, langsung ke dashboard admin
        navigate("/admin");
      } else {
        // Jika user biasa, cek redirect path atau ke landing page
        const redirectPath = localStorage.getItem("redirectAfterLogin");
        localStorage.removeItem("redirectAfterLogin");

        if (
          redirectPath &&
          redirectPath !== "/login" &&
          redirectPath !== "/register" &&
          redirectPath !== "/profile"
        ) {
          navigate(redirectPath);
        } else {
          navigate("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div
          className="auth-image-section"
          style={{
            backgroundImage: "url(/assets/futsal.jpg)",
          }}
        >
          <div className="auth-image-content">
            <h2 className="auth-image-title">Selamat Datang Kembali</h2>
            <p className="auth-image-text">
              Nikmati kemudahan reservasi lapangan olahraga favorit Anda dengan
              Milano Sport
            </p>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-header">
            <h2 className="auth-title">Login</h2>
            <p className="auth-subtitle">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="Masukkan email anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Belum punya akun?{" "}
            <Link to="/register" className="auth-link">
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
