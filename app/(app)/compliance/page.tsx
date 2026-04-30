import { permanentRedirect } from "next/navigation";

export default function LegacyCompliancePage() {
  permanentRedirect("/deadlines");
}
