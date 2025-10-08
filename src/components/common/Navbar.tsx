import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user?.role === true;

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Effect untuk mengontrol navbar scroll
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const scrollWithOffset = (el: HTMLElement) => {
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
    setIsOpen(false);
  };

  const isActive = (hash: string) => (location.hash === hash || (hash === "#hero" && location.pathname === "/") ? "nav-link active" : "nav-link");

  const handleAuth = () => {
    if (!isLoggedIn) {
      // Kalau belum login, arahkan ke login
      if (!location.pathname.includes("/login") && !location.pathname.includes("/register")) {
        localStorage.setItem("redirectAfterLogin", location.pathname + location.hash);
      }
      navigate("/login");
    } else {
      // Kalau sudah login, arahkan ke halaman profile
      navigate("/profile");
    }
  };

  return (
    <nav className={`navbar ${isVisible ? "navbar-visible" : "navbar-hidden"}`}>
      <div className="navbar-container">
        <HashLink smooth to="/#hero" scroll={scrollWithOffset} className="navbar-brand">
          <div className="logo-icon">
            <span className="logo-text">M</span>
          </div>
          <span className="brand-name">MilanoSport</span>
        </HashLink>

        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <HashLink smooth to="/#hero" scroll={scrollWithOffset} className={isActive("#hero")}>
            Home
          </HashLink>

          <HashLink smooth to="/reservasi" className={location.pathname === "/reservasi" ? "nav-link active" : "nav-link"} onClick={() => setIsOpen(false)}>
            Cek & Reservasi
          </HashLink>

          {isLoggedIn && (
            <HashLink smooth to="/my-bookings" className={location.pathname === "/my-bookings" ? "nav-link active" : "nav-link"}>
              Reservasi Saya
            </HashLink>
          )}

          {isAdmin && isLoggedIn && (
            <HashLink smooth to="/admin" className={location.pathname === "/admin" ? "nav-link active" : "nav-link"} style={{ color: "#ff6b6b" }}>
              Admin Panel
            </HashLink>
          )}

          <button className="login-button" onClick={handleAuth}>
            {!isLoggedIn ? "Login" : "Profile"}
          </button>
        </div>

        <button className={`navbar-toggle ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};
