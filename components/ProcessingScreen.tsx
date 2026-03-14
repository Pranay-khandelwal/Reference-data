'use client';

import { useEffect, useRef, useState } from 'react';
import { CompanyGroup, CompanyResult } from '@/lib/types';

type ProcessStatus = 'Waiting' | 'Researching' | 'Done' | 'Failed';

interface ProcessingScreenProps {
  companyGroups: CompanyGroup[];
  onAddResult: (result: CompanyResult) => void;
  onComplete: () => void;
}

export default function ProcessingScreen({
  companyGroups,
  onAddResult,
  onComplete,
}: ProcessingScreenProps) {
  const [statuses, setStatuses] = useState<Record<string, ProcessStatus>>(() => {
    const initial: Record<string, ProcessStatus> = {};
    for (const g of companyGroups) {
      initial[g.companyName] = 'Waiting';
    }
    return initial;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function run() {
      for (let i = 0; i < companyGroups.length; i++) {
        const group = companyGroups[i];
        setCurrentIndex(i);
        setStatuses(prev => ({ ...prev, [group.companyName]: 'Researching' }));

        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify(group),
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'API error');

          onAddResult({
            ...data,
            companyName: group.companyName,
            status: 'READY',
          });
          setStatuses(prev => ({ ...prev, [group.companyName]: 'Done' }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          onAddResult({
            companyName: group.companyName,
            status: 'FAILED',
            error: message,
            emails: [],
            sector: '',
            company_summary: '',
            hook_confidence: 'NOT_FOUND',
          });
          setStatuses(prev => ({ ...prev, [group.companyName]: 'Failed' }));
        }

        if (i < companyGroups.length - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // Small delay before navigating away so user sees final status
      await new Promise(r => setTimeout(r, 800));
      onComplete();
    }

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneCount = Object.values(statuses).filter(
    s => s === 'Done' || s === 'Failed'
  ).length;

  const progressPct =
    companyGroups.length > 0 ? (doneCount / companyGroups.length) * 100 : 0;

  const statusConfig: Record<
    ProcessStatus,
    { label: string; dotClass: string; textClass: string }
  > = {
    Waiting: {
      label: 'Waiting',
      dotClass: 'bg-gray-300',
      textClass: 'text-gray-400',
    },
    Researching: {
      label: 'Researching',
      dotClass: 'bg-amber-400 animate-pulse',
      textClass: 'text-amber-600',
    },
    Done: {
      label: 'Done',
      dotClass: 'bg-green-500',
      textClass: 'text-green-700',
    },
    Failed: {
      label: 'Failed',
      dotClass: 'bg-red-400',
      textClass: 'text-red-600',
    },
  };

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">
            Processing {doneCount} of {companyGroups.length}{' '}
            {companyGroups.length === 1 ? 'company' : 'companies'}
          </p>
          <span className="text-sm text-gray-400">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1e3a5f] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Researching company websites and drafting personalised emails — this may take a minute per company.
        </p>
      </div>

      {/* Company list */}
      <div className="space-y-2">
        {companyGroups.map((group, idx) => {
          const status = statuses[group.companyName] ?? 'Waiting';
          const config = statusConfig[status];
          const isCurrent = idx === currentIndex && status === 'Researching';

          return (
            <div
              key={group.companyName}
              className={`bg-white border rounded-lg px-4 py-3 flex items-center justify-between transition-colors ${
                isCurrent ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dotClass}`}
                />
                <span className="text-sm font-medium text-gray-800">
                  {group.companyName}
                </span>
                {group.websiteUrl && (
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {group.websiteUrl}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${config.textClass}`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
