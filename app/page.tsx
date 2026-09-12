"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNest } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { hydrated, user, onboarded } = useNest();
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/auth/role");
    else if (!onboarded) router.replace("/onboarding/profile");
    else router.replace("/dashboard");
  }, [hydrated, user, onboarded, router]);
  return <div className="grid min-h-screen place-items-center text-dim">Loading…</div>;
}
