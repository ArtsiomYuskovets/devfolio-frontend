"use client";

import { Button } from "@/components/ui/button/Button";
import type { DataForFillProfile, UserProfileInfo } from "@/types/types";
import { SectionTitle } from "@/components/ui/section-title/SectionTitle";
import { Input } from "@/components/ui/input/Input";
import { TextareaField } from "@/components/ui/textarea-field/TextareaField";
import { EditAdornment } from "@/components/ui/edit-adornment/EditAdornment";
import styles from "./ProfileEditForm.module.scss";
import { useState, useCallback, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  useFillMyProfileMutation,
  useUpdateMyProfileMutation,
  useUploadAvatarMutation,
} from "@/stores/user/userApi";
import { ProfileAvatarImg } from "@/components/profile/ProfileAvatarImg";
import { resolveProfileAvatarUrl } from "@/lib/profileAvatar";
import { LinksSection } from "@/components/section/linkSection/LinkSection";
import {
  countCompleteProfileLinks,
  createEmptyProfileLinkItem,
  getVisibleProfileLinkItems,
  profileLinkItemsToRecord,
  profileLinksRecordToItems,
  updateProfileLinkItem,
  type ProfileLinkItem,
} from "@/lib/profileLinks";
import {
  getApiErrorCode,
  getProfileSaveErrorMessage,
} from "@/lib/apiError";
import {
  IMAGE_UPLOAD_HINT,
  hasProfileCoreFieldsFilled,
  validateImageFile,
  validateProfileForm,
} from "@/lib/formValidation";
import { FieldLabel } from "@/components/ui/field-label/FieldLabel";

type ProfileSaveError = {
  message: string;
  field?: "nickname";
};

type ProfileEditFormProps = {
  profile?: Partial<UserProfileInfo>;
  isNewProfile?: boolean;
};

export function ProfileEditForm({
  profile,
  isNewProfile = false,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [myProfile, setMyProfile] = useState<Partial<UserProfileInfo>>(profile ?? {});
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const [fillMyProfile] = useFillMyProfileMutation();
  const [uploadAvatar, { isLoading: isAvatarUploading }] = useUploadAvatarMutation();
  const [saveError, setSaveError] = useState<ProfileSaveError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<ProfileLinkItem[]>(() =>
    profileLinksRecordToItems(profile?.links)
  );
  const visibleLinks = getVisibleProfileLinkItems(links);
  const completeLinksCount = countCompleteProfileLinks(links);
  const hasDraftLink = links.some((link) => link.isDraft);
  const canAddLink = completeLinksCount < 5 && !hasDraftLink;

  const handleChange = (field: keyof UserProfileInfo, value: string) => {
    setMyProfile(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (field === "nickname" && saveError?.field === "nickname") {
      setSaveError(null);
    }
  };

  const selectedUserType = myProfile.userType ?? "JOB_SEEKER";
  const coreFieldsFilled = hasProfileCoreFieldsFilled({
    nickname: myProfile.nickname ?? "",
    firstName: myProfile.firstName ?? "",
    lastName: myProfile.lastName ?? "",
  });
  const canUploadAvatar = !isNewProfile && coreFieldsFilled;

  useEffect(() => {
    if (!profile) {
      return;
    }
    setMyProfile(profile);
    setLinks(profileLinksRecordToItems(profile.links));
  }, [profile]);

  const handleKeyChange = useCallback((id: string, newKey: string) => {
    setLinks((prev) => updateProfileLinkItem(prev, id, { key: newKey }));
  }, []);
  const handleValueChange = useCallback((id: string, newValue: string) => {
    setLinks((prev) => updateProfileLinkItem(prev, id, { value: newValue }));
  }, []);
  const handleRemoveLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }, []);
  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSaveError(null);

    const validationErrors = validateProfileForm({
      nickname: myProfile.nickname ?? "",
      firstName: myProfile.firstName ?? "",
      lastName: myProfile.lastName ?? "",
    });
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      alert(Object.values(validationErrors).join("\n"));
      return;
    }
    setFieldErrors({});

    try {
      const linksObject = profileLinkItemsToRecord(links);
      const { skills: _skills, userId: _userId, ...profileWithoutSkills } = myProfile;
      const profileToSave: DataForFillProfile = {
        nickname: profileWithoutSkills.nickname ?? "",
        firstName: profileWithoutSkills.firstName ?? "",
        lastName: profileWithoutSkills.lastName ?? "",
        bio: profileWithoutSkills.bio ?? "",
        avatarURL: profileWithoutSkills.avatarURL ?? "",
        skills: [],
        links: linksObject,
        userType: profileWithoutSkills.userType ?? "JOB_SEEKER",
      };

      const savedProfile = isNewProfile
        ? await fillMyProfile(profileToSave).unwrap()
        : await updateMyProfile(profileToSave).unwrap();

      if (savedProfile) {
        setMyProfile(savedProfile);
        setLinks(profileLinksRecordToItems(savedProfile.links));
        const userId = savedProfile.userId;
        if (userId) {
          router.push(`/profile/${userId}`);
        }
        alert(isNewProfile ? "Профиль успешно создан" : "Профиль успешно обновлен");
      }
    } catch (error) {
      const code = getApiErrorCode(error);
      const message = getProfileSaveErrorMessage(error);

      if (code === "NICKNAME_ALREADY_EXISTS") {
        setFieldErrors((prev) => ({ ...prev, nickname: message }));
        setSaveError({ message, field: "nickname" });
        alert(message);
        return;
      }

      setFieldErrors({});
      setSaveError({ message });
      alert(message);
    }
  };
  const handleAddLink = useCallback(() => {
    setLinks((prev) => {
      if (countCompleteProfileLinks(prev) >= 5) {
        return prev;
      }
      if (prev.some((link) => link.isDraft)) {
        return prev;
      }
      return [...prev, createEmptyProfileLinkItem(true)];
    });
  }, []);

  const handleAvatarUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      const fileValidation = validateImageFile(file);
      if (!fileValidation.isValid) {
        const errorMessage = fileValidation.error ?? "Некорректный файл";
        setFieldErrors((prev) => ({
          ...prev,
          avatarFile: errorMessage,
        }));
        alert(errorMessage);
        input.value = "";
        return;
      }
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.avatarFile;
        return next;
      });

      try {
        const uploadedAvatar = await uploadAvatar(file).unwrap();
        const nextAvatar =
          uploadedAvatar.trim() ||
          resolveProfileAvatarUrl(undefined, myProfile.userId, {
            fallbackToEndpoint: true,
          });
        if (nextAvatar) {
          setMyProfile((prev) => ({ ...prev, avatarURL: nextAvatar }));
        }
      } catch {
        alert("Не удалось загрузить аватар");
      } finally {
        input.value = "";
      }
    },
    [uploadAvatar, myProfile.userId]
  );

  return (
    <section className={styles["profile-edit"]}>
      <div className={styles["profile-edit__shell"]}>
        <div className={styles["profile-edit__card"]}>
          <div className={styles["profile-edit__hero"]}>
            <div className={styles["profile-edit__avatar-block"]}>
              <div className={styles["profile-edit__avatar"]}>
                <ProfileAvatarImg
                  avatarURL={myProfile.avatarURL}
                  userId={myProfile.userId}
                  alt="Аватар профиля"
                  className={styles["profile-edit__avatar-img"]}
                />
              </div>

              <div className={styles["profile-edit__avatar-upload"]}>
                {canUploadAvatar ? (
                  <div className={styles["profile-edit__avatar-upload-row"]}>
                    <input
                      id="profile-avatar-upload"
                      type="file"
                      accept="image/*"
                      className={styles["profile-edit__avatar-file-input"]}
                      onChange={handleAvatarUpload}
                      disabled={isAvatarUploading}
                    />
                    <Button
                      type="button"
                      variant="outline-light"
                      size="small"
                      onClick={() =>
                        document.getElementById("profile-avatar-upload")?.click()
                      }
                      disabled={isAvatarUploading}
                    >
                      {isAvatarUploading ? "Загрузка..." : "Загрузить аватар"}
                    </Button>
                    <p className={styles["profile-edit__avatar-upload-hint"]}>
                      {IMAGE_UPLOAD_HINT}
                    </p>
                  </div>
                ) : (
                  <p className={styles["profile-edit__avatar-upload-hint"]}>
                    {isNewProfile
                      ? "Загрузка аватара будет доступна после создания профиля"
                      : "Заполните никнейм, имя и фамилию, чтобы загрузить аватар"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className={styles["profile-edit__content"]}>
            <p className={styles["profile-edit__required-note"]}>
              <span className={styles["profile-edit__required-mark"]}>*</span> —
              обязательное поле
            </p>
            <SectionTitle>ВНЕШНИЙ ВИД</SectionTitle>

            <div className={styles["profile-edit__stack"]}>
              <div className={styles["profile-edit__field"]}>
                <Input
                  label="Никнейм"
                  requiredMark
                  variant="primary-light"
                  placeholder="nickname"
                  value={myProfile.nickname ?? ""}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  error={fieldErrors.nickname ?? (saveError?.field === "nickname" ? saveError.message : undefined)}
                  rightAdornment={<EditAdornment />}
                />
              </div>
              <div className={styles["profile-edit__field"]}>
                <FieldLabel required className={styles["profile-edit__radio-label"]}>
                  Тип пользователя
                </FieldLabel>
                <div className={styles["profile-edit__radio-group"]}>
                  <label className={styles["profile-edit__radio-option"]}>
                    <input
                      type="radio"
                      name="userType"
                      value="JOB_SEEKER"
                      checked={selectedUserType === "JOB_SEEKER"}
                      onChange={(e) => handleChange("userType", e.target.value)}
                    />
                    <span>Соискатель работы</span>
                  </label>
                  <label className={styles["profile-edit__radio-option"]}>
                    <input
                      type="radio"
                      name="userType"
                      value="RECRUITER"
                      checked={selectedUserType === "RECRUITER"}
                      onChange={(e) => handleChange("userType", e.target.value)}
                    />
                    <span>Рекрутёр</span>
                  </label>
                </div>
              </div>
            </div>

            <SectionTitle>ОПИСАНИЕ</SectionTitle>

            <div className={styles["profile-edit__grid"]}>
              <div className={`${styles["profile-edit__field"]} ${styles["profile-edit__name-field"]}`}>
                <Input
                  label="Имя"
                  requiredMark
                  variant="primary-light"
                  placeholder="Имя"
                  value={myProfile.firstName ?? ""}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  error={fieldErrors.firstName}
                />
              </div>

              <div className={`${styles["profile-edit__field"]} ${styles["profile-edit__name-field"]}`}>
                <Input
                  label="Фамилия"
                  requiredMark
                  variant="primary-light"
                  placeholder="Фамилия"
                  value={myProfile.lastName ?? ""}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  error={fieldErrors.lastName}
                />
              </div>

              <TextareaField
                className={styles["profile-edit__field--full"]}
                label="О себе"
                placeholder="Расскажите о себе"
                value={myProfile.bio ?? ""}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={5}
              />
            </div>

            <SectionTitle>ССЫЛКИ</SectionTitle>

            <LinksSection
              links={visibleLinks}
              canAddLink={canAddLink}
              onKeyChange={handleKeyChange}
              onValueChange={handleValueChange}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
            />
            <div className={styles["profile-edit__actions"]}>
              {saveError ? (
                <p className={styles["profile-edit__error"]} role="alert">
                  {saveError.message}
                </p>
              ) : null}
              <Button type="button" variant="outline-dark" size="wide" onClick={handleSave}>
                {isNewProfile ? "Создать профиль" : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}