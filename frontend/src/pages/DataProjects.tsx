import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../api/AuthContext";
import {
  createDataProject,
  getDataProjects,
  runDataProject,
  DataProject,
} from "../api/client";

export default function DataProjects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<DataProject[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    getDataProjects(token)
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSaving(true);

    try {
      const project = await createDataProject(token, { name, description, source });
      setProjects((current) => [project, ...current]);
      setName("");
      setDescription("");
      setSource("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setSaving(false);
    }
  }

  async function handleRunProject(projectId: number) {
    if (!token) return;
    setError(null);

    try {
      const updated = await runDataProject(token, projectId, {
        records_ingested: 1200,
        pipeline_status: "Succeeded",
      });
      setProjects((current) =>
        current.map((project) => (project.id === projectId ? updated : project))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not run pipeline");
    }
  }

  return (
    <div className="relative overflow-hidden min-h-screen bg-canvas text-white px-6 md:px-12 py-16">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[#101318]/90 p-10 shadow-[0_40px_120px_-70px_rgba(255,255,255,0.25)] backdrop-blur-xl">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-zing/70 mb-3">
            Learn the core data engineering workflow
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Data projects, pipeline status, and source metadata in one place.
          </h1>
          <p className="mt-4 max-w-3xl text-zing leading-7">
            Capture dataset sources, track ingestion progress, and build the habits
            every data engineer needs: source discovery, ETL metadata, and
            monitoring readiness.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1.5fr_1fr] mb-10">
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
                Project name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#121519] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-zing/70"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
                Source system
              </label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
                placeholder="e.g. AWS S3, Kafka, PostgreSQL"
                className="w-full rounded-xl border border-white/10 bg-[#121519] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-zing/70"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-[#121519] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-zing/70"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-canvas font-semibold hover:bg-zing transition-colors disabled:opacity-50"
            >
              {saving ? "Creating project…" : "Add data project"}
            </button>
          </div>
        </form>

        {error && <p className="text-coral mb-6">{error}</p>}

        <div className="grid gap-4">
          {projects.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-zing/80">
              No data projects yet. Add one to begin tracking sources, pipelines and metrics.
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_-40px_rgba(255,255,255,0.25)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">
                      {project.name}
                    </h2>
                    <p className="text-zing/70 mt-2">Source: {project.source}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-[#121519] px-3 py-1 text-xs uppercase tracking-[0.2em] text-zing">
                    {project.pipeline_status}
                  </span>
                </div>
                <p className="mt-4 text-zing/80 leading-7">{project.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-zing/70">
                  <span>Records processed: {project.records_processed}</span>
                  <span>
                    Last run: {project.last_run_at ? new Date(project.last_run_at).toLocaleString() : "Not run yet"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRunProject(project.id)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-zing transition hover:bg-white/10"
                  >
                    Run pipeline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
