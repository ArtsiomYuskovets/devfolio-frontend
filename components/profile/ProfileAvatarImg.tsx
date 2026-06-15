"use client";

import { useProfileAvatarSrc } from "@/hooks/useProfileAvatarSrc";

type ProfileAvatarImgProps = {
  avatarURL?: string;
  userId?: string;
  alt: string;
  className?: string;
};

export function ProfileAvatarImg({
  avatarURL,
  userId,
  alt,
  className,
}: ProfileAvatarImgProps) {
  const src = useProfileAvatarSrc(avatarURL, userId);

  if (!src) {
    return null;
  }

  return <img src={src} alt={alt} className={className} />;
}
