"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, getToken, clearToken } from "@/lib/api";

function lastDays(n, byDay) {
  const map = Object.fromEntries(byDay.map((r) => [r.date, r.clicks]));
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
    out.push({ date: key.slice(5), clicks: map[key] || 0 });
  }
  return out;
}

export default function DashboardPage() {
  const router = useRouter();
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [chartData, setChartData] = useState([]);

  const logout = useCallback(() => {
    clearToken();
    router.push("/login");
  }, [router]);

  const loadLinks = useCallback(async () => {
    try {
      setLinks(await api("/links"));
    } catch (err) {
      if (err.status === 401) logout();
      else setError(err.message);
    }
  }, [logout]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    loadLinks();
  }, [router, loadLinks]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/links", { method: "POST", body: { url } });
      setUrl("");
      await loadLinks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function showChart(link) {
    setError("");
    try {
      const stats = await api(`/links/${link.id}/stats`);
      setSelected(link);
      setChartData(lastDays(14, stats.byDay));
    } catch (err) {
      setError(err.message);
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignora */
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Meus links</h1>
        <button onClick={logout} style={styles.ghost}>Sair</button>
      </header>

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, margin: "24px 0 8px" }}>
        <input
          type="url"
          placeholder="https://exemplo.com/uma-url-bem-longa"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{ ...styles.input, flex: 1 }}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Criando..." : "Encurtar"}
        </button>
      </form>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #8884" }}>
              <th style={styles.cell}>Link curto</th>
              <th style={styles.cell}>URL original</th>
              <th style={styles.cell}>Cliques</th>
              <th style={styles.cell}></th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr
                key={l.id}
                style={{
                  borderBottom: "1px solid #8882",
                  background: selected?.id === l.id ? "#2563eb15" : "transparent",
                }}
              >
                <td style={styles.cell}>
                  <a href={l.shortUrl} target="_blank" rel="noreferrer">
                    {l.shortUrl}
                  </a>
                </td>
                <td style={{ ...styles.cell, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {l.url}
                </td>
                <td style={styles.cell}>{l.clicks}</td>
                <td style={{ ...styles.cell, whiteSpace: "nowrap" }}>
                  <button onClick={() => copy(l.shortUrl)} style={styles.ghost}>Copiar</button>{" "}
                  <button onClick={() => showChart(l)} style={styles.ghost}>Ver gráfico</button>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...styles.cell, opacity: 0.6 }}>
                  Nenhum link ainda. Cole uma URL acima.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <section style={{ marginTop: 32 }}>
          <h2 style={{ marginBottom: 4 }}>Cliques por dia (últimos 14 dias)</h2>
          <p style={{ marginTop: 0, opacity: 0.7 }}>{selected.shortUrl}</p>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </main>
  );
}

const styles = {
  input: { padding: 10, borderRadius: 8, border: "1px solid #8886", fontSize: 16 },
  button: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
  },
  ghost: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #8886",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
  },
  cell: { padding: "10px 8px" },
};