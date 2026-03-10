"use client";

import { Button } from "@/components/ui/button/Button";
import type { UserProfileInfo } from "@/types/types";
import { SectionTitle } from "@/components/ui/section-title/SectionTitle";
import { Field } from "@/components/ui/field/Field";
import { TextareaField } from "@/components/ui/textarea-field/TextareaField";
import { EditAdornment } from "@/components/ui/edit-adornment/EditAdornment";
import styles from "./ProfileEditForm.module.scss";
import { SkillsSection } from "../skills/skillSection/SkillsSection";

type ProfileEditFormProps = {
  profile?: Partial<UserProfileInfo>;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const links = profile?.links ?? {};
  const socialLink = links.social ?? links.linkedin ?? links.telegram ?? "";
  const projectsLink = links.projects ?? links.github ?? links.portfolio ?? "";

  return (
    <section className={styles["profile-edit"]}>
      <div className={styles["profile-edit__shell"]}>
        <div className={styles["profile-edit__card"]}>
          <div className={styles["profile-edit__hero"]}>
            <div className={styles["profile-edit__avatar"]} />
          </div>

          <div className={styles["profile-edit__content"]}>
            <SectionTitle>ВНЕШНИЙ ВИД</SectionTitle>

            <div className={styles["profile-edit__stack"]}>
              <Field
                label="Изображение профиля"
                placeholder="JPEG, PNG, ИЛИ GIF (менее 15 МБ)"
                value={profile?.avatarURL}
                rightAdornment={<EditAdornment />}
              />

            </div>

            <SectionTitle>ОПИСАНИЕ</SectionTitle>

            <div className={styles["profile-edit__grid"]}>
              <Field
                className={styles["profile-edit__field--half"]}
                label="Имя"
                placeholder="Имя"
                value={profile?.firstName}
              />
              <Field
                className={styles["profile-edit__field--half"]}
                label="Фамилия"
                placeholder="Фамилия"
                value={profile?.lastName}
              />
              <Field
                className={styles["profile-edit__field--full"]}
                label="ID-пользователя"
                placeholder="id-000000000"
                value={profile?.userId}
              />
              <TextareaField
                className={styles["profile-edit__field--full"]}
                label="О себе"
                placeholder="Расскажите всем о своих навыках"
                value={profile?.bio ?? ""}
                rows={5}
              />
            </div>

            <SkillsSection
              initialSkills={profile?.skills}
              onSkillsChange={(skills) => {
                console.log('Навыки обновлены:', skills);
              }}
            />
            <SectionTitle>ССЫЛКИ</SectionTitle>

            <div className={styles["profile-edit__stack"]}>
              <Field
                label="Соцсети"
                placeholder="https://ссылка-на-соцсети"
                value={socialLink}
              />
              <Field
                label="Проекты"
                placeholder="https://ссылка-на-проект"
                value={projectsLink}
              />
            </div>
            <p className={styles["profile-edit__hint"]}>
              Добавьте до 5 ссылок на социальные сети и проекты, которые будут
              отображаться в вашем профиле
            </p>

            <div className={styles["profile-edit__actions"]}>
              <Button type="button" variant="outline-dark" size="wide">
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}