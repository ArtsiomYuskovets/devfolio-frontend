import type { UserType } from "@/types/types";

export function isRecruiter(userType?: UserType | null): boolean {
  return userType === "RECRUITER";
}

export function isJobSeeker(userType?: UserType | null): boolean {
  return !userType || userType === "JOB_SEEKER";
}

export function formatUserTypeLabel(userType?: UserType | null): string {
  if (userType === "RECRUITER") {
    return "Рекрутёр";
  }
  return "Соискатель";
}
