import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt?: any;
};

export function todosCol(uid: string) {
  return collection(db, "users", uid, "todos");
}

export function subscribeTodos(
  uid: string,
  cb: (todos: Todo[]) => void,
  onError?: (e: unknown) => void
) {
  const q = query(todosCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const todos: Todo[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return { id: d.id, text: data.text, done: !!data.done, createdAt: data.createdAt };
      });
      cb(todos);
    },
    (err) => onError?.(err)
  );
}

export async function addTodo(uid: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(todosCol(uid), {
    text: trimmed,
    done: false,
    createdAt: serverTimestamp(),
  });
}

export async function toggleTodo(uid: string, id: string, done: boolean) {
  await updateDoc(doc(db, "users", uid, "todos", id), { done });
}

export async function deleteTodo(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "todos", id));
}

export async function updateTodoText(uid: string, id: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await updateDoc(doc(db, "users", uid, "todos", id), { text: trimmed });
}
