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

const PRODUCTS: Product[] = [
  { id: 1, title: "Бизнес-план 2025", author: "Алексей М.", price: 990, category: "Документы", image: IMG2, rating: 4.9, sales: 312, description: "Профессиональный шаблон бизнес-плана для стартапа с финансовыми таблицами и стратегией" },
  { id: 2, title: "Pitch Deck: Инвестиции", author: "Мария К.", price: 1490, category: "Презентации", image: IMG1, rating: 4.8, sales: 189, description: "30 слайдов для привлечения инвестиций, протестировано на 50+ питчах" },
  { id: 3, title: "Финансовая модель", author: "Дмитрий В.", price: 2990, category: "Таблицы", image: IMG2, rating: 5.0, sales: 97, description: "Excel-модель для расчёта юнит-экономики и прогнозирования выручки" },
  { id: 4, title: "Контент-план на 3 мес.", author: "Ольга Р.", price: 590, category: "Документы", image: IMG1, rating: 4.7, sales: 441, description: "Готовый контент-план для соцсетей с темами и рубриками на 90 дней" },
  { id: 5, title: "UI Kit: Cyberpunk Style", author: "Тимур Н.", price: 3490, category: "Дизайн", image: IMG2, rating: 4.9, sales: 76, description: "200+ компонентов Figma в кибер-стиле, тёмная и светлая темы" },
  { id: 6, title: "HR-политика компании", author: "Анна С.", price: 1290, category: "Документы", image: IMG1, rating: 4.6, sales: 203, description: "Полный пакет HR-документов: оффер, онбординг, правила, KPI-система" },
];

const CATEGORIES = ["Все", "Документы", "Презентации", "Таблицы", "Дизайн"];

type Page = "home" | "catalog" | "upload" | "search" | "profile";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchCat = selectedCategory === "Все" || p.category === selectedCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const searchFiltered = PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteProducts = PRODUCTS.filter(p => favorites.includes(p.id));

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen grid-bg" style={{ fontFamily: "'Golos Text', sans-serif" }}>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(7,11,18,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
        <button onClick={() => navigate("home")} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00f5d4, #9b59f5)" }}>
            <span className="font-orbitron font-black text-xs" style={{ color: "#070b12" }}>NX</span>
          </div>
          <span className="font-orbitron font-bold text-lg tracking-wider neon-text">NEXUS</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {(["home", "catalog", "upload", "search", "profile"] as Page[]).map((p) => {
            const labels: Record<Page, string> = { home: "Главная", catalog: "Каталог", upload: "Загрузка", search: "Поиск", profile: "Профиль" };
            const icons: Record<Page, string> = { home: "Home", catalog: "LayoutGrid", upload: "Upload", search: "Search", profile: "User" };
            return (
              <button key={p} onClick={() => navigate(p)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: page === p ? "#00f5d4" : "rgba(180,200,220,0.7)",
                  background: page === p ? "rgba(0,245,212,0.08)" : "transparent",
                  border: page === p ? "1px solid rgba(0,245,212,0.2)" : "1px solid transparent",
                }}>
                <Icon name={icons[p]} size={15} />
                {labels[p]}
              </button>
            );
          })}
        </div>

        <button onClick={() => navigate("profile")} className="relative">
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.2), rgba(155,89,245,0.2))", border: "1px solid rgba(0,245,212,0.3)" }}>
            <Icon name="User" size={16} style={{ color: "#00f5d4" }} />
          </div>
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
              style={{ background: "#f500c8", color: "white", fontSize: "9px" }}>{favorites.length}</span>
          )}
        </button>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3"
        style={{ background: "rgba(7,11,18,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,245,212,0.1)" }}>
        {(["home", "catalog", "upload", "search", "profile"] as Page[]).map((p) => {
          const icons: Record<Page, string> = { home: "Home", catalog: "LayoutGrid", upload: "Upload", search: "Search", profile: "User" };
          const labels: Record<Page, string> = { home: "Главная", catalog: "Каталог", upload: "Загрузить", search: "Поиск", profile: "Профиль" };
          return (
            <button key={p} onClick={() => navigate(p)} className="flex flex-col items-center gap-1 p-2 transition-all"
              style={{ color: page === p ? "#00f5d4" : "rgba(180,200,220,0.35)" }}>
              <Icon name={icons[p]} size={20} />
              <span style={{ fontSize: "9px", fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.05em" }}>{labels[p]}</span>
            </button>
          );
        })}
      </nav>

      <main className="pt-20 pb-24 md:pb-8">

        {/* ── HOME ── */}
        {page === "home" && (
          <div className="animate-fade-in">
            <div className="relative overflow-hidden" style={{ minHeight: "85vh" }}>
              <div className="absolute inset-0">
                <img src={HERO_IMAGE} alt="hero" className="w-full h-full object-cover opacity-25" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,11,18,0.2) 0%, rgba(7,11,18,0.65) 60%, rgba(7,11,18,1) 100%)" }} />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-28">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-widest font-orbitron"
                  style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.2)", color: "#00f5d4" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" style={{ animation: "pulse-glow 2s infinite" }} />
                  ЦИФРОВОЙ МАРКЕТПЛЕЙС
                </div>

                <h1 className="font-orbitron font-black mb-6" style={{ fontSize: "clamp(2.8rem, 9vw, 6rem)", lineHeight: 1.05 }}>
                  <span style={{ color: "#e8f4ff" }}>РЫНОК</span>
                  <br />
                  <span className="neon-text">ЦИФРОВЫХ</span>
                  <br />
                  <span style={{ color: "#e8f4ff" }}>ПРОДУКТОВ</span>
                </h1>

                <p className="text-lg mb-10 max-w-lg" style={{ color: "rgba(180,200,220,0.65)", lineHeight: 1.7 }}>
                  Покупай готовые презентации, документы и шаблоны — или продавай свои работы тысячам покупателей
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigate("catalog")}
                    className="neon-btn-solid px-10 py-4 rounded-xl text-sm font-bold font-orbitron tracking-wider">
                    КАТАЛОГ →
                  </button>
                  <button onClick={() => navigate("upload")}
                    className="neon-btn px-10 py-4 rounded-xl text-sm font-bold font-orbitron tracking-wider">
                    ПРОДАТЬ
                  </button>
                </div>

                <div className="flex gap-12 mt-20">
                  {[["1 200+", "товаров"], ["8 500+", "покупателей"], ["98%", "довольных"]].map(([num, label]) => (
                    <div key={label} className="text-center">
                      <div className="font-orbitron font-black text-2xl neon-text">{num}</div>
                      <div className="text-xs mt-1" style={{ color: "rgba(180,200,220,0.45)", letterSpacing: "0.08em" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-12 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-orbitron font-bold text-xl" style={{ color: "#e8f4ff" }}>
                  ПОПУЛЯРНОЕ <span className="neon-text">_</span>
                </h2>
                <button onClick={() => navigate("catalog")} className="neon-btn px-4 py-2 rounded-lg text-sm">
                  Всё →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PRODUCTS.slice(0, 3).map((product, i) => (
                  <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)}
                    onFavorite={toggleFavorite} onOpen={setSelectedProduct}
                    delay={i * 0.1} />
                ))}
              </div>
            </div>

            <div className="px-6 pb-16 max-w-7xl mx-auto">
              <div className="rounded-2xl overflow-hidden relative p-10"
                style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.06), rgba(155,89,245,0.08))", border: "1px solid rgba(0,245,212,0.12)" }}>
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(155,89,245,0.12), transparent)", transform: "translate(30%, -30%)" }} />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="font-orbitron font-bold text-2xl mb-2" style={{ color: "#e8f4ff" }}>Начни продавать сегодня</h3>
                    <p style={{ color: "rgba(180,200,220,0.55)" }}>Загрузи свои работы и получай пассивный доход</p>
                  </div>
                  <button onClick={() => navigate("upload")} className="neon-btn-solid px-8 py-4 rounded-xl font-orbitron font-bold tracking-wide whitespace-nowrap text-sm">
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
            <div className="mb-8">
              <h1 className="font-orbitron font-bold text-2xl mb-1" style={{ color: "#e8f4ff" }}>КАТАЛОГ <span className="neon-text">_</span></h1>
              <p style={{ color: "rgba(180,200,220,0.45)" }}>{filteredProducts.length} товаров</p>
            </div>

            <div className="flex gap-2 flex-wrap mb-8">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all font-orbitron"
                  style={{
                    color: selectedCategory === cat ? "#070b12" : "#00f5d4",
                    background: selectedCategory === cat ? "#00f5d4" : "rgba(0,245,212,0.07)",
                    border: selectedCategory === cat ? "none" : "1px solid rgba(0,245,212,0.2)",
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)}
                  onFavorite={toggleFavorite} onOpen={setSelectedProduct} delay={i * 0.07} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-24">
                <Icon name="PackageSearch" size={48} style={{ color: "rgba(0,245,212,0.25)", margin: "0 auto 16px" }} />
                <p className="font-orbitron" style={{ color: "rgba(180,200,220,0.35)" }}>Ничего не найдено</p>
              </div>
            )}
          </div>
        )}

        {/* ── SEARCH ── */}
        {page === "search" && (
          <div className="px-6 py-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="font-orbitron font-bold text-2xl mb-6" style={{ color: "#e8f4ff" }}>ПОИСК <span className="neon-text">_</span></h1>

            <div className="relative mb-8">
              <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#00f5d4" }} />
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Название, категория или автор..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-base outline-none transition-all"
                style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.25)", color: "#e8f4ff", fontFamily: "'Golos Text', sans-serif" }} />
            </div>

            {searchQuery === "" ? (
              <div>
                <p className="text-xs mb-3 font-orbitron tracking-widest" style={{ color: "rgba(180,200,220,0.35)" }}>ПОПУЛЯРНЫЕ ЗАПРОСЫ</p>
                <div className="flex flex-wrap gap-2 mb-10">
                  {["Презентация", "Бизнес-план", "Финансовая модель", "Контент-план", "UI Kit", "Шаблон"].map(tag => (
                    <button key={tag} onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 rounded-lg text-sm transition-all"
                      style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)", color: "#00f5d4" }}>
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs mb-4 font-orbitron tracking-widest" style={{ color: "rgba(180,200,220,0.35)" }}>ВСЕ ТОВАРЫ</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PRODUCTS.map((p, i) => (
                    <ProductCard key={p.id} product={p} isFavorite={favorites.includes(p.id)}
                      onFavorite={toggleFavorite} onOpen={setSelectedProduct} delay={i * 0.07} />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-5" style={{ color: "rgba(180,200,220,0.45)" }}>Найдено: {searchFiltered.length}</p>
                {searchFiltered.length === 0 ? (
                  <div className="text-center py-20">
                    <Icon name="SearchX" size={40} style={{ color: "rgba(0,245,212,0.25)", margin: "0 auto 12px" }} />
                    <p style={{ color: "rgba(180,200,220,0.35)" }}>По запросу «{searchQuery}» ничего нет</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchFiltered.map((p, i) => (
                      <ProductCard key={p.id} product={p} isFavorite={favorites.includes(p.id)}
                        onFavorite={toggleFavorite} onOpen={setSelectedProduct} delay={i * 0.07} />
                    ))}
                  </div>
                )}
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

              <UploadField label="ЦЕНА (₽)" placeholder="990" type="number" />

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

              <button className="w-full neon-btn-solid py-4 rounded-xl font-orbitron font-bold text-sm tracking-wider">
                ОПУБЛИКОВАТЬ ТОВАР
              </button>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {page === "profile" && (
          <div className="px-6 py-8 max-w-4xl mx-auto animate-fade-in">
            <div className="rounded-2xl p-6 mb-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.05), rgba(155,89,245,0.07))", border: "1px solid rgba(0,245,212,0.1)" }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(0,245,212,0.08), transparent)", transform: "translate(30%, -30%)" }} />
              <div className="relative flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-float"
                  style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.15), rgba(155,89,245,0.15))", border: "1px solid rgba(0,245,212,0.25)" }}>
                  <Icon name="User" size={36} style={{ color: "#00f5d4" }} />
                </div>
                <div>
                  <h2 className="font-orbitron font-bold text-xl mb-1" style={{ color: "#e8f4ff" }}>Пользователь</h2>
                  <p className="text-sm mb-3" style={{ color: "rgba(180,200,220,0.45)" }}>user@example.com</p>
                  <div className="flex gap-5">
                    <span className="text-sm" style={{ color: "rgba(180,200,220,0.5)" }}>
                      <span className="font-bold neon-text">0</span> продаж
                    </span>
                    <span className="text-sm" style={{ color: "rgba(180,200,220,0.5)" }}>
                      <span className="font-bold" style={{ color: "#f500c8" }}>{favorites.length}</span> в избранном
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-orbitron font-bold text-base mb-5 flex items-center gap-2" style={{ color: "#e8f4ff" }}>
              <Icon name="Heart" size={16} style={{ color: "#f500c8" }} />
              ИЗБРАННОЕ <span className="neon-text ml-1">_</span>
              <span className="text-sm font-normal" style={{ color: "rgba(180,200,220,0.35)", fontFamily: "'Golos Text'" }}>({favoriteProducts.length})</span>
            </h3>

            {favoriteProducts.length === 0 ? (
              <div className="text-center py-14 rounded-2xl mb-10"
                style={{ background: "rgba(13,20,32,0.5)", border: "1px dashed rgba(245,0,200,0.12)" }}>
                <Icon name="HeartOff" size={38} style={{ color: "rgba(245,0,200,0.25)", margin: "0 auto 12px" }} />
                <p className="mb-4" style={{ color: "rgba(180,200,220,0.35)" }}>Нет избранных товаров</p>
                <button onClick={() => navigate("catalog")} className="neon-btn px-5 py-2 rounded-lg text-sm">
                  Перейти в каталог
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {favoriteProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} isFavorite={true}
                    onFavorite={toggleFavorite} onOpen={setSelectedProduct} delay={i * 0.08} />
                ))}
              </div>
            )}

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
      </main>

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          style={{ background: "rgba(7,11,18,0.88)", backdropFilter: "blur(12px)" }}
          onClick={() => setSelectedProduct(null)}>
          <div className="w-full max-w-lg rounded-t-3xl md:rounded-2xl overflow-hidden animate-slide-up"
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

              <div className="flex items-center gap-4 mb-6 text-xs" style={{ color: "rgba(180,200,220,0.45)" }}>
                <span className="flex items-center gap-1">
                  <Icon name="User" size={12} />
                  {selectedProduct.author}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Star" size={12} style={{ color: "#f5c842" }} />
                  {selectedProduct.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="ShoppingBag" size={12} />
                  {selectedProduct.sales} продаж
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="font-orbitron font-black text-3xl neon-text">{selectedProduct.price.toLocaleString()} ₽</div>
                <button className="flex-1 neon-btn-solid py-3 rounded-xl font-orbitron font-bold tracking-wide text-sm">
                  КУПИТЬ →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadField({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-2 block font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>{label}</label>
      <input type={type} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl outline-none"
        style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text', sans-serif" }} />
    </div>
  );
}

function ProductCard({ product, isFavorite, onFavorite, onOpen, delay = 0 }: {
  product: Product;
  isFavorite: boolean;
  onFavorite: (id: number) => void;
  onOpen: (p: Product) => void;
  delay?: number;
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
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
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
            <span className="flex items-center gap-1">
              <Icon name="Star" size={11} style={{ color: "#f5c842" }} />
              {product.rating}
            </span>
            <span>{product.sales} продаж</span>
          </div>
          <span className="font-orbitron font-bold text-sm neon-text">{product.price.toLocaleString()} ₽</span>
        </div>
      </div>
    </div>
  );
}