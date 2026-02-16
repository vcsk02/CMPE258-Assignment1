"use client";

import AuthGate, { useUser } from "../../components/AuthGate";
import TodoApp from "../../components/TodoApp";

export default function TodosPage() {
  return (
    <AuthGate redirectTo="/">
      <TodosInner />
    </AuthGate>
  );
}

function TodosInner() {
  const { user } = useUser();
  if (!user) return null;
  return <TodoApp uid={user.uid} />;
}
