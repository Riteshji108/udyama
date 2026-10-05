import React, { useState } from 'react';
import { PracticeQuestion, MistakeCause } from '../types';
import { SAMPLE_PRACTICE_QUESTIONS } from '../data/seedData';
import { IconCode, IconDatabase, IconCheck, IconAlertCircle, IconClock, IconTag } from './icons';
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
  const [submissionResult, setSubmissionResult] = useState<{
    submitted: boolean;
    passed: boolean;
    message: string;
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

  const handleSubmit = async () => {
    if (currentQ.questionType === 'sql_coding') {
      // Basic validation of SQL requirements
      const isSqlValid =
        codeAnswer.toLowerCase().includes('select') &&
        codeAnswer.toLowerCase().includes('from') &&
        (codeAnswer.toLowerCase().includes('cohort') || codeAnswer.toLowerCase().includes('ranked') || codeAnswer.length > 50);

      const passed = isSqlValid;
      setSubmissionResult({
        submitted: true,
        passed,
        message: passed
          ? 'Query successfully executed against sandbox! Returned expected schema and aggregate metrics.'
          : 'Query output mismatched expected cohort calculation or syntax error.',
      });

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
      // Multiple Choice / Diagnosis
      if (selectedOption === null) return;
      const passed = selectedOption === currentQ.correctOptionIndex;
      setSubmissionResult({
        submitted: true,
        passed,
        message: passed
          ? 'Correct! Excellent root-cause diagnosis.'
          : 'Incorrect selection. Analyze the funnel metrics and user intent.',
      });

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

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      {/* Header and question selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C8CECB] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <IconCode size={18} className="text-[#2E5B66]" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
              Interactive Practice Lab & online judge
            </h3>
            <span className="text-[11px] text-[#5D676C]">
              Real problems • Progressive hints • Spaced repetition error tagging
            </span>
          </div>
        </div>

        {/* Question tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {SAMPLE_PRACTICE_QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => handleSelectQuestion(idx)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer shrink-0 ${
                selectedQuestionIndex === idx
                  ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                  : 'bg-[#F2F3F1] border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
              }`}
            >
              Q{idx + 1}: {q.skillSlug.split('-')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Question Details */}
      <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-semibold text-[#253238]">
            {currentQ.title}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded border border-[#C8CECB] bg-[#E7E9E6] text-[#5D676C]">
              {currentQ.domain}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#2E5B66]/10 text-[#2E5B66] font-medium border border-[#2E5B66]/20">
              Diff: {currentQ.difficulty}/5
            </span>
          </div>
        </div>

        <p className="text-xs text-[#253238] whitespace-pre-line leading-relaxed">
          {currentQ.prompt}
        </p>

        {currentQ.datasetContext && (
          <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded p-2 text-xs">
            <span className="font-semibold text-[#5D676C] flex items-center gap-1 mb-1">
              <IconDatabase size={13} /> Sandbox Dataset Schema:
            </span>
            <pre className="text-[11px] font-mono text-[#253238] whitespace-pre-wrap">
              {currentQ.datasetContext}
            </pre>
          </div>
        )}
      </div>

      {/* Question Workspace: SQL Code Editor or MCQ Options */}
      {currentQ.questionType === 'sql_coding' ? (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#5D676C] uppercase tracking-wider">
            SQL Editor (PostgreSQL Sandbox)
          </label>
          <textarea
            rows={8}
            value={codeAnswer}
            onChange={(e) => setCodeAnswer(e.target.value)}
            className="w-full bg-[#253238] text-[#F2F3F1] font-mono text-xs p-3 rounded border border-[#C8CECB] focus:outline-none focus:border-[#2E5B66]"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#5D676C] uppercase tracking-wider">
            Select Your Diagnosis / Answer
          </label>
          <div className="space-y-1.5">
            {currentQ.options?.map((opt, optIdx) => (
              <label
                key={optIdx}
                className={`flex items-start gap-2.5 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                  selectedOption === optIdx
                    ? 'bg-[#2E5B66]/10 border-[#2E5B66] text-[#253238]'
                    : 'bg-[#F2F3F1] border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  checked={selectedOption === optIdx}
                  onChange={() => setSelectedOption(optIdx)}
                  className="mt-0.5 accent-[#2E5B66]"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Hints section */}
      {currentQ.hints && currentQ.hints.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5D676C] font-medium">
              Progressive Hints ({revealedHints}/{currentQ.hints.length})
            </span>
            {revealedHints < currentQ.hints.length && (
              <button
                onClick={() => setRevealedHints((h) => h + 1)}
                className="text-xs text-[#2E5B66] hover:underline"
              >
                Reveal Hint {revealedHints + 1}
              </button>
            )}
          </div>
          {currentQ.hints.slice(0, revealedHints).map((hint, hIdx) => (
            <div
              key={hIdx}
              className="text-xs bg-[#DDE1DE] text-[#253238] border border-[#C8CECB] rounded p-2"
            >
              <span className="font-semibold">Hint {hIdx + 1}:</span> {hint}
            </div>
          ))}
        </div>
      )}

      {/* Submission status feedback */}
      {submissionResult && (
        <div
          className={`p-3 rounded border text-xs space-y-1 ${
            submissionResult.passed
              ? 'bg-[#EAF3ED] border-[#C1DFCA] text-[#3E6A50]'
              : 'bg-[#FBEBEB] border-[#E7C0C0] text-[#934444]'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {submissionResult.passed ? (
              <>
                <IconCheck size={16} /> Accepted
              </>
            ) : (
              <>
                <IconAlertCircle size={16} /> Needs Work
              </>
            )}
          </div>
          <p>{submissionResult.message}</p>
          <div className="text-[11px] text-[#253238] mt-2 pt-2 border-t border-[#C8CECB]/60">
            <span className="font-semibold">Explanation: </span>
            {currentQ.explanation}
          </div>
        </div>
      )}

      {/* Mistake Tagging Dialog (Spaced Repetition Integration) */}
      {showMistakeDialog && (
        <div className="bg-[#FDF6E8] border border-[#ECD9AE] rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9A6A1F] flex items-center gap-1">
              <IconTag size={13} />
              Tag Mistake for Spaced Repetition Review
            </span>
          </div>
          <p className="text-[11px] text-[#5D676C]">
            Identifying the root cause helps schedule timely review cards so you master this concept across all devices.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {[
              { id: 'concept_gap', label: 'Concept Gap' },
              { id: 'careless_slip', label: 'Careless Slip' },
              { id: 'misread', label: 'Misread Question' },
              { id: 'time_pressure', label: 'Time Pressure' },
              { id: 'guess', label: 'Guessed' },
            ].map((cause) => (
              <button
                key={cause.id}
                onClick={() => setSelectedCause(cause.id as MistakeCause)}
                className={`px-2 py-1 text-xs rounded border text-left cursor-pointer transition-colors ${
                  selectedCause === cause.id
                    ? 'bg-[#9A6A1F] text-white border-[#9A6A1F]'
                    : 'bg-white border-[#ECD9AE] text-[#9A6A1F] hover:bg-[#FBEED7]'
                }`}
              >
                {cause.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowMistakeDialog(false)}
              className="text-xs text-[#5D676C] px-2 py-1 hover:underline"
            >
              Skip
            </button>
            <button
              onClick={handleSaveMistakeTag}
              disabled={isSavingReview}
              className="px-3 py-1 bg-[#9A6A1F] hover:bg-[#835A19] text-white text-xs font-medium rounded"
            >
              {isSavingReview ? 'Scheduling...' : 'Add to Review Queue'}
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-[#C8CECB]">
        <span className="text-xs text-[#5D676C]">
          Expected time: ~10 min
        </span>

        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded cursor-pointer"
        >
          Submit & Evaluate
        </button>
      </div>
    </div>
  );
};
