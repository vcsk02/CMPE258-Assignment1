// app/src/components/TodoApp.tsx
"use client";

import { signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { auth } from "../app/lib/firebase";
import {
  addTodo,
  deleteTodo,
  subscribeTodos,
  toggleTodo,
  updateTodoText,
  type Todo,
} from "../app/lib/todos";

type Style = "pirate" | "corporate" | "haiku";

export default function TodoApp({ uid }: { uid: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeTodos(uid, setTodos, (e) => setErr(String(e)));
    return () => unsub();
  }, [uid]);

  const visible = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  async function onAdd() {
    setErr(null);
    try {
      await addTodo(uid, text);
      setText("");
    } catch (e) {
      setErr(String(e));
    }
  }

  async function rewrite(todo: Todo, style: Style) {
    setErr(null);
    setBusyId(todo.id);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: todo.text, style }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { rewritten: string };
      await updateTodoText(uid, todo.id, data.rewritten);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.top}>
        <h1 style={styles.h1}>Retro Todo + ✨ Gemini Rewrite</h1>
        <button style={styles.btn} onClick={() => signOut(auth)}>
          Sign out
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Add a todo…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
            }}
          />
          <button style={styles.btnPrimary} onClick={onAdd}>
            Add
          </button>
        </div>

        <div style={styles.row}>
          <span style={{ opacity: 0.8 }}>Filter:</span>
          {(["all", "active", "done"] as const).map((f) => (
            <button
              key={f}
              style={filter === f ? styles.pillOn : styles.pill}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {err && <div style={styles.err}>⚠ {err}</div>}

        <div style={{ marginTop: 12 }}>
          {visible.length === 0 ? (
            <div style={{ opacity: 0.75, padding: 12 }}>No todos yet.</div>
          ) : (
            visible.map((t) => (
              <div key={t.id} style={styles.todo}>
                <label style={styles.todoLeft}>
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={(e) => toggleTodo(uid, t.id, e.target.checked)}
                  />
                  <span style={{ ...styles.todoText, ...(t.done ? styles.done : {}) }}>
                    {t.text}
                  </span>
                </label>

                <div style={styles.todoRight}>
                  <select
                    disabled={busyId === t.id}
                    defaultValue="pirate"
                    onChange={(e) => rewrite(t, e.target.value as Style)}
                    style={styles.select}
                    title="Rewrite style"
                  >
                    <option value="pirate">pirate</option>
                    <option value="corporate">corporate</option>
                    <option value="haiku">haiku</option>
                  </select>
                  <button
                    style={styles.btn}
                    disabled={busyId === t.id}
                    onClick={() => rewrite(t, "pirate")}
                    title="Rewrite"
                  >
                    {busyId === t.id ? "…" : "✨"}
                  </button>
                  <button style={styles.btnDanger} onClick={() => deleteTodo(uid, t.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
          Tip: In your video, show the prompts you used (Antigravity or any agentic tool),
          then demo CRUD + ✨ rewrite + deployed link.
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  wrap: { maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "ui-sans-serif, system-ui" },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  h1: { margin: 0, fontSize: 22 },
  card: {
    marginTop: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 14,
    padding: 16,
    background: "white",
  },
  row: { display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" },
  input: {
    flex: 1,
    minWidth: 220,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
  },
  btn: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
    background: "#f7f7f7",
    cursor: "pointer",
  },
  btnPrimary: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },
  btnDanger: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(220, 38, 38, 0.35)",
    background: "rgba(220, 38, 38, 0.08)",
    cursor: "pointer",
  },
  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.2)",
    background: "transparent",
    cursor: "pointer",
  },
  pillOn: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.2)",
    background: "#111",
    color: "white",
    cursor: "pointer",
  },
  err: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.25)",
  },
  todo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    marginTop: 10,
  },
  todoLeft: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  todoText: { lineHeight: 1.3 },
  done: { textDecoration: "line-through", opacity: 0.65 },
  todoRight: { display: "flex", gap: 8, alignItems: "center" },
  select: { padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.2)" },
};
