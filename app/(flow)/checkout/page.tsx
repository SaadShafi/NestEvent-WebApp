"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { formatEventDate, money } from "@/lib/data";
import { useNest } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { IconAppleLogo, IconCheckCircle, IconChevronDown, IconEdit, IconGoogleLogo, IconMastercard, IconPlus, IconTrash } from "@/components/ui/icons";
import { EmptyState, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

const TAX_RATE = 0.0102;
const PROMOS: Record<string, number> = { NEST10: 0.1, EARLY25: 0.25 };

type Brand = "mastercard" | "paypal" | "stripe" | "applepay" | "googlepay";
const PAYMENT_METHODS: { id: string; brand: Brand; label: string; meta: string }[] = [
  { id: "pm_card", brand: "mastercard", label: "Debit/Credit Card", meta: "**** **** **** 1121" },
  { id: "pm_paypal", brand: "paypal", label: "PayPal", meta: "No Fee" },
  { id: "pm_stripe", brand: "stripe", label: "Stripe", meta: "No Fee" },
  { id: "pm_apple", brand: "applepay", label: "Apple Pay", meta: "No Fee" },
  { id: "pm_google", brand: "googlepay", label: "Google Pay", meta: "No Fee" },
];

function BrandMark({ brand }: { brand: Brand }) {
  if (brand === "mastercard") return <IconMastercard size={28} />;
  if (brand === "applepay") return <IconAppleLogo size={22} className="text-white" />;
  if (brand === "googlepay") return <IconGoogleLogo size={22} />;
  return (
    <span className={cn("grid h-7 w-7 place-items-center rounded-full text-[13px] font-bold text-white", brand === "paypal" ? "bg-[#009cde]" : "bg-[#635bff]")}>
      {brand === "paypal" ? "P" : "S"}
    </span>
  );
}

/** Checkout (Figma: Cart → Checkout → Checkout Successfully): address, order, promo, payment, Place Order. */
export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const cart = useNest((s) => s.cart);
  const event = useNest((s) => (s.cart ? s.events.find((e) => e.id === s.cart!.eventId) : undefined));
  const addresses = useNest((s) => s.addresses);
  const clearCart = useNest((s) => s.clearCart);
  const placeOrder = useNest((s) => s.placeOrder);

  const [promo, setPromo] = useState("");
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string>();
  const [methodId, setMethodId] = useState(PAYMENT_METHODS[0].id);
  const [picker, setPicker] = useState(false);
  const [placing, setPlacing] = useState(false);

  const addressIndex = Math.max(0, addresses.findIndex((a) => a.isDefault));
  const address = addresses[addressIndex];
  const method = PAYMENT_METHODS.find((m) => m.id === methodId) ?? PAYMENT_METHODS[0];
  const discount = promoCode ? PROMOS[promoCode] : 0;

  const totals = useMemo(() => {
    const lines = cart?.lines ?? [];
    const priceOf = (id: string) => event?.ticketTypes.find((t) => t.id === id)?.price ?? 0;
    const quantity = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * priceOf(l.ticketTypeId), 0);
    const discountAmt = Math.round(subtotal * discount * 100) / 100;
    const tax = Math.round((subtotal - discountAmt) * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal - discountAmt + tax) * 100) / 100;
    return { quantity, subtotal, discountAmt, tax, total };
  }, [cart, event, discount]);

  if (!cart || !event || totals.quantity === 0) {
    // placing the order clears the cart — don't flash the empty state while navigating to success
    if (placing) return <div className="grid min-h-screen place-items-center text-dim">Placing order…</div>;
    return (
      <FlowPage title="Checkout" backHref="/dashboard" width="md">
        <EmptyState title="Your cart is empty" sub="Pick an event and add tickets to check out." action={<Button href="/dashboard">Explore events</Button>} />
      </FlowPage>
    );
  }

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return setPromoError("Enter a promo code");
    if (!(code in PROMOS)) return setPromoError("Invalid promo code");
    setPromoError(undefined);
    setPromoCode(code);
    toast(`Promo ${code} applied`, "success");
  };

  const remove = () => {
    clearCart();
    toast("Removed from cart", "info");
    router.push(`/events/${event.id}`);
  };

  const place = () => {
    if (!address) {
      toast("Add a delivery address to continue", "error");
      router.push("/checkout/address");
      return;
    }
    setPlacing(true);
    const order = placeOrder(address, discount);
    if (!order) {
      setPlacing(false);
      toast("Could not place the order", "error");
      return;
    }
    router.push(`/checkout/success?order=${order.id}`);
  };

  const perPerson = totals.total / totals.quantity;

  return (
    <FlowPage title="Checkout" backHref={`/events/${event.id}/checkout`} width="full">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] xl:gap-16">
        {/* Left: address + order */}
        <div className="flex flex-col gap-4">
          <SectionLabel>Delivery Address</SectionLabel>
          <Link
            href="/checkout/address"
            className="flex h-14 items-center gap-3 rounded-full bg-surface pl-5 pr-2 text-[15px] text-muted transition hover:bg-surface-3"
          >
            <span className="flex-1">Add Delivery Address</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white">
              <IconPlus size={18} />
            </span>
          </Link>
          {address && (
            <div className="relative flex flex-col gap-1 rounded-[24px] bg-surface-2 px-5 py-4 pr-16">
              <div className="flex items-center gap-2">
                <span className="truncate text-[17px] font-semibold text-text">{address.fullName}</span>
                <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-white">{address.label}</span>
              </div>
              <span className="text-[13px] text-muted">
                {address.dialCode} {address.phone}
              </span>
              <span className="text-[13px] text-muted">
                {address.city}, {address.country}
              </span>
              {address.zipcode && <span className="text-[13px] text-muted">{address.zipcode}</span>}
              {address.location?.address && <span className="line-clamp-2 text-[13px] text-muted">{address.location.address}</span>}
              <Link
                href={`/checkout/address?edit=${addressIndex}`}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-accent text-white transition hover:brightness-110"
                aria-label="Edit address"
              >
                <IconEdit size={15} />
              </Link>
            </div>
          )}

          <SectionLabel className="mt-4">Order Details</SectionLabel>
          <div className="flex items-center gap-4 rounded-[24px] bg-surface-2 p-3 pr-4">
            <span className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[16px]">
              <Image src={event.cover} alt="" fill sizes="84px" className="object-cover" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-[17px] font-semibold text-text">{event.title}</span>
              <span className="truncate text-[13px] text-muted">{formatEventDate(event)}</span>
              <span className="text-[15px] font-semibold text-text">{money(totals.subtotal)}</span>
            </div>
            <button type="button" onClick={remove} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-danger transition hover:bg-danger/10" aria-label="Remove from cart">
              <IconTrash size={18} />
            </button>
          </div>
        </div>

        {/* Right: summary + promo + payment */}
        <div className="overflow-hidden rounded-[28px] bg-surface-2">
          <div className="flex flex-col gap-3 px-5 pb-6 pt-7">
            <h2 className="mb-1 text-[22px] font-semibold text-text">Order Summary</h2>
            <Row label="Quantity" value={String(totals.quantity)} />
            <Row label="Tax fee" value={money(totals.tax)} />
            <Row label="Ticket Price" value={money(totals.subtotal)} />
            {promoCode && totals.discountAmt > 0 && <Row label={`Promo ${promoCode}`} value={`-${money(totals.discountAmt)}`} tone="success" />}
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-[20px] font-semibold text-text sm:text-[22px]">Total Payment</span>
              <span className="text-[20px] font-semibold text-text sm:text-[22px]">{money(totals.total)}</span>
            </div>

            <div className={cn("mt-4 flex h-14 items-center gap-2 rounded-full bg-bg pl-5 pr-1.5", promoError && "ring-1 ring-danger/60")}>
              <input
                value={promo}
                onChange={(e) => {
                  setPromo(e.target.value);
                  if (promoError) setPromoError(undefined);
                }}
                onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                placeholder="Apply Promo Code"
                className="h-full min-w-0 flex-1 bg-transparent text-sm uppercase text-text placeholder:normal-case placeholder:text-dim"
                aria-label="Promo code"
              />
              <Button size="sm" onClick={applyPromo} className="h-11 px-6">
                Apply
              </Button>
            </div>
            {promoError && <p className="pl-4 text-xs text-danger">{promoError}</p>}

            <h3 className="mt-4 text-[17px] font-semibold text-text">Payment Method</h3>
            <button
              type="button"
              onClick={() => setPicker(true)}
              className="flex items-center gap-3 rounded-[20px] bg-bg px-4 py-3.5 text-left transition hover:bg-surface"
            >
              <span className="grid w-10 shrink-0 place-items-center">
                <BrandMark brand={method.brand} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[15px] font-semibold text-text">{method.label}</span>
                <span className="truncate text-xs text-muted">{method.meta}</span>
              </span>
              <IconChevronDown size={18} className="shrink-0 text-text" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-surface px-5 py-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs text-muted">Price</span>
              <span className="text-[22px] font-semibold text-text">
                $ {perPerson.toFixed(2)}
                <span className="text-[13px] font-normal text-muted">/Person</span>
              </span>
            </div>
            <Button size="lg" onClick={place} loading={placing} className="min-w-[170px] flex-1 sm:flex-none">
              Place Order
            </Button>
          </div>
        </div>
      </div>

      <Modal open={picker} onClose={() => setPicker(false)} title="Select Card" className="max-w-[460px]">
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((m) => {
            const active = m.id === methodId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMethodId(m.id);
                  setPicker(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-[18px] border bg-surface px-4 py-3.5 text-left transition hover:bg-surface-3",
                  active ? "border-accent" : "border-transparent",
                )}
              >
                <span className="grid w-10 shrink-0 place-items-center">
                  <BrandMark brand={m.brand} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold text-text">{m.label}</span>
                  <span className="truncate text-xs text-muted">{m.meta}</span>
                </span>
                {active && <IconCheckCircle size={20} className="shrink-0 text-accent" />}
              </button>
            );
          })}
        </div>
      </Modal>
    </FlowPage>
  );
}

function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-[17px] font-semibold text-text", className)}>{children}</h2>;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className={cn("flex items-center justify-between text-[14px]", tone === "success" ? "text-success" : undefined)}>
      <span className={tone ? undefined : "text-muted"}>{label}</span>
      <span className={tone ? undefined : "text-text"}>{value}</span>
    </div>
  );
}
