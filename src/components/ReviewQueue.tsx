import React from 'react';
import { ReviewCard } from '../types';
import { IconCheck, IconRotateCcw, IconTag, IconAlertCircle } from './icons';
import { markReviewCardComplete } from '../services/reviewService';

interface ReviewQueueProps {
  cards: ReviewCard[];
  onCardReviewed?: () => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({ cards, onCardReviewed }) => {
  const causeLabels: Record<string, string> = {
    concept_gap: 'Concept Gap',
    careless_slip: 'Careless Slip',
    misread: 'Misread Question',
    time_pressure: 'Time Pressure',
    guess: 'Guessed',
  };

  const handleComplete = async (cardId: string) => {
    await markReviewCardComplete(cardId);
    if (onCardReviewed) onCardReviewed();
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2">
        <div className="flex items-center gap-2">
          <IconRotateCcw size={16} className="text-[#2E5B66]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
            Spaced Repetition Review Queue
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#DDE1DE] text-[#253238] tabular-nums">
          {cards.length} Due
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#5D676C] space-y-1">
          <p className="font-medium text-[#253238]">Your review queue is clear!</p>
          <p>When you encounter tricky practice problems, tag them to schedule smart spaced reviews across all your devices.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-3 text-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-[#253238]">
                  {card.questionTitle}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FDF6E8] text-[#9A6A1F] border border-[#ECD9AE] shrink-0">
                  {causeLabels[card.causeTag] || card.causeTag}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5D676C] pt-1">
                <span>Skill: {card.skillSlug}</span>
                <button
                  onClick={() => handleComplete(card.id)}
                  className="px-2.5 py-1 bg-[#3E6A50] hover:bg-[#325641] text-white font-medium rounded flex items-center gap-1 cursor-pointer"
                >
                  <IconCheck size={12} /> Mark Reviewed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
