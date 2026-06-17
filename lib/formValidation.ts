import type { ProfileCareerEntry } from "@/types/types";

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_FILE_SIZE_LABEL = "5 МБ";
export const IMAGE_UPLOAD_HINT = `Можно загрузить изображение до ${MAX_IMAGE_FILE_SIZE_LABEL} (JPG, PNG, WEBP и др.)`;

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export function validateRequired(
  value: string,
  fieldName: string
): ValidationResult {
  if (!value.trim()) {
    return { isValid: false, error: `Заполните поле «${fieldName}»` };
  }
  return { isValid: true };
}

export function validateNickname(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: false, error: "Заполните поле «Никнейм»" };
  }
  if (trimmed.length < 3 || trimmed.length > 32) {
    return {
      isValid: false,
      error: "Никнейм должен быть от 3 до 32 символов",
    };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Никнейм может содержать только латиницу, цифры, точку, дефис и подчёркивание",
    };
  }
  return { isValid: true };
}

export function validateOptionalUrl(
  value: string,
  fieldName: string
): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { isValid: true };
  }

  return validateUrl(trimmed, fieldName);
}

export function validateRequiredUrl(
  value: string,
  fieldName: string
): ValidationResult {
  const required = validateRequired(value, fieldName);
  if (!required.isValid) {
    return required;
  }

  return validateUrl(value.trim(), fieldName);
}

function validateUrl(trimmed: string, fieldName: string): ValidationResult {
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      return {
        isValid: false,
        error: `«${fieldName}»: укажите ссылку с http:// или https://`,
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: `«${fieldName}»: некорректный формат ссылки`,
    };
  }
}

export function validateImageFile(file: File): ValidationResult {
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "Можно загружать только изображения" };
  }
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Размер файла не должен превышать ${MAX_IMAGE_FILE_SIZE_LABEL}`,
    };
  }
  return { isValid: true };
}

export type ProfileFormValues = {
  nickname: string;
  firstName: string;
  lastName: string;
};

export function validateProfileForm(
  values: ProfileFormValues
): Record<string, string> {
  const errors: Record<string, string> = {};

  const nickname = validateNickname(values.nickname);
  if (!nickname.isValid && nickname.error) {
    errors.nickname = nickname.error;
  }

  const firstName = validateRequired(values.firstName, "Имя");
  if (!firstName.isValid && firstName.error) {
    errors.firstName = firstName.error;
  }

  const lastName = validateRequired(values.lastName, "Фамилия");
  if (!lastName.isValid && lastName.error) {
    errors.lastName = lastName.error;
  }

  return errors;
}

export function hasProfileCoreFieldsFilled(
  values: ProfileFormValues
): boolean {
  return Boolean(
    values.nickname.trim() &&
      values.firstName.trim() &&
      values.lastName.trim()
  );
}

export type ProjectFormValues = {
  name: string;
  githubUrl: string;
};

export function validateProjectForm(
  values: ProjectFormValues
): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = validateRequired(values.name, "Название");
  if (!name.isValid && name.error) {
    errors.name = name.error;
  }

  const githubUrl = validateRequiredUrl(
    values.githubUrl,
    "Ссылка на GitHub"
  );
  if (!githubUrl.isValid && githubUrl.error) {
    errors.githubUrl = githubUrl.error;
  }

  return errors;
}

export function validateCareerEntries(
  entries: ProfileCareerEntry[]
): string | null {
  for (const entry of entries) {
    if (!entry.title.trim()) {
      return "У каждой записи карьеры укажите название";
    }
    if (!entry.organization.trim()) {
      return "У каждой записи карьеры укажите компанию, курс или университет";
    }
  }
  return null;
}

export function validateAuthLogin(
  email: string,
  password: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!email.trim()) {
    errors.email = "Укажите E-mail";
  }
  if (!password.trim()) {
    errors.password = "Укажите пароль";
  }
  return errors;
}
