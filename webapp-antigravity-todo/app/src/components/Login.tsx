"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../app/lib/firebase";
import { useUser } from "./AuthGate";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/todos");
  }, [loading, user, router]);

  async function signIn() {
    setErr(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/todos");
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "80px auto", padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ margin: 0, fontSize: 26 }}>Retro Todo + ✨ Gemini Rewrite</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        Sign in to create todos stored in Firestore. Each todo can be “rewritten” using Gemini.
      </p>

      {err && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: "rgba(220,38,38,0.08)" }}>
          ⚠ {err}
        </div>
      )}

      <button
        onClick={signIn}
        style={{
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: 12,
          background: "#111",
          color: "white",
          border: "1px solid rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
