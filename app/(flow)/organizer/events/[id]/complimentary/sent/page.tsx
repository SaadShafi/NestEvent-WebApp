import { SuccessScreen } from "@/components/shell/success-screen";
import { Button } from "@/components/ui/button";

export default async function TicketSentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SuccessScreen
      title={
        <>
          Ticket Sent
          <br />
          Successfully
        </>
      }
      actions={
        <>
          <Button variant="white" href={`/organizer/events/${id}`} className="min-w-[166px]">
            Go To Event
          </Button>
          <Button variant="primary" href={`/organizer/events/${id}/complimentary`} className="min-w-[166px]">
            Send Another
          </Button>
        </>
      }
    />
  );
}
