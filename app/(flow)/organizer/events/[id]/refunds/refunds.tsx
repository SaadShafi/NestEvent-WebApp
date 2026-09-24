"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/data";
import type { EventItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { IconCheck, IconClose } from "@/components/ui/icons";
import { stamp, ticketTag, useEventOps, type RefundRequest, type RefundStatus as Status } from "../_lib/event-ops";
import { OpsPage, StatusPill, UnderlineTabs } from "../_lib/ops-ui";

// Figma tabs: Upcoming (pending) · Processed (approved / refunded) · Rejected (declined)
const TABS: { value: Status; label: string }[] = [
  { value: "pending", label: "Upcoming" },
  { value: "refunded", label: "Processed" },
  { value: "declined", label: "Rejected" },
];

export function RefundRequests({ id }: { id: string }) {
  return (
    <OpsPage id={id} title="Refund Requests" width="md" asideClassName="md:w-auto!">
      {(event) => <RefundList event={event} />}
    </OpsPage>
  );
}

function RefundStatus({ r }: { r: RefundRequest }) {
  if (r.status === "refunded") return <StatusPill label="Processed" tone="success" icon="check" />;
  if (r.status === "declined") return <StatusPill label="Rejected" tone="danger" icon="close" />;
  return <StatusPill label="Pending" tone="primary" />;
}

/** Refund Requests — approve / decline pending refunds for this event. */
function RefundList({ event }: { event: EventItem }) {
  const toast = useToast();
  const { refunds, resolveRefund } = useEventOps(event);
  const [tab, setTab] = useState<Status>("pending");
  const [detailId, setDetailId] = useState<string | null>(null);

  const rows = useMemo(() => refunds.filter((r) => r.status === tab), [refunds, tab]);
  const detail = refunds.find((r) => r.id === detailId) ?? null;

  const decide = (r: RefundRequest, action: "refunded" | "declined") => {
    resolveRefund(r.id, action);
    toast(action === "refunded" ? `Refund of ${money(r.order.total)} approved` : "Refund request rejected", action === "refunded" ? "success" : "info");
  };
  const resolve = (action: "refunded" | "declined") => {
    if (!detail) return;
    decide(detail, action);
    setDetailId(null);
  };

  return (
    <div className="flex max-w-[640px] flex-col gap-8">
      <UnderlineTabs tabs={TABS} value={tab} onChange={setTab} />

      {rows.length === 0 ? (
        <EmptyState
          title={tab === "pending" ? "No upcoming requests" : tab === "refunded" ? "Nothing processed yet" : "Nothing rejected"}
          sub={tab === "pending" ? "Refund requests from attendees will appear here." : "Resolved refund requests are listed here."}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-col gap-4 rounded-[30px] bg-surface px-5 py-5 sm:rounded-[34px] sm:px-7">
              <div className="flex items-start gap-4">
                <Avatar src={r.order.buyerAvatar} alt={r.order.buyerName} size={74} className="max-sm:!h-14 max-sm:!w-14" />
                <div className="flex min-w-0 flex-1 flex-col pt-1">
                  <span className="truncate text-[18px] font-semibold text-text sm:text-[22px]">{r.order.buyerName}</span>
                  <span className="truncate text-[13px] text-text/90 sm:text-[16px]">
                    {ticketTag(r.order.tickets[0]?.ticketTypeName ?? "")} · {r.order.number}
                  </span>
                </div>
                <span className="shrink-0 pt-1 text-[22px] font-bold text-text sm:text-[34px]">{money(r.order.total)}</span>
              </div>
              <div className="flex items-end gap-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[17px] font-bold text-text sm:text-[21px]">Reason</span>
                  <p className="mt-2 text-[14px] text-text/90 sm:text-[16px]">{r.reason}</p>
                  <button
                    type="button"
                    onClick={() => setDetailId(r.id)}
                    className="mt-5 self-start text-[16px] font-semibold text-text hover:text-accent sm:text-[18px]"
                  >
                    View Detail
                  </button>
                </div>
                {r.status === "pending" && (
                  <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => decide(r, "declined")}
                      className="grid h-12 w-12 place-items-center rounded-full bg-[#141414] text-text transition hover:bg-black sm:h-16 sm:w-16"
                      aria-label={`Reject refund for ${r.order.buyerName}`}
                      title="Reject"
                    >
                      <IconClose size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(r, "refunded")}
                      className="grid h-12 w-12 place-items-center rounded-full bg-[#62b22f] text-white transition hover:brightness-110 sm:h-16 sm:w-16"
                      aria-label={`Approve refund for ${r.order.buyerName}`}
                      title="Approve"
                    >
                      <IconCheck size={26} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetailId(null)} title="Refund Request" className="max-h-[90dvh] overflow-y-auto">
        {detail && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar src={detail.order.buyerAvatar} alt={detail.order.buyerName} size={48} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[17px] font-semibold text-text">{detail.order.buyerName}</span>
                <span className="text-xs text-dim">
                  {detail.order.number} · Requested {stamp(detail.requestedAt)}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              {detail.order.tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-muted">
                    {t.ticketTypeName} × {t.qty}
                  </span>
                  <span className="font-medium text-text">{money(t.qty * t.unitPrice)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-muted">Tax</span>
                <span className="font-medium text-text">{money(detail.order.tax)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="text-[15px] font-semibold text-text">Refund total</span>
                <span className="font-display text-[20px] font-bold text-text">{money(detail.order.total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-[20px] bg-surface-2 p-4">
              <span className="text-xs text-dim">Reason</span>
              <p className="text-sm text-text">{detail.reason}</p>
            </div>

            {detail.status === "pending" ? (
              <div className="mt-1 grid grid-cols-2 gap-3">
                <Button variant="danger" onClick={() => resolve("declined")}>
                  Reject
                </Button>
                <Button variant="white" onClick={() => resolve("refunded")}>
                  Approve
                </Button>
              </div>
            ) : (
              <div className="flex justify-center py-1">
                <RefundStatus r={detail} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
