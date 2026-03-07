"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/stores/auth/hooks";
import { tokenService } from "@/lib/tokenService";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await tokenService.logout(dispatch);
    router.replace("/auth");
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard (заглушка)</h1>
      <p>Вы вошли в систему. Здесь будет контент после входа.</p>
      <nav style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/profile">Профиль</Link>
        <button type="button" onClick={handleLogout}>
          Выйти
        </button>
      </nav>
    </main>
  );
}
