import { Suspense } from "react";
import { SuccessScreen } from "@/components/shell/success-screen";
import { EventSuccessActions } from "./actions";

export default function EventPublishedPage() {
  return (
    <SuccessScreen
      title={
        <>
          Event Published
          <br />
          Successfully
        </>
      }
      sub="Your event is live and visible to guests."
      actions={
        <Suspense fallback={null}>
          <EventSuccessActions />
        </Suspense>
      }
    />
  );
}
