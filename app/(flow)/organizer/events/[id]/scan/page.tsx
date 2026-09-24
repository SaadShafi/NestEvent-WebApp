import { ScanTickets } from "./scan";

export default async function ScanTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ScanTickets id={id} />;
}
