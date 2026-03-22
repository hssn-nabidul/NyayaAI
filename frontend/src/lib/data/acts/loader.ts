import bns2023 from '@/data/acts/bns-2023.json';
import bnss2023 from '@/data/acts/bnss-2023.json';
import bsa2023 from '@/data/acts/bsa-2023.json';
import ipc1860 from '@/data/acts/ipc-1860.json';
import crpc1973 from '@/data/acts/crpc-1973.json';
import evidence1872 from '@/data/acts/evidence-act-1872.json';
import cpc1908 from '@/data/acts/cpc-1908.json';
import contract1872 from '@/data/acts/contract-act-1872.json';
import it2000 from '@/data/acts/it-act-2000.json';
import consumer2019 from '@/data/acts/consumer-protection-2019.json';
import rti2005 from '@/data/acts/rti-act-2005.json';
import pocso2012 from '@/data/acts/pocso-act-2012.json';
import domestic2005 from '@/data/acts/domestic-violence-2005.json';
import constitution from '@/data/acts/constitution-of-india.json';

export interface Section {
  number: string;
  title: string;
  content: string;
  chapter?: string;
}

export interface FullAct {
  title: string;
  shortTitle: string;
  year: number;
  slug: string;
  category: string;
  sections: Section[];
}

const ACT_DATA_MAP: Record<string, FullAct> = {
  'bns-2023': bns2023,
  'bnss-2023': bnss2023,
  'bsa-2023': bsa2023,
  'ipc-1860': ipc1860,
  'crpc-1973': crpc1973,
  'evidence-act-1872': evidence1872,
  'cpc-1908': cpc1908,
  'contract-act-1872': contract1872,
  'it-act-2000': it2000,
  'consumer-protection-2019': consumer2019,
  'rti-act-2005': rti2005,
  'pocso-act-2012': pocso2012,
  'domestic-violence-2005': domestic2005,
  'constitution-of-india': constitution,
};

export function getActBySlug(slug: string): FullAct | undefined {
  return ACT_DATA_MAP[slug];
}
