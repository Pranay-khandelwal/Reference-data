import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  ShadingType,
  AlignmentType,
  Packer,
} from 'docx';
import { CompanyResult } from './types';

const NAVY = '1e3a5f';
const BLUE = '1d4ed8';
const HOOK_BG = 'f0fdf4';

function makeRun(text: string, options: Partial<{
  bold: boolean;
  italic: boolean;
  color: string;
  size: number;
  font: string;
}> = {}): TextRun {
  return new TextRun({
    text,
    bold: options.bold ?? false,
    italics: options.italic ?? false,
    color: options.color,
    size: options.size ?? 22, // 11pt = 22 half-points
    font: options.font ?? 'Calibri',
  });
}

function emptyParagraph(): Paragraph {
  return new Paragraph({ children: [makeRun('')] });
}

export async function exportDocx(results: CompanyResult[]): Promise<void> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const filename = `xpertiz_cold_emails_${dateStr}.docx`;

  const totalEmails = results.reduce((sum, r) => sum + (r.emails?.length ?? 0), 0);

  const sections: Paragraph[] = [];

  // Cover page
  sections.push(
    new Paragraph({
      children: [
        makeRun(`Xpertiz Cold Email Drafts — ${dateStr}`, {
          bold: true,
          size: 32,
          color: NAVY,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 2880, after: 240 },
    }),
    new Paragraph({
      children: [
        makeRun(`Total emails: ${totalEmails}`, {
          size: 24,
          color: NAVY,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
    }),
    emptyParagraph()
  );

  let isFirst = true;

  for (const result of results) {
    // Page break between companies (but not before the first)
    if (!isFirst) {
      sections.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
    isFirst = false;

    // Company header
    sections.push(
      new Paragraph({
        children: [
          makeRun(result.companyName, {
            bold: true,
            size: 28, // 14pt = 28 half-points
            color: NAVY,
            font: 'Calibri',
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );

    if (result.status === 'FAILED') {
      sections.push(
        new Paragraph({
          children: [
            makeRun(`Error: ${result.error ?? 'Unknown error'}`, {
              color: 'dc2626',
              italic: true,
            }),
          ],
          spacing: { after: 240 },
        })
      );
      continue;
    }

    // Company summary
    if (result.company_summary) {
      sections.push(
        new Paragraph({
          children: [makeRun(result.company_summary, { italic: true })],
          spacing: { after: 120 },
        })
      );
    }

    // Sector + hook confidence
    sections.push(
      new Paragraph({
        children: [
          makeRun(`Sector: `, { bold: true }),
          makeRun(result.sector || '—'),
          makeRun(`   Hook Confidence: `, { bold: true }),
          makeRun(result.hook_confidence || 'NOT_FOUND'),
        ],
        spacing: { after: 240 },
      })
    );

    // Emails
    for (const email of result.emails) {
      // Role + name subheading
      sections.push(
        new Paragraph({
          children: [
            makeRun(`${email.role} — ${email.contact_name}`, {
              bold: true,
              size: 22,
              color: BLUE,
              font: 'Calibri',
            }),
          ],
          spacing: { before: 240, after: 80 },
        })
      );

      // To: email
      sections.push(
        new Paragraph({
          children: [
            makeRun('To: ', { bold: true }),
            makeRun(email.contact_email),
          ],
          spacing: { after: 80 },
        })
      );

      // Subject
      sections.push(
        new Paragraph({
          children: [
            makeRun('Subject: ', { bold: true }),
            makeRun(email.subject),
          ],
          spacing: { after: 160 },
        })
      );

      // Hook label + Para 2 in shaded box
      sections.push(
        new Paragraph({
          children: [makeRun('Hook (Para 2)', { bold: true, size: 20 })],
          spacing: { before: 80, after: 40 },
        })
      );

      sections.push(
        new Paragraph({
          children: [makeRun(email.para2, { italic: true })],
          shading: {
            type: ShadingType.CLEAR,
            fill: HOOK_BG,
          },
          border: {
            left: {
              color: '22c55e',
              size: 12,
              space: 4,
              style: 'single',
            },
          },
          spacing: { before: 80, after: 160 },
          indent: { left: 180 },
        })
      );

      // Full email body
      sections.push(
        new Paragraph({
          children: [makeRun('Full Email:', { bold: true })],
          spacing: { after: 80 },
        })
      );

      const emailLines = email.full_email.split('\n');
      for (const line of emailLines) {
        sections.push(
          new Paragraph({
            children: [
              makeRun(line, { font: 'Courier New', size: 20 }),
            ],
            spacing: { before: 0, after: 40 },
          })
        );
      }

      sections.push(emptyParagraph());
    }
  }

  const doc = new Document({
    sections: [
      {
        children: sections,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22,
          },
          paragraph: {
            spacing: { line: 360 }, // 1.5 line spacing = 360 twips
          },
        },
      },
    },
  });

  const buffer = await Packer.toBlob(doc);
  const url = URL.createObjectURL(buffer);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
