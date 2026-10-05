import React, { useState } from 'react';
import { IconSliders, IconCheck, IconTarget, IconClock, IconX } from './icons';

export interface UserPersonalization {
  targetRole: string;
  experienceLevel: string;
  weeklyHours: number;
  dailyMinutes: number;
  restDay: string;
  focusTrack: string;
}

interface PersonalizationModalProps {
  currentSettings: UserPersonalization;
  onSave: (settings: UserPersonalization) => void;
  onClose?: () => void;
}

export const PersonalizationModal: React.FC<PersonalizationModalProps> = ({
  currentSettings,
  onSave,
  onClose,
}) => {
  const [targetRole, setTargetRole] = useState(currentSettings.targetRole);
  const [experienceLevel, setExperienceLevel] = useState(currentSettings.experienceLevel);
  const [weeklyHours, setWeeklyHours] = useState(currentSettings.weeklyHours);
  const [dailyMinutes, setDailyMinutes] = useState(currentSettings.dailyMinutes);
  const [restDay, setRestDay] = useState(currentSettings.restDay);
  const [focusTrack, setFocusTrack] = useState(currentSettings.focusTrack);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSave({
      targetRole,
      experienceLevel,
      weeklyHours,
      dailyMinutes,
      restDay,
      focusTrack,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2">
        <div className="flex items-center gap-2">
          <IconSliders size={18} className="text-[#2E5B66]" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
              Personalized Learning & Study Engine
            </h3>
            <span className="text-[10px] text-[#5D676C]">
              Tailors daily tasks, difficulty, and study schedules to your goals
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#DDE1DE] text-[#5D676C]"
          >
            <IconX size={15} />
          </button>
        )}
      </div>

      <div className="space-y-3 text-xs">
        {/* Target Role & Track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Primary Career Target
            </label>
            <select
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                if (e.target.value.includes('Business')) setFocusTrack('business-analyst');
                else if (e.target.value.includes('Full Stack')) setFocusTrack('full-stack-dev');
                else if (e.target.value.includes('AI')) setFocusTrack('ai-machine-learning');
                else setFocusTrack('data-analyst');
              }}
              className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-3 py-1.5 text-xs text-[#253238]"
            >
              <option value="Data Analyst">Data Analyst / BI Engineer</option>
              <option value="Business Analyst">Business Analyst / Systems Analyst</option>
              <option value="Full Stack Engineer">Full Stack Software Engineer</option>
              <option value="AI & ML Engineer">AI & Machine Learning Practitioner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Current Skill Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-3 py-1.5 text-xs text-[#253238]"
            >
              <option value="Foundation">Foundation (Brand new, starting from zero)</option>
              <option value="Beginner">Beginner (Basic query knowledge, building basics)</option>
              <option value="Intermediate">Intermediate (Practicing interview questions & cases)</option>
              <option value="Advanced">Advanced (Optimizing queries, system architecture)</option>
            </select>
          </div>
        </div>

        {/* Weekly Hours and Daily Goals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F2F3F1] border border-[#C8CECB] rounded p-3">
          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Weekly Study Goal ({weeklyHours}h/wk)
            </label>
            <input
              type="range"
              min={4}
              max={24}
              step={1}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full accent-[#2E5B66] cursor-pointer"
            />
            <span className="text-[10px] text-[#5D676C] font-mono tabular-nums">
              ~{Math.round((weeklyHours / 6) * 10) / 10} hours per active day
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Daily Focus Target
            </label>
            <select
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full bg-white border border-[#C8CECB] rounded px-2 py-1 text-xs text-[#253238]"
            >
              <option value={25}>25 minutes (1 Pomodoro block)</option>
              <option value={45}>45 minutes (Standard focus)</option>
              <option value={60}>60 minutes (Deep work)</option>
              <option value={90}>90 minutes (Extended sprint)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Weekly Rest Day
            </label>
            <select
              value={restDay}
              onChange={(e) => setRestDay(e.target.value)}
              className="w-full bg-white border border-[#C8CECB] rounded px-2 py-1 text-xs text-[#253238]"
            >
              <option value="Sunday">Sunday (Default)</option>
              <option value="Saturday">Saturday</option>
              <option value="Friday">Friday</option>
              <option value="None">None (7 Days Study)</option>
            </select>
          </div>
        </div>

        {/* Live Recommendation Summary */}
        <div className="bg-white border border-[#C8CECB] rounded p-3 space-y-1">
          <div className="font-semibold text-[#253238] flex items-center gap-1.5">
            <IconTarget size={13} className="text-[#2E5B66]" />
            Generated Roadmap Pace:
          </div>
          <p className="text-[11px] text-[#5D676C]">
            At <strong className="text-[#253238]">{weeklyHours} hours/week</strong> with level <strong className="text-[#253238]">{experienceLevel}</strong>, you will complete the core syllabus in approximately <strong className="text-[#2E5B66]">{Math.ceil(30 / (weeklyHours / 10))} weeks</strong>. Daily tasks will automatically prioritize SQL aggregates, retention analysis, and active interview rounds.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C8CECB]">
          {savedSuccess && (
            <span className="text-xs text-[#3E6A50] font-medium flex items-center gap-1">
              <IconCheck size={14} /> Profile Saved & Synced!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded cursor-pointer"
          >
            Apply & Update Daily Plan
          </button>
        </div>
      </div>
    </div>
  );
};
