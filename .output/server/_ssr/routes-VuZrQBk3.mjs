import { a as getFullCategories } from "./catalog-C46Q34UE.mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-VuZrQBk3.js
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_CATEGORIES = [
	{
		id: "1",
		slug: "dolap",
		name: "Dolaplar",
		description: "Mutfak dolabı, gardırop, banyo dolabı ve kitaplık çözümleri.",
		image_url: "/images/kategori-dolap.jpg"
	},
	{
		id: "2",
		slug: "kapi",
		name: "Kapılar",
		description: "İç mekan, çerçeveli ve masif kapı modelleri.",
		image_url: "/images/kategori-kapi.jpg"
	},
	{
		id: "3",
		slug: "parke",
		name: "Parkeler",
		description: "Masif, lamine ve balık sırtı parke uygulamaları.",
		image_url: "/images/kategori-parke.jpg"
	}
];
function Index() {
	const { data: categories = DEFAULT_CATEGORIES } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			try {
				const data = await getFullCategories();
				if (!data || data.length === 0) return DEFAULT_CATEGORIES;
				return data;
			} catch {
				return DEFAULT_CATEGORIES;
			}
		},
		initialData: DEFAULT_CATEGORIES
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-eyebrow",
					children: "Almir Mobilya Dekorasyon"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-4 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl",
					children: [
						"Ölçüye özel mobilya,",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"atölyeden evinize."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 max-w-lg text-lg text-muted-foreground",
					children: "Dolaptan parkeye, kapıdan gardıroba. Kataloglarımızda her ürünün malzemesi, ölçüsü ve fiyatı açık yazar."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/kategori/$category",
						params: { category: "dolap" },
						className: "rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ink-foreground",
						children: "Katalogları keşfet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/mesajlar",
						className: "rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary",
						children: "Soru sor"
					})]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-2xl border border-border shadow-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/images/hero-mutfak.jpg",
					alt: "Almir Mobilya ölçüye özel meşe mutfak dolabı uygulaması",
					width: 1600,
					height: 1104,
					className: "h-full w-full object-cover"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "pb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl tracking-tight",
					children: "Kategoriler"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm text-muted-foreground",
					children: [categories?.length ?? 0, " ana kategori"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-5 md:grid-cols-3",
				children: categories?.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/kategori/$category",
					params: { category: cat.slug },
					className: "group panel overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: cat.image_url || "/images/kategori-dolap.jpg",
						alt: `${cat.name} kategorisi`,
						width: 1200,
						height: 900,
						loading: "lazy",
						className: "aspect-[4/3] w-full rounded-lg object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-2 pb-1 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl font-semibold",
							children: cat.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "line-clamp-1 text-sm text-muted-foreground",
							children: cat.description
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-full bg-secondary text-lg",
							children: "→"
						})]
					})]
				}, cat.id))
			})]
		})]
	});
}
//#endregion
export { Index as component };
