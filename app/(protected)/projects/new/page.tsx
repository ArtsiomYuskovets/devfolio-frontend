import { RecruiterProjectCreateGuard } from "@/components/projectCreate/RecruiterProjectCreateGuard";

export default function NewProjectPage() {
  return (
    <main>
      <RecruiterProjectCreateGuard />
    </main>
  );
}
