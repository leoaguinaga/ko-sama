import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

type Img = { src: string; srcSet?: string; width: number; height: number };

interface Props {
  before: Img;
  after: Img;
  alt: string;
  /** Par de muestra: el «antes» es la misma foto desaturada. Quitar cuando lleguen fotos reales. */
  demo?: boolean;
}

export default function BeforeAfter({ before, after, alt, demo }: Props) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const onDown = (e: PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    move(e.clientX);
  };
  const onMove = (e: PointerEvent) => dragging.current && move(e.clientX);
  const onUp = () => (dragging.current = false);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 5));
    if (e.key === 'Home') setPos(0);
    if (e.key === 'End') setPos(100);
  };

  return (
    <div
      ref={box}
      className="relative aspect-[16/9] w-full touch-pan-y select-none overflow-hidden bg-surface"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <img
        src={after.src}
        srcSet={after.srcSet}
        sizes="(min-width: 768px) 80vw, 100vw"
        width={after.width}
        height={after.height}
        alt={`${alt}: después`}
        loading="lazy"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img
          src={before.src}
          srcSet={before.srcSet}
          sizes="(min-width: 768px) 80vw, 100vw"
          width={before.width}
          height={before.height}
          alt={`${alt}: antes`}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={demo ? { filter: 'grayscale(1) sepia(0.35) brightness(0.92) contrast(0.9)' } : undefined}
        />
      </div>

      <span className="pointer-events-none absolute bottom-4 left-4 bg-paper px-3 py-1 text-note text-ink">Antes</span>
      <span className="pointer-events-none absolute right-4 bottom-4 bg-paper px-3 py-1 text-note text-ink">Después</span>

      <div className="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 bg-paper" style={{ left: `${pos}%` }} />
      <button
        type="button"
        role="slider"
        aria-label="Comparar antes y después"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKey}
        className="absolute top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full bg-accent transition-transform duration-150 active:scale-95"
        style={{ left: `${pos}%` }}
      />
    </div>
  );
}
