export type SampleCase = { id: string; label: string; tab: "doc" | "problem"; text: string };

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: "startup",
    label: "BD Tech Startup Employment & Non-Compete Agreement",
    tab: "doc",
    text: `EMPLOYMENT AGREEMENT between Dhaka Nexus Ltd. ("Company") and the Employee.

1. Position. The Employee joins as Software Engineer on a monthly gross salary of BDT 60,000.
3. Probation. The first 12 months are probation. During probation the Company may terminate this Agreement at any time without notice or reason, and no benefits accrue.
5. Working Hours. The Employee shall work as the business requires, including nights and weekends, without any additional compensation.
7. Non-Compete. For 3 years after separation for any reason, the Employee shall not work for or advise any business that competes with the Company anywhere in Bangladesh.
9. Intellectual Property. All ideas the Employee conceives during employment, including personal side projects, belong to the Company.
11. Salary Payment. Wages may be paid up to 45 days after month end at the Company's discretion.
13. Dispute Resolution. Any dispute shall be resolved only by the Company's appointed arbitrator, whose decision is final.`,
  },
  {
    id: "cheque",
    label: "Dishonoured Business Cheque (৳15,00,000)",
    tab: "problem",
    text: `My business partner gave me a cheque of BDT 15,00,000 (fifteen lakh taka) for goods supplied. I deposited it on 10 November 2026 and the bank returned it for "insufficient funds". I received the bank dishonour memo on 12 November 2026. I have not sent any notice yet. He is now not picking up my calls. What can I do, and what are the deadlines? amar cheque bounce korse.`,
  },
  {
    id: "s144",
    label: "Section 144 CrPC Order & Unlawful Property Possession",
    tab: "problem",
    text: `A magistrate has issued a Section 144 order after a boundary dispute over our family land in Savar. A neighbour has since occupied about 5 decimals of our land, built a tin-shed, and refuses to leave. We have our deed and khatian. 144 dhara niye ki niyom? Can we remove him ourselves, or what legal remedy do we have to recover possession?`,
  },
];

export const TOPIC_CHIPS = [
  { label: "Cheque bounce", text: "amar cheque bounce korse, ki korbo?" },
  { label: "144 dhara", text: "144 dhara niye ki niyom?" },
  { label: "জমি দখল", text: "amar jomi dokhol kore nise, ki korte pari?" },
  { label: "শ্রম আইন", text: "company amake notice charai chakri theke bar kore dise" },
];
