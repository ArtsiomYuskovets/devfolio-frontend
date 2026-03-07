"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Профиль (заглушка)</h1>
      <p>Страница профиля. Доступна только после входа.</p>
      <nav style={{ marginTop: "1rem" }}>
        <Link href="/dashboard">← Назад в Dashboard</Link>
      </nav>
    </main>
  );
}
