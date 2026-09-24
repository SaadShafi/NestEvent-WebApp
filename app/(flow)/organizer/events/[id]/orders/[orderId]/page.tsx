import { OrderDetail } from "./order-detail";

export default async function Page({ params }: { params: Promise<{ id: string; orderId: string }> }) {
  const { id, orderId } = await params;
  return <OrderDetail id={id} orderId={orderId} />;
}
