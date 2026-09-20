import { n as __toESM } from "../_runtime.mjs";
import { i as getCategoryPageData } from "./catalog-C46Q34UE.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as formatPrice } from "./format-zQdBECWS.mjs";
import { M as ArrowRight, i as Sparkles, x as Funnel, y as Layers } from "../_libs/lucide-react.mjs";
import { t as Route } from "./kategori._category-BmbIJCrn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kategori._category-BJtlKl92.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CategoryPage() {
	const { category } = Route.useParams();
	const [activeSubId, setActiveSubId] = (0, import_react.useState)("all");
	const { data, isLoading, isError } = useQuery({
		queryKey: ["category-page", category],
		queryFn: async () => {
			const result = await getCategoryPageData(category);
			if (!result) return null;
			return result;
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-48 animate-pulse rounded-md bg-secondary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-12 w-96 animate-pulse rounded-md bg-secondary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[4/3] animate-pulse rounded-2xl bg-secondary" }, i))
			})
		]
	});
	if (isError || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Kategori Bulunamadı"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-muted-foreground",
				children: [
					"Aradığınız \"",
					category,
					"\" kategorisi mevcut değil veya kaldırılmış olabilir."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground",
				children: "Ana Sayfaya Dön"
			})
		]
	});
	const { cat, subs, products } = data;
	const filteredProducts = activeSubId === "all" ? products : products.filter((p) => p.subcategory_id === activeSubId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex items-center gap-2 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "hover:text-foreground",
						children: "Ana Sayfa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "/" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: cat.name
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "label-eyebrow",
						children: "Almir Mobilya Kataloğu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl",
						children: cat.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-base text-muted-foreground",
						children: cat.description || "Ölçüye özel tasarım ve kaliteli üretim seçenekleri."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-border bg-secondary px-3 py-1 font-medium text-foreground",
						children: [subs.length, " Alt Kategori"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full border border-border bg-secondary px-3 py-1 font-medium text-foreground",
						children: [products.length, " Ürün"]
					})]
				})]
			}),
			subs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-xl font-semibold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Alt Kategoriler" })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: subs.map((sub) => {
						const count = products.filter((p) => p.subcategory_id === sub.id).length;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/katalog/$category/$subcategory",
							params: {
								category: cat.slug,
								subcategory: sub.slug
							},
							className: "group panel relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg font-semibold group-hover:text-primary transition-colors",
									children: sub.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
									children: sub.description || "Özel ölçü ve malzeme seçenekleri"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [count, " Model"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-primary group-hover:underline",
									children: "Kataloğu Aç →"
								})]
							})]
						}, sub.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-14 border-t border-border pt-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-2xl font-semibold tracking-tight flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ürün Kataloğu" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "İncelemek istediğiniz alt kategoriye tıklayarak ürünleri anında filtreleyin."
						})] })
					}),
					subs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center gap-2 border-b border-border pb-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-3.5" }), "Filtrele:"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setActiveSubId("all"),
								className: `rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeSubId === "all" ? "bg-ink text-ink-foreground shadow-sm ring-2 ring-primary/20" : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"}`,
								children: [
									"Tümü (",
									products.length,
									")"
								]
							}),
							subs.map((sub) => {
								const count = products.filter((p) => p.subcategory_id === sub.id).length;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setActiveSubId(sub.id),
									className: `rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeSubId === sub.id ? "bg-ink text-ink-foreground shadow-sm ring-2 ring-primary/20" : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"}`,
									children: [
										sub.name,
										" (",
										count,
										")"
									]
								}, sub.id);
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
						children: filteredProducts.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/urun/$productId",
							params: { productId: product.id },
							className: "group panel overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative aspect-square w-full overflow-hidden rounded-xl bg-secondary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: product.image_url || "/images/kategori-dolap.jpg",
									alt: product.name,
									width: 900,
									height: 900,
									loading: "lazy",
									className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								}), product.subcategories?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-sm",
									children: product.subcategories.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-2 pt-4 pb-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors",
											children: product.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "whitespace-nowrap font-display text-lg font-bold text-primary",
											children: formatPrice(product.price ? Number(product.price) : null, product.currency)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
										children: product.summary || product.description
									}),
									Array.isArray(product.materials) && product.materials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-1.5",
										children: [product.materials.slice(0, 3).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-md border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
											children: m
										}, m)), product.materials.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] text-muted-foreground",
											children: ["+", product.materials.length - 3]
										})]
									})
								]
							})]
						}, product.id))
					}),
					filteredProducts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "my-16 rounded-2xl border border-dashed border-border py-12 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-base text-muted-foreground",
							children: "Bu kategoride henüz gösterilecek ürün bulunmuyor."
						})
					})
				]
			})
		]
	});
}
//#endregion
export { CategoryPage as component };
