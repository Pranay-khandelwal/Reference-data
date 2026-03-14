'use client';

import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { mapColumns } from '@/lib/columnMapping';
import { ContactRow, CompanyGroup } from '@/lib/types';

interface UploadScreenProps {
  onParsed: (rows: ContactRow[], groups: CompanyGroup[]) => void;
}

function groupRows(rows: ContactRow[]): CompanyGroup[] {
  const map = new Map<string, CompanyGroup>();

  for (const row of rows) {
    const key = row.companyName.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, {
        companyName: row.companyName.trim(),
        websiteUrl: row.websiteUrl?.trim() || '',
        linkedinUrl: row.linkedinUrl?.trim() || '',
        contacts: [],
      });
    }
    const group = map.get(key)!;

    // Update URLs if not set
    if (!group.websiteUrl && row.websiteUrl) {
      group.websiteUrl = row.websiteUrl.trim();
    }
    if (!group.linkedinUrl && row.linkedinUrl) {
      group.linkedinUrl = row.linkedinUrl.trim();
    }

    // Deduplicate by email
    const emailLower = row.contactEmail?.toLowerCase().trim();
    if (emailLower && !group.contacts.some(c => c.email.toLowerCase() === emailLower)) {
      group.contacts.push({
        name: row.contactName?.trim() || '',
        role: row.role?.trim() || '',
        email: row.contactEmail?.trim() || '',
      });
    }
  }

  return Array.from(map.values()).filter(g => g.companyName);
}

function parseRawData(data: string[][], hasHeader: boolean): ContactRow[] {
  if (data.length === 0) return [];

  const headers = data[0].map(h => String(h || ''));
  const indices = mapColumns(headers);

  const dataRows = hasHeader ? data.slice(1) : data;

  const rows: ContactRow[] = [];
  for (const row of dataRows) {
    if (row.every(cell => !cell || String(cell).trim() === '')) continue;

    const get = (idx: number) => (idx >= 0 ? String(row[idx] ?? '').trim() : '');

    rows.push({
      companyName: get(indices.companyName),
      websiteUrl: get(indices.websiteUrl),
      linkedinUrl: get(indices.linkedinUrl),
      contactName: get(indices.contactName),
      role: get(indices.role),
      contactEmail: get(indices.contactEmail),
    });
  }

  return rows.filter(r => r.companyName || r.contactEmail);
}

export default function UploadScreen({ onParsed }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCSVData = useCallback(
    (data: string[][], filename?: string) => {
      setError('');
      if (data.length < 2) {
        setError('File appears to be empty or has only headers.');
        return;
      }

      const rows = parseRawData(data, true);
      if (rows.length === 0) {
        setError('Could not parse any rows. Please check column names.');
        return;
      }

      const groups = groupRows(rows);
      if (groups.length === 0) {
        setError('No valid company data found.');
        return;
      }

      if (filename) setFileName(filename);
      onParsed(rows, groups);
    },
    [onParsed]
  );

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'csv') {
        Papa.parse<string[]>(file, {
          complete: result => {
            processCSVData(result.data as string[][], file.name);
          },
          error: err => {
            setError(`CSV parse error: ${err.message}`);
          },
          skipEmptyLines: true,
        });
      } else if (ext === 'xlsx' || ext === 'xls') {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
            processCSVData(rows as string[][], file.name);
          } catch (err) {
            setError('Could not parse Excel file.');
            console.error(err);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        setError('Please upload a .csv, .xlsx, or .xls file.');
      }
    },
    [processCSVData]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handlePasteSubmit = () => {
    if (!csvText.trim()) {
      setError('Please paste some CSV content.');
      return;
    }
    const result = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
    processCSVData(result.data as string[][], 'pasted-data.csv');
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#1e3a5f] bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-gray-700">
              Drop your CSV or Excel file here
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or click to browse — .csv, .xlsx, .xls supported
            </p>
          </div>
          {fileName && (
            <p className="text-sm text-green-600 font-medium">{fileName} loaded</p>
          )}
        </div>
      </div>

      {/* Paste CSV */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowPaste(!showPaste)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span>Or paste CSV text</span>
          <svg
            className={`w-4 h-4 transition-transform ${showPaste ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showPaste && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="Paste CSV content here..."
              rows={6}
              className="w-full mt-3 px-3 py-2 text-sm border border-gray-200 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-y"
            />
            <button
              onClick={handlePasteSubmit}
              className="bg-[#1e3a5f] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#162d4a] transition-colors"
            >
              Parse CSV
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#fff0ee] border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Expected format */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Expected column format</h3>
        <div className="overflow-x-auto">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {[
                  'Company Name',
                  'Website URL',
                  'LinkedIn URL',
                  'Contact Name',
                  'Role',
                  'Contact Email',
                ].map(col => (
                  <th
                    key={col}
                    className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Acme Corp</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">acme.com</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">linkedin.com/…</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Jane Doe</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">CEO</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">jane@acme.com</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Acme Corp</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">acme.com</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">linkedin.com/…</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">John Smith</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">CTO</td>
                <td className="border border-gray-200 px-2 py-1.5 text-gray-500">john@acme.com</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Column names are detected automatically. Multiple contacts per company are supported — they will be grouped.
        </p>
      </div>
    </div>
  );
}
