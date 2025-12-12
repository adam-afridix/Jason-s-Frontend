import { useState } from "react";
import { ClipboardPaste, ArrowLeft, Type, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import MetadataModal from "./MetadataModal"; // Import the metadata modal
import api from "../services/api";

export default function PasteText() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [metadata, setMetadata] = useState({
    title: "",
    speaker: "",
    url: "",
    publishedDate: "",
  });

  const handleProcessClick = () => {
    if (!text.trim()) {
      alert("Please enter some text");
      return;
    }
    // Show metadata modal instead of uploading directly
    setShowModal(true);
  };

  const handleUpload = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setShowModal(false); // Close modal

    try {
      // Combine text and metadata
      const payload = {
       content: text,
       metadata: {
        title: metadata.title.trim() || "N/A",
        speaker: metadata.speaker.trim() || "N/A",
        url: metadata.url.trim() || "N/A",
        publishedDate: metadata.publishedDate || "N/A",
        timestamp: new Date().toISOString(),
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: text.length,
       }
      };

      const response = await api.post("/n8n/paste-text", payload);

      const result = response.data;
      console.log("Backend response:", result);

      if (!result.success) {
        throw new Error(result.error || result.message || "Failed to send to n8n");
      }

      const n8nData = Array.isArray(result.n8nResponse) ? result.n8nResponse[0] : result.n8nResponse;
      console.log("n8n response:", n8nData);
      
      setSubmitStatus({
        type: "success",
        message: "Text and metadata sent successfully to n8n!"
      });

      setTimeout(() => {
        handleClear();
      }, 3000);

    } catch (error) {
      console.error("Error sending to n8n:", error);
      
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to send to n8n. Please check if the backend server is running."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setText("");
    setSubmitStatus(null);
    setMetadata({
      title: "",
      speaker: "",
      url: "",
      publishedDate: "",
    });
  };

  const handleModalClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
    }
  };

  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #f8fafc, #f5f3ff, #ede9fe)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{ width: "100%", maxWidth: "700px" }}>
        <button
          onClick={() => window.history.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            color: "#4b5563",
            cursor: "pointer",
            marginBottom: "20px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f9fafb";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 12px",
            background: "linear-gradient(to bottom right, #8b5cf6, #6366f1)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 15px -3px rgba(139, 92, 246, 0.3)"
          }}>
            <ClipboardPaste size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "6px"
          }}>
            Paste Text
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#6b7280"
          }}>
            Paste or type your text to analyze with AI
          </p>
        </div>

        {/* Text Area */}
        <div style={{
          backgroundColor: "white",
          border: "2px solid #e5e7eb",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "16px",
          position: "relative"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
            paddingBottom: "10px",
            borderBottom: "1px solid #f3f4f6"
          }}>
            <Type size={18} color="#8b5cf6" />
            <span style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1f2937"
            }}>
              Enter your text
            </span>
            <span style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: "#9ca3af"
            }}>
              {text.length} characters
            </span>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: "300px",
              border: "none",
              outline: "none",
              resize: "vertical",
              fontSize: "14px",
              color: "#1f2937",
              fontFamily: "system-ui, -apple-system, sans-serif",
              lineHeight: "1.6",
              opacity: isSubmitting ? 0.6 : 1
            }}
          />

          {text && !isSubmitting && (
            <button
              onClick={handleClear}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                color: "#6b7280",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Submit Status */}
        {submitStatus && (
          <div style={{
            backgroundColor: submitStatus.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: submitStatus.type === "success" ? "1px solid #86efac" : "1px solid #fecaca",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              {submitStatus.type === "success" ? (
                <CheckCircle size={20} color="#22c55e" />
              ) : (
                <AlertCircle size={20} color="#ef4444" />
              )}
              <p style={{
                fontSize: "14px",
                color: submitStatus.type === "success" ? "#166534" : "#991b1b",
                margin: 0
              }}>
                {submitStatus.message}
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        {text && !submitStatus && (
          <div style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#22c55e"
            }}></div>
            <p style={{
              fontSize: "13px",
              color: "#166534",
              margin: 0
            }}>
              Text ready to process • {wordCount} words
            </p>
          </div>
        )}

        {/* Process Button - Now opens modal */}
        <button
          onClick={handleProcessClick}
          disabled={!text.trim() || isSubmitting}
          style={{
            width: "100%",
            backgroundColor: text.trim() && !isSubmitting ? "#8b5cf6" : "#e5e7eb",
            color: text.trim() && !isSubmitting ? "white" : "#9ca3af",
            padding: "14px",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            border: "none",
            cursor: text.trim() && !isSubmitting ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: text.trim() && !isSubmitting ? "0 4px 6px -1px rgba(139, 92, 246, 0.2)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => {
            if (text.trim() && !isSubmitting) {
              e.currentTarget.style.backgroundColor = "#7c3aed";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(139, 92, 246, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (text.trim() && !isSubmitting) {
              e.currentTarget.style.backgroundColor = "#8b5cf6";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(139, 92, 246, 0.2)";
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              Sending to n8n...
            </>
          ) : text.trim() ? (
            "Process Text"
          ) : (
            "Enter text to continue"
          )}
        </button>

        {/* Metadata Modal */}
        <MetadataModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSubmit={handleUpload}
          metadata={metadata}
          setMetadata={setMetadata}
          isUploading={isSubmitting}
        />

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}