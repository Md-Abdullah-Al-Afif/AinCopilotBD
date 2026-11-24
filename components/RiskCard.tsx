"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { isBdlaws, type Risk } from "@/lib/parse";

type Props = { risk: Risk; flagged: boolean; onToggle: () => void };

export default function RiskCard({ risk, flagged, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const verified = isBdlaws(risk.lawUrl);
  return (
    <div className="risk">
      <button className="rh" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={`pill ${risk.severity}`}>{risk.severity}</span>
        <b style={{ flex: 1 }}>{risk.title}</b>
        {verified ? (
          <a className="dhara" href={risk.lawUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            {risk.lawText}
          </a>
        ) : (
          <span className="pill">{risk.lawText || "Unverified"}</span>
        )}
        {open ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
      </button>
      {open && (
        <div className="rb">
          {risk.fact && <p><b>Clause / Fact:</b> {risk.fact}</p>}
          {risk.mitigation && <p><b>Mitigation:</b> {risk.mitigation}</p>}
          {!verified && <p style={{ color: "var(--rose)" }}>This section was not verified on bdlaws.minlaw.gov.bd. Confirm with an advocate.</p>}
        </div>
      )}
      <label style={{ display: "flex", gap: 8, alignItems: "center", minHeight: 44, padding: "0 12px 4px" }}>
        <input type="checkbox" checked={flagged} onChange={onToggle} /> Approve for advocate review / flag
      </label>
    </div>
  );
}
