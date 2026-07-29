import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/client";
import { useAuth } from "../api/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("demo@creativehub.sa");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setToken } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await loginUser({ email, password });
      setToken(access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-white">
      <div className="rounded-3xl border border-white/10 bg-charcoal/95 p-10 shadow-[0_30px_90px_-40px_rgba(255,255,255,0.18)]">
        <h1 className="font-display font-bold text-3xl mb-8">Welcome back</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121519] text-white px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-zing/70"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121519] text-white px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-zing/70"
            />
          </div>

          {error && <p className="text-white/80 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-canvas font-medium py-3 rounded-sm hover:bg-zing transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-zing/70 text-sm">
          No account yet?{" "}
          <Link to="/register" className="text-white hover:underline">
            Join for free
          </Link>
        </p>
      </div>
    </div>
  );
}
