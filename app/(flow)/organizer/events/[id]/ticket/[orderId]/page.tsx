import { HolderTickets } from "./holder-tickets";

export default async function Page({ params }: { params: Promise<{ id: string; orderId: string }> }) {
  const { id, orderId } = await params;
  return <HolderTickets id={id} orderId={orderId} />;
}
