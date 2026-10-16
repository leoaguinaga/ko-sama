import { useState, type FormEvent } from 'react';

interface Props {
  endpoint: string;
  whatsappHref: string;
}

type Status = 'idle' | 'sending' | 'ok' | 'error';

const types = ['Vivienda', 'Empresa', 'Espacio público', 'Hospedaje', 'Otro'];

const field =
  'w-full bg-surface px-4 py-3 text-[17px] text-ink placeholder:text-muted outline-none transition-colors focus:bg-paper focus-visible:outline-2 focus-visible:outline-accent';

export default function ContactForm({ endpoint, whatsappHref }: Props) {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const params = new URLSearchParams(location.search);
    const payload = {
      ...data,
      utm: {
        source: params.get('utm_source'),
        medium: params.get('utm_medium'),
        campaign: params.get('utm_campaign'),
        referrer: document.referrer || null,
      },
    };
    setStatus('sending');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('ok');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div role="status" className="bg-surface p-8">
        <p className="text-statement leading-tight">Gracias. Te escribimos en menos de 24 horas hábiles.</p>
        <p className="mt-4">
          Si es urgente,{' '}
          <a className="link-u" href={whatsappHref}>
            escríbenos por WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3" noValidate={false}>
      <label className="col-span-2 md:col-span-1">
        <span className="mb-1.5 block text-note">Nombre</span>
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="col-span-2 md:col-span-1">
        <span className="mb-1.5 block text-note">Teléfono o WhatsApp</span>
        <input name="phone" required type="tel" autoComplete="tel" inputMode="tel" className={field} />
      </label>
      <label className="col-span-2 md:col-span-1">
        <span className="mb-1.5 block text-note">Correo (opcional)</span>
        <input name="email" type="email" autoComplete="email" className={field} />
      </label>
      <label className="col-span-2 md:col-span-1">
        <span className="mb-1.5 block text-note">Tipo de proyecto</span>
        <select name="projectType" defaultValue="Vivienda" className={field}>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="col-span-2 md:col-span-1">
        <span className="mb-1.5 block text-note">Distrito o ciudad</span>
        <input name="city" placeholder="Pimentel, Chiclayo…" className={field} />
      </label>
      <label className="col-span-2 md:col-span-1">
        <span className="mb-1.5 block text-note">Área aproximada (m²)</span>
        <input name="areaM2" type="number" min={1} inputMode="numeric" className={field} />
      </label>
      <label className="col-span-2">
        <span className="mb-1.5 block text-note">Cuéntanos del lugar</span>
        <textarea name="message" rows={4} className={field} />
      </label>
      {/* Honeypot */}
      <label className="absolute -left-[9999px]" aria-hidden="true">
        Empresa
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="col-span-2 mt-3 flex flex-wrap items-center gap-5">
        <button type="submit" className="btn-dot disabled:opacity-60" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando…' : 'Enviar'}
        </button>
        {status === 'error' && (
          <p role="alert">
            No se pudo enviar.{' '}
            <a className="link-u" href={whatsappHref}>
              Escríbenos por WhatsApp
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
