import { checkEmail, checkPassword } from '../lib/validation';

describe('checkEmail', () => {
  test('should pass for valid email', () => {
    const result = checkEmail('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('should fail for email without @', () => {
    const result = checkEmail('testexample.com');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('В адресе почты должен быть символ @');
    expect(result.errors).toContain('Некорректный формат почты (например, user@domain.com)');
  });

  test('should fail for email with spaces', () => {
    const result = checkEmail('test user@example.com');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('В адресе почты не должно быть пробелов');
    expect(result.errors).toContain('Имя пользователя в адресе почты содержит недопустимые символы');
  });

  test('should fail for email with invalid username characters', () => {
    const result = checkEmail('test#invalid@example.com');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Имя пользователя в адресе почты содержит недопустимые символы');
  });

  test('should fail for email with invalid domain', () => {
    const result = checkEmail('test@domain');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Некорректный формат почты (например, user@domain.com)');
    expect(result.errors).toContain('Некорректный формат домена (например, domain.com)');
  });

  test('should fail for email too long', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(longEmail.length).toBeGreaterThan(254);
    const result = checkEmail(longEmail);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Адрес почты должен содержать от 3 до 254 символов');
  });

  test('should fail for empty email', () => {
    const result = checkEmail('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Адрес почты должен содержать от 3 до 254 символов');
    expect(result.errors).toContain('В адресе почты должен быть символ @');
    expect(result.errors).toContain('Некорректный формат почты (например, user@domain.com)');
  });
});

describe('checkPassword', () => {
  test('should pass for valid password', () => {
    const result = checkPassword('Password123!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('should fail for password too short', () => {
    const result = checkPassword('Pass1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Пароль должен содержать от 8 до 60 символов');
  });

  test('should fail for password too long', () => {
    const longPassword = 'A'.repeat(61) + 'a!';
    expect(longPassword.length).toBeGreaterThan(60);
    const result = checkPassword(longPassword);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Пароль должен содержать от 8 до 60 символов');
  });

  test('should fail for password without uppercase letter', () => {
    const result = checkPassword('password123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Пароль должен содержать хотя бы одну заглавную латинскую букву');
  });

  test('should fail for password without lowercase letter', () => {
    const result = checkPassword('PASSWORD123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Пароль должен содержать хотя бы одну строчную латинскую букву');
  });

  test('should fail for password without special character', () => {
    const result = checkPassword('Password123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*(),.?":{}|<>)');
  });

  test('should fail for empty password', () => {
    const result = checkPassword('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Пароль должен содержать от 8 до 60 символов');
    expect(result.errors).toContain('Пароль должен содержать хотя бы одну заглавную латинскую букву');
    expect(result.errors).toContain('Пароль должен содержать хотя бы одну строчную латинскую букву');
    expect(result.errors).toContain('Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*(),.?":{}|<>)');
  });
});
