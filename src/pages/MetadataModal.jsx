import { X } from "lucide-react";

export default function MetadataModal({
  isOpen,
  onClose,
  onSubmit,
  metadata,
  setMetadata,
  isUploading,
}) {
  if (!isOpen) return null;

  const handleSubmit = () => {
    // No validation needed - all fields are optional
    // Just submit with N/A for empty fields
    onSubmit();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget && !isUploading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isUploading}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            border: "none",
            background: "#f3f4f6",
            borderRadius: "6px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isUploading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: isUploading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isUploading) e.currentTarget.style.backgroundColor = "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            if (!isUploading) e.currentTarget.style.backgroundColor = "#f3f4f6";
          }}
        >
          <X size={18} color="#6b7280" />
        </button>

        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "8px",
          }}
        >
          Content Details
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginBottom: "20px",
          }}
        >
          Please provide information about the content (all fields are optional)
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Title */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Title
            </label>
            <input
              type="text"
              placeholder="Enter title or N/A"
              value={metadata.title}
              onChange={(e) =>
                setMetadata({ ...metadata, title: e.target.value })
              }
              disabled={isUploading}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                backgroundColor: isUploading ? "#f9fafb" : "white",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                if (!isUploading) e.currentTarget.style.borderColor = "#8b5cf6";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            />
          </div>

          {/* Speaker */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Speaker
            </label>
            <input
              type="text"
              placeholder="Enter speaker name or N/A"
              value={metadata.speaker}
              onChange={(e) =>
                setMetadata({ ...metadata, speaker: e.target.value })
              }
              disabled={isUploading}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                backgroundColor: isUploading ? "#f9fafb" : "white",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                if (!isUploading) e.currentTarget.style.borderColor = "#8b5cf6";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            />
          </div>

          {/* URL */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              URL
            </label>
            <input
              type="text"
              placeholder="Enter URL or N/A"
              value={metadata.url}
              onChange={(e) =>
                setMetadata({ ...metadata, url: e.target.value })
              }
              disabled={isUploading}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                backgroundColor: isUploading ? "#f9fafb" : "white",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                if (!isUploading) e.currentTarget.style.borderColor = "#8b5cf6";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            />
          </div>

          {/* Published Date */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Published Date
            </label>
            <input
              type="date"
              value={metadata.publishedDate}
              onChange={(e) =>
                setMetadata({ ...metadata, publishedDate: e.target.value })
              }
              disabled={isUploading}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                cursor: isUploading ? "not-allowed" : "pointer",
                backgroundColor: isUploading ? "#f9fafb" : "white",
                transition: "all 0.2s",
                boxSizing: "border-box",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "18px 18px",
                paddingRight: "40px",
              }}
              onClick={(e) => {
                if (!isUploading) {
                  e.currentTarget.showPicker?.();
                }
              }}
              onFocus={(e) => {
                if (!isUploading) e.currentTarget.style.borderColor = "#8b5cf6";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            />
            <p style={{
              fontSize: "11px",
              color: "#9ca3af",
              marginTop: "4px",
              marginBottom: 0
            }}>
              Leave empty if date is not applicable
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isUploading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: isUploading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isUploading) e.currentTarget.style.backgroundColor = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              if (!isUploading) e.currentTarget.style.backgroundColor = "white";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: isUploading ? "#d1d5db" : "#8b5cf6",
              color: "white",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isUploading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isUploading) e.currentTarget.style.backgroundColor = "#7c3aed";
            }}
            onMouseLeave={(e) => {
              if (!isUploading) e.currentTarget.style.backgroundColor = "#8b5cf6";
            }}
          >
            {isUploading ? "Uploading..." : "Submit & Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}