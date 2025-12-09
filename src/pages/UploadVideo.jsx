import { useState } from "react";
import { Video, Upload, ArrowLeft, CheckCircle, X, Loader2, AlertCircle } from "lucide-react";
import MetadataModal from "./MetadataModal";
import api from "../services/api";

export default function UploadVideo() {
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

  const isValidVideoFile = (file) => {
    return file.type.startsWith("video/");
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(isValidVideoFile);

    if (validFiles.length !== selectedFiles.length) {
      alert("Some files were skipped. Only video formats are allowed.");
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
    const validFiles = droppedFiles.filter(isValidVideoFile);

    if (validFiles.length !== droppedFiles.length) {
      alert("Some files were skipped. Only video files are allowed.");
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setShowMetaModal(true);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
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

    // Append all video files
    files.forEach((file) => formData.append("files", file));

    // Create metadata object with additional info
    const metadataObject = {
      title: metadata.title.trim() || "N/A",
      speaker: metadata.speaker.trim() || "N/A",
      url: metadata.url.trim() || "N/A",
      publishedDate: metadata.publishedDate || "N/A",
      uploadDate: new Date().toISOString(),
      fileCount: files.length,
      fileType: "video",
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

    const initial = {};
    files.forEach((_, i) => (initial[i] = "uploading"));
    setUploadProgress(initial);

    try {
      const res = await api.post("/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = res.data;

      const done = {};
      files.forEach((_, i) => (done[i] = "done"));
      setUploadProgress(done);

      alert(
        `🎉 Successfully uploaded ${result.count} video(s)!\n\n` +
          result.files.map((f) => `- ${f.name}`).join("\n")
      );

      // Reset form after successful upload
      setFiles([]);
      setMetadata({
        title: "",
        speaker: "",
        url: "",
        publishedDate: "",
      });
    } catch (err) {
      console.error(err);

      const errorMap = {};
      files.forEach((_, i) => (errorMap[i] = "error"));
      setUploadProgress(errorMap);

      alert("❌ Upload failed. Check the backend.");
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
    return formatFileSize(files.reduce((a, f) => a + f.size, 0));
  };

  const getFileStatus = (idx) => {
    const s = uploadProgress[idx];
    if (s === "uploading")
      return {
        icon: <Loader2 size={18} className="animate-spin" color="#2563eb" />,
        bg: "#eff6ff",
        border: "#bfdbfe",
      };
    if (s === "done")
      return {
        icon: <CheckCircle size={18} color="#22c55e" />,
        bg: "#f0fdf4",
        border: "#86efac",
      };
    if (s === "error")
      return {
        icon: <AlertCircle size={18} color="#dc2626" />,
        bg: "#fef2f2",
        border: "#fecaca",
      };
    return { icon: null, bg: "#f8fafc", border: "#e5e7eb" };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #eef2ff, #e0f2fe, #f0f9ff)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ padding: "32px 16px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
              color: "#4b5563",
              marginBottom: "24px",
              cursor: "pointer",
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
            <ArrowLeft size={16} /> Back to Home
          </button>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 16px",
                background: "linear-gradient(to bottom right, #2563eb, #1d4ed8)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(37, 99, 235, .3)",
              }}
            >
              <Video size={40} color="white" />
            </div>
            <h1
              style={{
                fontSize: "34px",
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Upload Video Files
            </h1>
            <p style={{ color: "#64748b", fontSize: "16px" }}>
              Upload multiple video files to Google Drive
            </p>
          </div>

          {/* Drag + Select Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              padding: "48px 24px",
              borderRadius: "16px",
              textAlign: "center",
              backgroundColor: isDragging ? "#eff6ff" : "white",
              border: isDragging
                ? "2px dashed #2563eb"
                : "2px dashed #e5e7eb",
              marginBottom: "24px",
              transition: "all .3s",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "#eff6ff",
                borderRadius: "12px",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload size={32} color="#2563eb" />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
              {files.length > 0
                ? `${files.length} video(s) selected`
                : "Drop your video files here"}
            </h3>

            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              or click to browse videos
            </p>

            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="video-input"
              disabled={isUploading}
            />

            <label
              htmlFor="video-input"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: isUploading ? "#d1d5db" : "#2563eb",
                color: "white",
                borderRadius: "8px",
                cursor: isUploading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isUploading) e.currentTarget.style.backgroundColor = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                if (!isUploading) e.currentTarget.style.backgroundColor = "#2563eb";
              }}
            >
              Choose Videos
            </label>

            <p
              style={{
                marginTop: "16px",
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              Supported: MP4, MOV, MKV, AVI
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>
                    {files.length} video(s)
                  </span>
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
                    ({getTotalSize()})
                  </span>
                </div>

                <button
                  onClick={clearAllFiles}
                  disabled={isUploading}
                  style={{
                    padding: "4px 10px",
                    background: "#eef2ff",
                    border: "1px solid #c7d2fe",
                    color: "#4f46e5",
                    borderRadius: "6px",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    opacity: isUploading ? 0.5 : 1,
                  }}
                >
                  Clear All
                </button>
              </div>

              {/* File Items */}
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {files.map((file, index) => {
                  const s = getFileStatus(index);
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px",
                        borderRadius: "8px",
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        marginBottom: index < files.length - 1 ? "8px" : "0",
                      }}
                    >
                      <Video size={20} color="#1d4ed8" />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 500,
                            fontSize: "13px",
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

                      {s.icon || (
                        <button
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                          style={{
                            padding: "4px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            background: "white",
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
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}