export function getApiErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined;
  }
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  const data = record.data;

  if (data && typeof data === "object") {
    const code = (data as Record<string, unknown>).code;
    if (typeof code === "string" && code.trim()) {
      return code.trim();
    }
  }

  return undefined;
}

const KNOWN_API_ERROR_MESSAGES: Record<string, string> = {
  NICKNAME_ALREADY_EXISTS: "Этот никнейм уже занят. Выберите другой.",
  REFRESH_TOKEN_MISSING: "Сессия истекла. Войдите снова.",
  UNAUTHORIZED: "Требуется авторизация.",
  FORBIDDEN: "Недостаточно прав для этого действия.",
};

const ENGLISH_MESSAGE_REPLACEMENTS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /^network error$/i, message: "Нет соединения с сервером" },
  { pattern: /^failed to fetch$/i, message: "Не удалось выполнить запрос к серверу" },
  { pattern: /^timeout/i, message: "Превышено время ожидания ответа сервера" },
  { pattern: /^unauthorized$/i, message: "Требуется авторизация" },
  { pattern: /^forbidden$/i, message: "Недостаточно прав для этого действия" },
  { pattern: /^not found$/i, message: "Ресурс не найден" },
  { pattern: /^internal server error$/i, message: "Внутренняя ошибка сервера" },
  { pattern: /^bad request$/i, message: "Некорректный запрос" },
];

export function localizeUserFacingMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (KNOWN_API_ERROR_MESSAGES[trimmed]) {
    return KNOWN_API_ERROR_MESSAGES[trimmed];
  }

  for (const { pattern, message: localized } of ENGLISH_MESSAGE_REPLACEMENTS) {
    if (pattern.test(trimmed)) {
      return localized;
    }
  }

  return trimmed;
}

export function getKnownApiErrorMessage(error: unknown): string | undefined {
  const code = getApiErrorCode(error);
  if (!code) {
    return undefined;
  }

  return KNOWN_API_ERROR_MESSAGES[code];
}

function resolveApiErrorText(error: unknown, fallback: string): string {
  const known = getKnownApiErrorMessage(error);
  if (known) {
    return known;
  }

  return extractApiErrorMessage(error, fallback);
}

export function isProfileNotFoundError(error: unknown): boolean {
  return getApiErrorStatus(error) === 404;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback = "Произошла ошибка"
): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const record = error as Record<string, unknown>;
  const data = record.data;

  if (typeof data === "string" && data.trim()) {
    return localizeUserFacingMessage(data.trim());
  }

  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;
    for (const key of ["message", "error", "detail", "title"] as const) {
      const value = payload[key];
      if (typeof value === "string" && value.trim()) {
        return localizeUserFacingMessage(value.trim());
      }
    }
  }

  if (typeof record.message === "string" && record.message.trim()) {
    return localizeUserFacingMessage(record.message.trim());
  }

  return localizeUserFacingMessage(fallback);
}

export function getProfileSaveErrorMessage(error: unknown): string {
  return resolveApiErrorText(error, "Не удалось сохранить профиль");
}

export function getProjectApiErrorMessage(
  error: unknown,
  fallback = "Произошла ошибка"
): string {
  const message = resolveApiErrorText(error, fallback);
  const status = getApiErrorStatus(error);

  if (status === 403) {
    return `${message} Проверьте права доступа и настройки безопасности на сервере.`;
  }

  return message;
}
