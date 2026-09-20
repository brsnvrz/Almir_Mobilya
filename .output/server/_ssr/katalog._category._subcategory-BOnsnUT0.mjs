import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/katalog._category._subcategory-BOnsnUT0.js
var $$splitComponentImporter = () => import("./katalog._category._subcategory-D-eB8WGQ.mjs");
var Route = createFileRoute("/katalog/$category/$subcategory")({
	head: ({ params }) => {
		const title = `${params.subcategory} Kataloğu — Almir Mobilya`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: "Malzeme, ölçü ve fiyat bilgileriyle Almir Mobilya ürün kataloğu."
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: "Malzeme, ölçü ve fiyat bilgileriyle Almir Mobilya ürün kataloğu."
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
