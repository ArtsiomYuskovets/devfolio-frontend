export const PASSWORD_REQUIREMENTS_HINT =
  "От 8 до 60 символов: минимум одна заглавная и одна строчная латинская буква, а также спецсимвол (!@#$%^&*(),.?\":{}|<>)";

export const checkPassword = (password: string): { isValid: boolean, errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 8 || password.length > 60) {
        errors.push("Пароль должен содержать от 8 до 60 символов");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Пароль должен содержать хотя бы одну заглавную латинскую букву");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Пароль должен содержать хотя бы одну строчную латинскую букву");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*(),.?\":{}|<>)");
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const checkEmail = (email: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (email.length <= 3 || email.length >= 254) {
        errors.push("Адрес почты должен содержать от 3 до 254 символов");
    }

    if (/\s/.test(email)) {
        errors.push("В адресе почты не должно быть пробелов");
    }

    if (!email.includes('@')) {
        errors.push("В адресе почты должен быть символ @");
        errors.push("Некорректный формат почты (например, user@domain.com)");
        return { isValid: false, errors }; 
    }

    const [username, domain] = email.split('@');

    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(username)) {
        errors.push("Имя пользователя в адресе почты содержит недопустимые символы");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push("Некорректный формат почты (например, user@domain.com)");
    }

    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
        errors.push("Некорректный формат домена (например, domain.com)");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};