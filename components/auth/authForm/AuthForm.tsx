"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/auth/authForm/AuthForm.module.scss";
import { loginOrRegistr } from "@/services/authService";
import { tokenService } from "@/lib/tokenService";
import { checkEmail, checkPassword } from "@/lib/validation";
import { useAppSelector, useAppDispatch } from "@/stores/auth/hooks";
import { setTokens } from "@/stores/auth/authSlice";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";


export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { accessToken, accessTokenExpiresAt } = useAppSelector((state) => state.auth);

  const isAuthenticated =
    !!accessToken &&
    !!accessTokenExpiresAt &&
    Date.now() < accessTokenExpiresAt;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }
    tokenService.setDispatchCallback((dispatch, accessToken, expiresAt) => {
      dispatch(setTokens({ accessToken, expiresAt }));
    });
  }, [accessToken, accessTokenExpiresAt, dispatch, isAuthenticated, router]);

  useEffect(() => {
    const fromWelcome = sessionStorage.getItem("fromWelcome");
    if (fromWelcome === "false") {
      setIsLogin(false);
    }
  }, []);

  useEffect(() => {
    tokenService.logout(dispatch);
  }, [dispatch]);

  const handleSwitch = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setLoginError(null);
    setConfirmPassword("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setLoginError(null);

    if (isLogin) {
      const success = await loginOrRegistr(isLogin, email, password, dispatch);
      if (success) {
        router.replace("/profile/edit");
      } else {
        setLoginError("Неверная почта или пароль");
      }
      return;
    }

    const emailValidation = checkEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.errors[0] ?? "Неверный формат email");
      return;
    }

    const passwordValidation = checkPassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.errors[0] ?? "Пароль не соответствует требованиям");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Пароли не совпадают");
      return;
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Подтвердите пароль");
      return;
    }

    const success = await loginOrRegistr(isLogin, email, password, dispatch);
    if (success) {
      router.replace("/profile/edit");
    } else {
      setLoginError("Ошибка регистрации. Попробуйте снова.");
    }
  };

  const passwordToggleButton = (visible: boolean, onClick: () => void) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={visible ? "Hide password" : "Show password"}
      onClick={onClick}
      className={styles.auth__passwordToggle}
    >
      {visible ? "Скрыть" : "Показать"}
    </button>
  );

  return (
    <div className={styles.auth}>
      <div
        className={`${styles.auth__strip} ${!isLogin ? styles["auth__strip--shifted"] : ""}`}
      >
        <div className={`${styles.auth__panel} ${styles["auth__panel--welcome-dark"]}`}>
          <div className={styles.auth__welcome}>
            <h2 className={styles["auth__welcome-title"]}>
              Присоединяйся к сообществу
            </h2>
            <p className={styles["auth__welcome-text"]}>
              Делитесь опытом, откройте для себя новые проекты и найдите
              участников для реализации своих идей.
            </p>
            <Button
              type="button"
              variant="primary-transparent"
              size="wide"
              onClick={() => handleSwitch(false)}
            >
              переключиться на РЕГИСТРАЦИЮ
            </Button>
          </div>
        </div>

        <div className={`${styles.auth__panel} ${styles["auth__panel--form-light"]}`}>
          <div className={styles["auth__form-wrap"]}>
            <form className={styles.auth__form} onSubmit={handleSubmit}>
              <h2 className={styles["auth__form-title"]}>ВХОД</h2>
              {loginError && (
                <span className={styles.auth__formError} role="alert">
                  {loginError}
                </span>
              )}
              <Input
                variant="outline-dark"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                variant="outline-dark"
                type={passwordVisible ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                rightAdornment={passwordToggleButton(
                  passwordVisible,
                  () => setPasswordVisible((v) => !v)
                )}
              />
              <Button type="submit" variant="outline-dark" size="wide">
                ВХОД
              </Button>
            </form>
          </div>
        </div>

        <div className={`${styles.auth__panel} ${styles["auth__panel--form-dark"]}`}>
          <div className={styles["auth__form-wrap"]}>
            <form className={styles.auth__form} onSubmit={handleSubmit}>
              <h2 className={styles["auth__form-title"]}>РЕГИСТРАЦИЯ</h2>
              {loginError && (
                <span className={styles.auth__formError} role="alert">
                  {loginError}
                </span>
              )}
              <Input
                variant="outline-transparent"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError ?? undefined}
                autoComplete="email"
              />
              <Input
                variant="outline-transparent"
                type={passwordVisible ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError ?? undefined}
                autoComplete="new-password"
                rightAdornment={passwordToggleButton(
                  passwordVisible,
                  () => setPasswordVisible((v) => !v)
                )}
              />
              <Input
                variant="outline-transparent"
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPasswordError ?? undefined}
                autoComplete="new-password"
                rightAdornment={passwordToggleButton(
                  confirmPasswordVisible,
                  () => setConfirmPasswordVisible((v) => !v)
                )}
              />
              <Button type="submit" variant="outline-transparent" size="wide">
                РЕГИСТРАЦИЯ
              </Button>
            </form>
          </div>
        </div>

        <div className={`${styles.auth__panel} ${styles["auth__panel--welcome-light"]}`}>
          <div className={styles.auth__welcome}>
            <h2 className={styles["auth__welcome-title"]}>
              Присоединяйся к сообществу
            </h2>
            <p className={styles["auth__welcome-text"]}>
              Делитесь опытом, откройте для себя новые проекты и найдите
              участников для реализации своих идей.
            </p>
            <Button
              type="button"
              variant="outline-light"
              size="wide"
              onClick={() => handleSwitch(true)}
            >
              переключиться на ВХОД
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
