import { n as __toESM } from "../_runtime.mjs";
import { a as getFullCategories } from "./catalog-C46Q34UE.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, r as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$3 } from "./katalog._category._subcategory-BOnsnUT0.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { m as Menu, o as Shield, p as MessageSquare, t as X } from "../_libs/lucide-react.mjs";
import { t as Route$4 } from "./kategori._category-BmbIJCrn.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { i as useAuth, n as AuthModal, r as AuthProvider } from "./AuthModal-C56nx3nQ.mjs";
import { t as Route$5 } from "./mesajlar-CczOc8oQ.mjs";
import { t as Route$6 } from "./urun._productId-nl4lRe96.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C6g-W9qx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DoZho6KP.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var almir_logo_default = "/assets/almir-logo-JESBgWOf.png";
var FALLBACK_CATEGORIES = [
	{
		slug: "dolap",
		name: "Dolaplar"
	},
	{
		slug: "kapi",
		name: "Kapılar"
	},
	{
		slug: "parke",
		name: "Parkeler"
	}
];
var linkClass = "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
function SiteHeader() {
	const { user, isAdmin, signOut } = useAuth();
	const queryClient = useQueryClient();
	const [authModalOpen, setAuthModalOpen] = (0, import_react.useState)(false);
	const [mobileMenuOpen, setMobileMenuOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const handler = () => {
			queryClient.invalidateQueries({ queryKey: ["header-categories"] });
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
		}
	});
	const categoryList = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: almir_logo_default,
							alt: "Almir Mobilya Dekorasyon logosu",
							width: 44,
							height: 44,
							className: "size-11 rounded-full ring-1 ring-border object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "leading-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-display text-xl font-semibold tracking-tight text-foreground",
								children: "ALMİR"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "label-eyebrow",
								children: "Mobilya Dekorasyon"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "hidden items-center gap-1 text-sm font-medium lg:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								activeProps: { className: "bg-ink text-ink-foreground" },
								className: linkClass,
								children: "Ana Sayfa"
							}),
							categoryList.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/kategori/$category",
								params: { category: cat.slug },
								activeProps: { className: "bg-ink text-ink-foreground" },
								className: linkClass,
								children: cat.name
							}, cat.slug)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/mesajlar",
								activeProps: { className: "bg-ink text-ink-foreground" },
								className: linkClass,
								children: "Soru Sor / Sohbet"
							}),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/yonetim",
								activeProps: { className: "bg-primary text-primary-foreground" },
								className: "flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold text-primary transition-colors hover:bg-secondary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Yönetim" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden text-right text-xs sm:block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block max-w-[170px] truncate font-medium text-foreground",
									children: user.user_metadata?.["full_name"] || user.email
								}), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary",
									children: "Yönetici"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void signOut(),
								className: "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary",
								children: "Çıkış"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setAuthModalOpen(true),
							className: "rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 shadow-sm",
							children: "Giriş Yap"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMobileMenuOpen((v) => !v),
							className: "grid size-9 place-items-center rounded-lg border border-border text-foreground lg:hidden",
							"aria-label": "Menüyü aç/kapat",
							children: mobileMenuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						})]
					})
				]
			}),
			mobileMenuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border bg-card px-5 py-4 lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex flex-col gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							onClick: () => setMobileMenuOpen(false),
							className: "rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary",
							children: "Ana Sayfa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-1 border-t border-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
							children: "Kataloglar"
						}),
						categoryList.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/kategori/$category",
							params: { category: cat.slug },
							onClick: () => setMobileMenuOpen(false),
							className: "rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary",
							children: cat.name
						}, cat.slug)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-1 border-t border-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/mesajlar",
							onClick: () => setMobileMenuOpen(false),
							className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Soru Sor / Sohbet" })]
						}),
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/yonetim",
							onClick: () => setMobileMenuOpen(false),
							className: "flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Yönetim Paneli" })]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthModal, {
				isOpen: authModalOpen,
				onClose: () => setAuthModalOpen(false)
			})
		]
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-20 border-t border-border bg-ink text-ink-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: almir_logo_default,
					alt: "Almir Mobilya logosu",
					width: 40,
					height: 40,
					loading: "lazy",
					className: "size-10 rounded-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg font-semibold",
					children: "Almir Mobilya Dekorasyon"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm opacity-70",
					children: "Ölçüye özel dolap, kapı ve parke üretimi"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-5 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "tel:+905356871542",
					className: "font-semibold text-primary",
					children: "0535 687 15 42"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/mesajlar",
					className: "opacity-80 hover:opacity-100",
					children: "Soru sor"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-sidebar-border px-5 py-4 text-center text-xs opacity-60",
			children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" Almir Mobilya Dekorasyon"
			]
		})]
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error("Root error boundary caught error:", error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-display font-semibold tracking-tight text-foreground",
					children: "Sayfa Yüklenemedi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Sayfa yüklenirken bir sorun oluştu. Sayfayı yenileyebilir veya ana sayfaya dönebilirsiniz."
				}),
				error?.message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-hidden rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-left",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-mono text-destructive break-words",
						children: error.message
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							if (typeof window !== "undefined") window.location.reload();
							else {
								router.invalidate();
								reset();
							}
						},
						className: "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90",
						children: "Sayfayı Yenile"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary",
						children: "Ana Sayfaya Dön"
					})]
				})
			]
		})
	});
}
var Route$2 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Lovable App" },
			{
				name: "description",
				content: "Lovable Generated Project"
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Lovable App"
			},
			{
				property: "og:description",
				content: "Lovable Generated Project"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$2.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-screen flex-col bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
					richColors: true,
					position: "top-right"
				})
			]
		}) })
	});
}
var $$splitComponentImporter$1 = () => import("./routes-VuZrQBk3.mjs");
var Route$1 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Almir Mobilya Dekorasyon — Ölçüye Özel Dolap, Kapı, Parke" },
		{
			name: "description",
			content: "Almir Mobilya Dekorasyon: mutfak dolabı, gardırop, kapı ve parke katalogları. Malzeme, ölçü ve fiyat bilgileriyle ölçüye özel üretim."
		},
		{
			property: "og:title",
			content: "Almir Mobilya Dekorasyon"
		},
		{
			property: "og:description",
			content: "Ölçüye özel mutfak dolabı, gardırop, kapı ve parke katalogları."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./yonetim-DRzWTSxM.mjs");
var Route = createFileRoute("/yonetim")({
	head: () => ({ meta: [
		{ title: "Yönetim Paneli — Almir Mobilya" },
		{
			name: "description",
			content: "Almir Mobilya katalog, ürün ve mesaj yönetimi."
		},
		{
			name: "robots",
			content: "noindex"
		},
		{
			property: "og:title",
			content: "Yönetim Paneli — Almir Mobilya"
		},
		{
			property: "og:description",
			content: "Almir Mobilya katalog, ürün ve mesaj yönetimi."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$1.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$2
	}),
	MesajlarRoute: Route$5.update({
		id: "/mesajlar",
		path: "/mesajlar",
		getParentRoute: () => Route$2
	}),
	YonetimRoute: Route.update({
		id: "/yonetim",
		path: "/yonetim",
		getParentRoute: () => Route$2
	}),
	KategoriCategoryRoute: Route$4.update({
		id: "/kategori/$category",
		path: "/kategori/$category",
		getParentRoute: () => Route$2
	}),
	UrunProductIdRoute: Route$6.update({
		id: "/urun/$productId",
		path: "/urun/$productId",
		getParentRoute: () => Route$2
	}),
	KatalogCategorySubcategoryRoute: Route$3.update({
		id: "/katalog/$category/$subcategory",
		path: "/katalog/$category/$subcategory",
		getParentRoute: () => Route$2
	})
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
