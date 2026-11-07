"use client";
import { useEffect, useState, useTransition } from "react";
import { defaults } from "@/data/content";
import { logout, saveSection } from "./actions";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

const SECTIONS: [string, string][] = [
  ["about", "À propos"],
  ["skills", "Compétences"],
  ["journey", "Parcours"],
  ["experiences", "Expérience"],
  ["projects", "Projets"],
  ["gallery", "Réalisations"],
  ["hobbies", "Passe-temps"],
  ["contact", "Contact"],
];

const LABELS: Record<string, string> = {
  lead: "Texte d'accroche", more: "Suite du texte", chips: "Pastilles", name: "Nom",
  summary: "Résumé", items: "Sous-compétences", text: "Description", tag: "Étiquette",
  title: "Titre", org: "Organisation", points: "Points", tech: "Technologies",
  links: "Liens", label: "Texte du bouton", href: "Adresse du lien",
  image: "Image (adresse du lien)", draft: "Brouillon (caché sur le site)",
  email: "E-mail", github: "GitHub", whatsapp: "WhatsApp",
  agro: "Compétences Agro", dev: "Compétences Dev", id: "Identifiant (non modifiable)",
};
const LONG = new Set(["lead", "more", "text"]);

// Modèle d'un nouvel élément quand une liste est vide
const EMPTY: Record<string, Json> = {
  "about.chips": "",
  journey: { tag: "", title: "", text: "", draft: false },
  experiences: { title: "", org: "", points: [], draft: false },
  "experiences.*.points": "",
  projects: { tag: "", title: "", text: "", tech: [], links: [], draft: false },
  "projects.*.tech": "",
  "projects.*.links": { label: "", href: "" },
  gallery: { title: "", image: "", draft: false },
  hobbies: { id: "", label: "", text: "", points: [] },
  "hobbies.*.points": { title: "", text: "" },
  "skills.agro": { name: "", summary: "", items: [] },
  "skills.dev": { name: "", summary: "", items: [] },
  "skills.agro.*.items": { name: "", text: "" },
  "skills.dev.*.items": { name: "", text: "" },
  "contact.whatsapp": { label: "", href: "" },
};

const INPUT =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none transition focus:border-lime read-only:opacity-50";

const clone = (v: Json): Json => JSON.parse(JSON.stringify(v));

function blank(v: Json): Json {
  if (typeof v === "string") return "";
  if (typeof v === "number") return 0;
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]));
  }
  return "";
}

function summary(v: Json, i: number): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    for (const k of ["title", "name", "label", "org", "tag"]) {
      const s = v[k];
      if (typeof s === "string" && s) return s;
    }
  }
  return `Élément ${i + 1}`;
}
const isDraft = (v: Json) =>
  !!v && typeof v === "object" && !Array.isArray(v) && v.draft === true;

function Ctl({ i, n, move, remove }: { i: number; n: number; move: (i: number, d: number) => void; remove: (i: number) => void }) {
  const b =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-sm transition hover:border-lime disabled:opacity-30";
  return (
    <div className="flex gap-1">
      <button type="button" className={b} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">↑</button>
      <button type="button" className={b} onClick={() => move(i, 1)} disabled={i === n - 1} aria-label="Descendre">↓</button>
      <button type="button" className={b} onClick={() => remove(i)} aria-label="Supprimer">✕</button>
    </div>
  );
}

function List({ label, value, pattern, onChange, bare }: { label: string; value: Json[]; pattern: string; onChange: (v: Json) => void; bare?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const tpl = value.length ? blank(value[0]) : clone(EMPTY[pattern] ?? "");
  const flat = typeof tpl === "string";

  const set = (i: number, v: Json) => onChange(value.map((x, k) => (k === i ? v : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    if (open === i) setOpen(j);
    else if (open === j) setOpen(i);
  };
  const remove = (i: number) => {
    if (!window.confirm("Supprimer cet élément ?")) return;
    onChange(value.filter((_, k) => k !== i));
    setOpen(null);
  };
  const add = () => {
    onChange([...value, tpl]);
    if (!flat) setOpen(value.length);
  };

  return (
    <div>
      {!bare && <p className="mb-2 text-sm font-medium">{label}</p>}
      <div className="space-y-2">
        {value.map((item, i) =>
          flat ? (
            <div key={i} className="flex gap-2">
              <input
                value={typeof item === "string" ? item : ""}
                onChange={(e) => set(i, e.target.value)}
                className={INPUT}
              />
              <Ctl i={i} n={value.length} move={move} remove={remove} />
            </div>
          ) : (
            <div key={i} className="glass rounded-2xl">
              <div className="flex items-center gap-2 p-2 pl-4">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="flex-1 truncate py-2 text-left"
                >
                  <span className="font-mono text-xs text-muted">{i + 1}</span>{" "}
                  <span>{summary(item, i)}</span>
                  {isDraft(item) && (
                    <span className="ml-2 rounded-full border border-amber/60 px-2 text-xs text-amber">brouillon</span>
                  )}
                </button>
                <Ctl i={i} n={value.length} move={move} remove={remove} />
              </div>
              {open === i && (
                <div className="space-y-4 border-t border-white/10 p-4">
                  <Node name="" value={item} pattern={`${pattern}.*`} onChange={(v) => set(i, v)} />
                </div>
              )}
            </div>
          )
        )}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 rounded-full border border-lime/50 px-4 py-1.5 text-sm text-lime transition hover:bg-lime/10"
      >
        + Ajouter
      </button>
    </div>
  );
}

function Node({ name, value, pattern, onChange, bare }: { name: string; value: Json; pattern: string; onChange: (v: Json) => void; bare?: boolean }) {
  const label = LABELS[name] ?? name;

  if (typeof value === "string") {
    const long = LONG.has(name) || value.length > 90;
    return (
      <label className="block">
        <span className="mb-1 block text-xs text-muted">{label}</span>
        {long ? (
          <textarea
            value={value}
            rows={Math.min(8, Math.max(3, Math.ceil(value.length / 70)))}
            onChange={(e) => onChange(e.target.value)}
            className={INPUT}
          />
        ) : (
          <input
            value={value}
            readOnly={name === "id"}
            onChange={(e) => onChange(e.target.value)}
            className={INPUT}
          />
        )}
      </label>
    );
  }
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[var(--lime)]"
        />
        <span className="text-sm">{label}</span>
      </label>
    );
  }
  if (Array.isArray(value)) {
    return <List label={label} value={value} pattern={pattern} onChange={onChange} bare={bare} />;
  }
  if (value && typeof value === "object") {
    return (
      <div className="space-y-4">
        {Object.entries(value).map(([k, v]) => (
          <Node
            key={k}
            name={k}
            value={v}
            pattern={`${pattern}.${k}`}
            onChange={(nv) => onChange({ ...value, [k]: nv })}
          />
        ))}
      </div>
    );
  }
  return null;
}

export default function AdminApp({ initial }: { initial: Obj }) {
  const [data, setData] = useState<Obj>(initial);
  const [sec, setSec] = useState("about");
  const [dirty, setDirty] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!dirty.length) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const change = (v: Json) => {
    setData((d) => ({ ...d, [sec]: v }));
    setDirty((d) => (d.includes(sec) ? d : [...d, sec]));
    setMsg(null);
  };

  const save = () =>
    start(async () => {
      const r = await saveSection(sec, JSON.stringify(data[sec]));
      setMsg({ ok: r.ok, text: r.message });
      if (r.ok) setDirty((d) => d.filter((x) => x !== sec));
    });

  const reset = () => {
    if (!window.confirm("Remettre cette section aux valeurs d'origine ? (pas encore enregistré)")) return;
    change(clone((defaults as unknown as Obj)[sec]));
  };

  const title = SECTIONS.find(([k]) => k === sec)?.[1] ?? "";
  const btn = "rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-lime hover:text-lime";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <p className="font-mono text-xs tracking-widest text-lime">ESPACE D&apos;ÉDITION</p>
          <h1 className="font-display text-2xl">Mon portfolio</h1>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className={btn}>Voir le site ↗</a>
          <form action={logout}>
            <button className={btn}>Se déconnecter</button>
          </form>
        </div>
      </header>

      <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
          {SECTIONS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => { setSec(k); setMsg(null); }}
              aria-current={k === sec}
              className={`shrink-0 rounded-2xl border px-4 py-2.5 text-left text-sm transition ${
                k === sec ? "border-lime bg-lime/10 text-lime" : "border-white/10 hover:border-lime/50"
              }`}
            >
              {l}
              {dirty.includes(k) && <span className="ml-2 text-amber">●</span>}
            </button>
          ))}
        </nav>

        <main>
          <h2 className="font-display text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted">
            Modifie, puis clique sur « Enregistrer » : le site public est mis à jour aussitôt. Le point ● signale une section non enregistrée.
          </p>
          <div className="mt-6 space-y-4">
            <Node key={sec} name={sec} value={data[sec]} pattern={sec} onChange={change} bare />
          </div>
          <button type="button" onClick={reset} className="mt-8 text-xs text-muted underline hover:text-lime">
            Remettre les valeurs d&apos;origine
          </button>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p role="status" className={`text-sm ${msg ? (msg.ok ? "text-lime" : "text-red-400") : "text-muted"}`}>
            {msg ? msg.text : dirty.includes(sec) ? "Modifications non enregistrées" : "Aucune modification"}
          </p>
          <button
            onClick={save}
            disabled={pending || !dirty.includes(sec)}
            className="rounded-full bg-lime px-6 py-2.5 font-medium text-black transition hover:brightness-110 disabled:opacity-40"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}