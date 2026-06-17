"use client";

import { useParams } from "next/navigation";
import { ProjectTemplateEditor } from "@/components/projectTemplate/ProjectTemplateEditor";

export default function ProjectTemplateByIdPage() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <main>
      <ProjectTemplateEditor projectId={projectId ?? ""} />
    </main>
  );
}
