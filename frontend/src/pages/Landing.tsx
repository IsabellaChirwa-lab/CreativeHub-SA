import { Link } from "react-router-dom";

// A scattered "pinboard" of disciplines instead of a generic stat grid —
// this is the signature visual element for the landing hero.
const pins = [
  { label: "Photographer", rotate: "-rotate-6", color: "bg-marigold" },
  { label: "Illustrator", rotate: "rotate-3", color: "bg-teal" },
  { label: "UI/UX Designer", rotate: "-rotate-2", color: "bg-coral" },
  { label: "Musician", rotate: "rotate-6", color: "bg-marigold" },
  { label: "Writer", rotate: "-rotate-3", color: "bg-teal" },
  { label: "Fashion Designer", rotate: "rotate-2", color: "bg-coral" },
];

const features = [
  {
    title: "Portfolio Builder",
    body: "A page that actually looks like your work — no algorithm deciding who sees it.",
  },
  {
    title: "Commission Marketplace",
    body: "Clients find you. Requests land in one inbox, not five DMs across three apps.",
  },
  {
    title: "Analytics Dashboard",
    body: "Views, saves, and where your audience is actually growing — in plain numbers.",
  },
];

export default function Landing() {
  return (
    <div className="text-paper">
      {/* Hero */}
      <section className="px-6 md:px-12 pt-12 pb-24 max-w-6xl mx-auto">
        <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
          Built for South African creatives
        </p>
        <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] max-w-3xl">
          Your work deserves a home that isn't an algorithm's afterthought.
        </h1>
        <p className="mt-6 max-w-xl text-muted text-lg">
          Portfolios, commissions, and community — built for artists, designers,
          photographers, musicians, illustrators and writers across South Africa.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            to="/register"
            className="bg-marigold text-canvas font-medium px-6 py-3 rounded-sm hover:bg-coral hover:text-paper transition-colors"
          >
            Create your portfolio
          </Link>
          <Link
            to="/login"
            className="border border-muted px-6 py-3 rounded-sm hover:border-paper transition-colors"
          >
            I already have an account
          </Link>
        </div>

        {/* Pinboard */}
        <div className="mt-20 flex flex-wrap gap-5">
          {pins.map((pin) => (
            <div
              key={pin.label}
              className={`${pin.rotate} ${pin.color} text-canvas font-display font-bold px-6 py-8 rounded-sm shadow-lg w-40 md:w-48 hover:rotate-0 transition-transform duration-300`}
            >
              {pin.label}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 bg-paper text-canvas">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {features.map((f) => (
            <div key={f.title}>
              <h3 className="font-display font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-canvas/70">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
