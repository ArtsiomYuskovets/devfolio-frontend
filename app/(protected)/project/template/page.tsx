"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectTemplateEditor } from "@/components/projectTemplate/ProjectTemplateEditor";
import styles from "@/components/projectTemplate/ProjectTemplate.module.scss";

function ProjectTemplateRouteInner() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId")?.trim() ?? "";

  if (!projectId) {
    return (
      <section className={styles["project-template"]}>
        <p className={styles["project-template__status"]}>
          Укажите идентификатор проекта в параметрах адреса
        </p>
      </section>
    );
  }

  return <ProjectTemplateEditor projectId={projectId} />;
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
