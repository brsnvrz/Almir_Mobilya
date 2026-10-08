import { useState, useEffect, useRef } from "react";

const WHATSAPP_URL = "https://wa.me/905356871542";
const INSTAGRAM_URL = "https://www.instagram.com/almir_mobilya_dekorasyon/";

interface DraggableBubbleProps {
  storageKey: string;
  defaultX: (w: number) => number;
  defaultY: (h: number) => number;
  onClickUrl: string;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

function DraggableBubble({
  storageKey,
  defaultX,
  defaultY,
  onClickUrl,
  ariaLabel,
  children,
  className = "",
}: DraggableBubbleProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  // Client-side initialization from localStorage or viewport
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          const maxX = Math.max(10, window.innerWidth - 60);
          const maxY = Math.max(10, window.innerHeight - 60);
          setPos({
            x: Math.min(Math.max(10, parsed.x), maxX),
            y: Math.min(Math.max(10, parsed.y), maxY),
          });
          return;
        }
      }
    } catch {}

    setPos({
      x: defaultX(window.innerWidth),
      y: defaultY(window.innerHeight),
    });
  }, [storageKey, defaultX, defaultY]);

  // Adjust on screen resize so bubbles stay on screen
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setPos((prev) => {
        if (!prev || !bubbleRef.current) return prev;
        const rect = bubbleRef.current.getBoundingClientRect();
        const maxX = Math.max(10, window.innerWidth - rect.width - 10);
        const maxY = Math.max(10, window.innerHeight - rect.height - 10);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only main button
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = pos || { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startPointerRef.current.x;
    const dy = e.clientY - startPointerRef.current.y;

    if (Math.hypot(dx, dy) > 5) {
      hasMovedRef.current = true;
    }

    if (hasMovedRef.current && bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      const maxX = Math.max(10, window.innerWidth - rect.width - 10);
      const maxY = Math.max(10, window.innerHeight - rect.height - 10);
      const newX = Math.min(Math.max(10, startPosRef.current.x + dx), maxX);
      const newY = Math.min(Math.max(10, startPosRef.current.y + dy), maxY);
      setPos({ x: newX, y: newY });
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (hasMovedRef.current) {
      // It was a drag: persist position
      if (pos) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(pos));
        } catch {}
      }
    } else {
      // It was a tap/click: open link!
      window.open(onClickUrl, "_blank", "noopener,noreferrer");
    }
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (!pos) return null;

  return (
    <div
      ref={bubbleRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        touchAction: "none",
      }}
      className={`fixed z-50 select-none cursor-grab active:cursor-grabbing transition-transform active:scale-95 duration-100 ${className}`}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.open(onClickUrl, "_blank", "noopener,noreferrer");
        }
      }}
    >
      {children}
    </div>
  );
}

export function FloatingContactBubbles() {
  return (
    <>
      {/* 1. WhatsApp Balonu (Yeşil Daire) */}
      <DraggableBubble
        storageKey="almir_bubble_pos_wa"
        defaultX={() => 16}
        defaultY={(h) => Math.max(16, h - 138)}
        onClickUrl={WHATSAPP_URL}
        ariaLabel="WhatsApp ile İletişime Geç (Sürüklenebilir)"
        className="drop-shadow-lg"
      >
        <div className="flex size-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-950/20 ring-2 ring-white/90 transition-all hover:scale-105 hover:bg-[#20ba59] active:scale-95">
          <svg className="size-7 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
      </DraggableBubble>

      {/* 2. Instagram Balonu (Hap Kapsül Tasarımı - Fotoğraftaki gibi) */}
      <DraggableBubble
        storageKey="almir_bubble_pos_ig"
        defaultX={() => 16}
        defaultY={(h) => Math.max(16, h - 72)}
        onClickUrl={INSTAGRAM_URL}
        ariaLabel="Instagram Sayfamıza Git (Sürüklenebilir)"
        className="drop-shadow-lg"
      >
        <div className="flex h-11 items-center gap-2 rounded-full border border-zinc-200/90 bg-white/95 px-3 py-1.5 shadow-xl shadow-black/10 backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95 dark:border-zinc-700/80 dark:bg-zinc-900/95">
          {/* Instagram Renkli İkonu */}
          <div className="relative flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px] shadow-xs">
            <div className="flex size-full items-center justify-center rounded-[6px] bg-white dark:bg-zinc-900">
              <svg
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#ig-grad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </div>
          </div>

          {/* Instagram Kullanıcı Adı */}
          <span className="truncate pr-1 text-xs font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            almir_mobilya_dekorasyon
          </span>
        </div>
      </DraggableBubble>
    </>
  );
}
