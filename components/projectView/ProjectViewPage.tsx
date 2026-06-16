import {
  ProjectTemplate,
  type ProjectTemplateProps,
} from "@/components/projectTemplate/ProjectTemplate";

export type ProjectViewPageProps = ProjectTemplateProps;

export function ProjectViewPage(props: ProjectViewPageProps) {
  return <ProjectTemplate {...props} />;
}
