import { cloneElement, useEffect, useId, useRef, useState, type FormEvent, type ReactElement } from 'react';
import { contactPrefs, projectTypeFor, questions, type Question } from '../data/lead-questions';

interface Props {
  endpoint: string;
  whatsappHref: string;
}

type Status = 'idle' | 'sending' | 'ok' | 'error';
type Answers = Partial<Record<Question['key'], string>>;
interface Contact {
  name: string;
  phone: string;
  email: string;
  city: string;
  areaM2: string;
  contactPref: (typeof contactPrefs)[number];
  message: string;
}
type Errors = Partial<Record<'name' | 'phone' | 'email', string>>;

const DRAFT = 'kosama-lead-draft';
const total = questions.length + 1;
const emptyContact: Contact = { name: '', phone: '', email: '', city: '', areaM2: '', contactPref: 'WhatsApp', message: '' };

// La línea inferior delimita el campo (WCAG 1.4.11: ≥3:1 frente al fondo); el relleno solo no basta.
const field =
  'w-full border-b border-muted bg-surface px-4 py-3 text-[17px] text-ink placeholder:text-muted outline-none transition-colors hover:border-ink focus:border-ink focus:bg-paper focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-accent-fill';

function readDraft(): { step: number; answers: Answers; contact: Contact } | null {
  try {
    const raw = sessionStorage.getItem(DRAFT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ContactForm({ endpoint, whatsappHref }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [contact, setContact] = useState<Contact>(emptyContact);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [returnToEnd, setReturnToEnd] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const advancing = useRef<number | undefined>(undefined);
  const restored = useRef(false);
  const moved = useRef(false);

  // Borrador por pestaña: si sale a ver un proyecto y vuelve, no empieza de cero.
  useEffect(() => {
    const d = readDraft();
    if (d) {
      setStep(Math.min(d.step, total - 1));
      setAnswers(d.answers ?? {});
      setContact({ ...emptyContact, ...d.contact });
    }
    restored.current = true;
    return () => clearTimeout(advancing.current);
  }, []);

  useEffect(() => {
    if (!restored.current || status === 'ok') return;
    try {
      sessionStorage.setItem(DRAFT, JSON.stringify({ step, answers, contact }));
    } catch {
      /* almacenamiento bloqueado: el formulario sigue funcionando sin borrador */
    }
  }, [step, answers, contact, status]);

  // Al cambiar de paso, el foco va al título para que el lector de pantalla anuncie la pregunta.
  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus({ preventScroll: true });
    const top = heading.current?.closest('form')?.getBoundingClientRect().top ?? 0;
    if (top < 0) heading.current?.closest('form')?.scrollIntoView({ block: 'start' });
  }, [step]);

  function go(to: number) {
    moved.current = true;
    clearTimeout(advancing.current);
    setStep(to);
  }

  function choose(q: Question, label: string) {
    setAnswers((a) => ({ ...a, [q.key]: label }));
    clearTimeout(advancing.current);
    const next = returnToEnd ? total - 1 : step + 1;
    advancing.current = window.setTimeout(() => {
      setReturnToEnd(false);
      go(next);
    }, 260);
  }

  function edit(i: number) {
    setReturnToEnd(true);
    go(i);
  }

  const set = <K extends keyof Contact>(k: K, v: Contact[K]) => {
    setContact((c) => ({ ...c, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function validate(): Errors {
    const e: Errors = {};
    if (contact.name.trim().length < 2) e.name = 'Escribe tu nombre.';
    if (contact.phone.replace(/\D/g, '').length < 6) e.phone = 'Necesitamos un teléfono para coordinar la visita.';
    if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email)) e.email = 'Revisa el correo: parece incompleto.';
    return e;
  }

  const summary = () =>
    [
      'Hola Ko-Sama, quiero conversar sobre un proyecto.',
      ...questions.filter((q) => answers[q.key]).map((q) => `${q.short}: ${answers[q.key]}`),
      contact.city && `Ubicación: ${contact.city}`,
    ]
      .filter(Boolean)
      .join('\n');
  const whatsappWithSummary = `${whatsappHref.split('?')[0]}?text=${encodeURIComponent(summary())}`;

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const e = validate();
    setErrors(e);
    const first = (['name', 'phone', 'email'] as const).find((k) => e[k]);
    if (first) {
      form.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const params = new URLSearchParams(location.search);
    const honeypot = (form.elements.namedItem('company') as HTMLInputElement | null)?.value;
    const area = Number(contact.areaM2);
    const payload = {
      ...answers,
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      email: contact.email.trim() || undefined,
      city: contact.city.trim() || undefined,
      areaM2: area > 0 ? Math.round(area) : undefined,
      contactPref: contact.contactPref,
      message: contact.message.trim() || undefined,
      projectType: (answers.space && projectTypeFor[answers.space]) ?? 'Otro',
      company: honeypot || undefined,
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
      try {
        sessionStorage.removeItem(DRAFT);
      } catch {
        /* sin almacenamiento, nada que limpiar */
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    const via = contact.contactPref === 'Correo' && contact.email ? 'por correo' : contact.contactPref === 'Llamada' ? 'con una llamada' : 'por WhatsApp';
    return (
      <div role="status" className="step-in bg-surface p-8 md:p-10">
        <p className="text-statement leading-tight">Gracias, {contact.name.trim().split(/\s+/)[0]}.</p>
        <p className="mt-4 max-w-[44ch]">
          Te contactamos {via} en menos de 24 horas hábiles para coordinar la visita a tu terreno.
        </p>
        <p className="mt-6 text-note text-muted">
          ¿Quieres adelantar fotos o planos?{' '}
          <a className="link-u text-ink" href={whatsappWithSummary}>
            Envíalos por WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  const q = questions[step];
  const progress = ((step + 1) / total) * 100;

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby="paso-t">
      <div className="flex min-h-11 items-center justify-between gap-4 text-note">
        <p className="text-muted" aria-live="polite">
          Paso {step + 1} de {total}
        </p>
        {step > 0 && (
          <button type="button" className="link-u min-h-11 cursor-pointer" onClick={() => (setReturnToEnd(false), go(step - 1))}>
            Anterior
          </button>
        )}
      </div>
      <div className="h-px bg-ink/15" aria-hidden="true">
        <div className="h-px bg-ink transition-[width] duration-500 ease-(--ease-out-soft)" style={{ width: `${progress}%` }} />
      </div>

      <div key={step} className="step-in mt-10 md:mt-12">
        {q ? (
          <>
            <h2 id="paso-t" ref={heading} tabIndex={-1} className="text-statement leading-[1.15] outline-none">
              {q.title}
            </h2>
            {q.note && <p className="mt-3 max-w-[48ch] text-note text-muted">{q.note}</p>}
            <ul className="mt-8 border-t border-ink/15">
              {q.choices.map((c) => {
                const on = answers[q.key] === c.label;
                return (
                  <li key={c.label}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => choose(q, c.label)}
                      className="choice group flex min-h-14 w-full cursor-pointer items-baseline gap-4 border-b border-ink/15 py-4 text-left transition-colors hover:bg-ink/[0.025] focus-visible:outline-offset-[-2px]"
                    >
                      <span className="dot shrink-0 translate-y-[-0.15em] scale-0 transition-transform duration-300 ease-(--ease-out-soft) group-hover:scale-75 group-aria-pressed:scale-100" aria-hidden="true" />
                      <span>
                        <span className="block text-[19px] leading-snug">{c.label}</span>
                        {c.hint && <span className="mt-0.5 block text-note text-muted">{c.hint}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {answers[q.key] && (
              <button
                type="button"
                className="link-u mt-6 min-h-11 cursor-pointer"
                onClick={() => (setReturnToEnd(false), go(returnToEnd ? total - 1 : step + 1))}
              >
                {returnToEnd ? 'Volver al resumen' : 'Continuar'}
              </button>
            )}
          </>
        ) : (
          <>
            <h2 id="paso-t" ref={heading} tabIndex={-1} className="text-statement leading-[1.15] outline-none">
              ¿Cómo te contactamos?
            </h2>

            <dl className="mt-6 grid grid-cols-[auto_1fr_auto] gap-x-4 text-note">
              {questions.map((qq, i) =>
                answers[qq.key] ? (
                  <div key={qq.key} className="col-span-3 grid grid-cols-subgrid items-baseline border-b border-ink/10 py-1.5">
                    <dt className="text-muted">{qq.short}</dt>
                    <dd>{answers[qq.key]}</dd>
                    <dd>
                      <button type="button" className="link-u min-h-9 cursor-pointer text-muted hover:text-ink" onClick={() => edit(i)} aria-label={`Cambiar ${qq.short.toLowerCase()}`}>
                        Cambiar
                      </button>
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>

            <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-5">
              <Field label="Nombre" error={errors.name} className="col-span-2 md:col-span-1">
                <input name="name" value={contact.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" className={field} />
              </Field>
              <Field label="Teléfono o WhatsApp" error={errors.phone} className="col-span-2 md:col-span-1">
                <input name="phone" value={contact.phone} onChange={(e) => set('phone', e.target.value)} type="tel" autoComplete="tel" inputMode="tel" className={field} />
              </Field>
              <Field label="Correo (opcional)" error={errors.email} className="col-span-2 md:col-span-1">
                <input name="email" value={contact.email} onChange={(e) => set('email', e.target.value)} type="email" autoComplete="email" className={field} />
              </Field>
              <Field label="Distrito o ciudad" className="col-span-2 md:col-span-1">
                <input name="city" value={contact.city} onChange={(e) => set('city', e.target.value)} placeholder="Pimentel, Chiclayo…" className={field} />
              </Field>
              <Field label="Área exacta en m² (si la sabes)" className="col-span-2 md:col-span-1">
                <input name="areaM2" value={contact.areaM2} onChange={(e) => set('areaM2', e.target.value)} type="number" min={1} inputMode="numeric" className={field} />
              </Field>

              <fieldset className="col-span-2 md:col-span-1">
                <legend className="mb-1.5 text-note">Prefiero que me contacten por</legend>
                <div className="flex border-b border-muted bg-surface">
                  {contactPrefs.map((p) => (
                    <label key={p} className="relative flex min-h-[50px] flex-1 cursor-pointer items-center justify-center gap-2 text-[17px] has-checked:bg-paper has-focus-visible:outline-2 has-focus-visible:outline-accent">
                      <input type="radio" name="contactPref" value={p} checked={contact.contactPref === p} onChange={() => set('contactPref', p)} className="peer sr-only" />
                      <span className="dot scale-0 transition-transform duration-300 peer-checked:scale-100" aria-hidden="true" />
                      {p}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="¿Algo más que debamos saber? (opcional)" className="col-span-2">
                <textarea
                  name="message"
                  rows={3}
                  value={contact.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="Qué te gustaría lograr, especies que te gustan, acceso al terreno…"
                  className={field}
                />
              </Field>
            </div>

            {/* Honeypot */}
            <label className="absolute -left-[9999px]" aria-hidden="true">
              Empresa
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button type="submit" className="btn-dot cursor-pointer disabled:cursor-wait disabled:opacity-60" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando…' : 'Solicitar la visita'}
              </button>
              <p className="text-note text-muted">Te respondemos en menos de 24 horas hábiles.</p>
            </div>
            {status === 'error' && (
              <p role="alert" className="mt-5">
                No se pudo enviar.{' '}
                <a className="link-u" href={whatsappWithSummary}>
                  Mándanos tus respuestas por WhatsApp
                </a>{' '}
                y seguimos por ahí.
              </p>
            )}
          </>
        )}
      </div>
    </form>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const child = cloneElement(children, { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-e` : undefined });
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-note">
        {label}
      </label>
      {child}
      {error && (
        <p id={`${id}-e`} className="mt-1.5 text-note text-accent-fill">
          {error}
        </p>
      )}
    </div>
  );
}
