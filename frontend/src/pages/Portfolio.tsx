import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";
import { getPortfolioItems, savePortfolioItems, PortfolioItem } from "../api/portfolio";

export default function Portfolio() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!token) return;
    setItems(getPortfolioItems());
  }, [token]);

  useEffect(() => {
    savePortfolioItems(items);
  }, [items]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title || !category || !description) return;
    setItems((current) => [
      {
        id: Date.now(),
        title,
        category,
        description,
        imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80",
      },
      ...current,
    ]);
    setTitle("");
    setCategory("");
    setDescription("");
  }

  return (
    <div className="min-h-screen bg-canvas text-white px-6 md:px-12 py-16">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[#101318]/90 p-10 shadow-[0_40px_120px_-70px_rgba(255,255,255,0.25)] backdrop-blur-xl">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-zing/70 mb-3">
            Portfolio builder
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Add creative work, categories and share-ready portfolio items.
          </h1>
          <p className="mt-4 max-w-3xl text-zing leading-7">
            Use this page to imagine how a portfolio upload flow would work for photographers, illustrators, designers and other creatives.
          </p>
        </div>

        <form onSubmit={handleAdd} className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr] mb-10">
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Portrait series, branding suite, album art"
                className="w-full rounded-xl border border-white/10 bg-[#121519] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-zing/70"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Photography, Illustration, UI/UX"
                className="w-full rounded-xl border border-white/10 bg-[#121519] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-zing/70"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block font-mono text-xs uppercase tracking-widest text-zing/70 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              placeholder="Describe the work, medium, tools and client brief."
              className="w-full rounded-xl border border-white/10 bg-[#121519] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-zing/70"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-canvas font-semibold hover:bg-zing transition-colors"
            >
              Add portfolio item
            </button>
          </div>
        </form>

        <div className="grid gap-6">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-zing/80">
              No portfolio items yet. Add a few examples of your work to show clients what you can do.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/10 bg-[#0d1014] p-6 sm:flex sm:items-center sm:gap-6">
                <img src={item.imageUrl} alt={item.title} className="mb-4 h-44 w-full rounded-3xl object-cover sm:mb-0 sm:w-56" />
                <div>
                  <p className="font-display text-2xl font-bold text-white">{item.title}</p>
                  <p className="text-zing/70 mt-2">{item.category}</p>
                  <p className="mt-4 text-zing/80 leading-7">{item.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
