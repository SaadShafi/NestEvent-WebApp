import { RefundRequests } from "./refunds";

export default async function RefundRequestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RefundRequests id={id} />;
}
