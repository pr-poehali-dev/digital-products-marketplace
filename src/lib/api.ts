export const API_AUTH = "https://functions.poehali.dev/a966ab02-096a-4974-8c93-2dedd0bbe06e";
export const API_PRODUCTS = "https://functions.poehali.dev/c27dccf7-e55b-44dc-8302-06794ba653c4";
export const API_PURCHASES = "https://functions.poehali.dev/498eb5ba-557f-4716-86ff-ae68a99d2c97";
export const API_REVIEWS = "https://functions.poehali.dev/44f977bc-18dc-4dfe-a3d0-e5f29f688e29";
export const API_WITHDRAW = "https://functions.poehali.dev/44d3ff7b-66b3-4362-85ea-4a4e78a0ef25";

export async function apiFetch(url: string, opts: RequestInit = {}, token?: string | null) {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (token) h["X-Auth-Token"] = token;
  try {
    const r = await fetch(url, { ...opts, headers: h });
    return r.json();
  } catch {
    return { error: "Ошибка соединения с сервером" };
  }
}

export type Product = {
  id: number;
  title: string;
  author: string;
  seller_id: number;
  price: number;
  category: string;
  preview_url: string;
  file_url: string;
  file_format: string;
  file_name: string;
  rating: number;
  sales_count: number;
  description: string;
};

export type Review = {
  id: number;
  user_name: string;
  rating: number;
  text: string;
  created_at: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  balance: number;
  purchased: number[];
};

export type Page = "home" | "catalog" | "upload" | "profile";
export type ViewMode = "grid" | "list";

export const CATEGORY_COLORS: Record<string, string> = {
  Документы: "rgba(0,245,212,0.15)",
  Презентации: "rgba(155,89,245,0.15)",
  Таблицы: "rgba(0,200,255,0.15)",
  Дизайн: "rgba(245,0,200,0.15)",
  Фото: "rgba(245,180,0,0.15)",
  Другое: "rgba(100,100,100,0.15)",
};

export const CATEGORY_TEXT: Record<string, string> = {
  Документы: "#00f5d4",
  Презентации: "#9b59f5",
  Таблицы: "#00c8ff",
  Дизайн: "#f500c8",
  Фото: "#f5b400",
  Другое: "#888888",
};

export const CATEGORY_ICONS: Record<string, string> = {
  Все: "LayoutGrid",
  Документы: "FileText",
  Презентации: "Presentation",
  Таблицы: "Table",
  Дизайн: "Palette",
  Фото: "Image",
  Другое: "File",
};

export const CATEGORIES = ["Все", "Документы", "Презентации", "Таблицы", "Дизайн", "Фото", "Другое"];

export const BANKS = [
  "Сбербанк","Тинькофф","ВТБ","Альфа-Банк","Газпромбанк",
  "Росбанк","Открытие","Совкомбанк","Райффайзен","Другой банк"
];