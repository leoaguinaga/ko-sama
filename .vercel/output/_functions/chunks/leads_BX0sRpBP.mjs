import { n as __exportAll } from "./rolldown-runtime_DktXgydw.mjs";
//#region src/pages/api/leads.ts
var leads_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	let body;
	try {
		body = await request.json();
	} catch {
		return new Response("Bad request", { status: 400 });
	}
	if (body.company) return new Response(null, { status: 204 });
	const name = String(body.name ?? "").trim();
	const phone = String(body.phone ?? "").trim();
	if (name.length < 2 || phone.length < 6 || name.length > 120 || String(body.message ?? "").length > 4e3) return new Response("Invalid", { status: 422 });
	console.warn("[leads] RESEND_API_KEY/LEADS_NOTIFY_TO no configurados; lead:", {
		name,
		phone
	});
	return new Response(null, { status: 204 });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/leads@_@ts
var page = () => leads_exports;
//#endregion
export { page };
