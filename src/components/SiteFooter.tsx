import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MessageSquare } from "lucide-react";
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

        {/* İletişim ve Sosyal Medya (Alt Alta Satırlar) */}
        <div className="flex flex-col gap-3 text-sm sm:items-end">
          {/* 1. Satır: İletişim & Gmail & Soru Sor */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="tel:+905356871542"
              className="flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <Phone className="size-3.5" />
              <span>0535 687 15 42</span>
            </a>

            <a
              href="mailto:osmanndemir16@gmail.com?subject=Almir%20Mobilya%20Bilgi%20Talebi"
              className="flex items-center gap-1.5 opacity-85 transition-all hover:opacity-100 hover:text-red-400"
              title="Gmail ile e-posta gönder"
            >
              <Mail className="size-3.5 text-red-400" />
              <span>Gmail (osmanndemir16@gmail.com)</span>
            </a>

            <Link
              to="/mesajlar"
              className="flex items-center gap-1.5 opacity-80 transition-colors hover:opacity-100 hover:text-foreground"
            >
              <MessageSquare className="size-3.5" />
              <span>Soru sor</span>
            </Link>
          </div>

          {/* 2. Satır: Sosyal Medya Linkleri */}
          <div className="flex flex-wrap items-center gap-4 pt-1 sm:justify-end">
            <a
              href="https://www.instagram.com/almir_mobilya_dekorasyon/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 opacity-80 transition-all hover:opacity-100 hover:text-pink-400"
              title="Instagram'da Almir Mobilya"
            >
              <Instagram className="size-4 text-pink-400" />
              <span className="text-xs font-medium">Instagram</span>
            </a>

            <a
              href="https://www.facebook.com/people/Almir-mobilya-dekorasyon/100065727843245/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 opacity-80 transition-all hover:opacity-100 hover:text-blue-400"
              title="Facebook'ta Almir Mobilya"
            >
              <Facebook className="size-4 text-blue-400" />
              <span className="text-xs font-medium">Facebook</span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-sidebar-border px-5 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Almir Mobilya Dekorasyon
      </div>
    </footer>
  );
}
