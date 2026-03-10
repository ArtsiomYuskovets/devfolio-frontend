"use client";

import { ProfileEditForm } from "@/components/profileEdit/ProfileEditForm";
import { useGetMyProfileQuery } from "@/stores/user/userApi";

export default function ProfileEditPage() {
  const { data: profile, isLoading, error, refetch } = useGetMyProfileQuery();
  if (isLoading) {
    return <div>Loading profile...</div>;
  }
  if (error) {
    return <div>Error getting profile</div>;
  }
  if (!profile) {
    return <div>Profile not found</div>;
  }
  return (
    <main>
      <ProfileEditForm profile={profile} />
    </main>
  );
}
