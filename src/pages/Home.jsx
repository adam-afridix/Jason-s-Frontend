import { Link, useNavigate } from "react-router-dom";
import { FileText, Image, Video, FileUp, Music, ClipboardPaste, Youtube, LogOut } from "lucide-react";
import GoogleDriveConnect from "../components/GoogleDriveConnect";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const options = [
    {
      path: "/upload-pdf",
      icon: FileText,
      title: "Upload PDF File",
      description: "Process PDF documents",
      gradient: "linear-gradient(to bottom right, #ef4444, #f97316)",
      bgColor: "#fef2f2",
      hoverShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.1)"
    },
    {
      path: "/upload-text",
      icon: FileUp,
      title: "Upload Text File",
      description: "Analyze text files",
      gradient: "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
      bgColor: "#eff6ff",
      hoverShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.1)"
    },
    {
      path: "/upload-image",
      icon: Image,
      title: "Upload Image File",
      description: "Process image files",
      gradient: "linear-gradient(to bottom right, #a855f7, #ec4899)",
      bgColor: "#faf5ff",
      hoverShadow: "0 20px 25px -5px rgba(168, 85, 247, 0.1)"
    },
    {
      path: "/upload-video",
      icon: Video,
      title: "Upload Video File",
      description: "Analyze video content",
      gradient: "linear-gradient(to bottom right, #22c55e, #14b8a6)",
      bgColor: "#f0fdf4",
      hoverShadow: "0 20px 25px -5px rgba(34, 197, 94, 0.1)"
    },
    {
      path: "/upload-audio",
      icon: Music,
      title: "Upload Audio File",
      description: "Process audio files",
      gradient: "linear-gradient(to bottom right, #f59e0b, #eab308)",
      bgColor: "#fffbeb",
      hoverShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.1)"
    },
    {
      path: "/paste-text",
      icon: ClipboardPaste,
      title: "Paste Text",
      description: "Paste and analyze text",
      gradient: "linear-gradient(to bottom right, #8b5cf6, #6366f1)",
      bgColor: "#f5f3ff",
      hoverShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.1)"
    },
    {
      path: "/youtube-link",
      icon: Youtube,
      title: "YouTube Link",
      description: "Paste YouTube URL to process",
      gradient: "linear-gradient(to bottom right, #dc2626, #b91c1c)",
      bgColor: "#fef2f2",
      hoverShadow: "0 20px 25px -5px rgba(220, 38, 38, 0.1)"
    }
  ];

  const CardComponent = ({ option }) => {
    const Icon = option.icon;
    return (
      <Link to={option.path} style={{ textDecoration: "none" }}>
        <div
          className="card"
          style={{
            backgroundColor: option.bgColor,
            borderRadius: "20px",
            padding: "32px 24px",
            transition: "all 0.3s",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            cursor: "pointer",
            height: "80%"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05) translateY(-8px)";
            e.currentTarget.style.boxShadow = option.hoverShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div className="card-icon-wrapper" style={{
            width: "64px",
            height: "64px",
            background: option.gradient,
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }}>
            <Icon size={32} color="white" />
          </div>
          <h3 className="card-title" style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "8px"
          }}>
            {option.title}
          </h3>
          <p className="card-description" style={{
            color: "#4b5563",
            fontSize: "14px",
            marginBottom: "16px",
            lineHeight: "1.5"
          }}>
            {option.description}
          </p>
          <div className="card-cta" style={{
            display: "flex",
            alignItems: "center",
            color: "#6b7280",
            fontSize: "14px"
          }}>
            <span style={{ fontWeight: "500" }}>Get started</span>
            <svg 
              style={{ width: "16px", height: "16px", marginLeft: "8px" }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #f8fafc, #dbeafe, #e0e7ff)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "60px 24px"
    }}>
      <style>{`
        /* Mobile - 3 columns with last card centered */
        @media (max-width: 768px) {
          .main-container {
            padding: 30px 12px !important;
          }
          
          .header-section {
            margin-bottom: 30px !important;
          }
          
          .header-icon {
            width: 60px !important;
            height: 60px !important;
            margin: 0 auto 16px !important;
          }
          
          .header-icon svg {
            width: 32px !important;
            height: 32px !important;
          }
          
          .header-title {
            font-size: 26px !important;
            margin-bottom: 12px !important;
          }
          
          .header-subtitle {
            font-size: 14px !important;
            padding: 0 12px !important;
          }
          
          /* All cards in one container */
          .all-cards-mobile {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
          
          /* Hide desktop layout */
          .first-row,
          .second-row {
            display: none !important;
          }
          
          /* Last card centered in middle column */
          .all-cards-mobile > a:nth-child(7) {
            grid-column: 1 / 1 !important;
          }
          
          .card {
            padding: 16px 8px !important;
            height: 110px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .card-icon-wrapper {
            width: 40px !important;
            height: 40px !important;
            margin-bottom: 8px !important;
            border-radius: 10px !important;
          }
          
          .card-icon-wrapper svg {
            width: 22px !important;
            height: 22px !important;
          }
          
          .card-title {
            font-size: 10px !important;
            margin-bottom: 0 !important;
            text-align: center !important;
            line-height: 1.2 !important;
          }
          
          /* Hide description and CTA on mobile */
          .card-description,
          .card-cta {
            display: none !important;
          }
          
          .footer-section {
            margin-top: 30px !important;
          }
        }

        /* Desktop - hide mobile layout */
        @media (min-width: 769px) {
          .all-cards-mobile {
            display: none !important;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 769px) and (max-width: 1024px) {
          .first-row {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .second-row {
            flex-wrap: wrap !important;
          }
          
          .second-row > div {
            width: calc(50% - 12px) !important;
          }
          
          .header-title {
            font-size: 40px !important;
          }
        }

        /* Disable hover effects on touch devices */
        @media (hover: none) {
          .card:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div className="main-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Logout Button - Top Right */}
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          marginBottom: "20px" 
        }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Header */}
        <div className="header-section" style={{ textAlign: "center", marginBottom: "60px" }}>
          <div className="header-icon" style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px",
            background: "linear-gradient(to bottom right, #2563eb, #4f46e5)",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          }}>
            <FileUp size={40} color="white" />
          </div>
          <h1 className="header-title" style={{
            fontSize: "48px",
            fontWeight: "bold",
            background: "linear-gradient(to right, #2563eb, #4f46e5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "16px"
          }}>
            Multiformat file to PDF
          </h1>
          <p className="header-subtitle" style={{
            fontSize: "20px",
            color: "#4b5563",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Choose your content type to get started with AI-powered processing
          </p>
        </div>

        {/* Google Drive Connection Status */}
        <div style={{ maxWidth: "800px", margin: "0 auto 40px" }}>
          <GoogleDriveConnect />
        </div>

        {/* Mobile Layout - All cards in one grid */}
        <div className="all-cards-mobile" style={{ display: "none" }}>
          {options.map((option, index) => (
            <CardComponent key={index} option={option} />
          ))}
        </div>

        {/* Desktop Layout */}
        {/* First Row - 4 cards */}
        <div className="first-row" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto 40px"
        }}>
          {options.slice(0, 4).map((option, index) => (
            <CardComponent key={index} option={option} />
          ))}
        </div>

        {/* Second Row - 3 cards centered */}
        <div className="second-row" style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {options.slice(4).map((option, index) => (
            <div key={index} style={{ width: "270px" }}>
              <CardComponent option={option} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="footer-section" style={{ textAlign: "center", marginTop: "60px" }}>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            
          </p>
        </div>
      </div>
    </div>
  );
}