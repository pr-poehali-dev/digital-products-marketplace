import { useState } from "react";
import Icon from "@/components/ui/icon";
import { API_AUTH, API_REVIEWS, API_WITHDRAW, BANKS, apiFetch } from "@/lib/api";
import type { Product, User } from "@/lib/api";

// ── StarRating ──
export function StarRating({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{ cursor: onChange ? "pointer" : "default", background: "none", border: "none", padding: 0 }}
        >
          <Icon
            name="Star"
            size={size}
            style={{ color: s <= (hovered || value) ? "#f5b400" : "rgba(180,200,220,0.2)", fill: s <= (hovered || value) ? "#f5b400" : "transparent" }}
          />
        </button>
      ))}
    </div>
  );
}

// ── ReviewForm ──
export function ReviewForm({ productId, token, onSuccess }: { productId: number; token: string; onSuccess: () => void }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!text.trim()) { setError("Напиши текст отзыва"); return; }
    setLoading(true);
    const res = await apiFetch(`${API_REVIEWS}/`, { method: "POST", body: JSON.stringify({ product_id: productId, rating, text }) }, token);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    onSuccess();
  };

  return (
    <div className="space-y-3 p-4 rounded-xl" style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.12)" }}>
      <p className="text-xs font-orbitron tracking-widest" style={{ color: "#00f5d4" }}>ОСТАВИТЬ ОТЗЫВ</p>
      <StarRating value={rating} onChange={setRating} size={20} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Расскажи о своём опыте использования..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg outline-none resize-none text-sm"
        style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }}
      />
      {error && <p className="text-xs" style={{ color: "#f55050" }}>{error}</p>}
      <button onClick={submit} disabled={loading}
        className="neon-btn-solid px-5 py-2 rounded-lg text-sm font-semibold">
        {loading ? "Отправка..." : "Отправить отзыв"}
      </button>
    </div>
  );
}

// ── WithdrawModal ──
export function WithdrawModal({ user, token, onClose, onSuccess }: { user: User; token: string; onClose: () => void; onSuccess: (newBalance: number) => void }) {
  const [amount, setAmount] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const amt = parseInt(amount) || 0;
  const commission = Math.round(amt * 0.1);
  const payout = amt - commission;

  const submit = async () => {
    if (amt < 100) { setError("Минимум 100 ₽"); return; }
    if (amt > user.balance) { setError("Недостаточно средств"); return; }
    if (cardNum.replace(/\s/g, "").length < 4) { setError("Введи номер карты"); return; }
    setLoading(true);
    const last4 = cardNum.replace(/\s/g, "").slice(-4);
    const res = await apiFetch(`${API_WITHDRAW}/`, { method: "POST", body: JSON.stringify({ amount: amt, card_last4: last4 }) }, token);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setDone(true);
    onSuccess(user.balance - amt);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(7,11,18,0.9)", backdropFilter: "blur(16px)", zIndex: 65 }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "rgba(10,16,26,0.99)", border: "1px solid rgba(0,245,212,0.2)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-orbitron font-bold" style={{ color: "#e8f4ff" }}>Вывод средств</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Icon name="X" size={14} style={{ color: "#e8f4ff" }} />
          </button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <Icon name="CheckCircle" size={48} style={{ color: "#00f5d4", margin: "0 auto 16px" }} />
            <p className="font-semibold mb-1" style={{ color: "#e8f4ff" }}>Заявка создана!</p>
            <p className="text-sm" style={{ color: "rgba(180,200,220,0.55)" }}>Средства поступят в течение 1–3 рабочих дней</p>
            <button onClick={onClose} className="neon-btn-solid px-6 py-2 rounded-xl mt-5 text-sm font-semibold">Закрыть</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.12)" }}>
              <span className="text-sm" style={{ color: "rgba(180,200,220,0.7)" }}>Доступно</span>
              <span className="font-orbitron font-bold neon-text">{user.balance.toLocaleString()} ₽</span>
            </div>
            <div>
              <label className="text-xs font-orbitron tracking-widest mb-1 block" style={{ color: "#00f5d4" }}>СУММА ВЫВОДА</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" min="100" max={user.balance}
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
            </div>
            <div>
              <label className="text-xs font-orbitron tracking-widest mb-1 block" style={{ color: "#00f5d4" }}>НОМЕР КАРТЫ</label>
              <input
                value={cardNum}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setCardNum(v.replace(/(.{4})/g, "$1 ").trim());
                }}
                placeholder="0000 0000 0000 0000"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm font-orbitron tracking-widest"
                style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff" }} />
            </div>
            {amt > 0 && (
              <div className="rounded-xl p-3 space-y-1 text-sm" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="flex justify-between"><span style={{ color: "rgba(180,200,220,0.55)" }}>Комиссия 10%</span><span style={{ color: "#f55050" }}>−{commission.toLocaleString()} ₽</span></div>
                <div className="flex justify-between font-semibold"><span style={{ color: "#e8f4ff" }}>Получите</span><span className="neon-text">{payout.toLocaleString()} ₽</span></div>
              </div>
            )}
            {error && <p className="text-xs" style={{ color: "#f55050" }}>{error}</p>}
            <button onClick={submit} disabled={loading} className="w-full neon-btn-solid py-3 rounded-xl font-orbitron font-bold text-sm">
              {loading ? "Обработка..." : "Вывести средства"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AuthModal ──
export function AuthModal({ mode, onClose, onLogin, onRegister, onSwitch }: {
  mode: "login" | "register";
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onSwitch: (m: "login" | "register") => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Заполни все поля"); return; }
    if (mode === "register" && !name.trim()) { setError("Введи имя"); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(name, email, password);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(7,11,18,0.9)", backdropFilter: "blur(16px)", zIndex: 65 }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "rgba(10,16,26,0.99)", border: "1px solid rgba(0,245,212,0.2)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => onSwitch(m)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: mode === m ? "#00f5d4" : "transparent", color: mode === m ? "#070b12" : "rgba(180,200,220,0.55)" }}>
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Icon name="X" size={14} style={{ color: "#e8f4ff" }} />
          </button>
        </div>
        <div className="space-y-3">
          {mode === "register" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя"
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
            className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type="password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
          {error && <p className="text-xs" style={{ color: "#f55050" }}>{error}</p>}
          <button onClick={submit} disabled={loading} className="w-full neon-btn-solid py-3 rounded-xl font-orbitron font-bold text-sm">
            {loading ? "..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BuyModal ──
export function BuyModal({ product, token, onClose, onSuccess }: { product: Product; token: string | null; onClose: () => void; onSuccess: (productId: number) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bank, setBank] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [holder, setHolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredBanks = BANKS.filter((b) => b.toLowerCase().includes(bankSearch.toLowerCase()));

  const pay = async () => {
    if (!cardNum || !expiry || !cvv || !holder) { setError("Заполни все поля карты"); return; }
    setLoading(true);
    const res = await apiFetch(`${API_PURCHASES}/`, { method: "POST", body: JSON.stringify({ product_id: product.id }) }, token);
    setLoading(false);
    if (res.error && res.error !== "Уже куплено") { setError(res.error); return; }
    setStep(3);
    onSuccess(product.id);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(7,11,18,0.92)", backdropFilter: "blur(16px)", zIndex: 68 }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "rgba(10,16,26,0.99)", border: "1px solid rgba(0,245,212,0.2)", maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
          <div className="flex items-center gap-2">
            {step === 2 && <button onClick={() => setStep(1)} className="w-7 h-7 rounded-lg flex items-center justify-center mr-1" style={{ background: "rgba(255,255,255,0.06)" }}><Icon name="ArrowLeft" size={13} style={{ color: "#e8f4ff" }} /></button>}
            <h3 className="font-orbitron font-bold text-sm" style={{ color: "#e8f4ff" }}>
              {step === 1 ? "Выберите банк" : step === 2 ? `Оплата — ${bank}` : "Оплата прошла!"}
            </h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Icon name="X" size={14} style={{ color: "#e8f4ff" }} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(90vh - 64px)" }}>
          {/* Step 1: bank */}
          {step === 1 && (
            <div>
              <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} placeholder="Найти банк..."
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm mb-4"
                style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.18)", color: "#e8f4ff", fontFamily: "'Golos Text',sans-serif" }} />
              <div className="grid grid-cols-2 gap-2">
                {filteredBanks.map((b) => (
                  <button key={b} onClick={() => { setBank(b); setStep(2); }}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-all text-left"
                    style={{ background: "rgba(13,20,32,0.8)", border: "1px solid rgba(0,245,212,0.1)", color: "#e8f4ff" }}>
                    <Icon name="CreditCard" size={16} style={{ color: "#00f5d4", flexShrink: 0 }} />
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: card form */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.08), rgba(155,89,245,0.08))", border: "1px solid rgba(0,245,212,0.15)" }}>
                <p className="text-xs" style={{ color: "rgba(180,200,220,0.55)" }}>К оплате</p>
                <p className="font-orbitron font-black text-2xl neon-text">{product.price.toLocaleString()} ₽</p>
                <p className="text-xs mt-1 truncate" style={{ color: "rgba(180,200,220,0.45)" }}>{product.title}</p>
              </div>
              <div>
                <label className="text-xs font-orbitron tracking-widest mb-1 block" style={{ color: "#00f5d4" }}>НОМЕР КАРТЫ</label>
                <input value={cardNum}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g,"").slice(0,16); setCardNum(v.replace(/(.{4})/g,"$1 ").trim()); }}
                  placeholder="0000 0000 0000 0000" maxLength={19}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm font-orbitron tracking-widest"
                  style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-orbitron tracking-widest mb-1 block" style={{ color: "#00f5d4" }}>СРОК</label>
                  <input value={expiry}
                    onChange={(e) => { let v = e.target.value.replace(/\D/g,""); if (v.length > 2) v = v.slice(0,2)+"/"+v.slice(2,4); setExpiry(v); }}
                    placeholder="MM/YY" maxLength={5}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm font-orbitron"
                    style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff" }} />
                </div>
                <div>
                  <label className="text-xs font-orbitron tracking-widest mb-1 block" style={{ color: "#00f5d4" }}>CVV</label>
                  <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g,"").slice(0,3))}
                    placeholder="•••" type="password" maxLength={3}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm font-orbitron"
                    style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff" }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-orbitron tracking-widest mb-1 block" style={{ color: "#00f5d4" }}>ИМЯРЕК</label>
                <input value={holder} onChange={(e) => setHolder(e.target.value.toUpperCase())} placeholder="IVAN IVANOV"
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm font-orbitron tracking-widest"
                  style={{ background: "rgba(13,20,32,0.9)", border: "1px solid rgba(0,245,212,0.2)", color: "#e8f4ff" }} />
              </div>
              {error && <p className="text-xs" style={{ color: "#f55050" }}>{error}</p>}
              <button onClick={pay} disabled={loading} className="w-full neon-btn-solid py-3 rounded-xl font-orbitron font-bold text-sm">
                {loading ? "Обработка..." : `Оплатить ${product.price.toLocaleString()} ₽`}
              </button>
              <p className="text-center text-xs" style={{ color: "rgba(180,200,220,0.3)" }}>
                <Icon name="Lock" size={11} style={{ display: "inline", marginRight: 4 }} />
                Данные карты не сохраняются
              </p>
            </div>
          )}

          {/* Step 3: success */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.3)" }}>
                <Icon name="CheckCircle" size={32} style={{ color: "#00f5d4" }} />
              </div>
              <h3 className="font-orbitron font-bold text-lg mb-2" style={{ color: "#e8f4ff" }}>Оплата прошла!</h3>
              <p className="text-sm mb-1" style={{ color: "rgba(180,200,220,0.55)" }}>{product.title}</p>
              <p className="text-xs mb-6" style={{ color: "rgba(180,200,220,0.35)" }}>Файл добавлен в ваш профиль</p>
              <button onClick={onClose} className="neon-btn-solid px-8 py-3 rounded-xl font-orbitron font-bold text-sm">
                Открыть файл в профиле →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}