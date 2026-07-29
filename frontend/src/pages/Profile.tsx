import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMyProfile, updateMyProfile, ProfileData } from "../api/client";
import { useAuth } from "../api/AuthContext";

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    getMyProfile(token)
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile || !token) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updateMyProfile(token, profile);
      setProfile(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-white text-center py-16">Loading your profile…</p>;
  if (!profile) return <p className="text-white text-center py-16">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-white">
      <div className="rounded-3xl border border-white/10 bg-charcoal/95 p-10 shadow-[0_30px_90px_-40px_rgba(255,255,255,0.18)]">
        <h1 className="font-display font-bold text-3xl mb-2">My Profile</h1>
        <p className="text-zing/70 mb-8">
          This is what clients and collaborators see. Keep it current.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
              Discipline
            </label>
            <input
              value={profile.discipline ?? ""}
              onChange={(e) => setProfile({ ...profile, discipline: e.target.value })}
              placeholder="e.g. Photographer, Illustrator, UI/UX Designer"
              className="w-full bg-[#121519] text-white px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-zing/70"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">Bio</label>
            <textarea
              value={profile.bio ?? ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              placeholder="Tell clients what you make and how you work."
              className="w-full bg-[#121519] text-white px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-zing/70"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
              Skills
            </label>
            <input
              value={profile.skills ?? ""}
              onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              placeholder="Comma-separated, e.g. portraits, retouching, studio lighting"
              className="w-full bg-[#121519] text-white px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-zing/70"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
              Location
            </label>
            <input
              value={profile.location ?? ""}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="e.g. Johannesburg, South Africa"
              className="w-full bg-[#121519] text-white px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-zing/70"
            />
          </div>

          <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-zing/70">
            Portfolio views: <span className="text-white">{profile.portfolio_views}</span>
          </div>

          {error && <p className="text-white/80 text-sm">{error}</p>}
          {saved && <p className="text-zing text-sm">Profile saved.</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-white text-canvas font-medium px-6 py-3 rounded-sm hover:bg-zing transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
