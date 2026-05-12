import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/1e8b6658-dc0a-4ff0-8338-4fa5fe87361e/files/379f0cef-a9e7-4536-9c5d-cb8f0eaa6df3.jpg";
const IMG1 = "https://cdn.poehali.dev/projects/1e8b6658-dc0a-4ff0-8338-4fa5fe87361e/files/a1265ccf-1dec-4ed6-83d4-414ac0cf6e16.jpg";
const IMG2 = "https://cdn.poehali.dev/projects/1e8b6658-dc0a-4ff0-8338-4fa5fe87361e/files/a91b2eec-6ef3-4326-8db5-efba74d81045.jpg";

type Product = {
  id: number;
  title: string;
  author: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  sales: number;
  description: string;
};

type Review = {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  text: string;
  date: string;
};

type User = {
  name: string;
  email: string;
  purchased: number[];
};

const PRODUCTS: Product[] = [
  { id: 1, title: "Бизнес-план 2025", author: "Алексей М.", price: 990, category: "Документы", image: IMG2, rating: 4.9, sales: 312, description: "Профессиональный шаблон бизнес-плана для стартапа с финансовыми таблицами и стратегией" },
  { id: 2, title: "Pitch Deck: Инвестиции", author: "Мария К.", price: 1490, category: "Презентации", image: IMG1, rating: 4.8, sales: 189, description: "30 слайдов для привлечения инвестиций, протестировано на 50+ питчах" },
  { id: 3, title: "Финансовая модель", author: "Дмитрий В.", price: 2990, category: "Таблицы", image: IMG2, rating: 5.0, sales: 97, description: "Excel-модель для расчёта юнит-экономики и прогнозирования выручки" },
  { id: 4, title: "Контент-план на 3 мес.", author: "Ольга Р.", price: 590, category: "Документы", image: IMG1, rating: 4.7, sales: 441, description: "Готовый контент-план для соцсетей с темами и рубриками на 90 дней" },
  { id: 5, title: "UI Kit: Cyberpunk Style", author: "Тимур Н.", price: 3490, category: "Дизайн", image: IMG2, rating: 4.9, sales: 76, description: "200+ компонентов Figma в кибер-стиле, тёмная и светлая темы" },
  { id: 6, title: "HR-политика компании", author: "Анна С.", price: 1290, category: "Документы", image: IMG1, rating: 4.6, sales: 203, description: "Полный пакет HR-документов: оффер, онбординг, правила, KPI-система" },
];

const INITIAL_REVIEWS: Review[] = [
  { id: 1, productId: 1, userName: "Игорь Т.", rating: 5, text: "Отличный шаблон, сэкономил кучу времени!", date: "2025-04-10" },
  { id: 2, productId: 1, userName: "Светлана К.", rating: 4, text: "Хороший документ, всё по делу.", date: "2025-03-22" },
  { id: 3, productId: 2, userName: "Андрей М.", rating: 5, text: "Питч-дек сразу понравился инвесторам.", date: "2025-04-05" },
];

const CATEGORIES = ["Все", "Документы", "Презентации", "Таблицы", "Дизайн"];
type Page = "home" | "catalog" | "upload" | "profile";

const CATEGORY_COLORS: Record<string, string> = {
  "Документы": "rgba(0,245,212,0.15)",
  "Презентации": "rgba(155,89,245,0.15)",
  "Таблицы": "rgba(0,200,255,0.15)",
  "Дизайн": "rgba(245,0,200,0.15)",
};
const CATEGORY_TEXT: Record<string, string> = {
  "Документы": "#00f5d4",
  "Презентации": "#9b59f5",
  "Таблицы": "#00c8ff",
  "Дизайн": "#f500c8",
};

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<"popular" | "cheap" | "expensive" | "rating">("popular");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [reviewModal, setReviewModal] = useState<Product | null>(null);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchCat = selectedCategory === "Все" || p.category === selectedCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchCat && matchSearch && matchPrice;
  }).sort((a, b) => {
    if (sortBy === "cheap") return a.price - b.price;
    if (sortBy === "expensive") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.sales - a.sales;
  });

  const favoriteProducts = PRODUCTS.filter(p => favorites.includes(p.id));
  const purchasedProducts = user ? PRODUCTS.filter(p => user.purchased.includes(p.id)) : [];

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = (email: string, password: string) => {
    const stored = localStorage.getItem("nexus_users");
    const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser({ name: found.name, email: found.email, purchased: found.purchased });
      setAuthModal(null);
    } else {
      alert("Неверный email или пароль");
    }
  };

  const handleRegister = (name: string, email: string, password: string) => {
    const stored = localStorage.getItem("nexus_users");
    const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
    if (users.find(u => u.email === email)) {
      alert("Этот email уже зарегистрирован");
      return;
    }
    const newUser = { name, email, password, purchased: [] };
    users.push(newUser);
    localStorage.setItem("nexus_users", JSON.stringify(users));
    setUser({ name, email, purchased: [] });
    setAuthModal(null);
  };

  const handleLogout = () => {
    setUser(null);
    navigate("home");
  };

  const handleBuy = (product: Product) => {
    if (!user) { setAuthModal("login"); setSelectedProduct(null); return; }
    if (!user.purchased.includes(product.id)) {
      const updated = { ...user, purchased: [...user.purchased, product.id] };
      setUser(updated);
      const stored = localStorage.getItem("nexus_users");
      const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
      const idx = users.findIndex(u => u.email === user.email);
      if (idx !== -1) { users[idx].purchased = updated.purchased; localStorage.setItem("nexus_users", JSON.stringify(users)); }
    }
    setSelectedProduct(null);
  };

  const addReview = (productId: number, rating: number, text: string) => {
    if (!user) return;
    const newReview: Review = {
      id: Date.now(), productId, userName: user.name, rating, text,
      date: new Date().toISOString().slice(0, 10),
    };
    setReviews(prev => [...prev, newReview]);
    setReviewModal(null);
  };

  const productRating = (productId: number) => {
    const pr = reviews.filter(r => r.productId === productId);
    if (!pr.length) return PRODUCTS.find(p => p.id === productId)?.rating || 0;
    return +(pr.reduce((a, r) => a + r.rating, 0) / pr.length).toFixed(1);
  };

  return (
    <div className="min-h-screen grid-bg" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3"
        style={{ background: "rgba(7,11,18,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
        <div className="flex items-center gap-3">

          {/* Logo */}
          <button onClick={() => navigate("home")} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #00f5d4, #9b59f5)" }}>
              <span className="font-orbitron font-black text-xs" style={{ color: "#070b12" }}>NX</span>
            </div>
            <span className="font-orbitron font-bold text-base tracking-wider neon-text hidden sm:block">NEXUS</span>
          </button>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-shrink-0">
            {(["home", "catalog", "upload"] as Page[]).map((p) => {
              const labels: Record<string, string> = { home: "Главная", catalog: "Каталог", upload: "Загрузка" };
              const icons: Record<string, string> = { home: "Home", catalog: "LayoutGrid", upload: "Upload" };
              return (
                <button key={p} onClick={() => navigate(p)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: page === p ? "#00f5d4" : "rgba(180,200,220,0.65)",
                    background: page === p ? "rgba(0,245,212,0.08)" : "transparent",
                    border: page === p ? "1px solid rgba(0,245,212,0.18)" : "1px solid transparent",
                  }}>
                  <Icon name={icons[p]} size={14} />
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* Search — center, always visible */}
          <div className="flex-1 flex justify-center px-2">
            <div className="relative w-full max-w-sm">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#00f5d4" }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(13,20,32,0.95)",
                  border: searchQuery ? "1px solid rgba(0,245,212,0.45)" : "1px solid rgba(0,245,212,0.18)",
                  color: "#e8f4ff",
                  fontFamily: "'Golos Text', sans-serif",
                  boxShadow: searchQuery ? "0 0 20px rgba(0,245,212,0.12), inset 0 0 10px rgba(0,245,212,0.03)" : "none",
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Icon name="X" size={13} style={{ color: "rgba(180,200,220,0.5)" }} />
                </button>
              )}
            </div>
          </div>

          {/* Auth + Profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <button onClick={() => navigate("profile")} className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.25), rgba(155,89,245,0.25))", border: "1px solid rgba(0,245,212,0.35)" }}>
                  <span className="font-orbitron font-bold text-xs neon-text">{user.name.slice(0, 2).toUpperCase()}</span>
                </div>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    style={{ background: "#f500c8", color: "white", fontSize: "8px" }}>{favorites.length}</span>
                )}
              </button>
            ) : (
              <>
                <button onClick={() => setAuthModal("login")}
                  className="hidden sm:flex px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                  style={{ color: "rgba(180,200,220,0.7)", border: "1px solid rgba(0,245,212,0.15)" }}>
                  Войти
                </button>
                <button onClick={() => setAuthModal("register")}
                  className="neon-btn-solid px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3"
        style={{ background: "rgba(7,11,18,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,245,212,0.1)" }}>
        {(["home", "catalog", "upload", "profile"] as Page[]).map((p) => {
          const icons: Record<string, string> = { home: "Home", catalog: "LayoutGrid", upload: "Upload", profile: "User" };
          const labels: Record<string, string> = { home: "Главная", catalog: "Каталог", upload: "Загрузить", profile: "Профиль" };
          return (
            <button key={p} onClick={() => p === "profile" && !user ? setAuthModal("login") : navigate(p as Page)}
              className="flex flex-col items-center gap-1 p-2 transition-all relative"
              style={{ color: page === p ? "#00f5d4" : "rgba(180,200,220,0.35)" }}>
              <Icon name={icons[p]} size={20} />
              {p === "profile" && favorites.length > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ background: "#f500c8", fontSize: "7px", color: "white", fontWeight: "bold" }}>{favorites.length}</span>
              )}
              <span style={{ fontSize: "9px", fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.04em" }}>{labels[p]}</span>
            </button>
          );
        })}
      </nav>

      {/* ── SEARCH RESULTS BANNER ── */}
      {searchQuery && (
        <div className="fixed top-16 left-0 right-0 z-40 px-6 py-2 flex items-center justify-between"
          style={{ background: "rgba(7,11,18,0.95)", borderBottom: "1px solid rgba(0,245,212,0.12)" }}>
          <span className="text-sm" style={{ color: "rgba(180,200,220,0.6)" }}>
            Поиск: <span style={{ color: "#00f5d4" }}>«{searchQuery}»</span> — найдено {filteredProducts.length}
          </span>
          <button onClick={() => setSearchQuery("")} className="text-xs neon-btn px-3 py-1 rounded-lg">очистить</button>
        </div>
      )}

      <main className={`pb-24 md:pb-8 ${searchQuery ? "pt-24" : "pt-16"}`}>

        {/* ── HOME ── */}
        {page === "home" && (
          <div className="animate-fade-in">
            <div className="relative overflow-hidden" style={{ minHeight: "82vh" }}>
              <div className="absolute inset-0">
                <img src={HERO_IMAGE} alt="hero" className="w-full h-full object-cover opacity-22" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,11,18,0.2) 0%, rgba(7,11,18,0.65) 60%, rgba(7,11,18,1) 100%)" }} />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-widest font-orbitron"
                  style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)", color: "#00f5d4" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  ЦИФРОВОЙ МАРКЕТПЛЕЙС
                </div>
                <h1 className="font-orbitron font-black mb-6" style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", lineHeight: 1.05 }}>
                  <span style={{ color: "#e8f4ff" }}>РЫНОК</span><br />
                  <span className="neon-text">ЦИФРОВЫХ</span><br />
                  <span style={{ color: "#e8f4ff" }}>ПРОДУКТОВ</span>
                </h1>
                <p className="text-lg mb-10 max-w-lg" style={{ color: "rgba(180,200,220,0.65)", lineHeight: 1.7 }}>
                  Покупай готовые презентации, документы и шаблоны — или продавай свои работы тысячам покупателей
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigate("catalog")} className="neon-btn-solid px-10 py-4 rounded-xl text-sm font-bold font-orbitron tracking-wider">КАТАЛОГ →</button>
                  <button onClick={() => user ? navigate("upload") : setAuthModal("register")} className="neon-btn px-10 py-4 rounded-xl text-sm font-bold font-orbitron tracking-wider">ПРОДАТЬ</button>
                </div>
                <div className="flex gap-12 mt-16">
                  {[["1 200+", "товаров"], ["8 500+", "покупателей"], ["98%", "довольных"]].map(([num, label]) => (
                    <div key={label} className="text-center">
                      <div className="font-orbitron font-black text-2xl neon-text">{num}</div>
                      <div className="text-xs mt-1" style={{ color: "rgba(180,200,220,0.45)", letterSpacing: "0.08em" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-10 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-7">
                <h2 className="font-orbitron font-bold text-xl" style={{ color: "#e8f4ff" }}>ПОПУЛЯРНОЕ <span className="neon-text">_</span></h2>
                <button onClick={() => navigate("catalog")} className="neon-btn px-4 py-2 rounded-lg text-sm">Всё →</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PRODUCTS.slice(0, 3).map((product, i) => (
                  <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)}
                    onFavorite={toggleFavorite} onOpen={setSelectedProduct} delay={i * 0.1}
                    rating={productRating(product.id)} />
                ))}
              </div>
            </div>

            <div className="px-6 pb-14 max-w-7xl mx-auto">
              <div className="rounded-2xl relative p-10 overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.06), rgba(155,89,245,0.08))", border: "1px solid rgba(0,245,212,0.12)" }}>
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(155,89,245,0.12), transparent)", transform: "translate(30%, -30%)" }} />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="font-orbitron font-bold text-2xl mb-2" style={{ color: "#e8f4ff" }}>Начни продавать сегодня</h3>
                    <p style={{ color: "rgba(180,200,220,0.55)" }}>Загрузи свои работы и получай пассивный доход</p>
                  </div>
                  <button onClick={() => user ? navigate("upload") : setAuthModal("register")}
                    className="neon-btn-solid px-8 py-4 rounded-xl font-orbitron font-bold tracking-wide whitespace-nowrap text-sm">
                    ЗАГРУЗИТЬ ТОВАР
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CATALOG ── */}
        {page === "catalog" && (
          <div className="px-6 py-8 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-orbitron font-bold text-2xl mb-1" style={{ color: "#e8f4ff" }}>КАТАЛОГ <span className="neon-text">_</span></h1>
                <p style={{ color: "rgba(180,200,220,0.45)" }}>{filteredProducts.length} товаров</p>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-orbitron tracking-widest" style={{ color: "rgba(180,200,220,0.35)" }}>СОРТ:</span>
                {([
                  ["popular", "Популярные"],
                  ["cheap", "Дешевле"],
                  ["expensive", "Дороже"],
                  ["rating", "Рейтинг"],
                ] as [typeof sortBy, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      color: sortBy === val ? "#070b12" : "rgba(180,200,220,0.55)",
                      background: sortBy === val ? "#00f5d4" : "rgba(0,245,212,0.05)",
                      border: sortBy === val ? "none" : "1px solid rgba(0,245,212,0.12)",
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters row */}
            <div className="rounded-2xl p-5 mb-7 flex flex-wrap gap-6 items-start"
              style={{ background: "rgba(13,20,32,0.7)", border: "1px solid rgba(0,245,212,0.1)" }}>

              {/* Type filter */}
              <div className="flex-1 min-w-fit">
                <p className="text-xs font-orbitron tracking-widest mb-3" style={{ color: "rgba(0,245,212,0.6)" }}>ТИП ФАЙЛА</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "Все", icon: "LayoutGrid" },
                    { label: "Документы", icon: "FileText" },
                    { label: "Презентации", icon: "Presentation" },
                    { label: "Таблицы", icon: "Table" },
                    { label: "Дизайн", icon: "Palette" },
                  ].map(({ label, icon }) => (
                    <button key={label} onClick={() => setSelectedCategory(label)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        color: selectedCategory === label ? "#070b12" : CATEGORY_TEXT[label] || "#00f5d4",
                        background: selectedCategory === label
                          ? (CATEGORY_TEXT[label] || "#00f5d4")
                          : (CATEGORY_COLORS[label] || "rgba(0,245,212,0.07)"),
                        border: selectedCategory === label ? "none" : `1px solid ${CATEGORY_TEXT[label] || "#00f5d4"}30`,
                      }}>
                      <Icon name={icon} size={13} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="min-w-48">
                <p className="text-xs font-orbitron tracking-widest mb-3" style={{ color: "rgba(0,245,212,0.6)" }}>ЦЕНА</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    [0, 10000, "Любая"],
                    [0, 500, "до 500 ₽"],
                    [500, 1500, "500–1500 ₽"],
                    [1500, 3500, "1500–3500 ₽"],
                    [3500, 10000, "от 3500 ₽"],
                  ].map(([min, max, label]) => {
                    const active = priceRange[0] === min && priceRange[1] === max;
                    return (
                      <button key={String(label)} onClick={() => setPriceRange([min as number, max as number])}
                        className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                          color: active ? "#070b12" : "rgba(155,89,245,0.9)",
                          background: active ? "#9b59f5" : "rgba(155,89,245,0.07)",
                          border: active ? "none" : "1px solid rgba(155,89,245,0.2)",
                        }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)}
                  onFavorite={toggleFavorite} onOpen={setSelectedProduct} delay={i * 0.07}
                  rating={productRating(product.id)} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-24">
                <Icon name="PackageSearch" size={48} style={{ color: "rgba(0,245,212,0.25)", margin: "0 auto 16px" }} />
                <p className="font-orbitron mb-4" style={{ color: "rgba(180,200,220,0.35)" }}>Ничего не найдено</p>
                <button onClick={() => { setSelectedCategory("Все"); setPriceRange([0, 10000]); setSearchQuery(""); }}
                  className="neon-btn px-5 py-2 rounded-lg text-sm">Сбросить фильтры</button>
              </div>
            )}
          </div>
        )}

        {/* ── UPLOAD ── */}
        {page === "upload" && (
          <div className="px-6 py-8 max-w-2xl mx-auto animate-fade-in">
            <h1 className="font-orbitron font-bold text-2xl mb-2" style={{ color: "#e8f4ff" }}>ЗАГРУЗИТЬ ТОВАР <span className="neon-text">_</span></h1>
            <p className="mb-8" style={{ color: "rgba(180,200,220,0.45)" }}>Заполни информацию о своём цифровом продукте</p>
            <div className="space-y-5">
              <UploadField label="НАЗВАНИЕ" placeholder="Например: Бизнес-план для стартапа 2025" />
              <div>
                <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>КАТЕГОРИЯ</label>
                <select className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text', sans-serif" }}>
                  <option value="">Выбери категорию</option>
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>ОПИСАНИЕ</label>
                <textarea rows={4} placeholder="Опиши продукт: что внутри, кому подойдёт, в чём уникальность"
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text', sans-serif" }} />
              </div>
              <PriceField />
              <div>
                <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>ФАЙЛ</label>
                <div className="rounded-xl p-8 text-center cursor-pointer hover-scale"
                  style={{ background: "rgba(13,20,32,0.8)", border: "2px dashed rgba(0,245,212,0.2)" }}>
                  <Icon name="UploadCloud" size={36} style={{ color: "#00f5d4", margin: "0 auto 12px" }} />
                  <p className="font-medium mb-1" style={{ color: "#e8f4ff" }}>Перетащи или нажми</p>
                  <p className="text-xs" style={{ color: "rgba(180,200,220,0.4)" }}>PDF, PPTX, DOCX, XLSX, ZIP до 100 МБ</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#9b59f5" }}>ПРЕВЬЮ-ИЗОБРАЖЕНИЕ</label>
                <div className="rounded-xl p-6 text-center cursor-pointer hover-scale"
                  style={{ background: "rgba(13,20,32,0.8)", border: "2px dashed rgba(155,89,245,0.2)" }}>
                  <Icon name="Image" size={28} style={{ color: "#9b59f5", margin: "0 auto 10px" }} />
                  <p className="text-sm" style={{ color: "rgba(180,200,220,0.45)" }}>PNG или JPG до 5 МБ</p>
                </div>
              </div>
              <button className="w-full neon-btn-solid py-4 rounded-xl font-orbitron font-bold text-sm tracking-wider">ОПУБЛИКОВАТЬ ТОВАР</button>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {page === "profile" && user && (
          <div className="px-6 py-8 max-w-4xl mx-auto animate-fade-in">
            <div className="rounded-2xl p-6 mb-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.05), rgba(155,89,245,0.07))", border: "1px solid rgba(0,245,212,0.1)" }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(0,245,212,0.08), transparent)", transform: "translate(30%, -30%)" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.2), rgba(155,89,245,0.2))", border: "1px solid rgba(0,245,212,0.3)" }}>
                    <span className="font-orbitron font-black text-xl neon-text">{user.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="font-orbitron font-bold text-xl mb-1" style={{ color: "#e8f4ff" }}>{user.name}</h2>
                    <p className="text-sm mb-3" style={{ color: "rgba(180,200,220,0.45)" }}>{user.email}</p>
                    <div className="flex gap-5">
                      <span className="text-sm" style={{ color: "rgba(180,200,220,0.5)" }}>
                        <span className="font-bold neon-text">{user.purchased.length}</span> покупок
                      </span>
                      <span className="text-sm" style={{ color: "rgba(180,200,220,0.5)" }}>
                        <span className="font-bold" style={{ color: "#f500c8" }}>{favorites.length}</span> в избранном
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ color: "rgba(245,80,80,0.8)", border: "1px solid rgba(245,80,80,0.2)", background: "rgba(245,80,80,0.05)" }}>
                  Выйти
                </button>
              </div>
            </div>

            {/* Purchased */}
            {purchasedProducts.length > 0 && (
              <div className="mb-10">
                <h3 className="font-orbitron font-bold text-base mb-5 flex items-center gap-2" style={{ color: "#e8f4ff" }}>
                  <Icon name="Download" size={16} style={{ color: "#00f5d4" }} />
                  КУПЛЕННЫЕ <span className="neon-text ml-1">_</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {purchasedProducts.map((p, i) => (
                    <div key={p.id} className="rounded-2xl p-4 flex items-center gap-4 animate-fade-in"
                      style={{ background: "rgba(13,20,32,0.8)", border: "1px solid rgba(0,245,212,0.12)", animationDelay: `${i * 0.07}s` }}>
                      <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover opacity-70" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: "#e8f4ff" }}>{p.title}</p>
                        <p className="text-xs" style={{ color: "rgba(180,200,220,0.4)" }}>{p.category}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => setPreviewProduct(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold font-orbitron transition-all"
                          style={{ background: "rgba(0,245,212,0.12)", border: "1px solid rgba(0,245,212,0.25)", color: "#00f5d4" }}>
                          Открыть
                        </button>
                        <button onClick={() => setReviewModal(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: "rgba(245,197,0,0.1)", border: "1px solid rgba(245,197,0,0.2)", color: "#f5c500" }}>
                          Отзыв
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites */}
            <h3 className="font-orbitron font-bold text-base mb-5 flex items-center gap-2" style={{ color: "#e8f4ff" }}>
              <Icon name="Heart" size={16} style={{ color: "#f500c8" }} />
              ИЗБРАННОЕ <span className="neon-text ml-1">_</span>
              <span className="text-sm font-normal" style={{ color: "rgba(180,200,220,0.35)", fontFamily: "'Golos Text'" }}>({favoriteProducts.length})</span>
            </h3>
            {favoriteProducts.length === 0 ? (
              <div className="text-center py-12 rounded-2xl mb-10"
                style={{ background: "rgba(13,20,32,0.5)", border: "1px dashed rgba(245,0,200,0.12)" }}>
                <Icon name="HeartOff" size={36} style={{ color: "rgba(245,0,200,0.25)", margin: "0 auto 12px" }} />
                <p className="mb-4" style={{ color: "rgba(180,200,220,0.35)" }}>Нет избранных товаров</p>
                <button onClick={() => navigate("catalog")} className="neon-btn px-5 py-2 rounded-lg text-sm">Перейти в каталог</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {favoriteProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} isFavorite={true}
                    onFavorite={toggleFavorite} onOpen={setSelectedProduct} delay={i * 0.08}
                    rating={productRating(p.id)} />
                ))}
              </div>
            )}

            {/* My products */}
            <h3 className="font-orbitron font-bold text-base mb-5 flex items-center gap-2" style={{ color: "#e8f4ff" }}>
              <Icon name="Package" size={16} style={{ color: "#9b59f5" }} />
              МОИ ТОВАРЫ <span className="neon-text ml-1">_</span>
            </h3>
            <div className="text-center py-12 rounded-2xl"
              style={{ background: "rgba(13,20,32,0.5)", border: "1px dashed rgba(155,89,245,0.12)" }}>
              <Icon name="Plus" size={36} style={{ color: "rgba(155,89,245,0.3)", margin: "0 auto 12px" }} />
              <p className="mb-4 text-sm" style={{ color: "rgba(180,200,220,0.35)" }}>Ты ещё не загружал товары</p>
              <button onClick={() => navigate("upload")}
                className="px-6 py-3 rounded-xl font-bold font-orbitron tracking-wide text-xs"
                style={{ background: "rgba(155,89,245,0.12)", border: "1px solid rgba(155,89,245,0.25)", color: "#9b59f5" }}>
                + ЗАГРУЗИТЬ ПЕРВЫЙ
              </button>
            </div>
          </div>
        )}

        {/* Profile not logged in */}
        {page === "profile" && !user && (
          <div className="flex flex-col items-center justify-center px-6 py-32 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)" }}>
              <Icon name="User" size={36} style={{ color: "#00f5d4" }} />
            </div>
            <h2 className="font-orbitron font-bold text-2xl mb-3" style={{ color: "#e8f4ff" }}>Войди в аккаунт</h2>
            <p className="text-sm mb-8 text-center max-w-xs" style={{ color: "rgba(180,200,220,0.45)" }}>
              Авторизуйся, чтобы видеть избранное, покупки и управлять своими товарами
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAuthModal("login")} className="neon-btn px-8 py-3 rounded-xl font-orbitron font-bold text-sm">ВОЙТИ</button>
              <button onClick={() => setAuthModal("register")} className="neon-btn-solid px-8 py-3 rounded-xl font-orbitron font-bold text-sm">РЕГИСТРАЦИЯ</button>
            </div>
          </div>
        )}
      </main>

      {/* ── PRODUCT DETAIL MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          style={{ background: "rgba(7,11,18,0.88)", backdropFilter: "blur(12px)" }}
          onClick={() => setSelectedProduct(null)}>
          <div className="w-full max-w-2xl rounded-t-3xl md:rounded-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto"
            style={{ background: "rgba(13,20,32,0.99)", border: "1px solid rgba(0,245,212,0.15)" }}
            onClick={e => e.stopPropagation()}>

            <div className="relative h-52 overflow-hidden">
              <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover opacity-55" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,20,32,1) 0%, transparent 55%)" }} />
              <button onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(7,11,18,0.75)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Icon name="X" size={15} style={{ color: "#e8f4ff" }} />
              </button>
              <div className="absolute bottom-4 left-5">
                <span className="tag-badge" style={{ background: CATEGORY_COLORS[selectedProduct.category] || "rgba(0,245,212,0.15)", color: CATEGORY_TEXT[selectedProduct.category] || "#00f5d4" }}>
                  {selectedProduct.category}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-orbitron font-bold text-xl leading-tight" style={{ color: "#e8f4ff", flex: 1, marginRight: "12px" }}>
                  {selectedProduct.title}
                </h2>
                <button onClick={() => toggleFavorite(selectedProduct.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: favorites.includes(selectedProduct.id) ? "rgba(245,0,200,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(245,0,200,0.2)" }}>
                  <Icon name="Heart" size={15} style={{ color: favorites.includes(selectedProduct.id) ? "#f500c8" : "rgba(180,200,220,0.4)" }} />
                </button>
              </div>

              <p className="text-sm mb-4" style={{ color: "rgba(180,200,220,0.6)", lineHeight: 1.6 }}>{selectedProduct.description}</p>

              <div className="flex items-center gap-4 mb-5 text-xs" style={{ color: "rgba(180,200,220,0.45)" }}>
                <span className="flex items-center gap-1"><Icon name="User" size={12} />{selectedProduct.author}</span>
                <span className="flex items-center gap-1"><Icon name="Star" size={12} style={{ color: "#f5c842" }} />{productRating(selectedProduct.id)}</span>
                <span className="flex items-center gap-1"><Icon name="ShoppingBag" size={12} />{selectedProduct.sales} продаж</span>
              </div>

              {/* Preview button */}
              <button onClick={() => { setPreviewProduct(selectedProduct); setSelectedProduct(null); }}
                className="w-full mb-3 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ background: "rgba(155,89,245,0.1)", border: "1px solid rgba(155,89,245,0.25)", color: "#9b59f5" }}>
                <Icon name="Eye" size={15} />
                Предпросмотр
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="font-orbitron font-black text-3xl neon-text">{selectedProduct.price.toLocaleString()} ₽</div>
                <button onClick={() => handleBuy(selectedProduct)}
                  className="flex-1 neon-btn-solid py-3 rounded-xl font-orbitron font-bold tracking-wide text-sm">
                  {user?.purchased.includes(selectedProduct.id) ? "СКАЧАТЬ →" : "КУПИТЬ →"}
                </button>
              </div>

              {/* Reviews */}
              <ReviewsSection productId={selectedProduct.id} reviews={reviews} />
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {previewProduct && (
        <PreviewModal
          product={previewProduct}
          isPurchased={!!user?.purchased.includes(previewProduct.id)}
          onClose={() => setPreviewProduct(null)}
          onBuy={() => { handleBuy(previewProduct); setPreviewProduct(null); }}
          viewerName={user?.name}
        />
      )}

      {/* ── AUTH MODAL ── */}
      {authModal && (
        <AuthModal mode={authModal} onLogin={handleLogin} onRegister={handleRegister}
          onClose={() => setAuthModal(null)} onSwitch={m => setAuthModal(m)} />
      )}

      {/* ── REVIEW MODAL ── */}
      {reviewModal && user && (
        <ReviewModal product={reviewModal} userName={user.name}
          onSubmit={(rating, text) => addReview(reviewModal.id, rating, text)}
          onClose={() => setReviewModal(null)} />
      )}
    </div>
  );
}

// ── PRODUCT CARD ──
function ProductCard({ product, isFavorite, onFavorite, onOpen, delay = 0, rating }: {
  product: Product; isFavorite: boolean; onFavorite: (id: number) => void;
  onOpen: (p: Product) => void; delay?: number; rating: number;
}) {
  return (
    <div className="rounded-2xl overflow-hidden hover-scale cursor-pointer animate-fade-in"
      style={{ background: "rgba(13,20,32,0.85)", border: "1px solid rgba(26,37,53,1)", animationDelay: `${delay}s` }}
      onClick={() => onOpen(product)}>
      <div className="relative h-44 overflow-hidden">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover opacity-65 transition-all duration-500 hover:opacity-85 hover:scale-105" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,20,32,0.95) 0%, transparent 55%)" }} />
        <div className="absolute top-3 left-3">
          <span className="tag-badge" style={{ background: CATEGORY_COLORS[product.category] || "rgba(0,245,212,0.15)", color: CATEGORY_TEXT[product.category] || "#00f5d4" }}>
            {product.category}
          </span>
        </div>
        <button className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: isFavorite ? "rgba(245,0,200,0.2)" : "rgba(7,11,18,0.65)", border: isFavorite ? "1px solid rgba(245,0,200,0.4)" : "1px solid rgba(255,255,255,0.07)" }}
          onClick={e => { e.stopPropagation(); onFavorite(product.id); }}>
          <Icon name="Heart" size={13} style={{ color: isFavorite ? "#f500c8" : "rgba(180,200,220,0.45)" }} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1 leading-snug" style={{ color: "#e8f4ff" }}>{product.title}</h3>
        <p className="text-xs mb-3" style={{ color: "rgba(180,200,220,0.4)" }}>{product.author}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(180,200,220,0.38)" }}>
            <span className="flex items-center gap-1"><Icon name="Star" size={11} style={{ color: "#f5c842" }} />{rating}</span>
            <span>{product.sales} продаж</span>
          </div>
          <span className="font-orbitron font-bold text-sm neon-text">{product.price.toLocaleString()} ₽</span>
        </div>
      </div>
    </div>
  );
}

// ── PREVIEW MODAL ──
function PreviewModal({ product, isPurchased, onClose, onBuy, viewerName }: {
  product: Product; isPurchased: boolean; onClose: () => void; onBuy: () => void;
  viewerName?: string;
}) {
  // Персональный водяной знак: имя или guest-id
  const wmLabel = viewerName
    ? `${viewerName.toUpperCase()} • NEXUS`
    : `ГОСТЬ-${Math.abs(product.id * 7919) % 9000 + 1000} • NEXUS`;

  const rows = Array.from({ length: 8 });
  const cols = Array.from({ length: 4 });

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(7,11,18,0.95)", backdropFilter: "blur(16px)", zIndex: 60 }}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,16,26,0.99)", border: "1px solid rgba(0,245,212,0.2)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
          <div className="flex items-center gap-3">
            <span className="tag-badge" style={{ background: CATEGORY_COLORS[product.category] || "rgba(0,245,212,0.15)", color: CATEGORY_TEXT[product.category] || "#00f5d4" }}>
              {product.category}
            </span>
            <h3 className="font-orbitron font-bold text-base" style={{ color: "#e8f4ff" }}>{product.title}</h3>
          </div>
          <div className="flex items-center gap-3">
            {isPurchased && (
              <button className="neon-btn-solid px-4 py-2 rounded-lg text-xs font-orbitron font-bold flex items-center gap-1.5">
                <Icon name="Download" size={13} />
                Скачать
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon name="X" size={15} style={{ color: "#e8f4ff" }} />
            </button>
          </div>
        </div>

        {/* Preview area — always visible, watermark is always on */}
        <div className="relative overflow-hidden flex-1"
          style={{ minHeight: "440px", userSelect: "none" }}
          onContextMenu={e => e.preventDefault()}>

          {/* Document mockup — всегда виден */}
          <div className="p-8" style={{ minHeight: "440px", pointerEvents: "none", userSelect: "none" }}>
            <div className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Title bar */}
              <div className="mb-6">
                <div className="h-6 rounded mb-3" style={{ background: "rgba(0,245,212,0.18)", width: "55%" }} />
                <div className="h-3 rounded mb-1.5" style={{ background: "rgba(255,255,255,0.07)", width: "92%" }} />
                <div className="h-3 rounded mb-1.5" style={{ background: "rgba(255,255,255,0.07)", width: "78%" }} />
                <div className="h-3 rounded" style={{ background: "rgba(255,255,255,0.07)", width: "85%" }} />
              </div>
              {/* Cards grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="h-2 rounded mb-2" style={{ background: "rgba(0,245,212,0.13)", width: "65%" }} />
                    <div className="h-2 rounded mb-1.5" style={{ background: "rgba(255,255,255,0.06)", width: "100%" }} />
                    <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.06)", width: "80%" }} />
                  </div>
                ))}
              </div>
              {/* Text lines */}
              <div className="space-y-2.5">
                {[93, 76, 87, 62, 90, 70].map((w, i) => (
                  <div key={i} className="h-2.5 rounded" style={{ background: "rgba(255,255,255,0.055)", width: `${w}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* ── ПЕРСОНАЛЬНЫЕ ВОДЯНЫЕ ЗНАКИ ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ userSelect: "none" }}>
            {rows.map((_, row) =>
              cols.map((_, col) => (
                <div key={`${row}-${col}`}
                  className="absolute font-orbitron font-bold whitespace-nowrap"
                  style={{
                    top: `${row * 13 + 3}%`,
                    left: `${col * 30 - 10 + (row % 2) * 15}%`,
                    fontSize: "10px",
                    color: "rgba(0,245,212,0.18)",
                    transform: "rotate(-32deg)",
                    letterSpacing: "0.15em",
                  }}>
                  {wmLabel}
                </div>
              ))
            )}
          </div>

          {/* Overlay для незарегистрированных: нижняя часть затемнена + CTA */}
          {!isPurchased && (
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-8"
              style={{ height: "55%", background: "linear-gradient(to bottom, transparent 0%, rgba(10,16,26,0.97) 45%)" }}>
              <div className="text-center px-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Icon name="Lock" size={16} style={{ color: "#00f5d4" }} />
                  <span className="font-orbitron font-bold text-sm" style={{ color: "#e8f4ff" }}>Полная версия доступна после оплаты</span>
                </div>
                <p className="text-xs mb-5 max-w-xs mx-auto" style={{ color: "rgba(180,200,220,0.5)", lineHeight: 1.6 }}>
                  Файл виден в предпросмотре, но защищён персональными водяными знаками. Для скачивания — оплатите доступ.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="font-orbitron font-black text-2xl neon-text">{product.price.toLocaleString()} ₽</div>
                  <button onClick={onBuy} className="neon-btn-solid px-7 py-3 rounded-xl font-orbitron font-bold text-sm tracking-wide">
                    КУПИТЬ →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 flex items-center gap-2 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(0,245,212,0.08)", background: "rgba(0,245,212,0.02)" }}>
          <Icon name="ShieldCheck" size={13} style={{ color: "rgba(0,245,212,0.5)" }} />
          <p className="text-xs" style={{ color: "rgba(180,200,220,0.3)" }}>
            Защищено персональными водяными знаками: <span style={{ color: "rgba(0,245,212,0.5)" }}>{wmLabel}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── AUTH MODAL ──
function AuthModal({ mode, onLogin, onRegister, onClose, onSwitch }: {
  mode: "login" | "register";
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
  onClose: () => void;
  onSwitch: (m: "login" | "register") => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const inputStyle = {
    background: "rgba(13,20,32,0.9)",
    border: "1px solid rgba(0,245,212,0.2)",
    color: "#e8f4ff",
    fontFamily: "'Golos Text', sans-serif",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,11,18,0.9)", backdropFilter: "blur(16px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: "rgba(10,16,26,0.99)", border: "1px solid rgba(0,245,212,0.18)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 text-center"
          style={{ borderBottom: "1px solid rgba(0,245,212,0.08)" }}>
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, #00f5d4, #9b59f5, #f500c8)" }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.15), rgba(155,89,245,0.15))", border: "1px solid rgba(0,245,212,0.25)" }}>
            <Icon name={mode === "login" ? "LogIn" : "UserPlus"} size={24} style={{ color: "#00f5d4" }} />
          </div>
          <h2 className="font-orbitron font-bold text-xl" style={{ color: "#e8f4ff" }}>
            {mode === "login" ? "ВХОД В АККАУНТ" : "РЕГИСТРАЦИЯ"}
          </h2>
          <p className="text-sm mt-1" style={{ color: "rgba(180,200,220,0.45)" }}>
            {mode === "login" ? "Введи email и пароль для входа" : "Создай аккаунт продавца или покупателя"}
          </p>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon name="X" size={14} style={{ color: "rgba(180,200,220,0.5)" }} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>ИМЯ</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Твоё имя"
                className="w-full px-4 py-3 rounded-xl outline-none" style={inputStyle} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com"
              className="w-full px-4 py-3 rounded-xl outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>ПАРОЛЬ</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full px-4 py-3 pr-12 rounded-xl outline-none" style={inputStyle} />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
                <Icon name={showPass ? "EyeOff" : "Eye"} size={16} style={{ color: "rgba(0,245,212,0.5)" }} />
              </button>
            </div>
          </div>

          <button
            onClick={() => mode === "login" ? onLogin(email, password) : onRegister(name, email, password)}
            className="w-full neon-btn-solid py-4 rounded-xl font-orbitron font-bold text-sm tracking-wider mt-2">
            {mode === "login" ? "ВОЙТИ →" : "СОЗДАТЬ АККАУНТ →"}
          </button>

          <div className="text-center pt-2">
            <span className="text-sm" style={{ color: "rgba(180,200,220,0.4)" }}>
              {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            </span>
            <button onClick={() => onSwitch(mode === "login" ? "register" : "login")}
              className="text-sm font-semibold" style={{ color: "#00f5d4" }}>
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REVIEWS SECTION ──
function ReviewsSection({ productId, reviews }: { productId: number; reviews: Review[] }) {
  const productReviews = reviews.filter(r => r.productId === productId);
  if (!productReviews.length) return (
    <div className="pt-4" style={{ borderTop: "1px solid rgba(0,245,212,0.08)" }}>
      <p className="text-xs font-orbitron tracking-widest mb-3" style={{ color: "rgba(180,200,220,0.35)" }}>ОТЗЫВЫ</p>
      <p className="text-sm text-center py-4" style={{ color: "rgba(180,200,220,0.3)" }}>Отзывов пока нет</p>
    </div>
  );
  return (
    <div className="pt-4" style={{ borderTop: "1px solid rgba(0,245,212,0.08)" }}>
      <p className="text-xs font-orbitron tracking-widest mb-4" style={{ color: "rgba(180,200,220,0.35)" }}>
        ОТЗЫВЫ ({productReviews.length})
      </p>
      <div className="space-y-3">
        {productReviews.slice(0, 3).map(r => (
          <div key={r.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold" style={{ color: "#e8f4ff" }}>{r.userName}</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Icon key={s} name="Star" size={11} style={{ color: s <= r.rating ? "#f5c842" : "rgba(180,200,220,0.2)" }} />
                ))}
              </div>
            </div>
            <p className="text-xs" style={{ color: "rgba(180,200,220,0.55)", lineHeight: 1.5 }}>{r.text}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(180,200,220,0.25)" }}>{r.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── REVIEW MODAL ──
function ReviewModal({ product, userName, onSubmit, onClose }: {
  product: Product; userName: string;
  onSubmit: (rating: number, text: string) => void;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,11,18,0.9)", backdropFilter: "blur(16px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: "rgba(10,16,26,0.99)", border: "1px solid rgba(245,197,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(245,197,0,0.1)" }}>
          <div>
            <h3 className="font-orbitron font-bold text-base" style={{ color: "#e8f4ff" }}>ОСТАВИТЬ ОТЗЫВ</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(180,200,220,0.4)" }}>{product.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon name="X" size={14} style={{ color: "rgba(180,200,220,0.5)" }} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-orbitron tracking-widest mb-3" style={{ color: "rgba(245,197,0,0.7)" }}>РЕЙТИНГ</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}
                  className="transition-all" style={{ transform: (hover || rating) >= s ? "scale(1.2)" : "scale(1)" }}>
                  <Icon name="Star" size={32} style={{ color: (hover || rating) >= s ? "#f5c842" : "rgba(180,200,220,0.2)" }} />
                </button>
              ))}
              {rating > 0 && <span className="ml-2 text-sm self-center font-orbitron" style={{ color: "#f5c842" }}>{rating}/5</span>}
            </div>
          </div>
          <div>
            <label className="text-xs font-orbitron tracking-widest mb-2 block" style={{ color: "rgba(245,197,0,0.7)" }}>ВАШ ОТЗЫВ</label>
            <textarea rows={4} value={text} onChange={e => setText(e.target.value)}
              placeholder="Расскажи о своём опыте использования..."
              className="w-full px-4 py-3 rounded-xl outline-none resize-none"
              style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(245,197,0,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text', sans-serif" }} />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(180,200,220,0.5)" }}>
              Отмена
            </button>
            <button
              onClick={() => rating > 0 && text.trim() && onSubmit(rating, text)}
              disabled={!rating || !text.trim()}
              className="flex-1 py-3 rounded-xl font-orbitron font-bold text-sm transition-all"
              style={{
                background: rating && text.trim() ? "linear-gradient(135deg, #f5c500, #f5a000)" : "rgba(245,197,0,0.08)",
                color: rating && text.trim() ? "#070b12" : "rgba(245,197,0,0.3)",
                border: "none",
              }}>
              ОПУБЛИКОВАТЬ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HELPERS ──
function UploadField({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>{label}</label>
      <input type={type} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl outline-none"
        style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text', sans-serif" }} />
    </div>
  );
}

function PriceField() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "" || /^\d+$/.test(v)) { setValue(v); setError(""); }
    else setError("Цена не может быть отрицательной");
  };
  return (
    <div>
      <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>ЦЕНА (₽)</label>
      <input type="number" min="0" value={value} onChange={handleChange} placeholder="990"
        className="w-full px-4 py-3 rounded-xl outline-none"
        style={{ background: "rgba(13,20,32,0.9)", border: `1px solid ${error ? "rgba(245,80,80,0.5)" : "rgba(0,245,212,0.2)"}`, color: "#e8f4ff", fontFamily: "'Golos Text', sans-serif" }} />
      {error && <p className="text-xs mt-1" style={{ color: "#f55050" }}>{error}</p>}
    </div>
  );
}