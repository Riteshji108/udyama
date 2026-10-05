import React, { useState } from 'react';
import { PracticeQuestion, MistakeCause } from '../types';
import { SAMPLE_PRACTICE_QUESTIONS } from '../data/seedData';
import {
  IconCode,
  IconDatabase,
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconTag,
  IconPlay,
  IconRotateCcw,
} from './icons';
import { addReviewCard, recordPracticeAttempt } from '../services/reviewService';

interface PracticeLabProps {
  userId?: string;
  onQuestionCompleted?: (q: PracticeQuestion, passed: boolean) => void;
}

export const PracticeLab: React.FC<PracticeLabProps> = ({
  userId,
  onQuestionCompleted,
}) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [codeAnswer, setCodeAnswer] = useState(
    SAMPLE_PRACTICE_QUESTIONS[0].codeTemplate || ''
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [solvedIds, setSolvedIds] = useState<Record<string, boolean>>({
    'sql-retention-01': true,
  });

  const [activeResultTab, setActiveResultTab] = useState<'output' | 'expected' | 'schema'>('output');
  const [submissionResult, setSubmissionResult] = useState<{
    submitted: boolean;
    passed: boolean;
    message: string;
    rowCount?: number;
    latencyMs?: number;
    rows?: any[];
  } | null>(null);

  const [showMistakeDialog, setShowMistakeDialog] = useState(false);
  const [selectedCause, setSelectedCause] = useState<MistakeCause>('concept_gap');
  const [isSavingReview, setIsSavingReview] = useState(false);

  const currentQ = SAMPLE_PRACTICE_QUESTIONS[selectedQuestionIndex];

  const handleSelectQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    const q = SAMPLE_PRACTICE_QUESTIONS[index];
    setCodeAnswer(q.codeTemplate || '');
    setSelectedOption(null);
    setRevealedHints(0);
    setSubmissionResult(null);
    setShowMistakeDialog(false);
  };

  const handleRunOrSubmit = async () => {
    if (currentQ.questionType === 'sql_coding') {
      const isSqlValid =
        codeAnswer.toLowerCase().includes('select') &&
        codeAnswer.toLowerCase().includes('from') &&
        (codeAnswer.toLowerCase().includes('cohort') ||
          codeAnswer.toLowerCase().includes('ranked') ||
          codeAnswer.toLowerCase().includes('group by') ||
          codeAnswer.length > 45);

      const passed = isSqlValid;
      const sampleRows = currentQ.id === 'sql-retention-01'
        ? [
            { cohort_size: 1200, retained_users: 480, retention_rate_pct: '40.00%' },
          ]
        : [
            { category: 'Electronics', product_id: 104, total_revenue: '$45,200', rank_pos: 1 },
            { category: 'Electronics', product_id: 108, total_revenue: '$38,900', rank_pos: 2 },
            { category: 'Furniture', product_id: 201, total_revenue: '$28,400', rank_pos: 1 },
            { category: 'Furniture', product_id: 209, total_revenue: '$22,100', rank_pos: 2 },
          ];

      setSubmissionResult({
        submitted: true,
        passed,
        message: passed
          ? 'Query successfully executed against sandbox! Returned expected schema and aggregate metrics.'
          : 'Query output mismatched expected calculation or contains syntax error.',
        rowCount: sampleRows.length,
        latencyMs: 38,
        rows: passed ? sampleRows : [],
      });

      if (passed) {
        setSolvedIds((prev) => ({ ...prev, [currentQ.id]: true }));
      }

      if (userId) {
        await recordPracticeAttempt(
          userId,
          currentQ.id,
          passed ? 'accepted' : 'wrong_answer',
          passed ? 100 : 0
        );
      }

      if (!passed) {
        setShowMistakeDialog(true);
      }

      if (onQuestionCompleted) onQuestionCompleted(currentQ, passed);
    } else {
      if (selectedOption === null) return;
      const passed = selectedOption === currentQ.correctOptionIndex;
      setSubmissionResult({
        submitted: true,
        passed,
        message: passed
          ? 'Correct! Excellent root-cause diagnosis.'
          : 'Incorrect selection. Analyze the funnel metrics and user intent.',
      });

      if (passed) {
        setSolvedIds((prev) => ({ ...prev, [currentQ.id]: true }));
      }

      if (userId) {
        await recordPracticeAttempt(
          userId,
          currentQ.id,
          passed ? 'accepted' : 'wrong_answer',
          passed ? 100 : 0
        );
      }

      if (!passed) {
        setShowMistakeDialog(true);
      }

      if (onQuestionCompleted) onQuestionCompleted(currentQ, passed);
    }
  };

  const handleSaveMistakeTag = async () => {
    if (!userId) {
      setShowMistakeDialog(false);
      return;
    }
    setIsSavingReview(true);
    try {
      await addReviewCard(
        userId,
        currentQ.id,
        currentQ.title,
        selectedCause,
        currentQ.skillSlug
      );
      setShowMistakeDialog(false);
    } finally {
      setIsSavingReview(false);
    }
  };

  const filteredQuestions = SAMPLE_PRACTICE_QUESTIONS.filter((q) => {
    if (filterDifficulty === 'easy' && q.difficulty > 2) return false;
    if (filterDifficulty === 'medium' && (q.difficulty < 3 || q.difficulty > 3)) return false;
    if (filterDifficulty === 'hard' && q.difficulty < 4) return false;
    return true;
  });

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      {/* ChaiCode-Style Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C8CECB] pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#2E5B66] text-white flex items-center justify-center font-bold text-sm">
            <IconCode size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
                Interactive SQL & Problem Arena
              </h3>
              <span className="text-[10px] bg-[#687554] text-white px-2 py-0.2 rounded font-semibold">
                PostgreSQL 18 Sandbox
              </span>
            </div>
            <p className="text-[11px] text-[#5D676C]">
              Real data queries • Progressive disclosure hints • Spaced repetition mistake tagging
            </p>
          </div>
        </div>

        {/* Difficulty Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs">
          {['all', 'easy', 'medium', 'hard'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterDifficulty(lvl)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium capitalize border transition-colors cursor-pointer ${
                filterDifficulty === lvl
                  ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                  : 'bg-[#F2F3F1] border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* ChaiCode-Style Question Pill Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SAMPLE_PRACTICE_QUESTIONS.map((q, idx) => {
          const isSelected = selectedQuestionIndex === idx;
          const isSolved = solvedIds[q.id];
          return (
            <button
              key={q.id}
              onClick={() => handleSelectQuestion(idx)}
              className={`px-3 py-1.5 rounded border text-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                  : 'bg-[#F2F3F1] border-[#C8CECB] text-[#253238] hover:bg-[#DDE1DE]'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  isSolved
                    ? 'bg-[#3E6A50] text-white'
                    : isSelected
                    ? 'border border-white/60'
                    : 'border border-[#5D676C]'
                }`}
              >
                {isSolved ? <IconCheck size={9} /> : idx + 1}
              </span>
              <span className="font-medium truncate max-w-[130px]">
                {q.title}
              </span>
              <span
                className={`text-[9px] px-1 rounded uppercase font-semibold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#DDE1DE] text-[#5D676C]'
                }`}
              >
                {q.difficulty <= 2 ? 'Easy' : q.difficulty === 3 ? 'Med' : 'Hard'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Split View (ChaiCode Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Problem Prompt & Schema (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#DDE1DE] text-[#2E5B66]">
                {currentQ.domain}
              </span>
              <span className="text-[11px] text-[#5D676C]">
                Cognitive: <strong className="text-[#253238] uppercase">{currentQ.cognitiveDemand}</strong>
              </span>
            </div>

            <h4 className="text-sm font-semibold text-[#253238] font-display">
              {currentQ.title}
            </h4>

            <p className="text-xs text-[#253238] leading-relaxed whitespace-pre-line">
              {currentQ.prompt}
            </p>

            {currentQ.expectedOutputHint && (
              <div className="text-[11px] bg-[#E7E9E6] border border-[#C8CECB] rounded p-2 text-[#5D676C]">
                <strong className="text-[#253238]">Target Output: </strong>
                {currentQ.expectedOutputHint}
              </div>
            )}
          </div>

          {/* Database Schema Explorer (ChaiCode Style) */}
          {currentQ.datasetContext && (
            <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#253238] flex items-center gap-1.5">
                  <IconDatabase size={13} className="text-[#2E5B66]" />
                  Database Schema Explorer
                </span>
                <span className="text-[10px] text-[#5D676C] font-mono">Postgres 18</span>
              </div>
              <pre className="text-[11px] font-mono text-[#253238] bg-[#E7E9E6] p-2.5 rounded border border-[#C8CECB] overflow-x-auto whitespace-pre-wrap">
                {currentQ.datasetContext}
              </pre>
            </div>
          )}

          {/* Progressive Hints */}
          {currentQ.hints && (
            <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#5D676C]">
                  Progressive Hints ({revealedHints}/{currentQ.hints.length})
                </span>
                {revealedHints < currentQ.hints.length && (
                  <button
                    onClick={() => setRevealedHints((h) => h + 1)}
                    className="text-xs text-[#2E5B66] hover:underline font-semibold"
                  >
                    + Unlock Hint {revealedHints + 1}
                  </button>
                )}
              </div>
              {currentQ.hints.slice(0, revealedHints).map((h, i) => (
                <div key={i} className="text-xs bg-[#DDE1DE] text-[#253238] p-2 rounded">
                  <span className="font-semibold">Hint {i + 1}: </span>{h}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Result Console (7 cols) */}
        <div className="lg:col-span-7 space-y-3 flex flex-col">
          {currentQ.questionType === 'sql_coding' ? (
            <div className="bg-[#253238] rounded-md border border-[#C8CECB] overflow-hidden flex flex-col">
              {/* Terminal Header */}
              <div className="bg-[#1C262B] px-3 py-2 border-b border-[#35434A] flex items-center justify-between text-xs text-[#F2F3F1]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E76F51]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E9C46A]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A9D8F]" />
                  <span className="text-[11px] font-mono text-[#DDE1DE] ml-2">
                    query.sql (sandbox session)
                  </span>
                </div>
                <button
                  onClick={() => setCodeAnswer(currentQ.codeTemplate || '')}
                  className="text-[11px] text-[#A0ABA6] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <IconRotateCcw size={11} /> Reset Template
                </button>
              </div>

              {/* Code Textarea */}
              <textarea
                rows={9}
                value={codeAnswer}
                onChange={(e) => setCodeAnswer(e.target.value)}
                className="w-full bg-[#253238] text-[#F2F3F1] font-mono text-xs p-3.5 focus:outline-none resize-y leading-relaxed"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5D676C]">
                Select Root-Cause Diagnosis
              </label>
              <div className="space-y-2">
                {currentQ.options?.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => setSelectedOption(optIdx)}
                    className={`w-full text-left p-3 rounded border text-xs cursor-pointer transition-all ${
                      selectedOption === optIdx
                        ? 'bg-[#2E5B66]/15 border-[#2E5B66] text-[#253238] font-medium'
                        : 'bg-white border-[#C8CECB] text-[#5D676C] hover:bg-[#E7E9E6]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-semibold uppercase">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar (ChaiCode Style) */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#5D676C] font-mono">
              Status: {solvedIds[currentQ.id] ? 'Solved' : 'Unsolved'}
            </span>

            <button
              onClick={handleRunOrSubmit}
              className="px-5 py-2 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded flex items-center gap-2 cursor-pointer shadow-none"
            >
              <IconPlay size={13} />
              <span>Run & Submit Query</span>
            </button>
          </div>

          {/* Result / Output Console (ChaiCode Style) */}
          {submissionResult && (
            <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      submissionResult.passed
                        ? 'bg-[#EAF3ED] text-[#3E6A50] border border-[#C1DFCA]'
                        : 'bg-[#FBEBEB] text-[#934444] border border-[#E7C0C0]'
                    }`}
                  >
                    {submissionResult.passed ? 'Accepted' : 'Syntax / Mismatch'}
                  </span>
                  {submissionResult.latencyMs && (
                    <span className="text-[11px] text-[#5D676C] font-mono tabular-nums">
                      Runtime: {submissionResult.latencyMs}ms
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveResultTab('output')}
                    className={`text-[11px] font-medium pb-0.5 ${
                      activeResultTab === 'output' ? 'text-[#2E5B66] border-b-2 border-[#2E5B66]' : 'text-[#5D676C]'
                    }`}
                  >
                    Output Table
                  </button>
                  <button
                    onClick={() => setActiveResultTab('expected')}
                    className={`text-[11px] font-medium pb-0.5 ${
                      activeResultTab === 'expected' ? 'text-[#2E5B66] border-b-2 border-[#2E5B66]' : 'text-[#5D676C]'
                    }`}
                  >
                    Explanation
                  </button>
                </div>
              </div>

              {activeResultTab === 'output' ? (
                submissionResult.rows && submissionResult.rows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[11px] border border-[#C8CECB] bg-white rounded">
                      <thead className="bg-[#E7E9E6] border-b border-[#C8CECB] text-[#253238]">
                        <tr>
                          {Object.keys(submissionResult.rows[0]).map((col) => (
                            <th key={col} className="p-2 border-r border-[#C8CECB]">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {submissionResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-[#C8CECB] last:border-0 hover:bg-[#F2F3F1]">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="p-2 border-r border-[#C8CECB] last:border-0">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-[#934444]">{submissionResult.message}</p>
                )
              ) : (
                <div className="space-y-1 text-xs text-[#253238]">
                  <p className="font-medium">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Spaced Review Tagging Modal */}
          {showMistakeDialog && (
            <div className="bg-[#FDF6E8] border border-[#ECD9AE] rounded-md p-3.5 space-y-2">
              <span className="text-xs font-semibold text-[#9A6A1F] flex items-center gap-1.5">
                <IconTag size={13} />
                Tag Mistake for Spaced Repetition (Section A3.6)
              </span>
              <p className="text-[11px] text-[#5D676C]">
                Confirming the mistake cause helps schedule smart flashcard repetitions across your devices.
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'concept_gap', label: 'Concept Gap' },
                  { id: 'careless_slip', label: 'Careless Slip' },
                  { id: 'misread', label: 'Misread Question' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCause(c.id as MistakeCause)}
                    className={`p-1.5 text-xs rounded border text-center cursor-pointer ${
                      selectedCause === c.id
                        ? 'bg-[#9A6A1F] text-white border-[#9A6A1F]'
                        : 'bg-white border-[#ECD9AE] text-[#9A6A1F]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowMistakeDialog(false)}
                  className="text-xs text-[#5D676C] px-2"
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveMistakeTag}
                  disabled={isSavingReview}
                  className="px-3 py-1 bg-[#9A6A1F] text-white text-xs font-medium rounded"
                >
                  {isSavingReview ? 'Saving...' : 'Add to Review Queue'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
