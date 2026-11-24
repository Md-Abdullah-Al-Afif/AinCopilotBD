export type Severity = "High" | "Medium" | "Low";
export type Risk = { title: string; severity: Severity; fact: string; lawText: string; lawUrl?: string; mitigation: string };

const field = (block: string, name: string) =>
  block.match(new RegExp(`\\*{0,2}${name}\\*{0,2}:?\\*{0,2}\\s*([^\\n]+)`, "i"))?.[1]?.trim() ?? "";

export function parseRisks(text: string): Risk[] {
  const start = text.search(/^##\s*2\./m);
  if (start < 0) return [];
  const rest = text.slice(start + 3);
  const end = rest.search(/^##\s*3\./m);
  const section = end >= 0 ? rest.slice(0, end) : rest;
  return section
    .split(/^###\s+/m)
    .slice(1)
    .map((block): Risk | null => {
      const title = block.split("\n")[0].replace(/^Risk\s*\d+\s*[:.-]\s*/i, "").replace(/\*+/g, "").trim();
      const sev = block.match(/Severity\*{0,2}:?\*{0,2}\s*\**\s*(High|Medium|Low)/i)?.[1];
      if (!title || !sev) return null;
      const law = field(block, "Law");
      const link = law.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
      const mitigation = block.match(/Mitigation\*{0,2}:?\*{0,2}\s*([\s\S]*?)(?=\n\*\*[A-Z]|\n###|$)/i)?.[1]?.trim() ?? "";
      return {
        title,
        severity: (sev[0].toUpperCase() + sev.slice(1).toLowerCase()) as Severity,
        fact: field(block, "Clause/Fact"),
        lawText: link ? link[1] : law.replace(/\*+/g, ""),
        lawUrl: link?.[2],
        mitigation,
      };
    })
    .filter((r): r is Risk => r !== null);
}

export const isBdlaws = (u?: string) => !!u && /^https?:\/\/bdlaws\.minlaw\.gov\.bd\//.test(u);

export function citedStatutes(text: string): number {
  const urls = new Set<string>();
  for (const m of text.matchAll(/\]\((https?:\/\/bdlaws\.minlaw\.gov\.bd\/[^)\s]+)\)/g)) urls.add(m[1]);
  return urls.size;
}

export function overall(risks: Risk[]): Severity | null {
  if (!risks.length) return null;
  const highs = risks.filter((r) => r.severity === "High").length;
  return highs >= 2 ? "High" : highs === 1 || risks.some((r) => r.severity === "Medium") ? "Medium" : "Low";
}
