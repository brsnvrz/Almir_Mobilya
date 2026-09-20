import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kategori._category-BmbIJCrn.js
var $$splitComponentImporter = () => import("./kategori._category-BJtlKl92.mjs");
var Route = createFileRoute("/kategori/$category")({
	head: ({ params }) => {
		const title = `${params.category.charAt(0).toUpperCase() + params.category.slice(1)} Kataloğu — Almir Mobilya`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: "Almir Mobilya ölçüye özel üretim kategorisindeki alt gruplar, modeller ve şık ürün katalogları."
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: "Ölçüye özel mobilya ve ahşap dekorasyon katalogları."
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
