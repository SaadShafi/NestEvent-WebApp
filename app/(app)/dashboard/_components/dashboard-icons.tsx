import type { SVGProps } from "react";

/* Extra glyphs used only by the organizer dashboard / analytics screens.
   Same 24px stroke style as components/ui/icons.tsx. */

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconWallet = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H5" />
    <path d="M16.5 13.5h.01" strokeWidth={2.6} />
  </svg>
);
export const IconDollar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3v18M16.5 7.5c-.6-1.2-2.2-2-4.2-2-2.5 0-4.3 1.3-4.3 3.1 0 4.3 8.8 2.3 8.8 6.6 0 1.9-2 3.3-4.6 3.3-2.1 0-3.9-.9-4.5-2.3" />
  </svg>
);
export const IconTrendUp = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
  </svg>
);
export const IconFlash = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);
export const IconSpark = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="10" r="6.5" />
    <path d="M9.5 10a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0ZM12 3.5V2M12 18v4M8 21h8" />
  </svg>
);
