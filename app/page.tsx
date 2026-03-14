'use client';

import { useState } from 'react';
import { CompanyGroup, CompanyResult, ContactRow } from '@/lib/types';
import UploadScreen from '@/components/UploadScreen';
import ReviewScreen from '@/components/ReviewScreen';
import ProcessingScreen from '@/components/ProcessingScreen';
import ResultsScreen from '@/components/ResultsScreen';

type Screen = 'upload' | 'review' | 'processing' | 'results';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [parsedRows, setParsedRows] = useState<ContactRow[]>([]);
  const [companyGroups, setCompanyGroups] = useState<CompanyGroup[]>([]);
  const [results, setResults] = useState<CompanyResult[]>([]);

  function handleParsed(rows: ContactRow[], groups: CompanyGroup[]) {
    setParsedRows(rows);
    setCompanyGroups(groups);
    setScreen('review');
  }

  function handleStartProcessing() {
    setResults([]);
    setScreen('processing');
  }

  function handleAddResult(result: CompanyResult) {
    setResults(prev => [...prev, result]);
  }

  function handleProcessingComplete() {
    setScreen('results');
  }

  function handleRetry(companyName: string, updatedResult: CompanyResult) {
    setResults(prev =>
      prev.map(r => (r.companyName === companyName ? updatedResult : r))
    );
  }

  function handleReset() {
    setParsedRows([]);
    setCompanyGroups([]);
    setResults([]);
    setScreen('upload');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Xpertiz Cold Email Automation
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Personalised outreach powered by AI research
              </p>
            </div>
            {screen !== 'upload' && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Start over
              </button>
            )}
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {(['upload', 'review', 'processing', 'results'] as Screen[]).map(
              (s, i) => {
                const labels: Record<Screen, string> = {
                  upload: 'Upload',
                  review: 'Review',
                  processing: 'Generate',
                  results: 'Results',
                };
                const stepIndex = ['upload', 'review', 'processing', 'results'].indexOf(screen);
                const thisIndex = i;
                const isActive = s === screen;
                const isDone = thisIndex < stepIndex;

                return (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 text-sm font-medium ${
                        isActive
                          ? 'text-[#1e3a5f]'
                          : isDone
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? 'bg-[#1e3a5f] text-white'
                            : isDone
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isDone ? '✓' : i + 1}
                      </span>
                      {labels[s]}
                    </div>
                    {i < 3 && (
                      <div
                        className={`h-px w-8 ${
                          thisIndex < stepIndex ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Screens */}
        {screen === 'upload' && (
          <UploadScreen onParsed={handleParsed} />
        )}
        {screen === 'review' && (
          <ReviewScreen
            companyGroups={companyGroups}
            onBack={() => setScreen('upload')}
            onGenerate={handleStartProcessing}
          />
        )}
        {screen === 'processing' && (
          <ProcessingScreen
            companyGroups={companyGroups}
            onAddResult={handleAddResult}
            onComplete={handleProcessingComplete}
          />
        )}
        {screen === 'results' && (
          <ResultsScreen
            results={results}
            companyGroups={companyGroups}
            onRetry={handleRetry}
          />
        )}
      </div>
    </main>
  );
}
