export interface StaticAct {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  year: number;
  replaces: string | null;
  description: string;
  totalSections: number;
  category: 'criminal' | 'civil' | 'special' | 'constitutional';
}

export const NEW_LAWS = ['bns-2023', 'bnss-2023', 'bsa-2023'] as const;

export type NewLawId = typeof NEW_LAWS[number];

export function isNewLaw(slug: string): slug is NewLawId {
  return NEW_LAWS.includes(slug as NewLawId);
}

export const ACTS_BY_CATEGORY = {
  criminal: [
    { id: "bns-2023", slug: "bns-2023", title: "Bharatiya Nyaya Sanhita", shortTitle: "BNS", year: 2023, replaces: "Indian Penal Code, 1860", description: "The new criminal law replacing the IPC", totalSections: 358, category: "criminal" as const },
    { id: "bnss-2023", slug: "bnss-2023", title: "Bharatiya Nagarik Suraksha Sanhita", shortTitle: "BNSS", year: 2023, replaces: "Code of Criminal Procedure, 1973", description: "The new criminal procedure law replacing CrPC", totalSections: 531, category: "criminal" as const },
    { id: "bsa-2023", slug: "bsa-2023", title: "Bharatiya Sakshya Adhiniyam", shortTitle: "BSA", year: 2023, replaces: "Indian Evidence Act, 1872", description: "The new evidence law replacing the Indian Evidence Act", totalSections: 170, category: "criminal" as const },
    { id: "ipc-1860", slug: "ipc-1860", title: "Indian Penal Code", shortTitle: "IPC", year: 1860, replaces: null, description: "Still applies to offences committed before July 1, 2024", totalSections: 511, category: "criminal" as const },
    { id: "crpc-1973", slug: "crpc-1973", title: "Code of Criminal Procedure", shortTitle: "CrPC", year: 1973, replaces: null, description: "Still applies to proceedings initiated before July 1, 2024", totalSections: 484, category: "criminal" as const },
    { id: "evidence-1872", slug: "evidence-act-1872", title: "Indian Evidence Act", shortTitle: "IEA", year: 1872, replaces: null, description: "Still applies to proceedings before July 1, 2024", totalSections: 167, category: "criminal" as const },
  ],
  civil: [
    { id: "cpc-1908", slug: "cpc-1908", title: "Civil Procedure Code", shortTitle: "CPC", year: 1908, replaces: null, description: "Governs procedure of civil courts in India", totalSections: 158, category: "civil" as const },
    { id: "contract-1872", slug: "contract-act-1872", title: "Indian Contract Act", shortTitle: "ICA", year: 1872, replaces: null, description: "Governs contracts and agreements in India", totalSections: 238, category: "civil" as const },
  ],
  special: [
    { id: "it-act-2000", slug: "it-act-2000", title: "Information Technology Act", shortTitle: "IT Act", year: 2000, replaces: null, description: "Governs cybercrime and electronic commerce", totalSections: 94, category: "special" as const },
    { id: "consumer-2019", slug: "consumer-protection-2019", title: "Consumer Protection Act", shortTitle: "CPA", year: 2019, replaces: null, description: "Protects consumer rights in India", totalSections: 107, category: "special" as const },
    { id: "rti-2005", slug: "rti-act-2005", title: "Right to Information Act", shortTitle: "RTI", year: 2005, replaces: null, description: "Right of citizens to access government information", totalSections: 31, category: "special" as const },
    { id: "pocso-2012", slug: "pocso-act-2012", title: "Protection of Children from Sexual Offences Act", shortTitle: "POCSO", year: 2012, replaces: null, description: "Protection of children from sexual abuse", totalSections: 46, category: "special" as const },
    { id: "dv-act-2005", slug: "domestic-violence-2005", title: "Protection of Women from Domestic Violence Act", shortTitle: "PWDVA", year: 2005, replaces: null, description: "Protection of women from domestic violence", totalSections: 37, category: "special" as const },
  ],
  constitutional: [
    { id: "constitution", slug: "constitution-of-india", title: "Constitution of India", shortTitle: "COI", year: 1950, replaces: null, description: "The supreme law of India", totalSections: 448, category: "constitutional" as const },
  ],
};

export const ACTS_INDEX: StaticAct[] = [
  ...ACTS_BY_CATEGORY.criminal,
  ...ACTS_BY_CATEGORY.civil,
  ...ACTS_BY_CATEGORY.special,
  ...ACTS_BY_CATEGORY.constitutional,
];
