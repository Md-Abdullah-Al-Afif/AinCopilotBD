"use client";
import { getToolName, isToolUIPart, type UIMessage } from "ai";

const LABEL: Record<string, string> = {
  searchBangladeshStatutes: "Searching bdlaws index",
  readOfficialStatutePage: "Reading official statute page",
  searchBangladeshLegalNews: "Checking Daily Star & bdnews24 RSS",
};

type Out = Record<string, unknown> | undefined;

export default function ReasoningTrace({ parts, busy }: { parts: UIMessage["parts"]; busy: boolean }) {
  const tools = parts.filter(isToolUIPart);
  const sources: { title: string; url: string; news: boolean; ok: boolean }[] = [];
  for (const p of tools) {
    const out = p.state === "output-available" ? (p.output as Out) : undefined;
    if (!out) continue;
    const name = getToolName(p);
    if (name === "searchBangladeshStatutes")
      for (const m of (out.matches as { title: string; url: string; verified: boolean }[]) ?? []) sources.push({ title: m.title, url: m.url, news: false, ok: m.verified });
    if (name === "readOfficialStatutePage" && typeof out.sourceUrl === "string" && out.found === true)
      sources.push({ title: `${String(out.actTitle ?? "Official page")} (section text read)`, url: out.sourceUrl, news: false, ok: true });
    if (name === "searchBangladeshLegalNews")
      for (const r of (out.results as { title: string; link: string }[]) ?? []) sources.push({ title: r.title, url: r.link, news: true, ok: true });
  }
  const seen = new Set<string>();
  const uniq = sources.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));

  return (
    <div className="card">
      <b>Live Agent Reasoning Trace</b>
      <div style={{ marginTop: 8 }}>
        {!tools.length && <div style={{ color: "var(--mut)" }}>{busy ? "Understanding your case…" : "Waiting for a case…"}</div>}
        {tools.map((p) => {
          const name = getToolName(p);
          const cls = p.state === "output-available" ? "done" : p.state === "output-error" ? "err" : "run";
          const input = p.input as { query?: string; targetSection?: string } | undefined;
          return (
            <div key={p.toolCallId} className={`step ${cls}`}>
              <span className="dot" />
              <span>{LABEL[name] ?? name}{input?.query ? `: ${input.query}` : ""}{input?.targetSection ? ` · section ${input.targetSection}` : ""}</span>
            </div>
          );
        })}
      </div>
      {uniq.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {uniq.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className={s.news ? "" : "dhara"} style={{ borderRadius: 10, padding: "8px 12px", textDecoration: "none", ...(s.news ? { border: "1px solid var(--line)", color: "var(--ink)" } : {}) }}>
              <small>{s.news ? "NEWS · context only" : s.ok ? "bdlaws · verified" : "bdlaws index · unverified"}</small>
              <div>{s.title}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
