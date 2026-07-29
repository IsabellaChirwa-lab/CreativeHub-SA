import { Link } from "react-router-dom";
import handsImage from "../assets/hands.svg";
import { useAuth } from "../api/AuthContext";

const pins = [
  { label: "Photographer" },
  { label: "Illustrator" },
  { label: "UI/UX Designer" },
  { label: "Musician" },
  { label: "Writer" },
  { label: "Fashion Designer" },
];

const features = [
  {
    title: "Source Tracking",
    body: "Log sources like S3, Kafka, PostgreSQL and understand where your data comes from.",
  },
  {
    title: "Pipeline Status",
    body: "Track ingestion, transformation and delivery status so your data workflows stay reliable.",
  },
  {
    title: "Metrics & Monitoring",
    body: "Keep count of records processed, last run times, and readiness for downstream analytics.",
  },
];

export default function Landing() {
  const { token } = useAuth();
  return (
    <div className="relative overflow-hidden min-h-screen bg-canvas text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src={handsImage}
          alt="Creative collaboration background"
          className="absolute inset-0 h-full w-full object-cover opacity-30 filter blur-sm grayscale mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/90" />
      </div>

      <section className="relative px-6 md:px-12 pt-24 pb-24 max-w-6xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-zing/70 mb-4">
          Built for South African creatives
        </p>
        <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          Your work deserves a home that isn't an algorithm's afterthought.
        </h1>
        <p className="mt-6 max-w-xl text-zing text-lg leading-8">
          CreativeHub SA now supports data engineering workflows: capture dataset
          sources, monitor pipeline status, and track record throughput as your
          data projects move from ingestion to insight.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/register"
            className="bg-white text-canvas font-medium px-6 py-3 rounded-sm shadow-lg shadow-white/10 hover:bg-zing transition-colors"
          >
            Start your portfolio
          </Link>
          <Link
            to={token ? "/dashboard" : "/login"}
            className="border border-zing/50 text-zing px-6 py-3 rounded-sm hover:border-white hover:text-white transition-colors"
          >
            Explore the studio
          </Link>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {pins.map((pin) => (
            <div
              key={pin.label}
              className={`bg-charcoal/95 text-white font-display font-bold px-6 py-8 rounded-2xl shadow-[0_20px_50px_-30px_rgba(255,255,255,0.25)] w-full md:w-auto transition-all duration-300`}
            >
              {pin.label}
            </div>
          ))}
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-20 bg-[#0d1014]/90">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {features.map((f) => (
            <div key={f.title} className="border border-white/10 rounded-3xl p-6 backdrop-blur-xl bg-white/5">
              <h3 className="font-display font-bold text-xl mb-3 text-white">
                {f.title}
              </h3>
              <p className="text-zing/80 leading-7">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
