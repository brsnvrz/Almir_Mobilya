import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import logo from "@/assets/almir-logo.png";
import { useAuth } from "@/lib/auth";
import { getFullCategories } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Shield, MessageSquare, ChevronDown } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

const FALLBACK_CATEGORIES = [
  { slug: "dolap", name: "Dolaplar" },
  { slug: "kapi", name: "Kapılar" },
  { slug: "parke", name: "Parkeler" },
];

const linkClass =
  "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: ["header-categories"] });
    };
    window.addEventListener("almir-catalog-changed", handler);
    return () => window.removeEventListener("almir-catalog-changed", handler);
  }, [queryClient]);

  const { data: categories } = useQuery({
    queryKey: ["header-categories"],
    queryFn: async () => {
      try {
        const data = await getFullCategories();
        if (!data || data.length === 0) return FALLBACK_CATEGORIES;
        return data;
      } catch {
        return FALLBACK_CATEGORIES;
      }
    },
  });

  const categoryList = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Almir Mobilya Dekorasyon logosu"
            width={44}
            height={44}
            className="size-11 rounded-full ring-1 ring-border object-cover"
          />
          <span className="leading-none">
            <span className="block font-display text-xl font-semibold tracking-tight text-foreground">
              ALMİR
            </span>
            <span className="label-eyebrow">Mobilya Dekorasyon</span>
          </span>
        </Link>

        {/* Masaüstü Navigasyon */}
        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
          <Link
            to="/"
            activeProps={{ className: "bg-ink text-ink-foreground" }}
            className={linkClass}
          >
            Ana Sayfa
          </Link>
          {categoryList.map((cat) => (
            <Link
              key={cat.slug}
              to="/kategori/$category"
              params={{ category: cat.slug }}
              activeProps={{ className: "bg-ink text-ink-foreground" }}
              className={linkClass}
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/mesajlar"
            activeProps={{ className: "bg-ink text-ink-foreground" }}
            className={linkClass}
          >
            Soru Sor / Sohbet
          </Link>
          {isAdmin && (
            <Link
              to="/yonetim"
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold text-primary transition-colors hover:bg-secondary"
            >
              <Shield className="size-4" />
              <span>Yönetim</span>
            </Link>
          )}
        </nav>

        {/* Sağ Taraf: Giriş/Profil & Mobil Menü Butonu */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right text-xs sm:block">
                <span className="block max-w-[170px] truncate font-medium text-foreground">
                  {user.user_metadata?.["full_name"] || user.email}
                </span>
                {isAdmin && (
                  <span className="inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Yönetici
                  </span>
                )}
              </div>
              <button
                onClick={() => void signOut()}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 shadow-sm"
            >
              Giriş Yap
            </button>
          )}

          {/* Mobil Menü Butonu */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg border border-border text-foreground lg:hidden"
            aria-label="Menüyü aç/kapat"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobil Menü Paneli */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              Ana Sayfa
            </Link>
            <div className="my-1 border-t border-border" />
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Kataloglar
            </p>
            {categoryList.map((cat) => (
              <Link
                key={cat.slug}
                to="/kategori/$category"
                params={{ category: cat.slug }}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                {cat.name}
              </Link>
            ))}
            <div className="my-1 border-t border-border" />
            <Link
              to="/mesajlar"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              <MessageSquare className="size-4 text-primary" />
              <span>Soru Sor / Sohbet</span>
            </Link>
            {isAdmin && (
              <Link
                to="/yonetim"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                <Shield className="size-4" />
                <span>Yönetim Paneli</span>
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Giriş Modalı */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
