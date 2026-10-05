import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX, IconLayers, IconCode, IconClock, IconSync, IconCheck } from './icons';
import { LEARNING_TRACKS, SAMPLE_PRACTICE_QUESTIONS } from '../data/seedData';
import { Task } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTrack: (trackSlug: string) => void;
  onNavigateTab: (tab: string) => void;
  onSelectTask: (task: Task) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTrack,
  onNavigateTab,
  onSelectTask,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open palette
          const event = new CustomEvent('open-command-palette');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(cleanQuery) ||
      t.category.toLowerCase().includes(cleanQuery)
  );

  const filteredTracks = LEARNING_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(cleanQuery) ||
      t.domains.some((d) => d.toLowerCase().includes(cleanQuery))
  );

  const filteredQuestions = SAMPLE_PRACTICE_QUESTIONS.filter(
    (q) =>
      q.title.toLowerCase().includes(cleanQuery) ||
      q.skillSlug.toLowerCase().includes(cleanQuery)
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#253238]/40 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md w-full max-w-xl shadow-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#C8CECB] bg-[#F2F3F1]">
          <IconSearch size={18} className="text-[#5D676C] shrink-0 mr-2.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, task, track, or practice question..."
            className="w-full bg-transparent text-sm text-[#253238] focus:outline-none placeholder-[#5D676C]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#DDE1DE] text-[#5D676C] cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-3 text-xs">
          {/* Quick Navigation Commands */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5D676C] px-2 py-1">
              Quick Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onNavigateTab('tasks');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-[#DDE1DE] text-[#253238] text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <IconCheck size={14} className="text-[#2E5B66]" />
                  <span>Go to Synced Tasks & Priority Execution</span>
                </div>
                <span className="text-[10px] text-[#5D676C] font-mono">Tab: Tasks</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('practice');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-[#DDE1DE] text-[#253238] text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <IconCode size={14} className="text-[#2E5B66]" />
                  <span>Open Interactive SQL & Practice Lab</span>
                </div>
                <span className="text-[10px] text-[#5D676C] font-mono">Tab: Practice</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('devices');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-[#DDE1DE] text-[#253238] text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <IconSync size={14} className="text-[#2E5B66]" />
                  <span>View Multi-Device Presence & Cloud Sync</span>
                </div>
                <span className="text-[10px] text-[#5D676C] font-mono">Tab: Sync</span>
              </button>
            </div>
          </div>

          {/* Synced Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5D676C] px-2 py-1">
                Matching Tasks ({filteredTasks.length})
              </div>
              <div className="space-y-1">
                {filteredTasks.slice(0, 4).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      onSelectTask(task);
                      onNavigateTab('tasks');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-[#DDE1DE] text-[#253238] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          task.status === 'completed' ? 'bg-[#3E6A50]' : 'bg-[#9A6A1F]'
                        }`}
                      />
                      <span className="truncate font-medium">{task.title}</span>
                    </div>
                    <span className="text-[10px] text-[#5D676C] uppercase shrink-0">
                      {task.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Learning Tracks */}
          {filteredTracks.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5D676C] px-2 py-1">
                Career Tracks ({filteredTracks.length})
              </div>
              <div className="space-y-1">
                {filteredTracks.map((track) => (
                  <button
                    key={track.slug}
                    onClick={() => {
                      onSelectTrack(track.slug);
                      onNavigateTab('roadmaps');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-[#DDE1DE] text-[#253238] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <IconLayers size={14} className="text-[#2E5B66]" />
                      <span className="font-medium">{track.title}</span>
                    </div>
                    <span className="text-[10px] text-[#5D676C]">
                      {track.hoursMin}-{track.hoursMax} hrs
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Practice Problems */}
          {filteredQuestions.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5D676C] px-2 py-1">
                Practice Questions ({filteredQuestions.length})
              </div>
              <div className="space-y-1">
                {filteredQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      onNavigateTab('practice');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-[#DDE1DE] text-[#253238] text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <IconCode size={14} className="text-[#2E5B66] shrink-0" />
                      <span className="truncate">{q.title}</span>
                    </div>
                    <span className="text-[10px] text-[#5D676C] shrink-0">
                      Diff {q.difficulty}/5
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#C8CECB] bg-[#F2F3F1] flex items-center justify-between text-[11px] text-[#5D676C]">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
