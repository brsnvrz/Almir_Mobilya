import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DxLTTzyN.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { T as EyeOff, _ as LogIn, g as Mail, s as ShieldCheck, t as X, v as Lock, w as Eye } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthModal-C56nx3nQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ADMIN_EMAILS = ["nevruzbaris@gmail.com", "osmanndemir16@gmail.com"];
function isEmailAdmin(email) {
	if (!email) return false;
	const clean = email.toLowerCase().trim();
	return ADMIN_EMAILS.some((a) => a.toLowerCase().trim() === clean);
}
function stringToUUID(str) {
	let h1 = 1779033703 ^ str.length;
	let h2 = 3144134277 ^ str.length;
	let h3 = 1013904242 ^ str.length;
	let h4 = 2773480762 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		const ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 597399067);
		h2 = Math.imul(h2 ^ ch, 2869860233);
		h3 = Math.imul(h3 ^ ch, 951274213);
		h4 = Math.imul(h4 ^ ch, 2716044179);
	}
	h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
	h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h3 ^ h3 >>> 13, 3266489909);
	h3 = Math.imul(h3 ^ h3 >>> 16, 2246822507) ^ Math.imul(h4 ^ h4 >>> 13, 3266489909);
	h4 = Math.imul(h4 ^ h4 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
	const hex = (n) => (n >>> 0).toString(16).padStart(8, "0");
	const p1 = hex(h1);
	const p2 = hex(h2);
	const p3 = hex(h3);
	const p4 = hex(h4);
	return `${p1}-${p2.substring(0, 4)}-${"4" + p2.substring(5, 8)}-${"a" + p3.substring(1, 4)}-${p3.substring(4, 8) + p4}`;
}
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [isAdmin, setIsAdmin] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const checkAdmin = (current) => {
		if (!current?.user?.email) {
			setIsAdmin(false);
			return;
		}
		setIsAdmin(isEmailAdmin(current.user.email));
	};
	(0, import_react.useEffect)(() => {
		let active = true;
		if (typeof window !== "undefined") {
			try {
				localStorage.removeItem("almir_session");
				for (let i = localStorage.length - 1; i >= 0; i--) {
					const key = localStorage.key(i);
					if (key && (key.startsWith("almir_uid_") || key.startsWith("almir_saved_"))) localStorage.removeItem(key);
				}
			} catch {}
			const saved = sessionStorage.getItem("almir_session");
			if (saved) try {
				const parsed = JSON.parse(saved);
				if (active && parsed?.user) {
					setSession(parsed);
					checkAdmin(parsed);
					setLoading(false);
				}
			} catch {}
		}
		const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
			if (!active) return;
			if (nextSession) {
				if (typeof window !== "undefined") sessionStorage.removeItem("almir_session");
				setSession(nextSession);
				checkAdmin(nextSession);
			}
			setLoading(false);
		});
		supabase.auth.getSession().then(({ data }) => {
			if (!active) return;
			if (data.session) {
				setSession(data.session);
				checkAdmin(data.session);
			}
			setLoading(false);
		});
		return () => {
			active = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	const signInWithEmail = async (email, password) => {
		const clean = email.toLowerCase().trim();
		if (!clean) throw new Error("Lütfen e-posta adresinizi giriniz.");
		if (!clean.includes("@") || !clean.includes(".")) throw new Error("Lütfen geçerli bir e-posta adresi giriniz.");
		const isCurrentAdmin = isEmailAdmin(clean);
		if (isCurrentAdmin) {
			if (!password || !password.trim()) throw new Error("Yönetici girişi için şifre gereklidir.");
			if (password.trim() !== "almir2026") throw new Error("Yönetici şifresi hatalı!");
		}
		const fakeUser = {
			id: stringToUUID(clean),
			app_metadata: { provider: "email" },
			user_metadata: {
				full_name: clean.split("@")[0],
				email: clean,
				role: isCurrentAdmin ? "admin" : "user"
			},
			aud: "authenticated",
			created_at: (/* @__PURE__ */ new Date()).toISOString(),
			email: clean,
			phone: "",
			role: "authenticated",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		const fakeSession = {
			access_token: "almir-token-" + Date.now(),
			refresh_token: "almir-refresh-" + Date.now(),
			expires_in: 86400,
			token_type: "bearer",
			user: fakeUser
		};
		if (typeof window !== "undefined") sessionStorage.setItem("almir_session", JSON.stringify(fakeSession));
		setSession(fakeSession);
		setIsAdmin(isCurrentAdmin);
		return {
			user: fakeUser,
			isAdmin: isCurrentAdmin
		};
	};
	const signOut = async () => {
		if (typeof window !== "undefined") {
			sessionStorage.removeItem("almir_session");
			localStorage.removeItem("almir_session");
		}
		try {
			await supabase.auth.signOut();
		} catch {}
		setSession(null);
		setIsAdmin(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			session,
			user: session?.user ?? null,
			isAdmin,
			loading,
			signInWithEmail,
			signOut,
			refreshAdmin: async () => {
				checkAdmin(session);
			},
			sendOtp: async (e, p) => {
				await signInWithEmail(e, p);
			},
			verifyOtp: async (e, p) => {
				await signInWithEmail(e, p);
			}
		},
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
function AuthModal({ isOpen, onClose }) {
	const { signInWithEmail } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
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
			if ((await signInWithEmail(clean, password)).isAdmin) toast.success("Yönetici girişi başarılı! Hoş geldiniz.");
			else toast.success("Giriş yapıldı! Hoş geldiniz.");
			setEmail("");
			setPassword("");
			setShowPassword(false);
			onClose();
		} catch (err) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200",
		onClick: handleClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel relative w-full max-w-sm bg-card p-6 shadow-2xl border border-border rounded-2xl",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleClose,
					className: "absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
					"aria-label": "Kapat",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label-eyebrow",
							children: "Almir Mobilya"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-2xl font-semibold tracking-tight text-foreground",
							children: "Giriş Yapın"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: isAdminAccount ? "Yönetici hesabı tespit edildi. Lütfen şifrenizi giriniz." : "E-posta adresinizle doğrudan giriş yapabilirsiniz."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1.5 block text-xs font-medium text-foreground",
							children: "E-posta Adresi"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "ornek@gmail.com",
								autoFocus: true,
								autoComplete: "off",
								disabled: loading,
								className: "w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
								onKeyDown: (e) => {
									if (e.key === "Enter" && email.trim() && !loading) {
										if (!isAdminAccount) handleLogin();
									}
								}
							})]
						})] }),
						isAdminAccount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 animate-in fade-in slide-in-from-top-2 duration-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Yönetici Doğrulaması" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1.5 block text-xs font-medium text-foreground",
								children: "Yönetici Şifresi"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: showPassword ? "text" : "password",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										placeholder: "Şifrenizi giriniz",
										autoComplete: "new-password",
										disabled: loading,
										className: "w-full rounded-xl border border-input bg-background py-3 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
										onKeyDown: (e) => {
											if (e.key === "Enter" && !loading) handleLogin();
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowPassword(!showPassword),
										tabIndex: -1,
										className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
										"aria-label": showPassword ? "Şifreyi gizle" : "Şifreyi göster",
										children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
									})
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => void handleLogin(),
							disabled: !email.trim() || isAdminAccount && !password.trim() || loading,
							className: "flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "size-4" }), loading ? "Giriş yapılıyor…" : isAdminAccount ? "Yönetici Olarak Giriş Yap" : "Giriş Yap"]
						})
					]
				})
			]
		})
	});
}
//#endregion
export { useAuth as i, AuthModal as n, AuthProvider as r, ADMIN_EMAILS as t };
