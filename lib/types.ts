export interface ContactRow {
  companyName: string;
  websiteUrl: string;
  linkedinUrl: string;
  contactName: string;
  role: string;
  contactEmail: string;
}

export interface CompanyGroup {
  companyName: string;
  websiteUrl: string;
  linkedinUrl: string;
  contacts: { name: string; role: string; email: string }[];
}

export interface GeneratedEmail {
  role: string;
  contact_name: string;
  contact_email: string;
  subject: string;
  para2: string;
  full_email: string;
}

export interface CompanyResult {
  companyName: string;
  sector: string;
  company_summary: string;
  hook_confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_FOUND';
  emails: GeneratedEmail[];
  status: 'READY' | 'FAILED';
  error?: string;
}
