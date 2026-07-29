import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginUser } from "../api/client";
import { useAuth } from "../api/AuthContext";

export default function Register() {
  const [fullName, setFullName] = useState("Demo Artist");
  const [email, setEmail] = useState("demo+1@creativehub.sa");
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
      await registerUser({ email, password, full_name: fullName });
      // Register then log in immediately so the person lands straight in their profile.
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
        <h1 className="font-display font-bold text-3xl mb-2">Join CreativeHub SA</h1>
        <p className="text-zing/70 mb-8">Free to create. Your first portfolio in minutes. Use demo data and remove it later.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
              Full name
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#121519] text-white px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-zing/70"
            />
          </div>
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
              minLength={8}
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
            {loading ? "Creating your account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-zing/70 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
