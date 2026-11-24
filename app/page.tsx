"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Scale, ShieldCheck, Upload } from "lucide-react";
import { SAMPLE_CASES, TOPIC_CHIPS } from "@/lib/sample-cases";
import { citedStatutes, overall, parseRisks } from "@/lib/parse";
import RiskCard from "@/components/RiskCard";
import MemorandumViewer from "@/components/MemorandumViewer";
import ReasoningTrace from "@/components/ReasoningTrace";

type Lang = "en" | "bn" | "bi";

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });

export default function Page() {
  const [view, setView] = useState<"home" | "app">("home");
  const [lang, setLang] = useState<Lang>("bi");
  const [tab, setTab] = useState<"doc" | "problem">("doc");
  const [input, setInput] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/copilot" }), []);
  const { messages, sendMessage, setMessages, status, error } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  const assistant = [...messages].reverse().find((m) => m.role === "assistant");
  const memo = (assistant?.parts ?? []).filter((p) => p.type === "text").map((p) => (p.type === "text" ? p.text : "")).join("");
  const risks = useMemo(() => parseRisks(memo), [memo]);
  const level = overall(risks);

  async function run(text: string, tabKind: "doc" | "problem", file: File | null) {
    const body = text.trim();
    if (!body && !file) return;
    setMessages([]);
    setFlags({});
    const prompt = (tabKind === "doc" ? "Audit this document and produce the verified legal memorandum:\n\n" : "Analyze this legal problem and produce the verified legal memorandum:\n\n") + (body || "See the attached PDF.");
    if (file) {
      const url = await toDataUrl(file);
      await sendMessage({ text: prompt, files: [{ type: "file", mediaType: "application/pdf", filename: file.name, url }] }, { body: { lang } });
    } else {
      await sendMessage({ text: prompt }, { body: { lang } });
    }
  }

  function openCase(id: string | null, autoRun: boolean) {
    setView("app");
    window.scrollTo(0, 0);
    const c = SAMPLE_CASES.find((s) => s.id === id);
    if (!c) return;
    setTab(c.tab);
    setInput(c.text);
    setPdf(null);
    setMessages([]);
    if (autoRun) setPending(c.id);
  }

  useEffect(() => {
    if (!pending) return;
    const c = SAMPLE_CASES.find((s) => s.id === pending);
    setPending(null);
    if (c) void run(c.text, c.tab, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (/\.pdf$/i.test(file.name)) {
      setPdf(file);
      setInput("");
    } else if (/\.(txt|md)$/i.test(file.name)) {
      setPdf(null);
      setInput(await file.text());
    }
  }

  if (view === "home") {
    return (
      <div>
        <div className="nav">
          <div className="brand">AinCopilot BD · আইন কপাইলট<small>Justice Spear AI · Legal Copilot</small></div>
          <button className="nb gold" onClick={() => openCase(null, false)}>Launch Legal Copilot</button>
        </div>
        <section className="hero">
          <span className="pill" style={{ background: "#1C2541", color: "#FCD34D" }}>Digital Lawyer’s Chamber for Bangladesh</span>
          <h1>Audit contracts and disputes. Cite only verified <i>dhara</i>.</h1>
          <p>Write in English, বাংলা or Banglish. AinCopilot reads the official text on bdlaws.minlaw.gov.bd, finds at least three non-obvious risks, and drafts a memorandum your advocate can review.</p>
          <button className="cta" onClick={() => openCase(null, false)}>Launch Legal Copilot</button>
          <div style={{ marginTop: 28, fontSize: 13, color: "#CBD5E1" }}>Or start with a sample case</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 10 }}>
            {SAMPLE_CASES.map((c) => (
              <button key={c.id} className="ghost" onClick={() => openCase(c.id, true)}>{c.label}</button>
            ))}
          </div>
        </section>
        <div className="wrap">
          <div className="grid3">
            <div className="card"><b>1 · Bring the problem</b><p style={{ color: "var(--mut)" }}>Paste a contract, upload a PDF, or type “amar cheque bounce korse”.</p></div>
            <div className="card"><b>2 · Verify the statute</b><p style={{ color: "var(--mut)" }}>The agent searches the bdlaws index, then reads the section page before citing it.</p></div>
            <div className="card"><b>3 · Review and export</b><p style={{ color: "var(--mut)" }}>Approve or flag each risk, then print or copy the memorandum.</p></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="nav">
        <div className="brand">AinCopilot BD · আইন কপাইলট<small>Justice Spear AI · Prototype</small></div>
        <button className="nb" onClick={() => setView("home")}>Home</button>
        <div className="seg" role="group" aria-label="Output language">
          {([["en", "English"], ["bn", "বাংলা"], ["bi", "Bilingual"]] as const).map(([k, l]) => (
            <button key={k} className={lang === k ? "on" : ""} onClick={() => setLang(k)}>{l}</button>
          ))}
        </div>
        <select className="nb" aria-label="Sample cases" value="" style={{ background: "var(--navb)" }} onChange={(e) => openCase(e.target.value, false)}>
          <option value="">Sample Cases</option>
          {SAMPLE_CASES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="nb gold" onClick={() => window.print()}>Export / Print Memo</button>
      </div>

      <div className="ws">
        <div id="left" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={`tab ${tab === "doc" ? "on" : ""}`} onClick={() => setTab("doc")}>Paste / Upload Document</button>
              <button className={`tab ${tab === "problem" ? "on" : ""}`} onClick={() => setTab("problem")}>Describe Legal Problem</button>
            </div>
            <label htmlFor="inp" style={{ fontSize: 12, fontWeight: 600, color: "var(--mut)" }}>
              {tab === "doc" ? "Document text" : "Describe your problem (English, বাংলা or Banglish)"}
            </label>
            <textarea id="inp" className="in" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste a contract, or describe your problem…" />
            {tab === "problem" && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TOPIC_CHIPS.map((c) => <button key={c.label} className="chip" onClick={() => setInput(c.text)}>{c.label}</button>)}
              </div>
            )}
            {tab === "doc" && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" ? fileRef.current?.click() : undefined)}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); void onFile(e.dataTransfer.files[0]); }}
                style={{ border: `1.5px dashed ${dragging ? "#FBBF24" : "var(--line)"}`, borderRadius: 10, padding: 10, textAlign: "center", color: "var(--mut)", fontSize: 13, cursor: "pointer" }}
              >
                <Upload size={14} aria-hidden style={{ display: "inline", marginRight: 6 }} />
                {pdf ? `Attached: ${pdf.name}` : "Drag and drop .txt, .md or .pdf, or click to upload"}
                <input ref={fileRef} type="file" accept=".txt,.md,.pdf" className="hide" onChange={(e) => void onFile(e.target.files?.[0])} />
              </div>
            )}
            <button className="cta" style={{ background: "var(--nav)", color: "#fff", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} disabled={busy || (!input.trim() && !pdf)} onClick={() => void run(input, tab, pdf)}>
              <ShieldCheck size={18} aria-hidden color="#FBBF24" />
              {busy ? "Auditing…" : "Run Legal Audit & Verify Statutes"}
            </button>
            {error && <p role="alert" style={{ color: "var(--rose)", margin: 0 }}>Something went wrong. Check that GOOGLE_GENERATIVE_AI_API_KEY is set, then try again.</p>}
          </div>
          <ReasoningTrace parts={assistant?.parts ?? []} busy={busy} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div className="kpi">
            <div className="card"><small>Risks Detected</small><b>{risks.length || "–"}</b></div>
            <div className="card"><small>Verified BD Statutes Cited</small><b style={{ color: "var(--gold)" }}>{memo ? citedStatutes(memo) : "–"}</b></div>
            <div className="card"><small>Overall Risk Level</small><div style={{ marginTop: 6 }}>{level ? <span className={`pill ${level}`}>{level}</span> : "–"}</div></div>
            <div className="card"><small>Grounding</small><b style={{ fontSize: 13 }}>Direct bdlaws + RSS Grounded</b></div>
          </div>
          <div className="card noprint">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Scale size={16} aria-hidden /><b>Risk Matrix · Human Review</b></div>
            {risks.length ? risks.map((r, i) => (
              <RiskCard key={`${i}-${r.title}`} risk={r} flagged={!!flags[r.title]} onToggle={() => setFlags((f) => ({ ...f, [r.title]: !f[r.title] }))} />
            )) : <p style={{ color: "var(--mut)" }}>{busy ? "Analyzing…" : "Run an audit to see risks."}</p>}
          </div>
          <MemorandumViewer markdown={memo} busy={busy} />
        </div>
      </div>
    </div>
  );
}
