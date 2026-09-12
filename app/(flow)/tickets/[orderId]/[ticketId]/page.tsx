import { QrTicket } from "./qr-ticket";

export default async function Page({ params }: { params: Promise<{ orderId: string; ticketId: string }> }) {
  const { orderId, ticketId } = await params;
  return <QrTicket orderId={orderId} ticketId={ticketId} />;
}
