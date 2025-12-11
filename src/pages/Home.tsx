// src/pages/Home.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Calendar,
  Trophy,
  DollarSign,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";
import { Navbar } from "../components/common/Navbar";
import InfiniteScroll from "../components/common/InfiniteScroll";
import "./Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  // Cek status login dari localStorage (atau ganti sesuai state management Anda)
  const isLoggedIn = Boolean(localStorage.getItem("isLoggedIn"));

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  const FeatureCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    description: string;
    delay: number;
  }> = ({ title, icon, description, delay }) => (
    <div className="feature-card" data-aos="fade-up" data-aos-delay={delay}>
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );

  const sports = [
    { name: "Mini Soccer", emoji: "⚽" },
    { name: "Futsal", emoji: "🥅" },
    { name: "Badminton", emoji: "🏸" },
    { name: "Padel", emoji: "🎾" },
  ];

  const items = [
    {
      content: (
        <img
          src="/assets/mini-soccer.jpg"
          alt="Mini Soccer"
          style={{ width: "90%", borderRadius: "45px", objectFit: "cover" }}
        />
      ),
    },
    {
      content: (
        <img
          src="/assets/futsal.jpg"
          alt="Futsal"
          style={{ width: "90%", borderRadius: "45px", objectFit: "cover" }}
        />
      ),
    },
    {
      content: (
        <img
          src="/assets/badminton_new.jpg"
          alt="Badminton"
          style={{ width: "90%", borderRadius: "45px", objectFit: "cover" }}
        />
      ),
    },
    {
      content: (
        <img
          src="/assets/padel.jpg"
          alt="Padel"
          style={{ width: "90%", borderRadius: "45px", objectFit: "cover" }}
        />
      ),
    },
  ];

  // Data Lapangan
  const fieldsData = [
    {
      id: 1,
      icon: "⚽",
      title: "Mini Soccer",
      description:
        "Lapangan rumput sintetis premium dengan pencahayaan LED berkualitas tinggi.",
      priceFrom: "150.000",
      category: "mini-soccer",
      image: "/assets/mini-soccer_game.jpg",
    },
    {
      id: 2,
      icon: "🥅",
      title: "Futsal",
      description:
        "Lapangan indoor berkualitas tinggi dengan lantai vinyl anti-slip terbaik.",
      priceFrom: "120.000",
      category: "futsal",
      image: "/assets/futsal_game.jpg",
    },
    {
      id: 3,
      icon: "🏸",
      title: "Badminton",
      description:
        "Court indoor ber-AC dengan lantai karpet standar internasional BWF.",
      priceFrom: "80.000",
      category: "badminton",
      image: "/assets/badminton_game.jpg",
    },
    {
      id: 4,
      icon: "🎾",
      title: "Padel",
      description:
        "Lapangan padel modern dengan dinding kaca tempered dan net profesional.",
      priceFrom: "200.000",
      category: "padel",
      image: "/assets/padel.jpg",
    },
  ];

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span>Platform Reservasi Lapangan #1 di Aceh</span>
            </div>
            <h1 className="hero-title">
              Satu Tempat,
              <br />
              <span className="hero-title-gradient">Semua Lapangan</span>
            </h1>
            <p className="hero-subtitle">
              Reservasi cepat dan mudah untuk Mini Soccer, Futsal, Badminton &
              Padel.
              <br />
              Kapan saja, di mana saja.
            </p>

            {/* Sports Pills */}
            <div className="sports-pills">
              {sports.map((sport, idx) => (
                <div key={idx} className="sport-pill glass-panel">
                  <span className="sport-emoji">{sport.emoji}</span>
                  <span className="sport-name">{sport.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (isLoggedIn) {
                  navigate("/reservasi");
                } else {
                  navigate("/login");
                }
              }}
              className="hero-btn"
            >
              Reservasi Sekarang
            </button>
          </div>

          {/* Image Section */}
          <div className="hero-image glass-panel">
            <div style={{ height: "500px", position: "relative" }}>
              <InfiniteScroll
                items={items}
                isTilted={true}
                tiltDirection="left"
                autoplay={true}
                autoplaySpeed={2}
                autoplayDirection="down"
                pauseOnHover={true}
                itemMinHeight={200}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-content glass-panel">
          <h2 className="section-title-feature" data-aos="fade-up">
            Mengapa Memilih MilanoSport?
          </h2>
          <p
            className="section-subtitle"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Kemudahan dan kenyamanan untuk pengalaman booking terbaik Anda
          </p>

          <div className="features-grid">
            <FeatureCard
              icon={<Trophy className="icon-white" />}
              title="Fasilitas Terlengkap"
              description="Mini Soccer, Futsal, Badminton, dan Padel dalam satu platform yang terintegrasi."
              delay={200}
            />
            <FeatureCard
              icon={<Calendar className="icon-white" />}
              title="Jadwal Real-time"
              description="Cek ketersediaan langsung tanpa perlu telepon. Transparansi penuh untuk Anda."
              delay={300}
            />
            <FeatureCard
              icon={<DollarSign className="icon-white" />}
              title="Harga Terbaik"
              description="Harga kompetitif dan transparan di seluruh wilayah Aceh. Tidak ada biaya tersembunyi."
              delay={400}
            />
          </div>
        </div>
      </section>

      <section id="reservasi" className="field-selection-section">
        <div className="field-selection-container-home">
          {/* Section Header */}
          <div className="section-header">
            <p className="section-subtitle">Pilihan Lapangan</p>
            <h2 className="section-title-feature1">
              Temukan Lapangan Favoritmu
            </h2>
            <p className="section-description">
              Berbagai pilihan lapangan olahraga dengan fasilitas terbaik dan
              harga terjangkau
            </p>
          </div>

          {/* Field Cards Grid */}
          <div className="field-cards-grid">
            {fieldsData.map((field) => (
              <div key={field.id} className="field-card">
                {/* Gambar Lapangan */}
                <div className="field-card-image">
                  <img
                    src={field.image}
                    alt={field.title}
                    className="field-image"
                  />
                </div>

                {/* Content */}
                <h3 className="field-card-title">{field.title}</h3>
                <p className="field-card-description">{field.description}</p>

                {/* Price */}
                <div className="field-card-price">
                  <span className="price-label">Mulai dari</span>
                  <span className="price-amount">Rp {field.priceFrom}</span>
                  <span className="price-period">/jam</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section warna-cta" data-aos="zoom-in">
        <div className="cta-content">
          <h2 className="cta-title">Siap Amankan Lapangan Anda?</h2>
          <p className="cta-subtitle">
            Jangan sampai kehabisan slot! Booking sekarang dan nikmati
            pengalaman bermain terbaik.
          </p>
          <button
            onClick={() => {
              if (isLoggedIn) {
                navigate("/reservasi");
              } else {
                navigate("/login");
              }
            }}
            className="cta-btn"
          >
            <span>Cek Jadwal & Booking</span>
          </button>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="section-content">
          <h2 className="section-title-feature" data-aos="fade-up">
            Lokasi Kami
          </h2>
          <p
            className="section-subtitle"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Temukan kami di lokasi strategis di Banda Aceh
          </p>

          <div className="location-container">
            <div
              className="location-info glass-panel"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <h3>MilanoSport Aceh</h3>
              <div className="info-item">
                <MapPin size={20} />
                <span>Jl. T. Nyak Arief No. 123, Banda Aceh</span>
              </div>
              <div className="info-item">
                <Phone size={20} />
                <span>(0651) 123456</span>
              </div>
              <div className="info-item">
                <Clock size={20} />
                <span>Senin - Minggu: 06:00 - 23:00 WIB</span>
              </div>
              <button
                onClick={() => window.open("https://maps.google.com", "_blank")}
                className="location-btn"
              >
                Buka di Google Maps
              </button>
            </div>

            <div
              className="location-map glass-panel"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.0247033992654!2d95.3216313!3d5.5483467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzInNTQuMCJOIDk1wrAxOScxNy45IkU!5e0!3m2!1sen!2sid!4v1625641234567!5m2!1sen!2sid"
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: "30px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="tentang" className="about-section">
        <div className="section-content" data-aos="fade-up">
          <div className="section-header">
            <h2 className="section-title-feature1">Tentang Kami</h2>
          </div>
          <p className="about-description">
            Milano Sport adalah pusat olahraga modern yang berkomitmen untuk
            menyediakan fasilitas olahraga berkualitas tinggi bagi komunitas.
            Didirikan dengan visi untuk mempromosikan gaya hidup sehat dan
            aktif, kami menawarkan berbagai lapangan olahraga yang dirawat
            dengan baik untuk mini soccer, futsal, badminton, dan padel. Dengan
            lokasi yang strategis dan fasilitas modern, Milano Sport menjadi
            tempat ideal bagi para penggemar olahraga untuk berlatih,
            berkompetisi, dan membangun komunitas yang sehat dan energik.
          </p>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-logo">
                <div className="logo-icon">
                  <span className="logo-text">M</span>
                </div>
                <span className="footer-brand">MilanoSport</span>
              </div>
              <p className="footer-desc">
                Platform reservasi lapangan olahraga terpercaya di Aceh. Nikmati
                kemudahan booking kapan saja, di mana saja.
              </p>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Kontak</h3>
              <div className="footer-info">
                <div className="info-item">
                  <Phone className="info-icon" />
                  <span>(0651) 123456</span>
                </div>
                <div className="info-item">
                  <MapPin className="info-icon" />
                  <span>Banda Aceh, Indonesia</span>
                </div>
              </div>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Jam Operasional</h3>
              <div className="info-item">
                <Clock className="info-icon" />
                <span>Senin - Minggu: 06:00 - 23:00 WIB</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; 2025 MilanoSport. Reservasi Lapangan Aceh. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
