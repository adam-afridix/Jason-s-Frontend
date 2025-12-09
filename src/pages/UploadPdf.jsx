import { useState } from "react";
import { FileText, Upload, ArrowLeft, CheckCircle, X, Loader2, AlertCircle } from "lucide-react";
import MetadataModal from "./MetadataModal";
import api from "../services/api";

export default function UploadPdf() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showMetaModal, setShowMetaModal] = useState(false);

  const [metadata, setMetadata] = useState({
    title: "",
    speaker: "",
    url: "",
    publishedDate: "",
  });

  const isValidPdfFile = (file) => {
    return file.type === "application/pdf";
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(isValidPdfFile);

    if (validFiles.length !== selectedFiles.length) {
      alert("Some files were skipped. Only PDF files are allowed.");
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setShowMetaModal(true);
    }

    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(isValidPdfFile);

    if (validFiles.length !== droppedFiles.length) {
      alert("Some files were skipped. Only PDF files are allowed.");
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setShowMetaModal(true);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const clearAllFiles = () => {
    setFiles([]);
    setUploadProgress({});
  };

  const handleUpload = async () => {
    if (files.length === 0) return alert("Please select at least one file");

    setIsUploading(true);
    setUploadProgress({});

    const formData = new FormData();

    // Append all PDF files
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Create metadata object with additional info
    const metadataObject = {
      title: metadata.title.trim() || "N/A",
      speaker: metadata.speaker.trim() || "N/A",
      url: metadata.url.trim() || "N/A",
      publishedDate: metadata.publishedDate || "N/A",
      uploadDate: new Date().toISOString(),
      fileCount: files.length,
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    // Create a JSON blob for metadata
    const metadataBlob = new Blob(
      [JSON.stringify(metadataObject, null, 2)],
      { type: "application/json" }
    );

    // Create metadata filename based on the first uploaded file
    // If uploading "report.pdf", metadata will be "report_metadata.json"
    const firstFileName = files[0].name;
    const fileNameWithoutExt = firstFileName.substring(0, firstFileName.lastIndexOf('.')) || firstFileName;
    const metadataFileName = `${fileNameWithoutExt}_metadata.json`;
    
    // Create a File object from the blob
    const metadataFile = new File(
      [metadataBlob],
      metadataFileName,
      { type: "application/json" }
    );

    // Append the metadata file to FormData
    formData.append("metadata", metadataFile);

    const initialProgress = {};
    files.forEach((_, index) => {
      initialProgress[index] = "uploading";
    });
    setUploadProgress(initialProgress);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;

      const doneProgress = {};
      files.forEach((_, index) => {
        doneProgress[index] = "done";
      });
      setUploadProgress(doneProgress);

      alert(
        `✅ Successfully uploaded ${result.count} file(s) to Google Drive!\n\n` +
          `Files:\n${result.files.map((f) => `- ${f.name}`).join("\n")}`
      );

      // Reset form after successful upload
      setFiles([]);
      setMetadata({
        title: "",
        speaker: "",
        url: "",
        publishedDate: "",
      });
    } catch (error) {
      console.error("Upload error:", error);

      const errorProgress = {};
      files.forEach((_, index) => {
        errorProgress[index] = "error";
      });
      setUploadProgress(errorProgress);

      alert(
        "❌ Failed to upload files. Please check your backend server and try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTotalSize = () => {
    const total = files.reduce((acc, file) => acc + file.size, 0);
    return formatFileSize(total);
  };

  const getFileStatus = (index) => {
    const status = uploadProgress[index];
    if (status === "uploading") {
      return {
        icon: <Loader2 size={16} color="#ef4444" className="animate-spin" />,
        bg: "#fef2f2",
        border: "#fecaca",
      };
    } else if (status === "done") {
      return {
        icon: <CheckCircle size={16} color="#22c55e" />,
        bg: "#f0fdf4",
        border: "#86efac",
      };
    } else if (status === "error") {
      return {
        icon: <AlertCircle size={16} color="#dc2626" />,
        bg: "#fef2f2",
        border: "#fecaca",
      };
    }
    return { icon: null, bg: "#f0fdf4", border: "#86efac" };
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background:
          "linear-gradient(to bottom right, #f8fafc, #fef2f2, #fff1f2)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "13px",
              color: "#4b5563",
              cursor: "pointer",
              marginBottom: "16px",
              transition: "all 0.2s",
              alignSelf: "flex-start",
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
            <ArrowLeft size={14} />
            Back to Home
          </button>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto 10px",
                background: "linear-gradient(to bottom right, #ef4444, #f97316)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
              }}
            >
              <FileText size={28} color="white" />
            </div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "4px",
                lineHeight: "1.2",
              }}
            >
              Upload PDF Documents
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              Upload multiple PDF files to Google Drive
            </p>
          </div>

          {/* Main Content Area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              minHeight: 0,
            }}
          >
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                backgroundColor: isDragging ? "#fef2f2" : "white",
                border: isDragging
                  ? "2px dashed #ef4444"
                  : "2px dashed #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                transition: "all 0.3s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 10px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Upload size={24} color="#ef4444" />
              </div>

              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "6px",
                }}
              >
                {files.length > 0
                  ? `${files.length} file(s) selected`
                  : "Drop PDFs here"}
              </h3>

              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "12px",
                }}
              >
                or click to browse
              </p>

              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-input"
                disabled={isUploading}
              />

              <label
                htmlFor="file-input"
                style={{
                  display: "inline-block",
                  backgroundColor: isUploading ? "#d1d5db" : "#ef4444",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isUploading)
                    e.currentTarget.style.backgroundColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  if (!isUploading)
                    e.currentTarget.style.backgroundColor = "#ef4444";
                }}
              >
                Choose Files
              </label>

              <p
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                  marginTop: "10px",
                }}
              >
                Max 50MB each
              </p>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px",
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {files.length} file{files.length > 1 ? "s" : ""}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginLeft: "6px",
                      }}
                    >
                      ({getTotalSize()})
                    </span>
                  </div>
                  <button
                    onClick={clearAllFiles}
                    disabled={isUploading}
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      color: "#dc2626",
                      cursor: isUploading ? "not-allowed" : "pointer",
                      opacity: isUploading ? 0.5 : 1,
                    }}
                  >
                    Clear All
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                  {files.map((file, index) => {
                    const status = getFileStatus(index);
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px",
                          backgroundColor: status.bg,
                          border: `1px solid ${status.border}`,
                          borderRadius: "6px",
                          marginBottom: index < files.length - 1 ? "6px" : "0",
                        }}
                      >
                        <FileText size={18} color="#ef4444" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "12px",
                              fontWeight: "500",
                              color: "#1f2937",
                              marginBottom: "2px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {file.name}
                          </p>
                          <p style={{ fontSize: "10px", color: "#6b7280" }}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        {status.icon || (
                          <button
                            onClick={() => removeFile(index)}
                            disabled={isUploading}
                            style={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "4px",
                              padding: "4px",
                              cursor: isUploading ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: isUploading ? 0.5 : 1,
                            }}
                          >
                            <X size={12} color="#6b7280" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Button - Removed, now handled by modal */}
          </div>
        </div>
      </div>

      {showMetaModal && (
        <MetadataModal
          isOpen={showMetaModal}
          onClose={() => {
            setShowMetaModal(false);
            // Optionally clear files if user cancels
          }}
          onSubmit={() => {
            setShowMetaModal(false);
            handleUpload(); // upload files with metadata
          }}
          metadata={metadata}
          setMetadata={setMetadata}
          isUploading={isUploading}
        />
      )}

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}