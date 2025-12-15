import React, { useEffect, useState } from "react";
import { adminApi, type FinanceRecord } from "../../api/adminApi";
import "./FinanceManagement.css";

const FinanceManagement: React.FC = () => {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchRecords();
  }, [typeFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = typeFilter !== "all" ? { type: typeFilter } : undefined;
      const response = await adminApi.getAllFinanceRecords(params);
      setRecords(response.data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data finance");
      console.error("Error fetching finance records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBookings = async () => {
    if (!window.confirm("Sync semua booking yang sudah paid ke finance records? Ini akan memproses semua booking lama yang belum tercatat.")) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminApi.syncBookingsToFinance();
      alert(`Sync berhasil! ${response.syncedCount} booking tercatat, ${response.skippedCount} sudah ada sebelumnya.`);
      fetchRecords(); // Refresh the list
    } catch (err: any) {
      alert(err.message || "Gagal melakukan sync");
      console.error("Error syncing bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await adminApi.updateFinanceRecord(editingRecord._id, formData);
        alert("Record berhasil diupdate");
      } else {
        await adminApi.createFinanceRecord(formData);
        alert("Record berhasil ditambahkan");
      }
      fetchRecords();
      closeModal();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan record");
    }
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus record ini?")) {
      try {
        await adminApi.deleteFinanceRecord(recordId);
        alert("Record berhasil dihapus");
        fetchRecords();
      } catch (err: any) {
        alert(err.message || "Gagal menghapus record");
      }
    }
  };

  const openModal = (record?: FinanceRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        type: record.type,
        category: record.category,
        amount: record.amount,
        description: record.description,
        date: record.date.split("T")[0],
      });
    } else {
      setEditingRecord(null);
      setFormData({
        type: "income",
        category: "",
        amount: 0,
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
  };

  const filteredRecords = records.filter((record) => {
    if (typeFilter === "all") return true;
    return record.type === typeFilter;
  });

  const totalIncome = records.filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="finance-page">
        <div className="loading">Loading finance data...</div>
      </div>
    );
  }

  return (
    <div className="finance-page">
      <div className="page-header">
        <div>
          <h2>Finance Management</h2>
          <p className="subtitle">Track income and expenses</p>
        </div>
        <div className="header-actions">
          <button onClick={handleSyncBookings} className="btn-sync">
            🔄 Sync Bookings
          </button>
          <button onClick={() => openModal()} className="btn-add">
            + Add Record
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Finance Stats */}
      <div className="finance-stats">
        <div className="stat-card income">
          <div className="stat-icon">+</div>
          <div className="stat-info">
            <h3>{formatCurrency(totalIncome)}</h3>
            <p>Total Income</p>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">−</div>
          <div className="stat-info">
            <h3>{formatCurrency(totalExpense)}</h3>
            <p>Total Expense</p>
          </div>
        </div>

        <div className={`stat-card profit ${netProfit >= 0 ? "positive" : "negative"}`}>
          <div className="stat-icon">{netProfit >= 0 ? "▲" : "▼"}</div>
          <div className="stat-info">
            <h3>{formatCurrency(netProfit)}</h3>
            <p>Net Profit</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="filter-select">
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expense Only</option>
        </select>
        <button onClick={fetchRecords} className="btn-refresh">
          ↻ Refresh
        </button>
      </div>

      {/* Records Table */}
      <div className="table-container">
        <table className="finance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                  No finance records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record._id}>
                  <td>{formatDate(record.date)}</td>
                  <td>
                    <span className={`badge type-${record.type}`}>{record.type}</span>
                  </td>
                  <td>{record.category}</td>
                  <td>{record.description}</td>
                  <td>
                    <span className={`amount ${record.type}`}>{formatCurrency(record.amount)}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => openModal(record)} className="btn-action edit">
                        ✎
                      </button>
                      <button onClick={() => handleDelete(record._id)} className="btn-action delete">
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecord ? "Edit Record" : "Add New Record"}</h2>
              <button onClick={closeModal} className="btn-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit} className="finance-form">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "income" | "expense",
                      })
                    }
                    required
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Booking Payment, Maintenance" required />
                </div>

                <div className="form-group">
                  <label>Amount (IDR)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description..." rows={3} required />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={closeModal} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingRecord ? "Update" : "Add"} Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagement;
