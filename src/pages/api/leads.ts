import type { APIRoute } from 'astro';

// Endpoint temporal de Fase 1: envía el lead por correo con Resend.
// En Fase 3 se reemplaza por POST {BACKOFFICE_URL}/api/public/leads (PUBLIC_LEADS_ENDPOINT).
export const prerender = false;

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Honeypot: los bots rellenan "company"; respondemos 200 sin hacer nada.
  if (body.company) return new Response(null, { status: 204 });

  const name = String(body.name ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  if (name.length < 2 || phone.length < 6 || name.length > 120 || String(body.message ?? '').length > 4000) {
    return new Response('Invalid', { status: 422 });
  }

  const key = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.LEADS_NOTIFY_TO;
  if (!key || !to) {
    console.warn('[leads] RESEND_API_KEY/LEADS_NOTIFY_TO no configurados; lead:', { name, phone });
    return new Response(null, { status: 204 });
  }

  const fields: [string, string][] = [
    ['name', 'Nombre'],
    ['phone', 'Teléfono'],
    ['email', 'Correo'],
    ['contactPref', 'Prefiere'],
    ['service', 'Servicio'],
    ['space', 'Lugar'],
    ['projectType', 'Tipo (CRM)'],
    ['areaRange', 'Área'],
    ['areaM2', 'Área exacta (m²)'],
    ['siteState', 'Estado del lugar'],
    ['timeline', 'Inicio'],
    ['budget', 'Presupuesto'],
    ['city', 'Ubicación'],
    ['message', 'Mensaje'],
  ];
  const rows = fields
    .filter(([k]) => body[k] !== undefined && body[k] !== '')
    .map(([k, label]) => `<tr><td><b>${label}</b></td><td>${esc(body[k])}</td></tr>`)
    .join('');
  // Asunto pensado para triar desde la bandeja: servicio, tamaño y presupuesto de un vistazo.
  const subject = ['Nuevo lead', name, body.service, body.areaRange, body.budget]
    .filter(Boolean)
    .map(String)
    .join(' · ');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: import.meta.env.LEADS_FROM ?? 'Ko-Sama Web <web@kosama.pe>',
      to: to.split(','),
      reply_to: body.email || undefined,
      subject,
      html: `<table>${rows}</table><pre>${esc(JSON.stringify(body.utm))}</pre>`,
    }),
  });

  return new Response(null, { status: res.ok ? 204 : 502 });
};
