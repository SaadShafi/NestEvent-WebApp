import { ComplimentaryTickets } from "./complimentary";

export default async function ComplimentaryTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ComplimentaryTickets id={id} />;
}
