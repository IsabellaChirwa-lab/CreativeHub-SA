import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import { getMyProfile, getDataProjects, DataProject } from "../api/client";

export default function Dashboard() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<{ discipline: string | null; bio: string | null; skills: string | null; location: string | null; portfolio_views: number } | null>(null);
  const [projects, setProjects] = useState<DataProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([getMyProfile(token), getDataProjects(token)])
      .then(([profileData, projectData]) => {
        setProfile(profileData);
        setProjects(projectData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-canvas text-white px-6 md:px-12 py-16">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[#101318]/90 p-10 shadow-[0_40px_120px_-70px_rgba(255,255,255,0.25)] backdrop-blur-xl">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-zing/70 mb-3">
            Welcome back to your creative studio
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Your creative workspace for portfolio, commissions and data workflows.
          </h1>
          <p className="mt-4 max-w-3xl text-zing leading-7">
            Use this dashboard to add portfolio items, connect creative services, and keep your profile visible to clients.
          </p>
        </div>

        {loading ? (
          <p className="text-zing/70">Loading your dashboard…</p>
        ) : error ? (
          <p className="text-coral">{error}</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <h2 className="font-display text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    to="/profile"
                    className="rounded-3xl border border-white/10 bg-[#121519] px-6 py-5 text-zing transition hover:bg-white/10"
                  >
                    Update profile
                  </Link>
                  <Link
                    to="/data-projects"
                    className="rounded-3xl border border-white/10 bg-[#121519] px-6 py-5 text-zing transition hover:bg-white/10"
                  >
                    Manage data projects
                  </Link>
                  <Link
                    to="/portfolio"
                    className="rounded-3xl border border-white/10 bg-[#121519] px-6 py-5 text-zing transition hover:bg-white/10"
                  >
                    Add / edit portfolio
                  </Link>
                  <Link
                    to="/data-projects"
                    className="rounded-3xl border border-white/10 bg-[#121519] px-6 py-5 text-zing transition hover:bg-white/10"
                  >
                    Connect creative services
                  </Link>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <h2 className="font-display text-2xl font-bold mb-4">Your creative profile</h2>
                <p className="text-zing/70 mb-4">Make your profile stand out with a strong discipline, a clear bio, and the skills clients are searching for.</p>
                <dl className="grid gap-4 text-zing/80">
                  <div>
                    <dt className="font-semibold text-white">Discipline</dt>
                    <dd>{profile?.discipline ?? "Not set yet"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">Location</dt>
                    <dd>{profile?.location ?? "Not set yet"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">Skills</dt>
                    <dd>{profile?.skills ?? "Not set yet"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-white">Portfolio views</dt>
                    <dd>{profile?.portfolio_views ?? 0}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <aside className="space-y-8">
              <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <h2 className="font-display text-2xl font-bold mb-4">What creatives use this for</h2>
                <ul className="space-y-3 text-zing/80">
                  <li>Build and publish a portfolio page for your work.</li>
                  <li>Manage client requests and creative briefs.</li>
                  <li>Track data workflows for collections, galleries, and assets.</li>
                  <li>Connect services, upload artwork, and monitor exposure.</li>
                </ul>
              </section>

              <section className="rounded-3xl border border-white/10 bg-[#121519] p-8">
                <h2 className="font-display text-2xl font-bold mb-4">Recent projects</h2>
                {projects.length === 0 ? (
                  <p className="text-zing/70">No data projects yet. Add one in the Data Projects section.</p>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="rounded-3xl bg-[#0d1014] p-4">
                        <p className="font-semibold text-white">{project.name}</p>
                        <p className="text-zing/70 text-sm">{project.pipeline_status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
