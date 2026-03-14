export interface ColumnIndices {
  companyName: number;
  websiteUrl: number;
  linkedinUrl: number;
  contactName: number;
  role: number;
  contactEmail: number;
}

const COMPANY_NAME_ALIASES = ['company name', 'company', 'firm', 'organisation', 'organization'];
const WEBSITE_URL_ALIASES = ['website url', 'website', 'url', 'site', 'web'];
const LINKEDIN_URL_ALIASES = ['linkedin url', 'linkedin', 'li'];
const CONTACT_NAME_ALIASES = ['contact name', 'contact person', 'name', 'founder'];
const ROLE_ALIASES = ['designation', 'position', 'role', 'title'];
const CONTACT_EMAIL_ALIASES = ['contact email', 'email id', 'email', 'mail'];

function findColumnIndex(headers: string[], aliases: string[]): number {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

  // Try exact match first (longer aliases first to avoid partial matches)
  const sortedAliases = [...aliases].sort((a, b) => b.length - a.length);
  for (const alias of sortedAliases) {
    const idx = normalizedHeaders.indexOf(alias.toLowerCase());
    if (idx !== -1) return idx;
  }

  // Try partial match
  for (const alias of sortedAliases) {
    const idx = normalizedHeaders.findIndex(h => h.includes(alias.toLowerCase()));
    if (idx !== -1) return idx;
  }

  return -1;
}

export function mapColumns(headers: string[]): ColumnIndices {
  return {
    companyName: findColumnIndex(headers, COMPANY_NAME_ALIASES),
    websiteUrl: findColumnIndex(headers, WEBSITE_URL_ALIASES),
    linkedinUrl: findColumnIndex(headers, LINKEDIN_URL_ALIASES),
    contactName: findColumnIndex(headers, CONTACT_NAME_ALIASES),
    role: findColumnIndex(headers, ROLE_ALIASES),
    contactEmail: findColumnIndex(headers, CONTACT_EMAIL_ALIASES),
  };
}
