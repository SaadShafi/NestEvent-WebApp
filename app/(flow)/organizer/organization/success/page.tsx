import { SuccessScreen } from "@/components/shell/success-screen";
import { OrgSuccessActions } from "./actions";

export default function OrganizationSuccessPage() {
  return (
    <SuccessScreen
      title={
        <>
          Organization
          <br />
          Submitted
        </>
      }
      sub="Enjoy Events picked based on your interests and location"
      actions={<OrgSuccessActions />}
    />
  );
}
