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
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 text-paper">
      <Link to="/" className="font-display font-bold text-xl tracking-tight">
        CreativeHub <span className="text-marigold">SA</span>
      </Link>
      <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
        {token ? (
          <>
            <Link to="/profile" className="hover:text-marigold transition-colors">
              My Profile
            </Link>
            <button onClick={handleLogout} className="hover:text-coral transition-colors">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-marigold transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-marigold text-canvas px-4 py-2 rounded-sm hover:bg-coral hover:text-paper transition-colors"
            >
              Join free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
