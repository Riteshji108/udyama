import React, { useState } from 'react';
import { LEARNING_TRACKS } from '../data/seedData';
import { LearningTrack } from '../types';
import { IconLayers, IconCheck, IconPlus, IconClock, IconAward } from './icons';

interface RoadmapViewProps {
  currentTrackSlug: string;
  onSelectTrack: (slug: string) => void;
  onAddTaskFromRoadmap: (title: string, trackSlug: string, minutes: number) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  currentTrackSlug,
  onSelectTrack,
  onAddTaskFromRoadmap,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<LearningTrack>(
    LEARNING_TRACKS.find((t) => t.slug === currentTrackSlug) || LEARNING_TRACKS[0]
  );
  const [addedSkills, setAddedSkills] = useState<Record<string, boolean>>({});

  const handleTrackChange = (slug: string) => {
    const found = LEARNING_TRACKS.find((t) => t.slug === slug);
    if (found) {
      setSelectedTrack(found);
      onSelectTrack(slug);
    }
  };

  const handleAddSkillAsTask = (skillName: string, slug: string) => {
    onAddTaskFromRoadmap(`Study & Master ${skillName}`, selectedTrack.slug, 35);
    setAddedSkills((prev) => ({ ...prev, [slug]: true }));
    setTimeout(() => {
      setAddedSkills((prev) => ({ ...prev, [slug]: false }));
    }, 2500);
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      {/* Header and Track Selector */}
      <div className="border-b border-[#C8CECB] pb-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <IconLayers size={18} className="text-[#2E5B66]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
              Structured Career Roadmaps & Skill Graphs
            </h3>
          </div>
          <span className="text-xs text-[#5D676C]">
            Universal syllabus • Modular milestones • Cross-device task dispatch
          </span>
        </div>

        {/* Track Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {LEARNING_TRACKS.map((t) => (
            <button
              key={t.slug}
              onClick={() => handleTrackChange(t.slug)}
              className={`p-2 rounded text-left border transition-all cursor-pointer ${
                selectedTrack.slug === t.slug
                  ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                  : 'bg-[#F2F3F1] border-[#C8CECB] text-[#253238] hover:bg-[#DDE1DE]'
              }`}
            >
              <div className="text-xs font-semibold truncate">{t.title}</div>
              <div className={`text-[10px] truncate ${selectedTrack.slug === t.slug ? 'text-white/80' : 'text-[#5D676C]'}`}>
                {t.hoursMin}-{t.hoursMax} hrs • {t.difficultyLevel}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Track Overview Card */}
      <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-3 space-y-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-semibold text-[#253238] font-display">
              {selectedTrack.title}
            </h4>
            <p className="text-xs text-[#5D676C] mt-0.5">
              {selectedTrack.tagline}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5D676C] tabular-nums">
            <span className="flex items-center gap-1">
              <IconClock size={12} /> {selectedTrack.recommendedWeeklyHours}h / week
            </span>
            <span className="flex items-center gap-1">
              <IconAward size={12} /> {selectedTrack.modulesCount} modules
            </span>
          </div>
        </div>

        <p className="text-xs text-[#253238] leading-relaxed pt-1">
          {selectedTrack.description}
        </p>
      </div>

      {/* Core Competencies and Skills List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#5D676C] uppercase tracking-wider">
            Milestone Skills & Practice Modules
          </span>
          <span className="text-[11px] text-[#5D676C]">
            Click "+ Sync to Tasks" to add to your daily queue
          </span>
        </div>

        <div className="space-y-2">
          {selectedTrack.skills.map((skill, index) => {
            const isAdded = addedSkills[skill.slug];
            return (
              <div
                key={skill.slug}
                className="flex items-center justify-between bg-[#F2F3F1] border border-[#C8CECB] rounded p-2.5 text-xs hover:border-[#2E5B66]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#DDE1DE] text-[#253238] font-mono text-[11px] flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-[#253238]">
                      {skill.name}
                    </span>
                    <span className="text-[10px] text-[#5D676C] ml-2 px-1.5 py-0.2 bg-[#E7E9E6] border border-[#C8CECB] rounded">
                      {skill.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddSkillAsTask(skill.name, skill.slug)}
                  className={`px-2.5 py-1 text-xs rounded border flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-[#3E6A50] text-white border-[#3E6A50]'
                      : 'bg-white border-[#C8CECB] text-[#2E5B66] hover:bg-[#E2ECEE]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <IconCheck size={12} /> Synced!
                    </>
                  ) : (
                    <>
                      <IconPlus size={12} /> + Sync to Tasks
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
