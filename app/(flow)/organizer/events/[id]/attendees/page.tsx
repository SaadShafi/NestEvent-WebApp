import { Attendees } from "./attendees";

export default async function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Attendees id={id} />;
}
