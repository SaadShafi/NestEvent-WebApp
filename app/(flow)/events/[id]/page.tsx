import { EventDetails } from "./event-details";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetails id={id} />;
}
