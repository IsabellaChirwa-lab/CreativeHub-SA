import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./api/AuthContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import DataProjects from "./pages/DataProjects";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-canvas">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/data-projects" element={<DataProjects />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
