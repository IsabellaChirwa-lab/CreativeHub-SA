import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 text-white">
      <Link to="/" className="font-display font-bold text-xl tracking-tight">
        CreativeHub <span className="text-zing">SA</span>
      </Link>
      <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-zing/70">
        {token ? (
          <>
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/portfolio" className="hover:text-white transition-colors">
              Portfolio
            </Link>
            <Link to="/data-projects" className="hover:text-white transition-colors">
              Data Projects
            </Link>
            <Link to="/profile" className="hover:text-white transition-colors">
              My Profile
            </Link>
            <button onClick={handleLogout} className="hover:text-white transition-colors">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-white text-canvas px-4 py-2 rounded-sm hover:bg-zing transition-colors"
            >
              Join free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
