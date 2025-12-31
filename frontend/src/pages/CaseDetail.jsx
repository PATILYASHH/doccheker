import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { casesAPI, documentsAPI, notesAPI, speechesAPI } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.jsx";
import Navbar from "../components/Navbar";

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [speeches, setSpeeches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");

  // Document upload
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Note form
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [editingNote, setEditingNote] = useState(null);

  // Speech form
  const [speechForm, setSpeechForm] = useState({
    title: "",
    content: "",
    speech_type: "",
  });
  const [editingSpeech, setEditingSpeech] = useState(null);

  useEffect(() => {
    loadCaseData();
  }, [id]);

  const loadCaseData = async () => {
    try {
      setLoading(true);

      // Load case details
      const caseResponse = await casesAPI.getCase(id);
      if (caseResponse.success) setCaseData(caseResponse.data);

      // Load documents
      const docsResponse = await documentsAPI.getDocuments(id);
      if (docsResponse.success) setDocuments(docsResponse.data);

      // Load notes
      const notesResponse = await notesAPI.getNotes(id);
      if (notesResponse.success) setNotes(notesResponse.data);

      // Load speeches
      const speechesResponse = await speechesAPI.getSpeeches(id);
      if (speechesResponse.success) setSpeeches(speechesResponse.data);
    } catch (error) {
      console.error("Error loading case data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Document Upload Handler
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const response = await documentsAPI.uploadDocument(id, file);
        if (response.success) {
          setDocuments([response.data, ...documents]);
        }
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert(error.response?.data?.message || "Error uploading file");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await documentsAPI.deleteDocument(docId);
      setDocuments(documents.filter((d) => d._id !== docId));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Error deleting document");
    }
  };

  const handleViewDocument = (fileUrl) => {
    const fullUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") + fileUrl ||
      "http://localhost:5000" + fileUrl;
    window.open(fullUrl, "_blank");
  };

  // Note Handlers
  const handleSaveNote = async () => {
    if (!noteForm.content.trim()) return;

    try {
      if (editingNote) {
        const response = await notesAPI.updateNote(editingNote._id, noteForm);
        if (response.success) {
          setNotes(
            notes.map((n) => (n._id === response.data._id ? response.data : n))
          );
          setEditingNote(null);
        }
      } else {
        const response = await notesAPI.createNote({
          case_id: id,
          ...noteForm,
        });
        if (response.success) {
          setNotes([response.data, ...notes]);
        }
      }
      setNoteForm({ title: "", content: "" });
    } catch (error) {
      console.error("Error saving note:", error);
      alert(error.response?.data?.message || "Error saving note");
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({ title: note.title || "", content: note.content });
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note");
    }
  };

  // Speech Handlers
  const handleSaveSpeech = async () => {
    if (!speechForm.content.trim() || !speechForm.title.trim()) return;

    try {
      if (editingSpeech) {
        const response = await speechesAPI.updateSpeech(
          editingSpeech._id,
          speechForm
        );
        if (response.success) {
          setSpeeches(
            speeches.map((s) =>
              s._id === response.data._id ? response.data : s
            )
          );
          setEditingSpeech(null);
        }
      } else {
        const response = await speechesAPI.createSpeech({
          case_id: id,
          ...speechForm,
        });
        if (response.success) {
          setSpeeches([response.data, ...speeches]);
        }
      }
      setSpeechForm({ title: "", content: "", speech_type: "" });
    } catch (error) {
      console.error("Error saving speech:", error);
      alert(error.response?.data?.message || "Error saving speech");
    }
  };

  const handleEditSpeech = (speech) => {
    setEditingSpeech(speech);
    setSpeechForm({
      title: speech.title,
      content: speech.content,
      speech_type: speech.speech_type || "",
    });
  };

  const handleDeleteSpeech = async (speechId) => {
    if (!confirm("Are you sure you want to delete this speech?")) return;

    await db.deleteSpeech(speechId);
    setSpeeches(speeches.filter((s) => s.id !== speechId));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
        <Navbar />
        <div
          className="flex items-center justify-center"
          style={{ padding: "4rem" }}
        >
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <div className="card text-center" style={{ padding: "4rem" }}>
            <h2>Case not found</h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
      <Navbar />

      <div
        className="container"
        style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
      >
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary btn-sm mb-4"
          >
            <i className="bi bi-arrow-left"></i> Back to Dashboard
          </button>

          <div className="card">
            <div className="flex items-start justify-between gap-lg">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-md mb-3">
                  <span className="badge badge-primary">
                    {caseData.case_number}
                  </span>
                  <span
                    className={`badge ${
                      caseData.status === "active"
                        ? "badge-success"
                        : caseData.status === "pending"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                  >
                    {caseData.status}
                  </span>
                  {caseData.case_type && (
                    <span
                      className="badge"
                      style={{
                        background: "var(--accent-100)",
                        color: "var(--accent-700)",
                      }}
                    >
                      {caseData.case_type}
                    </span>
                  )}
                </div>

                <h1 style={{ marginBottom: "1rem" }}>{caseData.title}</h1>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Client Name
                    </p>
                    <p style={{ fontWeight: 600, margin: 0 }}>
                      <i className="bi bi-person"></i> {caseData.client_name}
                    </p>
                  </div>

                  {caseData.client_contact && (
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Client Contact
                      </p>
                      <p style={{ fontWeight: 600, margin: 0 }}>
                        <i className="bi bi-telephone"></i>{" "}
                        {caseData.client_contact}
                      </p>
                    </div>
                  )}

                  {caseData.court_name && (
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
                        <i className="bi bi-building"></i> {caseData.court_name}
                      </p>
                    </div>
                  )}

                  {caseData.next_hearing_date && (
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
                        {new Date(caseData.next_hearing_date).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {caseData.description && (
                  <div
                    className="mt-4"
                    style={{
                      padding: "1rem",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Description
                    </p>
                    <p style={{ margin: 0 }}>{caseData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-4" style={{ padding: "0" }}>
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid var(--border-light)",
              overflowX: "auto",
            }}
          >
            {[
              { id: "documents", label: "Documents", icon: "bi-file-earmark" },
              { id: "notes", label: "Notes", icon: "bi-journal-text" },
              { id: "speeches", label: "Speeches", icon: "bi-megaphone" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: "1 1 auto",
                  padding: "1rem 1.5rem",
                  border: "none",
                  background:
                    activeTab === tab.id ? "var(--primary-50)" : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--primary-700)"
                      : "var(--text-secondary)",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid var(--primary-600)"
                      : "none",
                  marginBottom: "-2px",
                  cursor: "pointer",
                  transition: "all var(--transition-base)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                }}
              >
                <i className={`bi ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "documents" && (
          <div>
            <div className="card mb-4">
              <h3 className="mb-4">
                <i className="bi bi-cloud-upload"></i> Upload Documents
              </h3>
              <div
                style={{
                  border: "2px dashed var(--border-medium)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2rem",
                  textAlign: "center",
                  background: "var(--bg-secondary)",
                }}
              >
                <i
                  className="bi bi-file-earmark-arrow-up"
                  style={{
                    fontSize: "3rem",
                    color: "var(--primary-600)",
                    marginBottom: "1rem",
                  }}
                ></i>
                <p style={{ marginBottom: "1rem" }}>
                  Upload images, videos, audio files, or documents
                </p>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="btn btn-primary">
                  {uploading ? (
                    <>
                      <div
                        className="spinner"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderWidth: "2px",
                        }}
                      ></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload"></i>
                      Choose Files
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Documents List */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {documents.map((doc) => (
                <div key={doc.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--primary-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className={`bi ${
                          doc.file_type === "image"
                            ? "bi-image"
                            : doc.file_type === "video"
                            ? "bi-camera-video"
                            : doc.file_type === "audio"
                            ? "bi-music-note"
                            : "bi-file-earmark"
                        }`}
                        style={{
                          fontSize: "1.5rem",
                          color: "var(--primary-600)",
                        }}
                      ></i>
                    </div>
                    <button
                      onClick={() =>
                        handleDeleteDocument(doc.id, doc.storage_path)
                      }
                      className="btn btn-danger btn-sm"
                      style={{ padding: "0.25rem 0.5rem" }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  <p
                    style={{
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      wordBreak: "break-word",
                    }}
                  >
                    {doc.file_name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginBottom: "1rem",
                    }}
                  >
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() => handleViewDocument(doc.storage_path)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: "100%" }}
                  >
                    <i className="bi bi-eye"></i> View
                  </button>
                </div>
              ))}
            </div>

            {documents.length === 0 && (
              <div className="card text-center" style={{ padding: "3rem" }}>
                <i
                  className="bi bi-inbox"
                  style={{
                    fontSize: "3rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "1rem",
                  }}
                ></i>
                <p style={{ color: "var(--text-secondary)" }}>
                  No documents uploaded yet
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            {/* Note Editor */}
            <div className="card mb-4">
              <h3 className="mb-4">
                <i className="bi bi-pencil-square"></i>{" "}
                {editingNote ? "Edit Note" : "Create New Note"}
              </h3>

              <div className="form-group">
                <label className="form-label">Title (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Note title..."
                  value={noteForm.title}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write your notes here..."
                  value={noteForm.content}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, content: e.target.value })
                  }
                  style={{ minHeight: "200px" }}
                />
              </div>

              <div className="flex gap-md">
                <button onClick={handleSaveNote} className="btn btn-primary">
                  <i className="bi bi-check-circle"></i>
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
                {editingNote && (
                  <button
                    onClick={() => {
                      setEditingNote(null);
                      setNoteForm({ title: "", content: "" });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Notes List */}
            <div style={{ display: "grid", gap: "1rem" }}>
              {notes.map((note) => (
                <div key={note.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div style={{ flex: 1 }}>
                      {note.title && (
                        <h4 style={{ marginBottom: "0.5rem" }}>{note.title}</h4>
                      )}
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-sm">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {note.content}
                  </p>
                </div>
              ))}
            </div>

            {notes.length === 0 && (
              <div className="card text-center" style={{ padding: "3rem" }}>
                <i
                  className="bi bi-journal"
                  style={{
                    fontSize: "3rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "1rem",
                  }}
                ></i>
                <p style={{ color: "var(--text-secondary)" }}>
                  No notes created yet
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "speeches" && (
          <div>
            {/* Speech Editor */}
            <div className="card mb-4">
              <h3 className="mb-4">
                <i className="bi bi-megaphone"></i>{" "}
                {editingSpeech ? "Edit Speech" : "Create New Speech"}
              </h3>

              <div className="flex gap-md" style={{ marginBottom: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Speech title..."
                    value={speechForm.title}
                    onChange={(e) =>
                      setSpeechForm({ ...speechForm, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={speechForm.speech_type}
                    onChange={(e) =>
                      setSpeechForm({
                        ...speechForm,
                        speech_type: e.target.value,
                      })
                    }
                  >
                    <option value="">Select type</option>
                    <option value="opening">Opening Statement</option>
                    <option value="closing">Closing Argument</option>
                    <option value="examination">Examination</option>
                    <option value="argument">Legal Argument</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write your speech here..."
                  value={speechForm.content}
                  onChange={(e) =>
                    setSpeechForm({ ...speechForm, content: e.target.value })
                  }
                  style={{ minHeight: "300px" }}
                />
              </div>

              <div className="flex gap-md">
                <button onClick={handleSaveSpeech} className="btn btn-primary">
                  <i className="bi bi-check-circle"></i>
                  {editingSpeech ? "Update Speech" : "Save Speech"}
                </button>
                {editingSpeech && (
                  <button
                    onClick={() => {
                      setEditingSpeech(null);
                      setSpeechForm({
                        title: "",
                        content: "",
                        speech_type: "",
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Speeches List */}
            <div style={{ display: "grid", gap: "1rem" }}>
              {speeches.map((speech) => (
                <div key={speech.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-md mb-2">
                        <h4 style={{ margin: 0 }}>{speech.title}</h4>
                        {speech.speech_type && (
                          <span className="badge badge-primary">
                            {speech.speech_type}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {new Date(speech.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-sm">
                      <button
                        onClick={() => handleEditSpeech(speech)}
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteSpeech(speech.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {speech.content}
                  </p>
                </div>
              ))}
            </div>

            {speeches.length === 0 && (
              <div className="card text-center" style={{ padding: "3rem" }}>
                <i
                  className="bi bi-megaphone"
                  style={{
                    fontSize: "3rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "1rem",
                  }}
                ></i>
                <p style={{ color: "var(--text-secondary)" }}>
                  No speeches created yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
