import React, { useState } from 'react';
import { IconFlame, IconCheck, IconClock, IconAward, IconCalendar } from './icons';

interface StreakActivityProps {
  currentStreak: number;
  longestStreak: number;
  todayMinutes: number;
  weeklyTargetDays?: number;
  restDay?: string;
  onUpdateRestDay?: (day: string) => void;
}

export const StreakActivity: React.FC<StreakActivityProps> = ({
  currentStreak = 8,
  longestStreak = 24,
  todayMinutes = 45,
  weeklyTargetDays = 5,
  restDay = 'Sunday',
  onUpdateRestDay,
}) => {
  const [freezeTokens, setFreezeTokens] = useState(2);

  // Modern 7-day weekly schedule tracker (Mon to Sun)
  const daysOfWeek = [
    { label: 'Mon', dayNum: 29, completed: true, minutes: 45 },
    { label: 'Tue', dayNum: 30, completed: true, minutes: 60 },
    { label: 'Wed', dayNum: 1, completed: true, minutes: 35 },
    { label: 'Thu', dayNum: 2, completed: true, minutes: 50 },
    { label: 'Fri', dayNum: 3, completed: true, minutes: 40 },
    { label: 'Sat', dayNum: 4, completed: true, minutes: 30 },
    { label: 'Sun', dayNum: 5, completed: true, minutes: todayMinutes, isToday: true },
  ];

  const activeDaysThisWeek = daysOfWeek.filter((d) => d.completed).length;
  const weeklyProgressPct = Math.min(100, Math.round((activeDaysThisWeek / weeklyTargetDays) * 100));

  const milestones = [
    { target: 3, label: '3-Day Starter', achieved: currentStreak >= 3 },
    { target: 7, label: '7-Day Habit Builder', achieved: currentStreak >= 7 },
    { target: 14, label: '14-Day Consistency Pro', achieved: currentStreak >= 14, progress: Math.min(14, currentStreak) },
    { target: 30, label: '30-Day Master', achieved: currentStreak >= 30, progress: Math.min(30, currentStreak) },
  ];

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      {/* Header with Flame Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C8CECB] pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#9A6A1F]/15 border border-[#9A6A1F]/30 flex items-center justify-center text-[#9A6A1F]">
            <IconFlame size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
                Daily Streak Activity
              </h3>
              <span className="text-[10px] bg-[#9A6A1F] text-white px-2 py-0.2 rounded font-semibold flex items-center gap-1">
                <IconFlame size={11} /> {currentStreak} Days
              </span>
            </div>
            <p className="text-[11px] text-[#5D676C] mt-0.5">
              Consistent daily practice fuels long-term mastery. Keep the momentum going!
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded px-3 py-1 text-center tabular-nums">
            <span className="text-[10px] text-[#5D676C] uppercase font-semibold block">
              Best Streak
            </span>
            <span className="font-mono font-bold text-[#253238]">
              {longestStreak} Days
            </span>
          </div>

          <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded px-3 py-1 text-center tabular-nums">
            <span className="text-[10px] text-[#5D676C] uppercase font-semibold block">
              Goal Progress
            </span>
            <span className="font-mono font-bold text-[#3E6A50]">
              {activeDaysThisWeek}/{weeklyTargetDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* Modern 7-Day Week Card (ChaiCode / EdTech inspired) */}
      <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#253238] flex items-center gap-1.5">
            <IconCalendar size={14} className="text-[#2E5B66]" />
            This Week's Activity
          </span>
          <span className="text-[11px] text-[#5D676C]">
            Weekly Goal: {weeklyTargetDays} days/week ({weeklyProgressPct}% complete)
          </span>
        </div>

        {/* Day bubbles */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {daysOfWeek.map((day, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border transition-all ${
                day.isToday
                  ? 'bg-[#2E5B66]/10 border-[#2E5B66] ring-1 ring-[#2E5B66]/40'
                  : day.completed
                  ? 'bg-white border-[#C8CECB]'
                  : 'bg-[#E7E9E6]/60 border-dashed border-[#C8CECB] opacity-60'
              }`}
            >
              <div className="text-[10px] uppercase font-semibold text-[#5D676C]">
                {day.label}
              </div>
              <div className="my-1.5 flex items-center justify-center">
                {day.completed ? (
                  <div className="w-6 h-6 rounded-full bg-[#3E6A50] text-white flex items-center justify-center shadow-none">
                    <IconCheck size={13} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-[#C8CECB] bg-[#E7E9E6] flex items-center justify-center text-[10px] text-[#5D676C] font-mono">
                    {day.dayNum}
                  </div>
                )}
              </div>
              <div className="text-[9px] font-mono text-[#5D676C] tabular-nums truncate">
                {day.completed ? `${day.minutes}m` : 'Rest'}
              </div>
            </div>
          ))}
        </div>

        {/* Goal progress bar */}
        <div className="w-full bg-[#DDE1DE] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#3E6A50] h-full transition-all duration-300"
            style={{ width: `${weeklyProgressPct}%` }}
          />
        </div>
      </div>

      {/* Streak Milestones Progression Strip */}
      <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#253238] flex items-center gap-1.5">
            <IconAward size={14} className="text-[#9A6A1F]" />
            Streak Milestones
          </span>
          <span className="text-[11px] text-[#5D676C]">
            Next badge in {Math.max(0, 14 - currentStreak)} days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded border text-xs flex flex-col justify-between ${
                m.achieved
                  ? 'bg-white border-[#C8CECB]'
                  : 'bg-[#E7E9E6]/70 border-dashed border-[#C8CECB]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-[11px] text-[#253238]">
                  {m.target} Days
                </span>
                {m.achieved ? (
                  <span className="text-[10px] font-semibold text-[#3E6A50] bg-[#EAF3ED] px-1 rounded">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] text-[#5D676C] font-mono">
                    {m.progress}/{m.target}
                  </span>
                )}
              </div>
              <span className={`text-[11px] ${m.achieved ? 'text-[#253238] font-medium' : 'text-[#5D676C]'}`}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rest Day & Freeze Shield */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-2 text-[#5D676C]">
          <span className="w-2 h-2 rounded-full bg-[#3E6A50]" />
          <span>Configured Rest Day: <strong className="text-[#253238]">{restDay}</strong></span>
          <span className="text-[11px] text-[#5D676C]">(Planned recovery never resets streak)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#F2F3F1] border border-[#C8CECB] px-2 py-0.5 rounded text-[#253238] font-mono">
            {freezeTokens} Streak Freezes Left
          </span>
          <select
            value={restDay}
            onChange={(e) => onUpdateRestDay && onUpdateRestDay(e.target.value)}
            className="bg-white border border-[#C8CECB] rounded px-2 py-0.5 text-xs text-[#253238]"
          >
            <option value="Sunday">Sunday</option>
            <option value="Saturday">Saturday</option>
            <option value="Friday">Friday</option>
          </select>
        </div>
      </div>
    </div>
  );
};
