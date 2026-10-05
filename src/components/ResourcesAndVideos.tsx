import React, { useState } from 'react';
import { IconVideo, IconExternalLink, IconPlus, IconClock, IconCheck, IconBookmark } from './icons';

interface VideoResource {
  id: string;
  title: string;
  creator: string;
  youtubeId: string;
  durationMinutes: number;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  tags: string[];
}

const CURATED_VIDEOS: VideoResource[] = [
  {
    id: 'vid-1',
    title: 'Full PostgreSQL Portfolio Project: Data Cleaning & Cohorts',
    creator: 'Alex The Analyst',
    youtubeId: 'qfyynHBFOsM',
    durationMinutes: 48,
    skill: 'SQL Joins & Grouping',
    difficulty: 'Intermediate',
    description: 'Walk through end-to-end data exploration, cleaning messy nulls, removing duplicates, and structuring aggregate queries.',
    tags: ['SQL', 'Portfolio', 'PostgreSQL'],
  },
  {
    id: 'vid-2',
    title: 'StatQuest: Hypothesis Testing, p-values and Type I/II Errors',
    creator: 'Josh Starmer (StatQuest)',
    youtubeId: '0oc49DyA3hU',
    durationMinutes: 18,
    skill: 'A/B Testing & Significance',
    difficulty: 'Beginner',
    description: 'Intuitive, visual step-by-step breakdown of statistical hypothesis testing without confusing jargon.',
    tags: ['Statistics', 'A/B Testing', 'Math'],
  },
  {
    id: 'vid-3',
    title: 'Power BI Full Course: Star Schemas, DAX and Executive Dashboards',
    creator: 'Luke Barousse',
    youtubeId: 'TmhQCQr_WCA',
    durationMinutes: 62,
    skill: 'Executive Storytelling',
    difficulty: 'Intermediate',
    description: 'Data modeling fundamentals, establishing star schema relationships, and calculating DAX measures.',
    tags: ['Power BI', 'DAX', 'Dashboards'],
  },
  {
    id: 'vid-4',
    title: 'PostgreSQL in 100 Seconds: ACID, Indexes, and Query Plans',
    creator: 'Fireship',
    youtubeId: 'n2Fluyr3lbc',
    durationMinutes: 4,
    skill: 'Database Indexing & ACID',
    difficulty: 'Beginner',
    description: 'Lightning-fast overview of relational database design, transactions, B-tree indexes, and extensions.',
    tags: ['PostgreSQL', 'Architecture', 'Databases'],
  },
];

export const ResourcesAndVideos: React.FC<{
  onAddTask?: (title: string, duration: number) => void;
}> = ({ onAddTask }) => {
  const [activeVideo, setActiveVideo] = useState<VideoResource | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAdd = (vid: VideoResource) => {
    if (onAddTask) {
      onAddTask(`Watch & Practice: ${vid.title}`, vid.durationMinutes);
    }
    setAddedIds((prev) => ({ ...prev, [vid.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [vid.id]: false }));
    }, 2500);
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#C8CECB] pb-3">
        <div className="flex items-center gap-2">
          <IconVideo size={18} className="text-[#2E5B66]" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
              Free Curated Resources & Video Lectures
            </h3>
            <span className="text-[10px] text-[#5D676C]">
              High-yield YouTube courses • Official docs • One-click sync to tasks
            </span>
          </div>
        </div>

        <span className="text-xs text-[#5D676C] font-mono tabular-nums">
          {CURATED_VIDEOS.length} Selected
        </span>
      </div>

      {/* Video Modal if active */}
      {activeVideo && (
        <div className="bg-[#253238] rounded-md p-3 space-y-2 text-[#F2F3F1]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold truncate">
              Playing: {activeVideo.title}
            </span>
            <button
              onClick={() => setActiveVideo(null)}
              className="text-xs text-[#DDE1DE] hover:text-white px-2 py-0.5 rounded bg-white/10"
            >
              Close Player
            </button>
          </div>
          <div className="aspect-video w-full rounded overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CURATED_VIDEOS.map((vid) => {
          const isAdded = addedIds[vid.id];
          return (
            <div
              key={vid.id}
              className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-3.5 space-y-2 flex flex-col justify-between hover:border-[#2E5B66]/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#DDE1DE] text-[#2E5B66]">
                    {vid.difficulty}
                  </span>
                  <span className="text-xs text-[#5D676C] flex items-center gap-1 font-mono tabular-nums">
                    <IconClock size={12} /> {vid.durationMinutes} min
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-[#253238] mt-2 line-clamp-2">
                  {vid.title}
                </h4>

                <p className="text-[11px] text-[#5D676C] mt-1 line-clamp-2">
                  {vid.description}
                </p>

                <div className="text-[11px] text-[#253238] font-medium mt-2">
                  By {vid.creator}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-[#C8CECB]/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveVideo(vid)}
                  className="px-2.5 py-1 text-xs bg-[#2E5B66] hover:bg-[#244851] text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                >
                  <IconVideo size={13} /> Watch Here
                </button>

                <button
                  onClick={() => handleAdd(vid)}
                  className={`px-2.5 py-1 text-xs rounded border flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-[#3E6A50] text-white border-[#3E6A50]'
                      : 'bg-white border-[#C8CECB] text-[#253238] hover:bg-[#DDE1DE]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <IconCheck size={12} /> Added to Tasks!
                    </>
                  ) : (
                    <>
                      <IconPlus size={12} /> + Add to Tasks
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
