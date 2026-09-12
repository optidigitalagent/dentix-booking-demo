import type { PatientRoute } from "../build-profile";
import { site } from "@/data/site";
import { useManagedContent } from "@/hooks/use-managed-content";
import { buildEntitySchema } from "@/lib/entity-schema";

export function EntitySchema({ route }: { route: PatientRoute }) {
  const { doctors } = useManagedContent();
  if (__DENTIX_LEAD_SOURCE__ !== "CANONICAL_CANDIDATE") return null;
  const graph = buildEntitySchema(route, site, doctors);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replaceAll("<", "\\u003c") }} />;
}
