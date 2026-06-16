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
};

export function getKnownApiErrorMessage(error: unknown): string | undefined {
  const code = getApiErrorCode(error);
  if (!code) {
    return undefined;
  }

  return KNOWN_API_ERROR_MESSAGES[code];
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
    return data.trim();
  }

  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;
    for (const key of ["message", "error", "detail", "title"] as const) {
      const value = payload[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }

  return fallback;
}

export function getProfileSaveErrorMessage(error: unknown): string {
  return (
    getKnownApiErrorMessage(error) ??
    extractApiErrorMessage(error, "Не удалось сохранить профиль")
  );
}
