// A lightweight client-side portfolio page simulation for demo purposes.
export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
}

export function getPortfolioItems(): PortfolioItem[] {
  const saved = window.localStorage.getItem("creativehub_portfolio_items");
  return saved ? JSON.parse(saved) : [];
}

export function savePortfolioItems(items: PortfolioItem[]) {
  window.localStorage.setItem("creativehub_portfolio_items", JSON.stringify(items));
}
