"use client";
import { useState } from "react";
import { Copy, Printer } from "lucide-react";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s: string) =>
  esc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, t: string, u: string) =>
      `<a href="${u}" target="_blank" rel="noopener noreferrer"${/bdlaws\.minlaw\.gov\.bd/.test(u) ? ' class="dhara"' : ""}>${t}</a>`)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

function toHtml(md: string): string {
  return md
    .split("\n")
    .map((l) => {
      if (/^###\s+/.test(l)) return `<h3>${inline(l.replace(/^###\s+/, ""))}</h3>`;
      if (/^##\s+/.test(l)) return `<h2>${inline(l.replace(/^##\s+/, ""))}</h2>`;
      if (/^\s*([-*]|\d+\.)\s+/.test(l)) return `<li>${inline(l.replace(/^\s*([-*]|\d+\.)\s+/, ""))}</li>`;
      return l.trim() ? `<p style="margin:4px 0">${inline(l)}</p>` : "";
    })
    .join("");
}

export default function MemorandumViewer({ markdown, busy }: { markdown: string; busy: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="memo" id="memo">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 12, letterSpacing: ".1em", color: "var(--mut)" }}>LEGAL MEMORANDUM · AI-ASSISTED DRAFT</div>
        <div className="noprint" style={{ display: "flex", gap: 8 }}>
          <button className="nb" style={{ color: "var(--ink)", borderColor: "var(--line)" }} onClick={copy} disabled={!markdown}>
            <Copy size={14} aria-hidden style={{ display: "inline", marginRight: 6 }} />{copied ? "Copied" : "Copy Markdown"}
          </button>
          <button className="nb" style={{ color: "var(--ink)", borderColor: "var(--line)" }} onClick={() => window.print()} disabled={!markdown}>
            <Printer size={14} aria-hidden style={{ display: "inline", marginRight: 6 }} />Print / Save PDF
          </button>
        </div>
      </div>
      {markdown ? (
        <div dangerouslySetInnerHTML={{ __html: toHtml(markdown) }} />
      ) : (
        <p style={{ color: "var(--mut)" }}>{busy ? "Drafting memorandum…" : "The verified memorandum appears here after you run an audit."}</p>
      )}
    </div>
  );
}
