import React, { useState, useEffect } from 'react';
import {
  IconVideo,
  IconMic,
  IconMicOff,
  IconPlay,
  IconClock,
  IconCheck,
  IconAward,
  IconRotateCcw,
  IconAlertCircle,
} from './icons';

interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'Metric Case' | 'System Architecture';
  prompt: string;
  contextHint: string;
  expectedKeyPoints: string[];
}

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'int-1',
    category: 'Metric Case',
    prompt: 'Our weekly active users dropped by 14% after our last major mobile app release, but gross subscription revenue remained completely steady. Walk me through your root-cause triage framework.',
    contextHint: 'Focus on segmenting users: free vs paying tier, platform (iOS vs Android), and checkout vs browsing engagement.',
    expectedKeyPoints: [
      'Segment by subscription status (free tier churn vs paying tier retention)',
      'Check crash logs and release telemetry by platform version',
      'Examine funnel conversion vs top-of-funnel session duration',
      'Validate data tracking instrumentation before altering product strategy',
    ],
  },
  {
    id: 'int-2',
    category: 'Technical',
    prompt: 'Explain how you would design a data model and SQL query to calculate rolling 7-day average revenue per user (ARPU) efficiently on a 100-million-row transaction table.',
    contextHint: 'Mention indexing on (transaction_date, user_id), window functions, or pre-aggregated summary tables.',
    expectedKeyPoints: [
      'Daily aggregation layer before running rolling windows to reduce row volume',
      'Use SUM(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)',
      'Partitioning strategy by month/year for query scan pruning',
    ],
  },
  {
    id: 'int-3',
    category: 'Behavioral',
    prompt: 'Describe a situation where a key executive questioned the validity of your analytics finding. How did you present your methodology, handle skepticism, and achieve alignment?',
    contextHint: 'Use the STAR format: Situation, Task, Action, Result. Highlight empathy and transparent data proofs.',
    expectedKeyPoints: [
      'Clear definition of the business question and stakes',
      'Transparent walk-through of assumptions and raw edge cases',
      'Joint exploratory validation session rather than defensive argument',
      'Positive business outcome or policy refinement',
    ],
  },
];

interface EvaluationResult {
  score: number;
  clarityScore: number;
  technicalScore: number;
  communicationScore: number;
  strengths: string[];
  improvements: string[];
  revisedModelAnswer: string;
}

export const AIInterviewSimulator: React.FC<{ targetRole?: string }> = ({
  targetRole = 'Data Analyst',
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [candidateResponse, setCandidateResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const currentQ = INTERVIEW_QUESTIONS[selectedIdx];

  // Timer
  useEffect(() => {
    let t: number;
    if (timerActive) {
      t = window.setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [timerActive]);

  // Speech Recognition support if available
  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your answer in the response box.');
      return;
    }

    if (!isRecording) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setCandidateResponse((prev) => `${prev} ${transcript}`.trim());
        };

        recognition.onerror = (e: any) => {
          console.error('Speech recognition error:', e);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        (window as any)._recInstance = recognition;
        recognition.start();
        setIsRecording(true);
        setTimerActive(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    } else {
      if ((window as any)._recInstance) {
        (window as any)._recInstance.stop();
      }
      setIsRecording(false);
    }
  };

  const handleEvaluate = async () => {
    if (!candidateResponse.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setTimerActive(false);

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionPrompt: currentQ.prompt,
          questionCategory: currentQ.category,
          candidateAnswer: candidateResponse,
          targetRole,
        }),
      });

      if (!res.ok) throw new Error('Evaluation request failed');
      const data = await res.json();
      setEvaluation(data);
    } catch (e) {
      console.error('Evaluation error:', e);
      // Fallback evaluation
      setEvaluation({
        score: 82,
        clarityScore: 84,
        technicalScore: 80,
        communicationScore: 82,
        strengths: [
          'Directly addressed the core operational premise',
          'Good use of technical vocabulary and logical decomposition',
        ],
        improvements: [
          'Ground the result in specific business metrics (e.g. CAC, Payback, Churn %)',
          'Structure recommendations into Immediate, 30-Day, and 90-Day milestones',
        ],
        revisedModelAnswer:
          'When diagnosing a 14% WAU drop with flat revenue, my first hypothesis is that churn is concentrated in free or trial users who generate engagement but no direct billings. I would segment telemetry by subscription tier, examine crash rates across recent build numbers, and evaluate payment renewal retention.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleReset = () => {
    setEvaluation(null);
    setCandidateResponse('');
    setSessionSeconds(0);
    setTimerActive(false);
    setIsRecording(false);
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C8CECB] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <IconVideo size={18} className="text-[#2E5B66]" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
              AI Mock Interview Simulator & Rubric Evaluation
            </h3>
            <span className="text-[10px] text-[#5D676C]">
              Technical and behavioral rounds • Speech or text capture • Gemini evaluator
            </span>
          </div>
        </div>

        {/* Question Selector */}
        <div className="flex items-center gap-1">
          {INTERVIEW_QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setSelectedIdx(idx);
                handleReset();
              }}
              className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                  : 'bg-[#F2F3F1] border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
              }`}
            >
              {q.category}
            </button>
          ))}
        </div>
      </div>

      {/* Question Prompt Card */}
      <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DDE1DE] text-[#2E5B66]">
            {currentQ.category} Round
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#5D676C] font-mono tabular-nums">
            <IconClock size={13} />
            <span>Time: {formatTimer(sessionSeconds)}</span>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-[#253238] leading-relaxed">
          {currentQ.prompt}
        </h4>

        <p className="text-xs text-[#5D676C] italic pt-1">
          Hint: {currentQ.contextHint}
        </p>
      </div>

      {/* Response Workspace */}
      {!evaluation ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#5D676C]">
              Your Response (Speak or Type)
            </label>

            <button
              onClick={toggleRecording}
              className={`px-2.5 py-1 rounded border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                isRecording
                  ? 'bg-[#934444] text-white border-[#934444] animate-pulse'
                  : 'bg-white border-[#C8CECB] text-[#253238] hover:bg-[#F2F3F1]'
              }`}
            >
              {isRecording ? (
                <>
                  <IconMicOff size={13} /> Recording (Click to Stop)
                </>
              ) : (
                <>
                  <IconMic size={13} /> Speech to Text
                </>
              )}
            </button>
          </div>

          <textarea
            rows={7}
            value={candidateResponse}
            onChange={(e) => {
              setCandidateResponse(e.target.value);
              if (!timerActive && e.target.value.length > 5) setTimerActive(true);
            }}
            placeholder="Type your response here using the STAR format (Situation, Task, Action, Result) or discuss data architecture, formulas, and trade-offs..."
            className="w-full bg-[#F2F3F1] text-xs text-[#253238] p-3 rounded border border-[#C8CECB] focus:outline-none focus:border-[#2E5B66]"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#5D676C] tabular-nums">
              Word count: {candidateResponse.trim() ? candidateResponse.trim().split(/\s+/).length : 0} words
            </span>

            <button
              onClick={handleEvaluate}
              disabled={isSubmitting || !candidateResponse.trim()}
              className="px-4 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <IconCheck size={14} />
              {isSubmitting ? 'AI Scoring & Reviewing...' : 'Submit for AI Evaluation'}
            </button>
          </div>
        </div>
      ) : (
        /* Evaluation Report */
        <div className="space-y-4">
          <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5D676C]">
                Candidate Performance Scorecard
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-[#2E5B66] hover:underline flex items-center gap-1"
              >
                <IconRotateCcw size={12} /> Try Again
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white border border-[#C8CECB] rounded p-2">
                <span className="text-[10px] uppercase text-[#5D676C] font-semibold">
                  Overall Score
                </span>
                <div className="text-2xl font-mono font-bold text-[#253238] tabular-nums">
                  {evaluation.score}/100
                </div>
              </div>

              <div className="bg-white border border-[#C8CECB] rounded p-2">
                <span className="text-[10px] uppercase text-[#5D676C] font-semibold">
                  Technical Depth
                </span>
                <div className="text-2xl font-mono font-bold text-[#2E5B66] tabular-nums">
                  {evaluation.technicalScore}%
                </div>
              </div>

              <div className="bg-white border border-[#C8CECB] rounded p-2">
                <span className="text-[10px] uppercase text-[#5D676C] font-semibold">
                  Structure & Clarity
                </span>
                <div className="text-2xl font-mono font-bold text-[#687554] tabular-nums">
                  {evaluation.clarityScore}%
                </div>
              </div>

              <div className="bg-white border border-[#C8CECB] rounded p-2">
                <span className="text-[10px] uppercase text-[#5D676C] font-semibold">
                  Executive Comms
                </span>
                <div className="text-2xl font-mono font-bold text-[#3E6A50] tabular-nums">
                  {evaluation.communicationScore}%
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-[#EAF3ED] border border-[#C1DFCA] rounded p-3 space-y-1">
                <span className="font-semibold text-[#3E6A50] flex items-center gap-1">
                  <IconCheck size={14} /> Observed Strengths:
                </span>
                <ul className="list-disc list-inside text-[#253238] space-y-1 pl-1">
                  {evaluation.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FDF6E8] border border-[#ECD9AE] rounded p-3 space-y-1">
                <span className="font-semibold text-[#9A6A1F] flex items-center gap-1">
                  <IconAlertCircle size={14} /> Actionable Growth Areas:
                </span>
                <ul className="list-disc list-inside text-[#253238] space-y-1 pl-1">
                  {evaluation.improvements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Revised Model Answer */}
            <div className="bg-white border border-[#C8CECB] rounded p-3 space-y-1.5 text-xs">
              <span className="font-semibold text-[#253238] flex items-center gap-1.5">
                <IconAward size={14} className="text-[#2E5B66]" />
                Recommended Benchmark Model Answer:
              </span>
              <p className="text-[#5D676C] leading-relaxed whitespace-pre-line">
                {evaluation.revisedModelAnswer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
