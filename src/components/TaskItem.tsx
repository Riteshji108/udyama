import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { IconCheck, IconTrash, IconClock, IconTag, IconPlay } from './icons';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onSelectForTimer?: (task: Task) => void;
  onUpdatePriority?: (task: Task, priority: TaskPriority) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onDelete,
  onSelectForTimer,
  onUpdatePriority,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityStyles: Record<TaskPriority, { text: string; bg: string; border: string }> = {
    urgent: { text: '#934444', bg: '#FBEBEB', border: '#E7C0C0' },
    high: { text: '#9A6A1F', bg: '#FDF6E8', border: '#ECD9AE' },
    medium: { text: '#687554', bg: '#F1F4EE', border: '#C9D4C0' },
    low: { text: '#5D676C', bg: '#E7E9E6', border: '#C8CECB' },
  };

  const isCompleted = task.status === 'completed';
  const badge = priorityStyles[task.priority] || priorityStyles.medium;

  return (
    <div
      className={`border rounded-md transition-all ${
        isCompleted
          ? 'bg-[#E7E9E6]/60 border-[#C8CECB] opacity-75'
          : 'bg-[#E7E9E6] border-[#C8CECB] hover:border-[#2E5B66]/40'
      }`}
    >
      <div className="p-3 flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleStatus(task)}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isCompleted
              ? 'bg-[#3E6A50] border-[#3E6A50] text-white'
              : 'border-[#5D676C] bg-[#F2F3F1] hover:border-[#2E5B66]'
          }`}
        >
          {isCompleted && <IconCheck size={13} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2 flex-wrap cursor-pointer">
            <span
              className={`text-sm font-medium ${
                isCompleted ? 'line-through text-[#5D676C]' : 'text-[#253238]'
              }`}
            >
              {task.title}
            </span>

            {/* Priority pill */}
            <span
              className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border"
              style={{ color: badge.text, backgroundColor: badge.bg, borderColor: badge.border }}
            >
              {task.priority}
            </span>

            {/* Category tag */}
            {task.category && (
              <span className="text-[11px] text-[#5D676C] flex items-center gap-0.5">
                <IconTag size={11} />
                {task.category.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Description preview or expanded */}
          {task.description && (
            <p className={`text-xs text-[#5D676C] mt-1 ${isExpanded ? 'whitespace-pre-line' : 'line-clamp-1'}`}>
              {task.description}
            </p>
          )}

          {/* Meta footer */}
          <div className="flex items-center gap-4 mt-2 text-xs text-[#5D676C]">
            {task.estimatedMinutes && (
              <span className="flex items-center gap-1 tabular-nums">
                <IconClock size={12} />
                {task.estimatedMinutes}m est
              </span>
            )}
            {task.dueDate && (
              <span className="text-[11px]">Due: {task.dueDate}</span>
            )}
            {task.trackSlug && (
              <span className="text-[11px] bg-[#DDE1DE] px-1.5 py-0.2 rounded text-[#253238]">
                {task.trackSlug}
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {!isCompleted && onSelectForTimer && (
            <button
              onClick={() => onSelectForTimer(task)}
              title="Focus on this task"
              className="p-1.5 rounded hover:bg-[#DDE1DE] text-[#2E5B66] cursor-pointer"
            >
              <IconPlay size={14} />
            </button>
          )}

          <button
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="p-1.5 rounded hover:bg-[#FBEBEB] text-[#5D676C] hover:text-[#934444] cursor-pointer"
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
