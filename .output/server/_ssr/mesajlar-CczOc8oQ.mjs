import { f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mesajlar-CczOc8oQ.js
var $$splitComponentImporter = () => import("./mesajlar-G0yl2w9g.mjs");
var Route = createFileRoute("/mesajlar")({
	validateSearch: (search) => typeof search["urun"] === "string" ? { urun: search["urun"] } : {},
	head: () => ({ meta: [
		{ title: "Sohbet ve Sorular — Almir Mobilya" },
		{
			name: "description",
			content: "Almir Mobilya ekibine ürün, ölçü ve fiyat sorularınızı iletin; yanıtları bu sayfadan anlık takip edin."
		},
		{
			property: "og:title",
			content: "Sohbet ve Sorular — Almir Mobilya"
		},
		{
			property: "og:description",
			content: "Sorunuzu iletin, Almir Mobilya ekibi doğrudan yanıtlasın."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
