"use client";

import { useParams } from "next/navigation";
import { ProjectViewPage } from "@/components/projectView/ProjectViewPage";

export default function ProjectByIdPage() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <main>
      <ProjectViewPage projectId={projectId ?? ""} />
    </main>
  );
}
