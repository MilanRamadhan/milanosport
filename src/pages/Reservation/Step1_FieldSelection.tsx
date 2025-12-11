import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fieldApi, type Field } from "../../api/fieldApi";
import "./Step1_FieldSelection.css";

interface FieldType {
  _id: string;
  type: string;
  price: number;
  description: string;
  icon: string;
}

// Icon mapping for sports
const SPORT_ICONS: Record<string, string> = {
  MiniSoccer: "⚽",
  Futsal: "🥅",
  Badminton: "🏸",
  Padel: "🎾",
};

// Description mapping
const SPORT_DESCRIPTIONS: Record<string, string> = {
  MiniSoccer: "Lapangan rumput sintetis berkualitas tinggi dengan fasilitas lengkap.",
  Futsal: "Permukaan vinyl berkualitas tinggi dengan pencahayaan optimal.",
  Badminton: "4 unit lapangan dengan lantai kayu dan net standar internasional.",
  Padel: "2 unit lapangan dengan dinding kaca dan permukaan sintetis premium.",
};

const FieldDetailModal: React.FC<{ field: FieldType; onClose: () => void }> = ({ field, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <span className="modal-icon">{field.icon}</span>
        <h2 className="modal-title">{field.type}</h2>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="modal-image">
        <div className="image-placeholder">
          <span className="image-icon">{field.icon}</span>
          <p>Premium Sports Facility - {field.type}</p>
        </div>
      </div>

      <div className="modal-details">
        <div className="detail-section">
          <h3>Deskripsi Fasilitas</h3>
          <p>{field.description} Fasilitas terbaik di Aceh dengan teknologi modern dan standar internasional.</p>
        </div>

        <div className="detail-section">
          <h3>Informasi Harga</h3>
          <div className="price-info">
            <span className="price-label">Harga Dasar:</span>
            <span className="price-value">Rp {field.price.toLocaleString("id-ID")} / jam</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Fasilitas Tambahan</h3>
          <ul className="facilities-list">
            <li>✓ Ruang ganti dengan locker</li>
            <li>✓ Shower dengan air hangat</li>
            <li>✓ Parkir luas dan aman</li>
            <li>✓ Kantin dan area istirahat</li>
          </ul>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn-primary" onClick={onClose}>
          Tutup
        </button>
      </div>
    </div>
  </div>
);

const FieldCardUI: React.FC<{
  field: FieldType;
  onFieldSelect?: (fieldType: string) => void;
}> = ({ field, onFieldSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAction = (action: string) => {
    if (action === "detail") {
      setIsModalOpen(true);
    } else if (action === "select") {
      if (onFieldSelect) {
        onFieldSelect(field.type);
      }
    }
  };

  const getFieldClass = () => {
    return field.type.toLowerCase().replace(" ", "-");
  };

  return (
    <>
      <div className={`field-card ${getFieldClass()}`}>
        <div className="field-card-header">
          <div className="field-icon">{field.icon}</div>
          <h3 className="field-card-title">{field.type}</h3>
        </div>

        <div className="field-card-body">
          <p className="field-description">{field.description}</p>

          <div className="field-price-container">
            <span className="price-label">Mulai dari</span>
            <span className="field-price">Rp {field.price.toLocaleString("id-ID")}/jam</span>
          </div>

          <div className="field-actions">
            <button onClick={() => handleAction("select")} className="btn-primary">
              Pilih Lapangan
            </button>
            <button onClick={() => handleAction("detail")} className="btn-secondary">
              Detail
            </button>
          </div>
        </div>
      </div>
      {isModalOpen && <FieldDetailModal field={field} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

const Step1_FieldSelection: React.FC = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<FieldType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const response = await fieldApi.getAllFields();

        // Group fields by sport and convert to FieldType
        const fieldsBySport: Record<string, Field> = {};
        response.data.forEach((field) => {
          if (!fieldsBySport[field.sport]) {
            fieldsBySport[field.sport] = field;
          }
        });

        const formattedFields: FieldType[] = Object.values(fieldsBySport).map((field) => ({
          _id: field._id,
          type: field.sport,
          price: field.pricePerHour,
          description: SPORT_DESCRIPTIONS[field.sport] || "Fasilitas olahraga berkualitas tinggi.",
          icon: SPORT_ICONS[field.sport] || "🏟️",
        }));

        setFields(formattedFields);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching fields:", err);
        setError(err.message || "Gagal memuat data lapangan");
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  const handleFieldSelect = (fieldType: string) => {
    // Navigate to schedule page with selected field
    navigate(`/jadwal?field=${encodeURIComponent(fieldType)}`);
  };

  if (loading) {
    return (
      <div className="field-selection-container">
        <div className="field-header">
          <h1 className="field-title">Memuat Data Lapangan...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="field-selection-container">
        <div className="field-header">
          <h1 className="field-title">Gagal Memuat Data</h1>
          <p className="field-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="field-selection-container">
      <div className="field-header">
        <h1 className="field-title">Pilih Lapangan Favorit Anda</h1>
        <p className="field-subtitle">Fasilitas olahraga premium dengan teknologi terdepan di Aceh. Nikmati pengalaman bermain yang tak terlupakan dengan standar internasional.</p>
      </div>

      <div className="field-cards-container">
        {fields.map((field) => (
          <FieldCardUI key={field._id} field={field} onFieldSelect={handleFieldSelect} />
        ))}
      </div>
    </div>
  );
};

export default Step1_FieldSelection;
