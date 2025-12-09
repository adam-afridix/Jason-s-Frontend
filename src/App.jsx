import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Home from "./pages/Home.jsx";
import UploadPdf from "./pages/UploadPdf.jsx";
import UploadText from "./pages/UploadText.jsx";
import UploadImage from "./pages/UploadImage.jsx";
import UploadVideo from "./pages/UploadVideo.jsx";
import UploadAudio from "./pages/UploadAudio.jsx";
import PasteText from "./pages/PasteText.jsx";
import YoutubeLink from "./pages/YoutubeLink.jsx";
import MetadataModal from "./pages/MetadataModal.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/upload-pdf" element={<ProtectedRoute><UploadPdf /></ProtectedRoute>} />
        <Route path="/upload-text" element={<ProtectedRoute><UploadText /></ProtectedRoute>} />
        <Route path="/upload-image" element={<ProtectedRoute><UploadImage /></ProtectedRoute>} />
        <Route path="/upload-video" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
        <Route path="/upload-audio" element={<ProtectedRoute><UploadAudio /></ProtectedRoute>} />
        <Route path="/paste-text" element={<ProtectedRoute><PasteText /></ProtectedRoute>} />
        <Route path="/youtube-link" element={<ProtectedRoute><YoutubeLink /></ProtectedRoute>} />
        <Route path="/metadata-modal" element={<ProtectedRoute><MetadataModal /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;