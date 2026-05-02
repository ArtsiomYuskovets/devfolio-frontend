"use client";

import { useParams } from "next/navigation";
import { ProjectTemplate } from "@/components/projectTemplate/ProjectTemplate";

export default function ProjectTemplateByIdPage() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <main>
      <ProjectTemplate projectId={projectId ?? ""} />
    </main>
  );
}
