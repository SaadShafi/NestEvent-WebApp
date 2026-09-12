"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info";
interface Toast {
  id: number;
  text: string;
  kind: Kind;
}

const Ctx = createContext<(text: string, kind?: Kind) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: Kind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const value = useMemo(() => push, [push]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-fade-in rounded-full border px-5 py-3 text-sm font-medium shadow-lg backdrop-blur",
              t.kind === "success" && "border-success/40 bg-[#0f1f15] text-success",
              t.kind === "error" && "border-danger/40 bg-[#231212] text-danger",
              t.kind === "info" && "border-border bg-surface text-text",
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
