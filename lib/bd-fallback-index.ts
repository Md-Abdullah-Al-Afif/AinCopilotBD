export const INDEX_URL = "https://bdlaws.minlaw.gov.bd/laws-of-bangladesh-alphabetical-index.html";

export type LawEntry = { title: string; id?: number; keywords: string[] };

// Ids are listed only where confirmed on bdlaws.minlaw.gov.bd. Others are resolved live
// from the alphabetical index and are marked unverified if that lookup fails.
export const FALLBACK_INDEX: LawEntry[] = [
  { title: "The Contract Act, 1872", id: 26, keywords: ["contract", "agreement", "non-compete", "noncompete", "non compete", "restraint", "chukti", "চুক্তি", "void", "breach", "indemnity", "service agreement", "nda"] },
  { title: "The Negotiable Instruments Act, 1881", id: 46, keywords: ["cheque", "check", "dishonour", "dishonor", "bounce", "bounced", "চেক", "bank", "promissory", "138", "insufficient funds"] },
  { title: "The Code of Criminal Procedure, 1898", keywords: ["144", "dhara 144", "bail", "jamin", "জামিন", "ফৌজদারি", "foujdari", "fir", "gd", "general diary", "magistrate", "police", "arrest", "remand", "মামলা", "mamla", "crpc"] },
  { title: "The Specific Relief Act, 1877", keywords: ["jomi", "জমি", "dokhol", "দখল", "possession", "dispossess", "injunction", "specific relief", "land", "encroach"] },
  { title: "The Transfer of Property Act, 1882", keywords: ["property", "tenancy", "tenant", "lease", "rent", "bhara", "ভাড়া", "sale deed", "mortgage", "kabala", "কবলা"] },
  { title: "The Bangladesh Labour Act, 2006", keywords: ["labour", "labor", "shrom", "শ্রম", "employment", "employee", "chakri", "চাকরি", "termination", "wage", "salary", "overtime", "bonus", "probation", "worker", "retrenchment"] },
  { title: "The Limitation Act, 1908", keywords: ["limitation", "time bar", "deadline", "samoyshima", "সময়সীমা"] },
  { title: "The Muslim Family Laws Ordinance, 1961", keywords: ["family", "dower", "denmohor", "দেনমোহর", "divorce", "talaq", "তালাক", "marriage", "maintenance", "custody", "biye"] },
  { title: "The Cyber Security Act, 2023", keywords: ["cyber", "facebook", "online", "hack", "hacking", "defamation", "সাইবার", "social media", "data"] },
  { title: "The Penal Code, 1860", keywords: ["penal", "theft", "cheating", "forgery", "assault", "dondobidhi", "দণ্ডবিধি", "criminal breach"] },
  { title: "The Code of Civil Procedure, 1908", keywords: ["civil suit", "civil procedure", "decree", "written statement", "dewani", "দেওয়ানি"] },
];
