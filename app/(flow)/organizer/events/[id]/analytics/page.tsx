import { EventAnalytics } from "./analytics";

export default async function EventAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventAnalytics id={id} />;
}
