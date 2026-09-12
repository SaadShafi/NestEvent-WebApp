import { ViewEvent } from "./view-event";

export default async function OrganizerEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ViewEvent id={id} />;
}
