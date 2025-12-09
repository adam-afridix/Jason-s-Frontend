import { useState } from "react";
import { Music, Upload, ArrowLeft, CheckCircle, X, FileAudio, Loader2, AlertCircle } from "lucide-react";
import MetadataModal from "./MetadataModal";
import api from "../services/api";

export default function UploadAudio() {
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

  const isValidAudioFile = (file) => {
    return file.type.startsWith("audio/");
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(isValidAudioFile);

    if (validFiles.length !== selectedFiles.length) {
      alert("Some files were skipped. Only audio files are allowed.");
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
    const validFiles = droppedFiles.filter(isValidAudioFile);

    if (validFiles.length !== droppedFiles.length) {
      alert("Some files were skipped. Only audio files are allowed.");
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

    // No validation needed - all fields are optional and will default to N/A

    setIsUploading(true);
    setUploadProgress({});

    const formData = new FormData();

    // Append all audio files
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Create metadata object with additional info
    // Replace empty fields with "N/A"
    const metadataObject = {
      title: metadata.title.trim() || "N/A",
      speaker: metadata.speaker.trim() || "N/A",
      url: metadata.url.trim() || "N/A",
      publishedDate: metadata.publishedDate || "N/A",
      uploadDate: new Date().toISOString(),
      fileCount: files.length,
      fileType: "audio",
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    };

    // Create a JSON blob for metadata
    const metadataBlob = new Blob(
      [JSON.stringify(metadataObject, null, 2)],
      { type: "application/json" }
    );

    // Create metadata filename based on the first uploaded file
    // If uploading "song.mp3", metadata will be "song_metadata.json"
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

    // Set all files to uploading state
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

      // Mark all files as done
      const doneProgress = {};
      files.forEach((_, index) => {
        doneProgress[index] = "done";
      });
      setUploadProgress(doneProgress);

      // Show success message
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

      // Mark all files as error
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
        icon: <Loader2 size={18} color="#f59e0b" className="animate-spin" />,
        bg: "#fffbeb",
        border: "#fde047",
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
        background: "linear-gradient(to bottom right, #f8fafc, #fffbeb, #fef3c7)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px" }}>
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

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 12px",
              background: "linear-gradient(to bottom right, #f59e0b, #eab308)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
            }}
          >
            <Music size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "6px",
            }}
          >
            Upload Audio
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Upload multiple audio files to Google Drive
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            backgroundColor: isDragging ? "#fffbeb" : "white",
            border: isDragging ? "2px dashed #f59e0b" : "2px dashed #e5e7eb",
            borderRadius: "16px",
            padding: "32px 20px",
            textAlign: "center",
            transition: "all 0.3s",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 12px",
              backgroundColor: "#fffbeb",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={24} color="#f59e0b" />
          </div>

          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "6px",
            }}
          >
            {files.length > 0
              ? `${files.length} file(s) selected`
              : "Drop your audio files here"}
          </h3>

          <p
            style={{
              fontSize: "13px",
              color: "#6b7280",
              marginBottom: "14px",
            }}
          >
            or click to browse (select multiple)
          </p>

          <input
            type="file"
            accept="audio/*"
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
              backgroundColor: isUploading ? "#d1d5db" : "#f59e0b",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isUploading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.currentTarget.style.backgroundColor = "#d97706";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading) {
                e.currentTarget.style.backgroundColor = "#f59e0b";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            Choose Files
          </label>

          <p
            style={{
              fontSize: "11px",
              color: "#9ca3af",
              marginTop: "12px",
            }}
          >
            MP3, WAV, OGG, M4A (Max 50MB each)
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
              marginBottom: "16px",
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
                    <FileAudio size={20} color="#f59e0b" />
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
    </div>
  );
}