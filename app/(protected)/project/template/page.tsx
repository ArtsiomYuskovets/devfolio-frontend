"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectTemplate } from "@/components/projectTemplate/ProjectTemplate";
import styles from "@/components/projectTemplate/ProjectTemplate.module.scss";

function ProjectTemplateRouteInner() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId")?.trim() ?? "";

  return <ProjectTemplate projectId={projectId || undefined} />;
}

export default function ProjectTemplatePage() {
  return (
    <main>
      <Suspense
        fallback={
          <section className={styles["project-template"]}>
            <p className={styles["project-template__status"]}>Загрузка…</p>
          </section>
        }
      >
        <ProjectTemplateRouteInner />
      </Suspense>
    </main>
  );
}
