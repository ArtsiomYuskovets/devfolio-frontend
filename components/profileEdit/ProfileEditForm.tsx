"use client";

import { Button } from "@/components/ui/button/Button";
import type { UserProfileInfo } from "@/types/types";
import { SectionTitle } from "@/components/ui/section-title/SectionTitle";
import { Input } from "@/components/ui/input/Input";
import { TextareaField } from "@/components/ui/textarea-field/TextareaField";
import { EditAdornment } from "@/components/ui/edit-adornment/EditAdornment";
import styles from "./ProfileEditForm.module.scss";
import { useState, useCallback, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  useUpdateMyProfileMutation,
  useUploadAvatarMutation,
} from "@/stores/user/userApi";
import { LinksSection } from "@/components/section/linkSection/LinkSection";

type ProfileEditFormProps = {
  profile?: Partial<UserProfileInfo>;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [myProfile, setMyProfile] = useState<Partial<UserProfileInfo>>(profile ?? {});
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const [uploadAvatar, { isLoading: isAvatarUploading }] = useUploadAvatarMutation();
  const [links, setLinks] = useState<Array<{ key: string; value: string }>>(() => {
    const initialLinks = profile?.links ?? {};
    const linksArray = Object.entries(initialLinks).map(([key, value]) => ({
      key,
      value
    }));
    
    return linksArray.length > 0 ? linksArray : [{ key: '', value: '' }];
  });

  const handleChange = (field: keyof UserProfileInfo, value: string) => {
    setMyProfile(prev => ({ ...prev, [field]: value }));
  };

  const selectedUserType = myProfile.userType ?? "JOB_SEEKER";

  useEffect(() => {
    if (!profile) {
      return;
    }
    setMyProfile(profile);
    const initialLinks = profile.links ?? {};
    const linksArray = Object.entries(initialLinks).map(([key, value]) => ({
      key,
      value,
    }));
    setLinks(linksArray.length > 0 ? linksArray : [{ key: "", value: "" }]);
  }, [profile]);

  const handleKeyChange = useCallback((index: number, newKey: string) => {
    setLinks(prev => {
      const newLinks = [...prev];
        newLinks[index] = { ...newLinks[index], key: newKey };
        return newLinks;
      });
  }, []);
  const handleValueChange = useCallback((index: number, newValue: string) => {
    setLinks(prev => {
      const newLinks = [...prev];
      newLinks[index] = { ...newLinks[index], value: newValue };
      return newLinks;
    });
  }, []);
  const handleRemoveLink = useCallback((indexToRemove: number) => {
    const newLinks = links.filter((_, index) => index !== indexToRemove);
    setLinks(newLinks.length > 0 ? newLinks : [{ key: '', value: '' }]);
  }, []);
  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const linksObject: Record<string, string> = Object.fromEntries(
        links
          .filter(({ key, value }) => key && value)
          .map(({ key, value }) => [key, value])
      );
      const { skills: _skills, ...profileWithoutSkills } = myProfile;
      const profileToSave = {
        ...profileWithoutSkills,
        links: linksObject,
      };
      const updatedProfile = await updateMyProfile(profileToSave).unwrap();
      if (updatedProfile) {
        setMyProfile(updatedProfile);
        const userId = updatedProfile.userId;
        if (userId) {
          router.push(`/profile/${userId}`);
        }
        alert("Профиль успешно обновлен");
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при обновлении профиля');
    }
  };
  const handleAddLink = useCallback(() => {
    if (links.length < 5) {
      setLinks([...links, { key: '', value: '' }]);
    }
  }, []);

  const handleAvatarUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }
      try {
        const result = await uploadAvatar(file).unwrap();
        if (typeof result === "string" && result.trim()) {
          setMyProfile((prev) => ({ ...prev, avatarURL: result.trim() }));
        }
      } catch {
        alert("Не удалось загрузить аватар");
      } finally {
        input.value = "";
      }
    },
    [uploadAvatar]
  );

  return (
    <section className={styles["profile-edit"]}>
      <div className={styles["profile-edit__shell"]}>
        <div className={styles["profile-edit__card"]}>
          <div className={styles["profile-edit__hero"]}>
            <div className={styles["profile-edit__avatar"]}>
              {myProfile.avatarURL ? (
                <img
                  src={myProfile.avatarURL}
                  alt="Аватар профиля"
                  className={styles["profile-edit__avatar-img"]}
                />
              ) : null}
            </div>
          </div>

          <div className={styles["profile-edit__content"]}>
            <SectionTitle>ВНЕШНИЙ ВИД</SectionTitle>

            <div className={styles["profile-edit__stack"]}>
              <div className={styles["profile-edit__field"]}>
                <Input
                  label="Изображение профиля"
                  className={styles["profile-edit__input"]}
                  variant="primary-light"
                  placeholder="https://example.com/avatar.jpg"
                  value={myProfile.avatarURL ?? ""}
                  onChange={(e) => handleChange('avatarURL', e.target.value)}
                  rightAdornment={<EditAdornment />}
                />
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
                    variant="outline-dark"
                    size="small"
                    onClick={() =>
                      document.getElementById("profile-avatar-upload")?.click()
                    }
                    disabled={isAvatarUploading}
                  >
                    {isAvatarUploading ? "Загрузка..." : "Загрузить файл"}
                  </Button>
                </div>
              </div>
              <div className={styles["profile-edit__field"]}>
                <Input
                  label="Никнейм"
                  className={styles["profile-edit__input"]}
                  variant="primary-light"
                  placeholder="nickname"
                  value={myProfile.nickname ?? ""}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  rightAdornment={<EditAdornment />}
                />
              </div>
              <div className={styles["profile-edit__field"]}>
                <span className={styles["profile-edit__radio-label"]}>
                  Тип пользователя
                </span>
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
              <div className={styles["profile-edit__field"]}>
                <Input
                  label="Имя"
                  className={styles["profile-edit__input"]}
                  variant="primary-light"
                  placeholder="Имя"
                  value={myProfile.firstName ?? ""}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
              </div>

              <div className={styles["profile-edit__field"]}>
                <Input
                  label="Фамилия"
                  className={styles["profile-edit__input"]}
                  variant="primary-light"
                  placeholder="Фамилия"
                  value={myProfile.lastName ?? ""}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              </div>

              <div className={styles["profile-edit__field--full"]}>
                <Input
                  label="ID-пользователя"
                  className={styles["profile-edit__input"]}
                  variant="primary-light"
                  placeholder="id-000000000"
                  value={myProfile.userId ?? ""}
                  readOnly
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
              links={links}
              onKeyChange={handleKeyChange}
              onValueChange={handleValueChange}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
            />
            <div className={styles["profile-edit__actions"]}>
              <Button type="button" variant="outline-dark" size="wide" onClick={handleSave}>
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}