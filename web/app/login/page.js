"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const data = await api(path, { method: "POST", body: { email, password } });
      setToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={{ margin: 0 }}>
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {error && <p style={{ color: "#c0392b", margin: 0 }}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={styles.link}
        >
          {mode === "login"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Entrar"}
        </button>
      </form>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 },
  card: {
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 24,
    border: "1px solid #8884",
    borderRadius: 12,
  },
  input: { padding: 10, borderRadius: 8, border: "1px solid #8886", fontSize: 16 },
  button: {
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
  },
  link: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 14,
  },
};