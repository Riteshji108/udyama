import React, { useState } from 'react';
import { TaskCategory, TaskPriority } from '../types';
import { IconPlus, IconX } from './icons';
import { LEARNING_TRACKS } from '../data/seedData';

interface TaskFormProps {
  onAddTask: (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    category: TaskCategory;
    trackSlug?: string;
    estimatedMinutes?: number;
    dueDate?: string;
  }) => Promise<void>;
  onClose?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('roadmap_study');
  const [trackSlug, setTrackSlug] = useState<string>('data-analyst');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        trackSlug: trackSlug || undefined,
        estimatedMinutes: Number(estimatedMinutes) || undefined,
        dueDate: dueDate || undefined,
      });
      setTitle('');
      setDescription('');
      if (onClose) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4">
      <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2 mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#253238]">
          Create Synchronized Task
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[#DDE1DE] text-[#5D676C]"
          >
            <IconX size={16} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#5D676C] mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Window Functions in SQL or Solve Practice Lab 3"
            className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-3 py-1.5 text-sm text-[#253238] focus:outline-none focus:border-[#2E5B66]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5D676C] mb-1">
            Description or Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specific focus goals, query objectives, or documentation links"
            className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-3 py-1.5 text-xs text-[#253238] focus:outline-none focus:border-[#2E5B66]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-2 py-1.5 text-xs text-[#253238] focus:outline-none focus:border-[#2E5B66]"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-2 py-1.5 text-xs text-[#253238] focus:outline-none focus:border-[#2E5B66]"
            >
              <option value="roadmap_study">Roadmap Study</option>
              <option value="coding_practice">Coding & SQL</option>
              <option value="mock_test">Mock Test</option>
              <option value="revision">Spaced Review</option>
              <option value="interview_prep">Interview Prep</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Target Track
            </label>
            <select
              value={trackSlug}
              onChange={(e) => setTrackSlug(e.target.value)}
              className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-2 py-1.5 text-xs text-[#253238] focus:outline-none focus:border-[#2E5B66]"
            >
              <option value="">None / Custom</option>
              {LEARNING_TRACKS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5D676C] mb-1">
              Est. Minutes
            </label>
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-2 py-1.5 text-xs text-[#253238] focus:outline-none focus:border-[#2E5B66] tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#5D676C] mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-[#F2F3F1] border border-[#C8CECB] rounded px-3 py-1.5 text-xs text-[#253238] focus:outline-none focus:border-[#2E5B66]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#C8CECB]">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs border border-[#C8CECB] rounded text-[#5D676C] hover:bg-[#DDE1DE]"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-medium rounded flex items-center gap-1.5 disabled:opacity-50"
          >
            <IconPlus size={14} />
            {isSubmitting ? 'Syncing...' : 'Save & Sync to Devices'}
          </button>
        </div>
      </div>
    </form>
  );
};
