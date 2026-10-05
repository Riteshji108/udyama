import React, { useState } from 'react';
import { IconSparkles, IconChevronRight, IconRotateCcw, IconBookmark, IconCheck } from './icons';

interface FactItem {
  id: string;
  domain: string;
  fact: string;
  source: string;
  detail: string;
  tags: string[];
}

const CURATED_FACTS: FactItem[] = [
  {
    id: 'fact-1',
    domain: 'SQL & Databases',
    fact: "DENSE_RANK() does not skip rank values when consecutive rows share the same value, whereas RANK() leaves numerical gaps.",
    detail: "If two products tie for #1 with $10,000 revenue, DENSE_RANK() labels the next product as #2. Regular RANK() skips to #3.",
    source: "PostgreSQL 18 Manual, Ch. 3.5",
    tags: ['SQL', 'Window Functions', 'Interviews'],
  },
  {
    id: 'fact-2',
    domain: 'Machine Learning',
    fact: "AUC-ROC measures ranking discrimination rather than probability calibration.",
    detail: "A model with a 0.92 AUC-ROC can order positives above negatives flawlessly, yet still output poorly calibrated probabilities if training was unweighted.",
    source: "Google Machine Learning Crash Course",
    tags: ['ML', 'Evaluation', 'AUC-ROC'],
  },
  {
    id: 'fact-3',
    domain: 'Product Analytics',
    fact: "Day 1 to Day 7 retention ratio is the single strongest leading indicator of long-term product stickiness.",
    detail: "Users who return on Day 3 or Day 7 have up to 4.2x higher 90-day retention than users who only execute one prolonged session on Day 0.",
    source: "Reforge Growth Series & Amplitude Guide",
    tags: ['Retention', 'Cohorts', 'Product KPIs'],
  },
  {
    id: 'fact-4',
    domain: 'Software Architecture',
    fact: "UUIDv7 combines a 48-bit UNIX millisecond timestamp with random bits to preserve B-tree index sequential locality.",
    detail: "Unlike random UUIDv4 which fragments database B-tree leaves on insert, UUIDv7 allows clustered sequential inserts like autoincrementing integers while preserving global uniqueness.",
    source: "RFC 9562 & Postgres 18 Specification",
    tags: ['Databases', 'Indexing', 'PostgreSQL'],
  },
  {
    id: 'fact-5',
    domain: 'Statistics & Testing',
    fact: "P-hacking often occurs when experimenters peek at live significance without adjusting for sequential sample size inflation.",
    detail: "Checking results daily and stopping when p < 0.05 inflates the false positive rate from the nominal 5% to over 25%. Always pre-commit to a sample size or use sequential testing.",
    source: "Evan Miller A/B Testing Mathematics",
    tags: ['Statistics', 'A/B Testing', 'P-value'],
  },
];

export const QuickFactFeed: React.FC<{ onSaveToReview?: (fact: string) => void }> = ({
  onSaveToReview,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isFetchingNew, setIsFetchingNew] = useState(false);

  const current = CURATED_FACTS[currentIndex];

  const handleNext = () => {
    setSaved(false);
    setCurrentIndex((prev) => (prev + 1) % CURATED_FACTS.length);
  };

  const handlePrev = () => {
    setSaved(false);
    setCurrentIndex((prev) => (prev - 1 + CURATED_FACTS.length) % CURATED_FACTS.length);
  };

  const handleSave = () => {
    if (onSaveToReview) {
      onSaveToReview(`Quick Fact: ${current.fact}`);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleFetchAiFact = async () => {
    setIsFetchingNew(true);
    try {
      const res = await fetch('/api/daily-fact');
      if (res.ok) {
        const data = await res.json();
        if (data.fact) {
          CURATED_FACTS.unshift({
            id: `ai_${Date.now()}`,
            domain: data.domain || 'Engineering',
            fact: data.fact,
            detail: 'Verified dynamic intelligence bite retrieved from Gemini 3.8 Flash model.',
            source: data.source || 'Udyama Knowledge Engine',
            tags: ['AI Generated', 'Micro-Learning'],
          });
          setCurrentIndex(0);
        }
      }
    } catch (e) {
      console.error('Failed to fetch AI fact:', e);
    } finally {
      setIsFetchingNew(false);
    }
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#687554] text-white flex items-center justify-center text-xs">
            <IconSparkles size={11} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
              Insta-Feed: Daily Quick Fact & Micro-Learning
            </h3>
            <span className="text-[10px] text-[#5D676C]">
              Swipeable knowledge cards • Section 29
            </span>
          </div>
        </div>

        <button
          onClick={handleFetchAiFact}
          disabled={isFetchingNew}
          className="text-[11px] text-[#2E5B66] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <IconRotateCcw size={11} />
          {isFetchingNew ? 'Generating...' : 'Fresh AI Fact'}
        </button>
      </div>

      {/* Reel Card */}
      <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-4 space-y-2 relative overflow-hidden transition-all">
        {/* Domain Badge & Progress */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#DDE1DE] text-[#2E5B66]">
            {current.domain}
          </span>
          <span className="text-[11px] font-mono text-[#5D676C] tabular-nums">
            {currentIndex + 1} of {CURATED_FACTS.length}
          </span>
        </div>

        {/* Fact Statement */}
        <h4 className="text-sm font-semibold text-[#253238] font-display leading-snug pt-1">
          "{current.fact}"
        </h4>

        {/* Deep Dive */}
        <p className="text-xs text-[#5D676C] leading-relaxed">
          {current.detail}
        </p>

        {/* Source Attribution */}
        <div className="pt-2 border-t border-[#C8CECB]/60 flex items-center justify-between text-[11px] text-[#5D676C]">
          <span className="truncate">
            Source: <strong className="text-[#253238]">{current.source}</strong>
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {current.tags.map((t, idx) => (
              <span key={idx} className="text-[9px] bg-[#E7E9E6] px-1.5 py-0.2 rounded">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reel Navigation Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleSave}
          className={`px-3 py-1 text-xs rounded border flex items-center gap-1.5 transition-colors cursor-pointer ${
            saved
              ? 'bg-[#3E6A50] text-white border-[#3E6A50]'
              : 'bg-white border-[#C8CECB] text-[#253238] hover:bg-[#DDE1DE]'
          }`}
        >
          {saved ? (
            <>
              <IconCheck size={12} /> Saved to Review!
            </>
          ) : (
            <>
              <IconBookmark size={12} /> Save as Flashcard
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="px-2.5 py-1 text-xs bg-white border border-[#C8CECB] rounded hover:bg-[#DDE1DE] text-[#5D676C] cursor-pointer"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            className="px-3.5 py-1 text-xs bg-[#2E5B66] hover:bg-[#244851] text-white font-semibold rounded flex items-center gap-1 cursor-pointer"
          >
            Next Fact <IconChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
