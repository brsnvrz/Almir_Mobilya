import { Link } from "@tanstack/react-router";
import logo from "@/assets/almir-logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Almir Mobilya logosu"
            width={40}
            height={40}
            loading="lazy"
            className="size-10 rounded-full object-cover"
          />
          <div>
            <p className="font-display text-lg font-semibold">Almir Mobilya Dekorasyon</p>
            <p className="text-sm opacity-70">Ölçüye özel dolap, kapı ve parke üretimi</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <a href="tel:+905356871542" className="font-semibold text-primary">
            0535 687 15 42
          </a>
          <Link to="/mesajlar" className="opacity-80 hover:opacity-100">
            Soru sor
          </Link>
        </div>
      </div>
      <div className="border-t border-sidebar-border px-5 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Almir Mobilya Dekorasyon
      </div>
    </footer>
  );
}
