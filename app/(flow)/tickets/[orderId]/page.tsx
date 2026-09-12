import { OrderTickets } from "./order-tickets";

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <OrderTickets orderId={orderId} />;
}
