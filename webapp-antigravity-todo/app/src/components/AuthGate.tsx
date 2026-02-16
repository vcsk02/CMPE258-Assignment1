"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../app/lib/firebase";
import { useRouter } from "next/navigation";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, loading };
}

export default function AuthGate({
  children,
  redirectTo = "/",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace(redirectTo);
  }, [loading, user, router, redirectTo]);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return null;
  return <>{children}</>;
}
