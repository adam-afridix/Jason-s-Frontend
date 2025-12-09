import { useState } from "react";
import { Image, ArrowLeft, CheckCircle, X, Loader2, AlertCircle } from "lucide-react";
import MetadataModal from "./MetadataModal";
import api from "../services/api";

export default function UploadImage() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);

  const [metadata, setMetadata] = useState({
    title: "",
    speaker: "",
    url: "",
    publishedDate: "",
  });

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/")
    );

    if (selectedFiles.length === 0) {
      return alert("Please select image files only");
    }

    setFiles(selectedFiles);

    // Generate previews
    const imgs = [];
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        imgs.push({ name: file.name, src: reader.result });
        if (imgs.length === selectedFiles.length) {
          setPreviews(imgs);
          setShowMetaModal(true); // Show modal after previews are loaded
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleUpload = async () => {
    if (files.length === 0) return alert("Please select at least one image");


    setIsUploading(true);
    setUploadProgress({});

    const formData = new FormData();

    // Append all image files
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
      fileType: "image",
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

      alert(
        `✅ Successfully uploaded ${result.count} file(s) to Google Drive!\n\n` +
          `Files:\n${result.files.map((f) => `- ${f.name}`).join("\n")}`
      );

      // Reset form after successful upload
      setFiles([]);
      setPreviews([]);
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

      alert("❌ Failed to upload files. Please check your backend server and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    
    // Clear upload progress for this file
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const clearAllFiles = () => {
    setFiles([]);
    setPreviews([]);
    setUploadProgress({});
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
        icon: <Loader2 size={16} color="#a855f7" className="animate-spin" />,
        bg: "#faf5ff",
        border: "#e9d5ff",
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
    return { icon: null, bg: "white", border: "#f3f4f6" };
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #faf5ff, #f3e8ff)",
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

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 16px",
                background: "linear-gradient(to bottom right, #a855f7, #ec4899)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(168,85,247,0.3)",
              }}
            >
              <Image size={40} color="white" />
            </div>

            <h1
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              Upload Images
            </h1>

            <p style={{ fontSize: "16px", color: "#6b7280" }}>
              Upload multiple images to Google Drive
            </p>
          </div>

          {/* Upload Area */}
          <div
            style={{
              background: "white",
              border: "2px dashed #e5e7eb",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
              marginBottom: "24px",
              transition: "all 0.3s",
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              id="file-input"
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={isUploading}
            />

            <label
              htmlFor="file-input"
              style={{
                display: "inline-block",
                backgroundColor: isUploading ? "#d1d5db" : "#a855f7",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: isUploading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isUploading) e.currentTarget.style.backgroundColor = "#9333ea";
              }}
              onMouseLeave={(e) => {
                if (!isUploading) e.currentTarget.style.backgroundColor = "#a855f7";
              }}
            >
              Choose Images
            </label>

            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}>
              JPG, PNG, GIF, WebP — Max 10MB per file
            </p>
          </div>

          {/* File List with Previews */}
          {files.length > 0 && (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #e5e7eb",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
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
                    {files.length} image{files.length > 1 ? "s" : ""} selected
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

              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {files.map((file, index) => {
                  const status = getFileStatus(index);
                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px",
                        backgroundColor: status.bg,
                        border: `1px solid ${status.border}`,
                        borderRadius: "8px",
                        marginBottom: index < files.length - 1 ? "8px" : "0",
                      }}
                    >
                      <img
                        src={previews[index]?.src}
                        alt={file.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginRight: "12px",
                        }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#1f2937",
                            marginBottom: "2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {file.name}
                        </p>
                        <p style={{ fontSize: "12px", color: "#6b7280" }}>
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      {status.icon || (
                        <button
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                          style={{
                            background: "white",
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
                          <X size={16} color="#6b7280" />
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