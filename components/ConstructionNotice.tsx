"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "aincopilot_construction_notice_dismissed";

export default function ConstructionNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(11, 19, 43, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="construction-notice-title"
        aria-describedby="construction-notice-desc"
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          maxWidth: 460,
          width: "100%",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          border: "1px solid var(--goldln)",
        }}
      >
        <div
          className="pill"
          style={{
            background: "var(--goldbg)",
            color: "var(--gold)",
            border: "1px solid var(--goldln)",
            marginBottom: 12,
          }}
        >
          Under construction
        </div>
        <h2 id="construction-notice-title" style={{ margin: "0 0 8px", fontSize: 22, lineHeight: 1.2 }}>
          Site under construction
        </h2>
        <p id="construction-notice-desc" style={{ margin: "0 0 18px", color: "var(--mut)", fontSize: 15, lineHeight: 1.6 }}>
          This site is currently under construction. Many features are not available yet and some parts may not work as expected.
        </p>
        <button className="cta" type="button" onClick={dismiss} style={{ width: "100%" }}>
          I understand
        </button>
      </div>
    </div>
  );
}
