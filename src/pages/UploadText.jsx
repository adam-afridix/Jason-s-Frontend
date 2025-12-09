import { useState } from "react";
import { FileUp, ArrowLeft, CheckCircle, X, Loader2, AlertCircle, FileText } from "lucide-react";
import MetadataModal from "./MetadataModal";
import api from "../services/api";

export default function UploadText() {
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

  const isValidTextFile = (file) => {
    return file.type === "text/plain" || file.name.endsWith(".txt");
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(isValidTextFile);

    if (validFiles.length !== selectedFiles.length) {
      alert("Some files were skipped. Only text files are allowed.");
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
    const validFiles = droppedFiles.filter(isValidTextFile);

    if (validFiles.length !== droppedFiles.length) {
      alert("Some files were skipped. Only text files are allowed.");
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

    // Append all text files
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
      fileType: "text",
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    };

    // Create metadata filename based on the first uploaded file
    const firstFileName = files[0].name;
    const fileNameWithoutExt = firstFileName.substring(0, firstFileName.lastIndexOf('.')) || firstFileName;
    const metadataFileName = `${fileNameWithoutExt}_metadata.json`;

    // Create a JSON blob for metadata
    const metadataBlob = new Blob(
      [JSON.stringify(metadataObject, null, 2)],
      { type: "application/json" }
    );

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
        icon: <Loader2 size={18} color="#3b82f6" className="animate-spin" />,
        bg: "#eff6ff",
        border: "#bfdbfe",
      };
    } else if (status === "done") {
      return {
        icon: <CheckCircle size={18} color="#22c55e" />,
        bg: "#f0fdf4",
        border: "#86efac",
      };
    } else if (status === "error") {
      return {
        icon: <AlertCircle size={18} color="#dc2626" />,
        bg: "#fef2f2",
        border: "#fecaca",
      };
    }
    return { icon: null, bg: "#f0fdf4", border: "#86efac" };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #eff6ff, #dbeafe)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ padding: "32px 16px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
              marginBottom: "24px",
              transition: "all 0.2s",
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

          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 16px",
                background: "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
              }}
            >
              <FileUp size={40} color="white" />
            </div>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              Upload Text Files
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#6b7280",
              }}
            >
              Upload multiple text files to Google Drive
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              backgroundColor: isDragging ? "#eff6ff" : "white",
              border: isDragging ? "2px dashed #3b82f6" : "2px dashed #e5e7eb",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              transition: "all 0.3s",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 16px",
                backgroundColor: "#eff6ff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileUp size={32} color="#3b82f6" />
            </div>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              {files.length > 0
                ? `${files.length} file(s) selected`
                : "Drop your text files here"}
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "16px",
              }}
            >
              or click to browse (select multiple)
            </p>

            <input
              type="file"
              accept=".txt"
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
                backgroundColor: isUploading ? "#d1d5db" : "#3b82f6",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: isUploading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              Choose Files
            </label>

            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "16px",
              }}
            >
              Supported format: TXT (Max 50MB each)
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1f2937",
                    }}
                  >
                    {files.length} file{files.length > 1 ? "s" : ""} selected
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginLeft: "8px",
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
                    padding: "4px 10px",
                    fontSize: "12px",
                    color: "#dc2626",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    opacity: isUploading ? 0.5 : 1,
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {files.map((file, index) => {
                  const status = getFileStatus(index);
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px",
                        backgroundColor: status.bg,
                        border: `1px solid ${status.border}`,
                        borderRadius: "8px",
                        marginBottom: index < files.length - 1 ? "8px" : "0",
                      }}
                    >
                      <FileText size={20} color="#3b82f6" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
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
                        <p style={{ fontSize: "11px", color: "#6b7280" }}>
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
                            borderRadius: "6px",
                            padding: "4px",
                            cursor: isUploading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: isUploading ? 0.5 : 1,
                          }}
                        >
                          <X size={14} color="#6b7280" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Modal */}
      {showMetaModal && (
        <MetadataModal
          isOpen={showMetaModal}
          onClose={() => {
            setShowMetaModal(false);
          }}
          onSubmit={() => {
            setShowMetaModal(false);
            handleUpload();
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