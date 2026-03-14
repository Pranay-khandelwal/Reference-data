'use client';

import { useState } from 'react';
import { CompanyGroup, CompanyResult, GeneratedEmail } from '@/lib/types';
import { exportCSV } from '@/lib/exportCSV';
import { exportDocx } from '@/lib/exportDocx';

interface ResultsScreenProps {
  results: CompanyResult[];
  companyGroups: CompanyGroup[];
  onRetry: (companyName: string, updatedResult: CompanyResult) => void;
}

interface EmailCardProps {
  email: GeneratedEmail;
}

function EmailCard({ email }: EmailCardProps) {
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email.full_email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-100 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#dbeafe] text-[#1e40af] text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
            {email.role}
          </span>
          <span className="text-sm font-medium text-gray-800">{email.contact_name}</span>
          <span className="text-sm text-gray-400">{email.contact_email}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`text-xs px-3 py-1 rounded-md border transition-colors font-medium ${
              copied
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy Email'}
          </button>
          <button
            onClick={() => setShowFull(!showFull)}
            className="text-xs px-3 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            {showFull ? 'Hide' : 'View'}
          </button>
        </div>
      </div>

      {showFull && (
        <div className="space-y-3 pt-1">
          {/* Subject */}
          <div className="text-sm">
            <span className="font-semibold text-gray-700">Subject: </span>
            <span className="text-gray-800">{email.subject}</span>
          </div>

          {/* Hook / Para 2 */}
          <div className="bg-[#f0fdf4] border-l-4 border-green-500 px-4 py-3 rounded-r-md">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
              Hook (Para 2)
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">{email.para2}</p>
          </div>

          {/* Full email */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Full Email
            </p>
            <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-md p-4 whitespace-pre-wrap leading-relaxed text-gray-700 overflow-x-auto">
              {email.full_email}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

interface CompanyCardProps {
  result: CompanyResult;
  group?: CompanyGroup;
  onRetry: (companyName: string, updatedResult: CompanyResult) => void;
}

function CompanyCard({ result, group, onRetry }: CompanyCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!group) return;
    setRetrying(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify(group),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      onRetry(result.companyName, {
        ...data,
        companyName: result.companyName,
        status: 'READY',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      onRetry(result.companyName, {
        ...result,
        error: message,
        status: 'FAILED',
      });
    } finally {
      setRetrying(false);
    }
  };

  const confidenceColors: Record<string, string> = {
    HIGH: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-orange-100 text-orange-800',
    NOT_FOUND: 'bg-red-100 text-red-700',
  };

  return (
    <div
      className={`bg-white border rounded-lg overflow-hidden ${
        result.status === 'FAILED' ? 'border-red-200' : 'border-gray-200'
      }`}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">{result.companyName}</span>
          {result.status === 'READY' && result.hook_confidence && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                confidenceColors[result.hook_confidence] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {result.hook_confidence}
            </span>
          )}
          {result.status === 'FAILED' && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Failed
            </span>
          )}
          {result.sector && (
            <span className="text-xs text-gray-400">{result.sector}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {result.status === 'READY' && (
            <span className="text-xs text-gray-400">
              {result.emails.length} {result.emails.length === 1 ? 'email' : 'emails'}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {result.status === 'FAILED' ? (
            <div className="space-y-3">
              <div className="bg-[#fff0ee] border border-red-200 rounded-md px-4 py-3">
                <p className="text-sm text-red-800">{result.error || 'An error occurred'}</p>
              </div>
              {group && (
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="bg-[#1e3a5f] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#162d4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {retrying ? 'Retrying...' : 'Retry'}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Company summary */}
              {result.company_summary && (
                <div className="bg-gray-50 rounded-md px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Company Summary
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {result.company_summary}
                  </p>
                </div>
              )}

              {/* Emails */}
              <div className="space-y-3">
                {result.emails.map((email, i) => (
                  <EmailCard key={i} email={email} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsScreen({
  results,
  companyGroups,
  onRetry,
}: ResultsScreenProps) {
  const [exporting, setExporting] = useState<'csv' | 'docx' | null>(null);

  const readyCount = results.filter(r => r.status === 'READY').length;
  const failedCount = results.filter(r => r.status === 'FAILED').length;
  const totalEmails = results.reduce((sum, r) => sum + (r.emails?.length ?? 0), 0);

  const handleExportCSV = () => {
    setExporting('csv');
    try {
      exportCSV(results);
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  const handleExportDocx = async () => {
    setExporting('docx');
    try {
      await exportDocx(results);
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  function getGroupForResult(result: CompanyResult): CompanyGroup | undefined {
    return companyGroups.find(
      g => g.companyName.toLowerCase() === result.companyName.toLowerCase()
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary + export */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-[#1e3a5f]">{totalEmails}</p>
              <p className="text-xs text-gray-400 mt-0.5">emails drafted</p>
            </div>
            {failedCount > 0 && (
              <div>
                <p className="text-2xl font-bold text-red-500">{failedCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">failed</p>
              </div>
            )}
            <div>
              <p className="text-2xl font-bold text-gray-700">{results.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">companies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{readyCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">successful</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting === 'csv'}
              className="bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={handleExportDocx}
              disabled={exporting === 'docx'}
              className="bg-[#1e3a5f] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#162d4a] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {exporting === 'docx' ? 'Exporting...' : 'Export Word'}
            </button>
          </div>
        </div>

        {results.some(
          r => r.hook_confidence === 'LOW' || r.hook_confidence === 'NOT_FOUND'
        ) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-amber-600">
              Some emails have LOW or NOT_FOUND hook confidence — review those carefully before sending. They are marked as REVIEW in the CSV export.
            </p>
          </div>
        )}
      </div>

      {/* Company cards */}
      <div className="space-y-3">
        {results.map(result => (
          <CompanyCard
            key={result.companyName}
            result={result}
            group={getGroupForResult(result)}
            onRetry={onRetry}
          />
        ))}
      </div>
    </div>
  );
}
