import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { apiFetch, API_AUTH, API_PRODUCTS, API_PURCHASES, CATEGORIES, CATEGORY_COLORS, CATEGORY_TEXT, CATEGORY_ICONS } from "@/lib/api";
import type { Product, Review, User, Page, ViewMode } from "@/lib/api";
import { AuthModal, BuyModal, StarRating, ReviewForm, WithdrawModal } from "@/components/marketplace/Modals";
import FileViewer from "@/components/marketplace/FileViewer";

type PurchasedItem = Product & { purchased_at: string };

const API_REVIEWS = "https://functions.poehali.dev/44f977bc-18dc-4dfe-a3d0-e5f29f688e29";

const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: "Любая", range: [0, 10000] },
  { label: "до 500 ₽", range: [0, 500] },
  { label: "500–1500 ₽", range: [500, 1500] },
  { label: "1500–3500 ₽", range: [1500, 3500] },
  { label: "от 3500 ₽", range: [3500, 10000] },
];

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("nexus_token"));
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<"popular" | "cheap" | "expensive" | "rating" | "newest">("popular");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [buyModal, setBuyModal] = useState<Product | null>(null);
  const [reviewModal, setReviewModal] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await apiFetch(`${API_PRODUCTS}/`);
      if (Array.isArray(data)) setProducts(data);
    } catch {
      // ignore
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const t = localStorage.getItem("nexus_token");
      if (t) {
        try {
          const res = await apiFetch(`${API_AUTH}/me`, {}, t);
          if (res && res.id) setUser(res);
        } catch {
          // ignore
        }
      }
      await loadProducts();
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setLoadingReviews(true);
      apiFetch(`${API_REVIEWS}/?product_id=${selectedProduct.id}`)
        .then((data) => { if (Array.isArray(data)) setProductReviews(data); })
        .catch(() => {})
        .finally(() => setLoadingReviews(false));
    } else {
      setProductReviews([]);
    }
  }, [selectedProduct]);

  const handleLogin = async (email: string, password: string) => {
    const res = await apiFetch(`${API_AUTH}/login`, { method: "POST", body: JSON.stringify({ email, password }) });
    if (res.error) throw new Error(res.error);
    if (!res.token) throw new Error("Сервер не вернул токен");
    localStorage.setItem("nexus_token", res.token);
    setToken(res.token);
    setUser({ ...res.user, purchased: res.user.purchased || [] });
    setAuthModal(null);
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const res = await apiFetch(`${API_AUTH}/register`, { method: "POST", body: JSON.stringify({ name, email, password }) });
    if (res.error) throw new Error(res.error);
    if (!res.token) throw new Error("Сервер не вернул токен");
    localStorage.setItem("nexus_token", res.token);
    setToken(res.token);
    setUser({ ...res.user, purchased: [] });
    setAuthModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    setUser(null);
    setToken(null);
    setPage("home");
  };

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const filteredProducts = products
    .filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "Все" || p.category === selectedCategory;
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchSearch && matchCat && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "cheap") return a.price - b.price;
      if (sortBy === "expensive") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest") return b.id - a.id;
      return b.sales_count - a.sales_count;
    });

  const isPurchased = (productId: number) => !!user && user.purchased.includes(productId);

  const initials = user ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "";

  return (
    <div className="min-h-screen" style={{ background: "#070b12", fontFamily: "'Golos Text', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(7,11,18,0.94)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(0,245,212,0.09)" }}>
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg,transparent,#00f5d4 30%,#9b59f5 70%,transparent)" }} />
        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Logo */}
          <button onClick={() => navigate("home")} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#00f5d4,#9b59f5)", boxShadow: "0 0 14px rgba(0,245,212,0.3)" }}>
              <span className="font-orbitron font-black text-xs" style={{ color: "#070b12" }}>NX</span>
            </div>
            <span className="font-orbitron font-bold text-sm tracking-widest neon-text hidden lg:block">NEXUS</span>
          </button>

          <div className="hidden md:block h-5 w-px mx-1" style={{ background: "rgba(0,245,212,0.15)" }} />

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {([["home","Главная"],["catalog","Каталог"],["upload","Загрузка"]] as [Page,string][]).map(([p, label]) => (
              <button key={p} onClick={() => navigate(p)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative"
                style={{ color: page === p ? "#00f5d4" : "rgba(180,200,220,0.6)", background: page === p ? "rgba(0,245,212,0.07)" : "transparent" }}>
                {label}
                {page === p && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: "#00f5d4" }} />}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 flex justify-start pl-1">
            <div className="relative w-full max-w-sm">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(0,245,212,0.4)" }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (page !== "catalog") navigate("catalog"); }}
                placeholder="Поиск продуктов..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl outline-none text-sm"
                style={{ background: "rgba(13,20,32,0.8)", border: "1px solid rgba(0,245,212,0.12)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }}
              />
            </div>
          </div>

          <div className="hidden md:block h-5 w-px mx-1" style={{ background: "rgba(0,245,212,0.15)" }} />

          {/* Auth */}
          {user ? (
            <button onClick={() => navigate("profile")} className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all flex-shrink-0"
              style={{ background: page === "profile" ? "rgba(0,245,212,0.1)" : "rgba(13,20,32,0.8)", border: "1px solid rgba(0,245,212,0.15)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-orbitron font-bold"
                style={{ background: "linear-gradient(135deg,#00f5d4,#9b59f5)", color: "#070b12" }}>
                {initials}
              </div>
              <span className="text-sm font-medium hidden lg:block" style={{ color: "#e8f4ff" }}>{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setAuthModal("login")} className="neon-btn px-3 py-1.5 rounded-lg text-sm font-medium hidden sm:block">Войти</button>
              <button onClick={() => setAuthModal("register")} className="neon-btn-solid px-3 py-1.5 rounded-lg text-sm font-semibold font-orbitron">Регистрация</button>
            </div>
          )}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="pt-[52px] pb-16 md:pb-0">

        {/* ── HOME ── */}
        {page === "home" && (
          <div className="animate-fade-in">
            {/* Hero */}
            <section className="relative flex items-center justify-center" style={{ minHeight: "82vh" }}>
              {/* Bg */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(0,245,212,0.04) 0%,rgba(7,11,18,1) 40%,rgba(155,89,245,0.04) 100%)" }} />
                <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,245,212,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,0.025) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
                <div className="absolute rounded-full" style={{ width: 500, height: 500, top: "10%", left: "60%", background: "radial-gradient(circle,rgba(0,245,212,0.06) 0%,transparent 65%)", filter: "blur(40px)" }} />
                <div className="absolute rounded-full" style={{ width: 400, height: 400, top: "50%", left: "5%", background: "radial-gradient(circle,rgba(155,89,245,0.07) 0%,transparent 65%)", filter: "blur(40px)" }} />
                <div className="absolute rounded-full" style={{ width: 300, height: 300, bottom: "5%", right: "10%", background: "radial-gradient(circle,rgba(245,0,200,0.04) 0%,transparent 65%)", filter: "blur(40px)" }} />
              </div>
              <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-orbitron tracking-widest"
                  style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)", color: "#00f5d4" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  ЦИФРОВОЙ МАРКЕТПЛЕЙС
                </div>
                <h1 className="font-orbitron font-black leading-none mb-6" style={{ fontSize: "clamp(2.5rem,8vw,6rem)" }}>
                  <span style={{ color: "#e8f4ff" }}>РЫНОК</span>
                  <br />
                  <span className="neon-text">ЦИФРОВЫХ</span>
                  <br />
                  <span style={{ color: "#e8f4ff" }}>ПРОДУКТОВ</span>
                </h1>
                <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(180,200,220,0.6)", lineHeight: 1.7 }}>
                  Покупай и продавай документы, презентации, шаблоны и дизайн-файлы. Мгновенная доставка, честные цены.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button onClick={() => navigate("catalog")} className="neon-btn-solid px-8 py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-wider">
                    КАТАЛОГ →
                  </button>
                  <button onClick={() => navigate("upload")} className="neon-btn px-8 py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-wider">
                    ПРОДАТЬ
                  </button>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-4">
              <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
                {[["1200+","товаров"],["8500+","покупателей"],["98%","довольных"]].map(([val, label]) => (
                  <div key={label} className="text-center rounded-2xl p-6" style={{ background: "rgba(13,20,32,0.8)", border: "1px solid rgba(0,245,212,0.1)" }}>
                    <div className="font-orbitron font-black text-3xl neon-text mb-1">{val}</div>
                    <div className="text-sm" style={{ color: "rgba(180,200,220,0.5)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Popular products */}
            {products.length > 0 && (
              <section className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-orbitron font-bold text-xl" style={{ color: "#e8f4ff" }}>Популярное</h2>
                    <button onClick={() => navigate("catalog")} className="text-sm neon-text hover:underline">Смотреть все →</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.slice(0, 3).map((p) => (
                      <ProductCard key={p.id} product={p} viewMode="grid" isFavorite={favorites.includes(p.id)} isPurchased={isPurchased(p.id)}
                        onFavorite={toggleFavorite} onPreview={(pr) => setPreviewProduct(pr)} onOpen={(pr) => setSelectedProduct(pr)} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* CTA Banner */}
            <section className="py-12 px-4">
              <div className="max-w-4xl mx-auto rounded-3xl p-10 text-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,rgba(0,245,212,0.07),rgba(155,89,245,0.07))", border: "1px solid rgba(0,245,212,0.15)" }}>
                <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,245,212,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,0.02) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
                <div className="relative z-10">
                  <h2 className="font-orbitron font-black text-2xl mb-3" style={{ color: "#e8f4ff" }}>Начни продавать сегодня</h2>
                  <p className="mb-6" style={{ color: "rgba(180,200,220,0.5)" }}>Загружай свои файлы и получай доход. 90% с каждой продажи.</p>
                  <button onClick={() => user ? navigate("upload") : setAuthModal("register")} className="neon-btn-solid px-8 py-3 rounded-xl font-orbitron font-bold text-sm">
                    НАЧАТЬ ПРОДАВАТЬ →
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── CATALOG ── */}
        {page === "catalog" && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h1 className="font-orbitron font-bold text-2xl" style={{ color: "#e8f4ff" }}>Каталог</h1>
              <span className="tag-badge" style={{ background: "rgba(0,245,212,0.1)", color: "#00f5d4" }}>{filteredProducts.length} товаров</span>
              <div className="flex-1" />
              {/* Sort */}
              <div className="flex items-center gap-1 flex-wrap">
                {([["popular","Популярные"],["cheap","Дешевле"],["expensive","Дороже"],["rating","Рейтинг"],["newest","Новые"]] as [typeof sortBy, string][]).map(([s, l]) => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{ background: sortBy === s ? "rgba(0,245,212,0.15)" : "transparent", color: sortBy === s ? "#00f5d4" : "rgba(180,200,220,0.5)", border: `1px solid ${sortBy === s ? "rgba(0,245,212,0.3)" : "transparent"}` }}>
                    {l}
                  </button>
                ))}
              </div>
              {/* View mode */}
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "rgba(13,20,32,0.8)", border: "1px solid rgba(0,245,212,0.1)" }}>
                {(["grid","list"] as ViewMode[]).map((m) => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-all"
                    style={{ background: viewMode === m ? "rgba(0,245,212,0.15)" : "transparent", color: viewMode === m ? "#00f5d4" : "rgba(180,200,220,0.35)" }}>
                    <Icon name={m === "grid" ? "LayoutGrid" : "List"} size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(13,20,32,0.8)", border: "1px solid rgba(0,245,212,0.1)" }}>
              {/* Category row */}
              <div className="flex flex-wrap gap-2 mb-3">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: selectedCategory === cat ? (CATEGORY_COLORS[cat] || "rgba(0,245,212,0.15)") : "rgba(255,255,255,0.03)",
                      color: selectedCategory === cat ? (CATEGORY_TEXT[cat] || "#00f5d4") : "rgba(180,200,220,0.5)",
                      border: `1px solid ${selectedCategory === cat ? (CATEGORY_TEXT[cat] || "#00f5d4") + "40" : "rgba(255,255,255,0.06)"}`,
                    }}>
                    <Icon name={CATEGORY_ICONS[cat] || "File"} size={11} />
                    {cat}
                  </button>
                ))}
              </div>
              {/* Price row */}
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map(({ label, range }) => {
                  const active = priceRange[0] === range[0] && priceRange[1] === range[1];
                  return (
                    <button key={label} onClick={() => setPriceRange(range)}
                      className="px-3 py-1 rounded-lg text-xs transition-all"
                      style={{ background: active ? "rgba(155,89,245,0.15)" : "rgba(255,255,255,0.03)", color: active ? "#9b59f5" : "rgba(180,200,220,0.45)", border: `1px solid ${active ? "rgba(155,89,245,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products */}
            {loadingProducts ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(0,245,212,0.3)", borderTopColor: "#00f5d4" }} />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="SearchX" size={40} className="mx-auto mb-4" style={{ color: "rgba(0,245,212,0.2)" }} />
                <p className="font-orbitron text-lg mb-2" style={{ color: "rgba(180,200,220,0.4)" }}>Ничего не найдено</p>
                <button onClick={() => { setSearchQuery(""); setSelectedCategory("Все"); setPriceRange([0,10000]); }} className="neon-btn px-5 py-2 rounded-xl text-sm mt-2">
                  Сбросить фильтры
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode="grid" isFavorite={favorites.includes(p.id)} isPurchased={isPurchased(p.id)}
                    onFavorite={toggleFavorite} onPreview={(pr) => setPreviewProduct(pr)} onOpen={(pr) => setSelectedProduct(pr)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode="list" isFavorite={favorites.includes(p.id)} isPurchased={isPurchased(p.id)}
                    onFavorite={toggleFavorite} onPreview={(pr) => setPreviewProduct(pr)} onOpen={(pr) => setSelectedProduct(pr)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── UPLOAD ── */}
        {page === "upload" && (
          <UploadPage user={user} token={token} onAuthRequired={() => setAuthModal("login")} onSuccess={() => navigate("catalog")} />
        )}

        {/* ── PROFILE ── */}
        {page === "profile" && user && token && (
          <ProfilePage
            user={user}
            token={token}
            onLogout={handleLogout}
            onUpdateBalance={(b) => setUser((u) => u ? { ...u, balance: b } : u)}
            onOpenFile={(p) => setPreviewProduct(p)}
          />
        )}
        {page === "profile" && !user && (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <Icon name="User" size={48} className="mb-4" style={{ color: "rgba(0,245,212,0.2)" }} />
            <p className="font-orbitron text-lg mb-4" style={{ color: "rgba(180,200,220,0.5)" }}>Войди чтобы открыть профиль</p>
            <button onClick={() => setAuthModal("login")} className="neon-btn-solid px-6 py-2.5 rounded-xl font-orbitron font-bold text-sm">Войти</button>
          </div>
        )}
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: "rgba(7,11,18,0.97)", borderTop: "1px solid rgba(0,245,212,0.1)", backdropFilter: "blur(20px)" }}>
        {([["home","Home","Главная"],["catalog","LayoutGrid","Каталог"],["upload","Upload","Загрузка"],["profile","User","Профиль"]] as [Page,string,string][]).map(([p, icon, label]) => (
          <button key={p} onClick={() => navigate(p)} className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all"
            style={{ color: page === p ? "#00f5d4" : "rgba(180,200,220,0.35)" }}>
            <Icon name={icon} size={20} />
            <span className="text-[10px] font-orbitron">{label}</span>
          </button>
        ))}
      </nav>

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(7,11,18,0.9)", backdropFilter: "blur(16px)", zIndex: 60 }}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden" style={{ background: "rgba(10,16,26,0.99)", border: "1px solid rgba(0,245,212,0.15)", maxHeight: "92vh" }}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
              <span className="tag-badge" style={{ background: CATEGORY_COLORS[selectedProduct.category] || "rgba(0,245,212,0.1)", color: CATEGORY_TEXT[selectedProduct.category] || "#00f5d4" }}>{selectedProduct.category}</span>
              <button onClick={() => setSelectedProduct(null)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Icon name="X" size={14} style={{ color: "#e8f4ff" }} />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 60px)" }}>
              <div className="flex flex-col sm:flex-row gap-0">
                {/* Left: image */}
                <div className="sm:w-64 flex-shrink-0 p-5">
                  {selectedProduct.preview_url ? (
                    <img src={selectedProduct.preview_url} alt={selectedProduct.title} className="w-full rounded-xl object-cover" style={{ aspectRatio: "3/4" }} />
                  ) : (
                    <div className="w-full rounded-xl flex flex-col items-center justify-center gap-2" style={{ aspectRatio: "3/4", background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.1)" }}>
                      <Icon name={CATEGORY_ICONS[selectedProduct.category] || "File"} size={36} style={{ color: "rgba(0,245,212,0.3)" }} />
                      <span className="font-orbitron text-xs uppercase" style={{ color: "rgba(0,245,212,0.3)" }}>{selectedProduct.file_format}</span>
                    </div>
                  )}
                </div>
                {/* Right: info */}
                <div className="flex-1 p-5 pt-3 sm:pt-5">
                  <h2 className="font-orbitron font-bold text-xl mb-1" style={{ color: "#e8f4ff" }}>{selectedProduct.title}</h2>
                  <p className="text-sm mb-3" style={{ color: "rgba(180,200,220,0.45)" }}>Автор: {selectedProduct.author}</p>
                  <div className="flex items-center gap-3 mb-4">
                    <StarRating value={Math.round(selectedProduct.rating)} size={14} />
                    <span className="text-sm font-orbitron" style={{ color: "#f5b400" }}>{selectedProduct.rating.toFixed(1)}</span>
                    <span className="text-xs" style={{ color: "rgba(180,200,220,0.35)" }}>{selectedProduct.sales_count} продаж</span>
                  </div>
                  <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(180,200,220,0.6)" }}>{selectedProduct.description}</p>
                  <div className="font-orbitron font-black text-3xl neon-text mb-5">{selectedProduct.price.toLocaleString()} ₽</div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={() => setPreviewProduct(selectedProduct)} className="neon-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
                      <Icon name="Eye" size={14} />Предпросмотр
                    </button>
                    {isPurchased(selectedProduct.id) ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-orbitron font-bold" style={{ background: "rgba(0,245,212,0.08)", color: "#00f5d4", border: "1px solid rgba(0,245,212,0.2)" }}>
                        <Icon name="CheckCircle" size={14} />Куплено
                      </span>
                    ) : (
                      <button onClick={() => user ? setBuyModal(selectedProduct) : setAuthModal("login")} className="neon-btn-solid flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-orbitron font-bold">
                        <Icon name="ShoppingCart" size={14} />Купить
                      </button>
                    )}
                  </div>

                  {/* Reviews */}
                  {user && isPurchased(selectedProduct.id) && (
                    <div className="mb-5">
                      <ReviewForm productId={selectedProduct.id} token={token!} onSuccess={() => {
                        apiFetch(`${API_REVIEWS}/?product_id=${selectedProduct.id}`)
                          .then((d) => { if (Array.isArray(d)) setProductReviews(d); });
                      }} />
                    </div>
                  )}

                  <div>
                    <p className="font-orbitron text-xs tracking-widest mb-3" style={{ color: "rgba(0,245,212,0.4)" }}>ОТЗЫВЫ {productReviews.length > 0 ? `(${productReviews.length})` : ""}</p>
                    {loadingReviews ? (
                      <p className="text-xs" style={{ color: "rgba(180,200,220,0.3)" }}>Загрузка...</p>
                    ) : productReviews.length === 0 ? (
                      <p className="text-xs" style={{ color: "rgba(180,200,220,0.25)" }}>Пока нет отзывов</p>
                    ) : (
                      <div className="space-y-3">
                        {productReviews.map((r) => (
                          <div key={r.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium" style={{ color: "#e8f4ff" }}>{r.user_name}</span>
                              <div className="flex items-center gap-1">
                                <StarRating value={r.rating} size={11} />
                                <span className="text-xs ml-1" style={{ color: "rgba(180,200,220,0.35)" }}>{r.created_at?.slice(0,10)}</span>
                              </div>
                            </div>
                            {r.text && <p className="text-xs leading-relaxed" style={{ color: "rgba(180,200,220,0.55)" }}>{r.text}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FILE VIEWER ── */}
      {previewProduct && (
        <FileViewer
          product={previewProduct}
          isPurchased={isPurchased(previewProduct.id)}
          viewerName={user?.name}
          onClose={() => setPreviewProduct(null)}
          onBuy={() => { if (user) { setBuyModal(previewProduct); } else { setAuthModal("login"); } }}
        />
      )}

      {/* ── BUY MODAL ── */}
      {buyModal && (
        <BuyModal
          product={buyModal}
          token={token}
          onClose={() => setBuyModal(null)}
          onSuccess={(productId) => {
            setUser((u) => u ? { ...u, purchased: [...u.purchased, productId] } : u);
            setBuyModal(null);
          }}
        />
      )}

      {/* ── AUTH MODAL ── */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSwitch={(m) => setAuthModal(m)}
        />
      )}
    </div>
  );
}

// ── ProductCard ──
function ProductCard({ product, viewMode, isFavorite, isPurchased, onFavorite, onPreview, onOpen }: {
  product: Product; viewMode: ViewMode; isFavorite: boolean; isPurchased: boolean;
  onFavorite: (id: number) => void; onPreview: (p: Product) => void; onOpen: (p: Product) => void;
}) {
  const catColor = CATEGORY_COLORS[product.category] || "rgba(0,245,212,0.15)";
  const catText = CATEGORY_TEXT[product.category] || "#00f5d4";
  const catIcon = CATEGORY_ICONS[product.category] || "File";

  if (viewMode === "list") {
    return (
      <div className="flex rounded-xl overflow-hidden hover-scale transition-all"
        style={{ background: "rgba(13,20,32,0.85)", border: "1px solid rgba(0,245,212,0.09)" }}>
        {/* Left image */}
        <div className="flex-shrink-0 w-24 relative" style={{ background: "rgba(0,245,212,0.04)" }}>
          {product.preview_url ? (
            <img src={product.preview_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
              <Icon name={catIcon} size={22} style={{ color: catText, opacity: 0.5 }} />
              <span className="font-orbitron text-[9px] uppercase" style={{ color: catText, opacity: 0.4 }}>{product.file_format}</span>
            </div>
          )}
          {isPurchased && (
            <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(0,245,212,0.9)" }}>
              <Icon name="Check" size={9} style={{ color: "#070b12" }} />
            </div>
          )}
        </div>
        {/* Middle info */}
        <div className="flex-1 px-4 py-3 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="tag-badge" style={{ background: catColor, color: catText }}>{product.category}</span>
          </div>
          <h3 className="font-semibold text-sm truncate mb-0.5" style={{ color: "#e8f4ff" }}>{product.title}</h3>
          <p className="text-xs truncate mb-1.5" style={{ color: "rgba(180,200,220,0.4)" }}>{product.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "rgba(180,200,220,0.4)" }}>{product.author}</span>
            <span className="w-px h-3" style={{ background: "rgba(255,255,255,0.1)" }} />
            <StarRating value={Math.round(product.rating)} size={10} />
            <span className="text-xs font-orbitron" style={{ color: "#f5b400" }}>{product.rating.toFixed(1)}</span>
            <span className="text-xs" style={{ color: "rgba(180,200,220,0.3)" }}>{product.sales_count} продаж</span>
          </div>
        </div>
        {/* Right: price + actions */}
        <div className="flex-shrink-0 flex flex-col items-end justify-between p-3 gap-2">
          <div className="font-orbitron font-black text-lg neon-text">{product.price.toLocaleString()} ₽</div>
          <div className="flex flex-col gap-1.5">
            <button onClick={() => onPreview(product)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all neon-btn">
              <Icon name="Eye" size={11} />Предпросмотр
            </button>
            <button onClick={() => onOpen(product)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold neon-btn-solid">
              <Icon name="Info" size={11} />Подробнее
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid mode
  return (
    <div className="rounded-2xl overflow-hidden hover-scale transition-all flex flex-col"
      style={{ background: "rgba(13,20,32,0.85)", border: "1px solid rgba(0,245,212,0.09)" }}>
      {/* Image */}
      <div className="relative" style={{ paddingTop: "66%", background: "rgba(0,245,212,0.03)" }}>
        <div className="absolute inset-0">
          {product.preview_url ? (
            <img src={product.preview_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Icon name={catIcon} size={36} style={{ color: catText, opacity: 0.35 }} />
              <span className="font-orbitron text-xs uppercase" style={{ color: catText, opacity: 0.3 }}>{product.file_format || "FILE"}</span>
            </div>
          )}
        </div>
        {/* Favorite */}
        <button onClick={() => onFavorite(product.id)}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(7,11,18,0.7)", backdropFilter: "blur(6px)" }}>
          <Icon name="Heart" size={13} style={{ color: isFavorite ? "#f500c8" : "rgba(255,255,255,0.4)", fill: isFavorite ? "#f500c8" : "transparent" }} />
        </button>
        {isPurchased && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(0,245,212,0.9)" }}>
            <Icon name="Check" size={9} style={{ color: "#070b12" }} />
            <span className="text-[9px] font-orbitron font-bold" style={{ color: "#070b12" }}>КУПЛЕНО</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="tag-badge" style={{ background: catColor, color: catText }}>{product.category}</span>
          <div className="flex items-center gap-1">
            <Icon name="Star" size={10} style={{ color: "#f5b400", fill: "#f5b400" }} />
            <span className="text-xs font-orbitron" style={{ color: "#f5b400" }}>{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2" style={{ color: "#e8f4ff" }}>{product.title}</h3>
        <p className="text-xs mb-3" style={{ color: "rgba(180,200,220,0.4)" }}>{product.author} · {product.sales_count} продаж</p>
        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="font-orbitron font-black text-lg neon-text">{product.price.toLocaleString()} ₽</span>
          <div className="flex gap-1.5">
            <button onClick={() => onPreview(product)} title="Предпросмотр"
              className="w-7 h-7 rounded-lg flex items-center justify-center neon-btn transition-all">
              <Icon name="Eye" size={13} />
            </button>
            <button onClick={() => onOpen(product)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold neon-btn-solid">
              <Icon name="Info" size={11} />Подробнее
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── UploadPage ──
const CONTENT_TYPES = [
  { id: "file",  label: "Файл",        icon: "Upload",   hint: "PDF, DOCX, PPTX, XLSX, ZIP, RAR, PSD, AI, MP4, MP3, любой файл до 100 МБ" },
  { id: "image", label: "Фото/Арт",    icon: "Image",    hint: "JPG, PNG, GIF, WEBP, SVG — готовые изображения, арт, фото" },
  { id: "link",  label: "Ссылка",      icon: "Link",     hint: "Ссылка на Google Drive, Figma, Notion, репозиторий и т.д." },
  { id: "bot",   label: "Бот/Сервис",  icon: "Bot",      hint: "Telegram-бот, API-ключ, доступ к сервису — покупатель получит ссылку/ключ" },
];

function UploadPage({ user, token, onAuthRequired, onSuccess }: {
  user: User | null; token: string | null; onAuthRequired: () => void; onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Документы");
  const [price, setPrice] = useState("");
  const [contentType, setContentType] = useState("file");
  const [fileUrl, setFileUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileFormat, setFileFormat] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [previewThumb, setPreviewThumb] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLInputElement>(null);

  if (!user || !token) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <Icon name="Upload" size={48} className="mb-4" style={{ color: "rgba(0,245,212,0.2)" }} />
        <p className="font-orbitron text-lg mb-4" style={{ color: "rgba(180,200,220,0.5)" }}>Войди чтобы загружать файлы</p>
        <button onClick={onAuthRequired} className="neon-btn-solid px-6 py-2.5 rounded-xl font-orbitron font-bold text-sm">Войти</button>
      </div>
    );
  }

  const readAsBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result as string; resolve(r.split(",")[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    const b64 = await readAsBase64(file);
    const res = await apiFetch(`${API_PRODUCTS}/upload`, {
      method: "POST",
      body: JSON.stringify({ file_data: b64, file_name: file.name, content_type: file.type || "application/octet-stream", upload_type: "file" }),
    }, token);
    setUploading(false);
    if (res.error) { setError(res.error); return; }
    setFileUrl(res.url || "");
    setFileName(file.name);
    setFileFormat(res.format || file.name.split(".").pop() || "");
  };

  const handlePreviewSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPreview(true); setError("");
    const b64 = await readAsBase64(file);
    const res = await apiFetch(`${API_PRODUCTS}/upload`, {
      method: "POST",
      body: JSON.stringify({ file_data: b64, file_name: file.name, content_type: file.type, upload_type: "preview" }),
    }, token);
    setUploadingPreview(false);
    if (res.error) { setError(res.error); return; }
    setPreviewUrl(res.url || "");
    setPreviewThumb(res.url || "");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price || parseInt(price) <= 0) { setError("Заполни название и цену"); return; }
    const finalFileUrl = (contentType === "link" || contentType === "bot") ? linkUrl : fileUrl;
    if (!finalFileUrl) { setError(contentType === "link" || contentType === "bot" ? "Укажи ссылку" : "Загрузи файл"); return; }
    setSubmitting(true); setError("");
    const res = await apiFetch(`${API_PRODUCTS}/`, {
      method: "POST",
      body: JSON.stringify({ title, description, category, price: parseInt(price), file_url: finalFileUrl, preview_url: previewUrl, file_name: fileName || title, file_format: contentType === "link" ? "link" : contentType === "bot" ? "bot" : fileFormat }),
    }, token);
    setSubmitting(false);
    if (res.error) { setError(res.error); return; }
    onSuccess();
  };

  const ct = CONTENT_TYPES.find(c => c.id === contentType)!;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="font-orbitron font-bold text-2xl mb-2" style={{ color: "#e8f4ff" }}>Загрузить продукт</h1>
      <p className="text-sm mb-8" style={{ color: "rgba(180,200,220,0.45)" }}>Продавай файлы, фото, ссылки, доступы к ботам и сервисам</p>

      <div className="space-y-5">
        {/* Content type selector */}
        <div>
          <label className="text-xs font-orbitron tracking-widest mb-2 block" style={{ color: "#00f5d4" }}>ТИП КОНТЕНТА *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONTENT_TYPES.map((ct) => (
              <button key={ct.id} type="button" onClick={() => { setContentType(ct.id); setFileUrl(""); setLinkUrl(""); setFileName(""); setFileFormat(""); }}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all"
                style={{ background: contentType === ct.id ? "rgba(0,245,212,0.1)" : "rgba(13,20,32,0.7)", border: `1px solid ${contentType === ct.id ? "rgba(0,245,212,0.4)" : "rgba(0,245,212,0.08)"}`, color: contentType === ct.id ? "#00f5d4" : "rgba(180,200,220,0.45)" }}>
                <Icon name={ct.icon} size={20} />
                <span className="text-xs font-orbitron">{ct.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs mt-1.5" style={{ color: "rgba(180,200,220,0.3)" }}>{ct.hint}</p>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-orbitron tracking-widest mb-1.5 block" style={{ color: "#00f5d4" }}>НАЗВАНИЕ *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название продукта"
            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
            style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.18)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
        </div>

        {/* Category + Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-orbitron tracking-widest mb-1.5 block" style={{ color: "#00f5d4" }}>КАТЕГОРИЯ *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.18)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }}>
              {CATEGORIES.filter((c) => c !== "Все").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-orbitron tracking-widest mb-1.5 block" style={{ color: "#00f5d4" }}>ЦЕНА ₽ *</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="990" type="number" min="1"
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.18)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-orbitron tracking-widest mb-1.5 block" style={{ color: "#00f5d4" }}>ОПИСАНИЕ</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опиши свой продукт — что получит покупатель..." rows={4}
            className="w-full px-4 py-3 rounded-xl outline-none resize-none text-sm"
            style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.18)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
        </div>

        {/* File OR Link upload */}
        {(contentType === "link" || contentType === "bot") ? (
          <div>
            <label className="text-xs font-orbitron tracking-widest mb-1.5 block" style={{ color: "#00f5d4" }}>
              {contentType === "bot" ? "ССЫЛКА / КЛЮЧ ДОСТУПА *" : "ССЫЛКА *"}
            </label>
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={contentType === "bot" ? "https://t.me/YourBot или API-ключ" : "https://drive.google.com/... или https://..."}
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.18)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
            <p className="text-xs mt-1.5" style={{ color: "rgba(180,200,220,0.3)" }}>
              {contentType === "bot" ? "Покупатель увидит эту ссылку/ключ после оплаты" : "Покупатель получит доступ по этой ссылке после оплаты"}
            </p>
          </div>
        ) : (
          <div>
            <label className="text-xs font-orbitron tracking-widest mb-1.5 block" style={{ color: "#00f5d4" }}>ФАЙЛ *</label>
            <input ref={fileRef} type="file" className="hidden"
              accept="*/*"
              onChange={handleFileSelect} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl py-8 flex flex-col items-center justify-center gap-3 transition-all"
              style={{ border: `2px dashed ${fileUrl ? "rgba(0,245,212,0.4)" : "rgba(0,245,212,0.15)"}`, background: fileUrl ? "rgba(0,245,212,0.04)" : "rgba(13,20,32,0.5)", color: "#e8f4ff" }}>
              {uploading ? (
                <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(0,245,212,0.3)", borderTopColor: "#00f5d4" }} />
              ) : fileUrl ? (
                <>
                  <Icon name="CheckCircle" size={28} style={{ color: "#00f5d4" }} />
                  <div className="text-center">
                    <p className="text-sm font-semibold neon-text">{fileName}</p>
                    <p className="text-xs uppercase font-orbitron mt-0.5" style={{ color: "rgba(0,245,212,0.5)" }}>{fileFormat}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(180,200,220,0.3)" }}>Нажми чтобы заменить</p>
                  </div>
                </>
              ) : (
                <>
                  <Icon name="Upload" size={28} style={{ color: "rgba(0,245,212,0.3)" }} />
                  <div className="text-center">
                    <p className="text-sm" style={{ color: "rgba(180,200,220,0.5)" }}>Нажми для выбора файла</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(180,200,220,0.3)" }}>
                      {contentType === "image"
                        ? "JPG, PNG, GIF, WEBP, SVG, PSD, AI и другие · до 100 МБ"
                        : "PDF, DOCX, PPTX, XLSX, ZIP, RAR, MP4, MP3, любой формат · до 100 МБ"}
                    </p>
                  </div>
                </>
              )}
            </button>
          </div>
        )}

        {/* Preview upload */}
        <div>
          <label className="text-xs font-orbitron tracking-widest mb-1.5 block" style={{ color: "#9b59f5" }}>
            ПРЕВЬЮ-ИЗОБРАЖЕНИЕ <span style={{ color: "rgba(180,200,220,0.35)", fontSize: 9 }}>НЕОБЯЗАТЕЛЬНО</span>
          </label>
          <input ref={previewRef} type="file" accept="image/*" className="hidden" onChange={handlePreviewSelect} />
          <button type="button" onClick={() => previewRef.current?.click()}
            className="w-full rounded-xl py-5 flex flex-col items-center justify-center gap-2 transition-all"
            style={{ border: `2px dashed ${previewUrl ? "rgba(155,89,245,0.4)" : "rgba(155,89,245,0.12)"}`, background: previewUrl ? "rgba(155,89,245,0.04)" : "rgba(13,20,32,0.5)" }}>
            {uploadingPreview ? (
              <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(155,89,245,0.3)", borderTopColor: "#9b59f5" }} />
            ) : previewThumb ? (
              <div className="flex items-center gap-4">
                <img src={previewThumb} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: "#9b59f5" }}>Превью загружено</p>
                  <p className="text-xs" style={{ color: "rgba(180,200,220,0.4)" }}>Нажми чтобы заменить</p>
                </div>
              </div>
            ) : (
              <>
                <Icon name="Image" size={22} style={{ color: "rgba(155,89,245,0.35)" }} />
                <p className="text-xs" style={{ color: "rgba(180,200,220,0.4)" }}>Загрузить изображение-обложку</p>
              </>
            )}
          </button>
          <p className="text-xs mt-1.5" style={{ color: "rgba(180,200,220,0.3)" }}>Необязательно — без превью используется первая страница файла</p>
        </div>

        {error && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#f55050", background: "rgba(245,80,80,0.08)", border: "1px solid rgba(245,80,80,0.15)" }}>{error}</p>}
        <button onClick={handleSubmit} disabled={submitting || uploading}
          className="w-full neon-btn-solid py-3.5 rounded-xl font-orbitron font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? "Публикация..." : "Опубликовать продукт →"}
        </button>
      </div>
    </div>
  );
}

// ── ProfilePage ──
function ProfilePage({ user, token, onLogout, onUpdateBalance, onOpenFile }: {
  user: User; token: string; onLogout: () => void; onUpdateBalance: (b: number) => void; onOpenFile: (p: Product) => void;
}) {
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<number[]>([]);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  useEffect(() => {
    setLoadingPurchases(true);
    apiFetch(`${API_PURCHASES}/`, {}, token)
      .then((data) => { if (Array.isArray(data)) setPurchases(data); })
      .catch(() => {})
      .finally(() => setLoadingPurchases(false));
  }, [token]);

  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      {/* User card */}
      <div className="rounded-2xl p-6 mb-6 flex flex-wrap items-center gap-5"
        style={{ background: "rgba(13,20,32,0.85)", border: "1px solid rgba(0,245,212,0.12)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-orbitron font-black text-2xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#00f5d4,#9b59f5)", color: "#070b12" }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-orbitron font-bold text-xl truncate" style={{ color: "#e8f4ff" }}>{user.name}</h2>
          <p className="text-sm truncate" style={{ color: "rgba(180,200,220,0.45)" }}>{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl px-5 py-3 text-center" style={{ background: "rgba(0,245,212,0.07)", border: "1px solid rgba(0,245,212,0.15)" }}>
            <div className="font-orbitron font-black text-xl neon-text">{user.purchased.length}</div>
            <div className="text-xs" style={{ color: "rgba(180,200,220,0.4)" }}>покупок</div>
          </div>
          <div className="rounded-xl px-5 py-3 text-center" style={{ background: "rgba(155,89,245,0.07)", border: "1px solid rgba(155,89,245,0.15)" }}>
            <div className="font-orbitron font-black text-xl" style={{ color: "#9b59f5" }}>{user.balance.toLocaleString()} ₽</div>
            <div className="text-xs" style={{ color: "rgba(180,200,220,0.4)" }}>баланс</div>
          </div>
        </div>
      </div>

      {/* Balance + withdraw */}
      {user.balance > 0 && (
        <div className="rounded-2xl p-5 mb-6 flex items-center justify-between"
          style={{ background: "rgba(155,89,245,0.06)", border: "1px solid rgba(155,89,245,0.15)" }}>
          <div>
            <p className="font-orbitron font-bold text-lg" style={{ color: "#9b59f5" }}>{user.balance.toLocaleString()} ₽ на балансе</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(180,200,220,0.4)" }}>Комиссия вывода 10%</p>
          </div>
          <button onClick={() => setShowWithdraw(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-orbitron font-bold text-sm transition-all"
            style={{ background: "rgba(155,89,245,0.15)", border: "1px solid rgba(155,89,245,0.3)", color: "#9b59f5" }}>
            <Icon name="ArrowDownToLine" size={14} />Вывести
          </button>
        </div>
      )}

      {/* Purchases */}
      <h3 className="font-orbitron font-bold text-base mb-4" style={{ color: "#e8f4ff" }}>Мои покупки</h3>
      {loadingPurchases ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(0,245,212,0.2)", borderTopColor: "#00f5d4" }} />
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(13,20,32,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <Icon name="ShoppingBag" size={36} className="mx-auto mb-3" style={{ color: "rgba(0,245,212,0.15)" }} />
          <p className="text-sm" style={{ color: "rgba(180,200,220,0.35)" }}>Ты ещё ничего не купил</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((item) => (
            <div key={item.id} className="rounded-xl overflow-hidden flex" style={{ background: "rgba(13,20,32,0.85)", border: "1px solid rgba(0,245,212,0.08)" }}>
              <div className="w-20 flex-shrink-0" style={{ background: "rgba(0,245,212,0.04)" }}>
                {item.preview_url ? (
                  <img src={item.preview_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name={CATEGORY_ICONS[item.category] || "File"} size={22} style={{ color: CATEGORY_TEXT[item.category] || "#00f5d4", opacity: 0.35 }} />
                  </div>
                )}
              </div>
              <div className="flex-1 px-4 py-3 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="tag-badge" style={{ background: CATEGORY_COLORS[item.category] || "rgba(0,245,212,0.1)", color: CATEGORY_TEXT[item.category] || "#00f5d4" }}>{item.category}</span>
                </div>
                <h4 className="font-semibold text-sm truncate" style={{ color: "#e8f4ff" }}>{item.title}</h4>
                <p className="text-xs" style={{ color: "rgba(180,200,220,0.35)" }}>{item.price?.toLocaleString()} ₽ · {item.purchased_at?.slice(0,10)}</p>
              </div>
              <div className="flex flex-col gap-1.5 p-3 justify-center flex-shrink-0">
                <button onClick={() => onOpenFile(item as Product)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold neon-btn-solid">
                  <Icon name="Eye" size={11} />Открыть
                </button>
                {!reviewedIds.includes(item.id) && (
                  reviewingId === item.id ? (
                    <div className="p-2 rounded-xl" style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.12)" }}>
                      <ReviewForm productId={item.id} token={token} onSuccess={() => { setReviewedIds((p) => [...p, item.id]); setReviewingId(null); }} />
                    </div>
                  ) : (
                    <button onClick={() => setReviewingId(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs neon-btn">
                      <Icon name="Star" size={11} />Отзыв
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logout */}
      <div className="mt-8">
        <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all"
          style={{ background: "rgba(245,80,80,0.07)", border: "1px solid rgba(245,80,80,0.15)", color: "#f55050" }}>
          <Icon name="LogOut" size={14} />Выйти
        </button>
      </div>

      {/* Withdraw modal */}
      {showWithdraw && (
        <WithdrawModal
          user={user}
          token={token}
          onClose={() => setShowWithdraw(false)}
          onSuccess={(newBalance) => { onUpdateBalance(newBalance); setShowWithdraw(false); }}
        />
      )}
    </div>
  );
}