import { useState } from "react";
import { useAuth, isEmailAdmin } from "@/lib/auth";
import { toast } from "sonner";
import { X, Mail, LogIn, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isAdminAccount = isEmailAdmin(email.trim());

  const handleLogin = async () => {
    const clean = email.trim();
    if (!clean) {
      toast.error("Lütfen e-posta adresinizi giriniz.");
      return;
    }

    if (isAdminAccount && !password.trim()) {
      toast.error("Lütfen yönetici şifresini giriniz.");
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(clean, password);
      if (result.isAdmin) {
        toast.success("Yönetici girişi başarılı! Hoş geldiniz.");
      } else {
        toast.success("Giriş yapıldı! Hoş geldiniz.");
      }
      setEmail("");
      setPassword("");
      setShowPassword(false);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setEmail("");
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="panel relative w-full max-w-sm bg-card p-6 shadow-2xl border border-border rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat Butonu */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Kapat"
        >
          <X className="size-5" />
        </button>

        {/* Başlık ve Açıklama */}
        <div className="text-center">
          <span className="label-eyebrow">Almir Mobilya</span>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
            Giriş Yapın
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {isAdminAccount
              ? "Yönetici hesabı tespit edildi. Lütfen şifrenizi giriniz."
              : "E-posta adresinizle doğrudan giriş yapabilirsiniz."}
          </p>
        </div>

        {/* Giriş Formu */}
        <div className="mt-6 space-y-4">
          {/* E-posta Alanı */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@gmail.com"
                autoFocus
                autoComplete="off"
                disabled={loading}
                className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email.trim() && !loading) {
                    if (!isAdminAccount) {
                      void handleLogin();
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Yönetici Şifre Alanı (Sadece Admin e-postası girildiğinde görünür) */}
          {isAdminAccount && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary">
                <ShieldCheck className="size-4 shrink-0" />
                <span>Yönetici Doğrulaması</span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Yönetici Şifresi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi giriniz"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        void handleLogin();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Giriş Butonu */}
          <button
            onClick={() => void handleLogin()}
            disabled={!email.trim() || (isAdminAccount && !password.trim()) || loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="size-4" />
            {loading
              ? "Giriş yapılıyor…"
              : isAdminAccount
              ? "Yönetici Olarak Giriş Yap"
              : "Giriş Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}
