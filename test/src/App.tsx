import { useState } from "react";

type ApiResponse = { status: string } | { error: string };

interface EmailLog {
  id: string;
  email: string;
  subject: string;
  body: string;
  status: "success" | "error";
  message: string;
  timestamp: Date;
}

function App() {
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  async function onSend() {
    if (!email || !subject || !body) {
      setLogs((prev) => [
        {
          id: Date.now().toString(),
          email,
          subject,
          body,
          status: "error",
          message: "All fields are required",
          timestamp: new Date(),
        },
        ...prev,
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, subject, body }),
      });
      const data: ApiResponse = await res.json();

      if ("error" in data) {
        setLogs((prev) => [
          {
            id: Date.now().toString(),
            email,
            subject,
            body,
            status: "error",
            message: data.error,
            timestamp: new Date(),
          },
          ...prev,
        ]);
      } else {
        setLogs((prev) => [
          {
            id: Date.now().toString(),
            email,
            subject,
            body,
            status: "success",
            message: data.status,
            timestamp: new Date(),
          },
          ...prev,
        ]);
        setEmail("");
        setSubject("");
        setBody("");
      }
    } catch (error) {
      setLogs((prev) => [
        {
          id: Date.now().toString(),
          email,
          subject,
          body,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date(),
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  const clearLogs = () => {
    setLogs([]);
    setSearchTerm("");
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `email-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.body.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const successCount = logs.filter((log) => log.status === "success").length;
  const errorCount = logs.filter((log) => log.status === "error").length;

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📧 Email Sender</h1>
          <p style={styles.subtitle}>Send emails through your SMTP service</p>
        </div>

        {/* Form Card */}
        <div style={styles.card}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span>Recipient Email</span>
            </label>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span>Subject</span>
              <span style={styles.charCount}>{subject.length}/25</span>
            </label>
            <input
              type="text"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, 25))}
              style={styles.input}
              disabled={loading}
              maxLength={25}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span>Message</span>
              <span style={styles.charCount}>{body.length}/1000</span>
            </label>
            <textarea
              placeholder="Your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 1000))}
              style={{ ...styles.input, ...styles.textarea }}
              disabled={loading}
              maxLength={1000}
            />
          </div>

          <button
            onClick={onSend}
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 20px rgba(102, 126, 234, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Sending...
              </>
            ) : (
              "Send Email"
            )}
          </button>
        </div>

        {/* Stats Card */}
        {logs.length > 0 && (
          <div style={styles.statsCard}>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Total</div>
              <div style={styles.statValue}>{logs.length}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>✅ Success</div>
              <div style={{ ...styles.statValue, color: "#4caf50" }}>
                {successCount}
              </div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>❌ Failed</div>
              <div style={{ ...styles.statValue, color: "#f44336" }}>
                {errorCount}
              </div>
            </div>
          </div>
        )}

        {/* Logs Section */}
        {logs.length > 0 && (
          <div style={styles.logsSection}>
            <div style={styles.logsHeader}>
              <h2 style={styles.logsTitle}>Email History</h2>
              <div style={styles.actionButtons}>
                <button onClick={exportLogs} style={styles.exportButton}>
                  💾 Export
                </button>
                <button onClick={clearLogs} style={styles.clearButton}>
                  🗑️ Clear
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="🔍 Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Logs List */}
            <div style={styles.logsList}>
              {filteredLogs.length === 0 ? (
                <div style={styles.noResults}>
                  No emails found matching "{searchTerm}"
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div
                      key={log.id}
                      style={{
                        ...styles.logCard,
                        ...(log.status === "success"
                          ? styles.logSuccess
                          : styles.logError),
                      }}
                      onClick={() => toggleExpand(log.id)}
                    >
                      <div style={styles.logHeader}>
                        <div style={styles.logHeaderLeft}>
                          <span style={styles.logStatus}>
                            {log.status === "success" ? "✅" : "❌"}
                          </span>
                          <span style={styles.logEmail}>{log.email}</span>
                        </div>
                        <span style={styles.logTime}>
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <div style={styles.logSubject}>
                        <strong>Subject:</strong> {log.subject}
                      </div>

                      {isExpanded && (
                        <div style={styles.logDetails}>
                          <div style={styles.logRow}>
                            <strong>Message:</strong>
                            <div style={styles.logBody}>{log.body}</div>
                          </div>
                          <div style={styles.logMessage}>
                            <strong>Status:</strong> {log.message}
                          </div>
                          <div style={styles.logDate}>
                            <strong>Sent at:</strong>{" "}
                            {log.timestamp.toLocaleString()}
                          </div>
                        </div>
                      )}

                      <div style={styles.expandIndicator}>
                        {isExpanded ? "▲ Less" : "▼ More"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inline styles for keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "40px 20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
    color: "white",
  },
  title: {
    fontSize: "42px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  subtitle: {
    fontSize: "16px",
    opacity: 0.9,
    margin: 0,
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    marginBottom: "24px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    color: "#333",
    fontWeight: "600",
    fontSize: "14px",
  },
  charCount: {
    color: "#999",
    fontSize: "12px",
    fontWeight: "400",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "15px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  textarea: {
    minHeight: "120px",
    resize: "vertical",
    lineHeight: "1.5",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  statsCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-around",
    gap: "20px",
  },
  statItem: {
    textAlign: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#333",
  },
  logsSection: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  logsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  logsTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  exportButton: {
    padding: "8px 16px",
    background: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s",
  },
  clearButton: {
    padding: "8px 16px",
    background: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s",
  },
  searchContainer: {
    marginBottom: "20px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  logsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "600px",
    overflowY: "auto",
  },
  logCard: {
    border: "2px solid",
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  logSuccess: {
    borderColor: "#4caf50",
    backgroundColor: "#f1f8f4",
  },
  logError: {
    borderColor: "#f44336",
    backgroundColor: "#fef5f5",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  logHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logStatus: {
    fontSize: "16px",
  },
  logEmail: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#333",
  },
  logTime: {
    fontSize: "12px",
    color: "#666",
  },
  logSubject: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "8px",
  },
  logDetails: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
  },
  logRow: {
    color: "#555",
  },
  logBody: {
    marginTop: "4px",
    padding: "8px",
    background: "rgba(0,0,0,0.05)",
    borderRadius: "4px",
    fontSize: "13px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  logMessage: {
    fontSize: "13px",
    color: "#666",
    fontStyle: "italic",
  },
  logDate: {
    fontSize: "12px",
    color: "#999",
  },
  expandIndicator: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#667eea",
    fontWeight: "600",
    textAlign: "center",
  },
  noResults: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
    fontSize: "14px",
  },
};

export default App;
