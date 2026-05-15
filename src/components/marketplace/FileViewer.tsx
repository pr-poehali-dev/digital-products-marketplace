import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CATEGORY_COLORS, CATEGORY_TEXT } from "@/lib/api";
import type { Product } from "@/lib/api";

const PAGE_CONFIGS = [
  { label: "Титульный лист", type: "title" },
  { label: "Содержание", type: "toc" },
  { label: "Введение", type: "text" },
  { label: "Раздел 1", type: "grid" },
  { label: "Раздел 2", type: "chart" },
  { label: "Таблицы", type: "grid" },
  { label: "Выводы", type: "text" },
  { label: "Приложения", type: "text" },
];

function PageContent({ type, pageNum }: { type: string; pageNum: number }) {
  if (type === "title") return (
    <div className="text-center py-10" style={{ pointerEvents: "none", userSelect: "none" }}>
      <div className="h-8 rounded-xl mx-auto mb-6" style={{ background: "rgba(0,245,212,0.18)", width: "65%" }} />
      <div className="h-3 rounded mx-auto mb-2" style={{ background: "rgba(255,255,255,0.07)", width: "45%" }} />
      <div className="h-3 rounded mx-auto mb-8" style={{ background: "rgba(255,255,255,0.05)", width: "35%" }} />
      <div className="h-28 rounded-2xl mx-auto" style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.1)", width: "55%" }} />
      <div className="h-3 rounded mx-auto mt-8" style={{ background: "rgba(255,255,255,0.04)", width: "25%" }} />
    </div>
  );
  if (type === "toc") return (
    <div style={{ pointerEvents: "none", userSelect: "none" }}>
      <div className="h-5 rounded mb-6" style={{ background: "rgba(0,245,212,0.14)", width: "30%" }} />
      {[90, 75, 82, 68, 85, 72, 78].map((w, i) => (
        <div key={i} className="flex items-center justify-between mb-3">
          <div className="h-2.5 rounded" style={{ background: "rgba(255,255,255,0.06)", width: `${w - 20}%` }} />
          <div className="h-2.5 rounded" style={{ background: "rgba(0,245,212,0.1)", width: "8%" }} />
        </div>
      ))}
    </div>
  );
  if (type === "grid") return (
    <div style={{ pointerEvents: "none", userSelect: "none" }}>
      <div className="h-5 rounded mb-5" style={{ background: "rgba(0,245,212,0.14)", width: "40%" }} />
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="h-10 rounded-lg mb-2" style={{ background: `rgba(${i === 0 ? "0,245,212" : i === 1 ? "155,89,245" : "0,200,255"},0.1)` }} />
            <div className="h-2 rounded mb-1" style={{ background: "rgba(255,255,255,0.06)", width: "80%" }} />
            <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.04)", width: "60%" }} />
          </div>
        ))}
      </div>
      {[88, 72, 94, 65, 80].map((w, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <div className="h-2.5 flex-1 rounded" style={{ background: "rgba(255,255,255,0.05)", width: `${w}%` }} />
          <div className="h-2.5 rounded w-8" style={{ background: "rgba(0,245,212,0.08)" }} />
        </div>
      ))}
    </div>
  );
  if (type === "chart") return (
    <div style={{ pointerEvents: "none", userSelect: "none" }}>
      <div className="h-5 rounded mb-5" style={{ background: "rgba(155,89,245,0.18)", width: "38%" }} />
      <div className="flex items-end gap-2 mb-4 h-28">
        {[40, 65, 50, 80, 55, 90, 70, 85].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%`, background: `rgba(${i % 2 === 0 ? "0,245,212" : "155,89,245"},0.2)` }} />
        ))}
      </div>
      {[75, 60, 88].map((w, i) => (
        <div key={i} className="h-2.5 rounded mb-2" style={{ background: "rgba(255,255,255,0.05)", width: `${w}%` }} />
      ))}
    </div>
  );
  // text
  return (
    <div style={{ pointerEvents: "none", userSelect: "none" }}>
      <div className="h-5 rounded mb-5" style={{ background: "rgba(0,245,212,0.13)", width: "38%" }} />
      {[92, 78, 88, 95, 70, 85, 60, 88, 75, 90].map((w, i) => (
        <div key={i} className="h-2.5 rounded mb-2.5" style={{ background: "rgba(255,255,255,0.055)", width: `${w}%` }} />
      ))}
      <div className="h-4 rounded my-5" style={{ background: "rgba(155,89,245,0.1)", width: "32%" }} />
      {[85, 65, 92, 78].map((w, i) => (
        <div key={i} className="h-2.5 rounded mb-2.5" style={{ background: "rgba(255,255,255,0.045)", width: `${w}%` }} />
      ))}
    </div>
  );
}

export default function FileViewer({ product, isPurchased, viewerName, onClose, onBuy }: {
  product: Product; isPurchased: boolean; viewerName?: string; onClose: () => void; onBuy: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = PAGE_CONFIGS.length;
  const cfg = PAGE_CONFIGS[currentPage - 1];

  const wmLabel = viewerName
    ? `${viewerName.toUpperCase()} • NEXUS`
    : `ГОСТЬ-${(Math.abs(product.id * 7919) % 9000) + 1000} • NEXUS`;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#070b12", zIndex: 70 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: "rgba(10,16,26,0.98)", borderBottom: "1px solid rgba(0,245,212,0.12)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <Icon name="ArrowLeft" size={15} style={{ color: "#e8f4ff" }} />
          </button>
          <span className="tag-badge flex-shrink-0"
            style={{ background: CATEGORY_COLORS[product.category] || "rgba(0,245,212,0.15)", color: CATEGORY_TEXT[product.category] || "#00f5d4" }}>
            {product.category}
          </span>
          <h3 className="font-orbitron font-bold text-sm truncate" style={{ color: "#e8f4ff" }}>{product.title}</h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)" }}>
            <span className="font-orbitron text-xs neon-text">{currentPage}</span>
            <span className="text-xs" style={{ color: "rgba(180,200,220,0.35)" }}>/ {totalPages}</span>
          </div>
          {isPurchased ? (
            <button className="neon-btn-solid px-4 py-1.5 rounded-lg text-xs font-orbitron font-bold flex items-center gap-1.5">
              <Icon name="Download" size={12} />Скачать
            </button>
          ) : (
            <button onClick={onBuy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all"
              style={{ background: "linear-gradient(135deg,#00f5d4,rgba(0,200,170,1))", color: "#070b12" }}>
              <Icon name="ShoppingCart" size={12} />{product.price.toLocaleString()} ₽
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex" style={{ background: "rgba(5,8,14,1)" }}>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="flex-shrink-0 w-12 flex items-center justify-center transition-all"
          style={{ color: currentPage === 1 ? "rgba(180,200,220,0.1)" : "rgba(0,245,212,0.5)", background: "rgba(10,16,26,0.6)" }}>
          <Icon name="ChevronLeft" size={22} />
        </button>

        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div className="relative w-full max-w-2xl"
            style={{ background: "rgba(15,22,35,1)", border: "1px solid rgba(0,245,212,0.12)", borderRadius: 12, minHeight: 520 }}
            onContextMenu={(e) => e.preventDefault()}>
            <div className="p-10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-orbitron tracking-widest" style={{ color: "rgba(0,245,212,0.3)" }}>
                  СТР. {currentPage} — {cfg.label.toUpperCase()}
                </span>
                <span className="text-xs font-orbitron" style={{ color: "rgba(0,245,212,0.18)" }}>
                  {product.title.slice(0, 18).toUpperCase()}
                </span>
              </div>
              <PageContent type={cfg.type} pageNum={currentPage} />
            </div>

            {/* Watermarks */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" style={{ userSelect: "none" }}>
              {Array.from({ length: 9 }).map((_, row) =>
                Array.from({ length: 5 }).map((_, col) => (
                  <span key={`${row}-${col}`} className="absolute font-orbitron font-bold whitespace-nowrap"
                    style={{
                      top: `${row * 12 + 2}%`,
                      left: `${col * 26 - 5 + (row % 2) * 13}%`,
                      fontSize: "9px",
                      color: "rgba(0,245,212,0.13)",
                      transform: "rotate(-30deg)",
                      letterSpacing: "0.12em",
                    }}>
                    {wmLabel}
                  </span>
                ))
              )}
            </div>

            {/* CTA overlay for non-purchased */}
            {!isPurchased && (
              <div className="absolute bottom-0 left-0 right-0 rounded-b-xl flex flex-col items-center justify-end pb-8"
                style={{ height: "40%", background: "linear-gradient(to bottom,transparent 0%,rgba(5,8,14,0.98) 45%)" }}>
                <div className="text-center px-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon name="ShoppingCart" size={14} style={{ color: "#00f5d4" }} />
                    <span className="font-orbitron font-bold text-sm" style={{ color: "#e8f4ff" }}>Скачай без водяных знаков</span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: "rgba(180,200,220,0.4)" }}>Просматривай бесплатно, скачивай после оплаты</p>
                  <button onClick={onBuy} className="neon-btn-solid px-8 py-3 rounded-xl font-orbitron font-bold text-sm">
                    КУПИТЬ {product.price.toLocaleString()} ₽ →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="flex-shrink-0 w-12 flex items-center justify-center transition-all"
          style={{ color: currentPage === totalPages ? "rgba(180,200,220,0.1)" : "rgba(0,245,212,0.5)", background: "rgba(10,16,26,0.6)" }}>
          <Icon name="ChevronRight" size={22} />
        </button>
      </div>

      {/* Footer dots */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5"
        style={{ background: "rgba(10,16,26,0.98)", borderTop: "1px solid rgba(0,245,212,0.08)" }}>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)}
              className="rounded-full transition-all"
              style={{ width: currentPage === i + 1 ? 20 : 6, height: 6, background: currentPage === i + 1 ? "#00f5d4" : "rgba(0,245,212,0.2)" }} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={12} style={{ color: "rgba(0,245,212,0.4)" }} />
          <span className="font-orbitron" style={{ color: "rgba(0,245,212,0.3)", fontSize: 9 }}>{wmLabel}</span>
        </div>
      </div>
    </div>
  );
}
