"use client";

import { ProfileEditForm } from "@/components/profileEdit/ProfileEditForm";
import { getApiErrorStatus } from "@/lib/apiError";
import { useGetMyProfileQuery } from "@/stores/user/userApi";

export default function ProfileEditPage() {
  const { data: profile, isLoading, error } = useGetMyProfileQuery();

  if (isLoading) {
    return <div>Загрузка профиля…</div>;
  }

  if (error) {
    return (
      <div>
        Не удалось загрузить профиль
        {getApiErrorStatus(error) ? ` (${getApiErrorStatus(error)})` : ""}
      </div>
    );
  }

  return (
    <main>
      <ProfileEditForm profile={profile ?? undefined} isNewProfile={!profile} />
    </main>
  );
}
