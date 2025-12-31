import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { casesAPI } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.jsx";
import Navbar from "../components/Navbar";
import CreateCaseModal from "../components/CreateCaseModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadCases();
  }, [user]);

  const loadCases = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await casesAPI.getCases();

      if (response.success && response.data) {
        setCases(response.data);
      }
    } catch (error) {
      console.error("Error loading cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseCreated = (newCase) => {
    setCases([newCase, ...cases]);
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      c.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: cases.length,
    active: cases.filter((c) => c.status?.toLowerCase() === "active").length,
    closed: cases.filter((c) => c.status?.toLowerCase() === "closed").length,
    pending: cases.filter((c) => c.status?.toLowerCase() === "pending").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
      <Navbar />

      <div
        className="container"
        style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div>
            <h1 style={{ marginBottom: "0.5rem" }}>
              <i className="bi bi-briefcase"></i> My Cases
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Manage and organize all your legal cases
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-lg"
          >
            <i className="bi bi-plus-circle"></i>
            Create New Case
          </button>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div className="card fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Total Cases
                </p>
                <h2 style={{ fontSize: "2.5rem", margin: 0 }}>{stats.total}</h2>
              </div>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-xl)",
                  background:
                    "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-folder"
                  style={{ fontSize: "1.75rem", color: "white" }}
                ></i>
              </div>
            </div>
          </div>

          <div className="card fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Active Cases
                </p>
                <h2
                  style={{
                    fontSize: "2.5rem",
                    margin: 0,
                    color: "var(--success-600)",
                  }}
                >
                  {stats.active}
                </h2>
              </div>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-xl)",
                  background:
                    "linear-gradient(135deg, var(--success-500), var(--success-600))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-check-circle"
                  style={{ fontSize: "1.75rem", color: "white" }}
                ></i>
              </div>
            </div>
          </div>

          <div className="card fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Pending Cases
                </p>
                <h2
                  style={{
                    fontSize: "2.5rem",
                    margin: 0,
                    color: "var(--warning-600)",
                  }}
                >
                  {stats.pending}
                </h2>
              </div>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-xl)",
                  background:
                    "linear-gradient(135deg, var(--warning-500), var(--warning-600))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-clock"
                  style={{ fontSize: "1.75rem", color: "white" }}
                ></i>
              </div>
            </div>
          </div>

          <div className="card fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Closed Cases
                </p>
                <h2
                  style={{
                    fontSize: "2.5rem",
                    margin: 0,
                    color: "var(--gray-600)",
                  }}
                >
                  {stats.closed}
                </h2>
              </div>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-xl)",
                  background:
                    "linear-gradient(135deg, var(--gray-500), var(--gray-600))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-archive"
                  style={{ fontSize: "1.75rem", color: "white" }}
                ></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6 fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex gap-md" style={{ flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ position: "relative" }}>
                <i
                  className="bi bi-search"
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-secondary)",
                  }}
                ></i>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search cases by title, number, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setFilterStatus("all")}
                className={`btn ${
                  filterStatus === "all" ? "btn-primary" : "btn-secondary"
                } btn-sm`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`btn ${
                  filterStatus === "active" ? "btn-primary" : "btn-secondary"
                } btn-sm`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`btn ${
                  filterStatus === "pending" ? "btn-primary" : "btn-secondary"
                } btn-sm`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus("closed")}
                className={`btn ${
                  filterStatus === "closed" ? "btn-primary" : "btn-secondary"
                } btn-sm`}
              >
                Closed
              </button>
            </div>
          </div>
        </div>

        {/* Cases List */}
        {loading ? (
          <div
            className="flex items-center justify-center"
            style={{ padding: "4rem" }}
          >
            <div className="spinner"></div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="card text-center" style={{ padding: "4rem" }}>
            <i
              className="bi bi-inbox"
              style={{
                fontSize: "4rem",
                color: "var(--text-tertiary)",
                marginBottom: "1rem",
              }}
            ></i>
            <h3 style={{ marginBottom: "0.5rem" }}>No cases found</h3>
            <p
              style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}
            >
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first case to get started"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                <i className="bi bi-plus-circle"></i>
                Create New Case
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "1.5rem",
            }}
          >
            {filteredCases.map((caseItem, index) => (
              <div
                key={caseItem._id}
                className="card slide-in-right"
                style={{
                  cursor: "pointer",
                  animationDelay: `${0.6 + index * 0.1}s`,
                }}
                onClick={() => navigate(`/case/${caseItem._id}`)}
              >
                <div className="flex items-start justify-between gap-lg">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-md mb-2">
                      <span className="badge badge-primary">
                        {caseItem.case_number}
                      </span>
                      <span
                        className={`badge ${
                          caseItem.status === "active"
                            ? "badge-success"
                            : caseItem.status === "pending"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      >
                        {caseItem.status}
                      </span>
                      {caseItem.case_type && (
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <i className="bi bi-tag"></i> {caseItem.case_type}
                        </span>
                      )}
                    </div>

                    <h3 style={{ marginBottom: "0.5rem" }}>
                      {caseItem.case_title}
                    </h3>

                    <div
                      className="flex gap-xl mb-3"
                      style={{ flexWrap: "wrap" }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Client
                        </p>
                        <p style={{ fontWeight: 600, margin: 0 }}>
                          <i className="bi bi-person"></i>{" "}
                          {caseItem.client_name}
                        </p>
                      </div>

                      {caseItem.court_name && (
                        <div>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                              marginBottom: "0.25rem",
                            }}
                          >
                            Court
                          </p>
                          <p style={{ fontWeight: 600, margin: 0 }}>
                            <i className="bi bi-building"></i>{" "}
                            {caseItem.court_name}
                          </p>
                        </div>
                      )}

                      {caseItem.next_hearing_date && (
                        <div>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                              marginBottom: "0.25rem",
                            }}
                          >
                            Next Hearing
                          </p>
                          <p style={{ fontWeight: 600, margin: 0 }}>
                            <i className="bi bi-calendar-event"></i>{" "}
                            {new Date(
                              caseItem.next_hearing_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {caseItem.description && (
                      <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                        {caseItem.description.substring(0, 150)}
                        {caseItem.description.length > 150 && "..."}
                      </p>
                    )}
                  </div>

                  <i
                    className="bi bi-chevron-right"
                    style={{
                      fontSize: "1.5rem",
                      color: "var(--text-tertiary)",
                    }}
                  ></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  );
}
