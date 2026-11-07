import { isAuthed } from "@/lib/auth";
import { readAll } from "@/lib/content";
import AdminApp from "./AdminApp";
import LoginForm from "./LoginForm";

export default async function AdminPage() {
  if (!(await isAuthed())) return <LoginForm />;
  const content = await readAll();
  return <AdminApp initial={JSON.parse(JSON.stringify(content))} />;
}