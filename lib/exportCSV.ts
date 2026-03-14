import { CompanyResult } from './types';

export function exportCSV(results: CompanyResult[]): void {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const filename = `xpertiz_cold_emails_${dateStr}.csv`;

  const headers = [
    'Company Name',
    'Sector',
    'Company Summary',
    'Contact Name',
    'Role',
    'Contact Email',
    'Subject Line',
    'Para 2',
    'Full Email Body',
    'Hook Confidence',
    'Status',
  ];

  const rows: string[][] = [];

  for (const result of results) {
    if (result.status === 'FAILED' || result.emails.length === 0) {
      rows.push([
        result.companyName,
        result.sector || '',
        result.company_summary || '',
        '',
        '',
        '',
        '',
        '',
        '',
        result.hook_confidence || 'NOT_FOUND',
        'FAILED',
      ]);
    } else {
      for (const email of result.emails) {
        const status =
          result.hook_confidence === 'LOW' || result.hook_confidence === 'NOT_FOUND'
            ? 'REVIEW'
            : 'READY';

        const fullEmailBody = email.full_email.replace(/\n/g, ' | ');

        rows.push([
          result.companyName,
          result.sector || '',
          result.company_summary || '',
          email.contact_name,
          email.role,
          email.contact_email,
          email.subject,
          email.para2,
          fullEmailBody,
          result.hook_confidence,
          status,
        ]);
      }
    }
  }

  const csvContent = [headers, ...rows]
    .map(row =>
      row
        .map(cell => {
          const str = String(cell ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\n');

  // UTF-8 BOM
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
