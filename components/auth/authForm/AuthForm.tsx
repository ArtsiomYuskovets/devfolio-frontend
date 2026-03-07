"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/auth/authForm/AuthForm.module.scss";
import { loginOrRegistr } from "@/services/authService";
import { tokenService } from "@/lib/tokenService";
import { setAccessTokenGetter, setupInterceptors } from "@/lib/authApi";
import { useAppSelector, useAppDispatch } from "@/stores/auth/hooks";
import { setTokens } from "@/stores/auth/authSlice";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";

const REGISTER_PATH = "/profile-settings";
const LOGIN_PATH = "/dashboard";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { accessToken, accessTokenExpiresAt } = useAppSelector((state) => state.auth);

  const isAuthenticated =
    !!accessToken &&
    !!accessTokenExpiresAt &&
    Date.now() < accessTokenExpiresAt;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(LOGIN_PATH);
      return;
    }
    tokenService.setDispatchCallback((dispatch, accessToken, expiresAt) => {
      dispatch(setTokens({ accessToken, expiresAt }));
    });
    setAccessTokenGetter(() => {
      if (accessToken && accessTokenExpiresAt && Date.now() <= accessTokenExpiresAt) {
        return accessToken;
      }
      return null;
    });
    setupInterceptors(dispatch);
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
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await loginOrRegistr(isLogin, email, password, dispatch);
    if (success) {
      if (isLogin) {
        router.replace(LOGIN_PATH);
      } else {
        router.replace(REGISTER_PATH);
      }
    }
  };

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
              <Input
                variant="outline-dark"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                variant="outline-dark"
                type="password"
                placeholder="ПАРОЛЬ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <Input variant="outline-transparent" placeholder="ИМЯ" />
              <Input variant="outline-transparent" placeholder="ФАМИЛИЯ" />
              <Input
                variant="outline-transparent"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                variant="outline-transparent"
                type="password"
                placeholder="ПАРОЛЬ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
