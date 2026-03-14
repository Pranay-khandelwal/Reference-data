'use client';

import { CompanyGroup } from '@/lib/types';

interface ReviewScreenProps {
  companyGroups: CompanyGroup[];
  onBack: () => void;
  onGenerate: () => void;
}

export default function ReviewScreen({
  companyGroups,
  onBack,
  onGenerate,
}: ReviewScreenProps) {
  const totalEmails = companyGroups.reduce((sum, g) => sum + g.contacts.length, 0);
  const companiesWithoutWebsite = companyGroups.filter(g => !g.websiteUrl);

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-gray-800">
            {companyGroups.length} {companyGroups.length === 1 ? 'company' : 'companies'} &middot;{' '}
            {totalEmails} {totalEmails === 1 ? 'email' : 'emails'} to generate
          </p>
          <p className="text-sm text-gray-400 mt-0.5">Review before generating</p>
        </div>
      </div>

      {/* Warning banner */}
      {companiesWithoutWebsite.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-3">
          <svg
            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {companiesWithoutWebsite.length}{' '}
              {companiesWithoutWebsite.length === 1 ? 'company has' : 'companies have'} no website URL
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Without a website, AI research quality will be lower and hook confidence may be NOT_FOUND.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {companiesWithoutWebsite.map(g => g.companyName).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Company cards */}
      <div className="space-y-3">
        {companyGroups.map(group => (
          <div
            key={group.companyName}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{group.companyName}</h3>
                <div className="flex flex-wrap gap-3 mt-1">
                  {group.websiteUrl ? (
                    <a
                      href={
                        group.websiteUrl.startsWith('http')
                          ? group.websiteUrl
                          : `https://${group.websiteUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {group.websiteUrl}
                    </a>
                  ) : (
                    <span className="text-xs text-red-400">No website URL</span>
                  )}
                  {group.linkedinUrl && (
                    <a
                      href={
                        group.linkedinUrl.startsWith('http')
                          ? group.linkedinUrl
                          : `https://${group.linkedinUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-3">
                {group.contacts.length} {group.contacts.length === 1 ? 'contact' : 'contacts'}
              </span>
            </div>

            <div className="space-y-2">
              {group.contacts.map((contact, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-1.5 px-3 bg-gray-50 rounded-md"
                >
                  <span className="bg-[#dbeafe] text-[#1e40af] text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                    {contact.role || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-700 font-medium">{contact.name || '—'}</span>
                  <span className="text-sm text-gray-400">{contact.email || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="bg-white border border-gray-300 text-gray-700 font-medium px-5 py-2.5 rounded-md hover:bg-gray-50 transition-colors text-sm"
        >
          Back
        </button>
        <button
          onClick={onGenerate}
          className="bg-[#1e3a5f] text-white font-medium px-6 py-2.5 rounded-md hover:bg-[#162d4a] transition-colors text-sm flex items-center gap-2"
        >
          Generate {totalEmails} {totalEmails === 1 ? 'email' : 'emails'}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
