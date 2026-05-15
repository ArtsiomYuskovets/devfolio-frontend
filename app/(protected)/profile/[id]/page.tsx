"use client";

import { useParams } from "next/navigation";
import { ProfilePage } from "@/components/profile/ProfilePage";
import {
  useGetMyProfileQuery,
  useGetUserProfileQuery,
} from "@/stores/user/userApi";

export default function ProfileByIdPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const {
    data: myProfile,
    isLoading: isLoadingMyProfile,
    error: myProfileError,
  } = useGetMyProfileQuery();
  const {
    data: viewedProfile,
    isLoading: isLoadingViewedProfile,
    error: viewedProfileError,
  } = useGetUserProfileQuery(id, {
    skip: !id,
  });

  if (!id) {
    return <div>Profile not found</div>;
  }

  if (isLoadingViewedProfile) {
    return <div>Loading profile...</div>;
  }

  if (viewedProfileError) {
    return <div>Error getting profile</div>;
  }

  if (!viewedProfile) {
    return <div>Profile not found</div>;
  }

  const isOwnProfile = !myProfileError && myProfile?.userId === viewedProfile.userId;

  return (
    <main>
      <ProfilePage profile={viewedProfile} isOwnProfile={isOwnProfile} />
    </main>
  );
}
