import { tool } from "ai";
import { z } from "zod";
import * as cheerio from "cheerio";
import { FALLBACK_INDEX, INDEX_URL } from "@/lib/bd-fallback-index";

const HOST = "bdlaws.minlaw.gov.bd";
const UA = "Mozilla/5.0 (compatible; AinCopilotBD/1.0; legal-research)";

async function fetchText(url: string, ms = 9000): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,application/xml,*/*" },
    signal: AbortSignal.timeout(ms),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "");
const actUrl = (id: number) => `https://${HOST}/act-details-${id}.html`;

type Match = { title: string; url: string; verified: boolean; source: "live-index" | "built-in-index" };

export const searchBangladeshStatutes = tool({
  description:
    "Find Bangladeshi Acts on bdlaws.minlaw.gov.bd for a legal topic. Accepts English, Bengali or Banglish keywords. Call this FIRST.",
  inputSchema: z.object({ query: z.string().describe("Legal topic or keywords, e.g. 'cheque dishonour' or 'চেক'") }),
  execute: async ({ query }) => {
    const q = query.toLowerCase();
    const hits = FALLBACK_INDEX.filter((e) => e.keywords.some((k) => q.includes(k.toLowerCase())));
    const picked = hits.length ? hits : FALLBACK_INDEX.slice(0, 3);
    let anchors: { text: string; href: string }[] = [];
    try {
      const $ = cheerio.load(await fetchText(INDEX_URL));
      anchors = $("a").map((_, a) => ({ text: norm($(a).text()), href: $(a).attr("href") ?? "" })).get();
    } catch {
      anchors = [];
    }
    const liveOk = anchors.length > 0;
    const matches: Match[] = picked.map((e) => {
      const key = norm(e.title.replace(/^The /, ""));
      const live = liveOk ? anchors.find((a) => a.text.length > 8 && a.text.includes(key)) : undefined;
      const idMatch = live?.href.match(/act-(?:details-)?(\d+)/);
      if (idMatch) return { title: e.title, url: actUrl(Number(idMatch[1])), verified: true, source: "live-index" };
      if (e.id) return { title: e.title, url: actUrl(e.id), verified: true, source: "built-in-index" };
      return { title: e.title, url: INDEX_URL, verified: false, source: "built-in-index" };
    });
    return {
      liveIndexReachable: liveOk,
      matches,
      note: "Entries with verified=false point to the alphabetical index only; do not cite a dhara from them unless readOfficialStatutePage confirms it.",
    };
  },
});

export const readOfficialStatutePage = tool({
  description:
    "Fetch an Act page from bdlaws.minlaw.gov.bd and return the text of a requested section (dhara). Call before citing any dhara number.",
  inputSchema: z.object({
    url: z.string().describe("bdlaws.minlaw.gov.bd Act URL, e.g. https://bdlaws.minlaw.gov.bd/act-details-46.html"),
    targetSection: z.string().optional().describe("Section number to find, e.g. '138' or '27'"),
  }),
  execute: async ({ url, targetSection }) => {
    let u: URL;
    try {
      u = new URL(url);
    } catch {
      return { error: "Invalid URL", sourceUrl: url };
    }
    if (u.hostname !== HOST) return { error: `Only ${HOST} is allowed`, sourceUrl: url };
    const id = u.pathname.match(/act-(?:details-|print-)?(\d+)/)?.[1];
    const candidates = id ? [`https://${HOST}/act-print-${id}.html`, `https://${HOST}/act-details-${id}.html`] : [u.toString()];
    for (const c of candidates) {
      try {
        const $ = cheerio.load(await fetchText(c));
        $("script,style,nav,header,footer,noscript").remove();
        $("br").replaceWith("\n");
        $("p,div,tr,li,h1,h2,h3,h4,h5,h6").append("\n");
        const text = $("body").text().replace(/[ \t\u00a0]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
        if (text.length < 200) continue;
        const actTitle = $("title").text().trim() || text.split("\n")[0].slice(0, 120);
        const sourceUrl = id ? actUrl(Number(id)) : c;
        if (!targetSection) return { sourceUrl, actTitle, found: true, matchedSectionsText: text.slice(0, 4500) };
        const esc = targetSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(?:^|\\n)\\s*\\[?${esc}[.\\s\\]]`, "g");
        const starts: number[] = [];
        for (const m of text.matchAll(re)) {
          const s = m.index ?? 0;
          if (starts.length < 3 && starts.every((p) => s - p > 1800)) starts.push(s);
        }
        const matchedSectionsText = starts.map((s) => text.slice(s, s + 1800)).join("\n---\n").slice(0, 5500);
        return starts.length
          ? { sourceUrl, actTitle, found: true, matchedSectionsText }
          : { sourceUrl, actTitle, found: false, matchedSectionsText: "", note: `Section ${targetSection} not found in retrieved text. Do not cite it as verified.` };
      } catch {
        /* try next candidate */
      }
    }
    return { error: "Could not retrieve the official page right now. Do not cite dhara numbers as verified.", sourceUrl: url };
  },
});

const FEEDS = ["https://www.thedailystar.net/law-our-rights/rss.xml", "https://bdnews24.com/bangladesh/rss.xml"];

export const searchBangladeshLegalNews = tool({
  description: "Search recent Bangladeshi legal news (RSS) for amendments or rulings. Secondary context only, never statutory text.",
  inputSchema: z.object({ query: z.string().describe("Short topic, e.g. 'cheque dishonour amendment'") }),
  execute: async ({ query }) => {
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const items: { title: string; link: string; date: string; source: string }[] = [];
    await Promise.all(
      FEEDS.map(async (feed) => {
        try {
          const $ = cheerio.load(await fetchText(feed, 7000), { xmlMode: true });
          $("item").each((_, el) => {
            const title = $(el).find("title").first().text().trim();
            const desc = $(el).find("description").first().text().toLowerCase();
            if (!words.length || words.some((w) => title.toLowerCase().includes(w) || desc.includes(w))) {
              items.push({ title, link: $(el).find("link").first().text().trim(), date: $(el).find("pubDate").first().text().trim(), source: new URL(feed).hostname });
            }
          });
        } catch {
          /* feed unavailable */
        }
      }),
    );
    return { label: "Secondary News Context", results: items.slice(0, 5), note: items.length ? undefined : "No matching recent items, or feeds unreachable." };
  },
});

export const bdTools = { searchBangladeshStatutes, readOfficialStatutePage, searchBangladeshLegalNews };
