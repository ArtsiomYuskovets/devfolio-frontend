"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { pickProfileUserId } from "@/lib/userId";
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
  } = useGetMyProfileQuery(undefined, { refetchOnMountOrArgChange: true });
  const {
    data: viewedProfile,
    isLoading: isLoadingViewedProfile,
    error: viewedProfileError,
  } = useGetUserProfileQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const myUserId = myProfile
    ? pickProfileUserId(myProfile) ?? myProfile.userId
    : undefined;
  const viewedUserId = viewedProfile
    ? pickProfileUserId(viewedProfile) ?? viewedProfile.userId
    : undefined;

  const isOwnProfile =
    !myProfileError &&
    Boolean(myUserId && viewedUserId && myUserId === viewedUserId);

  const displayProfile = useMemo(() => {
    if (!viewedProfile) {
      return undefined;
    }
    if (isOwnProfile && myProfile) {
      return { ...viewedProfile, ...myProfile };
    }
    return viewedProfile;
  }, [isOwnProfile, myProfile, viewedProfile]);

  if (!id) {
    return <div>Profile not found</div>;
  }

  if (isLoadingViewedProfile || (isOwnProfile && isLoadingMyProfile)) {
    return <div>Loading profile...</div>;
  }

  if (viewedProfileError) {
    return <div>Error getting profile</div>;
  }

  if (!displayProfile) {
    return <div>Profile not found</div>;
  }

  return (
    <main>
      <ProfilePage
        key={`${displayProfile.userId}-${displayProfile.userType ?? "JOB_SEEKER"}`}
        profile={displayProfile}
        isOwnProfile={isOwnProfile}
      />
    </main>
  );
}
