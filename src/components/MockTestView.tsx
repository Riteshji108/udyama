import React, { useState, useEffect } from 'react';
import { IconClock, IconAward, IconCheck, IconAlertCircle, IconRotateCcw } from './icons';

interface MockQuestion {
  id: string;
  section: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 'mq-1',
    section: 'Statistics & Experimentation',
    prompt: 'When running an A/B test with 95% confidence (alpha = 0.05), what does the p-value representing 0.03 strictly indicate?',
    options: [
      'There is a 97% probability that the variant is genuinely superior in production',
      'Under the null hypothesis of no true difference, the probability of observing a difference this extreme or greater is 3%',
      'The sample size was 3% larger than statistically required',
      'The conversion rate improved by an absolute 3 percentage points',
    ],
    correctIndex: 1,
    explanation: 'A p-value is the conditional probability P(Data|Null Hypothesis). It measures how unusual the observed sample result is assuming there is no true underlying difference.',
  },
  {
    id: 'mq-2',
    section: 'SQL & Data Transformation',
    prompt: 'Which window function should you choose if you want consecutive rankings without gaps when two rows have equal revenue amounts?',
    options: [
      'ROW_NUMBER()',
      'RANK()',
      'DENSE_RANK()',
      'NTILE(4)',
    ],
    correctIndex: 2,
    explanation: 'DENSE_RANK() assigns consecutive integer rank positions (e.g. 1, 2, 2, 3) without skipping ranks following ties, unlike RANK() which would produce 1, 2, 2, 4.',
  },
  {
    id: 'mq-3',
    section: 'Business Reasoning & KPIs',
    prompt: 'If Customer Lifetime Value (LTV) is $450 and Customer Acquisition Cost (CAC) is $220, with payback period of 19 months on a 12-month average subscription churn, what is the critical business risk?',
    options: [
      'LTV/CAC ratio is above 2.0 so growth is over-capitalized',
      'The customer churns before the business recoups the customer acquisition cost',
      'Organic referral rates will decline due to high pricing',
      'Payment processor fees will exceed gross margin',
    ],
    correctIndex: 1,
    explanation: 'If customers churn on average after 12 months, but payback takes 19 months, the company loses cash on every acquired subscriber before reaching profitability.',
  },
];

export const MockTestView: React.FC = () => {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeftSec, setTimeLeftSec] = useState(15 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let interval: number;
    if (testStarted && !isSubmitted && timeLeftSec > 0) {
      interval = window.setInterval(() => {
        setTimeLeftSec((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, isSubmitted, timeLeftSec]);

  const handleStartTest = () => {
    setTestStarted(true);
    setIsSubmitted(false);
    setTimeLeftSec(15 * 60);
    setAnswers({});
    setFlagged({});
    setCurrentQuestionIndex(0);
  };

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optIndex }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex],
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const q = MOCK_QUESTIONS[currentQuestionIndex];
  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Score calculation
  const totalQuestions = MOCK_QUESTIONS.length;
  let correctCount = 0;
  MOCK_QUESTIONS.forEach((item, idx) => {
    if (answers[idx] === item.correctIndex) {
      correctCount++;
    }
  });
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  let readinessBand = 'Developing';
  if (scorePercent >= 85) readinessBand = 'Strong / Interview Ready';
  else if (scorePercent >= 65) readinessBand = 'Ready';
  else if (scorePercent >= 40) readinessBand = 'Developing';
  else readinessBand = 'Foundation';

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#C8CECB] pb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238] flex items-center gap-1.5">
            <IconAward size={16} className="text-[#2E5B66]" />
            Data Analyst Sectional Mock Test #01
          </h3>
          <p className="text-[11px] text-[#5D676C]">
            Timed assessment • Explainable scoring • No invented percentiles
          </p>
        </div>

        {testStarted && !isSubmitted && (
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-[#9A6A1F] bg-[#FDF6E8] border border-[#ECD9AE] px-3 py-1 rounded tabular-nums">
            <IconClock size={15} />
            {timeFormatted}
          </div>
        )}
      </div>

      {!testStarted ? (
        <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-6 text-center space-y-3">
          <h4 className="text-base font-semibold text-[#253238] font-display">
            Data Analyst Blueprint Assessment (v2.1)
          </h4>
          <p className="text-xs text-[#5D676C] max-w-lg mx-auto">
            Test your core competencies across Statistics & Hypothesis Testing, PostgreSQL Window Functions, and Business Unit Economics. Server-synced scoring and instant mistake identification.
          </p>
          <div className="flex justify-center gap-4 text-xs text-[#5D676C] pt-2">
            <span>3 Sections</span>
            <span>•</span>
            <span>15 Minutes</span>
            <span>•</span>
            <span>Negative Marking: None</span>
          </div>
          <button
            onClick={handleStartTest}
            className="mt-3 px-5 py-2 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded cursor-pointer"
          >
            Start Assessment
          </button>
        </div>
      ) : isSubmitted ? (
        /* Results Report */
        <div className="space-y-4">
          <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-4 text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5D676C]">
              Assessment Report
            </span>
            <div className="text-3xl font-mono font-bold text-[#253238] tabular-nums">
              {scorePercent}%
            </div>
            <div className="inline-block px-3 py-1 rounded bg-[#2E5B66]/15 text-[#2E5B66] font-semibold text-xs border border-[#2E5B66]/30">
              Readiness Band: {readinessBand}
            </div>
            <p className="text-xs text-[#5D676C]">
              You answered {correctCount} of {totalQuestions} questions correctly.
            </p>
          </div>

          {/* Question Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#5D676C] uppercase tracking-wider">
              Question Breakdown & Explanations
            </h4>
            {MOCK_QUESTIONS.map((item, idx) => {
              const isCorrect = answers[idx] === item.correctIndex;
              return (
                <div
                  key={item.id}
                  className={`border rounded p-3 text-xs space-y-1 ${
                    isCorrect
                      ? 'bg-[#EAF3ED] border-[#C1DFCA]'
                      : 'bg-[#FBEBEB] border-[#E7C0C0]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#253238]">
                      Q{idx + 1}: {item.section}
                    </span>
                    <span className={isCorrect ? 'text-[#3E6A50]' : 'text-[#934444]'}>
                      {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                    </span>
                  </div>
                  <p className="text-[#253238] font-medium">{item.prompt}</p>
                  <p className="text-[11px] text-[#5D676C] pt-1">
                    <span className="font-semibold text-[#253238]">Explanation: </span>
                    {item.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartTest}
              className="px-4 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded cursor-pointer flex items-center gap-1.5"
            >
              <IconRotateCcw size={14} /> Retake Assessment
            </button>
          </div>
        </div>
      ) : (
        /* Active Test Interface */
        <div className="space-y-4">
          {/* Question Navigator */}
          <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2">
            <div className="flex items-center gap-1.5">
              {MOCK_QUESTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 text-xs rounded border flex items-center justify-center font-mono cursor-pointer transition-colors ${
                    currentQuestionIndex === idx
                      ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                      : answers[idx] !== undefined
                      ? 'bg-[#3E6A50]/20 text-[#3E6A50] border-[#3E6A50]'
                      : flagged[idx]
                      ? 'bg-[#9A6A1F]/20 text-[#9A6A1F] border-[#9A6A1F]'
                      : 'bg-[#F2F3F1] border-[#C8CECB] text-[#5D676C]'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={toggleFlag}
              className={`text-xs px-2.5 py-1 rounded border cursor-pointer ${
                flagged[currentQuestionIndex]
                  ? 'bg-[#9A6A1F] text-white border-[#9A6A1F]'
                  : 'bg-[#F2F3F1] border-[#C8CECB] text-[#5D676C]'
              }`}
            >
              {flagged[currentQuestionIndex] ? 'Flagged for Review' : 'Flag for Review'}
            </button>
          </div>

          {/* Active Question */}
          <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-4 space-y-3">
            <div className="text-xs text-[#5D676C] font-semibold uppercase">
              Section: {q.section}
            </div>
            <p className="text-sm text-[#253238] font-medium leading-relaxed">
              {q.prompt}
            </p>

            {/* Options */}
            <div className="space-y-2 pt-2">
              {q.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-3 rounded border text-xs cursor-pointer transition-colors ${
                    answers[currentQuestionIndex] === optIdx
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

          {/* Navigation footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#C8CECB]">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              className="px-3 py-1.5 text-xs border border-[#C8CECB] rounded text-[#5D676C] disabled:opacity-40 hover:bg-[#DDE1DE] cursor-pointer"
            >
              Previous
            </button>

            {currentQuestionIndex < MOCK_QUESTIONS.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                className="px-4 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded cursor-pointer"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-5 py-1.5 bg-[#3E6A50] hover:bg-[#325641] text-white text-xs font-semibold rounded cursor-pointer"
              >
                Finish & Submit Exam
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
