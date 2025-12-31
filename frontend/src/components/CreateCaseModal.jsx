import { useState } from "react";
import { casesAPI } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.jsx";

export default function CreateCaseModal({ isOpen, onClose, onCaseCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    caseNumber: "",
    title: "",
    clientName: "",
    clientContact: "",
    caseType: "",
    courtName: "",
    nextHearingDate: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const caseData = {
      case_number: formData.caseNumber,
      case_title: formData.title,
      client_name: formData.clientName,
      case_type: formData.caseType,
      court_name: formData.courtName,
      filing_date:
        formData.nextHearingDate || new Date().toISOString().split("T")[0],
      description: formData.description,
      status: "Active",
    };

    try {
      const response = await casesAPI.createCase(caseData);

      if (response.success) {
        setFormData({
          caseNumber: "",
          title: "",
          clientName: "",
          clientContact: "",
          caseType: "",
          courtName: "",
          nextHearingDate: "",
          description: "",
        });
        onCaseCreated(response.data);
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error creating case");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ margin: 0 }}>
            <i className="bi bi-plus-circle"></i> Create New Case
          </h2>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-md" style={{ marginBottom: "1rem" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Case Number *</label>
              <input
                type="text"
                name="caseNumber"
                className="form-input"
                placeholder="e.g., CIV/2024/001"
                value={formData.caseNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Case Type</label>
              <select
                name="caseType"
                className="form-select"
                value={formData.caseType}
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="Criminal">Criminal</option>
                <option value="Civil">Civil</option>
                <option value="Family">Family</option>
                <option value="Corporate">Corporate</option>
                <option value="Property">Property</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Case Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g., Smith vs. Johnson"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-md" style={{ marginBottom: "1rem" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Client Name *</label>
              <input
                type="text"
                name="clientName"
                className="form-input"
                placeholder="John Doe"
                value={formData.clientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Client Contact</label>
              <input
                type="text"
                name="clientContact"
                className="form-input"
                placeholder="+1 234 567 8900"
                value={formData.clientContact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-md" style={{ marginBottom: "1rem" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Court Name</label>
              <input
                type="text"
                name="courtName"
                className="form-input"
                placeholder="District Court"
                value={formData.courtName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Next Hearing Date</label>
              <input
                type="datetime-local"
                name="nextHearingDate"
                className="form-input"
                value={formData.nextHearingDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Brief description of the case..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div
              className="form-error"
              style={{
                padding: "0.75rem",
                background: "#fee2e2",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
              }}
            >
              <i className="bi bi-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="flex gap-md justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderWidth: "2px",
                    }}
                  ></div>
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle"></i>
                  Create Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
