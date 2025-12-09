import { useState } from "react";
import { Youtube, ArrowLeft, CheckCircle, Link, X, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";

export default function YouTubeLink() {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateYouTubeUrl = (inputUrl) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(inputUrl);
  };

  const extractVideoId = (inputUrl) => {
    const match = inputUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setSubmitStatus(null);
    
    if (inputUrl.trim() === "") {
      setIsValid(null);
      setVideoInfo(null);
      return;
    }

    const valid = validateYouTubeUrl(inputUrl);
    setIsValid(valid);

    if (valid) {
      const videoId = extractVideoId(inputUrl);
      setVideoInfo({
        id: videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      });
    } else {
      setVideoInfo(null);
    }
  };

  const handleClear = () => {
    setUrl("");
    setIsValid(null);
    setVideoInfo(null);
    setSubmitStatus(null);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      alert("Please enter a valid YouTube URL");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await api.post("/n8n/youtube-link", {
        url: url
      });

      const result = response.data;
      console.log("Backend response:", result);

      // Check if the request was successful
      if (!result.success) {
        throw new Error(result.error || result.message || "Failed to send to n8n");
      }

      // Handle array response from n8n
      const n8nData = Array.isArray(result.n8nResponse) ? result.n8nResponse[0] : result.n8nResponse;
      console.log("n8n response:", n8nData);
      
      setSubmitStatus({
        type: "success",
        message: "YouTube link sent successfully to n8n!"
      });

      // Clear form after 3 seconds
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #f8fafc, #fef2f2, #fee2e2)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        {/* Back Button */}
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 12px",
            background: "linear-gradient(to bottom right, #dc2626, #b91c1c)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.3)"
          }}>
            <Youtube size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "6px"
          }}>
            YouTube Link
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#6b7280"
          }}>
            Paste a YouTube URL to process with AI
          </p>
        </div>

        {/* URL Input Area */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          marginBottom: "16px"
        }}>
          <label style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px"
          }}>
            YouTube URL
          </label>
          
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af"
            }}>
              <Link size={20} />
            </div>
            
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px 40px 12px 44px",
                fontSize: "14px",
                border: isValid === false ? "2px solid #ef4444" : isValid === true ? "2px solid #22c55e" : "2px solid #e5e7eb",
                borderRadius: "10px",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box",
                opacity: isSubmitting ? 0.6 : 1
              }}
            />
            
            {url && !isSubmitting && (
              <button
                onClick={handleClear}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Validation Message */}
          {isValid === false && !submitStatus && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
              color: "#ef4444",
              fontSize: "13px"
            }}>
              <AlertCircle size={14} />
              Please enter a valid YouTube URL
            </div>
          )}

          {isValid === true && !submitStatus && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
              color: "#22c55e",
              fontSize: "13px"
            }}>
              <CheckCircle size={14} />
              Valid YouTube URL
            </div>
          )}
        </div>

        {/* Video Preview */}
        {videoInfo && !submitStatus && (
          <div style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px"
          }}>
            <div style={{
              display: "flex",
              gap: "16px",
              alignItems: "center"
            }}>
              <img
                src={videoInfo.thumbnail}
                alt="Video thumbnail"
                style={{
                  width: "120px",
                  height: "68px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "4px"
                }}>
                  Video Ready
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#6b7280"
                }}>
                  ID: {videoInfo.id}
                </p>
              </div>
              <CheckCircle size={24} color="#22c55e" />
            </div>
          </div>
        )}

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

        {/* Supported Formats */}
        <div style={{
          backgroundColor: "#fefce8",
          border: "1px solid #fde047",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "16px"
        }}>
          <p style={{
            fontSize: "12px",
            color: "#854d0e",
            margin: 0
          }}>
            <strong>Supported formats:</strong> youtube.com/watch?v=, youtu.be/, youtube.com/embed/
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          style={{
            width: "100%",
            backgroundColor: isValid && !isSubmitting ? "#dc2626" : "#e5e7eb",
            color: isValid && !isSubmitting ? "white" : "#9ca3af",
            padding: "14px",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            border: "none",
            cursor: isValid && !isSubmitting ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            boxShadow: isValid && !isSubmitting ? "0 4px 6px -1px rgba(220, 38, 38, 0.2)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => {
            if (isValid && !isSubmitting) {
              e.currentTarget.style.backgroundColor = "#b91c1c";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(220, 38, 38, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (isValid && !isSubmitting) {
              e.currentTarget.style.backgroundColor = "#dc2626";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(220, 38, 38, 0.2)";
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              Sending to n8n...
            </>
          ) : isValid ? (
            "Process Video"
          ) : (
            "Enter a YouTube URL to continue"
          )}
        </button>

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