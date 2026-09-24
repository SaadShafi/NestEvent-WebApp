import Image from "next/image";
import { cn } from "@/lib/utils";

/** Intrinsic size of the tightly cropped Figma logotype (public/brand/nest-logo-mark.png). */
const W = 1010;
const H = 660;

/**
 * NEST logotype. Size it with a height class (e.g. `h-12 md:h-16`); the width
 * follows the logo's aspect ratio so the mark itself fills the box — no padding.
 */
export function NestLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/nest-logo-mark.png"
      alt="Nest"
      width={W}
      height={H}
      priority={priority}
      sizes="(min-width: 768px) 240px, 160px"
      className={cn("block h-12 w-auto shrink-0 object-contain", className)}
    />
  );
}
