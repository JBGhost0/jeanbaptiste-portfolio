"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form action={action} className="glass w-full max-w-sm space-y-4 rounded-3xl p-8">
        <p className="font-mono text-xs tracking-widest text-lime">ESPACE D&apos;ÉDITION</p>
        <h1 className="font-display text-2xl">Connexion</h1>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Mot de passe"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-lime"
        />
        {state?.error && (
          <p role="alert" className="text-sm text-red-400">
            {state.error}
          </p>
        )}
        <button
          disabled={pending}
          className="w-full rounded-full bg-lime px-6 py-3 font-medium text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Vérification…" : "Entrer"}
        </button>
      </form>
    </div>
  );
}