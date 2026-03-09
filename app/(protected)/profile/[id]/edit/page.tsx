"use client";

import Link from "next/link";

export default function ProfileEditPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Редактирование профиля (заглушка)</h1>
      <nav style={{ marginTop: "1rem" }}>
        <Link href="/dashboard">← Назад в Dashboard</Link>
      </nav>
    </main>
  );
}
