import React, { useState, useEffect, useRef } from 'react';
import { IconPlay, IconPause, IconRotateCcw, IconClock, IconCheck } from './icons';
import { logStudySession } from '../services/deviceService';
import { Task } from '../types';

interface FocusTimerProps {
  userId?: string;
  activeTask?: Task | null;
  onSessionLogged?: (durationSec: number, category: string) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  userId,
  activeTask,
  onSessionLogged,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [initialSeconds, setInitialSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('Roadmap Study');
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsLeft]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleReset = (mins = 25) => {
    setIsRunning(false);
    setInitialSeconds(mins * 60);
    setSecondsLeft(mins * 60);
  };

  const handleComplete = async () => {
    setIsRunning(false);
    const elapsed = initialSeconds - secondsLeft;
    const durationToLog = elapsed > 0 ? elapsed : initialSeconds;

    if (userId && durationToLog > 10) {
      await logStudySession(userId, durationToLog, category, activeTask?.title);
    }

    if (onSessionLogged) {
      onSessionLogged(durationToLog, category);
    }

    setLoggedNotification(`Logged ${Math.round(durationToLog / 60)} min of ${category}!`);
    setTimeout(() => setLoggedNotification(null), 4000);
    setSecondsLeft(initialSeconds);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, ((initialSeconds - secondsLeft) / initialSeconds) * 100));

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#C8CECB] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <IconClock size={16} className="text-[#2E5B66]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5D676C]">
            Focus Session
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleReset(25)}
            className={`px-2 py-0.5 text-xs rounded border ${
              initialSeconds === 25 * 60 && !isRunning
                ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                : 'border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
            }`}
          >
            25m
          </button>
          <button
            onClick={() => handleReset(50)}
            className={`px-2 py-0.5 text-xs rounded border ${
              initialSeconds === 50 * 60 && !isRunning
                ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                : 'border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
            }`}
          >
            50m
          </button>
        </div>
      </div>

      <div className="text-center my-2">
        <div className="text-4xl font-mono font-bold tracking-tight text-[#253238] tabular-nums">
          {formattedTime}
        </div>
        <div className="w-full bg-[#DDE1DE] h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-[#2E5B66] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {activeTask && (
        <div className="text-xs text-[#5D676C] bg-[#F2F3F1] border border-[#C8CECB] rounded p-2 my-2 truncate">
          <span className="font-semibold text-[#253238]">Active Task: </span>
          {activeTask.title}
        </div>
      )}

      {loggedNotification && (
        <div className="text-xs bg-[#3E6A50] text-white rounded p-1.5 my-2 text-center flex items-center justify-center gap-1">
          <IconCheck size={14} />
          {loggedNotification}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-xs bg-[#F2F3F1] border border-[#C8CECB] rounded px-2 py-1 text-[#253238] flex-1 focus:outline-none focus:border-[#2E5B66]"
        >
          <option value="Roadmap Study">Roadmap Study</option>
          <option value="SQL Lab">SQL Lab</option>
          <option value="Coding Practice">Coding Practice</option>
          <option value="Review Queue">Spaced Review</option>
          <option value="Mock Test">Mock Test</option>
        </select>

        {isRunning ? (
          <button
            onClick={handlePause}
            className="px-3 py-1 bg-[#9A6A1F] hover:bg-[#855B1B] text-white text-xs font-medium rounded flex items-center gap-1"
          >
            <IconPause size={14} /> Pause
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="px-3 py-1 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-medium rounded flex items-center gap-1"
          >
            <IconPlay size={14} /> Start
          </button>
        )}

        <button
          onClick={() => handleReset(initialSeconds / 60)}
          title="Reset Timer"
          className="p-1 border border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE] rounded"
        >
          <IconRotateCcw size={14} />
        </button>

        {initialSeconds - secondsLeft >= 60 && (
          <button
            onClick={handleComplete}
            title="Log Active Time"
            className="px-2 py-1 bg-[#3E6A50] hover:bg-[#325641] text-white text-xs rounded"
          >
            Log
          </button>
        )}
      </div>
    </div>
  );
};
